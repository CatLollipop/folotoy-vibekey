// 运行器与云协议通过小接口解耦；所有请求串行，cancel 由按键任务置位。
#pragma once
#include "ib_assistant_store.h"
#include "esp_partition.h"
typedef bool (*ib_cloud_cancel_cb)(void);
typedef void (*ib_cloud_text_cb)(const char *);
const char *ib_assistant_cloud_reply(const ib_assistant_profile_t *,const char *,char *,size_t,ib_cloud_cancel_cb,ib_cloud_text_cb);
const char *ib_assistant_cloud_tts(const ib_assistant_profile_t *,const char *,ib_cloud_cancel_cb);
void ib_assistant_cloud_clear_history(void);
void ib_assistant_cloud_init(void);
// 只shutdown已登记socket，不跨任务调用mbedTLS或销毁HTTP context。
void ib_assistant_cloud_cancel(void);

// ASR/HTTP共用一次可信时钟同步；不能跳过CA证书有效期。
bool ib_assistant_cloud_clock_ready(ib_cloud_cancel_cb);
