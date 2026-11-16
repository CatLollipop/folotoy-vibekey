import Foundation

/// 配置事务的纯协议规则，供真实DeviceLink与无硬件测试共用。
nonisolated enum DeviceAssistantProtocol {
    static let maximumLineBytes = 511
    static func acceptsUnsolicited(_ message: DeviceAssistantMessage) -> Bool { message.op == "state" && message.requestID == nil }
    static func encode(_ fields: [(String, FlatJSON.Value)], op: String, requestID: UInt32) throws -> Data {
        guard requestID != 0, !op.isEmpty, op.utf8.count <= 24,
              fields.allSatisfy({ !["cmd", "op", "rid"].contains($0.0) }) else { throw AssistantError.invalidProfile }
        let line = FlatJSON.encode([("cmd", .string("assistant")), ("op", .string(op)), ("rid", .int(Int(requestID)))] + fields)
        guard line.utf8.count <= maximumLineBytes else { throw AssistantError.invalidProfile }
        return Data((line + "\n").utf8)
    }
    static func matches(_ reply: DeviceAssistantMessage, requestID: UInt32, op: String,
                        revision: UInt32?, offset: Int?) -> Bool {
        guard requestID != 0, reply.requestID == requestID, reply.op == op else { return false }
        // 失败回执报告设备当前off/rev，可能正是请求被拒绝的原因；rid已唯一绑定本次操作。
        // 成功回执则必须核对预期版本与“已接收”的下一偏移，不能只靠ok=1推进。
        if !reply.ok { return true }
        return (revision == nil || reply.revision == revision) && (offset == nil || reply.offset == offset)
    }
}
