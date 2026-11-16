# AI 助理 0.6.1 开发版验收记录

上游基线为 `nexsjournal/folotoy-vibekey@0eb628bf7a563e67d76fc9e7841bbfdb768b7473`，个人 Fork 为 `CatLollipop/folotoy-vibekey`，分支 `codex/ai-assistant`。历史观察与缺陷见 [阶段记录](assistant-acceptance-history.md)。本页区分主机自动化、真实设备链路、真实云服务和人眼/听音观察。

## 当前行为

- 豆包流式 ASR 实时转写，DeepSeek Flash 生成文字。用户已取消 MiniMax ASR，并暂时停止全部助手朗读；新设备 profile 不携带 MiniMax Key/base/voice。Mac 旧凭据保留。0.6 本地完成短音受声音开关控制，不调用 TTS。
- 长按上键进入原子模式菜单，AI 助理/连接电脑在同一次开机热切换。真实采音、转写、云请求、配置上传时拒绝切换；电脑应用后台思考不阻塞切换。ACK 确认实际 mode 与 restarting=0。
- 普通阶段文字改为贴近宠物的 16px 动画图标，识别字幕、回复、具体错误及消息来源保留。右侧每个实体键只有一个当前动作；有效翻页箭头优先。上下键之间最多显示七个页点，当前实心、其它空心，滚动窗口与上下省略点表示隐藏页。
- 两种模式接收 Mac 转发的应用完成/待确认/错误及最终正文。独立 2KiB 通知存储和 reader 不覆盖 4KiB 云回复；零正文完成提示可升级同一通知正文，不重复响。云采音/请求期间由 Mac 有界排队，完成后再投递。Mac 必须运行才能转发，独立云对话无需 Mac。
- 设置维持暗色一体化画布：193 外观、16 脸型、44 表情、43 配色、29 桌面画风；Passport 固定点阵。资源成功替换后旧 bank 擦除并全量读回，只保留一份有效宠物包。这减少 Flash 副本，不等同增加 RAM。

## 构建与自动化

- CLT/SwiftPM 完整 Mac 0.6.0/build32 编译、离线资源打包及 ad-hoc 深层严格签名通过。1003 条界面字符串无缺失英文。完整 Xcode26.2 未安装，Xcode 宿主 XCTest 未执行。
- Assistant 核心覆盖 SSE 终态/UTF-8分块、错误、取消与旧事件、完整历史轮次淘汰，以及旧 autoSpeakReplies=true 时 speech 和播放器仍为 0。
- 通知专项使用正式 reducer/queue/coordinator/protocol：完成与正文先后、应用/实例/会话/轮次身份、CRC/ACK、busy/断线同身份恢复、正文截断、双响去重、Mac 胶囊到期保留队列、用户明确取消隔离。Codex 合成 Hook、Agent 组件与正式桥接测试通过；七类宿主不以这些测试代替实机验收。
- 双链路专项验证 USB 优先、备用 Wi-Fi 握手不重发 state/config/mic、USB 丢失后的正确接管。修复备用 Wi-Fi 改变采音 owner 导致短流的问题。
- 固件主机 store/reply/pager/notification/wire/hot-mode/audio runtime 测试通过，开启 ASan/UBSan；受保护布局、NOR 断电恢复与旧资源回收回归通过。生产 LVGL 菜单 0/20/60ms/稳定帧一致，验证无 READY 过渡；通知仅覆盖 caption，pet9672、页点66、UP/DOWN各16、Mic37、power16 个亮像素仍可见。主机 LVGL 峰37544B仅参考，不作为 C3 测量。
- 最终 IDF5.5.3 构建/size/layout 通过，无本次生产构建 warning/error。固件 2719120B，SHA256 `db2e0d75d49dd58b3c9a39f47083f2e5d4d8dd5c9d29c969b55d72bf102cd737`，适配原 3MiB 应用分区；静态 DRAM219030B、剩余102266B。没有云 TTS/播放器启动路径。

## 0.6.0 真实设备与链路

- 受保护刷写成功；独占重试后的完整回读通过：cardid 16384B 与首次整片备份一致。两个256KiB bank 恰有一个全 FF、一个有效活动 bank；头/profile/pet CRC 有效，profile revision5/659B、所选 pet revision1794817063/15488B 保留。原始备份与回读含凭据，只在本机私有目录，不进入仓库或交付包。
- 五次热切资源检查保持同一 boot，无 restarting；companion 时 worker0/audio_companion1，standalone 时 worker1/audio_companion0；空闲 LAN 均可监听。模拟电脑应用 thinking 时允许切换、模拟真实 transcribing 时拒绝，配置和宠物未变化。这里状态输入为明确合成控制事件，不是实际 Codex 任务。
- 正式 Mac 类 USB 通知：完成 rev1（0B）→正文 rev2（1404B/15块）两次提交及CRC ACK通过；重复 rev2 标记 duplicate，不重建提醒；清除 ACK通过。
- 电脑采音曾出现短流与一次0样本；已定位并修复备用握手抢占短流，但首次0样本未复现，原因尚未确证。最终同一签名 binary 连续两次两秒实测分别收到32000与30080个16kHz样本（门限24000），未保存音频；这不代替长时稳定性验收。
- 切回 standalone 后使用真实已配对 TLS Wi-Fi，重复两次完成0B→1404B正文升级、15块及CRC ACK通过，重复提交均 duplicate。没有给私人会话发消息；测试正文固定合成，报告只保留字节数/ACK。
- 本地声音首次单事件检查：queued/started/completed各1、write_bytes7040、write/codec errors0；正文升级与重复提交没有多入队。BSP 写入成功不等同用户听音，实际听感另列。
- 0.6 用户实机确认：“有短的提示音，切换模式没有开关机动画了，长按上键没有闪烁Ready啦”。短音可听、热切无开机动画、长按上键无READY闪烁三项通过。新版页点滚动/省略、状态图标间距已有生产LVGL夹具证据，用户未单独明确确认，不记为人眼通过。0.5.1绿色采音/回复保留/翻页/布局的人眼通过作为历史基线。

## 既有真实云服务证据与边界

0.4 Mac 正式豆包流式测试约6.25秒合成PCM，发送期间13次更新、最终28字符；0.5真实 DeepSeek Flash 文本测试成功且无 TTS。0.5.1真机实际一轮收到147B final正文，后台 PREPARING→IDLE仍保留原revision，可翻页，用户确认通过。0.6新增LAN资源释放/恢复与声音并发仍需真实连续云会话补充，不以旧云服务测试代替。

## 未完成的完整验收

- 七类原应用未全部端到端验收。Claude Code 原终端正式停止回执受限；OMP/DeepSeek Harness 需原进程加载扩展，Kimi 需附着原服务；Claude Desktop、ChatGPT.app、WorkBuddy 受实际版本、辅助功能授权和可靠回复/停止边界约束。只安装桥接或可以粘贴不算完整通过。
- 原应用 Hook/扩展须已加载。Codex 仅升级本应用拥有的已有 Hook，保留其它条目/notify/备份；不自动重启宿主、重新信任插件或批准工具。当前已验证正式生产通知链的合成事件，不宣称七宿主真实任务均已触发完成。
- 新版长时多轮、30秒上限/打断、弱网/大TLS record、无余额、断电和Mac关机完整矩阵未完成。历史长段朗读断续未修复，按用户要求停用；本地短音另测。
- 冷启动保存宠物首帧有生产夹具/屏障证据，但用户单独冷开机无默认球球闪现仍未明确回报。设备有界原生特效不宣称与Mac主题逐帧相同；罕见字/缺失emoji用□占位。

正式0.6.0交付App已在本机打开，观察到其Aora宠物窗口加载outputs交付包内离线资源；不代表七类宿主均已加载新版Hook。

## 本机安装与GitHub发布

0.6.0/build32已安装到系统应用程序目录并从该目录运行，About窗口实际显示0.6.0 (32)；主可执行文件与交付包相同、codesign深层严格验证通过。旧0.2.13/build24应用移出应用程序并备份，配置和凭据未清除。

[GitHub Release v0.6.0](https://github.com/CatLollipop/folotoy-vibekey/releases/tag/v0.6.0)已公开发布为Pre-release。Tag指向构建源码9e0003815f4855e961be2d64178a0e473a0df631；Mac ZIP、固件ZIP、两个同名.sha256、Guide和Acceptance共六个附件均为uploaded，GitHub远端SHA-256与本地逐一匹配。未登记上游更新后台，未执行额外设备刷写。

## 0.6.1增量与验证

- Mac0.6.1/build33完整CLT编译、1005条字符串无缺失英文、深层严格ad-hoc签名通过。0.6.0已发布附件保持原样。
- 新版已安装到应用程序，原0.6.0应用留作备份。真实CUA右键桌面宠物弹出原生“宠物设置”，点击进入已选宠物页；原水灵/柔软/snow/胶囊保留。常规左键不消费，点击穿透时不拦截；这两项代码/类型检查通过，未额外声称所有鼠标路径已人眼实测。
- Permissions正式类注入内存读取器验证Observation双向变化、出现立即刷新、独立重复/重叠页面owner、应用激活、实际common-mode RunLoop、隐藏/释放清理通过。保留真实AX读值，不据系统开关推定成功。
- 本机曾系统开关on但原生0.6.0界面false，正常重启未恢复；从终端直接执行同binary的诊断true不作为原生授权证据。更新固定0.6.1后，用户重新开启系统开关并确认“已授权”；最终原生再次观察待设备刷写后恢复App时补记。未读写TCC数据库、未重置全局权限。
- 长DOWN路径使用原子LIST进出和独立本地网络菜单owner。生产LVGL/ASan/UBSan检查网络菜单及Mac会话菜单0/20/60ms/稳定帧、背景准备/空闲/远端状态与通知、最新错误和离线退出通过；关闭后通知第5页与云回复第13页恢复。host未执行完整ib_app任务，不能替代真机菜单观察。
- 最终固件2718736B，SHA256 `4ae0c0892b8585f26e9949a1e848c134b5c98a8fbbe9e4654db29372e2155557`，IDF5.5.3 build/size/layout通过，仍在原3MiB应用分区；受保护刷写与用户真机观察待本轮继续。
