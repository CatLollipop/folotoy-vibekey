#include "ib_tts_player.h"
#include "bsp_audio.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/stream_buffer.h"
#include <stdlib.h>
#include <string.h>
#define QUEUE_BYTES 4096u
#define PREBUFFER_BYTES 3072u
#define BLOCK_BYTES 640u
#define DMA_MS 90u
#define PLAYER_STACK 2560u
// 6个DMA描述符×240帧/16kHz=90ms；超过此供给空窗才记软件starve，非硬件ISR计数。
typedef struct {
    StreamBufferHandle_t queue;
    SemaphoreHandle_t exited;
    ib_tts_cancel_cb cancel;
    volatile bool stop,producer_done;
    const char *error;
    int64_t started;
} player_t;
static player_t *s_player;
static ib_tts_stats_t s_stats;
static portMUX_TYPE s_stats_lock=portMUX_INITIALIZER_UNLOCKED;
static uint32_t elapsed_ms(int64_t from){return (uint32_t)((esp_timer_get_time()-from)/1000);}
static bool stopping(const player_t *p){return p->stop||p->cancel();}
static void maximum(uint32_t *field,uint32_t value){portENTER_CRITICAL(&s_stats_lock);if(value>*field)*field=value;portEXIT_CRITICAL(&s_stats_lock);}
static void player_task(void *context){
    player_t *p=context;uint8_t block[BLOCK_BYTES];bool played=false,in_starve=false;int64_t last_write=0,starve_start=0;
    // 等足够的云端PCM再开播；短音频在producer_done时直接播放，不死等门限。
    while(!stopping(p)&&!p->producer_done&&xStreamBufferBytesAvailable(p->queue)<PREBUFFER_BYTES)vTaskDelay(pdMS_TO_TICKS(10));
    while(!stopping(p)){
        size_t available=xStreamBufferBytesAvailable(p->queue);
        if(p->producer_done&&!available)break;
        if(played&&!p->producer_done){portENTER_CRITICAL(&s_stats_lock);if(available<s_stats.queue_low)s_stats.queue_low=available;portEXIT_CRITICAL(&s_stats_lock);}
        size_t n=xStreamBufferReceive(p->queue,block,sizeof(block),pdMS_TO_TICKS(20));
        int64_t now=esp_timer_get_time();
        if(!n){
            if(played&&!p->producer_done&&!in_starve&&elapsed_ms(last_write)>DMA_MS){
                in_starve=true;starve_start=last_write+DMA_MS*INT64_C(1000);
                portENTER_CRITICAL(&s_stats_lock);s_stats.starves++;portEXIT_CRITICAL(&s_stats_lock);
            }
            continue;
        }
        if(in_starve){portENTER_CRITICAL(&s_stats_lock);s_stats.starve_ms+=(now-starve_start)/1000;portEXIT_CRITICAL(&s_stats_lock);in_starve=false;}
        if(n&1){p->error="invalid_audio";p->stop=true;break;}
        if(!played){portENTER_CRITICAL(&s_stats_lock);s_stats.startup_ms=elapsed_ms(p->started);portEXIT_CRITICAL(&s_stats_lock);}
        else maximum(&s_stats.write_gap_max_ms,(now-last_write)/1000);
        int64_t before=esp_timer_get_time();
        if(bsp_audio_write(block,n)!=0){p->error="playback_write_failed";p->stop=true;portENTER_CRITICAL(&s_stats_lock);s_stats.write_errors++;portEXIT_CRITICAL(&s_stats_lock);break;}
        maximum(&s_stats.write_max_ms,elapsed_ms(before));last_write=esp_timer_get_time();played=true;
        portENTER_CRITICAL(&s_stats_lock);s_stats.written_bytes+=n;portEXIT_CRITICAL(&s_stats_lock);
    }
    if(in_starve){portENTER_CRITICAL(&s_stats_lock);s_stats.starve_ms+=elapsed_ms(starve_start);portEXIT_CRITICAL(&s_stats_lock);}
    // 成功时等最后一段DMA播完；cancel立刻静音由audio所有者完成，这里每10ms退出。
    if(played&&p->producer_done&&!stopping(p)&&!p->error){
        int64_t tail=esp_timer_get_time();while(!stopping(p)&&elapsed_ms(tail)<DMA_MS+20)vTaskDelay(pdMS_TO_TICKS(10));
    }
    if(p->cancel()){portENTER_CRITICAL(&s_stats_lock);s_stats.cancelled=1;portEXIT_CRITICAL(&s_stats_lock);}
    uint32_t stack_min=uxTaskGetStackHighWaterMark(NULL);
    portENTER_CRITICAL(&s_stats_lock);s_stats.consumer_stack_min_bytes=stack_min;portEXIT_CRITICAL(&s_stats_lock);
    xSemaphoreGive(p->exited);vTaskDelete(NULL);
}
const char *ib_tts_player_start(ib_tts_cancel_cb cancel){
    if(!cancel)return "invalid_request";
    if(s_player)return "audio_busy";
    player_t *p=calloc(1,sizeof(*p));if(!p)return "out_of_memory";
    p->cancel=cancel;p->started=esp_timer_get_time();p->queue=xStreamBufferCreate(QUEUE_BYTES,1);p->exited=xSemaphoreCreateBinary();
    portENTER_CRITICAL(&s_stats_lock);memset(&s_stats,0,sizeof(s_stats));s_stats.queue_low=QUEUE_BYTES;portEXIT_CRITICAL(&s_stats_lock);
    if(!p->queue||!p->exited||xTaskCreate(player_task,"ib_tts_play",PLAYER_STACK,p,6,NULL)!=pdPASS){
        if(p->queue)vStreamBufferDelete(p->queue);
        if(p->exited)vSemaphoreDelete(p->exited);
        free(p);return "out_of_memory";
    }
    s_player=p;return NULL;
}
bool ib_tts_player_push(const uint8_t *bytes,size_t n){
    player_t *p=s_player;if(!p||(n&1))return false;
    while(n&&!stopping(p)){
        size_t before=xStreamBufferBytesAvailable(p->queue);size_t sent=xStreamBufferSend(p->queue,bytes,n,pdMS_TO_TICKS(20));
        if(sent){maximum(&s_stats.queue_peak,before+sent>QUEUE_BYTES?QUEUE_BYTES:before+sent);portENTER_CRITICAL(&s_stats_lock);s_stats.received_bytes+=sent;portEXIT_CRITICAL(&s_stats_lock);bytes+=sent;n-=sent;}
    }return n==0;
}
void ib_tts_player_network_wait(uint32_t ms){maximum(&s_stats.net_wait_max_ms,ms);}
const char *ib_tts_player_finish(bool drain){
    player_t *p=s_player;if(!p)return NULL;
    if(!drain)p->stop=true;
    p->producer_done=true;
    // 消费者确认不再读队列/写I2S后，才允许下一轮录音或释放内存。
    xSemaphoreTake(p->exited,portMAX_DELAY);const char *error=p->error;
    vStreamBufferDelete(p->queue);vSemaphoreDelete(p->exited);s_player=NULL;free(p);return error;
}
void ib_tts_player_stats(ib_tts_stats_t *stats){portENTER_CRITICAL(&s_stats_lock);*stats=s_stats;portEXIT_CRITICAL(&s_stats_lock);}
