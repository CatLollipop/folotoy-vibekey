#include "ib_ui_conversation.h"
#include "ib_ui_activity.h"
#include "ib_reply_font.h"
#include <string.h>
#define CHAT_HEIGHT 244
#define CHAT_WIDTH 198
#define BODY_WIDTH 156
/* 固定4片映射缓存；用一个自绘对象而非为每条消息创建多组LVGL控件。 */
typedef struct {char text[193];uint8_t role,delivery;bool head,tail,trunc;uint16_t y,height,lines,width;} bubble_t;
static bubble_t s_bubble[IB_CONVERSATION_ITEMS_MAX];
static lv_obj_t *s_screen,*s_root,*s_canvas,*s_title,*s_activity,*s_meta,*s_toast;
static int64_t s_toast_until;static ib_conversation_pet_draw_fn s_pet_draw;
static bool s_enabled,s_owned,s_suspended,s_feedback_blocked,s_capture,s_confirm,s_record,s_latest,s_older,s_trunc;
static uint8_t s_n;static uint16_t s_page,s_pages,s_unread;
static ib_conversation_phase_t s_phase;static uint32_t s_now,s_last_frame;
static char s_title_text[49],s_pet_text[193];
static ib_ui_assistant_phase_t phase(void){
    if(s_capture)return IB_UI_ASSIST_LISTENING;
    switch(s_phase){case IB_CONV_RECORDING:return IB_UI_ASSIST_LISTENING;case IB_CONV_TRANSCRIBING:return IB_UI_ASSIST_TRANSCRIBING;
    case IB_CONV_SENDING:return IB_UI_ASSIST_REPLYING;case IB_CONV_WORKING:return IB_UI_ASSIST_THINKING;case IB_CONV_DONE:return IB_UI_ASSIST_DONE;
    case IB_CONV_ERROR:case IB_CONV_UNKNOWN:return IB_UI_ASSIST_ERROR;default:return IB_UI_ASSIST_IDLE;}
}
static void activity_draw(lv_event_t *e){ib_fx_t f;ib_fx_begin(&f,e);ib_activity_draw(&f,8,8,phase(),s_capture,s_now);}
static lv_obj_t *label(lv_obj_t *parent,int x,int y,int w,int h,uint32_t color){
    lv_obj_t *o=ib_label_create(parent,&ib_cjk_font_12,color,y,w);lv_obj_align(o,LV_ALIGN_TOP_LEFT,x,y);
    lv_obj_set_height(o,h);lv_obj_set_style_text_align(o,LV_TEXT_ALIGN_LEFT,0);lv_obj_set_style_text_line_space(o,2,0);return o;
}
/* 显式换行是Mac分页合同；不让LVGL隐式折行改变屏高。未知字已映射□并按实际advance验证。 */
static bool measure(const char *text,unsigned *lines,unsigned *width){
    unsigned n=1,max_width=0;const char *start=text;
    for(const char *p=text;;p++)if(*p=='\n'||!*p){
        char row[193];size_t bytes=(size_t)(p-start);if(bytes>=sizeof(row))return false;
        memcpy(row,start,bytes);row[bytes]=0;lv_point_t size;lv_text_get_size(&size,row,&ib_cjk_font_12,0,0,10000,LV_TEXT_FLAG_EXPAND);
        if(size.x>BODY_WIDTH)return false;
        if((unsigned)size.x>max_width)max_width=(unsigned)size.x;
        if(!*p)break;
        n++;start=p+1;
    }
    *lines=n;*width=max_width;return true;
}
static void body_draw(const ib_fx_t *f,int x,int y,int height,const char *text,lv_color_t ink){
    lv_draw_label_dsc_t d;lv_draw_label_dsc_init(&d);d.text=text;d.font=&ib_cjk_font_12;d.color=ink;d.line_space=2;d.flag=LV_TEXT_FLAG_EXPAND;d.opa=f->opa;
    lv_area_t area={f->ox+x,f->oy+y,f->ox+x+BODY_WIDTH-1,f->oy+y+height-1};lv_draw_label(f->layer,&d,&area);
}
static void canvas_draw(lv_event_t *e){
    ib_fx_t f;ib_fx_begin(&f,e);
    for(unsigned i=0;i<s_n;i++){
        const bubble_t *b=&s_bubble[i];bool assistant=b->role==IB_CONV_ASSISTANT;
        int x=assistant?24:CHAT_WIDTH-b->width,y=b->y;
        lv_color_t bg=IB_C(assistant?0x23272B:b->role==IB_CONV_DRAFT?0x30382F:0x28312F);
        ib_fx_rect(&f,x,y,b->width,b->height,5,bg,LV_OPA_COVER);
        if(assistant&&b->head&&s_pet_draw)s_pet_draw(&f,0,y+4);
        int top=y+6;
        if(!assistant&&b->head){
            ib_fx_text_left(&f,x+6,top+8,ib_ui_conversation_delivery((ib_conversation_delivery_t)b->delivery),&ib_cjk_font_12,IB_C(0xC8C4B8),LV_OPA_COVER);top+=18;
        }
        body_draw(&f,x+6,top,(int)b->lines*18,b->text,IB_C(0xE0DCCF));
        // 小连线表达续片，截断使用显式省略标记；均放在既有内边距，不吞正文行。
        if(!b->head)ib_fx_line(&f,x+2,y+4,x+2,y+10,1,IB_C(0xA8A498),LV_OPA_COVER);
        if(!b->tail)ib_fx_line(&f,x+2,y+b->height-10,x+2,y+b->height-4,1,IB_C(0xA8A498),LV_OPA_COVER);
        if(b->trunc)for(int k=0;k<3;k++)ib_fx_rect(&f,x+b->width-12+k*3,y+b->height-3,1,1,0,IB_C(0xE0DCCF),LV_OPA_COVER);
    }
}
static void meta_draw(lv_event_t *e){
    ib_fx_t f;ib_fx_begin(&f,e);int x=0;lv_color_t c=IB_C(0xC8C4B8);
    if(s_older){for(int i=0;i<3;i++)ib_fx_rect(&f,1+i*3,8,1,1,0,c,LV_OPA_COVER);x=12;}
    if(s_trunc){ib_fx_text_left(&f,x,8,ib_ui_conversation_text(7),&ib_cjk_font_12,c,LV_OPA_COVER);x+=28;}
    if(s_unread){ib_fx_text_left(&f,x,8,s_trunc?"新":ib_ui_conversation_text(6),&ib_cjk_font_12,IB_C(0xD8D4C8),LV_OPA_COVER);}
}
static void create(void){
    if(s_root)return;
    s_root=ib_box_create(s_screen,0,24,240,296);lv_obj_set_style_bg_color(s_root,IB_C(0x17181D),0);lv_obj_set_style_bg_opa(s_root,LV_OPA_COVER,0);
    s_title=label(s_root,22,4,106,18,0xE0DCCF);lv_label_set_long_mode(s_title,LV_LABEL_LONG_DOT);s_meta=ib_fx_create(s_root,132,4,66,18,meta_draw,NULL);s_activity=ib_fx_create(s_root,201,4,16,16,activity_draw,NULL);
    s_canvas=ib_fx_create(s_root,21,26,CHAT_WIDTH,CHAT_HEIGHT,canvas_draw,NULL);
}
static void toast(const char *text,int64_t until){
    if(!text[0]){if(s_toast){lv_obj_delete(s_toast);s_toast=NULL;}s_toast_until=0;return;}
    if(!s_toast){s_toast=label(s_screen,21,298,198,20,0xE0DCCF);lv_obj_set_style_bg_color(s_toast,IB_C(0x17181D),0);lv_obj_set_style_bg_opa(s_toast,LV_OPA_COVER,0);}
    lv_label_set_text_static(s_toast,text);s_toast_until=until;
    if(s_feedback_blocked)lv_obj_add_flag(s_toast,LV_OBJ_FLAG_HIDDEN);else lv_obj_remove_flag(s_toast,LV_OBJ_FLAG_HIDDEN);
}
void ib_conversation_ui_init(lv_obj_t *screen,ib_conversation_pet_draw_fn draw){s_screen=screen;s_pet_draw=draw;}
bool ib_conversation_ui_apply(const ib_conversation_t *s,bool enabled){
    bubble_t candidate[IB_CONVERSATION_ITEMS_MAX]={0};char title[49];unsigned y=0;
    if(!ib_reply_font_copy(title,sizeof(title),s->title)||s->window.n>4)return false;
    for(unsigned i=0;i<s->window.n;i++){
        const ib_conversation_item_t *item=&s->window.item[i];bubble_t *b=&candidate[i];unsigned lines=0,width=0;
        if(!ib_reply_font_copy(b->text,sizeof(b->text),item->text)||!measure(b->text,&lines,&width))return false;
        if(item->head&&item->role!=IB_CONV_ASSISTANT){
            lv_point_t status;lv_text_get_size(&status,ib_ui_conversation_delivery(item->delivery),&ib_cjk_font_12,0,0,10000,LV_TEXT_FLAG_EXPAND);
            if(status.x>BODY_WIDTH)return false;
            if((unsigned)status.x>width)width=(unsigned)status.x;
        }
        b->width=(uint16_t)(width+12<48?48:width+12);
        unsigned h=12+18*lines+(item->head&&item->role!=IB_CONV_ASSISTANT?18:0);
        if(h>CHAT_HEIGHT||y+h>CHAT_HEIGHT)return false;
        b->role=item->role;b->delivery=item->delivery;b->head=item->head;b->tail=item->tail;b->trunc=item->trunc;b->y=(uint16_t)y;b->height=(uint16_t)h;b->lines=(uint16_t)lines;y+=h+8;
    }
    memcpy(s_title_text,title,strlen(title)+1);memcpy(s_bubble,candidate,sizeof(candidate));s_n=s->window.n;s_older=s->window.older;s_unread=s->window.unread;s_trunc=false;for(unsigned i=0;i<s_n;i++)if(s_bubble[i].trunc)s_trunc=true;
    s_pet_text[0]=0;if(s_n)memcpy(s_pet_text,s_bubble[s_n-1].text,strlen(s_bubble[s_n-1].text)+1);
    s_owned=enabled&&s->bound;s_enabled=s_owned&&s->view==IB_CONV_DIALOGUE;s_phase=s->pending_gid?IB_CONV_SENDING:s->phase;
    s_confirm=ib_conversation_can_confirm(s);s_record=ib_conversation_can_record(s);s_latest=ib_conversation_can_latest(s);s_page=s->window.page;s_pages=s->window.wid?s->window.pages:0;
    if(!s_enabled){if(s_root){lv_obj_delete(s_root);s_root=NULL;}}
    else{create();lv_label_set_text_static(s_title,s_title_text);lv_obj_invalidate(s_canvas);lv_obj_invalidate(s_activity);lv_obj_invalidate(s_meta);}
    const char *error=ib_ui_conversation_error(s->error);
    if(s_owned&&error[0])toast(error,s->feedback_until?s->feedback_until:INT64_MAX);
    else if(s_owned&&!s->writable)toast(ib_ui_conversation_text(3),INT64_MAX);
    else toast("",0);
    ib_conversation_ui_suspend(s_suspended,s_feedback_blocked);return true;
}
void ib_conversation_ui_suspend(bool suspended,bool block_feedback){s_suspended=suspended;s_feedback_blocked=block_feedback;if(s_root){if(s_enabled&&!s_suspended)lv_obj_remove_flag(s_root,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_root,LV_OBJ_FLAG_HIDDEN);}if(s_toast){if(s_feedback_blocked)lv_obj_add_flag(s_toast,LV_OBJ_FLAG_HIDDEN);else lv_obj_remove_flag(s_toast,LV_OBJ_FLAG_HIDDEN);}}
bool ib_conversation_ui_active(void){return s_enabled&&!s_suspended&&s_root;}
bool ib_conversation_ui_owned(void){return s_owned;}
const char *ib_conversation_ui_focus_text(void){return s_pet_text;}
uint16_t ib_conversation_ui_page(void){return s_page;}
uint16_t ib_conversation_ui_pages(void){return s_pages;}
bool ib_conversation_ui_confirm(void){return s_confirm;}
bool ib_conversation_ui_record(void){return s_record;}
bool ib_conversation_ui_latest(void){return s_latest;}
void ib_conversation_ui_capture(bool capture){if(s_capture==capture)return;s_capture=capture;if(s_root&&s_activity)lv_obj_invalidate(s_activity);}
void ib_conversation_ui_frame(uint32_t now){if(s_toast&&now>=s_toast_until){lv_obj_delete(s_toast);s_toast=NULL;s_toast_until=0;}if(!ib_conversation_ui_active()||!ib_activity_animates(phase(),s_capture)||now-s_last_frame<100)return;s_now=now;s_last_frame=now;lv_obj_invalidate(s_activity);}
void ib_conversation_ui_pet_changed(void){if(ib_conversation_ui_active())lv_obj_invalidate(s_canvas);}
