// main/ib_audio.c: 音频实现。
//
// 任务:
//   ib_mic  (prio 6):bsp_audio_read 20 ms → IMA ADPCM 块 → 二进制帧 → tx 回调
//   ib_tone (prio 6):从队列取提示音,逐块合成正弦并 bsp_audio_write
// 两种任务均按次懒创建。新录音先协作取消短音，禁止把提示音录进麦克风。
#include "ib_audio.h"

#include "bsp_audio.h"
#include "ib_adpcm.h"
#include "ib_protocol.h"

#include "esp_check.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/event_groups.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "freertos/task.h"

#include <math.h>
#include <string.h>

static const char *TAG = "ib_audio";

#define SAMPLE_RATE      16000
#define TASK_PRIO        6
#define MIC_TASK_STACK   3072
#define TONE_TASK_STACK  2560
#define STOP_TIMEOUT_MS  1500       // 大于 I2S 读写超时
#define OUT_VOLUME       65         // codec 输出音量(%)
#define TONE_AMPLITUDE   9000       // 约 -11 dBFS
#define FADE_SAMPLES     64         // 4 ms 起落,避免爆音
#define TAIL_SILENCE_MS  120        // 等 DMA 里的尾巴播完再关 codec

#define BIT_MIC_IDLE  (1 << 0)
#define BIT_TONE_IDLE (1 << 1)

static bool s_ready;
static ib_audio_tx_cb_t s_tx;
static SemaphoreHandle_t s_lock;
static EventGroupHandle_t s_events;
static QueueHandle_t s_tone_queue;
static int s_codec_users;
static bool s_external_pcm;
static bool s_companion_enabled;
static volatile bool s_tone_cancel;
static TaskHandle_t s_tone_task;

static volatile bool s_mic_on;
static ib_link_t s_mic_link;
static TaskHandle_t s_mic_task;
static int16_t s_mic_pcm[IB_ADPCM_BLOCK_SAMPLES];
static uint8_t s_mic_frame[IB_BIN_HDR + 2 * IB_ADPCM_BLOCK_BYTES];

static int16_t s_sine[256];
static int16_t s_tone_pcm[IB_ADPCM_BLOCK_SAMPLES];
static bool stop_tone(void);
static portMUX_TYPE s_stats_lock=portMUX_INITIALIZER_UNLOCKED;
static ib_audio_stats_t s_stats;
void ib_audio_stats(ib_audio_stats_t *out){portENTER_CRITICAL(&s_stats_lock);*out=s_stats;portEXIT_CRITICAL(&s_stats_lock);}

// ---------------------------------------------------------------------------
// codec 引用计数:0→1 打开,1→0 静音后关闭。调用方保证切换时没有任务在读写。
// ---------------------------------------------------------------------------

static esp_err_t codec_acquire(bool output)
{
    esp_err_t err = ESP_OK;
    xSemaphoreTake(s_lock, portMAX_DELAY);
    if (s_external_pcm) { xSemaphoreGive(s_lock); return ESP_ERR_INVALID_STATE; }
    if (s_codec_users == 0) {
        err = bsp_audio_set_format(SAMPLE_RATE, 16, 1);
        if (err == ESP_OK) {
            bsp_audio_set_volume(OUT_VOLUME);
            bsp_audio_mute(!output);
        }
    }
    if (err == ESP_OK) s_codec_users++;
    xSemaphoreGive(s_lock);
    return err;
}

static void codec_release(void)
{
    xSemaphoreTake(s_lock, portMAX_DELAY);
    if (s_codec_users > 0 && --s_codec_users == 0) {
        bsp_audio_mute(true);
        bsp_audio_close();
    }
    xSemaphoreGive(s_lock);
}

// ---------------------------------------------------------------------------
// 麦克风
// ---------------------------------------------------------------------------

static void mic_task(void *arg)
{
    (void)arg;
    ib_adpcm_state_t st;
    ib_adpcm_init(&st);
    uint8_t seq = 0;
    // 丢掉 DMA 里的旧样本(约 60 ms),之后每块都是新鲜数据。
    for (int i = 0; i < 3 && s_mic_on; i++) bsp_audio_read(s_mic_pcm, sizeof(s_mic_pcm));
    int blocks = s_mic_link == IB_LINK_BLE ? 1 : 2;
    while (s_mic_on) {
        int got = 0;
        while (got < blocks && s_mic_on) {
            if (bsp_audio_read(s_mic_pcm, sizeof(s_mic_pcm)) != ESP_OK) {
                vTaskDelay(pdMS_TO_TICKS(20));
                continue;
            }
            ib_adpcm_encode_block(&st, s_mic_pcm, s_mic_frame + IB_BIN_HDR + got * IB_ADPCM_BLOCK_BYTES);
            got++;
        }
        if (!s_mic_on) break;
        size_t payload = (size_t)blocks * IB_ADPCM_BLOCK_BYTES;
        ib_bin_header(s_mic_frame, IB_BIN_ADPCM, seq++, payload);
        if (s_tx) s_tx(s_mic_link, s_mic_frame, IB_BIN_HDR + payload);
    }
    // 每次麦克风请求只持有一份栈；先释放codec再发布退出，超时stop也不会悬挂引用。
    uint32_t stack=uxTaskGetStackHighWaterMark(NULL);portENTER_CRITICAL(&s_stats_lock);s_stats.mic_stack_min_bytes=stack;portEXIT_CRITICAL(&s_stats_lock);
    codec_release();xSemaphoreTake(s_lock,portMAX_DELAY);
    s_mic_task=NULL;xEventGroupSetBits(s_events,BIT_MIC_IDLE);xSemaphoreGive(s_lock);vTaskDelete(NULL);
}

esp_err_t ib_audio_mic_start(ib_link_t link)
{
    if (!s_ready||!s_companion_enabled) return ESP_ERR_INVALID_STATE;
    if (s_mic_on && s_mic_link == link) return ESP_OK;
    if (s_mic_on||s_mic_task) ib_audio_mic_stop();
    if(s_mic_task)return ESP_ERR_TIMEOUT;
    if(!stop_tone())return ESP_ERR_TIMEOUT;
    ESP_RETURN_ON_ERROR(codec_acquire(false), TAG, "codec open failed");
    s_mic_link = link;
    s_mic_on = true;
    xEventGroupClearBits(s_events,BIT_MIC_IDLE);
    if(xTaskCreate(mic_task,"ib_mic",MIC_TASK_STACK,NULL,TASK_PRIO,&s_mic_task)!=pdPASS){
        s_mic_on=false;xEventGroupSetBits(s_events,BIT_MIC_IDLE);codec_release();return ESP_ERR_NO_MEM;
    }
    portENTER_CRITICAL(&s_stats_lock);s_stats.mic_starts++;portEXIT_CRITICAL(&s_stats_lock);
    return ESP_OK;
}

void ib_audio_mic_stop(void)
{
    if (!s_mic_on&&!s_mic_task) return;
    s_mic_on = false;
    if(!(xEventGroupWaitBits(s_events, BIT_MIC_IDLE, pdFALSE, pdTRUE, pdMS_TO_TICKS(STOP_TIMEOUT_MS))&BIT_MIC_IDLE))return;
}

bool ib_audio_mic_active(void)
{
    return s_mic_on;
}

ib_link_t ib_audio_mic_link(void)
{
    return s_mic_link;
}

// ---------------------------------------------------------------------------
// 提示音
// ---------------------------------------------------------------------------

typedef struct {
    uint16_t hz;
    uint16_t ms;
    bool decay;         // 指数衰减(短促的"叮")
} tone_seg_t;

static const tone_seg_t SOUND_START[] = { { 880, 40, false }, { 1320, 40, false } };
static const tone_seg_t SOUND_STOP[] = { { 1320, 40, false }, { 880, 40, false } };
static const tone_seg_t SOUND_DONE[] = { { 1568, 90, true } };
static const tone_seg_t SOUND_AGENT_DONE[] = { { 1047, 70, false }, { 1319, 70, false }, { 1568, 180, true } };
// hz 为 0 的段是静音间隔。
static const tone_seg_t SOUND_AGENT_INPUT[] = {
    { 1319, 70, false }, { 0, 60, false }, { 1319, 70, false }, { 0, 60, false }, { 1760, 160, true },
};

static void tone_write(size_t bytes){
    esp_err_t error=bsp_audio_write(s_tone_pcm,bytes);
    portENTER_CRITICAL(&s_stats_lock);if(error==ESP_OK)s_stats.write_bytes+=bytes;else s_stats.write_errors++;portEXIT_CRITICAL(&s_stats_lock);
    if(error!=ESP_OK)s_tone_cancel=true;
}
static void write_silence(int ms)
{
    memset(s_tone_pcm, 0, sizeof(s_tone_pcm));
    int samples = SAMPLE_RATE * ms / 1000;
    while (samples > 0&&!s_tone_cancel) {
        int n = samples < IB_ADPCM_BLOCK_SAMPLES ? samples : IB_ADPCM_BLOCK_SAMPLES;
        tone_write((size_t)n * 2);
        samples -= n;
    }
}

static void play_segment(const tone_seg_t *seg)
{
    if (seg->hz == 0) {
        write_silence(seg->ms);
        return;
    }
    int total = SAMPLE_RATE * seg->ms / 1000;
    uint32_t phase = 0;
    uint32_t step = (uint32_t)(((uint64_t)seg->hz << 32) / SAMPLE_RATE);   // 32 位相位累加器
    int done = 0;
    while (done < total&&!s_tone_cancel) {
        int n = total - done < IB_ADPCM_BLOCK_SAMPLES ? total - done : IB_ADPCM_BLOCK_SAMPLES;
        for (int i = 0; i < n; i++) {
            int idx = done + i;
            int32_t env = 256;                                  // Q8 包络
            if (idx < FADE_SAMPLES) env = idx * 256 / FADE_SAMPLES;
            int remain = total - idx;
            if (remain < FADE_SAMPLES) env = env * remain / FADE_SAMPLES;
            if (seg->decay) env = env * (total - idx) / total * (total - idx) / total;
            int32_t s = (int32_t)s_sine[phase >> 24] * TONE_AMPLITUDE / 32767;
            s_tone_pcm[i] = (int16_t)(s * env / 256);
            phase += step;
        }
        tone_write((size_t)n * 2);
        done += n;
    }
}

static void tone_task(void *arg)
{
    (void)arg;
    ib_sound_t sound;
    for (;;) {
        xSemaphoreTake(s_lock,portMAX_DELAY);
        bool got=!s_tone_cancel&&xQueueReceive(s_tone_queue,&sound,0)==pdTRUE;
        if(!got){
            uint32_t stack=uxTaskGetStackHighWaterMark(NULL);portENTER_CRITICAL(&s_stats_lock);s_stats.tone_stack_min_bytes=stack;portEXIT_CRITICAL(&s_stats_lock);
            s_tone_task=NULL;xEventGroupSetBits(s_events,BIT_TONE_IDLE);xSemaphoreGive(s_lock);vTaskDelete(NULL);return;
        }
        xSemaphoreGive(s_lock);
        if (codec_acquire(true) != ESP_OK){portENTER_CRITICAL(&s_stats_lock);s_stats.codec_errors++;portEXIT_CRITICAL(&s_stats_lock);continue;}
        portENTER_CRITICAL(&s_stats_lock);s_stats.started++;portEXIT_CRITICAL(&s_stats_lock);
        write_silence(10);
        const tone_seg_t *segs;
        size_t count;
#define PICK(arr) do { segs = (arr); count = sizeof(arr) / sizeof((arr)[0]); } while (0)
        switch (sound) {
        case IB_SOUND_START: PICK(SOUND_START); break;
        case IB_SOUND_STOP: PICK(SOUND_STOP); break;
        case IB_SOUND_AGENT_DONE: PICK(SOUND_AGENT_DONE); break;
        case IB_SOUND_AGENT_INPUT: PICK(SOUND_AGENT_INPUT); break;
        default: PICK(SOUND_DONE); break;
        }
#undef PICK
        for (size_t i = 0; i < count&&!s_tone_cancel; i++) play_segment(&segs[i]);
        if(!s_tone_cancel)write_silence(TAIL_SILENCE_MS);
        portENTER_CRITICAL(&s_stats_lock);if(s_tone_cancel)s_stats.cancelled++;else s_stats.completed++;portEXIT_CRITICAL(&s_stats_lock);
        codec_release();
    }
}

bool ib_audio_play(ib_sound_t sound)
{
    if (!s_ready || !s_tone_queue) return false;
    bool accepted=false;
    xSemaphoreTake(s_lock,portMAX_DELAY);
    if(!s_external_pcm&&!s_mic_on){
        xQueueOverwrite(s_tone_queue, &sound);
        accepted=true;
        if(!s_tone_task){
            s_tone_cancel=false;xEventGroupClearBits(s_events,BIT_TONE_IDLE);
            if(xTaskCreate(tone_task,"ib_tone",TONE_TASK_STACK,NULL,TASK_PRIO,&s_tone_task)!=pdPASS){xQueueReset(s_tone_queue);xEventGroupSetBits(s_events,BIT_TONE_IDLE);accepted=false;}
        }
    }
    if(accepted){portENTER_CRITICAL(&s_stats_lock);s_stats.queued++;portEXIT_CRITICAL(&s_stats_lock);}
    xSemaphoreGive(s_lock);return accepted;
}

// 不在持codec mutex时等任务，避免tone退出释放codec时形成反向等待。
static bool stop_tone(void){
    if(!s_events)return true;
    xSemaphoreTake(s_lock,portMAX_DELAY);s_tone_cancel=true;if(s_tone_queue)xQueueReset(s_tone_queue);bool active=s_tone_task!=NULL;if(active)bsp_audio_mute(true);xSemaphoreGive(s_lock);
    return !active||(xEventGroupWaitBits(s_events,BIT_TONE_IDLE,pdFALSE,pdTRUE,pdMS_TO_TICKS(STOP_TIMEOUT_MS))&BIT_TONE_IDLE);
}

esp_err_t ib_audio_pcm_begin(void)
{
    if (!s_ready) return ESP_ERR_INVALID_STATE;
    ib_audio_mic_stop();
    if(!stop_tone())return ESP_ERR_TIMEOUT;
    xSemaphoreTake(s_lock, portMAX_DELAY);
    if (s_codec_users || s_external_pcm) { xSemaphoreGive(s_lock); return ESP_ERR_INVALID_STATE; }
    esp_err_t e = bsp_audio_set_format(SAMPLE_RATE, 16, 1);
    if (e == ESP_OK) { s_external_pcm = true; s_codec_users = 1; bsp_audio_set_volume(OUT_VOLUME); bsp_audio_mute(false); }
    xSemaphoreGive(s_lock); return e;
}

void ib_audio_pcm_end(void)
{
    if (!s_ready) return;
    xSemaphoreTake(s_lock, portMAX_DELAY);
    if (s_external_pcm) { bsp_audio_mute(true); bsp_audio_close(); s_codec_users = 0; s_external_pcm = false; }
    xSemaphoreGive(s_lock);
}

void ib_audio_pcm_interrupt(void)
{
    if(!s_ready)return;
    xSemaphoreTake(s_lock,portMAX_DELAY);
    if(s_external_pcm)bsp_audio_mute(true);
    xSemaphoreGive(s_lock);
}

esp_err_t ib_audio_init_mode(ib_audio_tx_cb_t tx,bool companion)
{
    s_tx = tx;
    ESP_RETURN_ON_ERROR(bsp_audio_init(), TAG, "bsp_audio_init failed");
    for (int i = 0; i < 256; i++) s_sine[i] = (int16_t)(32767.0f * sinf((float)i * 6.2831853f / 256.0f));

    s_lock = xSemaphoreCreateMutex();
    ESP_RETURN_ON_FALSE(s_lock,ESP_ERR_NO_MEM,TAG,"audio lock alloc failed");
    s_events = xEventGroupCreate();
    s_tone_queue = xQueueCreate(1, sizeof(ib_sound_t));
    if(!s_events||!s_tone_queue){
        if(s_events){vEventGroupDelete(s_events);s_events=NULL;}
        if(s_tone_queue){vQueueDelete(s_tone_queue);s_tone_queue=NULL;}
        vSemaphoreDelete(s_lock);s_lock=NULL;return ESP_ERR_NO_MEM;
    }
    xEventGroupSetBits(s_events,BIT_MIC_IDLE|BIT_TONE_IDLE);s_companion_enabled=companion;
    bsp_audio_mute(true);
    s_ready = true;
    return ESP_OK;
}

esp_err_t ib_audio_init(ib_audio_tx_cb_t tx){return ib_audio_init_mode(tx,true);}

esp_err_t ib_audio_set_companion(bool enabled){
    if(!s_ready)return ESP_ERR_INVALID_STATE;
    if(!enabled){ib_audio_mic_stop();if(s_mic_task||!stop_tone())return ESP_ERR_TIMEOUT;}
    xSemaphoreTake(s_lock,portMAX_DELAY);
    esp_err_t error=s_external_pcm?ESP_ERR_INVALID_STATE:ESP_OK;
    if(error==ESP_OK)s_companion_enabled=enabled;
    xSemaphoreGive(s_lock);return error;
}
bool ib_audio_companion_enabled(void){return s_companion_enabled;}
