// 助手 profile 与宠物设置的双 bank 存储；分区完全位于 cardid 之后。
#pragma once
#include "esp_err.h"
#include "esp_partition.h"
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>
#define IB_PROFILE_MAX 16384
#define IB_PET_JSON_MAX 4096
#define IB_PET_CONFIG_MAX 131072
typedef struct {
    char minimax_key[512], deepseek_key[256];
    char asr_key[512], asr_ws_url[192], asr_model[64], asr_resource_id[128];
    char minimax_base_url[192], deepseek_base_url[192];
    char llm_model[65], voice_id[96], system_prompt[2049];
    uint32_t revision, schema;
    unsigned record_limit_seconds, max_output_tokens, history_bytes, reply_bytes;
} ib_assistant_profile_t;
esp_err_t ib_assistant_store_init(void);
bool ib_assistant_store_ready(void);
bool ib_assistant_store_configured(void);
bool ib_assistant_store_usb_provisioned(void);
const ib_assistant_profile_t *ib_assistant_profile(void);
uint32_t ib_assistant_store_revision(bool pet);
// 仅在助手空闲、且同步互斥锁已持有时调用；成功后返回可处理的实际 offset。
const char *ib_assistant_store_begin(bool pet, uint32_t revision, size_t size, uint32_t crc, bool usb);
const char *ib_assistant_store_chunk(size_t offset, const void *data, size_t size);
const char *ib_assistant_store_commit(void);
void ib_assistant_store_abort(void);
esp_err_t ib_assistant_store_clear(void);
size_t ib_assistant_store_offset(void);
bool ib_assistant_store_uploading(void);
bool ib_assistant_mode_load(void);
esp_err_t ib_assistant_mode_save(bool standalone);
bool ib_assistant_pet_config(char *out, size_t cap);

uint32_t ib_assistant_store_upload_revision(void);

uint32_t ib_assistant_store_generation(void);

typedef bool (*ib_assistant_store_apply_cb)(void *context);
void ib_assistant_store_set_apply(ib_assistant_store_apply_cb,void *context);
bool ib_assistant_store_apply(void);
esp_err_t ib_assistant_pet_map(const void **data,size_t *size,esp_partition_mmap_handle_t *mapping);

// 新active与宠物映射应用成功后才回收旧bank；调用方与事务共用control互斥，采音时不调用。
const char *ib_assistant_store_cleanup(void);
bool ib_assistant_store_retired_clean(void);
