# Agent消息与Passport双模式通知

通知与所选会话的宠物、Mac助手、设备本机ASR/云回复是独立通道。Mac接收各已启用来源当前可观察到的真实事件；本机AI模式不会因为没有选中桌面会话而吞掉通知。正文只展示正式assistant最终文本，未取得正文时只显示真实完成/等待输入/错误通告。通知没有TTS、不读取服务凭据、不调用语音API；设备在完整commit成功后按声音开关播放短提示音。

## 正式调用链

`原Agent Hook/扩展/已附着API/只读可见AX → AgentHub.onAnyEvent/onAnyReply → AgentNotificationReducer → AgentNotificationQueue → AgentNotificationCoordinator → DeviceLink.sendNotification → 独立notification事务 → 设备单份2KiB store → 独立notification reader/overlay`。

`AgentHub.onEvent/onReply`仍只针对所选会话，继续供原助手和宠物使用。通知不改变选择、不激活或打开其他会话。接入卸载/停用偏好在Hub入口继续生效，Codex兼容Hook对应ChatGPT/Codex的启用偏好。

| 来源 | 通知实际观察边界 |
| --- | --- |
| Claude Code | 原会话Hook邮箱；只转发本次Hook，缺完整轮次身份时只有独立通告，不把后续正文猜配到旧轮 |
| OMP / DeepSeek Harness | 原进程扩展的已注册主会话事件；DSH有真实bridge时不再从同一窗口产第二份AX完成 |
| WorkBuddy | Hook原生身份可独立通知；只有标题与原生ID同时核对后才映射到所选AX会话。缺轮次身份不会被实例前缀伪装成有效turn |
| Claude Desktop / ChatGPT.App | 当前可见窗口的只读AX生成控件和明确assistant消息；不观察隐藏会话、不抢焦点 |
| Kimi Code | 已经成功附着的一个官方本机会话订阅；不为通知夺取或另启动会话，不宣称覆盖全部后台对话 |
| Codex兼容通知 | 当前正式Stop/PermissionRequest/UserPromptSubmit Hook；正文使用当前Hook的last_assistant_message，不读取历史正文 |

AX只在真实见到生成控件出现、随后消失时确认结束；250ms稳定校验只用于核对正文。每个新的生成控件上升边创建新turn并清本轮正文缓存，两轮同样回答“Done”仍是两个真实完成。所有适配器原有控制/停止/正文能力限制保留，通知实现不意味着七类应用已完成实机验收。

## 身份、正文版本与队列

`nid = SHA256(JSON数组[app,instance,session,turn,completionEventID])`的前16字节小写hex。数组编码消除分隔符碰撞；设备只收到不透明32字符身份。完成事件与正文按同一原会话/轮次合流，第一条真实完成可发布size0/rev1；之后正式正文升级同nid/rev2，不再响。正文先到则保存有界待合流数据，收到真实完成后一次发布；不会凭时间或一段未结束的assistant文本猜完成。

正文在UTF-8边界限制为2048字节，截断时传`truncated=1`，设备提示在Mac查看全文。reducer最多128轮，待投递队列最多16项、每项最长5分钟；busy/断连/丢ACK保留同nid/rev后重试。新正文替换排队的旧rev，旧rev的迟到ACK不能删除新rev。队列只在内存中，不形成永久聊天副本。

Mac胶囊默认15秒到期只关闭Mac胶囊，`expired`不能取消独立设备队列，设备忙31秒后的正文仍可投递。用户明确关闭、或原任务的明确clear使用稳定Notice UUID找到确切nid及最新/在途rev；先取消该通知自己的pending传输，再清该身份，不按source清别的会话。通知取消不会调用assistantAbort。设备新PTT可关闭并释放通知slot，云ASR/回复store保持独立。

## USB与已配对加密Wi-Fi协议

USB与既有TLS-PSK配对Wi-Fi使用相同JSON Lines。BLE不承载该事务；每行不含换行最多511字节。独立`cmd:"notification"`和`t:"notification"`避免助手状态旁路。cap响应声明schema1/max2048/chunk96/standalone1。通知事务不在assistant capabilities内追加大字段。

| op | 请求字段（公共字段均含rid/nid/rev） | 成功回执要求 |
| --- | --- | --- |
| cap | nid空、rev0 | rid/op一致，nid空/rev0/off0与能力预算 |
| begin | src≤48 UTF-8字节、kind done/input/error、size0…2048、crc UInt32、truncated0/1 | 回显nid/rev/crc和设备已接收off；busy不分配正文 |
| chunk | off、text≤96原始UTF-8字节，按转义后整行长度继续缩块 | off是实际接收后的下一偏移 |
| commit | size、crc | nid/rev、off=size、crc均匹配，完整CRC/UTF-8与UI发布成功后才ok1；duplicate表示相同rev重试 |
| abort / clear | 具体nid/rev | 只作用于该通知；Mac不发空nid强制清理 |

每次请求使用非零随机UInt32 rid；回执必须匹配实际active link、rid、op、nid、rev，成功时还核对预期off及begin/commit CRC。布尔、浮点、超UInt32的整数不作为rid/rev/off/ok接受。一次事务从begin到commit/abort固定在同一已握手USB或Wi-Fi；链路变化立即结束旧pending，重新连接后用相同nid/rev恢复。设备已commit后跨链路重复确认是幂等操作。

USB与Wi-Fi可同时保持握手，但只有优先级实际获选链路重发缓存命令。备用Wi-Fi后握手不能补发mic1把USB采音owner改走Wi-Fi，也不能补发mic0或idle停止现有USB采音。真正active断开后的Wi-Fi/BLE接管仍重发缓存。独立诊断未启动AppState/Bridge时DeviceLink的lastConfig/lastState初值为nil，不会自行创建空闲页面；心跳只ping及重发已有config。

本机云采音/请求期间begin返回busy，由Mac排队；设备AI idle允许配对LAN TLS，采音前释放LAN TLS/server，结束后再恢复，避免同时保留两个TLS和额外2KiB正文。已显示slot尚未释放时不同nid不覆盖；相同nid更高rev可升级正文，但完整校验前不展示新内容。ACK代表设备已验证和接纳，不代表用户已读。短提示音是否实际发声仍受声音开关影响；duplicate不是硬件声音测量。设备同次运行的有限去重缓存不等于跨重启的持久恰好一次保证。

## Hook升级与兼容边界

Codex当前[官方Hook输入](https://learn.chatgpt.com/docs/hooks)提供session_id、turn_id和Stop的last_assistant_message。安装器只升级本应用拥有的Hook命令并保留备份、其它Hook及用户notify。`codex-hook.py`将白名单身份与当前assistant正文写入0700目录/0600瞬时邮箱，消费后删除；URL仅传thread/turn/instance/event等元数据。URL与邮箱身份一致，generic和正文不会各响一次。不会读取transcript_path或保存整个Hook payload。

已配置的本应用CodexHook在App启动时升级；变更后的命令是否已被宿主信任/加载仍需按宿主规则确认，安装文件存在不等于真实事件已到达。不会自动reload或重启用户Agent。

现代ClaudeHook安装只精确移除本应用旧的三条Claude URL命令并备份，保留用户命令。运行期只有实际见过现代Claude事件，才把未绑定legacy Claude通告留在Mac胶囊而不再发第二次设备音；诊断计数`suppressedUnboundLegacy`与机器码`legacy_unbound_replaced_by_modern`明确该情况。未reload的旧实例没有可验证session/turn，属于兼容限制，不按时间或正文跨实例猜配。

## 验证

`app/scripts/test-agent-notifications.sh`编译正式reducer、队列、DeviceProtocol、分块/ACK/CRC及热模式门禁；覆盖双向事件/正文顺序、不同session隔离、缺轮次、2KiB UTF-8截断、最坏JSON转义511B、所有ACK身份/版本/偏移/CRC误配、旧ACK不能清新正文、实际Notifier自动到期与虚拟31秒延迟队列、显式关闭仅清一个身份。Python合成Hook测试只用临时邮箱，禁止open、未启动Codex、未读取私人会话。

根组合的`--diagnose-device-notification REPORT [--require-wifi]`使用真正Coordinator/DeviceLink但不启动Hub或观察私人会话：固定合成完成→正文升级→重复commit。报告仅保留capability/link/ACK/idempotent元数据，不保存正文；USB与Wi-Fi须分别通过后才能宣称对应链路验收。七类宿主的真实事件、权限与正文能力仍需分别按接入诊断验收，纯协议测试不替代真实宿主验证。

助手模式切换另要求assistant `hot_mode=1`能力，companion/standalone两个方向都先门禁；ACK须restarting=false且实际mode等于目标。旧固件显示升级需求，不能发送后再等待一次重启。
