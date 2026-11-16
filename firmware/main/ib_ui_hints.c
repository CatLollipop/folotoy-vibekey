// main/ib_ui_hints.c: 两侧微型按键提示实现(见 ib_ui_hints.h)。
//
// 每个键:12 px 图标 + 贴屏幕右边缘、对准实体键的 3 颗竖排小圆点(像按键的"指示灯",与界面的点阵语言一致)。
// 长按字形与小圆环复用同一个自绘标记控件;左侧电源用一段弧和竖线,不新增字体或位图资源。
// 按下时 60 ms 冲到白、上下各多出一颗点,再用 240 ms 回落;只 invalidate 图标和标记。
// 禁用时(PROC 页,上一句还在处理)图标与点画成更暗的禁用色;按下改为"不可用"反馈:点闪红并左右抖动,
// 让用户知道这次按键没有生效、不会开始新的一句。
#include "ib_ui_hints.h"

#include "ib_ui_gfx.h"
#include "ib_ui_page.h"

#define PRESS_MS    300
#define PRESS_PEAK  20          // 前 20% 时间冲到最亮,后 80% 回落
#define ICON_SIZE   14          // 图标标签的宽高(字形 12 px;屏幕很小,提示只需要能认出来)
#define ICON_CX     8           // 图标中心(列内坐标;屏幕 x = 226)
#define MARK_H      42          // 复用点列控件容纳长按字形,不增加每键 LVGL 对象
#define MARK_CY     12          // 点列中心相对控件顶部,与原先的实体键锚点不变
#define HOLD_DY     14          // 长按含义在短按字形下方 14 px
#define HOLD_RING_X 17
#define DOT         2           // 标记点 2x2,屏幕 x 234..235
#define DOT_X       16
#define DOT_PITCH   5           // 静止 3 颗:Y-5、Y、Y+5;按下时再加 Y±10
#define DENY_MS     360         // 不可用反馈时长
#define DENY_PX     2           // 抖动幅度
#define ICON_DISABLED 0x303030  // 禁用时的图标颜色
#define MARK_DISABLED 0x181818  // 禁用时的标记点颜色

typedef struct {
    lv_obj_t *icon;
    lv_obj_t *mark;
    ib_icon_t press_icon;       // 短按 / 长按独立存储,避免设置其中之一误隐藏另一项
    ib_icon_t hold_icon;
    int32_t flash;              // 0..IB_P_ONE:按下反馈的强度
    int32_t deny;               // 0..IB_P_ONE:"不可用"反馈的强度
    int32_t shake;              // 不可用反馈的水平偏移(px)
} hint_t;

static lv_obj_t *s_layer;
static bool s_disabled;
static hint_t s_hints[IB_UI_KEY_COUNT];

static lv_color_t icon_color(const hint_t *h)
{
    if (s_disabled) return IB_C(ICON_DISABLED);
    return ib_gray_lerp(IB_COLOR_TEXT_DIM, IB_COLOR_TEXT, h->flash);
}

static void mark_draw(lv_event_t *e)
{
    const hint_t *h = lv_event_get_user_data(e);
    ib_fx_t fx;
    ib_fx_begin(&fx, e);
    int32_t cy = MARK_CY;
    lv_color_t c = s_disabled ? IB_C(MARK_DISABLED) : ib_gray_lerp(IB_COLOR_MUTE, IB_COLOR_TEXT, h->flash);
    // 不可用反馈:点向错误红过渡(彩色叠在精确灰上,不涉及灰色偏色)。
    if (h->deny > 0) c = lv_color_mix(IB_C(IB_COLOR_ERR), c, (uint8_t)(h->deny * 255 / IB_P_ONE));
    for (int i = -1; i <= 1; i++) {
        ib_fx_rect(&fx, DOT_X + h->shake, cy + i * DOT_PITCH - DOT / 2, DOT, DOT, 0, c, LV_OPA_COVER);
    }
    // 按下时上下各多出一颗点,随反馈强度淡入淡出(精确灰,黑 → 白)。
    if (h->flash > 0) {
        lv_color_t extra = ib_gray_lerp(IB_COLOR_BG, IB_COLOR_TEXT, h->flash);
        for (int i = -2; i <= 2; i += 4) ib_fx_rect(&fx, DOT_X, cy + i * DOT_PITCH - DOT / 2, DOT, DOT, 0, extra, LV_OPA_COVER);
    }
    if (h->hold_icon != IB_ICON_NONE) {
        // 沿用 12 px 字形和按键反馈颜色;小圆环只标识长按,不承载新的交互状态。
        ib_fx_text(&fx, ICON_CX, cy + HOLD_DY, ib_icon_glyph(h->hold_icon), &ib_icon_font_12,
                   icon_color(h), LV_OPA_COVER);
        ib_fx_ring(&fx, HOLD_RING_X, cy + HOLD_DY, 2, 1, c, LV_OPA_COVER);
    }
}

// 电源键由硬件管理,这里只画通用识别符;独立于右列以便离线页仍可辨认实体位置。
static void power_draw(lv_event_t *e)
{
    ib_fx_t fx;
    ib_fx_begin(&fx, e);
    lv_color_t c = IB_C(IB_COLOR_TEXT_DIM);
    ib_fx_arc(&fx, 6, 8, 4, 1, 315, 585, c, LV_OPA_COVER);
    ib_fx_line(&fx, 6, 2, 6, 7, 1, c, LV_OPA_COVER);
}

// 两种操作均为空才隐藏点列,允许只有长按动作的键保留实体位置提示。
static void hint_visibility(hint_t *h)
{
    if (h->press_icon == IB_ICON_NONE) lv_obj_add_flag(h->icon, LV_OBJ_FLAG_HIDDEN);
    else lv_obj_remove_flag(h->icon, LV_OBJ_FLAG_HIDDEN);
    if (h->press_icon == IB_ICON_NONE && h->hold_icon == IB_ICON_NONE)
        lv_obj_add_flag(h->mark, LV_OBJ_FLAG_HIDDEN);
    else lv_obj_remove_flag(h->mark, LV_OBJ_FLAG_HIDDEN);
    lv_obj_invalidate(h->mark);
}

// 动画值 0..IB_P_ONE 是时间进度:前 PRESS_PEAK% 以 ease-out 升到 1,其余以 ease-in 回落到 0。
static void press_cb(void *var, int32_t t)
{
    hint_t *h = var;
    int32_t peak = IB_P_ONE * PRESS_PEAK / 100;
    h->flash = t < peak ? ib_ease_out_cubic(t * IB_P_ONE / peak)
                        : ib_ease_out_cubic((IB_P_ONE - t) * IB_P_ONE / (IB_P_ONE - peak));   // = 1 - ease_in(u)
    lv_obj_set_style_text_color(h->icon, icon_color(h), 0);
    lv_obj_invalidate(h->mark);
}

void ib_hints_create(lv_obj_t *screen)
{
    static const int32_t YS[IB_UI_KEY_COUNT] = {
        [IB_UI_KEY_UP] = IB_HINT_Y_UP, [IB_UI_KEY_DOWN] = IB_HINT_Y_DOWN, [IB_UI_KEY_OK] = IB_HINT_Y_OK,
    };
    s_layer = ib_box_create(screen, IB_UI_W - IB_HINT_COL_W, 0, IB_HINT_COL_W, IB_UI_H);
    for (int k = 0; k < IB_UI_KEY_COUNT; k++) {
        hint_t *h = &s_hints[k];
        h->icon = lv_label_create(s_layer);
        lv_obj_set_style_text_font(h->icon, &ib_icon_font_12, 0);
        lv_obj_set_style_text_color(h->icon, IB_C(IB_COLOR_TEXT_DIM), 0);
        lv_obj_set_style_text_align(h->icon, LV_TEXT_ALIGN_CENTER, 0);
        lv_obj_set_size(h->icon, ICON_SIZE, ICON_SIZE);
        // 按字体实际行高在标签里上下居中,图标中心落在 YS[k]。
        lv_obj_set_style_pad_top(h->icon, (ICON_SIZE - lv_font_get_line_height(&ib_icon_font_12)) / 2, 0);
        lv_obj_set_pos(h->icon, ICON_CX - ICON_SIZE / 2, YS[k] - ICON_SIZE / 2);
        lv_label_set_text_static(h->icon, ib_icon_glyph(IB_ICON_NONE));
        h->press_icon = h->hold_icon = IB_ICON_NONE;
        h->mark = ib_fx_create(s_layer, 0, YS[k] - MARK_CY, IB_HINT_COL_W, MARK_H, mark_draw, h);
        lv_obj_add_flag(h->icon, LV_OBJ_FLAG_HIDDEN);
        lv_obj_add_flag(h->mark, LV_OBJ_FLAG_HIDDEN);
    }
    ib_fx_create(screen, 0, IB_HINT_Y_POWER - 7, 12, 14, power_draw, NULL);
}

void ib_hints_set_icon(ib_ui_key_t key, ib_icon_t icon)
{
    if ((unsigned)key >= IB_UI_KEY_COUNT) return;
    hint_t *h = &s_hints[key];
    if ((unsigned)icon >= IB_ICON_COUNT) icon = IB_ICON_NONE;
    h->press_icon = icon;
    lv_label_set_text_static(h->icon, ib_icon_glyph(icon));
    hint_visibility(h);
}

void ib_hints_set_hold_icon(ib_ui_key_t key, ib_icon_t icon)
{
    if ((unsigned)key >= IB_UI_KEY_COUNT) return;
    hint_t *h = &s_hints[key];
    if ((unsigned)icon >= IB_ICON_COUNT) icon = IB_ICON_NONE;
    h->hold_icon = icon;
    hint_visibility(h);
}

// "不可用"反馈:t 为 0..DENY_MS。点 60 ms 内变红,之后回落;同时左右抖动 3 次、幅度衰减。
static void deny_cb(void *var, int32_t t)
{
    hint_t *h = var;
    h->deny = t < 60 ? ib_ease_out_cubic(t * IB_P_ONE / 60) : IB_P_ONE - ib_progress((uint32_t)t, 60, DENY_MS - 60);
    int32_t amp = DENY_PX * (DENY_MS - t) / DENY_MS;
    h->shake = amp * ib_sin10(t * 3600 / 120) / 32768;            // 每 120 ms 一个来回
    lv_obj_invalidate(h->mark);
}

void ib_hints_press(ib_ui_key_t key)
{
    if ((unsigned)key >= IB_UI_KEY_COUNT) return;
    hint_t *h = &s_hints[key];
    if (s_disabled) {
        lv_anim_delete(h, deny_cb);
        lv_anim_t a;
        lv_anim_init(&a);
        lv_anim_set_var(&a, h);
        lv_anim_set_exec_cb(&a, deny_cb);
        lv_anim_set_values(&a, 0, DENY_MS);
        lv_anim_set_duration(&a, DENY_MS);
        lv_anim_set_path_cb(&a, lv_anim_path_linear);
        lv_anim_start(&a);
        return;
    }
    lv_anim_delete(h, press_cb);
    lv_anim_t a;
    lv_anim_init(&a);
    lv_anim_set_var(&a, h);
    lv_anim_set_exec_cb(&a, press_cb);
    lv_anim_set_values(&a, 0, IB_P_ONE);
    lv_anim_set_duration(&a, PRESS_MS);
    lv_anim_set_path_cb(&a, lv_anim_path_linear);
    lv_anim_start(&a);
}

void ib_hints_set_visible(bool visible)
{
    if (visible) lv_obj_remove_flag(s_layer, LV_OBJ_FLAG_HIDDEN);
    else lv_obj_add_flag(s_layer, LV_OBJ_FLAG_HIDDEN);
}

void ib_hints_set_disabled(bool disabled)
{
    if (s_disabled == disabled) return;
    s_disabled = disabled;
    for (int k = 0; k < IB_UI_KEY_COUNT; k++) {
        hint_t *h = &s_hints[k];
        lv_anim_delete(h, press_cb);
        lv_anim_delete(h, deny_cb);
        h->flash = h->deny = h->shake = 0;
        lv_obj_set_style_text_color(h->icon, icon_color(h), 0);
        lv_obj_invalidate(h->mark);
    }
}
