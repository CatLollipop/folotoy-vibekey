// 真实WSS运行器的transport/任务替身：检测顺序、并发字幕、音频字节及取消后的资源退出。
#include "test_common.h"
#include "ib_asr_realtime.h"
#include "ib_doubao_asr.h"
#include "esp_websocket_client.h"
#include "esp_crt_bundle.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
struct fake_semaphore {bool locked;};
struct fake_transport {unsigned kind;int port;void *context;connect_func connect;trans_func close;esp_transport_handle_t parent;};
struct fake_client {esp_websocket_client_config_t config;void(*callback)(void *,esp_event_base_t,int32_t,void *);void *context;char task[37];bool stopped,started;};
static unsigned live_semaphores,live_transports,live_clients,tls_attempts,checks,bytes_sent,callbacks,finals;
static int scenario;
static int64_t virtual_us;
static bool overlap,transcribing,finished_command,record_failed;
static uint8_t pcm[19200];
static const esp_partition_t part={.address=0x400000,.size=sizeof(pcm)};
enum {SUCCESS=0,CANCEL,AUTH,TASK_FAILED,SEND_FAILED,INVALID_JSON,EARLY_FINISH,MISSING_FINAL,TIMEOUT,REDIRECT,FLASH_FAILURE,RECORD_FAILURE,EMPTY_TERMINAL};
void esp_log_level_set(const char *tag,int level){CHECK_STR(tag,"transport_ws");CHECK(level==0);}
SemaphoreHandle_t xSemaphoreCreateMutex(void){struct fake_semaphore *s=calloc(1,sizeof(*s));live_semaphores++;return s;}
BaseType_t xSemaphoreTake(SemaphoreHandle_t s,TickType_t ticks){(void)ticks;CHECK(!s->locked);s->locked=true;return pdTRUE;}
BaseType_t xSemaphoreGive(SemaphoreHandle_t s){CHECK(s->locked);s->locked=false;return pdTRUE;}
void vSemaphoreDelete(SemaphoreHandle_t s){CHECK(!s->locked);free(s);live_semaphores--;}
int64_t esp_timer_get_time(void){return virtual_us;}
void vTaskDelay(TickType_t ticks){virtual_us+=(int64_t)ticks*1000;}
UBaseType_t uxTaskGetStackHighWaterMark(TaskHandle_t task){(void)task;return 2048;}
size_t heap_caps_get_free_size(unsigned c){(void)c;return 17000;}
size_t heap_caps_get_largest_free_block(unsigned c){(void)c;return 14000;}
esp_err_t esp_crt_bundle_attach(void *p){(void)p;return ESP_OK;}
void esp_fill_random(void *p,size_t n){memset(p,0x42,n);}
bool ib_assistant_cloud_clock_ready(ib_cloud_cancel_cb cancel){return !cancel();}
esp_transport_handle_t esp_transport_init(void){live_transports++;return calloc(1,sizeof(struct fake_transport));}
esp_transport_handle_t esp_transport_ssl_init(void){esp_transport_handle_t t=esp_transport_init();t->kind=1;return t;}
esp_transport_handle_t esp_transport_ws_init(esp_transport_handle_t p){esp_transport_handle_t t=esp_transport_init();t->kind=2;t->parent=p;return t;}
void esp_transport_ssl_crt_bundle_attach(esp_transport_handle_t t,esp_err_t(*attach)(void*)){CHECK(t->kind==1&&attach==esp_crt_bundle_attach);checks++;}
esp_err_t esp_transport_set_context_data(esp_transport_handle_t t,void *p){t->context=p;return ESP_OK;}
void *esp_transport_get_context_data(esp_transport_handle_t t){return t->context;}
esp_err_t esp_transport_set_default_port(esp_transport_handle_t t,int p){CHECK(p==443);t->port=p;return ESP_OK;}
int esp_transport_get_default_port(esp_transport_handle_t t){return t->port;}
esp_tls_error_handle_t esp_transport_get_error_handle(esp_transport_handle_t t){(void)t;static esp_tls_last_error_t e;return &e;}
int esp_transport_get_errno(esp_transport_handle_t t){(void)t;return 0;}
int esp_transport_ws_get_upgrade_request_status(esp_transport_handle_t t){CHECK(t->kind==2);return scenario==AUTH?401:101;}
esp_err_t esp_transport_set_parent_transport_func(esp_transport_handle_t t,payload_transfer_func p){CHECK(p(t)!=NULL);return ESP_OK;}
esp_err_t esp_transport_set_func(esp_transport_handle_t t,connect_func c,io_read_func r,io_func w,trans_func close,poll_func pr,poll_func pw,trans_func destroy){(void)r;(void)w;(void)pr;(void)pw;(void)destroy;t->connect=c;t->close=close;return ESP_OK;}
int esp_transport_connect(esp_transport_handle_t t,const char *h,int p,int ms){CHECK(ms==3000);if(t->connect)return t->connect(t,h,p,ms);if(t->parent)return esp_transport_connect(t->parent,h,p,ms);tls_attempts++;return 0;}
int esp_transport_read(esp_transport_handle_t t,char *p,int n,int ms){(void)t;(void)p;(void)n;(void)ms;return 0;}
int esp_transport_write(esp_transport_handle_t t,const char *p,int n,int ms){(void)t;(void)p;(void)ms;return n;}
int esp_transport_poll_read(esp_transport_handle_t t,int ms){(void)t;(void)ms;return 0;}
int esp_transport_poll_write(esp_transport_handle_t t,int ms){(void)t;(void)ms;return 1;}
int esp_transport_get_socket(esp_transport_handle_t t){(void)t;return -1;}
int esp_transport_close(esp_transport_handle_t t){if(t->close)return t->close(t);if(t->parent)return esp_transport_close(t->parent);return 0;}
esp_err_t esp_transport_destroy(esp_transport_handle_t t){free(t);live_transports--;return ESP_OK;}
esp_err_t esp_transport_ws_set_config(esp_transport_handle_t t,const esp_transport_ws_config_t *c){CHECK(t->kind==2);CHECK_STR(c->ws_path,"/api/v3/sauc/bigmodel_async");CHECK(strstr(c->headers,"X-Api-Key: fictional-asr-key\r\n"));CHECK(strstr(c->headers,"X-Api-Resource-Id: volc.seedasr.sauc.duration\r\n"));CHECK(strstr(c->headers,"X-Api-Request-Id: "));CHECK(strstr(c->headers,"X-Api-Connect-Id: "));CHECK(!c->auth);CHECK(c->propagate_control_frames);checks++;return ESP_OK;}
esp_websocket_client_handle_t esp_websocket_client_init(const esp_websocket_client_config_t *c){CHECK(c->disable_auto_reconnect&&c->task_stack==4096&&c->buffer_size==1024);struct fake_client *s=calloc(1,sizeof(*s));s->config=*c;live_clients++;return s;}
esp_err_t esp_websocket_register_events(esp_websocket_client_handle_t c,int any,void(*callback)(void*,esp_event_base_t,int32_t,void*),void *ctx){CHECK(any==-1);c->callback=callback;c->context=ctx;return ESP_OK;}
static void frame(esp_websocket_client_handle_t c,const uint8_t *wire,size_t n){
    size_t split=n/2;
    for(unsigned f=0;f<2;f++){size_t begin=f?split:0,total=f?n-split:split;
        for(size_t off=0;off<total;off+=7){size_t take=total-off<7?total-off:7;
            esp_websocket_event_data_t e={.data_ptr=(const char *)wire+begin+off,.data_len=(int)take,.fin=f==1,.op_code=f?WS_TRANSPORT_OPCODES_CONT:WS_TRANSPORT_OPCODES_BINARY,.payload_offset=(int)off,.payload_len=(int)total};c->callback(c->context,"ws",WEBSOCKET_EVENT_DATA,&e);}
    }
}
static void put32(uint8_t *p,uint32_t n){for(unsigned i=0;i<4;i++)p[i]=n>>(24-i*8);}
static void result(esp_websocket_client_handle_t c,const char *text,bool last){
    uint8_t wire[1024];char json[900];snprintf(json,sizeof(json),"{\"result\":{\"text\":\"%s\",\"utterances\":[{\"text\":\"ignored\",\"definite\":false}]}}",text);
    size_t n=strlen(json);wire[0]=0x11;wire[1]=last?0x93:0x91;wire[2]=0x10;wire[3]=0;put32(wire+4,last?13:1);put32(wire+8,n);memcpy(wire+12,json,n);frame(c,wire,n+12);
}
esp_err_t esp_websocket_client_start(esp_websocket_client_handle_t c){
    int port=esp_transport_get_default_port(c->config.ext_transport);CHECK(port==443);CHECK(esp_transport_connect(c->config.ext_transport,"fixture.invalid",port,3000)==0);virtual_us+=100000;
    if(scenario==REDIRECT){CHECK(esp_transport_connect(c->config.ext_transport,"other.invalid",443,3000)==-1);esp_websocket_event_data_t e={0};c->callback(c->context,"ws",WEBSOCKET_EVENT_ERROR,&e);return ESP_OK;}
    if(scenario==AUTH){esp_websocket_event_data_t e={.error_handle={.esp_ws_handshake_status_code=401}};c->callback(c->context,"ws",WEBSOCKET_EVENT_ERROR,&e);return ESP_OK;}
    c->callback(c->context,"ws",WEBSOCKET_EVENT_CONNECTED,NULL);return ESP_OK;
}
esp_err_t esp_websocket_client_stop(esp_websocket_client_handle_t c){c->stopped=true;return ESP_OK;}
esp_err_t esp_websocket_client_destroy(esp_websocket_client_handle_t c){CHECK(c->stopped);esp_transport_close(c->config.ext_transport);free(c);live_clients--;return ESP_OK;}
int esp_websocket_client_send_text(esp_websocket_client_handle_t c,const char *p,int n,TickType_t ticks){(void)c;(void)p;(void)n;(void)ticks;CHECK(false);return -1;}
int esp_websocket_client_send_bin(esp_websocket_client_handle_t c,const char *p,int n,TickType_t ticks){
    (void)ticks;const uint8_t *b=(const uint8_t *)p;CHECK(n>=8&&b[0]==0x11&&b[3]==0);unsigned type=b[1]>>4;
    size_t len=(uint32_t)b[4]<<24|(uint32_t)b[5]<<16|(uint32_t)b[6]<<8|b[7];CHECK(len==(size_t)n-8);CHECK((b[2]&15)==0);
    if(type==1){CHECK(b[2]==0x10);char body[512];CHECK(len<sizeof(body));memcpy(body,p+8,len);body[len]=0;CHECK(strstr(body,"\"model_name\":\"bigmodel\"")!=NULL);c->started=true;result(c,"",false);
        if(scenario==TASK_FAILED){uint8_t error[12]={0x11,0xf0,0,0};put32(error+4,45000001);frame(c,error,sizeof(error));}return n;}
    CHECK(type==2&&b[2]==0&&c->started&&!finished_command);
    if(b[1]&2){CHECK(!len&&bytes_sent==sizeof(pcm));finished_command=true;
        if(scenario==MISSING_FINAL||scenario==EMPTY_TERMINAL){static const uint8_t missing[]={0x11,0x92,0x10,0,0,0,0,2,'{','}'};frame(c,missing,sizeof(missing));}
        else if(scenario!=TIMEOUT)result(c,"你好。今天。",true);
        return n;
    }
    if(scenario==SEND_FAILED)return -1;
    CHECK(bytes_sent+len<=sizeof(pcm));CHECK(!memcmp(pcm+bytes_sent,p+8,len));bytes_sent+=len;
    if(scenario==EMPTY_TERMINAL)return n;
    if(bytes_sent==6400){if(scenario==INVALID_JSON){static const uint8_t invalid[]={0x11,0x90,0x10,0,0,0,0,2,'{','x'};frame(c,invalid,sizeof(invalid));}else if(scenario==EARLY_FINISH)result(c,"提前",true);else result(c,"你好",false);}
    if(bytes_sent==12800)result(c,"你好。今天",false);
    return n;
}
esp_err_t esp_partition_read(const esp_partition_t *p,size_t off,void *out,size_t n){CHECK(p==&part&&off+n<=sizeof(pcm));if(scenario==FLASH_FAILURE)return ESP_FAIL;memcpy(out,pcm+off,n);return ESP_OK;}
static size_t available(void){size_t n=(size_t)(virtual_us/20000)*640;return n>sizeof(pcm)?sizeof(pcm):n;}
static bool recording(void){return available()<sizeof(pcm);}
static bool record_error(void){return scenario==RECORD_FAILURE;}
static bool cancelled(void){return scenario==CANCEL&&virtual_us>220000;}
static void phase(void){transcribing=true;}
static void transcript(const char *text,bool final){callbacks++;if(recording())overlap=true;if(final){finals++;CHECK_STR(text,"你好。今天。");}}
int main(void){
    for(unsigned i=0;i<sizeof(pcm);i++)pcm[i]=i%251;
    ib_asr_realtime_init();CHECK(live_semaphores==1);
    const ib_asr_source_t source={available,recording,record_error,phase,transcript};
    ib_assistant_profile_t profile={.asr_key="fictional-asr-key",.asr_ws_url="wss://fixture.invalid/api/v3/sauc/bigmodel_async",.asr_model="bigmodel",.asr_resource_id="volc.seedasr.sauc.duration",.record_limit_seconds=30};
    const char *errors[]={NULL,"cancelled","authentication_failed","asr_task_failed","asr_send_failed","asr_invalid_json","asr_early_finish","incomplete_response","asr_finish_timeout","asr_redirect_rejected","flash_read_failed","recording_overflow","no_speech"};
    for(scenario=0;scenario<=EMPTY_TERMINAL;scenario++){
        virtual_us=1000;checks=bytes_sent=tls_attempts=callbacks=finals=0;overlap=transcribing=finished_command=record_failed=false;char text[4096];
        const char *error=ib_asr_realtime_run(&profile,&part,0,&source,text,sizeof(text),cancelled);
        if(errors[scenario]){CHECK(error);if(error)CHECK_STR(error,errors[scenario]);}else{CHECK(!error);CHECK(overlap&&transcribing&&finals==1&&callbacks>=3);CHECK_STR(text,"你好。今天。");}
        CHECK(live_semaphores==1&&live_transports==0&&live_clients==0);CHECK(tls_attempts==1);CHECK(checks==2);
        ib_asr_stats_t stats;ib_asr_realtime_stats(&stats);CHECK(stats.ws_stack_min_bytes==2048);
        ib_asr_diagnostics_t diag;ib_asr_realtime_diagnostics(&diag);CHECK(diag.connect_port==443&&diag.connect_result==0);if(scenario==AUTH)CHECK(diag.http_code==401);
        if(!scenario){CHECK(stats.sent_bytes==sizeof(pcm)&&stats.task_started&&stats.task_finished);CHECK(stats.partials==3&&stats.sentences==1);}
    }
    TEST_DONE("asr_realtime");
}
