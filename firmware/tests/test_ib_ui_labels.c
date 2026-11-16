/* 资源沿真实UI字体链验证；只依赖主机LVGL，不连接设备。 */
#include "ib_ui_labels.h"
#include "ib_ui_gfx.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static unsigned checked;
static uint32_t unique[512];
static unsigned unique_count;
static lv_draw_buf_t *glyph_buffer;
static void verify(const char *text){
    assert(text&&text[0]);
    lv_point_t size;
    lv_text_get_size(&size,text,&ib_cjk_font_12,0,0,10000,LV_TEXT_FLAG_NONE);
    assert(size.x<=198&&size.y<=38); /* 两行宠物提示的实际可用尺寸，离线提示更宽。 */
    const unsigned char *p=(const unsigned char *)text;
    while(*p){
        uint32_t c=*p++;
        if(c>=0xe0){c=(c&15u)<<12;c|=(uint32_t)(*p++&63u)<<6;c|=*p++&63u;}
        else if(c>=0xc0){c=(c&31u)<<6;c|=*p++&63u;}
        if(c=='\n'||c==' ')continue;
        lv_font_glyph_dsc_t glyph;
        bool found=lv_font_get_glyph_dsc(&ib_cjk_font_12,&glyph,c,0);
        if(!found||glyph.is_placeholder||glyph.resolved_font!=&ib_cjk_font_12){fprintf(stderr,"Missing U+%04lX\n",(unsigned long)c);assert(false);}
        assert(glyph.box_w&&glyph.box_h&&glyph.adv_w);
        /* 与真实软件绘制相同，解码4bpp字库为A8；原生成字体没有static_bitmap标志。 */
        memset(glyph_buffer->data,0,glyph_buffer->data_size);
        assert(lv_font_get_glyph_bitmap(&glyph,glyph_buffer));
        bool ink=false;
        for(uint32_t i=0;i<glyph_buffer->data_size;i++)if(glyph_buffer->data[i])ink=true;
        assert(ink);
        lv_font_glyph_release_draw_data(&glyph);
        bool seen=false;for(unsigned i=0;i<unique_count;i++)if(unique[i]==c)seen=true;
        if(!seen){assert(unique_count<512);unique[unique_count++]=c;}
        checked++;
    }
}
int main(void){
    lv_init();
    glyph_buffer=lv_draw_buf_create(32,32,LV_COLOR_FORMAT_A8,LV_STRIDE_AUTO);assert(glyph_buffer);
    for(size_t i=0;i<ib_ui_label_count();i++)verify(ib_ui_label_at(i));
    assert(!ib_ui_label_at(ib_ui_label_count()));
    assert(!strcmp(ib_ui_assistant_label(IB_UI_ASSIST_TRANSCRIBING,true,NULL),"正在识别"));
    assert(!strcmp(ib_ui_assistant_label(IB_UI_ASSIST_SPEAKING,false,NULL),"正在朗读"));
    assert(strstr(ib_ui_assistant_label(IB_UI_ASSIST_IDLE,false,NULL),"电脑助手"));
    assert(strstr(ib_ui_assistant_label(IB_UI_ASSIST_IDLE,true,NULL),"云端待机"));
    assert(strstr(ib_ui_assistant_label(IB_UI_ASSIST_ERROR,true,"authentication_failed"),"密钥无效"));
    assert(strstr(ib_ui_assistant_label(IB_UI_ASSIST_ERROR,false,"check_mac"),"查看电脑"));
    assert(!strcmp(ib_ui_assistant_label(IB_UI_ASSIST_ERROR,true,"this is human text"),"发生错误\n请重试"));
    assert(!strcmp(ib_ui_pet_label("working",false),"正在工作"));
    assert(!strcmp(ib_ui_pet_label("searching",false),"正在搜索"));
    assert(!strcmp(ib_ui_connection_label(IB_UI_CONN_CONNECTING),"正在连接"));
    printf("Chinese labels: %zu texts, %u glyph uses/%u unique, all Noto Sans SC descriptors/bitmaps present; <=198x38 layout and typed phase/error/connection mapping passed.\n",ib_ui_label_count(),checked,unique_count);
    lv_draw_buf_destroy(glyph_buffer);
}
