#include "ib_cloud_stream.h"
#include <string.h>

static int hex(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}
void ib_audio_json_init(ib_audio_json_t *s, ib_stream_bytes_cb cb, void *ctx) {
    memset(s, 0, sizeof(*s)); s->nibble = -1; s->output = cb; s->context = ctx;
}
static bool fail(ib_audio_json_t *s,ib_audio_json_error_t error){
    s->failed=true;s->error=error;return false;
}
static bool append(ib_audio_json_t *s, char c) {
    if (s->used + 1 >= sizeof(s->metadata)) return fail(s,IB_AUDIO_JSON_METADATA_FULL);
    s->metadata[s->used++] = c; s->metadata[s->used] = 0; return true;
}
static bool flush(ib_audio_json_t *s) {
    if (s->byte_count && s->output && !s->output(s->bytes, s->byte_count, s->context)) {
        return fail(s,IB_AUDIO_JSON_OUTPUT_FAILED);
    }
    s->byte_count = 0; return true;
}
bool ib_audio_json_feed(ib_audio_json_t *s, char c) {
    if (s->failed) return false;
    if (s->audio) {
        if (c == '"') {
            if (s->nibble >= 0) return fail(s,IB_AUDIO_JSON_ODD_HEX);
            if (!flush(s)) return false;
            s->audio = s->in_string = false; s->after_colon = s->key_audio = false;
            return append(s, c);
        }
        int n = hex(c);
        if (n < 0) return fail(s,IB_AUDIO_JSON_INVALID_HEX);
        if (s->nibble < 0) s->nibble = n;
        else {
            s->bytes[s->byte_count++] = (uint8_t)((s->nibble << 4) | n);
            s->audio_bytes++; s->nibble = -1;
            if (s->byte_count == sizeof(s->bytes)) return flush(s);
        }
        return true;
    }
    if (!append(s, c)) return false;
    if (s->in_string) {
        if (s->escaped) { s->escaped = false; return true; }
        if (c == '\\') { s->escaped = true; return true; }
        if (c == '"') {
            s->in_string = false; s->token[s->token_used] = 0;
            s->key_audio = !s->after_colon && strcmp(s->token, "audio") == 0;
            s->after_colon = false;
        } else if (s->token_used + 1 < sizeof(s->token)) s->token[s->token_used++] = c;
        return true;
    }
    if (c == '"') {
        s->in_string = true; s->token_used = 0;
        if (s->after_colon && s->key_audio) s->audio = true;
    } else if (c == ':') s->after_colon = true;
    else if (c != ' ' && c != '\t' && c != '\r') {
        if (c == ',' || c == '{' || c == '}') s->key_audio = s->after_colon = false;
    }
    return true;
}
bool ib_audio_json_finish(ib_audio_json_t *s) {
    if(s->failed)return false;
    if(s->audio||s->in_string||s->nibble>=0)return fail(s,IB_AUDIO_JSON_INCOMPLETE);
    return flush(s);
}
static void le16(uint8_t *p, uint16_t v) { p[0] = v; p[1] = v >> 8; }
static void le32(uint8_t *p, uint32_t v) { for (int i = 0; i < 4; i++) p[i] = (uint8_t)(v >> (8 * i)); }
void ib_wav_header(uint8_t out[44], uint32_t n) {
    memset(out, 0, 44); memcpy(out, "RIFF", 4); le32(out + 4, n + 36);
    memcpy(out + 8, "WAVEfmt ", 8); le32(out + 16, 16); le16(out + 20, 1);
    le16(out + 22, 1); le32(out + 24, 16000); le32(out + 28, 32000);
    le16(out + 32, 2); le16(out + 34, 16); memcpy(out + 36, "data", 4); le32(out + 40, n);
}
size_t ib_utf8_prefix(const char *s, size_t length, size_t limit) {
    if (length <= limit) return length;
    size_t n = limit;
    while (n && (((unsigned char)s[n] & 0xc0) == 0x80)) n--;
    return n;
}
void ib_voice_analyze(ib_voice_stats_t *s,const int16_t *pcm,size_t n) {
    if(!n)return;
    int64_t sum=0;uint64_t squares=0;unsigned peak=0;
    for(size_t i=0;i<n;i++){int v=pcm[i];unsigned a=v<0?(unsigned)-v:(unsigned)v;sum+=v;squares+=(int64_t)v*v;if(a>peak)peak=a;}
    int64_t mean=sum/(int64_t)n;
    uint64_t variance=squares/n-(uint64_t)(mean*mean);
    if(variance>=14400&&peak>=500)s->voiced_blocks++;
    if(peak>s->peak)s->peak=peak;
    s->samples+=n;
}
bool ib_voice_present(const ib_voice_stats_t *s){return s->samples>=4000&&s->voiced_blocks>=3&&s->peak>=500;}
static bool json_bytes(ib_json_writer_t *w,const char *text,size_t n){
    if(w->failed)return false;
    if(w->output&&!w->output((const uint8_t *)text,n,w->context)){w->failed=true;return false;}
    w->total+=n;return true;
}
bool ib_json_write(ib_json_writer_t *w,const char *text){return json_bytes(w,text,strlen(text));}
bool ib_json_string(ib_json_writer_t *w,const char *text){
    static const char hexchars[]="0123456789abcdef";char bytes[256];size_t used=0;
    if(!json_bytes(w,"\"",1))return false;
    for(const unsigned char *p=(const unsigned char *)text;*p;p++){
        char escaped[6];size_t n=1;escaped[0]=*p;
        if(*p=='"'||*p=='\\'){escaped[0]='\\';escaped[1]=*p;n=2;}
        else if(*p<32){escaped[0]='\\';escaped[1]='u';escaped[2]=escaped[3]='0';escaped[4]=hexchars[*p>>4];escaped[5]=hexchars[*p&15];n=6;}
        if(used+n>sizeof(bytes)){if(!json_bytes(w,bytes,used))return false;used=0;}
        memcpy(bytes+used,escaped,n);used+=n;
    }
    return json_bytes(w,bytes,used)&&json_bytes(w,"\"",1);
}
