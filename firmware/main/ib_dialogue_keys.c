#include "ib_dialogue_keys.h"
#include "ib_keys.h"
#include <string.h>
static ib_dialogue_key_result_t result(ib_dialogue_keys_t *s,ib_dialogue_key_action_t action){
    return (ib_dialogue_key_result_t){true,action,s->gesture};
}
void ib_dialogue_keys_reset(ib_dialogue_keys_t *s){
    uint32_t counter=s->counter;memset(s,0,sizeof(*s));s->counter=counter;
}
static void start_press(ib_dialogue_keys_t *s,int64_t now,bool notification){
    s->pressed=true;s->down_at=now;s->notice_press=notification;s->recording=s->blocked=false;
    s->gesture=++s->counter;if(!s->gesture)s->gesture=++s->counter;
}
ib_dialogue_key_result_t ib_dialogue_keys_tick(ib_dialogue_keys_t *s,int64_t now,ib_dialogue_key_context_t c){
    if(s->pressed&&!s->recording&&!s->blocked&&now-s->down_at>=IB_DIALOGUE_HOLD_MS){
        s->pending_tap=false;s->second=false;
        if(!c.online||!c.can_record){s->blocked=true;return result(s,IB_DIALOGUE_KEY_UNAVAILABLE);}
        s->recording=true;return result(s,IB_DIALOGUE_KEY_RECORD_START);
    }
    if(s->pending_tap&&!s->pressed&&now>=s->tap_until){
        s->pending_tap=false;return result(s,IB_DIALOGUE_KEY_NOTICE_DISMISS);
    }
    return (ib_dialogue_key_result_t){s->pressed||s->pending_tap,IB_DIALOGUE_KEY_NONE,s->gesture};
}
ib_dialogue_key_result_t ib_dialogue_keys_event(ib_dialogue_keys_t *s,ib_key_ev_t event,int64_t now,ib_dialogue_key_context_t c){
    if(event==IB_KEY_EV_DOWN){
        if(s->pressed)return result(s,IB_DIALOGUE_KEY_NONE);
        if(s->has_up&&now-s->last_up<IB_KEYS_REPRESS_LOCKOUT_MS){s->ignore_press=true;return result(s,IB_DIALOGUE_KEY_NONE);}
        if(s->pending_tap&&now<s->tap_until){
            // 通知同一次两击只用首击identity；第二击仍可转成长持录音，不能先跳再录。
            s->pressed=true;s->second=true;s->down_at=now;s->notice_press=true;s->recording=s->blocked=false;
            return result(s,IB_DIALOGUE_KEY_NONE);
        }
        bool expired=s->pending_tap;s->pending_tap=false;s->second=false;
        if(!c.notification&&!c.dialogue)return (ib_dialogue_key_result_t){0};
        start_press(s,now,expired?false:c.notification);
        return result(s,expired?IB_DIALOGUE_KEY_NOTICE_DISMISS:IB_DIALOGUE_KEY_NONE);
    }
    if(s->ignore_press){if(event==IB_KEY_EV_UP)s->ignore_press=false;return result(s,IB_DIALOGUE_KEY_NONE);}
    if(!s->pressed)return (ib_dialogue_key_result_t){s->pending_tap,IB_DIALOGUE_KEY_NONE,s->gesture};
    if(event==IB_KEY_EV_LONG||event==IB_KEY_EV_EXTRA_LONG)return ib_dialogue_keys_tick(s,now,c);
    if(event!=IB_KEY_EV_UP)return result(s,IB_DIALOGUE_KEY_NONE);
    s->pressed=false;s->has_up=true;s->last_up=now;
    if(s->recording){s->recording=false;s->pending_tap=false;s->second=false;return result(s,IB_DIALOGUE_KEY_RECORD_STOP);}
    if(s->blocked){s->blocked=false;return result(s,IB_DIALOGUE_KEY_NONE);}
    // 调度延迟导致长持未真正启动录音时，松开不能降级成“确认发送”。
    if(now-s->down_at>=IB_DIALOGUE_HOLD_MS){s->pending_tap=false;s->second=false;return result(s,IB_DIALOGUE_KEY_UNAVAILABLE);}
    if(s->notice_press){
        if(s->second){s->second=false;s->pending_tap=false;return result(s,IB_DIALOGUE_KEY_NOTICE_JUMP);}
        s->pending_tap=true;s->tap_until=now+IB_DIALOGUE_DOUBLE_MS;return result(s,IB_DIALOGUE_KEY_NONE);
    }
    // 松开已开始的长持永远只stop，只有一次新的短按才能确认草稿。
    if(c.online&&c.can_confirm)return result(s,IB_DIALOGUE_KEY_CONFIRM);
    return result(s,IB_DIALOGUE_KEY_UNAVAILABLE);
}
