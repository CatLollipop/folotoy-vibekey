#pragma once
#include <stdbool.h>
#include <stddef.h>

/* UI只消费语义状态；机器状态/错误码在边界适配，绝不按英文显示文案推断业务。 */
typedef enum {
    IB_UI_ASSIST_IDLE, IB_UI_ASSIST_PREPARING, IB_UI_ASSIST_LISTENING,
    IB_UI_ASSIST_TRANSCRIBING, IB_UI_ASSIST_THINKING, IB_UI_ASSIST_REPLYING,
    IB_UI_ASSIST_DONE, IB_UI_ASSIST_ERROR, IB_UI_ASSIST_STOPPED,
    IB_UI_ASSIST_SPEAKING, IB_UI_ASSIST_COUNT
} ib_ui_assistant_phase_t;

typedef enum {
    IB_UI_CONN_WAITING, IB_UI_CONN_USB_LINKED, IB_UI_CONN_BLE_LINKED,
    IB_UI_CONN_BLE_ONLY, IB_UI_CONN_WIFI_READY, IB_UI_CONN_SETUP,
    IB_UI_CONN_ADD_WIFI_USB, IB_UI_CONN_SWITCH_BLE, IB_UI_CONN_SWITCH_WIFI,
    IB_UI_CONN_WIFI_FAILED, IB_UI_CONN_BLE_MODE, IB_UI_CONN_CONNECTING,
    IB_UI_CONN_CHECK_USB, IB_UI_CONN_NO_RESPONSE, IB_UI_CONN_RECONNECT,
    IB_UI_CONN_COUNT
} ib_ui_connection_hint_t;

typedef enum {
    IB_UI_RUN_MODE_NOTICE_NONE, IB_UI_RUN_MODE_NOTICE_BUSY, IB_UI_RUN_MODE_NOTICE_WIFI_REQUIRED,
    IB_UI_RUN_MODE_NOTICE_PROFILE_REQUIRED, IB_UI_RUN_MODE_NOTICE_SAVE_FAILED,
    IB_UI_RUN_MODE_NOTICE_UNAVAILABLE, IB_UI_RUN_MODE_NOTICE_RESTARTING, IB_UI_RUN_MODE_NOTICE_UPLOADING,
    IB_UI_RUN_MODE_NOTICE_COUNT
} ib_ui_run_mode_notice_t;

const char *ib_ui_assistant_label(ib_ui_assistant_phase_t phase,bool standalone,const char *error_code);
const char *ib_ui_connection_label(ib_ui_connection_hint_t hint);
/* Aora协议状态名是稳定机器ID；未包含会话内容、第三方应用名或英语文案翻译规则。 */
const char *ib_ui_pet_label(const char *canonical_state,bool standalone);
const char *ib_ui_run_mode_title(void);
const char *ib_ui_run_mode_item(unsigned row);
const char *ib_ui_run_mode_notice(ib_ui_run_mode_notice_t notice);
const char *ib_ui_conversation_text(unsigned index);
const char *ib_ui_conversation_error(const char *machine_code);
/* 只读枚举文本，供host逐字符验证当前静态OFL字库，不需要设备侧测试缓冲。 */
size_t ib_ui_label_count(void);
const char *ib_ui_label_at(size_t index);
