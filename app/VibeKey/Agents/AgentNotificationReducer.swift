import Foundation

/// 真实完成事件与正文可以任意先后到达；第一份完成提示和后续正文升级共用同一个事件身份。
/// 只保存设备预算内文本，状态最多128轮，不读历史、不用时间推测完成。
nonisolated struct AgentNotificationReducer: Sendable {
    private struct Record: Sendable {
        var eventID: String?
        var reply: String = ""
        var truncated = false
        var revision: UInt32 = 0
        var published: PassportNotification?
    }
    private var records: [String: Record] = [:]
    private var order: [String] = []

    mutating func receive(_ event: ConversationEvent) -> PassportNotification? {
        let kind: PassportNotification.Kind
        switch event.state { case .completed: kind = .done; case .waitingInput: kind = .input; case .error: kind = .error; default: return nil }
        let bound = Self.hasBoundTurn(event.turnID) && !event.instanceID.isEmpty && !event.sessionID.isEmpty
        // 缺少轮次身份只能发这次真实事件的通告，绝不将同session的后续Stop/迟到正文合并。
        let base = [event.applicationID, event.instanceID, event.sessionID, bound ? event.turnID : "unbound:" + event.eventID]
        let key = DeviceNotificationProtocol.identity(base + [kind == .done ? "completion" : kind.rawValue + ":" + event.eventID])
        var record = records[key] ?? Record()
        if record.eventID == nil { record.eventID = event.eventID }
        return publish(base: base, key: key, kind: kind, record: record)
    }
    mutating func receive(_ reply: AgentReply) -> PassportNotification? {
        guard reply.isFinal, Self.hasBoundTurn(reply.turnID), !reply.session.instanceID.isEmpty, !reply.session.sessionID.isEmpty,
              !reply.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return nil }
        let base = [reply.session.applicationID, reply.session.instanceID, reply.session.sessionID, reply.turnID]
        let key = DeviceNotificationProtocol.identity(base + ["completion"])
        var record = records[key] ?? Record()
        record.reply = DeviceText.utf8(reply.text, maxBytes: DeviceNotificationProtocol.maximumBodyBytes)
        record.truncated = record.reply.utf8.count < reply.text.trimmingCharacters(in: .whitespacesAndNewlines).utf8.count
        guard record.eventID != nil else { save(record, key: key); return nil }
        return publish(base: base, key: key, kind: .done, record: record)
    }
    private mutating func publish(base: [String], key: String, kind: PassportNotification.Kind, record original: Record) -> PassportNotification? {
        var record = original
        let id = DeviceNotificationProtocol.identity(base + [record.eventID!])
        let source = Self.source(base[0])
        if let previous = record.published, previous.text == record.reply, previous.truncated == record.truncated { return nil }
        record.revision = record.revision == UInt32.max ? UInt32.max : record.revision + 1
        let notice = PassportNotification(id: id, revision: record.revision, source: source, kind: kind,
                                          text: record.reply, truncated: record.truncated)
        record.published = notice; save(record, key: key)
        return notice
    }
    private mutating func save(_ record: Record, key: String) {
        if records[key] == nil { order.append(key) }
        records[key] = record
        if order.count > 128 { records.removeValue(forKey: order.removeFirst()) }
    }
    static func source(_ id: String) -> String {
        switch id {
        case "codexHook": "Codex"
        case "claudeCode": "Claude Code"
        case "claudeDesktop": "Claude Desktop"
        case "chatGPT": "ChatGPT / Codex"
        case "omp": "OMP"
        case "deepseekHarness": "DeepSeek Harness"
        case "kimiCode": "Kimi Code"
        case "workBuddy": "WorkBuddy"
        default: "Agent"
        }
    }
    static func hasBoundTurn(_ turn: String) -> Bool {
        !turn.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !["session", "live", "visible", "interaction", "status", "connection"].contains(turn)
    }
}
