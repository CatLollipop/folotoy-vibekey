// 单次豆包双向WSS任务。调用方持有麦克风/Flash写者；函数结束前完整关闭TLS及接收任务。
#pragma once
#include "ib_assistant_cloud.h"
#include <stddef.h>
#include <stdint.h>
typedef struct {
    size_t (*available)(void); // acquire读取已完成Flash写入的PCM字节，不包含在途写入。
    bool (*recording)(void);
    bool (*record_error)(void);
    void (*transcribing)(void);
    void (*transcript)(const char *,bool final); // 真正服务快照；回调只投递邮箱，禁止等待LVGL锁。
} ib_asr_source_t;
typedef struct {
    uint32_t sent_bytes, messages, partials, sentences, connect_ms, first_partial_ms;
    uint32_t heap_min, largest_min, ws_stack_min_bytes, send_max_ms;
    bool task_started, task_finished;
} ib_asr_stats_t;
const char *ib_asr_realtime_run(const ib_assistant_profile_t *,const esp_partition_t *,size_t,const ib_asr_source_t *,char *,size_t,ib_cloud_cancel_cb);
void ib_asr_realtime_init(void);
void ib_asr_realtime_cancel(void);
void ib_asr_realtime_stats(ib_asr_stats_t *);

// 仅数值，不含端点、请求头、密钥或服务正文。单独查询避免扩满asr_status。
typedef struct {
    int connect_port,connect_result,connect_errno,tls_error,tls_stack,tls_flags;
    int http_code,error_type,ws_error,ws_stack,ws_flags,socket_errno;
    int io_stage,io_result,io_errno;
} ib_asr_diagnostics_t;
void ib_asr_realtime_diagnostics(ib_asr_diagnostics_t *);
