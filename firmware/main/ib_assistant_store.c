// 提交头最后写入。掉电时旧 bank 始终完整；profile / pet 独立更新时复制另一份有效数据。
#include "ib_assistant_store.h"
#include "ib_crc32.h"
#include "ib_pet_bundle.h"
#include "cJSON.h"
#include "esp_partition.h"
#include "nvs.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define BANK_SIZE 0x40000u
#define LEGACY_BANK_SIZE 0x20000u
#define PROFILE_OFFSET 0x1000u
#define PET_OFFSET 0x6000u
#define STORE_MAGIC 0x32415356u
#define LEGACY_MAGIC 0x31415356u
_Static_assert(PET_OFFSET+IB_PET_CONFIG_MAX<=BANK_SIZE,"pet bank capacity");
typedef struct {
    uint32_t magic, generation, profile_size, profile_crc, profile_rev;
    uint32_t pet_size, pet_crc, pet_rev, usb, header_crc;
} bank_header_t;
static const esp_partition_t *s_partition;
static bool s_ready,s_cleanup_pending,s_retired_clean,s_committed;
static volatile bool s_flash_busy;
bool ib_assistant_store_ready(void){return s_ready;}
static bank_header_t s_header;
static unsigned s_bank;
static bool s_apply_pending;
static ib_assistant_store_apply_cb s_apply;
static void *s_apply_context;
static ib_assistant_profile_t s_profile;
static struct { bool active, pet, usb; uint32_t revision, crc, computed; size_t size, offset; unsigned bank; bank_header_t header; } s_upload;
static const cJSON *item(const cJSON *o, const char *k) { return cJSON_GetObjectItemCaseSensitive(o, k); }
static bool string_field(const cJSON *o, const char *key, char *out, size_t cap, const char *fallback) {
    const cJSON *v = item(o, key); const char *s = cJSON_IsString(v) ? v->valuestring : fallback;
    if (!s || strlen(s) >= cap) return false;
    // 防止 Authorization / URL 请求头注入，prompt 可合法换行。
    if (strcmp(key, "system_prompt") && (strchr(s, '\r') || strchr(s, '\n'))) return false;
    strcpy(out, s); return true;
}
static unsigned number(const cJSON *o, const char *key, unsigned fallback, unsigned maximum) {
    const cJSON *v = item(o, key);
    if (!v) return fallback;
    if (!cJSON_IsNumber(v) || v->valuedouble < 1 || v->valuedouble > maximum || v->valuedouble != (unsigned)v->valuedouble) return 0;
    return (unsigned)v->valuedouble;
}
// 只接收HTTPS主机或路径；禁止userinfo、查询串、片段及请求头分隔符。
static bool https_base(const char *s){
    if(strncmp(s,"https://",8)||!s[8]||s[8]=='/')return false;
    for(const char *p=s+8;*p;p++)if((unsigned char)*p<=32||*p=='@'||*p=='?'||*p=='#'||*p=='\\')return false;
    return true;
}
static bool wss_endpoint(const char *s){
    if(strncmp(s,"wss://",6)||!s[6]||s[6]=='/')return false;
    for(const char *p=s+6;*p;p++)if((unsigned char)*p<=32||*p=='@'||*p=='?'||*p=='#'||*p=='\\')return false;
    return true;
}
static bool parse_profile(const char *json, size_t size, uint32_t rev, ib_assistant_profile_t *p) {
    cJSON *o = cJSON_ParseWithLength(json, size); if (!o) return false;
    memset(p, 0, sizeof(*p));
    const cJSON *schema = item(o, "schema"), *revision = item(o, "revision");
    bool ok = cJSON_IsNumber(schema) && (schema->valuedouble == 1 || schema->valuedouble == 2) && cJSON_IsNumber(revision) && revision->valuedouble == rev;
    p->schema=ok?(unsigned)schema->valueint:0;
    ok = ok && string_field(o,"minimax_key",p->minimax_key,sizeof(p->minimax_key),"")
        && string_field(o,"deepseek_key",p->deepseek_key,sizeof(p->deepseek_key),NULL)
        && string_field(o,"minimax_base_url",p->minimax_base_url,sizeof(p->minimax_base_url),"https://api.minimax.cn")
        && string_field(o,"deepseek_base_url",p->deepseek_base_url,sizeof(p->deepseek_base_url),"https://api.deepseek.com")
        && string_field(o,"llm_model",p->llm_model,sizeof(p->llm_model),"deepseek-flash")
        && string_field(o,"voice_id",p->voice_id,sizeof(p->voice_id),"male-qn-qingse")
        && string_field(o,"system_prompt",p->system_prompt,sizeof(p->system_prompt),"你是一个友好的随身AI助理。请用简短自然的中文回答，适合朗读。" );
    if(ok&&p->schema==2){
        const cJSON *provider=item(o,"asr_provider");
        ok=cJSON_IsString(provider)&&!strcmp(provider->valuestring,"volcengine_doubao_realtime")
            &&string_field(o,"asr_key",p->asr_key,sizeof(p->asr_key),NULL)
            &&string_field(o,"asr_ws_url",p->asr_ws_url,sizeof(p->asr_ws_url),"wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async")
            &&string_field(o,"asr_model",p->asr_model,sizeof(p->asr_model),"bigmodel")
            &&string_field(o,"asr_resource_id",p->asr_resource_id,sizeof(p->asr_resource_id),"volc.seedasr.sauc.duration")
            &&p->asr_key[0]&&p->asr_resource_id[0]&&wss_endpoint(p->asr_ws_url)&&!strcmp(p->asr_model,"bigmodel");
    }
    if(ok&&p->schema==2)for(const char *m=p->asr_model;*m;m++)if(!((*m>='a'&&*m<='z')||(*m>='A'&&*m<='Z')||(*m>='0'&&*m<='9')||*m=='-'||*m=='_'))ok=false;
    if(ok&&p->schema==2)for(const char *r=p->asr_resource_id;*r;r++)if(!((*r>='a'&&*r<='z')||(*r>='A'&&*r<='Z')||(*r>='0'&&*r<='9')||*r=='-'||*r=='_'||*r=='.'))ok=false;
    p->record_limit_seconds = number(o,"record_limit_seconds",30,30);
    p->max_output_tokens = number(o,"max_output_tokens",512,512);
    p->history_bytes = number(o,"history_bytes",8192,8192);
    p->reply_bytes = number(o,"reply_bytes",4096,4096);
    p->revision = rev;
    ok = ok && p->deepseek_key[0] && p->llm_model[0]
        && https_base(p->deepseek_base_url)
        && p->record_limit_seconds && p->max_output_tokens && p->history_bytes && p->reply_bytes;
    cJSON_Delete(o); if (!ok) memset(p,0,sizeof(*p)); return ok;
}
static bool valid_pet(const cJSON *o,uint32_t revision){
    const cJSON *schema=item(o,"schema"),*rev=item(o,"revision"),*enabled=item(o,"enabled"),*fps=item(o,"fps"),*brightness=item(o,"brightness"),*color=item(o,"color");
    if(!cJSON_IsNumber(schema)||schema->valueint!=1||!cJSON_IsNumber(rev)||rev->valuedouble!=revision)return false;
    if(enabled&&!cJSON_IsBool(enabled))return false;
    if(fps&&(!cJSON_IsNumber(fps)||fps->valuedouble<6||fps->valuedouble>20||fps->valuedouble!=fps->valueint))return false;
    if(brightness&&(!cJSON_IsNumber(brightness)||brightness->valuedouble<10||brightness->valuedouble>100||brightness->valuedouble!=brightness->valueint))return false;
    if(color){if(!cJSON_IsString(color)||strlen(color->valuestring)!=7||color->valuestring[0]!='#')return false;
        for(int i=1;i<7;i++){char c=color->valuestring[i];if(!((c>='0'&&c<='9')||(c>='a'&&c<='f')||(c>='A'&&c<='F')))return false;}}
    return true;
}
// base以分区内字节寻址；迁移时旧bank步长不同，不能混用bank编号。
static bool crc_region_at(size_t base,size_t offset,size_t size,uint32_t expected){
    uint8_t bytes[512];uint32_t crc=0;
    for(size_t pos=0;pos<size;pos+=sizeof(bytes)){
        size_t n=size-pos<sizeof(bytes)?size-pos:sizeof(bytes);
        if(esp_partition_read(s_partition,base+offset+pos,bytes,n)!=ESP_OK)return false;
        crc=ib_crc32_update(crc,bytes,n);
    }return crc==expected;
}
static bool valid_bank_at(size_t base,uint32_t magic,size_t pet_max,bank_header_t *h){
    if(esp_partition_read(s_partition,base,h,sizeof(*h))!=ESP_OK)return false;
    return h->magic==magic&&h->header_crc==ib_crc32(h,offsetof(bank_header_t,header_crc))
        &&h->profile_size<=IB_PROFILE_MAX&&h->pet_size<=pet_max
        &&crc_region_at(base,PROFILE_OFFSET,h->profile_size,h->profile_crc)
        &&crc_region_at(base,PET_OFFSET,h->pet_size,h->pet_crc);
}
static bool copy_region_at(size_t from,size_t to,size_t offset,size_t size){
    uint8_t bytes[512];
    for(size_t pos=0;pos<size;pos+=sizeof(bytes)){
        size_t n=size-pos<sizeof(bytes)?size-pos:sizeof(bytes);
        if(esp_partition_read(s_partition,from+offset+pos,bytes,n)!=ESP_OK||
           esp_partition_write(s_partition,to+offset+pos,bytes,n)!=ESP_OK)return false;
    }return true;
}
static bool load_profile(void){
    memset(&s_profile,0,sizeof(s_profile));if(!s_header.profile_size)return true;
    const void *data=NULL;esp_partition_mmap_handle_t mapping;
    if(esp_partition_mmap(s_partition,s_bank*BANK_SIZE+PROFILE_OFFSET,s_header.profile_size,ESP_PARTITION_MMAP_DATA,&data,&mapping)!=ESP_OK)return false;
    bool ok=parse_profile(data,s_header.profile_size,s_header.profile_rev,&s_profile);
    esp_partition_munmap(mapping);return ok;
}
static bool erased_bank(unsigned bank){
    uint8_t bytes[512];
    for(size_t off=0;off<BANK_SIZE;off+=sizeof(bytes)){
        if(esp_partition_read(s_partition,bank*BANK_SIZE+off,bytes,sizeof(bytes))!=ESP_OK)return false;
        for(size_t i=0;i<sizeof(bytes);i++)if(bytes[i]!=0xff)return false;
    }return true;
}
bool ib_assistant_store_retired_clean(void){return s_retired_clean;}
const char *ib_assistant_store_cleanup(void){
    if(!s_cleanup_pending)return NULL;
    if(s_upload.active)return "upload_active";
    if(s_apply_pending)return "pet_pending";
    if(!s_ready||s_header.magic!=STORE_MAGIC)return "storage_unavailable";
    // 只擦inactive；当前头/配置/宠物已在另一bank，任何中途掉电都不影响active。
    unsigned old=1-s_bank;
    if(esp_partition_erase_range(s_partition,old*BANK_SIZE,BANK_SIZE)!=ESP_OK||!erased_bank(old))return "cleanup_failed";
    s_cleanup_pending=false;s_retired_clean=true;return NULL;
}
static bool write_header(unsigned bank,bank_header_t *h){
    h->magic=STORE_MAGIC;h->header_crc=ib_crc32(h,offsetof(bank_header_t,header_crc));
    return esp_partition_write(s_partition,bank*BANK_SIZE,h,sizeof(*h))==ESP_OK;
}
esp_err_t ib_assistant_store_init(void){
    s_ready=s_cleanup_pending=s_retired_clean=s_committed=s_flash_busy=false;
    s_partition=esp_partition_find_first(ESP_PARTITION_TYPE_DATA,0x41,"assistant");
    if(!s_partition||s_partition->address!=0x360000||s_partition->size!=2*BANK_SIZE)return ESP_ERR_INVALID_SIZE;
    bank_header_t a,b;bool va=valid_bank_at(0,STORE_MAGIC,IB_PET_CONFIG_MAX,&a);
    bool vb=valid_bank_at(BANK_SIZE,STORE_MAGIC,IB_PET_CONFIG_MAX,&b);
    memset(&s_header,0,sizeof(s_header));s_bank=0;s_apply_pending=false;memset(&s_upload,0,sizeof(s_upload));
    if(va&&(!vb||(int32_t)(a.generation-b.generation)>0)){s_header=a;s_bank=0;}
    else if(vb){s_header=b;s_bank=1;}
    else{
        // V1两个128KiB bank完整位于V2 bank0。先迁移到不重叠的bank1，头最后写。
        va=valid_bank_at(0,LEGACY_MAGIC,IB_PET_JSON_MAX,&a);
        vb=valid_bank_at(LEGACY_BANK_SIZE,LEGACY_MAGIC,IB_PET_JSON_MAX,&b);
        if(va||vb){
            size_t old=va&&(!vb||(int32_t)(a.generation-b.generation)>0)?0:LEGACY_BANK_SIZE;
            bank_header_t h=old?b:a;h.generation++;
            if(esp_partition_erase_range(s_partition,BANK_SIZE,BANK_SIZE)!=ESP_OK||
               !copy_region_at(old,BANK_SIZE,PROFILE_OFFSET,h.profile_size)||
               !copy_region_at(old,BANK_SIZE,PET_OFFSET,h.pet_size)||!write_header(1,&h))return ESP_FAIL;
            s_header=h;s_bank=1;
        }
    }
    s_ready=load_profile();
    if(s_ready){
        if(s_header.magic==STORE_MAGIC){s_retired_clean=erased_bank(1-s_bank);s_cleanup_pending=!s_retired_clean;}
        else s_retired_clean=erased_bank(0)&&erased_bank(1);
    }
    return s_ready?ESP_OK:ESP_ERR_INVALID_STATE;
}
// 旧schema1仍是有效存储，不能因此丢掉同bank宠物；只禁止旧ASR继续联网。
bool ib_assistant_store_configured(void){return s_profile.schema==2&&s_profile.asr_key[0]&&s_profile.deepseek_key[0];}
bool ib_assistant_store_usb_provisioned(void){return s_header.usb==1;}
const ib_assistant_profile_t *ib_assistant_profile(void){return &s_profile;}
uint32_t ib_assistant_store_revision(bool pet){return pet?s_header.pet_rev:s_header.profile_rev;}
void ib_assistant_store_set_apply(ib_assistant_store_apply_cb apply,void *context){s_apply=apply;s_apply_context=context;s_apply_pending=true;}
bool ib_assistant_store_apply(void){
    if(!s_apply_pending)return true;
    if(s_apply&&!s_apply(s_apply_context))return false;
    s_apply_pending=false;return true;
}
const char *ib_assistant_store_begin(bool pet,uint32_t rev,size_t size,uint32_t crc,bool usb){
    if(!s_partition)return "storage_unavailable";
    if(s_apply_pending)return "pet_pending";
    if(s_upload.active)return "upload_active";
    const char *cleanup=ib_assistant_store_cleanup();if(cleanup)return cleanup;
    if(!rev||!size||size>(pet?IB_PET_CONFIG_MAX:IB_PROFILE_MAX))return "invalid_size";
    if(!usb&&!ib_assistant_store_usb_provisioned())return "usb_required";
    s_committed=false;s_retired_clean=false;
    memset(&s_upload,0,sizeof(s_upload));s_upload.pet=pet;s_upload.revision=rev;s_upload.size=size;s_upload.crc=crc;
    s_upload.bank=1-s_bank;s_upload.header=s_header;s_upload.usb=usb;
    s_flash_busy=true;
    if(esp_partition_erase_range(s_partition,s_upload.bank*BANK_SIZE,BANK_SIZE)!=ESP_OK){s_flash_busy=false;s_cleanup_pending=s_header.magic==STORE_MAGIC;return "erase_failed";}
    if(!copy_region_at(s_bank*BANK_SIZE,s_upload.bank*BANK_SIZE,pet?PROFILE_OFFSET:PET_OFFSET,pet?s_header.profile_size:s_header.pet_size)){s_flash_busy=false;s_cleanup_pending=s_header.magic==STORE_MAGIC;return "copy_failed";}
    s_upload.active=true;s_flash_busy=false;return NULL;
}
const char *ib_assistant_store_chunk(size_t offset,const void *data,size_t size){
    if(!s_upload.active)return "no_upload";
    if(offset!=s_upload.offset||!size||size>288||size>s_upload.size-offset)return "invalid_offset";
    if(esp_partition_write(s_partition,s_upload.bank*BANK_SIZE+(s_upload.pet?PET_OFFSET:PROFILE_OFFSET)+offset,data,size)!=ESP_OK)return "write_failed";
    s_upload.computed=ib_crc32_update(s_upload.computed,data,size);s_upload.offset+=size;return NULL;
}
static bool validate_pet_upload(void){
    const void *data=NULL;esp_partition_mmap_handle_t mapping;
    if(esp_partition_mmap(s_partition,s_upload.bank*BANK_SIZE+PET_OFFSET,s_upload.size,ESP_PARTITION_MMAP_DATA,&data,&mapping)!=ESP_OK)return false;
    bool ok=ib_pet_bundle_validate(data,s_upload.size,s_upload.revision);
    // 兼容旧版小JSON设置；大资产只走二进制validator，不分配128KiB RAM。
    if(!ok&&s_upload.size<=IB_PET_JSON_MAX){
        cJSON *json=cJSON_ParseWithLength(data,s_upload.size);ok=json&&valid_pet(json,s_upload.revision);cJSON_Delete(json);
    }
    esp_partition_munmap(mapping);return ok;
}
const char *ib_assistant_store_commit(void){
    if(!s_upload.active){
        if(!s_committed)return "no_upload";
        if(!ib_assistant_store_apply())return "pet_apply_failed";
        return ib_assistant_store_cleanup();
    }
    if(s_upload.offset!=s_upload.size||s_upload.crc!=s_upload.computed)return "checksum_mismatch";
    bool ok=false;ib_assistant_profile_t *next_profile=NULL;
    if(s_upload.pet)ok=validate_pet_upload();
    else{
        const void *data=NULL;esp_partition_mmap_handle_t mapping;
        next_profile=malloc(sizeof(*next_profile));
        if(next_profile&&esp_partition_mmap(s_partition,s_upload.bank*BANK_SIZE+PROFILE_OFFSET,s_upload.size,ESP_PARTITION_MMAP_DATA,&data,&mapping)==ESP_OK){
            ok=parse_profile(data,s_upload.size,s_upload.revision,next_profile);esp_partition_munmap(mapping);
        }
    }
    if(!ok){if(next_profile){memset(next_profile,0,sizeof(*next_profile));free(next_profile);}return "invalid_config";}
    bank_header_t h=s_upload.header;h.generation=s_header.generation+1;
    if(s_upload.pet){h.pet_size=s_upload.size;h.pet_crc=s_upload.crc;h.pet_rev=s_upload.revision;}
    else{h.profile_size=s_upload.size;h.profile_crc=s_upload.crc;h.profile_rev=s_upload.revision;}
    if(s_upload.usb)h.usb=1;
    if(!write_header(s_upload.bank,&h)){if(next_profile){memset(next_profile,0,sizeof(*next_profile));free(next_profile);}return "commit_failed";}
    s_bank=s_upload.bank;s_header=h;s_upload.active=false;s_apply_pending=true;s_cleanup_pending=true;s_retired_clean=false;s_committed=true;
    if(next_profile){s_profile=*next_profile;memset(next_profile,0,sizeof(*next_profile));free(next_profile);}
    // 新几何切换并释放旧mmap后才回执；下一次begin不能提前擦除旧渲染源。
    if(!ib_assistant_store_apply())return "pet_apply_failed";
    return ib_assistant_store_cleanup();
}
void ib_assistant_store_abort(void){
    memset(&s_upload,0,sizeof(s_upload));s_committed=false;
    if(s_partition&&s_header.magic==STORE_MAGIC){s_retired_clean=erased_bank(1-s_bank);s_cleanup_pending=!s_retired_clean;}
}
size_t ib_assistant_store_offset(void){return s_upload.offset;}
bool ib_assistant_store_uploading(void){return s_upload.active||s_apply_pending||s_cleanup_pending||s_flash_busy;}
esp_err_t ib_assistant_store_clear(void){
    if(!s_partition)return ESP_ERR_INVALID_STATE;
    if(s_apply_pending)return ESP_ERR_INVALID_STATE;
    if(ib_assistant_store_cleanup())return ESP_FAIL;
    ib_assistant_store_abort();unsigned old=s_bank,next=1-s_bank;s_flash_busy=true;s_retired_clean=false;
    esp_err_t e=esp_partition_erase_range(s_partition,next*BANK_SIZE,BANK_SIZE);if(e!=ESP_OK){s_flash_busy=false;s_cleanup_pending=s_header.magic==STORE_MAGIC;return e;}
    if(!copy_region_at(old*BANK_SIZE,next*BANK_SIZE,PET_OFFSET,s_header.pet_size)){s_flash_busy=false;s_cleanup_pending=s_header.magic==STORE_MAGIC;return ESP_FAIL;}
    bank_header_t h=s_header;h.generation=s_header.generation+1;
    h.profile_size=h.profile_crc=h.profile_rev=h.usb=0;
    if(!write_header(next,&h)){s_flash_busy=false;s_cleanup_pending=s_header.magic==STORE_MAGIC;return ESP_FAIL;}
    s_bank=next;s_header=h;memset(&s_profile,0,sizeof(s_profile));s_apply_pending=true;s_cleanup_pending=true;s_retired_clean=false;s_flash_busy=false;
    if(!ib_assistant_store_apply())return ESP_FAIL;
    return ib_assistant_store_cleanup()?ESP_FAIL:ESP_OK;
}
bool ib_assistant_mode_load(void){nvs_handle_t n;uint8_t v=0;if(nvs_open("ib_assistant",NVS_READONLY,&n)==ESP_OK){nvs_get_u8(n,"standalone",&v);nvs_close(n);}return v==1;}
esp_err_t ib_assistant_mode_save(bool v){nvs_handle_t n;esp_err_t e=nvs_open("ib_assistant",NVS_READWRITE,&n);if(e!=ESP_OK)return e;e=nvs_set_u8(n,"standalone",v?1:0);if(e==ESP_OK)e=nvs_commit(n);nvs_close(n);return e;}
bool ib_assistant_pet_config(char *out,size_t cap){if(!s_header.pet_size||s_header.pet_size>IB_PET_JSON_MAX||cap<=s_header.pet_size)return false;if(esp_partition_read(s_partition,s_bank*BANK_SIZE+PET_OFFSET,out,s_header.pet_size)!=ESP_OK)return false;out[s_header.pet_size]=0;return true;}
esp_err_t ib_assistant_pet_map(const void **data,size_t *size,esp_partition_mmap_handle_t *mapping){
    *data=NULL;*size=s_header.pet_size;*mapping=0;
    if(!*size)return ESP_OK;
    return esp_partition_mmap(s_partition,s_bank*BANK_SIZE+PET_OFFSET,*size,ESP_PARTITION_MMAP_DATA,data,mapping);
}
uint32_t ib_assistant_store_upload_revision(void){return s_upload.revision;}
uint32_t ib_assistant_store_generation(void){return s_header.generation;}
