// pthread运行器只替代调度/I2S，测试生产player的预缓冲、背压、取消与资源生命周期。
#include "test_common.h"
#include "ib_tts_player.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/stream_buffer.h"
#include "esp_timer.h"
#include <errno.h>
#include <stdatomic.h>
#include <stdlib.h>
#include <time.h>

struct fake_semaphore {pthread_mutex_t lock;pthread_cond_t changed;bool ready;};
struct fake_stream {pthread_mutex_t lock;pthread_cond_t readable,writable;uint8_t *bytes;size_t capacity,used,head;};
static pthread_mutex_t fake_lock=PTHREAD_MUTEX_INITIALIZER;
static pthread_t tasks[64];
static size_t task_count,live_streams,live_semaphores,live_tasks,max_stream_used;
static bool fail_stream,fail_semaphore,fail_task;
static unsigned last_task_priority;
static uint32_t last_task_stack;
static pthread_mutex_t sink_lock=PTHREAD_MUTEX_INITIALIZER;
static uint8_t sink[65536];
static size_t sink_used,write_calls;
static unsigned fail_write_number;
static bool emulate_audio_clock;
static atomic_bool cancel_flag;

static void sleep_us(int64_t us){
    struct timespec t={.tv_sec=us/1000000,.tv_nsec=(us%1000000)*1000};
    while(nanosleep(&t,&t)<0&&errno==EINTR){}
}
int64_t esp_timer_get_time(void){struct timespec t;clock_gettime(CLOCK_MONOTONIC,&t);return t.tv_sec*INT64_C(1000000)+t.tv_nsec/1000;}
void vTaskDelay(TickType_t ms){sleep_us((int64_t)ms*1000);}
void vTaskDelete(TaskHandle_t unused){(void)unused;pthread_exit(NULL);}
// 固定哨兵只验证统计传递，不模拟ESP32真实栈消耗。
UBaseType_t uxTaskGetStackHighWaterMark(TaskHandle_t unused){(void)unused;return 1728;}
static void task_exited(void *unused){(void)unused;pthread_mutex_lock(&fake_lock);live_tasks--;pthread_mutex_unlock(&fake_lock);}
struct task_start {void (*function)(void *);void *context;};
static void *task_entry(void *context){
    struct task_start start=*(struct task_start *)context;free(context);
    pthread_cleanup_push(task_exited,NULL);
    start.function(start.context);
    pthread_cleanup_pop(1);
    return NULL;
}
BaseType_t xTaskCreate(void (*function)(void *),const char *name,uint32_t stack,void *context,unsigned priority,TaskHandle_t *handle){
    (void)name;(void)handle;last_task_priority=priority;last_task_stack=stack;
    if(fail_task)return pdFALSE;
    struct task_start *start=malloc(sizeof(*start));if(!start)return pdFALSE;
    *start=(struct task_start){function,context};
    pthread_mutex_lock(&fake_lock);size_t index=task_count;live_tasks++;pthread_mutex_unlock(&fake_lock);
    if(pthread_create(&tasks[index],NULL,task_entry,start)){free(start);pthread_mutex_lock(&fake_lock);live_tasks--;pthread_mutex_unlock(&fake_lock);return pdFALSE;}
    task_count++;return pdPASS;
}
static struct timespec deadline(TickType_t ms){
    struct timespec t;clock_gettime(CLOCK_REALTIME,&t);t.tv_sec+=ms/1000;t.tv_nsec+=(ms%1000)*1000000;
    if(t.tv_nsec>=1000000000){t.tv_sec++;t.tv_nsec-=1000000000;}return t;
}
SemaphoreHandle_t xSemaphoreCreateBinary(void){
    if(fail_semaphore)return NULL;
    struct fake_semaphore *s=calloc(1,sizeof(*s));if(!s)return NULL;
    pthread_mutex_init(&s->lock,NULL);pthread_cond_init(&s->changed,NULL);live_semaphores++;return s;
}
BaseType_t xSemaphoreTake(SemaphoreHandle_t s,TickType_t timeout){
    pthread_mutex_lock(&s->lock);struct timespec until=deadline(timeout);int rc=0;
    while(!s->ready&&!rc)rc=timeout==portMAX_DELAY?pthread_cond_wait(&s->changed,&s->lock):pthread_cond_timedwait(&s->changed,&s->lock,&until);
    bool ok=s->ready;if(ok)s->ready=false;pthread_mutex_unlock(&s->lock);return ok?pdTRUE:pdFALSE;
}
BaseType_t xSemaphoreGive(SemaphoreHandle_t s){pthread_mutex_lock(&s->lock);s->ready=true;pthread_cond_signal(&s->changed);pthread_mutex_unlock(&s->lock);return pdTRUE;}
void vSemaphoreDelete(SemaphoreHandle_t s){pthread_cond_destroy(&s->changed);pthread_mutex_destroy(&s->lock);free(s);live_semaphores--;}
StreamBufferHandle_t xStreamBufferCreate(size_t capacity,size_t trigger){
    (void)trigger;if(fail_stream)return NULL;
    struct fake_stream *s=calloc(1,sizeof(*s));if(!s)return NULL;
    s->bytes=malloc(capacity);if(!s->bytes){free(s);return NULL;}
    s->capacity=capacity;pthread_mutex_init(&s->lock,NULL);pthread_cond_init(&s->readable,NULL);pthread_cond_init(&s->writable,NULL);live_streams++;return s;
}
size_t xStreamBufferSend(StreamBufferHandle_t s,const void *bytes,size_t size,TickType_t timeout){
    pthread_mutex_lock(&s->lock);struct timespec until=deadline(timeout);int rc=0;
    // IDF等待min(request,capacity)的完整空间，超时才允许部分写；不能只等“有任意空间”。
    size_t required=size<s->capacity?size:s->capacity;
    while(s->capacity-s->used<required&&!rc)rc=pthread_cond_timedwait(&s->writable,&s->lock,&until);
    size_t n=size<s->capacity-s->used?size:s->capacity-s->used;
    const uint8_t *p=bytes;for(size_t i=0;i<n;i++)s->bytes[(s->head+s->used+i)%s->capacity]=p[i];s->used+=n;
    if(s->used>max_stream_used)max_stream_used=s->used;
    pthread_cond_signal(&s->readable);pthread_mutex_unlock(&s->lock);return n;
}
size_t xStreamBufferReceive(StreamBufferHandle_t s,void *bytes,size_t size,TickType_t timeout){
    pthread_mutex_lock(&s->lock);struct timespec until=deadline(timeout);int rc=0;
    while(!s->used&&!rc)rc=pthread_cond_timedwait(&s->readable,&s->lock,&until);
    size_t n=size<s->used?size:s->used;uint8_t *p=bytes;
    for(size_t i=0;i<n;i++)p[i]=s->bytes[(s->head+i)%s->capacity];s->head=(s->head+n)%s->capacity;s->used-=n;
    pthread_cond_signal(&s->writable);pthread_mutex_unlock(&s->lock);return n;
}
size_t xStreamBufferBytesAvailable(StreamBufferHandle_t s){pthread_mutex_lock(&s->lock);size_t n=s->used;pthread_mutex_unlock(&s->lock);return n;}
void vStreamBufferDelete(StreamBufferHandle_t s){pthread_cond_destroy(&s->readable);pthread_cond_destroy(&s->writable);pthread_mutex_destroy(&s->lock);free(s->bytes);free(s);live_streams--;}
int bsp_audio_write(const void *bytes,size_t n){
    pthread_mutex_lock(&sink_lock);unsigned number=(unsigned)++write_calls;bool fail=fail_write_number&&number>=fail_write_number;bool clocked=emulate_audio_clock;pthread_mutex_unlock(&sink_lock);
    if(fail)return -1;
    if(clocked)sleep_us((int64_t)n*1000000/32000);
    pthread_mutex_lock(&sink_lock);if(sink_used+n>sizeof(sink)){pthread_mutex_unlock(&sink_lock);return -1;}
    memcpy(sink+sink_used,bytes,n);sink_used+=n;pthread_mutex_unlock(&sink_lock);return 0;
}
static bool cancelled(void){return atomic_load(&cancel_flag);}
static size_t written(void){pthread_mutex_lock(&sink_lock);size_t n=sink_used;pthread_mutex_unlock(&sink_lock);return n;}
static bool wait_bytes(size_t minimum,unsigned ms){
    int64_t until=esp_timer_get_time()+ms*INT64_C(1000);
    while(esp_timer_get_time()<until){if(written()>=minimum)return true;sleep_us(2000);}return written()>=minimum;
}
static void reap_tasks(void){for(size_t i=0;i<task_count;i++)pthread_join(tasks[i],NULL);task_count=0;CHECK(live_tasks==0);CHECK(live_streams==0);CHECK(live_semaphores==0);}
static void reset(void){
    reap_tasks();pthread_mutex_lock(&sink_lock);sink_used=write_calls=0;fail_write_number=0;emulate_audio_clock=false;memset(sink,0,sizeof(sink));pthread_mutex_unlock(&sink_lock);
    atomic_store(&cancel_flag,false);fail_stream=fail_semaphore=fail_task=false;max_stream_used=0;
}
static void pattern(uint8_t *bytes,size_t n,unsigned salt){for(size_t i=0;i<n;i++)bytes[i]=(uint8_t)(i*37+salt);}
static void short_audio(void){
    reset();uint8_t pcm[128];pattern(pcm,sizeof(pcm),1);CHECK(ib_tts_player_start(cancelled)==NULL);CHECK_STR(ib_tts_player_start(cancelled),"audio_busy");
    CHECK(ib_tts_player_push(pcm,sizeof(pcm)));sleep_us(50000);CHECK(written()==0);
    int64_t before=esp_timer_get_time();CHECK(ib_tts_player_finish(true)==NULL);CHECK(esp_timer_get_time()-before>=100000);
    CHECK(written()==sizeof(pcm));CHECK(!memcmp(sink,pcm,sizeof(pcm)));ib_tts_stats_t stats;ib_tts_player_stats(&stats);
    CHECK(stats.received_bytes==sizeof(pcm)&&stats.written_bytes==sizeof(pcm));CHECK(stats.starves==0);CHECK(stats.startup_ms>=40);CHECK(stats.consumer_stack_min_bytes==1728);CHECK(last_task_priority==6&&last_task_stack<=3072);reap_tasks();
}
static void prebuffer_and_long_audio(void){
    reset();uint8_t pcm[32768];pattern(pcm,sizeof(pcm),7);emulate_audio_clock=true;CHECK(ib_tts_player_start(cancelled)==NULL);
    CHECK(ib_tts_player_push(pcm,3070));sleep_us(50000);CHECK(written()==0);CHECK(ib_tts_player_push(pcm+3070,2));CHECK(wait_bytes(1,1000));
    int64_t before=esp_timer_get_time();CHECK(ib_tts_player_push(pcm+3072,sizeof(pcm)-3072));CHECK(esp_timer_get_time()-before>600000);
    CHECK(ib_tts_player_finish(true)==NULL);CHECK(written()==sizeof(pcm));CHECK(!memcmp(sink,pcm,sizeof(pcm)));ib_tts_stats_t stats;ib_tts_player_stats(&stats);
    CHECK(stats.received_bytes==sizeof(pcm)&&stats.written_bytes==sizeof(pcm));CHECK(max_stream_used<=4096);CHECK(stats.queue_peak<=4096&&stats.queue_peak>=3072);reap_tasks();
}
static void abort_and_cancel(void){
    reset();uint8_t old[8192];memset(old,0x12,sizeof(old));CHECK(ib_tts_player_start(cancelled)==NULL);CHECK(ib_tts_player_push(old,1000));CHECK(ib_tts_player_finish(false)==NULL);CHECK(written()==0);reap_tasks();
    emulate_audio_clock=true;CHECK(ib_tts_player_start(cancelled)==NULL);CHECK(ib_tts_player_push(old,4096));CHECK(wait_bytes(640,1000));atomic_store(&cancel_flag,true);
    int64_t before=esp_timer_get_time();CHECK(ib_tts_player_finish(false)==NULL);CHECK(esp_timer_get_time()-before<200000);size_t stopped=written();CHECK(stopped<4096);sleep_us(30000);CHECK(written()==stopped);
    ib_tts_stats_t stats;ib_tts_player_stats(&stats);CHECK(stats.cancelled==1);reap_tasks();
    reset();uint8_t fresh[256];memset(fresh,0x7c,sizeof(fresh));CHECK(ib_tts_player_start(cancelled)==NULL);CHECK(ib_tts_player_push(fresh,sizeof(fresh)));CHECK(ib_tts_player_finish(true)==NULL);CHECK(written()==sizeof(fresh));CHECK(!memcmp(sink,fresh,sizeof(fresh)));reap_tasks();
}
struct pending_push {const uint8_t *pcm;size_t size;bool result;};
static void *push_entry(void *context){struct pending_push *p=context;p->result=ib_tts_player_push(p->pcm,p->size);return NULL;}
struct pending_finish {const char *error;atomic_bool done;};
static void *finish_entry(void *context){struct pending_finish *p=context;p->error=ib_tts_player_finish(true);atomic_store(&p->done,true);return NULL;}
static void cancel_during_backpressure_and_tail(void){
    reset();uint8_t pcm[32768];memset(pcm,0x35,sizeof(pcm));emulate_audio_clock=true;CHECK(ib_tts_player_start(cancelled)==NULL);
    struct pending_push pushing={pcm,sizeof(pcm),true};pthread_t producer;CHECK(pthread_create(&producer,NULL,push_entry,&pushing)==0);CHECK(wait_bytes(640,1000));
    atomic_store(&cancel_flag,true);int64_t before=esp_timer_get_time();pthread_join(producer,NULL);CHECK(!pushing.result);CHECK(ib_tts_player_finish(false)==NULL);CHECK(esp_timer_get_time()-before<200000);CHECK(written()<sizeof(pcm));reap_tasks();
    reset();CHECK(ib_tts_player_start(cancelled)==NULL);CHECK(ib_tts_player_push(pcm,128));
    struct pending_finish finishing={.error=NULL,.done=ATOMIC_VAR_INIT(false)};pthread_t finisher;CHECK(pthread_create(&finisher,NULL,finish_entry,&finishing)==0);CHECK(wait_bytes(128,1000));CHECK(!atomic_load(&finishing.done));
    before=esp_timer_get_time();atomic_store(&cancel_flag,true);pthread_join(finisher,NULL);CHECK(finishing.error==NULL);CHECK(esp_timer_get_time()-before<80000);CHECK(written()==128);ib_tts_stats_t stats;ib_tts_player_stats(&stats);CHECK(stats.cancelled==1);reap_tasks();
}
static void write_failure_and_odd_input(void){
    reset();uint8_t pcm[4096];pattern(pcm,sizeof(pcm),9);fail_write_number=2;CHECK(ib_tts_player_start(cancelled)==NULL);CHECK(!ib_tts_player_push(pcm,3));CHECK(ib_tts_player_push(pcm,sizeof(pcm)));CHECK(wait_bytes(640,1000));sleep_us(30000);
    CHECK(!ib_tts_player_push(pcm,640));CHECK_STR(ib_tts_player_finish(true),"playback_write_failed");ib_tts_stats_t stats;ib_tts_player_stats(&stats);CHECK(stats.write_errors==1);CHECK(written()==640);reap_tasks();
}
static void starvation_metrics(void){
    reset();uint8_t pcm[4736];pattern(pcm,sizeof(pcm),19);emulate_audio_clock=true;CHECK(ib_tts_player_start(cancelled)==NULL);ib_tts_player_network_wait(30);ib_tts_player_network_wait(123);ib_tts_player_network_wait(70);
    CHECK(ib_tts_player_push(pcm,4096));CHECK(wait_bytes(4096,1000));sleep_us(230000);CHECK(ib_tts_player_push(pcm+4096,640));CHECK(ib_tts_player_finish(true)==NULL);
    ib_tts_stats_t stats;ib_tts_player_stats(&stats);CHECK(stats.net_wait_max_ms==123);CHECK(stats.starves==1);CHECK(stats.starve_ms>=100);CHECK(stats.queue_low==0);CHECK(stats.write_gap_max_ms>=200);CHECK(!memcmp(sink,pcm,sizeof(pcm)));reap_tasks();
}
static void allocation_failures(void){
    reset();fail_stream=true;CHECK_STR(ib_tts_player_start(cancelled),"out_of_memory");reap_tasks();fail_stream=false;
    fail_semaphore=true;CHECK_STR(ib_tts_player_start(cancelled),"out_of_memory");reap_tasks();fail_semaphore=false;
    fail_task=true;CHECK_STR(ib_tts_player_start(cancelled),"out_of_memory");reap_tasks();fail_task=false;
    CHECK(ib_tts_player_start(cancelled)==NULL);CHECK(ib_tts_player_finish(true)==NULL);reap_tasks();CHECK(ib_tts_player_finish(false)==NULL);
}
int main(void){short_audio();prebuffer_and_long_audio();abort_and_cancel();cancel_during_backpressure_and_tail();write_failure_and_odd_input();starvation_metrics();allocation_failures();TEST_DONE("tts_player");}
