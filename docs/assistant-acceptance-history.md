# 0.3–0.5阶段历史记录

本文件保留当时观察与当时的待验收项，不表示当前版本状态；当前结论见 assistant-acceptance.md。0.5.0用户确认正文一闪即失，不能翻页，不能作为文字回复验收通过。

# AI 助理开发版验收记录

基线：`nexsjournal/folotoy-vibekey@0eb628bf7a563e67d76fc9e7841bbfdb768b7473`。个人Fork：`CatLollipop/folotoy-vibekey`，开发分支`codex/ai-assistant`。本记录只列实际完成的检查，构建和模拟结果不替代原应用或设备验收。

## 构建与自动化

- 改造前基线：原ESP32-C3固件构建、主机测试通过。CLT环境下原AppUpdateKit测试因缺少Apple Testing模块无法编译；没有把这一基线限制计为新增功能通过。
- 当前Mac：SwiftPM编译真实完整应用，资源打包、ad-hoc严格签名通过；最低macOS26、arm64。8个Mach-O头的动态依赖与rpath检查未发现开发目录或Homebrew绝对依赖。
- 完整Xcode26.2尚未安装。官方Apple下载需要登录，本轮CLT路径可构建应用；Xcode宿主XCTest没有执行。
- Assistant核心：DeepSeek SSE合法结束、usage、推理隔离、UTF-8长度、hex解码、完整历史轮次淘汰、WAV、配置无密钥、URL版本段与网关前缀、取消generation、无声拒绝、应用投递/终态/正文先后序及TTS不被迟到终态打断，通过。
- Agent桥接：真实Swift核心、正式Node/Python桥接模块4/4；原实例/会话/轮次、accepted/applied、错误或过期请求、最终正文过滤、Kimi REST/WS夹具、原编辑器草稿归属、硬件短/长按/通知ACK隔离、共享豆包识别与MiniMax朗读配置、设备rid/rev/off/帧上限，通过。
- Flash布局Python单元测试6项通过。固件真实store在模拟NOR1→0写约束和ASan/UBSan下验证双bank断电、迁移、失败恢复、凭据清除保留pet、映射生命周期，通过。
- Aora：全部193外观×16脸型=3088组合、43配色导出通过；最大83584B。37真实资产×44态、原44态栅格和132 motion黄金值通过；41态逐格相同，其余共5格量化阈值差异，单态不超过2/784格。

## 真实云服务

2026-11-16使用用户在本机填写的配置，只发送固定合成测试内容：DeepSeek Flash关闭thinking返回“连接成功”；MiniMax TTS产生78390B的16kHz S16LE PCM，解码后再送MiniMax ASR，识别为“你好，我是AI助理。”。三个服务均成功。此结果验证本次账号/端点/样本，不代表所有音色、额度错误或设备音频已测。

## 真机分阶段记录

- USB识别到ESP32-C3/8MiB；首次刷写前完成整片备份并核对SHA-256。每轮只写bootloader、分区表和app，回读cardid与原备份逐字节相同；备份和日志含私密设备资料，仅本机私有存放。
- 初始增强候选发现RAM不足导致主任务无法创建，仅capabilities可回复；没有将其记为启动成功。
- 修复后候选确认app_ready/buttons为1、hello/状态可回复，Wi-Fi已配置并连接；云配置revision4在V1→V2迁移后保留。
- 切换独立模式通过持久化和重启，重新打开USB后确认standalone、主任务、按键与Wi-Fi正常。
- 完整AORAPET2约81136B通过USB分块/CRC/提交，设备pet_rev=42且云profile仍为4。此项证明资源接受和切换；真实屏幕视觉仍需人眼确认。
- 复杂宠物/小显示缓冲暴露出LVGL刷新调度饥饿，已按clip裁剪、复用绘图描述符并在完整刷新后安排下一帧，保留watchdog。最新0.3.0候选重新刷写、身份回读及USB启动通过；独立模式下heap约51356B、min_free47636B、最大连续块38912B、LVGL峰值23712B，复杂宠物最近帧35–50ms，峰值105ms。Wi-Fi、云配置、完整宠物跨固件重启保留。
- 最终固件2645408B，SHA-256 `3d79283bcc7c410ebb1e7260f6e1a745f2d91c6d969a7d92cb8e4d2974ef14d7`，仍适配3MiB应用分区。

## 界面

- 侧栏合并为单一“智能体”，语音设置迁入“识别模型”MiniMax服务卡片；旧integrations深链转向智能体。AI助理仅保留DeepSeek、对话/试用、权限和设备同步。
- 宠物设置的真实原生浅深主题整页截图通过独立复查；无裁切碰撞，七处小字对比度约6.01:1/7.01:1。实际离线WK加载全目录、四种角色/脸型/状态切换和完整导出通过。
- 用户解锁后已检查真实运行窗口：侧栏只有单一智能体入口，应用能力卡片/会话/用量/兼容通知同页；AI助理“前往语音设置”正确跳到识别模型；MiniMax弹窗包含共享Key/base、ASR/TTS模型、音色、自动朗读、30秒上限与测试按钮，无裁切。未在检查中修改用户密钥。

## 尚未验收通过

- 用户已实际按OK完成独立云语音并听到回复；串口观察到listening→transcribing→thinking→replying→done。该轮录音115840B，record_error=0、overflows=0、ring_peak=5760B、Flash写峰3311µs、min_free=11752B。用户反馈播放断续，音频连续性未通过，正在增加TTS阶段有界预缓冲和独立消费。30秒上限、打断、多轮/弱网/断电及Mac关机矩阵仍未完成。
- Claude Code现有终端正式停止回执缺失，完整能力仍阻塞。OMP/DeepSeek Harness需在原实例加载扩展；Kimi Code需连接原本机服务及访问令牌。三类均需实际原会话投递、停止、状态和回复验收。
- Claude Desktop、ChatGPT.app与WorkBuddy需辅助功能权限、可靠的实际版本AX回复边界和停止控件；未在私人聊天发送测试。七类应用均未宣称全部端到端验收。
- 设备使用有界原生特效，未逐项移植完整主题特效/球面gaze；点阵与Mac不宣称逐帧等同。


## 0.4 豆包实时识别与宠物选择器

- 用户取消MiniMax ASR，最终明确选择豆包。复用本机已有豆包Key与`volc.seedasr.sauc.duration`，MiniMax仅保留TTS；未要求用户重新填写阿里云凭据。
- Mac正式Factory/Codec/StreamingCloudSession以20ms节奏发送专用合成PCM 99964样本（约6.25秒），录音期间13次字幕更新，完整终态后得到28字符；总耗时8760ms，实际账号/WSS通过。未保存识别正文或服务trace。
- 真实服务终包为flags3、正序号+13，旧表符号硬限制曾误拒绝。已依据新官方解析示例按flags bit1判终态，保留长度/UTF-8/JSON等校验，并补16条合成跨端帧回归；不是通过放弃终态确认来通过测试。
- 新宠物选择器使用单个离线WKWebView，提供193外观、16脸型、44表情、43颜色和29真实画风，画风驱动Mac挂件，设备固定点阵。静态画风各不相同，切换画风不改变同一设备样本的29364B资源。527px中文/840px英文离线交互、畸形消息拒绝和Swift6检查通过。
- 原生实际窗口已确认外观搜索和点阵画风切换有效，右侧三列色块无裁切。默认窗口下740px舞台过高，已修为600px紧凑布局；最后一次真实窗口确认尚待执行。
- 0.4首个候选2693872B已受保护刷写，身份分区回读逐字节一致。schema1恢复保持pet/revision但configured0；USB profile2事务后configured1，Wi-Fi与独立模式正常，idle heap约57328B、最大连续45056B，LVGL峰23896B。
- 设备首轮3次真实按键录音均未连上ASR，用户明确反馈无字幕。错误为`asr_connection_failed`，sent/messages均0；录音约97KB、DMA0、ring overflow0、ring peak640B、Flash写峰1579µs。未把Mac成功或设备启动算成设备实时识别成功。
- 确认自建WS transport默认port0，只有其TLS父层设置443，官方client实际读取WS层默认端口。修正版为WS本身设置443，补真实端口模型回归及独立有界数字`asr_diagnostics`；writer实测只剩312B，栈从2048增至2560B。修正版镜像2695616B、SHA256 `7689db6d9b56ba674a13e382fc594532870b7a6d9de01c93908a0bf24a07a9d6`，仍待本轮刷写/真实验证。
- 声音连续性仍未验收：0.3.1用户确认仍断续，0.4首次真机在ASR连接阶段失败，未进入TTS。不能用MiniMax云端返回成功代替设备扬声器质量验证。


## 0.5当前验收范围（文字回复与屏幕整合）

用户已确认0.4端口修复后能够实时出字，但语音仍断续，随后明确要求暂时移除朗读。0.5按此决定完全停止助手TTS调用，未将原音质问题记为修复完成。Mac/设备均采用文字回复，原本机MiniMax配置保留，新设备wire不发送其凭据。

- Mac核心测试已验证：即使旧autoSpeakReplies=true，云对话与原应用最终正文也只展示文字，speechCalls=0，播放器未启动；旧generation/回执与终态先后顺序仍覆盖。默认提示词仅逐字匹配旧内置提示时迁移，自定义提示保留。
- 协议测试验证4KiB回复预算、UTF-8 scalar分块无损、64B块最坏JSON转义整帧≤511B、off连续、cap reply_text，以及更长原应用回复的显式截断提示；Agent桥接Swift与Node/Python4/4通过。
- 首轮真实暗色窗口确认：主内容和表单已暗色，全部宠物控制在同一画布的桌面/Passport抽屉内，显示真实已应用版本，无外部白色设置卡片；没有改动用户当前水灵/柔软/snow偏好。发现侧栏材质过亮与大窗口下600px画布留白，已统一暗侧栏并按窗口高度自适应；最后确认待本轮更新。
- 新设备候选包含全文回复分页、去常驻时间栏、统一边缘图标和持久宠物首帧门禁；其最终镜像/真机/首次显示证据待本轮补充，不能用此前0.4结果替代。
