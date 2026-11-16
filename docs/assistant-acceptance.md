# AI 助理开发版验收记录

基线：`nexsjournal/folotoy-vibekey@0eb628bf7a563e67d76fc9e7841bbfdb768b7473`。个人Fork：`CatLollipop/folotoy-vibekey`，开发分支`codex/ai-assistant`。本记录只列实际完成的检查，构建和模拟结果不替代原应用或设备验收。

## 构建与自动化

- 改造前基线：原ESP32-C3固件构建、主机测试通过。CLT环境下原AppUpdateKit测试因缺少Apple Testing模块无法编译；没有把这一基线限制计为新增功能通过。
- 当前Mac：SwiftPM编译真实完整应用，资源打包、ad-hoc严格签名通过；最低macOS26、arm64。8个Mach-O头的动态依赖与rpath检查未发现开发目录或Homebrew绝对依赖。
- 完整Xcode26.2尚未安装。官方Apple下载需要登录，本轮CLT路径可构建应用；Xcode宿主XCTest没有执行。
- Assistant核心：DeepSeek SSE合法结束、usage、推理隔离、UTF-8长度、hex解码、完整历史轮次淘汰、WAV、配置无密钥、URL版本段与网关前缀、取消generation、无声拒绝、应用投递/终态/正文先后序及TTS不被迟到终态打断，通过。
- Agent桥接：真实Swift核心、正式Node/Python桥接模块4/4；原实例/会话/轮次、accepted/applied、错误或过期请求、最终正文过滤、Kimi REST/WS夹具、原编辑器草稿归属、硬件短/长按/通知ACK隔离、共享MiniMax配置、设备rid/rev/off/帧上限，通过。
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
- 设置重整后的实际运行窗口检查暂受Mac锁屏影响；用户解锁后继续核对。

## 尚未验收通过

- Passport物理按住/松开、30秒上限、采音溢出、扬声器、真实公网TLS语音全链路、打断与连续多轮资源需要真机实测；无余额、断网、掉电和Mac关闭的完整矩阵尚未完成。
- Claude Code现有终端正式停止回执缺失，完整能力仍阻塞。OMP/DeepSeek Harness需在原实例加载扩展；Kimi Code需连接原本机服务及访问令牌。三类均需实际原会话投递、停止、状态和回复验收。
- Claude Desktop、ChatGPT.app与WorkBuddy需辅助功能权限、可靠的实际版本AX回复边界和停止控件；未在私人聊天发送测试。七类应用均未宣称全部端到端验收。
- 设备使用有界原生特效，未逐项移植完整主题特效/球面gaze；点阵与Mac不宣称逐帧等同。
