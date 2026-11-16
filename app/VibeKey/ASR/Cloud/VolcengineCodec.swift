import Foundation

/// 仅用于显式诊断的数值头字段；不暴露payload、请求头、会话ID、trace或识别正文。
nonisolated struct VolcengineFrameHeader: Sendable, Codable, Equatable {
    let messageType: UInt8
    let flags: UInt8
    let sequence: Int32?
    let declaredPayloadLength: UInt32?
    let frameByteCount: Int
    let headerByteCount: Int
    let compression: UInt8
    let serialization: UInt8
}

/// 火山引擎豆包流式语音识别(大模型 v3,`bigmodel_async`)。
/// 帧格式:4 字节头 + [服务端:4 字节序号] + 4 字节大端长度 + 负载(gzip)。
/// - 头字节 0 = 0x11(协议 v1,头长 4);字节 1 = (消息类型 << 4) | 标志;字节 2 = (序列化 << 4) | 压缩;字节 3 = 0。
/// - 客户端:类型 1 = 完整请求(JSON + gzip),类型 2 = 音频(raw + gzip),标志 0b0010 = 最后一包。
/// - 服务端:类型 9 = 结果(标志 bit0 = 带序号,bit1 = 最后一包),类型 15 = 错误(4 字节错误码 + 长度 + 消息)。
/// 结果用 `result_type: full`:每次返回全部 utterances,已定稿(`definite`)的按起止时间去重后作为 final。
/// 文档:https://docs.volcengine.com/docs/doubao-voice/bidirectional-streaming-automatic-speech-recognition-websocket
nonisolated struct VolcengineCodec: RealtimeCodec {
    let apiKey: String
    /// X-Api-Resource-Id:2.0 为 volc.seedasr.sauc.duration,1.0 为 volc.bigasr.sauc.duration。
    let resourceID: String
    let options: ASROptions
    let endpointURL: URL?
    /// 在codec解析锁内同步调用；诊断方只做短时间数值复制，不能回调session。
    let onFrameHeader: (@Sendable (VolcengineFrameHeader) -> Void)?
    let connectID = UUID().uuidString

    let waitsForReady = false
    /// 官方建议 100~200 ms 一包,这里用 200 ms。
    let chunkBytes = 6_400
    let completesOnFinalAfterFinish = false

    /// full 模式重复携带之前的分句；结束时间本身不是唯一标识，不能合并起点不同的分句。
    private struct SegmentID: Hashable { let start: Int; let end: Int }
    private var committed: [SegmentID: String] = [:]
    private var committedTexts: [String] = []
    private var terminated = false

    init(apiKey: String, resourceID: String, options: ASROptions, endpointURL: URL? = nil,
         onFrameHeader: (@Sendable (VolcengineFrameHeader) -> Void)? = nil) {
        self.apiKey = apiKey
        self.resourceID = resourceID
        self.options = options
        self.endpointURL = endpointURL
        self.onFrameHeader = onFrameHeader
    }

    func makeRequest() throws -> URLRequest {
        var request = URLRequest(url: endpointURL ?? URL(string: "wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async")!)
        request.setValue(apiKey, forHTTPHeaderField: "X-Api-Key")
        request.setValue(resourceID, forHTTPHeaderField: "X-Api-Resource-Id")
        request.setValue(connectID, forHTTPHeaderField: "X-Api-Connect-Id")
        // 新版文档要求 Request-Id；Connect-Id 保留以兼容旧版接入，两者标识同一条连接。
        request.setValue(connectID, forHTTPHeaderField: "X-Api-Request-Id")
        return request
    }

    func startMessages() throws -> [URLSessionWebSocketTask.Message] {
        var req: [String: Any] = [
            "model_name": "bigmodel",
            "enable_itn": true,
            "enable_punc": true,
            "show_utterances": true,
            "result_type": "full",
            // 二遍识别:每句结束后用非流式模型重识别,准确率更高。
            "enable_nonstream": true,
            // 字幕希望句子尽快定稿,听写允许更长的停顿。
            "end_window_size": options.purpose == .subtitles ? 600 : 1_000,
        ]
        if !options.vocabulary.isEmpty {
            let hotwords = options.vocabulary.prefix(100).map { ["word": $0] }
            req["corpus"] = ["context": try CloudJSON.string(["hotwords": hotwords])]
        }
        let payload: [String: Any] = [
            "user": ["uid": "vibekey"],
            "audio": ["format": "pcm", "codec": "raw", "rate": 16_000, "bits": 16, "channel": 1],
            "request": req,
        ]
        let json = Data(try CloudJSON.string(payload).utf8)
        return [.data(try Self.frame(type: 1, flags: 0, serialization: 1, payload: json))]
    }

    func audioMessage(_ pcm16: Data) throws -> URLSessionWebSocketTask.Message {
        .data(try Self.frame(type: 2, flags: 0, serialization: 0, payload: pcm16))
    }

    func finishMessages(lastChunk: Data) throws -> [URLSessionWebSocketTask.Message] {
        [.data(try Self.frame(type: 2, flags: 0b0010, serialization: 0, payload: lastChunk))]
    }

    /// 组一个客户端帧(负载 gzip 压缩)。
    static func frame(type: UInt8, flags: UInt8, serialization: UInt8, payload: Data) throws -> Data {
        let body = try Gzip.compress(payload)
        var data = Data([0x11, (type << 4) | flags, (serialization << 4) | 0x01, 0x00])
        data.append(contentsOf: bigEndian(UInt32(body.count)))
        data.append(body)
        return data
    }

    mutating func parse(_ message: URLSessionWebSocketTask.Message) -> [CodecEvent] {
        guard !terminated else { return [] }
        guard case .data(let data) = message else { return invalid("binary_message") }
        let bytes = [UInt8](data)
        guard bytes.count >= 4, bytes[0] >> 4 == 1 else { return invalid("header_version") }
        let headerSize = Int(bytes[0] & 0x0F) * 4
        guard headerSize >= 4, headerSize <= bytes.count else { return invalid("header_size") }
        let type = bytes[1] >> 4
        let flags = bytes[1] & 0x0F
        let serialization = bytes[2] >> 4
        let compression = bytes[2] & 0x0F
        // 必须在序号符号等验证前报告，才能看见真实服务端边界；不读取任何body。
        if let onFrameHeader {
            var lengthOffset = headerSize
            var sequence: Int32?
            if type == 9, flags & 1 != 0 {
                if bytes.count >= lengthOffset + 4 { sequence = Int32(bitPattern: Self.readUInt32(bytes, lengthOffset)) }
                lengthOffset += 4
            } else if type == 15 { lengthOffset += 4 }
            let length = bytes.count >= lengthOffset + 4 ? Self.readUInt32(bytes, lengthOffset) : nil
            onFrameHeader(.init(messageType: type, flags: flags, sequence: sequence,
                                declaredPayloadLength: length, frameByteCount: bytes.count, headerByteCount: headerSize,
                                compression: compression, serialization: serialization))
        }
        guard compression <= 1 else { return invalid("compression") }
        var offset = headerSize

        if type == 15 {
            // 错误帧:错误码 + 长度 + UTF-8 消息。
            guard serialization <= 1, bytes.count >= offset + 8 else { return invalid("error_header") }
            let code = Self.readUInt32(bytes, offset)
            let length = Int(Self.readUInt32(bytes, offset + 4))
            let start = offset + 8
            guard length == bytes.count - start else { return invalid("error_length") }
            let encoded = Data(bytes[start...])
            guard let payload = compression == 1 ? try? Gzip.decompress(encoded) : encoded,
                  let text = String(data: payload, encoding: .utf8) else { return invalid("error_payload") }
            terminated = true
            return [.failure("\(Self.describe(code: code)) (\(code)) \(text)")]
        }
        guard type == 9, flags <= 3, serialization == 1 else { return invalid("result_header") }
        let isLast = flags & 0b0010 != 0
        if flags & 0b0001 != 0 {
            guard bytes.count >= offset + 4 else { return invalid("sequence_length") }
            // 当前服务端实测flags3也会携带正序号；新版官方parser仅按bit1判断最后一包。
            // 序号是signed Int32元数据，不从其符号推断完成，也不能因符号拒绝有效终帧。
            offset += 4
        }
        guard bytes.count >= offset + 4 else { return invalid("payload_header") }
        let length = Int(Self.readUInt32(bytes, offset))
        offset += 4
        guard length == bytes.count - offset else { return invalid("payload_length") }
        let encoded = Data(bytes[offset...])
        guard let payload = compression == 1 ? try? Gzip.decompress(encoded) : encoded,
              String(data: payload, encoding: .utf8) != nil,
              let object = CloudJSON.object(payload) else { return invalid("result_payload") }
        var events: [CodecEvent] = [.ready]
        let result = (object["result"] as? [String: Any]) ?? (object["result"] as? [[String: Any]])?.first
        if object["result"] != nil, result == nil, (object["result"] as? [Any])?.isEmpty != true {
            return invalid("result_shape")
        }
        if let value = result?["utterances"], !(value is [[String: Any]]) { return invalid("utterances_shape") }
        let utterances = result?["utterances"] as? [[String: Any]] ?? []
        var pending: [String] = []
        for utterance in utterances {
            guard let text = utterance["text"] as? String, !text.isEmpty else { continue }
            let definite = utterance["definite"] as? Bool == true
            if definite || isLast {
                guard let end = CloudJSON.integer(utterance["end_time"]), end >= 0 else { return invalid("utterance_time") }
                let start = CloudJSON.integer(utterance["start_time"]) ?? -1
                guard start <= end else { return invalid("utterance_time") }
                let id = SegmentID(start: start, end: end)
                if let previous = committed[id] {
                    // definite=true 的官方契约是不再改变；异常修订不能静默拼成重复文本。
                    guard previous == text else { return invalid("changed_definite") }
                } else {
                    committed[id] = text
                    committedTexts.append(text)
                    events.append(.final(text))
                }
            } else {
                pending.append(text)
            }
        }
        if utterances.isEmpty, let text = result?["text"] as? String {
            // 兼容只返回 full text 的结果。按已定稿前缀取尾部，不把整段再次附加。
            guard let tail = uncommittedTail(text) else { return invalid("changed_full_prefix") }
            if isLast {
                if !tail.isEmpty { events.append(.final(tail)) }
            } else {
                pending.append(tail)
            }
        }
        events.append(.partial(TranscriptText.join(pending)))
        if isLast { terminated = true; events.append(.completed) }
        return events
    }

    /// `String.dropFirst` 按字符截取，中文/emoji 不会在 UTF-8 多字节中间切断。
    private func uncommittedTail(_ full: String) -> String? {
        guard !committedTexts.isEmpty else { return full }
        for prefix in [TranscriptText.join(committedTexts), committedTexts.joined()] where full.hasPrefix(prefix) {
            return String(full.dropFirst(prefix.count)).trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return nil
    }

    /// 损坏的终帧必须失败；不能吞掉 gzip/JSON 错误再发 completed。
    private mutating func invalid(_ stage: String) -> [CodecEvent] {
        terminated = true
        return [.failure("\(Self.describe(code: 0)) [protocol:\(stage)]")]
    }

    private static func bigEndian(_ value: UInt32) -> [UInt8] {
        [UInt8(value >> 24 & 0xFF), UInt8(value >> 16 & 0xFF), UInt8(value >> 8 & 0xFF), UInt8(value & 0xFF)]
    }

    private static func readUInt32(_ bytes: [UInt8], _ offset: Int) -> UInt32 {
        bytes[offset..<offset + 4].reduce(UInt32(0)) { ($0 << 8) | UInt32($1) }
    }

    /// 常见错误码说明(其余直接显示服务端消息)。
    static func describe(code: UInt32) -> String {
        switch code {
        case 45000001: String(localized: "请求参数无效", bundle: .l10n)
        case 45000002: String(localized: "音频为空", bundle: .l10n)
        case 45000081: String(localized: "等待音频超时", bundle: .l10n)
        case 45000151: String(localized: "音频格式不正确", bundle: .l10n)
        case 55000031: String(localized: "服务繁忙", bundle: .l10n)
        default: String(localized: "火山引擎识别失败", bundle: .l10n)
        }
    }
}
