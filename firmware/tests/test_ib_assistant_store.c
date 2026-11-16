// NOR模型强制只允许1→0写入；模拟掉电/坏CRC/半包，不接硬件。
#include "test_common.h"
#include "ib_assistant_store.h"
#include "ib_crc32.h"
#include "esp_partition.h"
#include "nvs.h"
#include <stdlib.h>
static uint8_t flash[0x80000],mode;
static struct {bool live;size_t offset,size;} mappings[16];
static const esp_partition_t partition={.address=0x360000,.size=sizeof(flash)};
static bool fail_header;
const esp_partition_t *esp_partition_find_first(int t,int s,const char *name){(void)t;return s==0x41&&!strcmp(name,"assistant")?&partition:NULL;}
esp_err_t esp_partition_read(const esp_partition_t *p,size_t off,void *out,size_t n){if(p!=&partition||off+n>sizeof(flash))return ESP_FAIL;memcpy(out,flash+off,n);return ESP_OK;}
esp_err_t esp_partition_write(const esp_partition_t *p,size_t off,const void *bytes,size_t n){
    if(p!=&partition||off+n>sizeof(flash)||(fail_header&&off%0x40000==0))return ESP_FAIL;
    const uint8_t *in=bytes;for(size_t i=0;i<n;i++)if((flash[off+i]&in[i])!=in[i])return ESP_FAIL;
    memcpy(flash+off,bytes,n);return ESP_OK;
}
esp_err_t esp_partition_erase_range(const esp_partition_t *p,size_t off,size_t n){
    if(p!=&partition||off+n>sizeof(flash)||off%4096||n%4096)return ESP_FAIL;
    for(unsigned i=0;i<16;i++)if(mappings[i].live&&off<mappings[i].offset+mappings[i].size&&off+n>mappings[i].offset)return ESP_FAIL;
    memset(flash+off,255,n);return ESP_OK;
}
esp_err_t esp_partition_mmap(const esp_partition_t *p,size_t off,size_t n,esp_partition_mmap_memory_t type,const void **out,esp_partition_mmap_handle_t *handle){
    (void)type;if(p!=&partition||off+n>sizeof(flash))return ESP_FAIL;
    for(unsigned i=0;i<16;i++)if(!mappings[i].live){mappings[i].live=true;mappings[i].offset=off;mappings[i].size=n;*out=flash+off;*handle=i;return ESP_OK;}
    return ESP_FAIL;
}
void esp_partition_munmap(esp_partition_mmap_handle_t handle){CHECK(handle<16&&mappings[handle].live);mappings[handle].live=false;}

esp_err_t nvs_open(const char *name,int flags,nvs_handle_t *n){(void)name;(void)flags;*n=1;return ESP_OK;}
esp_err_t nvs_get_u8(nvs_handle_t n,const char *k,uint8_t *v){(void)n;(void)k;*v=mode;return ESP_OK;}
esp_err_t nvs_set_u8(nvs_handle_t n,const char *k,uint8_t v){(void)n;(void)k;mode=v;return ESP_OK;}
esp_err_t nvs_commit(nvs_handle_t n){(void)n;return ESP_OK;}
void nvs_close(nvs_handle_t n){(void)n;}
static const char profile[]="{\"schema\":2,\"asr_provider\":\"volcengine_doubao_realtime\",\"asr_model\":\"bigmodel\",\"asr_key\":\"fictional-asr-key\",\"revision\":1,\"minimax_key\":\"fictional-test-key\",\"deepseek_key\":\"fictional-test-key\",\"llm_model\":\"deepseek-flash\"}";
static const char pet[]="{\"schema\":1,\"revision\":2,\"enabled\":true,\"fps\":12,\"brightness\":80,\"color\":\"#EADBB9\"}";
static const char *upload(bool is_pet,unsigned rev,const char *s,bool usb){size_t n=strlen(s);const char *e=ib_assistant_store_begin(is_pet,rev,n,ib_crc32(s,n),usb);if(e)return e;for(size_t off=0;off<n;off+=40){size_t take=n-off<40?n-off:40;e=ib_assistant_store_chunk(off,s+off,take);if(e)return e;}return ib_assistant_store_commit();}
static void test_expanded_store(void);
int main(void){
    memset(flash,255,sizeof(flash));CHECK(ib_assistant_store_init()==ESP_OK);CHECK(!ib_assistant_store_configured());
    CHECK_STR(ib_assistant_store_begin(false,1,strlen(profile),ib_crc32(profile,strlen(profile)),false),"usb_required");
    CHECK(upload(false,1,profile,true)==NULL);CHECK(ib_assistant_store_configured());CHECK(ib_assistant_store_usb_provisioned());
    CHECK(upload(true,2,pet,false)==NULL);CHECK(ib_assistant_store_revision(false)==1);CHECK(ib_assistant_store_revision(true)==2);
    CHECK(ib_assistant_store_init()==ESP_OK);CHECK(ib_assistant_store_configured());char actual[512];CHECK(ib_assistant_pet_config(actual,sizeof(actual)));CHECK_STR(actual,pet);
    // schema1保留有效bank/pet/revision，但已取消的MiniMax ASR绝不再被视为已配置。
    const char legacy_profile[]="{\"schema\":1,\"revision\":1,\"minimax_key\":\"old-fictional-key\",\"deepseek_key\":\"old-fictional-key\"}";
    CHECK(upload(false,1,legacy_profile,true)==NULL);CHECK(ib_assistant_store_init()==ESP_OK);
    CHECK(!ib_assistant_store_configured());CHECK(ib_assistant_store_revision(false)==1);CHECK(ib_assistant_store_revision(true)==2);
    CHECK(ib_assistant_pet_config(actual,sizeof(actual)));CHECK_STR(actual,pet);
    CHECK(upload(false,1,profile,true)==NULL);CHECK(ib_assistant_store_configured());
    // 半次上传后重启，旧profile与pet都还在。
    CHECK(ib_assistant_store_begin(false,3,strlen(profile),ib_crc32(profile,strlen(profile)),false)==NULL);
    CHECK(ib_assistant_store_chunk(0,profile,20)==NULL);ib_assistant_store_abort();CHECK(ib_assistant_store_init()==ESP_OK);
    CHECK(ib_assistant_store_revision(false)==1);CHECK(ib_assistant_store_revision(true)==2);
    CHECK(ib_assistant_store_begin(false,3,strlen(profile),123,false)==NULL);
    CHECK_STR(ib_assistant_store_chunk(1,profile,20),"invalid_offset");
    CHECK(ib_assistant_store_chunk(0,profile,strlen(profile))==NULL);CHECK_STR(ib_assistant_store_commit(),"checksum_mismatch");ib_assistant_store_abort();
    fail_header=true;CHECK_STR(upload(true,2,pet,false),"commit_failed");fail_header=false;ib_assistant_store_abort();CHECK(ib_assistant_store_init()==ESP_OK);CHECK(ib_assistant_store_revision(true)==2);
    const char bad[]="{\"schema\":1,\"revision\":4,\"fps\":0}";CHECK_STR(upload(true,4,bad,false),"invalid_config");ib_assistant_store_abort();
    CHECK(ib_assistant_mode_save(true)==ESP_OK);CHECK(ib_assistant_mode_load());CHECK(ib_assistant_store_clear()==ESP_OK);CHECK(ib_assistant_store_init()==ESP_OK);CHECK(!ib_assistant_store_configured());CHECK(ib_assistant_store_revision(true)==2);CHECK(ib_assistant_mode_load());
    test_expanded_store();
    TEST_DONE("assistant_store");
}
static void w16(uint8_t *p,size_t at,unsigned n){p[at]=n;p[at+1]=n>>8;}
static void w32(uint8_t *p,size_t at,uint32_t n){for(unsigned i=0;i<4;i++)p[at+i]=n>>(8*i);}
static uint8_t bundle[131072];
static size_t make_bundle(unsigned rev,unsigned points){
    memset(bundle,0,sizeof(bundle));memcpy(bundle,"AORAPET2",8);w16(bundle,8,2);w16(bundle,10,112);w32(bundle,16,rev);
    bundle[20]=1;bundle[21]=12;bundle[22]=80;bundle[23]=255;w32(bundle,24,0xEADBB9);w32(bundle,28,0xFFF4D6);
    w32(bundle,36,points);w32(bundle,40,1);w32(bundle,44,1);w32(bundle,48,1);w32(bundle,52,1);w32(bundle,88,16);w16(bundle,92,64);w16(bundle,94,256);
    size_t at=112;w32(bundle,56,at);w32(bundle,60,at);at+=points*4;
    w32(bundle,64,at);w16(bundle,at+4,3);at+=8;
    w32(bundle,68,at);at+=8;w32(bundle,72,at);w16(bundle,at+4,1);at+=8;
    w32(bundle,76,at);
    for(unsigned i=0;i<44;i++){bundle[at+16]=1;w16(bundle,at+18,800);w16(bundle,at+20,1200);w16(bundle,at+22,1000);w16(bundle,at+24,1000);at+=28;}
    w32(bundle,80,at);at+=8;w32(bundle,84,at);at+=16*4;w32(bundle,12,at);return at;
}
static const char *upload_bytes(unsigned rev,const void *data,size_t size){
    const uint8_t *p=data;const char *e=ib_assistant_store_begin(true,rev,size,ib_crc32(data,size),true);if(e)return e;
    for(size_t off=0;off<size;off+=288){size_t n=size-off<288?size-off:288;e=ib_assistant_store_chunk(off,p+off,n);if(e)return e;}
    return ib_assistant_store_commit();
}
static void seed_legacy(unsigned bank,unsigned generation){
    uint32_t header[10]={0x31415356,generation,strlen(profile),ib_crc32(profile,strlen(profile)),1,strlen(pet),ib_crc32(pet,strlen(pet)),2,1,0};
    header[9]=ib_crc32(header,36);size_t base=bank*0x20000;
    memcpy(flash+base,header,sizeof(header));memcpy(flash+base+0x1000,profile,strlen(profile));memcpy(flash+base+0x6000,pet,strlen(pet));
}
static bool apply_allowed=true,active_mapping_live;
static esp_partition_mmap_handle_t active_mapping;
static bool apply_fixture(void *context){
    (void)context;if(!apply_allowed)return false;
    const void *bytes;size_t size;esp_partition_mmap_handle_t next;
    if(ib_assistant_pet_map(&bytes,&size,&next)!=ESP_OK)return false;
    if(active_mapping_live)esp_partition_munmap(active_mapping);
    active_mapping_live=size!=0;active_mapping=next;return true;
}
static void test_expanded_store(void){
    // 模拟旧V1 bank1最新。V2迁移写失败时，两个旧bank必须字节不变。
    memset(flash,255,sizeof(flash));seed_legacy(0,1);seed_legacy(1,2);
    uint8_t *legacy=malloc(0x40000);CHECK(legacy);memcpy(legacy,flash,0x40000);
    fail_header=true;CHECK(ib_assistant_store_init()==ESP_FAIL);CHECK(!memcmp(legacy,flash,0x40000));
    fail_header=false;CHECK(ib_assistant_store_init()==ESP_OK);CHECK(!memcmp(legacy,flash,0x40000));free(legacy);
    CHECK(ib_assistant_store_configured());CHECK(ib_assistant_store_revision(true)==2);
    CHECK(flash[0x40000]=='V'&&flash[0x40003]=='2');
    // 超过64KiB的资产不分配整包RAM，CRC与真实binary validator之后才激活。
    size_t size=make_bundle(5,24000);CHECK(size>65536&&size<131072);CHECK(upload_bytes(5,bundle,size)==NULL);
    CHECK(ib_assistant_store_revision(false)==1);CHECK(ib_assistant_store_revision(true)==5);
    CHECK(ib_assistant_store_init()==ESP_OK);CHECK(ib_assistant_store_revision(true)==5);
    const void *data;size_t mapped_size;esp_partition_mmap_handle_t map;
    CHECK(ib_assistant_pet_map(&data,&mapped_size,&map)==ESP_OK);CHECK(mapped_size==size&&!memcmp(data,bundle,size));esp_partition_munmap(map);
    CHECK_STR(ib_assistant_store_begin(true,6,131073,0,true),"invalid_size");
    // 新头已提交但UI拒绝切换时，下一begin必须被挡住，不能擦除仍在渲染的旧mmap。
    ib_assistant_store_set_apply(apply_fixture,NULL);CHECK(ib_assistant_store_apply());
    apply_allowed=false;size=make_bundle(6,3);CHECK_STR(upload_bytes(6,bundle,size),"pet_apply_failed");
    CHECK_STR(ib_assistant_store_begin(true,7,size,ib_crc32(bundle,size),true),"pet_pending");
    apply_allowed=true;CHECK(ib_assistant_store_apply());CHECK(ib_assistant_store_revision(true)==6);
    size=make_bundle(7,3);bundle[21]=0;CHECK_STR(upload_bytes(7,bundle,size),"invalid_config");ib_assistant_store_abort();
    CHECK(ib_assistant_store_clear()==ESP_OK);CHECK(!ib_assistant_store_configured());CHECK(ib_assistant_store_revision(true)==6);
    if(active_mapping_live){esp_partition_munmap(active_mapping);active_mapping_live=false;}
    ib_assistant_store_set_apply(NULL,NULL);CHECK(ib_assistant_store_apply());
}
