# Passport 独立 AI 助手与配置同步

本分支在原有 VibeKey v1 设备协议上增加 `assistant` 命令族。Mac 的听写/应用桥接与设备独立对话共用同一只 Aora Dot 宠物；独立对话直接从 Passport 发往云端，Mac 退出后仍可工作。默认模式为 `companion`，没有配置时不会自动录音或调用云服务。

## 运行链路

`OK 按下 → 16 kHz/16 bit/mono PCM → 预擦除 Flash 录音槽 → 松开 OK → MiniMax 文件 ASR → DeepSeek SSE → MiniMax PCM SSE → ES8311 扬声器`。

- ASR：`POST /v1/speech_to_text`，multipart 的 `model=asr-1.0`、`response_format=json`、`file=speech.wav`。44 字节 WAV 头与录音分块直接上传；设备不在 RAM 保存完整 WAV。此接口是录完上传，不提供边录边识别。
- LLM：`POST /v1/chat/completions`，默认 `model=deepseek-flash`、`stream=true`、`thinking={"type":"disabled"}`、`max_tokens=512`。同时收到 `finish_reason=stop` 与 `[DONE]` 才进入朗读；截断、工具调用、断流、空回复均明确失败。
- TTS：`POST /v1/t2a_v2`，`model=speech-2.8-turbo`、PCM/16 kHz/mono、`stream=true`、`stream_options.exclude_aggregated_audio=true`。逐字符解析 SSE JSON 中的 hex 音频并写扬声器，元数据固定上限 4096 字节，不分配整条音频 JSON/PCM。
- 录音默认最多 30 秒（960000 字节）；少于 250 ms 或能量不足不会请求 ASR。每 20 ms 采样块先减去直流分量，要求至少三块 RMS ≥120 且 peak ≥500。此门限是防纯静音的轻量门限，仍需实际麦克风/距离验收，不是语音语义检测。
- 历史只在 RAM 中保留完整成功轮次，按 UTF-8 字节预算丢弃最旧完整轮次。默认/硬上限 8192 字节、最多 12 轮；system prompt 和当前输入也占上下文预算。回复硬上限 4096 字节，超限不朗读。历史容量按实际成功轮次以1KiB增量分配，TLS cleanup后才扩容，不在首轮预占8KiB；分配紧张时裁掉最旧完整轮次，必要时不保留该轮历史。重启、清历史、退出独立模式清空历史。
- 独立模式保留已配网的 STA，暂停 Mac 的局域网 TLS 服务及其队列/任务，避免它和公网 TLS 同时占内存。三个云阶段顺序 cleanup，最多一个公网 TLS。切回相伴模式恢复局域网 TLS。
- 公网 HTTPS 校验 CA 和主机名；首次联网使用 SNTP 校时。设备端不接受 HTTP 或带 userinfo/query/fragment 的 base URL，也不跟随重定向。TLS 初始连接 timeout 3 秒，握手后登记 socket；取消通过受互斥锁保护的 `shutdown` 唤醒 I/O，正文读取每秒检查取消，总阶段期限分别 60/90/180 秒。DNS/网络栈和真实 TLS 的取消延迟仍应在真机故障注入中测量。

## 帧、请求关联与回执

命令仍是 UTF-8 JSON 加换行，每行最多 511 字节。配置只接受 USB 或已配对的 TLS-PSK Wi-Fi；BLE 不提供凭据同步。每个请求附带不重复的 `rid`（1…4294967295）。设备在请求回执中原样回显，客户端按链路、`op`、`rid` 同时匹配。省略/非法 `rid` 兼容为 0；新版 Mac 不把无匹配 rid 的迟到消息当成当前成功。

```json
{"cmd":"assistant","op":"capabilities","rid":101}
{"t":"assistant","op":"capabilities","rid":101,"ok":1,"schema":1,"max":16384,"pet_max":131072,"pet_format":"aora-bundle-v2","chunk":288,"profile":1,"pet":1,"standalone":1,"mode":"companion","state":"idle","configured":0,"rev":0,"pet_rev":0}
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
- profile 与 pet 使用两个 256 KiB bank 中独立的区域。更新任一类型时复制另一类型；CRC/格式/字段校验通过后最后写新头，掉电后选取最新有效 generation。同一 revision 重传也会创建新 generation 并重新应用设置。
- 稳定错误包括 `busy/upload_active/no_upload/upload_owner/invalid_size/invalid_offset/invalid_chunk/checksum_mismatch/invalid_config/usb_required/erase_failed/copy_failed/write_failed/commit_failed/out_of_memory`。

普通回执形状：

```json
{"t":"assistant","op":"chunk","rid":103,"ok":1,"mode":"companion","configured":1,"rev":7,"pet_rev":2,"off":288,"error":""}
```

## profile 与宠物 JSON

profile 最大 16384 字节，字符串限制按 UTF-8 字节计算：

| 字段 | 默认值 / 限制 |
| --- | --- |
| `schema/revision` | `1` / 与 begin 的 rev 相同 |
| `minimax_key` | 必填，1…511 字节 |
| `deepseek_key` | 必填，1…255 字节 |
| `minimax_base_url` | `https://api.minimax.cn`，最多191字节 |
| `deepseek_base_url` | `https://api.deepseek.com`，最多191字节 |
| `llm_model` | `deepseek-flash`，最多64字节 |
| `voice_id` | `male-qn-qingse`，最多95字节 |
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

## 模式与按键

```json
{"cmd":"assistant","op":"mode","rid":106,"value":"standalone"}
{"cmd":"assistant","op":"mode","rid":107,"value":"companion"}
{"cmd":"assistant","op":"clear","rid":108}
```

mode在NVS持久化。进入独立模式前要求已保存Wi-Fi与有效profile，分别以wifi_required/profile_required拒绝缺失项；不会先创建worker再释放无线栈。模式实际变化时回执restarting=1，由核心app任务延迟500ms安全重启；下次启动在初始化RF之前选择单Wi-Fi并禁用LAN TLS。切回相伴也安全重启，避免BLE/LAN与worker的峰值共存。重复设置当前模式不重启。运行中配置/模式修改返回busy，本地取消始终可用。clear 原子清除云端凭据并擦除旧 bank，保留宠物、Wi-Fi、mode、cardid，同时撤销 USB 初始化标记。

独立模式中，按住OK说话，松开发送；最长30秒。处理/播放中按住OK会取消旧轮、立即静音并关闭旧网络I/O，准备好录音槽后若仍按住则自动开始新录音，不需要第二次按键。短按▼取消，空闲长按▼退出独立模式；空闲短按▲清历史。原有已保存 Wi-Fi 菜单仍可用，LIST/USAGE/SUB 始终优先于宠物显示。

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

录音槽在采音前预擦除；采音时只做有界分块写，并以16 KiB环缓冲吸收Flash写入抖动。I2S启用IRAM安全。主SPI Flash写入仍会暂停缓存任务，环缓冲不能证明DMA永不丢帧；必须在真机完成30秒录音、write max/ring peak/overflow、连续多轮heap、PTT打断、断网/超时、重启保持和扬声器验收。任何overflow或Flash失败都拒绝上传该轮。

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
