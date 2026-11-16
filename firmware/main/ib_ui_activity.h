#pragma once
#include "ib_ui_gfx.h"
#include "ib_ui_labels.h"
// 只画当前真实语义阶段；时间只驱动图形运动，不推断阶段或完成。
void ib_activity_draw(const ib_fx_t *,int cx,int cy,ib_ui_assistant_phase_t,bool capturing,uint32_t now_ms);
bool ib_activity_animates(ib_ui_assistant_phase_t,bool capturing);
