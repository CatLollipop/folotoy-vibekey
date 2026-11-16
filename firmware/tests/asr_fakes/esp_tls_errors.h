#pragma once
#include "esp_err.h"
typedef struct esp_tls_last_error {esp_err_t last_error;int esp_tls_error_code;int esp_tls_flags;} esp_tls_last_error_t;
typedef esp_tls_last_error_t *esp_tls_error_handle_t;
