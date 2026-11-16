// 真实pthread调度生产音频模块，BSP替身记录codec所有权和PCM写入；不模拟I2S DMA或真实堆碎片。
#define _POSIX_C_SOURCE 200809L
#include "test_common.h"
#include "ib_audio.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"
#include "freertos/event_groups.h"
#include <stdatomic.h>
#include <stdlib.h>
#include <time.h>
#include <errno.h>
struct fake_semaphore {pthread_mutex_t mutex;};
struct fake_events {pthread_mutex_t mutex;pthread_cond_t changed;EventBits_t bits;};
struct fake_queue {pthread_mutex_t mutex;bool full;size_t size;unsigned char bytes[16];};
struct fake_task {pthread_t thread;void (*fn)(void *);void *arg;};
static struct fake_task *tasks[256];static unsigned task_count,allocations,fail_allocation,base_live;
static atomic_uint live_tasks,reads,writes,frames,bytes;
static atomic_bool opened,reading,writing,muted,fail_task,fail_format,fail_write;
static void pause_ms(unsigned ms){struct timespec t={ms/1000,(long)(ms%1000)*1000000};while(nanosleep(&t,&t)&&errno==EINTR){}}
static struct timespec deadline(unsigned ms){struct timespec t;clock_gettime(CLOCK_REALTIME,&t);t.tv_sec+=ms/1000;t.tv_nsec+=(ms%1000)*1000000;if(t.tv_nsec>=1000000000){t.tv_sec++;t.tv_nsec-=1000000000;}return t;}
static bool allocation_failed(void){return ++allocations==fail_allocation;}
void vTaskDelay(TickType_t ms){pause_ms(ms);}
void vTaskDelete(TaskHandle_t task){(void)task;pthread_exit(NULL);}
UBaseType_t uxTaskGetStackHighWaterMark(TaskHandle_t task){(void)task;return 1664;}
static void exited(void *ctx){(void)ctx;atomic_fetch_sub(&live_tasks,1);}
static void *entry(void *arg){struct fake_task *t=arg;pthread_cleanup_push(exited,NULL);t->fn(t->arg);pthread_cleanup_pop(1);return NULL;}
BaseType_t xTaskCreate(void (*fn)(void *),const char *name,uint32_t stack,void *arg,unsigned priority,TaskHandle_t *handle){
    (void)name;CHECK(priority==6);CHECK(stack==3072||stack==2560);if(atomic_load(&fail_task))return pdFALSE;
    struct fake_task *t=calloc(1,sizeof(*t));CHECK(t);t->fn=fn;t->arg=arg;if(handle)*handle=t;
    CHECK(task_count<256);tasks[task_count++]=t;atomic_fetch_add(&live_tasks,1);CHECK(!pthread_create(&t->thread,NULL,entry,t));return pdPASS;
}
SemaphoreHandle_t xSemaphoreCreateMutex(void){if(allocation_failed())return NULL;struct fake_semaphore *s=calloc(1,sizeof(*s));CHECK(s);pthread_mutex_init(&s->mutex,NULL);base_live++;return s;}
BaseType_t xSemaphoreTake(SemaphoreHandle_t s,TickType_t wait){(void)wait;return pthread_mutex_lock(&s->mutex)==0?pdTRUE:pdFALSE;}
BaseType_t xSemaphoreGive(SemaphoreHandle_t s){return pthread_mutex_unlock(&s->mutex)==0?pdTRUE:pdFALSE;}
void vSemaphoreDelete(SemaphoreHandle_t s){pthread_mutex_destroy(&s->mutex);free(s);base_live--;}
EventGroupHandle_t xEventGroupCreate(void){if(allocation_failed())return NULL;struct fake_events *e=calloc(1,sizeof(*e));CHECK(e);pthread_mutex_init(&e->mutex,NULL);pthread_cond_init(&e->changed,NULL);base_live++;return e;}
EventBits_t xEventGroupSetBits(EventGroupHandle_t e,EventBits_t bits){pthread_mutex_lock(&e->mutex);e->bits|=bits;EventBits_t out=e->bits;pthread_cond_broadcast(&e->changed);pthread_mutex_unlock(&e->mutex);return out;}
EventBits_t xEventGroupClearBits(EventGroupHandle_t e,EventBits_t bits){pthread_mutex_lock(&e->mutex);EventBits_t out=e->bits;e->bits&=~bits;pthread_mutex_unlock(&e->mutex);return out;}
EventBits_t xEventGroupWaitBits(EventGroupHandle_t e,EventBits_t bits,BaseType_t clear,BaseType_t all,TickType_t wait){pthread_mutex_lock(&e->mutex);struct timespec until=deadline(wait);int result=0;while((all?(e->bits&bits)!=bits:!(e->bits&bits))&&!result)result=pthread_cond_timedwait(&e->changed,&e->mutex,&until);EventBits_t out=e->bits;if(clear)e->bits&=~bits;pthread_mutex_unlock(&e->mutex);return out;}
void vEventGroupDelete(EventGroupHandle_t e){pthread_cond_destroy(&e->changed);pthread_mutex_destroy(&e->mutex);free(e);base_live--;}
QueueHandle_t xQueueCreate(unsigned capacity,size_t size){CHECK(capacity==1&&size<=16);if(allocation_failed())return NULL;struct fake_queue *q=calloc(1,sizeof(*q));CHECK(q);q->size=size;pthread_mutex_init(&q->mutex,NULL);base_live++;return q;}
BaseType_t xQueueOverwrite(QueueHandle_t q,const void *p){pthread_mutex_lock(&q->mutex);memcpy(q->bytes,p,q->size);q->full=true;pthread_mutex_unlock(&q->mutex);return pdTRUE;}
BaseType_t xQueueReceive(QueueHandle_t q,void *p,TickType_t timeout){CHECK(timeout==0);pthread_mutex_lock(&q->mutex);bool got=q->full;if(got){memcpy(p,q->bytes,q->size);q->full=false;}pthread_mutex_unlock(&q->mutex);return got?pdTRUE:pdFALSE;}
BaseType_t xQueueReset(QueueHandle_t q){pthread_mutex_lock(&q->mutex);q->full=false;pthread_mutex_unlock(&q->mutex);return pdTRUE;}
void vQueueDelete(QueueHandle_t q){pthread_mutex_destroy(&q->mutex);free(q);base_live--;}
esp_err_t bsp_audio_init(void){return ESP_OK;}
esp_err_t bsp_audio_set_format(uint32_t hz,uint8_t bits,uint8_t channels){CHECK(hz==16000&&bits==16&&channels==1);if(atomic_load(&fail_format))return ESP_FAIL;CHECK(!atomic_exchange(&opened,true));return ESP_OK;}
void bsp_audio_set_volume(uint8_t v){CHECK(v==65);}
void bsp_audio_mute(bool value){atomic_store(&muted,value);}
esp_err_t bsp_audio_close(void){CHECK(!atomic_load(&reading)&&!atomic_load(&writing));CHECK(atomic_exchange(&opened,false));return ESP_OK;}
esp_err_t bsp_audio_read(void *pcm,size_t n){CHECK(atomic_load(&opened)&&!atomic_load(&writing));atomic_store(&reading,true);pause_ms(20);memset(pcm,0,n);atomic_fetch_add(&reads,1);atomic_store(&reading,false);return ESP_OK;}
esp_err_t bsp_audio_write(const void *pcm,size_t n){(void)pcm;CHECK(atomic_load(&opened)&&!atomic_load(&reading));atomic_store(&writing,true);pause_ms((unsigned)(n*1000/32000));atomic_fetch_add(&writes,1);bool fail=atomic_load(&fail_write);if(!fail)atomic_fetch_add(&bytes,(unsigned)n);atomic_store(&writing,false);return fail?ESP_FAIL:ESP_OK;}
static void tx(ib_link_t link,const uint8_t *frame,size_t n){CHECK(link==IB_LINK_USB);CHECK(frame&&n>6);atomic_fetch_add(&frames,1);}
static void wait_counter(atomic_uint *counter,unsigned n){for(unsigned i=0;i<500&&atomic_load(counter)<n;i++)pause_ms(2);CHECK(atomic_load(counter)>=n);}
static void idle(void){for(unsigned i=0;i<1000&&atomic_load(&live_tasks);i++)pause_ms(2);CHECK(!atomic_load(&live_tasks));for(unsigned i=0;i<task_count;i++){CHECK(!pthread_join(tasks[i]->thread,NULL));free(tasks[i]);}task_count=0;CHECK(!atomic_load(&opened));}
int main(int argc,char **argv){
    if(argc>1){fail_allocation=(unsigned)atoi(argv[1]);CHECK(ib_audio_init_mode(tx,false)==ESP_ERR_NO_MEM);CHECK(base_live==0);TEST_DONE("audio_alloc_cleanup");return 0;}
    CHECK(ib_audio_init_mode(tx,false)==ESP_OK);CHECK(base_live==3&&!atomic_load(&live_tasks));CHECK(!ib_audio_companion_enabled());CHECK(ib_audio_mic_start(IB_LINK_USB)==ESP_ERR_INVALID_STATE);
    for(unsigned i=0;i<32;i++){CHECK(ib_audio_set_companion(true)==ESP_OK);CHECK(ib_audio_set_companion(false)==ESP_OK);}CHECK(!atomic_load(&live_tasks)); //模式切换本身不留下常驻栈。
    CHECK(ib_audio_set_companion(true)==ESP_OK);atomic_store(&fail_task,true);CHECK(ib_audio_mic_start(IB_LINK_USB)==ESP_ERR_NO_MEM);CHECK(!ib_audio_mic_active()&&!atomic_load(&opened));atomic_store(&fail_task,false);
    CHECK(ib_audio_mic_start(IB_LINK_USB)==ESP_OK);wait_counter(&frames,1);CHECK(atomic_load(&muted));CHECK(ib_audio_set_companion(false)==ESP_OK);CHECK(!ib_audio_mic_active());idle();
    unsigned before=atomic_load(&writes);CHECK(ib_audio_play(IB_SOUND_DONE));wait_counter(&writes,before+2);CHECK(ib_audio_pcm_begin()==ESP_OK);CHECK(!ib_audio_play(IB_SOUND_DONE));unsigned at=atomic_load(&writes);pause_ms(40);CHECK(atomic_load(&writes)==at);ib_audio_pcm_end();idle();
    atomic_store(&fail_task,true);CHECK(!ib_audio_play(IB_SOUND_DONE));atomic_store(&fail_task,false);CHECK(ib_audio_play(IB_SOUND_DONE));idle();
    atomic_store(&fail_write,true);CHECK(ib_audio_play(IB_SOUND_DONE));idle();atomic_store(&fail_write,false);
    atomic_store(&fail_format,true);CHECK(ib_audio_set_companion(true)==ESP_OK);CHECK(ib_audio_mic_start(IB_LINK_USB)==ESP_FAIL);CHECK(!ib_audio_mic_active());atomic_store(&fail_format,false);
    for(unsigned i=0;i<8;i++){CHECK(ib_audio_set_companion(true)==ESP_OK);CHECK(ib_audio_mic_start(IB_LINK_USB)==ESP_OK);pause_ms(25);CHECK(ib_audio_set_companion(false)==ESP_OK);idle();}
    ib_audio_stats_t stats;ib_audio_stats(&stats);CHECK(stats.queued==3&&stats.started==3&&stats.cancelled>=2&&stats.completed==1&&stats.write_errors==1);CHECK(stats.write_bytes==atomic_load(&bytes));CHECK(stats.mic_starts==9&&stats.mic_stack_min_bytes==1664&&stats.tone_stack_min_bytes==1664);CHECK(base_live==3);
    TEST_DONE("audio_runtime");
}
