#include "test_common.h"
#include "ib_reply_keys.h"
int main(void){
    ib_reply_keys_t s={0};CHECK(!ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_DOWN,false,false,false).consumed);
    CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_DOWN,true,false,false).consumed);CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_UP,true,false,false).action==IB_REPLY_KEY_NEXT);
    CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_DOWN,true,false,false).consumed);CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_LONG,true,false,false).action==IB_REPLY_KEY_LONG);CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_UP,true,true,false).action==IB_REPLY_KEY_RELEASE);
    CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_DOWN,true,false,true).consumed);CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_UP,true,false,false).action==IB_REPLY_KEY_NONE);
    CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_DOWN,true,false,false).consumed);CHECK(ib_reply_keys_down(&s,IB_KEY_DOWN,IB_KEY_EV_UP,false,true,false).action==IB_REPLY_KEY_NONE);
    CHECK(!ib_reply_keys_down(&s,IB_KEY_UP,IB_KEY_EV_DOWN,true,false,false).consumed);
    TEST_DONE("reply_keys");
}
