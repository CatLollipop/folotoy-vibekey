#include "ib_conversation.h"
#include "cJSON.h"
#include <stdio.h>
#include <string.h>
static bool number(const cJSON *o,const char *key,uint32_t *out){const cJSON *v=cJSON_GetObjectItemCaseSensitive(o,key);if(!cJSON_IsNumber(v)||v->valuedouble<0||v->valuedouble>4294967295.0||v->valuedouble!=(uint32_t)v->valuedouble)return false;*out=(uint32_t)v->valuedouble;return true;}
static const char *string(const cJSON *o,const char *key){const cJSON *v=cJSON_GetObjectItemCaseSensitive(o,key);return cJSON_IsString(v)?v->valuestring:NULL;}
static bool token(const char *s){if(!s||strlen(s)!=32)return false;for(unsigned i=0;i<32;i++)if(!((s[i]>='0'&&s[i]<='9')||(s[i]>='a'&&s[i]<='f')))return false;return true;}
static bool utf8(const char *s,size_t max){
    if(!s||strlen(s)>max)return false;
    const unsigned char *p=(const unsigned char *)s;
    while(*p){unsigned n=*p<0x80?1:*p>=0xc2&&*p<=0xdf?2:*p>=0xe0&&*p<=0xef?3:*p>=0xf0&&*p<=0xf4?4:0;
        if(!n||(*p<32&&*p!='\n'&&*p!='\t'))return false;
        for(unsigned i=1;i<n;i++)if(!p[i]||(p[i]&0xc0)!=0x80)return false;
        if(n==3&&((p[0]==0xe0&&p[1]<0xa0)||(p[0]==0xed&&p[1]>=0xa0)))return false;
        if(n==4&&((p[0]==0xf0&&p[1]<0x90)||(p[0]==0xf4&&p[1]>=0x90)))return false;
        p+=n;
    }return true;
}
static bool code(const char *s){if(!s||strlen(s)>32)return false;for(;*s;s++)if(!((*s>='a'&&*s<='z')||(*s>='0'&&*s<='9')||*s=='_'))return false;return true;}
void ib_conversation_reset(ib_conversation_t *s){uint32_t revision=s->revision+1;memset(s,0,sizeof(*s));s->revision=revision;s->focus=IB_CONV_DRAFT;s->agent.page=s->agent.pages=s->draft.page=s->draft.pages=1;}
bool ib_conversation_can_record(const ib_conversation_t *s){return s->bound&&s->writable&&!s->pending_gid&&s->phase!=IB_CONV_UNKNOWN&&s->phase!=IB_CONV_RECORDING&&s->phase!=IB_CONV_TRANSCRIBING&&s->phase!=IB_CONV_SENDING;}
bool ib_conversation_can_confirm(const ib_conversation_t *s){return s->bound&&s->writable&&!s->pending_gid&&s->phase==IB_CONV_READY&&s->drev&&s->draft.text[0]&&s->consumed_drev!=s->drev;}
bool ib_conversation_input_owner(const ib_conversation_t *s,bool standalone,bool online,bool menu){return s->bound&&!standalone&&online&&!menu;}
bool ib_conversation_accept_mic(const ib_conversation_t *s,bool recording){return !s->bound||recording;}
void ib_conversation_feedback(ib_conversation_t *s,const char *error,int64_t now){snprintf(s->error,sizeof(s->error),"%s",code(error)?error:"unavailable");s->feedback_until=now+2500;s->revision++;}
const char *ib_conversation_mark_action(ib_conversation_t *s,uint32_t gid,bool jump){
    if(!gid||s->pending_gid)return "busy";
    if(!jump&&!ib_conversation_can_confirm(s))return "unavailable";
    s->pending_gid=gid;s->pending_jump=jump;if(!jump)s->consumed_drev=s->drev;s->revision++;return NULL;
}
void ib_conversation_note_event(ib_conversation_t *s,uint32_t gid,bool recording){if(gid){s->last_action_gid=gid;if(recording)s->record_gid=gid;}}
bool ib_conversation_handle(ib_conversation_t *current,const char *line,size_t length,char *response,size_t capacity,int64_t now,ib_conversation_apply_fn apply,void *context){
    if(!line||!strstr(line,"\"conversation\""))return false;
    cJSON *o=cJSON_ParseWithLength(line,length);if(!o)return false;
    const char *cmd=string(o,"cmd");if(!cmd||strcmp(cmd,"conversation")){cJSON_Delete(o);return false;}
    ib_conversation_t next=*current,*s=&next;
    const char *op=string(o,"op"),*sid=string(o,"sid");uint32_t rid=0,rev=0;number(o,"rid",&rid);number(o,"rev",&rev);
    const char *error=NULL;bool cap=op&&!strcmp(op,"cap");
    if(!op||!rid)error="invalid_request";
    else if(cap){}
    else if(!strcmp(op,"clear")){
        if((sid||cJSON_GetObjectItemCaseSensitive(o,"rev"))&&(!sid||!s->bound||strcmp(sid,s->sid)||rev!=s->rev))error="stale";
        else ib_conversation_reset(s);
    }else if(!strcmp(op,"bind")){
        const char *title=string(o,"title"),*view=string(o,"view");uint32_t writable=0;
        if(!token(sid)||!rev||!utf8(title,32)||!view||(strcmp(view,"dialogue")&&strcmp(view,"pet"))||!number(o,"writable",&writable)||writable>1)error="invalid_binding";
        else{
            if(!s->bound||strcmp(s->sid,sid)||s->rev!=rev){uint32_t jump=s->pending_jump?s->pending_gid:0,last=s->last_result_gid,action=s->last_action_gid;ib_conversation_reset(s);s->pending_gid=jump;s->pending_jump=jump!=0;s->last_result_gid=last;s->last_action_gid=action;}
            s->bound=true;strcpy(s->sid,sid);strcpy(s->title,title);s->rev=rev;s->writable=writable;s->view=!strcmp(view,"pet")?IB_CONV_PET:IB_CONV_DIALOGUE;
            s->revision++;
        }
    }else if(!strcmp(op,"result")){
        uint32_t gid=0;const char *status=string(o,"status");
        if(!number(o,"gid",&gid)||!gid||!status||(strcmp(status,"ok")&&strcmp(status,"unavailable")&&strcmp(status,"stale")&&strcmp(status,"unknown")))error="invalid_result";
        else if(gid==s->last_result_gid){}
        else if(gid!=s->pending_gid&&gid!=s->last_action_gid&&gid!=s->record_gid)error="stale";
        else{
            s->last_result_gid=gid;if(gid==s->pending_gid){s->pending_gid=0;s->pending_jump=false;}
            if(gid==s->record_gid){s->record_gid=0;if(strcmp(status,"ok"))s->phase=IB_CONV_ERROR;}
            if(strcmp(status,"ok"))ib_conversation_feedback(s,status,now);
            if(!strcmp(status,"unknown"))s->phase=IB_CONV_UNKNOWN;
            s->revision++;
        }
    }else if(!s->bound||!token(sid)||strcmp(sid,s->sid)||rev!=s->rev)error="stale";
    else if(!strcmp(op,"state")){
        static const char *const phases[]={"idle","recording","transcribing","draft","sending","working","waiting","done","error","unknown"};
        const char *phase=string(o,"phase"),*focus=string(o,"focus"),*detail=string(o,"error");uint32_t drev=0,writable=0;int selected=-1;
        if(phase)for(unsigned i=0;i<10;i++)if(!strcmp(phase,phases[i]))selected=(int)i;
        if(selected<0||!number(o,"drev",&drev)||!number(o,"writable",&writable)||writable>1||(focus&&strcmp(focus,"agent")&&strcmp(focus,"draft"))||(detail&&!code(detail)))error="invalid_state";
        else{
            if(drev!=s->drev){s->draft.text[0]=0;s->draft.page=s->draft.pages=1;}
            s->drev=drev;s->phase=(ib_conversation_phase_t)selected;s->writable=writable;
            if(focus)s->focus=!strcmp(focus,"agent")?IB_CONV_AGENT:IB_CONV_DRAFT;
            snprintf(s->error,sizeof(s->error),"%s",detail?detail:"");s->feedback_until=0;s->revision++;
        }
    }else if(!strcmp(op,"pane")){
        const char *role=string(o,"role"),*text=string(o,"text");uint32_t page=0,pages=0;
        if(!role||(strcmp(role,"agent")&&strcmp(role,"draft"))||!utf8(text,128)||!number(o,"page",&page)||!number(o,"pages",&pages)||!page||!pages||pages>65535||page>pages)error="invalid_pane";
        else{ib_conversation_pane_t *p=!strcmp(role,"agent")?&s->agent:&s->draft;strcpy(p->text,text);p->page=page;p->pages=pages;s->revision++;}
    }else if(!strcmp(op,"view")){
        const char *view=string(o,"view");if(!view||(strcmp(view,"dialogue")&&strcmp(view,"pet")))error="invalid_view";
        else{s->view=!strcmp(view,"pet")?IB_CONV_PET:IB_CONV_DIALOGUE;s->revision++;}
    }else error="unknown_operation";
    if(!error&&s->revision!=current->revision){if(apply)error=apply(s,context);if(!error)*current=*s;}
    const char *safe=op&&(!strcmp(op,"cap")||!strcmp(op,"clear")||!strcmp(op,"bind")||!strcmp(op,"state")||!strcmp(op,"pane")||!strcmp(op,"view")||!strcmp(op,"result"))?op:"invalid";
    if(cap&&!error)snprintf(response,capacity,"{\"t\":\"conversation\",\"op\":\"cap\",\"rid\":%lu,\"ok\":1,\"schema\":1,\"split\":1}\n",(unsigned long)rid);
    else snprintf(response,capacity,"{\"t\":\"conversation\",\"op\":\"%s\",\"rid\":%lu,\"ok\":%d,\"sid\":\"%s\",\"rev\":%lu,\"error\":\"%s\"}\n",safe,(unsigned long)rid,error?0:1,token(sid)?sid:"",(unsigned long)rev,error?error:"");
    cJSON_Delete(o);return true;
}
size_t ib_conversation_event(char *out,size_t capacity,const char *action,const ib_conversation_t *s,uint32_t gid,uint32_t boot,const char *nid,uint32_t nrev){
    if(!gid||!action)return 0;
    bool jump=!strcmp(action,"jump");
    if(jump){if(!token(nid)||!nrev)return 0;}
    else if(!s->bound||(strcmp(action,"record_start")&&strcmp(action,"record_stop")&&strcmp(action,"confirm")&&strcmp(action,"page_prev")&&strcmp(action,"page_next")&&strcmp(action,"focus")&&strcmp(action,"view")))return 0;
    int n=jump?snprintf(out,capacity,"{\"t\":\"conversation\",\"op\":\"event\",\"action\":\"jump\",\"gid\":%lu,\"boot\":\"%08lx\",\"nid\":\"%s\",\"nrev\":%lu}\n",(unsigned long)gid,(unsigned long)boot,nid,(unsigned long)nrev):
        snprintf(out,capacity,"{\"t\":\"conversation\",\"op\":\"event\",\"action\":\"%s\",\"sid\":\"%s\",\"rev\":%lu,\"drev\":%lu,\"gid\":%lu,\"boot\":\"%08lx\"}\n",action,s->sid,(unsigned long)s->rev,(unsigned long)s->drev,(unsigned long)gid,(unsigned long)boot);
    return n>0&&(size_t)n<capacity?(size_t)n:0;
}
