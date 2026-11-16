#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

/* AORAPET2：无预烘帧，LE表格式。直接从已提交Flash mmap读取，不复制整包。 */
#define IB_PET_BUNDLE_HEADER 112u
#define IB_PET_BUNDLE_MAX 131072u
#define IB_PET_BUNDLE_MAX_RING_POINTS 256u
enum {IBPB_META_BYTES=32,IBPB_POINTS=36,IBPB_RINGS=40,IBPB_PARTS=44,IBPB_POSES=48,IBPB_BODY_PARTS=52,
      IBPB_META_OFF=56,IBPB_POINT_OFF=60,IBPB_RING_OFF=64,IBPB_PART_OFF=68,IBPB_POSE_OFF=72,
      IBPB_STATE_OFF=76,IBPB_BODY_OFF=80,IBPB_PALETTE_OFF=84,IBPB_PALETTE_COUNT=88};
uint16_t ib_pet_bundle_u16(const void *p,size_t off);
uint32_t ib_pet_bundle_u32(const void *p,size_t off);
/* expected_revision=0仅供load使用；store应传本次事务revision。无全局状态变化。 */
bool ib_pet_bundle_validate(const void *data,size_t size,uint32_t expected_revision);
