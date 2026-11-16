#include "ib_ui_activity.h"
#include "ib_ui_hints.h"
bool ib_activity_animates(ib_ui_assistant_phase_t phase,bool capturing)
{
    return phase==IB_UI_ASSIST_IDLE||phase==IB_UI_ASSIST_PREPARING||phase==IB_UI_ASSIST_TRANSCRIBING||
        phase==IB_UI_ASSIST_THINKING||phase==IB_UI_ASSIST_REPLYING||phase==IB_UI_ASSIST_SPEAKING||
        (phase==IB_UI_ASSIST_LISTENING&&capturing);
}
void ib_activity_draw(const ib_fx_t *f,int x,int y,ib_ui_assistant_phase_t phase,bool capturing,uint32_t now)
{
    lv_color_t ink=IB_C(0xC8C4B8);
    switch(phase){
    case IB_UI_ASSIST_DONE:ib_ui_action_glyph(f,x,y,IB_ICON_CHECK,ink);break;
    case IB_UI_ASSIST_STOPPED:ib_ui_action_glyph(f,x,y,IB_ICON_ESC,ink);break;
    case IB_UI_ASSIST_ERROR:
        ink=IB_C(IB_COLOR_ERR);ib_fx_line(f,x,y-5,x,y+1,1,ink,LV_OPA_COVER);ib_fx_circle(f,x,y+4,1,ink,LV_OPA_COVER);break;
    case IB_UI_ASSIST_LISTENING:
        if(capturing)ink=lv_color_mix(IB_C(0x58E898),IB_C(0x208850),(uint8_t)(ib_breath(now,1400)*255/IB_P_ONE));
        ib_ui_action_glyph(f,x,y,IB_ICON_MIC,ink);break;
    case IB_UI_ASSIST_THINKING:
        for(unsigned i=0;i<3;i++){int a=(int)(now%1800)*2+(int)i*1200;
            ib_fx_circle(f,x+ib_cos10(a)*4/32768,y+ib_sin10(a)*4/32768,1,ink,LV_OPA_COVER);}break;
    case IB_UI_ASSIST_TRANSCRIBING:
        for(int i=0;i<3;i++){lv_color_t c=lv_color_mix(ink,IB_C(0x686858),(uint8_t)(ib_breath(now+(unsigned)i*180,1000)*255/IB_P_ONE));
            ib_fx_circle(f,x+(i-1)*4,y,1,c,LV_OPA_COVER);}break;
    case IB_UI_ASSIST_PREPARING:case IB_UI_ASSIST_REPLYING:case IB_UI_ASSIST_SPEAKING:{
        int angle=(int)(now%1200)*360/1200;ib_fx_arc(f,x,y,5,1,angle,angle+250,ink,LV_OPA_COVER);break;}
    default:{
        lv_color_t c=lv_color_mix(ink,IB_C(0x686858),(uint8_t)(ib_breath(now,1800)*255/IB_P_ONE));
        ib_fx_ring(f,x,y,4,1,c,LV_OPA_COVER);ib_fx_circle(f,x,y,1,c,LV_OPA_COVER);break;}
    }
}
