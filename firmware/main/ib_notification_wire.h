// 独立通知事务解析/回执。control_ready时调用方已串行化写者；此模块不访问串口/GUI任务。
#pragma once
#include "ib_notification.h"
#include "cJSON.h"
typedef struct {
    bool (*busy)(void *);
    bool (*hide)(void *);
    bool (*apply)(void *);
    void *context;
} ib_notification_wire_ops_t;
bool ib_notification_wire_reply(ib_link_t,const cJSON *,bool control_ready,const ib_notification_wire_ops_t *,char *response,size_t capacity);
