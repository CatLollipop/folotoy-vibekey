#include "ib_reply_keys.h"
ib_reply_key_result_t ib_reply_keys_down(ib_reply_keys_t *s,ib_key_t key,ib_key_ev_t event,bool visible,bool menu,bool dark){
    ib_reply_key_result_t r={false,IB_REPLY_KEY_NONE};if(key!=IB_KEY_DOWN)return r;
    if(s->tracking){
        r.consumed=true;
        if(event==IB_KEY_EV_UP){r.action=s->long_sent?IB_REPLY_KEY_RELEASE:!menu&&!s->wake_only?IB_REPLY_KEY_NEXT:IB_REPLY_KEY_NONE;s->tracking=s->long_sent=false;}
        else if(event==IB_KEY_EV_LONG&&!s->long_sent&&!menu&&!s->wake_only){s->long_sent=true;r.action=IB_REPLY_KEY_LONG;}
        return r;
    }
    if(visible&&!menu&&event==IB_KEY_EV_DOWN){s->tracking=true;s->wake_only=dark;r.consumed=true;}
    return r;
}
