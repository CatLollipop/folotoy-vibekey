// 一份有界回复正文。worker只追加未发布区，UI通过generation reader复制已发布不可变前缀。
#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#define IB_REPLY_TEXT_MAX 4096u
typedef struct {
    uint32_t generation,revision;
    size_t length;
    bool active,final;
} ib_reply_snapshot_t;
const char *ib_reply_store_begin(uint32_t generation,char **worker_buffer);
const char *ib_reply_store_append(uint32_t generation,size_t offset,const char *utf8,size_t length);
const char *ib_reply_store_final(uint32_t generation,size_t length);
void ib_reply_store_clear(uint32_t generation); //0强清，worker在途仅隐藏，实际释放延后。
void ib_reply_store_snapshot(ib_reply_snapshot_t *);
size_t ib_reply_store_read(uint32_t generation,size_t offset,char *out,size_t capacity,void *context);
bool ib_reply_store_publish(uint32_t generation,size_t length);
bool ib_reply_store_worker_end(uint32_t generation,bool success);
