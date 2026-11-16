// 云端流解析的纯 C 核心；不分配内存，不依赖 ESP-IDF。
#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

typedef bool (*ib_stream_bytes_cb)(const uint8_t *, size_t, void *);
// 将 SSE JSON 的 audio 字符串替换成空串，并在收到每两个 hex 字符时输出字节。
// metadata 仅保存非音频部分；调用者在每个 SSE data 行结束时解析 metadata。
typedef struct {
    char metadata[4096];
    size_t used;
    char token[32];
    size_t token_used;
    bool in_string, escaped, key_audio, after_colon, audio, failed;
    int nibble;
    uint8_t bytes[256];
    size_t byte_count, audio_bytes;
    ib_stream_bytes_cb output;
    void *context;
} ib_audio_json_t;
void ib_audio_json_init(ib_audio_json_t *, ib_stream_bytes_cb, void *);
bool ib_audio_json_feed(ib_audio_json_t *, char);
bool ib_audio_json_finish(ib_audio_json_t *);
// WAV PCM16 单声道头；调用方在上传前知道准确 PCM 长度。
void ib_wav_header(uint8_t out[44], uint32_t pcm_bytes);
// 从 UTF-8 尾部切边界，不截断编码；输入可不是零结尾。
size_t ib_utf8_prefix(const char *, size_t length, size_t limit);
typedef struct { uint32_t samples, voiced_blocks; uint16_t peak; } ib_voice_stats_t;
// 块内去直流后的RMS/peak门限，仅用于拒绝静音；不声称是语音模型VAD。
void ib_voice_analyze(ib_voice_stats_t *, const int16_t *, size_t samples);
bool ib_voice_present(const ib_voice_stats_t *);
// 同一序列化器先计数后分块写，避免cJSON树+完整请求副本的内存峰值。
typedef struct { ib_stream_bytes_cb output;void *context;size_t total;bool failed; } ib_json_writer_t;
bool ib_json_write(ib_json_writer_t *,const char *text);
bool ib_json_string(ib_json_writer_t *,const char *text);
