/* 两行回复视图：逐页扫描assistant唯一缓冲，永不复制全篇或分配页表。调用方持有GUI锁。 */
#include "ib_reply_view.h"
#include <string.h>

#define HASH_INITIAL 2166136261u

typedef struct {
    ib_reply_reader_fn reader;
    void *ctx;
    uint32_t generation;
    size_t length,start,used;
    unsigned char bytes[32];
} cursor_t;

typedef struct {
    size_t start,end;
    uint16_t index,count;
    uint32_t hash,prefix_hash;
    char text[IB_REPLY_VIEW_TEXT_BYTES+1u];
} scan_t;

typedef enum { PICK_FIRST,PICK_LAST,PICK_ANCHOR,PICK_INDEX } pick_t;

static bool byte_at(cursor_t *c,size_t offset,unsigned char *out){
    if(offset>=c->length)return false;
    if(offset<c->start||offset-c->start>=c->used){
        size_t capacity=c->length-offset;
        if(capacity>sizeof(c->bytes))capacity=sizeof(c->bytes);
        c->start=offset;
        c->used=c->reader(c->generation,offset,(char *)c->bytes,capacity,c->ctx);
        if(!c->used||c->used>capacity)return false;
    }
    *out=c->bytes[offset-c->start];
    return true;
}

/* 拒绝截断、overlong、surrogate和超过Unicode上限的序列；解码可跨任意短读边界。 */
static bool codepoint_at(cursor_t *c,size_t offset,uint32_t *codepoint,unsigned char raw[4],unsigned *size){
    if(!byte_at(c,offset,&raw[0]))return false;
    unsigned n=raw[0]<0x80?1:raw[0]>=0xc2&&raw[0]<=0xdf?2:
               raw[0]>=0xe0&&raw[0]<=0xef?3:raw[0]>=0xf0&&raw[0]<=0xf4?4:0;
    if(!n||n>c->length-offset)return false;
    for(unsigned i=1;i<n;i++){
        if(!byte_at(c,offset+i,&raw[i])||(raw[i]&0xc0)!=0x80)return false;
    }
    if(n==3&&((raw[0]==0xe0&&raw[1]<0xa0)||(raw[0]==0xed&&raw[1]>=0xa0)))return false;
    if(n==4&&((raw[0]==0xf0&&raw[1]<0x90)||(raw[0]==0xf4&&raw[1]>=0x90)))return false;
    uint32_t cp=n==1?raw[0]:raw[0]&((1u<<(7u-n))-1u);
    for(unsigned i=1;i<n;i++)cp=(cp<<6)|(raw[i]&0x3fu);
    if(!cp||(cp<0x20&&cp!='\n'&&cp!='\r'&&cp!='\t'))return false;
    *codepoint=cp;*size=n;
    return true;
}

static void consume(scan_t *result,size_t offset,const unsigned char *raw,unsigned n,size_t old_length){
    for(unsigned i=0;i<n;i++){
        result->hash=(result->hash^raw[i])*16777619u;
        if(offset+i+1u==old_length)result->prefix_hash=result->hash;
    }
}

/* 页边界的第二个换行会消费但不写入text，避免产生第三行空白；CRLF归一为一个换行。 */
static bool make_page(const ib_reply_view_t *v,cursor_t *c,size_t start,size_t old_length,
                      scan_t *result,char text[IB_REPLY_VIEW_TEXT_BYTES+1u],size_t *end){
    size_t offset=start,used=0;
    unsigned line=0;
    uint32_t line_width=0;
    memset(text,0,IB_REPLY_VIEW_TEXT_BYTES+1u);
    while(offset<c->length){
        unsigned char raw[4];unsigned n;uint32_t cp;
        if(!codepoint_at(c,offset,&cp,raw,&n))return false;
        if(cp=='\r'||cp=='\n'){
            if(cp=='\r'&&offset+1u<c->length){
                unsigned char next;
                if(!byte_at(c,offset+1u,&next))return false;
                if(next=='\n'){raw[1]=next;n=2;}
            }
            if(!line&&used>=IB_REPLY_VIEW_TEXT_BYTES)break;
            consume(result,offset,raw,n,old_length);offset+=n;
            if(line)break;
            text[used++]='\n';line=1;line_width=0;
            continue;
        }
        uint32_t display_cp=cp=='\t'?' ':cp;
        uint16_t pixels=v->measure(display_cp,v->measure_ctx);
        bool wrap=line_width&&line_width+pixels>v->width;
        if(wrap&&line)break;
        size_t display_bytes=cp=='\t'?1u:n;
        if(used+display_bytes+(wrap?1u:0u)>IB_REPLY_VIEW_TEXT_BYTES)break;
        if(wrap){text[used++]='\n';line=1;line_width=0;}
        if(cp=='\t')text[used++]=' ';
        else{memcpy(text+used,raw,n);used+=n;}
        consume(result,offset,raw,n,old_length);offset+=n;
        line_width+=pixels;
    }
    text[used]=0;*end=offset;
    return offset>start;
}

/* 每次完整扫描都同时验证UTF-8、reader有效性、旧前缀指纹、页数和选中页。 */
static bool scan(const ib_reply_view_t *v,ib_reply_reader_fn reader,void *ctx,size_t length,
                 pick_t pick,size_t anchor,uint16_t wanted,scan_t *result){
    memset(result,0,sizeof(*result));result->hash=HASH_INITIAL;result->prefix_hash=HASH_INITIAL;
    if(!length)return true;
    cursor_t cursor={.reader=reader,.ctx=ctx,.generation=v->generation,.length=length};
    char page[IB_REPLY_VIEW_TEXT_BYTES+1u];
    size_t start=0;bool selected=false;
    while(start<length){
        size_t end;
        if(!make_page(v,&cursor,start,v->length,result,page,&end))return false;
        uint16_t index=result->count++;
        if((pick==PICK_FIRST&&index==0)||pick==PICK_LAST||
           (pick==PICK_ANCHOR&&start==anchor)||(pick==PICK_INDEX&&index==wanted)){
            memcpy(result->text,page,sizeof(result->text));
            result->start=start;result->end=end;result->index=index;selected=true;
        }
        start=end;
    }
    if(v->length&&result->prefix_hash!=v->prefix_hash)return false;
    return selected;
}

static void set_page(ib_reply_view_t *v,const scan_t *result){
    v->page_start=result->start;v->page_end=result->end;
    v->page_index=result->index;v->page_count=result->count;
    memcpy(v->text,result->text,sizeof(v->text));
}

void ib_reply_view_init(ib_reply_view_t *v,uint16_t width,ib_reply_measure_fn measure,void *ctx){
    if(!v)return;
    memset(v,0,sizeof(*v));v->width=width;v->measure=measure;v->measure_ctx=ctx;
}

bool ib_reply_view_begin(ib_reply_view_t *v,uint32_t generation){
    if(!v||!generation||!v->width||!v->measure)return false;
    if(generation==v->generation)return v->active&&!v->closed;
    uint32_t distance=generation-v->generation;
    if(v->generation&&(!distance||distance>=0x80000000u))return false;
    uint16_t width=v->width;ib_reply_measure_fn measure=v->measure;void *ctx=v->measure_ctx;
    ib_reply_view_init(v,width,measure,ctx);v->generation=generation;v->active=true;
    return true;
}

bool ib_reply_view_clear(ib_reply_view_t *v,uint32_t generation){
    if(!v||(generation&&generation!=v->generation))return false;
    /* generation=0由上层明确结束旧连接epoch；新进程的随机轮次无需大于旧序号。 */
    if(!generation)v->generation=0;
    v->length=0;v->page_start=0;v->page_end=0;v->page_index=0;v->page_count=0;
    v->active=false;v->final=false;v->closed=true;v->manual=false;v->prefix_hash=0;
    v->reader=NULL;v->reader_ctx=NULL;memset(v->text,0,sizeof(v->text));
    return true;
}

bool ib_reply_view_update(ib_reply_view_t *v,uint32_t generation,size_t length,bool final,
                          ib_reply_reader_fn reader,void *ctx){
    if(!v||!generation||generation!=v->generation||!v->active||v->closed||v->final)return false;
    if(!reader||length>IB_REPLY_VIEW_MAX_BYTES||length<v->length){ib_reply_view_clear(v,generation);return false;}
    pick_t pick=v->manual?PICK_ANCHOR:final?PICK_FIRST:PICK_LAST;
    scan_t result;
    if(!scan(v,reader,ctx,length,pick,v->page_start,0,&result)){ib_reply_view_clear(v,generation);return false;}
    set_page(v,&result);v->length=length;v->prefix_hash=result.hash;
    v->reader=reader;v->reader_ctx=ctx;v->final=final;
    return true;
}

bool ib_reply_view_page(ib_reply_view_t *v,int delta){
    if(!v||!v->active||v->closed||!v->length||!v->reader||!delta)return false;
    int64_t target=(int64_t)v->page_index+delta;
    if(target<0)target=0;
    if(target>=v->page_count)target=(int64_t)v->page_count-1;
    scan_t result;
    if(!scan(v,v->reader,v->reader_ctx,v->length,PICK_INDEX,0,(uint16_t)target,&result)){
        ib_reply_view_clear(v,v->generation);return false;
    }
    bool changed=result.index!=v->page_index;
    set_page(v,&result);
    if(changed)v->manual=true;
    return changed;
}

bool ib_reply_view_active(const ib_reply_view_t *v){
    return v&&v->active&&!v->closed&&v->length&&v->page_count;
}
