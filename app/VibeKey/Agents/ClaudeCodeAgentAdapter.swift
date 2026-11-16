import Foundation

/// Claude Code 原进程Mod提供官方双向接口；旧Hook仅观察，不执行终端或界面控制。
@MainActor final class ClaudeCodeAgentAdapter: AgentAdapter {
    let id = "claudeCode"
    let name = "Claude Code"
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let mailbox: AgentMailbox
    private let reader: MailboxAgentAdapter

    init(mailbox: AgentMailbox) {
        self.mailbox = mailbox
        reader = MailboxAgentAdapter(id: "claudeCode", name: "Claude Code", mailbox: mailbox)
        reader.onEvent = { [weak self] in self?.onEvent?($0) }
        reader.onReply = { [weak self] in self?.onReply?($0) }
    }

    func diagnose() async -> AgentDiagnostic { await reader.diagnose() }
    func discover() async throws -> [AssistantAgentSession] { try await reader.discover() }
    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability> { reader.capabilities(for: session) }
    /// 原进程Mod和Hook均只做本地绑定，不操作终端或Desktop窗口。
    func activate(_ session: AssistantAgentSession) async throws { try await reader.activate(session) }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func submit(in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws { try await reader.sendPrompt(text, in: session) }
    func stop(in session: AssistantAgentSession) async throws { try await reader.stop(in: session) }
    func poll(_ session: AssistantAgentSession?) async { await reader.poll(session) }
}
