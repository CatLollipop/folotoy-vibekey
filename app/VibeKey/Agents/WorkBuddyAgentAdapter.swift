import Foundation

/// WorkBuddy界面负责控制；Hook只有与当前窗口标题明确一致时才能绑定状态/正文。
/// 不根据进程名或“最近事件”把另一个任务的回复送到所选会话。
@MainActor final class WorkBuddyAgentAdapter: AgentAdapter {
    let id = "workBuddy"
    let name = "WorkBuddy"
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let desktop = DesktopAXAgentAdapter(id: "workBuddy", name: "WorkBuddy", bundleIDs: ["com.tencent.workbuddy.mac"])
    private let mailbox: AgentMailbox
    init(mailbox: AgentMailbox) {
        self.mailbox = mailbox
        desktop.onEvent = { [weak self] in self?.onEvent?($0) }
        desktop.onReply = { [weak self] in self?.onReply?($0) }
    }
    func diagnose() async -> AgentDiagnostic {
        let base = await desktop.diagnose()
        let visible = try? await desktop.discover()
        let matching = mailbox.registrations(for: id).filter { registration in
            registration.sessions.contains { hook in visible?.contains(where: { Self.matches(hook.name, $0.name) && desktop.matchesNativeSession(hook.sessionID, in: $0) }) == true }
        }
        var capabilities = base.capabilities
        for registration in matching { capabilities.formUnion(registration.capabilities.filter { [.observeState, .readReply].contains($0) }) }
        return AgentDiagnostic(id: id, name: name, capabilities: capabilities,
                               detail: base.detail + AgentText.localized(matching.isEmpty ? "；未发现与当前会话身份匹配的 Hook" : "；当前会话 Hook 已绑定"),
                               installed: base.installed, verifiedAt: Date())
    }
    func discover() async throws -> [AssistantAgentSession] { try await desktop.discover() }
    func activate(_ session: AssistantAgentSession) async throws { try await desktop.activate(session) }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { try await desktop.insertDraft(text, in: session) }
    func submit(in session: AssistantAgentSession) async throws { try await desktop.submit(in: session) }
    func stop(in session: AssistantAgentSession) async throws { try await desktop.stop(in: session) }
    func poll(_ session: AssistantAgentSession?) async {
        guard let session, session.applicationID == id else { return }
        let matches = mailbox.registrations(for: id).flatMap(\.sessions).filter { Self.matches($0.name, session.name) && desktop.matchesNativeSession($0.sessionID, in: session) }
        for envelope in mailbox.events(for: id) {
            guard matches.count == 1, let native = matches.first,
                  native.instanceID == envelope.event.instanceID, native.sessionID == envelope.event.sessionID else { continue }
            let event = envelope.event
            onEvent?(ConversationEvent(applicationID: id, instanceID: session.instanceID, sessionID: session.sessionID,
                                       turnID: event.instanceID + ":" + event.turnID, eventID: event.eventID,
                                       sequence: event.sequence, state: event.state, timestamp: event.timestamp))
            if let reply = envelope.reply {
                onReply?(AgentReply(session: session, turnID: event.instanceID + ":" + event.turnID,
                                   messageID: reply.messageID, text: reply.text, isFinal: reply.isFinal))
            }
        }
        if matches.count != 1 { await desktop.poll(session) }
    }
    nonisolated private static func matches(_ a: String, _ b: String) -> Bool {
        AgentSessionNameMatcher.normalizedWindowTitle(a) == AgentSessionNameMatcher.normalizedWindowTitle(b)
    }
}
