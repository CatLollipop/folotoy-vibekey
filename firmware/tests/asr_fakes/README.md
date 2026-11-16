# 实时ASR宿主替身的边界

`tools/test-asr-realtime.sh`编译生产`ib_asr_realtime.c`、`ib_doubao_asr.c`及JSON选择器，默认启用ASan/UBSan。替身使用虚拟时间与同步事件分发；它不是ESP-IDF WebSocket任务或真实网络/TLS调度器，不验证证书库、ISR、实际任务竞争、I2S音频或堆/栈余量。

生产运行器负责的请求顺序、二进制头、Flash字节发送、完整终态、generation回调边界、失败/取消路径以及handle释放可直接断言。假source在虚拟时间推进中持续增加已提交PCM，断言首次partial发生时recording仍为真；这证明运行器不会等完整录音才处理字幕，不证明真机采音实时性。默认端口回归模拟ESP-IDF的WS新建port0与client按ext WS自身取port，要求生产运行器显式设443；此前替身直接硬编码443，未覆盖该集成缺陷。WS帧被拆为binary+continuation，每帧再以7字节块派发，以覆盖payload_offset与FIN的不同含义。

夹具只用虚构文本/密钥和`fixture.invalid`，不发请求，不保存录音，不读取本机凭据。输出只包含通过/失败和夹具名称。`doubao-asr-wire.json`为官方结构合成，不是真实API音频；其中flags3/+13终包复现已验证的真实数值头形状，正文仍为合成。

真实验证需主任务的受保护刷写：校验cardid原样、profile2原子同步，物理OK的录音/字幕/取消、DMA与软件ring溢出、Flash耗时、32KiB LVGL峰、三任务栈、TLS最小heap及用户听感。宿主的固定heap/stack哨兵仅验证字段透传，不是硬件资源数据。
