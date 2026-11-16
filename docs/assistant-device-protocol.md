# Passport 独立 AI 助手与配置同步

本分支在原有 VibeKey v1 设备协议上增加 `assistant` 命令族。Mac 的听写/应用桥接与设备独立对话共用同一只 Aora Dot 宠物；独立对话直接从 Passport 发往云端，Mac 退出后仍可工作。默认模式为 `companion`，没有配置时不会自动录音或调用云服务。

## 运行链路

`OK 按下 → 16 kHz/16 bit/mono PCM → 采音ring → Flash writer提交tail → 豆包WSS流式识别与底部字幕 → 松开OK发送音频终包 → 识别终态 → DeepSeek SSE → 全文文字回复分页显示`。

- ASR：豆包 v3 双向 WebSocket `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async`，新版 `X-Api-Key` 鉴权，`X-Api-Resource-Id` 指定用户已开通的资源；request/connect UUID 每轮独立。协议1.0 binary帧，JSON和PCM不压缩（服务端按客户端压缩方式返回），避免设备分配gzip字典。`full`结果持续更新字幕；只有服务端合法终包flags bit1才能确认整轮完成（序号按signed Int32读取，可正可负，不作终态依据），不能用一句定稿冒充整轮完成。没有自动重连、跨区或请求重发。
- LLM：`POST /v1/chat/completions`，默认 `model=deepseek-flash`、`stream=true`、`thinking={"type":"disabled"}`、`max_tokens=512`。同时收到 `finish_reason=stop` 与 `[DONE]` 才进入朗读；截断、工具调用、断流、空回复均明确失败。
- 原TTS实现（0.5暂停，不调用）：`POST /v1/t2a_v2`，`model=speech-2.8-turbo`、PCM/16 kHz/mono、`stream=true`、`stream_options.exclude_aggregated_audio=true`。逐字符解析 SSE JSON 中的 hex 音频并写扬声器，元数据固定上限 4096 字节，不分配整条音频 JSON/PCM。
- 录音默认最多 30 秒（960000 字节）；录音期已开始ASR流；少于250ms或能量不足时取消，不调用LLM/TTS。每 20 ms 采样块先减去直流分量，要求至少三块 RMS ≥120 且 peak ≥500。此门限是防纯静音的轻量门限，仍需实际麦克风/距离验收，不是语音语义检测。
- 历史只在 RAM 中保留完整成功轮次，按 UTF-8 字节预算丢弃最旧完整轮次。默认/硬上限 8192 字节、最多 12 轮；system prompt 和当前输入也占上下文预算。回复硬上限 4096 字节，超限不朗读。历史容量按实际成功轮次以1KiB增量分配，TLS cleanup后才扩容，不在首轮预占8KiB；分配紧张时裁掉最旧完整轮次，必要时不保留该轮历史。重启、清历史、退出独立模式清空历史。
- 独立模式保留已配网的 STA，暂停 Mac 的局域网 TLS 服务及其队列/任务，避免它和公网 TLS 同时占内存。当前ASR与LLM两个云阶段顺序 cleanup，最多一个公网 TLS。切回相伴模式恢复局域网 TLS。
- 公网 HTTPS 校验 CA 和主机名；首次联网使用 SNTP 校时。设备端不接受 HTTP 或带 userinfo/query/fragment 的 base URL，也不跟随重定向。TLS 初始连接 timeout 3 秒，握手后登记 socket；取消通过受互斥锁保护的 `shutdown` 唤醒 I/O，正文读取每秒检查取消，总阶段期限分别 60/90/180 秒。DNS/网络栈和真实 TLS 的取消延迟仍应在真机故障注入中测量。

## 帧、请求关联与回执

命令仍是 UTF-8 JSON 加换行，每行最多 511 字节。配置只接受 USB 或已配对的 TLS-PSK Wi-Fi；BLE 不提供凭据同步。每个请求附带不重复的 `rid`（1…4294967295）。设备在请求回执中原样回显，客户端按链路、`op`、`rid` 同时匹配。省略/非法 `rid` 兼容为 0；新版 Mac 不把无匹配 rid 的迟到消息当成当前成功。

```json
{"cmd":"assistant","op":"capabilities","rid":101}
{"t":"assistant","op":"capabilities","rid":101,"ok":1,"schema":1,"profile_schema":2,"asr":"doubao-realtime","transcript":1,"tts":0,"reply_text":1,"max":16384,"pet_max":131072,"pet_format":"aora-bundle-v2","chunk":288,"profile":1,"pet":1,"standalone":1,"mode":"companion","state":"idle","configured":0,"rev":0,"pet_rev":0}
```

`standalone=0` 表示当前分区/运行器初始化失败，不能启动独立模式。`status` 返回当前 mode/state/configured/rev/pet_rev，以及 `heap`、`min_free`、`largest`（8-bit heap 字节）、`record_bytes`、`record_error`、`overflows`、`ring_peak`、`flash_write_max_us`、`voice_blocks`、`voice_peak`、`pet_ms`（点阵栅格计算最慢帧毫秒数）。另外app_ready/buttons分别确认核心任务已运行和按键驱动初始化成功，wifi_configured/wifi_ready/ble区分配网记录、取得IP和BLE实际启动。capabilities可由USB直接响应，不能替代app_ready/hello/pong的启动验证。pet_last_ms显示最近一帧wall time，pet_ms峰值可能包含Flash擦除/任务抢占；lvgl_peak是LVGL分配池峰值（0表示暂不可得），不能将wall time当纯CPU耗时。这些诊断不含音频、转写文本或密钥。

异步状态回报没有 `rid`：

```json
{"t":"assistant","op":"state","mode":"standalone","state":"thinking","configured":1,"rev":7}
```

设备状态为 `idle/preparing/listening/transcribing/thinking/replying/done/error/stopped`。设备 UI 分别驱动 Aora 的 `idle/loading/listening/uploading/thinking/composing/celebrate/alerting/powering-down`。

## 分块事务

先获取 capabilities，恢复连接时先 abort 悬挂事务，再依次 begin/chunk/commit，每一步等待匹配 rid 的回执。

```json
{"cmd":"assistant","op":"begin","rid":102,"kind":"profile","rev":7,"size":1024,"crc":123456789}
{"cmd":"assistant","op":"chunk","rid":103,"off":0,"d":"eyJzY2hlbWEiOjF9"}
{"cmd":"assistant","op":"commit","rid":104}
```

- `kind` 为 `profile` 或 `pet`，`rev` 为正 uint32；`size` 是原始 UTF-8 JSON 字节数，`crc` 为完整 JSON 的 CRC32/ISO-HDLC（与 `zlib.crc32` 一致）。
- 每块 `d` 为不带换行的标准 Base64，解码后 1…288 字节。`off` 必须精确等于上次成功回执的下一 offset；回执 `off` 是本块写入后的位置。
- begin/chunk/commit 回执 `rev` 对应上传 revision；`pet_rev` 是当前生效的宠物 revision。只有 commit 的 `ok=1` 才表示完整配置已原子生效。错误不会伪装成功，也不把半个新配置激活。
- begin 绑定发起链路；其它链路的 chunk/commit 返回 `upload_owner`。原链路或 USB 可 abort。上传没有跨重启续传，断连后应 abort 并完整重传。
- 第一次成功 USB 提交记录 USB 初始化标记；在此之前 Wi-Fi begin 返回 `usb_required`。TLS 的配对 key 与 Wi-Fi 信息仍由原有 USB 配网流程建立。
- profile 与 pet 使用两个 256 KiB bank 中独立的区域。更新任一类型时复制另一类型；CRC/格式/字段校验通过后最后写新头，掉电后选取最新有效 generation。0.5按用户要求，在新资源已应用后回收旧bank，不再长期保留上一只宠物副本；暂存区仅用于更新事务。同一 revision 重传也会创建新 generation 并重新应用设置。
- 稳定错误包括 `busy/upload_active/no_upload/upload_owner/invalid_size/invalid_offset/invalid_chunk/checksum_mismatch/invalid_config/usb_required/erase_failed/copy_failed/write_failed/commit_failed/out_of_memory`。

普通回执形状：

```json
{"t":"assistant","op":"chunk","rid":103,"ok":1,"mode":"companion","configured":1,"rev":7,"pet_rev":2,"off":288,"error":""}
```

## profile 与宠物 JSON

profile 最大 16384 字节，字符串限制按 UTF-8 字节计算：

| 字段 | 默认值 / 限制 |
| --- | --- |
| `schema/revision` | `2` / 与 begin 的 rev 相同 |
| `asr_provider` | `volcengine_doubao_realtime` |
| `asr_model` | `bigmodel` |
| `asr_resource_id` | 默认 `volc.seedasr.sauc.duration`，1…127字节ASCII字母、数字、`._-` |
| `asr_ws_url` | 豆包WSS地址，最多191字节；严格wss，无userinfo/query/fragment |
| `asr_key` | 豆包新版API Key，1…511字节，与MiniMax TTS凭据隔离 |
| `minimax_key` | 0.5不要求且客户端不发送；旧本机/设备数据不主动删除 |
| `deepseek_key` | 必填，1…255 字节 |
| `minimax_base_url` | 历史TTS偏好，当前不发送或使用 |
| `deepseek_base_url` | `https://api.deepseek.com`，最多191字节 |
| `llm_model` | `deepseek-flash`，最多64字节 |
| `voice_id` | 历史TTS偏好，当前不发送或使用 |
| `system_prompt` | 简短中文随身助手提示，最多2048字节 |
| `record_limit_seconds` | 默认30，范围1…30 |
| `max_output_tokens` | 默认512，范围1…512 |
| `history_bytes` | 默认8192，范围1…8192 |
| `reply_bytes` | 默认4096，范围1…4096 |

base URL 可填主机根或 `/v1`，固件避免重复 `/v1/v1`。密钥、URL 等字符串禁止 CR/LF；system prompt 可换行。配置存入普通 Flash，不启用 Flash Encryption、Secure Boot 或 eFuse 写入；设备/备份应按含凭据资料保管，日志不输出密钥。录音槽是短期明文暂存，按轮次循环擦除。

旧版最多4096字节的设置JSON继续兼容（恢复内置Dot）；新版pet最大131072字节，使用AORAPET2二进制bundle，完整格式见下节。

```json
{"schema":1,"revision":2,"enabled":true,"fps":12,"brightness":80,"color":"#EADBB9"}
```

fps 范围6…20、brightness10…100、color为六位RGB；它不接收旧 emotion-ball JSON、不上传SVG/脚本/远程资源。动态几何由Mac从固定官方JS导出，运动/栅格代码随固件构建，来源与许可见 [pet-runtime.md](pet-runtime.md)。

`pet_state` 的 value 接受全部44个 canonical Aora 名称，直接送宠物引擎，不经过9态压缩：

```json
{"cmd":"assistant","op":"pet_state","rid":105,"value":"receiving"}
```

相伴模式使用此命令联动 Mac 会话；独立模式或忙时返回 busy。

0.3.1的相伴事件可附带独立机器语义，屏幕显示不解析Mac的英语msg：

```json
{"cmd":"assistant","op":"pet_state","value":"humming","target":"cloud","phase":"speaking"}
{"cmd":"assistant","op":"pet_state","value":"working","target":"application"}
{"cmd":"assistant","op":"pet_state","value":"alerting","target":"application","phase":"failed","error":"check_mac"}
```

`target`仅cloud/application；`phase`可选idle/preparing/recording/transcribing/thinking/replying/speaking/completed/stopped/failed，preparing用于打开会话；`error`只接稳定白名单，当前Mac发check_mac。缺phase的Hub工作/搜索等事件由canonical value决定文字，不用idle覆盖它。合法target建立presentation owner；owner期间旧state命令照常更新页面/按键，但不得覆盖精确助手phase/caption。裸旧pet_state释放owner并清target/phase/error，Mac关闭助手接管时发送裸idle。全部Mac链路离线/bye时也释放；重连由Mac重发语义快照。capabilities和普通ACK回显owner供诊断。状态/动画在同一UI锁内更新，避免新元数据与旧phase混合。正文、用户输入和本地化错误文本不进入此事件。

独立状态在原0…8末尾追加`9/speaking`，旧值不变：replying对应LLM输出，speaking对应TTS朗读。Mac能识别speaking并映射到humming动画。中文版文字和静态OFL字库验证见[中文状态](firmware-chinese-status.md)。


## 模式与按键

```json
{"cmd":"assistant","op":"mode","rid":106,"value":"standalone"}
{"cmd":"assistant","op":"mode","rid":107,"value":"companion"}
{"cmd":"assistant","op":"clear","rid":108}
```

mode在NVS持久化。进入独立模式前要求已保存Wi-Fi与有效profile，分别以wifi_required/profile_required拒绝缺失项；不会先创建worker再释放无线栈。模式实际变化时回执restarting=1，由核心app任务延迟500ms安全重启；下次启动在初始化RF之前选择单Wi-Fi并禁用LAN TLS。切回相伴也安全重启，避免BLE/LAN与worker的峰值共存。重复设置当前模式不重启。运行中配置/模式修改返回busy，本地取消始终可用。clear 原子清除云端凭据并擦除旧 bank，保留宠物、Wi-Fi、mode、cardid，同时撤销 USB 初始化标记。

独立模式中，按住OK说话，松开发送；最长30秒。处理/播放中按住OK会取消旧轮、立即静音并关闭旧网络I/O，准备好录音槽后若仍按住则自动开始新录音，不需要第二次按键。短按▼取消，长按▲打开运行模式菜单，上下选择「AI 助理 / 连接电脑」，OK确认并安全重启；空闲长按▼打开Wi-Fi菜单，短按▲清历史。原有已保存 Wi-Fi 菜单仍可用，LIST/USAGE/SUB 始终优先于宠物显示。

## AORAPET2 资产与升级

112字节LE头包含schema2、total size、revision、enabled、fps、brightness、fixed_state（255跟随会话；0…43固定表情）、base/light RGB，以及metadata/points/rings/faceparts/poses/44states/bodyparts/palette表的数量和offset。几何是Q6 int16坐标，环/部件/姿态各8字节，state28字节；metadata≤4096字节、ring≤256点，所有section边界/引用/字段范围严格校验。格式定义见firmware/main/ib_pet_bundle.h。

Mac根据所选角色、面部样式、颜色与表情导出同一套动态几何和44态姿态；设备不执行SVG/JavaScript，也不使用预烘帧。提交时Flash mmap零拷贝验证，在LVGL锁内加载新指针后才释放旧映射并ACK。若UI锁暂时失败返回pet_apply_failed，并以pet_pending阻止下一次擦写，app任务重试应用。profile提交复制pet后也切换映射。

V1两个128KiB bank首次启动时迁移至不重叠的新bank1（0x3A0000），最后写V2头；迁移失败仍保留两个旧bank，完成后下一事务才可擦新bank0。

离线页始终显示当前所选宠物点阵，保留时钟/电量/连接提示，不再提供照片背景。无Mac/无Wi-Fi时本地idle，45秒后sleep，用户固定表情优先。旧wallpaper分区不自动擦除，不再mmap/渲染。

## 分区与验收

| 分区 | 地址 / 大小 | 用途 |
| --- | --- | --- |
| `factory` | `0x10000 / 0x300000` | 3 MiB应用，保持原布局 |
| `cardid` | `0x356000 / 0x4000` | 出厂身份，只保留 |
| `assistant` | `0x360000 / 0x80000` | 两个256 KiB配置bank |
| `audio_scratch` | `0x400000 / 0x200000` | 两个1 MiB录音槽 |

录音槽在采音前预擦除；采音时只做有界分块写，并以6144B预分配环缓冲吸收Flash写入抖动，单独writer栈2048B，采音priority6高于writer/WSS的priority5。I2S启用IRAM安全。主SPI Flash写入仍会暂停缓存任务，环缓冲不能证明DMA永不丢帧；必须在真机完成30秒录音、write max/ring peak/overflow、连续多轮heap、PTT打断、断网/超时、重启保持和扬声器验收。BSP的IRAM I2S接收溢出计数与软件ring_overflows分开记录；任一溢出或Flash失败都拒绝将该轮送入LLM。录音期间已经发送的ASR内容不会隐藏重传。

开发验证命令：

```bash
cd firmware
./tools/validate.sh --host
./tools/test-pet.sh
# 先激活 ESP-IDF v5.5.3，提供其 cJSON 源码
./tools/test-assistant-store.sh
./tools/validate.sh --firmware
cd ..
python3 -m unittest discover -s scripts/tests
```

store主机测试使用真实实现和模拟NOR的1→0约束，覆盖双类型保留、部分上传断电、错误offset/CRC/header写失败、字段拒绝和clear保留Wi-Fi/mode/pet。主机构建与模拟测试不能替代真实账号、网络、C3堆碎片和音频验收。刷写只通过受保护脚本，先验证整片8MiB备份；脚本仅写bootloader/分区表/app，不刷cardid或新的数据分区镜像。


## 0.3.1播放诊断

`{"cmd":"assistant","op":"audio_status","rid":109}`返回独立≤511B应答，不扩大status：

| 字段 | 含义 |
| --- | --- |
| capacity/prebuffer/dma_ms | 4096B有界ring、3072B启动门限、90ms DMA覆盖量 |
| received/written | 解码后入队/成功提交BSP的PCM字节；不是DAC硬件计数，正常done两者应相等 |
| q_peak/q_low | 观测/估算队列峰值与播放中、producer未done时的低水位；q_low=0不直接等于断音 |
| startup_ms | 创建队列到第一次BSP写入 |
| net_wait_ms | 最大HTTP读取耗时，含调度 |
| write_gap_ms/write_ms | 上次写入返回至下一次写入开始的最大供给空窗/单次BSP写入最大耗时 |
| starves/starve_ms | 队列等待期间超过90ms覆盖量的软件供给空窗次数/超出时长；不是硬件ISR underrun，EOF标记迟到也可能计入 |
| write_errors/cancelled | 写入失败数/取消标记 |
| stack_min_bytes | 播放消费者退出前最少剩余栈，ESP-IDF单位字节 |

TTS阶段独立创建4096B ring和2560B栈的priority6消费者，云worker生产；短音频EOF后不等门限，满队列背压。成功需排空队列和DMA尾部；取消需立即静音，并等消费者退出才能释放内存、进入下一次录音。原固定120ms外层尾等待已移除。播放设计、并发host测试与真实测量边界见[tts-playback.md](tts-playback.md)。


## 0.4实时识别能力

传输协议schema仍为1，凭据profile升级为2。客户端在上传前必须检查`profile_schema>=2`、`asr=doubao-realtime`和`transcript=1`。旧schema1数据仍可读取以保留宠物、版本与其它偏好，但configured=0，必须通过USB同步新的豆包配置；不再调用MiniMax ASR。

`asr_status`以独立有界回执返回发送/接收包数、partial数量、连接和首次字幕耗时、最小free/largest heap、WSS/采音/writer剩余栈、DMA/ring溢出和6144B采音容量，不包含语音或转写正文。字幕generation/UTF-8/终态冻结协议见[字幕显示](transcript-display.md)。


## 0.5回复正文与首次显示

当前capabilities明确`tts:0, reply_text:1`。客户端同步纯文字profile前要求reply_text；有效配置只需豆包和DeepSeek，不需要MiniMax Key。设备原TTS代码保留但worker不调用、不创建播放队列。

电脑模式的正文协议独立于录音字幕：

```json
{"cmd":"assistant","op":"reply_begin","rid":201,"generation":100}
{"cmd":"assistant","op":"reply_update","rid":202,"generation":100,"off":0,"text":"你好。"}
{"cmd":"assistant","op":"reply_final","rid":203,"generation":100,"size":9}
{"cmd":"assistant","op":"reply_clear","rid":204,"generation":0}
```

update的off按UTF-8字节计算且必须连续；单块最多192B，Mac使用64B以覆盖最坏JSON转义，全文最多4096B。ACK回显rid/generation/off/final，final的size需与已收字节相同且UI完成发布，不能仅凭上传结束显示成功。旧代/结束后追加被拒绝；clear0强制关闭显示并建立新客户端epoch，worker在途时仍等待其释放旧buffer，不能提前free。

独立LLM增量使用唯一4KiB buffer，发布后的前缀不可变；UI只通过带generation的有界reader读取小块，没有第二份全文副本。完成后保留供短按▲/▼分页，新PTT、取消、错误或模式切换清理。未知字符以方框替代，常用中文使用既有完整GB2312字库。

屏幕移除常驻TIME栏，左右按钮采用统一尺寸/线重/中性色，图标仍贴合实际实体键位置。首次wake受启动闸门控制，持久化宠物校验、应用和正确帧呈现后才点亮背光；没有有效资源才使用内置默认角色。


## 单份宠物资源保留

用户允许同步成功后删除旧宠物资源。更新中仍使用inactive bank暂存，以免上传中断损坏当前资源；新bank完整校验、提交并应用后再清理旧bank及其映射。稳态只保留当前一份宠物资产。清理掉电不得损坏新active bank，下一次启动或更新应恢复未完成的回收。

这主要回收Flash上的旧副本；Flash分区保留为下一次事务暂存，并不会变成RAM。运行内存只引用当前资源，旧映射/缓存必须在新资源应用后释放。清理期间的busy/回执不得冒充已完成。


## 回复只读诊断（0.5.1）

请求 `{"cmd":"assistant","op":"reply_status","rid":1}` 返回相同rid、ok1以及generation(UInt32)、revision(UInt32)、length(0..4096)、active(0|1)、final(0|1)、state(既有状态枚举)、capture_active(0|1)。接口不返回正文、不改保留状态；active/final/length不等于UI可见，UI显示与翻页仍需实际验证。

成功正文在DONE→后台预擦PREPARING→IDLE期间保留。真正新PTT、取消、错误、明确清历史/正文才清除，后台预擦不是新轮开始。`ib_assistant_capture_active`读取实际reader工作标志，且排除stop/cancel；app将真实采音状态送UI，右侧麦克风仅在采集期间显示绿色呼吸，不依据TLS准备或等待倒计时猜测。
