# AI 助理的官方应用接入

电脑模式只绑定原应用已有会话。ASR 的最终文本先成为 AI 助理本机草稿，用户确认后才通过该原实例的官方接口发送。没有官方双向通道的应用仅收提醒；不会经辅助功能、键盘、剪贴板、AppleScript 或第二个 Agent 进程发送/停止。普通听写是独立功能，本模块不改变其语义。

## 会话与能力边界

`ConversationRouter → AgentHub.sendPrompt(text,in:session) → 原实例官方 Adapter → 原会话接收回执`。选择会话或通知跳转只改变本地绑定，不调用 Adapter.activate，不前置、打开、恢复或新建 Mac 会话。通知双击 OK 由设备/统一路由处理，只切 Passport；各会话未发送草稿继续留在本机。

`AssistantAgentSession` 的 application / instance / session 是结构化身份；显示名称不参与命令授权。JSON 三元组生成列表 ID，避免冒号等分隔符碰撞。Hub 合并正式发现与最多128个真实事件/通知身份；观察缓存仅用于选择和提醒，不能赋予写入能力。

旧 Claude Hook 与 Mod 同时存在时，私有注册和事件信封携带的原 CLI PID + 原生 session 完全一致才优先 Mod；不同进程或不同会话继续独立提醒，不按标题、相同正文或相近时间猜配。Mod 等待提交回执期间独立续心跳；无可证 PID/session 时不建立 Mod 可写实例。此去重有协议夹具，尚未在用户原会话实测。

每次发送/停止都同步调用 `capabilities(for:)`，检查具体原实例和原生会话；应用诊断的能力汇总只供展示。Mailbox 控制能力要求正确的官方 transport、同会话与20秒内心跳。Hook 的 PID 存活可保留观察身份，不能延长控制租约。Kimi 要求当前连接代次中20秒内正式发现的会话。过期或缺少能力时明确阻塞，不切换服务、不改投云对话。

原进程事件经 `ConversationEvent → AgentEventFilter` 按应用/实例/会话/轮次检查单调序号和 event ID；最终正文经 `AgentReply` 去重。只选择当前会话的真实状态联动宠物。通知允许来自其他会话；读取的只有当前事件提供的最终正文，不拉历史。朗读保持暂停。

## 七类应用

| 目标 | 当前官方通道 | 限制与验收边界 |
| --- | --- | --- |
| Claude Code | 旧 settings Hook 观察；新增官方原进程 Mod，调用 `$.prompt.submit({text,asUser:true})` 和 `$.turn.abort({turnId})`，以 `turn.complete.answer` 取得最终可见正文 | Mod 必须由用户在原交互 CLI 会话安装/重新加载；SDK/-p 不登记可写实例。Mod 先用官方 hookEnv 同时核对原 CLAUDE_PID 与 session ID；无法证明时不登记。当前文件助手使用 CLI 专属 `$.process.run`，不据此承诺 Desktop Code 或普通 Claude Desktop 可发送。公开 API/本机静态验证与夹具通过不等于真实实例加载/投递验收。 |
| Claude Desktop | 无已验证的普通聊天官方发送通道 | 明确不可发送/停止，原 AX 实现已停用。Claude Code Mod API 不等同普通聊天 API。 |
| ChatGPT.App / Codex | `codexHook` 生命周期与最终正文通知，保留原生 thread/instance 身份供只读选择 | 本机身份 `com.openai.codex`。官方 app-server 与跨进程 durable queue 已研究；当前没有证明 Desktop 原实例消费和关联回执的可用通道，保持通知能力。不会对当前聊天运行 queue/RPC，不启动第二个 app-server resume。 |
| OMP / Oh My Pi | 原会话 extension 的 `pi.sendUserMessage` / `context.abort` | 在原实例 `/reload` 后才有能力。空闲发送等待同正文 user-message 入场，忙时使用官方 followUp 入队；最终完成要求真实 idle 且无队列。扩展不读写宿主 editor，草稿只在 AI 助理保存。 |
| DeepSeek Harness | 原 Cordis runtime 插件，`agent.followup(createUserMessage(...))` / `agent.cancel(...,{keepInbox:true})` | 只列仍在运行的主 Agent，不列子 Agent、不 resume 冷会话。native API 接收/取消请求回执与最终完成/停止事件分别处理。新旧应用 Bundle ID 仅用于安装检测，不提供 AX 回退。 |
| Kimi Code | 用户已启动的本机 Server REST / WS | 先核对运行版本 OpenAPI；loopback HTTP + 用户令牌；只列已有会话，WS 等真实订阅 ACK，拒绝占用/夺取。REST abort 后等待该原轮次的真实 stopped 事件。Kimi Work 是另一产品。 |
| WorkBuddy | 合并其实际版本支持的 settings Hook | 只观察原生 session/instance 生命周期与最终正文；无已验证的官方双向通道时不能发送/停止，不再拼接 AX 会话控制。 |

安装存在、组件文件存在、实例心跳与实测能力分别显示。缺少能力的应用不能以“可安装”宣称完整双向接入。原应用工具批准继续在原应用完成。

## 安装与原会话加载

设置 › 智能体包含统一检测、组件安装与会话选择。检测仅查应用安装元数据、进程存在性、私有邮箱或已配置官方服务；不启动/重启用户 Agent。组件安装后重新检测才展示当前能力。

- Claude Code 安装同时合并只读 Hook（保留备份）并导出本地 `claude-plugin` marketplace；“打开 Claude Mod 目录”仅打开 Finder。用户在**原交互会话**用 `/plugin marketplace add <该目录绝对路径>`、`/plugin install vibekey-assistant@vibekey-local`，按原应用提示重新加载插件。应用不代输命令、不调用 Claude CLI 安装、不重启会话。Mod 文件助手需要该 CLI 环境可找到 Node；加载失败或组织策略拒绝时没有可写心跳。
- OMP 安装本应用扩展包装，在原会话 `/reload`；卸载后再 `/reload` 移除。
- DSH 导出插件包，用户在原运行实例插件管理中加载/停用；宿主解析其官方模块。
- Kimi 保存用户已运行服务的本机地址和访问令牌；不会自动创建 server。
- WorkBuddy 首次选择实际 Hook JSON，合并写入并备份；看到原应用真实回调前不宣称接入完成。
- Claude Desktop / ChatGPT 条目只启用/停用通知与诊断，不伪造外部插件或更改系统辅助功能权限。

卸载仅清除本应用标记组件和本机连接配置，保留原 Agent、聊天、账户及用户自有配置。Hook 卸载逐命令保留组内其他命令；备份不整份回滚。禁用源后立即撤销本地选择与写权并忽略迟到事件。Claude 已导出的本地插件需用户在原会话禁用/卸载并 reload，应用不会抢改该会话的插件清单。

## 私有邮箱和投递结果

应用私有 AgentBridge 目录0700，JSON0600；协议1。注册包含 instance / native sessions / capabilities / `controlTransport` / 更新时间。支持的控制 transport 是 `omp-extension`、`dsh-plugin`、`claude-mod`；缺少该字段的旧扩展需重新安装/加载才授予控制能力，Hook 保持观察。

新发送流只用 `sendPrompt` / `stop`，不使用远端 `insertDraft` / `submit` / UI activate。命令带唯一 request ID、原生 session ID 和8秒有效期；邮箱写入和 `accepted` 仅代表运输已接收，`applied` 表示原宿主 API 已接收，既不代表模型任务完成，也不代表语音/文字回复已到达。完成/停止必须另据真实生命周期事件。

超时、进程退出、调用结果不明返回 `deliveryUnknown`。Kimi 的所有 POST 网络错误、非成功 HTTP、坏/缺失信封或未知业务码也属于未知；当前没有未经证明就允许重发的 POST 错误码白名单。原进程 API 已调用后抛错默认未知，只有调用前的确定性本地拒绝或官方明确 drop 才是 failed。不自动重发或自动清空草稿，由用户核对原会话后处理。扩展校验原实例/会话、期限、操作与64KiB文本上限；重复 request ID 不执行第二次。每份信封最多256KiB，事件成功读取后删除，孤立事件最多10分钟；不写正文日志、不另存永久历史或云凭据。

## 官方依据

- [Claude Mods 概览](https://code.claude.com/docs/en/plugins/mods/overview)、[API](https://code.claude.com/docs/en/plugins/mods/api)、[官方公开类型](https://github.com/anthropics/claude-code/blob/main/mods/types/claude-code.d.ts)：Mod 在原进程执行；prompt admission / drop 与 turn.complete 分离；turn.abort 必须带运行 turnId。`MessageDisplay` 是展示，`UserPromptExpansion` 作用于用户已有输入，都不作为任意发送接口。
- [Claude 插件安装](https://code.claude.com/docs/en/plugins/install)：可添加本地 marketplace 并在原会话重新加载。这里只导出文件，真实安装由原会话用户执行。
- [Codex 官方固定0.166.0 queue入口](https://github.com/openai/codex/blob/rust-v0.166.0/codex-rs/tui/src/session_queue_commands.rs)、[queue processor](https://github.com/openai/codex/blob/rust-v0.166.0/codex-rs/app-server/src/request_processors/thread_queue_processor.rs)、[跨进程共享队列消费](https://github.com/openai/codex/blob/rust-v0.166.0/codex-rs/ext/queue/src/service.rs)：queue 可跨进程写共享队列，成功只证明 queued；不能单因无 Desktop socket 断言 API 不存在，也不能以 queued 冒充原 Desktop 已消费。
- [Kimi Server API](https://moonshotai.github.io/kimi-code/en/reference/server-api.html)、[conversation](https://moonshotai.github.io/kimi-code/en/reference/server-api-conversation.html)、[sessions](https://moonshotai.github.io/kimi-code/en/reference/server-api-sessions.html)。Beta 字段仍以所连接版本 OpenAPI 为准。

## 无外部副作用的回归

```bash
app/scripts/test-agent-hub.sh
app/scripts/test-agent-bridges.sh
app/scripts/test-agent-components.sh
claude plugin validate app/AgentBridges/claude-mod --json
```

Hub 测试编译正式 Hub/Adapter 并注入临时邮箱及假宿主，覆盖本地选择不 activate、只读 Hook 通知保留、精确实例写权、名称不影响身份、碰撞隔离、未知投递无重试及禁用源撤权。现有 Swift core 验证 Kimi schema/REST/WS 和租约/代次隔离、事件过滤及 accepted/applied 区分。Node 夹具真正加载 OMP、DSH 和 Claude Mod 源码，验证官方原进程调用、草稿不触碰 editor、错误/子 Agent/思考隔离、原 turnId stop 和最终正文。

本机 Claude 2.1.325 静态 Mod 验证通过；不等于实际插件加载、官方策略批准、真实会话投递或七宿主完整验收。本轮测试不读取私人聊天、不操作 ChatGPT 窗口、不执行真实 queue/RPC/模型调用，也不刷写设备。旧0.6.2 AX composer 修复保留历史记录，但当前 AgentHub 已不调用其发送/停止路径。
