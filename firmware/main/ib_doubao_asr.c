#include "ib_doubao_asr.h"
#include <string.h>
static uint32_t be32(const uint8_t *p){return (uint32_t)p[0]<<24|(uint32_t)p[1]<<16|(uint32_t)p[2]<<8|p[3];}
static void put32(uint8_t *p,uint32_t n){for(unsigned i=0;i<4;i++)p[i]=n>>(24-8*i);}
void ib_doubao_client_header(uint8_t out[8],bool request,bool last,size_t size){out[0]=0x11;out[1]=(request?0x10:0x20)|(last?2:0);out[2]=request?0x10:0;out[3]=0;put32(out+4,size);}
void ib_doubao_asr_init(ib_doubao_asr_t *s){memset(s,0,sizeof(*s));s->header_need=4;ib_asr_json_init(&s->json);}
static bool fail(ib_doubao_asr_t *s,const char *error){s->failed=true;s->error=error;return false;}
bool ib_doubao_asr_feed(ib_doubao_asr_t *s,const void *bytes,size_t size){
    const uint8_t *p=bytes;if(s->failed)return false;
    while(size){
        if(s->header_used<s->header_need){
            size_t n=s->header_need-s->header_used;if(n>size)n=size;memcpy(s->header+s->header_used,p,n);s->header_used+=n;p+=n;size-=n;
            if(s->header_used<4)continue;
            if(s->header_need==4){
                unsigned type=s->header[1]>>4,flags=s->header[1]&15;
                if(s->header[0]!=0x11||s->header[3]||flags>3||(type!=9&&type!=15))return fail(s,"asr_invalid_frame");
                if((s->header[2]&15)!=0)return fail(s,"asr_unsupported_compression");
                if(type==9&&(s->header[2]>>4)!=1)return fail(s,"asr_invalid_frame");
                s->last=(flags&2)!=0;s->error_frame=type==15;
                s->header_need=4+((flags&1)||s->error_frame?4:0)+4;
                continue;
            }
            if(s->header_used==s->header_need){
                unsigned flags=s->header[1]&15;
                if(s->error_frame)s->error_code=be32(s->header+4);
                // 实际服务flags3可带正seq；官方新版按bit1判终态，不能按序号符号误拒或误成功。
                else if(flags&1){s->sequence=(int32_t)be32(s->header+4);}
                s->payload_size=be32(s->header+s->header_need-4);
                if(s->payload_size>IB_ASR_MESSAGE_MAX)return fail(s,"response_too_large");
            }
        }else{
            size_t n=s->payload_size-s->payload_used;if(n>size)n=size;if(!n)return fail(s,"asr_invalid_frame");
            if(!s->error_frame&&!ib_asr_json_feed(&s->json,p,n))return fail(s,s->json.text_full?"transcript_too_large":"asr_invalid_json");
            s->payload_used+=n;p+=n;size-=n;
        }
    }
    return true;
}
const char *ib_doubao_asr_finish(ib_doubao_asr_t *s){
    if(s->failed)return s->error;
    if(s->header_used!=s->header_need||s->payload_used!=s->payload_size)return "asr_invalid_frame";
    if(s->error_frame){if(s->error_code==45000002)return "no_speech";if(s->error_code==45000081)return "asr_finish_timeout";if(s->error_code>=55000000)return "provider_unavailable";return "asr_task_failed";}
    if(!ib_asr_json_finish_document(&s->json))return "asr_invalid_json";
    return NULL;
}
