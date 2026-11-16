// 豆包v3二进制消息选择解析；客户端明确协商compression0，服务端依官方合同同样不压缩。
#pragma once
#include "ib_asr_events.h"
typedef struct {
    ib_asr_json_t json;
    uint8_t header[12];
    size_t header_used, header_need, payload_size, payload_used;
    uint32_t error_code;
    int32_t sequence;
    bool last, failed, error_frame;
    const char *error;
} ib_doubao_asr_t;
void ib_doubao_asr_init(ib_doubao_asr_t *);
bool ib_doubao_asr_feed(ib_doubao_asr_t *,const void *,size_t);
const char *ib_doubao_asr_finish(ib_doubao_asr_t *);
void ib_doubao_client_header(uint8_t out[8],bool request,bool last,size_t payload);
