// 模式资源事务：所有回调返回后资源已就绪/退出，只有save成功才publish；失败反向恢复。
#pragma once
#include <stdbool.h>
typedef struct {
    bool (*audio)(bool companion,void *);
    bool (*worker)(bool enabled,void *);
    bool (*lan)(void *);
    bool (*save)(bool standalone,void *);
    void (*publish)(bool standalone,void *);
    void *context;
} ib_hot_mode_ops_t;
const char *ib_hot_mode_apply(bool current,bool requested,const ib_hot_mode_ops_t *);
typedef struct {
    bool switching,worker,ptt_pending,button_held,mic_active;
    bool presentation_owned,cloud_target,transcribing,presentation_active;
} ib_hot_mode_activity_t;
// 后台应用工作不是设备音频忙；只有语音阶段/云target拥有的活跃会话阻挡切换。
bool ib_hot_mode_busy(const ib_hot_mode_activity_t *);
