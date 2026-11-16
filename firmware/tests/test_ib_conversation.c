#include "ib_conversation.h"
#include "ib_dialogue_keys.h"
#include "cJSON.h"
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define SID "0123456789abcdef0123456789abcdef"
#define OTHER "fedcba9876543210fedcba9876543210"
static ib_conversation_t s;
static bool reject_apply;static unsigned applied,rid;
static const char *apply(const ib_conversation_t *view,void *ctx){(void)view;(void)ctx;applied++;return reject_apply?"display_busy":NULL;}
static cJSON *request(cJSON *o,bool ok){
    cJSON_AddStringToObject(o,"cmd","conversation");cJSON_AddNumberToObject(o,"rid",++rid);
    char *line=cJSON_PrintUnformatted(o),response[256];assert(line&&strlen(line)<=511);
    assert(ib_conversation_handle(&s,line,strlen(line),response,sizeof(response),100,apply,NULL));
    cJSON *ack=cJSON_Parse(response);assert(ack);if(cJSON_GetObjectItem(ack,"ok")->valueint!=ok){fprintf(stderr,"Unexpected ACK %s for %s\n",response,line);abort();}
    assert(strlen(response)<=511);free(line);cJSON_Delete(o);return ack;
}
static cJSON *op(const char *name){cJSON *o=cJSON_CreateObject();cJSON_AddStringToObject(o,"op",name);return o;}
static cJSON *bound(const char *name){cJSON *o=op(name);cJSON_AddStringToObject(o,"sid",SID);cJSON_AddNumberToObject(o,"rev",7);return o;}
static void send(cJSON *o,bool ok){cJSON_Delete(request(o,ok));}
static void bind(void){cJSON *o=bound("bind");cJSON_AddStringToObject(o,"title","原会话");cJSON_AddNumberToObject(o,"writable",1);cJSON_AddStringToObject(o,"view","dialogue");send(o,true);}
static void state(const char *phase,unsigned drev){cJSON *o=bound("state");cJSON_AddStringToObject(o,"phase",phase);cJSON_AddNumberToObject(o,"drev",drev);cJSON_AddNumberToObject(o,"writable",1);send(o,true);}
static cJSON *window(const char *name,unsigned wid){cJSON *o=bound(name);cJSON_AddNumberToObject(o,"wid",wid);return o;}
static void begin(unsigned wid,unsigned n,unsigned drev,bool following){cJSON *o=window("window_begin",wid);cJSON_AddNumberToObject(o,"n",n);cJSON_AddNumberToObject(o,"page",following?3:1);cJSON_AddNumberToObject(o,"pages",3);cJSON_AddNumberToObject(o,"unread",following?0:2);cJSON_AddNumberToObject(o,"following",following);cJSON_AddNumberToObject(o,"older",0);cJSON_AddNumberToObject(o,"drev",drev);send(o,true);}
static cJSON *item(unsigned wid,unsigned index,const char *mid,const char *role,const char *delivery,const char *text){cJSON *o=window("window_item",wid);cJSON_AddNumberToObject(o,"index",index);cJSON_AddStringToObject(o,"mid",mid);cJSON_AddStringToObject(o,"role",role);cJSON_AddStringToObject(o,"delivery",delivery);cJSON_AddNumberToObject(o,"head",1);cJSON_AddNumberToObject(o,"tail",1);cJSON_AddNumberToObject(o,"trunc",0);cJSON_AddStringToObject(o,"text",text);return o;}
static void result(unsigned gid,const char *status,bool ok){cJSON *o=op("result");cJSON_AddNumberToObject(o,"gid",gid);cJSON_AddStringToObject(o,"status",status);send(o,ok);}
/* 使用生产view ACK与生产gesture验证PET截尾风险；无需真实录音/发送或UI猜文案。 */
static ib_dialogue_key_context_t context(void){return (ib_dialogue_key_context_t){.dialogue=true,.online=true,.can_record=ib_conversation_can_record(&s),.can_confirm=ib_conversation_can_confirm(&s),.can_latest=ib_conversation_can_latest(&s)};}
static void set_view(const char *view){cJSON *o=bound("view");cJSON_AddStringToObject(o,"view",view);send(o,true);}
static void pet_confirmation_guard(void){
    assert(ib_conversation_can_confirm(&s));uint32_t consumed=s.consumed_drev;
    set_view("pet");assert(!ib_conversation_can_confirm(&s)&&ib_conversation_can_latest(&s)&&ib_conversation_can_record(&s));
    assert(!strcmp(ib_conversation_mark_action(&s,500,false),"unavailable")&&!s.pending_gid&&s.consumed_drev==consumed);
    ib_dialogue_keys_t keys={0};
    ib_dialogue_keys_event(&keys,IB_KEY_EV_DOWN,100,context());
    assert(ib_dialogue_keys_event(&keys,IB_KEY_EV_UP,150,context()).action==IB_DIALOGUE_KEY_LATEST);
    assert(ib_dialogue_keys_event(&keys,IB_KEY_EV_UP,151,context()).action==IB_DIALOGUE_KEY_NONE);
    // PET仍在等Mac时重复独立短按也仅latest，不能消费草稿或生成pending发送。
    ib_dialogue_keys_event(&keys,IB_KEY_EV_DOWN,300,context());
    assert(ib_dialogue_keys_event(&keys,IB_KEY_EV_UP,350,context()).action==IB_DIALOGUE_KEY_LATEST);
    assert(s.consumed_drev==consumed&&!s.pending_gid);
    // 长持维持原一次start/stop语义，绝不附带latest或confirm。
    ib_dialogue_keys_event(&keys,IB_KEY_EV_DOWN,500,context());
    ib_dialogue_key_result_t start=ib_dialogue_keys_tick(&keys,680,context());assert(start.action==IB_DIALOGUE_KEY_RECORD_START);
    ib_dialogue_key_result_t stop=ib_dialogue_keys_event(&keys,IB_KEY_EV_UP,750,context());assert(stop.action==IB_DIALOGUE_KEY_RECORD_STOP&&stop.gesture==start.gesture);
    // 在PET按下后迟到的Mac dialogue ACK不能把本次松开重新解释成confirm。
    ib_dialogue_keys_event(&keys,IB_KEY_EV_DOWN,900,context());set_view("dialogue");
    assert(ib_conversation_can_confirm(&s)&&!ib_conversation_can_latest(&s));
    assert(ib_dialogue_keys_event(&keys,IB_KEY_EV_UP,950,context()).action==IB_DIALOGUE_KEY_LATEST);
    assert(s.consumed_drev==consumed&&!s.pending_gid);
    // 只有新的独立短按可确认；此前所有PET动作均未触发发送。
    ib_dialogue_keys_event(&keys,IB_KEY_EV_DOWN,1100,context());
    assert(ib_dialogue_keys_event(&keys,IB_KEY_EV_UP,1150,context()).action==IB_DIALOGUE_KEY_CONFIRM);
}
int main(void){
    ib_conversation_reset(&s);char packet[256];cJSON *ack=request(op("cap"),true);assert(cJSON_GetObjectItem(ack,"schema")->valueint==2&&cJSON_GetObjectItem(ack,"chat")->valueint==1&&!cJSON_GetObjectItem(ack,"split"));cJSON_Delete(ack);
    bind();assert(s.bound&&!ib_conversation_can_record(&s));assert(!ib_conversation_event(packet,sizeof(packet),"record_start",&s,1,1,NULL,0));
    state("draft",9);unsigned old_applied=applied;begin(1,2,9,true);send(item(1,0,"0000000000000001","assistant","none","只观察本次新消息。"),true);
    assert(applied==old_applied&&!s.window.wid&&!ib_conversation_can_confirm(&s));send(window("window_commit",1),false);assert(!s.window.wid);
    send(item(1,1,"0000000000000002","draft","draft","确认前保留草稿。"),true);assert(applied==old_applied);
    reject_apply=true;send(window("window_commit",1),false);assert(!s.window.wid&&s.staging&&s.stage_mask==3);reject_apply=false;
    ack=request(window("window_commit",1),true);assert(!strcmp(cJSON_GetObjectItem(ack,"sid")->valuestring,SID)&&cJSON_GetObjectItem(ack,"rev")->valueint==7&&cJSON_GetObjectItem(ack,"wid")->valueint==1);cJSON_Delete(ack);
    assert(s.window.n==2&&ib_conversation_can_confirm(&s)&&ib_conversation_can_record(&s));pet_confirmation_guard();unsigned committed=applied;send(window("window_commit",1),true);assert(applied==committed);
    assert(!ib_conversation_mark_action(&s,8,false)&&!ib_conversation_can_confirm(&s));bind();assert(s.pending_gid==8);result(7,"ok",false);result(8,"unknown",true);assert(s.phase==IB_CONV_UNKNOWN&&!ib_conversation_can_record(&s));result(8,"unknown",true);
    state("draft",9);assert(!ib_conversation_can_confirm(&s));state("draft",10);assert(!ib_conversation_can_confirm(&s)); // 新state不能把旧屏草稿改成新版本
    begin(2,1,10,false);send(item(2,0,"0000000000000003","assistant","none","这是回看的较早屏。"),true);send(window("window_commit",2),true);
    assert(ib_conversation_can_latest(&s)&&!ib_conversation_can_confirm(&s));assert(ib_conversation_event(packet,sizeof(packet),"latest",&s,25,0x12345678,NULL,0)>0&&strstr(packet,"\"wid\":2"));
    begin(3,1,10,true);send(item(3,0,"0000000000000004","draft","draft","新版本可确认。"),true);send(window("window_commit",3),true);assert(ib_conversation_can_confirm(&s));
    s.window.item[0].tail=false;assert(!ib_conversation_can_confirm(&s));s.window.item[0].tail=true; // 长草稿必须显示真实末片
    // 替换暂存不触碰active；迟到片段、冲突重复、错误身份均拒绝。
    begin(4,1,10,true);send(item(4,0,"0000000000000005","assistant","none","未发布。"),true);
    send(item(4,0,"0000000000000005","assistant","none","不同重传。"),false);assert(s.window.wid==3);
    begin(5,0,10,true);send(window("window_commit",4),false);send(item(4,0,"0000000000000005","assistant","none","迟到。"),false);assert(s.window.wid==3);
    cJSON *bad=window("window_commit",5);cJSON_ReplaceItemInObject(bad,"sid",cJSON_CreateString(OTHER));send(bad,false);assert(s.window.wid==3);send(window("window_commit",5),true);assert(!s.window.n&&!ib_conversation_can_confirm(&s));
    // 顺序校验：草稿后不能跟新的assistant；所有片段收齐也不能发布。
    begin(6,2,10,true);send(item(6,0,"0000000000000001","draft","draft","稿。"),true);send(item(6,1,"0000000000000002","assistant","none","后。"),true);send(window("window_commit",6),false);assert(s.window.wid==5);
    begin(7,1,10,true);bad=item(7,0,"0000000000000001","assistant","none","bad");cJSON_ReplaceItemInObject(bad,"head",cJSON_CreateBool(true));send(bad,false);
    bad=item(7,0,"0000000000000001","draft","none","bad");send(bad,false);
    bad=item(7,0,"0000000000000001","assistant","none","bad");cJSON_ReplaceItemInObject(bad,"index",cJSON_CreateNumber(1.5));send(bad,false);
    bad=item(7,0,"0000000000000001","assistant","none","bad");cJSON_ReplaceItemInObject(bad,"text",cJSON_CreateString("\xc0\xaf"));send(bad,false);
    send(bound("pane"),false); // schema1不会假装已有聊天流
    ib_conversation_note_event(&s,41,true);ib_conversation_note_event(&s,42,false);result(41,"unavailable",true);assert(!s.record_gid);result(99,"stale",false);result(42,"unknown",true);assert(!ib_conversation_can_record(&s));
    state("idle",11);cJSON *v=bound("view");cJSON_AddStringToObject(v,"view","pet");send(v,true);assert(ib_conversation_input_owner(&s,false,true,false)&&ib_conversation_can_record(&s));assert(!ib_conversation_accept_mic(&s,false)&&ib_conversation_accept_mic(&s,true));
    assert(!ib_conversation_input_owner(&s,true,true,false)&&!ib_conversation_input_owner(&s,false,false,false)&&!ib_conversation_input_owner(&s,false,true,true));s.writable=false;assert(!ib_conversation_can_record(&s));
    assert(ib_conversation_event(packet,sizeof(packet),"jump",&s,50,1,OTHER,2)>0&&strstr(packet,"\"nrev\":2")&&!strstr(packet,"\"wid\""));
    send(op("clear"),true);assert(!s.bound&&!s.staging&&!s.window.wid);assert(!ib_conversation_mark_action(&s,51,true));bind();assert(s.pending_gid==51&&s.pending_jump);result(51,"unavailable",true);
    printf("Conversation schema2 production wire: complete atomic stage/commit and UI failure, stale binding/wid, bounded/UTF8/enum/order, visible-draft confirmation, latest-only history, once-per-drev, PET-first-latest/fresh-confirm/hold/late-view-ACK, UNKNOWN/late-mic passed; active+stage model=%zuB, window=%zuB.\n",sizeof(s),sizeof(s.window));
}
