// 会话OK手势仲裁：短按确认、长持采音、通知双击互斥；不访问音频/网络/UI。
#pragma once
#include "ib_protocol.h"
#include <stdbool.h>
#include <stdint.h>

#define IB_DIALOGUE_HOLD_MS 180u
#define IB_DIALOGUE_DOUBLE_MS 280u
typedef enum {
    IB_DIALOGUE_KEY_NONE,IB_DIALOGUE_KEY_RECORD_START,IB_DIALOGUE_KEY_RECORD_STOP,
    IB_DIALOGUE_KEY_CONFIRM,IB_DIALOGUE_KEY_NOTICE_DISMISS,IB_DIALOGUE_KEY_NOTICE_JUMP,
    IB_DIALOGUE_KEY_LATEST,IB_DIALOGUE_KEY_UNAVAILABLE
} ib_dialogue_key_action_t;
typedef struct {
    bool notification,dialogue,online,can_record,can_confirm,can_latest;
} ib_dialogue_key_context_t;
typedef struct {
    bool consumed;
    ib_dialogue_key_action_t action;
    uint32_t gesture;
} ib_dialogue_key_result_t;
typedef struct {
    bool pressed,recording,pending_tap,second,notice_press,blocked,has_up,ignore_press,latest_press;
    uint32_t counter,gesture;
    int64_t down_at,tap_until,last_up;
} ib_dialogue_keys_t;
// reset撤销未完成手势但保留本boot计数；调用方先停止可能正在进行的真实录音。
void ib_dialogue_keys_reset(ib_dialogue_keys_t *);
ib_dialogue_key_result_t ib_dialogue_keys_event(ib_dialogue_keys_t *,ib_key_ev_t,int64_t now,ib_dialogue_key_context_t);
// app收到按键前和周期tick均调用；时间只用于手势分辨，不模拟任何ASR/业务完成。
ib_dialogue_key_result_t ib_dialogue_keys_tick(ib_dialogue_keys_t *,int64_t now,ib_dialogue_key_context_t);
