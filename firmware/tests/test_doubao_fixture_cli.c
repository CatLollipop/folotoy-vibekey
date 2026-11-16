// stdin接收一条二进制服务消息，逐字喂生产parser，输出纯结果供合成合同夹具断言。
#include "ib_doubao_asr.h"
#include <stdio.h>
static ib_doubao_asr_t parser;
int main(void){ib_doubao_asr_init(&parser);int c;while((c=getchar())!=EOF){unsigned char b=c;(void)ib_doubao_asr_feed(&parser,&b,1);}const char *error=ib_doubao_asr_finish(&parser);printf("%s\n%d\n%ld\n%lu\n%s",error?error:"ok",parser.last,(long)parser.sequence,(unsigned long)parser.error_code,parser.json.event.has_text?parser.json.event.text:"");return 0;}
