#include "test_common.h"
#include "ib_run_menu.h"
static int64_t now;
static ib_run_result_t key(ib_run_menu_t *m,ib_key_t k,ib_key_ev_t e){now+=100;return ib_run_menu_key(m,k,e,now,false,false);}
static void tap(ib_run_menu_t *m,ib_key_t k){CHECK(key(m,k,IB_KEY_EV_DOWN).consumed);CHECK(key(m,k,IB_KEY_EV_UP).consumed);}
int main(void){
    ib_run_menu_t menu={0};
    CHECK(key(&menu,IB_KEY_UP,IB_KEY_EV_DOWN).consumed);CHECK(!menu.open);
    CHECK(key(&menu,IB_KEY_UP,IB_KEY_EV_UP).action==IB_RUN_ACT_SHORT_UP);CHECK(!menu.open);
    CHECK(!key(&menu,IB_KEY_DOWN,IB_KEY_EV_DOWN).consumed);
    CHECK(key(&menu,IB_KEY_UP,IB_KEY_EV_DOWN).action==IB_RUN_ACT_NONE);
    CHECK(key(&menu,IB_KEY_UP,IB_KEY_EV_LONG).action==IB_RUN_ACT_OPEN);CHECK(menu.open&&menu.selected==1);
    CHECK(key(&menu,IB_KEY_UP,IB_KEY_EV_EXTRA_LONG).action==IB_RUN_ACT_NONE);
    CHECK(key(&menu,IB_KEY_UP,IB_KEY_EV_UP).action==IB_RUN_ACT_NONE);CHECK(menu.selected==1);
    tap(&menu,IB_KEY_UP);CHECK(menu.selected==0);
    tap(&menu,IB_KEY_UP);CHECK(menu.selected==2);
    tap(&menu,IB_KEY_DOWN);CHECK(menu.selected==0);
    CHECK(key(&menu,IB_KEY_OK,IB_KEY_EV_DOWN).action==IB_RUN_ACT_NONE);
    CHECK(key(&menu,IB_KEY_OK,IB_KEY_EV_UP).action==IB_RUN_ACT_CONFIRM);CHECK(menu.open);
    CHECK(ib_run_mode_check(false,true,true,true,false,true,true,false)==IB_RUN_BUSY);CHECK(menu.open);
    CHECK(key(&menu,IB_KEY_OK,IB_KEY_EV_DOWN).consumed);
    CHECK(key(&menu,IB_KEY_OK,IB_KEY_EV_LONG).action==IB_RUN_ACT_CLOSE);CHECK(!menu.open);
    CHECK(key(&menu,IB_KEY_OK,IB_KEY_EV_UP).consumed);
    CHECK(!key(&menu,IB_KEY_OK,IB_KEY_EV_DOWN).consumed);
    ib_run_menu_t dark={0};CHECK(ib_run_menu_key(&dark,IB_KEY_UP,IB_KEY_EV_DOWN,100,false,true).consumed);
    CHECK(ib_run_menu_key(&dark,IB_KEY_UP,IB_KEY_EV_UP,200,false,false).action==IB_RUN_ACT_SHORT_UP);CHECK(dark.wake_only);
    ib_run_menu_t timeout={0};ib_run_menu_open(&timeout,true,1000);CHECK(timeout.selected==0);
    CHECK(!ib_run_menu_expired(&timeout,30999));CHECK(ib_run_menu_expired(&timeout,31000));CHECK(!timeout.open);
    now=40000;ib_run_menu_open(&timeout,false,40000);CHECK(key(&timeout,IB_KEY_OK,IB_KEY_EV_DOWN).consumed);
    int64_t touched=timeout.touched;CHECK(ib_run_menu_expired(&timeout,touched+IB_RUN_MENU_TIMEOUT_MS));
    CHECK(key(&timeout,IB_KEY_OK,IB_KEY_EV_UP).consumed);CHECK(!key(&timeout,IB_KEY_OK,IB_KEY_EV_DOWN).consumed);
    CHECK(ib_run_mode_check(false,false,false,true,true,false,false,true)==IB_RUN_READY);
    CHECK(ib_run_mode_check(false,true,false,false,false,true,true,false)==IB_RUN_UNAVAILABLE);
    CHECK(ib_run_mode_check(false,true,true,false,false,true,true,true)==IB_RUN_RESTARTING);
    CHECK(ib_run_mode_check(false,true,true,false,true,true,true,false)==IB_RUN_UPLOAD_ACTIVE);
    CHECK(ib_run_mode_check(false,true,true,false,false,false,false,false)==IB_RUN_WIFI_REQUIRED);
    CHECK(ib_run_mode_check(false,true,true,false,false,true,false,false)==IB_RUN_PROFILE_REQUIRED);
    CHECK(ib_run_mode_check(false,true,true,false,false,true,true,false)==IB_RUN_READY);
    CHECK(ib_run_mode_check(true,false,true,false,false,false,false,false)==IB_RUN_READY);
    CHECK(!ib_run_menu_key(&menu,(ib_key_t)IB_KEY_COUNT,IB_KEY_EV_DOWN,now,false,false).consumed);
    TEST_DONE("run_menu");
}
