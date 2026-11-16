// 电脑通知独立单槽。事务串行化由assistant control保证，reader只短锁复制已提交正文。
#pragma once
#include "ib_link.h"
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#define IB_NOTIFICATION_MAX 2048u
#define IB_NOTIFICATION_CHUNK 96u
typedef enum { IB_NOTIFICATION_INPUT,IB_NOTIFICATION_DONE,IB_NOTIFICATION_ERROR } ib_notification_kind_t;
typedef struct {
    char nid[33],source[49];
    uint32_t rev,generation,revision,crc;
    size_t length,offset;
    ib_notification_kind_t kind;
    bool truncated,active,staging,committed,presented;
} ib_notification_snapshot_t;
// 先校验身份和所有权；replace=true后调用方hide UI，再begin重用buffer，避免不合法请求闪隐藏旧页。
const char *ib_notification_check_begin(ib_link_t,const char *nid,uint32_t rev,const char *source,ib_notification_kind_t,size_t,uint32_t crc,bool truncated,bool busy,bool *replace);
const char *ib_notification_begin(ib_link_t,const char *nid,uint32_t rev,const char *source,ib_notification_kind_t,size_t,uint32_t crc,bool truncated,bool busy);
const char *ib_notification_chunk(ib_link_t,const char *nid,uint32_t rev,size_t offset,const char *text,size_t length);
const char *ib_notification_commit(ib_link_t,const char *nid,uint32_t rev,size_t length,uint32_t crc);
const char *ib_notification_abort(ib_link_t,const char *nid,uint32_t rev);
const char *ib_notification_clear(const char *nid,uint32_t rev);
// 明确本地PTT/超时/关闭：先让UI hide，再释放正文；保留幂等提交身份，重发不复活。
void ib_notification_dismiss(void);
void ib_notification_snapshot(ib_notification_snapshot_t *);
size_t ib_notification_read(uint32_t generation,size_t offset,char *out,size_t capacity,void *context);
// 只有UI成功接纳完整正文后标记；返回是否应为此事件播一次本地短音。
bool ib_notification_presented(uint32_t generation);
