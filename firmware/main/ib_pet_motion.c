/* Port of Aora Bot 0.2.0 motion/behaviours.ts + math/spring.ts.
 * Copyright (c) 2026 sam70361; Aora Bot License 1.1, vendor/aora-bot/LICENSE.
 * 只移植Dot需要的数值行为；与官方相同120Hz半隐式Euler，不播放预烘帧。 */
#include "ib_pet_motion.h"
#include <math.h>
#include <string.h>
static float clamp(float v,float a,float b){return fminf(b,fmaxf(a,v));}
static float ease(float v){return v<.5f?4*v*v*v:1-powf(-2*v+2,3)/2;}
static float keys(float t,const float *time,const float *values,int count){
    if(t<=time[0])return values[0];
    for(int i=1;i<count;i++)if(t<=time[i])return values[i-1]+(values[i]-values[i-1])*(t-time[i-1])/(time[i]-time[i-1]);
    return values[count-1];
}
#define STATE(name) (!strcmp(state,name))
#define TARGET(a,b,c,d) ((ib_pet_targets_t){a,b,c,d})
ib_pet_targets_t ib_pet_motion(const char *state,float t,float c){
    if(STATE("idle"))return TARGET(sinf(c*.5f)*1.5f+sinf(c*.17f)*.6f,sinf(c*.27f),sinf(c*.85f)*1.2f,1+sinf(c*.85f)*.007f);
    if(STATE("sleeping"))return TARGET(6+sinf(c*.34f)*1.2f,0,sinf(c*.55f)*2.6f,1+sinf(c*.55f)*.02f);
    if(STATE("drowsy"))return TARGET(4+sinf(c*.4f)*3,sinf(c*.22f)*1.4f,sinf(c*.5f)*2,1);
    if(STATE("bored"))return TARGET(sinf(c*.3f)*4,sinf(c*.19f)*3,2,.99f);
    if(STATE("waking"))return TARGET(sinf(c*.6f)*2*fminf(1,t),0,fmaxf(0,4-t*4),1);
    if(STATE("powering-down"))return TARGET(fminf(8,t*4),0,fminf(6,t*3),fmaxf(.94f,1-t*.03f));
    if(STATE("listening"))return TARGET(8+sinf(c*.7f)*1.2f,0,sinf(c*.9f),1);
    if(STATE("thinking"))return TARGET(-9+sinf(c*.45f)*2,sinf(c*.33f)*1.6f,sinf(c*.6f),1);
    if(STATE("searching"))return TARGET(sinf(c*1.6f)*3,sinf(c*1.2f)*4,sinf(c*.8f)*1.4f,1);
    if(STATE("reading"))return TARGET(3,sinf(c*.9f)*3,1,1);
    if(STATE("working"))return TARGET(-4+sinf(c*2.4f)*1.6f,sinf(c*1.9f)*1.2f,sinf(c*3.1f)*1.4f,1+sinf(c*3.1f)*.012f);
    if(STATE("writing"))return TARGET(2+sinf(c*1.4f)*1.5f,sinf(c*.7f)*2.4f,1,1);
    if(STATE("happy"))return TARGET(sinf(c*1.1f)*3,sinf(c*.5f)*1.5f,sinf(c*1.6f)*2.2f,1+sinf(c*1.6f)*.015f);
    if(STATE("excited")||STATE("bouncing")){
        float phase=fmodf(c*(STATE("excited")?2.2f:1.5f),1),lift=sinf(phase*3.14159265f);
        if(STATE("excited"))return TARGET(sinf(c*3)*2,0,-lift*14,phase<.12f?.92f:1+lift*.05f);
        return TARGET(0,0,-lift*20,phase<.14f?.9f:1+lift*.06f);
    }
    if(STATE("laughing"))return TARGET(sinf(c*6.4f)*4,0,-fabsf(sinf(c*6.4f))*5,1+sinf(c*6.4f)*.03f);
    if(STATE("playful"))return TARGET(sinf(c*1.7f)*9,sinf(c*1.1f)*6,sinf(c*2.3f)*3,1);
    if(STATE("proud"))return TARGET(sinf(c*.5f)*1.5f,0,-4+sinf(c*.7f)*.8f,1.01f);
    if(STATE("celebrate"))return TARGET(sinf(c*2.8f)*6,sinf(c*1.9f)*4,-fabsf(sinf(c*2.8f))*8,1+sinf(c*2.8f)*.02f);
    if(STATE("shy"))return TARGET(7+sinf(c*.6f),-3,4,.985f);
    if(STATE("sad"))return TARGET(5,0,5+sinf(c*.45f)*1.2f,.97f);
    if(STATE("confused"))return TARGET(sinf(c*.8f)*11,sinf(c*.55f)*3,0,1);
    if(STATE("suspicious"))return TARGET(-6,sinf(c*.5f)*2,0,1);
    if(STATE("surprised"))return TARGET(0,0,t<.3f?-8*(1-t/.3f):0,t<.2f?1.06f:1);
    if(STATE("scared"))return TARGET(sinf(c*22)*1.6f,sinf(c*19)*1.4f,2,.98f);
    if(STATE("curious"))return TARGET(4+sinf(c*.7f)*1.5f,sinf(c*.45f)*2.5f,-1+sinf(c*1.1f)*.8f,1.005f);
    if(STATE("refusing")){
        static const float times[]={0,.16f,.32f,.48f,.64f,.8f},offsets[]={0,-9,8,-6,4,0};
        return TARGET(-2+sinf(c*.4f)*.6f,keys(t,times,offsets,6),2,.99f);
    }
    if(STATE("spawning"))return TARGET(0,0,t<.45f?-20*(1-ease(fminf(1,t/.45f))):0,t<.5f?.9f+.1f*ease(fminf(1,t/.5f)):1);
    if(STATE("composing"))return TARGET(sinf(c*1.3f)*2,sinf(c*.9f)*1.6f,sinf(c*2.1f),1);
    if(STATE("notifying"))return TARGET(sinf(c*3.2f)*2.5f,0,sinf(c*3.2f)*2,1);
    if(STATE("humming"))return TARGET(sinf(c*1.15f)*6,sinf(c*1.15f)*5,cosf(c*2.3f)*2.2f,1+cosf(c*2.3f)*.012f);
    if(STATE("dragging")){
        static const float times[]={0,.18f,.22f,.62f,.7f,.86f,1},values[]={0,20,22,20,0,0,0};
        float p=fmodf(c,3.4f)/3.4f,dir=((int)floorf(c/3.4f)%2)==0?1:-1;
        float lift=keys(p,times,values,7),glide=ease(clamp((p-.22f)/.4f,0,1));
        float impact=p>=.62f&&p<.78f?sinf((p-.62f)/.16f*3.14159265f):0;
        return TARGET(dir*lift*.5f,dir*(-14+glide*28),-lift+impact*2,1-impact*.1f+(lift/22)*.03f);
    }
    if(STATE("angry"))return TARGET(-5+sinf(c*14)*1.2f,sinf(c*16)*1.1f,0,1);
    return TARGET(0,0,0,1);
}

float ib_pet_step_spring(ib_pet_spring_t *s,float dt){
    float remaining=fminf(fmaxf(dt,0),.1f);
    while(remaining>0){float h=fminf(1.0f/120,remaining);remaining-=h;
        float a=-s->omega*s->omega*(s->value-s->target)-2*s->zeta*s->omega*s->velocity;
        s->velocity+=a*h;s->value+=s->velocity*h;
    }return s->value;
}
