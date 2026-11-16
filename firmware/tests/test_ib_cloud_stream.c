#include "test_common.h"
#include "ib_cloud_stream.h"
#include <stdlib.h>
static uint8_t output[1024];
static size_t output_n;
static bool emit(const uint8_t *p, size_t n, void *ctx) {
    (void)ctx; if (output_n + n > sizeof(output)) return false;
    memcpy(output + output_n, p, n); output_n += n; return true;
}
int main(void) {
    ib_audio_json_t s; ib_audio_json_init(&s, emit, NULL);
    const char *json = "{\"data\":{\"audio\":\"0001fF80\",\"status\":2},\"base_resp\":{\"status_code\":0}}";
    for (size_t i = 0; json[i]; i++) CHECK(ib_audio_json_feed(&s, json[i]));
    CHECK(ib_audio_json_finish(&s)); CHECK(output_n == 4); CHECK(output[2] == 255);
    CHECK_STR(s.metadata, "{\"data\":{\"audio\":\"\",\"status\":2},\"base_resp\":{\"status_code\":0}}");
    ib_audio_json_init(&s, emit, NULL);
    const char *bad = "{\"audio\":\"0\"}";
    bool ok = true; for (size_t i = 0; bad[i] && ok; i++) ok = ib_audio_json_feed(&s, bad[i]);
    CHECK(!ok); CHECK(!ib_audio_json_finish(&s));
    ib_audio_json_init(&s, emit, NULL);
    CHECK(ib_audio_json_feed(&s, '{')); for (int i = 0; i < 5000; i++) ib_audio_json_feed(&s, ' ');
    CHECK(s.failed);
    uint8_t wav[44]; ib_wav_header(wav, 960000);
    CHECK(memcmp(wav, "RIFF", 4) == 0); CHECK(wav[34] == 16); CHECK(wav[24] == 0x80 && wav[25] == 0x3e);
    CHECK(ib_utf8_prefix("A中B", 5, 2) == 1); CHECK(ib_utf8_prefix("A中B", 5, 4) == 4);
    ib_voice_stats_t voice={0};int16_t samples[320]={0};
    for(int i=0;i<15;i++)ib_voice_analyze(&voice,samples,320);
    CHECK(!ib_voice_present(&voice));
    for(int i=0;i<320;i++)samples[i]=1000;
    memset(&voice,0,sizeof(voice));
    for(int i=0;i<15;i++)ib_voice_analyze(&voice,samples,320);
    CHECK(!ib_voice_present(&voice));
    for(int i=0;i<320;i++)samples[i]=(i%2)?1200:-1200;
    memset(&voice,0,sizeof(voice));
    for(int i=0;i<15;i++)ib_voice_analyze(&voice,samples,320);
    CHECK(ib_voice_present(&voice));
    output_n=0;ib_json_writer_t writer={.output=emit};
    CHECK(ib_json_write(&writer,"{\"text\":"));CHECK(ib_json_string(&writer,"A\"\\\n\t\x01"));CHECK(ib_json_write(&writer,"}"));
    const char *encoded="{\"text\":\"A\\\"\\\\\\u000a\\u0009\\u0001\"}";
    CHECK(output_n==strlen(encoded));CHECK(!memcmp(output,encoded,output_n));
    ib_json_writer_t count={0};CHECK(ib_json_write(&count,"{\"text\":"));CHECK(ib_json_string(&count,"A\"\\\n\t\x01"));CHECK(ib_json_write(&count,"}"));CHECK(count.total==writer.total);
    char long_text[2049];memset(long_text,'x',2048);long_text[2048]=0;count=(ib_json_writer_t){0};CHECK(ib_json_string(&count,long_text));CHECK(count.total==2050);
    output_n=0;writer=(ib_json_writer_t){.output=emit};CHECK(!ib_json_string(&writer,long_text));CHECK(writer.failed);
    TEST_DONE("cloud_stream");
}
