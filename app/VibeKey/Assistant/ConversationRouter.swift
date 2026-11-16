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

/// Mac保存有界正文/草稿；设备只保存两个小型阅读窗。发送票据不可随当前页变化。
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
    enum Outcome { case accepted, failed, unknown }
    private(set) var entries: [ConversationKey: Entry] = [:]
    private(set) var binding: Binding?
    var focus = "draft"
    var view = "dialogue"
    var lastError: String?
    private(set) var capture: Binding?
    private(set) var captureText = ""
    private(set) var capturePhase = "idle"
    private var inputFailed = false
    private var order: [ConversationKey] = []
    private struct Gesture { let action: String; let session: String; let revision: UInt32; var stopped = false }
    private var gestures: [String: Gesture] = [:]
    private var gestureOrder: [String] = []
    var current: Entry? { binding.flatMap { entries[$0.key] } }

    func observe(_ session: AssistantAgentSession) {
        let key = ConversationKey(session)
        if entries[key] == nil { entries[key] = Entry(session: session); order.append(key) }
        // 有草稿/未知投递/发送中的记录不静默淘汰；新录音在stage处有总量门禁。
        while order.count > 64, let index = order.firstIndex(where: {
            $0 != binding?.key && entries[$0]?.draft.isEmpty == true && entries[$0]?.delivery == .ready
        }) { entries.removeValue(forKey: order.remove(at: index)) }
    }
    @discardableResult func bind(_ session: AssistantAgentSession, writable: Bool) -> Binding {
        observe(session)
        let key = ConversationKey(session)
        entries[key]?.session = session
        entries[key]?.writable = writable
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
        capture = value; captureText = ""; capturePhase = "recording"; inputFailed = false; return true
    }
    func partial(_ text: String, final: Bool = false) {
        guard capture == binding else { return }
        captureText = String(text.prefix(8_192))
        if final { capturePhase = "transcribing" }
    }
    func transcribing() { if capture != nil { capturePhase = "transcribing" } }
    func endCapture() { capture = nil; captureText = ""; capturePhase = "idle" }
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
        return true
    }
    func prepareSubmission(draftRevision: UInt32) -> Submission? {
        guard let key = binding?.key, var entry = entries[key], entry.writable,
              capture == nil, !entry.draft.isEmpty, draftRevision != 0,
              entry.draftRevision == draftRevision, entry.delivery == .ready, entry.pending == nil else { return nil }
        let ticket = Submission(id: UUID(), session: entry.session, revision: draftRevision, text: entry.draft)
        entry.pending = ticket; entry.delivery = .sending; entry.state = .receiving; entries[key] = entry
        return ticket
    }
    func resolve(_ ticket: Submission, outcome: Outcome) {
        let key = ConversationKey(ticket.session)
        guard var entry = entries[key], entry.pending?.id == ticket.id else { return }
        entry.pending = nil
        switch outcome {
        case .accepted:
            entry.delivery = .ready
            if entry.draftRevision == ticket.revision { entry.draft = ""; entry.draftRevision = Self.next(entry.draftRevision); entry.draftPage = 0 }
        case .failed:
            entry.delivery = .ready
            // 明确拒绝后新版本允许用户重新确认；不自动重发。
            if entry.draftRevision == ticket.revision { entry.draftRevision = Self.next(entry.draftRevision) }
        case .unknown: entry.delivery = .unknown; entry.unknownSubmission = ticket
        }
        entries[key] = entry
    }
    func acknowledgeUnknown(ticketID: UUID) {
        guard let key = binding?.key, var entry = entries[key], entry.delivery == .unknown,
              entry.unknownSubmission?.id == ticketID else { return }
        entry.delivery = .ready
        entry.unknownSubmission = nil
        entry.draftRevision = Self.next(entry.draftRevision)
        entries[key] = entry
    }
    func receive(_ event: ConversationEvent) {
        let session = AssistantAgentSession(applicationID: event.applicationID, instanceID: event.instanceID, sessionID: event.sessionID, name: "")
        let key = ConversationKey(session)
        if entries[key] == nil { observe(session) }
        entries[key]?.state = event.state
    }
    func receive(_ reply: AgentReply) {
        guard reply.isFinal else { return }
        observe(reply.session)
        let key = ConversationKey(reply.session)
        entries[key]?.reply = String(reply.text.prefix(32_768))
        entries[key]?.agentPage = 0
    }
    func page(_ delta: Int) {
        guard let key = binding?.key, let entry = entries[key] else { return }
        let text = focus == "agent" ? entry.reply : (capture == binding ? captureText : entry.draft)
        let count = Self.pages(text).count
        if focus == "agent" { entries[key]?.agentPage = min(count - 1, max(0, entry.agentPage + delta)) }
        else { entries[key]?.draftPage = min(count - 1, max(0, entry.draftPage + delta)) }
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
