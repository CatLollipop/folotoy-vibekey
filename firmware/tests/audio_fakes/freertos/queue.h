#pragma once
#include "FreeRTOS.h"
#include <stddef.h>
typedef struct fake_queue *QueueHandle_t;
QueueHandle_t xQueueCreate(unsigned,size_t);
BaseType_t xQueueOverwrite(QueueHandle_t,const void *);
BaseType_t xQueueReceive(QueueHandle_t,void *,TickType_t);
BaseType_t xQueueReset(QueueHandle_t);
void vQueueDelete(QueueHandle_t);
