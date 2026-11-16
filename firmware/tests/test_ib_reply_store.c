#include "test_common.h"
#include "ib_reply_store.h"
#include <stdlib.h>
int main(void){
    ib_reply_snapshot_t view;char out[4100],*writer=NULL;
    CHECK_STR(ib_reply_store_begin(0,NULL),"invalid_generation");
    CHECK(ib_reply_store_begin(1,NULL)==NULL);CHECK(ib_reply_store_append(1,0,"你好",6)==NULL);
    CHECK_STR(ib_reply_store_append(1,0,"旧",3),"invalid_offset");CHECK(ib_reply_store_read(1,0,out,4,NULL)==3);CHECK(ib_reply_store_read(1,1,out,4,NULL)==0);
    CHECK(ib_reply_store_read(1,0,out,2,NULL)==0);CHECK(ib_reply_store_read(9,0,out,20,NULL)==0);
    CHECK(ib_reply_store_begin(1,NULL)==NULL);ib_reply_store_snapshot(&view);CHECK(view.length==6);
    CHECK_STR(ib_reply_store_final(1,7),"invalid_size");CHECK(ib_reply_store_final(1,6)==NULL);CHECK(ib_reply_store_final(1,6)==NULL);
    CHECK_STR(ib_reply_store_append(1,6,"x",1),"stale_generation");
    ib_reply_store_clear(99);ib_reply_store_snapshot(&view);CHECK(view.active&&view.final);
    ib_reply_store_clear(1);CHECK(ib_reply_store_read(1,0,out,20,NULL)==0);CHECK_STR(ib_reply_store_begin(1,NULL),"stale_generation");
    CHECK(ib_reply_store_begin(2,&writer)==NULL);CHECK(writer);memcpy(writer,"回复",6);writer[6]=0;
    CHECK(ib_reply_store_publish(2,6));CHECK_STR(ib_reply_store_begin(3,NULL),"busy");
    memcpy(writer+6,"全文。",9);writer[15]=0;CHECK(ib_reply_store_publish(2,15));
    CHECK(ib_reply_store_worker_end(2,true));CHECK(ib_reply_store_read(2,0,out,sizeof(out),NULL)==15);out[15]=0;CHECK_STR(out,"回复全文。");
    CHECK(ib_reply_store_begin(3,&writer)==NULL);memcpy(writer,"partial",7);writer[7]=0;CHECK(ib_reply_store_publish(3,7));
    ib_reply_store_clear(0);memcpy(writer+7,"cancelled-in-flight",19); //清理不能提前释放仍被网络写者持有的buffer。
    CHECK(!ib_reply_store_publish(3,26));CHECK(!ib_reply_store_worker_end(3,false));CHECK(ib_reply_store_read(3,0,out,sizeof(out),NULL)==0);
    CHECK(ib_reply_store_begin(4,NULL)==NULL);CHECK_STR(ib_reply_store_append(4,0,"\xc0\x80",2),"invalid_reply");CHECK_STR(ib_reply_store_append(4,0,"\xed\xa0\x80",3),"invalid_reply");
    CHECK(ib_reply_store_begin(5,&writer)==NULL);memset(writer,'x',IB_REPLY_TEXT_MAX);writer[IB_REPLY_TEXT_MAX]=0;CHECK(ib_reply_store_publish(5,IB_REPLY_TEXT_MAX));CHECK(ib_reply_store_worker_end(5,true));
    size_t total=0;while(total<IB_REPLY_TEXT_MAX){size_t n=ib_reply_store_read(5,total,out,173,NULL);CHECK(n>0);for(size_t i=0;i<n;i++)CHECK(out[i]=='x');total+=n;}CHECK(total==IB_REPLY_TEXT_MAX);
    ib_reply_store_clear(0);CHECK(ib_reply_store_begin(2000000,NULL)==NULL);CHECK(ib_reply_store_append(2000000,0,"x",1)==NULL);
    ib_reply_store_clear(0);CHECK(ib_reply_store_begin(7,NULL)==NULL);CHECK(ib_reply_store_append(7,0,"new process",11)==NULL);CHECK(ib_reply_store_final(7,11)==NULL);
    ib_reply_store_clear(0);CHECK(ib_reply_store_begin(999,&writer)==NULL);memcpy(writer,"owned",5);writer[5]=0;CHECK(ib_reply_store_publish(999,5));
    ib_reply_store_clear(0);ib_reply_store_snapshot(&view);CHECK(view.generation==999&&!view.active);CHECK(!ib_reply_store_worker_end(999,false));
    ib_reply_store_snapshot(&view);CHECK(view.generation==0);CHECK(ib_reply_store_begin(1,NULL)==NULL);
    ib_reply_store_clear(0);TEST_DONE("reply_store");
}
