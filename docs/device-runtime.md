# 设备热模式、电脑通知和本地短音（0.6）

AI助理与连接电脑在同一次启动内切换，模式操作不调用重启、不改变USB连接或设备身份。两种模式空闲时都能经USB或已配对Wi-Fi接收电脑任务通知；云对话期间先释放局域网TLS，Mac排队等待重连。设备回复仍为文字，本地合成短提示音与云TTS无关。

## 模式资源事务

`菜单/assistant mode → control mutex → ib_run_mode_check → ib_hot_mode_apply → audio/worker/LAN资源 → NVS save → publish实际mode → ACK`。

- AI助理：伴随麦克风许可关闭；独立worker协作启动。进入云轮前关闭LAN TLS会话、监听任务及发送队列，并停mDNS，保留STA和配对信息；确认资源释放后才建立ASR WSS，随后顺序DeepSeek HTTP TLS。结束或取消后恢复mDNS和已配对TLS监听。
- 连接电脑：等待独立worker协作退出，再开放伴随麦克风许可。麦克风任务在每次真实采音时创建，结束自行释放栈；短音任务也按次创建，空闲时两者均不占常驻栈。
- 资源准备或保存失败会反向恢复原资源，未完成不发布新mode、不返回成功；回滚本身失败返回`recovery_failed`，不靠自动重启掩盖故障。保存失败会重申原持久模式。重复选择当前项不切换。
- 真实录音、待处理PTT、转写、当前云对话、配置事务和正在切换时拒绝并发切换。应用来源的Codex等后台thinking/working/replying不占设备音频，可以切到AI助理继续聊天；模式切换不向原应用发送取消任务。云对话历史保留在原有8KiB有界RAM中。
- BLE启动策略不变：已经释放的BLE内存不尝试热恢复。实际可用链路以运行期状态为准，AI空闲通知明确支持USB和已配对Wi-Fi，不宣称热恢复蓝牙。

LAN服务器独占TLS的创建/释放。运行期mutex保护active/handshake socket登记与撤销：关闭方只shutdown，server owner先撤销登记再销毁TLS；accept与disable交错时在登记前再次校验enabled，避免关闭期间新建一个5秒握手。发送队列同受生命周期锁保护，不能在关闭后向旧queue指针投递。

热切发布实际mode状态事件到USB和当前LAN会话，无需新的hello或boot。`hot_mode:1`在assistant能力中标识该实现；mode ACK为`restarting:0`。通知能力使用独立cap，不扩大assistant能力帧（最坏506B含换行）。

## 独立通知事务

`电脑事件合流器 → notification cap/begin/chunk/commit → ib_notification_wire → ib_notification单槽 → UI reader/pager → 本地短音`。详细线协议见`assistant-device-protocol.md`。

- 通知有独立nid和非零rev，正文最多2048B、单块96B UTF-8，来源最多48B。每块连续off，允许字节一致的重复块。staging固定上传链路，不复用assistant profile/pet的abort或owner。
- begin在真实云/采音忙时直接busy，不分配正文，由Mac有界队列重试。空闲已有另一未关闭事件时也busy，避免覆盖用户正在读的内容。
- size、CRC、来源、类型与截断标志均绑定身份。同nid高rev可以将无正文完成提示升级为最终正文；升级先hide旧通知，再复用唯一2KiB buffer，完整校验前不展示、不响。不会同时保留新旧两份通知全文。
- commit在size/CRC完整且UI接纳后才成功。exact重传幂等，已关闭通知的旧提交不会复活。最近8个已呈现nid的短音去重，升级不重复响；cap公开该有界去重窗口。ACK表示设备已接纳，不代表用户已读或扬声器听感。
- 通知与4KiB云reply、ASR generation完全独立。通知读层关闭后恢复原云回复的页位置与宠物，不恢复旧的generic Agent弹层。旧reader在升级/释放后返回0，UI从不保留可变裸指针。
- staging每次真实generation/off进度后有30秒窗口；失去客户端且未commit的上传会回收，避免遗留2KiB永久阻挡新通知。已commit但等空闲呈现的完整通知不按staging超时丢弃。
- 短▲▼优先翻通知，边界也消费；长▲模式、长▼会话/网络仍保留。OK按下先关闭/释放通知，随后同一按下沿走正常PTT，不额外吞一次按键或等待长按。通知无交互15秒返回，翻页（含边界）和菜单覆盖为阅读保留30秒窗口。

写者由assistant control串行化；UI锁内reader只取短store锁。store不会持自身锁等GUI，先发布不可变数据再通知UI；真正PTT先hide再释放通知，下一次ASR前不保留2KiB通知buffer。伴随mic启动也与通知begin共享同一control边界，不能在检查空闲之后与实际录音交错分配。

## 短提示音与采音优先

独立云轮成功DONE记录一次业务完成事件，app消费该事件后播放一个本地短音，后台PREPARING/IDLE不重响。通知首次成功呈现也只调度一次短音；同事件正文升级不再响。声音开关继续由app原配置控制，静音不会在日后重新开启时补播旧事件。

新录音先静音并协作取消短音，等待tone退出/codec释放，再启动采音。取消检查以音频块为边界，不强删正在BSP写入的任务；采音期间DAC保持静音，避免旧TX DMA尾巴漏进麦克风。提示音忙时的pending保留到空闲，明确PTT/hide时取消；任务分配失败不冒充成功入队。没有恢复MiniMax TTS请求或播放队列。

## 只读诊断与验证边界

- `assistant mode_status`：mode、switching、worker、audio_companion、lan_listening、lan_released、ble。判断同boot热切真实资源，不能只比较mode字符串。
- `assistant chime_status`：queued、started、completed、cancelled、write_bytes、write_errors、codec_errors、mic_starts，以及两个音频任务栈低水位（IDF单位字节）。queued为成功入队，write_bytes为BSP写API接受的字节，均不等于声音已经被用户听见；去重可比较同boot计数增量。
- `tools/test-notification.sh`：生产通知store/JSON wire与官方同源cJSON、纯热模式资源事务的ASan/UBSan。覆盖busy零分配、身份冲突、CRC/大小/旧rev/owner、UI拒绝时无成功ACK、0body升级、exact重传、关闭后不复活、正文边界、模式各阶段失败与回滚、后台应用工作允许热切。
- `tools/test-audio-runtime.sh`：以pthread运行生产audio模块，替换RTOS/I2S，覆盖32次许可热切不建常驻任务、8次实际mic创建/退出、短音被PTT取消、PCM互斥、初始化/任务/format/write失败及资源回收。替身栈低水位为哨兵，不证明真实C3栈；不模拟真实DMA、TLS或堆碎片。
- 生产通知store/CRC reader与真实LVGL联合回归覆盖无正文→正文升级、重复提交保持当前页、菜单返回和恢复底层云reply页。最终需在同一真实boot核对热切、已配对Wi-Fi通知、云前后LAN释放/恢复、连续PTT、实际heap与栈，并由用户确认提示音和阅读行为。
