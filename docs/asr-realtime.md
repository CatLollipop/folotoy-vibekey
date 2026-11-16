# Passport 豆包实时识别（固件 0.4.0）

0.4.0独立模式使用用户已配置的豆包实时语音识别，MiniMax仅TTS，DeepSeek仍`deepseek-flash`。按住确认键时持续发送16kHz、16bit、单声道PCM；服务返回的真实中间结果立即显示字幕。松开后送完已采集尾音与结束负包，收到服务完整终包才调用DeepSeek，再串行调用MiniMax TTS。旧MiniMax文件ASR已删除；不自动切换其他ASR供应商。

官方依据：[双向流式接口](https://docs.volcengine.com/docs/doubao-voice/bidirectional-streaming-automatic-speech-recognition-websocket?lang=zh)、[v3协议说明](https://www.volcengine.com/docs/6561/1354869)、[新版协议页](https://docs.volcengine.com/docs/doubao-voice/large-model-streaming-automatic-speech-recognition-api-1?lang=en)。设备使用固定`espressif/esp_websocket_client 1.8.0`与ESP-IDF5.5.3的TLS/WS transport。

## 配置升级

传输能力`schema:1`保持兼容，新增`profile_schema:2`、`asr:"doubao-realtime"`、`transcript:1`。profile仍最多16KiB，经既有USB初次配对／已配对局域网加密分块事务、CRC、双bank和头最后提交原子生效。

| profile2字段 | 规则 |
| --- | --- |
| `asr_provider` | 固定`volcengine_doubao_realtime` |
| `asr_model` | 固定`bigmodel`，与资源ID分开 |
| `asr_key` | 新版控制台API Key，非空≤511字节，禁止请求头换行 |
| `asr_resource_id` | 非空≤127字节，仅ASCII字母、数字、点、下划线、连字符；默认`volc.seedasr.sauc.duration` |
| `asr_ws_url` | ≤191字节，严格wss，禁止userinfo/query/fragment/控制字符/反斜线；默认`wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async` |
| `minimax_key` | 仅TTS，沿用旧字段名 |

新版认证仅需`X-Api-Key`，不需要旧AppID/AccessToken，也不要求阿里云Key。WSS头同时传资源ID、同一随机UUID的`X-Api-Request-Id`／`X-Api-Connect-Id`以及`X-Api-Sequence:-1`。UUID由硬件随机数生成，不含设备身份。握手缓冲2048字节，覆盖profile允许的最大Header长度。自建ext WS必须自身设置default443；仅设置TLS父层不会被官方client继承，真实源码确认原默认为0。用户URI显式端口仍优先。

CA链、主机名、证书有效期均验证；先同步可信时钟，不提供跳过验证选项。客户端禁自动重连，TLS父transport只准一次connect，阻止官方WS client自动跟随3xx把密钥发送到另一个地址。不自动换区或降级ASR。IDF的transport_ws在升级写失败时会以ERROR打印整请求头，因此本模块禁用该日志tag，以稳定机器码和数值指标诊断，避免异常路径打印Key。

旧schema1仍按原CRC/JSON加载，其revision、USB信任及同bank宠物保留；缺少新ASR字段时`configured:0`，独立启动和按键明确提示在电脑配置。升级不会自动抹掉宠物或Wi-Fi，旧ASR不会作为fallback调用。

## 协议与字幕终态

客户端消息为4字节v1 header、4字节big-endian payload长度、正文。完整请求type1/JSON，音频type2/rawPCM；最后type2使用flags2负包，允许空尾包。首次请求为`audio pcm/raw/rate16000/bits16/channel1`、`model_name bigmodel`、`result_type full`、`show_utterances:true`、`enable_nonstream:true`、ITN/标点开启。200ms音频一包，最多6400字节PCM。

设备明确协商compression0。官方规定服务端使用客户端的序列化和压缩方法，因此响应同为非压缩JSON；无需在C3额外分配gzip字典。收到未协商的gzip明确返回`asr_unsupported_compression`，不能把压缩字节当正文或假定成功。Mac现有gzip编解码可继续使用；两端不要求相同传输压缩方式。

服务type9结果支持flags0无序号、flags1有signed序号、flags2整轮结束无序号、flags3整轮结束且有signed序号。旧表描述flags3负seq，但本次真实服务以flags3/+13返回完整终包，官方新版ResponseParser也只按bit1判last。固件保留signed序号解码，严格校验字段存在及header、大端长度、实际完整payload、UTF-8与JSON语法；type15数值错误码映射稳定机器码，不把服务错误正文写日志。终包缺少完整识别正文、提前终包、提前断开、坏帧、超时均不进入LLM。

`result_type full`返回的`result.text`是当前整段完整快照，支持result对象或数组首项。每条新快照替换字幕，忽略嵌套utterances/words的重复text；`definite`句级标记不等于整轮完成。只有松键发完音频并收到合法负包终态才发布`final:true`并启动LLM。识别总文本≤4095字节，单响应≤64KiB；逐字选择解析不建立时间戳cJSON树，也不缓存整响应。

## 音频与线程

调用链：`按住OK → ib_assistant worker → reader/Flash writer → ib_asr_realtime → ib_doubao_asr → result.text邮箱 → app/LVGL → 合法终包 → DeepSeek → MiniMax PCM播放器`。

- 录音前擦除1MiB槽；最长30秒960,000字节PCM。录音期间不擦Flash。
- reader priority6、3072字节栈，20ms／640字节读取，只做能量检测和投递；6144字节StreamBuffer在录音前预分配，约192ms缓冲。Flash writer priority5、2560字节栈，每次最多1024字节写入；与I2S90ms DMA一起覆盖曾实测约140ms的Flash／调度停顿。
- 写者仅在写入成功后以release顺序发布tail；网络以acquire读取已提交区。SNTP/TLS/WS握手期间仍持续采音写入，避免丢首字。WSS发送最大6400字节／200ms，积压最多5倍实时追赶，发送之间真实delay给低优先级任务机会。
- WSS接收priority5、4096字节栈，rx/tx各1024字节，使用官方separate TX lock支持双向读写；接收处理WS transport分块和continuation/FIN，不把一条事件假定为一次回调。
- 释放顺序：取消置位／清字幕／shutdown登记socket → 官方WSS接收任务退出 → 停止采音、Flash写者drain → 释放队列与codec → 释放文本／准备下一轮。不得跨任务销毁正在使用的TLS，旧PCM/字幕不能跨轮。
- 去直流RMS/peak及有声块统计仍拒绝静音进入LLM；由于真流式ASR在采集中已经联网，此检查不承诺避免ASR费用。

设备LVGL池由40KiB降32KiB，依据先前真实C3峰23,752字节给音频让出8KiB。分辨率、字形、颜色与点阵不变；host64位预览独立256KiB，不能把其对象内存直接推为C3结论。0.4新增字幕+菜单必须继续量真实`lvgl_peak`。

## 字幕邮箱与线协议

网络回调只提交最后快照，不等待GUI锁；app任务消费有界邮箱后调用LVGL。完整识别仍由对话层保存，UI只保留192字节UTF-8尾部，按真实字宽显示末两行，上方保留状态一行。没有逐字定时器或伪字幕。

相伴模式复用`assistant`的`transcript_begin/update/clear`：generation为非零UInt32，clear允许0强制清；update.text为当前utterance完整快照尾部，≤192字节UTF-8；final为0/1（也接受JSON bool）。begin与整轮final／clear受generation模型约束，partial可合并，已取消/已终态/旧代更新拒绝。错误、取消、Mac所有链路断开释放所有者时清字幕。本地模式菜单始终优先，外部字幕/页面缓存到退出后恢复。

## 诊断字段

`assistant/asr_status`独立JSON行，最坏490字节，不扩大status：

| 字段 | 含义 |
| --- | --- |
| `sent` | WS发送API接受的PCM字节，排除协议头；不等于服务确认或DAC播放字节 |
| `messages` / `partials` / `finals` | 有效服务结果包、非终包完整快照、整轮合法终包数量；非句子数量 |
| `connect_ms` | ASR session创建到WSS连接，包含TLS/upgrade；不含先前SNTP |
| `first_partial_ms` | session创建到首个非空真实中间正文；0表示未观察到 |
| `heap_min` / `largest_min` | 定时/回调采样的最小free/largest，不替代全局`status.min_free` |
| `ws_stack_min_bytes` | WS任务观察到的栈低水位，IDF单位字节 |
| `send_max_ms` | 单次WS binary发送最长墙钟耗时，含调度 |
| `task_started` / `task_finished` | 收到首个有效豆包结果包／收到合法整轮负包；豆包没有Fun-ASR式task-started事件 |
| `dma_overflows` | 采音期间真实BSP `on_recv_q_ovf` ISR新增次数 |
| `ring_overflows` | 软件采音队列不能完整接收一块的次数，与DMA分开 |
| `capture_capacity` | 6144字节预分配队列容量 |
| `capture_stack_min_bytes` / `writer_stack_min_bytes` | 任务退出前栈低水位；0表示尚未退出或未启动 |

`status.overflows`在0.4同样是真实DMA计数；`ring_peak`为软件队列峰，`flash_write_max_us`为最长写调用墙钟时间。DMA或ring任意溢出都拒绝整轮，不把缺音转交LLM。统计不含密钥、设备身份或ASR正文；错误仍由cap.last_error及state.error_code保留到下一轮开始。

单独`assistant/asr_diagnostics`为只含数字的握手排查快照（最坏428字节）：port、connect_result/connect_errno、tls_error/tls_stack/tls_flags、http_code、error_type、ws_error/ws_stack/ws_flags、socket_errno、io_stage/io_result/io_errno。IO阶段1=TLS connect、2=upgrade write、3=upgrade read、4=connected、5=data read、6=data write。直接从底层SSL读取原始错误，补足guard未继承foundation时WS事件副本缺少TLS错误的问题；回执和ib_asr失败日志均不含请求头/Key/正文。

## 验证界限

`tools/validate.sh --host`覆盖JSON Unicode/逐字分块/大时间戳数组及豆包flags、signed seq解码、真实正seq终包形状、错误帧、长度、压缩协商。`tools/test-asr-realtime.sh`默认ASan/UBSan，编译生产WSS运行器，使用同步事件与虚拟时间替换transport/RTOS/Flash（不模拟真实任务竞争、TLS或ISR），覆盖边录边字幕、PCM字节一致、请求先后、完整终态、取消、401、错误、坏帧、提前结束、缺正文终包、超时、重定向门禁、Flash和采音失败，逐轮检查释放。`tests/fixtures/doubao-asr-wire.json`为官方结构合成夹具，明确不是收费API实录。store测试覆盖旧schema1保留、schema2原子更新和宠物持久化。

这些离线测试与IDF编译不证明真实账号资源权限、首字、TLS余量、32KiB LVGL峰、音频栈或听感。主任务仍需受保护刷写、逐字节复核cardid，并读取status/asr_status/audio_status，最后由用户物理按键和听感验收。当前文档不宣称0.4新豆包真机链路已通过。
