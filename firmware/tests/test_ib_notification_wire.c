#include "test_common.h"
#include "ib_notification_wire.h"
#include "ib_crc32.h"
static const char *ID="0123456789abcdef0123456789abcdef";
static bool busy_flag,ui_ready=true;static unsigned hides,applies,chimes;
static bool busy(void *ctx){(void)ctx;return busy_flag;}
static bool hide(void *ctx){(void)ctx;hides++;return ui_ready;}
static bool apply(void *ctx){(void)ctx;applies++;ib_notification_snapshot_t v;ib_notification_snapshot(&v);if(!ui_ready)return false;if(v.active){CHECK(v.committed&&!v.staging&&v.offset==v.length);if(ib_notification_presented(v.generation))chimes++;}return true;}
static const ib_notification_wire_ops_t OPS={busy,hide,apply,NULL};
static cJSON *req(const char *op,unsigned rev){cJSON *o=cJSON_CreateObject();cJSON_AddStringToObject(o,"op",op);cJSON_AddNumberToObject(o,"rid",4294967295.0);cJSON_AddStringToObject(o,"nid",ID);cJSON_AddNumberToObject(o,"rev",rev);return o;}
static cJSON *run(cJSON *o,bool control){char wire[511];CHECK(ib_notification_wire_reply(IB_LINK_USB,o,control,&OPS,wire,sizeof(wire)));CHECK(strlen(wire)<511);cJSON_Delete(o);cJSON *r=cJSON_Parse(wire);CHECK(r);CHECK(cJSON_GetObjectItemCaseSensitive(r,"rid")->valuedouble==4294967295.0);CHECK_STR(cJSON_GetObjectItemCaseSensitive(r,"t")->valuestring,"notification");return r;}
static void ok(cJSON *r,unsigned yes,const char *error){CHECK(cJSON_GetObjectItemCaseSensitive(r,"ok")->valueint==(int)yes);if(error)CHECK_STR(cJSON_GetObjectItemCaseSensitive(r,"error")->valuestring,error);cJSON_Delete(r);}
static cJSON *begin(unsigned rev,size_t size,uint32_t crc){cJSON *o=req("begin",rev);cJSON_AddStringToObject(o,"src","Codex");cJSON_AddStringToObject(o,"kind","done");cJSON_AddNumberToObject(o,"size",size);cJSON_AddNumberToObject(o,"crc",crc);cJSON_AddNumberToObject(o,"truncated",0);return o;}
static cJSON *commit(unsigned rev,size_t size,uint32_t crc){cJSON *o=req("commit",rev);cJSON_AddNumberToObject(o,"size",size);cJSON_AddNumberToObject(o,"crc",crc);return o;}
int main(void){
    cJSON *r=run(req("cap",0),true);CHECK(cJSON_GetObjectItemCaseSensitive(r,"max")->valueint==2048);CHECK(cJSON_GetObjectItemCaseSensitive(r,"chunk")->valueint==96);CHECK_STR(cJSON_GetObjectItemCaseSensitive(r,"nid")->valuestring,"");cJSON_Delete(r);
    ok(run(begin(1,0,0),false),0,"busy");busy_flag=true;ok(run(begin(1,0,0),true),0,"busy");ib_notification_snapshot_t v;ib_notification_snapshot(&v);CHECK(!v.active&&v.generation==0);busy_flag=false;
    r=run(begin(1,0,0),true);CHECK(cJSON_GetObjectItemCaseSensitive(r,"crc")->valueint==0);ok(r,1,"");CHECK(applies==0&&chimes==0);
    ui_ready=false;ok(run(commit(1,0,0),true),0,"busy");CHECK(chimes==0);ui_ready=true;
    r=run(commit(1,0,0),true);CHECK(cJSON_GetObjectItemCaseSensitive(r,"duplicate")->valueint==1);ok(r,1,"");CHECK(chimes==1);
    ok(run(commit(1,0,0),true),1,"");CHECK(chimes==1);
    const char *text="完整通知正文";size_t size=strlen(text);uint32_t crc=ib_crc32(text,size);
    ok(run(begin(2,size,crc),true),1,"");CHECK(chimes==1);
    ok(run(commit(2,size,crc),true),0,"invalid_size");CHECK(chimes==1);
    cJSON *chunk=req("chunk",2);cJSON_AddNumberToObject(chunk,"off",0);cJSON_AddStringToObject(chunk,"text",text);r=run(chunk,true);CHECK(cJSON_GetObjectItemCaseSensitive(r,"off")->valueint==(int)size);ok(r,1,"");
    ok(run(commit(2,size,crc+1),true),0,"identity_conflict");CHECK(chimes==1);
    r=run(commit(2,size,crc),true);CHECK(cJSON_GetObjectItemCaseSensitive(r,"crc")->valuedouble==crc);CHECK(cJSON_GetObjectItemCaseSensitive(r,"off")->valueint==(int)size);ok(r,1,"");CHECK(chimes==1); //正文升级不重响。
    unsigned before=hides;ok(run(begin(2,size,crc+1),true),0,"identity_conflict");CHECK(hides==before);
    ok(run(req("clear",1),true),0,"stale_revision");ok(run(req("clear",2),true),1,"");
    ok(run(commit(2,size,crc),true),1,"");ib_notification_snapshot(&v);CHECK(!v.active&&chimes==1); //dismiss后的重传不复活。
    TEST_DONE("notification_wire");
}
