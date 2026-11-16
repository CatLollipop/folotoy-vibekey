#include "ib_reply_store.h"
#include "ib_cloud_stream.h"
#include "freertos/FreeRTOS.h"
#include <stdlib.h>
#include <string.h>
static portMUX_TYPE s_lock=portMUX_INITIALIZER_UNLOCKED;
static char *s_text;
static bool s_worker,s_reset_pending;
static ib_reply_snapshot_t s_view;
static bool utf8(const char *text,size_t size){
    const unsigned char *p=(const unsigned char *)text;
    for(size_t i=0;i<size;){unsigned c=p[i],n=c<0x80?1:c>=0xc2&&c<=0xdf?2:c>=0xe0&&c<=0xef?3:c>=0xf0&&c<=0xf4?4:0;
        if(!c||!n||n>size-i)return false;
        for(unsigned j=1;j<n;j++)if((p[i+j]&0xc0)!=0x80)return false;
        if(n==3&&((c==0xe0&&p[i+1]<0xa0)||(c==0xed&&p[i+1]>=0xa0)))return false;
        if(n==4&&((c==0xf0&&p[i+1]<0x90)||(c==0xf4&&p[i+1]>=0x90)))return false;
        i+=n;
    }return true;
}
static void dispose(char *text){if(text){memset(text,0,IB_REPLY_TEXT_MAX+1);free(text);}}
void ib_reply_store_snapshot(ib_reply_snapshot_t *out){portENTER_CRITICAL(&s_lock);*out=s_view;portEXIT_CRITICAL(&s_lock);}
void ib_reply_store_clear(uint32_t generation){
    char *old=NULL;portENTER_CRITICAL(&s_lock);
    if(!generation||generation==s_view.generation){
        s_view.active=s_view.final=false;s_view.length=0;s_view.revision++;
        if(!generation){if(s_worker)s_reset_pending=true;else s_view.generation=0;}
        if(!s_worker){old=s_text;s_text=NULL;s_reset_pending=false;}
    }
    portEXIT_CRITICAL(&s_lock);dispose(old);
}
const char *ib_reply_store_begin(uint32_t generation,char **worker_buffer){
    if(!generation)return "invalid_generation";
    if(worker_buffer)*worker_buffer=NULL;
    portENTER_CRITICAL(&s_lock);bool busy=s_worker;
    bool same=generation==s_view.generation&&s_view.active&&!s_view.final;
    bool stale=s_view.generation&&(int32_t)(generation-s_view.generation)<=0;
    portEXIT_CRITICAL(&s_lock);
    if(busy)return "busy";
    if(same&&!worker_buffer)return NULL; //同代begin重试不擦除已收块。
    if(stale)return "stale_generation";
    ib_reply_store_clear(0);char *text=calloc(1,IB_REPLY_TEXT_MAX+1);if(!text)return "out_of_memory";
    portENTER_CRITICAL(&s_lock);s_text=text;s_worker=worker_buffer!=NULL;s_reset_pending=false;s_view.generation=generation;s_view.length=0;s_view.active=true;s_view.final=false;s_view.revision++;portEXIT_CRITICAL(&s_lock);
    if(worker_buffer)*worker_buffer=text;
    return NULL;
}
const char *ib_reply_store_append(uint32_t generation,size_t offset,const char *text,size_t size){
    if(!text||!size||size>192||!utf8(text,size))return "invalid_reply";
    const char *error=NULL;portENTER_CRITICAL(&s_lock);
    if(s_worker)error="busy";
    else if(!s_view.active||generation!=s_view.generation||s_view.final)error="stale_generation";
    else if(offset!=s_view.length)error="invalid_offset";
    else if(size>IB_REPLY_TEXT_MAX-offset)error="reply_too_large";
    else{memcpy(s_text+offset,text,size);s_view.length+=size;s_text[s_view.length]=0;s_view.revision++;}
    portEXIT_CRITICAL(&s_lock);return error;
}
const char *ib_reply_store_final(uint32_t generation,size_t length){
    const char *error=NULL;portENTER_CRITICAL(&s_lock);
    if(s_worker)error="busy";
    else if(!s_view.active||generation!=s_view.generation)error="stale_generation";
    else if(length!=s_view.length||!length)error="invalid_size";
    else if(!s_view.final){s_view.final=true;s_view.revision++;}
    portEXIT_CRITICAL(&s_lock);return error;
}
bool ib_reply_store_publish(uint32_t generation,size_t length){
    bool ok=false;portENTER_CRITICAL(&s_lock);
    if(s_worker&&s_view.active&&!s_view.final&&s_view.generation==generation&&length>=s_view.length&&length<=IB_REPLY_TEXT_MAX&&utf8(s_text+s_view.length,length-s_view.length)){
        s_view.length=length;s_view.revision++;ok=true;
    }portEXIT_CRITICAL(&s_lock);return ok;
}
bool ib_reply_store_worker_end(uint32_t generation,bool success){
    char *old=NULL;bool retained=false;portENTER_CRITICAL(&s_lock);
    if(s_worker&&generation==s_view.generation){
        s_worker=false;
        if(success&&s_view.active&&s_view.length){s_view.final=true;s_view.revision++;retained=true;}
        else{s_view.active=s_view.final=false;s_view.length=0;s_view.revision++;old=s_text;s_text=NULL;}
        if(s_reset_pending){s_view.generation=0;s_reset_pending=false;}
    }portEXIT_CRITICAL(&s_lock);dispose(old);return retained;
}
size_t ib_reply_store_read(uint32_t generation,size_t offset,char *out,size_t capacity,void *context){
    (void)context;size_t size=0;if(!out||!capacity)return 0;
    portENTER_CRITICAL(&s_lock);
    if(s_view.active&&s_text&&generation==s_view.generation&&offset<s_view.length&&((unsigned char)s_text[offset]&0xc0)!=0x80){
        size=ib_utf8_prefix(s_text+offset,s_view.length-offset,capacity);memcpy(out,s_text+offset,size);
    }portEXIT_CRITICAL(&s_lock);return size;
}
