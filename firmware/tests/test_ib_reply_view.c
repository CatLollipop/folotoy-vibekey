#include "ib_reply_view.h"
#include <assert.h>
#include <limits.h>
#include <stdio.h>
#include <string.h>

typedef struct {
    const char *text;
    size_t length,stride,calls,stop_after;
    uint32_t generation;
    bool oversize;
} source_t;

static size_t read_reply(uint32_t generation,size_t offset,char *out,size_t capacity,void *ctx){
    source_t *s=ctx;s->calls++;
    if(generation!=s->generation||offset>=s->length||(s->stop_after&&s->calls>=s->stop_after))return 0;
    if(s->oversize)return capacity+1u;
    size_t n=s->length-offset;if(n>capacity)n=capacity;if(s->stride&&n>s->stride)n=s->stride;
    memcpy(out,s->text+offset,n);return n;
}

static uint16_t measure(uint32_t cp,void *ctx){
    (void)ctx;
    return cp<0x80?6:cp>=0x1f000?16:12;
}
static uint16_t measure_zero(uint32_t cp,void *ctx){(void)cp;(void)ctx;return 0;}

/* 独立输出解码器同时确认每页不存在UTF-8半字/第三行；测试不复用生产解码函数。 */
static uint32_t next_cp(const char *text,size_t *offset){
    const unsigned char *s=(const unsigned char *)text;
    unsigned char lead=s[(*offset)++];
    if(lead<0x80)return lead;
    unsigned n=lead<0xe0?2:lead<0xf0?3:4;
    assert((n==2&&lead>=0xc2)||(n==3&&lead>=0xe0)||(n==4&&lead>=0xf0&&lead<=0xf4));
    uint32_t cp=lead&((1u<<(7u-n))-1u);
    for(unsigned i=1;i<n;i++){unsigned char b=s[(*offset)++];assert((b&0xc0)==0x80);cp=(cp<<6)|(b&0x3f);}
    assert(cp>=0x80&&cp<=0x10ffff&&!(cp>=0xd800&&cp<=0xdfff));return cp;
}

static size_t strip_breaks(const char *source,size_t length,char *out){
    size_t n=0;
    for(size_t i=0;i<length;i++){
        if(source[i]=='\n'||source[i]=='\r')continue;
        out[n++]=source[i]=='\t'?' ':source[i];
    }
    return n;
}

static void check_page(const ib_reply_view_t *v){
    assert(v->page_start<v->page_end&&v->page_end<=v->length);
    assert(strlen(v->text)<=IB_REPLY_VIEW_TEXT_BYTES);
    unsigned lines=1;uint32_t width=0;
    for(size_t offset=0;v->text[offset];){
        uint32_t cp=next_cp(v->text,&offset);
        if(cp=='\n'){assert(++lines<=2);width=0;continue;}
        uint16_t w=v->measure(cp,v->measure_ctx);
        assert(!width||width+w<=v->width);width+=w;
    }
}

/* 串联实际source页区间并检查每个可见非换行字节，发现跳过的长英文/UTF-8内容。 */
static unsigned verify_every_page(ib_reply_view_t *v,const source_t *s){
    assert(ib_reply_view_active(v));
    if(v->page_index)assert(ib_reply_view_page(v,INT_MIN));
    char joined[IB_REPLY_VIEW_MAX_BYTES+1u]={0},visible[IB_REPLY_VIEW_MAX_BYTES+1u]={0};
    size_t source_used=0,visible_used=0;unsigned pages=0;
    uint16_t count=v->page_count;
    do{
        check_page(v);assert(v->page_index==pages);assert(v->page_count==count);
        assert(v->page_start==source_used);
        size_t n=v->page_end-v->page_start;
        memcpy(joined+source_used,s->text+v->page_start,n);source_used+=n;
        visible_used+=strip_breaks(v->text,strlen(v->text),visible+visible_used);pages++;
    }while(ib_reply_view_page(v,1));
    assert(source_used==s->length&&pages==count);
    assert(!memcmp(joined,s->text,s->length));
    char expected[IB_REPLY_VIEW_MAX_BYTES+1u];size_t expected_used=strip_breaks(s->text,s->length,expected);
    assert(visible_used==expected_used&&!memcmp(visible,expected,visible_used));
    assert(v->page_index==count-1u);assert(!ib_reply_view_page(v,INT_MAX));assert(v->page_index==count-1u);
    assert(ib_reply_view_page(v,INT_MIN)==(count>1u));assert(v->page_index==0);
    assert(!ib_reply_view_page(v,-1));assert(v->page_index==0);
    return pages;
}

static unsigned test_source(const char *text,size_t length,uint16_t width,size_t stride){
    source_t source={.text=text,.length=length,.stride=stride,.generation=1};
    ib_reply_view_t view;ib_reply_view_init(&view,width,measure,NULL);
    assert(!ib_reply_view_active(&view));assert(ib_reply_view_begin(&view,1));
    assert(ib_reply_view_update(&view,1,length,true,read_reply,&source));
    assert(view.final&&view.page_index==0);
    return verify_every_page(&view,&source);
}

static void test_generation_and_final(void){
    source_t s={.text="ABCDEFGHIJKLMN",.length=14,.generation=7};
    ib_reply_view_t v;ib_reply_view_init(&v,12,measure,NULL);
    assert(!ib_reply_view_begin(&v,0));assert(ib_reply_view_begin(&v,7));
    assert(ib_reply_view_update(&v,7,8,false,read_reply,&s));assert(v.page_index==v.page_count-1u);
    assert(!ib_reply_view_update(&v,6,14,true,read_reply,&s));assert(ib_reply_view_active(&v));
    assert(!ib_reply_view_clear(&v,6));assert(ib_reply_view_begin(&v,7));
    assert(ib_reply_view_update(&v,7,14,true,read_reply,&s));assert(v.page_index==0&&v.final);
    size_t calls=s.calls;
    assert(!ib_reply_view_update(&v,7,14,false,read_reply,&s));assert(s.calls==calls);
    assert(!ib_reply_view_update(&v,7,14,true,read_reply,&s));assert(v.final);
    assert(ib_reply_view_clear(&v,7));assert(!ib_reply_view_active(&v)&&!v.final&&!v.text[0]);
    assert(!ib_reply_view_begin(&v,7));assert(!ib_reply_view_update(&v,7,14,true,read_reply,&s));
    assert(!ib_reply_view_begin(&v,6));assert(ib_reply_view_begin(&v,8));
    assert(ib_reply_view_clear(&v,0));assert(v.generation==0);assert(ib_reply_view_begin(&v,8));
    ib_reply_view_init(&v,12,measure,NULL);assert(ib_reply_view_begin(&v,UINT32_MAX));
    assert(ib_reply_view_begin(&v,1));assert(!ib_reply_view_begin(&v,UINT32_MAX));
    assert(!ib_reply_view_begin(&v,0x80000001u));

    /* Mac重启随机种子可能显著减小；显式clear0建立新epoch，普通clear不撤销顺序保护。 */
    ib_reply_view_init(&v,12,measure,NULL);assert(ib_reply_view_begin(&v,0xf0000000u));
    s.generation=0xf0000000u;
    assert(ib_reply_view_update(&v,s.generation,s.length,true,read_reply,&s));
    assert(ib_reply_view_clear(&v,0));assert(!v.generation&&!ib_reply_view_active(&v));
    assert(!ib_reply_view_update(&v,0xf0000000u,s.length,true,read_reply,&s));
    assert(ib_reply_view_begin(&v,3));s.generation=3;
    assert(ib_reply_view_update(&v,3,8,false,read_reply,&s));
    char saved[sizeof(v.text)];memcpy(saved,v.text,sizeof(saved));size_t before=s.calls;
    assert(!ib_reply_view_update(&v,0xf0000000u,s.length,true,read_reply,&s));
    assert(s.calls==before&&v.generation==3&&!memcmp(v.text,saved,sizeof(saved))&&!v.final);
    assert(ib_reply_view_clear(&v,3));assert(v.generation==3);
    assert(!ib_reply_view_begin(&v,3));assert(!ib_reply_view_update(&v,3,s.length,true,read_reply,&s));
    assert(!ib_reply_view_begin(&v,2));assert(ib_reply_view_begin(&v,4));
}

static void test_streaming_and_manual(void){
    char text[1801];for(unsigned i=0;i<1800;i++)text[i]=(char)('A'+i%26);text[1800]=0;
    source_t s={.text=text,.length=1800,.generation=11,.stride=3};
    ib_reply_view_t v;ib_reply_view_init(&v,60,measure,NULL);assert(ib_reply_view_begin(&v,11));
    assert(ib_reply_view_update(&v,11,1000,false,read_reply,&s));assert(v.page_index==49);
    assert(ib_reply_view_page(&v,-2));size_t anchor=v.page_start;assert(v.manual);
    assert(ib_reply_view_update(&v,11,1500,false,read_reply,&s));assert(v.page_start==anchor);
    assert(ib_reply_view_update(&v,11,1800,true,read_reply,&s));assert(v.page_start==anchor&&v.final);
    verify_every_page(&v,&s);
    assert(ib_reply_view_begin(&v,12));s.generation=12;
    assert(ib_reply_view_update(&v,12,1000,false,read_reply,&s));assert(v.page_index==49);
    assert(ib_reply_view_update(&v,12,1800,false,read_reply,&s));assert(v.page_index==89);
    assert(ib_reply_view_update(&v,12,1800,true,read_reply,&s));assert(v.page_index==0&&!v.manual);
}

static void test_failures(void){
    static const char *invalid[]={"\xc0\xaf","\xed\xa0\x80","\xf4\x90\x80\x80","\xe4\xb8","A\xe2\x28\xa1","A\x01"};
    ib_reply_view_t v;ib_reply_view_init(&v,60,measure,NULL);uint32_t gen=20;
    for(unsigned i=0;i<sizeof(invalid)/sizeof(invalid[0]);i++){
        source_t s={.text=invalid[i],.length=strlen(invalid[i]),.generation=gen,.stride=1};
        assert(ib_reply_view_begin(&v,gen));assert(!ib_reply_view_update(&v,gen,s.length,true,read_reply,&s));
        assert(v.closed&&!v.final&&!v.text[0]);assert(!ib_reply_view_begin(&v,gen));gen++;
    }
    const char nul[]={'A',0,'B'};source_t s={.text=nul,.length=sizeof(nul),.generation=gen};
    assert(ib_reply_view_begin(&v,gen));assert(!ib_reply_view_update(&v,gen,s.length,true,read_reply,&s));gen++;
    char full[4097];memset(full,'x',sizeof(full));s=(source_t){.text=full,.length=sizeof(full),.generation=gen};
    assert(ib_reply_view_begin(&v,gen));assert(!ib_reply_view_update(&v,gen,4097,true,read_reply,&s));assert(!s.calls);gen++;
    s.generation=gen;s.length=4096;s.stride=1;s.calls=0;s.stop_after=4096;
    assert(ib_reply_view_begin(&v,gen));assert(!ib_reply_view_update(&v,gen,4096,true,read_reply,&s));assert(!v.final&&v.closed);gen++;
    s.generation=gen;s.stop_after=0;s.calls=0;s.stride=0;
    assert(ib_reply_view_begin(&v,gen));assert(ib_reply_view_update(&v,gen,100,false,read_reply,&s));
    s.generation=gen+1u;assert(!ib_reply_view_page(&v,-1));assert(v.closed&&!v.text[0]);gen++;
    s.generation=gen;s.oversize=true;
    assert(ib_reply_view_begin(&v,gen));assert(!ib_reply_view_update(&v,gen,100,true,read_reply,&s));gen++;
    s.generation=gen;s.oversize=false;
    assert(ib_reply_view_begin(&v,gen));assert(ib_reply_view_update(&v,gen,100,false,read_reply,&s));
    assert(!ib_reply_view_update(&v,gen,99,false,read_reply,&s));assert(v.closed);gen++;
    s.generation=gen;assert(ib_reply_view_begin(&v,gen));assert(ib_reply_view_update(&v,gen,100,false,read_reply,&s));
    full[1]='Y';assert(!ib_reply_view_update(&v,gen,101,true,read_reply,&s));assert(v.closed&&!v.final);gen++;
    assert(ib_reply_view_begin(&v,gen));assert(!ib_reply_view_update(&v,gen,10,true,NULL,NULL));
    ib_reply_view_init(&v,0,measure,NULL);assert(!ib_reply_view_begin(&v,1));
    ib_reply_view_init(&v,12,NULL,NULL);assert(!ib_reply_view_begin(&v,1));
    ib_reply_view_init(NULL,0,NULL,NULL);assert(!ib_reply_view_begin(NULL,1));assert(!ib_reply_view_clear(NULL,0));
    assert(!ib_reply_view_update(NULL,1,0,false,NULL,NULL));assert(!ib_reply_view_page(NULL,1));assert(!ib_reply_view_active(NULL));
}

int main(void){
    unsigned pages=0;
    static const char mixed[]="这是完整回复，不应被末尾字幕截断。EnglishIsNotRequiredToHaveSpaces.\n\n第二段\r\n第三段\twith tab.🙂🙃";
    for(size_t stride=1;stride<=4;stride++)pages+=test_source(mixed,strlen(mixed),60,stride);
    pages+=test_source("\n\n\n\r\n\r\n\n",8,60,1);
    char full[4097];for(unsigned i=0;i<4096;i++)full[i]=(char)('A'+i%26);full[4096]=0;
    pages+=test_source(full,4096,198,0);pages+=test_source(full,4096,6,1);
    size_t n=0;while(n+strlen(mixed)<=4096){memcpy(full+n,mixed,strlen(mixed));n+=strlen(mixed);}while(n<4096)full[n++]='Z';full[n]=0;
    pages+=test_source(full,4096,198,3);
    ib_reply_view_t v;ib_reply_view_init(&v,UINT16_MAX,measure_zero,NULL);
    source_t s={.text=full,.length=4096,.generation=1,.stride=2};
    assert(ib_reply_view_begin(&v,1));assert(ib_reply_view_update(&v,1,4096,true,read_reply,&s));pages+=verify_every_page(&v,&s);
    ib_reply_view_init(&v,60,measure,NULL);s=(source_t){.text="",.generation=1};
    assert(ib_reply_view_begin(&v,1));assert(ib_reply_view_update(&v,1,0,true,read_reply,&s));assert(v.final&&!ib_reply_view_active(&v));
    test_generation_and_final();test_streaming_and_manual();test_failures();
    printf("Reply view: %u fully reconstructed pages, 4096B UTF-8/short-read/generation/final/manual/byte-capacity checks passed; state %zuB, no heap allocation.\n",pages,sizeof(v));
    return 0;
}
