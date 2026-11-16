#include "ib_asr_events.h"
#include <string.h>

enum { ROOT=1, IGNORED, RESULT, RESULT_ARRAY };
enum { OBJ_FIRST=1, OBJ_KEY, OBJ_COLON, OBJ_VALUE, OBJ_NEXT, ARR_FIRST, ARR_VALUE, ARR_NEXT };
enum { K_NONE, K_TEXT, K_RESULT };
enum { L_NONE, L_STRING, L_ATOM };
static bool bad(ib_asr_json_t *s){s->failed=true;return false;}
static bool space(unsigned c){return c==' '||c=='\t'||c=='\n'||c=='\r';}
static unsigned key_name(const char *k){
    static const char *const names[]={"","text","result"};
    for(unsigned i=1;i<sizeof(names)/sizeof(names[0]);i++)if(!strcmp(k,names[i]))return i;
    return K_NONE;
}
void ib_asr_json_init(ib_asr_json_t *s){memset(s,0,sizeof(*s));}
static unsigned selected(const ib_asr_json_t *s){
    if(!s->depth)return K_NONE;
    const ib_asr_json_frame_t *f=&s->frames[s->depth-1];
    if(f->kind==RESULT&&f->key==K_TEXT)return K_TEXT;
    return K_NONE;
}
static unsigned child_kind(const ib_asr_json_t *s){
    if(!s->depth)return ROOT;
    const ib_asr_json_frame_t *f=&s->frames[s->depth-1];
    if(f->kind==ROOT&&f->key==K_RESULT)return RESULT;
    if(f->kind==RESULT_ARRAY&&!f->key)return RESULT;
    return IGNORED;
}
static bool complete(ib_asr_json_t *s){
    if(!s->depth){if(s->root_done)return bad(s);s->root_done=true;return true;}
    ib_asr_json_frame_t *f=&s->frames[s->depth-1];
    if(f->stage==OBJ_VALUE)f->stage=OBJ_NEXT;
    else if(f->stage==ARR_FIRST||f->stage==ARR_VALUE){f->stage=ARR_NEXT;if(f->kind==RESULT_ARRAY)f->key=1;}
    else return bad(s);
    return true;
}
static bool mark(ib_asr_json_t *s,unsigned field){
    if(field){uint32_t bit=1u<<field;if(s->seen&bit)return bad(s);s->seen|=bit;}
    return true;
}
static bool decoded(ib_asr_json_t *s,unsigned char c){
    if(s->key_string){if(!c)return bad(s);if(s->token_used+1<sizeof(s->token))s->token[s->token_used++]=(char)c;else s->token_used=sizeof(s->token)-1;return true;}
    if(s->field!=K_TEXT)return true;
    char *out=s->event.text;size_t cap=sizeof(s->event.text);
    if(s->string_used+1>=cap){s->text_full=s->field==K_TEXT;return bad(s);}
    if(!c)return bad(s);
    out[s->string_used++]=(char)c;out[s->string_used]=0;return true;
}
static bool codepoint(ib_asr_json_t *s,uint32_t cp){
    if(cp<0x80)return decoded(s,cp);
    if(cp<0x800)return decoded(s,0xC0|(cp>>6))&&decoded(s,0x80|(cp&63));
    if(cp<0x10000)return decoded(s,0xE0|(cp>>12))&&decoded(s,0x80|((cp>>6)&63))&&decoded(s,0x80|(cp&63));
    return decoded(s,0xF0|(cp>>18))&&decoded(s,0x80|((cp>>12)&63))&&decoded(s,0x80|((cp>>6)&63))&&decoded(s,0x80|(cp&63));
}
static int hex(unsigned c){if(c>='0'&&c<='9')return c-'0';if(c>='a'&&c<='f')return c-'a'+10;if(c>='A'&&c<='F')return c-'A'+10;return -1;}
static bool string_char(ib_asr_json_t *s,unsigned c){
    if(s->unicode_left){
        int v=hex(c);if(v<0)return bad(s);s->unicode=(s->unicode<<4)|v;
        if(--s->unicode_left)return true;
        uint32_t cp=s->unicode;
        if(s->high_surrogate){if(cp<0xDC00||cp>0xDFFF)return bad(s);cp=0x10000+((s->high_surrogate-0xD800)<<10)+(cp-0xDC00);s->high_surrogate=0;s->need_low_surrogate=false;}
        else if(cp>=0xD800&&cp<=0xDBFF){s->high_surrogate=cp;s->need_low_surrogate=true;return true;}
        else if(cp>=0xDC00&&cp<=0xDFFF)return bad(s);
        return codepoint(s,cp);
    }
    if(s->escaped){s->escaped=false;
        if(s->need_low_surrogate&&c!='u')return bad(s);
        if(c=='u'){s->unicode=s->unicode_left=0;s->unicode_left=4;return true;}
        const char *esc="\"\\/bfnrt",*map="\"\\/\b\f\n\r\t";const char *p=strchr(esc,c);
        if(!p)return bad(s);
        return decoded(s,map[p-esc]);
    }
    if(s->utf8_left){if((c&0xC0)!=0x80)return bad(s);s->utf8_value=(s->utf8_value<<6)|(c&63);if(!--s->utf8_left&&(s->utf8_value<s->utf8_min||s->utf8_value>0x10FFFF||(s->utf8_value>=0xD800&&s->utf8_value<=0xDFFF)))return bad(s);return decoded(s,c);}
    if(s->need_low_surrogate&&c!='\\')return bad(s);
    if(c=='\\'){s->escaped=true;return true;}
    if(c=='"'){
        if(s->key_string){s->token[s->token_used]=0;ib_asr_json_frame_t *f=&s->frames[s->depth-1];f->key=key_name(s->token);f->stage=OBJ_COLON;}
        else {if(s->field==K_TEXT)s->event.has_text=true;if(!complete(s))return false;}
        s->lex=L_NONE;return true;
    }
    if(c<32)return bad(s);
    if(c>=0x80){if(c>=0xC2&&c<=0xDF){s->utf8_left=1;s->utf8_min=0x80;s->utf8_value=c&31;}else if(c>=0xE0&&c<=0xEF){s->utf8_left=2;s->utf8_min=0x800;s->utf8_value=c&15;}else if(c>=0xF0&&c<=0xF4){s->utf8_left=3;s->utf8_min=0x10000;s->utf8_value=c&7;}else return bad(s);}
    return decoded(s,c);
}
static bool number_valid(const char *p){
    if(*p=='-')p++;
    if(*p=='0')p++;else{if(*p<'1'||*p>'9')return false;while(*p>='0'&&*p<='9')p++;}
    if(*p=='.'){p++;if(*p<'0'||*p>'9')return false;while(*p>='0'&&*p<='9')p++;}
    if(*p=='e'||*p=='E'){p++;if(*p=='+'||*p=='-')p++;if(*p<'0'||*p>'9')return false;while(*p>='0'&&*p<='9')p++;}
    return !*p;
}
static bool atom_end(ib_asr_json_t *s){
    s->token[s->token_used]=0;const char *t=s->token;
    bool truth=!strcmp(t,"true"),falsehood=!strcmp(t,"false"),null=!strcmp(t,"null");
    if(!truth&&!falsehood&&!null&&!number_valid(t))return bad(s);
    if(s->field)return bad(s);
    s->lex=L_NONE;return complete(s);
}
static bool value_start(ib_asr_json_t *s,unsigned c){
    s->field=selected(s);if(!mark(s,s->field))return false;
    if(c=='{'||c=='['){if(s->field||s->depth==16||(!s->depth&&c!='{'))return bad(s);unsigned kind=c=='{'?child_kind(s):s->depth&&s->frames[s->depth-1].kind==ROOT&&s->frames[s->depth-1].key==K_RESULT?RESULT_ARRAY:IGNORED;s->frames[s->depth++]=(ib_asr_json_frame_t){kind,c=='{'?OBJ_FIRST:ARR_FIRST,0};return true;}
    if(!s->depth)return bad(s);
    s->token_used=s->string_used=0;s->escaped=false;s->key_string=false;
    if(c=='"'){s->lex=L_STRING;return true;}
    s->lex=L_ATOM;s->token[s->token_used++]=c;return true;
}
static bool feed_one(ib_asr_json_t *s,unsigned c){
    if(!c)return bad(s);
    if(s->lex==L_STRING)return string_char(s,c);
    if(s->lex==L_ATOM){if(!space(c)&&c!=','&&c!='}'&&c!=']'){if(s->token_used+1>=sizeof(s->token))return bad(s);s->token[s->token_used++]=c;return true;}if(!atom_end(s))return false;}
    if(space(c))return true;
    if(s->root_done)return bad(s);
    if(!s->depth)return value_start(s,c);
    ib_asr_json_frame_t *f=&s->frames[s->depth-1];
    if((f->stage==OBJ_FIRST||f->stage==OBJ_NEXT)&&c=='}'){s->depth--;return complete(s);}
    if((f->stage==ARR_FIRST||f->stage==ARR_NEXT)&&c==']'){s->depth--;return complete(s);}
    if(f->stage==OBJ_FIRST||f->stage==OBJ_KEY){if(c!='"')return bad(s);s->lex=L_STRING;s->key_string=true;s->token_used=0;s->escaped=false;return true;}
    if(f->stage==OBJ_COLON){if(c!=':')return bad(s);f->stage=OBJ_VALUE;return true;}
    if(f->stage==OBJ_NEXT){if(c!=',')return bad(s);f->stage=OBJ_KEY;return true;}
    if(f->stage==ARR_NEXT){if(c!=',')return bad(s);f->stage=ARR_VALUE;return true;}
    return value_start(s,c);
}
bool ib_asr_json_feed(ib_asr_json_t *s,const void *bytes,size_t size){
    const unsigned char *p=bytes;if(s->failed||size>IB_ASR_MESSAGE_MAX-s->bytes)return bad(s);s->bytes+=size;
    for(size_t i=0;i<size;i++)if(!feed_one(s,p[i]))return false;
    return true;
}
bool ib_asr_json_finish_document(ib_asr_json_t *s){return !s->failed&&s->root_done&&!s->depth&&s->lex==L_NONE;}
