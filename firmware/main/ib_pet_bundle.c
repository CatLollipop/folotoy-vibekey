#include "ib_pet_bundle.h"
#include <string.h>
uint16_t ib_pet_bundle_u16(const void *data,size_t o){const uint8_t *p=data;return (uint16_t)(p[o]|((uint16_t)p[o+1]<<8));}
uint32_t ib_pet_bundle_u32(const void *data,size_t o){const uint8_t *p=data;return (uint32_t)p[o]|((uint32_t)p[o+1]<<8)|((uint32_t)p[o+2]<<16)|((uint32_t)p[o+3]<<24);}
static bool section(const void *p,size_t size,unsigned off_field,unsigned count,size_t stride,size_t *previous_end){
    uint32_t off=ib_pet_bundle_u32(p,off_field);
    if(off<*previous_end||off>size||count>(size-off)/stride)return false;
    *previous_end=off+count*stride;return true;
}
static bool part_valid(const void *p,size_t at,uint32_t rings,uint32_t colors){
    const uint8_t *b=p;
    return ib_pet_bundle_u16(p,at)<rings&&b[at+2]<=5&&b[at+4]<colors&&(b[at+5]&~7u)==0;
}
bool ib_pet_bundle_validate(const void *p,size_t size,uint32_t revision){
    if(!p||size<IB_PET_BUNDLE_HEADER||size>IB_PET_BUNDLE_MAX||memcmp(p,"AORAPET2",8))return false;
    const uint8_t *b=p;
    if(ib_pet_bundle_u16(p,8)!=2||ib_pet_bundle_u16(p,10)!=112||ib_pet_bundle_u32(p,12)!=size||!ib_pet_bundle_u32(p,16))return false;
    if(revision&&ib_pet_bundle_u32(p,16)!=revision)return false;
    if(b[20]>1||b[21]<6||b[21]>20||b[22]<10||b[22]>100||(b[23]!=255&&b[23]>=44))return false;
    if(ib_pet_bundle_u32(p,24)>0xffffff||ib_pet_bundle_u32(p,28)>0xffffff||ib_pet_bundle_u16(p,92)!=64)return false;
    unsigned max_ring=ib_pet_bundle_u16(p,94);if(max_ring<3||max_ring>IB_PET_BUNDLE_MAX_RING_POINTS)return false;
    uint32_t points=ib_pet_bundle_u32(p,IBPB_POINTS),rings=ib_pet_bundle_u32(p,IBPB_RINGS),parts=ib_pet_bundle_u32(p,IBPB_PARTS);
    uint32_t poses=ib_pet_bundle_u32(p,IBPB_POSES),body=ib_pet_bundle_u32(p,IBPB_BODY_PARTS),colors=ib_pet_bundle_u32(p,IBPB_PALETTE_COUNT);
    uint32_t meta=ib_pet_bundle_u32(p,IBPB_META_BYTES);
    if(!points||points>24576||!rings||rings>4096||!parts||parts>8192||!poses||poses>512||!body||body>128||colors<16||colors>256||meta>4096)return false;
    size_t end=112;
    if(!section(p,size,IBPB_META_OFF,meta,1,&end)||!section(p,size,IBPB_POINT_OFF,points,4,&end)||
       !section(p,size,IBPB_RING_OFF,rings,8,&end)||!section(p,size,IBPB_PART_OFF,parts,8,&end)||
       !section(p,size,IBPB_POSE_OFF,poses,8,&end)||!section(p,size,IBPB_STATE_OFF,44,28,&end)||
       !section(p,size,IBPB_BODY_OFF,body,8,&end)||!section(p,size,IBPB_PALETTE_OFF,colors,4,&end)||end!=size)return false;
    for(uint32_t i=0;i<rings;i++){
        size_t at=ib_pet_bundle_u32(p,IBPB_RING_OFF)+i*8;uint32_t first=ib_pet_bundle_u32(p,at);unsigned n=ib_pet_bundle_u16(p,at+4);
        if(n<3||n>max_ring||first>points||n>points-first)return false;
    }
    for(uint32_t i=0;i<parts;i++)if(!part_valid(p,ib_pet_bundle_u32(p,IBPB_PART_OFF)+i*8,rings,colors))return false;
    for(uint32_t i=0;i<body;i++)if(!part_valid(p,ib_pet_bundle_u32(p,IBPB_BODY_OFF)+i*8,rings,colors))return false;
    for(uint32_t i=0;i<poses;i++){
        size_t at=ib_pet_bundle_u32(p,IBPB_POSE_OFF)+i*8;uint32_t first=ib_pet_bundle_u32(p,at);unsigned n=ib_pet_bundle_u16(p,at+4);
        if(n>128||first>parts||n>parts-first)return false;
    }
    for(unsigned i=0;i<44;i++){
        size_t at=ib_pet_bundle_u32(p,IBPB_STATE_OFF)+i*28;unsigned n=b[at+16];if(!n||n>8)return false;
        for(unsigned j=0;j<n;j++)if(ib_pet_bundle_u16(p,at+j*2)>=poses)return false;
        unsigned a=ib_pet_bundle_u16(p,at+18),z=ib_pet_bundle_u16(p,at+20);
        if(a>z)return false;
        a=ib_pet_bundle_u16(p,at+22);
        z=ib_pet_bundle_u16(p,at+24);
        if(a>z)return false;
    }
    for(uint32_t i=0;i<colors;i++)if(ib_pet_bundle_u32(p,ib_pet_bundle_u32(p,IBPB_PALETTE_OFF)+i*4)>0xffffff)return false;
    return true;
}
