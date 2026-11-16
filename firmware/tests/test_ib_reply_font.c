/* 同份Noto字库实测两级常用汉字和缺字映射，分页与显示使用同一advance。 */
#include "ib_reply_font.h"
#include "ib_reply_view.h"
#include "ib_ui_gfx.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static size_t read_text(uint32_t generation,size_t offset,char *out,size_t capacity,void *ctx){
    const char *text=ctx;size_t length=strlen(text);if(generation!=42||offset>=length)return 0;
    if(capacity>length-offset)capacity=length-offset;
    memcpy(out,text+offset,capacity);return capacity;
}
static void verify_known(const char *text){
    const unsigned char *p=(const unsigned char *)text;
    while(*p){uint32_t c=*p++;if(c>=0xe0){c=(c&15u)<<12;c|=(uint32_t)(*p++&63u)<<6;c|=*p++&63u;}else if(c>=0xc0){c=(c&31u)<<6;c|=*p++&63u;}
        assert(ib_reply_font_codepoint(c)==c);assert(ib_reply_font_advance(c,NULL));}
}
int main(void){
    lv_init();verify_known("中华人民共和国你好世界语音设备按钮正文已截断亍丐丕乜卮氐胤爰甬刈仄厍");
    lv_font_glyph_dsc_t square;assert(lv_font_get_glyph_dsc(&ib_cjk_font_12,&square,0x25a1,0)&&!square.is_placeholder&&square.adv_w);
    assert(ib_reply_font_codepoint(0x1f642)==0x25a1);assert(ib_reply_font_codepoint(0x9f98)==0x25a1);
    assert(ib_reply_font_advance(0x1f642,NULL)==square.adv_w&&ib_reply_font_advance(0x9f98,NULL)==square.adv_w);
    char display[193];assert(ib_reply_font_copy(display,sizeof(display),"你好🙂龘"));assert(!strcmp(display,"你好□□"));
    const char *text="这是第一段设备正文，必须按实际字宽逐页读完。第二级汉字亍丕乜卮氐胤爰甬和emoji🙂及生僻字龘应明确显示，不得空白。\n第二段包含EnglishWordsWithoutSpaces1234567890及中文，不能因换页丢字。";
    ib_reply_view_t view;ib_reply_view_init(&view,198,ib_reply_font_advance,NULL);assert(ib_reply_view_begin(&view,42));
    assert(ib_reply_view_update(&view,42,strlen(text),true,read_text,(void *)text));
    unsigned pages=0;do{assert(ib_reply_font_copy(display,sizeof(display),view.text));lv_point_t size;
        lv_text_get_size(&size,display,&ib_cjk_font_12,0,0,10000,LV_TEXT_FLAG_NONE);assert(size.x<=198&&size.y<=32);pages++;
    }while(ib_reply_view_page(&view,1));
    printf("Reply Noto font: GB2312 level1/2 present, emoji/rare CJK -> visible square with actual width; %u pages <=198x32.\n",pages);
}
