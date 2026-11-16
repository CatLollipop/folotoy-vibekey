# AI 助理录音期实时识别

Mac助手使用豆包 WebSocket实时识别，朗读在0.5暂停，回复只显示文字。正式调用链：

`AppState → AssistantRecognitionFactory → StreamingCloudSession + VolcengineCodec → AssistantController.beginRecording → AudioSource.onSamples → ASRSession.feed → partial/句final → onTranscript(text,false)`。

释放按键或达到录音上限后：

`AssistantController.endRecording → 关闭采音gate → ASRSession.finish → 等协议终包与events关闭/消费收敛 → onTranscript(完整文本,true) → 原目的地AgentHub或DeepSeek → 文字回复`。

`TranscriptEvent.final`仅代表一句已定稿；录音期间累积句final和替换当前partial，仍只发`final=false`。完整session确认、无failure且非空后才发一次`final=true`，防止第一句提前冻结设备字幕。Controller不再缓存完整录音或调用MiniMax文件ASR。

采音gate最多接受配置的1…30秒PCM，同时保留原静音门限（至少4000样本且有幅度超过0.003）。gate关闭与feed共用锁，避免末块在finish之后才入队。网络在session后台处理，不在音频回调中执行。

识别会话由`makeRecognition(AssistantProfile,AssistantSecrets)`注入。begin时即创建，事件实时更新transcript；源启动失败、ASR failure、用户取消会停止采音并取消session。generation隔离旧识别、旧finish、旧事件与新轮；请求/播放器启动前也检查generation和Task取消，已取消的排队操作不发出请求。

豆包需要正式的服务端终包；百炼仍需`task-finished`；`StreamingCloudSession`的finish超时会发failure，不能返回partial冒充成功。WebSocket close回调可能早于已排队最后一帧，因此等待有界终态收敛；仅close不会证明成功。协议/文本类型独立在`ASRSession.swift`，`ASREngine.swift`保留依赖语言选项的ASROptions/engine，正式SpeechLanguage也独立成文件，不在测试中声明第二套协议或codec。

## 验证

`app/scripts/test-assistant-core.sh`不联网、不读用户Key：覆盖录音期间真实feed和partial、多句final仍非session终态、finish尾事件、failure、静音、限时、取消旧轮和请求启动前取消。正式供应商Codec与StreamingCloudSession只替换WebSocket传输，验证task-finished缺失、提前close以及close回调先于排队最终帧的顺序。

`BUILD_ONLY=1 app/scripts/test-cloud-live.sh <报告.json>`只编译live工具，不读取凭据、不调用服务。

显式运行`app/scripts/test-cloud-live.sh <报告.json>`只调用少量DeepSeek，当前不调用TTS。豆包只在显式追加`--synthetic-realtime-asr-audio <合成测试音频.wav>`时调用；以20ms节奏流式发送，报告partial/句final/采音中更新次数和完整收敛结果，不保存识别正文或文件路径。以上真实服务调用会产生供应商用量，应只在专用合成夹具上运行。

主机测试通过不代表服务账户、区域、网络、设备字幕或实机音质通过。真实豆包需本机配置有效Key及其已开通的资源ID，并分别验证partial、完整终包和取消。

## 豆包二进制协议契约

协议依据火山官方[实时识别参数](https://docs.volcengine.com/docs/doubao-voice/bidirectional-streaming-automatic-speech-recognition-websocket?lang=zh)及[二进制帧格式](https://docs.volcengine.com/docs/doubao-voice/large-model-streaming-automatic-speech-recognition-api-1?lang=en)。Mac保留gzip；协议也允许压缩0，服务端使用客户端指定的压缩方式。flags bit0表示携带signed Int32序号，bit1表示终包，所有整数使用大端。旧表描述正/负序号约定，但当前服务端实测终包flags3也会携带正序号+13；解析遵循新版官方ResponseParser按flags判终态，不从序号符号推断完成或拒绝合法帧。新版`X-Api-Request-Id`与兼容旧版的`X-Api-Connect-Id`使用同一随机UUID；独立助理可以覆盖endpoint，WSS校验仍由profile负责。

`VolcengineCodec.parse`先验证头长度、可选序号字段完整性、精确payload长度、压缩、UTF-8与JSON，再处理结果。损坏终帧只发failure，不能发completed；gzip必须到达`Z_STREAM_END`，输入耗尽不等于解压结束。full模式以分句起止时间去重，只发新增definite句；只含整段text的结果从已定稿前缀取尾部，避免重复旧句或遗漏尾句。完成/失败后忽略迟到帧。

`StreamingCloudSession.finish`沿用协议的音频发送准入：豆包`waitsForReady=false`可先发最后音频包，再等待正式终包。短录音尚无首条识别响应时也能正确结束；单独close和损坏终包都不能证明成功。百炼等需要ready握手的协议继续等待确认。

`VolcengineCodecContracts`与`VolcengineTransportFixture`在核心测试中使用正式codec/pump，覆盖四种flags、gzip/无压缩、result对象/数组、中文与emoji、full去重与尾部、坏头/序号/长度/gzip/UTF-8/JSON，以及无首响应、缺终包、提前close、close先于排队终包。跨端合成帧另存`firmware/tests/fixtures/doubao-asr-wire.json`，明确标记为官方结构的合成数据，不含真实API音频、身份或trace，不代表真实服务调用通过。

显式诊断可向codec注入`onFrameHeader`，只收到数值型`VolcengineFrameHeader`（type、flags、序号、长度、压缩与序列化）；不传递body、Key、会话标识、trace或识别正文。该回调在codec解析锁内同步执行，只应短时间复制数值，不能回调session。实测边界以16条合成夹具回归，包括相同type9/flags3/+13/无压缩/JSON/1508字节payload/1520字节总长的数值头形状；内容与填充均为合成，没有保留真实服务正文。
