# 已有会话路由与Passport对话视图（0.7）

## 用户确认的范围

仅接原应用已有会话，不启动或恢复另一个Agent进程，不创建助理专属会话。没有官方发送能力的会话只接收提醒。通知双击OK只切Passport，不激活Mac窗口。不同会话的未发草稿分别保留。方案采用Mac应用内统一会话层；关闭设置窗口可继续运行，退出应用会停止桥接。草稿、未知票据及最近正文仅在本次运行内存中保存，不形成另一份永久聊天记录。

## 根因与职责

原硬件companion模式仅表示执行归属，另有默认cloud的AssistantController.destination；会话丢失又会把目的地改cloud，所以“连接电脑”仍可能调用DeepSeek。旧录音结束直接sendPrompt，旧通知OK则先关闭通知再采音，均无法支持独立确认及双击导航。

当前路径：`Device semantic event → AssistantCoordinator → ConversationRouter → AgentHub → official native instance adapter`。Router以application/instance/session三元组管理有界草稿、真实状态、最后正文及不可变发送票据；设备sid为该结构化三元组的128-bit摘要，不传原生ID或凭据。Controller只产出本generation识别结果；电脑录音显式使用beginDraftRecording，不读取Mac云试用目的地。

选择会话只更新本地绑定，不调用activate。官方发送在确认时再次检查原实例和原会话的当前能力。Hook负责生命周期/最终正文；Claude Mod、OMP extension、DSH plugin及Kimi原服务的具体边界见[应用接入](agents/README.md)。Codex官方queue目前仅作为候选：CLI排队成功不足以证明原Desktop消费，未验证前不授予发送能力。

## 交互

- 长按OK采音，绿色采音动画；松开只形成右栏草稿；之后一次独立短按OK才确认发送。
- 通知可见时首次短按等待双击窗口；双击导航到首次按下时固定的nid，而不是第二击时新到的通知。单击仅关闭通知，长持仅采音；同一gesture不能兼任确认。
- 左栏顶部为当前所选宠物小头像，下面显示Agent正文；右栏显示识别增量或未发草稿。中文12px，每页保守7字×8行、最多128B，Mac保存全文并分页。右侧页点和省略点沿用当前阅读栏的page/pages。
- 长按下键菜单包括已有会话、对话/宠物视图、阅读Agent/草稿栏、停止任务和返回。上下键翻当前栏。长按上键仍为AI助理/连接电脑热切换菜单。
- 只读会话不允许录音/发送；缺会话或断线不转投云端。原应用的工具批准仍在原应用进行，确认草稿不是批准工具。

## 事务边界

每次设备绑定使用新rev，连接变化、切会话会取消旧ASR generation。事件同时核对sid/rev/drev/gid；每个boot内gid只有一个owner，录音start/stop可配对一次，但不能再确认或跳转。

确认创建包含原会话、草稿revision、文本和UUID的不可变票据。accepted只表示原生API接受，不表示任务完成；完成来自正式事件。旧票据回执只能更新原会话，且不能清掉较新的草稿。明确拒绝后提升draftRevision，允许用户重新确认；未知I/O或取消保留unknownSubmission原文及ID、锁定发送，用户在Mac原会话核对该票据后才解除。没有供应商幂等键时不声称exactly-once，不自动重发未知请求。

显示投影使用独立conversation ACK槽。state和两个pane在首个await前冻结为同一快照；busy只对幂等显示做有限重排，不能驱动官方消息重试。配置、通知与会话各有独立ACK身份。能力心跳过期会降为只读，保留接收方与草稿。

资源上限：Mac最多16份未发草稿，每份8192B；最近正文和会话记录有界，通知导航表最多128项/24小时。设备仅保留两个128B pane、标题及语义状态，不复制整份聊天历史，不增Flash分区。

## 验证

`bash app/scripts/test-conversations.sh`覆盖原实例隔离、换会话草稿保留、旧ASR、旧/重复确认、未知票据、旧ACK不删新稿、UTF-8分页与511B整帧边界。Controller测试覆盖显式cloud设置下draft录音仍为零LLM/TTS调用及取消。Gzip修复使用原源码独立复现和正式EOS/ASan回归。

协议与设备宿主测试不能替代真实插件加载、真实Agent回执和物理OK测试；安装了CLI、导出插件或拿到thread ID均不等于原会话已接入。当前结果见[验收记录](assistant-acceptance.md)。
