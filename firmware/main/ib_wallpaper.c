#include "ib_wallpaper.h"

#include "ib_base64.h"
#include "ib_crc32.h"
#include "ib_protocol.h"

#include "esp_log.h"
#include "esp_partition.h"

#include <inttypes.h>
#include <string.h>

static const char *TAG = "ib_wallpaper";

#define HEADER_SIZE 16
#define IMAGE_SIZE  IB_WALLPAPER_MAX_BYTES
#define MAP_SIZE    (HEADER_SIZE + IMAGE_SIZE)
#define MAGIC       "VKW1"

static const esp_partition_t *s_part;
static bool s_available;

static bool s_active;
static uint32_t s_expected_size;
static uint32_t s_expected_crc;
static uint32_t s_received;
static uint32_t s_crc;

static void write_u32(uint8_t *p, uint32_t value)
{
    p[0] = (uint8_t)value;
    p[1] = (uint8_t)(value >> 8);
    p[2] = (uint8_t)(value >> 16);
    p[3] = (uint8_t)(value >> 24);
}

esp_err_t ib_wallpaper_init(void)
{
    s_available = false;
    s_part = esp_partition_find_first(ESP_PARTITION_TYPE_DATA, 0x40, "wallpaper");
    if (!s_part) {
        ESP_LOGW(TAG, "wallpaper partition not found");
        return ESP_ERR_NOT_FOUND;
    }
    if (s_part->size < MAP_SIZE) {
        ESP_LOGW(TAG, "wallpaper partition too small: %" PRIu32, s_part->size);
        return ESP_ERR_INVALID_SIZE;
    }

    // 旧照片协议仅保留读写兼容；不再映射或渲染，也不自动擦除历史照片。
    return ESP_OK;
}

bool ib_wallpaper_available(void)
{
    return s_available;
}

const uint8_t *ib_wallpaper_pixels(void)
{
    return NULL;
}

esp_err_t ib_wallpaper_begin(uint32_t size, uint32_t crc)
{
    if (!s_part || size != IMAGE_SIZE) return ESP_ERR_INVALID_SIZE;
    esp_err_t err = esp_partition_erase_range(s_part, 0, (MAP_SIZE + 4095) & ~4095U);
    if (err != ESP_OK) return err;
    s_active = true;
    s_expected_size = size;
    s_expected_crc = crc;
    s_received = 0;
    s_crc = 0;
    return ESP_OK;
}

esp_err_t ib_wallpaper_write(uint32_t offset, const char *base64)
{
    if (!s_active || !base64) return ESP_ERR_INVALID_STATE;
    if (offset != s_received || offset >= s_expected_size) return ESP_ERR_INVALID_ARG;

    uint8_t chunk[288];
    size_t len = strlen(base64);
    int decoded = ib_base64_decode(base64, len, chunk, sizeof(chunk));
    if (decoded <= 0 || offset + (uint32_t)decoded > s_expected_size) return ESP_ERR_INVALID_ARG;

    esp_err_t err = esp_partition_write(s_part, HEADER_SIZE + offset, chunk, (size_t)decoded);
    if (err != ESP_OK) {
        s_active = false;
        return err;
    }
    s_crc = ib_crc32_update(s_crc, chunk, (size_t)decoded);
    s_received += (uint32_t)decoded;
    return ESP_OK;
}

esp_err_t ib_wallpaper_finish(void)
{
    if (!s_active) return ESP_ERR_INVALID_STATE;
    if (s_received != s_expected_size) {
        s_active = false;
        return ESP_ERR_INVALID_SIZE;
    }
    if (s_crc != s_expected_crc) {
        s_active = false;
        return ESP_ERR_INVALID_CRC;
    }

    uint8_t header[HEADER_SIZE] = { 0 };
    memcpy(header, MAGIC, 4);
    write_u32(header + 4, s_expected_size);
    write_u32(header + 8, s_expected_crc);
    esp_err_t err = esp_partition_write(s_part, 0, header, sizeof(header));
    s_active = false;
    return err;
}

esp_err_t ib_wallpaper_clear(void)
{
    if (!s_part) return ESP_ERR_NOT_FOUND;
    esp_err_t err = esp_partition_erase_range(s_part, 0, 4096);
    if (err == ESP_OK) {
        s_available = false;
        s_active = false;
    }
    return err;
}
