/* 实际ASR快照驱动的有界显示状态：无计时器、假字、网络或逐字播放逻辑。 */
#include "ib_transcript_view.h"
#include <stddef.h>
#include <string.h>
static unsigned utf8_size(const unsigned char *p,size_t left){
    unsigned n=p[0]<0x80?1:p[0]>=0xc2&&p[0]<=0xdf?2:p[0]>=0xe0&&p[0]<=0xef?3:p[0]>=0xf0&&p[0]<=0xf4?4:0;
    if(!n||n>left)return 0;
    for(unsigned i=1;i<n;i++)if((p[i]&0xc0)!=0x80)return 0;
    if(n==3&&((p[0]==0xe0&&p[1]<0xa0)||(p[0]==0xed&&p[1]>=0xa0)))return 0;
    if(n==4&&((p[0]==0xf0&&p[1]<0x90)||(p[0]==0xf4&&p[1]>=0x90)))return 0;
    return n;
}
bool ib_transcript_view_begin(ib_transcript_view_t *view,uint32_t generation){
    if(!view||!generation)return false;
    if(generation==view->generation)return !view->closed;
    /* 单boot内按序号递增，兼容uint32回绕；迟到begin不能擦掉新一轮内容。 */
    if(view->generation&&(int32_t)(generation-view->generation)<=0)return false;
    memset(view,0,sizeof(*view));view->generation=generation;view->active=true;return true;
}
bool ib_transcript_view_update(ib_transcript_view_t *view,uint32_t generation,const char *text,bool final){
    if(!view||!text||!generation||generation!=view->generation||view->closed||view->final||!view->active)return false;
    size_t length=0;while(length<4096&&text[length])length++;
    if(length==4096)return false;
    const unsigned char *p=(const unsigned char *)text;
    for(size_t i=0;i<length;){unsigned n=utf8_size(p+i,length-i);if(!n)return false;i+=n;}
    size_t start=length>IB_TRANSCRIPT_VIEW_BYTES?length-IB_TRANSCRIPT_VIEW_BYTES:0;
    while(start<length&&(p[start]&0xc0)==0x80)start++;
    size_t used=length-start;
    memcpy(view->text,text+start,used);view->text[used]=0;
    for(size_t i=0;i<used;i++)if((unsigned char)view->text[i]<0x20)view->text[i]=' ';
    view->final=final;return true;
}
void ib_transcript_view_clear(ib_transcript_view_t *view,uint32_t generation){
    if(!view||(generation&&generation!=view->generation))return;
    memset(view->text,0,sizeof(view->text));view->active=false;view->closed=true;view->final=false;
}
