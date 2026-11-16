#include "ib_asr_realtime.h"
#include "ib_doubao_asr.h"
#include "esp_crt_bundle.h"
#include "esp_heap_caps.h"
#include "esp_log.h"
#include "esp_random.h"
#include "esp_timer.h"
#include "esp_transport.h"
#include "esp_transport_ssl.h"
#include "esp_transport_ws.h"
#include "esp_websocket_client.h"
#include "esp_tls_errors.h"
#include <errno.h>
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "lwip/sockets.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// 生命周期只由assistant worker管理；按键只shutdown登记fd，不跨任务销毁TLS。
static SemaphoreHandle_t s_socket_lock;
static int s_socket=-1;
static portMUX_TYPE s_stats_lock=portMUX_INITIALIZER_UNLOCKED;
static ib_asr_stats_t s_stats;
static ib_asr_diagnostics_t s_diagnostics;
// IDF transport_ws在升级写失败时会以ERROR打印整请求头，包含Key；禁此tag并由机器码/数值指标诊断。
void ib_asr_realtime_init(void){esp_log_level_set("transport_ws",ESP_LOG_NONE);if(!s_socket_lock)s_socket_lock=xSemaphoreCreateMutex();}
void ib_asr_realtime_cancel(void){if(!s_socket_lock)return;xSemaphoreTake(s_socket_lock,portMAX_DELAY);if(s_socket>=0)shutdown(s_socket,SHUT_RDWR);xSemaphoreGive(s_socket_lock);}
void ib_asr_realtime_stats(ib_asr_stats_t *out){portENTER_CRITICAL(&s_stats_lock);*out=s_stats;portEXIT_CRITICAL(&s_stats_lock);}
void ib_asr_realtime_diagnostics(ib_asr_diagnostics_t *out){portENTER_CRITICAL(&s_stats_lock);*out=s_diagnostics;portEXIT_CRITICAL(&s_stats_lock);}
static void socket_set(int fd){xSemaphoreTake(s_socket_lock,portMAX_DELAY);s_socket=fd;xSemaphoreGive(s_socket_lock);}

typedef struct {
    esp_transport_handle_t tls,guard,ws;
    esp_websocket_client_handle_t client;
    SemaphoreHandle_t lock;
    ib_doubao_asr_t parser;
    char *text;
    size_t capacity;
    bool server_started,finished;
    ib_asr_stats_t stats;
    ib_asr_diagnostics_t diagnostics;
    const ib_asr_source_t *source;
    const char *error;
    char task[37];
    int64_t began;
    bool connected, attempted, message_open, finishing;
    unsigned frame_offset;
} session_t;

// 官方client会自动跟随HTTP 3xx。TLS父transport只许一次connect，阻止任何重定向/跨区重试携带密钥。
// WSS/RFC6455、TLS验证仍全部由Espressif实现；这里只约束连接次数与登记取消句柄。
static session_t *session(esp_transport_handle_t t){return esp_transport_get_context_data(t);}
static void diagnostics_publish(session_t *s){portENTER_CRITICAL(&s_stats_lock);s_diagnostics=s->diagnostics;portEXIT_CRITICAL(&s_stats_lock);}
static void tls_diagnostics(session_t *s){
    esp_tls_error_handle_t error=esp_transport_get_error_handle(s->tls);
    int tls_error=error?error->last_error:0,tls_stack=error?error->esp_tls_error_code:0,tls_flags=error?error->esp_tls_flags:0;
    int socket_errno=esp_transport_get_errno(s->tls);
    portENTER_CRITICAL(&s_stats_lock);s->diagnostics.tls_error=tls_error;s->diagnostics.tls_stack=tls_stack;s->diagnostics.tls_flags=tls_flags;
    if(socket_errno>0)s->diagnostics.socket_errno=socket_errno;
    portEXIT_CRITICAL(&s_stats_lock);
}
static int guard_connect(esp_transport_handle_t t,const char *host,int port,int timeout){
    session_t *s=session(t);if(s->attempted){xSemaphoreTake(s->lock,portMAX_DELAY);s->error="asr_redirect_rejected";xSemaphoreGive(s->lock);return -1;}s->attempted=true;
    portENTER_CRITICAL(&s_stats_lock);s->diagnostics.connect_port=port;s->diagnostics.io_stage=1;portEXIT_CRITICAL(&s_stats_lock);errno=0;
    int result=esp_transport_connect(s->tls,host,port,timeout),saved_errno=errno;
    portENTER_CRITICAL(&s_stats_lock);s->diagnostics.connect_result=result;s->diagnostics.connect_errno=saved_errno;portEXIT_CRITICAL(&s_stats_lock);
    tls_diagnostics(s);diagnostics_publish(s);
    if(result==0)socket_set(esp_transport_get_socket(s->tls));
    return result;
}
static int guard_read(esp_transport_handle_t t,char *p,int n,int ms){
    session_t *s=session(t);errno=0;int result=esp_transport_read(s->tls,p,n,ms);
    int saved_errno=errno;portENTER_CRITICAL(&s_stats_lock);s->diagnostics.io_stage=s->connected?5:3;s->diagnostics.io_result=result;s->diagnostics.io_errno=saved_errno;portEXIT_CRITICAL(&s_stats_lock);
    if(result<0)tls_diagnostics(s);
    diagnostics_publish(s);return result;
}
static int guard_write(esp_transport_handle_t t,const char *p,int n,int ms){
    session_t *s=session(t);errno=0;int result=esp_transport_write(s->tls,p,n,ms);
    int saved_errno=errno;portENTER_CRITICAL(&s_stats_lock);s->diagnostics.io_stage=s->connected?6:2;s->diagnostics.io_result=result;s->diagnostics.io_errno=saved_errno;portEXIT_CRITICAL(&s_stats_lock);
    if(result<0)tls_diagnostics(s);
    diagnostics_publish(s);return result;
}
static int guard_poll_read(esp_transport_handle_t t,int ms){return esp_transport_poll_read(session(t)->tls,ms);}
static int guard_poll_write(esp_transport_handle_t t,int ms){return esp_transport_poll_write(session(t)->tls,ms);}
static int guard_close(esp_transport_handle_t t){socket_set(-1);return esp_transport_close(session(t)->tls);}
static int guard_destroy(esp_transport_handle_t t){(void)t;return 0;}
static esp_transport_handle_t guard_parent(esp_transport_handle_t t){return session(t)->tls;}
static void measure(session_t *s){
    uint32_t free=heap_caps_get_free_size(MALLOC_CAP_8BIT),large=heap_caps_get_largest_free_block(MALLOC_CAP_8BIT);
    if(!s->stats.heap_min||free<s->stats.heap_min)s->stats.heap_min=free;
    if(!s->stats.largest_min||large<s->stats.largest_min)s->stats.largest_min=large;
    portENTER_CRITICAL(&s_stats_lock);s_stats=s->stats;portEXIT_CRITICAL(&s_stats_lock);
}
static void on_event(void *context,esp_event_base_t base,int32_t event,void *data){
    (void)base;session_t *s=context;esp_websocket_event_data_t *e=data;
    xSemaphoreTake(s->lock,portMAX_DELAY);measure(s);
    s->stats.ws_stack_min_bytes=uxTaskGetStackHighWaterMark(NULL);
    if(event==WEBSOCKET_EVENT_CONNECTED){s->connected=true;int http=esp_transport_ws_get_upgrade_request_status(s->ws);portENTER_CRITICAL(&s_stats_lock);s->diagnostics.io_stage=4;s->diagnostics.http_code=http;portEXIT_CRITICAL(&s_stats_lock);diagnostics_publish(s);s->stats.connect_ms=(esp_timer_get_time()-s->began)/1000;}
    else if(event==WEBSOCKET_EVENT_ERROR){
        portENTER_CRITICAL(&s_stats_lock);if(e){s->diagnostics.error_type=e->error_handle.error_type;s->diagnostics.ws_error=e->error_handle.esp_tls_last_esp_err;s->diagnostics.ws_stack=e->error_handle.esp_tls_stack_err;s->diagnostics.ws_flags=e->error_handle.esp_tls_cert_verify_flags;s->diagnostics.socket_errno=e->error_handle.esp_transport_sock_errno;}
        s->diagnostics.http_code=esp_transport_ws_get_upgrade_request_status(s->ws);portEXIT_CRITICAL(&s_stats_lock);tls_diagnostics(s);diagnostics_publish(s);
        ib_asr_diagnostics_t d;ib_asr_realtime_diagnostics(&d);
        ESP_LOGW("ib_asr","type=%d http=%d port=%d conn=%d errno=%d tls=%d stack=%d flags=%d sock=%d stage=%d io=%d io_errno=%d",
            d.error_type,d.http_code,d.connect_port,d.connect_result,d.connect_errno,d.tls_error,d.tls_stack,d.tls_flags,d.socket_errno,d.io_stage,d.io_result,d.io_errno);
        if(!s->error){int code=d.http_code;if(code<=0&&e)code=e->error_handle.esp_ws_handshake_status_code;
            s->error=code==401||code==403?"authentication_failed":code==429?"rate_limited":code>=500?"provider_unavailable":"asr_connection_failed";}
    }else if(event==WEBSOCKET_EVENT_DISCONNECTED||event==WEBSOCKET_EVENT_CLOSED){s->connected=false;if(!s->finished&&!s->error)s->error="asr_disconnected";}
    else if(event==WEBSOCKET_EVENT_DATA&&e&&!s->error){
        if(e->op_code==WS_TRANSPORT_OPCODES_BINARY||e->op_code==WS_TRANSPORT_OPCODES_CONT){
            if(e->payload_offset==0){
                s->frame_offset=0;
                if(e->op_code==WS_TRANSPORT_OPCODES_BINARY){if(s->message_open)s->error="asr_invalid_frame";else{ib_doubao_asr_init(&s->parser);s->message_open=true;}}
                else if(!s->message_open)s->error="asr_invalid_frame";
            }
            if(!s->error&&(e->payload_offset!=(int)s->frame_offset||!s->message_open))s->error="asr_invalid_frame";
            if(!s->error&&!ib_doubao_asr_feed(&s->parser,e->data_ptr,e->data_len))s->error=s->parser.error;
            s->frame_offset+=e->data_len;
            if(!s->error&&e->fin&&e->payload_offset+e->data_len==e->payload_len){
                s->message_open=false;s->error=ib_doubao_asr_finish(&s->parser);
                if(!s->error){
                    s->stats.messages++;s->server_started=s->stats.task_started=true;
                    if(s->parser.last&&!s->finishing)s->error="asr_early_finish";
                    else if(s->parser.last&&!s->parser.json.event.has_text){s->finished=s->stats.task_finished=true;s->stats.sentences++;s->error=s->text[0]?"incomplete_response":"no_speech";}
                    else if(s->parser.json.event.has_text){
                        const char *text=s->parser.json.event.text;size_t n=strlen(text);
                        if(n>=s->capacity)s->error="transcript_too_large";
                        else{
                            bool changed=strcmp(s->text,text)!=0;memcpy(s->text,text,n+1);
                            if(s->parser.last){s->finished=s->stats.task_finished=true;s->stats.sentences++;}
                            else{s->stats.partials++;if(n&&!s->stats.first_partial_ms)s->stats.first_partial_ms=(esp_timer_get_time()-s->began)/1000;}
                            if((changed||s->finished)&&s->source->transcript)s->source->transcript(s->text,s->finished);
                        }
                    }
                }
            }
        }else if(e->op_code==WS_TRANSPORT_OPCODES_TEXT)s->error="asr_invalid_frame";
    }
    bool failed=s->error!=NULL;xSemaphoreGive(s->lock);
    if(failed)ib_asr_realtime_cancel();
}
static bool ready(session_t *s,const char **error){xSemaphoreTake(s->lock,portMAX_DELAY);measure(s);bool value=s->connected;*error=s->error;xSemaphoreGive(s->lock);return value;}
static const char *run_task(session_t *s){
    // 请求与PCM均显式compression0，官方规定服务端使用相同压缩；避免C3再分配gzip字典。
    static const char body[]="{\"user\":{\"uid\":\"vibekey\"},\"audio\":{\"format\":\"pcm\",\"codec\":\"raw\",\"rate\":16000,\"bits\":16,\"channel\":1},\"request\":{\"model_name\":\"bigmodel\",\"enable_itn\":true,\"enable_punc\":true,\"show_utterances\":true,\"result_type\":\"full\",\"enable_nonstream\":true}}";
    uint8_t frame[sizeof(body)+8];ib_doubao_client_header(frame,true,false,sizeof(body)-1);memcpy(frame+8,body,sizeof(body)-1);
    return esp_websocket_client_send_bin(s->client,(const char *)frame,sizeof(body)+7,pdMS_TO_TICKS(1000))==(int)sizeof(body)+7?NULL:"asr_send_failed";
}
const char *ib_asr_realtime_run(const ib_assistant_profile_t *p,const esp_partition_t *part,size_t offset,const ib_asr_source_t *source,char *text,size_t cap,ib_cloud_cancel_cb cancel){
    portENTER_CRITICAL(&s_stats_lock);memset(&s_stats,0,sizeof(s_stats));memset(&s_diagnostics,0,sizeof(s_diagnostics));portEXIT_CRITICAL(&s_stats_lock);
    if(!s_socket_lock)return "out_of_memory";
    if(!ib_assistant_cloud_clock_ready(cancel))return cancel()?"cancelled":"clock_sync_failed";
    session_t *s=calloc(1,sizeof(*s));if(!s)return "out_of_memory";
    s->source=source;s->began=esp_timer_get_time();s->text=text;s->capacity=cap;text[0]=0;
    uint32_t random[4];esp_fill_random(random,sizeof(random));random[1]=(random[1]&0xFFFF0FFF)|0x4000;random[2]=(random[2]&0x3FFFFFFF)|0x80000000;
    snprintf(s->task,sizeof(s->task),"%08lx-%04lx-%04lx-%04lx-%04lx%08lx",(unsigned long)random[0],(unsigned long)(random[1]>>16),(unsigned long)(random[1]&65535),(unsigned long)(random[2]>>16),(unsigned long)(random[2]&65535),(unsigned long)random[3]);
    const char *error=NULL;s->lock=xSemaphoreCreateMutex();s->tls=esp_transport_ssl_init();s->guard=esp_transport_init();
    if(!s->lock||!s->tls||!s->guard){error="out_of_memory";goto done;}
    esp_transport_ssl_crt_bundle_attach(s->tls,esp_crt_bundle_attach);
    esp_transport_set_context_data(s->guard,s);esp_transport_set_default_port(s->guard,443);
    esp_transport_set_func(s->guard,guard_connect,guard_read,guard_write,guard_close,guard_poll_read,guard_poll_write,guard_destroy);
    esp_transport_set_parent_transport_func(s->guard,guard_parent);s->ws=esp_transport_ws_init(s->guard);
    if(!s->ws){error="out_of_memory";goto done;}
    // ext_transport绕过官方create_transport；必须给WS自身设443，client不会继承TLS父层port。
    esp_transport_set_default_port(s->ws,443);
    char headers[1024];snprintf(headers,sizeof(headers),"X-Api-Key: %s\r\nX-Api-Resource-Id: %s\r\nX-Api-Request-Id: %s\r\nX-Api-Connect-Id: %s\r\nX-Api-Sequence: -1\r\n",p->asr_key,p->asr_resource_id,s->task,s->task);
    const char *path=strchr(p->asr_ws_url+6,'/');
    esp_transport_ws_config_t ws_config={.ws_path=path?path:"/",.user_agent="FoloVibe-Key/0.5.0",.headers=headers,.propagate_control_frames=true};
    esp_err_t configured=esp_transport_ws_set_config(s->ws,&ws_config);memset(headers,0,sizeof(headers));
    if(configured!=ESP_OK){error="out_of_memory";goto done;}
    esp_websocket_client_config_t config={.uri=p->asr_ws_url,.ext_transport=s->ws,.disable_auto_reconnect=true,
        .task_name="ib_asr_wss",.task_stack=4096,.task_prio=5,.buffer_size=1024,.network_timeout_ms=3000,.ping_interval_sec=10,.pingpong_timeout_sec=10};
    s->client=esp_websocket_client_init(&config);if(!s->client){error="out_of_memory";goto done;}
    if(esp_websocket_register_events(s->client,WEBSOCKET_EVENT_ANY,on_event,s)!=ESP_OK||esp_websocket_client_start(s->client)!=ESP_OK){error="asr_start_failed";goto done;}
    int64_t deadline=s->began+INT64_C(15000000);bool transcript_phase=false;
    while(!ready(s,&error)&&!error&&!cancel()&&esp_timer_get_time()<deadline){if(!source->recording()&&!transcript_phase){transcript_phase=true;if(source->transcribing)source->transcribing();}vTaskDelay(pdMS_TO_TICKS(20));}
    if(error||cancel())goto done;
    if(!ready(s,&error)){error="asr_connect_timeout";goto done;}
    error=run_task(s);if(error)goto done;
    uint8_t pcm[6408];size_t sent=0;bool finishing=false;deadline=esp_timer_get_time()+(int64_t)(p->record_limit_seconds+30)*1000000;
    while(!cancel()&&esp_timer_get_time()<deadline){
        xSemaphoreTake(s->lock,portMAX_DELAY);error=s->error;bool finished=s->finished;measure(s);xSemaphoreGive(s->lock);
        if(error||finished)break;
        if(source->record_error()){error="recording_overflow";break;}
        size_t available=source->available();bool recording=source->recording();
        // 先读取recording再重新读取tail，不能把写者最后一块误认为已经上传完成。
        if(!recording){available=source->available();if(!transcript_phase){transcript_phase=true;if(source->transcribing)source->transcribing();}}
        if(available<sent||available>30u*32000u){error="recording_overflow";break;}
        size_t n=available-sent;
        if(n>=6400||(!recording&&n)){
            if(n>6400)n=6400;
            if(esp_partition_read(part,offset+sent,pcm+8,n)!=ESP_OK){error="flash_read_failed";break;}
            ib_doubao_client_header(pcm,false,false,n);int64_t began=esp_timer_get_time();
            if(esp_websocket_client_send_bin(s->client,(const char *)pcm,n+8,pdMS_TO_TICKS(1000))!=(int)n+8){error="asr_send_failed";break;}
            uint32_t ms=(esp_timer_get_time()-began)/1000;sent+=n;
            xSemaphoreTake(s->lock,portMAX_DELAY);if(ms>s->stats.send_max_ms)s->stats.send_max_ms=ms;s->stats.sent_bytes=sent;measure(s);xSemaphoreGive(s->lock);
            // backlog最高5倍实时追赶，保证低优先级GUI/USB有机会运行，不阻塞采音高优先级任务。
            vTaskDelay(pdMS_TO_TICKS(40));
        }else if(!recording&&!finishing){
            uint8_t frame[8];ib_doubao_client_header(frame,false,true,0);
            xSemaphoreTake(s->lock,portMAX_DELAY);s->finishing=true;xSemaphoreGive(s->lock);
            if(esp_websocket_client_send_bin(s->client,(const char *)frame,sizeof(frame),pdMS_TO_TICKS(1000))!=(int)sizeof(frame)){error="asr_send_failed";break;}
            finishing=true;deadline=esp_timer_get_time()+INT64_C(20000000);
        }else vTaskDelay(pdMS_TO_TICKS(20));
    }
    if(!error&&!cancel()){
        xSemaphoreTake(s->lock,portMAX_DELAY);if(s->error)error=s->error;else if(!s->finished)error="asr_finish_timeout";else if(!text[0])error="no_speech";xSemaphoreGive(s->lock);
    }
done:
    // 等官方接收任务彻底退出，才释放parser/文本/transport，阻止旧轮回调跨轮写字幕。
    if(s->client){if(error||cancel())ib_asr_realtime_cancel();esp_websocket_client_stop(s->client);esp_websocket_client_destroy(s->client);}
    if(s->ws)esp_transport_destroy(s->ws);
    if(s->guard)esp_transport_destroy(s->guard);
    if(s->tls){socket_set(-1);esp_transport_close(s->tls);esp_transport_destroy(s->tls);}
    portENTER_CRITICAL(&s_stats_lock);s_stats=s->stats;portEXIT_CRITICAL(&s_stats_lock);
    if(s->lock)vSemaphoreDelete(s->lock);
    memset(s,0,sizeof(*s));free(s);
    return cancel()?"cancelled":error;
}
