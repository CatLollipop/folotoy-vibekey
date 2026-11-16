// TTS专用有界播放队列：云worker生产，较高优先级任务持续喂I2S。
#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
typedef bool (*ib_tts_cancel_cb)(void);
typedef struct {
    uint32_t received_bytes,written_bytes,queue_peak,queue_low,startup_ms;
    uint32_t net_wait_max_ms,write_gap_max_ms,write_max_ms,starves,starve_ms;
    uint32_t write_errors,cancelled,consumer_stack_min_bytes;
} ib_tts_stats_t;
// 只允许一个生产者/轮次；约4KiB ring+2.5KiB消费者栈，仅TTS阶段存在。
const char *ib_tts_player_start(ib_tts_cancel_cb);
bool ib_tts_player_push(const uint8_t *,size_t);
void ib_tts_player_network_wait(uint32_t elapsed_ms);
// drain=true等待队列与DMA尾部；false立即丢队列。总是等待消费者退出后才释放。
const char *ib_tts_player_finish(bool drain);
void ib_tts_player_stats(ib_tts_stats_t *);
