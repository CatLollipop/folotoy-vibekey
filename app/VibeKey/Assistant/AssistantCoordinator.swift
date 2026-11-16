import Foundation

/// 会话路由唯一持有投递目标；硬件模式绝不借用Mac云端试用的默认目标。
@MainActor final class AssistantCoordinator {
    let conversations: ConversationRouter
    private let assistant: AssistantController
    private let store: AssistantStore
    private let hub: AgentHub
    private let pet: PetController
    private let link: DeviceLink
    private let sync: AssistantDeviceSync
    private var hardware = AssistantHardwareRouter()
    private var oldKey: ((DeviceKey, DeviceKeyEvent, Bool) -> Void)?
    private var oldConnection: ((DeviceLink.Connection) -> Void)?
    private var menu: [AssistantAgentSession] = []
    private var menuVisible = false
    private var menuIndex = 0
    private var menuTimer: Task<Void, Never>?
    private var publishing: Task<Void, Never>?
    private var publisherID = UUID()
    private var clearPending = false
    private var dirty = false
    private var capable = false
    private var deviceBinding: ConversationRouter.Binding?
    private struct PublishedWindow {
        let binding: ConversationRouter.Binding
        let view: String
        let cursor: ChatCursor?
        let visibleDraft: Bool
        let following: Bool
        let draftRevision: UInt32
    }
    private var publishedWindows: [UInt32: PublishedWindow] = [:]
    private var windowOrder: [UInt32] = []
    private var windowRevision = UInt32.random(in: 1...UInt32.max)
    private struct Projection: Equatable {
        let binding: ConversationRouter.Binding
        let phase: String
        let draftRevision: UInt32
        let writable: Bool
        let view: String
        let window: ChatWindow
    }
    private var lastProjection: Projection?
    private var captureGesture: UInt32?
    private var navigation: Task<Void, Never>?
    private var navigationID = UUID()
    private var capabilityMonitor: Task<Void, Never>?
    private var renderFailures = 0
    private var sends: [UUID: Task<Void, Never>] = [:]
    private struct Feedback { let id = UUID(); let gesture: UInt32; let status: String; let boot: String; let binding: ConversationRouter.Binding? }
    private var results: [Feedback] = []
    private struct NoticeTarget {
        let session: AssistantAgentSession
        let notice: PassportNotification
        let date: Date
        let turnID: String?
        let messageID: String?
    }
    private var notices: [String: NoticeTarget] = [:]
    private var noticeOrder: [String] = []
    private var legacyNotices: [UUID: String] = [:]
    private var legacyNoticeOrder: [UUID] = []

    init(assistant: AssistantController, store: AssistantStore, hub: AgentHub, pet: PetController,
         link: DeviceLink, sync: AssistantDeviceSync, conversations: ConversationRouter) {
        self.assistant = assistant; self.store = store; self.hub = hub; self.pet = pet
        self.link = link; self.sync = sync; self.conversations = conversations
    }
    func start() {
        assistant.onApplicationDraft = { [weak self] text in self?.stage(text) }
        assistant.onTranscript = { [weak self] text, final in self?.conversations.partial(text, final: final); self?.publish() }
        assistant.onReply = { _ in } // 显式云试用仅在Mac显示，不能覆盖设备Agent正文。
        assistant.onPhase = { [weak self] phase in
            guard let self else { return }
            if phase == .transcribing { conversations.transcribing() }
            if phase == .failed, let gid = captureGesture {
                conversations.failCapture(); captureGesture = nil; result(gid, "unavailable")
            } else if phase == .stopped || phase == .failed { conversations.endCapture(); captureGesture = nil }
            if phase == .failed { conversations.lastError = assistant.error }
            pet.setState(Self.petState(phase)); publish()
        }
        hub.onSelectionChange = { [weak self] session in
            guard let self else { return }
            assistant.cancel(); captureGesture = nil
            if let session { _ = conversations.bind(session, writable: hub.capabilities(for: session).contains(.submit)) }
            else { conversations.unbind(); clearPending = true }
            if session != nil { assistant.destination = .application }
            deviceBinding = nil; publish()
            publishedWindows.removeAll(); windowOrder.removeAll()
            lastProjection = nil
            renderFailures = 0
        }
        hub.onAnyEvent = { [weak self] event in
            guard let self else { return }
            conversations.receive(event)
            if let session = conversations.current?.session, session.applicationID == event.applicationID,
               session.instanceID == event.instanceID, session.sessionID == event.sessionID, conversations.capture == nil {
                pet.setState(Self.petState(event.state))
            }
            publish()
        }
        hub.onAnyReply = { [weak self] reply in self?.conversations.receive(reply); self?.publish() }
        link.onConversationEvent = { [weak self] event in self?.receive(event) }
        link.onAssistantMessage = { [weak self] message in
            guard let self else { return }
            let previous = sync.mode; sync.receive(message)
            if previous != sync.mode { assistant.cancel(); conversations.endCapture(); captureGesture = nil; closeMenu(); publish() }
            if sync.mode == "standalone", !message.state.isEmpty { pet.setState(Self.devicePetState(message.state)) }
        }
        oldKey = link.onKey
        link.onKey = { [weak self] key, event, ack in
            guard let self else { return }
            guard store.usePassportForAssistant else { oldKey?(key, event, ack); return }
            guard sync.mode != "standalone" else { return }
            if let action = hardware.handle(key, event, ack: ack, menuVisible: menuVisible) {
                if menuVisible { handleMenu(action) }
                else if action == .openMenu { openMenu() }
            }
        }
        oldConnection = link.onConnectionChange
        link.onConnectionChange = { [weak self] connection in
            guard let self else { return }
            oldConnection?(connection); hardware.reset(); closeMenu(); assistant.cancel(); conversations.endCapture(); captureGesture = nil
            publishing?.cancel(); publisherID = UUID(); publishing = nil; capable = false; deviceBinding = nil; results.removeAll()
            publishedWindows.removeAll(); windowOrder.removeAll()
            lastProjection = nil
            renderFailures = 0
            navigation?.cancel(); navigationID = UUID(); navigation = nil
            if let entry = conversations.current { _ = conversations.bind(entry.session, writable: hub.capabilities(for: entry.session).contains(.submit)) }
            if connection == .usb || connection == .wifi { sync.refresh(); publish() }
        }
        pet.start(); hub.start()
        capabilityMonitor = Task { [weak self] in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(2))
                guard !Task.isCancelled, let self else { return }
                if let entry = conversations.current {
                    let writable = hub.capabilities(for: entry.session).contains(.submit)
                    if entry.writable != writable { conversations.refreshCapability(writable); publish() }
                }
            }
        }
        observeChanges({ [weak self] in _ = self?.store.usePassportForAssistant }) { [weak self] in
            guard let self else { return }
            hardware.reset(); assistant.cancel(); conversations.endCapture(); closeMenu()
            if !store.usePassportForAssistant { clearPending = true }
            publish()
        }
    }
    func stop() {
        publishing?.cancel(); navigation?.cancel(); menuTimer?.cancel(); capabilityMonitor?.cancel()
        for task in sends.values { task.cancel() }
        assistant.cancel(); hub.shutdown(); pet.stop(); sync.cancel()
    }
    func register(_ notice: PassportNotification, session: AssistantAgentSession, turnID: String? = nil, messageID: String? = nil) {
        conversations.observe(session)
        if notices[notice.id] == nil { noticeOrder.append(notice.id) }
        if notices[notice.id].map({ $0.notice.revision <= notice.revision }) ?? true {
            let previous = notices[notice.id]
            guard previous.map({ ConversationKey($0.session) == ConversationKey(session) }) ?? true else { return }
            // 正文升级未携带原生定位字段时，保留同一通知先前的确切身份。
            var nativeTurn = turnID, nativeMessage = messageID
            if nativeTurn == nil { nativeTurn = previous?.turnID }
            if nativeMessage == nil { nativeMessage = previous?.messageID }
            notices[notice.id] = .init(session: session, notice: notice, date: Date(),
                turnID: nativeTurn, messageID: nativeMessage)
        }
        if noticeOrder.count > 128 { notices.removeValue(forKey: noticeOrder.removeFirst()) }
    }
    func confirmCurrentDraft() {
        conversations.latest()
        if let entry = conversations.current { submit(entry.draftRevision) }
    }
    func registerLegacyNotice(_ identifier: UUID, target: String) {
        guard notices[target] != nil else { return }
        if legacyNotices[identifier] == nil { legacyNoticeOrder.append(identifier) }
        legacyNotices[identifier] = target
        if legacyNoticeOrder.count > 128 { legacyNotices.removeValue(forKey: legacyNoticeOrder.removeFirst()) }
    }
    func refreshDevice() { publish() }
    func openNotice(_ notice: AgentNotifier.Notice) {
        guard let id = legacyNotices[notice.notificationID], let target = notices[id] else {
            conversations.lastError = String(localized: "通知没有可定位的原会话，请在应用接入中选择。", bundle: .l10n); return
        }
        var event = DeviceConversationMessage(op: "event")
        event.action = "jump" // Mac胶囊导航没有设备手势，不伪造设备结果gid。
        event.notice = target.notice.id; event.noticeRevision = target.notice.revision
        jump(event)
    }
    private func stage(_ text: String) {
        if conversations.binding == nil, let selected = hub.selectedSession { _ = conversations.bind(selected, writable: hub.capabilities(for: selected).contains(.submit)) }
        guard let binding = conversations.binding, conversations.stage(text, for: binding) else {
            conversations.lastError = String(localized: "无法保存草稿，请选择会话或处理已有草稿。", bundle: .l10n); return
        }
        publish()
    }
    private func receive(_ event: DeviceConversationMessage) {
        guard conversations.consume(event, boot: link.deviceBootID ?? "") else { return }
        if event.action == "jump" { jump(event); return }
        guard store.usePassportForAssistant, sync.mode == "companion", !menuVisible,
              deviceBinding == conversations.binding, conversations.accepts(event) else { result(event.gesture, "stale"); return }
        // 一次长录音可跨越大量ASR窗口；松开按已接纳的capture归属结束，不依赖阅读窗缓存。
        if event.action == "record_stop" {
            if captureGesture == event.gesture { assistant.endRecording(); publish() }
            return
        }
        guard let screen = publishedWindows[event.windowID], screen.binding == conversations.binding else { result(event.gesture, "stale"); return }
        switch event.action {
        case "record_start":
            guard let binding = conversations.binding, let entry = conversations.current else { return }
            conversations.refreshCapability(hub.capabilities(for: entry.session).contains(.submit))
            // cancel会同步发stopped；先结束旧generation，再创建新capture绑定。
            assistant.cancel(); conversations.endCapture(); captureGesture = nil
            guard conversations.beginCapture(binding) else { result(event.gesture, "unavailable"); return }
            conversations.view = "dialogue"
            captureGesture = event.gesture
            assistant.beginDraftRecording(using: PassportMicSource(link: link)) { [weak self] text in
                guard let self, conversations.capture == binding else { return }
                if !conversations.stage(text, for: binding) {
                    conversations.endCapture(); conversations.lastError = String(localized: "无法保存草稿，请选择会话或处理已有草稿。", bundle: .l10n)
                }
                captureGesture = nil; publish()
            }
        case "confirm":
            guard screen.view == "dialogue", conversations.view == "dialogue",
                  screen.visibleDraft, screen.following, conversations.chatWindow().following,
                  screen.draftRevision == event.draftRevision else { result(event.gesture, "stale"); return }
            submit(event.draftRevision, gesture: event.gesture)
        case "page_prev": conversations.page(-1, from: screen.cursor)
        case "page_next": conversations.page(1, from: screen.cursor)
        case "latest": conversations.view = "dialogue"; conversations.latest()
        case "view": conversations.view = conversations.view == "dialogue" ? "pet" : "dialogue"
        default: break
        }
        publish()
    }
    private func submit(_ revision: UInt32, gesture: UInt32 = 0) {
        if let session = conversations.current?.session { conversations.refreshCapability(hub.capabilities(for: session).contains(.submit)) }
        guard let ticket = conversations.prepareSubmission(draftRevision: revision) else { result(gesture, "unavailable"); return }
        let feedbackBoot = link.deviceBootID ?? "", feedbackBinding = conversations.binding
        conversations.lastError = nil; publish()
        sends[ticket.id] = Task { [weak self] in
            guard let self else { return }
            defer { sends.removeValue(forKey: ticket.id) }
            do {
                let receipt = try await hub.deliverPrompt(ticket.text, in: ticket.session)
                let outcome: ConversationRouter.Outcome
                switch receipt.disposition { case .queued: outcome = .queued; case .accepted: outcome = .accepted; case .admitted: outcome = .admitted }
                conversations.resolve(ticket, outcome: outcome, nativePromptID: receipt.nativePromptID,
                    nativeTurnID: receipt.nativeTurnID)
                result(gesture, "ok", boot: feedbackBoot, binding: feedbackBinding)
            } catch {
                let known: Bool
                switch error as? AgentAdapterError {
                case .blocked, .sessionChanged, .officialChannelRequired: known = true
                default: known = false
                }
                conversations.resolve(ticket, outcome: known ? .failed : .unknown)
                conversations.lastError = error.localizedDescription; result(gesture, known ? "unavailable" : "unknown", boot: feedbackBoot, binding: feedbackBinding)
            }
            publish()
        }
    }
    private func jump(_ event: DeviceConversationMessage) {
        guard navigation == nil, let target = notices[event.notice], event.noticeRevision <= target.notice.revision,
              Date().timeIntervalSince(target.date) < 86_400 else { result(event.gesture, "unavailable"); return }
        let token = UUID(), feedbackBoot = link.deviceBootID ?? ""; navigationID = token
        navigation = Task { [weak self] in
            guard let self else { return }
            defer { if navigationID == token { navigation = nil; publish() } }
            do {
                assistant.cancel(); conversations.endCapture(); captureGesture = nil; closeMenu()
                guard hub.selectReadOnly(target.session) else { throw AgentAdapterError.sessionChanged }
                let binding = conversations.binding ?? conversations.bind(target.session, writable: false)
                guard binding.key == ConversationKey(target.session) else { throw AgentAdapterError.sessionChanged }
                conversations.refreshCapability(hub.capabilities(for: target.session).contains(.submit))
                conversations.view = "dialogue"
                // 通知是导航，不得将其正文再伪造成另一条assistant消息。
                _ = conversations.locate(turnID: target.turnID, messageID: target.messageID)
                if let task = publishing { task.cancel(); await task.value }; publishing = nil
                try await ensureCapability(); try await bindDevice(binding)
                if sync.mode != "companion" {
                    guard !sync.busy else { throw AssistantError.device("busy") }
                    let cap = try await link.assistantRequest([], op: "capabilities")
                    try Task.checkCancellation()
                    guard DeviceAssistantProtocol.supportsHotMode(cap) else { throw AssistantError.upgradeRequired }
                    let ack = try await link.assistantRequest([("value", .string("companion"))], op: "mode")
                    try Task.checkCancellation()
                    guard DeviceAssistantProtocol.acceptsHotModeAcknowledgment(ack, target: "companion") else { throw AssistantError.deliveryUnknown }
                    sync.receive(ack)
                }
                result(event.gesture, "ok", boot: feedbackBoot)
            } catch {
                if !Task.isCancelled { conversations.lastError = error.localizedDescription; result(event.gesture, "unavailable", boot: feedbackBoot) }
            }
        }
    }
    private func ensureCapability() async throws {
        guard !capable else { return }
        let reply = try await link.conversationRequest("cap")
        try Task.checkCancellation()
        guard reply.schema == 2, reply.chat else { throw AssistantError.upgradeRequired }
        capable = true
    }
    private func bindDevice(_ binding: ConversationRouter.Binding) async throws {
        guard conversations.binding == binding, let entry = conversations.current else { throw CancellationError() }
        _ = try await link.conversationRequest("bind", fields: [("title", .string(DeviceText.utf8(entry.session.name, maxBytes: 32))), ("writable", .int(entry.writable ? 1 : 0)), ("view", .string(conversations.view))], binding: binding)
        guard conversations.binding == binding else { throw CancellationError() }
        deviceBinding = binding
    }
    private func publish() {
        dirty = true
        guard publishing == nil, navigation == nil,
              link.connection == .usb || link.connection == .wifi,
              clearPending || !results.isEmpty || (store.usePassportForAssistant && sync.mode == "companion" && !menuVisible) else { return }
        let token = UUID(); publisherID = token
        publishing = Task { [weak self] in
            guard let self else { return }
            defer { if publisherID == token { publishing = nil } }
            do {
                try await ensureCapability()
                while (dirty || clearPending || !results.isEmpty), !Task.isCancelled, publisherID == token {
                    if clearPending {
                        _ = try await link.conversationRequest("clear")
                        clearPending = false; deviceBinding = nil; lastProjection = nil
                    }
                    while !results.isEmpty {
                        let item = results[0]
                        guard item.boot == link.deviceBootID, item.binding == nil || item.binding == conversations.binding else {
                            results.removeAll { $0.id == item.id }; continue
                        }
                        do {
                            _ = try await link.conversationRequest("result", fields: [("gid", .int(Int(item.gesture))), ("status", .string(item.status))])
                            results.removeAll { $0.id == item.id }
                            // 设备可能因等待反馈超时变UNKNOWN；ACK后重投影真实台账状态。
                            lastProjection = nil
                            renderFailures = 0
                        } catch let error as AssistantError where error == .device("stale") {
                            results.removeAll { $0.id == item.id }
                            lastProjection = nil
                            renderFailures = 0
                            continue // 提示已过期不影响发送账本，更不能中断新会话投影。
                        }
                    }
                    guard store.usePassportForAssistant, !menuVisible, sync.mode == "companion" else { return }
                    dirty = false
                    guard let binding = conversations.binding, let entry = conversations.current else { return }
                    conversations.refreshCapability(hub.capabilities(for: entry.session).contains(.submit))
                    // 同一冻结窗口内，草稿版本、消息顺序和滚动锚点不能在await后漂移。
                    let current = conversations.current!, phase = conversations.phase, view = conversations.view
                    let window = conversations.chatWindow()
                    let projection = Projection(binding: binding, phase: phase, draftRevision: current.draftRevision,
                        writable: current.writable, view: view, window: window)
                    if projection == lastProjection { continue }
                    windowRevision = ConversationRouter.next(windowRevision)
                    let wid = windowRevision
                    if deviceBinding != binding { try await bindDevice(binding) }
                    guard binding == conversations.binding else { dirty = true; continue }
                    _ = try await link.conversationRequest("state", fields: [("phase", .string(phase)), ("drev", .int(Int(current.draftRevision))), ("writable", .int(current.writable ? 1 : 0))], binding: binding)
                    _ = try await link.conversationRequest("view", fields: [("view", .string(view))], binding: binding)
                    _ = try await link.conversationRequest("window_begin", fields: [
                        ("n", .int(window.items.count)), ("page", .int(window.page)), ("pages", .int(window.pages)),
                        ("unread", .int(window.unread)), ("following", .int(window.following ? 1 : 0)),
                        ("drev", .int(Int(window.draftRevision))), ("older", .int(window.olderDropped ? 1 : 0))], binding: binding, windowID: wid)
                    for (index, item) in window.items.enumerated() {
                        guard binding == conversations.binding else { dirty = true; break }
                        _ = try await link.conversationRequest("window_item", fields: [
                            ("index", .int(index)), ("mid", .string(item.mid)), ("role", .string(item.role.rawValue)),
                            ("delivery", .string(item.delivery.rawValue)), ("head", .int(item.head ? 1 : 0)),
                            ("tail", .int(item.tail ? 1 : 0)), ("trunc", .int(item.truncated ? 1 : 0)),
                            ("text", .string(item.text))], binding: binding, windowID: wid)
                    }
                    guard binding == conversations.binding else { dirty = true; continue }
                    _ = try await link.conversationRequest("window_commit", binding: binding, windowID: wid)
                    guard binding == conversations.binding else { dirty = true; continue }
                    publishedWindows[wid] = .init(binding: binding, view: view, cursor: window.cursor,
                        visibleDraft: window.visibleDraft, following: window.following, draftRevision: window.draftRevision)
                    lastProjection = projection
                    windowOrder.append(wid)
                    if windowOrder.count > 8 { publishedWindows.removeValue(forKey: windowOrder.removeFirst()) }
                    renderFailures = 0
                }
            } catch {
                if !Task.isCancelled {
                    conversations.lastError = error.localizedDescription
                    // 仅重排被明确busy拒绝的幂等显示；绝不重发原应用消息或确认。
                    let retriableDisplay = (error as? AssistantError).map { [AssistantError.device("busy"), .device("display_busy")].contains($0) } ?? false
                    // result有gid去重；只有该幂等设备反馈允许丢ACK后重放，不重发Agent请求。
                    let retriableFeedback = !results.isEmpty && (error as? AssistantError) == .deliveryUnknown
                    if retriableDisplay || retriableFeedback, renderFailures < (results.isEmpty ? 3 : 8) {
                        renderFailures += 1
                        let delay = min(1_000, 200 * (1 << min(3, renderFailures - 1)))
                        Task { [weak self] in
                            try? await Task.sleep(for: .milliseconds(delay))
                            guard let self, self.publisherID == token else { return }
                            self.publish()
                        }
                    }
                }
            }
        }
    }
    private func result(_ gesture: UInt32, _ status: String, boot: String? = nil, binding: ConversationRouter.Binding? = nil) {
        guard gesture != 0 else { return }
        let boot = boot ?? link.deviceBootID ?? ""
        guard boot == link.deviceBootID else { return }
        results.append(.init(gesture: gesture, status: status, boot: boot, binding: binding))
        if results.count > 16 { results.removeFirst() }
        publish()
    }
    func deviceDisplay() -> (DeviceUIState, String)? {
        guard store.usePassportForAssistant, sync.mode != "standalone" else { return nil }
        if menuVisible { return (.list, "SESSIONS") }
        return (.idle, conversations.binding == nil ? "SELECT SESSION" : "SESSION READY")
    }
    private func openMenu() {
        assistant.cancel(); conversations.endCapture(); captureGesture = nil; menuVisible = true; menuIndex = 0
        menu = hub.sessions; showMenu()
        Task { [weak self] in
            guard let self else { return }; await hub.refresh()
            if menuVisible { menu = hub.sessions; menuIndex = min(menuIndex, menu.count + 3); showMenu() }
        }
    }
    private func showMenu() {
        let labels = menu.map { session in
            let duplicate = menu.filter { $0.name == session.name }.count > 1
            let title = duplicate ? DeviceText.utf8(session.name, maxBytes: 24) + " · " + ConversationKey(session).wireID.suffix(6) : session.name
            return (hub.capabilities(for: session).contains(.submit) ? "" : "[R] ") + title
        } +
            [conversations.view == "dialogue" ? "PET VIEW" : "CHAT VIEW", "LATEST MESSAGES", "STOP TASK", "BACK"]
        link.sendState(.list, mode: .dict, msg: "SESSIONS"); link.sendList(title: "SESSIONS", items: labels, selected: menuIndex)
        menuTimer?.cancel(); menuTimer = Task { [weak self] in
            try? await Task.sleep(for: .seconds(30)); if !Task.isCancelled { self?.closeMenu(); self?.publish() }
        }
    }
    private func handleMenu(_ action: AssistantHardwareRouter.Action) {
        switch action {
        case .previous: menuIndex = (menuIndex + menu.count + 3) % (menu.count + 4); showMenu()
        case .next: menuIndex = (menuIndex + 1) % (menu.count + 4); showMenu()
        case .confirm:
            let index = menuIndex, sessions = menu; closeMenu()
            if sessions.indices.contains(index) {
                Task { [weak self] in
                    guard let self else { return }
                    do { try await hub.select(sessions[index]) } catch { conversations.lastError = error.localizedDescription }
                    publish()
                }
            } else if index == sessions.count { conversations.view = conversations.view == "dialogue" ? "pet" : "dialogue" }
            else if index == sessions.count + 1 { conversations.latest() }
            else if index == sessions.count + 2, let session = conversations.current?.session {
                Task { [weak self] in do { try await self?.hub.stop(in: session) } catch { self?.conversations.lastError = error.localizedDescription } }
            }
            publish()
        default: break
        }
    }
    private func closeMenu() { menuVisible = false; menuTimer?.cancel(); menuTimer = nil }
    private static func petState(_ phase: AssistantPhase) -> PetState {
        switch phase {
        case .idle, .draft: .idle
        case .recording: .listening
        case .transcribing: .uploading
        case .thinking: .thinking
        case .replying: .composing
        case .speaking: .humming
        case .completed: .celebrate
        case .stopped: .poweringDown
        case .failed: .alerting
        }
    }
    private static func petState(_ state: ConversationState) -> PetState {
        switch state {
        case .idle, .unknown: .idle
        case .listening: .listening
        case .receiving: .receiving
        case .thinking: .thinking
        case .working: .working
        case .waitingInput: .waiting
        case .replying: .composing
        case .searching: .searching
        case .loading: .loading
        case .completed: .celebrate
        case .error: .alerting
        case .stopped: .poweringDown
        }
    }
    private static func devicePetState(_ state: String) -> PetState {
        switch state {
        case "recording": .listening
        case "transcribing": .uploading
        case "replying": .composing
        case "done", "completed": .celebrate
        case "error", "failed": .alerting
        case "stopped": .poweringDown
        default: .idle
        }
    }
}
