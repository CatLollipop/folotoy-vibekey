#include "ib_assistant.h"
#include "ib_assistant_store.h"
#include "ib_assistant_cloud.h"
#include "ib_asr_realtime.h"
#include "ib_audio.h"
#include "ib_pet.h"
#include "ib_ui.h"
#include "ib_tts_player.h"
#include "ib_run_menu.h"
#include "ib_hot_mode.h"
#include "ib_notification.h"
#include "ib_notification_wire.h"
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
#define RECORD_BUFFER 6144u
static const esp_partition_t *s_scratch;
static ib_assistant_status_cb s_status;
static void *s_context;
static bool (*s_reply_apply)(void *);
static void *s_reply_apply_context;
static uint32_t s_reply_generation;
static bool s_reply_invalid;
static bool (*s_notification_apply)(void *);
static bool (*s_notification_hide)(void *);
static void *s_notification_context;
static int64_t s_notification_upload_deadline;
void ib_assistant_set_notification_apply(bool (*apply)(void *),bool (*hide)(void *),void *context){s_notification_apply=apply;s_notification_hide=hide;s_notification_context=context;}
void ib_assistant_set_reply_apply(bool (*apply)(void *),void *context){s_reply_apply=apply;s_reply_apply_context=context;}
static SemaphoreHandle_t s_control;
static TaskHandle_t s_worker,s_reader;
static StreamBufferHandle_t s_samples;
static volatile bool s_capture_done;
static bool s_capture_active;
static bool s_available;
static bool s_comp_cloud,s_comp_has_phase,s_comp_owner;
static const char *s_comp_error="";
static char s_last_error[48];
static portMUX_TYPE s_error_lock=portMUX_INITIALIZER_UNLOCKED;
static volatile bool s_restart_requested;
static volatile bool s_switching,s_worker_exit_requested,s_worker_starting;
static volatile bool s_mode,s_busy,s_cancel,s_stop,s_record,s_record_error,s_prepared;
static volatile bool s_press_pending,s_forget,s_button_held,s_prepare_failed,s_restart_while_held;
static ib_voice_stats_t s_voice;
static volatile ib_assistant_state_t s_state=IB_ASSIST_IDLE;
static unsigned s_slot;
static ib_link_t s_upload_link=IB_LINK_COUNT;
static volatile size_t s_captured;
static void state(ib_assistant_state_t,const char *);
static volatile uint32_t s_capture_overflows,s_flash_write_max_us,s_ring_peak,s_capture_stack_min_bytes,s_writer_stack_min_bytes,s_record_ring_overflows;
static portMUX_TYPE s_transcript_lock=portMUX_INITIALIZER_UNLOCKED;
static ib_transcript_view_t s_transcript;
static uint32_t s_transcript_revision,s_transcript_generation;
void ib_assistant_transcript_snapshot(ib_transcript_view_t *view,uint32_t *revision){portENTER_CRITICAL(&s_transcript_lock);*view=s_transcript;*revision=s_transcript_revision;portEXIT_CRITICAL(&s_transcript_lock);}
static bool transcript_begin(uint32_t generation){portENTER_CRITICAL(&s_transcript_lock);bool ok=ib_transcript_view_begin(&s_transcript,generation);if(ok)s_transcript_revision++;portEXIT_CRITICAL(&s_transcript_lock);return ok;}
static bool transcript_update(uint32_t generation,const char *text,bool final){portENTER_CRITICAL(&s_transcript_lock);bool ok=ib_transcript_view_update(&s_transcript,generation,text,final);if(ok)s_transcript_revision++;portEXIT_CRITICAL(&s_transcript_lock);return ok;}
static void transcript_clear(uint32_t generation){portENTER_CRITICAL(&s_transcript_lock);ib_transcript_view_clear(&s_transcript,generation);s_transcript_revision++;portEXIT_CRITICAL(&s_transcript_lock);}
static void asr_transcript(const char *text,bool final){(void)transcript_update(s_transcript_generation,text,final);}
static void asr_transcribing(void){state(IB_ASSIST_TRANSCRIBING,"RECOGNIZING...");}
static void worker(void *);
static bool start_worker(void){return s_worker || xTaskCreate(worker,"ib_assistant",10240,NULL,4,&s_worker)==pdPASS;}
static const char *STATES[]={"idle","preparing","listening","transcribing","thinking","replying","done","error","stopped","speaking"};
const char *ib_assistant_state_name(ib_assistant_state_t s){return (unsigned)s<sizeof(STATES)/sizeof(STATES[0])?STATES[s]:"error";}
static void reply_to(ib_link_t link,const char *text){size_t n=strlen(text);if(link==IB_LINK_USB)ib_usb_send(text,n);else if(link==IB_LINK_WIFI)ib_wifi_send((const uint8_t *)text,n);}
static void last_error_copy(char out[48]){portENTER_CRITICAL(&s_error_lock);memcpy(out,s_last_error,sizeof(s_last_error));portEXIT_CRITICAL(&s_error_lock);}
static void last_error_set(const char *code){
    char value[48]={0};bool valid=code&&code[0]&&strlen(code)<sizeof(value);
    if(valid)for(const char *p=code;*p;p++)if(!((*p>='a'&&*p<='z')||(*p>='0'&&*p<='9')||*p=='_'))valid=false;
    snprintf(value,sizeof(value),"%s",valid?code:"assistant_failed");
    portENTER_CRITICAL(&s_error_lock);memcpy(s_last_error,value,sizeof(value));portEXIT_CRITICAL(&s_error_lock);
}
static void last_error_clear(void){portENTER_CRITICAL(&s_error_lock);s_last_error[0]=0;portEXIT_CRITICAL(&s_error_lock);}
static void report_state(void){
    char error_code[48];last_error_copy(error_code);
    char line[256];snprintf(line,sizeof(line),"{\"t\":\"assistant\",\"op\":\"state\",\"mode\":\"%s\",\"state\":\"%s\",\"configured\":%d,\"rev\":%lu,\"error_code\":\"%s\"}\n",s_mode?"standalone":"companion",ib_assistant_state_name(s_state),ib_assistant_store_configured(),(unsigned long)ib_assistant_store_revision(false),s_state==IB_ASSIST_ERROR?error_code:"");
    ib_usb_send(line,strlen(line));ib_wifi_send((const uint8_t *)line,strlen(line));
}
static void state(ib_assistant_state_t st,const char *text){if(st==IB_ASSIST_ERROR)last_error_set(text);s_state=st;if(s_status)s_status(st,text?text:"",s_context);report_state();}
bool ib_assistant_standalone(void){return s_mode;}
bool ib_assistant_busy(void){return s_busy;}
ib_assistant_state_t ib_assistant_state(void){return s_state;}
static bool cancelled(void){return s_cancel||!s_mode;}
// 只描述reader采集期；松键/取消立即变灰，不把Flash drain或WSS等待误报为仍在录音。
bool ib_assistant_capture_active(void){return s_mode&&!s_stop&&!cancelled()&&__atomic_load_n(&s_capture_active,__ATOMIC_ACQUIRE);}
static void text_update(const char *text){
    if(cancelled())return;
    if(!ib_reply_store_publish(s_reply_generation,strlen(text)))s_reply_invalid=true;
    if(s_state!=IB_ASSIST_REPLYING)state(IB_ASSIST_REPLYING,text);else if(s_status)s_status(IB_ASSIST_REPLYING,text,s_context);
}
// 采音与Flash写入分任务：6KiB预分配队列约192ms，加I2S DMA90ms覆盖实测140ms写延迟。
// 只允许单producer/consumer；所有退出等写者drain后才释放队列/codec。
static void reader(void *unused){
    (void)unused;int16_t pcm[PCM_BLOCK/2];size_t captured=0;
    size_t max=ib_assistant_profile()->record_limit_seconds*32000u;
    uint32_t overflow_start=bsp_audio_rx_overflows();
    __atomic_store_n(&s_capture_active,true,__ATOMIC_RELEASE);
    while(!s_stop&&!cancelled()&&captured<max){
        if(bsp_audio_read(pcm,sizeof(pcm))!=ESP_OK){s_record_error=true;break;}
        size_t n=max-captured<sizeof(pcm)?max-captured:sizeof(pcm);
        ib_voice_analyze(&s_voice,pcm,n/2);
        if(xStreamBufferSend(s_samples,pcm,n,0)!=n){s_record_ring_overflows++;s_record_error=true;break;}
        size_t queued=xStreamBufferBytesAvailable(s_samples);if(queued>s_ring_peak)s_ring_peak=queued;
        captured+=n;s_capture_overflows=bsp_audio_rx_overflows()-overflow_start;
        if(s_capture_overflows){s_record_error=true;break;}
    }
    __atomic_store_n(&s_capture_active,false,__ATOMIC_RELEASE);
    s_capture_overflows=bsp_audio_rx_overflows()-overflow_start;if(s_capture_overflows)s_record_error=true;
    s_capture_stack_min_bytes=uxTaskGetStackHighWaterMark(NULL);
    s_reader=NULL;__atomic_store_n(&s_capture_done,true,__ATOMIC_RELEASE);vTaskDelete(NULL);
}
static void flash_writer(void *unused){
    (void)unused;uint8_t bytes[1024];size_t written=0;
    while(!__atomic_load_n(&s_capture_done,__ATOMIC_ACQUIRE)||xStreamBufferBytesAvailable(s_samples)){
        size_t n=xStreamBufferReceive(s_samples,bytes,sizeof(bytes),pdMS_TO_TICKS(20));
        if(n&&!s_record_error){
            int64_t started=esp_timer_get_time();
            if(written+n>30u*32000u||esp_partition_write(s_scratch,s_slot*SLOT_SIZE+written,bytes,n)!=ESP_OK){s_record_error=true;s_stop=true;}
            else{written+=n;__atomic_store_n(&s_captured,written,__ATOMIC_RELEASE);}
            uint32_t elapsed=esp_timer_get_time()-started;if(elapsed>s_flash_write_max_us)s_flash_write_max_us=elapsed;
        }
    }
    s_writer_stack_min_bytes=uxTaskGetStackHighWaterMark(NULL);
    __atomic_store_n(&s_record,false,__ATOMIC_RELEASE);xTaskNotifyGive(s_worker);vTaskDelete(NULL);
}
static bool prepare_slot(void){
    state(IB_ASSIST_PREPARING,"PREPARING RECORDING");
    if(esp_partition_erase_range(s_scratch,s_slot*SLOT_SIZE,SLOT_SIZE)!=ESP_OK){state(IB_ASSIST_ERROR,"flash_erase_failed");s_prepare_failed=true;return false;}
    s_prepared=true;return true;
}
static size_t capture_available(void){return __atomic_load_n(&s_captured,__ATOMIC_ACQUIRE);}
static bool capture_recording(void){return __atomic_load_n(&s_record,__ATOMIC_ACQUIRE);}
static bool capture_error(void){return s_record_error;}
static const char *record_realtime(const ib_assistant_profile_t *profile,char *text,size_t cap){
    s_stop=!s_button_held;s_record_error=false;s_capture_overflows=s_flash_write_max_us=s_ring_peak=s_capture_stack_min_bytes=s_writer_stack_min_bytes=s_record_ring_overflows=0;s_captured=0;memset(&s_voice,0,sizeof(s_voice));
    if(!s_prepared)return "recording_not_ready";
    esp_err_t e=ESP_FAIL;for(int i=0;i<20&&!cancelled();i++){e=ib_audio_pcm_begin();if(e==ESP_OK)break;vTaskDelay(pdMS_TO_TICKS(20));}
    if(e!=ESP_OK)return "audio_busy";
    bsp_audio_mute(true); //纯采音期间DAC保持静音，短提示音取消后的旧TX DMA不能漏回麦克风。
    s_samples=xStreamBufferCreate(RECORD_BUFFER,PCM_BLOCK);
    if(!s_samples){ib_audio_pcm_end();return "out_of_memory";}
    s_record=true;s_capture_done=false;s_prepared=false;
    if(xTaskCreate(flash_writer,"ib_asr_flash",2560,NULL,5,NULL)!=pdPASS){s_record=false;vStreamBufferDelete(s_samples);s_samples=NULL;ib_audio_pcm_end();return "out_of_memory";}
    if(xTaskCreate(reader,"ib_asr_capture",3072,NULL,6,&s_reader)!=pdPASS){
        s_capture_done=true;while(capture_recording())vTaskDelay(pdMS_TO_TICKS(10));
        vStreamBufferDelete(s_samples);s_samples=NULL;ib_audio_pcm_end();return "out_of_memory";
    }
    if(++s_transcript_generation==0)++s_transcript_generation;
    (void)transcript_begin(s_transcript_generation);state(IB_ASSIST_LISTENING,"RELEASE OK TO SEND");
    const ib_asr_source_t source={capture_available,capture_recording,capture_error,asr_transcribing,asr_transcript};
    const char *error=ib_asr_realtime_run(profile,s_scratch,s_slot*SLOT_SIZE,&source,text,cap,cancelled);
    s_stop=true;while(capture_recording())vTaskDelay(pdMS_TO_TICKS(10));
    vStreamBufferDelete(s_samples);s_samples=NULL;ib_audio_pcm_end();vTaskDelay(1);
    if(cancelled())return "cancelled";
    if(s_record_error)return "recording_overflow";
    if(error)return error;
    if(s_captured<8000)return "recording_too_short";
    if(!ib_voice_present(&s_voice))return "no_speech";
    return error;
}
static void worker(void *unused){
    (void)unused;
    for(;;){
        while(s_worker_starting&&!s_worker_exit_requested)vTaskDelay(pdMS_TO_TICKS(10));
        if(s_worker_exit_requested||!s_mode){s_worker=NULL;vTaskDelete(NULL);return;}
        if(s_forget){ib_assistant_cloud_clear_history();s_forget=false;}
        if(s_mode&&!s_switching&&!s_busy&&!ib_assistant_store_uploading()&&!s_prepared&&!s_prepare_failed&&ib_assistant_store_configured()){
            if(xSemaphoreTake(s_control,pdMS_TO_TICKS(50))!=pdTRUE)continue;
            if(s_switching||s_worker_exit_requested){xSemaphoreGive(s_control);continue;}
            s_busy=true;
            bool ok=prepare_slot();s_busy=false;xSemaphoreGive(s_control);
            if(ok){
                state(IB_ASSIST_IDLE,"HOLD OK TO TALK");
                if(s_restart_while_held&&s_button_held){s_cancel=s_stop=false;s_press_pending=true;}
                s_restart_while_held=false;
            }
        }
        ulTaskNotifyTake(pdTRUE,pdMS_TO_TICKS(250));
        if(!s_press_pending)continue;
        if(xSemaphoreTake(s_control,pdMS_TO_TICKS(50))!=pdTRUE)continue;
        s_press_pending=false;
        if(!s_mode||s_switching||s_worker_exit_requested||s_busy||ib_assistant_store_uploading()){xSemaphoreGive(s_control);continue;}
        if(!ib_assistant_store_configured()){state(IB_ASSIST_ERROR,"profile_required");xSemaphoreGive(s_control);continue;}
        if(!s_prepared){state(IB_ASSIST_ERROR,"recording_not_ready");xSemaphoreGive(s_control);continue;}
        if(s_notification_hide)(void)s_notification_hide(s_notification_context);
        ib_notification_dismiss();
        s_busy=true;last_error_clear();ib_reply_store_clear(0);transcript_clear(0);xSemaphoreGive(s_control);const char *error=NULL;char *transcript=NULL,*reply=NULL;bool reply_started=false;
        if(!ib_wifi_is_ready())error="wifi_unavailable";
        // 公网TLS前实际退出局域网会话/任务/队列；STA不动，Mac保留通知队列等待重连。
        if(!error&&ib_wifi_companion_set_wait(false,2000)!=ESP_OK)error="companion_busy";
        const ib_assistant_profile_t *p=ib_assistant_profile();
        if(!error){transcript=calloc(1,4096);if(!transcript)error="out_of_memory";}
        if(!error)error=record_realtime(p,transcript,4096);
        if(!error){
            ib_reply_snapshot_t prior;ib_reply_store_snapshot(&prior);s_reply_generation=prior.generation+1;if(!s_reply_generation)s_reply_generation=1;
            error=ib_reply_store_begin(s_reply_generation,&reply);reply_started=!error;s_reply_invalid=false;
        }
        if(!error){state(IB_ASSIST_THINKING,transcript);error=ib_assistant_cloud_reply(p,transcript,reply,4097,cancelled,text_update);}
        if(transcript){memset(transcript,0,4096);free(transcript);transcript=NULL;}
        if(!error&&cancelled())error="cancelled";
        if(!error&&s_reply_invalid)error="invalid_reply";
        if(reply_started){
            if(!ib_reply_store_worker_end(s_reply_generation,!error)&&!error)error=cancelled()?"cancelled":"empty_reply";
            reply=NULL; // 成功时store持有唯一4KiB正文；失败时store已安全释放。
        }
        s_slot=1-s_slot;s_prepared=false;s_record=false;
        (void)ib_wifi_companion_set_wait(true,1000);s_busy=false;
        if(error){transcript_clear(0);state(!strcmp(error,"cancelled")?IB_ASSIST_STOPPED:IB_ASSIST_ERROR,error);}
        else state(IB_ASSIST_DONE,"DONE");
        if(!(s_restart_while_held&&s_button_held))ulTaskNotifyTake(pdTRUE,pdMS_TO_TICKS(1200));
        // 下一槽预擦除在录音之前执行，绝不在采音时擦除Flash。
        if(s_mode&&!s_prepared) xTaskNotifyGive(s_worker);
    }
}
void ib_assistant_press(void){
    s_button_held=true;if(!s_mode)return;
    if(s_switching)return;
    if(!ib_assistant_store_configured()){state(IB_ASSIST_ERROR,"profile_required");return;}
    if(s_busy){s_restart_while_held=true;s_cancel=s_stop=true;ib_audio_pcm_interrupt();ib_assistant_cloud_cancel();ib_asr_realtime_cancel();return;}
    if(!s_prepared){s_restart_while_held=true;s_prepare_failed=false;if(s_worker)xTaskNotifyGive(s_worker);return;}
    s_cancel=false;s_press_pending=true;if(s_worker)xTaskNotifyGive(s_worker);
}
void ib_assistant_release(void){s_button_held=false;s_stop=true;}
void ib_assistant_cancel(void){s_restart_while_held=false;s_cancel=s_stop=true;ib_audio_pcm_interrupt();ib_assistant_cloud_cancel();ib_asr_realtime_cancel();transcript_clear(0);ib_reply_store_clear(0);}
void ib_assistant_clear_history(void){s_forget=true;ib_reply_store_clear(0);transcript_clear(0);if(s_worker)xTaskNotifyGive(s_worker);}
static void companion_present(const char *name,bool has_phase,ib_assistant_state_t phase){
    if(s_mode||s_busy||!s_status)return;
    ib_assistant_state_t st=IB_ASSIST_IDLE;
    if(!strcmp(name,"listening"))st=IB_ASSIST_LISTENING;
    else if(!strcmp(name,"thinking")||!strcmp(name,"working")||!strcmp(name,"searching"))st=IB_ASSIST_THINKING;
    else if(!strcmp(name,"replying")||!strcmp(name,"composing"))st=IB_ASSIST_REPLYING;
    else if(!strcmp(name,"done")||!strcmp(name,"celebrate"))st=IB_ASSIST_DONE;
    else if(!strcmp(name,"error")||!strcmp(name,"alerting"))st=IB_ASSIST_ERROR;
    else if(!strcmp(name,"loading"))st=IB_ASSIST_PREPARING;
    else if(!strcmp(name,"uploading"))st=IB_ASSIST_TRANSCRIBING;
    else if(!strcmp(name,"humming"))st=IB_ASSIST_SPEAKING;
    else if(!strcmp(name,"stopped")||!strcmp(name,"powering-down"))st=IB_ASSIST_STOPPED;
    s_comp_has_phase=has_phase;s_state=has_phase?phase:st;s_status(s_state,name,s_context);
}
void ib_assistant_companion_state(const char *name){if(!s_comp_owner)companion_present(name,false,IB_ASSIST_IDLE);}
void ib_assistant_companion_release(void){
    bool changed=s_comp_owner||s_comp_cloud||s_comp_has_phase||s_comp_error[0];
    s_comp_owner=s_comp_cloud=s_comp_has_phase=false;s_comp_error="";if(changed){transcript_clear(0);ib_reply_store_clear(0);}
    if(changed&&!s_mode&&!s_busy){s_state=IB_ASSIST_IDLE;if(s_status)s_status(s_state,"idle",s_context);}
}
bool ib_assistant_companion_cloud_target(void){return s_comp_cloud;}
bool ib_assistant_companion_owned(void){return s_comp_owner;}
bool ib_assistant_companion_has_phase(void){return s_comp_has_phase;}
const char *ib_assistant_companion_error(void){return s_comp_error;}
static bool uint_field(const cJSON *o,const char *key,uint32_t *v){const cJSON *x=cJSON_GetObjectItemCaseSensitive(o,key);if(!cJSON_IsNumber(x)||x->valuedouble<0||x->valuedouble>4294967295.0||x->valuedouble!=(uint32_t)x->valuedouble)return false;*v=(uint32_t)x->valuedouble;return true;}
bool ib_assistant_mode_busy(void){
    bool active=s_state==IB_ASSIST_PREPARING||s_state==IB_ASSIST_LISTENING||s_state==IB_ASSIST_TRANSCRIBING||s_state==IB_ASSIST_THINKING||s_state==IB_ASSIST_REPLYING||s_state==IB_ASSIST_SPEAKING;
    const ib_hot_mode_activity_t activity={s_switching,s_busy,s_press_pending,s_button_held,ib_audio_mic_active(),!s_mode&&s_comp_owner,s_comp_cloud,s_state==IB_ASSIST_TRANSCRIBING,active};
    return ib_hot_mode_busy(&activity);
}
static bool mode_audio(bool companion,void *ctx){(void)ctx;return ib_audio_set_companion(companion)==ESP_OK;}
static bool mode_worker(bool enabled,void *ctx){
    (void)ctx;
    if(enabled){s_worker_exit_requested=false;if(s_worker)return true;s_worker_starting=true;return start_worker();}
    s_worker_exit_requested=true;s_worker_starting=false;if(s_worker)xTaskNotifyGive(s_worker);
    int64_t deadline=esp_timer_get_time()+2000000;
    while(s_worker&&esp_timer_get_time()<deadline)vTaskDelay(pdMS_TO_TICKS(10));
    if(s_worker)return false;
    vTaskDelay(1);return true;
}
static bool mode_lan(void *ctx){(void)ctx;return ib_wifi_companion_set_wait(true,1000)==ESP_OK;}
static bool mode_save(bool standalone,void *ctx){(void)ctx;return ib_assistant_mode_save(standalone)==ESP_OK;}
static void mode_publish(bool standalone,void *ctx){
    (void)ctx;s_mode=standalone;s_cancel=s_stop=s_press_pending=s_button_held=s_restart_while_held=false;
    s_comp_owner=s_comp_cloud=s_comp_has_phase=false;s_comp_error="";s_prepare_failed=false;
    state(IB_ASSIST_IDLE,"idle");
}
static const char *mode_request_locked(bool standalone){
    static const char *const errors[]={NULL,"unavailable","busy","upload_active","wifi_required","profile_required","restarting"};
    ib_run_mode_check_t check=ib_run_mode_check(s_mode,standalone,s_available,ib_assistant_mode_busy(),ib_assistant_store_uploading(),ib_wifi_is_configured(),ib_assistant_store_configured(),s_restart_requested);
    if(check!=IB_RUN_READY)return errors[check];
    if(s_mode==standalone)return NULL;
    s_switching=true;
    const ib_hot_mode_ops_t ops={mode_audio,mode_worker,mode_lan,mode_save,mode_publish,NULL};
    const char *error=ib_hot_mode_apply(s_mode,standalone,&ops);
    s_worker_starting=false;s_worker_exit_requested=false;s_switching=false;if(s_worker)xTaskNotifyGive(s_worker);
    if(error&&!strcmp(error,"recovery_failed"))state(IB_ASSIST_ERROR,"recovery_failed");
    return error;
}
const char *ib_assistant_request_mode(bool standalone){
    if(!s_control)return "unavailable";
    if(xSemaphoreTake(s_control,pdMS_TO_TICKS(50))!=pdTRUE)return "busy";
    const char *error=mode_request_locked(standalone);xSemaphoreGive(s_control);if(s_worker)xTaskNotifyGive(s_worker);return error;
}
void ib_assistant_maintenance(void){
    if(!s_control||s_busy||ib_audio_mic_active())return;
    if(xSemaphoreTake(s_control,0)!=pdTRUE)return;
    if(!s_busy&&!ib_audio_mic_active()&&ib_assistant_store_apply())(void)ib_assistant_store_cleanup();
    static int64_t retry_at;int64_t now=esp_timer_get_time();
    if(s_notification_upload_deadline&&now>=s_notification_upload_deadline){
        ib_notification_snapshot_t view;ib_notification_snapshot(&view);
        if(view.staging&&(!s_notification_hide||s_notification_hide(s_notification_context)))ib_notification_dismiss();
        ib_notification_snapshot(&view);if(!view.staging)s_notification_upload_deadline=0;
    }
    if(!s_switching&&!s_busy&&ib_wifi_is_configured()&&!ib_wifi_companion_listening()&&now>=retry_at){retry_at=now+5000000;(void)ib_wifi_companion_set_wait(true,500);}
    xSemaphoreGive(s_control);
}
bool ib_assistant_notification_dismiss(void){
    if(!s_control||xSemaphoreTake(s_control,pdMS_TO_TICKS(1000))!=pdTRUE)return false;
    ib_notification_snapshot_t view;ib_notification_snapshot(&view);
    bool hidden=!view.active||!s_notification_hide||s_notification_hide(s_notification_context);
    if(hidden&&view.active)ib_notification_dismiss();
    xSemaphoreGive(s_control);return hidden;
}
esp_err_t ib_assistant_companion_mic_start(ib_link_t link){
    if(!s_control||xSemaphoreTake(s_control,pdMS_TO_TICKS(1000))!=pdTRUE)return ESP_ERR_TIMEOUT;
    esp_err_t error=ESP_OK;ib_notification_snapshot_t view;ib_notification_snapshot(&view);
    if(s_mode||s_switching||s_busy||ib_assistant_store_uploading())error=ESP_ERR_INVALID_STATE;
    else if(view.active&&s_notification_hide&&!s_notification_hide(s_notification_context))error=ESP_ERR_TIMEOUT;
    else{if(view.active)ib_notification_dismiss();error=ib_audio_mic_start(link);}
    xSemaphoreGive(s_control);return error;
}
static bool notification_busy(void){return ib_assistant_mode_busy()||ib_assistant_store_uploading();}
static bool notification_busy_adapter(void *ctx){(void)ctx;return notification_busy();}
static void notification_handle(ib_link_t link,const cJSON *o){
    char response[511];bool locked=s_control&&xSemaphoreTake(s_control,pdMS_TO_TICKS(50))==pdTRUE;
    ib_notification_snapshot_t view;ib_notification_snapshot(&view);uint32_t generation=view.generation;size_t offset=view.offset;
    const ib_notification_wire_ops_t ops={notification_busy_adapter,s_notification_hide,s_notification_apply,s_notification_context};
    bool valid=ib_notification_wire_reply(link,o,locked,&ops,response,sizeof(response));
    if(locked){
        ib_notification_snapshot(&view);
        if(!view.staging)s_notification_upload_deadline=0;
        else if(view.generation!=generation||view.offset!=offset)s_notification_upload_deadline=esp_timer_get_time()+30000000;
    }
    if(locked)xSemaphoreGive(s_control);
    if(valid)reply_to(link,response);
}

bool ib_assistant_handle_line(ib_link_t link,const char *line,size_t length){
    if(!line||length>511)return false;
    cJSON *o=cJSON_ParseWithLength(line,length);if(!o)return false;
    cJSON *command=cJSON_GetObjectItemCaseSensitive(o,"cmd"),*operation=cJSON_GetObjectItemCaseSensitive(o,"op");
    if(!cJSON_IsString(command)){cJSON_Delete(o);return false;}
    if(!strcmp(command->valuestring,"notification")){if(link!=IB_LINK_BLE)notification_handle(link,o);cJSON_Delete(o);return true;}
    if(strcmp(command->valuestring,"assistant")){cJSON_Delete(o);return false;}
    const char *op=cJSON_IsString(operation)?operation->valuestring:"invalid";
    for(const char *p=op;*p;p++)if(!((*p>='a'&&*p<='z')||*p=='_')){op="invalid";break;}
    uint32_t rid=0,reply_request_generation=0;uint_field(o,"rid",&rid);uint_field(o,"generation",&reply_request_generation);
    const char *error=NULL;char response[511];
    if(link==IB_LINK_BLE){cJSON_Delete(o);return true;}
    if(!s_control){cJSON_Delete(o);return true;}
    if(xSemaphoreTake(s_control,pdMS_TO_TICKS(50))!=pdTRUE){error="busy";goto respond;}
    if(!strcmp(op,"chime_status")){
        ib_audio_stats_t st;ib_audio_stats(&st);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"chime_status\",\"rid\":%lu,\"ok\":1,\"queued\":%lu,\"started\":%lu,\"completed\":%lu,\"cancelled\":%lu,\"write_bytes\":%lu,\"write_errors\":%lu,\"codec_errors\":%lu,\"mic_starts\":%lu,\"mic_stack_min_bytes\":%lu,\"tone_stack_min_bytes\":%lu}\n",
            (unsigned long)rid,(unsigned long)st.queued,(unsigned long)st.started,(unsigned long)st.completed,(unsigned long)st.cancelled,(unsigned long)st.write_bytes,(unsigned long)st.write_errors,(unsigned long)st.codec_errors,(unsigned long)st.mic_starts,(unsigned long)st.mic_stack_min_bytes,(unsigned long)st.tone_stack_min_bytes);
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"mode_status")){
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"mode_status\",\"rid\":%lu,\"ok\":1,\"mode\":\"%s\",\"switching\":%d,\"worker\":%d,\"audio_companion\":%d,\"lan_listening\":%d,\"lan_released\":%d,\"ble\":%d}\n",
            (unsigned long)rid,s_mode?"standalone":"companion",s_switching,s_worker!=NULL,ib_audio_companion_enabled(),ib_wifi_companion_listening(),ib_wifi_companion_released(),ib_ble_is_started());
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"asr_diagnostics")){
        ib_asr_diagnostics_t d;ib_asr_realtime_diagnostics(&d);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"asr_diagnostics\",\"rid\":%lu,\"ok\":1,\"port\":%d,\"connect_result\":%d,\"connect_errno\":%d,\"tls_error\":%d,\"tls_stack\":%d,\"tls_flags\":%d,\"http_code\":%d,\"error_type\":%d,\"ws_error\":%d,\"ws_stack\":%d,\"ws_flags\":%d,\"socket_errno\":%d,\"io_stage\":%d,\"io_result\":%d,\"io_errno\":%d}\n",
            (unsigned long)rid,d.connect_port,d.connect_result,d.connect_errno,d.tls_error,d.tls_stack,d.tls_flags,d.http_code,d.error_type,d.ws_error,d.ws_stack,d.ws_flags,d.socket_errno,d.io_stage,d.io_result,d.io_errno);
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"reply_status")){
        // 只读元数据，不读正文、不触碰LVGL；后台预擦除不改变这些保留状态。
        ib_reply_snapshot_t view;ib_reply_store_snapshot(&view);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"reply_status\",\"rid\":%lu,\"ok\":1,\"generation\":%lu,\"revision\":%lu,\"length\":%u,\"active\":%d,\"final\":%d,\"state\":\"%s\",\"capture_active\":%d}\n",
            (unsigned long)rid,(unsigned long)view.generation,(unsigned long)view.revision,(unsigned)view.length,view.active,view.final,ib_assistant_state_name(s_state),ib_assistant_capture_active());
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"asr_status")){
        ib_asr_stats_t stats;ib_asr_realtime_stats(&stats);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"asr_status\",\"rid\":%lu,\"ok\":1,\"sent\":%lu,\"messages\":%lu,\"partials\":%lu,\"finals\":%lu,\"connect_ms\":%lu,\"first_partial_ms\":%lu,\"heap_min\":%lu,\"largest_min\":%lu,\"ws_stack_min_bytes\":%lu,\"send_max_ms\":%lu,\"task_started\":%d,\"task_finished\":%d,\"dma_overflows\":%lu,\"capture_stack_min_bytes\":%lu,\"writer_stack_min_bytes\":%lu,\"capture_capacity\":6144,\"ring_overflows\":%lu}\n",
            (unsigned long)rid,(unsigned long)stats.sent_bytes,(unsigned long)stats.messages,(unsigned long)stats.partials,(unsigned long)stats.sentences,(unsigned long)stats.connect_ms,(unsigned long)stats.first_partial_ms,(unsigned long)stats.heap_min,(unsigned long)stats.largest_min,(unsigned long)stats.ws_stack_min_bytes,(unsigned long)stats.send_max_ms,stats.task_started,stats.task_finished,(unsigned long)s_capture_overflows,(unsigned long)s_capture_stack_min_bytes,(unsigned long)s_writer_stack_min_bytes,(unsigned long)s_record_ring_overflows);
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"audio_status")){
        ib_tts_stats_t stats;ib_tts_player_stats(&stats);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"audio_status\",\"rid\":%lu,\"ok\":1,\"capacity\":4096,\"prebuffer\":3072,\"dma_ms\":90,\"received\":%lu,\"written\":%lu,\"q_peak\":%lu,\"q_low\":%lu,\"startup_ms\":%lu,\"net_wait_ms\":%lu,\"write_gap_ms\":%lu,\"write_ms\":%lu,\"starves\":%lu,\"starve_ms\":%lu,\"write_errors\":%lu,\"cancelled\":%lu,\"stack_min_bytes\":%lu}\n",
            (unsigned long)rid,(unsigned long)stats.received_bytes,(unsigned long)stats.written_bytes,(unsigned long)stats.queue_peak,(unsigned long)stats.queue_low,(unsigned long)stats.startup_ms,(unsigned long)stats.net_wait_max_ms,(unsigned long)stats.write_gap_max_ms,(unsigned long)stats.write_max_ms,(unsigned long)stats.starves,(unsigned long)stats.starve_ms,(unsigned long)stats.write_errors,(unsigned long)stats.cancelled,(unsigned long)stats.consumer_stack_min_bytes);
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"status")){
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"status\",\"rid\":%lu,\"ok\":1,\"mode\":\"%s\",\"state\":\"%s\",\"configured\":%d,\"rev\":%lu,\"pet_rev\":%lu,\"heap\":%u,\"min_free\":%u,\"largest\":%u,\"record_bytes\":%u,\"record_error\":%d,\"overflows\":%lu,\"ring_peak\":%lu,\"flash_write_max_us\":%lu,\"voice_blocks\":%lu,\"voice_peak\":%u,\"pet_ms\":%lu,\"app_ready\":%d,\"wifi_configured\":%d,\"wifi_ready\":%d,\"ble\":%d,\"buttons\":%d,\"pet_last_ms\":%lu,\"lvgl_peak\":%lu}\n",
            (unsigned long)rid,s_mode?"standalone":"companion",ib_assistant_state_name(s_state),ib_assistant_store_configured(),
            (unsigned long)ib_assistant_store_revision(false),(unsigned long)ib_assistant_store_revision(true),
            (unsigned)heap_caps_get_free_size(MALLOC_CAP_8BIT),(unsigned)heap_caps_get_minimum_free_size(MALLOC_CAP_8BIT),(unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_8BIT),
            (unsigned)s_captured,s_record_error,(unsigned long)s_capture_overflows,(unsigned long)s_ring_peak,(unsigned long)s_flash_write_max_us,(unsigned long)s_voice.voiced_blocks,s_voice.peak,(unsigned long)ib_ui_pet_max_frame_ms(),ib_app_ready(),ib_wifi_is_configured(),ib_wifi_is_ready(),ib_ble_is_started(),ib_app_buttons_ready(),(unsigned long)ib_ui_pet_last_frame_ms(),(unsigned long)ib_ui_lvgl_peak_bytes());
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!strcmp(op,"capabilities")){
        char last_error[48];last_error_copy(last_error);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"%s\",\"rid\":%lu,\"ok\":1,\"schema\":1,\"profile_schema\":2,\"asr\":\"doubao-realtime\",\"transcript\":1,\"tts\":0,\"reply_text\":1,\"display_ready\":%d,\"retired_clean\":%d,\"single_pet\":1,\"max\":16384,\"pet_max\":131072,\"pet_format\":\"aora-bundle-v2\",\"chunk\":288,\"profile\":1,\"pet\":1,\"standalone\":%d,\"run_menu\":1,\"hot_mode\":1,\"owner\":%d,\"mode\":\"%s\",\"state\":\"%s\",\"configured\":%d,\"rev\":%lu,\"pet_rev\":%lu,\"last_error\":\"%s\"}\n",op,(unsigned long)rid,ib_app_display_ready(),ib_assistant_store_retired_clean(),s_available,s_comp_owner,s_mode?"standalone":"companion",ib_assistant_state_name(s_state),ib_assistant_store_configured(),(unsigned long)ib_assistant_store_revision(false),(unsigned long)ib_assistant_store_revision(true),last_error);
        xSemaphoreGive(s_control);reply_to(link,response);cJSON_Delete(o);return true;
    }
    if(!s_available)error="unavailable";
    else if(!strcmp(op,"pet_state")){
        cJSON *value=cJSON_GetObjectItemCaseSensitive(o,"value"),*target=cJSON_GetObjectItemCaseSensitive(o,"target"),*phase=cJSON_GetObjectItemCaseSensitive(o,"phase"),*detail=cJSON_GetObjectItemCaseSensitive(o,"error");
        static const char *const phases[]={"idle","preparing","recording","transcribing","thinking","replying","completed","failed","stopped","speaking"};
        int selected=-1;if(cJSON_IsString(phase))for(unsigned i=0;i<sizeof(phases)/sizeof(phases[0]);i++)if(!strcmp(phase->valuestring,phases[i]))selected=i;
        if(s_mode||s_busy)error="busy";
        else if(!cJSON_IsString(value)||!ib_pet_state_is_valid(value->valuestring))error="invalid_state";
        else if(target&&(!cJSON_IsString(target)||(strcmp(target->valuestring,"cloud")&&strcmp(target->valuestring,"application"))))error="invalid_target";
        else if(phase&&selected<0)error="invalid_phase";
        else if(detail&&(!cJSON_IsString(detail)||(detail->valuestring[0]&&strcmp(detail->valuestring,"check_mac"))))error="invalid_error";
        else{
            s_comp_owner=target!=NULL;s_comp_cloud=target&&!strcmp(target->valuestring,"cloud");
            s_comp_error=detail&&detail->valuestring[0]?"check_mac":"";
            if(selected==IB_ASSIST_LISTENING){if(s_notification_hide)(void)s_notification_hide(s_notification_context);ib_notification_dismiss();}
            if(selected==IB_ASSIST_ERROR||selected==IB_ASSIST_STOPPED){transcript_clear(0);ib_reply_store_clear(0);}
            companion_present(value->valuestring,phase!=NULL,selected>=0?(ib_assistant_state_t)selected:IB_ASSIST_IDLE);
        }

    }else if(!strcmp(op,"transcript_begin")||!strcmp(op,"transcript_update")||!strcmp(op,"transcript_clear")){
        uint32_t generation=0;
        if(s_mode||s_busy)error="busy";
        else if(!uint_field(o,"generation",&generation)||(!generation&&strcmp(op,"transcript_clear")))error="invalid_generation";
        else if(!strcmp(op,"transcript_begin")){if(!transcript_begin(generation))error="stale_generation";}
        else if(!strcmp(op,"transcript_clear"))transcript_clear(generation);
        else{
            cJSON *value=cJSON_GetObjectItemCaseSensitive(o,"text"),*final=cJSON_GetObjectItemCaseSensitive(o,"final");uint32_t numeric=0;
            bool valid_final=cJSON_IsBool(final)||uint_field(o,"final",&numeric);
            if(!cJSON_IsString(value)||strlen(value->valuestring)>IB_TRANSCRIPT_VIEW_BYTES||!valid_final||(!cJSON_IsBool(final)&&numeric>1))error="invalid_transcript";
            else if(!transcript_update(generation,value->valuestring,cJSON_IsBool(final)?cJSON_IsTrue(final):numeric==1))error="stale_generation";
        }
    }else if(!strcmp(op,"reply_begin")||!strcmp(op,"reply_update")||!strcmp(op,"reply_final")||!strcmp(op,"reply_clear")){
        uint32_t generation=0;
        if(s_mode||s_busy)error="busy";
        else if(!uint_field(o,"generation",&generation)||(!generation&&strcmp(op,"reply_clear")))error="invalid_generation";
        else if(!strcmp(op,"reply_begin"))error=ib_reply_store_begin(generation,NULL);
        else if(!strcmp(op,"reply_clear")){ib_reply_store_clear(generation);if(s_reply_apply&&!s_reply_apply(s_reply_apply_context))error="reply_pending";}
        else if(!strcmp(op,"reply_final")){
            uint32_t size=0;if(!uint_field(o,"size",&size)||size>IB_REPLY_TEXT_MAX)error="invalid_size";
            else{error=ib_reply_store_final(generation,size);if(!error&&(!s_reply_apply||!s_reply_apply(s_reply_apply_context)))error="reply_pending";}
        }else{
            cJSON *value=cJSON_GetObjectItemCaseSensitive(o,"text");uint32_t offset=0;
            if(!cJSON_IsString(value)||!uint_field(o,"off",&offset))error="invalid_reply";
            else error=ib_reply_store_append(generation,offset,value->valuestring,strlen(value->valuestring));
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
        else error=mode_request_locked(!strcmp(v->valuestring,"standalone"));

    }else error="unknown_operation";
    xSemaphoreGive(s_control);
respond:
    if(!strncmp(op,"reply_",6)){
        ib_reply_snapshot_t view;ib_reply_store_snapshot(&view);
        snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"%s\",\"rid\":%lu,\"ok\":%d,\"generation\":%lu,\"off\":%u,\"final\":%d,\"error\":\"%s\"}\n",strlen(op)<24?op:"invalid",(unsigned long)rid,error?0:1,(unsigned long)reply_request_generation,(unsigned)view.length,view.final,error?error:"");
        reply_to(link,response);cJSON_Delete(o);return true;
    }
    bool upload_op=!strcmp(op,"begin")||!strcmp(op,"chunk")||!strcmp(op,"commit");
    snprintf(response,sizeof(response),"{\"t\":\"assistant\",\"op\":\"%s\",\"rid\":%lu,\"ok\":%d,\"mode\":\"%s\",\"configured\":%d,\"rev\":%lu,\"pet_rev\":%lu,\"off\":%u,\"restarting\":%d,\"owner\":%d,\"retired_clean\":%d,\"error\":\"%s\"}\n",strlen(op)<24?op:"invalid",(unsigned long)rid,error?0:1,s_mode?"standalone":"companion",ib_assistant_store_configured(),(unsigned long)(upload_op?ib_assistant_store_upload_revision():ib_assistant_store_revision(false)),(unsigned long)ib_assistant_store_revision(true),(unsigned)ib_assistant_store_offset(),s_restart_requested,s_comp_owner,ib_assistant_store_retired_clean(),error?error:"");
    reply_to(link,response);cJSON_Delete(o);if(s_worker)xTaskNotifyGive(s_worker);return true;
}
esp_err_t ib_assistant_init(ib_assistant_status_cb cb,void *context){
    ib_assistant_cloud_init();ib_asr_realtime_init();
    s_status=cb;s_context=context;s_control=xSemaphoreCreateMutex();if(!s_control)return ESP_ERR_NO_MEM;
    esp_err_t e=ib_assistant_store_ready()?ESP_OK:ib_assistant_store_init();if(e!=ESP_OK)return e;
    s_scratch=esp_partition_find_first(ESP_PARTITION_TYPE_DATA,0x42,"audio_scratch");
    if(!s_scratch||s_scratch->size!=2*SLOT_SIZE||s_scratch->address<0x35A000)return ESP_ERR_INVALID_SIZE;
    s_available=true;s_mode=ib_assistant_mode_load();ib_wifi_set_companion_enabled(true);
    if(s_mode&&!start_worker()){s_available=false;s_mode=false;ib_wifi_set_companion_enabled(true);return ESP_ERR_NO_MEM;}
    if(s_mode&&!ib_assistant_store_configured())state(IB_ASSIST_ERROR,"profile_required");
    return ESP_OK;
}

void ib_assistant_leave_standalone(void){(void)ib_assistant_request_mode(false);}

bool ib_assistant_take_restart_request(void){return s_restart_requested;}
