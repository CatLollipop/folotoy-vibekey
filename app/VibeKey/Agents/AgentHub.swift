import Foundation

/// 官方会话路由。选择只改变本机绑定；写入能力始终来自原实例当前声明，不前置任何应用。
@MainActor @Observable final class AgentHub {
    private(set) var diagnostics: [AgentDiagnostic] = []
    private(set) var sessions: [AssistantAgentSession] = []
    private(set) var selectedSession: AssistantAgentSession?
    private(set) var latestEvent: ConversationEvent?
    private(set) var isRefreshing = false
    private(set) var isSending = false
    private(set) var lastError: String?
    @ObservationIgnored var onEvent: ((ConversationEvent) -> Void)?
    @ObservationIgnored var onReply: ((AgentReply) -> Void)?
    @ObservationIgnored var onAnyEvent: ((ConversationEvent) -> Void)?
    @ObservationIgnored var onAnyReply: ((AgentReply) -> Void)?
    @ObservationIgnored var onSelectionChange: ((AssistantAgentSession?) -> Void)?
    @ObservationIgnored private let mailbox: AgentMailbox
    @ObservationIgnored private let adapters: [any AgentAdapter]
    @ObservationIgnored private let kimi: KimiAgentAdapter
    @ObservationIgnored private let codexNotifications: MailboxAgentAdapter
    @ObservationIgnored private let defaults: UserDefaults
    @ObservationIgnored private var eventFilter = AgentEventFilter()
    @ObservationIgnored private var replied = Set<String>()
    @ObservationIgnored private var replyOrder: [String] = []
    @ObservationIgnored private var monitor: Task<Void, Never>?
    @ObservationIgnored private var discovered: [AssistantAgentSession] = []
    @ObservationIgnored private var observedSessions: [Identity: AssistantAgentSession] = [:]
    @ObservationIgnored private var observedOrder: [Identity] = []

    /// 使用结构化三元组，原生ID包含冒号时也不能与另一应用/实例串线。
    nonisolated private struct Identity: Hashable {
        let application: String
        let instance: String
        let session: String
        init(_ value: AssistantAgentSession) {
            application = value.applicationID; instance = value.instanceID; session = value.sessionID
        }
    }

    init(defaults: UserDefaults = .standard, mailbox: AgentMailbox? = nil, adapters injectedAdapters: [any AgentAdapter]? = nil) {
        self.defaults = defaults
        let mailbox = mailbox ?? AgentMailbox(); self.mailbox = mailbox
        let kimi = KimiAgentAdapter(); self.kimi = kimi
        codexNotifications = MailboxAgentAdapter(id: "codexHook", name: "Codex", mailbox: mailbox)
        adapters = injectedAdapters ?? [
            ClaudeCodeAgentAdapter(mailbox: mailbox),
            DesktopAXAgentAdapter(id: "claudeDesktop", name: "Claude Desktop", bundleIDs: ["com.anthropic.claudefordesktop", "com.anthropic.claude"]),
            DesktopAXAgentAdapter(id: "chatGPT", name: "ChatGPT.App / Codex", bundleIDs: ["com.openai.codex", "com.openai.chat"]),
            MailboxAgentAdapter(id: "omp", name: "OMP", mailbox: mailbox),
            MailboxAgentAdapter(id: "deepseekHarness", name: "DeepSeek Harness", mailbox: mailbox),
            kimi,
            WorkBuddyAgentAdapter(mailbox: mailbox),
        ]
        for adapter in adapters {
            adapter.onEvent = { [weak self] in self?.receive($0) }
            adapter.onReply = { [weak self] in self?.receive($0) }
        }
        codexNotifications.onEvent = { [weak self] in self?.receive($0) }
        codexNotifications.onReply = { [weak self] in self?.receive($0) }
    }

    func start() {
        guard monitor == nil, ProcessInfo.processInfo.environment["IB_TEST_MODE"] != "1" else { return }
        do { try mailbox.prepare() } catch { lastError = error.localizedDescription; return }
        monitor = Task { [weak self] in
            await self?.refresh()
            while !Task.isCancelled {
                guard let self else { return }
                for adapter in adapters where integrationEnabled(adapter.id) {
                    await adapter.poll(selectedSession?.applicationID == adapter.id ? selectedSession : nil)
                }
                if integrationEnabled("codexHook") { await codexNotifications.poll(nil) }
                try? await Task.sleep(for: .milliseconds(400))
            }
        }
    }
    func shutdown() { monitor?.cancel(); monitor = nil; kimi.disconnect() }

    func refresh() async {
        guard !isRefreshing else { return }
        isRefreshing = true; defer { isRefreshing = false }
        var nextDiagnostics: [AgentDiagnostic] = [], nextSessions: [AssistantAgentSession] = []
        for adapter in adapters {
            guard integrationEnabled(adapter.id) else { nextDiagnostics.append(disabledDiagnostic(adapter)); continue }
            nextDiagnostics.append(await adapter.diagnose())
            guard integrationEnabled(adapter.id) else { continue }
            do { nextSessions += try await adapter.discover() } catch { lastError = error.localizedDescription }
        }
        if integrationEnabled("codexHook") { nextSessions += (try? await codexNotifications.discover()) ?? [] }
        diagnostics = nextDiagnostics.map { diagnostic in
            guard !integrationEnabled(diagnostic.id), let adapter = adapters.first(where: { $0.id == diagnostic.id }) else { return diagnostic }
            return disabledDiagnostic(adapter)
        }
        discovered = nextSessions.filter { integrationEnabled($0.applicationID) }
        rebuildSessions()
    }

    /// 本地选择不调用activate，不订阅或前置原应用；原协议附着由明确的发送/停止动作验证。
    func select(_ session: AssistantAgentSession) async throws {
        try Task.checkCancellation()
        guard integrationEnabled(session.applicationID), let current = sessions.first(where: { Identity($0) == Identity(session) }) else {
            throw AgentAdapterError.sessionChanged
        }
        registerNotificationSession(current)
        choose(current)
    }

    /// 只能绑定从真实事件或正式发现保留下来的身份；此操作不产生任何写入能力。
    @discardableResult func selectReadOnly(_ session: AssistantAgentSession) -> Bool {
        guard integrationEnabled(session.applicationID),
              let current = sessions.first(where: { Identity($0) == Identity(session) }) ?? observedSessions[Identity(session)] else { return false }
        choose(current)
        return true
    }

    /// 通知协调器只将真实Hook/event/reply的原生身份交到这里，不读取或恢复聊天历史。
    func registerNotificationSession(_ session: AssistantAgentSession) {
        guard integrationEnabled(session.applicationID), adapter(session) != nil,
              [session.applicationID, session.instanceID, session.sessionID].allSatisfy({ !$0.isEmpty && $0.utf8.count <= 512 }) else { return }
        let key = Identity(session)
        observedSessions[key] = session
        observedOrder.removeAll { $0 == key }; observedOrder.append(key)
        while observedOrder.count > 128 {
            let evicted = observedOrder.removeFirst()
            observedSessions.removeValue(forKey: evicted)
        }
        rebuildSessions()
    }

    /// 每次操作前同步重读同一实例/会话的当前能力，绝不使用应用汇总capabilities授权。
    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability> {
        guard integrationEnabled(session.applicationID), let adapter = adapter(session) else { return [] }
        return adapter.capabilities(for: session)
    }

    func clearSelection() {
        guard selectedSession != nil else { return }
        selectedSession = nil; latestEvent = nil; onSelectionChange?(nil)
    }

    /// 历史接口保留但不再向原应用编辑器写草稿；待确认文本由统一会话路由保存在本机。
    func insertDraft(_ text: String) async throws { throw AgentAdapterError.blocked("请在会话页面保存草稿并确认发送") }
    func submit() async throws { throw AgentAdapterError.blocked("请在会话页面保存草稿并确认发送") }

    func sendPrompt(_ text: String) async throws {
        guard let selectedSession else { throw AgentAdapterError.blocked("请先选择原应用会话") }
        try await sendPrompt(text, in: selectedSession)
    }
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws {
        _ = try await deliverPrompt(text, in: session)
    }
    func deliverPrompt(_ text: String, in session: AssistantAgentSession) async throws -> AgentPromptReceipt {
        do {
            guard !isSending else { throw AgentAdapterError.blocked("上一条消息尚未取得投递回执") }
            guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf8.count <= 64_000 else {
                throw AgentAdapterError.blocked("消息为空或过长")
            }
            guard let adapter = adapter(session), capabilities(for: session).contains(.submit) else { throw AgentAdapterError.officialChannelRequired }
            isSending = true; defer { isSending = false }
            try Task.checkCancellation()
            let receipt = try await adapter.deliverPrompt(text, in: session)
            lastError = nil
            return receipt
        } catch { lastError = error.localizedDescription; throw error }
    }
    func stop() async throws {
        guard let selectedSession else { throw AgentAdapterError.blocked("请先选择原应用会话") }
        try await stop(in: selectedSession)
    }
    func stop(in session: AssistantAgentSession) async throws {
        do {
            guard let adapter = adapter(session), capabilities(for: session).contains(.stop) else { throw AgentAdapterError.officialChannelRequired }
            try Task.checkCancellation()
            try await adapter.stop(in: session)
            lastError = nil
        } catch { lastError = error.localizedDescription; throw error }
    }

    func configureKimi(endpoint: String, token: String) throws { try kimi.configure(endpoint: endpoint, token: token) }
    var kimiEndpoint: String { kimi.endpoint }
    func clearKimiConfiguration() { kimi.clearConfiguration() }

    func setIntegrationEnabled(_ enabled: Bool, id: String) {
        AgentIntegrationPreferences.setEnabled(enabled, for: id, defaults: defaults)
        if !enabled {
            discovered.removeAll { !integrationEnabled($0.applicationID) }
            observedOrder.removeAll { key in
                guard let value = observedSessions[key], !integrationEnabled(value.applicationID) else { return false }
                observedSessions.removeValue(forKey: key); return true
            }
            if let selectedSession, !integrationEnabled(selectedSession.applicationID) { clearSelection() }
            if id == "kimiCode" { kimi.disconnect() }
            if let adapter = adapters.first(where: { $0.id == id }), let index = diagnostics.firstIndex(where: { $0.id == id }) {
                diagnostics[index] = disabledDiagnostic(adapter)
            }
            rebuildSessions()
        }
    }
    func integrationEnabled(_ id: String) -> Bool {
        AgentIntegrationPreferences.isEnabled(id == "codexHook" ? "chatGPT" : id, defaults: defaults)
    }
    private func disabledDiagnostic(_ adapter: any AgentAdapter) -> AgentDiagnostic {
        AgentDiagnostic(id: adapter.id, name: adapter.name, capabilities: [],
                        detail: String(localized: "接入组件已卸载；安装后重新检测。", bundle: .l10n), installed: false, verifiedAt: Date())
    }
    private func adapter(_ session: AssistantAgentSession) -> (any AgentAdapter)? {
        guard integrationEnabled(session.applicationID) else { return nil }
        return session.applicationID == "codexHook" ? codexNotifications : adapters.first { $0.id == session.applicationID }
    }
    private func choose(_ session: AssistantAgentSession) {
        let changed = selectedSession.map { Identity($0) != Identity(session) } ?? true
        selectedSession = session
        if changed { latestEvent = nil; lastError = nil; onSelectionChange?(session) }
    }
    private func rebuildSessions() {
        var identities = Set<Identity>(), next: [AssistantAgentSession] = []
        for value in discovered + observedOrder.compactMap({ observedSessions[$0] }) where integrationEnabled(value.applicationID) {
            if identities.insert(Identity(value)).inserted { next.append(value) }
        }
        sessions = next
        if let selectedSession, !identities.contains(Identity(selectedSession)) { clearSelection() }
    }
    private func observe(_ application: String, instance: String, session: String) {
        let candidate = AssistantAgentSession(applicationID: application, instanceID: instance, sessionID: session,
            name: adapters.first(where: { $0.id == application })?.name ?? "Codex")
        registerNotificationSession(candidate)
    }
    private func receive(_ event: ConversationEvent) {
        guard integrationEnabled(event.applicationID), eventFilter.accepts(event) else { return }
        observe(event.applicationID, instance: event.instanceID, session: event.sessionID)
        onAnyEvent?(event)
        guard let selectedSession, event.applicationID == selectedSession.applicationID,
              event.instanceID == selectedSession.instanceID, event.sessionID == selectedSession.sessionID else { return }
        latestEvent = event; onEvent?(event)
    }
    private func receive(_ reply: AgentReply) {
        guard integrationEnabled(reply.session.applicationID), reply.isFinal,
              !reply.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        let identity = [reply.session.applicationID, reply.session.instanceID, reply.session.sessionID, reply.turnID, reply.messageID]
        guard let data = try? JSONEncoder().encode(identity), let key = String(data: data, encoding: .utf8), replied.insert(key).inserted else { return }
        registerNotificationSession(reply.session)
        replyOrder.append(key)
        if replyOrder.count > 2_048 { replied.remove(replyOrder.removeFirst()) }
        onAnyReply?(reply)
        if let selectedSession, Identity(reply.session) == Identity(selectedSession) { onReply?(reply) }
    }
}
