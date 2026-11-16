/* Aora Dot 的受限C运行时。关键轮廓由官方0.2.0模拟器提取，动态在设备计算。
 * raster.ts/addCoverage + face.ts/glyph + grid.ts 的算术移植；署名许可见vendor/aora-bot。
 * 通过AORAPET2零拷贝资产支持全部官方角色/脸型；不含动画帧序列。 */
#include "ib_pet.h"
#include "ib_pet_motion.h"
#include "ib_pet_data.h"
#include "ib_pet_bundle.h"
#include <math.h>
#include <string.h>
#define SIZE IB_PET_SIZE
#define CELLS (SIZE*SIZE)
#define MAX_POINTS 256
#define PAPER_COUNT 14
_Static_assert(IB_PET_STATE_COUNT==IB_PET_DEFINITION_COUNT,"Aora state enum must match generated definitions");
static struct {
    ib_pet_state_t state;
    uint16_t pose,previous_pose;
    uint8_t expression,fps,brightness,level,fixed_state;
    bool enabled,has_frame;
    uint32_t entered,last_frame,next_blink,blink_at,next_expression,random,next_impulse;
    float clock,fx_clock;
    uint32_t color;
    ib_pet_spring_t tilt,x,y,squash,blink,morph;
} pet;
/* 官方PAPER参数的有界缩编：14颗×32字节=448B，不分配缓冲或链表。 */
typedef struct {float x,y,vx,vy,age,life,size;uint8_t paint,star;} paper_t;
static paper_t paper[PAPER_COUNT];
/* 栅格工作区静态复用：UI单任务独占，避免大栈和每帧堆碎片。 */
static uint8_t paints[CELLS];
/* 身体边缘完成后才开始脸部覆盖率；生命周期不重叠，复用784B而不降低精度。 */
static union { uint8_t body_mask[CELLS]; float cover[CELLS]; } raster_work;
#define body_mask raster_work.body_mask
#define cover raster_work.cover
static float xy[MAX_POINTS*2],crossings[MAX_POINTS];
static float minf(float a,float b){return a<b?a:b;}
static float maxf(float a,float b){return a>b?a:b;}
static float clampf(float x,float a,float b){return minf(b,maxf(a,x));}
static float random01(void){
    pet.random+=0x6d2b79f5u;uint32_t t=pet.random;
    t=(t^(t>>15))*(t|1u);t^=t+(t^(t>>7))*(t|61u);
    return (float)((t^(t>>14))/4294967296.0);
}
static uint32_t interval(uint16_t a,uint16_t b){return a+(uint32_t)(random01()*(b-a));}
/* 大表始终留在Flash映射中；这里只缓存当前44态之一的28B调度信息。 */
static const uint8_t *asset;
typedef struct {const char *name;uint16_t poses[8];uint8_t count;uint16_t blink_min,blink_max,cycle_min,cycle_max;} state_definition_t;
typedef struct {uint16_t ring;uint8_t group,paint,layer,flags;} pet_part_t;
static state_definition_t current_definition;
static ib_pet_point_t point_at(unsigned i){
    if(!asset)return ib_pet_points[i];
    size_t o=ib_pet_bundle_u32(asset,IBPB_POINT_OFF)+i*4;
    return (ib_pet_point_t){(int16_t)ib_pet_bundle_u16(asset,o),(int16_t)ib_pet_bundle_u16(asset,o+2)};
}
static ib_pet_ring_t ring_at(unsigned i){
    if(!asset)return ib_pet_rings[i];
    size_t o=ib_pet_bundle_u32(asset,IBPB_RING_OFF)+i*8;
    return (ib_pet_ring_t){(uint16_t)ib_pet_bundle_u32(asset,o),ib_pet_bundle_u16(asset,o+4)};
}
static ib_pet_pose_t pose_at(unsigned i){
    if(!asset)return ib_pet_poses[i];
    size_t o=ib_pet_bundle_u32(asset,IBPB_POSE_OFF)+i*8;
    return (ib_pet_pose_t){(uint16_t)ib_pet_bundle_u32(asset,o),ib_pet_bundle_u16(asset,o+4)};
}
static pet_part_t part_at(unsigned i,bool body){
    if(!asset){
        if(body)return (pet_part_t){IB_PET_BODY_RING,0,1,0,0};
        ib_pet_part_t p=ib_pet_parts[i];return (pet_part_t){p.ring,p.group,p.paint,p.layer,0};
    }
    size_t o=ib_pet_bundle_u32(asset,body?IBPB_BODY_OFF:IBPB_PART_OFF)+i*8;
    return (pet_part_t){ib_pet_bundle_u16(asset,o),asset[o+2],asset[o+4],asset[o+3],asset[o+5]};
}
static void refresh_definition(void){
    const ib_pet_definition_t *d=&ib_pet_definitions[pet.state];
    memset(&current_definition,0,sizeof(current_definition));current_definition.name=d->name;
    if(!asset){
        for(unsigned i=0;i<d->count;i++)current_definition.poses[i]=d->poses[i];
        current_definition.count=d->count;current_definition.blink_min=d->blink_min;current_definition.blink_max=d->blink_max;
        current_definition.cycle_min=d->cycle_min;current_definition.cycle_max=d->cycle_max;
    }else{
        size_t o=ib_pet_bundle_u32(asset,IBPB_STATE_OFF)+(unsigned)pet.state*28;
        for(unsigned i=0;i<8;i++)current_definition.poses[i]=ib_pet_bundle_u16(asset,o+i*2);
        current_definition.count=asset[o+16];current_definition.blink_min=ib_pet_bundle_u16(asset,o+18);current_definition.blink_max=ib_pet_bundle_u16(asset,o+20);
        current_definition.cycle_min=ib_pet_bundle_u16(asset,o+22);current_definition.cycle_max=ib_pet_bundle_u16(asset,o+24);
    }
}
static const state_definition_t *definition(void){return &current_definition;}
static ib_pet_spring_t spring(float value,float omega,float zeta){return (ib_pet_spring_t){value,0,value,omega,zeta};}
static void burst(void){
    float offset=random01()*6.283185307f;
    for(int i=0;i<PAPER_COUNT;i++){
        float angle=offset+i*2.399963230f,from=119.7f*(.9f+random01()*.1f),speed=119.7f*(1.4f+random01()*1.4f);
        bool star=i%6==5;
        paper[i]=(paper_t){120+cosf(angle)*from,120+sinf(angle)*from,cosf(angle)*speed,
            sinf(angle)*speed-119.7f*(.2f+random01()*.4f),0,.6f+random01()*.4f,
            star?6.5f+random01()*2.5f:3.5f+random01()*4,(uint8_t)(star?14:7+(i*3)%7),(uint8_t)star};
    }
}

void ib_pet_init(void){
    memset(&pet,0,sizeof(pet));asset=NULL;pet.fixed_state=255;refresh_definition();pet.enabled=true;pet.fps=12;pet.brightness=80;pet.color=0xEADBB9;
    memset(paper,0,sizeof(paper));
    const char *seed="passport-dot";pet.random=0x811c9dc5u;
    while(*seed){pet.random^=(uint8_t)*seed++;pet.random*=16777619u;}
    pet.tilt=spring(0,5,.9f);pet.x=spring(0,3.5f,1);pet.y=spring(0,4,1);
    pet.squash=spring(1,10,.8f);pet.blink=spring(1,26,1);pet.morph=spring(1,8,1);
    pet.pose=pet.previous_pose=ib_pet_definitions[0].poses[0];
    pet.next_blink=interval(definition()->blink_min,definition()->blink_max);
    pet.next_expression=interval(definition()->cycle_min,definition()->cycle_max);
}
void ib_pet_set_state(ib_pet_state_t state,uint32_t now){
    if(state<0||state>=IB_PET_STATE_COUNT)return;
    if(pet.fixed_state!=255)state=(ib_pet_state_t)pet.fixed_state;
    if(state==pet.state)return;
    pet.previous_pose=pet.pose;pet.state=state;refresh_definition();pet.entered=now;pet.expression=0;pet.fx_clock=0;
    if(state==IB_PET_DONE)burst();
    pet.pose=definition()->poses[0];pet.morph=spring(0,8,1);pet.morph.target=1;
    pet.next_blink=now+interval(definition()->blink_min,definition()->blink_max);
    pet.next_expression=now+interval(definition()->cycle_min,definition()->cycle_max);
    pet.next_impulse=now+(state==IB_PET_ERROR?2200:state==IB_PET_RECEIVING?1700:interval(1800,3200));
}
bool ib_pet_set_state_name(const char *state,uint32_t now){
    if(!state)return false;
    for(int i=0;i<IB_PET_DEFINITION_COUNT;i++)if(!strcmp(state,ib_pet_definitions[i].name)){ib_pet_set_state((ib_pet_state_t)i,now);return true;}
    return false;
}
bool ib_pet_state_is_valid(const char *state){
    if(!state)return false;
    for(int i=0;i<IB_PET_DEFINITION_COUNT;i++)if(!strcmp(state,ib_pet_definitions[i].name))return true;
    return false;
}
const char *ib_pet_state_name(void){return definition()->name;}
void ib_pet_set_level(uint8_t level){pet.level=level>100?100:level;}
void ib_pet_configure(bool enabled,uint8_t fps,uint8_t brightness){
    pet.enabled=enabled;pet.fps=fps<6?6:fps>20?20:fps;pet.brightness=brightness<10?10:brightness>100?100:brightness;
}
void ib_pet_set_color(uint32_t rgb){pet.color=rgb&0xffffff;}
bool ib_pet_enabled(void){return pet.enabled;}

/* 与官方scan一致的半开区间规则，边界不重复计数。 */
static int scan(int n,float y){
    int count=0;float px=xy[(n-1)*2],py=xy[(n-1)*2+1];
    for(int i=0;i<n;i++){
        float x=xy[i*2],yy=xy[i*2+1];
        if((py<=y)!=(yy<=y)){
            float x0=px+(y-py)*(x-px)/(yy-py);int j=count++;
            while(j>0&&crossings[j-1]>x0){crossings[j]=crossings[j-1];j--;}
            crossings[j]=x0;
        }px=x;py=yy;
    }return count;
}
static void fill_centres(int n){
    for(int row=0;row<SIZE;row++){
        int count=scan(n,row+.5f);
        for(int i=0;i+1<count;i+=2){
            int from=(int)maxf(0,ceilf(crossings[i]-.5f)),to=(int)minf(SIZE,ceilf(crossings[i+1]-.5f));
            for(int col=from;col<to;col++)body_mask[row*SIZE+col]=1;
        }
    }
}
/* 官方addCoverage：X方向精确覆盖，Y方向六个子采样。 */
static void add_coverage(int n,float sign){
    /* 小眼形通常只有2~5行，扫描整个28行会让C3软浮点做大量无效边测试。
     * 仅剪去必然零覆盖的行/子样本，保留官方半开边界与六次采样结果。 */
    float top=xy[1],bottom=xy[1];
    for(int i=1;i<n;i++){top=minf(top,xy[i*2+1]);bottom=maxf(bottom,xy[i*2+1]);}
    int first=(int)maxf(0,floorf(top)),last=(int)minf(SIZE,ceilf(bottom));
    for(int row=first;row<last;row++)for(int sub=0;sub<6;sub++){
        float y=row+(sub+.5f)/6;if(y<top||y>=bottom)continue;
        int count=scan(n,y);
        for(int i=0;i+1<count;i+=2){
            float a=crossings[i],b=crossings[i+1];
            int from=(int)maxf(0,floorf(a)),to=(int)minf(SIZE-1,floorf(b));
            for(int col=from;col<=to;col++){
                float v=minf(b,col+1)-maxf(a,col);if(v>0)cover[row*SIZE+col]+=v/6*sign;
            }
        }
    }
}
static void put(int x,int y,uint8_t paint){if(x>=0&&x<SIZE&&y>=0&&y<SIZE)paints[y*SIZE+x]=paint;}
static void disc(float x,float y,float radius,uint8_t paint){
    int reach=(int)ceilf(radius),cx=(int)floorf(x),cy=(int)floorf(y);
    put(cx,cy,paint);
    for(int dy=-reach;dy<=reach;dy++)for(int dx=-reach;dx<=reach;dx++){
        float xx=cx+dx+.5f-x,yy=cy+dy+.5f-y;
        if(xx*xx+yy*yy<=radius*radius)put(cx+dx,cy+dy,paint);
    }
}
/* 只画固定28×28小网格：fx-units.ts/fx.ts的原坐标与时序，不做全屏float绘制。 */
static void effects(void){
    const float k=240.0f/100/.86f,t=pet.fx_clock;
    if(pet.state==IB_PET_SLEEPING){
        static const float specs[3][4]={{74,24,5,0},{82,13,6.5f,.8f},{90,2,8,1.6f}};
        static const char glyph[3][4]={"###",".#.","###"};
        for(int i=0;i<3;i++){
            float local=t-specs[i][3];if(local<0)continue;
            float p=fmodf(local,2.4f)/2.4f,opacity=p<.3f?p/.3f:1-(p-.3f)/.7f;
            if(opacity<.5f)continue;
            float rise=1-(1-p)*(1-p),s=specs[i][2];
            float x=(specs[i][0]+s/2+4*rise-7)*k/10+2;
            float y=(specs[i][1]+s/2+4-12*rise-10)*k/10+2;
            int left=(int)roundf(x-1.5f),top=(int)roundf(y-1.5f);
            for(int row=0;row<3;row++)for(int col=0;col<3;col++)if(glyph[row][col]=='#')put(left+col,top+row,6);
        }
    }
    if(pet.state==IB_PET_THINKING){
        static const float specs[3][4]={{78,25,1.9f,0},{85,17.5f,2.7f,.2f},{93,9,3.5f,.4f}};
        for(int i=0;i<3;i++){
            float local=t-specs[i][3],w=local<0?0:.5f-.5f*cosf(fmodf(local,1.2f)/1.2f*6.283185307f);
            if(.35f+.65f*w<.5f)continue;
            float x=(specs[i][0]-7)*k/10+2,y=(specs[i][1]-10)*k/10+2;
            disc(x,y,maxf(.75f,specs[i][2]*k*(.7f+.3f*w)/10),6);
        }
    }
    if(pet.state==IB_PET_ERROR){
        /* 官方bang glyph与1.8s pop节奏；告警不占用新的持久RAM。 */
        static const char glyph[5][3]={"##","##","##","..","##"};
        float p=fmodf(t,1.8f)/1.8f,b=0;
        if(p<.08f){float v=p/.08f;b=1-(1-v)*(1-v);}
        else if(p<.2f){float v=(p-.08f)/.12f;b=(1-v)*(1-v);}
        float x=(88.3f-7)*k/10+2,y=(6-10)*k/10+2-6*b*k/10;
        int left=(int)roundf(x-1),top=(int)roundf(y);
        for(int row=0;row<5;row++)for(int col=0;col<2;col++)if(glyph[row][col]=='#')put(left+col,top+row,15);
    }
    for(int i=0;i<PAPER_COUNT;i++){
        const paper_t *p=&paper[i];if(p->life<=0||p->age>=p->life)continue;
        float x=p->x/10+2,y=p->y/10+2,r=p->size/10;
        disc(x,y,maxf(.55f,r*.5f),p->paint);
        if(p->star&&r>.7f){put((int)floorf(x)-1,(int)floorf(y),p->paint);put((int)floorf(x)+1,(int)floorf(y),p->paint);}
    }
}
static void glyph(uint8_t paint,float anchor_x,float anchor_y,bool wide){
    float best=0;for(int i=0;i<CELLS;i++)best=maxf(best,cover[i]);
    if(best<=0){put((int)floorf(anchor_x),(int)floorf(anchor_y),paint);return;}
    if(best<.55f){
        float sums[SIZE]={0},heaviest=0;int drawn=0;
        for(int a=0;a<SIZE;a++){for(int b=0;b<SIZE;b++)sums[a]+=cover[wide?b*SIZE+a:a*SIZE+b];heaviest=maxf(heaviest,sums[a]);}
        for(int a=0;a<SIZE;a++)if(sums[a]>=maxf(.1f,heaviest*.35f)){
            float weight=0;for(int b=0;b<SIZE;b++)weight+=(b+.5f)*cover[wide?b*SIZE+a:a*SIZE+b];
            int at=(int)minf(SIZE-1,floorf(weight/sums[a]));put(wide?a:at,wide?at:a,paint);drawn++;
        }if(drawn)return;
    }
    float threshold=minf(.45f,maxf(.18f,best*.5f));
    for(int i=0;i<CELLS;i++)if(cover[i]>=threshold)paints[i]=paint;
}
static int transform_ring(uint16_t ring_id,const ib_pet_ring_t *previous,float blend,uint8_t group,bool still){
    ib_pet_ring_t value=ring_at(ring_id);const ib_pet_ring_t *ring=&value;int n=ring->count;
    if(n>MAX_POINTS)return 0;
    float radians=(still?0:pet.tilt.value)*.01745329252f,co=cosf(radians),si=sinf(radians);
    float squash=still?1:pet.squash.value,dx=still?0:pet.x.value,dy=still?0:pet.y.value;
    float blink=still||(group!=1&&group!=2)?1:clampf(pet.blink.value,.05f,1.2f);
    float centre_y=0;
    for(int i=0;i<n;i++)centre_y+=point_at(ring->first+i).y/64.0f;
    centre_y/=n;
    for(int i=0;i<n;i++){
        ib_pet_point_t p=point_at(ring->first+i);float x=p.x/64.0f,y=p.y/64.0f;
        if(previous&&previous->count==ring->count){ib_pet_point_t old=point_at(previous->first+i);x=old.x/64.0f+(x-old.x/64.0f)*blend;y=old.y/64.0f+(y-old.y/64.0f)*blend;}
        y=centre_y+(y-centre_y)*blink;
        float sx=x-120,sy=(y-120)*squash;
        xy[i*2]=(120+co*sx-si*sy+dx)/10+2;
        xy[i*2+1]=(120+si*sx+co*sy+dy)/10+2;
    }return n;
}
static bool edge(int x,int y){
    int i=y*SIZE+x;if(!body_mask[i])return false;
    return x==0||y==0||x==SIZE-1||y==SIZE-1||!body_mask[i-1]||!body_mask[i+1]||!body_mask[i-SIZE]||!body_mask[i+SIZE];
}
static uint32_t lighten(uint32_t color){
    if(color==0xEADBB9)return 0xF0E6CE; /* 官方OKLab shadeHex(cream,.3) */
    uint32_t r=(color>>16)&255,g=(color>>8)&255,b=color&255;
    return ((r+(255-r)*3/10)<<16)|((g+(255-g)*3/10)<<8)|(b+(255-b)*3/10);
}
static void raster(bool still,ib_pet_pixel_fn pixel,void *context){
    memset(paints,0,sizeof(paints));memset(body_mask,0,sizeof(body_mask));
    int n=0;unsigned bodies=asset?ib_pet_bundle_u32(asset,IBPB_BODY_PARTS):1;
    for(unsigned i=0;i<bodies;i++){pet_part_t p=part_at(i,true);if(p.group)continue;n=transform_ring(p.ring,0,1,0,still);if(n>=3)fill_centres(n);}
    float middle=0;int count=0;
    for(int y=0;y<SIZE;y++)for(int x=0;x<SIZE;x++)if(body_mask[y*SIZE+x]){middle+=x+y;count++;paints[y*SIZE+x]=1;}
    if(count)middle/=count;
    for(int y=1;y<SIZE-1;y++)for(int x=1;x<SIZE-1;x++)if(body_mask[y*SIZE+x]&&!edge(x,y)&&x+y<middle&&(edge(x-1,y)||edge(x,y-1)))paints[y*SIZE+x]=5;
    /* 帽子、耳朵内侧、果叶等自有色部件在同一body transform下覆盖，离线无需Mac重发。 */
    for(unsigned i=0;i<bodies;i++){
        pet_part_t p=part_at(i,true);if(!p.group)continue;
        n=transform_ring(p.ring,0,1,0,still);if(n<3)continue;
        for(int row=0;row<SIZE;row++){int crossings_count=scan(n,row+.5f);
            for(int j=0;j+1<crossings_count;j+=2){int from=(int)maxf(0,ceilf(crossings[j]-.5f)),to=(int)minf(SIZE,ceilf(crossings[j+1]-.5f));
                for(int col=from;col<to;col++)paints[row*SIZE+col]=p.paint;
            }
        }
    }
    ib_pet_pose_t pose_value=pose_at(pet.pose),old_value=pose_at(pet.previous_pose);
    const ib_pet_pose_t *pose=&pose_value,*old=&old_value;
    for(int part=0;part<pose->count;){
        pet_part_t first=part_at(pose->first+part,false);
        uint8_t layer=first.layer,paint=first.paint,flags=first.flags;
        float x0=1000,x1=-1000,y0=1000,y1=-1000;
        memset(cover,0,sizeof(cover));
        do {
            pet_part_t p=part_at(pose->first+part,false);
            ib_pet_ring_t previous_value;const ib_pet_ring_t *previous=0;
            if(part<old->count){pet_part_t o=part_at(old->first+part,false);if(o.group==p.group){previous_value=ring_at(o.ring);previous=&previous_value;}}
            n=transform_ring(p.ring,previous,still?1:clampf(pet.morph.value,0,1),p.group,still);
            if(n>=3){
                for(int k=0;k<n;k++){x0=minf(x0,xy[k*2]);x1=maxf(x1,xy[k*2]);y0=minf(y0,xy[k*2+1]);y1=maxf(y1,xy[k*2+1]);}
                add_coverage(n,(p.flags&1)?-1:1);
            }
            part++;
        }while(part<pose->count&&part_at(pose->first+part,false).layer==layer);
        if(flags&2){for(int i=0;i<CELLS;i++)if(cover[i]>=.75f)paints[i]=paint;}
        else if(x0<=x1)glyph(paint,(x0+x1)/2,(y0+y1)/2,x1-x0>=y1-y0);
    }
    if(!still)effects();
    static const uint32_t confetti_colors[]={0xEE5A5E,0xF7803D,0xF0B53A,0x33B477,0x24A6C9,0x3D8BF2,0x9474EA};
    for(int y=0;y<SIZE;y++)for(int x=0;x<SIZE;x++){
        uint8_t p=paints[y*SIZE+x];uint32_t color=p==1||p==6?pet.color:p==5?lighten(pet.color):p==3?0xFFC531:p==4?0x6EC1FF:p>=7&&p<=13?confetti_colors[p-7]:p==14?0xF7C04A:p==15?0xEB4B4F:0x17181D;
        if(asset&&p<ib_pet_bundle_u32(asset,IBPB_PALETTE_COUNT))color=ib_pet_bundle_u32(asset,ib_pet_bundle_u32(asset,IBPB_PALETTE_OFF)+p*4);
        pixel((uint8_t)x,(uint8_t)y,color,pet.brightness,context);
    }
}
bool ib_pet_render(uint32_t now,ib_pet_pixel_fn pixel,void *context){
    if(!pixel)return false;
    if(pet.has_frame&&(uint32_t)(now-pet.last_frame)<1000/pet.fps)return false;
    float dt=pet.has_frame?minf((uint32_t)(now-pet.last_frame)/1000.0f,.1f):0;
    pet.has_frame=true;pet.last_frame=now;pet.clock+=dt;pet.fx_clock+=dt;
    float keep=expf(-2.2f*dt),fall=1.5f*119.7f*dt;
    for(int i=0;i<PAPER_COUNT;i++)if(paper[i].life>0&&paper[i].age<paper[i].life){
        paper[i].age+=dt;paper[i].vx*=keep;paper[i].vy=paper[i].vy*keep+fall;
        paper[i].x+=paper[i].vx*dt;paper[i].y+=paper[i].vy*dt;
    }
    uint32_t age=now-pet.entered;
    if((pet.state==IB_PET_WAKING&&age>=1600)||(pet.state==IB_PET_SPAWNING&&age>=2000))ib_pet_set_state(IB_PET_IDLE,now);
    const state_definition_t *d=definition();
    if(d->cycle_max&&(int32_t)(now-pet.next_expression)>=0){
        pet.previous_pose=pet.pose;pet.expression=(pet.expression+1)%d->count;pet.pose=d->poses[pet.expression];
        pet.morph=spring(0,8,1);pet.morph.target=1;pet.next_expression=now+interval(d->cycle_min,d->cycle_max);
    }
    if(d->blink_max&&(int32_t)(now-pet.next_blink)>=0){pet.blink_at=now;pet.next_blink=now+interval(d->blink_min,d->blink_max);}
    uint32_t blink_age=now-pet.blink_at;
    pet.blink.target=pet.blink_at&&blink_age<70?.05f:pet.blink_at&&blink_age<220?1.08f:1;
    ib_pet_targets_t target=ib_pet_motion(d->name,(uint32_t)(now-pet.entered)/1000.0f,pet.clock);
    pet.tilt.target=target.tilt;pet.x.target=target.x;pet.y.target=target.y;pet.squash.target=target.squash;
    if((int32_t)(now-pet.next_impulse)>=0){
        if(pet.state==IB_PET_ANGRY)pet.y.velocity+=70;
        if(pet.state==IB_PET_LISTENING)pet.y.velocity+=26;
        if(pet.state==IB_PET_ERROR)pet.y.velocity+=48;
        if(pet.state==IB_PET_RECEIVING)pet.y.velocity-=18;
        pet.next_impulse=now+(pet.state==IB_PET_ERROR?2200:pet.state==IB_PET_RECEIVING?1700:interval(1800,3200));
    }
    ib_pet_step_spring(&pet.tilt,dt);ib_pet_step_spring(&pet.x,dt);ib_pet_step_spring(&pet.y,dt);
    ib_pet_step_spring(&pet.squash,dt);ib_pet_step_spring(&pet.blink,dt);ib_pet_step_spring(&pet.morph,dt);
    raster(false,pixel,context);return true;
}
void ib_pet_render_static(ib_pet_state_t state,ib_pet_pixel_fn pixel,void *context){
    if(!pixel||state<0||state>=IB_PET_STATE_COUNT)return;
    ib_pet_state_t saved_state=pet.state;uint16_t saved=pet.pose;pet.state=state;refresh_definition();pet.pose=definition()->poses[0];raster(true,pixel,context);pet.state=saved_state;refresh_definition();pet.pose=saved;
}

/* 只在LVGL/UI锁内调用；调用方在返回true后才能unmap旧bank。失败保持旧资产完整可用。 */
bool ib_pet_load_bundle(const void *data,size_t size){
    if(!data&&size==0){ib_pet_init();return true;}
    if(!ib_pet_bundle_validate(data,size,0))return false;
    const uint8_t *p=data;
    ib_pet_init();asset=p;pet.enabled=p[20]!=0;pet.fps=p[21];pet.brightness=p[22];pet.fixed_state=p[23];pet.color=ib_pet_bundle_u32(p,24);
    refresh_definition();pet.pose=pet.previous_pose=definition()->poses[0];
    pet.next_blink=interval(definition()->blink_min,definition()->blink_max);
    pet.next_expression=interval(definition()->cycle_min,definition()->cycle_max);
    if(pet.fixed_state!=255)ib_pet_set_state((ib_pet_state_t)pet.fixed_state,0);
    return true;
}
