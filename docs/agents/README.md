# AI 助理的应用接入

本模块在上游 Codex 导航、通知和听写链路之外增加 `AgentHub`。七个目标分别登记适配器，不把“可以粘贴”当成“可以读取回复和运行状态”。当前未完成真机/真实应用验收的能力仍显示缺失；模拟测试通过不能作为七个应用全部可用的验收证明。

## 调用链与接口

- 设置页 / AssistantController → AgentHub 选择的 `AssistantAgentSession` → AgentAdapter → 原应用 AX、原进程扩展或官方 Kimi Server API。
- 原应用事件 → `ConversationEvent` → 按 application / instance / session / turn 检查序号与 event ID → 仅当前会话的宠物状态。
- 原应用最终 assistant 正文 → `AgentReply` → 当前会话及 message ID 去重 → AssistantCoordinator → MiniMax TTS。思考、工具结果、错误和取消的半条回复不会朗读。
- `discover / activate / submit / stop / observeState / readReply` 是完整双向接入要求；`insertDraft` 是可选能力。Kimi/DSH直接提交API没有原编辑器草稿接口，不因此被判定为缺少双向能力。

设置 › 智能体将 `AgentDiagnosticsView(hub:)` 与原 Codex 用量/兼容通知合为一页。旧 `.integrations` 入口转向 `.vibe`，侧栏仅保留一个「智能体」。Claude 完整 Hook 只从上方安装，原 Codex 通知配置保留。

`AgentDiagnosticsView(hub:)` 提供逐应用能力、原会话选择、测试文本直接发送、写草稿、停止、扩展安装和 Kimi 连接设置。`onEvent`、`onReply`、`onSelectionChange` 均在主线程回调。切换会话取消旧播放，过期异步选择不能覆盖较新的选择。原有 Codex `AgentNotifier` 保留；新助手硬件接管开启时不调用原 Codex 导航或发送。

伴随模式长按下键打开当前发现的原会话与云对话菜单，上下选择、OK 确认；云对话选择清空 Hub，原会话选择等待真实 activate 后切换目的地。短按上键仅提交 Hub 已登记的助手草稿；AX/Claude/OMP在原端进一步核对正文，手动/修改后的草稿不会误发。短按下键取消本地播放并停止所选 Hub 任务，缺少停止回执仍明确报错。菜单页覆盖普通状态；关闭硬件接管才恢复旧设备桥。

## 适配方式与使用

| 目标 | 入口 | 真实限制 |
| --- | --- | --- |
| Claude Code | 安装 Hook 后在原会话加载；Hook登记原Claude进程与Terminal tty；发送只前置同tty标签页，并等待同会话、同prompt哈希的 UserPromptSubmit 回执 | 仅支持能验证身份的 Apple Terminal。不会向 `/dev/tty` 写输出冒充输入。无法关联停止回执时停止能力保持阻塞；已有草稿需先在原终端处理。 |
| Claude Desktop | 辅助功能控制当前可见会话 | 需要唯一composer、明确发送/停止控件和带assistant身份的回复容器。只扫描整个窗口或复制全文无法通过朗读验收。 |
| ChatGPT.App | 本机 `com.openai.codex` 与传统 `com.openai.chat` 分别识别；当前新增Hub使用AX兼容层 | 此Hub没有假称已附着到Desktop私有app-server；原Codex发送/停止/导航链仍保留。AX缺的能力明确阻塞。 |
| OMP | 安装 `.omp/agent/extensions/vibekey-assistant.mjs` 后在原OMP会话 `/reload`；extension使用正式API | 不启动第二个OMP恢复已有session。闲时省略deliverAs才能启动；忙时followUp原生入队。用户消息正式入场才确认提交，真正idle且无队列才报告完成。 |
| DeepSeek Harness | 导出插件，通过原DSH runtime的插件管理加载 | 新 `com.deepseek.dsh` 和旧 `ai.deepseek.dsh.desktop.next` 兼容识别。插件只列现有主Agent，使用稳定的 `followup(createUserMessage(...))` 和 `cancel`；不resume冷会话，不依赖发生过签名变化的内部prompt API。插件需由宿主解析 `@deepseek-ai/dsh-llm`。 |
| Kimi Code Desktop | 用户已启动的 `kimi web`，配置本机地址与访问令牌 | 只允许loopback HTTP，默认端口58627。先检查运行版本 `/openapi.json`，通过REST列会话/提交/停止，WS订阅真实状态和最终回复。不夺取锁、不自动重发、不修改批准/模型设置。Kimi Work是另一产品。 |
| WorkBuddy | 当前可见窗口AX + 选择实际配置JSON合并Hook | 配置位置依版本选择；未看到回调不算连接。只有Hook `session_title` 与当前窗口标题唯一一致，且窗口document/URL/Identifier明确含同一原生session ID，才将Hook状态/回复绑定到该会话；否则保持AX能力及明确缺口。 |

Claude Hook安装保留用户现有条目，先写一次 `.vibekey-assistant.bak`；原Codex Hook不更改。加载扩展/Hook通常需要在原应用执行原生重新加载，不重启或打断用户任务。所有测试输入应在专用测试会话执行。

## 文件邮箱协议

`~/Library/Application Support/FoloButtonDev/AgentBridge/` 下目录权限0700，JSON文件0600。协议为1，注册位于 `instances/<instanceID>/registration.json`，包含application、process实例、会话、真实能力和心跳；命令仅允许 `activate / insertDraft / submit / sendPrompt / stop`。

每条命令有独立request ID、session ID和8秒有效期。原扩展先返回 `accepted`，执行成功后返回 `applied`；Swift只有看到applied才返回成功。执行前拒绝过期、错误实例/会话和重复请求，未知投递不重发。消息最多256KiB，prompt最多64KiB。扩展停止后注册撤销，失去心跳的实例不参与发现。

事件正文不写运行日志，Swift消费后删除邮箱事件，孤立事件超过10分钟清理。这里只传当前最终回复，不另存永久聊天历史或云凭据。Claude Hook不扫描历史transcript文件。第三方应用自身保存会话的行为不由本模块改变。

## Kimi协议与回归

Kimi正式文档：

- https://moonshotai.github.io/kimi-code/en/reference/server-api.html
- https://moonshotai.github.io/kimi-code/en/reference/server-api-conversation.html
- https://moonshotai.github.io/kimi-code/en/reference/server-api-sessions.html

Beta字段以运行版本schema为准。WS订阅要等匹配request ID的成功回执，响应40931等保持阻塞。ping/pong维持连接，认证失败停止自动重试。历史 `turns` 是替换快照，不播放已结束历史；`assistant_message` 与 `reasoning` 分开，取消/错误/撤销turn不播放。停止REST的 `aborted:true` 不证明已经停止，需等待原turn的interrupted结束事件。

## 验证

运行 `app/scripts/test-agent-bridges.sh`，只需macOS Command Line Tools和Node.js：

- 编译真实Swift产品Models、Mailbox、Kimi API、Reducer和设备助手协议，不启动用户应用或收费模型。
- Kimi官方REST envelope/schema夹具、主/子agent、历史/实时、reasoning、重复完成、用户取消、undo与错误数据。
- 实际文件邮箱异步回执、accepted与applied区分、旧/错误会话、过期和重复命令。
- 真正加载OMP/DSH桥接模块，模拟宿主正式API，验证原会话入队/停止、闲时启动、入场回执、完成时机和正文隔离。
- 执行真正Python Hook，验证idle_prompt不会变成审批提示，prompt正文不进入事件文件。
- 设备配置请求rid、成功rev/off匹配、迟到失败隔离、511字节行边界和288字节base64块。
- 助手按键的短/长按归属、菜单移动/确认、通知ACK与断连复位隔离；MiniMax从助手复用同一Key/base、模型目录可选、删除共享Key和无重复凭据。
- OMP拒绝手动和已经修改的草稿，真实回执后才清空仍相同的输入。

另运行 `app/scripts/test-assistant-core.sh` 验证云LLM取消隔离、非成功finish_reason不朗读、关闭朗读仍取消旧操作，以及原应用终态/投递回执/最终回复的先后序：终态早于applied暂存，完成无正文也结束等待，早到正文优先，已播放的最终回复不会被随后completed/stopped/error截断。硬件submit/stop绑定按键当时的原会话身份，异步执行前复核，迟到失败不污染新会话。以上均不能代替实际App版本、AX授权、原插件加载及付费服务和设备的实测。


### Mailbox测试就绪条件

`AgentCoreTests`的邮箱原进程fixture使用一次性就绪屏障：peer发布registration后，必须能通过生产`AgentMailbox.registrations`读取并得到完整匹配的会话，桌面正例才开始command。peer启动失败会通过屏障直接抛出，不依赖增加固定sleep。accepted与applied之间的160ms是刻意跨过生产80ms轮询以检验投递语义，仍不等于启动同步。

每个CLI核心case都有独立错误归属；Mailbox正例若在就绪后仍sessionChanged，会报告文件存在/解码/可见注册/身份匹配/租约age计数。不会自动重试、吞错或放宽真实注册安全校验。该fixture只用临时目录和专用文本，不访问私人会话。
