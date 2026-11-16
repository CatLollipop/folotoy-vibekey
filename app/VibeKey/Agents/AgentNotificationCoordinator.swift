import Foundation

/// 通知与所选会话的宠物/语音助手互相独立；只用USB或已配对TLS Wi-Fi，不带服务Key。
/// busy、断连、丢ACK均重试同nid/rev，最多16项/5分钟；设备commit负责去重，Mac不重复造新事件。
@MainActor final class AgentNotificationCoordinator {
    var onDelivered: ((PassportNotification, DeviceNotificationDelivery) -> Void)?
    /// 只注册真实来源身份供设备导航；不会因此授予发送能力，也不激活Mac窗口。
    var onConversationNotice: ((PassportNotification, AssistantAgentSession) -> Void)?
    private(set) var lastError: String?
    private(set) var suppressedUnboundLegacy = 0
    private let hub: AgentHub
    private let legacy: AgentNotifier
    private let link: DeviceLink
    private var reducer = AgentNotificationReducer()
    private var queue = AgentNotificationQueue()
    private var worker: Task<Void, Never>?
    private var transfer: (token: UUID, notice: PassportNotification, task: Task<DeviceNotificationDelivery, Error>)?
    private var deliveredRevisions: [String: UInt32] = [:]
    private var oldEvent: ((ConversationEvent) -> Void)?
    private var oldReply: ((AgentReply) -> Void)?
    private var oldNotice: ((AgentNotifier.Notice) -> Void)?
    private var legacyIdentities: [UUID: String] = [:]
    private var latestNotices: [String: PassportNotification] = [:]
    private var noticeOrder: [String] = []
    private var observedModernSources: Set<String> = []

    init(hub: AgentHub, legacy: AgentNotifier, link: DeviceLink) {
        self.hub = hub; self.legacy = legacy; self.link = link
    }
    /// 不启动Hub或设备，诊断可只注入专用合成event/reply而不观察任何私人会话。
    func start() {
        guard worker == nil else { return }
        oldEvent = hub.onAnyEvent; oldReply = hub.onAnyReply; oldNotice = legacy.onNotice
        hub.onAnyEvent = { [weak self] event in self?.oldEvent?(event); self?.receive(event) }
        hub.onAnyReply = { [weak self] reply in self?.oldReply?(reply); self?.receive(reply) }
        legacy.onNotice = { [weak self] notice in self?.oldNotice?(notice); self?.receive(notice) }
        worker = Task { [weak self] in
            while !Task.isCancelled {
                guard let self else { return }
                if link.connection == .usb || link.connection == .wifi, let notice = queue.next(at: Date()) {
                    let token = UUID()
                    let task = Task { try await link.sendNotification(notice) }
                    transfer = (token, notice, task)
                    defer { if transfer?.token == token { transfer = nil } }
                    do {
                        let delivery = try await task.value
                        guard !Task.isCancelled else { return }
                        queue.delivered(notice); lastError = nil
                        deliveredRevisions[notice.id] = notice.revision
                        onDelivered?(notice, delivery)
                    } catch {
                        guard !Task.isCancelled else { return }
                        switch error as? DeviceNotificationError {
                        case .unsupported:
                            queue.delivered(notice); lastError = "notification_upgrade_required"
                        case .rejected(let code) where ["stale_revision", "identity_conflict", "invalid", "crc"].contains(code):
                            queue.delivered(notice); lastError = "notification_" + code
                        default: queue.retry(notice, at: Date())
                        }
                    }
                }
                try? await Task.sleep(for: .milliseconds(500))
            }
        }
    }
    func stop() {
        transfer?.task.cancel(); transfer = nil
        worker?.cancel(); worker = nil
        hub.onAnyEvent = oldEvent; hub.onAnyReply = oldReply; legacy.onNotice = oldNotice
        queue.removeAll(); legacyIdentities.removeAll(); latestNotices.removeAll(); noticeOrder.removeAll(); deliveredRevisions.removeAll()
    }
    func receive(_ event: ConversationEvent) {
        observedModernSources.insert(event.applicationID)
        if let notice = reducer.receive(event) {
            bind(notice, to: .init(applicationID: event.applicationID, instanceID: event.instanceID,
                 sessionID: event.sessionID, name: AgentNotificationReducer.source(event.applicationID)))
            enqueue(notice)
        }
    }
    func receive(_ reply: AgentReply) {
        if let notice = reducer.receive(reply) {
            bind(notice, to: reply.session)
            enqueue(notice)
        }
    }
    private func receive(_ notice: AgentNotifier.Notice) {
        let application = notice.source == "Codex" ? "codexHook" : notice.source == "Claude Code" ? "claudeCode" : "legacy"
        guard hub.integrationEnabled(application) else { return }
        if notice.event == .clear {
            guard let id = legacyIdentities.removeValue(forKey: notice.notificationID), let previous = latestNotices[id] else { return }
            guard notice.dismissReason != .expired else { return }
            queue.cancel(id: id, reason: notice.dismissReason ?? .user)
            let active = transfer?.notice.id == id ? transfer : nil
            active?.task.cancel()
            let revision = active?.notice.revision ?? deliveredRevisions[id] ?? previous.revision
            Task {
                // 先等本通知的pending ACK被取消释放，再清相同nid/rev；不打断其它通知/assistant事务。
                if let active { _ = try? await active.task.value }
                try? await link.clearNotification(id: id, revision: revision)
            }
            return
        }
        if notice.source == "Claude Code", notice.threadID == nil, notice.turnID == nil,
           observedModernSources.contains("claudeCode") {
            // 无绑定legacy不能跨实例配对；见过真实现代事件后仅保留Mac胶囊，诊断显式计数。
            suppressedUnboundLegacy += 1; lastError = "legacy_unbound_replaced_by_modern"
            return
        }
        let turn = notice.turnID ?? UUID().uuidString
        let eventID = notice.eventID ?? (notice.event == .done ? "done:" : "input:") + turn
        let event = ConversationEvent(applicationID: application, instanceID: notice.instanceID ?? "legacy-hook",
            sessionID: notice.threadID?.uuidString.lowercased() ?? "unbound", turnID: turn,
            eventID: eventID, sequence: 1, state: notice.event == .done ? .completed : .waitingInput, timestamp: notice.date)
        if let result = reducer.receive(event) {
            bind(result, to: .init(applicationID: event.applicationID, instanceID: event.instanceID,
                 sessionID: event.sessionID, name: notice.source))
            enqueue(result)
        }
        let id = DeviceNotificationProtocol.identity([application, event.instanceID, event.sessionID, turn, eventID])
        legacyIdentities[notice.notificationID] = id
        if legacyIdentities.count > 128 { legacyIdentities = legacyIdentities.filter { latestNotices[$0.value] != nil } }
    }
    private func enqueue(_ notice: PassportNotification) {
        if latestNotices[notice.id] == nil { noticeOrder.append(notice.id) }
        latestNotices[notice.id] = notice
        if noticeOrder.count > 128 {
            let old = noticeOrder.removeFirst(); latestNotices.removeValue(forKey: old); deliveredRevisions.removeValue(forKey: old)
        }
        queue.enqueue(notice, at: Date())
    }
    private func bind(_ notice: PassportNotification, to session: AssistantAgentSession) {
        guard !session.instanceID.isEmpty, !session.sessionID.isEmpty, session.sessionID != "unbound" else { return }
        hub.registerNotificationSession(session)
        onConversationNotice?(notice, session)
    }
}
