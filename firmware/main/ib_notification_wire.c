#include "ib_notification_wire.h"
#include <stdio.h>
#include <string.h>
static bool wire_uint(const cJSON *o,const char *key,uint32_t *v){const cJSON *x=cJSON_GetObjectItemCaseSensitive(o,key);if(!cJSON_IsNumber(x)||x->valuedouble<0||x->valuedouble>4294967295.0||x->valuedouble!=(uint32_t)x->valuedouble)return false;*v=(uint32_t)x->valuedouble;return true;}
static bool notification_id_valid(const char *id){if(!id||strlen(id)!=32)return false;for(unsigned i=0;i<32;i++)if(!((id[i]>='0'&&id[i]<='9')||(id[i]>='a'&&id[i]<='f')))return false;return true;}
bool ib_notification_wire_reply(ib_link_t link,const cJSON *o,bool control_ready,const ib_notification_wire_ops_t *ops,char *response,size_t capacity){
    if(!response||capacity<384||!ops||!ops->busy)return false;
    uint32_t rid=0,rev=0,size=0,crc=0,offset=0,truncated=0;wire_uint(o,"rid",&rid);wire_uint(o,"rev",&rev);wire_uint(o,"crc",&crc);
    const cJSON *operation=cJSON_GetObjectItemCaseSensitive(o,"op"),*id=cJSON_GetObjectItemCaseSensitive(o,"nid");
    const char *op=cJSON_IsString(operation)?operation->valuestring:"invalid";
    bool cap=!strcmp(op,"cap");const char *nid=cJSON_IsString(id)&&notification_id_valid(id->valuestring)?id->valuestring:"";
    const char *error=control_ready?NULL:"busy";bool duplicate=false;
    if(!error&&cap){
        snprintf(response,capacity,"{\"t\":\"notification\",\"op\":\"cap\",\"rid\":%lu,\"nid\":\"\",\"rev\":0,\"ok\":1,\"off\":0,\"schema\":1,\"max\":2048,\"chunk\":96,\"standalone\":1,\"dedup\":8}\n",(unsigned long)rid);
        return strlen(response)+1<capacity;
    }
    if(!error&&(!nid[0]||!rev))error="invalid_identity";
    if(!error&&!strcmp(op,"begin")){
        const cJSON *source=cJSON_GetObjectItemCaseSensitive(o,"src"),*kind=cJSON_GetObjectItemCaseSensitive(o,"kind"),*cut=cJSON_GetObjectItemCaseSensitive(o,"truncated");
        ib_notification_kind_t type=IB_NOTIFICATION_INPUT;bool replace=false;
        if(!cJSON_IsString(source)||!cJSON_IsString(kind)||!wire_uint(o,"size",&size)||!wire_uint(o,"crc",&crc))error="invalid_notification";
        else if(!strcmp(kind->valuestring,"done"))type=IB_NOTIFICATION_DONE;
        else if(!strcmp(kind->valuestring,"error"))type=IB_NOTIFICATION_ERROR;
        else if(strcmp(kind->valuestring,"input"))error="invalid_notification";
        if(!error&&cut){if(cJSON_IsBool(cut))truncated=cJSON_IsTrue(cut);else if(!wire_uint(o,"truncated",&truncated)||truncated>1)error="invalid_notification";}
        if(!error)error=ib_notification_check_begin(link,nid,rev,source->valuestring,type,size,crc,truncated,ops->busy(ops->context),&replace);
        if(!error&&replace&&ops->hide&&!ops->hide(ops->context))error="busy";
        if(!error)error=ib_notification_begin(link,nid,rev,source->valuestring,type,size,crc,truncated,ops->busy(ops->context));
    }else if(!error&&!strcmp(op,"chunk")){
        const cJSON *text=cJSON_GetObjectItemCaseSensitive(o,"text");
        if(ops->busy(ops->context))error="busy";
        else if(!cJSON_IsString(text)||!wire_uint(o,"off",&offset))error="invalid_chunk";
        else error=ib_notification_chunk(link,nid,rev,offset,text->valuestring,strlen(text->valuestring));
    }else if(!error&&!strcmp(op,"commit")){
        ib_notification_snapshot_t prior;ib_notification_snapshot(&prior);duplicate=prior.committed&&prior.rev==rev&&!strcmp(prior.nid,nid);
        if(ops->busy(ops->context))error="busy";
        else if(!wire_uint(o,"size",&size)||!wire_uint(o,"crc",&crc))error="invalid_size";
        else error=ib_notification_commit(link,nid,rev,size,crc);
        if(!error&&(!ops->apply||!ops->apply(ops->context)))error="busy";
    }else if(!error&&(!strcmp(op,"clear")||!strcmp(op,"abort"))){
        ib_notification_snapshot_t current;ib_notification_snapshot(&current);
        if(current.rev!=rev||strcmp(current.nid,nid))error="stale_revision";
        else if(!strcmp(op,"abort"))error=ib_notification_abort(link,nid,rev); //staging从未显示，store单独校验owner。
        else{
            if(ops->hide&&!ops->hide(ops->context))error="busy";
            if(!error)error=ib_notification_clear(nid,rev);
        }
    }else if(!error)error="unknown_operation";
    ib_notification_snapshot_t view;ib_notification_snapshot(&view);
    const char *safe_op=(!strcmp(op,"begin")||!strcmp(op,"chunk")||!strcmp(op,"commit")||!strcmp(op,"abort")||!strcmp(op,"clear")||cap)?op:"invalid";
    unsigned off=view.rev==rev&&!strcmp(view.nid,nid)?(unsigned)view.offset:0;
    snprintf(response,capacity,"{\"t\":\"notification\",\"op\":\"%s\",\"rid\":%lu,\"nid\":\"%s\",\"rev\":%lu,\"ok\":%d,\"off\":%u,\"size\":%u,\"crc\":%lu,\"duplicate\":%d,\"error\":\"%s\"}\n",
        safe_op,(unsigned long)rid,nid,(unsigned long)rev,error?0:1,off,view.rev==rev&&!strcmp(view.nid,nid)?(unsigned)view.length:0,(unsigned long)crc,duplicate,error?error:"");
    return strlen(response)+1<capacity;
}
