#pragma once
#include <stdbool.h>
#include <stdint.h>
#define IB_TRANSCRIPT_VIEW_BYTES 192u
/* 只保留屏幕窗口所需UTF-8尾部；完整识别结果由ASR/对话层持有，不在UI复制。 */
typedef struct {
    uint32_t generation;
    bool active,final,closed;
    char text[IB_TRANSCRIPT_VIEW_BYTES+1];
} ib_transcript_view_t;
bool ib_transcript_view_begin(ib_transcript_view_t *,uint32_t generation);
bool ib_transcript_view_update(ib_transcript_view_t *,uint32_t generation,const char *text,bool final);
void ib_transcript_view_clear(ib_transcript_view_t *,uint32_t generation);
