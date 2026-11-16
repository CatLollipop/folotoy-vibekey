#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
/* 分页测宽与显示共用映射：不在现有Noto字库的emoji/生僻字显式显示□，不能留白。 */
uint32_t ib_reply_font_codepoint(uint32_t codepoint);
uint16_t ib_reply_font_advance(uint32_t codepoint,void *context);
bool ib_reply_font_copy(char *out,size_t capacity,const char *utf8);
