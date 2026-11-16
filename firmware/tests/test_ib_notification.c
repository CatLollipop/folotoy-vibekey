#include "test_common.h"
#include "ib_notification.h"
#include "ib_crc32.h"
static const char *A="00000000000000000000000000000001",*B="00000000000000000000000000000002";
int main(void){
    const char *text="电脑任务完成：完整中文正文。";size_t size=strlen(text);uint32_t crc=ib_crc32(text,size);char out[2100];ib_notification_snapshot_t view;
    CHECK_STR(ib_notification_begin(IB_LINK_USB,A,1,"Codex",IB_NOTIFICATION_DONE,size,crc,false,true),"busy");ib_notification_snapshot(&view);CHECK(!view.active&&!view.generation);
    CHECK(ib_notification_begin(IB_LINK_USB,A,1,"Codex",IB_NOTIFICATION_DONE,size,crc,false,false)==NULL);
    ib_notification_snapshot(&view);uint32_t gen=view.generation;CHECK(view.active&&view.staging&&!view.committed);CHECK(ib_notification_read(gen,0,out,sizeof(out),NULL)==0);
    CHECK_STR(ib_notification_chunk(IB_LINK_WIFI,A,1,0,text,size),"upload_owner");CHECK_STR(ib_notification_commit(IB_LINK_USB,A,1,size,crc),"invalid_size");
    CHECK(ib_notification_chunk(IB_LINK_USB,A,1,0,text,size)==NULL);CHECK(ib_notification_chunk(IB_LINK_USB,A,1,0,text,size)==NULL);
    CHECK_STR(ib_notification_begin(IB_LINK_USB,A,1,"Codex",IB_NOTIFICATION_DONE,size,crc+1,false,false),"identity_conflict");
    CHECK_STR(ib_notification_chunk(IB_LINK_USB,A,1,0,"wrong",5),"identity_conflict");
    CHECK(ib_notification_commit(IB_LINK_USB,A,1,size,crc)==NULL);CHECK(ib_notification_commit(IB_LINK_WIFI,A,1,size,crc)==NULL);
    CHECK(ib_notification_read(gen,0,out,sizeof(out),NULL)==size);CHECK(!memcmp(out,text,size));CHECK(ib_notification_presented(gen));CHECK(!ib_notification_presented(gen));
    CHECK_STR(ib_notification_begin(IB_LINK_USB,B,1,"Kimi",IB_NOTIFICATION_DONE,0,0,false,false),"busy");
    CHECK_STR(ib_notification_begin(IB_LINK_USB,A,2,"Other",IB_NOTIFICATION_DONE,size,crc,false,false),"identity_conflict");
    // 同id高rev复用唯一正文，旧gen即失效；完整校验发布后不再响第二次。
    CHECK(ib_notification_begin(IB_LINK_WIFI,A,2,"Codex",IB_NOTIFICATION_DONE,size,crc,true,false)==NULL);CHECK(ib_notification_read(gen,0,out,sizeof(out),NULL)==0);
    CHECK_STR(ib_notification_chunk(IB_LINK_USB,A,2,0,text,size),"upload_owner");CHECK(ib_notification_chunk(IB_LINK_WIFI,A,2,0,text,size)==NULL);CHECK(ib_notification_commit(IB_LINK_WIFI,A,2,size,crc)==NULL);
    ib_notification_snapshot(&view);CHECK(view.generation!=gen&&view.truncated&&view.offset==size);CHECK(!ib_notification_presented(view.generation));
    CHECK_STR(ib_notification_clear(A,1),"stale_revision");CHECK_STR(ib_notification_abort(IB_LINK_WIFI,A,2),"already_committed");
    gen=view.generation;ib_notification_dismiss();CHECK(ib_notification_read(gen,0,out,sizeof(out),NULL)==0);
    CHECK(ib_notification_begin(IB_LINK_USB,A,2,"Codex",IB_NOTIFICATION_DONE,size,crc,true,false)==NULL);CHECK(ib_notification_commit(IB_LINK_USB,A,2,size,crc)==NULL);ib_notification_snapshot(&view);CHECK(!view.active); //lost ACK不会复活。
    CHECK(ib_notification_begin(IB_LINK_USB,B,1,"Kimi",IB_NOTIFICATION_INPUT,0,0,false,false)==NULL);CHECK(ib_notification_commit(IB_LINK_USB,B,1,0,0)==NULL);ib_notification_snapshot(&view);CHECK(ib_notification_presented(view.generation));
    ib_notification_dismiss();CHECK(ib_notification_begin(IB_LINK_USB,B,2,"Kimi",IB_NOTIFICATION_INPUT,3,1,false,false)==NULL);
    CHECK_STR(ib_notification_chunk(IB_LINK_USB,B,2,0,"\xc0\x80",2),"invalid_chunk");CHECK(ib_notification_chunk(IB_LINK_USB,B,2,0,"abc",3)==NULL);CHECK_STR(ib_notification_commit(IB_LINK_USB,B,2,3,1),"crc_mismatch");
    CHECK_STR(ib_notification_abort(IB_LINK_WIFI,B,2),"upload_owner");CHECK(ib_notification_abort(IB_LINK_USB,B,2)==NULL);
    CHECK(ib_notification_begin(IB_LINK_WIFI,B,2,"Kimi",IB_NOTIFICATION_INPUT,3,1,false,false)==NULL);ib_notification_snapshot(&view);CHECK(view.staging&&view.offset==0);CHECK(ib_notification_abort(IB_LINK_WIFI,B,2)==NULL);
    // 最大正文按连续UTF8块上传，重复块/任意reader边界不丢字节。
    char max[IB_NOTIFICATION_MAX+1];memset(max,'x',IB_NOTIFICATION_MAX);max[IB_NOTIFICATION_MAX]=0;uint32_t sum=ib_crc32(max,IB_NOTIFICATION_MAX);
    CHECK(ib_notification_begin(IB_LINK_USB,B,3,"Kimi",IB_NOTIFICATION_INPUT,IB_NOTIFICATION_MAX,sum,false,false)==NULL);
    for(size_t off=0;off<IB_NOTIFICATION_MAX;){size_t n=IB_NOTIFICATION_MAX-off;if(n>96)n=96;CHECK(ib_notification_chunk(IB_LINK_USB,B,3,off,max+off,n)==NULL);off+=n;}
    CHECK(ib_notification_commit(IB_LINK_USB,B,3,IB_NOTIFICATION_MAX,sum)==NULL);ib_notification_snapshot(&view);size_t total=0;
    while(total<IB_NOTIFICATION_MAX){size_t n=ib_notification_read(view.generation,total,out,31,NULL);CHECK(n>0);for(size_t i=0;i<n;i++)CHECK(out[i]=='x');total+=n;}CHECK(total==IB_NOTIFICATION_MAX);
    ib_notification_dismiss();TEST_DONE("notification");
}
