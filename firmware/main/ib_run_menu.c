#include "ib_run_menu.h"
void ib_run_menu_open(ib_run_menu_t *m,bool standalone,int64_t now){m->open=true;m->selected=standalone?0:1;m->touched=now;}
void ib_run_menu_close(ib_run_menu_t *m){m->open=false;m->tracking_up=false;m->entry_up=false;}
ib_run_result_t ib_run_menu_key(ib_run_menu_t *m,ib_key_t key,ib_key_ev_t event,int64_t now,bool standalone,bool dark){
    ib_run_result_t result={false,IB_RUN_ACT_NONE};if((unsigned)key>=IB_KEY_COUNT)return result;
    if(m->open){
        result.consumed=true;m->touched=now;
        if(event==IB_KEY_EV_DOWN)m->pressed[key]=true;
        else if(event==IB_KEY_EV_LONG&&key==IB_KEY_OK&&m->pressed[key]){ib_run_menu_close(m);result.action=IB_RUN_ACT_CLOSE;}
        else if(event==IB_KEY_EV_UP&&m->pressed[key]){
            m->pressed[key]=false;
            if(key==IB_KEY_UP&&m->entry_up)m->entry_up=false;
            else if(key==IB_KEY_UP||key==IB_KEY_DOWN){m->selected=(m->selected+(key==IB_KEY_UP?IB_RUN_MENU_ROWS-1:1))%IB_RUN_MENU_ROWS;result.action=IB_RUN_ACT_CHANGED;}
            else if(key==IB_KEY_OK)result.action=IB_RUN_ACT_CONFIRM;
        }
        return result;
    }
    // 菜单关闭时仍吞掉由本地菜单开始的那次松开，不泄漏半个按键给Mac。
    if(m->pressed[key]){result.consumed=true;if(event==IB_KEY_EV_UP)m->pressed[key]=false;return result;}
    if(key!=IB_KEY_UP)return result;
    if(event==IB_KEY_EV_DOWN){m->tracking_up=true;m->wake_only=dark;result.consumed=true;}
    else if(event==IB_KEY_EV_LONG&&m->tracking_up){
        m->tracking_up=false;m->pressed[IB_KEY_UP]=true;m->entry_up=true;ib_run_menu_open(m,standalone,now);
        result.consumed=true;result.action=IB_RUN_ACT_OPEN;
    }else if(event==IB_KEY_EV_UP&&m->tracking_up){m->tracking_up=false;result.consumed=true;result.action=IB_RUN_ACT_SHORT_UP;}
    else if(event==IB_KEY_EV_EXTRA_LONG)result.consumed=true;
    return result;
}
bool ib_run_menu_expired(ib_run_menu_t *m,int64_t now){if(!m->open||now-m->touched<IB_RUN_MENU_TIMEOUT_MS)return false;ib_run_menu_close(m);return true;}
ib_run_mode_check_t ib_run_mode_check(bool current,bool requested,bool available,bool busy,bool uploading,bool wifi,bool profile,bool restarting){
    if(current==requested)return IB_RUN_READY;
    if(!available)return IB_RUN_UNAVAILABLE;
    if(restarting)return IB_RUN_RESTARTING;
    if(busy)return IB_RUN_BUSY;
    if(uploading)return IB_RUN_UPLOAD_ACTIVE;
    if(requested&&!wifi)return IB_RUN_WIFI_REQUIRED;
    if(requested&&!profile)return IB_RUN_PROFILE_REQUIRED;
    return IB_RUN_READY;
}
