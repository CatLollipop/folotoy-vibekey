// main/ib_ui.c: UI 核心:屏幕根对象、页面调度与切换动画、逐帧定时器、对外接口加锁。
//
// 页面切换采用"淡出后再淡入"(fade-through),两页不会叠在一起:
//   旧页面 120 ms 淡出(ease-in)后隐藏;新页面在旧页面淡完后 180 ms 淡入并从下方 8 px 缓动上移(ease-out),
//   页面内部的自绘动画以新页面开始淡入的时刻为 enter_ms(图标等做轻微放大)。
// 只用 opa / translate 样式,不触发 LVGL 图层缓冲(C3 内存放不下整页图层)。
//
// 逐帧定时器(33 ms ≈ 30 fps)运行在 LVGL 任务里:平滑电平、驱动状态栏、当前页面与 Agent 通知层的
// frame()。熄屏时暂停定时器,不产生任何重绘;Agent 全屏通知盖住页面时页面也不再逐帧重绘。
//
// 图层顺序(由下到上):页面层 → 状态栏 → 右侧按键提示列 → Agent 通知层。
#include "ib_ui.h"
#include "ib_pet.h"
#include "ib_transcript_view.h"
#include "ib_reply_font.h"
#include "ib_ui_activity.h"
#include "ib_ui_conversation.h"
#include "ib_ui_notification.h"

#include "bsp_display.h"
#include "ib_ui_agent.h"
#include "ib_ui_gfx.h"
#include "ib_ui_hints.h"
#include "ib_ui_page.h"
#include "ib_ui_statusbar.h"

#include "esp_log.h"

#include <string.h>
#include <stdio.h>

static const char *TAG = "ib_ui";

#define LOCK_TIMEOUT_MS 1000
#define FRAME_MS        33
#define FADE_OUT_MS     120
#define FADE_IN_MS      180
#define RISE_PX         8
#define PET_BG          0x17181D
#define PET_TEXT_W      198
#define PET_GRID_BOTTOM (4 + IB_PET_SIZE * 7)

static const ib_ui_page_t *const PAGES[IB_UI_SCREEN_COUNT] = {
    [IB_UI_OFFLINE] = &ib_ui_page_offline,
    [IB_UI_IDLE] = &ib_ui_page_idle,
    [IB_UI_REC] = &ib_ui_page_rec,
    [IB_UI_PROC] = &ib_ui_page_proc,
    [IB_UI_DONE] = &ib_ui_page_done,
    [IB_UI_ERR] = &ib_ui_page_err,
    [IB_UI_SUB] = &ib_ui_page_sub,
    [IB_UI_LIST] = &ib_ui_page_list,
    [IB_UI_USAGE] = &ib_ui_page_usage,
};

static lv_obj_t *s_roots[IB_UI_SCREEN_COUNT];
static lv_obj_t *s_pet_root, *s_pet_label,*s_activity;
static ib_ui_assistant_phase_t s_activity_phase=IB_UI_ASSIST_IDLE;
static bool s_activity_error;
static uint32_t s_activity_last_frame;
static uint16_t s_pet_pixels[IB_PET_SIZE * IB_PET_SIZE];
static volatile uint32_t s_pet_frame_max_ms,s_pet_frame_last_ms;
static ib_ui_screen_t s_screen = IB_UI_OFFLINE;
static ib_ui_ctx_t s_ctx;
static ib_ui_list_t s_local_list;
static lv_timer_t *s_frame_timer;
static bool s_ready;
static bool s_awake = true;
static bool s_capture_active,s_menu_return_pending;
static bool s_waiting_refresh;
static ib_icon_t s_key_icons[IB_UI_KEY_COUNT];
static bool s_hint_standalone;
static ib_ui_assistant_phase_t s_hint_phase=IB_UI_ASSIST_COUNT;
static struct {bool visible;ib_ui_agent_t kind;char source[64];} s_agent_latest;
static ib_transcript_view_t s_transcript;
static ib_reply_view_t s_reply;
static bool reply_visible(void);
static const char *s_pet_status;
static bool s_caption_blocks_transcript;
static char s_caption_text[256];
static bool local_menu_active(void){return s_ctx.run_mode_menu||s_ctx.local_list!=NULL;}
static bool menu_surface(void){return local_menu_active()||s_menu_return_pending||s_screen==IB_UI_LIST;}

/* 物理键仍为右侧UP/DOWN/OK；左侧仅电源标识，不把长按含义画成左侧虚构按键。 */
static void apply_key_hints(void)
{
    bool busy=s_hint_phase!=IB_UI_ASSIST_IDLE&&s_hint_phase!=IB_UI_ASSIST_DONE&&
        s_hint_phase!=IB_UI_ASSIST_ERROR&&s_hint_phase!=IB_UI_ASSIST_STOPPED&&s_hint_phase!=IB_UI_ASSIST_COUNT;
    for(unsigned key=0;key<IB_UI_KEY_COUNT;key++){
        ib_icon_t icon=s_key_icons[key],hold=key==IB_UI_KEY_UP?IB_ICON_MODE:key==IB_UI_KEY_DOWN?IB_ICON_APPS:IB_ICON_NONE;
        if(menu_surface()){
            icon=key==IB_UI_KEY_UP?IB_ICON_UP:key==IB_UI_KEY_DOWN?IB_ICON_DOWN:IB_ICON_CHECK;
            hold=key==IB_UI_KEY_OK?IB_ICON_ESC:IB_ICON_NONE;
        }else if(ib_notification_active()){
            unsigned index=ib_notification_index(),total=ib_notification_total();
            icon=key==IB_UI_KEY_UP?(index?IB_ICON_UP:IB_ICON_NONE):
                key==IB_UI_KEY_DOWN?(index+1<total?IB_ICON_DOWN:IB_ICON_NONE):IB_ICON_MIC;
        }else if(ib_conversation_ui_owned()){
            unsigned page=ib_conversation_ui_page(),pages=ib_conversation_ui_pages();
            icon=key==IB_UI_KEY_UP?(page>1?IB_ICON_UP:IB_ICON_NONE):key==IB_UI_KEY_DOWN?(page<pages?IB_ICON_DOWN:IB_ICON_NONE):ib_conversation_ui_confirm()?IB_ICON_SEND:ib_conversation_ui_record()?IB_ICON_MIC:IB_ICON_NONE;
        }else if(reply_visible()){
            icon=key==IB_UI_KEY_UP?(s_reply.page_index?IB_ICON_UP:IB_ICON_NONE):
                key==IB_UI_KEY_DOWN?(s_reply.page_index+1<s_reply.page_count?IB_ICON_DOWN:IB_ICON_NONE):IB_ICON_MIC;
        }else if(s_hint_standalone){
            icon=key==IB_UI_KEY_UP?(busy?IB_ICON_NONE:IB_ICON_DEL):key==IB_UI_KEY_DOWN?(busy?IB_ICON_STOP:IB_ICON_NONE):IB_ICON_MIC;
        }else if(s_screen==IB_UI_OFFLINE){
            icon=key==IB_UI_KEY_OK?IB_ICON_REPEAT:IB_ICON_NONE;
        }
        if(s_hint_standalone&&busy&&key==IB_UI_KEY_DOWN)hold=IB_ICON_NONE;
        if(s_capture_active&&key==IB_UI_KEY_OK&&!menu_surface())icon=IB_ICON_MIC;
        ib_hints_set_icon((ib_ui_key_t)key,icon);
        ib_hints_set_hold_icon((ib_ui_key_t)key,hold);
    }
    bool reading=!menu_surface()&&s_screen!=IB_UI_OFFLINE&&s_screen!=IB_UI_USAGE&&s_screen!=IB_UI_SUB;
    if(reading&&ib_notification_active())ib_hints_set_pagination(true,ib_notification_index(),ib_notification_total());
    else if(reading&&ib_conversation_ui_owned())ib_hints_set_pagination(ib_conversation_ui_pages()>0,ib_conversation_ui_page()?ib_conversation_ui_page()-1:0,ib_conversation_ui_pages());
    else ib_hints_set_pagination(reading&&reply_visible(),s_reply.page_index,s_reply.page_count);
    ib_hints_set_disabled(!local_menu_active()&&!s_hint_standalone&&s_hint_phase==IB_UI_ASSIST_COUNT&&s_screen==IB_UI_PROC);
    ib_hints_set_visible(true);
    ib_hints_set_recording(s_capture_active&&s_awake&&!local_menu_active()&&!s_menu_return_pending&&!ib_notification_active()&&
        s_screen!=IB_UI_LIST&&s_screen!=IB_UI_USAGE);
}

static void copy_text(char *dst, size_t cap, const char *src)
{
    size_t n = 0;
    if (src) {
        for (; src[n] && n + 1 < cap; n++) {
            char ch = src[n];
            dst[n] = (ch >= 0x20 && ch < 0x7F) ? ch : '?';   // 字体只有 ASCII
        }
    }
    dst[n] = '\0';
}

// 字幕字段保留 UTF-8;只在完整字符边界截断。
static void copy_utf8(char *dst, size_t cap, const char *src)
{
    size_t n = 0;
    while (src && src[n] && n + 1 < cap) {
        unsigned char ch = (unsigned char)src[n];
        size_t len = ch < 0x80 ? 1 : (ch & 0xE0) == 0xC0 ? 2 : (ch & 0xF0) == 0xE0 ? 3 : (ch & 0xF8) == 0xF0 ? 4 : 0;
        if (len == 0 || n + len + 1 > cap) break;
        memcpy(dst + n, src + n, len);
        n += len;
    }
    dst[n] = '\0';
}

/* 从尾部按真实字宽取一行，ASR新快照只局部覆盖字幕label，不按时间伪造滚字。 */
static size_t transcript_line_start(const char *text,size_t end)
{
    size_t start=end;unsigned width=0;
    while(start){
        size_t previous=start-1;while(previous&&((unsigned char)text[previous]&0xc0)==0x80)previous--;
        const unsigned char *p=(const unsigned char *)text+previous;uint32_t c=*p;
        if(c>=0xf0)c=((c&7u)<<18)|((p[1]&63u)<<12)|((p[2]&63u)<<6)|(p[3]&63u);
        else if(c>=0xe0)c=((c&15u)<<12)|((p[1]&63u)<<6)|(p[2]&63u);
        else if(c>=0xc0)c=((c&31u)<<6)|(p[1]&63u);
        lv_font_glyph_dsc_t glyph;unsigned advance=lv_font_get_glyph_dsc(&ib_cjk_font_12,&glyph,c,0)?glyph.adv_w:12;
        if(width+advance>198&&width)break;
        width+=advance;start=previous;
    }
    return start;
}
static bool transcript_visible(void){return !s_caption_blocks_transcript&&s_transcript.active&&s_transcript.text[0]&&!s_transcript.closed;}
static bool reply_visible(void){return !s_caption_blocks_transcript&&ib_reply_view_active(&s_reply)&&s_reply.text[0];}
static ib_ui_assistant_phase_t canonical_phase(const char *name)
{
    if(!name)return IB_UI_ASSIST_IDLE;
    if(!strcmp(name,"listening")||!strcmp(name,"dictating"))return IB_UI_ASSIST_LISTENING;
    if(!strcmp(name,"uploading"))return IB_UI_ASSIST_TRANSCRIBING;
    if(!strcmp(name,"loading")||!strcmp(name,"spawning")||!strcmp(name,"waking"))return IB_UI_ASSIST_PREPARING;
    if(!strcmp(name,"thinking")||!strcmp(name,"searching")||!strcmp(name,"reading")||!strcmp(name,"radar")||!strcmp(name,"orbit"))return IB_UI_ASSIST_THINKING;
    if(!strcmp(name,"writing")||!strcmp(name,"working")||!strcmp(name,"composing")||!strcmp(name,"sending")||!strcmp(name,"receiving"))return IB_UI_ASSIST_REPLYING;
    if(!strcmp(name,"happy")||!strcmp(name,"celebrate")||!strcmp(name,"done"))return IB_UI_ASSIST_DONE;
    if(!strcmp(name,"alerting"))return IB_UI_ASSIST_ERROR;
    if(!strcmp(name,"powering-down"))return IB_UI_ASSIST_STOPPED;
    return IB_UI_ASSIST_IDLE;
}
static ib_ui_assistant_phase_t activity_phase(void)
{
    return s_capture_active?IB_UI_ASSIST_LISTENING:reply_visible()&&s_reply.final?IB_UI_ASSIST_DONE:s_activity_phase;
}
static void activity_draw(lv_event_t *event)
{
    ib_fx_t f;ib_fx_begin(&f,event);ib_activity_draw(&f,8,8,activity_phase(),s_capture_active,s_ctx.now_ms);
}
static void caption_layout(const char *text)
{
    lv_point_t size;lv_text_get_size(&size,text,&ib_cjk_font_12,0,2,PET_TEXT_W,LV_TEXT_FLAG_NONE);
    int height=size.y>0?size.y:16,available=IB_UI_H-IB_UI_BAR_H-PET_GRID_BOTTOM-18;
    if(height>available)height=available;
    lv_obj_set_height(s_pet_label,height);lv_obj_align(s_pet_label,LV_ALIGN_TOP_MID,0,PET_GRID_BOTTOM+18);
}
static void render_pet_caption(void)
{
    const char *text=NULL;
    if(ib_conversation_ui_owned()&&!ib_conversation_ui_active()){
        text=ib_conversation_ui_focus_text();
    }else if(reply_visible()){
        if(ib_reply_font_copy(s_caption_text,sizeof(s_caption_text),s_reply.text))text=s_caption_text;
    }else if(transcript_visible()){
        size_t end=strlen(s_transcript.text),split=transcript_line_start(s_transcript.text,end);
        size_t start=split?transcript_line_start(s_transcript.text,split):0;
        if(split)snprintf(s_caption_text,sizeof(s_caption_text),"%.*s\n%s",(int)(split-start),s_transcript.text+start,s_transcript.text+split);
        else snprintf(s_caption_text,sizeof(s_caption_text),"%s",s_transcript.text);
        text=s_caption_text;
    }else if(s_activity_error)text=s_pet_status;
    if(text&&text[0]){lv_label_set_text_static(s_pet_label,text);caption_layout(text);lv_obj_remove_flag(s_pet_label,LV_OBJ_FLAG_HIDDEN);}
    else{lv_label_set_text_static(s_pet_label,"");lv_obj_add_flag(s_pet_label,LV_OBJ_FLAG_HIDDEN);}
    if(s_activity)lv_obj_invalidate(s_activity);
}

// 点阵绘制只读缓存；模拟在frame_cb运行，避免LVGL重绘时被fps限流清空。
static void pet_pixel(uint8_t col,uint8_t row,uint32_t rgb,uint8_t brightness,void *context)
{
    (void)context; if(col>=IB_PET_SIZE||row>=IB_PET_SIZE)return;
    unsigned i=row*IB_PET_SIZE+col;
    if(rgb==PET_BG)brightness=100; // 空点与主画布同色，不随宠物亮度形成方形暗底。
    unsigned r=((rgb>>16)&255)*brightness/100,g=((rgb>>8)&255)*brightness/100,b=(rgb&255)*brightness/100;
    s_pet_pixels[i]=(uint16_t)(((r>>3)<<11)|((g>>2)<<5)|(b>>3));
}
static void pet_draw(lv_event_t *event)
{
    if(s_screen!=IB_UI_OFFLINE&&!ib_pet_enabled())return;
    lv_layer_t *layer=lv_event_get_layer(event);lv_area_t area;lv_obj_get_coords(s_pet_root,&area);
    const lv_area_t *clip=&layer->_clip_area;int left=(lv_obj_get_width(s_pet_root)-IB_PET_SIZE*7)/2;
    // 4行DMA会按clip多次调用自绘；先裁剪再建图元，不能每块都处理784颗点。
    lv_draw_rect_dsc_t d;lv_draw_rect_dsc_init(&d);d.bg_opa=LV_OPA_COVER;d.radius=LV_RADIUS_CIRCLE;
    for(int row=0;row<IB_PET_SIZE;row++){
        int y1=area.y1+4+row*7,y2=y1+5;if(y2<clip->y1||y1>clip->y2)continue;
        for(int col=0;col<IB_PET_SIZE;col++){
            int x1=area.x1+left+col*7,x2=x1+5;if(x2<clip->x1||x1>clip->x2)continue;
            uint16_t c=s_pet_pixels[row*IB_PET_SIZE+col];
            if(c==(((PET_BG>>19)&31)<<11|((PET_BG>>10)&63)<<5|((PET_BG>>3)&31)))continue;
            uint32_t r=((c>>11)&31)*255/31,g=((c>>5)&63)*255/63,b=(c&31)*255/31;
            d.bg_color=lv_color_hex((r<<16)|(g<<8)|b);
            lv_area_t dot={x1,y1,x2,y2};lv_draw_rect(layer,&d,&dot);
        }
    }
}
static void mini_pet_draw(const ib_fx_t *f,int x,int y)
{
    // 同一实际Aora栅格缓存缩为28px头像，不另造默认角色或复制动画资源。
    for(unsigned row=0;row<IB_PET_SIZE;row++)for(unsigned col=0;col<IB_PET_SIZE;col++){
        uint16_t p=s_pet_pixels[row*IB_PET_SIZE+col];
        if(p==(((PET_BG>>19)&31)<<11|((PET_BG>>10)&63)<<5|((PET_BG>>3)&31)))continue;
        uint32_t r=((p>>11)&31)*255/31,g=((p>>5)&63)*255/63,b=(p&31)*255/31;
        ib_fx_rect(f,x+(int)col,y+(int)row,1,1,0,IB_C((r<<16)|(g<<8)|b),LV_OPA_COVER);
    }
}
static void pet_visibility(void)
{
    if(!s_pet_root)return;
    bool offline=s_screen==IB_UI_OFFLINE;
    ib_conversation_ui_suspend(menu_surface()||offline||ib_notification_active(),menu_surface());
    bool show=(offline||ib_pet_enabled()||s_hint_standalone||s_hint_phase!=IB_UI_ASSIST_COUNT||ib_conversation_ui_owned()||reply_visible()||transcript_visible())&&s_screen!=IB_UI_LIST&&s_screen!=IB_UI_USAGE&&s_screen!=IB_UI_SUB;
    if(ib_conversation_ui_active())show=false;
    lv_obj_set_size(s_pet_root,IB_UI_W,offline?208:IB_UI_H-IB_UI_BAR_H);
    if(offline){lv_obj_add_flag(s_pet_label,LV_OBJ_FLAG_HIDDEN);lv_obj_add_flag(s_activity,LV_OBJ_FLAG_HIDDEN);}
    else{if(lv_label_get_text(s_pet_label)[0])lv_obj_remove_flag(s_pet_label,LV_OBJ_FLAG_HIDDEN);lv_obj_remove_flag(s_activity,LV_OBJ_FLAG_HIDDEN);}
    ib_notification_suspend(menu_surface());
    // 退出菜单必须先应用最后的show/hide，再解除遮蔽；不能提前露出已过期的Agent层。
    if(menu_surface()||ib_notification_active())ib_agent_set_suspended(true);
    if(show)lv_obj_remove_flag(s_pet_root,LV_OBJ_FLAG_HIDDEN);else lv_obj_add_flag(s_pet_root,LV_OBJ_FLAG_HIDDEN);
}
// ---------------------------------------------------------------------------
// 页面切换动画(LVGL 任务)
// ---------------------------------------------------------------------------

static void opa_cb(void *obj, int32_t v)
{
    lv_obj_set_style_opa(obj, (lv_opa_t)v, 0);
}

static void rise_cb(void *obj, int32_t v)
{
    lv_obj_set_style_translate_y(obj, v, 0);
}

static void hide_done_cb(lv_anim_t *a)
{
    lv_obj_t *obj = a->var;
    // 淡出期间若又被切回来,会先删除这个动画,因此走到这里一定是仍需隐藏。
    lv_obj_add_flag(obj, LV_OBJ_FLAG_HIDDEN);
}

static void anim_start(lv_obj_t *obj, lv_anim_exec_xcb_t cb, int32_t from, int32_t to, uint32_t delay, uint32_t ms,
                       lv_anim_path_cb_t path, lv_anim_completed_cb_t done)
{
    lv_anim_t a;
    lv_anim_init(&a);
    lv_anim_set_var(&a, obj);
    lv_anim_set_exec_cb(&a, cb);
    lv_anim_set_values(&a, from, to);
    lv_anim_set_delay(&a, delay);
    lv_anim_set_duration(&a, ms);
    lv_anim_set_path_cb(&a, path);
    if (done) lv_anim_set_completed_cb(&a, done);
    lv_anim_start(&a);
}

static ib_bar_mode_t bar_mode_for(ib_ui_screen_t screen)
{
    if (screen == IB_UI_REC) return IB_BAR_REC;
    if (screen == IB_UI_SUB) return IB_BAR_LIVE;
    return IB_BAR_NORMAL;
}

// 主体是点阵的页面(ib_ui_dots)之间"直切":新页面接着上一页的最后一帧让点重排(见 ib_ui_page.h);
// LIST是导航边界，进入/返回必须完整直切，不能先隐藏宠物后露出旧页面。
static bool dot_page(ib_ui_screen_t s)
{
    return s == IB_UI_IDLE || s == IB_UI_REC || s == IB_UI_PROC || s == IB_UI_DONE || s == IB_UI_ERR || s == IB_UI_SUB;
}

static bool cut_transition(ib_ui_screen_t from, ib_ui_screen_t to)
{
    return from != to && dot_page(from) && dot_page(to);
}

static void switch_to(ib_ui_screen_t screen,bool immediate)
{
    uint32_t now = lv_tick_get();
    lv_obj_t *old = s_roots[s_screen];
    lv_obj_t *neu = s_roots[screen];
    // 旧页面还没完全显示出来(例如正在淡入)时不直切,免得新页面从一个没出现过的画面开始变形。
    bool dot_cut = cut_transition(s_screen, screen) && !lv_obj_has_flag(old, LV_OBJ_FLAG_HIDDEN) &&
                   lv_obj_get_style_opa(old, 0) == LV_OPA_COVER;
    bool cut = immediate || !s_awake || dot_cut || screen==IB_UI_OFFLINE || s_screen==IB_UI_OFFLINE ||
        screen==IB_UI_LIST || s_screen==IB_UI_LIST;
    s_ctx.prev_screen = dot_cut && s_awake ? s_screen : IB_UI_SCREEN_NONE;

    if (cut) {
        lv_anim_delete(old, NULL);
        lv_anim_delete(neu, NULL);
        lv_obj_add_flag(old, LV_OBJ_FLAG_HIDDEN);
        lv_obj_remove_flag(neu, LV_OBJ_FLAG_HIDDEN);
        lv_obj_set_style_opa(neu, LV_OPA_COVER, 0);
        lv_obj_set_style_translate_y(neu, 0, 0);
        lv_obj_move_foreground(neu);
        s_screen = screen;
        s_ctx.enter_ms = now;
        s_ctx.now_ms = now;
        ib_bar_set_mode(bar_mode_for(screen), now);
        ib_hints_set_visible(screen!=IB_UI_OFFLINE);
        ib_hints_set_disabled(screen == IB_UI_PROC);
        ib_agent_set_banner(screen == IB_UI_REC, now);
        PAGES[screen]->enter(&s_ctx);
        apply_key_hints();
        pet_visibility();lv_obj_invalidate(neu);
        return;
    }

    uint32_t delay = 0;
    if (old != neu) {
        lv_anim_delete(old, NULL);
        lv_opa_t from = lv_obj_get_style_opa(old, 0);
        if (lv_obj_has_flag(old, LV_OBJ_FLAG_HIDDEN)) from = LV_OPA_TRANSP;
        // 旧页面已经淡掉一部分时按剩余比例缩短淡出,新页面紧接着开始淡入。
        delay = (uint32_t)FADE_OUT_MS * from / LV_OPA_COVER;
        anim_start(old, opa_cb, from, LV_OPA_TRANSP, 0, delay > 0 ? delay : 1, lv_anim_path_ease_in, hide_done_cb);
    }
    lv_anim_delete(neu, NULL);
    lv_obj_remove_flag(neu, LV_OBJ_FLAG_HIDDEN);
    lv_obj_set_style_opa(neu, LV_OPA_TRANSP, 0);
    lv_obj_set_style_translate_y(neu, RISE_PX, 0);
    lv_obj_move_foreground(neu);
    anim_start(neu, opa_cb, LV_OPA_TRANSP, LV_OPA_COVER, delay, FADE_IN_MS, lv_anim_path_ease_out, NULL);
    anim_start(neu, rise_cb, RISE_PX, 0, delay, FADE_IN_MS, lv_anim_path_ease_out, NULL);

    s_screen = screen;
    s_ctx.enter_ms = now + delay;       // 页面动画从开始淡入时算起
    s_ctx.now_ms = now;
    ib_bar_set_mode(bar_mode_for(screen), now);
    ib_hints_set_visible(screen != IB_UI_OFFLINE);
    ib_hints_set_disabled(screen == IB_UI_PROC);    // 上一句还在处理:按键暂不可用
    // 录音中通知只显示横幅,离开录音后恢复全屏。
    ib_agent_set_banner(screen == IB_UI_REC, now);
    PAGES[screen]->enter(&s_ctx);
    apply_key_hints();
}

static void refresh_ready(lv_event_t *event)
{
    (void)event;
    // 完整刷新后才安排下一帧。让lv_timer_handler返回，port解锁后vTaskDelay(1)
    // 真正让出CPU给main/IDLE；不能在重绘慢于timer周期时无限追赶已过期帧。
    if(s_waiting_refresh&&s_frame_timer){
        s_waiting_refresh=false;
        if(s_awake){lv_timer_reset(s_frame_timer);lv_timer_resume(s_frame_timer);}
    }
}

static void frame_cb(lv_timer_t *t)
{
    (void)t;
    s_ctx.now_ms = lv_tick_get();
    // 电平平滑:每帧向目标靠近 35%,0..1000 定点。
    int32_t target = (int32_t)s_ctx.level * 10;
    s_ctx.level_smooth += (target - s_ctx.level_smooth) * 35 / 100;
    ib_bar_frame(s_ctx.now_ms);
    // 新页面还在等旧页面淡出(enter_ms 在未来)时不推进它的动画。
    bool started = (int32_t)(s_ctx.now_ms - s_ctx.enter_ms) >= 0;
    if(started&&!ib_agent_covering()&&(s_screen==IB_UI_OFFLINE||!s_pet_root||lv_obj_has_flag(s_pet_root,LV_OBJ_FLAG_HIDDEN)))PAGES[s_screen]->frame(&s_ctx);
    ib_agent_frame(s_ctx.now_ms);
    if(started&&s_screen==IB_UI_OFFLINE){const char *desired=s_ctx.now_ms-s_ctx.enter_ms>45000?"sleeping":"idle";if(strcmp(ib_pet_state_name(),desired))ib_pet_set_state_name(desired,s_ctx.now_ms);}
    pet_visibility();
    bool mini=ib_conversation_ui_active();
    if(s_pet_root&&(mini||!lv_obj_has_flag(s_pet_root,LV_OBJ_FLAG_HIDDEN))&&(mini||s_screen==IB_UI_OFFLINE||ib_pet_enabled())&&!ib_notification_active()){
        uint32_t before=lv_tick_get();
        if(ib_pet_render(s_ctx.now_ms,pet_pixel,NULL)){
            uint32_t elapsed=lv_tick_get()-before;s_pet_frame_last_ms=elapsed;if(elapsed>s_pet_frame_max_ms)s_pet_frame_max_ms=elapsed;
            if(mini)ib_conversation_ui_pet_changed();
            else{lv_area_t area;lv_obj_get_coords(s_pet_root,&area);
            int x=(lv_obj_get_width(s_pet_root)-IB_PET_SIZE*7)/2;
            lv_area_t dirty={area.x1+x,area.y1+4,area.x1+x+IB_PET_SIZE*7-1,area.y1+PET_GRID_BOTTOM-1};
            lv_obj_invalidate_area(s_pet_root,&dirty);
            }
        }
    }
    if(s_activity&&!lv_obj_has_flag(s_pet_root,LV_OBJ_FLAG_HIDDEN)&&!ib_notification_active()&&
       ib_activity_animates(activity_phase(),s_capture_active)&&s_ctx.now_ms-s_activity_last_frame>=100){
        s_activity_last_frame=s_ctx.now_ms;lv_obj_invalidate(s_activity);
    }
    ib_notification_frame(s_ctx.now_ms);
    ib_conversation_ui_frame(s_ctx.now_ms);
    // 无图元变化时也恢复refresh timer，以便REFR_READY解除等待；熄屏仍保持暂停。
    lv_timer_pause(t);s_waiting_refresh=true;
    lv_timer_resume(lv_display_get_refr_timer(lv_display_get_default()));
}

// ---------------------------------------------------------------------------
// 对外接口
// ---------------------------------------------------------------------------

esp_err_t ib_ui_init(void)
{
    if (!bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return ESP_ERR_TIMEOUT;

    lv_obj_t *scr = lv_screen_active();
    lv_obj_remove_flag(scr, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_color(scr, IB_C(IB_COLOR_BG), 0);
    lv_obj_set_style_bg_opa(scr, LV_OPA_COVER, 0);

    copy_text(s_ctx.time, sizeof(s_ctx.time), "");
    s_ctx.mode = IB_UI_MODE_DICT;
    s_ctx.now_ms = lv_tick_get();

    // 离线页铺满全屏，其他页面仍从状态栏下方开始。整个页面层位于状态栏之下。
    lv_obj_t *pages = ib_box_create(scr, 0, 0, IB_UI_W, IB_UI_H);
    for (int i = 0; i < IB_UI_SCREEN_COUNT; i++) {
        s_roots[i] = PAGES[i]->create(pages, &s_ctx);
        if (i != IB_UI_OFFLINE) lv_obj_set_y(s_roots[i], IB_UI_BAR_H);
        lv_obj_add_flag(s_roots[i], LV_OBJ_FLAG_HIDDEN);
    }
    ib_pet_init();
    s_pet_root=ib_box_create(scr,0,IB_UI_BAR_H,IB_UI_W,IB_UI_H-IB_UI_BAR_H);
    lv_obj_set_style_bg_color(s_pet_root,lv_color_hex(PET_BG),0);
    lv_obj_set_style_bg_opa(s_pet_root,LV_OPA_COVER,0);
    lv_obj_add_event_cb(s_pet_root,pet_draw,LV_EVENT_DRAW_MAIN,NULL);
    s_pet_label=ib_label_create(s_pet_root,&ib_cjk_font_12,0xE0DCCF,PET_GRID_BOTTOM,PET_TEXT_W);
    ib_reply_view_init(&s_reply,198,ib_reply_font_advance,NULL);
    lv_obj_set_style_text_line_space(s_pet_label,2,0);
    lv_obj_set_style_bg_opa(s_pet_label,LV_OPA_TRANSP,0);
    lv_label_set_long_mode(s_pet_label,LV_LABEL_LONG_CLIP);
    s_activity=ib_fx_create(s_pet_root,(IB_UI_W-16)/2,PET_GRID_BOTTOM,16,16,activity_draw,NULL);
    s_pet_status=ib_ui_assistant_label(IB_UI_ASSIST_IDLE,false,NULL);render_pet_caption();
    ib_notification_create(scr);
    // 固定父层在status/hints之前，后续懒建两栏不会盖住实体键或页点。
    lv_obj_t *conversation_layer=ib_box_create(scr,0,0,IB_UI_W,IB_UI_H);
    ib_conversation_ui_init(conversation_layer,mini_pet_draw);
    ib_bar_create(scr);     // 后建,位于页面之上
    ib_hints_create(scr);
    ib_hints_set_visible(false);
    ib_agent_create(scr);   // 最上层
    apply_key_hints();

    s_screen = IB_UI_OFFLINE;
    lv_obj_remove_flag(s_roots[s_screen], LV_OBJ_FLAG_HIDDEN);
    s_ctx.enter_ms = s_ctx.now_ms;
    PAGES[s_screen]->enter(&s_ctx);

    s_frame_timer = lv_timer_create(frame_cb, FRAME_MS, NULL);
    lv_display_add_event_cb(lv_display_get_default(),refresh_ready,LV_EVENT_REFR_READY,NULL);
    s_ready = true;
    bsp_lvgl_unlock();
    return s_frame_timer ? ESP_OK : ESP_ERR_NO_MEM;
}

bool ib_ui_show(ib_ui_screen_t screen, ib_ui_mode_t mode, const char *msg)
{
    if (!s_ready || (unsigned)screen >= IB_UI_SCREEN_COUNT || (unsigned)mode >= IB_UI_MODE_COUNT) return false;
    if (!bsp_lvgl_lock(LOCK_TIMEOUT_MS)) {
        ESP_LOGW(TAG, "lock timeout (show)");
        return false;
    }
    bool changed = s_ctx.mode != mode || strncmp(s_ctx.msg, msg ? msg : "", sizeof(s_ctx.msg)) != 0;
    s_ctx.mode = mode;
    copy_text(s_ctx.msg, sizeof(s_ctx.msg), msg);
    if(local_menu_active()){bsp_lvgl_unlock();return true;}
    bool returning=s_menu_return_pending;
    bool leaving_list=s_screen==IB_UI_LIST&&screen!=IB_UI_LIST;
    if (screen != s_screen||returning) {
        switch_to(screen,returning);
    } else if (changed) {
        ib_bar_set_mode(bar_mode_for(screen), lv_tick_get());     // 例如 IDLE 上 LIVE 徽章出现 / 消失
        PAGES[screen]->update(&s_ctx);
    }
    if(returning||leaving_list){
        s_menu_return_pending=false;
        if(s_agent_latest.visible)ib_agent_show(s_agent_latest.kind,s_agent_latest.source,s_screen==IB_UI_REC,lv_tick_get());
        else ib_agent_hide();
        ib_agent_set_suspended(ib_notification_active());pet_visibility();apply_key_hints();
    }
    bsp_lvgl_unlock();
    return true;
}

void ib_ui_set_capture_active(bool active)
{
    if(!s_ready||s_capture_active==active||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    s_capture_active=active;ib_conversation_ui_capture(active);apply_key_hints();if(s_activity)lv_obj_invalidate(s_activity);bsp_lvgl_unlock();
}
const char *ib_ui_conversation_update(const ib_conversation_t *view,bool enabled)
{
    if(!s_ready||!view||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return "display_busy";
    bool ok=ib_conversation_ui_apply(view,enabled);
    if(ok&&enabled&&view->bound){
        static const char *const names[]={"idle","listening","uploading","waiting","sending","working","waiting","celebrate","alerting","confused"};
        static const ib_ui_assistant_phase_t phases[]={IB_UI_ASSIST_IDLE,IB_UI_ASSIST_LISTENING,IB_UI_ASSIST_TRANSCRIBING,IB_UI_ASSIST_IDLE,IB_UI_ASSIST_REPLYING,IB_UI_ASSIST_THINKING,IB_UI_ASSIST_IDLE,IB_UI_ASSIST_DONE,IB_UI_ASSIST_ERROR,IB_UI_ASSIST_ERROR};
        if((unsigned)view->phase<10){ib_pet_set_state_name(names[view->phase],lv_tick_get());s_activity_phase=phases[view->phase];}
        s_activity_error=view->phase==IB_CONV_ERROR||view->phase==IB_CONV_UNKNOWN;
        if(s_activity_error)s_pet_status=ib_ui_conversation_error(view->error[0]?view->error:"unknown");
        render_pet_caption();
    }
    pet_visibility();apply_key_hints();bsp_lvgl_unlock();return ok?NULL:"invalid_pane";
}

void ib_ui_set_level(uint8_t level)
{
    // 单字节写入,LVGL 任务每帧读取;不需要加锁。
    s_ctx.level = level > 100 ? 100 : level;
    ib_pet_set_level(s_ctx.level);
}

void ib_ui_set_caption(const char *src, const char *dst, const char *app, bool live)
{
    if (!s_ready) return;
    const char *s = src ? src : "";
    const char *d = dst ? dst : "";
    const char *a = app ? app : "";
    bool changed = s_ctx.caption_live != live ||
                   strncmp(s_ctx.caption_src, s, sizeof(s_ctx.caption_src)) != 0 ||
                   strncmp(s_ctx.caption_dst, d, sizeof(s_ctx.caption_dst)) != 0 ||
                   strncmp(s_ctx.caption_app, a, sizeof(s_ctx.caption_app)) != 0;
    if (!changed) return;
    if (!bsp_lvgl_lock(LOCK_TIMEOUT_MS)) {
        ESP_LOGW(TAG, "lock timeout (caption)");
        return;
    }
    copy_utf8(s_ctx.caption_src, sizeof(s_ctx.caption_src), s);
    copy_utf8(s_ctx.caption_dst, sizeof(s_ctx.caption_dst), d);
    copy_utf8(s_ctx.caption_app, sizeof(s_ctx.caption_app), a);
    s_ctx.caption_live = live;
    if (s_screen == IB_UI_SUB) PAGES[IB_UI_SUB]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_set_ok_held(bool held)
{
    if (!s_ready || s_ctx.ok_held == held || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    s_ctx.ok_held = held;
    if (s_screen == IB_UI_REC) PAGES[s_screen]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_set_link(ib_ui_link_t link, bool online)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    ib_bar_set_link(link, online);
    bsp_lvgl_unlock();
}

void ib_ui_set_battery(int soc, bool charging)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    ib_bar_set_battery(soc, charging);
    bsp_lvgl_unlock();
}

void ib_ui_set_clock(const char *time, const char *date)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    copy_text(s_ctx.time, sizeof(s_ctx.time), time);
    copy_text(s_ctx.date, sizeof(s_ctx.date), date);
    if (s_screen == IB_UI_OFFLINE) PAGES[IB_UI_OFFLINE]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_set_offline_hint(const char *text)
{
    if (!s_ready) return;
    char hint[IB_UI_OFFLINE_HINT_MAX];
    copy_utf8(hint, sizeof(hint), text);
    if (strncmp(s_ctx.offline_hint, hint, sizeof(hint)) == 0) return;
    if (!bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    memcpy(s_ctx.offline_hint, hint, sizeof(hint));
    if (s_screen == IB_UI_OFFLINE) PAGES[IB_UI_OFFLINE]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_set_connection_hint(ib_ui_connection_hint_t hint)
{
    ib_ui_set_offline_hint(ib_ui_connection_label(hint));
}

void ib_ui_set_engine(const char *engine)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    copy_text(s_ctx.engine, sizeof(s_ctx.engine), engine);
    if (s_screen == IB_UI_IDLE) PAGES[IB_UI_IDLE]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_key_press(ib_ui_key_t key)
{
    // 离线页不显示提示列,也就没有按键反馈(按键只用于点亮屏幕)。
    if (!s_ready || s_screen == IB_UI_OFFLINE || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    ib_hints_press(key);
    bsp_lvgl_unlock();
}

void ib_ui_set_key_icon(ib_ui_key_t key, ib_icon_t icon)
{
    if (!s_ready || (unsigned)key>=IB_UI_KEY_COUNT || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    s_key_icons[key]=(unsigned)icon<IB_ICON_COUNT?icon:IB_ICON_NONE;
    apply_key_hints();
    bsp_lvgl_unlock();
}
void ib_ui_set_assistant_key_hints(bool standalone,ib_ui_assistant_phase_t phase)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    s_hint_standalone=standalone;s_hint_phase=phase;
    apply_key_hints();bsp_lvgl_unlock();
}
void ib_ui_run_mode_menu(bool standalone,unsigned selected,ib_ui_run_mode_notice_t notice)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    bool opening=!s_ctx.run_mode_menu;
    s_menu_return_pending=false;
    s_ctx.run_mode_menu=true;s_ctx.run_mode_standalone=standalone;
    s_ctx.run_mode_selected=selected<3?(uint8_t)selected:2;
    s_ctx.run_mode_notice=(unsigned)notice<IB_UI_RUN_MODE_NOTICE_COUNT?notice:IB_UI_RUN_MODE_NOTICE_NONE;
    ib_agent_set_suspended(true);
    if(opening)switch_to(IB_UI_LIST,true);
    else PAGES[IB_UI_LIST]->update(&s_ctx);
    apply_key_hints();pet_visibility();
    bsp_lvgl_unlock();
}
void ib_ui_run_mode_menu_hide(void)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    if(s_ctx.run_mode_menu){
        // 保留菜单这一帧，直到app明确show最新目标；不在两次GUI锁之间露出旧LIST/READY。
        s_ctx.run_mode_menu=false;s_menu_return_pending=true;
    }
    bsp_lvgl_unlock();
}
bool ib_ui_run_mode_menu_visible(void){return s_ctx.run_mode_menu;}
void ib_ui_local_menu_show(const ib_ui_list_t *list)
{
    if(!s_ready||!list||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    if(s_ctx.run_mode_menu){bsp_lvgl_unlock();return;}
    bool opening=s_ctx.local_list==NULL;
    s_local_list=*list;s_ctx.local_list=&s_local_list;s_menu_return_pending=false;
    ib_agent_set_suspended(true);
    if(opening)switch_to(IB_UI_LIST,true);else PAGES[IB_UI_LIST]->update(&s_ctx);
    apply_key_hints();pet_visibility();bsp_lvgl_unlock();
}
void ib_ui_local_menu_hide(void)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    // 继续显示原菜单，直到app选择最新目标；背景状态或reader不得在这次锁释放后抢画。
    if(s_ctx.local_list){s_ctx.local_list=NULL;s_menu_return_pending=true;}
    bsp_lvgl_unlock();
}
bool ib_ui_transcript_begin(uint32_t generation)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_transcript_view_begin(&s_transcript,generation);
    if(ok){render_pet_caption();pet_visibility();}
    bsp_lvgl_unlock();return ok;
}
bool ib_ui_transcript_update(uint32_t generation,const char *text,bool final)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_transcript_view_update(&s_transcript,generation,text,final);
    if(ok){render_pet_caption();pet_visibility();}
    bsp_lvgl_unlock();return ok;
}
void ib_ui_transcript_clear(uint32_t generation)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    ib_transcript_view_clear(&s_transcript,generation);memset(s_caption_text,0,sizeof(s_caption_text));
    render_pet_caption();pet_visibility();bsp_lvgl_unlock();
}

bool ib_ui_reply_begin(uint32_t generation)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_reply_view_begin(&s_reply,generation);
    if(ok){render_pet_caption();pet_visibility();apply_key_hints();}
    bsp_lvgl_unlock();return ok;
}
bool ib_ui_reply_update(uint32_t generation,size_t length,bool final,ib_ui_reply_reader_fn reader,void *ctx)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool duplicate=final&&s_reply.final&&!s_reply.closed&&s_reply.generation==generation&&
        s_reply.length==length&&s_reply.reader==reader&&s_reply.reader_ctx==ctx;
    bool ok=duplicate||ib_reply_view_update(&s_reply,generation,length,final,reader,ctx);
    if(ok&&length)ib_transcript_view_clear(&s_transcript,0);
    render_pet_caption();pet_visibility();apply_key_hints();
    bsp_lvgl_unlock();return ok;
}
bool ib_ui_reply_clear(uint32_t generation)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_reply_view_clear(&s_reply,generation);
    render_pet_caption();pet_visibility();apply_key_hints();
    bsp_lvgl_unlock();return ok;
}
bool ib_ui_reply_page(int delta)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=reply_visible()&&ib_reply_view_page(&s_reply,delta);
    render_pet_caption();pet_visibility();apply_key_hints();
    bsp_lvgl_unlock();return ok;
}
bool ib_ui_reply_visible(void)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool visible=reply_visible()&&!ib_notification_active()&&!local_menu_active()&&!s_menu_return_pending&&s_screen!=IB_UI_OFFLINE&&
        s_screen!=IB_UI_LIST&&s_screen!=IB_UI_USAGE&&s_screen!=IB_UI_SUB;
    bsp_lvgl_unlock();return visible;
}
bool ib_ui_notification_show(uint32_t generation,const char *source,ib_ui_notification_kind_t kind,bool truncated,size_t length,ib_ui_reply_reader_fn reader,void *ctx)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    /* 云端资源忙由app/store门禁判定；电脑后台thinking不代表设备正在占用录音/网络。 */
    bool busy=menu_surface()||s_capture_active;
    bool ok=!busy&&ib_notification_show(generation,source,kind,truncated,length,reader,ctx);
    if(ok){
        s_agent_latest.visible=false;ib_agent_set_suspended(true);ib_agent_hide();
        apply_key_hints();pet_visibility();
    }
    bsp_lvgl_unlock();return ok;
}
bool ib_ui_notification_hide(void)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    ib_notification_hide();if(!menu_surface())ib_agent_set_suspended(false);
    apply_key_hints();pet_visibility();render_pet_caption();bsp_lvgl_unlock();return true;
}
bool ib_ui_notification_page(int delta)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=!menu_surface()&&ib_notification_page(delta);
    apply_key_hints();bsp_lvgl_unlock();return ok;
}
bool ib_ui_notification_visible(void)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool visible=ib_notification_active()&&!menu_surface();
    bsp_lvgl_unlock();return visible;
}

bool ib_ui_present_boot_frame(void)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_pet_render_current(pet_pixel,NULL);
    if(ok){
        pet_visibility();lv_obj_invalidate(lv_screen_active());lv_refr_now(lv_display_get_default());
        ok=bsp_display_wait_idle()==ESP_OK;
    }
    bsp_lvgl_unlock();return ok;
}

void ib_ui_set_list(const ib_ui_list_t *list)
{
    if (!s_ready || !list || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    s_ctx.list = *list;
    if (s_screen == IB_UI_LIST&&!s_ctx.local_list&&!s_menu_return_pending) PAGES[IB_UI_LIST]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_set_usage(const ib_ui_usage_t *usage)
{
    if (!s_ready || !usage || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    ib_ui_usage_t next = *usage;
    copy_text(next.app, sizeof(next.app), usage->app);
    copy_text(next.today, sizeof(next.today), usage->today);
    copy_text(next.week, sizeof(next.week), usage->week);
    copy_text(next.total, sizeof(next.total), usage->total);
    copy_text(next.reset, sizeof(next.reset), usage->reset);
    copy_text(next.plan, sizeof(next.plan), usage->plan);
    if (next.tab > 2) next.tab = 0;
    if (next.left_percent > 100) next.left_percent = 100;
    if (next.five_hour_left_percent > 100) next.five_hour_left_percent = 100;
    for (int i = 0; i < 2; i++) {
        if (next.panel_percent[i] > 100) next.panel_percent[i] = 100;
    }
    s_ctx.usage = next;
    if (s_screen == IB_UI_USAGE) PAGES[IB_UI_USAGE]->update(&s_ctx);
    bsp_lvgl_unlock();
}

void ib_ui_agent_show(ib_ui_agent_t kind, const char *source)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    if(ib_notification_active()){bsp_lvgl_unlock();return;}
    s_agent_latest.visible=true;s_agent_latest.kind=kind;copy_text(s_agent_latest.source,sizeof(s_agent_latest.source),source);
    if(!menu_surface())ib_agent_show(kind, source, s_screen == IB_UI_REC, lv_tick_get());
    bsp_lvgl_unlock();
}

void ib_ui_agent_hide(void)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    s_agent_latest.visible=false;
    if(!menu_surface())ib_agent_hide();
    bsp_lvgl_unlock();
}

void ib_ui_set_awake(bool awake)
{
    if (!s_ready || !bsp_lvgl_lock(LOCK_TIMEOUT_MS)) return;
    s_awake = awake;
    if (awake) {
        lv_timer_resume(s_frame_timer);
    } else {
        lv_timer_pause(s_frame_timer);
    }
    apply_key_hints();bsp_lvgl_unlock();
}

bool ib_ui_pet_state(const char *name,const char *body,bool standalone)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_pet_set_state_name(name,lv_tick_get());
    if(ok){
        s_pet_status=ib_ui_pet_label(name,standalone);s_activity_phase=canonical_phase(name);s_activity_error=false;
        if(reply_visible()||transcript_visible())render_pet_caption();
        else if(body&&body[0]){char text[192];copy_utf8(text,sizeof(text),body);lv_label_set_text(s_pet_label,text);caption_layout(text);lv_obj_remove_flag(s_pet_label,LV_OBJ_FLAG_HIDDEN);}
        else render_pet_caption();
    }
    pet_visibility();bsp_lvgl_unlock();return ok;
}
bool ib_ui_pet_assistant_state(const char *name,ib_ui_assistant_phase_t phase,bool cloud_target,const char *error_code)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_pet_set_state_name(name,lv_tick_get());
    if(ok){
        const char *label=phase==IB_UI_ASSIST_COUNT?ib_ui_pet_label(name,cloud_target):ib_ui_assistant_label(phase,cloud_target,error_code);
        s_pet_status=label;s_activity_phase=phase==IB_UI_ASSIST_COUNT?canonical_phase(name):phase;
        s_activity_error=phase==IB_UI_ASSIST_ERROR||(phase==IB_UI_ASSIST_COUNT&&!strcmp(name,"alerting"));
        s_caption_blocks_transcript=phase==IB_UI_ASSIST_ERROR||phase==IB_UI_ASSIST_STOPPED||
            (phase==IB_UI_ASSIST_COUNT&&(!strcmp(name,"alerting")||!strcmp(name,"powering-down")));
        if(s_caption_blocks_transcript){ib_transcript_view_clear(&s_transcript,0);ib_reply_view_clear(&s_reply,0);}
        else if(phase==IB_UI_ASSIST_LISTENING)ib_reply_view_clear(&s_reply,0);
        render_pet_caption();
    }
    pet_visibility();bsp_lvgl_unlock();return ok;
}
void ib_ui_pet_assistant_status(ib_ui_assistant_phase_t phase,bool cloud_target,const char *error_code)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    /* 文案为只读常量，无逐帧分配；保留原协议/日志机器码供排查。 */
    s_pet_status=ib_ui_assistant_label(phase,cloud_target,error_code);s_activity_phase=phase;s_activity_error=phase==IB_UI_ASSIST_ERROR;
    s_caption_blocks_transcript=phase==IB_UI_ASSIST_ERROR||phase==IB_UI_ASSIST_STOPPED;
    if(s_caption_blocks_transcript){ib_transcript_view_clear(&s_transcript,0);ib_reply_view_clear(&s_reply,0);}
    else if(phase==IB_UI_ASSIST_LISTENING)ib_reply_view_clear(&s_reply,0);
    render_pet_caption();pet_visibility();
    bsp_lvgl_unlock();
}
void ib_ui_pet_config(bool enabled,uint8_t fps,uint8_t brightness,uint32_t rgb)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return;
    ib_pet_configure(enabled,fps,brightness);ib_pet_set_color(rgb);pet_visibility();lv_obj_invalidate(s_pet_root);bsp_lvgl_unlock();
}

bool ib_ui_pet_load(const void *data,size_t size)
{
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return false;
    bool ok=ib_pet_load_bundle(data,size);
    if(ok){pet_visibility();lv_obj_invalidate(s_pet_root);}
    bsp_lvgl_unlock();return ok;
}

uint32_t ib_ui_pet_max_frame_ms(void){return s_pet_frame_max_ms;}

uint32_t ib_ui_pet_last_frame_ms(void){return s_pet_frame_last_ms;}
uint32_t ib_ui_lvgl_peak_bytes(void){
    if(!s_ready||!bsp_lvgl_lock(LOCK_TIMEOUT_MS))return 0;
    lv_mem_monitor_t memory;lv_mem_monitor(&memory);bsp_lvgl_unlock();return memory.max_used;
}
