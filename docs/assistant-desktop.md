# AI 助理：Mac 运行链路

本分支基于 nexsjournal/folotoy-vibekey 提交 `0eb628bf7a563e67d76fc9e7841bbfdb768b7473`。
新增功能保留原有听写、字幕、Codex 操作以及内部 Bundle ID、URL scheme、数据目录。

## 运行模式

电脑端云对话：`AssistantPane / 快捷键 → AssistantController → AudioSource → 录音期豆包实时 ASR → DeepSeek → MiniMax TTS → AssistantPCMPlayer`。

电脑应用会话：`AssistantController → AgentHub → 已选原应用会话 → ConversationEvent / AgentReply → AssistantCoordinator → PetController / TTS`。

设备独立对话不经过 Mac，见 [设备助手协议](assistant-device-protocol.md)。设备模式持久化，电脑断连不会把桌面应用指令自动改发 DeepSeek。

## 配置与凭据

`AssistantProfile` 保存供应商地址、模型、系统音色、系统提示词和资源上限，不保存 API Key。
`AssistantStore` 使用组合根注入的同一个 `CredentialStore`，凭据文件沿用本机私有目录及 0600 权限。
Mac 上的云服务连接参数与原有翻译/润色 LLM 配置独立，不覆盖原配置。

当前默认豆包流式识别2.0（`volc.seedasr.sauc.duration`）、MiniMax中国站 `speech-2.8-turbo` 和 DeepSeek `deepseek-flash`，显式 `thinking.type=disabled`。
豆包 ASR 使用录音期 WebSocket PCM 输入，在松键前显示实时转写；录音最长30秒。MiniMax 文件 ASR 已取消，不再作为识别模型或助手调用。
豆包 Key 与资源ID复用「识别模型」保存的 `cloud.volcengine` 配置，助手公开 profile 不包含 Key。
系统音色默认 `male-qn-qingse`，不调用克隆或设计音色接口。

设备同步：`AssistantStore → key-bearing memory-only wire data → AssistantDeviceSync → DeviceLink request/ack → 固件 inactive bank → commit → status`。
每个请求带关联ID，只接受当前链路、请求ID、操作、版本和偏移一致的回执。结果未知时不自动重传提交。
云凭据与宠物设置分开同步，首次凭据同步需要USB，之后支持已配对加密Wi-Fi。设备拒绝繁忙阶段的同步。模式切换若回执 `restarting=1`，Mac 等待新的 boot ID 完成握手，再查询实际模式；重启前回执不冒充已经运行新模式。

## 取消和播放

每轮用独立 generation 关联网络、录音和播放；迟到回调不能覆盖新轮。
历史只保存完整 user/assistant 对，按UTF-8字节预算删除最旧完整轮次；重启不保留对话。
DeepSeek SSE 必须有合法终止原因和 `[DONE]`，只收 assistant 正文，不朗读 reasoning 或工具内容。
TTS 通过 pull-based async stream 逐块读网络，播放最多排队四个100ms PCM缓冲，形成有界背压。
`exclude_aggregated_audio=true` 避免MiniMax末帧重复整段音频。历史0.3.0账号冒烟验证过16kHz/S16LE PCM生成与解码；此记录不代表当前豆包识别或设备扬声器音质已验收。设备用户已反馈声音断续，修复与测量见验收记录。

切换应用会话、用户停止、开始录音都会取消旧朗读。云对话忙碌时，旁路应用完成事件不会抢占当前用户轮次。
接口限额、鉴权、无余额和中断错误只展示状态或稳定错误，不把服务端回显的请求体写入日志。

## 界面与首次运行

初次启动默认打开 AI 助理设置，不要求下载本地识别模型。麦克风和辅助功能权限由用户通过系统界面授予。
设置 › AI 助理包含 DeepSeek 连接/测试、对话参数、文字或按住说话试用、权限与设备同步；「前往语音设置」打开识别模型页。识别模型的豆包卡片沿用云服务 sheet，统一显示豆包实时识别和 MiniMax 朗读的独立 Key、地址、资源ID、系统音色、自动朗读和录音上限，提供按实时节奏发送合成文件的识别测试和朗读试听。其它云识别服务仍保留原独立配置入口。
应用接入诊断、原会话选择、Hook/扩展安装、原 Codex 用量与兼容通知合并到「智能体」；旧 integrations 路由仍转向此页。宠物保留独立分类。
原听写引导仍可从原入口打开。全局听写快捷键默认仍执行听写，可显式改为 AI 助理。
Passport伴随模式默认可按住OK调用AI助理。接管开启后硬件事件不进入原 Codex 桥：短按上键只提交当前 Hub 的助手草稿，下键停止当前 Hub 任务/本地播放；长按下键打开「云对话 / 已发现原应用会话 / BACK」，上下移动、OK确认，30秒无操作关闭。切换会话同步 Hub 与对话目的地，并取消旧朗读；断连/关闭接管取消尚未完成的选择。可在设置中关闭接管，恢复原设备听写/导航。Passport页在接管开启时展示助手按键说明和统一智能体入口，仅关闭接管时才显示旧按键映射，避免两套说明冲突。

## 构建与测试

完整Xcode路径：`cd app && scripts/build.sh`，单元测试 `scripts/test.sh`。

Command Line Tools路径：`app/scripts/build-clt.sh`。SwiftPM编译真实应用，打包资源、生成标准本地化strings、应用图标并ad-hoc签名。
由于CLT不附带Apple的设计时SwiftUI宏插件，脚本只在本地KeyboardShortcuts 3.1.0 checkout移除三个`#Preview`，并把`@Entry`展开为等价`EnvironmentKey`；不修改其运行行为或远端仓库。
运行资源通过标准app Resources路径加载，不能依赖构建目录存在。

不连接硬件或收费API的核心验证：

```bash
app/scripts/test-assistant-core.sh
app/scripts/test-agent-bridges.sh
firmware/tools/validate.sh --host
```

核心测试覆盖SSE终止/usage/推理隔离/长度、hex错误、完整历史淘汰、公开配置无密钥、WAV和取消轮次隔离。
应用桥接和设备测试的具体覆盖范围分别见各模块文档。构建通过不代表七类原应用或独立云对话已经真机验收。当前分阶段结果与剩余验收见 [验收记录](assistant-acceptance.md)。
