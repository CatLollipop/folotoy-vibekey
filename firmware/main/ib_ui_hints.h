// main/ib_ui_hints.h: 屏幕两侧的微型实体键提示(UI 内部模块)。
//
// Passport 的三个键在机身右侧,自上而下为 上 / 下 / OK(电源键在左侧靠上)。右列使用已有的
// 10–12 px、1 px线宽的中性路径图标；既有少见keys图标回退到12px Material字形。
// 短按对齐实体键；长按位于同键下方，只有长按时直接对齐主锚点，小圆环表示长按。
// IB_ICON_NONE 留空；两种操作均空才隐藏。按下只短暂提亮，无三点装饰或水平抖动。
// 左侧电源仅显示通用识别符,不表示固件支持短按或长按动作;不受右列显隐与禁用状态影响。
// 所有函数运行在 LVGL 任务或持有 LVGL 锁的任务里。
#pragma once

#include "ib_icons.h"
#include "ib_ui.h"
#include "lvgl.h"

#include <stdbool.h>
#include <stdint.h>

// ★ 三个实体键在屏幕上对应的纵坐标(屏幕坐标,图标的垂直中心)。换机身或实测有偏差时只改这里。
#define IB_HINT_Y_UP    70
#define IB_HINT_Y_DOWN  170
#define IB_HINT_Y_OK    270
// 左侧电源实体键约在屏幕高度的 18%,只显示通用电源符号。
#define IB_HINT_Y_POWER 58
// 提示列占用的右侧宽度;页面内容只使用左边 IB_UI_W - IB_HINT_COL_W 的区域,不会与提示重叠。
#define IB_HINT_COL_W   22

void ib_hints_create(lv_obj_t *screen);
void ib_hints_set_icon(ib_ui_key_t key, ib_icon_t icon);
// 只设置长按提示,不改变按键事件语义;NONE 隐藏长按字形和圆环。
void ib_hints_set_hold_icon(ib_ui_key_t key, ib_icon_t icon);
// 按键反馈:可用时图标与标记点亮起;禁用时(见 ib_hints_set_disabled)改为"不可用"反馈:
// 标记点闪红并左右抖动,图标保持暗色。
void ib_hints_press(ib_ui_key_t key);
// 仅控制右侧三键列;左侧电源识别符随屏幕保持可见。
void ib_hints_set_visible(bool visible);
// 禁用整列提示(PROC 页:上一句还在处理,OK 等键暂时不可用):图标与标记画成更暗的禁用色。
void ib_hints_set_disabled(bool disabled);

// 仅真实采集且提示可见/未禁用时呼吸；false删除循环动画，隐藏/休眠不持续刷新。
void ib_hints_set_recording(bool active);
