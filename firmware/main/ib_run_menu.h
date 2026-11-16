// 本地运行模式菜单纯逻辑：只消费手势/选择，不访问UI、NVS或网络。
#pragma once
#include "ib_protocol.h"
#include <stdbool.h>
#include <stdint.h>
#define IB_RUN_MENU_TIMEOUT_MS 30000
#define IB_RUN_MENU_ROWS 3u
typedef enum { IB_RUN_ACT_NONE,IB_RUN_ACT_OPEN,IB_RUN_ACT_CHANGED,IB_RUN_ACT_CONFIRM,IB_RUN_ACT_CLOSE,IB_RUN_ACT_SHORT_UP } ib_run_action_t;
typedef struct {bool consumed;ib_run_action_t action;} ib_run_result_t;
typedef struct {
    bool open,tracking_up,entry_up,wake_only;
    bool pressed[IB_KEY_COUNT];
    unsigned selected;
    int64_t touched;
} ib_run_menu_t;
void ib_run_menu_open(ib_run_menu_t *,bool standalone,int64_t now);
void ib_run_menu_close(ib_run_menu_t *);
ib_run_result_t ib_run_menu_key(ib_run_menu_t *,ib_key_t,ib_key_ev_t,int64_t now,bool standalone,bool dark);
bool ib_run_menu_expired(ib_run_menu_t *,int64_t now);
typedef enum { IB_RUN_READY,IB_RUN_UNAVAILABLE,IB_RUN_BUSY,IB_RUN_UPLOAD_ACTIVE,IB_RUN_WIFI_REQUIRED,IB_RUN_PROFILE_REQUIRED,IB_RUN_RESTARTING } ib_run_mode_check_t;
ib_run_mode_check_t ib_run_mode_check(bool current,bool requested,bool available,bool busy,bool uploading,bool wifi,bool profile,bool restarting);
