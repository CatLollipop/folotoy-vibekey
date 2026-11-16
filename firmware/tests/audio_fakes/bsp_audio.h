#pragma once
#include "esp_err.h"
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>
esp_err_t bsp_audio_init(void);
esp_err_t bsp_audio_set_format(uint32_t,uint8_t,uint8_t);
void bsp_audio_set_volume(uint8_t);
void bsp_audio_mute(bool);
esp_err_t bsp_audio_read(void *,size_t);
esp_err_t bsp_audio_write(const void *,size_t);
esp_err_t bsp_audio_close(void);
