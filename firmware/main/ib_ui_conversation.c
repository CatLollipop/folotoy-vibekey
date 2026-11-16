#include "ib_ui_conversation.h"
#include "ib_ui_activity.h"
#include "ib_reply_font.h"
#include <string.h>
static lv_obj_t *s_screen,*s_root,*s_pet,*s_activity,*s_agent_box,*s_draft_box,*s_title,*s_mode,*s_agent,*s_draft,*s_footer;
static lv_obj_t *s_toast;static int64_t s_toast_until;
static ib_conversation_pet_draw_fn s_pet_draw;
static bool s_enabled,s_owned,s_draft_focus,s_suspended,s_feedback_blocked,s_capture,s_confirm,s_record;static uint16_t s_page,s_pages;
static ib_conversation_phase_t s_phase;static uint32_t s_now,s_last_frame;
static char s_title_text[49],s_agent_text[193],s_draft_text[193];
static ib_ui_assistant_phase_t phase(void){
    if(s_capture)return IB_UI_ASSIST_LISTENING;
    switch(s_phase){case IB_CONV_RECORDING:return IB_UI_ASSIST_LISTENING;case IB_CONV_TRANSCRIBING:return IB_UI_ASSIST_TRANSCRIBING;
    case IB_CONV_SENDING:return IB_UI_ASSIST_REPLYING;case IB_CONV_WORKING:return IB_UI_ASSIST_THINKING;case IB_CONV_DONE:return IB_UI_ASSIST_DONE;
    case IB_CONV_ERROR:case IB_CONV_UNKNOWN:return IB_UI_ASSIST_ERROR;default:return IB_UI_ASSIST_IDLE;}
}
static void pet_draw(lv_event_t *e){ib_fx_t f;ib_fx_begin(&f,e);if(s_pet_draw)s_pet_draw(&f,0,0);}
static void activity_draw(lv_event_t *e){ib_fx_t f;ib_fx_begin(&f,e);ib_activity_draw(&f,8,8,phase(),s_capture,s_now);}
static lv_obj_t *label(lv_obj_t *parent,int x,int y,int w,int h,uint32_t color){
    lv_obj_t *o=ib_label_create(parent,&ib_cjk_font_12,color,y,w);lv_obj_align(o,LV_ALIGN_TOP_LEFT,x,y);
    lv_obj_set_height(o,h);lv_obj_set_style_text_align(o,LV_TEXT_ALIGN_LEFT,0);lv_obj_set_style_text_line_space(o,2,0);return o;
}
static const char *failure(const char *code){
    return ib_ui_conversation_error(code);
}
static void create(void){
    if(s_root)return;
    s_root=ib_box_create(s_screen,0,24,240,296);lv_obj_set_style_bg_color(s_root,IB_C(0x17181D),0);lv_obj_set_style_bg_opa(s_root,LV_OPA_COVER,0);
    s_title=label(s_root,22,4,154,18,0xE0DCCF);s_mode=label(s_root,182,4,36,18,0xB8B4A8);lv_label_set_text_static(s_mode,ib_ui_conversation_text(0));
    /* 左右栏持续并列；mini宠物位于左栏顶部，不挤占正文每行7个中文的宽度。 */
    s_pet=ib_fx_create(s_root,23,30,28,28,pet_draw,NULL);
    lv_obj_t *agent_name=label(s_root,57,34,61,18,0xB8B4A8);lv_label_set_text_static(agent_name,"Agent");
    lv_obj_t *draft_name=label(s_root,127,34,91,18,0xB8B4A8);lv_label_set_text_static(draft_name,ib_ui_conversation_text(1));
    s_agent_box=ib_box_create(s_root,21,64,96,184);s_draft_box=ib_box_create(s_root,125,64,94,184);
    lv_obj_set_style_radius(s_agent_box,5,0);lv_obj_set_style_radius(s_draft_box,5,0);
    lv_obj_set_style_bg_color(s_agent_box,IB_C(0x23272B),0);lv_obj_set_style_bg_opa(s_agent_box,LV_OPA_COVER,0);
    lv_obj_set_style_bg_color(s_draft_box,IB_C(0x28312F),0);lv_obj_set_style_bg_opa(s_draft_box,LV_OPA_COVER,0);
    s_agent=label(s_agent_box,6,6,84,170,0xE0DCCF);s_draft=label(s_draft_box,5,6,84,170,0xE0DCCF);
    s_activity=ib_fx_create(s_root,22,262,16,16,activity_draw,NULL);s_footer=label(s_root,43,260,176,35,0xC8C4B8);
}
void ib_conversation_ui_init(lv_obj_t *screen,ib_conversation_pet_draw_fn draw){s_screen=screen;s_pet_draw=draw;}
bool ib_conversation_ui_apply(const ib_conversation_t *s,bool enabled){
    char title[49],agent[193],draft[193];
    if(!ib_reply_font_copy(title,sizeof(title),s->title)||!ib_reply_font_copy(agent,sizeof(agent),s->agent.text)||!ib_reply_font_copy(draft,sizeof(draft),s->draft.text))return false;
    lv_point_t size;lv_text_get_size(&size,agent,&ib_cjk_font_12,0,2,84,LV_TEXT_FLAG_NONE);if(size.y>170)return false;
    lv_text_get_size(&size,draft,&ib_cjk_font_12,0,2,84,LV_TEXT_FLAG_NONE);if(size.y>170)return false;
    memcpy(s_title_text,title,strlen(title)+1);memcpy(s_agent_text,agent,strlen(agent)+1);memcpy(s_draft_text,draft,strlen(draft)+1);
    s_owned=enabled&&s->bound;s_draft_focus=s->focus==IB_CONV_DRAFT;
    s_enabled=s_owned&&s->view==IB_CONV_DIALOGUE;s_phase=s->pending_gid?IB_CONV_SENDING:s->phase;s_confirm=ib_conversation_can_confirm(s);s_record=ib_conversation_can_record(s);
    const ib_conversation_pane_t *p=s->focus==IB_CONV_AGENT?&s->agent:&s->draft;s_page=p->page;s_pages=p->text[0]?p->pages:0;
    if(!s_enabled){
        if(s_root){lv_obj_delete(s_root);s_root=NULL;}
        if(s->feedback_until&&s->error[0]){
            if(!s_toast){s_toast=label(s_screen,21,284,198,35,0xE0DCCF);lv_obj_set_style_bg_color(s_toast,IB_C(0x17181D),0);lv_obj_set_style_bg_opa(s_toast,LV_OPA_COVER,0);}
            lv_label_set_text_static(s_toast,failure(s->error));s_toast_until=s->feedback_until;
            if(!s_feedback_blocked)lv_obj_remove_flag(s_toast,LV_OBJ_FLAG_HIDDEN);
        }
        return true;
    }
    if(s_toast){lv_obj_delete(s_toast);s_toast=NULL;s_toast_until=0;}
    create();lv_label_set_text_static(s_title,s_title_text);lv_label_set_text_static(s_agent,s_agent_text);lv_label_set_text_static(s_draft,s_draft_text);
    lv_obj_t *boxes[]={s_agent_box,s_draft_box};
    for(unsigned i=0;i<2;i++){lv_obj_set_style_border_width(boxes[i],i==(unsigned)s->focus?1:0,0);lv_obj_set_style_border_color(boxes[i],IB_C(0x8DABA1),0);}
    const char *text=failure(s->error);
    // 普通阶段只用动态图标；确认动作由右侧SEND glyph表达，不常驻阶段/操作文字。
    if(!text[0])text=!s->writable?ib_ui_conversation_text(3):"";
    lv_label_set_text_static(s_footer,text);
    ib_conversation_ui_suspend(s_suspended,s_feedback_blocked);return true;
}
void ib_conversation_ui_suspend(bool suspended,bool block_feedback){s_suspended=suspended;s_feedback_blocked=block_feedback;if(s_root){if(s_enabled&&!s_suspended)lv_obj_remove_flag(s_root,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_root,LV_OBJ_FLAG_HIDDEN);}if(s_toast){if(s_feedback_blocked)lv_obj_add_flag(s_toast,LV_OBJ_FLAG_HIDDEN);else lv_obj_remove_flag(s_toast,LV_OBJ_FLAG_HIDDEN);}}
bool ib_conversation_ui_active(void){return s_enabled&&!s_suspended&&s_root;}
bool ib_conversation_ui_owned(void){return s_owned;}
const char *ib_conversation_ui_focus_text(void){return s_draft_focus?s_draft_text:s_agent_text;}
uint16_t ib_conversation_ui_page(void){return s_page;}
uint16_t ib_conversation_ui_pages(void){return s_pages;}
bool ib_conversation_ui_confirm(void){return s_confirm;}
bool ib_conversation_ui_record(void){return s_record;}
void ib_conversation_ui_capture(bool capture){if(s_capture==capture)return;s_capture=capture;if(s_root&&s_activity)lv_obj_invalidate(s_activity);}
void ib_conversation_ui_frame(uint32_t now){if(s_toast&&now>=s_toast_until){lv_obj_delete(s_toast);s_toast=NULL;s_toast_until=0;}if(!ib_conversation_ui_active()||!ib_activity_animates(phase(),s_capture)||now-s_last_frame<100)return;s_now=now;s_last_frame=now;lv_obj_invalidate(s_activity);}
void ib_conversation_ui_pet_changed(void){if(ib_conversation_ui_active())lv_obj_invalidate(s_pet);}
