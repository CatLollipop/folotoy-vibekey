#pragma once
#include "ib_ui.h"
#include "lvgl.h"
// 独立通知读层只渲染提交完成的正文；调用方持有GUI锁，不改cloud reply或会话状态。
void ib_notification_create(lv_obj_t *screen);
bool ib_notification_show(uint32_t,const char *,ib_ui_notification_kind_t,bool,size_t,ib_ui_reply_reader_fn,void *);
void ib_notification_hide(void);
bool ib_notification_page(int);
bool ib_notification_active(void);
uint16_t ib_notification_index(void);
uint16_t ib_notification_total(void);
void ib_notification_suspend(bool);
void ib_notification_frame(uint32_t now_ms);
