/* 端到端边界：官方JS导出 → 纯validator → 零拷贝C运行时 → 可见点阵。
 * 仅host测试会分配文件缓冲，设备运行时始终使用只读Flash mmap。 */
#include "ib_pet.h"
#include "ib_pet_bundle.h"
#include <assert.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static uint32_t pixels[IB_PET_SIZE*IB_PET_SIZE];
static unsigned calls,lit;
static void pixel(uint8_t x,uint8_t y,uint32_t rgb,uint8_t brightness,void *context){
    (void)context;assert(x<IB_PET_SIZE&&y<IB_PET_SIZE);assert(brightness>=10&&brightness<=100);
    pixels[y*IB_PET_SIZE+x]=rgb;calls++;lit+=rgb!=0x17181d;
}
static void set32(uint8_t *p,unsigned at,uint32_t n){for(unsigned j=0;j<4;j++)p[at+j]=(uint8_t)(n>>(j*8));}
static void reject32(uint8_t *p,size_t n,unsigned at,uint32_t bad){
    uint32_t saved=ib_pet_bundle_u32(p,at);set32(p,at,bad);assert(!ib_pet_bundle_validate(p,n,42));set32(p,at,saved);
}
static uint32_t hash(void){uint32_t h=2166136261u;for(unsigned i=0;i<IB_PET_SIZE*IB_PET_SIZE;i++)h=(h^pixels[i])*16777619u;return h;}
int main(int argc,char **argv){
    assert(argc>1);unsigned count=0;uint32_t first_hash=0;bool different=false;
    for(int file=1;file<argc;file++){
        FILE *f=fopen(argv[file],"rb");assert(f);assert(!fseek(f,0,SEEK_END));long length=ftell(f);assert(length>=112&&length<=131072);rewind(f);
        size_t n=(size_t)length;uint8_t *p=malloc(n);assert(p);assert(fread(p,1,n,f)==n);fclose(f);
        assert(ib_pet_bundle_validate(p,n,42));assert(ib_pet_bundle_validate(p,n,0));assert(!ib_pet_bundle_validate(p,n,43));
        assert(!ib_pet_bundle_validate(p,n-1,42));assert(!ib_pet_bundle_validate(NULL,n,42));
        reject32(p,n,12,(uint32_t)n+1);reject32(p,n,16,0);reject32(p,n,IBPB_POINTS,24577);
        reject32(p,n,IBPB_RING_OFF,1);reject32(p,n,IBPB_STATE_OFF,(uint32_t)n-1);
        reject32(p,n,IBPB_PALETTE_COUNT,257);reject32(p,n,IBPB_PALETTE_OFF,UINT32_MAX);
        size_t ring=ib_pet_bundle_u32(p,IBPB_RING_OFF);reject32(p,n,(unsigned)ring,UINT32_MAX);
        size_t part=ib_pet_bundle_u32(p,IBPB_PART_OFF);uint8_t saved=p[part+2];p[part+2]=255;assert(!ib_pet_bundle_validate(p,n,42));p[part+2]=saved;
        size_t state=ib_pet_bundle_u32(p,IBPB_STATE_OFF);saved=p[state+16];p[state+16]=9;assert(!ib_pet_bundle_validate(p,n,42));p[state+16]=saved;
        assert(ib_pet_load_bundle(p,n));assert(ib_pet_enabled());
        for(unsigned s=0;s<IB_PET_STATE_COUNT;s++){
            calls=lit=0;ib_pet_render_static((ib_pet_state_t)s,pixel,NULL);assert(calls==784);assert(lit>=10);
        }
        ib_pet_render_static(IB_PET_IDLE,pixel,NULL);uint32_t this_hash=hash();
        if(!count)first_hash=this_hash;else different|=this_hash!=first_hash;
        /* 原子切换失败必须保留旧角色；validator也不能隐式改变active指针。 */
        saved=p[0];p[0]='X';assert(!ib_pet_load_bundle(p,n));p[0]=saved;
        ib_pet_render_static(IB_PET_IDLE,pixel,NULL);assert(this_hash==hash());
        ib_pet_set_state(IB_PET_HAPPY,0);uint32_t before=0;bool moves=false;
        for(unsigned t=0;t<1400;t+=84){calls=0;assert(ib_pet_render(t,pixel,NULL));assert(calls==784);if(!t)before=hash();else moves|=hash()!=before;}
        assert(moves);
        /* 固定表情与显示关闭参数也进入实际内核；offline UI仍可强制绘制。 */
        p[20]=0;p[23]=IB_PET_SLEEPING;assert(ib_pet_load_bundle(p,n));assert(!ib_pet_enabled());
        assert(!strcmp(ib_pet_state_name(),"sleeping"));ib_pet_set_state(IB_PET_THINKING,0);assert(!strcmp(ib_pet_state_name(),"sleeping"));
        assert(ib_pet_render(0,pixel,NULL));
        /* 先恢复内置角色再释放映射，ASan能发现残留资产指针。 */
        assert(ib_pet_load_bundle(NULL,0));free(p);calls=0;ib_pet_render_static(IB_PET_IDLE,pixel,NULL);assert(calls==784);
        count++;
    }
    assert(different);printf("AORAPET2: %u exported assets × 44 states, animation, fixed state, malformed refs and atomic load passed.\n",count);
}
