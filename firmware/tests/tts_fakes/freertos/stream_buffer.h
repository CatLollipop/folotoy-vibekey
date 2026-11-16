#pragma once
#include "FreeRTOS.h"
#include <stddef.h>
typedef struct fake_stream *StreamBufferHandle_t;
StreamBufferHandle_t xStreamBufferCreate(size_t,size_t);
size_t xStreamBufferSend(StreamBufferHandle_t,const void *,size_t,TickType_t);
size_t xStreamBufferReceive(StreamBufferHandle_t,void *,size_t,TickType_t);
size_t xStreamBufferBytesAvailable(StreamBufferHandle_t);
void vStreamBufferDelete(StreamBufferHandle_t);
