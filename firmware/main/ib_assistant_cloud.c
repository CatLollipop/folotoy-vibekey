// MiniMax 文件 ASR / DeepSeek SSE / MiniMax PCM SSE。请求之间 cleanup，最多一个公网TLS。
#include "ib_assistant_cloud.h"
#include "ib_cloud_stream.h"
#include "bsp_audio.h"
#include "cJSON.h"
#include "esp_crt_bundle.h"
#include "esp_http_client.h"
#include "esp_netif_sntp.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/semphr.h"
#include "lwip/sockets.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
static SemaphoreHandle_t s_socket_lock;
static int s_active_socket=-1;
void ib_assistant_cloud_init(void){if(!s_socket_lock)s_socket_lock=xSemaphoreCreateMutex();}
void ib_assistant_cloud_cancel(void){
    if(!s_socket_lock)return;
    xSemaphoreTake(s_socket_lock,portMAX_DELAY);
    if(s_active_socket>=0)shutdown(s_active_socket,SHUT_RDWR);
    xSemaphoreGive(s_socket_lock);
}
static esp_err_t http_event(esp_http_client_event_t *event){
    if(!s_socket_lock)return ESP_OK;
    if(event->event_id==HTTP_EVENT_ON_CONNECTED||event->event_id==HTTP_EVENT_DISCONNECTED){
        xSemaphoreTake(s_socket_lock,portMAX_DELAY);
        s_active_socket=event->event_id==HTTP_EVENT_ON_CONNECTED?esp_http_client_get_socket(event->client):-1;
        xSemaphoreGive(s_socket_lock);
    }return ESP_OK;
}
static void cleanup(esp_http_client_handle_t h){
    // 先在同一锁内撤销登记，再关闭；取消者无法shutdown被系统复用的旧fd。
    if(s_socket_lock){xSemaphoreTake(s_socket_lock,portMAX_DELAY);s_active_socket=-1;xSemaphoreGive(s_socket_lock);}
    esp_http_client_close(h);esp_http_client_cleanup(h);
}
#define HISTORY_MAX 8192
#define HISTORY_TURNS 12
// 文本只留 RAM；存入一轮时裁掉最旧完整轮次，不保留失败请求。
static char *s_history;
static struct {unsigned start,user,end;} s_turns[HISTORY_TURNS];
static unsigned s_turn_count,s_history_size,s_history_capacity;
void ib_assistant_cloud_clear_history(void){if(s_history){memset(s_history,0,s_history_capacity);free(s_history);s_history=NULL;}memset(s_turns,0,sizeof(s_turns));s_turn_count=s_history_size=s_history_capacity=0;}
static void drop_oldest(void){
    if(!s_turn_count)return;
    unsigned n=s_turns[0].end;
    memmove(s_history,s_history+n,s_history_size-n);s_history_size-=n;
    for(unsigned i=1;i<s_turn_count;i++){s_turns[i-1]=s_turns[i];s_turns[i-1].start-=n;s_turns[i-1].user-=n;s_turns[i-1].end-=n;}
    s_turn_count--;
}
static bool clock_ready(ib_cloud_cancel_cb cancel){
    if(time(NULL)>1735689600)return true;
    esp_sntp_config_t cfg=ESP_NETIF_SNTP_DEFAULT_CONFIG("pool.ntp.org");
    if(esp_netif_sntp_init(&cfg)!=ESP_OK)return false;
    esp_err_t e=ESP_ERR_TIMEOUT;
    for(unsigned i=0;i<40&&!cancel();i++){e=esp_netif_sntp_sync_wait(pdMS_TO_TICKS(250));if(e==ESP_OK)break;}
    esp_netif_sntp_deinit();return e==ESP_OK;
}
static bool url(char *out,size_t cap,const char *base,const char *path){
    size_t n=strlen(base);while(n&&base[n-1]=='/')n--;
    // 用户可填写主机根或 /v1；统一避免 /v1/v1。
    if(n>=3&&!strncmp(base+n-3,"/v1",3)&&!strncmp(path,"/v1/",4))path+=3;
    return snprintf(out,cap,"%.*s%s",(int)n,base,path)>0&&strlen(out)<cap-1;
}
static esp_http_client_handle_t client(const char *endpoint,const char *key){
    esp_http_client_config_t c={.url=endpoint,.method=HTTP_METHOD_POST,.timeout_ms=3000,
        .crt_bundle_attach=esp_crt_bundle_attach,.buffer_size=1024,.buffer_size_tx=1024,.disable_auto_redirect=true,.event_handler=http_event};
    esp_http_client_handle_t h=esp_http_client_init(&c);if(!h)return NULL;
    char *auth=malloc(strlen(key)+8);if(!auth){esp_http_client_cleanup(h);return NULL;}
    sprintf(auth,"Bearer %s",key);esp_http_client_set_header(h,"Authorization",auth);memset(auth,0,strlen(auth));free(auth);
    return h;
}
static bool write_all(esp_http_client_handle_t h,const void *data,size_t n,ib_cloud_cancel_cb cancel){
    const char *p=data;while(n){if(cancel())return false;int w=esp_http_client_write(h,p,n);if(w<=0)return false;p+=w;n-=w;}return true;
}
static const char *headers(esp_http_client_handle_t h){
    if(esp_http_client_fetch_headers(h)<0)return "network_error";
    int code=esp_http_client_get_status_code(h);
    if(code==200){esp_http_client_set_timeout_ms(h,1000);return NULL;}
    if(code==401||code==403)return "authentication_failed";
    if(code==402)return "insufficient_balance";
    if(code==429)return "rate_limited";
    if(code>=500)return "provider_unavailable";
    return "provider_rejected";
}
// 接收超时每秒返回一次给取消检查；总期限单独限制，避免token慢到来时永久阻塞。
static int read_interruptible(esp_http_client_handle_t h,char *bytes,size_t size,ib_cloud_cancel_cb cancel,int64_t deadline){
    while(!cancel()&&esp_timer_get_time()<deadline){int n=esp_http_client_read(h,bytes,size);if(n==-ESP_ERR_HTTP_EAGAIN)continue;return n;}return -1;
}
typedef bool (*body_fn)(ib_json_writer_t *,const void *);
typedef struct {esp_http_client_handle_t http;ib_cloud_cancel_cb cancel;} http_writer_t;
static bool http_write(const uint8_t *bytes,size_t n,void *context){http_writer_t *w=context;return write_all(w->http,bytes,n,w->cancel);}
static const char *post_stream(esp_http_client_handle_t h,body_fn produce,const void *context,ib_cloud_cancel_cb cancel){
    ib_json_writer_t count={0};if(!produce(&count,context))return "invalid_request";
    esp_http_client_set_header(h,"Content-Type","application/json");
    if(esp_http_client_open(h,count.total)!=ESP_OK)return "connection_failed";
    esp_http_client_set_timeout_ms(h,15000);
    http_writer_t out={h,cancel};ib_json_writer_t writer={.output=http_write,.context=&out};
    if(!produce(&writer,context)||writer.total!=count.total)return cancel()?"cancelled":"upload_failed";
    return headers(h);
}
const char *ib_assistant_cloud_asr(const ib_assistant_profile_t *p,const esp_partition_t *part,size_t offset,size_t n,char *text,size_t cap,ib_cloud_cancel_cb cancel){
    text[0]=0;if(!clock_ready(cancel))return cancel()?"cancelled":"clock_sync_failed";
    char endpoint[320];if(!url(endpoint,sizeof(endpoint),p->minimax_base_url,"/v1/speech_to_text"))return "invalid_endpoint";
    esp_http_client_handle_t h=client(endpoint,p->minimax_key);if(!h)return "out_of_memory";
    const char *prefix="--vibekey-assistant\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\nasr-1.0\r\n--vibekey-assistant\r\nContent-Disposition: form-data; name=\"response_format\"\r\n\r\njson\r\n--vibekey-assistant\r\nContent-Disposition: form-data; name=\"file\"; filename=\"speech.wav\"\r\nContent-Type: audio/wav\r\n\r\n";
    const char *suffix="\r\n--vibekey-assistant--\r\n";
    esp_http_client_set_header(h,"Content-Type","multipart/form-data; boundary=vibekey-assistant");
    uint8_t wav[44],bytes[1024];ib_wav_header(wav,n);const char *error=NULL;
    if(esp_http_client_open(h,strlen(prefix)+44+n+strlen(suffix))!=ESP_OK){error="connection_failed";goto done;}
    esp_http_client_set_timeout_ms(h,15000);
    if(!write_all(h,prefix,strlen(prefix),cancel)||!write_all(h,wav,44,cancel)){error="upload_failed";goto done;}
    for(size_t pos=0;pos<n;pos+=sizeof(bytes)){
        size_t take=n-pos<sizeof(bytes)?n-pos:sizeof(bytes);
        if(cancel()){error="cancelled";goto done;}
        if(esp_partition_read(part,offset+pos,bytes,take)!=ESP_OK||!write_all(h,bytes,take,cancel)){error="upload_failed";goto done;}
    }
    if(!write_all(h,suffix,strlen(suffix),cancel)){error="upload_failed";goto done;}
    error=headers(h);if(error)goto done;
    // ASR响应上限固定，超过上限明确失败，不静默截断用户输入。
    char *response=malloc(8192);if(!response){error="out_of_memory";goto done;}
    size_t used=0;int r=0;int64_t deadline=esp_timer_get_time()+60*INT64_C(1000000);
    while(!cancel()&&(r=read_interruptible(h,response+used,8191-used,cancel,deadline))>0){used+=r;if(used==8191){error="transcript_too_large";break;}}
    response[used]=0;
    if(cancel())error="cancelled";else if(r<0)error="network_error";
    if(!error){cJSON *o=cJSON_Parse(response);cJSON *v=o?cJSON_GetObjectItemCaseSensitive(o,"text"):NULL;
        if(!cJSON_IsString(v)||!v->valuestring[0])error="no_speech";
        else if(strlen(v->valuestring)>=cap)error="transcript_too_large";else strcpy(text,v->valuestring);
        cJSON_Delete(o);}
    memset(response,0,8192);free(response);
done:cleanup(h);return cancel()?"cancelled":error;
}
typedef struct {const ib_assistant_profile_t *profile;const char *text;} request_t;
static bool write_message(ib_json_writer_t *w,const char *role,const char *content){
    return ib_json_write(w,"{\"role\":")&&ib_json_string(w,role)&&ib_json_write(w,",\"content\":")&&ib_json_string(w,content)&&ib_json_write(w,"}");
}
static bool reply_body(ib_json_writer_t *w,const void *context){
    const request_t *r=context;const ib_assistant_profile_t *p=r->profile;char tokens[16];snprintf(tokens,sizeof(tokens),"%u",p->max_output_tokens);
    if(!ib_json_write(w,"{\"model\":")||!ib_json_string(w,p->llm_model)||!ib_json_write(w,",\"stream\":true,\"max_tokens\":")||!ib_json_write(w,tokens)||
       !ib_json_write(w,",\"thinking\":{\"type\":\"disabled\"},\"messages\":[")||!write_message(w,"system",p->system_prompt))return false;
    for(unsigned i=0;i<s_turn_count;i++)if(!ib_json_write(w,",")||!write_message(w,"user",s_history+s_turns[i].start)||!ib_json_write(w,",")||!write_message(w,"assistant",s_history+s_turns[i].user))return false;
    return ib_json_write(w,",")&&write_message(w,"user",r->text)&&ib_json_write(w,"]}");
}
static bool tts_body(ib_json_writer_t *w,const void *context){
    const request_t *r=context;
    return ib_json_write(w,"{\"model\":\"speech-2.8-turbo\",\"stream\":true,\"stream_options\":{\"exclude_aggregated_audio\":true},\"audio_setting\":{\"format\":\"pcm\",\"sample_rate\":16000,\"channel\":1},\"voice_setting\":{\"voice_id\":")&&
        ib_json_string(w,r->profile->voice_id)&&ib_json_write(w,"},\"text\":")&&ib_json_string(w,r->text)&&ib_json_write(w,"}");
}
const char *ib_assistant_cloud_reply(const ib_assistant_profile_t *p,const char *text,char *reply,size_t cap,ib_cloud_cancel_cb cancel,ib_cloud_text_cb update){
    reply[0]=0;size_t fixed=strlen(p->system_prompt)+strlen(text);
    if(fixed>p->history_bytes)return "input_too_large";
    while(s_turn_count&&(s_history_size+fixed>p->history_bytes||s_turn_count==HISTORY_TURNS))drop_oldest();
    char endpoint[320];if(!url(endpoint,sizeof(endpoint),p->deepseek_base_url,"/v1/chat/completions"))return "invalid_endpoint";
    esp_http_client_handle_t h=client(endpoint,p->deepseek_key);if(!h)return "out_of_memory";
    request_t request={p,text};const char *error=post_stream(h,reply_body,&request,cancel);
    char *line=malloc(8192);if(!line){error="out_of_memory";goto done;}
    size_t line_n=0,reply_n=0;bool finished=false,stopped=false;int64_t started=esp_timer_get_time();uint8_t bytes[512];
    while(!error&&!cancel()&&!finished){
        if(esp_timer_get_time()-started>90*INT64_C(1000000)){error="response_timeout";break;}
        int n=read_interruptible(h,(char *)bytes,sizeof(bytes),cancel,started+90*INT64_C(1000000));if(n<=0){if(n<0)error="network_error";break;}
        for(int j=0;j<n&&!error;j++){
            char c=bytes[j];if(c=='\r')continue;
            if(c!='\n'){if(line_n+1>=8192){error="response_too_large";break;}line[line_n++]=c;continue;}
            line[line_n]=0;
            if(!strncmp(line,"data:",5)){
                char *data=line+5;while(*data==' ')data++;
                if(!strcmp(data,"[DONE]")){finished=true;line_n=0;continue;}
                cJSON *o=cJSON_Parse(data),*choices=o?cJSON_GetObjectItemCaseSensitive(o,"choices"):NULL,*choice=cJSON_GetArrayItem(choices,0);
                cJSON *delta=choice?cJSON_GetObjectItemCaseSensitive(choice,"delta"):NULL,*content=delta?cJSON_GetObjectItemCaseSensitive(delta,"content"):NULL;
                if(!o||cJSON_GetObjectItemCaseSensitive(o,"error"))error="provider_rejected";
                if(cJSON_IsString(content)){size_t add=strlen(content->valuestring);if(reply_n+add>=cap||reply_n+add>p->reply_bytes)error="reply_too_large";else{memcpy(reply+reply_n,content->valuestring,add+1);reply_n+=add;if(update)update(reply);}}
                cJSON *reason=choice?cJSON_GetObjectItemCaseSensitive(choice,"finish_reason"):NULL;
                if(cJSON_IsString(reason)&&!strcmp(reason->valuestring,"stop"))stopped=true;
                if(cJSON_IsString(reason)&&strcmp(reason->valuestring,"stop"))error=!strcmp(reason->valuestring,"length")?"reply_truncated":"unsupported_reply";
                cJSON_Delete(o);
            }line_n=0;
        }
    }
    memset(line,0,8192);free(line);
    if(!error&&(!finished||!stopped))error="incomplete_response";
    if(!error&&!reply[0])error="empty_reply";
    if(!error){
        cleanup(h);h=NULL;
        size_t need=strlen(text)+1+strlen(reply)+1;while(s_turn_count&&(s_history_size+need>p->history_bytes||s_turn_count==HISTORY_TURNS))drop_oldest();
        size_t total=s_history_size+need;
        if(need<=p->history_bytes&&total<=HISTORY_MAX){
            if(total>s_history_capacity){size_t capacity=(total+1023)&~(size_t)1023;if(capacity>HISTORY_MAX)capacity=HISTORY_MAX;char *history=realloc(s_history,capacity);if(history){s_history=history;s_history_capacity=capacity;}}
            while(s_turn_count&&s_history_size+need>s_history_capacity)drop_oldest();
            if(s_history_size+need<=s_history_capacity){unsigned k=s_turn_count++;s_turns[k].start=s_history_size;strcpy(s_history+s_history_size,text);s_history_size+=strlen(text)+1;s_turns[k].user=s_history_size;strcpy(s_history+s_history_size,reply);s_history_size+=strlen(reply)+1;s_turns[k].end=s_history_size;}
        }
    }
done:if(h)cleanup(h);return cancel()?"cancelled":error;
}
typedef struct {ib_cloud_cancel_cb cancel;bool odd;uint8_t first;size_t samples;} pcm_context_t;
static bool pcm_output(const uint8_t *bytes,size_t n,void *ctx){
    pcm_context_t *s=ctx;if(s->cancel())return false;
    if(s->odd&&n){uint8_t pair[2]={s->first,*bytes++};if(bsp_audio_write(pair,2)!=ESP_OK)return false;s->samples++;n--;s->odd=false;}
    size_t even=n&~(size_t)1;if(even&&bsp_audio_write(bytes,even)!=ESP_OK)return false;s->samples+=even/2;
    if(n!=even){s->first=bytes[even];s->odd=true;}return true;
}
const char *ib_assistant_cloud_tts(const ib_assistant_profile_t *p,const char *text,ib_cloud_cancel_cb cancel){
    char endpoint[320];if(!url(endpoint,sizeof(endpoint),p->minimax_base_url,"/v1/t2a_v2"))return "invalid_endpoint";
    esp_http_client_handle_t h=client(endpoint,p->minimax_key);if(!h)return "out_of_memory";
    request_t request={p,text};const char *error=post_stream(h,tts_body,&request,cancel);
    ib_audio_json_t *filter=malloc(sizeof(*filter));if(!filter){error="out_of_memory";goto done;}
    pcm_context_t pcm={.cancel=cancel};ib_audio_json_init(filter,pcm_output,&pcm);
    char prefix[6]={0};size_t prefix_n=0;bool is_data=false,finished=false;uint8_t bytes[512];int64_t start=esp_timer_get_time();
    while(!error&&!finished&&!cancel()){
        if(esp_timer_get_time()-start>180*INT64_C(1000000)){error="playback_timeout";break;}
        int n=read_interruptible(h,(char *)bytes,sizeof(bytes),cancel,start+180*INT64_C(1000000));if(n<=0){if(n<0)error="network_error";break;}
        for(int j=0;j<n&&!error;j++){
            char c=bytes[j];if(c=='\r')continue;
            if(c=='\n'){
                if(is_data&&filter->used){
                    if(!ib_audio_json_finish(filter)){error="invalid_audio";break;}
                    cJSON *event=cJSON_Parse(filter->metadata),*base=event?cJSON_GetObjectItemCaseSensitive(event,"base_resp"):NULL,*code=base?cJSON_GetObjectItemCaseSensitive(base,"status_code"):NULL;
                    if(!event||(cJSON_IsNumber(code)&&code->valueint!=0))error="synthesis_failed";
                    cJSON *data=event?cJSON_GetObjectItemCaseSensitive(event,"data"):NULL,*status=data?cJSON_GetObjectItemCaseSensitive(data,"status"):NULL;
                    if(cJSON_IsNumber(status)&&status->valueint==2)finished=true;
                    cJSON_Delete(event);
                }
                prefix_n=0;is_data=false;ib_audio_json_init(filter,pcm_output,&pcm);continue;
            }
            if(prefix_n<5){prefix[prefix_n++]=c;if(prefix_n==5)is_data=!memcmp(prefix,"data:",5);continue;}
            if(is_data&&!ib_audio_json_feed(filter,c))error=cancel()?"cancelled":"invalid_audio";
        }
    }
    if(!error&&(!finished||pcm.odd||!pcm.samples))error="incomplete_audio";
    free(filter);
done:cleanup(h);return cancel()?"cancelled":error;
}
