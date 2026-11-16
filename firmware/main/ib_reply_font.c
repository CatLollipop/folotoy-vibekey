#include "ib_reply_font.h"
#include "ib_ui_gfx.h"

uint32_t ib_reply_font_codepoint(uint32_t codepoint)
{
    lv_font_glyph_dsc_t glyph;
    if(lv_font_get_glyph_dsc(&ib_cjk_font_12,&glyph,codepoint,0)&&!glyph.is_placeholder)return codepoint;
    return 0x25a1u;
}
uint16_t ib_reply_font_advance(uint32_t codepoint,void *context)
{
    (void)context;
    lv_font_glyph_dsc_t glyph;
    uint32_t actual=ib_reply_font_codepoint(codepoint);
    return lv_font_get_glyph_dsc(&ib_cjk_font_12,&glyph,actual,0)?glyph.adv_w:12;
}
/* 输入已由分页核验证UTF-8；这里仍做边界检查，避免格式化错误造成越界或半字符。 */
bool ib_reply_font_copy(char *out,size_t capacity,const char *text)
{
    if(!out||!capacity||!text)return false;
    size_t used=0;const unsigned char *p=(const unsigned char *)text;
    while(*p){
        uint32_t cp=*p++;unsigned trailing=0;
        if(cp>=0xf0){cp&=7;trailing=3;}else if(cp>=0xe0){cp&=15;trailing=2;}else if(cp>=0xc0){cp&=31;trailing=1;}
        else if(cp>=0x80){out[0]=0;return false;}
        for(unsigned i=0;i<trailing;i++){if(!*p||(*p&0xc0)!=0x80){out[0]=0;return false;}cp=(cp<<6)|(*p++&63u);}
        if((trailing==1&&cp<0x80)||(trailing==2&&cp<0x800)||(trailing==3&&cp<0x10000)||
           cp>0x10ffff||(cp>=0xd800&&cp<=0xdfff)){out[0]=0;return false;}
        if(cp!='\n')cp=ib_reply_font_codepoint(cp);
        unsigned bytes=cp<0x80?1:cp<0x800?2:cp<0x10000?3:4;
        if(used+bytes>=capacity){out[0]=0;return false;}
        if(bytes==1)out[used++]=(char)cp;
        else if(bytes==2){out[used++]=(char)(0xc0|(cp>>6));out[used++]=(char)(0x80|(cp&63));}
        else if(bytes==3){out[used++]=(char)(0xe0|(cp>>12));out[used++]=(char)(0x80|((cp>>6)&63));out[used++]=(char)(0x80|(cp&63));}
        else{out[used++]=(char)(0xf0|(cp>>18));out[used++]=(char)(0x80|((cp>>12)&63));out[used++]=(char)(0x80|((cp>>6)&63));out[used++]=(char)(0x80|(cp&63));}
    }
    out[used]=0;return true;
}
