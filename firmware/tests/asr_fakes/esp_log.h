#pragma once
#define ESP_LOG_NONE 0
void esp_log_level_set(const char *,int);

#define ESP_LOGW(tag,format,...) ((void)(tag),(void)(format))
