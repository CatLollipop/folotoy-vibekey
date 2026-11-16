#include "test_common.h"
#include "ib_asr_events.h"
static ib_asr_json_t json;
static void parse(const char *wire,size_t chunk){size_t n=strlen(wire);ib_asr_json_init(&json);for(size_t pos=0;pos<n;pos+=chunk){size_t take=n-pos<chunk?n-pos:chunk;CHECK(ib_asr_json_feed(&json,wire+pos,take));}CHECK(ib_asr_json_finish_document(&json));}
static void invalid(const char *wire){ib_asr_json_init(&json);bool valid=ib_asr_json_feed(&json,wire,strlen(wire));CHECK(!valid||!ib_asr_json_finish_document(&json));}
int main(void){
    const char wire[]="{\"result\":{\"text\":\"\\u4f60\\u597d\\ud83d\\ude00\",\"utterances\":[{\"text\":\"DO NOT COLLECT\",\"begin_time\":1.4e+2,\"end_time\":null,\"definite\":true}]},\"audio_info\":{\"duration\":10}}";
    for(unsigned chunk=1;chunk<sizeof(wire);chunk++){parse(wire,chunk);CHECK_STR(json.event.text,"你好😀");CHECK(json.event.has_text);}
    parse("{\"result\":[{\"text\":\"first\"},{\"text\":\"ignored\"}]}",1);CHECK_STR(json.event.text,"first");
    invalid("{\"result\":{\"text\":\"one\",\"text\":\"two\"}}");invalid("{\"result\":{\"text\":\"\\ud800x\"}}");invalid("{\"result\":{\"text\":\"\\udc00\"}}");invalid("{\"result\":{\"text\":\"\xC0\x80\"}}");invalid("{\"result\":{\"text\":false}}");invalid("{\"unused\":[1,]}");invalid("{\"unused\":1,}");invalid("{\"unused\":01}");invalid("{\"unused\":1e}");
    parse("{}",1);CHECK(!json.event.has_text); // 中间服务确认允许无识别正文。
    ib_asr_json_init(&json);const char *prefix="{\"result\":{\"text\":\"ok\",\"words\":[";CHECK(ib_asr_json_feed(&json,prefix,strlen(prefix)));
    for(unsigned i=0;i<1000;i++){const char *v=i?",{\"text\":\"hello\",\"timestamp\":123}":"{\"text\":\"hello\",\"timestamp\":123}";CHECK(ib_asr_json_feed(&json,v,strlen(v)));}
    CHECK(ib_asr_json_feed(&json,"]}}",3));CHECK(ib_asr_json_finish_document(&json));CHECK_STR(json.event.text,"ok");
    ib_asr_json_init(&json);for(unsigned i=0;i<IB_ASR_MESSAGE_MAX;i++)CHECK(ib_asr_json_feed(&json," ",1));CHECK(!ib_asr_json_feed(&json," ",1));
    TEST_DONE("asr_events");
}
