#include "test_common.h"
#include "ib_doubao_asr.h"
#include <stdlib.h>
static ib_doubao_asr_t parser;
static void put32(uint8_t *p,uint32_t n){for(unsigned i=0;i<4;i++)p[i]=n>>(24-i*8);}
static size_t response(uint8_t *wire,unsigned flags,const char *json){size_t n=strlen(json),h=flags&1?12:8;wire[0]=0x11;wire[1]=0x90|flags;wire[2]=0x10;wire[3]=0;if(flags&1)put32(wire+4,flags&2?0xffffffff:1);put32(wire+h-4,n);memcpy(wire+h,json,n);return h+n;}
static void parse(const uint8_t *wire,size_t size,size_t chunk){ib_doubao_asr_init(&parser);for(size_t pos=0;pos<size;pos+=chunk){size_t take=size-pos<chunk?size-pos:chunk;CHECK(ib_doubao_asr_feed(&parser,wire+pos,take));}CHECK(ib_doubao_asr_finish(&parser)==NULL);}
int main(void){
    uint8_t wire[8192];
    for(unsigned flags=0;flags<4;flags++){
        size_t n=response(wire,flags,"{\"result\":{\"text\":\"你好。\\ud83d\\ude00\",\"utterances\":[{\"text\":\"ignored\",\"definite\":true}]}}");
        for(size_t chunk=1;chunk<=n;chunk++){parse(wire,n,chunk);CHECK_STR(parser.json.event.text,"你好。😀");CHECK(parser.last==((flags&2)!=0));}
    }
    size_t n=response(wire,3,"{\"result\":[{\"text\":\"第一项\"},{\"text\":\"不是当前结果\"}]}");parse(wire,n,1);CHECK_STR(parser.json.event.text,"第一项");
    n=response(wire,3,"{\"result\":{\"text\":\"全量快照\"}}");put32(wire+4,13);parse(wire,n,1);CHECK(parser.last&&parser.sequence==13);
    n=response(wire,1,"{\"result\":{\"text\":\"中间快照\"}}");put32(wire+4,0xffffffff);parse(wire,n,1);CHECK(!parser.last&&parser.sequence==-1);
    n=response(wire,0,"{\"result\":{\"text\":\"中文\"}}");for(size_t cut=0;cut<n;cut++){ib_doubao_asr_init(&parser);(void)ib_doubao_asr_feed(&parser,wire,cut);CHECK(ib_doubao_asr_finish(&parser)!=NULL);}
    wire[2]=0x11;ib_doubao_asr_init(&parser);CHECK(!ib_doubao_asr_feed(&parser,wire,n));CHECK_STR(ib_doubao_asr_finish(&parser),"asr_unsupported_compression");
    const unsigned codes[]={45000001,45000002,45000081,55000031};const char *errors[]={"asr_task_failed","no_speech","asr_finish_timeout","provider_unavailable"};
    for(unsigned i=0;i<4;i++){memset(wire,0,12);wire[0]=0x11;wire[1]=0xf0;put32(wire+4,codes[i]);ib_doubao_asr_init(&parser);CHECK(ib_doubao_asr_feed(&parser,wire,12));CHECK_STR(ib_doubao_asr_finish(&parser),errors[i]);CHECK(parser.error_code==codes[i]);}
    uint8_t header[8];ib_doubao_client_header(header,true,false,321);CHECK(header[0]==0x11&&header[1]==0x10&&header[2]==0x10&&header[6]==1&&header[7]==65);
    ib_doubao_client_header(header,false,true,0);CHECK(header[1]==0x22&&header[2]==0&&header[7]==0);
    TEST_DONE("doubao_asr");
}
