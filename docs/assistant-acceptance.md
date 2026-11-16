# AI 助理当前开发版验收记录

上游基线为 `nexsjournal/folotoy-vibekey@0eb628bf7a563e67d76fc9e7841bbfdb768b7473`，个人 Fork 为 `CatLollipop/folotoy-vibekey`，分支 `codex/ai-assistant`。历史过程见 [阶段记录](assistant-acceptance-history.md)。本页区分自动化、真实服务和设备可见行为。

## 当前产品行为

- 豆包流式 ASR 边说边转写，DeepSeek Flash 生成回复。用户已取消 MiniMax ASR，并暂时取消全部助手朗读。新设备 profile 不再携带 MiniMax Key/base/voice；Mac 历史配置保留。
- Mac 云对话和原应用最终正文以文字显示；设备正文最大4096 UTF-8字节，短▲/▼分页，新一轮录音/取消/清历史清除旧正文。原应用超出设备预算时明确提示在电脑查看全文。
- 设置窗口统一暗色。193外观、16脸型、44表情、43颜色、29桌面画风，桌面和Passport控制合在宠物选择画布的设置抽屉中；设备固定点阵。
- 当前同步仅保留一份有效宠物资源，下一次更新短暂使用空白bank暂存。新资源校验、生效、释放旧mmap后擦除旧bank并全量读回空白，`retired_clean=1`才完成同步。该回收主要减少Flash中旧副本，不能等同RAM扩容。

## 已实际验证

- CLT/SwiftPM完整Mac应用编译、离线资源打包和ad-hoc深层严格签名通过。版本0.5.1/build31；1003条界面字符串无缺失英文。完整Xcode26.2未安装，Xcode宿主XCTest尚未执行。
- Assistant核心通过：DeepSeek SSE完整终态、UTF-8分块、失败解析、取消与旧事件、完整历史轮次淘汰、纯文字模式。即使旧autoSpeakReplies=true，speech调用与播放器启动仍为0。
- Agent Swift核心及正式Node/Python桥接4/4通过。组件专项覆盖合并/逐命令卸载/备份/幂等/畸形文件保留/0600/隔离偏好；缺失API已补齐，全应用编译通过。七类宿主的真实能力仍单独验收。
- 固件生产store、reply store/pager、ASR协议及Flash保护测试通过：单副本NOR中断/部分擦除/重启恢复，旧reader失效、clear0重置epoch、4KiB预算、终态与UTF-8、有界队列等。
- Mac真实豆包流式测试约6.25秒合成PCM，在发送期间13次更新，最终28字符；真实DeepSeek Flash文本测试成功，0.5未调用TTS。
- 真实Mac窗口检查：深色侧栏和主画布无白色卡片，画布随窗口高度调整，桌面/Passport抽屉保留用户水灵/柔软/snow/胶囊偏好；识别模型入口只显示豆包实时识别与文本回复说明。
- 0.5.0真实USB同步 profile revision5与宠物revision1794817063后，客户端显示新版本。设备capabilities给出single_pet1、retired_clean1、display_ready1、reply_text1、tts0。
- 0.5.0读取assistant分区0x80000字节后核对：两个256KiB bank中恰有一个全FF、一个有效活动bank，头/profile/pet CRC全部有效；当前profile659B、pet15488B。活动profile无MiniMax字段。原始回读含凭据，仅私有保存；交付报告只含布尔与字节数。
- 0.5.0合成3129B正文分块及final实际UI发布ACK通过，clear0后较小generation3通过。此测试未覆盖DONE后后台预擦状态，不能代替真实会话完成保留验证。
- 0.5.0用户复测：字幕正常，但正文一闪而过且不能翻页，底部黑条过大、两侧留白不对称。串口真实经历listening→transcribing→thinking→replying→done→preparing→idle，录音113920B、ASR4partial/1final、DMA与ring overflow均0；播放器received0。PREPARING被UI误认为新轮清正文，是本次明确缺陷，不记为文字回复通过。

## 0.5.1修正与本轮验证

修复后台预擦PREPARING清UI正文，保持完整正文及分页；统一宠物画布宽度、背景与两侧留白，正文按真实行数布局；去常驻“按住确认键说话”，右侧麦克风仅在真实采音时绿色呼吸。

0.5.1生产store/真实LVGL回归通过：没有新revision或重新发布的情况下，final→DONE→PREPARING→IDLE正文ROI像素不变，可翻页、模式菜单返回及legacy更新仍保页。背景左右一致、文字中心x120；实际capture true时Mic绿色像素79/103，false及仅LISTENING phase均为0，停止/睡眠/菜单后循环动画归0。143文案、1221字形使用、222独立字符检查通过；主机LVGL峰35712B仅供参考，不当C3实测。

最终固件2701392B，SHA256 `e95e1764d4f46cd3a97f20dda2e827afde015de5e80bbbb96532dedf3a669642`，IDF5.5.3 build/size/layout通过且无warning/error，仍适配3MiB app分区。真实受保护刷写成功，cardid0x4000字节与原始备份一致；合并回读验证一活动bank与一全FF bank，profile5/pet1794817063及CRC保留。设备独立模式、Wi-Fi、app_ready/buttons/display_ready均正常，空闲heap56928B、largest45056B、min_free52396B、LVGL峰22708B。此后停止所有刷写、同步与重启，只读metadata监控实际轮次。用户最终确认“绿色采音、回复保留和翻页都正常，布局也正常”。读取到回复length147B、active1/final1，后台准备回到idle后revision38不变，连续多次仍保留，capture_active0；录音309760B、record_error0、DMA0、ring峰1920B、Flash写峰2855µs、空闲heap55988B、largest24576B、全局min_free7072B、LVGL峰23080B。这证明本轮实际会话结束正文保留与用户可见翻页通过，不代表完整长时/弱网/掉电矩阵通过。冷启动首帧已由生产夹具与显示屏障验证，用户单独的冷开机无默认Dot观察仍未明确回报。

## 仍未完成的完整验收

- 七类原应用尚未全部端到端验收。Claude Code原终端正式停止回执受限；OMP/DSH需原进程加载扩展，Kimi需连接原服务；Claude Desktop、ChatGPT.app、WorkBuddy依赖辅助功能授权和实际版本可靠消息/停止边界。
- 30秒上限、打断、连续多轮资源水位、断网/无余额/掉电和Mac关机的完整矩阵未完成。历史扬声器断续仍未修复，当前按用户要求暂停朗读。
- 设备使用有界原生特效，未宣称与Mac全部主题特效逐帧一致；缺字emoji/罕见汉字用□占位。
