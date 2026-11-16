import Foundation
import CoreFoundation

/// 会话视图有独立协议；不扩大配置/凭据或通知帧，也不传原生会话ID。
nonisolated struct DeviceConversationMessage: Equatable, Sendable {
    var op: String
    var requestID: UInt32 = 0
    var ok = false
    var session = ""
    var revision: UInt32 = 0
    var draftRevision: UInt32 = 0
    var gesture: UInt32 = 0
    var action = ""
    var boot = ""
    var notice = ""
    var noticeRevision: UInt32 = 0
    var schema = 0
    var split = false
    var error = ""
}

nonisolated enum DeviceConversationProtocol {
    static let operations = ["cap", "bind", "state", "pane", "view", "clear", "result"]
    static let actions = ["record_start", "record_stop", "confirm", "page_prev", "page_next", "focus", "view", "jump"]
    static let phases = ["idle", "recording", "transcribing", "draft", "sending", "working", "waiting", "done", "error", "unknown"]

    static func parse(_ object: [String: Any]) -> DeviceConversationMessage? {
        func uint(_ key: String) -> UInt32? {
            guard let n = object[key] as? NSNumber, CFGetTypeID(n) != CFBooleanGetTypeID(),
                  n.doubleValue >= 0, n.doubleValue <= Double(UInt32.max), n.doubleValue.rounded(.towardZero) == n.doubleValue else { return nil }
            return n.uint32Value
        }
        func string(_ key: String) -> String { object[key] as? String ?? "" }
        let op = string("op")
        var result = DeviceConversationMessage(op: op)
        result.session = string("sid"); result.revision = uint("rev") ?? 0
        result.draftRevision = uint("drev") ?? 0; result.gesture = uint("gid") ?? 0
        if op == "event" {
            result.action = string("action")
            result.boot = string("boot")
            guard actions.contains(result.action), result.gesture != 0, result.boot.utf8.count == 8,
                  result.boot.utf8.allSatisfy({ (48...57).contains($0) || (97...102).contains($0) }) else { return nil }
            if result.action == "jump" {
                result.notice = string("nid"); result.noticeRevision = uint("nrev") ?? 0
                guard DeviceNotificationMessage.validIdentity(result.notice), result.noticeRevision != 0 else { return nil }
            } else {
                guard DeviceNotificationMessage.validIdentity(result.session), result.revision != 0,
                      uint("drev") != nil else { return nil }
            }
        } else {
            guard operations.contains(op), let rid = uint("rid"), rid != 0,
                  let ok = uint("ok"), ok <= 1 else { return nil }
            result.requestID = rid; result.ok = ok == 1
            result.schema = Int(uint("schema") ?? 0); result.split = uint("split") == 1
            result.error = string("error")
        }
        return result
    }

    static func encode(op: String, requestID: UInt32, fields: [(String, FlatJSON.Value)]) throws -> Data {
        guard operations.contains(op), requestID != 0,
              fields.allSatisfy({ !["cmd", "op", "rid"].contains($0.0) }) else { throw AssistantError.invalidProfile }
        let line = FlatJSON.encode([("cmd", .string("conversation")), ("op", .string(op)), ("rid", .int(Int(requestID)))] + fields)
        guard line.utf8.count <= 511 else { throw AssistantError.responseTooLarge }
        return Data((line + "\n").utf8)
    }
}
