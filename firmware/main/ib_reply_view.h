#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define IB_REPLY_VIEW_MAX_BYTES 4096u
#define IB_REPLY_VIEW_TEXT_BYTES 192u

/* 回调只读assistant拥有的不可变已发布前缀；返回实际字节数、不含NUL，可短读。
 * 失效轮次返回0，不在此回调取GUI锁；reader/ctx有效期持续到clear或下一次成功update。 */
typedef size_t (*ib_reply_reader_fn)(uint32_t generation,size_t offset,char *out,size_t capacity,void *ctx);
typedef uint16_t (*ib_reply_measure_fn)(uint32_t codepoint,void *ctx);

/* 页索引从0开始，source偏移均为UTF-8完整边界；text只保存当前两行，换页无页表/堆分配。 */
typedef struct {
    uint32_t generation;
    size_t length,page_start,page_end;
    uint16_t page_index,page_count,width;
    bool active,final,closed,manual;
    uint32_t prefix_hash;
    ib_reply_reader_fn reader;
    void *reader_ctx;
    ib_reply_measure_fn measure;
    void *measure_ctx;
    char text[IB_REPLY_VIEW_TEXT_BYTES+1u];
} ib_reply_view_t;

void ib_reply_view_init(ib_reply_view_t *,uint16_t width,ib_reply_measure_fn,void *measure_ctx);
bool ib_reply_view_begin(ib_reply_view_t *,uint32_t generation);
/* 扫描并校验全部已发布length后才成功。final只在完整校验/当前页构建成功后冻结，可作为UI ACK门禁。
 * 当前轮读失败/非法UTF-8/长度回退会清理并封闭本轮；旧轮和final后的update不改变当前显示。 */
bool ib_reply_view_update(ib_reply_view_t *,uint32_t generation,size_t length,bool final,ib_reply_reader_fn,void *reader_ctx);
/* generation=0显式重置连接epoch及序号，下一begin接受任意非零generation；
 * 其他值必须精确匹配并保留序号，特定轮clear后同generation不得重启。 */
bool ib_reply_view_clear(ib_reply_view_t *,uint32_t generation);
bool ib_reply_view_page(ib_reply_view_t *,int delta);
bool ib_reply_view_active(const ib_reply_view_t *);
