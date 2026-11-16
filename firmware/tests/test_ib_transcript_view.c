#include "ib_transcript_view.h"
#include <assert.h>
#include <stdio.h>
#include <string.h>
int main(void){
    ib_transcript_view_t view={0};
    assert(!ib_transcript_view_begin(&view,0));assert(ib_transcript_view_begin(&view,1));
    assert(ib_transcript_view_update(&view,1,"实际识别的当前文本",false));
    assert(ib_transcript_view_update(&view,1,"实际识别的修正文本",false));
    assert(!strcmp(view.text,"实际识别的修正文本"));
    assert(ib_transcript_view_begin(&view,1));assert(view.text[0]);
    assert(ib_transcript_view_begin(&view,2));assert(!view.text[0]);
    assert(!ib_transcript_view_update(&view,1,"上一轮迟到",true));
    assert(!ib_transcript_view_begin(&view,1));
    assert(ib_transcript_view_update(&view,2,"最终文本",true));
    assert(!ib_transcript_view_update(&view,2,"迟到partial",false));assert(!strcmp(view.text,"最终文本"));
    ib_transcript_view_clear(&view,1);assert(view.active);
    ib_transcript_view_clear(&view,2);assert(!view.active&&!view.text[0]);
    assert(!ib_transcript_view_update(&view,2,"取消后迟到",true));
    assert(ib_transcript_view_begin(&view,3));
    assert(!ib_transcript_view_update(&view,3,"\xc0\xaf",false));
    assert(!ib_transcript_view_update(&view,3,"\xed\xa0\x80",false));
    char long_text[600];size_t n=0;
    for(unsigned i=0;i<120;i++){memcpy(long_text+n,"中文",6);n+=6;if(n+6>=sizeof(long_text))break;}long_text[n]=0;
    assert(ib_transcript_view_update(&view,3,long_text,false));assert(strlen(view.text)<=192);
    assert((unsigned char)view.text[0]>=0xe0);assert(strstr(view.text,"中文"));
    assert(ib_transcript_view_update(&view,3,"空格\n换行\r保留",false));assert(!strchr(view.text,'\n')&&!strchr(view.text,'\r'));
    ib_transcript_view_clear(&view,0);assert(!ib_transcript_view_begin(&view,3));
    view.generation=UINT32_MAX;assert(ib_transcript_view_begin(&view,1));
    puts("Transcript view: generation isolation, real snapshot replacement, final freeze, cancel, UTF-8 tail and wraparound passed.");
}
