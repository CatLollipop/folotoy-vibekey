# Passport 流式TTS播放

0.3.0已由用户完成实际独立对话并听到回复，但回放有断续。检查到旧路径把网络接收、SSE/hex解析和每256字节（仅8ms PCM）的I2S写入串在同一个priority4 worker上，与LVGL同优先级；没有启动预缓冲。I2S配置为6个DMA描述符×240帧，在16kHz下只覆盖90ms。网络/调度空窗因此直接影响音频供给。此事实说明原路径缺少抖动隔离，具体每次断音仍需新指标和用户听感复验。

0.3.1调用链改为：

`MiniMax HTTPS → cloud worker解析hex → 4096B有界StreamBuffer → priority6 PCM consumer → ES8311/I2S`。

- 采样率、PCM16单声道、voice与MiniMax模型均不改变；PCM奇数字节仍由云解析层拼成完整sample。
- consumer仅在TTS阶段存在，2560字节栈，ring4096字节（128ms PCM）。队列达到3072字节（96ms PCM）才开始消费；短音频在producer EOF后直接播放，不等待永远无法达到的门限。
- consumer每次最多640字节，以较高优先级持续供给I2S。云worker继续读取与解析，ring满时有界背压，不覆盖/丢弃旧PCM、不缓存整段回复。
- 成功时必须等队列全部消费，并等待DMA尾部90ms+20ms余量，才返回done。原外层固定120ms尾等待移除，结束生命周期由consumer统一处理。
- cancel由现有音频所有者立即静音并shutdown公网socket；生产者/消费者每个有界等待均检查取消。finish(false)丢弃队列，并等待consumer确认退出后才释放ring/允许下一轮录音，避免跨轮旧PCM。
- BSP写失败显式返回playback_write_failed；ring/semaphore/task分配失败明确out_of_memory。I2S驱动自身写等待仍最多1秒，因此硬件写入故障下的退出延迟需要实机测量，正常取消不靠关闭仍被使用的codec抢断。
- 新增常驻量仅为少量统计；约4KiB ring+2.5KiB task stack/控制对象仅在录音buffer和ASR/LLM阶段缓冲释放后申请。真实TLS低水位需复验，不能把host内存当C3余量。

## 可观测性

请求 `{"cmd":"assistant","op":"audio_status","rid":123}` 返回独立回执，不扩大原status。完整wire字段由assistant-device-protocol文档记录。

received是已解码入队字节，written是BSP成功接受字节，正常结束应相等；它们不是扬声器实际DAC硬件计数。q_peak是观测/估算队列高水位（≤4096）；q_low是在已开始播放且producer尚未done期间的低水位，单独为0不能证明听感断音。

startup_ms从播放队列创建到首个BSP写入，度量实际预缓冲等待，不包含此前TLS/请求头阶段。net_wait_ms是最大HTTP read耗时（包含任务调度）；write_gap_ms是上次BSP写返回至下次开始写的空窗，write_ms是单次BSP写耗时。

starves/starve_ms只统计等队列时、上次写入后超过90ms DMA覆盖量的软件供给空窗及超出时长，不是I2S ISR硬件underrun计数。云端尾标记很晚才到，也可能记录尾部空窗，应结合written/received、状态、net_wait和用户听感判断。write_errors/cancelled区分写故障与用户取消。stack_min_bytes在consumer退出前通过ESP-IDF uxTaskGetStackHighWaterMark采集，该SDK返回bytes而非标准FreeRTOS文档中的words；0表示尚未结束采样。

## 验证

`firmware/tools/test-tts-player.sh`默认以ASan/UBSan编译真实ib_tts_player.c，pthread替身只实现RTOS队列/信号量/时间与BSP接口。覆盖短音频、3070→3072启动阈值、32KiB背压逐字节一致、odd输入拒绝、故障传播、资源分配失败、230ms供给空窗、播放/背压/DMA尾等待中取消、跨轮无旧PCM，以及结束后所有任务/stream/sem释放。

测试中的1728字节栈水位为固定传递哨兵，绝不代表真实C3用栈；pthread不模拟实际优先级、DMA中断或网络抖动。最终必须在同一硬件/网络用相同句子重听，并采集audio_status、min_free、largest及stack_min_bytes，比较供给空窗和听感；保留取消、短回复、较长回复与下一轮录音验收。


## 0.3.1 后续失败定位

实机监测出现`SPEAKING → ERROR`，而非完整`DONE`：一轮received/written均11650B、starves=0；另一轮received=512B、written=0、最大HTTP read仅2ms。它们证明不能仅按“持续欠载”解释，仍需确定终止原因。

已沿本机实际IDF5.5.3核对：动态StreamBuffer会额外分配1字节，公开capacity确为4096；Send等待`min(request,capacity)`空间，超时才部分写。正常TLS WANT_READ/timeout通过transport返回0，HTTP层在无已读字节时转换为`-ESP_ERR_HTTP_EAGAIN`，有partial则返回已读量。因此不能把所有HTTP的0/-1都无限当成临时超时。

生产hex过滤器对一次固定短句的真实MiniMax SSE做512B切分离线重放：7帧、83964B PCM、6个status1后status2全部通过；不把原始音频或trace纳入仓库。这个结果排除了该份输入本身触发纯过滤器错误，不能证明设备网络/内存路径已通过。

新增失败诊断只记录`ib_tts failed/stage/read/errno/tls/flags/free/largest/frames/json/meta/audio`，不记录密钥、响应正文、PCM或trace。`json`类别：0无过滤器错误，1 metadata满，2非hex，3奇数hex字符，4输出回调拒绝，5行不完整。next候选应结合稳定last_error区分HTTP/TLS失败、解析失败及播放器拒绝；动态TLS RX会按record分配，heap总量和largest必须在失败现场读取。不会因猜测加大ring或缩小TLS接收上限。

终态status2后已停止处理同次read剩余尾帧，避免合法完成被后续数据错误覆盖；这是一处确定边界修复，已知上述7帧输入没有DONE尾帧，不能据此把实机故障归因为该问题。TTS主机替身也已改为IDF的完整空间等待语义；真实DMA/优先级仍需实机。
