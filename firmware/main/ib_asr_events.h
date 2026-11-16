// 实时ASR JSON选择解析。无堆分配，逐字跳过时间戳，只提取result.text完整快照。
#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#define IB_ASR_TEXT_CAP 4096
#define IB_ASR_MESSAGE_MAX 65536u

typedef struct {
    char text[IB_ASR_TEXT_CAP];
    bool has_text;
} ib_asr_event_t;
typedef struct {
    uint8_t kind, stage, key;
} ib_asr_json_frame_t;
typedef struct {
    ib_asr_event_t event;
    ib_asr_json_frame_t frames[16];
    char token[40];
    size_t token_used, string_used, bytes;
    uint32_t unicode, high_surrogate, utf8_value, utf8_min, seen;
    uint8_t depth, lex, field, unicode_left, utf8_left;
    bool root_done, failed, key_string, escaped, need_low_surrogate, text_full;
} ib_asr_json_t;
void ib_asr_json_init(ib_asr_json_t *);
bool ib_asr_json_feed(ib_asr_json_t *,const void *,size_t);
// 豆包full JSON只要求完整文档；result.text缺省的中间确认包由调用方忽略。
bool ib_asr_json_finish_document(ib_asr_json_t *);
