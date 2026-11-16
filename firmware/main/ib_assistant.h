// 独立助手运行器。按键意图异步投递；网络/Flash在专用任务执行。
#pragma once
#include "esp_err.h"
#include "ib_link.h"
#include "ib_transcript_view.h"
#include "ib_reply_store.h"
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
typedef enum { IB_ASSIST_IDLE, IB_ASSIST_PREPARING, IB_ASSIST_LISTENING, IB_ASSIST_TRANSCRIBING,
    IB_ASSIST_THINKING, IB_ASSIST_REPLYING, IB_ASSIST_DONE, IB_ASSIST_ERROR, IB_ASSIST_STOPPED, IB_ASSIST_SPEAKING } ib_assistant_state_t;
typedef void (*ib_assistant_status_cb)(ib_assistant_state_t state,const char *text,void *context);
esp_err_t ib_assistant_init(ib_assistant_status_cb,void *);
bool ib_assistant_handle_line(ib_link_t,const char *,size_t);
bool ib_assistant_standalone(void);
bool ib_assistant_busy(void);
// app每tick采样，独立模式仅真实reader采音有效；松键后不包含Flash drain/WSS等待。
bool ib_assistant_capture_active(void);
ib_assistant_state_t ib_assistant_state(void);
const char *ib_assistant_state_name(ib_assistant_state_t);
void ib_assistant_press(void);
void ib_assistant_release(void);
void ib_assistant_cancel(void);
void ib_assistant_clear_history(void);
// 相伴模式从 Mac 会话事件驱动同一个宠物状态，busy 时拒绝覆盖独立会话。
void ib_assistant_companion_state(const char *state);

void ib_assistant_leave_standalone(void);

bool ib_assistant_take_restart_request(void);

bool ib_assistant_companion_cloud_target(void);
const char *ib_assistant_companion_error(void);

bool ib_assistant_companion_has_phase(void);

void ib_assistant_companion_release(void);

// 本地菜单与线协议共用：完整校验、原子持久化，变更后由app延迟重启。
const char *ib_assistant_request_mode(bool standalone);
bool ib_assistant_mode_busy(void);
bool ib_assistant_companion_owned(void);

// 网络/串口发布有界字幕邮箱；app任务读取快照再持有LVGL锁。
void ib_assistant_transcript_snapshot(ib_transcript_view_t *,uint32_t *revision);

// 相伴reply_final同步UI发布门禁；网络增量仍只提交邮箱，由app轮询。
void ib_assistant_set_reply_apply(bool (*apply)(void *),void *context);

// app空闲维护：与USB事务共用control，不在采音/同步中擦除退休bank。
void ib_assistant_maintenance(void);
