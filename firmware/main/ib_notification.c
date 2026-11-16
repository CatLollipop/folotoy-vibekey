#include "ib_notification.h"
#include "ib_cloud_stream.h"
#include "ib_crc32.h"
#include "freertos/FreeRTOS.h"
#include <stdlib.h>
#include <string.h>
static portMUX_TYPE s_lock=portMUX_INITIALIZER_UNLOCKED;
static ib_notification_snapshot_t s_view;
static char *s_text;
static ib_link_t s_owner=IB_LINK_COUNT;
static uint32_t s_generation,s_revision;
// 最近8个已呈现事件跨rev/断线去重；槽仍只保一份2KiB，重启由Mac已ACK队列负责。
static char s_chimed[8][33];
static unsigned s_chime_next;
static bool valid_id(const char *id){if(!id||strlen(id)!=32)return false;for(unsigned i=0;i<32;i++)if(!((id[i]>='0'&&id[i]<='9')||(id[i]>='a'&&id[i]<='f')))return false;return true;}
static bool valid_utf8(const char *text,size_t size){
    if(!text)return false;
    const unsigned char *p=(const unsigned char *)text;
    for(size_t i=0;i<size;){unsigned c=p[i],n=c<0x80?1:c>=0xc2&&c<=0xdf?2:c>=0xe0&&c<=0xef?3:c>=0xf0&&c<=0xf4?4:0;
        if(!c||!n||n>size-i)return false;
        for(unsigned j=1;j<n;j++)if((p[i+j]&0xc0)!=0x80)return false;
        if(n==3&&((c==0xe0&&p[i+1]<0xa0)||(c==0xed&&p[i+1]>=0xa0)))return false;
        if(n==4&&((c==0xf0&&p[i+1]<0x90)||(c==0xf4&&p[i+1]>=0x90)))return false;
        i+=n;
    }return true;
}
static bool match(const char *id,uint32_t rev){return id&&rev==s_view.rev&&!strcmp(id,s_view.nid);}
static void dispose(char *text){if(text){memset(text,0,IB_NOTIFICATION_MAX+1);free(text);}}
void ib_notification_snapshot(ib_notification_snapshot_t *out){portENTER_CRITICAL(&s_lock);*out=s_view;portEXIT_CRITICAL(&s_lock);}
const char *ib_notification_check_begin(ib_link_t link,const char *id,uint32_t rev,const char *source,ib_notification_kind_t kind,size_t length,uint32_t crc,bool truncated,bool busy,bool *replace){
    if(replace)*replace=false;
    if(!valid_id(id)||!rev||!source||strlen(source)>48||!valid_utf8(source,strlen(source))||(unsigned)kind>IB_NOTIFICATION_ERROR||length>IB_NOTIFICATION_MAX)return "invalid_notification";
    if(busy)return "busy";
    const char *error=NULL;bool repeat=false;
    portENTER_CRITICAL(&s_lock);
    bool same=!strcmp(id,s_view.nid);
    if(same&&rev<s_view.rev)error="stale_revision";
    else if(same&&(strcmp(source,s_view.source)||kind!=s_view.kind))error="identity_conflict";
    else if(same&&rev==s_view.rev){
        if(length!=s_view.length||crc!=s_view.crc||truncated!=s_view.truncated)error="identity_conflict";
        else if(s_view.staging&&link!=s_owner)error="upload_owner";
        else repeat=s_view.active||s_view.committed;
    }else if(s_view.active&&!same)error="busy";
    else if(s_view.staging&&link!=s_owner)error="upload_owner";
    portEXIT_CRITICAL(&s_lock);
    if(!error&&replace)*replace=!repeat;
    return error;
}
const char *ib_notification_begin(ib_link_t link,const char *id,uint32_t rev,const char *source,ib_notification_kind_t kind,size_t length,uint32_t crc,bool truncated,bool busy){
    bool replace=false;const char *error=ib_notification_check_begin(link,id,rev,source,kind,length,crc,truncated,busy,&replace);
    if(error||!replace)return error;
    // 正文升级复用唯一buffer，不瞬时保留两份2KiB。UI已hide，旧reader按active/gen失效。
    portENTER_CRITICAL(&s_lock);char *fresh=s_text;s_text=NULL;s_view.active=s_view.staging=false;s_view.revision=++s_revision;portEXIT_CRITICAL(&s_lock);
    if(!length){dispose(fresh);fresh=NULL;}
    else if(!fresh){fresh=calloc(1,IB_NOTIFICATION_MAX+1);if(!fresh)return "out_of_memory";}
    else memset(fresh,0,IB_NOTIFICATION_MAX+1);
    // UI必须先hide旧rev；事务入口负责此门禁。旧reader即使晚到也按generation拒绝。
    portENTER_CRITICAL(&s_lock);s_text=fresh;
    memset(&s_view,0,sizeof(s_view));strcpy(s_view.nid,id);strcpy(s_view.source,source);
    s_view.rev=rev;s_view.generation=++s_generation;if(!s_view.generation)s_view.generation=++s_generation;
    s_view.revision=++s_revision;s_view.kind=kind;s_view.length=length;s_view.crc=crc;s_view.truncated=truncated;s_view.active=s_view.staging=true;s_owner=link;
    portEXIT_CRITICAL(&s_lock);return NULL;
}
const char *ib_notification_chunk(ib_link_t link,const char *id,uint32_t rev,size_t offset,const char *text,size_t length){
    if(!text||!length||length>IB_NOTIFICATION_CHUNK||!valid_utf8(text,length))return "invalid_chunk";
    const char *error=NULL;portENTER_CRITICAL(&s_lock);
    if(!match(id,rev))error="stale_revision";
    else if(!s_view.staging||!s_view.active)error="not_uploading";
    else if(link!=s_owner)error="upload_owner";
    else if(offset>s_view.offset||length>s_view.length-offset)error="invalid_offset";
    else if(offset<s_view.offset){if(length>s_view.offset-offset||memcmp(s_text+offset,text,length))error="identity_conflict";}
    else{memcpy(s_text+offset,text,length);s_view.offset+=length;s_text[s_view.offset]=0;}
    portEXIT_CRITICAL(&s_lock);return error;
}
const char *ib_notification_commit(ib_link_t link,const char *id,uint32_t rev,size_t length,uint32_t crc){
    const char *error=NULL;portENTER_CRITICAL(&s_lock);
    if(!match(id,rev))error="stale_revision";
    else if(length!=s_view.length||crc!=s_view.crc)error="identity_conflict";
    else if(s_view.committed){} //已关闭的相同提交也幂等，不复活旧通知。
    else if(!s_view.active||!s_view.staging)error="not_uploading";
    else if(link!=s_owner)error="upload_owner";
    else if(s_view.offset!=length)error="invalid_size";
    else if(ib_crc32(s_text,length)!=crc)error="crc_mismatch";
    else{s_view.staging=false;s_view.committed=true;s_view.revision=++s_revision;s_owner=IB_LINK_COUNT;}
    portEXIT_CRITICAL(&s_lock);return error;
}
void ib_notification_dismiss(void){
    portENTER_CRITICAL(&s_lock);char *old=s_text;s_text=NULL;s_view.active=s_view.staging=s_view.presented=false;s_view.revision=++s_revision;s_owner=IB_LINK_COUNT;
    portEXIT_CRITICAL(&s_lock);dispose(old);
}
const char *ib_notification_clear(const char *id,uint32_t rev){
    portENTER_CRITICAL(&s_lock);bool same=match(id,rev);portEXIT_CRITICAL(&s_lock);
    if(!same)return "stale_revision";
    ib_notification_dismiss();return NULL;
}
const char *ib_notification_abort(ib_link_t link,const char *id,uint32_t rev){
    const char *error=NULL;portENTER_CRITICAL(&s_lock);
    if(!match(id,rev))error="stale_revision";
    else if(s_view.staging&&link!=s_owner)error="upload_owner";
    else if(s_view.committed)error="already_committed";
    portEXIT_CRITICAL(&s_lock);if(!error)ib_notification_dismiss();return error;
}
size_t ib_notification_read(uint32_t generation,size_t offset,char *out,size_t cap,void *context){
    (void)context;size_t n=0;if(!out||!cap)return 0;portENTER_CRITICAL(&s_lock);
    if(s_view.active&&s_view.committed&&s_text&&generation==s_view.generation&&offset<s_view.length&&((unsigned char)s_text[offset]&0xc0)!=0x80){n=ib_utf8_prefix(s_text+offset,s_view.length-offset,cap);memcpy(out,s_text+offset,n);}
    portEXIT_CRITICAL(&s_lock);return n;
}
bool ib_notification_presented(uint32_t generation){
    bool chime=false;portENTER_CRITICAL(&s_lock);
    if(s_view.active&&s_view.committed&&generation==s_view.generation&&!s_view.presented){
        s_view.presented=true;bool seen=false;for(unsigned i=0;i<8;i++)if(!strcmp(s_chimed[i],s_view.nid))seen=true;
        if(!seen){strcpy(s_chimed[s_chime_next++%8],s_view.nid);chime=true;}
    }portEXIT_CRITICAL(&s_lock);return chime;
}
