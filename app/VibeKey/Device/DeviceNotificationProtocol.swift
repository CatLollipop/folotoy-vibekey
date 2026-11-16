import Foundation
import CryptoKit

/// 通知有独立身份和正文版本；不使用助手的ASR/reply generation或云服务配置。
nonisolated struct PassportNotification: Equatable, Sendable {
    enum Kind: String, Sendable { case done, input, error }
    let id: String
    let revision: UInt32
    let source: String
    let kind: Kind
    let text: String
    let truncated: Bool
    var checksum: UInt32 { CRC32.checksum(Data(text.utf8)) }
}

nonisolated enum DeviceNotificationError: Error, Equatable {
    case unavailable, unsupported, invalid, deliveryUnknown, rejected(String)
}

/// 验收可持久化的收据只有协议元数据；调用者不必记录notification正文。
nonisolated struct DeviceNotificationDelivery: Sendable {
    let capability: DeviceNotificationMessage
    let commit: DeviceNotificationMessage
    let link: String
    let acknowledgedChunks: Int
    let resumedOffset: Int
}

/// USB和已配对TLS Wi-Fi共用；每行(不含换行)≤511B，正文≤2KiB，只在完整commit后可展示。
nonisolated enum DeviceNotificationProtocol {
    static let maximumBodyBytes = 2_048
    static let maximumSourceBytes = 48
    static let maximumChunkBytes = 96
    static let maximumLineBytes = 511

    /// 长度由JSON数组编码，不使用可发生分隔符碰撞的字符串拼接；只下发128bit不透明身份。
    static func identity(_ components: [String]) -> String {
        let data = (try? JSONEncoder().encode(components)) ?? Data()
        return SHA256.hash(data: data).prefix(16).map { String(format: "%02x", $0) }.joined()
    }
    static func validID(_ id: String) -> Bool {
        DeviceNotificationMessage.validIdentity(id)
    }
    static func encode(op: String, requestID: UInt32, id: String = "", revision: UInt32 = 0,
                       fields: [(String, FlatJSON.Value)] = []) throws -> Data {
        guard requestID != 0, ["cap", "begin", "chunk", "commit", "abort", "clear"].contains(op),
              (op == "cap" ? id.isEmpty && revision == 0 : validID(id) && revision != 0),
              fields.allSatisfy({ !["cmd", "op", "rid", "nid", "rev"].contains($0.0) }) else { throw DeviceNotificationError.invalid }
        let line = FlatJSON.encode([("cmd", .string("notification")), ("op", .string(op)),
            ("rid", .int(Int(requestID))), ("nid", .string(id)), ("rev", .int(Int(revision)))] + fields)
        guard line.utf8.count <= maximumLineBytes else { throw DeviceNotificationError.invalid }
        return Data((line + "\n").utf8)
    }
    static func beginFields(_ notice: PassportNotification) throws -> [(String, FlatJSON.Value)] {
        guard validID(notice.id), notice.revision != 0, notice.text.utf8.count <= maximumBodyBytes,
              notice.source.utf8.count <= maximumSourceBytes else { throw DeviceNotificationError.invalid }
        return [("src", .string(notice.source)), ("kind", .string(notice.kind.rawValue)),
                ("size", .int(notice.text.utf8.count)), ("crc", .int(Int(notice.checksum))),
                ("truncated", .int(notice.truncated ? 1 : 0))]
    }
    /// UTF-8标量边界分块，并按最坏转义后的实际wire长度缩小，不能只计算原文96B。
    static func chunks(_ notice: PassportNotification) throws -> [(offset: Int, text: String)] {
        _ = try beginFields(notice)
        var result: [(Int, String)] = [], current = "", offset = 0
        for scalar in notice.text.unicodeScalars {
            let value = String(scalar), candidate = current + value
            let fields: [(String, FlatJSON.Value)] = [("off", .int(offset)), ("text", .string(candidate))]
            if candidate.utf8.count > maximumChunkBytes || (try? encode(op: "chunk", requestID: UInt32.max,
                id: notice.id, revision: notice.revision, fields: fields)) == nil {
                guard !current.isEmpty else { throw DeviceNotificationError.invalid }
                result.append((offset, current)); offset += current.utf8.count; current = value
            } else { current = candidate }
        }
        if !current.isEmpty { result.append((offset, current)) }
        return result
    }
    static func matches(_ reply: DeviceNotificationMessage, requestID: UInt32, op: String, id: String,
                        revision: UInt32, offset: Int? = nil, checksum: UInt32? = nil) -> Bool {
        guard reply.requestID == requestID, reply.op == op, reply.id == id, reply.revision == revision else { return false }
        if !reply.ok { return true } // 失败仍严格绑定请求身份；off可报告设备当前进度。
        return (offset == nil || reply.offset == offset) && (checksum == nil || reply.checksum == checksum)
    }
}
