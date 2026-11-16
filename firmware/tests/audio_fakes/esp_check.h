#pragma once
#include "esp_err.h"
#define ESP_RETURN_ON_ERROR(call,tag,...) do{esp_err_t _test_error=(call);(void)(tag);if(_test_error!=ESP_OK)return _test_error;}while(0)
#define ESP_RETURN_ON_FALSE(test,error,tag,...) do{(void)(tag);if(!(test))return (error);}while(0)
