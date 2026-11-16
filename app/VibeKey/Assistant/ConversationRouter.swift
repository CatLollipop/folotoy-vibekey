import Foundation
import Observation
import CryptoKit

/// 原生身份的三元组，不以可碰撞的标题或分隔符拼接串作为投递依据。
nonisolated struct ConversationKey: Hashable, Sendable {
    let application: String
    let instance: String
    let session: String
    init(_ value: AssistantAgentSession) {
        application = value.applicationID; instance = value.instanceID; session = value.sessionID
    }
    var wireID: String {
        let bytes = try! JSONEncoder().encode([application, instance, session])
        return SHA256.hash(data: bytes).prefix(16).map { String(format: "%02x", $0) }.joined()
    }
}

/// Mac保存有界消息流/草稿；Passport只保存当前屏。发送票据不随阅读位置变化。
@MainActor @Observable final class ConversationRouter {
    enum Delivery: Equatable { case ready, sending, unknown }
    struct Entry {
        var session: AssistantAgentSession
        var draft = ""
        var draftRevision: UInt32 = 0
        var reply = ""
        var state: ConversationState = .idle
        var delivery: Delivery = .ready
        var pending: Submission?
        var unknownSubmission: Submission?
        var writable = false
        var agentPage = 0
        var draftPage = 0
        var messages: [ConversationTimelineMessage] = []
        var olderDropped = false
        var following = true
        var anchor: ChatCursor?
        var unread = 0
    }
    struct Binding: Equatable {
        let key: ConversationKey
        let revision: UInt32
        var wireID: String { key.wireID }
    }
    struct Submission: Equatable {
        let id: UUID
        let session: AssistantAgentSession
        let revision: UInt32
        let text: String
    }
    enum Outcome { case queued, accepted, admitted, failed, unknown }
    private(set) var entries: [ConversationKey: Entry] = [:]
    private(set) var binding: Binding?
    var focus = "draft"
    var view = "dialogue"
    var lastError: String?
    private(set) var capture: Binding?
    private(set) var captureText = ""
    private(set) var capturePhase = "idle"
    private var captureID = UUID()
    private var captureTruncated = false
    private var inputFailed = false
    private var ordinal: UInt64 = 0
    private var nativeSeen: Set<String> = []
    private var nativeOrder: [String] = []
    private var droppedSessions: Set<ConversationKey> = []
    private var droppedSessionOrder: [ConversationKey] = []
    static let sessionMessageLimit = 64
    static let globalMessageLimit = 512
    static let messageByteBudget = 1_048_576
    private var order: [ConversationKey] = []
    private struct Gesture { let action: String; let session: String; let revision: UInt32; var stopped = false }
    private var gestures: [String: Gesture] = [:]
    private var gestureOrder: [String] = []
    var current: Entry? { binding.flatMap { entries[$0.key] } }

    func observe(_ session: AssistantAgentSession) {
        let key = ConversationKey(session)
        if entries[key] == nil { entries[key] = Entry(session: session, olderDropped: droppedSessions.contains(key)); order.append(key) }
        // 有草稿/未知投递/发送中的记录不静默淘汰；新录音在stage处有总量门禁。
        while order.count > 64, let index = order.firstIndex(where: {
            $0 != binding?.key && entries[$0]?.draft.isEmpty == true && entries[$0]?.delivery == .ready
        }) {
            let removed = order.remove(at: index)
            if let entry = entries.removeValue(forKey: removed), !entry.messages.isEmpty || entry.olderDropped {
                if droppedSessions.insert(removed).inserted { droppedSessionOrder.append(removed) }
                if droppedSessionOrder.count > 256 { droppedSessions.remove(droppedSessionOrder.removeFirst()) }
            }
        }
    }
    @discardableResult func bind(_ session: AssistantAgentSession, writable: Bool) -> Binding {
        observe(session)
        let key = ConversationKey(session)
        entries[key]?.session = session
        entries[key]?.writable = writable
        if entries[key]?.following == true { entries[key]?.unread = 0 }
        let value = Binding(key: key, revision: UInt32.random(in: 1...UInt32.max))
        binding = value; capture = nil; captureText = ""; capturePhase = "idle"; inputFailed = false; focus = "draft"
        return value
    }
    func unbind() { binding = nil; capture = nil; captureText = ""; capturePhase = "idle" }
    func refreshCapability(_ writable: Bool) { if let key = binding?.key { entries[key]?.writable = writable } }
    func accepts(_ message: DeviceConversationMessage) -> Bool {
        binding.map { message.session == $0.wireID && message.revision == $0.revision } ?? false
    }
    func consume(_ message: DeviceConversationMessage, boot: String) -> Bool {
        let key = [boot, String(message.gesture)].joined(separator: ":")
        if message.action == "record_stop" {
            guard var previous = gestures[key], previous.action == "record_start", !previous.stopped,
                  previous.session == message.session, previous.revision == message.revision else { return false }
            previous.stopped = true; gestures[key] = previous; return true
        }
        guard gestures[key] == nil else { return false }
        gestures[key] = .init(action: message.action, session: message.session, revision: message.revision)
        gestureOrder.append(key)
        if gestureOrder.count > 512 { gestures.removeValue(forKey: gestureOrder.removeFirst()) }
        return true
    }
    func beginCapture(_ value: Binding) -> Bool {
        guard binding == value, let entry = entries[value.key], entry.writable,
              entry.delivery != .sending, entry.delivery != .unknown else { return false }
        capture = value; captureID = UUID(); captureText = ""; captureTruncated = false; capturePhase = "recording"; inputFailed = false
        latest(); return true
    }
    func partial(_ text: String, final: Bool = false) {
        guard capture == binding else { return }
        let body = ConversationTimelineMessage.body(text, maximum: 8_192)
        captureText = body.text; captureTruncated = body.truncated
        if final { capturePhase = "transcribing" }
    }
    func transcribing() { if capture != nil { capturePhase = "transcribing" } }
    func endCapture() { capture = nil; captureText = ""; captureTruncated = false; capturePhase = "idle" }
    func failCapture() { endCapture(); inputFailed = true }
    @discardableResult func stage(_ text: String, for value: Binding) -> Bool {
        guard value == binding, var entry = entries[value.key] else { return false }
        let text = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, text.utf8.count <= 8_192 else { return false }
        // 最多16份未发草稿；不能为新会话挤掉另一会话未发送的内容。
        if entry.draft.isEmpty,
           entries.values.filter({ !$0.draft.isEmpty }).count >= 16 { return false }
        entry.draft = text
        entry.draftRevision = Self.next(entry.draftRevision)
        entry.draftPage = 0
        entries[value.key] = entry
        endCapture(); inputFailed = false; focus = "draft"
        latest()
        return true
    }
    func prepareSubmission(draftRevision: UInt32) -> Submission? {
        guard let key = binding?.key, var entry = entries[key], entry.writable,
              capture == nil, !entry.draft.isEmpty, draftRevision != 0,
              entry.draftRevision == draftRevision, entry.delivery == .ready, entry.pending == nil,
              chatWindow().visibleDraft else { return nil }
        let ticket = Submission(id: UUID(), session: entry.session, revision: draftRevision, text: entry.draft)
        entry.pending = ticket; entry.delivery = .sending; entry.state = .receiving; entries[key] = entry
        latest()
        appendLocal(ticket)
        return ticket
    }
    func resolve(_ ticket: Submission, outcome: Outcome, nativePromptID: String? = nil, nativeTurnID: String? = nil) {
        let key = ConversationKey(ticket.session)
        guard var entry = entries[key], entry.pending?.id == ticket.id else { return }
        entry.pending = nil
        let delivery: ChatDelivery
        switch outcome {
        case .queued, .accepted, .admitted:
            switch outcome { case .queued: delivery = .queued; case .admitted: delivery = .admitted; default: delivery = .accepted }
            entry.delivery = .ready
            if entry.draftRevision == ticket.revision { entry.draft = ""; entry.draftRevision = Self.next(entry.draftRevision); entry.draftPage = 0 }
        case .failed:
            delivery = .failed
            entry.delivery = .ready
            // 明确拒绝后新版本允许用户重新确认；不自动重发。
            if entry.draftRevision == ticket.revision { entry.draftRevision = Self.next(entry.draftRevision) }
        case .unknown: delivery = .unknown; entry.delivery = .unknown; entry.unknownSubmission = ticket
        }
        if let index = entry.messages.firstIndex(where: { $0.ticketID == ticket.id }) {
            entry.messages[index].delivery = delivery
            entry.messages[index].nativePromptID = nativePromptID
            entry.messages[index].nativeTurnID = nativeTurnID
        }
        entries[key] = entry
        enforceMessageLimits()
    }
    func acknowledgeUnknown(ticketID: UUID) {
        guard let key = binding?.key, var entry = entries[key], entry.delivery == .unknown,
              entry.unknownSubmission?.id == ticketID else { return }
        entry.delivery = .ready
        entry.unknownSubmission = nil
        entry.draftRevision = Self.next(entry.draftRevision)
        entries[key] = entry
        enforceMessageLimits()
    }
    func receive(_ event: ConversationEvent) {
        let session = AssistantAgentSession(applicationID: event.applicationID, instanceID: event.instanceID, sessionID: event.sessionID, name: "")
        let key = ConversationKey(session)
        if entries[key] == nil { observe(session) }
        entries[key]?.state = event.state
    }
    func receive(_ reply: AgentReply) {
        guard reply.isFinal, !reply.turnID.isEmpty, !reply.messageID.isEmpty,
              !reply.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        observe(reply.session)
        let key = ConversationKey(reply.session)
        let identity = ConversationTimelineMessage.identity([key.application, key.instance, key.session, "assistant", reply.turnID, reply.messageID])
        guard nativeSeen.insert(identity).inserted else { return }
        nativeOrder.append(identity)
        if nativeOrder.count > 4_096 { nativeSeen.remove(nativeOrder.removeFirst()) }
        let body = ConversationTimelineMessage.body(reply.text)
        guard !body.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        entries[key]?.reply = body.text
        entries[key]?.agentPage = 0
        ordinal += 1
        append(.init(id: String(identity.prefix(16)), identity: identity, ordinal: ordinal, role: .assistant,
                     delivery: .none, text: body.text, truncated: body.truncated, turnID: reply.turnID,
                     messageID: reply.messageID, ticketID: nil), to: key)
    }
    /// 从已呈现画面的锚点按屏导航；消息追加后旧画面的按键仍指向原文。
    func page(_ delta: Int, from cursor: ChatCursor? = nil) {
        guard delta != 0, let key = binding?.key else { return }
        let sources = chatSources(), window = chatWindow(), origin = cursor ?? window.cursor
        if delta < 0 {
            entries[key]?.anchor = ChatPagination.previous(sources, before: origin)
            entries[key]?.following = false
        } else {
            let page = ChatPagination.window(sources, from: origin)
            if let next = page.next {
                entries[key]?.anchor = next
                // 走到当前最新一屏后才重新跟随追加；看旧内容时不隐式跳到最新。
                let last = ChatPagination.pages(sources).last?.cursor
                entries[key]?.following = next == last
                if next == last { entries[key]?.unread = 0 }
            } else { latest() }
        }
    }
    var hasUnseen: Bool { (current?.unread ?? 0) > 0 }

    /// “最新”是显式用户意图；开始新采音也调用它，历史阅读不受普通追加打断。
    func latest() {
        guard let key = binding?.key else { return }
        entries[key]?.following = true; entries[key]?.anchor = nil; entries[key]?.unread = 0
    }

    /// 通知仅定位已观察到的原生正文，不把通知截断文本重新插成一条回复。
    @discardableResult func locate(turnID: String?, messageID: String?) -> Bool {
        guard let key = binding?.key, let entry = entries[key], turnID != nil || messageID != nil,
              let message = entry.messages.first(where: {
                  $0.role == .assistant && (turnID == nil || $0.turnID == turnID) &&
                      (messageID == nil || $0.messageID == messageID)
              }) else { latest(); return false }
        entries[key]?.following = false
        entries[key]?.anchor = .init(messageID: message.id, offset: 0)
        return true
    }

    /// 返回一次完整值快照；Coordinator在首个await前冻结它，再生成独立设备windowID。
    func chatWindow() -> ChatWindow {
        guard let entry = current else {
            return .init(items: [], page: 1, pages: 1, unread: 0, following: true, draftRevision: 0,
                         visibleDraft: false, cursor: nil, olderDropped: false, nextCursor: nil)
        }
        let sources = chatSources(), pages = ChatPagination.pages(sources)
        let window = entry.following ? pages.last! : ChatPagination.window(sources, from: entry.anchor)
        let draftVisible = capture == nil && entry.delivery == .ready && !entry.draft.isEmpty &&
            window.items.contains(where: { $0.role == .draft && $0.tail })
        return .init(items: window.items, page: entry.following ? pages.count : ChatPagination.pageNumber(sources, cursor: window.cursor, pages: pages),
                     pages: pages.count, unread: entry.unread, following: entry.following,
                     draftRevision: entry.draftRevision, visibleDraft: draftVisible, cursor: window.cursor,
                     olderDropped: entry.olderDropped, nextCursor: window.next)
    }

    private func chatSources() -> [ChatPagination.Source] {
        guard let entry = current, let binding else { return [] }
        var sources = entry.messages.map { ChatPagination.Source(id: $0.id, role: $0.role, delivery: $0.delivery, text: $0.text, truncated: $0.truncated) }
        let active = capture == binding
        let sameAttempt = entry.pending?.revision == entry.draftRevision || entry.unknownSubmission?.revision == entry.draftRevision
        if active || (!entry.draft.isEmpty && !sameAttempt) {
            let identity = ConversationTimelineMessage.identity([binding.wireID, active ? "capture" : "draft", active ? captureID.uuidString : String(entry.draftRevision)])
            sources.append(.init(id: String(identity.prefix(16)), role: .draft, delivery: .draft,
                                 text: active ? captureText : entry.draft, truncated: active && captureTruncated))
        }
        return sources
    }

    private func appendLocal(_ ticket: Submission) {
        let key = ConversationKey(ticket.session)
        let identity = ConversationTimelineMessage.identity([key.application, key.instance, key.session, "user", ticket.id.uuidString])
        ordinal += 1
        append(.init(id: String(identity.prefix(16)), identity: identity, ordinal: ordinal, role: .user,
                     delivery: .submitting, text: ticket.text, truncated: false, turnID: nil,
                     messageID: nil, ticketID: ticket.id), to: key)
    }
    private func append(_ message: ConversationTimelineMessage, to key: ConversationKey) {
        guard var entry = entries[key], !entry.messages.contains(where: { $0.identity == message.identity }) else { return }
        // 设备mid只有64bit摘要；极低概率碰撞也不能让另一条消息被当成同一锚点。
        guard !entries.values.flatMap(\.messages).contains(where: { $0.id == message.id && $0.identity != message.identity }) else {
            entries[key]?.olderDropped = true; return
        }
        entry.messages.append(message)
        if !entry.following || binding?.key != key { entry.unread = min(65_535, entry.unread + 1) }
        entries[key] = entry
        enforceMessageLimits()
    }
    private func protected(_ message: ConversationTimelineMessage, in entry: Entry) -> Bool {
        guard let id = message.ticketID else { return false }
        return entry.pending?.id == id || entry.unknownSubmission?.id == id
    }
    /// 先按会话淘汰完整旧消息，再执行全局条数/字节预算；不裁掉进行中或未知票据。
    private func enforceMessageLimits() {
        for key in order {
            while let entry = entries[key], entry.messages.count > Self.sessionMessageLimit,
                  let index = entry.messages.firstIndex(where: { !protected($0, in: entry) }) {
                entries[key]?.messages.remove(at: index); entries[key]?.olderDropped = true
            }
        }
        while true {
            let all = entries.flatMap { key, entry in entry.messages.map { (key, entry, $0) } }
            guard all.count > Self.globalMessageLimit || all.reduce(0, { $0 + $1.2.text.utf8.count }) > Self.messageByteBudget else { break }
            guard let candidate = all.filter({ !protected($0.2, in: $0.1) }).min(by: { $0.2.ordinal < $1.2.ordinal }) else { break }
            entries[candidate.0]?.messages.removeAll { $0.id == candidate.2.id }
            entries[candidate.0]?.olderDropped = true
        }
    }
    func pane(_ role: String) -> (text: String, page: Int, pages: Int) {
        guard let entry = current else { return ("", 1, 1) }
        let text = role == "agent" ? entry.reply : (capture == binding ? captureText : entry.draft)
        let pages = Self.pages(text), index = min(pages.count - 1, max(0, role == "agent" ? entry.agentPage : entry.draftPage))
        return (pages[index], index + 1, pages.count)
    }
    var phase: String {
        guard let entry = current else { return "idle" }
        if capture != nil { return capturePhase }
        if inputFailed { return "error" }
        if entry.delivery == .unknown { return "unknown" }
        if entry.delivery == .sending { return "sending" }
        if !entry.draft.isEmpty { return "draft" }
        switch entry.state {
        case .completed: return "done"
        case .error: return "error"
        case .waitingInput: return "waiting"
        case .working, .thinking, .loading, .replying, .searching, .receiving: return "working"
        default: return "idle"
        }
    }
    nonisolated static func next(_ value: UInt32) -> UInt32 { value == UInt32.max ? 1 : value + 1 }
    /// 每栏14个半角单元、8行及128B；换行/引号最坏转义后仍小于511B。
    nonisolated static func pages(_ source: String) -> [String] {
        var pages: [String] = [], page = "", bytes = 0, row = 0, column = 0
        for character in source {
            let raw = String(character)
            var value = raw.unicodeScalars.filter { $0.value >= 32 || $0 == "\n" }.map(String.init).joined()
            if value.isEmpty { continue }
            if value.utf8.count > 128 { value = "�" }
            // 12px Noto里的W/M并非固定半角；所有字形保守按全角，避免窄栏丢字。
            let newline = value == "\n", width = 2
            let nextRow = row + (newline || column + width > 14 ? 1 : 0)
            if bytes + value.utf8.count > 128 || nextRow >= 8 {
                pages.append(page); page = ""; bytes = 0; row = 0; column = 0
            }
            if newline { row += 1; column = 0 }
            else { if column + width > 14 { row += 1; column = 0 }; column += width }
            page += value; bytes += value.utf8.count
        }
        if !page.isEmpty || pages.isEmpty { pages.append(page) }
        return pages
    }
}
