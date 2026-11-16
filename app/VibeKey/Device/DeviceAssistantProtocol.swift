import Foundation

/// 机器语义与屏幕文案分开传输；固件自行选择中文字形和提示，不解析Mac显示文字。
nonisolated struct DeviceAssistantPresentation: Equatable, Sendable {
    enum Target: String, Sendable { case cloud, application }
    enum Phase: String, Sendable {
        case idle, preparing, recording, transcribing, thinking, replying, speaking, completed, stopped, failed
    }
    enum Failure: String, Sendable { case checkMac = "check_mac" }
    var target: Target
    var phase: Phase?
    var error: Failure? = nil
}

/// 配置事务的纯协议规则，供真实DeviceLink与无硬件测试共用。
nonisolated enum DeviceAssistantProtocol {
    enum TranscriptAction: String { case begin = "transcript_begin", update = "transcript_update", clear = "transcript_clear" }
    enum ReplyAction:String { case begin="reply_begin",update="reply_update",final="reply_final",clear="reply_clear" }
    /// 最坏每个控制字符转义为六字节，64B分块仍能容纳rid/generation/off并满足511B整帧上限。
    static func replyChunks(_ text:String) throws -> [(offset:Int,text:String)] {
        guard text.utf8.count <= 4096 else { throw AssistantError.responseTooLarge }
        var parts:[(offset:Int,text:String)]=[],current="",offset=0,bytes=0
        for scalar in text.unicodeScalars {
            let value=String(scalar),length=value.utf8.count
            if bytes+length>64 { parts.append((offset,current));offset += bytes;current="";bytes=0 }
            current += value;bytes += length
        }
        if !current.isEmpty { parts.append((offset,current)) }
        return parts
    }
    static func replyFields(_ action:ReplyAction,generation:UInt32,offset:Int=0,text:String="",size:Int=0) throws -> [(String,FlatJSON.Value)] {
        guard generation != 0 || action == .clear, (0...4096).contains(offset),(0...4096).contains(size),text.utf8.count<=192 else { throw AssistantError.invalidProfile }
        var fields:[(String,FlatJSON.Value)]=[("generation",.int(Int(generation)))]
        if action == .update { fields += [("off",.int(offset)),("text",.string(text))] }
        if action == .final { fields.append(("size",.int(size))) }
        return fields
    }
    /// Mac可显示更长的原应用回复；设备有4KiB预算，截断时明确提示在电脑查看全文。
    static func deviceReplyText(_ text:String) -> String {
        guard text.utf8.count>4096 else { return text }
        var prefix="",bytes=0
        for scalar in text.unicodeScalars {
            let value=String(scalar)
            guard bytes+value.utf8.count<=4000 else { break }
            prefix += value;bytes += value.utf8.count
        }
        return prefix + String(localized:"\n…（完整回复请在电脑查看）",bundle:.l10n)
    }
    static let maximumLineBytes = 511
    /// 转写快照只发送UTF-8尾部；同时约束JSON转义后的整帧长度，不把文字写进日志。
    static func encodeTranscript(_ action: TranscriptAction, generation: UInt32, text: String = "", final: Bool = false) throws -> Data {
        guard generation != 0 || action == .clear else { throw AssistantError.invalidProfile }
        var tail = utf8Tail(text, maximum: 192)
        while true {
            var fields: [(String, FlatJSON.Value)] = [("cmd", .string("assistant")), ("op", .string(action.rawValue)), ("generation", .int(Int(generation)))]
            if action == .update { fields += [("text", .string(tail)), ("final", .int(final ? 1 : 0))] }
            let line = FlatJSON.encode(fields)
            if line.utf8.count <= maximumLineBytes { return Data((line + "\n").utf8) }
            guard !tail.isEmpty else { throw AssistantError.invalidProfile }
            tail.removeFirst()
        }
    }
    private static func utf8Tail(_ text: String, maximum: Int) -> String {
        let bytes = Array(text.utf8)
        var start = max(0, bytes.count - maximum)
        while start < bytes.count && bytes[start] & 0xC0 == 0x80 { start += 1 }
        return String(decoding: bytes[start...], as: UTF8.self)
    }
    /// 不含会话正文、用户输入、密钥或本地化错误；缺省presentation兼容原固件动画事件。
    static func encodePetState(_ state: String, presentation: DeviceAssistantPresentation?) throws -> Data {
        guard !state.isEmpty, state.utf8.count <= 32,
              state.utf8.allSatisfy({ (97...122).contains($0) || $0 == 45 }) else { throw AssistantError.invalidProfile }
        var fields: [(String, FlatJSON.Value)] = [("cmd", .string("assistant")), ("op", .string("pet_state")), ("value", .string(state))]
        if let presentation {
            fields.append(("target", .string(presentation.target.rawValue)))
            if let phase = presentation.phase { fields.append(("phase", .string(phase.rawValue))) }
            if let error = presentation.error { fields.append(("error", .string(error.rawValue))) }
        }
        let line = FlatJSON.encode(fields)
        guard line.utf8.count <= maximumLineBytes else { throw AssistantError.invalidProfile }
        return Data((line + "\n").utf8)
    }
    static func supportsTextAssistant(_ capability:DeviceAssistantMessage) -> Bool {
        capability.schema == 1 && capability.profileSchema >= 2 && capability.asrProvider == "doubao-realtime" &&
        capability.supportsTranscript && capability.supportsReplyText && capability.supportsSinglePetAsset && capability.supportsSpeech == false
    }
    static func supportsHotMode(_ capability: DeviceAssistantMessage) -> Bool { capability.schema == 1 && capability.supportsHotMode }
    static func acceptsHotModeAcknowledgment(_ reply: DeviceAssistantMessage, target: String) -> Bool {
        reply.ok && !reply.restarting && reply.mode == target && ["companion", "standalone"].contains(target)
    }
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
