// main/ib_ui_hints.h: 屏幕两侧的微型实体键提示(UI 内部模块)。
//
// Passport 的三个键在机身右侧,自上而下为 上 / 下 / OK(电源键在左侧靠上)。右列使用已有的
// 10–12 px、1 px线宽的中性路径图标；既有少见keys图标回退到12px Material字形。
// 每键只画一个动作：有效翻页/短按优先，只有长按可用时在主锚点回退，小圆环表示长按。
// IB_ICON_NONE 留空；两种操作均空才隐藏。按下只短暂提亮，无三点装饰或水平抖动。
// 左侧电源仅显示通用识别符,不表示固件支持短按或长按动作;不受右列显隐与禁用状态影响。
// 所有函数运行在 LVGL 任务或持有 LVGL 锁的任务里。
#pragma once

#include "ib_icons.h"
#include "ib_ui.h"
#include "lvgl.h"
#include "ib_ui_gfx.h"

#include <stdbool.h>
#include <stdint.h>

// ★ 三个实体键在屏幕上对应的纵坐标(屏幕坐标,图标的垂直中心)。换机身或实测有偏差时只改这里。
#define IB_HINT_Y_UP    70
#define IB_HINT_Y_DOWN  170
#define IB_HINT_Y_OK    270
// 左侧电源实体键约在屏幕高度的 18%,只显示通用电源符号。
#define IB_HINT_Y_POWER 58
// 提示列占用的右侧宽度；助手画布全宽居中，正文198px另留右列安全边距。
#define IB_HINT_COL_W   22

void ib_hints_create(lv_obj_t *screen);
void ib_hints_set_icon(ib_ui_key_t key, ib_icon_t icon);
// 只设置长按提示,不改变按键事件语义;NONE 隐藏长按字形和圆环。
void ib_hints_set_hold_icon(ib_ui_key_t key, ib_icon_t icon);
// 按键反馈只提亮当前图标，禁用反馈短暂变错误色，不移动实体键锚点。
void ib_hints_press(ib_ui_key_t key);
// 仅控制右侧三键列;左侧电源识别符随屏幕保持可见。
void ib_hints_set_visible(bool visible);
// 禁用整列提示(PROC 页:上一句还在处理,OK 等键暂时不可用):图标与标记画成更暗的禁用色。
void ib_hints_set_disabled(bool disabled);

// 仅真实采集且提示可见/未禁用时呼吸；false删除循环动画，隐藏/休眠不持续刷新。
void ib_hints_set_recording(bool active);

// 同一套1px动作图元供阶段/通知小图标复用，不新增字体/位图。
void ib_ui_action_glyph(const ib_fx_t *,int cx,int cy,ib_icon_t,lv_color_t);
// 读层页码只保留index/total，滚动窗口至多7圆点，上下隐藏页使用省略标记。
void ib_hints_set_pagination(bool active,uint16_t page_index,uint16_t total);
ib_icon_t ib_hints_current_icon(ib_ui_key_t key);

typedef struct {bool active,before,after;uint16_t first,count,current,total;} ib_hint_pages_t;
// 当前读层的有界可见窗口，也是draw使用的同一计算结果。
ib_hint_pages_t ib_hints_page_window(void);
