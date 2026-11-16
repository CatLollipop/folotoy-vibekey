#include "ib_conversation.h"
#include "cJSON.h"
#include <stdio.h>
#include <string.h>
_Static_assert(sizeof(ib_conversation_t)<3072,"聊天active+stage必须小于3KiB");
static bool number(const cJSON *o,const char *key,uint32_t *out){const cJSON *v=cJSON_GetObjectItemCaseSensitive(o,key);if(!cJSON_IsNumber(v)||v->valuedouble<0||v->valuedouble>4294967295.0||v->valuedouble!=(uint32_t)v->valuedouble)return false;*out=(uint32_t)v->valuedouble;return true;}
static const char *string(const cJSON *o,const char *key){const cJSON *v=cJSON_GetObjectItemCaseSensitive(o,key);return cJSON_IsString(v)?v->valuestring:NULL;}
static bool hex(const char *s,unsigned n){if(!s||strlen(s)!=n)return false;for(unsigned i=0;i<n;i++)if(!((s[i]>='0'&&s[i]<='9')||(s[i]>='a'&&s[i]<='f')))return false;return true;}
static bool utf8(const char *s,size_t max){
    if(!s||strlen(s)>max)return false;
    const unsigned char *p=(const unsigned char *)s;
    while(*p){unsigned n=*p<0x80?1:*p>=0xc2&&*p<=0xdf?2:*p>=0xe0&&*p<=0xef?3:*p>=0xf0&&*p<=0xf4?4:0;
        if(!n||(*p<32&&*p!='\n'))return false;
        for(unsigned i=1;i<n;i++)if(!p[i]||(p[i]&0xc0)!=0x80)return false;
        if(n==3&&((p[0]==0xe0&&p[1]<0xa0)||(p[0]==0xed&&p[1]>=0xa0)))return false;
        if(n==4&&((p[0]==0xf0&&p[1]<0x90)||(p[0]==0xf4&&p[1]>=0x90)))return false;
        p+=n;
    }return true;
}
static bool code(const char *s){if(!s||strlen(s)>32)return false;for(;*s;s++)if(!((*s>='a'&&*s<='z')||(*s>='0'&&*s<='9')||*s=='_'))return false;return true;}
void ib_conversation_reset(ib_conversation_t *s){uint32_t revision=s->revision+1;memset(s,0,sizeof(*s));s->revision=revision;s->window.page=s->window.pages=1;}
bool ib_conversation_can_record(const ib_conversation_t *s){return s->bound&&s->window.wid&&s->writable&&!s->pending_gid&&s->phase!=IB_CONV_UNKNOWN&&s->phase!=IB_CONV_RECORDING&&s->phase!=IB_CONV_TRANSCRIBING&&s->phase!=IB_CONV_SENDING;}
// PET caption可能裁尾，不作为完整确认画面；必须先请求Mac展开dialogue/最新窗。
bool ib_conversation_can_confirm(const ib_conversation_t *s){
    if(!s->bound||s->view!=IB_CONV_DIALOGUE||!s->writable||s->pending_gid||s->phase!=IB_CONV_READY||!s->drev||s->consumed_drev==s->drev||!s->window.wid||!s->window.following||s->window.drev!=s->drev)return false;
    for(unsigned i=0;i<s->window.n;i++)if(s->window.item[i].role==IB_CONV_DRAFT&&s->window.item[i].delivery==IB_CONV_DELIVERY_DRAFT&&s->window.item[i].tail&&s->window.item[i].text[0])return true;
    return false;
}
bool ib_conversation_can_latest(const ib_conversation_t *s){return s->bound&&s->window.wid&&(s->view==IB_CONV_PET||!s->window.following)&&!s->pending_gid;}
bool ib_conversation_input_owner(const ib_conversation_t *s,bool standalone,bool online,bool menu){return s->bound&&!standalone&&online&&!menu;}
bool ib_conversation_accept_mic(const ib_conversation_t *s,bool recording){return !s->bound||recording;}
void ib_conversation_feedback(ib_conversation_t *s,const char *error,int64_t now){snprintf(s->error,sizeof(s->error),"%s",code(error)?error:"unavailable");s->feedback_until=now+2500;s->revision++;}
const char *ib_conversation_mark_action(ib_conversation_t *s,uint32_t gid,bool jump){
    if(!gid||s->pending_gid)return "busy";
    if(!jump&&!ib_conversation_can_confirm(s))return "unavailable";
    s->pending_gid=gid;s->pending_jump=jump;if(!jump)s->consumed_drev=s->drev;s->revision++;return NULL;
}
void ib_conversation_note_event(ib_conversation_t *s,uint32_t gid,bool recording){if(gid){s->last_action_gid=gid;if(recording)s->record_gid=gid;}}
static int choice(const char *s,const char *const *values,unsigned count){if(s)for(unsigned i=0;i<count;i++)if(!strcmp(s,values[i]))return (int)i;return -1;}
/* 同mid续片必须相邻且不换身份；draft只能位于当前有序窗末尾。 */
static bool sequence(const ib_conversation_window_t *w){
    bool draft=false;
    for(unsigned i=0;i<w->n;i++){
        const ib_conversation_item_t *p=&w->item[i];
        if(draft&&p->role!=IB_CONV_DRAFT)return false;
        if(p->role==IB_CONV_DRAFT)draft=true;
        if(i){const ib_conversation_item_t *prev=&w->item[i-1];bool same=!strcmp(prev->mid,p->mid);
            if(same&&(prev->tail||p->head||prev->role!=p->role||prev->delivery!=p->delivery))return false;
            if(!same&&(!prev->tail||!p->head))return false;
        }
        for(unsigned j=0;j+1<i;j++)if(!strcmp(w->item[j].mid,p->mid)&&strcmp(w->item[i-1].mid,p->mid))return false;
    }return true;
}
static const char *window_begin(ib_conversation_t *s,const cJSON *o,uint32_t wid){
    uint32_t n=0,page=0,pages=0,unread=0,following=0,drev=0,older=0;
    if(!wid||!number(o,"n",&n)||n>4||!number(o,"page",&page)||!number(o,"pages",&pages)||!page||!pages||pages>65535||page>pages||!number(o,"unread",&unread)||unread>65535||!number(o,"following",&following)||following>1||!number(o,"drev",&drev)||!number(o,"older",&older)||older>1)return "invalid_window";
    if(wid<s->window.wid||(s->staging&&wid<s->stage.wid))return "stale";
    ib_conversation_window_t w={.wid=wid,.drev=drev,.page=(uint16_t)page,.pages=(uint16_t)pages,.unread=(uint16_t)unread,.n=(uint8_t)n,.following=following!=0,.older=older!=0};
    const ib_conversation_window_t *old=wid==s->window.wid?&s->window:s->staging&&wid==s->stage.wid?&s->stage:NULL;
    if(old){if(old->n!=w.n||old->drev!=w.drev||old->page!=w.page||old->pages!=w.pages||old->unread!=w.unread||old->following!=w.following||old->older!=w.older)return "invalid_window";w=*old;}
    if(!s->staging||s->stage.wid!=wid)s->stage_mask=wid==s->window.wid?(uint8_t)((1u<<n)-1u):0;
    s->stage=w;s->staging=true;return NULL;
}
static const char *window_item(ib_conversation_t *s,const cJSON *o,uint32_t wid){
    static const char *const roles[]={"assistant","user","draft"};
    static const char *const deliveries[]={"none","draft","submitting","queued","accepted","admitted","failed","unknown"};
    uint32_t index=0,head=0,tail=0,trunc=0;const char *mid=string(o,"mid"),*text=string(o,"text");
    int role=choice(string(o,"role"),roles,3),delivery=choice(string(o,"delivery"),deliveries,8);
    if(!s->staging||s->stage.wid!=wid)return "stale";
    if(!number(o,"index",&index)||index>=s->stage.n||!hex(mid,16)||!utf8(text,128)||role<0||delivery<0||!number(o,"head",&head)||head>1||!number(o,"tail",&tail)||tail>1||!number(o,"trunc",&trunc)||trunc>1)return "invalid_item";
    if((role==IB_CONV_ASSISTANT&&delivery!=IB_CONV_DELIVERY_NONE)||(role==IB_CONV_USER&&(delivery==IB_CONV_DELIVERY_NONE||delivery==IB_CONV_DELIVERY_DRAFT))||(role==IB_CONV_DRAFT&&delivery==IB_CONV_DELIVERY_NONE))return "invalid_item";
    ib_conversation_item_t item={.role=(uint8_t)role,.delivery=(uint8_t)delivery,.head=head!=0,.tail=tail!=0,.trunc=trunc!=0};strcpy(item.mid,mid);strcpy(item.text,text);
    if((s->stage_mask&(1u<<index))&&memcmp(&item,&s->stage.item[index],sizeof(item)))return "invalid_item";
    s->stage.item[index]=item;s->stage_mask|=(uint8_t)(1u<<index);return NULL;
}
bool ib_conversation_handle(ib_conversation_t *current,const char *line,size_t length,char *response,size_t capacity,int64_t now,ib_conversation_apply_fn apply,void *context){
    if(!line||!strstr(line,"\"conversation\""))return false;
    cJSON *o=cJSON_ParseWithLength(line,length);if(!o)return false;
    const char *cmd=string(o,"cmd");if(!cmd||strcmp(cmd,"conversation")){cJSON_Delete(o);return false;}
    ib_conversation_t next=*current,*s=&next;
    const char *op=string(o,"op"),*sid=string(o,"sid");uint32_t rid=0,rev=0,wid=0;number(o,"rid",&rid);number(o,"rev",&rev);number(o,"wid",&wid);
    const char *error=NULL;bool cap=op&&!strcmp(op,"cap"),window=op&&!strncmp(op,"window_",7),changed=false;
    if(!op||!rid)error="invalid_request";
    else if(cap){}
    else if(!strcmp(op,"clear")){
        if((sid||cJSON_GetObjectItemCaseSensitive(o,"rev"))&&(!sid||!s->bound||strcmp(sid,s->sid)||rev!=s->rev))error="stale";
        else ib_conversation_reset(s);
    }else if(!strcmp(op,"bind")){
        const char *title=string(o,"title"),*view=string(o,"view");uint32_t writable=0;
        if(!hex(sid,32)||!rev||!utf8(title,32)||!view||(strcmp(view,"dialogue")&&strcmp(view,"pet"))||!number(o,"writable",&writable)||writable>1)error="invalid_binding";
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
    }else if(!s->bound||!hex(sid,32)||strcmp(sid,s->sid)||rev!=s->rev)error="stale";
    else if(!strcmp(op,"state")){
        static const char *const phases[]={"idle","recording","transcribing","draft","sending","working","waiting","done","error","unknown"};
        const char *phase=string(o,"phase"),*detail=string(o,"error");uint32_t drev=0,writable=0;int selected=-1;
        if(phase)for(unsigned i=0;i<10;i++)if(!strcmp(phase,phases[i]))selected=(int)i;
        if(selected<0||!number(o,"drev",&drev)||!number(o,"writable",&writable)||writable>1||(detail&&!code(detail)))error="invalid_state";
        else{
            s->drev=drev;s->phase=(ib_conversation_phase_t)selected;s->writable=writable;
            snprintf(s->error,sizeof(s->error),"%s",detail?detail:"");s->feedback_until=0;s->revision++;
        }
    }else if(!strcmp(op,"window_begin")){error=window_begin(s,o,wid);changed=!error;
    }else if(!strcmp(op,"window_item")){error=window_item(s,o,wid);changed=!error;
    }else if(!strcmp(op,"window_commit")){
        if(wid&&wid==s->window.wid&&!s->staging){} // 丢ACK重试无业务重放。
        else if(!wid||!s->staging||wid!=s->stage.wid)error="stale";
        else if(s->stage_mask!=(uint8_t)((1u<<s->stage.n)-1u))error="incomplete_window";
        else if(!sequence(&s->stage))error="invalid_window";
        else{s->window=s->stage;s->staging=false;s->stage_mask=0;memset(&s->stage,0,sizeof(s->stage));s->revision++;}
    }else if(!strcmp(op,"view")){
        const char *view=string(o,"view");if(!view||(strcmp(view,"dialogue")&&strcmp(view,"pet")))error="invalid_view";
        else{s->view=!strcmp(view,"pet")?IB_CONV_PET:IB_CONV_DIALOGUE;s->revision++;}
    }else if(!strcmp(op,"pane"))error="unsupported";
    else error="unknown_operation";
    if(!error&&s->revision!=current->revision){if(apply)error=apply(s,context);changed=!error;}
    if(!error&&changed)*current=*s;
    const char *safe=op&&(!strcmp(op,"cap")||!strcmp(op,"clear")||!strcmp(op,"bind")||!strcmp(op,"state")||!strcmp(op,"window_begin")||!strcmp(op,"window_item")||!strcmp(op,"window_commit")||!strcmp(op,"view")||!strcmp(op,"result")||!strcmp(op,"pane"))?op:"invalid";
    if(cap&&!error)snprintf(response,capacity,"{\"t\":\"conversation\",\"op\":\"cap\",\"rid\":%lu,\"ok\":1,\"schema\":2,\"chat\":1}\n",(unsigned long)rid);
    else snprintf(response,capacity,"{\"t\":\"conversation\",\"op\":\"%s\",\"rid\":%lu,\"ok\":%d,\"sid\":\"%s\",\"rev\":%lu,\"wid\":%lu,\"error\":\"%s\"}\n",safe,(unsigned long)rid,error?0:1,hex(sid,32)?sid:"",(unsigned long)rev,(unsigned long)(window?wid:0),error?error:"");
    cJSON_Delete(o);return true;
}
size_t ib_conversation_event(char *out,size_t capacity,const char *action,const ib_conversation_t *s,uint32_t gid,uint32_t boot,const char *nid,uint32_t nrev){
    if(!gid||!action)return 0;
    bool jump=!strcmp(action,"jump");
    if(jump){if(!hex(nid,32)||!nrev)return 0;}
    else if(!s->bound||!s->window.wid||(strcmp(action,"record_start")&&strcmp(action,"record_stop")&&strcmp(action,"confirm")&&strcmp(action,"page_prev")&&strcmp(action,"page_next")&&strcmp(action,"focus")&&strcmp(action,"view")&&strcmp(action,"latest")))return 0;
    int n=jump?snprintf(out,capacity,"{\"t\":\"conversation\",\"op\":\"event\",\"action\":\"jump\",\"gid\":%lu,\"boot\":\"%08lx\",\"nid\":\"%s\",\"nrev\":%lu}\n",(unsigned long)gid,(unsigned long)boot,nid,(unsigned long)nrev):
        snprintf(out,capacity,"{\"t\":\"conversation\",\"op\":\"event\",\"action\":\"%s\",\"sid\":\"%s\",\"rev\":%lu,\"drev\":%lu,\"wid\":%lu,\"gid\":%lu,\"boot\":\"%08lx\"}\n",action,s->sid,(unsigned long)s->rev,(unsigned long)s->drev,(unsigned long)s->window.wid,(unsigned long)gid,(unsigned long)boot);
    return n>0&&(size_t)n<capacity?(size_t)n:0;
}
