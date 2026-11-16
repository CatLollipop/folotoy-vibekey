// 两侧实体键提示：统一10px/1px线宽和低调暖白，不加装饰点列或错位抖动。
// 右侧物理UP/DOWN/OK的主图标中心固定y70/170/270；每键唯一glyph，长按回退用小圆环标记。
#include "ib_ui_hints.h"
#include "ib_ui_gfx.h"
#include "ib_ui_page.h"

#define PRESS_MS 240
#define MAIN_CX 10
#define MAIN_CY 10
#define HINT_IDLE 0xB8B4A8
#define HINT_HOLD 0x888478
#define HINT_LIGHT 0xE8E4D8
#define HINT_DISABLED 0x484840

typedef struct {lv_obj_t *view;ib_icon_t press,hold;int32_t flash,deny;} hint_t;
static lv_obj_t *s_layer,*s_pips;
static uint16_t s_page_index,s_page_total;
static bool s_page_active;
static bool s_disabled,s_visible=true,s_recording;
static int32_t s_recording_phase;
static hint_t s_hints[IB_UI_KEY_COUNT];

/* 常用动作全部采用相同1px路径，其他既有协议图标保留12px Material字形语义。 */
void ib_ui_action_glyph(const ib_fx_t *f,int x,int y,ib_icon_t icon,lv_color_t c)
{
#define LINE(a,b,d,e) ib_fx_line(f,x+(a),y+(b),x+(d),y+(e),1,c,LV_OPA_COVER)
    switch(icon){
    case IB_ICON_NONE: break;
    case IB_ICON_MIC:
        ib_fx_frame(f,x-2,y-5,5,7,2,1,c,LV_OPA_COVER);
        ib_fx_arc(f,x,y,4,1,0,180,c,LV_OPA_COVER);LINE(0,4,0,6);LINE(-2,6,2,6);break;
    case IB_ICON_UP: LINE(-4,2,0,-2);LINE(0,-2,4,2);break;
    case IB_ICON_DOWN: LINE(-4,-2,0,2);LINE(0,2,4,-2);break;
    case IB_ICON_CHECK: LINE(-4,0,-1,3);LINE(-1,3,4,-3);break;
    case IB_ICON_STOP: ib_fx_frame(f,x-4,y-4,9,9,1,1,c,LV_OPA_COVER);break;
    case IB_ICON_ESC: case IB_ICON_CANCEL: LINE(-3,-3,3,3);LINE(-3,3,3,-3);break;
    case IB_ICON_MODE:
        LINE(-2,4,-2,-4);LINE(-4,-2,-2,-4);LINE(-2,-4,0,-2);
        LINE(2,-4,2,4);LINE(0,2,2,4);LINE(2,4,4,2);break;
    case IB_ICON_APPS:
        for(int dy=-4;dy<=2;dy+=6){
            for(int dx=-4;dx<=2;dx+=6){
                ib_fx_frame(f,x+dx,y+dy,3,3,0,1,c,LV_OPA_COVER);
            }
        }
        break;
    case IB_ICON_DEL: case IB_ICON_BKSP:
        LINE(-5,0,-2,-4);LINE(-2,-4,4,-4);LINE(4,-4,4,4);LINE(4,4,-2,4);LINE(-2,4,-5,0);
        LINE(-1,-2,2,2);LINE(-1,2,2,-2);break;
    case IB_ICON_SEND: case IB_ICON_PLAY:
        LINE(-4,-4,5,0);LINE(5,0,-4,4);LINE(-4,4,-4,-4);if(icon==IB_ICON_SEND)LINE(-4,0,5,0);break;
    case IB_ICON_REPEAT: case IB_ICON_UNDO:
        ib_fx_arc(f,x,y,4,1,240,540,c,LV_OPA_COVER);LINE(-4,-4,-4,0);LINE(-4,-4,0,-4);break;
    case IB_ICON_ENTER: LINE(4,-4,4,1);LINE(4,1,-4,1);LINE(-4,1,-1,-2);LINE(-4,1,-1,4);break;
    case IB_ICON_TAB: case IB_ICON_STAB:
        LINE(-4,0,3,0);LINE(0,-3,3,0);LINE(3,0,0,3);if(icon==IB_ICON_STAB)LINE(5,-4,5,4);break;
    case IB_ICON_OPEN:
        LINE(-4,-3,-4,4);LINE(-4,4,3,4);LINE(0,-4,4,-4);LINE(4,-4,4,0);LINE(4,-4,-1,1);break;
    default: ib_fx_text(f,x,y,ib_icon_glyph(icon),&ib_icon_font_12,c,LV_OPA_COVER);break;
    }
#undef LINE
}
static void hint_draw(lv_event_t *event)
{
    hint_t *h=lv_event_get_user_data(event);ib_fx_t f;ib_fx_begin(&f,event);
    lv_color_t main=lv_color_mix(IB_C(HINT_LIGHT),IB_C(s_disabled?HINT_DISABLED:HINT_IDLE),(uint8_t)(h->flash*255/IB_P_ONE));
    if(h->deny)main=lv_color_mix(IB_C(IB_COLOR_ERR),main,(uint8_t)(h->deny*180/IB_P_ONE));
    if(s_recording&&h==&s_hints[IB_UI_KEY_OK]){
        main=lv_color_mix(IB_C(0x58E898),IB_C(0x208850),(uint8_t)(s_recording_phase*255/IB_P_ONE));
        ib_fx_ring(&f,MAIN_CX,MAIN_CY,7+(s_recording_phase>IB_P_ONE/2),1,main,LV_OPA_COVER);
    }
    // 每实体键只有一个当前动作：可用短按/翻页优先，否则唯一长按动作回退。
    bool hold_only=h->press==IB_ICON_NONE&&h->hold!=IB_ICON_NONE;
    ib_ui_action_glyph(&f,MAIN_CX,MAIN_CY,hold_only?h->hold:h->press,hold_only?IB_C(HINT_HOLD):main);
    if(hold_only)ib_fx_ring(&f,18,MAIN_CY,1,1,IB_C(HINT_HOLD),LV_OPA_COVER);
}
static void pips_draw(lv_event_t *event)
{
    if(!s_page_active||!s_page_total)return;
    ib_fx_t f;ib_fx_begin(&f,event);unsigned visible=s_page_total<7?s_page_total:7;
    ib_hint_pages_t window=ib_hints_page_window();unsigned start=window.first;
    int first=38-(int)(visible-1)*4;lv_color_t ink=IB_C(0xB8B4A8);
    for(unsigned i=0;i<visible;i++){
        int y=first+(int)i*8;
        if(start+i==s_page_index)ib_fx_circle(&f,MAIN_CX,y,2,ink,LV_OPA_COVER);
        else ib_fx_ring(&f,MAIN_CX,y,2,1,ink,LV_OPA_COVER);
    }
    if(start)for(int i=0;i<3;i++)ib_fx_rect(&f,MAIN_CX,4+i*3,1,1,0,ink,LV_OPA_COVER);
    if(start+visible<s_page_total)for(int i=0;i<3;i++)ib_fx_rect(&f,MAIN_CX,66+i*3,1,1,0,ink,LV_OPA_COVER);
}
static void power_draw(lv_event_t *event)
{
    ib_fx_t f;ib_fx_begin(&f,event);lv_color_t c=IB_C(HINT_HOLD);
    ib_fx_arc(&f,6,7,4,1,315,585,c,LV_OPA_COVER);ib_fx_line(&f,6,1,6,6,1,c,LV_OPA_COVER);
}
static void visibility(hint_t *h)
{
    if(h->press==IB_ICON_NONE&&h->hold==IB_ICON_NONE)lv_obj_add_flag(h->view,LV_OBJ_FLAG_HIDDEN);
    else lv_obj_remove_flag(h->view,LV_OBJ_FLAG_HIDDEN);
    lv_obj_invalidate(h->view);
}
static void flash_cb(void *var,int32_t progress)
{
    hint_t *h=var;h->flash=s_disabled?0:IB_P_ONE-progress;h->deny=s_disabled?IB_P_ONE-progress:0;lv_obj_invalidate(h->view);
}
void ib_hints_create(lv_obj_t *screen)
{
    static const int ys[IB_UI_KEY_COUNT]={IB_HINT_Y_UP,IB_HINT_Y_DOWN,IB_HINT_Y_OK};
    s_layer=ib_box_create(screen,IB_UI_W-IB_HINT_COL_W,0,IB_HINT_COL_W,IB_UI_H);
    for(unsigned i=0;i<IB_UI_KEY_COUNT;i++){
        hint_t *h=&s_hints[i];h->press=h->hold=IB_ICON_NONE;
        h->view=ib_fx_create(s_layer,0,ys[i]-MAIN_CY,IB_HINT_COL_W,34,hint_draw,h);visibility(h);
    }
    s_pips=ib_fx_create(s_layer,0,82,IB_HINT_COL_W,76,pips_draw,NULL);lv_obj_add_flag(s_pips,LV_OBJ_FLAG_HIDDEN);
    ib_fx_create(screen,6,IB_HINT_Y_POWER-7,12,14,power_draw,NULL);
}
void ib_hints_set_icon(ib_ui_key_t key,ib_icon_t icon)
{
    if((unsigned)key>=IB_UI_KEY_COUNT)return;
    s_hints[key].press=(unsigned)icon<IB_ICON_COUNT?icon:IB_ICON_NONE;visibility(&s_hints[key]);
}
void ib_hints_set_hold_icon(ib_ui_key_t key,ib_icon_t icon)
{
    if((unsigned)key>=IB_UI_KEY_COUNT)return;
    s_hints[key].hold=(unsigned)icon<IB_ICON_COUNT?icon:IB_ICON_NONE;visibility(&s_hints[key]);
}
void ib_hints_press(ib_ui_key_t key)
{
    if((unsigned)key>=IB_UI_KEY_COUNT)return;
    hint_t *h=&s_hints[key];lv_anim_delete(h,flash_cb);lv_anim_t a;lv_anim_init(&a);
    lv_anim_set_var(&a,h);lv_anim_set_exec_cb(&a,flash_cb);lv_anim_set_values(&a,0,IB_P_ONE);
    lv_anim_set_duration(&a,PRESS_MS);lv_anim_set_path_cb(&a,lv_anim_path_ease_out);lv_anim_start(&a);
}
void ib_hints_set_visible(bool visible)
{
    s_visible=visible;
    if(!visible)ib_hints_set_recording(false);
    if(visible)lv_obj_remove_flag(s_layer,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_layer,LV_OBJ_FLAG_HIDDEN);
}
void ib_hints_set_disabled(bool disabled)
{
    if(s_disabled==disabled)return;
    s_disabled=disabled;
    if(disabled)ib_hints_set_recording(false);
    for(unsigned i=0;i<IB_UI_KEY_COUNT;i++){lv_anim_delete(&s_hints[i],flash_cb);s_hints[i].flash=s_hints[i].deny=0;lv_obj_invalidate(s_hints[i].view);}
}

static void recording_cb(void *var,int32_t phase)
{
    hint_t *h=var;if(!s_recording)return;
    s_recording_phase=phase;lv_obj_invalidate(h->view);
}
void ib_hints_set_recording(bool active)
{
    active=active&&s_visible&&!s_disabled;
    if(active==s_recording)return;
    s_recording=active;hint_t *h=&s_hints[IB_UI_KEY_OK];
    lv_anim_delete(h,recording_cb);s_recording_phase=0;lv_obj_invalidate(h->view);
    if(!active)return;
    lv_anim_t a;lv_anim_init(&a);lv_anim_set_var(&a,h);lv_anim_set_exec_cb(&a,recording_cb);
    lv_anim_set_values(&a,0,IB_P_ONE);lv_anim_set_duration(&a,700);lv_anim_set_reverse_duration(&a,700);
    lv_anim_set_repeat_count(&a,LV_ANIM_REPEAT_INFINITE);lv_anim_set_path_cb(&a,lv_anim_path_ease_in_out);lv_anim_start(&a);
}

void ib_hints_set_pagination(bool active,uint16_t index,uint16_t total)
{
    active=active&&total>0;
    if(active==s_page_active&&index==s_page_index&&total==s_page_total)return;
    s_page_active=active;s_page_total=total;s_page_index=total&&index>=total?total-1:index;
    if(active)lv_obj_remove_flag(s_pips,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_pips,LV_OBJ_FLAG_HIDDEN);
    lv_obj_invalidate(s_pips);
}
ib_icon_t ib_hints_current_icon(ib_ui_key_t key)
{
    if((unsigned)key>=IB_UI_KEY_COUNT)return IB_ICON_NONE;
    hint_t *h=&s_hints[key];return h->press!=IB_ICON_NONE?h->press:h->hold;
}

ib_hint_pages_t ib_hints_page_window(void)
{
    ib_hint_pages_t out={.active=s_page_active,.current=s_page_index,.total=s_page_total};
    if(!s_page_active||!s_page_total)return out;
    out.count=s_page_total<7?s_page_total:7;
    out.first=s_page_index>out.count/2?s_page_index-out.count/2:0;
    if(out.first+out.count>s_page_total)out.first=s_page_total-out.count;
    out.before=out.first>0;out.after=out.first+out.count<s_page_total;return out;
}
