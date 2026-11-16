#include "ib_pet.h"
#include "ib_pet_motion.h"
#include "ib_pet_golden.h"
#include "ib_pet_motion_golden.h"
#include <assert.h>
#include <math.h>
#include <stdio.h>
#include <string.h>
static unsigned char visible[784];
static unsigned calls;
static unsigned corner_lights,confetti,alerts;
static void pixel(uint8_t x,uint8_t y,uint32_t rgb,uint8_t brightness,void *ctx){
    (void)ctx;assert(x<28&&y<28);assert(brightness>=10&&brightness<=100);
    visible[y*28+x]=rgb!=0x17181D;calls++;
    if(x>=22&&y<=6&&rgb!=0x17181D)corner_lights++;
    if(rgb==0xEE5A5E||rgb==0xF7803D||rgb==0x33B477||rgb==0x24A6C9||rgb==0x3D8BF2||rgb==0x9474EA)confetti++;
    if(rgb==0xEB4B4F)alerts++;
}
int main(void){
    ib_pet_init();assert(!strcmp(ib_pet_state_name(),"idle"));
    assert(!ib_pet_set_state_name("__invalid__",0));
    int total_diff=0,max_diff=0;
    for(int state=0;state<IB_PET_STATE_COUNT;state++){
        memset(visible,0,sizeof visible);calls=0;
        ib_pet_render_static((ib_pet_state_t)state,pixel,0);assert(calls==784);
        int diff=0;for(int i=0;i<784;i++)diff+=visible[i]!=aora_golden[state][i];
        /* Q6轮廓在阈值边界可改变最多两格；其余格必须与独立官方JS一致。 */
        assert(diff<=2);
        total_diff+=diff;if(diff>max_diff)max_diff=diff;
    }
    for(unsigned i=0;i<sizeof motion_golden/sizeof motion_golden[0];i++){
        const float *g=motion_golden[i];ib_pet_set_state((ib_pet_state_t)g[0],0);
        ib_pet_targets_t actual=ib_pet_motion(ib_pet_state_name(),g[1],g[1]);
        assert(fabsf(actual.tilt-g[2])<.0001f);assert(fabsf(actual.x-g[3])<.0001f);
        assert(fabsf(actual.y-g[4])<.0001f);assert(fabsf(actual.squash-g[5])<.0001f);
    }
    ib_pet_spring_t s={0,0,1,8,1};for(int i=0;i<120;i++)ib_pet_step_spring(&s,1.0f/120);
    assert(fabsf(s.value-.9959f)<.001f);
    ib_pet_init();assert(ib_pet_render(0,pixel,0));assert(!ib_pet_render(10,pixel,0));
    assert(ib_pet_render(84,pixel,0));
    ib_pet_configure(false,12,80);assert(!ib_pet_enabled());assert(ib_pet_render(200,pixel,0));
    ib_pet_configure(true,255,0);assert(ib_pet_render(300,pixel,0));
    for(unsigned state=0;state<44;state++){
        ib_pet_set_state((ib_pet_state_t)state,400);for(unsigned ms=400;ms<8500;ms+=84)ib_pet_render(ms,pixel,0);
    }
    ib_pet_init();ib_pet_set_state(IB_PET_SLEEPING,UINT32_MAX-100);assert(ib_pet_render(UINT32_MAX-10,pixel,0));
    assert(ib_pet_render(90,pixel,0));
    for(int fx=0;fx<2;fx++){
        ib_pet_init();ib_pet_set_state(fx?IB_PET_THINKING:IB_PET_SLEEPING,0);corner_lights=0;
        for(unsigned ms=0;ms<1800;ms+=84)ib_pet_render(ms,pixel,0);
        assert(corner_lights>0);
    }
    ib_pet_init();ib_pet_set_state(IB_PET_DONE,0);confetti=0;
    for(unsigned ms=0;ms<1100;ms+=84)ib_pet_render(ms,pixel,0);
    assert(confetti>0);
    ib_pet_init();ib_pet_set_state(IB_PET_ERROR,0);alerts=0;
    for(unsigned ms=0;ms<1100;ms+=84)ib_pet_render(ms,pixel,0);
    assert(alerts>0);
    assert(total_diff<=5);
    printf("Aora native pet: 44 states, 132 motion goldens; raster max=%d total=%d.\n",max_diff,total_diff);
    return 0;
}
