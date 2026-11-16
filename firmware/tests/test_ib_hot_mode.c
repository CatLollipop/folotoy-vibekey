#include "test_common.h"
#include "ib_hot_mode.h"
typedef struct {bool mode,audio,worker,saved;unsigned call,fail_at,second_fail,commits;} fixture_t;
static bool failed(fixture_t *s){s->call++;return s->call==s->fail_at||s->call==s->second_fail;}
static bool audio(bool on,void *ctx){fixture_t *s=ctx;if(failed(s))return false;s->audio=on;return true;}
static bool worker(bool on,void *ctx){fixture_t *s=ctx;if(failed(s))return false;s->worker=on;return true;}
static bool lan(void *ctx){return !failed(ctx);}
static bool save(bool on,void *ctx){fixture_t *s=ctx;if(failed(s))return false;s->saved=on;return true;}
static void publish(bool on,void *ctx){fixture_t *s=ctx;s->mode=on;s->commits++;CHECK(s->saved==on);CHECK(s->worker==on);CHECK(s->audio!=on);}
int main(void){
    ib_hot_mode_activity_t activity={.presentation_owned=true,.presentation_active=true};
    CHECK(!ib_hot_mode_busy(&activity)); //Codex后台working/replying不占用设备mic，允许进入AI。
    activity.cloud_target=true;CHECK(ib_hot_mode_busy(&activity));activity.cloud_target=false;
    activity.transcribing=true;CHECK(ib_hot_mode_busy(&activity));activity.transcribing=false;
    activity.mic_active=true;CHECK(ib_hot_mode_busy(&activity));activity.mic_active=false;
    activity.ptt_pending=true;CHECK(ib_hot_mode_busy(&activity));activity.ptt_pending=false;
    activity.worker=true;CHECK(ib_hot_mode_busy(&activity));activity.worker=false;
    activity.switching=true;CHECK(ib_hot_mode_busy(&activity));
    for(unsigned current=0;current<2;current++){
        fixture_t s={.mode=current,.audio=!current,.worker=current,.saved=current};ib_hot_mode_ops_t ops={audio,worker,lan,save,publish,&s};
        CHECK(ib_hot_mode_apply(current,current,&ops)==NULL);CHECK(s.call==0&&s.commits==0);
        CHECK(ib_hot_mode_apply(current,!current,&ops)==NULL);CHECK(s.mode!=current&&s.commits==1);
        for(unsigned fail=1;fail<=4;fail++){
            s=(fixture_t){.mode=current,.audio=!current,.worker=current,.saved=current,.fail_at=fail};
            CHECK(ib_hot_mode_apply(current,!current,&ops)!=NULL);CHECK(s.mode==current&&s.saved==current&&s.worker==current&&s.audio!=current&&s.commits==0);
        }
        s=(fixture_t){.mode=current,.audio=!current,.worker=current,.saved=current,.fail_at=1,.second_fail=2};CHECK_STR(ib_hot_mode_apply(current,!current,&ops),"recovery_failed");CHECK(s.mode==current&&s.commits==0);
    }
    TEST_DONE("hot_mode");
}
