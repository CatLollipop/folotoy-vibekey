#pragma once
#include "esp_err.h"
#include <stdint.h>
#include <stddef.h>
#define ESP_PARTITION_TYPE_DATA 1
typedef struct { uint32_t address,size; } esp_partition_t;
const esp_partition_t *esp_partition_find_first(int,int,const char *);
esp_err_t esp_partition_read(const esp_partition_t *,size_t,void *,size_t);
esp_err_t esp_partition_write(const esp_partition_t *,size_t,const void *,size_t);
esp_err_t esp_partition_erase_range(const esp_partition_t *,size_t,size_t);
typedef uint32_t esp_partition_mmap_handle_t;
typedef enum { ESP_PARTITION_MMAP_DATA } esp_partition_mmap_memory_t;
esp_err_t esp_partition_mmap(const esp_partition_t *,size_t,size_t,esp_partition_mmap_memory_t,const void **,esp_partition_mmap_handle_t *);
void esp_partition_munmap(esp_partition_mmap_handle_t);
