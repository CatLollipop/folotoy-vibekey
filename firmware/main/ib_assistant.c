#include "ib_assistant.h"
#include "ib_assistant_store.h"
#include "ib_assistant_cloud.h"
#include "ib_audio.h"
#include "ib_pet.h"
#include "ib_ui.h"
#include "ib_app.h"
#include "ib_ble.h"
#include "ib_cloud_stream.h"
#include "ib_base64.h"
#include "ib_usb.h"
#include "ib_wifi.h"
#include "bsp_audio.h"
#include "cJSON.h"
#include "esp_partition.h"
#include "esp_timer.h"
#include "esp_heap_caps.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/stream_buffer.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define SLOT_SIZE 0x100000u
#define PCM_BLOCK 640u
#define RECORD_BUFFER 16384u
static const esp_partition_t *s_scratch;
static ib_assistant_status_cb s_status;
static void *s_context;
static SemaphoreHandle_t s_control;
static TaskHandle_t s_worker,s_reader;
static StreamBufferHandle_t s_samples;
static bool s_available;
static volatile bool s_restart_requested;
static volatile bool s_mode,s_busy,s_cancel,s_stop,s_record,s_record_error,s_prepared;
static volatile bool s_press_pending,s_forget,s_button_held,s_server_change,s_prepare_failed,s_restart_while_held;
static ib_voice_stats_t s_voice;
static volatile ib_assistant_state_t s_state=IB_ASSIST_IDLE;
static unsigned s_slot;
static ib_link_t s_upload_link=IB_LINK_COUNT;
static volatile size_t s_captured;
static volatile uint32_t s_capture_overflows,s_flash_write_max_us,s_ring_peak;
static void worker(void *);
static bool start_worker(void){return s_worker || xTaskCreate(worker,"ib_assistant",10240,NULL,4,&s_worker)==pdPASS;}
static const char *STATES[]={"idle","preparing","listening","transcribing","thinking","replying","done","error","stopped"};
const char *ib_assistant_state_name(ib_assistant_state_t s){return (unsigned)s<sizeof(STATES)/sizeof(STATES[0])?STATES[s]:"error";}
static void reply_to(ib_link_t link,const char *text){size_t n=strlen(text);if(link==IB_LINK_USB)ib_usb_send(text,n);else if(link==IB_LINK_WIFI)ib_wifi_send((const uint8_t *)text,n);}
static void report_state(void){
    char line[256];snprintf(line,sizeof(line),"{\"t\":\"assistant\",\"op\":\"state\",\"mode\":\"%s\",\"state\":\"%s\",\"configured\":%d,\"rev\":%lu}\n",s_mode?"standalone":"companion",ib_assistant_state_name(s_state),ib_assistant_store_configured(),(unsigned long)ib_assistant_store_revision(false));
    ib_usb_send(line,strlen(line));if(!s_mode)ib_wifi_send((const uint8_t *)line,strlen(line));
}
static void state(ib_assistant_state_t st,const char *text){s_state=st;if(s_status)s_status(st,text?text:"",s_context);report_state();}
bool ib_assistant_standalone(void){return s_mode;}
bool ib_assistant_busy(void){return s_busy;}
ib_assistant_state_t ib_assistant_state(void){return s_state;}
static bool cancelled(void){return s_cancel||!s_mode;}
static void text_update(const char *text){if(s_status)s_status(IB_ASSIST_THINKING,text,s_context);}
static void reader(void *unused){
    (void)unused;int16_t pcm[PCM_BLOCK/2];
    size_t max=ib_assistant_profile()->record_limit_seconds*32000u;s_captured=0;s_record_error=false;memset(&s_voice,0,sizeof(s_voice));
        while(s_record&&!s_stop&&!cancelled()&&s_captured<max){
            if(bsp_audio_read(pcm,sizeof(pcm))!=ESP_OK){s_record_error=true;break;}
            size_t n=max-s_captured<sizeof(pcm)?max-s_captured:sizeof(pcm);
            ib_voice_analyze(&s_voice,pcm,n/2);
            if(xStreamBufferSend(s_samples,pcm,n,0)!=n){s_capture_overflows++;s_record_error=true;break;}
            size_t queued=xStreamBufferBytesAvailable(s_samples);if(queued>s_ring_peak)s_ring_peak=queued;
            s_captured+=n;
        }s_record=false;s_reader=NULL;xTaskNotifyGive(s_worker);vTaskDelete(NULL);
}
static bool prepare_slot(void){
    state(IB_ASSIST_PREPARING,"PREPARING RECORDING");
    if(esp_partition_erase_range(s_scratch,s_slot*SLOT_SIZE,SLOT_SIZE)!=ESP_OK){state(IB_ASSIST_ERROR,"flash_erase_failed");s_prepare_failed=true;return false;}
    s_prepared=true;return true;
}
static const char *record_audio(size_t *written){
    *written=0;s_stop=!s_button_held;s_record_error=false;s_capture_overflows=s_flash_write_max_us=s_ring_peak=0;
    if(!s_prepared)return "recording_not_ready";
    // 提示音任务可能刚好还在输出，给它一个有界的结束机会。
    esp_err_t e=ESP_FAIL;for(int i=0;i<20&&!cancelled();i++){e=ib_audio_pcm_begin();if(e==ESP_OK)break;vTaskDelay(pdMS_TO_TICKS(20));}
    if(e!=ESP_OK)return "audio_busy";
    s_samples=xStreamBufferCreate(RECORD_BUFFER,PCM_BLOCK);
    if(!s_samples){ib_audio_pcm_end();return "out_of_memory";}
    s_record=true;s_prepared=false;
    state(IB_ASSIST_LISTENING,"RELEASE OK TO SEND");
    if(xTaskCreate(reader,"ib_asr_capture",3072,NULL,6,&s_reader)!=pdPASS){s_record=false;vStreamBufferDelete(s_samples);s_samples=NULL;ib_audio_pcm_end();return "out_of_memory";}
    uint8_t data[2048];
    while(s_record||xStreamBufferBytesAvailable(s_samples)){
        size_t n=xStreamBufferReceive(s_samples,data,sizeof(data),pdMS_TO_TICKS(25));
        if(n){int64_t started=esp_timer_get_time();
            if(esp_partition_write(s_scratch,s_slot*SLOT_SIZE+*written,data,n)!=ESP_OK){s_record_error=true;s_stop=true;}
            uint32_t elapsed=esp_timer_get_time()-started;if(elapsed>s_flash_write_max_us)s_flash_write_max_us=elapsed;*written+=n;}
        if(*written>30u*32000u){s_record_error=true;s_stop=true;}
    }
    ib_audio_pcm_end();
    vStreamBufferDelete(s_samples);s_samples=NULL;
    if(cancelled())return "cancelled";
    if(s_record_error)return "recording_overflow";
    if(*written<8000)return "recording_too_short";
    if(!ib_voice_present(&s_voice))return "no_speech";
    return NULL;
}
static void worker(void *unused){
    (void)unused;
    for(;;){
        if(s_server_change){vTaskDelay(pdMS_TO_TICKS(250));ib_wifi_set_companion_enabled(!s_mode);s_server_change=false;}
        if(!s_mode){if(!s_restart_requested)ib_wifi_set_companion_enabled(true);ib_assistant_cloud_clear_history();s_worker=NULL;vTaskDelete(NULL);return;}
        if(s_forget){ib_assistant_cloud_clear_history();s_forget=false;}
        if(s_mode&&!s_busy&&!ib_assistant_store_uploading()&&!s_prepared&&!s_prepare_failed&&ib_assistant_store_configured()){
            xSemaphoreTake(s_control,portMAX_DELAY);s_busy=true;
            bool ok=prepare_slot();s_busy=false;xSemaphoreGive(s_control);
            if(ok){
                state(IB_ASSIST_IDLE,"HOLD OK TO TALK");
                if(s_restart_while_held&&s_button_held){s_cancel=s_stop=false;s_press_pending=true;}
                s_restart_while_held=false;
            }
        }
        ulTaskNotifyTake(pdTRUE,pdMS_TO_TICKS(250));
        if(!s_press_pending)continue;
        s_press_pending=false;
        xSemaphoreTake(s_control,portMAX_DELAY);
        if(!s_mode||s_busy||ib_assistant_store_uploading()){xSemaphoreGive(s_control);continue;}
        if(!ib_assistant_store_configured()){state(IB_ASSIST_ERROR,"CONFIGURE ON MAC");xSemaphoreGive(s_control);continue;}
        if(!s_prepared){state(IB_ASSIST_ERROR,"RECORDING NOT READY");xSemaphoreGive(s_control);continue;}
        s_busy=true;xSemaphoreGive(s_control);size_t n=0;const char *error=NULL;char *transcript=NULL,*reply=NULL;
        if(!ib_wifi_is_ready())error="wifi_unavailable";
        if(!error && !ib_wifi_companion_released()) {
            ib_wifi_set_companion_enabled(false);
            for(int i=0;i<100&&!ib_wifi_companion_released();i++)vTaskDelay(pdMS_TO_TICKS(20));
            if(!ib_wifi_companion_released())error="companion_busy";
        }
        if(!error)error=record_audio(&n);
        const ib_assistant_profile_t *p=ib_assistant_profile();
        if(!error){transcript=calloc(1,4096);if(!transcript)error="out_of_memory";}
        if(!error){state(IB_ASSIST_TRANSCRIBING,"RECOGNIZING...");error=ib_assistant_cloud_asr(p,s_scratch,s_slot*SLOT_SIZE,n,transcript,4096,cancelled);}
        if(!error){reply=calloc(1,4097);if(!reply)error="out_of_memory";}
        if(!error){state(IB_ASSIST_THINKING,transcript);error=ib_assistant_cloud_reply(p,transcript,reply,4097,cancelled,text_update);}
        if(transcript){memset(transcript,0,4096);free(transcript);transcript=NULL;}
        if(!error){
            state(IB_ASSIST_REPLYING,reply);
            if(ib_audio_pcm_begin()!=ESP_OK)error="audio_busy";
            else{error=ib_assistant_cloud_tts(p,reply,cancelled);vTaskDelay(pdMS_TO_TICKS(120));ib_audio_pcm_end();}
        }
        s_slot=1-s_slot;s_prepared=false;s_busy=false;s_record=false;
        if(reply){memset(reply,0,4097);free(reply);}
        if(error)state(!strcmp(error,"cancelled")?IB_ASSIST_STOPPED:IB_ASSIST_ERROR,error);
        else state(IB_ASSIST_DONE,"DONE");
        if(!(s_restart_while_held&&s_button_held))ulTaskNotifyTake(pdTRUE,pdMS_TO_TICKS(1200));
        // 下一槽预擦除在录音之前执行，绝不在采音时擦除Flash。
        if(s_mode&&!s_prepared) xTaskNotifyGive(s_worker);
    }
}
void ib_assistant_press(void){
    s_button_held=true;if(!s_mode)return;
    if(s_busy){s_restart_while_held=true;s_cancel=s_stop=true;ib_audio_pcm_interrupt();ib_assistant_cloud_cancel();return;}
    if(!s_prepared){s_restart_while_held=true;s_prepare_failed=false;if(s_worker)xTaskNotifyGive(s_worker);return;}
    s_cancel=false;s_press_pending=true;if(s_worker)xTaskNotifyGive(s_worker);
}
void ib_assistant_release(void){s_button_held=false;s_stop=true;}
void ib_assistant_cancel(void){s_restart_while_held=false;s_cancel=s_stop=true;ib_audio_pcm_interrupt();ib_assistant_cloud_cancel();}
void ib_assistant_clear_history(void){s_forget=true;if(s_worker)xTaskNotifyGive(s_worker);}
void ib_assistant_companion_state(const char *name){
    if(s_mode||s_busy||!s_status)return;
    ib_assistant_state_t st=IB_ASSIST_IDLE;
    if(!strcmp(name,"listening"))st=IB_ASSIST_LISTENING;
    else if(!strcmp(name,"thinking")||!strcmp(name,"working")||!strcmp(name,"searching"))st=IB_ASSIST_THINKING;
    else if(!strcmp(name,"replying")||!strcmp(name,"composing"))st=IB_ASSIST_REPLYING;
    else if(!strcmp(name,"done")||!strcmp(name,"celebrate"))st=IB_ASSIST_DONE;
    else if(!strcmp(name,"error")||!strcmp(name,"alerting"))st=IB_ASSIST_ERROR;
    else if(!strcmp(name,"loading"))st=IB_ASSIST_PREPARING;
    else if(!strcmp(name,"stopped")||!strcmp(name,"powering-down"))st=IB_ASSIST_STOPPED;
    s_status(st,name,s_context);
}
static bool uint_field(const cJSON *o,const char *key,uint32_t *v){const cJSON *x=cJSON_GetObjectItemCaseSensitive(o,key);if(!cJSON_IsNumber(x)||x->valuedouble<0||x->valuedouble>4294967295.0||x->valuedouble!=(uint32_t)x->valuedouble)return false;*v=(uint32_t)x->valuedouble;return true;}
bool ib_assistant_handle_line(ib_link_t link,const char *line,size_t length){
    if(!line||length>511)return false;
    cJSON *o=cJSON_ParseWithLength(line,length);if(!o)return false;
    cJSON *command=cJSON_GetObjectItemCaseSensitive(o,"cmd"),*operation=cJSON_GetObjectItemCaseSensitive(o,"op");
    if(!cJSON_IsString(command)||strcmp(command->valuestring,"assistant")){cJSON_Delete(o);return false;}
    const char *op=cJSON_IsString(operation)?operation->valuestring:"invalid";
    for(const char *p=op;*p;p++)if(!((*p>='a'&&*p<='z')||*p=='_')){op="invalid";break;}
    uint32_t rid=0;uint_field(o,"rid",&rid);
    const char *error=NULL;char response[511];
    if(link==IB_LINK_BLE){cJSON_Delete(o);return true;}
    if(!s_control){cJSON_Delete(o);return true;}
    if(xSemaphoreTake(s_control,pdMS_TO_TICKS(50))!=pdTRUE){error="busy";goto respond;}
    if(!strcmp(op,"status")){
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"status\",\"rid\":%lu,\"ok\":1,\"mode\":\"%s\",\"state\":\"%s\",\"configured\":%d,\"rev\":%lu,\"pet_rev\":%lu,\"heap\":%u,\"min_free\":%u,\"largest\":%u,\"record_bytes\":%u,\"record_error\":%d,\"overflows\":%lu,\"ring_peak\":%lu,\"flash_write_max_us\":%lu,\"voice_blocks\":%lu,\"voice_peak\":%u,\"pet_ms\":%lu,\"app_ready\":%d,\"wifi_configured\":%d,\"wifi_ready\":%d,\"ble\":%d,\"buttons\":%d,\"pet_last_ms\":%lu,\"lvgl_peak\":%lu}\n",
            (unsigned long)rid,s_mode?"standalone":"companion",ib_assistant_state_name(s_state),ib_assistant_store_configured(),
            (unsigned long)ib_assistant_store_revision(false),(unsigned long)ib_assistant_store_revision(true),
            (unsigned)heap_caps_get_free_size(MALLOC_CAP_8BIT),(unsigned)heap_caps_get_minimum_free_size(MALLOC_CAP_8BIT),(unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_8BIT),
            (unsigned)s_captured,s_record_error,(unsigned long)s_capture_overflows,(unsigned long)s_ring_peak,(unsigned long)s_flash_write_max_us,(unsigned long)s_voice.voiced_blocks,s_voice.peak,(unsigned long)ib_ui_pet_max_frame_ms(),ib_app_ready(),ib_wifi_is_configured(),ib_wifi_is_ready(),ib_ble_is_started(),ib_app_buttons_ready(),(unsigned long)ib_ui_pet_last_frame_ms(),(unsigned long)ib_ui_lvgl_peak_bytes());
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"capabilities")){
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"%s\",\"rid\":%lu,\"ok\":1,\"schema\":1,\"max\":16384,\"pet_max\":131072,\"pet_format\":\"aora-bundle-v2\",\"chunk\":288,\"profile\":1,\"pet\":1,\"standalone\":%d,\"mode\":\"%s\",\"state\":\"%s\",\"configured\":%d,\"rev\":%lu,\"pet_rev\":%lu}\n",op,(unsigned long)rid,s_available,s_mode?"standalone":"companion",ib_assistant_state_name(s_state),ib_assistant_store_configured(),(unsigned long)ib_assistant_store_revision(false),(unsigned long)ib_assistant_store_revision(true));
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!s_available)error="unavailable";
    else if(!strcmp(op,"pet_state")){
        cJSON *value=cJSON_GetObjectItemCaseSensitive(o,"value");
        if(s_mode||s_busy)error="busy";else if(!cJSON_IsString(value))error="invalid_state";else {
            bool known=ib_pet_state_is_valid(value->valuestring);
            if(!known)error="invalid_state";else ib_assistant_companion_state(value->valuestring);
        }
    }else if(s_busy || ib_audio_mic_active())error="busy";
    else if(!strcmp(op,"begin")){
        uint32_t rev=0,size=0,crc=0;cJSON *kind=cJSON_GetObjectItemCaseSensitive(o,"kind");
        if(!cJSON_IsString(kind)||(strcmp(kind->valuestring,"profile")&&strcmp(kind->valuestring,"pet"))||!uint_field(o,"rev",&rev)||!uint_field(o,"size",&size)||!uint_field(o,"crc",&crc))error="invalid_request";
        else{error=ib_assistant_store_begin(!strcmp(kind->valuestring,"pet"),rev,size,crc,link==IB_LINK_USB);if(!error)s_upload_link=link;}
    }else if(!strcmp(op,"chunk")){
        uint32_t offset;cJSON *data=cJSON_GetObjectItemCaseSensitive(o,"d");uint8_t decoded[288];
        int n=cJSON_IsString(data)?ib_base64_decode(data->valuestring,strlen(data->valuestring),decoded,sizeof(decoded)):-1;
        if(ib_assistant_store_uploading()&&link!=s_upload_link)error="upload_owner";
        else if(!uint_field(o,"off",&offset)||n<=0)error="invalid_chunk";
        else error=ib_assistant_store_chunk(offset,decoded,n);
        memset(decoded,0,sizeof(decoded));
    }else if(!strcmp(op,"commit")){if(ib_assistant_store_uploading()&&link!=s_upload_link)error="upload_owner";else error=ib_assistant_store_commit();if(!error&&s_status)s_status(s_state,"",s_context);}
    else if(!strcmp(op,"abort")){if(ib_assistant_store_uploading()&&link!=s_upload_link&&link!=IB_LINK_USB)error="upload_owner";else{ib_assistant_store_abort();s_upload_link=IB_LINK_COUNT;}}
    else if(!strcmp(op,"clear")){
        if(link!=IB_LINK_USB&&!ib_assistant_store_usb_provisioned())error="usb_required";
        else if(ib_assistant_store_clear()!=ESP_OK)error="clear_failed";else ib_assistant_clear_history();
    }else if(!strcmp(op,"mode")){
        cJSON *v=cJSON_GetObjectItemCaseSensitive(o,"value");
        if(!cJSON_IsString(v)||(strcmp(v->valuestring,"standalone")&&strcmp(v->valuestring,"companion")))error="invalid_mode";
        else if(ib_assistant_store_uploading())error="upload_active";
        else if(!strcmp(v->valuestring,"standalone")&&!ib_wifi_is_configured())error="wifi_required";
        else if(!strcmp(v->valuestring,"standalone")&&!ib_assistant_store_configured())error="profile_required";
        else if(s_mode==!strcmp(v->valuestring,"standalone")){}
        else if(ib_assistant_mode_save(!strcmp(v->valuestring,"standalone"))!=ESP_OK)error="save_failed";
        else{s_mode=!strcmp(v->valuestring,"standalone");s_cancel=s_stop=true;s_restart_requested=true;
            state(IB_ASSIST_PREPARING,"RESTARTING...");}

    }else error="unknown_operation";
    xSemaphoreGive(s_control);
respond:
    bool upload_op=!strcmp(op,"begin")||!strcmp(op,"chunk")||!strcmp(op,"commit");
    snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"%s\",\"rid\":%lu,\"ok\":%d,\"mode\":\"%s\",\"configured\":%d,\"rev\":%lu,\"pet_rev\":%lu,\"off\":%u,\"restarting\":%d,\"error\":\"%s\"}\n",strlen(op)<24?op:"invalid",(unsigned long)rid,error?0:1,s_mode?"standalone":"companion",ib_assistant_store_configured(),(unsigned long)(upload_op?ib_assistant_store_upload_revision():ib_assistant_store_revision(false)),(unsigned long)ib_assistant_store_revision(true),(unsigned)ib_assistant_store_offset(),s_restart_requested,error?error:"");
    reply_to(link,response);cJSON_Delete(o);if(s_worker)xTaskNotifyGive(s_worker);return true;
}
esp_err_t ib_assistant_init(ib_assistant_status_cb cb,void *context){
    ib_assistant_cloud_init();
    s_status=cb;s_context=context;s_control=xSemaphoreCreateMutex();if(!s_control)return ESP_ERR_NO_MEM;
    esp_err_t e=ib_assistant_store_init();if(e!=ESP_OK)return e;
    s_scratch=esp_partition_find_first(ESP_PARTITION_TYPE_DATA,0x42,"audio_scratch");
    if(!s_scratch||s_scratch->size!=2*SLOT_SIZE||s_scratch->address<0x35A000)return ESP_ERR_INVALID_SIZE;
    s_available=true;s_mode=ib_assistant_mode_load();ib_wifi_set_companion_enabled(!s_mode);
    if(s_mode&&!start_worker()){s_available=false;s_mode=false;ib_wifi_set_companion_enabled(true);return ESP_ERR_NO_MEM;}
    return ESP_OK;
}

void ib_assistant_leave_standalone(void){
    if(!s_control)return;
    if(xSemaphoreTake(s_control,pdMS_TO_TICKS(50))!=pdTRUE)return;
    if(!s_busy&&!ib_assistant_store_uploading()&&ib_assistant_mode_save(false)==ESP_OK){s_mode=false;s_restart_requested=true;s_stop=s_cancel=true;state(IB_ASSIST_PREPARING,"RESTARTING...");}
    xSemaphoreGive(s_control);if(s_worker)xTaskNotifyGive(s_worker);
}

bool ib_assistant_take_restart_request(void){return s_restart_requested;}
