#pragma once
#include "ib_conversation.h"
#include "ib_ui_gfx.h"
// 内部模块：GUI锁内消费typed聊天窗，最多4片段；不读取全史/网络/官方会话。
typedef void (*ib_conversation_pet_draw_fn)(const ib_fx_t *,int,int);
void ib_conversation_ui_init(lv_obj_t *,ib_conversation_pet_draw_fn);
bool ib_conversation_ui_apply(const ib_conversation_t *,bool enabled);
void ib_conversation_ui_suspend(bool,bool block_feedback);
bool ib_conversation_ui_active(void);
bool ib_conversation_ui_owned(void);
const char *ib_conversation_ui_focus_text(void);
uint16_t ib_conversation_ui_page(void);
uint16_t ib_conversation_ui_pages(void);
bool ib_conversation_ui_confirm(void);
bool ib_conversation_ui_record(void);
bool ib_conversation_ui_latest(void);
void ib_conversation_ui_capture(bool);
void ib_conversation_ui_frame(uint32_t now);
void ib_conversation_ui_pet_changed(void);
