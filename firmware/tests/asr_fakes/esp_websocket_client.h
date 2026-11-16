#pragma once
#include "esp_transport_ws.h"
#include "freertos/FreeRTOS.h"
typedef struct fake_client *esp_websocket_client_handle_t;
typedef const char *esp_event_base_t;
enum {WEBSOCKET_EVENT_ANY=-1,WEBSOCKET_EVENT_CONNECTED=1,WEBSOCKET_EVENT_ERROR,WEBSOCKET_EVENT_DISCONNECTED,WEBSOCKET_EVENT_CLOSED,WEBSOCKET_EVENT_DATA};
typedef struct {const char *data_ptr;int data_len;bool fin;unsigned op_code;int payload_len,payload_offset;struct {int esp_ws_handshake_status_code,error_type,esp_tls_last_esp_err,esp_tls_stack_err,esp_tls_cert_verify_flags,esp_transport_sock_errno;} error_handle;} esp_websocket_event_data_t;
typedef struct {const char *uri,*task_name;esp_transport_handle_t ext_transport;bool disable_auto_reconnect;int task_stack,task_prio,buffer_size,network_timeout_ms,ping_interval_sec,pingpong_timeout_sec;} esp_websocket_client_config_t;
esp_websocket_client_handle_t esp_websocket_client_init(const esp_websocket_client_config_t *);
esp_err_t esp_websocket_register_events(esp_websocket_client_handle_t,int,void (*)(void *,esp_event_base_t,int32_t,void *),void *);
esp_err_t esp_websocket_client_start(esp_websocket_client_handle_t);
esp_err_t esp_websocket_client_stop(esp_websocket_client_handle_t);
esp_err_t esp_websocket_client_destroy(esp_websocket_client_handle_t);
int esp_websocket_client_send_text(esp_websocket_client_handle_t,const char *,int,TickType_t);
int esp_websocket_client_send_bin(esp_websocket_client_handle_t,const char *,int,TickType_t);
