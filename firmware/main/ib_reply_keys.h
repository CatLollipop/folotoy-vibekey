// 仅回复正文可见时延迟短按下键，长按仍重放完整legacy按键对供网络/会话菜单使用。
#pragma once
#include "ib_protocol.h"
#include <stdbool.h>
typedef struct {bool tracking,long_sent,wake_only;} ib_reply_keys_t;
typedef enum {IB_REPLY_KEY_NONE,IB_REPLY_KEY_NEXT,IB_REPLY_KEY_LONG,IB_REPLY_KEY_RELEASE} ib_reply_key_action_t;
typedef struct {bool consumed;ib_reply_key_action_t action;} ib_reply_key_result_t;
ib_reply_key_result_t ib_reply_keys_down(ib_reply_keys_t *,ib_key_t,ib_key_ev_t,bool visible,bool menu,bool dark);
