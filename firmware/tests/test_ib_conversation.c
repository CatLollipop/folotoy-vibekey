#include "ib_conversation.h"
#include "cJSON.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
static ib_conversation_t s;
static bool reject_apply;
static const char *apply(const ib_conversation_t *view,void *ctx){(void)view;(void)ctx;return reject_apply?"display_busy":NULL;}
static void request(const char *line,bool ok){
    char response[512];assert(ib_conversation_handle(&s,line,strlen(line),response,sizeof(response),100,apply,NULL));
    cJSON *o=cJSON_Parse(response);assert(o);assert(cJSON_GetObjectItemCaseSensitive(o,"ok")->valueint==ok);assert(strlen(response)<=511);cJSON_Delete(o);
}
#define SID "0123456789abcdef0123456789abcdef"
#define OTHER "fedcba9876543210fedcba9876543210"
#define BIND "{\"cmd\":\"conversation\",\"op\":\"bind\",\"rid\":2,\"sid\":\"" SID "\",\"rev\":7,\"title\":\"原会话\",\"writable\":1,\"view\":\"dialogue\"}"
int main(void){
    ib_conversation_reset(&s);char response[256];
    assert(!ib_conversation_handle(&s,"{\"cmd\":\"state\"}",15,response,sizeof(response),1,NULL,NULL));
    request("{\"cmd\":\"conversation\",\"op\":\"cap\",\"rid\":1}",true);
    request(BIND,true);assert(s.bound&&s.rev==7&&s.focus==IB_CONV_DRAFT&&ib_conversation_can_record(&s));
    request("{\"cmd\":\"conversation\",\"op\":\"state\",\"rid\":3,\"sid\":\"" OTHER "\",\"rev\":7,\"phase\":\"draft\",\"drev\":1,\"writable\":1}",false);
    assert(s.phase==IB_CONV_IDLE);
    request("{\"cmd\":\"conversation\",\"op\":\"state\",\"rid\":4,\"sid\":\"" SID "\",\"rev\":7,\"phase\":\"draft\",\"drev\":9,\"writable\":1,\"focus\":\"draft\"}",true);
    request("{\"cmd\":\"conversation\",\"op\":\"pane\",\"rid\":5,\"sid\":\"" SID "\",\"rev\":7,\"role\":\"draft\",\"page\":1,\"pages\":2,\"text\":\"只保留草稿，不自动发送。\"}",true);
    assert(ib_conversation_can_confirm(&s));
    assert(!ib_conversation_mark_action(&s,8,false));assert(!ib_conversation_can_confirm(&s));
    request(BIND,true);assert(s.pending_gid==8); //同binding重传不解锁确认
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":6,\"gid\":7,\"status\":\"ok\"}",false);
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":7,\"gid\":8,\"status\":\"unknown\"}",true);
    assert(!ib_conversation_can_confirm(&s)&&!strcmp(s.error,"unknown"));
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":7,\"gid\":8,\"status\":\"unknown\"}",true);
    uint32_t before=s.revision;reject_apply=true;
    request("{\"cmd\":\"conversation\",\"op\":\"view\",\"rid\":8,\"sid\":\"" SID "\",\"rev\":7,\"view\":\"pet\"}",false);
    assert(s.revision==before&&s.view==IB_CONV_DIALOGUE);reject_apply=false;
    request("{\"cmd\":\"conversation\",\"op\":\"pane\",\"rid\":9,\"sid\":\"" SID "\",\"rev\":7,\"role\":\"draft\",\"page\":0,\"pages\":2,\"text\":\"x\"}",false);
    request("{\"cmd\":\"conversation\",\"op\":\"state\",\"rid\":9,\"sid\":\"" SID "\",\"rev\":7,\"phase\":\"draft\",\"drev\":1.5,\"writable\":1}",false);
    request("{\"cmd\":\"conversation\",\"op\":\"clear\",\"rid\":10,\"sid\":\"" OTHER "\",\"rev\":7}",false);
    assert(s.bound);
    assert(ib_conversation_event(response,sizeof(response),"confirm",&s,25,0x12345678,NULL,0)>0);
    cJSON *event=cJSON_Parse(response);assert(event);assert(!strcmp(cJSON_GetObjectItem(event,"sid")->valuestring,SID));assert(cJSON_GetObjectItem(event,"drev")->valueint==9);cJSON_Delete(event);
    assert(ib_conversation_event(response,sizeof(response),"jump",&s,26,0x12345678,OTHER,3)>0);
    assert(strstr(response,"\"nrev\":3")&&!strstr(response,"\"sid\""));
    request("{\"cmd\":\"conversation\",\"op\":\"clear\",\"rid\":11}",true);assert(!s.bound&&!ib_conversation_can_record(&s));
    assert(!ib_conversation_mark_action(&s,30,true));
    request(BIND,true);assert(s.pending_gid==30&&s.pending_jump); //bind只验证/缓存，仍等动作结果
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":12,\"gid\":30,\"status\":\"unavailable\"}",true);
    assert(s.pending_gid==0&&!strcmp(s.error,"unavailable"));
    ib_conversation_note_event(&s,41,true);ib_conversation_note_event(&s,42,false);
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":13,\"gid\":41,\"status\":\"unavailable\"}",true);
    assert(!strcmp(s.error,"unavailable")&&!s.record_gid);
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":14,\"gid\":99,\"status\":\"stale\"}",false);
    request("{\"cmd\":\"conversation\",\"op\":\"result\",\"rid\":15,\"gid\":42,\"status\":\"unknown\"}",true);
    assert(s.phase==IB_CONV_UNKNOWN&&!ib_conversation_can_record(&s)&&!ib_conversation_can_confirm(&s));
    request("{\"cmd\":\"conversation\",\"op\":\"state\",\"rid\":16,\"sid\":\"" SID "\",\"rev\":7,\"phase\":\"idle\",\"drev\":10,\"writable\":1}",true);
    request("{\"cmd\":\"conversation\",\"op\":\"view\",\"rid\":17,\"sid\":\"" SID "\",\"rev\":7,\"view\":\"pet\"}",true);
    assert(s.view==IB_CONV_PET&&ib_conversation_input_owner(&s,false,true,false)&&ib_conversation_can_record(&s));
    assert(!ib_conversation_accept_mic(&s,false)&&ib_conversation_accept_mic(&s,true));
    assert(!ib_conversation_input_owner(&s,true,true,false)&&!ib_conversation_input_owner(&s,false,false,false)&&!ib_conversation_input_owner(&s,false,true,true));
    s.writable=false;assert(ib_conversation_input_owner(&s,false,true,false)&&!ib_conversation_can_record(&s));
    printf("Conversation production wire: binding/typed bounds/atomic UI rejection, once-per-draft, jump/result identity, event envelope passed; model=%zuB.\n",sizeof(s));
}
