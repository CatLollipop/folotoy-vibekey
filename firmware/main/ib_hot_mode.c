#include "ib_hot_mode.h"
bool ib_hot_mode_busy(const ib_hot_mode_activity_t *s){
    return s->switching||s->worker||s->ptt_pending||s->button_held||s->mic_active||
        (s->presentation_owned&&(s->transcribing||(s->cloud_target&&s->presentation_active)));
}
const char *ib_hot_mode_apply(bool current,bool requested,const ib_hot_mode_ops_t *ops){
    if(current==requested)return 0;
    void *ctx=ops->context;const char *error=0;bool save_failed=false;
    // AI先释放伴随音频任务再建worker；电脑模式先等worker协作退出，再开放伴随麦克风。
    if(requested){
        if(!ops->audio(false,ctx))error="audio_busy";
        else if(!ops->worker(true,ctx))error="out_of_memory";
    }else{
        if(!ops->worker(false,ctx))error="busy";
        else if(!ops->audio(true,ctx))error="audio_busy";
    }
    if(!error&&!ops->lan(ctx))error="network_unavailable";
    if(!error&&!ops->save(requested,ctx)){error="save_failed";save_failed=true;}
    if(error){
        // 实际mode仍为current；失败不能留下音频许可或worker半切换后宣称成功。
        bool worker=ops->worker(current,ctx),audio=ops->audio(!current,ctx),lan=ops->lan(ctx);
        bool saved=!save_failed||ops->save(current,ctx); //save失败后重申原持久模式，覆盖可能的部分提交。
        if(!worker||!audio||!lan||!saved)return "recovery_failed";
        return error;
    }
    ops->publish(requested,ctx);return 0;
}
