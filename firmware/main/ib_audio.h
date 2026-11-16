// main/ib_audio.h: 音频:麦克风上行(16 kHz IMA ADPCM)与本地合成提示音。
//
// codec 固定 16 kHz / 16 bit / 单声道,按引用计数开关:麦克风或提示音都不用时关闭以省电。
#pragma once

#include "esp_err.h"
#include "ib_link.h"

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef enum {
    IB_SOUND_START = 0,     // 上行双音 880 → 1320 Hz,各 40 ms
    IB_SOUND_STOP,          // 下行双音 1320 → 880 Hz
    IB_SOUND_DONE,          // 短促一声
    IB_SOUND_AGENT_DONE,    // Agent 完成:上行三音 C6 → E6 → G6
    IB_SOUND_AGENT_INPUT,   // Agent 等你:两声短促 E6 + 一声 A6
} ib_sound_t;

// 麦克风帧发送回调,运行在麦克风任务里;frame 已含二进制帧头。
// USB:每帧 2 块(40 ms,334 字节);BLE:每帧 1 块(20 ms,170 字节)。
typedef void (*ib_audio_tx_cb_t)(ib_link_t link, const uint8_t *frame, size_t len);

esp_err_t ib_audio_init(ib_audio_tx_cb_t tx);

// 以下控制函数只在 ib_app 任务中调用。
esp_err_t ib_audio_mic_start(ib_link_t link);
void ib_audio_mic_stop(void);
bool ib_audio_mic_active(void);
ib_link_t ib_audio_mic_link(void);

// 异步短音；true仅表示成功入队，声音开关由app处理。麦克风/PCM占用或任务分配失败返回false。
// 正在播放时新短音替换排队中的一个；新PTT会协作取消并立即静音，不混入采音。
bool ib_audio_play(ib_sound_t sound);

// 独立助手独占 codec：成功后允许同一所有者直接调用 BSP PCM read/write。
// 先协作停止短音/伴随麦克风再取独占权；调用者必须在结束/取消/错误路径释放。
esp_err_t ib_audio_pcm_begin(void);
void ib_audio_pcm_end(void);
// 取消时只静音输出，不关闭仍在被worker读写的codec。
void ib_audio_pcm_interrupt(void);

esp_err_t ib_audio_init_mode(ib_audio_tx_cb_t tx,bool companion);
// 热切换只改变伴随麦克风许可。任务按次懒创建；禁用时协作停止/等待任务退出，不强删codec使用者。
esp_err_t ib_audio_set_companion(bool enabled);
bool ib_audio_companion_enabled(void);
typedef struct {
    uint32_t queued,started,completed,cancelled,write_bytes,write_errors,codec_errors,mic_starts,mic_stack_min_bytes,tone_stack_min_bytes;
} ib_audio_stats_t;
// 单调运行期计数，accepted/write_bytes不等于扬声器听感；仅用于重传/资源/错误验收。
void ib_audio_stats(ib_audio_stats_t *);
