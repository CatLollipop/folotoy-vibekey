#include "ib_ui_notification.h"
#include "ib_ui_activity.h"
#include "ib_ui_page.h"
#include "ib_reply_font.h"
#include <string.h>
static lv_obj_t *s_layer,*s_source_label,*s_body_label,*s_note_label,*s_icon;
static ib_reply_view_t s_view;
static bool s_active,s_suspended,s_truncated;
static ib_ui_notification_kind_t s_kind;
static char s_source[145],s_text[193];
static uint32_t s_now,s_last_frame;
static ib_ui_assistant_phase_t phase(void){return s_kind==IB_UI_NOTIFICATION_INPUT?IB_UI_ASSIST_TRANSCRIBING:s_kind==IB_UI_NOTIFICATION_ERROR?IB_UI_ASSIST_ERROR:IB_UI_ASSIST_DONE;}
static void draw(lv_event_t *event){ib_fx_t f;ib_fx_begin(&f,event);ib_activity_draw(&f,8,8,phase(),false,s_now);}
static void render(void)
{
    lv_label_set_text_static(s_source_label,s_source);
    if(s_view.length&&ib_reply_font_copy(s_text,sizeof(s_text),s_view.text)){
        lv_label_set_text_static(s_body_label,s_text);lv_obj_remove_flag(s_body_label,LV_OBJ_FLAG_HIDDEN);
    }else{lv_label_set_text_static(s_body_label,"");lv_obj_add_flag(s_body_label,LV_OBJ_FLAG_HIDDEN);}
    lv_label_set_text_static(s_note_label,s_truncated?"正文已截断":"");
    if(s_active&&!s_suspended)lv_obj_remove_flag(s_layer,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_layer,LV_OBJ_FLAG_HIDDEN);
    lv_obj_invalidate(s_icon);
}
void ib_notification_create(lv_obj_t *screen)
{
    /* 只接管宠物下方caption；不依赖兄弟图层顺序来保住实体键/页点，左右各留21px。 */
    s_layer=ib_box_create(screen,21,224,198,IB_UI_H-224);
    lv_obj_set_style_bg_color(s_layer,lv_color_hex(0x17181D),0);lv_obj_set_style_bg_opa(s_layer,LV_OPA_COVER,0);
    s_icon=ib_fx_create(s_layer,0,0,16,16,draw,NULL);
    s_source_label=ib_label_create(s_layer,&ib_cjk_font_12,0xC8C4B8,0,178);
    lv_obj_align(s_source_label,LV_ALIGN_TOP_LEFT,20,0);
    lv_obj_set_style_text_align(s_source_label,LV_TEXT_ALIGN_LEFT,0);
    lv_label_set_long_mode(s_source_label,LV_LABEL_LONG_DOT);lv_obj_set_height(s_source_label,18);
    s_body_label=ib_label_create(s_layer,&ib_cjk_font_12,0xE0DCCF,22,198);
    lv_obj_set_style_text_line_space(s_body_label,2,0);lv_obj_set_height(s_body_label,38);
    s_note_label=ib_label_create(s_layer,&ib_cjk_font_12,0xA8A498,64,198);
    lv_obj_set_height(s_note_label,18);lv_obj_add_flag(s_layer,LV_OBJ_FLAG_HIDDEN);
    ib_reply_view_init(&s_view,198,ib_reply_font_advance,NULL);
}
bool ib_notification_show(uint32_t generation,const char *source,ib_ui_notification_kind_t kind,bool truncated,size_t length,ib_ui_reply_reader_fn reader,void *ctx)
{
    if(!source||!source[0]||strlen(source)>48||!generation||length>2048||(unsigned)kind>IB_UI_NOTIFICATION_ERROR)return false;
    char mapped[145];if(!ib_reply_font_copy(mapped,sizeof(mapped),source))return false;
    if(s_active&&s_view.generation==generation)return length==s_view.length&&kind==s_kind&&truncated==s_truncated&&
        !strcmp(mapped,s_source)&&(!length||(reader==s_view.reader&&ctx==s_view.reader_ctx));
    ib_reply_view_t next;ib_reply_view_init(&next,198,ib_reply_font_advance,NULL);
    if(!ib_reply_view_begin(&next,generation)||(length&&!ib_reply_view_update(&next,generation,length,true,reader,ctx)))return false;
    s_view=next;memcpy(s_source,mapped,strlen(mapped)+1);s_kind=kind;s_truncated=truncated;s_active=true;s_last_frame=0;
    render();return true;
}
void ib_notification_hide(void){s_active=false;ib_reply_view_clear(&s_view,0);memset(s_text,0,sizeof(s_text));lv_obj_add_flag(s_layer,LV_OBJ_FLAG_HIDDEN);}
bool ib_notification_page(int delta)
{
    if(!s_active||!s_view.length)return false;
    bool moved=ib_reply_view_page(&s_view,delta);
    if(!ib_reply_view_active(&s_view)){ib_notification_hide();return false;}
    render();return moved;
}
bool ib_notification_active(void){return s_active;}
uint16_t ib_notification_index(void){return s_view.page_index;}
uint16_t ib_notification_total(void){return s_view.page_count;}
void ib_notification_suspend(bool suspend)
{
    if(s_suspended==suspend)return;
    s_suspended=suspend;
    if(s_layer){if(s_active&&!s_suspended)lv_obj_remove_flag(s_layer,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_layer,LV_OBJ_FLAG_HIDDEN);}
}
void ib_notification_frame(uint32_t now)
{
    if(!s_active||s_suspended||s_kind!=IB_UI_NOTIFICATION_INPUT||now-s_last_frame<100)return;
    s_last_frame=now;s_now=now;lv_obj_invalidate(s_icon);
}
