// main/ib_wallpaper.h: 历史照片分区的协议兼容读写，当前离线页固定显示宠物。
//
// 分区布局:16 字节头("VKW1" + size + crc + 保留)+ 240×320 RGB565 像素。
// 头在最后写入；启动不映射、不显示、也不自动擦除历史照片。
#pragma once

#include "esp_err.h"

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

// 找到历史wallpaper分区供旧协议写入；不做映射，available始终false。
esp_err_t ib_wallpaper_init(void);
bool ib_wallpaper_available(void);
// 兼容旧接口，当前始终返回NULL。
const uint8_t *ib_wallpaper_pixels(void);

esp_err_t ib_wallpaper_begin(uint32_t size, uint32_t crc);
esp_err_t ib_wallpaper_write(uint32_t offset, const char *base64);
esp_err_t ib_wallpaper_finish(void);
esp_err_t ib_wallpaper_clear(void);
