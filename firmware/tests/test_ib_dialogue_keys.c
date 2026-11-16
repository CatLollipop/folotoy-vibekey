#include "ib_dialogue_keys.h"
#include <assert.h>
#include <stdio.h>
static ib_dialogue_key_context_t dialog={.dialogue=true,.online=true,.can_record=true,.can_confirm=true};
static ib_dialogue_key_context_t notice={.notification=true,.dialogue=true,.online=true,.can_record=true,.can_confirm=true};
int main(void){
    ib_dialogue_keys_t s={0};
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,100,dialog).action==IB_DIALOGUE_KEY_NONE);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,180,dialog).action==IB_DIALOGUE_KEY_CONFIRM);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,181,dialog).action==IB_DIALOGUE_KEY_NONE);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,300,dialog);
    assert(ib_dialogue_keys_tick(&s,479,dialog).action==IB_DIALOGUE_KEY_NONE);
    ib_dialogue_key_result_t start=ib_dialogue_keys_tick(&s,480,dialog);assert(start.action==IB_DIALOGUE_KEY_RECORD_START);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_LONG,1300,dialog).action==IB_DIALOGUE_KEY_NONE);
    ib_dialogue_key_result_t stop=ib_dialogue_keys_event(&s,IB_KEY_EV_UP,1400,dialog);
    assert(stop.action==IB_DIALOGUE_KEY_RECORD_STOP&&stop.gesture==start.gesture);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,1600,notice);ib_dialogue_keys_event(&s,IB_KEY_EV_UP,1650,notice);
    assert(ib_dialogue_keys_tick(&s,1929,notice).action==IB_DIALOGUE_KEY_NONE);
    assert(ib_dialogue_keys_tick(&s,1930,notice).action==IB_DIALOGUE_KEY_NOTICE_DISMISS);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,2100,notice);ib_dialogue_keys_event(&s,IB_KEY_EV_UP,2150,notice);
    uint32_t first=s.gesture;ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,2250,notice);
    ib_dialogue_key_result_t jump=ib_dialogue_keys_event(&s,IB_KEY_EV_UP,2300,notice);
    assert(jump.action==IB_DIALOGUE_KEY_NOTICE_JUMP&&jump.gesture==first);
    assert(ib_dialogue_keys_tick(&s,2600,notice).action==IB_DIALOGUE_KEY_NONE);
    // ADC之外再拒60ms回弹，不能把一次点击的抖动变成跳转。
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,2650,notice);ib_dialogue_keys_event(&s,IB_KEY_EV_UP,2690,notice);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,2700,notice);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,2720,notice).action==IB_DIALOGUE_KEY_NONE);
    ib_dialogue_keys_reset(&s);
    // 双击第二下转成长持：仅启动一次识别，不产生jump/confirm。
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,2800,notice);ib_dialogue_keys_event(&s,IB_KEY_EV_UP,2850,notice);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,2950,notice);
    assert(ib_dialogue_keys_tick(&s,3130,notice).action==IB_DIALOGUE_KEY_RECORD_START);
    assert(ib_dialogue_keys_tick(&s,3200,notice).action==IB_DIALOGUE_KEY_NONE);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,3250,notice).action==IB_DIALOGUE_KEY_RECORD_STOP);
    ib_dialogue_key_context_t offline=dialog;offline.online=false;
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,3400,offline);
    assert(ib_dialogue_keys_tick(&s,3580,offline).action==IB_DIALOGUE_KEY_UNAVAILABLE);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,3600,offline).action==IB_DIALOGUE_KEY_NONE);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,3700,dialog);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,3900,dialog).action==IB_DIALOGUE_KEY_UNAVAILABLE);
    uint32_t count=s.counter;ib_dialogue_keys_reset(&s);assert(s.counter==count&&!s.pressed&&!s.pending_tap);
    s.counter=UINT32_MAX;ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,4000,dialog);assert(s.gesture==1);
    ib_dialogue_keys_reset(&s);ib_dialogue_key_context_t history=dialog;history.can_latest=true;history.can_confirm=false;
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,4200,history);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,4250,history).action==IB_DIALOGUE_KEY_LATEST);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,4400,history);
    assert(ib_dialogue_keys_tick(&s,4580,history).action==IB_DIALOGUE_KEY_RECORD_START);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,4650,history).action==IB_DIALOGUE_KEY_RECORD_STOP);
    ib_dialogue_keys_reset(&s);ib_dialogue_key_context_t pet=dialog;pet.can_latest=true;pet.can_confirm=false;
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,4800,pet);
    // 即使dialogue投影在本次松开前到达，PET首按也不能变成发送。
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,4850,dialog).action==IB_DIALOGUE_KEY_LATEST);
    ib_dialogue_keys_event(&s,IB_KEY_EV_DOWN,5000,dialog);
    assert(ib_dialogue_keys_event(&s,IB_KEY_EV_UP,5050,dialog).action==IB_DIALOGUE_KEY_CONFIRM);
    puts("Dialogue OK: short-confirm/hold-once/release-stop, notification single/double/second-hold, offline/reset/wrap passed.");
}
