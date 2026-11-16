// tools/ui-preview/shim/bsp_display.h: 主机替身。预览是单线程,LVGL 锁总是立即成功。
// 只声明固件 UI 代码(ib_ui*.c)实际用到的接口。
#pragma once

#include <stdbool.h>
#include "esp_err.h"

bool bsp_lvgl_lock(int timeout_ms);
void bsp_lvgl_unlock(void);
// 离屏截图同步完成，无硬件DMA；真机由BSP等待实际color transaction全部结束。
static inline esp_err_t bsp_display_wait_idle(void){return ESP_OK;}
