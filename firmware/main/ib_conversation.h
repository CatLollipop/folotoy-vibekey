// 设备只保当前聊天阅读窗与事务暂存；原会话、全文和发送所有权始终归Mac。
#pragma once
#include "ib_link.h"
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#define IB_CONVERSATION_TEXT_MAX 128u
#define IB_CONVERSATION_ITEMS_MAX 4u
typedef enum {IB_CONV_DIALOGUE,IB_CONV_PET} ib_conversation_view_t;
typedef enum {IB_CONV_ASSISTANT,IB_CONV_USER,IB_CONV_DRAFT} ib_conversation_role_t;
typedef enum {IB_CONV_DELIVERY_NONE,IB_CONV_DELIVERY_DRAFT,IB_CONV_DELIVERY_SUBMITTING,IB_CONV_DELIVERY_QUEUED,IB_CONV_DELIVERY_ACCEPTED,IB_CONV_DELIVERY_ADMITTED,IB_CONV_DELIVERY_FAILED,IB_CONV_DELIVERY_UNKNOWN} ib_conversation_delivery_t;
typedef enum {IB_CONV_IDLE,IB_CONV_RECORDING,IB_CONV_TRANSCRIBING,IB_CONV_READY,IB_CONV_SENDING,IB_CONV_WORKING,IB_CONV_WAITING,IB_CONV_DONE,IB_CONV_ERROR,IB_CONV_UNKNOWN} ib_conversation_phase_t;
typedef struct {char mid[17],text[129];uint8_t role,delivery;bool head,tail,trunc;} ib_conversation_item_t;
typedef struct {
    uint32_t wid,drev;uint16_t page,pages,unread;uint8_t n;bool following,older;
    ib_conversation_item_t item[IB_CONVERSATION_ITEMS_MAX];
} ib_conversation_window_t;
typedef struct {
    bool bound,writable;char sid[33],title[33],error[33];uint32_t rev,drev,revision;
    ib_conversation_view_t view;ib_conversation_phase_t phase;
    ib_conversation_window_t window,stage;uint8_t stage_mask;bool staging;
    uint32_t pending_gid,consumed_drev,last_result_gid;bool pending_jump;int64_t feedback_until;
    uint32_t last_action_gid,record_gid;
} ib_conversation_t;
void ib_conversation_reset(ib_conversation_t *);
bool ib_conversation_can_record(const ib_conversation_t *);
bool ib_conversation_can_confirm(const ib_conversation_t *);
bool ib_conversation_can_latest(const ib_conversation_t *);
bool ib_conversation_input_owner(const ib_conversation_t *,bool standalone,bool online,bool menu);
bool ib_conversation_accept_mic(const ib_conversation_t *,bool owned_recording);
// app唯一消费者执行；begin/item不调用GUI，完整commit经GUI验证后才发布并ACK。
typedef const char *(*ib_conversation_apply_fn)(const ib_conversation_t *,void *);
bool ib_conversation_handle(ib_conversation_t *,const char *,size_t,char *,size_t,int64_t now,ib_conversation_apply_fn,void *);
const char *ib_conversation_mark_action(ib_conversation_t *,uint32_t gid,bool jump);
void ib_conversation_note_event(ib_conversation_t *,uint32_t gid,bool recording);
void ib_conversation_feedback(ib_conversation_t *,const char *machine_code,int64_t now);
// 所有事件带boot/gid；jump只带不透明nid/nrev，其他事件携带固定binding/drev。
size_t ib_conversation_event(char *,size_t,const char *action,const ib_conversation_t *,uint32_t gid,uint32_t boot,const char *nid,uint32_t nrev);
