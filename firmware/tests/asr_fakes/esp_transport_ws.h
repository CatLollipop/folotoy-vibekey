#pragma once
#include "esp_transport.h"
#include <stdbool.h>
enum {WS_TRANSPORT_OPCODES_CONT=0,WS_TRANSPORT_OPCODES_TEXT=1,WS_TRANSPORT_OPCODES_BINARY=2};
typedef struct {const char *ws_path,*user_agent,*auth,*headers;bool propagate_control_frames;} esp_transport_ws_config_t;
esp_transport_handle_t esp_transport_ws_init(esp_transport_handle_t);
esp_err_t esp_transport_ws_set_config(esp_transport_handle_t,const esp_transport_ws_config_t *);

int esp_transport_ws_get_upgrade_request_status(esp_transport_handle_t);
