// main/ib_ui.h: Passport 屏幕(LVGL 9)。只负责"显示什么、怎么动",不含协议与业务逻辑。
//
// 设计见 docs/device-ui.md。调用方(ib_app)决定当前页面与参数;本模块负责页面切换动画、
// 状态栏、按键反馈与各页面的逐帧动画。
//
// 线程:所有函数都可在任意非 LVGL 任务中调用,内部加 LVGL 锁;拿不到锁(> 1 s)时放弃本次更新并返回 false。
#pragma once

#include "esp_err.h"
#include "ib_icons.h"
#include "ib_ui_labels.h"
#include "ib_reply_view.h"
#include "ib_conversation.h"

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef enum {
    IB_UI_OFFLINE = 0,      // Mac 未连接:时钟
    IB_UI_IDLE,             // 模式卡片
    IB_UI_REC,              // 录音
    IB_UI_PROC,             // 处理中
    IB_UI_DONE,             // 已输入
    IB_UI_ERR,              // 失败
    IB_UI_SUB,              // 字幕运行中
    IB_UI_LIST,             // 列表(Mac 驱动的应用切换器等)
    IB_UI_USAGE,            // Agent 用量首页(进入 Agent 时先显示)
    IB_UI_SCREEN_COUNT,
} ib_ui_screen_t;

typedef enum {
    IB_UI_MODE_DICT = 0,    // 听写
    IB_UI_MODE_TR,          // 翻译听写
    IB_UI_MODE_SUB,         // 字幕
    IB_UI_MODE_COUNT,
} ib_ui_mode_t;

typedef enum {
    IB_UI_KEY_UP = 0,
    IB_UI_KEY_DOWN,
    IB_UI_KEY_OK,
    IB_UI_KEY_COUNT,
} ib_ui_key_t;

typedef enum {
    IB_UI_AGENT_DONE = 0,   // Agent 完成:绿色对勾,15 s 后由 ib_app 关闭
    IB_UI_AGENT_INPUT,      // Agent 等你:暗橙色 "!",直到关闭
} ib_ui_agent_t;

// 列表页内容:最多 6 个可见行,选中项与滚动位置由 Mac 决定,设备只显示。
#define IB_UI_LIST_ROWS 6
#define IB_UI_LIST_TEXT_MAX 48
#define IB_UI_CAPTION_MAX 192
#define IB_UI_CAPTION_APP_MAX 64
#define IB_UI_OFFLINE_HINT_MAX 64
typedef struct {
    char title[IB_UI_LIST_TEXT_MAX];
    char items[IB_UI_LIST_ROWS][IB_UI_LIST_TEXT_MAX];
    uint8_t rows;           // 可见行数 0..6
    uint16_t n;             // 列表总项数
    uint16_t top;           // items[0] 在完整列表里的序号
    uint16_t sel;           // 选中项的绝对序号
} ib_ui_list_t;

// USAGE 页内容:都由 Mac 计算好并下发,设备只负责排版。
// 数字是带千分位的 ASCII(today/week/total),没有数据时为空串。
#define IB_UI_USAGE_TEXT_MAX 24
typedef struct {
    char app[IB_UI_USAGE_TEXT_MAX];      // CODEX / DSH / WORKBUDDY
    char today[IB_UI_USAGE_TEXT_MAX];
    char week[IB_UI_USAGE_TEXT_MAX];
    char total[IB_UI_USAGE_TEXT_MAX];
    char reset[IB_UI_USAGE_TEXT_MAX];    // 4D 2H / SOON
    char plan[IB_UI_USAGE_TEXT_MAX];     // PLUS / DEEPSEEK
    uint8_t tab;                          // 0=今日 1=本周 2=累计
    uint8_t left_percent;                 // 0..100
    bool has_quota;                       // false 时显示 NO DATA
    uint8_t five_hour_left_percent;       // 0..100
    bool has_five_hour_quota;             // false 时显示 NO DATA
    char five_hour_reset[IB_UI_USAGE_TEXT_MAX];
    bool has_panel;                       // 使用通用两行信息面板
    char panel_label[2][IB_UI_USAGE_TEXT_MAX];
    char panel_value[2][IB_UI_USAGE_TEXT_MAX];
    uint8_t panel_percent[2];             // 0..100
    bool panel_has_percent[2];
    char panel_detail[IB_UI_USAGE_TEXT_MAX];
    char panel_row_detail[2][IB_UI_USAGE_TEXT_MAX];
    char panel_footer_left[IB_UI_USAGE_TEXT_MAX];
    char panel_footer_right[IB_UI_USAGE_TEXT_MAX];
    int16_t credits;                      // -1 表示未知
    bool ready;                           // false 时显示 READING USAGE...
} ib_ui_usage_t;

typedef enum {
    IB_UI_LINK_NONE = 0,
    IB_UI_LINK_USB,
    IB_UI_LINK_BLE,
    IB_UI_LINK_WIFI,
} ib_ui_link_t;

typedef ib_reply_reader_fn ib_ui_reply_reader_fn;
// 独立通知读层，不复用ASR或cloud reply的buffer/generation。
typedef enum {IB_UI_NOTIFICATION_INPUT,IB_UI_NOTIFICATION_COMPLETED,IB_UI_NOTIFICATION_ERROR} ib_ui_notification_kind_t;
bool ib_ui_notification_show(uint32_t generation,const char *source,ib_ui_notification_kind_t kind,bool truncated,size_t length,ib_ui_reply_reader_fn reader,void *ctx);
bool ib_ui_notification_hide(void);
bool ib_ui_notification_page(int delta);
bool ib_ui_notification_visible(void);
// 独立电脑会话窗口：只有实际companion且Mac在线才enabled；standalone只缓存，不抢云页面。
const char *ib_ui_conversation_update(const ib_conversation_t *,bool enabled);

// 建立全部页面与状态栏,初始显示 OFFLINE。需先 bsp_lvgl_init()。
esp_err_t ib_ui_init(void);

// 切换页面。screen 相同时只更新 mode/msg(IDLE 下模式变化会播放左右滑动动画)。
// msg:ASCII,最长 23 字节;DONE 为提示词(空则显示 TYPED),ERR 为原因,SUB 为应用名;
// IDLE 上为 "LIVE" 时表示 Mac 正在后台显示字幕,状态栏左侧显示 LIVE 徽章(代替链路文字)。
bool ib_ui_show(ib_ui_screen_t screen, ib_ui_mode_t mode, const char *msg);

// 音量电平 0..100,驱动 REC / SUB 动画(内部平滑)。
void ib_ui_set_level(uint8_t level);
// 真实codec reader活动标志，停止/取消立即false；只驱动麦克风采集提示，不猜phase时长。
void ib_ui_set_capture_active(bool active);

// SUB 页字幕:UTF-8 原文 / 译文 / 应用名。空字符串表示没有对应内容;
// live=true 时译文最后一行还在变化(用略暗的颜色)。
void ib_ui_set_caption(const char *src, const char *dst, const char *app, bool live);

// OK 键是否按住:REC 页据此提示 "RELEASE OK"(按住说话)或 "OK TO STOP"(切换模式)。
void ib_ui_set_ok_held(bool held);

// 状态栏:链路(online=false 时用暗色显示物理链路)、电量(soc<0 表示未知)。
void ib_ui_set_link(ib_ui_link_t link, bool online);
void ib_ui_set_battery(int soc, bool charging);

// OFFLINE 时钟:time 形如 "23:41",date 形如 "THU 10/15";time 为空串表示未知(显示 --:--)。
void ib_ui_set_clock(const char *time, const char *date);
// OFFLINE 页底部UTF-8提示；业务使用下面的语义枚举，不按显示文案判断状态。
void ib_ui_set_offline_hint(const char *text);
void ib_ui_set_connection_hint(ib_ui_connection_hint_t hint);

// IDLE 页底部的引擎名(ASCII,最长 23 字节)。
void ib_ui_set_engine(const char *engine);

// 按键反馈:右侧对应按键提示闪白 150 ms(离线页无反馈)。
void ib_ui_key_press(ib_ui_key_t key);

// 右侧按键提示图标;IB_ICON_NONE 隐藏该键提示。
void ib_ui_set_key_icon(ib_ui_key_t key, ib_icon_t icon);
// 当前实际助手手势；COUNT表示未接管，保留Mac原keys/PROC禁用行为。
void ib_ui_set_assistant_key_hints(bool standalone,ib_ui_assistant_phase_t phase);

// 本地菜单只复用LIST现有对象；期间网络页面/数据/通知继续缓存但不覆盖菜单。
void ib_ui_run_mode_menu(bool standalone,unsigned selected,ib_ui_run_mode_notice_t notice);
void ib_ui_run_mode_menu_hide(void);
bool ib_ui_run_mode_menu_visible(void);
// 本地网络列表只借用LIST对象；有界副本归UI，迟到远端state/list/通知仅缓存。
// hide先保留菜单帧，调用方随后必须show最新目标，才能原子恢复且不露旧页面。
void ib_ui_local_menu_show(const ib_ui_list_t *list);
void ib_ui_local_menu_hide(void);
// 实际ASR快照：generation非零且单boot递增，text为当前完整快照而非追加片段。
bool ib_ui_transcript_begin(uint32_t generation);
bool ib_ui_transcript_update(uint32_t generation,const char *utf8,bool final);
// generation=0强制清理（断连/切目标）；已取消/已final轮次拒绝迟到partial。
void ib_ui_transcript_clear(uint32_t generation);
// 回复与ASR字幕独立；全文由assistant持有，reader只复制当前已发布前缀，不持有control/GUI锁。
bool ib_ui_reply_begin(uint32_t generation);
// 完整校验length并发布当前页成功才true，可作为reply_final ACK门禁；最大4096B。
bool ib_ui_reply_update(uint32_t generation,size_t length,bool final,ib_ui_reply_reader_fn reader,void *ctx);
bool ib_ui_reply_clear(uint32_t generation);
bool ib_ui_reply_page(int delta);
bool ib_ui_reply_visible(void);
// 背光仍关闭时强制当前资产栅格/整屏提交，并等待BSP实际DMA完成；true后调用方才点亮。
bool ib_ui_present_boot_frame(void);

// 更新列表页内容(列表页可见时选中高亮平滑滑动到新位置)。
void ib_ui_set_list(const ib_ui_list_t *list);

// USAGE 页数据;可在页面显示前调用,页面显示时会立即采用。
void ib_ui_set_usage(const ib_ui_usage_t *usage);

// Agent 通知层:当前是 REC 页时只显示顶部 28 px 横幅(录音继续),否则全屏;
// 页面在 REC 与其它页之间切换时自动在横幅 / 全屏之间转换。source 为来源名(ASCII)。
void ib_ui_agent_show(ib_ui_agent_t kind, const char *source);
// 关闭通知层(200 ms 淡出)。未显示时无操作。
void ib_ui_agent_hide(void);

// 屏幕是否点亮。熄屏时暂停逐帧动画以省电,点亮时恢复。
void ib_ui_set_awake(bool awake);

// 通用宠物入口保留明确传入的自定义UTF-8正文；正文不用于业务状态或翻译判断。
bool ib_ui_pet_state(const char *state, const char *body, bool standalone);
// 助手专用原子入口：phase==COUNT时只用canonical状态；业务状态与动画在同一UI锁内更新。
bool ib_ui_pet_assistant_state(const char *state,ib_ui_assistant_phase_t phase,bool cloud_target,const char *error_code);
// cloud_target表示云端目的地（含Mac代连）；error_code只接稳定机器错误码，正文不参与判断。
void ib_ui_pet_assistant_status(ib_ui_assistant_phase_t phase,bool cloud_target,const char *error_code);
void ib_ui_pet_config(bool enabled, uint8_t fps, uint8_t brightness, uint32_t rgb888);

/* 已提交Flash资产，调用者保证指针直到下一次成功load前有效；NULL恢复内置Dot。 */
bool ib_ui_pet_load(const void *data,size_t size);

uint32_t ib_ui_pet_max_frame_ms(void);

uint32_t ib_ui_pet_last_frame_ms(void);
uint32_t ib_ui_lvgl_peak_bytes(void);
