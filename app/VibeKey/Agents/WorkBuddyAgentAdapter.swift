import Foundation

/// WorkBuddy原生Hook保留原会话身份；没有官方双向接口时只接收消息，不通过UI控制。
@MainActor final class WorkBuddyAgentAdapter: AgentAdapter {
    let id = "workBuddy"
    let name = "WorkBuddy"
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let mailbox: AgentMailbox
    private let reader: MailboxAgentAdapter

    init(mailbox: AgentMailbox) {
        self.mailbox = mailbox
        reader = MailboxAgentAdapter(id: "workBuddy", name: "WorkBuddy", mailbox: mailbox)
        reader.onEvent = { [weak self] in self?.onEvent?($0) }
        reader.onReply = { [weak self] in self?.onReply?($0) }
    }

    func diagnose() async -> AgentDiagnostic {
        let registrations = mailbox.registrations(for: id)
        var capabilities = Set(registrations.flatMap(\.capabilities)).intersection([.discover, .observeState, .readReply])
        if !registrations.isEmpty { capabilities.insert(.activate) }
        return AgentDiagnostic(id: id, name: name, capabilities: capabilities,
                               detail: "Hook 仅提供生命周期和回复，发送与停止需要官方双向接口",
                               installed: !registrations.isEmpty, verifiedAt: Date())
    }

    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability> {
        reader.capabilities(for: session).intersection([.discover, .activate, .observeState, .readReply])
    }
    func discover() async throws -> [AssistantAgentSession] { try await reader.discover() }
    func activate(_ session: AssistantAgentSession) async throws {
        guard mailbox.registrations(for: id).contains(where: { $0.sessions.contains(where: { $0.applicationID == session.applicationID && $0.instanceID == session.instanceID && $0.sessionID == session.sessionID }) }) else {
            throw AgentAdapterError.sessionChanged
        }
    }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func submit(in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func stop(in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func poll(_ session: AssistantAgentSession?) async { await reader.poll(session) }
}
