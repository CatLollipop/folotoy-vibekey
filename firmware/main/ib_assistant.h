// 独立助手运行器。按键意图异步投递；网络/Flash在专用任务执行。
#pragma once
#include "esp_err.h"
#include "ib_link.h"
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
typedef enum { IB_ASSIST_IDLE, IB_ASSIST_PREPARING, IB_ASSIST_LISTENING, IB_ASSIST_TRANSCRIBING,
    IB_ASSIST_THINKING, IB_ASSIST_REPLYING, IB_ASSIST_DONE, IB_ASSIST_ERROR, IB_ASSIST_STOPPED } ib_assistant_state_t;
typedef void (*ib_assistant_status_cb)(ib_assistant_state_t state,const char *text,void *context);
esp_err_t ib_assistant_init(ib_assistant_status_cb,void *);
bool ib_assistant_handle_line(ib_link_t,const char *,size_t);
bool ib_assistant_standalone(void);
bool ib_assistant_busy(void);
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
