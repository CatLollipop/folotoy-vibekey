// main/ib_app.c: VibeKey 应用核心(状态机)。
//
// 线程模型:
//   button 组件任务    ib_app_on_button()   只投递按键事件
//   USB 接收任务       on_usb_line()        解析命令后投递
//   NimBLE host 任务   on_ble_line/link()   解析命令或订阅变化后投递
//   ib_app 任务        app_task()           唯一消费者:发送协议消息、驱动 UI / 音频 / 背光、读电量
// 应用状态只在 ib_app 任务中读写,不需要额外的锁。麦克风帧由 ib_audio 的麦克风任务直接经 audio_tx() 发送。
//
// 时序要点:
//   - 15 s 没收到命令、bye、USB 拔线、BLE 断开 → 对应链路离线;两条都离线 → OFFLINE 时钟页并停麦克风。
//     USB 拔线按 SOF 检测,连续 1 s 不在位才算(ib_links_usb_present 去抖),短暂中断不会闪出离线页。
//   - 离线不清除 Mac 最后下发的状态(st / mode / msg),恢复在线后直接回到对应页面;
//     done / err 这类短暂结果页在离线时直接收拢到常驻页。重启后的初始状态是 idle。
//   - 点亮屏幕的来源:按键、state 变化、Agent 通知、链路由离线变在线。config(Mac 每 5 分钟重发一次
//     校准时钟)不点亮屏幕;screen_off 改变后按新值从最近一次活动时刻重新计算,立即生效。
//   - config.mic=1 时,在线、IDLE、非字幕模式下 OK 键按下的瞬间就开始推送麦克风(不等 mic 命令);
//     2 s 内 Mac 没切到 rec,或 Mac 下发 proc/done/err/sub(以及 600 ms 宽限期之后的 idle)就停止。
//   - done 页 1.2 s、err 页 2 s 后自行回到 IDLE 动画。
//   - Agent 通知:done 15 s 后自动关闭;input 每 20 s 重复提示音,直到按键或 clear。
//   - 列表页:收到 st=list 且收到过 list 命令才显示(两者先后不限);离开 list 状态后旧列表作废。
#include "ib_app.h"

#include "bsp_battery.h"
#include "bsp_display.h"
#include "ib_audio.h"
#include "ib_assistant.h"
#include "ib_reply_keys.h"
#include "ib_notification.h"
#include "ib_assistant_store.h"
#include "ib_pet_bundle.h"
#include "ib_pet.h"
#include "ib_run_menu.h"
#include "ib_conversation.h"
#include "ib_dialogue_keys.h"
#include "ib_cloud_stream.h"
#include "cJSON.h"
#include "ib_ble.h"
#include "ib_charge.h"
#include "ib_clock.h"
#include "ib_keys.h"
#include "ib_links.h"
#include "ib_protocol.h"
#include "ib_ui.h"
#include "ib_usb.h"
#include "ib_wallpaper.h"
#include "ib_wifi.h"

#include "esp_app_desc.h"
#include "esp_bt.h"
#include "esp_check.h"
#include "esp_log.h"
#include "esp_heap_caps.h"
#include "esp_random.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/semphr.h"
#include "freertos/task.h"
#include "nvs_flash.h"

#include <string.h>
#include <stdlib.h>

static const char *TAG = "ib_app";

_Static_assert((int)BSP_BTN_UP == (int)IB_KEY_UP && (int)BSP_BTN_DOWN == (int)IB_KEY_DOWN &&
               (int)BSP_BTN_OK == (int)IB_KEY_OK, "bsp_btn_t and ib_key_t must share the same order");
_Static_assert((int)IB_UI_KEY_UP == (int)IB_KEY_UP && (int)IB_UI_KEY_DOWN == (int)IB_KEY_DOWN &&
               (int)IB_UI_KEY_OK == (int)IB_KEY_OK, "ib_ui_key_t and ib_key_t must share the same order");

#define EVENT_QUEUE_LEN      16
#define APP_TASK_STACK       8192
#define APP_TASK_PRIO        5
#define LOOP_PERIOD_MS       100
#define BATTERY_PERIOD_MS    60000
#define BACKLIGHT_ON         80
#define DEFAULT_SCREEN_OFF_S 60
#define DONE_HOLD_MS         1200
#define ERR_HOLD_MS          2000
#define MIC_LOCAL_GRACE_MS   600    // 本地开麦后这段时间内收到的 idle 不停麦(Mac 还没来得及切 rec)
#define MIC_LOCAL_WAIT_MS    2000   // 本地开麦后 Mac 迟迟不切 rec 就停麦
#define MIC_TAIL_MS          500    // 离开 rec 进入 proc 后继续推流的最长时间(Mac 要录完尾音,等它发 mic off)
#define AGENT_DONE_MS        15000
#define AGENT_CHIME_MS       20000
#define BLE_FALLBACK_MS      25000  // Wi-Fi 配置存在但 25 秒拿不到 IP 时切 BLE 单栈

typedef enum {
    EV_KEY,
    EV_COMMAND,
    EV_LINK,
} ev_type_t;

typedef struct {
    ev_type_t type;
    ib_link_t link;         // EV_COMMAND
    ib_key_t key;           // EV_KEY
    ib_key_ev_t key_ev;     // EV_KEY
    bool subscribed;        // EV_LINK
    uint16_t command_size;
    char *command_line;
    int64_t key_at;         // 物理沿时间；队列/绘制延迟不能把长持误判成短按确认。
} app_event_t;

static portMUX_TYPE s_assist_lock = portMUX_INITIALIZER_UNLOCKED;
static struct {
    ib_assistant_state_t state;
    char text[192];
    uint32_t revision;
    bool cloud_target,has_phase,owned;
    const char *companion_error; /* getter仅返回只读机器码常量，无动态生命周期。 */
} s_assist_view;
static uint32_t s_assist_seen, s_pet_config_seen;
static SemaphoreHandle_t s_pet_apply_lock,s_reply_apply_lock,s_boot_frame_done;
static uint32_t s_reply_ui_seen,s_reply_ui_generation;
static bool s_boot_ui_ready,s_reply_nav_replaying,s_reply_up_text,s_reply_down_blocked;
static ib_reply_keys_t s_reply_keys;
static SemaphoreHandle_t s_notification_ui_lock;
static uint32_t s_notification_ui_generation,s_notification_ui_revision,s_notification_blocked_generation;
static int64_t s_notification_deadline;
static bool s_notification_chime_pending,s_notification_clear_legacy;
static char s_notification_chime_id[33];
static ib_sound_t s_notification_sound;
static uint32_t s_completion_revision,s_completion_seen;
static esp_partition_mmap_handle_t s_pet_mapping;
static bool s_pet_mapping_live;
static ib_run_menu_t s_run_menu;
static ib_conversation_t s_conversation;
static ib_dialogue_keys_t s_dialogue_keys;
static struct {char sid[33],nid[33];uint32_t rev,drev,nrev;bool solo;} s_dialogue_owner;
static int64_t s_conversation_deadline;
static bool s_jump_binding_ready;
static uint32_t s_conversation_ui_seen;static bool s_conversation_ui_enabled;
static bool s_run_replaying;
static ib_ui_run_mode_notice_t s_run_notice;
static QueueHandle_t s_queue;
static TaskHandle_t s_app_task;
static volatile bool s_app_ready,s_buttons_ready;
static bool s_ble_budget;
static bool s_ui_ok;
static bool s_battery_ok;
static bool s_audio_ok;
static uint32_t s_boot_id;
static char s_build_id[IB_BUILD_ID_LEN + 1];   // ELF SHA-256 前 8 位,hello 里上报
static uint32_t s_seq;

// 链路
static ib_links_t s_links;
static bool s_online;
static bool s_usb_present;
static bool s_ble_subscribed;
static int s_ui_link = -1;
static int s_ui_online = -1;

// Mac 下发的设置
static bool s_cfg_mic;
static bool s_cfg_sound = true;
static int64_t s_screen_off_ms = DEFAULT_SCREEN_OFF_S * 1000;

// Mac 下发的状态与当前显示
static ib_state_t s_st = IB_ST_IDLE;
static ib_mode_t s_mode = IB_MODE_DICT;
// 「常驻」页面:最近一次 idle / sub 状态的模式、页面和 msg。done / err 自动返回时回到这里,
// 而不是 rec / proc 带来的听写模式和默认空闲页(否则字幕模式或字幕运行时会短暂闪出错误的页面)。
static ib_mode_t s_home_mode = IB_MODE_DICT;
static ib_state_t s_home_st = IB_ST_IDLE;
static char s_home_msg[IB_TEXT_MAX];
static int64_t s_mic_tail_until;
static char s_msg[IB_TEXT_MAX];
static char s_caption_src[IB_CAPTION_MAX];
static char s_caption_dst[IB_CAPTION_MAX];
static char s_caption_app[IB_CAPTION_APP_MAX];
static bool s_caption_live;
// OFFLINE 页按 OK 请求 Mac 重新握手;CONNECTING → NO RESPONSE → 可再次尝试。
static int64_t s_wake_until;
static bool s_wake_failed;
// OFFLINE 页本地网络列表：不经过 Mac，直接切 NVS 中的 active 网络后重启。
#define WIFI_MENU_TIMEOUT_MS 30000
static bool s_wifi_menu;
static bool s_wifi_menu_ok;
static uint8_t s_wifi_menu_sel;
static int64_t s_wifi_menu_touched;
static int64_t s_wifi_restart_at;
static bool s_ble_only;
static bool s_ble_manual;
static int64_t s_wifi_missing_since;
static ib_ui_connection_hint_t offline_hint(void);
static ib_ui_screen_t screen_for(ib_state_t st);
static void refresh_assistant(int64_t now);
static bool reply_apply(void *context);
static bool notification_apply(void *context);
static bool notification_hide(void *context);
static void refresh_boot_frame(void);
static void handle_key(ib_key_t,ib_key_ev_t,int64_t);
static void conversation_refresh(int64_t now);
static bool conversation_key(ib_key_t,ib_key_ev_t,int64_t);
static bool notification_has_text(void);
static bool conversation_command(ib_link_t,const char *,size_t,int64_t);
_Static_assert(IB_CAPTION_MAX == IB_UI_CAPTION_MAX, "caption buffer size mismatch");
_Static_assert(IB_CAPTION_APP_MAX == IB_UI_CAPTION_APP_MAX, "caption app buffer size mismatch");
static ib_ui_screen_t s_screen = IB_UI_OFFLINE;
static int64_t s_revert_at;             // done/err 自动回 IDLE 的时刻,0 表示无
static bool s_list_ready;               // 收到过当前这轮的 list 命令
static int64_t s_restart_at;            // 壁纸写入成功后延迟重启,先让 ack 发出去

// 按键
static ib_keys_t s_keys;

// 麦克风:本地(OK 键)开启时记下时刻,等待 Mac 切到 rec 确认
static bool s_mic_local;
static int64_t s_mic_local_ms;
// 熄屏时 OK 直接开麦:在 Mac 确认 rec 前锁住 REC 页,别让迟到的 idle / usage 覆盖。
static bool s_mic_prestart;
static bool s_mic_prestart_long;

// Agent 通知
static bool s_agent_on;
static ib_agent_ev_t s_agent_kind;
static int64_t s_agent_deadline;        // done 自动关闭时刻
static int64_t s_agent_next_chime;      // input 下次提醒时刻

// 背光
static bool s_backlight_on;
static int64_t s_last_activity_ms;

// 电量:s_soc / s_mv 是电量计原始读数;s_charge_view 是经 ib_charge 推断后显示 / 上报的电量与充电状态。
static int s_soc = -1;
static int s_mv = -1;
static ib_charge_t s_charge;
static ib_charge_view_t s_charge_view = { .soc = -1, .charging = false };
static int64_t s_last_battery_ms;

// 时钟:Mac 下发本地时间时记下当时的 esp_timer 读数,之后按流逝时间推算
static bool s_clock_valid;
static uint32_t s_clock_local;
static int64_t s_clock_synced_ms;
static int64_t s_clock_minute = -1;

static int64_t now_ms(void)
{
    return esp_timer_get_time() / 1000 + 1;     // +1:保证非 0(ib_links 用 0 表示离线)
}

// ---------------------------------------------------------------------------
// 事件生产者(其它任务):只投递,不阻塞。
// ---------------------------------------------------------------------------

void ib_app_on_button(bsp_btn_t btn, bsp_btn_ev_t ev, void *user)
{
    (void)user;
    if (!s_queue || (unsigned)btn >= IB_KEY_COUNT) return;
    app_event_t event = { .type = EV_KEY, .key = (ib_key_t)btn,.key_at=now_ms() };
    switch (ev) {
    case BSP_BTN_PRESS: event.key_ev = IB_KEY_EV_DOWN; break;
    case BSP_BTN_RELEASE: event.key_ev = IB_KEY_EV_UP; break;
    case BSP_BTN_LONG: event.key_ev = IB_KEY_EV_LONG; break;
    case BSP_BTN_EXTRA_LONG: event.key_ev = IB_KEY_EV_EXTRA_LONG; break;
    default: return;
    }
    xQueueSend(s_queue, &event, 0);
}

static void post_command(ib_link_t link, const char *line, size_t len)
{
    // 队列只持有小事件；实际长度的JSON归消费者所有，入队失败立即释放。
    // 避免16项常驻1744B解析结构，同时保留突发命令/按键的队列容量。
    if(!s_queue||len>=IB_LINE_MAX)return;
    app_event_t event={.type=EV_COMMAND,.link=link,.command_size=len,.command_line=malloc(len+1)};
    if(!event.command_line)return;
    memcpy(event.command_line,line,len);event.command_line[len]=0;
    if(xQueueSend(s_queue,&event,0)!=pdTRUE)free(event.command_line);
}

static void on_usb_line(const char *line, size_t len)
{
    if (!ib_assistant_handle_line(IB_LINK_USB,line,len) && !ib_wifi_handle_usb_line(line, len)) post_command(IB_LINK_USB, line, len);
}

static void on_ble_line(const char *line, size_t len)
{
    if (!ib_assistant_handle_line(IB_LINK_BLE,line,len) && !ib_wifi_handle_control_line(line, len, false)) post_command(IB_LINK_BLE, line, len);
}

static void on_ble_link(bool subscribed)
{
    app_event_t event = { .type = EV_LINK, .link = IB_LINK_BLE, .subscribed = subscribed };
    xQueueSend(s_queue, &event, 0);
}

static void on_wifi_line(const char *line, size_t len)
{
    if (!ib_assistant_handle_line(IB_LINK_WIFI,line,len) && !ib_wifi_handle_control_line(line, len, false)) post_command(IB_LINK_WIFI, line, len);
}
static void on_wifi_link(bool connected)
{
    app_event_t event = { .type = EV_LINK, .link = IB_LINK_WIFI, .subscribed = connected };
    xQueueSend(s_queue, &event, 0);
}

// 麦克风帧发送,运行在麦克风任务里。
static void audio_tx(ib_link_t link, const uint8_t *frame, size_t len)
{
    if (link == IB_LINK_USB) {
        ib_usb_send_bin(frame, len);
    } else {
        if (link == IB_LINK_BLE) ib_ble_send_audio(frame, len);
        else ib_wifi_send_audio(frame, len);
    }
}

// ---------------------------------------------------------------------------
// 以下只在 ib_app 任务中调用。
// ---------------------------------------------------------------------------

static void send_to(ib_link_t link, const char *msg, size_t len)
{
    if (len == 0) return;
    if (link == IB_LINK_USB) {
        ib_usb_send(msg, len);
    } else {
        if (link == IB_LINK_BLE) ib_ble_send(msg, len);
        else ib_wifi_send((const uint8_t *)msg, len);
    }
}

// 发给所有在线链路;Mac 用 (boot, seq) 对 key 事件去重。
static void send_alive(const char *msg, size_t len, int64_t now)
{
    for (int i = 0; i < IB_LINK_COUNT; i++) {
        if (ib_links_alive(&s_links, (ib_link_t)i, now)) send_to((ib_link_t)i, msg, len);
    }
}

static void set_backlight(bool on)
{
    if(on&&!s_boot_ui_ready)return;
    if (on == s_backlight_on) return;
    s_backlight_on = on;
    if (!s_ui_ok) return;
    bsp_display_backlight(on ? BACKLIGHT_ON : 0);
    ib_ui_set_awake(on);
}

static void wake(int64_t now)
{
    s_last_activity_ms = now;
    set_backlight(true);
}

static bool play(ib_sound_t sound)
{
    if(!s_cfg_sound)return true; //尊重用户静音，不在日后开启声音时补播旧事件。
    return s_audio_ok&&ib_audio_play(sound);
}

static ib_ui_mode_t ui_mode(void)
{
    return s_mode == IB_MODE_TR ? IB_UI_MODE_TR : s_mode == IB_MODE_SUB ? IB_UI_MODE_SUB : IB_UI_MODE_DICT;
}

static void show_screen(ib_ui_screen_t screen)
{
    if(s_run_menu.open||s_wifi_menu)return;
    s_screen = screen;
    if (s_ui_ok) ib_ui_show(screen, ui_mode(), s_msg);
}

static void wifi_menu_close(void);
static void wifi_menu_update(int64_t now)
{
    size_t count = ib_wifi_network_count();
    if (!count) { wifi_menu_close(); return; }
    size_t total = count + 1;       // 最后一个固定是蓝牙模式
    if (s_wifi_menu_sel >= total) s_wifi_menu_sel = (uint8_t)ib_wifi_active_network();
    s_wifi_menu_touched = now;
    if (!s_ui_ok) return;
    ib_ui_list_t list = { 0 };
    snprintf(list.title, sizeof(list.title), "WIFI / BLUETOOTH");
    size_t rows = total > IB_UI_LIST_ROWS ? IB_UI_LIST_ROWS : total;
    size_t network_rows = count < rows ? count : rows;
    for (size_t i = 0; i < network_rows; i++) {
        char ssid[IB_UI_LIST_TEXT_MAX - 2];
        if (!ib_wifi_network_name(i, ssid, sizeof(ssid))) break;
        snprintf(list.items[i], sizeof(list.items[i]), "%s%s",
                 i == ib_wifi_active_network() ? "* " : "  ", ssid);
    }
    if (rows > network_rows) snprintf(list.items[network_rows], sizeof(list.items[network_rows]), "  USE BLUETOOTH");
    list.rows = (uint8_t)rows;
    list.n = (uint16_t)total;
    list.top = 0;
    list.sel = s_wifi_menu_sel;
    // 本地列表与Mac会话列表分开，首帧直接提交；后台prepare/idle不能抢走owner。
    s_screen=IB_UI_LIST;ib_ui_local_menu_show(&list);
}

static void wifi_menu_end(void)
{
    s_wifi_menu = false;
    s_wifi_menu_ok = false;
    ib_keys_reset(&s_keys);
    if(s_ui_ok)ib_ui_local_menu_hide();
}
static void wifi_menu_close(void)
{
    wifi_menu_end();
    if(ib_assistant_standalone()){show_screen(IB_UI_IDLE);s_assist_seen=0;refresh_assistant(now_ms());}
    else if (!s_online) {
        if (s_ui_ok) ib_ui_set_connection_hint(offline_hint());
        show_screen(IB_UI_OFFLINE);
    } else show_screen(s_st==IB_ST_LIST&&!s_list_ready?IB_UI_IDLE:screen_for(s_st));
}

static bool wifi_menu_key(ib_key_t key, ib_key_ev_t ev, int64_t now)
{
    if (!s_wifi_menu &&
        ((ev == IB_KEY_EV_EXTRA_LONG && key == IB_KEY_UP) ||
         (ev == IB_KEY_EV_LONG && key == IB_KEY_DOWN && (!s_online || s_ble_only || ib_assistant_standalone()))) &&
        (s_screen == IB_UI_IDLE || s_screen == IB_UI_USAGE || s_screen == IB_UI_OFFLINE)) {
        if (ib_wifi_network_count() == 0) {
            if (s_ui_ok) ib_ui_set_connection_hint(IB_UI_CONN_ADD_WIFI_USB);
            return true;
        }
        s_wifi_menu = true;
        s_wifi_menu_ok = false;
        s_wifi_menu_sel = (uint8_t)ib_wifi_active_network();
        // 菜单内按键由固件消费，松开事件不会再经过 ib_keys；清掉底层按下态，避免下一次按键被当成重复 down。
        ib_keys_reset(&s_keys);
        wifi_menu_update(now);
        return true;
    }
    if (!s_wifi_menu) return false;

    s_wifi_menu_touched = now;
    size_t count = ib_wifi_network_count();
    if (!count) { wifi_menu_close(); return true; }
    size_t total = count + 1;
    if (key == IB_KEY_OK) {
        if (ev == IB_KEY_EV_DOWN) {
            s_wifi_menu_ok = true;
        } else if (ev == IB_KEY_EV_LONG) {
            wifi_menu_close();
        } else if (ev == IB_KEY_EV_UP && s_wifi_menu_ok) {
            s_wifi_menu_ok = false;
            size_t selected = s_wifi_menu_sel;
            if (selected == count) {
                wifi_menu_end();
                ib_wifi_request_bluetooth();
                if (s_ui_ok) ib_ui_set_connection_hint(IB_UI_CONN_SWITCH_BLE);
                show_screen(IB_UI_OFFLINE);
                s_wifi_restart_at = now + 700;
            // active_network 只是 NVS 里的首选配置；处于 BLE 或 Wi-Fi 离线时，选同一项仍应重启尝试 Wi-Fi。
            } else if (selected == ib_wifi_active_network()
                       && ib_links_alive(&s_links, IB_LINK_WIFI, now)) {
                wifi_menu_close();
            } else if (ib_wifi_select_network(selected)) {
                ib_wifi_clear_ble_fallback();
                wifi_menu_end();
                if (s_ui_ok) ib_ui_set_connection_hint(IB_UI_CONN_SWITCH_WIFI);
                show_screen(IB_UI_OFFLINE);
                s_wifi_restart_at = now + 700;
            } else if (s_ui_ok) {
                ib_ui_set_connection_hint(IB_UI_CONN_WIFI_FAILED);
            }
        }
        return true;
    }
    if (ev == IB_KEY_EV_DOWN && key == IB_KEY_UP) {
        s_wifi_menu_sel = s_wifi_menu_sel == 0 ? (uint8_t)(total - 1) : (uint8_t)(s_wifi_menu_sel - 1);
        wifi_menu_update(now);
    } else if (ev == IB_KEY_EV_DOWN && key == IB_KEY_DOWN) {
        s_wifi_menu_sel = (uint8_t)((s_wifi_menu_sel + 1) % total);
        wifi_menu_update(now);
    }
    return true;
}

// ---- 麦克风 ----

static void mic_stop(void)
{
    s_mic_local = false;
    s_mic_prestart = false;
    s_mic_prestart_long = false;
    if (!s_audio_ok || !ib_audio_mic_active()) return;
    ib_audio_mic_stop();
    ib_ble_set_audio_mode(false);
}

static void mic_start(ib_link_t link, bool local, int64_t now)
{
    if (!s_audio_ok||ib_assistant_store_uploading()) return;
    if (ib_audio_mic_active() && ib_audio_mic_link() != link) mic_stop();
    if (ib_assistant_companion_mic_start(link) != ESP_OK) return;
    s_mic_prestart = false;
    s_mic_prestart_long = false;
    s_mic_local = local;
    s_mic_local_ms = now;
    ib_ble_set_audio_mode(link == IB_LINK_BLE);
}

// ---- Agent 通知 ----

static void agent_clear(void)
{
    if (!s_agent_on) return;
    s_agent_on = false;
    if (s_ui_ok) ib_ui_agent_hide();
}

static void agent_show(ib_agent_ev_t kind, const char *source, int64_t now)
{
    s_agent_on = true;
    s_agent_kind = kind;
    s_agent_deadline = now + AGENT_DONE_MS;
    s_agent_next_chime = now + AGENT_CHIME_MS;
    if (s_ui_ok) ib_ui_agent_show(kind == IB_AGENT_DONE ? IB_UI_AGENT_DONE : IB_UI_AGENT_INPUT, source);
    play(kind == IB_AGENT_DONE ? IB_SOUND_AGENT_DONE : IB_SOUND_AGENT_INPUT);
    wake(now);
}

// Agent 全屏通知层是否在接收按键(录音中只显示横幅,按键照常工作)。
static bool agent_capturing(void)
{
    return s_agent_on && s_screen != IB_UI_REC;
}

// ---- 时钟与电量 ----

static void refresh_clock(int64_t now, bool force)
{
    if (!s_ui_ok) return;
    if (!s_clock_valid) {
        if (force) ib_ui_set_clock("", "");
        return;
    }
    uint32_t local = s_clock_local + (uint32_t)((now - s_clock_synced_ms) / 1000);
    int64_t minute = local / 60;
    if (!force && minute == s_clock_minute) return;
    s_clock_minute = minute;
    char t[IB_CLOCK_TIME_LEN];
    char d[IB_CLOCK_DATE_LEN];
    ib_clock_format(local, t, d);
    ib_ui_set_clock(t, d);
}

static void send_battery(ib_link_t link)
{
    char msg[IB_MSG_MAX];
    send_to(link, msg, ib_format_battery(msg, sizeof(msg), s_charge_view.soc, s_mv, s_charge_view.charging));
}

static void refresh_battery(int64_t now, bool force)
{
    if (!force && now - s_last_battery_ms < BATTERY_PERIOD_MS) return;
    s_last_battery_ms = now;
    if (s_battery_ok) {
        // I2C 读取带 100 ms 超时,放在应用任务里不会阻塞按键回调。
        s_soc = bsp_battery_soc();
        s_mv = bsp_battery_mv();
    }
    // 板上没有充电状态引脚:由 ib_charge 推断充电中 / 已充满(见 ib_charge.h)。
    s_charge_view = ib_charge_update(&s_charge, s_usb_present, s_soc, s_mv, now);
    if (s_ui_ok) ib_ui_set_battery(s_charge_view.soc, s_charge_view.charging);
    for (int i = 0; i < IB_LINK_COUNT; i++) {
        if (ib_links_alive(&s_links, (ib_link_t)i, now)) send_battery((ib_link_t)i);
    }
}

// Wi-Fi 已配置但始终拿不到 IP 时，重启到 BLE 单栈；C3 内存不足以让两套无线协议栈常驻。
static void refresh_ble_fallback(int64_t now)
{
    if (ib_assistant_standalone()||!s_ble_budget) return;
    if (s_ble_only) {
        // 自动回退时，插回 USB 说明用户回到电脑旁；手动选蓝牙则尊重用户选择。
        if (!s_ble_manual && s_usb_present && !s_restart_at) {
            ib_wifi_clear_ble_fallback();
            s_restart_at = now + 500;
        }
        return;
    }
    if (!ib_wifi_is_configured() || s_usb_present || ib_wifi_is_ready()) {
        s_wifi_missing_since = 0;
        return;
    }
    if (!s_wifi_missing_since) s_wifi_missing_since = now;
    if (now - s_wifi_missing_since < BLE_FALLBACK_MS || s_restart_at) return;
    if (s_ui_ok) ib_ui_set_connection_hint(IB_UI_CONN_BLE_MODE);
    ib_wifi_request_ble_fallback();
    s_restart_at = now + 500;
}

// ---- 状态 ----

static ib_ui_screen_t screen_for(ib_state_t st)
{
    switch (st) {
    case IB_ST_REC: return IB_UI_REC;
    case IB_ST_PROC: return IB_UI_PROC;
    case IB_ST_DONE: return IB_UI_DONE;
    case IB_ST_ERR: return IB_UI_ERR;
    case IB_ST_SUB: return IB_UI_SUB;
    case IB_ST_USAGE: return IB_UI_USAGE;
    // 列表内容还没到时保持当前页面(离线页除外,回到 IDLE),等 list 命令到达再切换。
    case IB_ST_LIST: return s_list_ready ? IB_UI_LIST : (s_screen == IB_UI_OFFLINE ? IB_UI_IDLE : s_screen);
    default: return IB_UI_IDLE;
    }
}

static void apply_state(const ib_cmd_t *cmd, int64_t now)
{
    ib_state_t prev = s_st;
    s_st = cmd->state;
    bool prestart_hold = s_mic_prestart && s_mic_local
        && (s_st == IB_ST_IDLE || s_st == IB_ST_USAGE || s_st == IB_ST_SUB)
        && now - s_mic_local_ms < MIC_LOCAL_WAIT_MS;
    if (!prestart_hold) s_mic_prestart = false;
    if (prev == IB_ST_LIST && s_st != IB_ST_LIST) s_list_ready = false;
    if (cmd->has_mode) s_mode = cmd->mode;
    if (cmd->has_msg) {
        memcpy(s_msg, cmd->msg, sizeof(s_msg));
    } else {
        s_msg[0] = '\0';
    }
    if (s_st == IB_ST_IDLE || s_st == IB_ST_SUB) {
        s_home_mode = s_mode;
        s_home_st = s_st;
        memcpy(s_home_msg, s_msg, sizeof(s_home_msg));
    }

    // 提示音:进入录音上行双音;离开录音下行双音;完成短促一声。
    if (s_st == IB_ST_REC && prev != IB_ST_REC) play(IB_SOUND_START);
    if (s_st == IB_ST_DONE && prev != IB_ST_DONE) {
        play(IB_SOUND_DONE);
    } else if (prev == IB_ST_REC && s_st != IB_ST_REC) {
        play(IB_SOUND_STOP);
    }

    // 麦克风:rec 确认本地开麦;其它状态停麦。例外:
    // - 本地刚开麦时收到的 idle / sub 给一个宽限期(Mac 还没来得及切 rec);
    // - rec → proc 继续推流,等 Mac 的 mic off(它要录完 150 ms 尾音),最多 MIC_TAIL_MS。
    if (s_st == IB_ST_REC) {
        s_mic_local = false;
        s_mic_tail_until = 0;
    } else if (s_audio_ok && ib_audio_mic_active()&&!(s_conversation.bound&&s_dialogue_keys.recording)) {
        bool grace = (s_st == IB_ST_IDLE || s_st == IB_ST_SUB || s_st == IB_ST_USAGE) && s_mic_local
            && now - s_mic_local_ms < (s_mic_prestart ? MIC_LOCAL_WAIT_MS : MIC_LOCAL_GRACE_MS);
        bool tail = s_st == IB_ST_PROC && prev == IB_ST_REC;
        if (tail) {
            s_mic_tail_until = now + MIC_TAIL_MS;
        } else if (!grace) {
            mic_stop();
        }
    }

    s_revert_at = s_st == IB_ST_DONE ? now + DONE_HOLD_MS : s_st == IB_ST_ERR ? now + ERR_HOLD_MS : 0;
    if (!prestart_hold) show_screen(screen_for(s_st));
    wake(now);
}

static void apply_list(const ib_cmd_t *cmd)
{
    ib_ui_list_t list;
    memset(&list, 0, sizeof(list));
    _Static_assert(IB_UI_LIST_ROWS == IB_LIST_ROWS, "list row count mismatch");
    _Static_assert(sizeof(list.title) == IB_LIST_TEXT_MAX && sizeof(list.items[0]) == IB_LIST_TEXT_MAX,
                   "list text size");
    memcpy(list.title, cmd->list_title, sizeof(list.title));
    memcpy(list.items, cmd->list_item, sizeof(list.items));
    list.rows = cmd->list_rows;
    list.n = cmd->list_n;
    list.top = cmd->list_top;
    list.sel = cmd->list_sel;
    if (s_ui_ok) ib_ui_set_list(&list);
    s_list_ready = true;
    if (s_st == IB_ST_LIST && s_screen != IB_UI_LIST) show_screen(IB_UI_LIST);
}

// done / err 结果页结束:状态回到常驻页面(idle 或字幕页)和它的模式、msg,只改状态不切页面。
// Mac 随后的 state 会再确认一次。
static void revert_home(void)
{
    s_revert_at = 0;
    s_st = s_home_st;
    s_mode = s_home_mode;
    memcpy(s_msg, s_home_msg, sizeof(s_msg));
}

// ---- 链路 ----

// 两条链路都离线:切到 OFFLINE 时钟页,停麦、清 Agent、复位按键。
// 不清除 Mac 最后下发的状态:恢复在线时 refresh_links 按 s_st 回到原页面(Mac 若重新握手也会重发 state)。
// 例外:done / err 是短暂结果页,离线期间不会再走 refresh_timers 的自动返回,直接收拢到常驻页,
// 否则恢复在线后会停在结果页上。列表内容作废(s_list_ready 清零),等 Mac 重新下发 list。
static ib_ui_connection_hint_t offline_hint(void)
{
    if (s_usb_present) return IB_UI_CONN_USB_LINKED;
    if (s_ble_subscribed) return IB_UI_CONN_BLE_LINKED;
    if (s_ble_only) return IB_UI_CONN_BLE_ONLY;
    if (ib_wifi_is_configured()) return IB_UI_CONN_WIFI_READY;
    return IB_UI_CONN_SETUP;
}

static void go_offline(void)
{
    mic_stop();
    agent_clear();
    ib_keys_reset(&s_keys);
    if (s_st == IB_ST_DONE || s_st == IB_ST_ERR) revert_home();
    s_revert_at = 0;
    s_mic_tail_until = 0;
    s_list_ready = false;
    s_wake_until = 0;
    s_wake_failed = false;
    if (s_ui_ok) {
        ib_ui_set_ok_held(false);
        ib_ui_set_level(0);
        ib_ui_set_connection_hint(offline_hint());
    }
    // 用户可能正在网络菜单里切网；链路刚掉时保留菜单，关掉后再落到离线页。
    if (!s_wifi_menu) {
        s_wifi_menu_ok = false;
        show_screen(IB_UI_OFFLINE);
    }
    refresh_clock(now_ms(), true);
}

static void refresh_links(int64_t now)
{
    // SOF 检测会短暂误报不在位,经 1 s 去抖后才认为拔线(见 IB_USB_ABSENT_CONFIRM_MS)。
    bool usb = ib_links_usb_present(&s_links, ib_usb_host_present(), now);
    if (!usb) {
        // 拔线收不到 bye:确认拔线后清除 USB 链路;Mac 此刻开始扫 BLE,切快速广播。
        ib_links_drop(&s_links, IB_LINK_USB);
        if (s_usb_present) ib_ble_boost_advertising();
    }
    if (usb != s_usb_present) {
        s_usb_present = usb;
        refresh_battery(now, true);     // 更新充电图标
        if (!s_online && s_ui_ok && s_wake_until == 0) {
            ib_ui_set_connection_hint(offline_hint());
        }
    }

    if(!ib_links_any(&s_links,now)){
        ib_assistant_companion_release();
        if(s_conversation.bound&&!ib_assistant_standalone()){
            mic_stop();ib_dialogue_keys_reset(&s_dialogue_keys);ib_conversation_reset(&s_conversation);
            s_conversation_deadline=0;s_jump_binding_ready=false;
        }
    }

    if (ib_assistant_standalone()) {
        s_online=false;
        if(s_ui_ok)ib_ui_set_link(ib_wifi_is_ready()?IB_UI_LINK_WIFI:IB_UI_LINK_NONE,ib_wifi_is_ready());
        return;
    }
    bool online = ib_links_any(&s_links, now);
    if (online != s_online) {
        s_online = online;
        if (online) {
            s_wake_until = 0;
            s_wake_failed = false;
            // 菜单打开时不要被链路恢复事件顶掉；关闭菜单时再恢复原页面。
            if (!s_wifi_menu) {
                s_wifi_menu_ok = false;
                show_screen(screen_for(s_st));      // 回到离线前 Mac 下发的页面
            }
            wake(now);                          // 真正重连,用户需要看到
        } else {
            // 离线不点亮:Mac 睡眠时 SOF 停止,去抖后设备离线;此时亮屏会表现为"熄了又自己亮"。
            go_offline();
        }
    }

    // 麦克风所在链路断开时停止。
    if (s_audio_ok && ib_audio_mic_active() && !ib_links_alive(&s_links, ib_audio_mic_link(), now)) mic_stop();

    ib_link_t pref = ib_links_preferred(&s_links, now);
    ib_ui_link_t ui_link;
    if (pref == IB_LINK_USB || (pref == IB_LINK_COUNT && usb)) {
        ui_link = IB_UI_LINK_USB;
    } else if (pref == IB_LINK_WIFI) {
        ui_link = IB_UI_LINK_WIFI;
    } else if (pref == IB_LINK_BLE || s_ble_subscribed) {
        ui_link = IB_UI_LINK_BLE;
    } else {
        ui_link = IB_UI_LINK_NONE;
    }
    if ((int)ui_link != s_ui_link || (int)online != s_ui_online) {
        s_ui_link = (int)ui_link;
        s_ui_online = (int)online;
        if (s_ui_ok) ib_ui_set_link(ui_link, online);
    }
}

static bool reply_has_text(void){
    if(s_screen==IB_UI_LIST||s_screen==IB_UI_USAGE||s_screen==IB_UI_SUB||s_screen==IB_UI_OFFLINE)return false;
    ib_reply_snapshot_t view;ib_reply_store_snapshot(&view);return view.active&&view.length>0;
}
static ib_link_t conversation_link(int64_t now){
    if(ib_links_alive(&s_links,IB_LINK_USB,now))return IB_LINK_USB;
    if(ib_links_alive(&s_links,IB_LINK_WIFI,now))return IB_LINK_WIFI;
    return IB_LINK_COUNT;
}
// 输入归属与视觉模式分开：PET同样只走新会话手势，不回落旧Mac录音路径。
static bool conversation_input_owned(void){return ib_conversation_input_owner(&s_conversation,ib_assistant_standalone(),s_online,s_run_menu.open||s_wifi_menu||s_screen==IB_UI_LIST);}
static uint32_t conversation_gid(void){uint32_t gid=++s_dialogue_keys.counter;if(!gid)gid=++s_dialogue_keys.counter;return gid;}
static void conversation_send(const char *action,uint32_t gid,bool pinned,int64_t now){
    ib_conversation_t owner={0};const ib_conversation_t *view=&s_conversation;
    if(pinned){owner.bound=s_dialogue_owner.sid[0]!=0;strcpy(owner.sid,s_dialogue_owner.sid);owner.rev=s_dialogue_owner.rev;owner.drev=s_dialogue_owner.drev;view=&owner;}
    char packet[256];size_t n=ib_conversation_event(packet,sizeof(packet),action,view,gid,s_boot_id,s_dialogue_owner.nid,s_dialogue_owner.nrev);
    ib_link_t link=conversation_link(now);if(link!=IB_LINK_COUNT&&n){ib_conversation_note_event(&s_conversation,gid,!strcmp(action,"record_start"));send_to(link,packet,n);}
}
static const char *conversation_apply(const ib_conversation_t *view,void *context){
    (void)context;return s_ui_ok?ib_ui_conversation_update(view,!ib_assistant_standalone()&&s_online):NULL;
}
static void conversation_refresh(int64_t now){
    bool enabled=!ib_assistant_standalone()&&s_online;
    if(s_conversation.feedback_until&&now>=s_conversation.feedback_until){s_conversation.error[0]=0;s_conversation.feedback_until=0;s_conversation.revision++;}
    if(s_conversation_deadline&&now>=s_conversation_deadline){s_conversation_deadline=0;s_conversation.pending_gid=0;s_conversation.pending_jump=false;s_conversation.phase=IB_CONV_UNKNOWN;ib_conversation_feedback(&s_conversation,"unknown",now);}
    if(s_jump_binding_ready&&enabled){if(ib_assistant_notification_dismiss())s_jump_binding_ready=false;}
    if(s_conversation_ui_seen!=s_conversation.revision||s_conversation_ui_enabled!=enabled){
        if(!conversation_apply(&s_conversation,NULL)){s_conversation_ui_seen=s_conversation.revision;s_conversation_ui_enabled=enabled;}
    }
}
static ib_dialogue_key_context_t conversation_context(int64_t now){
    bool solo=ib_assistant_standalone(),online=conversation_link(now)!=IB_LINK_COUNT;
    bool available=solo?!ib_assistant_busy():ib_conversation_can_record(&s_conversation);
    return (ib_dialogue_key_context_t){notification_has_text(),conversation_input_owned(),solo||online,
        available&&!s_conversation.pending_gid&&!s_run_menu.open&&!s_wifi_menu&&!ib_assistant_store_uploading(),ib_conversation_can_confirm(&s_conversation)};
}
static void conversation_action(ib_dialogue_key_result_t r,int64_t now){
    if(r.action==IB_DIALOGUE_KEY_NONE)return;
    switch(r.action){
    case IB_DIALOGUE_KEY_RECORD_START:
        if(!ib_assistant_notification_dismiss()){ib_dialogue_keys_reset(&s_dialogue_keys);ib_conversation_feedback(&s_conversation,"busy",now);break;}
        if(s_dialogue_owner.solo)ib_assistant_press();
        else conversation_send("record_start",r.gesture,true,now);
        break;
    case IB_DIALOGUE_KEY_RECORD_STOP:
        if(s_dialogue_owner.solo)ib_assistant_release();
        else{mic_stop();conversation_send("record_stop",r.gesture,true,now);}
        break;
    case IB_DIALOGUE_KEY_CONFIRM:
        if(!strcmp(s_dialogue_owner.sid,s_conversation.sid)&&s_dialogue_owner.rev==s_conversation.rev&&s_dialogue_owner.drev==s_conversation.drev&&!ib_conversation_mark_action(&s_conversation,r.gesture,false)){
            conversation_send("confirm",r.gesture,true,now);s_conversation_deadline=now+8000;
        }else ib_conversation_feedback(&s_conversation,"stale",now);
        break;
    case IB_DIALOGUE_KEY_NOTICE_DISMISS:(void)ib_assistant_notification_dismiss();break;
    case IB_DIALOGUE_KEY_NOTICE_JUMP:{
        ib_notification_snapshot_t notice;ib_notification_snapshot(&notice);
        if(conversation_link(now)==IB_LINK_COUNT)ib_conversation_feedback(&s_conversation,"no_mac",now);
        else if(!notice.active||strcmp(notice.nid,s_dialogue_owner.nid)||notice.rev<s_dialogue_owner.nrev)ib_conversation_feedback(&s_conversation,"stale",now);
        else if(notice.kind!=IB_NOTIFICATION_DONE)ib_conversation_feedback(&s_conversation,"unavailable",now);
        else if(ib_conversation_mark_action(&s_conversation,r.gesture,true))ib_conversation_feedback(&s_conversation,"busy",now);
        else{conversation_send("jump",r.gesture,true,now);s_conversation_deadline=now+8000;}
        break;}
    case IB_DIALOGUE_KEY_UNAVAILABLE:
        ib_conversation_feedback(&s_conversation,conversation_link(now)==IB_LINK_COUNT?"no_mac":!s_conversation.bound?"unbound":!s_conversation.writable?"read_only":"busy",now);break;
    default:break;
    }
    conversation_refresh(now);wake(now);
}
static bool conversation_key(ib_key_t key,ib_key_ev_t event,int64_t now){
    if(key!=IB_KEY_OK)return false;
    bool owned=s_dialogue_keys.pressed||s_dialogue_keys.pending_tap||s_dialogue_keys.ignore_press;
    if(!owned&&(s_run_menu.open||s_wifi_menu||s_screen==IB_UI_LIST))return false;
    ib_dialogue_key_context_t ctx=conversation_context(now);
    if(!owned&&!ctx.dialogue&&!ctx.notification)return false;
    if(event==IB_KEY_EV_DOWN&&!s_dialogue_keys.pressed&&!s_dialogue_keys.pending_tap){
        memset(&s_dialogue_owner,0,sizeof(s_dialogue_owner));strcpy(s_dialogue_owner.sid,s_conversation.sid);
        s_dialogue_owner.rev=s_conversation.rev;s_dialogue_owner.drev=s_conversation.drev;s_dialogue_owner.solo=ib_assistant_standalone();
        ib_notification_snapshot_t notice;ib_notification_snapshot(&notice);if(notice.active){strcpy(s_dialogue_owner.nid,notice.nid);s_dialogue_owner.nrev=notice.rev;}
    }
    ib_dialogue_key_result_t r=ib_dialogue_keys_event(&s_dialogue_keys,event,now,ctx);
    if(r.consumed){if(event==IB_KEY_EV_DOWN)wake(now);conversation_action(r,now);}return r.consumed;
}
static bool conversation_command(ib_link_t link,const char *line,size_t length,int64_t now){
    if(!strstr(line,"\"conversation\""))return false;
    if(link==IB_LINK_BLE)return true;
    ib_links_seen(&s_links,link,now);refresh_links(now);
    char response[256],previous_sid[33];strcpy(previous_sid,s_conversation.sid);uint32_t previous_rev=s_conversation.rev;
    bool pending_jump=s_conversation.pending_jump;
    if(!ib_conversation_handle(&s_conversation,line,length,response,sizeof(response),now,conversation_apply,NULL))return false;
    bool changed=strcmp(previous_sid,s_conversation.sid)||previous_rev!=s_conversation.rev;
    if(changed){
        if(s_dialogue_keys.recording){if(s_dialogue_owner.solo)ib_assistant_release();else{mic_stop();conversation_send("record_stop",s_dialogue_keys.gesture,true,now);}}
        ib_dialogue_keys_reset(&s_dialogue_keys);ib_keys_reset(&s_keys);
        if(pending_jump&&s_conversation.bound)s_jump_binding_ready=true;
        if(s_conversation.bound&&!ib_assistant_standalone())show_screen(IB_UI_IDLE);
    }
    if(!s_conversation.pending_gid)s_conversation_deadline=0;
    if(pending_jump&&!s_conversation.pending_jump&&s_conversation.feedback_until)s_jump_binding_ready=false;
    if(s_dialogue_keys.recording&&!s_dialogue_owner.solo&&(s_conversation.phase==IB_CONV_ERROR||s_conversation.phase==IB_CONV_UNKNOWN||
       (s_conversation.last_result_gid==s_dialogue_keys.gesture&&s_conversation.feedback_until))){
        mic_stop();ib_dialogue_keys_reset(&s_dialogue_keys);
    }
    send_to(link,response,strlen(response));conversation_refresh(now);wake(now);return true;
}
static bool notification_has_text(void){return s_ui_ok&&ib_ui_notification_visible();}
static bool text_has_page(void){return notification_has_text()||conversation_input_owned()||reply_has_text();}
static void text_page(int delta,int64_t now){
    if(notification_has_text()){
        (void)ib_ui_notification_page(delta);
        if(xSemaphoreTake(s_notification_ui_lock,pdMS_TO_TICKS(50))==pdTRUE){s_notification_deadline=now+30000;xSemaphoreGive(s_notification_ui_lock);}
    }else if(conversation_input_owned()){
        const ib_conversation_pane_t *p=s_conversation.focus==IB_CONV_AGENT?&s_conversation.agent:&s_conversation.draft;
        if(p->text[0]&&((delta<0&&p->page>1)||(delta>0&&p->page<p->pages)))conversation_send(delta<0?"page_prev":"page_next",conversation_gid(),false,now);
    }else if(s_ui_ok)(void)ib_ui_reply_page(delta);
}
static bool reply_down_key(ib_key_t key,ib_key_ev_t event,int64_t now){
    if(s_reply_nav_replaying)return false;
    ib_reply_key_result_t r=ib_reply_keys_down(&s_reply_keys,key,event,text_has_page(),s_run_menu.open||s_wifi_menu,!s_backlight_on);
    if(!r.consumed)return false;
    if(event==IB_KEY_EV_DOWN)wake(now);
    if(r.action==IB_REPLY_KEY_NEXT)text_page(1,now);
    else if(r.action==IB_REPLY_KEY_LONG){if(ib_assistant_standalone()&&ib_assistant_busy()){s_reply_down_blocked=true;return true;}s_reply_nav_replaying=true;handle_key(key,IB_KEY_EV_DOWN,now-1);handle_key(key,IB_KEY_EV_LONG,now);s_reply_nav_replaying=false;}
    else if(r.action==IB_REPLY_KEY_RELEASE){if(s_reply_down_blocked){s_reply_down_blocked=false;return true;}s_reply_nav_replaying=true;handle_key(key,IB_KEY_EV_UP,now);s_reply_nav_replaying=false;}
    return true;
}

static ib_ui_run_mode_notice_t run_notice(const char *error){
    if(!error)return IB_UI_RUN_MODE_NOTICE_NONE;
    if(!strcmp(error,"busy"))return IB_UI_RUN_MODE_NOTICE_BUSY;
    if(!strcmp(error,"upload_active"))return IB_UI_RUN_MODE_NOTICE_UPLOADING;
    if(!strcmp(error,"wifi_required"))return IB_UI_RUN_MODE_NOTICE_WIFI_REQUIRED;
    if(!strcmp(error,"profile_required"))return IB_UI_RUN_MODE_NOTICE_PROFILE_REQUIRED;
    if(!strcmp(error,"save_failed"))return IB_UI_RUN_MODE_NOTICE_SAVE_FAILED;
    if(!strcmp(error,"restarting"))return IB_UI_RUN_MODE_NOTICE_RESTARTING;
    return IB_UI_RUN_MODE_NOTICE_UNAVAILABLE;
}
static ib_ui_run_mode_notice_t run_current_notice(void){
    return ib_assistant_store_uploading()?IB_UI_RUN_MODE_NOTICE_UPLOADING:ib_assistant_mode_busy()?IB_UI_RUN_MODE_NOTICE_BUSY:IB_UI_RUN_MODE_NOTICE_NONE;
}
static void run_menu_render(void){
    s_screen=IB_UI_LIST;
    if(s_ui_ok)ib_ui_run_mode_menu(ib_assistant_standalone(),s_run_menu.selected,s_run_notice);
}
static void run_menu_close(int64_t now){
    ib_run_menu_close(&s_run_menu);ib_keys_reset(&s_keys);
    if(s_ui_ok)ib_ui_run_mode_menu_hide();
    // 热切后先按实际mode重新计算已存在的USB/WiFi链路，不能借旧standalone的s_online闪一次OFFLINE。
    refresh_links(now);
    ib_ui_screen_t restore=ib_assistant_standalone()?IB_UI_IDLE:!s_online?IB_UI_OFFLINE:(s_st==IB_ST_LIST&&!s_list_ready)?IB_UI_IDLE:screen_for(s_st);
    show_screen(restore);s_assist_seen=0;refresh_assistant(now);wake(now);
}
static bool run_menu_key(ib_key_t key,ib_key_ev_t event,int64_t now){
    if(s_run_replaying||s_wifi_menu)return false;
    if(s_run_menu.open&&ib_assistant_take_restart_request())return true;
    ib_run_result_t result=ib_run_menu_key(&s_run_menu,key,event,now,ib_assistant_standalone(),!s_backlight_on);
    if(!result.consumed)return false;
    if(event==IB_KEY_EV_DOWN)wake(now);
    switch(result.action){
    case IB_RUN_ACT_OPEN:
        s_reply_up_text=false;ib_keys_reset(&s_keys);s_run_notice=run_current_notice();run_menu_render();break;
    case IB_RUN_ACT_CHANGED:s_run_notice=run_current_notice();run_menu_render();break;
    case IB_RUN_ACT_CLOSE:run_menu_close(now);break;
    case IB_RUN_ACT_CONFIRM:{
        if(s_run_menu.selected==2||(s_run_menu.selected==0)==ib_assistant_standalone()){run_menu_close(now);break;}
        s_run_notice=IB_UI_RUN_MODE_NOTICE_RESTARTING;run_menu_render(); //既有enum保留，UI文案现为正在切换。
        const char *error=ib_assistant_request_mode(s_run_menu.selected==0);
        if(!error){run_menu_close(now);break;}
        s_run_notice=run_notice(error);run_menu_render();break;
    }
    case IB_RUN_ACT_SHORT_UP:
        if(s_reply_up_text||text_has_page()){s_reply_up_text=false;if(s_ui_ok&&!s_run_menu.wake_only)text_page(-1,now);break;}
        if(ib_assistant_standalone()){if(!ib_assistant_busy())ib_assistant_clear_history();}
        else if(!s_run_menu.wake_only){s_run_replaying=true;handle_key(IB_KEY_UP,IB_KEY_EV_DOWN,now-1);handle_key(IB_KEY_UP,IB_KEY_EV_UP,now);s_run_replaying=false;}
        break;
    default:break;
    }
    return true;
}

// ---- 事件处理 ----

static void handle_key(ib_key_t key, ib_key_ev_t ev, int64_t now)
{
    if(conversation_key(key,ev,now))return;
    if(!s_reply_nav_replaying&&key==IB_KEY_UP&&ev==IB_KEY_EV_DOWN&&!s_run_menu.open&&!s_wifi_menu)s_reply_up_text=text_has_page();
    // OK首沿先关闭/释放通知，然后走同一个PTT路径；不吞键、不加长按等待，保留首句采集。
    if(key==IB_KEY_OK&&ev==IB_KEY_EV_DOWN&&!s_run_menu.open&&!s_wifi_menu)(void)ib_assistant_notification_dismiss();
    if(reply_down_key(key,ev,now))return;
    // 菜单进入前已按住的PTT松开仍须结束录音；不能让本地菜单吞掉麦克风释放沿。
    if(s_run_menu.open&&ib_assistant_standalone()&&key==IB_KEY_OK&&ev==IB_KEY_EV_UP)ib_assistant_release();
    if(run_menu_key(key,ev,now))return;
    if(ib_assistant_standalone()){
        if(ev==IB_KEY_EV_DOWN)wake(now);
        if((s_wifi_menu||!ib_assistant_busy())&&wifi_menu_key(key,ev,now))return;
        if(key==IB_KEY_OK){if(ev==IB_KEY_EV_DOWN)ib_assistant_press();else if(ev==IB_KEY_EV_UP)ib_assistant_release();}
        if(key==IB_KEY_DOWN&&ev==IB_KEY_EV_UP)ib_assistant_cancel();
        if(key==IB_KEY_UP&&ev==IB_KEY_EV_UP&&!ib_assistant_busy())ib_assistant_clear_history();
        return;
    }
    bool dark = !s_backlight_on;
    bool defer_wake = dark && s_online && key == IB_KEY_OK && s_cfg_mic && s_audio_ok
        && (s_screen == IB_UI_IDLE || s_screen == IB_UI_USAGE) && s_mode != IB_MODE_SUB && !agent_capturing();
    if (ev == IB_KEY_EV_DOWN) {
        if (!defer_wake) wake(now);
        if (s_ui_ok && !dark) ib_ui_key_press((ib_ui_key_t)key);
    }
    if (wifi_menu_key(key, ev, now)) return;
    if (ev == IB_KEY_EV_DOWN && key == IB_KEY_OK && !s_online && s_screen == IB_UI_OFFLINE) {
        char msg[IB_MSG_MAX];
        size_t len = ib_format_wake(msg, sizeof(msg));
        bool has_link = s_usb_present || s_ble_subscribed || ib_usb_host_present() || ib_wifi_is_configured();
        if (len) {
            if (s_usb_present || ib_usb_host_present()) ib_usb_send(msg, len);
            if (s_ble_subscribed) ib_ble_send(msg, len);
            if (ib_wifi_is_configured()) ib_wifi_send((const uint8_t *)msg, len);
        }
        if (s_ui_ok) ib_ui_set_connection_hint(has_link ? IB_UI_CONN_CONNECTING : IB_UI_CONN_CHECK_USB);
        s_wake_until = has_link ? now + 3000 : 0;
        s_wake_failed = false;
        ib_keys_reset(&s_keys);
        return;
    }
    bool voice_page = (s_screen == IB_UI_IDLE || s_screen == IB_UI_USAGE) && s_mode != IB_MODE_SUB;
    bool wake_to_talk = ib_keys_wake_to_talk(key, voice_page, agent_capturing());
    ib_key_action_t act = ib_keys_handle(&s_keys, key, ev, now, s_online, dark && !wake_to_talk, agent_capturing());
    if (act.dismiss_agent) agent_clear();
    if (act.send) {
        char msg[IB_MSG_MAX];
        send_alive(msg, ib_format_key(msg, sizeof(msg), key, ev, act.ack, ++s_seq, s_boot_id), now);
    }
    if (key != IB_KEY_OK) return;

    // 以屏幕为准判断"空闲":done/err 自行回到常驻页后 Mac 的状态可能还没到,此时按 OK 也应立即开麦。
    // 字幕在运行时(听写 / 翻译模式)显示的是字幕页,OK 同样是说话。
    if (ev == IB_KEY_EV_DOWN && act.send && !act.ack && s_cfg_mic &&
        (s_screen == IB_UI_IDLE || s_screen == IB_UI_SUB || s_screen == IB_UI_USAGE) &&
        s_mode != IB_MODE_SUB && s_audio_ok && !ib_audio_mic_active()) {
        // Passport 麦克风作为听写音源:按下瞬间就开始推流,不等 Mac 的 mic 命令,减少首字丢失。
        ib_link_t link = ib_links_preferred(&s_links, now);
        if (link != IB_LINK_COUNT) mic_start(link, true, now);
        if (defer_wake && ib_audio_mic_active()) {
            s_mic_prestart = true;
            s_mic_prestart_long = false;
            show_screen(IB_UI_REC);
        }
    }
    if (ev == IB_KEY_EV_DOWN && defer_wake) wake(now);
    if (ev == IB_KEY_EV_LONG && key == IB_KEY_OK && s_mic_prestart) s_mic_prestart_long = true;
    if (ev == IB_KEY_EV_UP && key == IB_KEY_OK && s_mic_prestart && !s_mic_prestart_long) {
        mic_stop();
        if (s_screen == IB_UI_REC) show_screen(screen_for(s_st));
    }
    if (s_ui_ok && ev != IB_KEY_EV_LONG) ib_ui_set_ok_held(ev == IB_KEY_EV_DOWN && act.send);
}

static void handle_command(ib_link_t link, const ib_cmd_t *cmd, int64_t now)
{
    char msg[IB_MSG_MAX];
    if(ib_assistant_standalone()&&cmd->type!=IB_CMD_HELLO&&cmd->type!=IB_CMD_PING&&cmd->type!=IB_CMD_CONFIG&&cmd->type!=IB_CMD_BYE)return;
    if (cmd->type == IB_CMD_BYE) {
        ib_links_drop(&s_links, link);
        refresh_links(now);
        return;
    }
    ib_links_seen(&s_links, link, now);
    refresh_links(now);         // 可能刚变为在线

    switch (cmd->type) {
    case IB_CMD_HELLO:
        send_to(link, msg,
                ib_format_hello(msg, sizeof(msg), esp_app_get_description()->version, s_build_id, s_boot_id));
        send_battery(link);
        if (link == IB_LINK_USB) ib_wifi_report_status();
        break;
    case IB_CMD_PING:
        send_to(link, msg, ib_format_pong(msg, sizeof(msg)));
        break;
    case IB_CMD_CONFIG:
        if (cmd->has_mic) s_cfg_mic = cmd->mic;
        if (cmd->has_sound) s_cfg_sound = cmd->sound;
        if (cmd->has_screen_off) s_screen_off_ms = (int64_t)cmd->screen_off_s * 1000;
        if (cmd->has_engine && s_ui_ok) ib_ui_set_engine(cmd->engine);
        if (cmd->has_clock) {
            s_clock_valid = true;
            s_clock_local = cmd->clock;
            s_clock_synced_ms = now;
            refresh_clock(now, true);
        }
        // 不 wake:config 是设置同步 / 定期校时,不是用户活动。screen_off 变化由 refresh_backlight 按新值立即生效。
        break;
    case IB_CMD_STATE:
        ib_assistant_companion_state(cmd->state==IB_ST_REC?"listening":cmd->state==IB_ST_PROC?"thinking":cmd->state==IB_ST_DONE?"celebrate":cmd->state==IB_ST_ERR?"alerting":"idle");
        apply_state(cmd, now);
        break;
    case IB_CMD_LEVEL:
        if (s_ui_ok) ib_ui_set_level(cmd->level);
        break;
    case IB_CMD_MIC:
        if (cmd->on) {
            // 对话录音只归已判定的长持；迟到mic-on不能在松开后重开一次采集。
            if(ib_conversation_accept_mic(&s_conversation,s_dialogue_keys.recording))mic_start(link, false, now);
        } else {
            mic_stop();
        }
        break;
    case IB_CMD_KEYS:
        for (int k = 0; k < IB_KEY_COUNT; k++) {
            if (cmd->has_key_icon[k] && s_ui_ok) ib_ui_set_key_icon((ib_ui_key_t)k, cmd->key_icon[k]);
        }
        break;
    case IB_CMD_AGENT:
        ib_assistant_companion_state(cmd->agent_ev==IB_AGENT_DONE?"celebrate":cmd->agent_ev==IB_AGENT_INPUT?"waiting":"idle");
        if (cmd->agent_ev == IB_AGENT_CLEAR) {
            agent_clear();
        } else {
            agent_show(cmd->agent_ev, cmd->has_msg ? cmd->msg : "", now);
        }
        break;
    case IB_CMD_LIST:
        apply_list(cmd);
        break;
    case IB_CMD_USAGE: {
        ib_ui_usage_t usage;
        memset(&usage, 0, sizeof(usage));
        usage.tab = cmd->has_usage_tab ? cmd->usage_tab : 0;
        usage.left_percent = cmd->has_usage_left ? cmd->usage_left : 0;
        usage.has_quota = cmd->has_usage_quota && cmd->usage_quota;
        usage.five_hour_left_percent = cmd->has_usage_5left ? cmd->usage_5left : 0;
        usage.has_five_hour_quota = cmd->has_usage_5quota && cmd->usage_5quota;
        usage.credits = cmd->has_usage_credits ? (int16_t)cmd->usage_credits : -1;
        usage.ready = cmd->has_usage_ready && cmd->usage_ready;
        if (cmd->has_usage_app) memcpy(usage.app, cmd->usage_app, sizeof(usage.app));
        if (cmd->has_usage_today) memcpy(usage.today, cmd->usage_today, sizeof(usage.today));
        if (cmd->has_usage_week) memcpy(usage.week, cmd->usage_week, sizeof(usage.week));
        if (cmd->has_usage_total) memcpy(usage.total, cmd->usage_total, sizeof(usage.total));
        if (cmd->has_usage_reset) memcpy(usage.reset, cmd->usage_reset, sizeof(usage.reset));
        if (cmd->has_usage_5reset) memcpy(usage.five_hour_reset, cmd->usage_5reset, sizeof(usage.five_hour_reset));
        if (cmd->has_usage_plan) memcpy(usage.plan, cmd->usage_plan, sizeof(usage.plan));
        for (int i = 0; i < 2; i++) {
            if (cmd->has_usage_panel_label[i]) {
                memcpy(usage.panel_label[i], cmd->usage_panel_label[i], sizeof(usage.panel_label[i]));
                usage.has_panel = true;
            }
            if (cmd->has_usage_panel_value[i]) {
                memcpy(usage.panel_value[i], cmd->usage_panel_value[i], sizeof(usage.panel_value[i]));
            }
            if (cmd->has_usage_panel_percent[i]) {
                usage.panel_percent[i] = cmd->usage_panel_percent[i];
                usage.panel_has_percent[i] = true;
            }
        }
        if (cmd->has_usage_panel_detail) memcpy(usage.panel_detail, cmd->usage_panel_detail, sizeof(usage.panel_detail));
        for (int i = 0; i < 2; i++) {
            if (cmd->has_usage_panel_row_detail[i]) {
                memcpy(usage.panel_row_detail[i], cmd->usage_panel_row_detail[i], sizeof(usage.panel_row_detail[i]));
            }
        }
        if (cmd->has_usage_panel_footer_left) memcpy(usage.panel_footer_left, cmd->usage_panel_footer_left, sizeof(usage.panel_footer_left));
        if (cmd->has_usage_panel_footer_right) memcpy(usage.panel_footer_right, cmd->usage_panel_footer_right, sizeof(usage.panel_footer_right));
        if (s_ui_ok) ib_ui_set_usage(&usage);
        break;
    }
    case IB_CMD_CAPTION:
        if (cmd->has_caption_src) memcpy(s_caption_src, cmd->caption_src, sizeof(s_caption_src));
        if (cmd->has_caption_dst) memcpy(s_caption_dst, cmd->caption_dst, sizeof(s_caption_dst));
        if (cmd->has_caption_app) memcpy(s_caption_app, cmd->caption_app, sizeof(s_caption_app));
        s_caption_live = cmd->caption_live;
        if (s_ui_ok) ib_ui_set_caption(s_caption_src, s_caption_dst, s_caption_app, s_caption_live);
        break;
    case IB_CMD_WALLPAPER: {
        bool ok = false;
        const char *phase = NULL;
        if (cmd->wallpaper_clear) {
            ok = ib_wallpaper_clear() == ESP_OK;
            phase = "clear";
        } else if (cmd->wallpaper_finish) {
            ok = ib_wallpaper_finish() == ESP_OK;
            phase = "done";
        } else if (cmd->has_wallpaper_size && cmd->has_wallpaper_crc) {
            ok = ib_wallpaper_begin(cmd->wallpaper_size, cmd->wallpaper_crc) == ESP_OK;
            phase = "start";
        } else if (cmd->has_wallpaper_off && cmd->has_wallpaper_data) {
            ok = ib_wallpaper_write(cmd->wallpaper_off, cmd->wallpaper_data) == ESP_OK;
        }
        if (phase) {
            send_to(link, msg, ib_format_wallpaper(msg, sizeof(msg), ok, phase));
            if (ok && (cmd->wallpaper_finish || cmd->wallpaper_clear)) s_restart_at = now + 500;
        }
        break;
    }
    case IB_CMD_BYE:
        break;
    }
}

// ---- 周期任务 ----

static void refresh_timers(int64_t now)
{
    if(ib_run_menu_expired(&s_run_menu,now))run_menu_close(now);
    if(s_run_menu.open&&(s_run_notice==IB_UI_RUN_MODE_NOTICE_NONE||s_run_notice==IB_UI_RUN_MODE_NOTICE_BUSY||s_run_notice==IB_UI_RUN_MODE_NOTICE_UPLOADING)){
        ib_ui_run_mode_notice_t notice=run_current_notice();if(notice!=s_run_notice){s_run_notice=notice;run_menu_render();}
    }
    if (s_restart_at && now >= s_restart_at) esp_restart();
    if (s_wifi_restart_at && now >= s_wifi_restart_at) esp_restart();
    if (s_wifi_menu && now - s_wifi_menu_touched >= WIFI_MENU_TIMEOUT_MS) wifi_menu_close();
    if (s_wake_until && now >= s_wake_until) {
        if (!s_wake_failed) {
            s_wake_failed = true;
            s_wake_until = now + 2000;
            if (!s_online && s_ui_ok) ib_ui_set_connection_hint(IB_UI_CONN_NO_RESPONSE);
        } else {
            s_wake_until = 0;
            s_wake_failed = false;
            if (!s_online && s_ui_ok) ib_ui_set_connection_hint(IB_UI_CONN_RECONNECT);
        }
    }
    if (s_revert_at && now >= s_revert_at) {
        s_revert_at = 0;
        // 离线时 go_offline 已清掉 s_revert_at,这里只会在在线时触发。
        if (s_online && (s_screen == IB_UI_DONE || s_screen == IB_UI_ERR)) {
            revert_home();
            show_screen(screen_for(s_st));
        }
    }
    if (s_mic_local && s_st != IB_ST_REC && now - s_mic_local_ms > MIC_LOCAL_WAIT_MS) {
        mic_stop();
        if (s_screen == IB_UI_REC) show_screen(screen_for(s_st));
    }
    if (s_mic_tail_until && now >= s_mic_tail_until) {
        s_mic_tail_until = 0;
        if (s_st != IB_ST_REC && s_audio_ok && ib_audio_mic_active()) mic_stop();
    }

    if (s_agent_on) {
        if (s_agent_kind == IB_AGENT_DONE && now >= s_agent_deadline) {
            agent_clear();
        } else if (s_agent_kind == IB_AGENT_INPUT && now >= s_agent_next_chime) {
            s_agent_next_chime = now + AGENT_CHIME_MS;
            play(IB_SOUND_AGENT_INPUT);
            wake(now);
        }
    }
}

static void refresh_backlight(int64_t now)
{
    // 录音、处理中、字幕运行中保持常亮;其余时间按 config.screen_off 熄屏(0 为永不)。
    bool busy = ib_assistant_busy() || (s_online && (s_st == IB_ST_REC || s_st == IB_ST_PROC || s_st == IB_ST_SUB));
    if (busy) s_last_activity_ms = now;
    bool on = s_screen_off_ms == 0 || now - s_last_activity_ms < s_screen_off_ms;
    set_backlight(on);
}

// Commit在ACK前同步切换mmap，UI锁保证旧几何不再被逐帧任务读取后才unmap。
static bool apply_pet_configuration(void *context)
{
    (void)context;
    if(!s_ui_ok)return true;
    if(!s_pet_apply_lock||xSemaphoreTake(s_pet_apply_lock,pdMS_TO_TICKS(1000))!=pdTRUE)return false;
    uint32_t generation=ib_assistant_store_generation();
    if(generation==s_pet_config_seen){xSemaphoreGive(s_pet_apply_lock);return true;}
    const void *data=NULL;size_t size=0;esp_partition_mmap_handle_t mapping=0;
    if(ib_assistant_pet_map(&data,&size,&mapping)!=ESP_OK){xSemaphoreGive(s_pet_apply_lock);return false;}
    bool binary=size>=8&&!memcmp(data,"AORAPET2",8);
    bool ok=ib_ui_pet_load(binary?data:NULL,binary?size:0);
    if(ok&&!binary&&data){
        cJSON *p=cJSON_ParseWithLength(data,size),*enabled=p?cJSON_GetObjectItemCaseSensitive(p,"enabled"):NULL,*fps=p?cJSON_GetObjectItemCaseSensitive(p,"fps"):NULL,*brightness=p?cJSON_GetObjectItemCaseSensitive(p,"brightness"):NULL,*color=p?cJSON_GetObjectItemCaseSensitive(p,"color"):NULL;
        unsigned rgb=0xEADBB9;if(cJSON_IsString(color)&&color->valuestring[0]=='#')sscanf(color->valuestring+1,"%x",&rgb);
        ib_ui_pet_config(!cJSON_IsFalse(enabled),cJSON_IsNumber(fps)?fps->valueint:12,cJSON_IsNumber(brightness)?brightness->valueint:80,rgb);cJSON_Delete(p);
    }
    if(ok){
        if(s_pet_mapping_live)esp_partition_munmap(s_pet_mapping);
        s_pet_mapping=mapping;s_pet_mapping_live=binary;s_pet_config_seen=generation;
    }
    if(data&&(!ok||!binary))esp_partition_munmap(mapping);
    xSemaphoreGive(s_pet_apply_lock);return ok;
}

// Worker只发布快照；LVGL与电源意图由app任务消费，最后一条状态不会因事件队列满而丢失。
static void assistant_status(ib_assistant_state_t state,const char *text,void *context)
{
    (void)context;size_t n=ib_utf8_prefix(text,strlen(text),sizeof(s_assist_view.text)-1);
    /* 元数据随状态同快照捕获，避免USB下一包到达后把旧state与新target/phase拼在一起。 */
    portENTER_CRITICAL(&s_assist_lock);
    s_assist_view.state=state;memcpy(s_assist_view.text,text,n);s_assist_view.text[n]=0;
    s_assist_view.cloud_target=ib_assistant_companion_cloud_target();
    s_assist_view.has_phase=ib_assistant_companion_has_phase();
    s_assist_view.owned=ib_assistant_companion_owned();
    s_assist_view.companion_error=ib_assistant_companion_error();
    s_assist_view.revision++;
    if(state==IB_ASSIST_DONE&&ib_assistant_standalone())s_completion_revision++;
    portEXIT_CRITICAL(&s_assist_lock);
}
static void refresh_assistant(int64_t now)
{
    ib_assistant_maintenance();
    typeof(s_assist_view) view;
    portENTER_CRITICAL(&s_assist_lock);view=s_assist_view;portEXIT_CRITICAL(&s_assist_lock);
    if(view.revision==s_assist_seen)return;
    s_assist_seen=view.revision;
    bool solo=ib_assistant_standalone();
    static const char *const names[]={"idle","loading","listening","uploading","thinking","composing","celebrate","alerting","powering-down","humming"};
    static const ib_ui_assistant_phase_t phases[]={IB_UI_ASSIST_IDLE,IB_UI_ASSIST_PREPARING,IB_UI_ASSIST_LISTENING,
        IB_UI_ASSIST_TRANSCRIBING,IB_UI_ASSIST_THINKING,IB_UI_ASSIST_REPLYING,IB_UI_ASSIST_DONE,IB_UI_ASSIST_ERROR,
        IB_UI_ASSIST_STOPPED,IB_UI_ASSIST_SPEAKING};
    unsigned index=(unsigned)view.state;
    if(index>=sizeof(names)/sizeof(names[0]))index=IB_ASSIST_ERROR;
    if(s_ui_ok){
        if(solo){
            s_revert_at=0;show_screen(IB_UI_IDLE);
            ib_ui_pet_assistant_state(names[index],phases[index],true,view.text);
        }else{
            const char *canonical=ib_pet_state_is_valid(view.text)?view.text:names[index];
            ib_ui_assistant_phase_t phase=view.has_phase?phases[index]:IB_UI_ASSIST_COUNT;
            ib_ui_pet_assistant_state(canonical,phase,view.cloud_target,view.companion_error);
        }
        ib_ui_set_assistant_key_hints(solo,solo||view.owned?phases[index]:IB_UI_ASSIST_COUNT);
    }
    if(solo)wake(now);
}

// 字幕最后快照可合并多个partial；跨generation先begin，final/clear边界由模型拒绝迟到更新。
static void refresh_transcript(void){
    static uint32_t seen,generation;static bool active;
    ib_transcript_view_t view;uint32_t revision;
    ib_assistant_transcript_snapshot(&view,&revision);if(revision==seen)return;seen=revision;
    if(!s_ui_ok)return;
    if(!view.active||view.closed){ib_ui_transcript_clear(0);active=false;return;}
    if(generation!=view.generation||!active){if(!ib_ui_transcript_begin(view.generation))return;generation=view.generation;active=true;}
    (void)ib_ui_transcript_update(view.generation,view.text,view.final);
}

// app轮询与USB final ACK共用同一发布门禁；UI reader从不反向取得此mutex/control。
static bool reply_apply(void *context){
    (void)context;if(!s_ui_ok||!s_reply_apply_lock)return false;
    if(xSemaphoreTake(s_reply_apply_lock,pdMS_TO_TICKS(1000))!=pdTRUE)return false;
    ib_reply_snapshot_t view;ib_reply_store_snapshot(&view);bool ok=true;
    if(view.revision!=s_reply_ui_seen){
        if(!view.active)ok=ib_ui_reply_clear(0);
        else{
            if(view.generation!=s_reply_ui_generation)ok=ib_ui_reply_begin(view.generation);
            if(ok)ok=ib_ui_reply_update(view.generation,view.length,view.final,ib_reply_store_read,NULL);
        }
        if(ok){s_reply_ui_seen=view.revision;s_reply_ui_generation=view.generation;}
    }
    xSemaphoreGive(s_reply_apply_lock);return ok;
}
// callback可来自USB final ACK；仅同步UI发布。chime/wake/legacy业务状态留给app tick消费。
static bool notification_hide(void *context){
    (void)context;if(!s_ui_ok||!s_notification_ui_lock)return false;
    if(xSemaphoreTake(s_notification_ui_lock,pdMS_TO_TICKS(1000))!=pdTRUE)return false;
    bool ok=ib_ui_notification_hide();
    // 高rev begin也先hide；pending按事件保留到新rev发布，避免0body→正文太快而永远不响。
    if(ok){ib_notification_snapshot_t view;ib_notification_snapshot(&view);s_notification_blocked_generation=view.generation;s_notification_ui_generation=0;s_notification_deadline=0;}
    xSemaphoreGive(s_notification_ui_lock);return ok;
}
static bool notification_apply(void *context){
    (void)context;if(!s_ui_ok||!s_notification_ui_lock)return false;
    if(xSemaphoreTake(s_notification_ui_lock,pdMS_TO_TICKS(1000))!=pdTRUE)return false;
    ib_notification_snapshot_t view;ib_notification_snapshot(&view);bool ok=true;
    if(!view.active||!view.committed){
        if(!view.active){s_notification_chime_pending=false;s_notification_chime_id[0]=0;s_notification_deadline=0;s_notification_ui_generation=0;}
        if(view.revision!=s_notification_ui_revision){ok=ib_ui_notification_hide();if(ok)s_notification_ui_revision=view.revision;}
    }
    else if(view.generation==s_notification_blocked_generation)ok=false;
    else if(ib_assistant_mode_busy()||ib_assistant_capture_active())ok=false;
    else if(view.generation!=s_notification_ui_generation||!ib_ui_notification_visible()){
        const ib_ui_notification_kind_t kinds[]={IB_UI_NOTIFICATION_INPUT,IB_UI_NOTIFICATION_COMPLETED,IB_UI_NOTIFICATION_ERROR};
        ok=ib_ui_notification_show(view.generation,view.source,kinds[view.kind],view.truncated,view.length,ib_notification_read,NULL);
        if(ok){
            bool changed=s_notification_ui_generation!=view.generation;s_notification_ui_generation=view.generation;
            s_notification_ui_revision=view.revision;
            if(changed)s_notification_deadline=now_ms()+AGENT_DONE_MS;
            s_notification_clear_legacy=true;
            if(s_notification_chime_pending&&strcmp(s_notification_chime_id,view.nid))s_notification_chime_pending=false;
            if(ib_notification_presented(view.generation)){s_notification_chime_pending=true;strcpy(s_notification_chime_id,view.nid);s_notification_sound=view.kind==IB_NOTIFICATION_DONE?IB_SOUND_DONE:view.kind==IB_NOTIFICATION_INPUT?IB_SOUND_AGENT_INPUT:IB_SOUND_STOP;}
        }
    }
    xSemaphoreGive(s_notification_ui_lock);return ok;
}
static void refresh_notification(int64_t now){
    (void)notification_apply(NULL);
    bool played=false,clear_legacy=false,expired=false;
    if(xSemaphoreTake(s_notification_ui_lock,0)==pdTRUE){
        clear_legacy=s_notification_clear_legacy;s_notification_clear_legacy=false;
        if(s_notification_deadline&&(s_run_menu.open||s_wifi_menu))s_notification_deadline=now+30000;
        expired=s_notification_deadline&&now>=s_notification_deadline&&!s_run_menu.open&&!s_wifi_menu;
        // 入队与消费pending共用UI发布锁，高rev hide/show不能插在两者中间导致重复或吞短音。
        // audio任务从不取得GUI/notification锁；此处只入队，不等待声音播放结束。
        if(s_notification_chime_pending&&s_notification_ui_generation&&!ib_assistant_mode_busy()&&!ib_assistant_capture_active()&&play(s_notification_sound)){
            s_notification_chime_pending=false;played=true;
        }
        xSemaphoreGive(s_notification_ui_lock);
    }
    if(clear_legacy){agent_clear();wake(now);} //文字提醒独立于声音开关/codec分配是否成功。
    else if(played)wake(now);
    if(expired)(void)ib_assistant_notification_dismiss();
    // DONE是一次业务事件，不依赖可能被后台PREPARING覆盖的last-write-wins状态快照。
    uint32_t completed;portENTER_CRITICAL(&s_assist_lock);completed=s_completion_revision;portEXIT_CRITICAL(&s_assist_lock);
    if(completed!=s_completion_seen){
        ib_reply_snapshot_t reply;ib_reply_store_snapshot(&reply);
        if(!reply.active||!reply.final||!ib_assistant_standalone())s_completion_seen=completed;
        else if(!ib_assistant_busy()&&!ib_assistant_capture_active()&&play(IB_SOUND_DONE))s_completion_seen=completed;
    }
}
// 背光闸门只在持久宠物应用及首帧提交成功后打开。失败仍保留USB/按键，可重试加载恢复。
static void refresh_boot_frame(void){
    if(s_boot_ui_ready)return;
    if(!s_ui_ok){s_boot_ui_ready=true;return;}
    if(!ib_assistant_store_ready()||!ib_assistant_store_apply()||!ib_ui_present_boot_frame())return;
    s_boot_ui_ready=true;wake(now_ms());
}

static void app_task(void *arg)
{
    (void)arg;
    // 栈在RF之前预留；只有main完成按键初始化后才开放普通协议与按键消费。
    // 第一阶段只呈现已经校验/应用的持久宠物，RF和音频尚未启动；使用本任务8KiB绘制栈。
    // 计数通知逐个取，第二阶段通知即使先到也不会被清空而丢失。
    ulTaskNotifyTake(pdFALSE,portMAX_DELAY);refresh_boot_frame();if(s_boot_frame_done)xSemaphoreGive(s_boot_frame_done);
    ulTaskNotifyTake(pdFALSE,portMAX_DELAY);s_app_ready=true;
    app_event_t ev;
    refresh_battery(now_ms(), true);
    refresh_clock(now_ms(), true);
    for (;;) {
        if (xQueueReceive(s_queue, &ev, pdMS_TO_TICKS(LOOP_PERIOD_MS)) == pdTRUE) {
            int64_t now = now_ms();
            switch (ev.type) {
            case EV_KEY:
                handle_key(ev.key, ev.key_ev, ev.key_at?ev.key_at:now);
                break;
            case EV_COMMAND:{
                if(conversation_command(ev.link,ev.command_line,ev.command_size,now)){free(ev.command_line);break;}
                ib_cmd_t command;
                bool valid=ib_parse_command(ev.command_line,ev.command_size,&command);
                free(ev.command_line);
                if(valid)handle_command(ev.link,&command,now);
                break;
            }
            case EV_LINK:
                if (ev.link == IB_LINK_BLE) s_ble_subscribed = ev.subscribed;
                if (!ev.subscribed) ib_links_drop(&s_links, ev.link);
                if (!s_online && s_ui_ok && s_wake_until == 0) ib_ui_set_connection_hint(offline_hint());
                break;
            }
        }
        int64_t now = now_ms();
        if(ib_assistant_take_restart_request()&&!s_restart_at)s_restart_at=now+500;
        refresh_links(now);
        conversation_refresh(now);
        conversation_action(ib_dialogue_keys_tick(&s_dialogue_keys,now,conversation_context(now)),now);
        refresh_assistant(now);
        if(s_ui_ok)ib_ui_set_capture_active(ib_assistant_standalone()?ib_assistant_capture_active():ib_audio_mic_active());
        refresh_transcript();
        (void)reply_apply(NULL);
        refresh_notification(now);
        refresh_boot_frame();
        refresh_ble_fallback(now);
        refresh_timers(now);
        refresh_battery(now, false);
        refresh_clock(now, false);
        refresh_backlight(now);
    }
}

esp_err_t ib_app_start(bool ui_ok, bool battery_ok)
{
    s_ui_ok = ui_ok;
    s_battery_ok = battery_ok;
    // 构建标识:esptool elf2image 写进镜像的 ELF SHA-256(小写十六进制),取前 8 位。
    esp_app_get_elf_sha256(s_build_id, sizeof(s_build_id));
    ib_links_init(&s_links);
    ib_keys_reset(&s_keys);
    ib_conversation_reset(&s_conversation);ib_dialogue_keys_reset(&s_dialogue_keys);
    ib_charge_init(&s_charge);

    s_queue = xQueueCreate(EVENT_QUEUE_LEN, sizeof(app_event_t));
    ESP_RETURN_ON_FALSE(s_queue, ESP_ERR_NO_MEM, TAG, "event queue alloc failed");

    BaseType_t core=xTaskCreate(app_task,"ib_app",APP_TASK_STACK,NULL,APP_TASK_PRIO,&s_app_task);
    ESP_RETURN_ON_FALSE(core==pdPASS,ESP_ERR_NO_MEM,TAG,"core app task alloc failed");

    s_boot_frame_done=xSemaphoreCreateBinary();
    // 先只读校验profile/pet，尽早把有效持久外观显示出来，不用RF/audio慢启动换长黑屏。
    esp_err_t err=nvs_flash_init();if(err!=ESP_OK)ESP_LOGW(TAG,"nvs init failed: %s",esp_err_to_name(err));
    if(ib_assistant_store_init()!=ESP_OK)ESP_LOGW(TAG,"assistant store not ready; retaining boot gate");
    ib_wallpaper_init();
    if (s_ui_ok && ib_ui_init() != ESP_OK) {
        ESP_LOGE(TAG, "UI init failed, continue without screen");
        s_ui_ok = false;
    }
    wake(now_ms());

    s_pet_apply_lock=xSemaphoreCreateMutex();s_reply_apply_lock=xSemaphoreCreateMutex();s_notification_ui_lock=xSemaphoreCreateMutex();
    ib_assistant_store_set_apply(apply_pet_configuration,NULL);ib_assistant_store_apply();
    xTaskNotifyGive(s_app_task);
    if(s_boot_frame_done)(void)xSemaphoreTake(s_boot_frame_done,pdMS_TO_TICKS(1500));
    if(ib_assistant_store_cleanup())ESP_LOGW(TAG,"retired asset cleanup deferred");
    if (ib_usb_start(on_usb_line) != ESP_OK) ESP_LOGE(TAG, "USB link unavailable");

    // BLE 控制器需要 NVS 保存 PHY 校准数据。初始化失败时不擦除分区(避免清掉已有数据),
    // PHY 退回每次上电完整校准,BLE 照常启动。
    // mode变化经ACK后重启，启动前选单栈，避免先分配worker才释放BLE/LAN的峰值。
    bool wifi_configured=ib_wifi_is_configured();
    bool solo_boot=ib_assistant_mode_load()&&wifi_configured;
    if(!wifi_configured&&ib_assistant_mode_load())ib_assistant_mode_save(false);
    // 两种模式空闲都保留已配对电脑通知链路；公网云会话前由worker实际释放LAN TLS。
    ib_wifi_set_companion_enabled(true);
    s_ble_budget=!solo_boot&&heap_caps_get_free_size(MALLOC_CAP_8BIT)>=98304&&heap_caps_get_largest_free_block(MALLOC_CAP_8BIT)>=32768;
    s_ble_only=wifi_configured&&!solo_boot&&s_ble_budget&&ib_wifi_ble_fallback_requested();
    s_ble_manual=s_ble_only&&ib_wifi_ble_manual_requested();
    bool use_ble=s_ble_budget&&(!wifi_configured||s_ble_only);
    if(use_ble&&ib_ble_start(on_ble_line,on_ble_link)!=ESP_OK){ESP_LOGW(TAG,"BLE unavailable; keeping core USB/Wi-Fi");use_ble=false;s_ble_only=false;}
    if(!use_ble){esp_bt_mem_release(ESP_BT_MODE_BLE);ib_wifi_clear_ble_fallback();}
    if(!s_ble_only&&ib_wifi_start(on_wifi_line,on_wifi_link)!=ESP_OK)ESP_LOGE(TAG,"Wi-Fi link unavailable");

    // boot id 在 RF 启用之后生成:此时 esp_random() 由射频噪声提供真随机数。
    s_boot_id = esp_random();

    s_audio_ok = ib_audio_init_mode(audio_tx,!solo_boot) == ESP_OK;
    if (!s_audio_ok) ESP_LOGE(TAG, "audio unavailable");
    if(ib_assistant_init(assistant_status,NULL)!=ESP_OK)ESP_LOGE(TAG,"assistant unavailable");
    ib_assistant_set_reply_apply(reply_apply,NULL);
    ib_assistant_set_notification_apply(notification_apply,notification_hide,NULL);
    ib_assistant_store_set_apply(apply_pet_configuration,NULL);
    ib_assistant_store_apply();
    assistant_status(ib_assistant_state(),ib_assistant_standalone()&&!ib_assistant_store_configured()?"profile_required":"",NULL);
    // 首帧刷新留给已预留8KiB栈的app任务，避免在main小栈中执行LVGL完整绘制。

    return ESP_OK;
}

void ib_app_finish_start(bool buttons_ready){s_buttons_ready=buttons_ready;if(s_app_task)xTaskNotifyGive(s_app_task);}
bool ib_app_ready(void){return s_app_ready;}
bool ib_app_buttons_ready(void){return s_buttons_ready;}

bool ib_app_display_ready(void){return s_ui_ok&&s_boot_ui_ready;}
