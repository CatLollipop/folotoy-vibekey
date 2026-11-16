#pragma once
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

/* 官方 grid=24，shape-space=240；viewBox 两侧各保留2格，共28×28。
 * LVGL桥按 gap=.16 画圆点，暗点也会回调以清除上一帧。所有函数在同一UI任务调用。 */
#define IB_PET_GRID 24
#define IB_PET_SIZE 28
#define IB_PET_GAP_PERCENT 16
typedef enum {
    IB_PET_IDLE, IB_PET_SLEEPING, IB_PET_DROWSY, IB_PET_BORED, IB_PET_WAKING, IB_PET_STOPPED,
    IB_PET_LISTENING, IB_PET_THINKING, IB_PET_SEARCHING, IB_PET_READING, IB_PET_WRITING,
    IB_PET_WORKING, IB_PET_LOADING, IB_PET_PROGRESS, IB_PET_RADAR, IB_PET_ORBIT,
    IB_PET_DICTATING, IB_PET_UPLOADING, IB_PET_SENDING, IB_PET_RECEIVING, IB_PET_MESSAGING,
    IB_PET_WAITING, IB_PET_SPAWNING, IB_PET_REPLYING, IB_PET_DRAGGING, IB_PET_HAPPY,
    IB_PET_EXCITED, IB_PET_LAUGHING, IB_PET_PLAYFUL, IB_PET_PROUD, IB_PET_DONE,
    IB_PET_BOUNCING, IB_PET_SHY, IB_PET_SAD, IB_PET_ANGRY, IB_PET_CONFUSED,
    IB_PET_SUSPICIOUS, IB_PET_SURPRISED, IB_PET_SCARED, IB_PET_CURIOUS, IB_PET_HUMMING,
    IB_PET_ERROR, IB_PET_NOTIFYING, IB_PET_REFUSING, IB_PET_STATE_COUNT
} ib_pet_state_t;
typedef void (*ib_pet_pixel_fn)(uint8_t col,uint8_t row,uint32_t rgb888,uint8_t brightness,void *context);
void ib_pet_init(void);
/* UI锁内零拷贝切到已校验mmap资产；NULL,0恢复内置Dot并释放旧指针引用。 */
bool ib_pet_load_bundle(const void *data,size_t size);
void ib_pet_set_state(ib_pet_state_t state,uint32_t now_ms);
bool ib_pet_set_state_name(const char *state,uint32_t now_ms);
bool ib_pet_state_is_valid(const char *state);
const char *ib_pet_state_name(void);
void ib_pet_set_level(uint8_t level);
/* fps夹到6..20，brightness夹到10..100；返回实际应用值由调用方持久化。 */
void ib_pet_configure(bool enabled,uint8_t fps,uint8_t brightness);
void ib_pet_set_color(uint32_t rgb888);
bool ib_pet_enabled(void);
/* 内部按fps限流；返回true表示真正栅格化一帧。无malloc、网络或LVGL依赖。 */
bool ib_pet_render(uint32_t now_ms,ib_pet_pixel_fn pixel,void *context);
// 启动背光门禁：强制当前已加载资产/姿态写入缓存，不受FPS限流、不推进时间。
bool ib_pet_render_current(ib_pet_pixel_fn pixel,void *context);
/* 供host黄金测试/截图：无动画静态关键姿态，动态仍由上面C内核实时计算。 */
void ib_pet_render_static(ib_pet_state_t state,ib_pet_pixel_fn pixel,void *context);
