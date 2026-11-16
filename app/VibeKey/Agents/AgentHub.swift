import Foundation

/// 统一应用接入入口。UI只发意图，语音助手只订阅所选会话的事件和最终正文。
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
    /// 通知独立订阅所有已启用来源；不改变下方只针对selectedSession的助手/宠物回调。
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
    @ObservationIgnored private var assistantDrafts: Set<String> = []
    @ObservationIgnored private var selectionGeneration = UUID()

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let mailbox = AgentMailbox()
        self.mailbox = mailbox
        let kimi = KimiAgentAdapter(); self.kimi = kimi
        codexNotifications = MailboxAgentAdapter(id: "codexHook", name: "Codex", mailbox: mailbox)
        adapters = [
            ClaudeCodeAgentAdapter(mailbox: mailbox),
            DesktopAXAgentAdapter(id: "claudeDesktop", name: "Claude Desktop", bundleIDs: ["com.anthropic.claudefordesktop", "com.anthropic.claude"]),
            DesktopAXAgentAdapter(id: "chatGPT", name: "ChatGPT.App / Codex", bundleIDs: ["com.openai.codex", "com.openai.chat"]),
            MailboxAgentAdapter(id: "omp", name: "OMP", mailbox: mailbox),
            PreferredBridgeAgentAdapter(id: "deepseekHarness", name: "DeepSeek Harness", mailbox: mailbox,
                                        bundleIDs: ["com.deepseek.dsh", "ai.deepseek.dsh.desktop.next"]),
            kimi,
            WorkBuddyAgentAdapter(mailbox: mailbox),
        ]
        for adapter in adapters {
            adapter.onEvent = { [weak self] event in self?.receive(event) }
            adapter.onReply = { [weak self] reply in self?.receive(reply) }
        }
        codexNotifications.onEvent = { [weak self] event in self?.receive(event) }
        codexNotifications.onReply = { [weak self] reply in self?.receive(reply) }
    }

    func start() {
        guard monitor == nil, ProcessInfo.processInfo.environment["IB_TEST_MODE"] != "1" else { return }
        do { try mailbox.prepare() } catch { lastError = error.localizedDescription; return }
        monitor = Task { [weak self] in
            await self?.refresh()
            while !Task.isCancelled {
                guard let self else { return }
                for adapter in adapters where integrationEnabled(adapter.id) {
                    var observed = selectedSession?.applicationID == adapter.id ? selectedSession : nil
                    // AX只能看当前可见窗口；通知检测不activate、不抢焦点、不打开后台私人会话。
                    if observed == nil, ["claudeDesktop", "chatGPT", "workBuddy", "deepseekHarness"].contains(adapter.id) {
                        observed = try? await adapter.discover().first
                    }
                    await adapter.poll(observed)
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
            guard integrationEnabled(adapter.id) else {
                nextDiagnostics.append(disabledDiagnostic(adapter)); continue
            }
            nextDiagnostics.append(await adapter.diagnose())
            guard integrationEnabled(adapter.id) else { continue }
            do { nextSessions += try await adapter.discover() }
            catch { lastError = error.localizedDescription }
        }
        // 安装/卸载可发生在异步探测期间；提交前再过滤，避免旧结果恢复已卸载会话。
        diagnostics = nextDiagnostics.map { diagnostic in
            guard !integrationEnabled(diagnostic.id), let adapter = adapters.first(where: { $0.id == diagnostic.id }) else { return diagnostic }
            return disabledDiagnostic(adapter)
        }
        sessions = nextSessions.filter { integrationEnabled($0.applicationID) }
        if let current = selectedSession, !sessions.contains(current) { clearSelection() }
    }
    func select(_ session: AssistantAgentSession) async throws {
        guard sessions.contains(session), let adapter = adapter(session) else { throw AgentAdapterError.sessionChanged }
        let token = UUID(); selectionGeneration = token
        try await adapter.activate(session)
        try Task.checkCancellation()
        guard token == selectionGeneration, integrationEnabled(session.applicationID) else { throw CancellationError() }
        if selectedSession != session {
            selectedSession = session; latestEvent = nil; lastError = nil
            onSelectionChange?(session)
        }
    }
    func clearSelection() {
        selectionGeneration = UUID()
        guard selectedSession != nil else { return }
        selectedSession = nil; latestEvent = nil; onSelectionChange?(nil)
    }
    func insertDraft(_ text: String) async throws {
        guard let session = selectedSession, let adapter = adapter(session) else { throw AgentAdapterError.blocked("请先选择原应用会话") }
        do { try await adapter.insertDraft(text, in: session); assistantDrafts.insert(session.id); lastError = nil }
        catch { lastError = error.localizedDescription; throw error }
    }
    func submit() async throws {
        do {
            guard !isSending else { throw AgentAdapterError.blocked("上一条消息尚未取得投递回执") }
            guard let session = selectedSession, let adapter = adapter(session) else { throw AgentAdapterError.blocked("请先选择原应用会话") }
            guard assistantDrafts.contains(session.id) else { throw AgentAdapterError.blocked("所选会话没有由助手写入的待发送草稿") }
            isSending = true; defer { isSending = false }
            try await adapter.submit(in: session)
            assistantDrafts.remove(session.id); lastError = nil
        } catch { lastError = error.localizedDescription; throw error }
    }
    func sendPrompt(_ text: String) async throws {
        guard !isSending else { throw AgentAdapterError.blocked("上一条消息尚未取得投递回执") }
        guard let session = selectedSession, let adapter = adapter(session) else { throw AgentAdapterError.blocked("请先选择原应用会话") }
        isSending = true; defer { isSending = false }
        do { try await adapter.sendPrompt(text, in: session); assistantDrafts.remove(session.id); lastError = nil }
        catch { lastError = error.localizedDescription; throw error }
    }
    func stop() async throws {
        do {
            guard let session = selectedSession, let adapter = adapter(session) else { throw AgentAdapterError.blocked("请先选择原应用会话") }
            try await adapter.stop(in: session); lastError = nil
        } catch { lastError = error.localizedDescription; throw error }
    }
    func configureKimi(endpoint: String, token: String) throws { try kimi.configure(endpoint: endpoint, token: token) }
    var kimiEndpoint: String { kimi.endpoint }
    func clearKimiConfiguration() { kimi.clearConfiguration() }

    /// 卸载只停用本应用适配器；不终止宿主进程，也不停止原应用的任务。
    func setIntegrationEnabled(_ enabled: Bool, id: String) {
        AgentIntegrationPreferences.setEnabled(enabled, for: id, defaults: defaults)
        if !enabled {
            sessions.removeAll { $0.applicationID == id }
            assistantDrafts = assistantDrafts.filter { draft in !draft.hasPrefix(id + ":") }
            if selectedSession?.applicationID == id { clearSelection() }
            if id == "kimiCode" { kimi.disconnect() }
            if let adapter = adapters.first(where: { $0.id == id }), let index = diagnostics.firstIndex(where: { $0.id == id }) {
                diagnostics[index] = disabledDiagnostic(adapter)
            }
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
        return adapters.first { $0.id == session.applicationID }
    }
    private func receive(_ event: ConversationEvent) {
        guard integrationEnabled(event.applicationID), eventFilter.accepts(event) else { return }
        onAnyEvent?(event)
        guard let selected = selectedSession,
              event.applicationID == selected.applicationID, event.instanceID == selected.instanceID,
              event.sessionID == selected.sessionID else { return }
        latestEvent = event; onEvent?(event)
    }
    private func receive(_ reply: AgentReply) {
        guard integrationEnabled(reply.session.applicationID), reply.isFinal, !reply.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        let identity = reply.session.id + ":" + reply.turnID + ":" + reply.messageID
        guard replied.insert(identity).inserted else { return }
        replyOrder.append(identity)
        if replyOrder.count > 2_048 { replied.remove(replyOrder.removeFirst()) }
        onAnyReply?(reply)
        if reply.session == selectedSession { onReply?(reply) }
    }
}

/// DSH新旧桌面识别共用入口；桥接就绪后按正式session ID控制，否则只提供已探测AX能力。
@MainActor private final class PreferredBridgeAgentAdapter: AgentAdapter {
    let id: String
    let name: String
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let bridge: MailboxAgentAdapter
    private let desktop: DesktopAXAgentAdapter
    private var useBridge = false
    init(id: String, name: String, mailbox: AgentMailbox, bundleIDs: [String]) {
        self.id = id; self.name = name
        bridge = MailboxAgentAdapter(id: id, name: name, mailbox: mailbox)
        desktop = DesktopAXAgentAdapter(id: id, name: name, bundleIDs: bundleIDs)
        let routes: [any AgentAdapter] = [bridge, desktop]
        for adapter in routes {
            adapter.onEvent = { [weak self] in self?.onEvent?($0) }
            adapter.onReply = { [weak self] in self?.onReply?($0) }
        }
    }
    private func route(_ session: AssistantAgentSession) -> any AgentAdapter { session.instanceID.hasPrefix("pid-") ? desktop : bridge }
    func diagnose() async -> AgentDiagnostic {
        let state = await bridge.diagnose()
        useBridge = state.installed
        return useBridge ? state : await desktop.diagnose()
    }
    func discover() async throws -> [AssistantAgentSession] {
        if useBridge { return try await bridge.discover() }
        return try await desktop.discover()
    }
    func activate(_ session: AssistantAgentSession) async throws { try await route(session).activate(session) }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { try await route(session).insertDraft(text, in: session) }
    func submit(in session: AssistantAgentSession) async throws { try await route(session).submit(in: session) }
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws { try await route(session).sendPrompt(text, in: session) }
    func stop(in session: AssistantAgentSession) async throws { try await route(session).stop(in: session) }
    func poll(_ session: AssistantAgentSession?) async {
        await bridge.poll(session)
        // 原生bridge是独立会话身份的权威来源，存在时不再从同一窗口产出第二份AX完成通知。
        if !bridge.hasLiveInstances { await desktop.poll(session) }
    }
}
