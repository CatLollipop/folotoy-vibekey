import Foundation

/// 仅替换WebSocket传输；正式BailianCodec与StreamingCloudSession全部参与测试。
nonisolated final class FunASRTransportFixture: CloudStreamConnectionBuilding, CloudStreamConnection, @unchecked Sendable {
    enum Completion: CaseIterable { case confirmed, missingTaskFinished, closedBeforeTaskFinished, closeCallbackBeforeQueuedFinal }
    private let lock = NSLock()
    private let mode: Completion
    private var message: (@Sendable (URLSessionWebSocketTask.Message) -> Void)?
    private var closed: (@Sendable (Error?) -> Void)?
    private var taskID = ""
    private var audioCount = 0
    init(mode:Completion) { self.mode=mode }
    var audioMessages:Int { lock.withLock { audioCount } }
    func connect(request: URLRequest, onMessage: @escaping @Sendable (URLSessionWebSocketTask.Message) -> Void,
                 onClose: @escaping @Sendable (Error?) -> Void) throws -> any CloudStreamConnection {
        guard request.url?.scheme == "wss",request.value(forHTTPHeaderField:"Authorization") == "Bearer fixture" else { throw URLError(.badURL) }
        lock.withLock { message=onMessage;closed=onClose }
        return self
    }
    func send(_ value:URLSessionWebSocketTask.Message) {
        switch value {
        case .data:
            lock.withLock { audioCount += 1 }
            event("result-generated",sentence:["text":"录音中","sentence_end":false,"begin_time":0])
        case .string(let text):
            guard let object=CloudJSON.object(Data(text.utf8)),let header=object["header"] as? [String:Any],let action=header["action"] as? String else { return }
            if action == "run-task" {
                lock.withLock { taskID=header["task_id"] as? String ?? "" }
                event("task-started")
            } else if action == "finish-task" {
                event("result-generated",sentence:["text":"完整定稿","sentence_end":true,"begin_time":0])
                if mode == .confirmed { event("task-finished") }
                if mode == .closedBeforeTaskFinished { lock.withLock { closed }?(nil) }
                if mode == .closeCallbackBeforeQueuedFinal { lock.withLock { closed }?(nil);event("task-finished") }
            }
        @unknown default: break
        }
    }
    func close() { lock.withLock { closed }?(nil) }
    private func event(_ name:String,sentence:[String:Any]? = nil) {
        let (callback,id)=lock.withLock { (message,taskID) }
        var object:[String:Any] = ["header":["event":name,"task_id":id]]
        if let sentence { object["payload"]=["output":["sentence":sentence]] }
        callback?(.string(try! CloudJSON.string(object)))
    }
}

/// 豆包官方二进制协议的合成数据；不包含真实请求ID、音频、用户文本或供应商trace。
/// 序号为大端有符号Int32，长度为大端UInt32；只有flags的bit0为1时才携带序号，符号不决定终态。
nonisolated enum VolcengineWireFixture {
    static func result(_ result: [String: Any]? = nil, flags: UInt8 = 0,
                       sequence: Int32? = nil, gzip: Bool = true, array: Bool = false) throws -> Data {
        var object: [String: Any] = [:]
        if let result { object["result"] = array ? [result] : result }
        return try frame(payload: Data(CloudJSON.string(object).utf8), flags: flags, sequence: sequence, gzip: gzip)
    }

    static func frame(payload: Data, flags: UInt8 = 0, sequence: Int32? = nil,
                      gzip: Bool = true, errorCode: UInt32? = nil) throws -> Data {
        let encoded = gzip ? try Gzip.compress(payload) : payload
        var data = Data([0x11, ((errorCode == nil ? UInt8(9) : UInt8(15)) << 4) | flags,
                         UInt8(0x10) | (gzip ? UInt8(1) : UInt8(0)), 0])
        if let errorCode { data.append(contentsOf: bigEndian(errorCode)) }
        else if let sequence { data.append(contentsOf: bigEndian(UInt32(bitPattern: sequence))) }
        data.append(contentsOf: bigEndian(UInt32(encoded.count)))
        data.append(encoded)
        return data
    }

    static func utterance(_ text: String, start: Int = 0, end: Int = 200, definite: Bool = false) -> [String: Any] {
        ["text": text, "start_time": start, "end_time": end, "definite": definite]
    }
    static func bigEndian(_ value: UInt32) -> [UInt8] {
        [UInt8((value >> 24) & 255), UInt8((value >> 16) & 255), UInt8((value >> 8) & 255), UInt8(value & 255)]
    }
}

/// 只替换WebSocket，正式VolcengineCodec和StreamingCloudSession负责请求与终态。
nonisolated final class VolcengineTransportFixture: CloudStreamConnectionBuilding, CloudStreamConnection, @unchecked Sendable {
    enum Completion: CaseIterable {
        case confirmed, missingFinalFrame, closedBeforeFinalFrame, closeCallbackBeforeQueuedFinal
        case noInitialResponse, invalidFinalPayload
    }
    private let lock = NSLock()
    private let mode: Completion
    private var message: (@Sendable (URLSessionWebSocketTask.Message) -> Void)?
    private var closed: (@Sendable (Error?) -> Void)?
    private var audioCount = 0
    init(mode: Completion) { self.mode = mode }
    var audioMessages: Int { lock.withLock { audioCount } }

    func connect(request: URLRequest, onMessage: @escaping @Sendable (URLSessionWebSocketTask.Message) -> Void,
                 onClose: @escaping @Sendable (Error?) -> Void) throws -> any CloudStreamConnection {
        guard request.url?.scheme == "wss", request.value(forHTTPHeaderField: "X-Api-Key") == "fixture",
              request.value(forHTTPHeaderField: "X-Api-Resource-Id") == "volc.seedasr.sauc.duration",
              let id = request.value(forHTTPHeaderField: "X-Api-Request-Id"), UUID(uuidString: id) != nil,
              request.value(forHTTPHeaderField: "X-Api-Connect-Id") == id else { throw URLError(.badURL) }
        lock.withLock { message = onMessage; closed = onClose }
        return self
    }

    func send(_ value: URLSessionWebSocketTask.Message) {
        guard case .data(let data) = value, data.count >= 8 else { return }
        let type = data[1] >> 4, last = data[1] & 2 != 0
        if type == 1 {
            if mode != .noInitialResponse { emit(try! VolcengineWireFixture.result()) }
        } else if type == 2, !last {
            lock.withLock { audioCount += 1 }
            if mode != .noInitialResponse {
                emit(try! VolcengineWireFixture.result(["text": "录音中", "utterances": [VolcengineWireFixture.utterance("录音中")]]))
            }
        } else if type == 2, last {
            let result: [String: Any] = ["text": "完整定稿", "utterances": [VolcengineWireFixture.utterance("完整定稿", definite: true)]]
            if mode == .missingFinalFrame || mode == .closedBeforeFinalFrame {
                emit(try! VolcengineWireFixture.result(result))
            }
            if mode == .closedBeforeFinalFrame || mode == .closeCallbackBeforeQueuedFinal { lock.withLock { closed }?(nil) }
            if mode == .invalidFinalPayload {
                emit(try! VolcengineWireFixture.frame(payload: Data("invalid json".utf8), flags: 3, sequence: -1))
            } else if mode == .confirmed || mode == .closeCallbackBeforeQueuedFinal || mode == .noInitialResponse {
                emit(try! VolcengineWireFixture.result(result, flags: 3, sequence: -1))
            }
        }
    }
    func close() { lock.withLock { closed }?(nil) }
    private func emit(_ data: Data) { lock.withLock { message }?(.data(data)) }
}

/// 同步回调仅复制数值头字段，测试不打印/留存识别payload。
private nonisolated final class VolcengineHeaderTraceFixture: @unchecked Sendable {
    private let lock = NSLock()
    private var headers: [VolcengineFrameHeader] = []
    func append(_ header: VolcengineFrameHeader) { lock.withLock { headers.append(header) } }
    var all: [VolcengineFrameHeader] { lock.withLock { headers } }
}

/// 直接验证真实codec的官方wire契约；网络层只负责重组完整WebSocket消息，不在UTF-8字节边界拼String。
nonisolated enum VolcengineCodecContracts {
    static func run() throws {
        let options = ASROptions(purpose: .dictation, language: .auto, vocabulary: [])
        func codec() -> VolcengineCodec { VolcengineCodec(apiKey: "fixture", resourceID: "volc.seedasr.sauc.duration", options: options) }
        func expect(_ condition: @autoclosure () throws -> Bool, _ reason: String) throws {
            if try !condition() { throw NSError(domain: "VolcengineCodecContract", code: 1, userInfo: [NSLocalizedDescriptionKey: reason]) }
        }
        func finals(_ events: [CodecEvent]) -> [String] { events.compactMap { if case .final(let text) = $0 { text } else { nil } } }
        func failed(_ events: [CodecEvent]) -> Bool { events.contains { if case .failure = $0 { true } else { false } } }

        let endpoint = URL(string: "wss://fixture.invalid/asr")!
        let override = VolcengineCodec(apiKey: "fixture", resourceID: "volc.seedasr.sauc.duration", options: options, endpointURL: endpoint)
        let request = try override.makeRequest()
        try expect(request.url == endpoint && UUID(uuidString: request.value(forHTTPHeaderField: "X-Api-Request-Id") ?? "") != nil,
                   "Doubao endpoint override or required request UUID missing")
        try expect(request.value(forHTTPHeaderField: "X-Api-Connect-Id") == request.value(forHTTPHeaderField: "X-Api-Request-Id"), "Request/connect identities diverged")
        let trace = VolcengineHeaderTraceFixture()
        var traced = VolcengineCodec(apiKey: "fixture", resourceID: "volc.seedasr.sauc.duration", options: options,
                                    onFrameHeader: { trace.append($0) })
        var malformed = try VolcengineWireFixture.result(["text": "fixture"], flags: 3, sequence: -1)
        malformed.removeLast()
        _ = traced.parse(.data(malformed))
        try expect(trace.all.count == 1 && trace.all[0].flags == 3 && trace.all[0].sequence == -1
                   && trace.all[0].frameByteCount == malformed.count && trace.all[0].compression == 1,
                   "Numeric-only frame diagnostic missed rejected frame")
        guard case .data(let start) = try override.startMessages().first else { throw URLError(.cannotParseResponse) }
        let startJSON = CloudJSON.object(try Gzip.decompress(start.dropFirst(8)))
        try expect(start[1] == 0x10 && start[2] == 0x11 && (startJSON?["request"] as? [String: Any])?["model_name"] as? String == "bigmodel", "Client full request no longer matches Doubao model/wire")
        guard case .data(let last) = try override.finishMessages(lastChunk: Data([0, 1])).first else { throw URLError(.cannotParseResponse) }
        let lastPCM = try Gzip.decompress(last.dropFirst(8))
        try expect(last[1] == 0x22 && last[2] == 0x01 && lastPCM == Data([0, 1]), "Client last audio does not carry flags2 and remaining PCM")

        // 四种flags、两种压缩、旧版result数组均是官方允许的格式。
        for flags in UInt8(0)...UInt8(3) {
            for gzip in [false, true] {
                var parser = codec()
                let sequence: Int32? = flags & 1 == 0 ? nil : (flags & 2 == 0 ? 1 : -1)
                let result: [String: Any] = ["text": "你好🧑🏽‍💻。", "utterances": [VolcengineWireFixture.utterance("你好🧑🏽‍💻。", definite: flags & 2 != 0)]]
                let events = parser.parse(.data(try VolcengineWireFixture.result(result, flags: flags, sequence: sequence, gzip: gzip, array: true)))
                try expect(!failed(events) && events.contains(.completed) == (flags & 2 != 0), "Valid flags/compression/result array rejected")
                try expect(events.contains(flags & 2 != 0 ? .final("你好🧑🏽‍💻。") : .partial("你好🧑🏽‍💻。")), "UTF-8/emoji text changed")
                if flags & 2 != 0 { try expect(parser.parse(.data(try VolcengineWireFixture.result())).isEmpty, "Late frames changed terminal session") }
            }
        }

        // 真实服务仅留存数值头：type9/flags3/seq+13/raw/JSON/1508B。body全部使用合成内容。
        // 正/零/负序号均只是元数据；flags1即使负序号也不能提前完成。
        for flags in [UInt8(1), 3] {
            for sequence in [Int32(-13), 0, 13] {
                var parser = codec()
                let events = parser.parse(.data(try VolcengineWireFixture.result(["text": "合成测试🙂。"], flags: flags, sequence: sequence, gzip: false)))
                try expect(!failed(events) && events.contains(.completed) == (flags & 2 != 0), "Sequence sign overrode terminal flag")
            }
        }
        var shapePayload = Data(try CloudJSON.string(["result": ["text": "合成测试🙂。"]]).utf8)
        shapePayload.append(Data(repeating: 0x20, count: 1_508 - shapePayload.count))
        let shape = try VolcengineWireFixture.frame(payload: shapePayload, flags: 3, sequence: 13, gzip: false)
        var shapeParser = codec()
        let shapeEvents = shapeParser.parse(.data(shape))
        try expect(shape.count == 1_520 && finals(shapeEvents) == ["合成测试🙂。"] && shapeEvents.contains(.completed),
                   "Observed positive terminal sequence header shape rejected")

        var full = codec()
        let first = VolcengineWireFixture.utterance("第一句。", start: 0, end: 200, definite: true)
        let second = VolcengineWireFixture.utterance("第二句。", start: 100, end: 200, definite: true)
        try expect(finals(full.parse(.data(try VolcengineWireFixture.result(["utterances": [first]])))) == ["第一句。"], "First definite omitted")
        try expect(finals(full.parse(.data(try VolcengineWireFixture.result(["utterances": [first, second]])))) == ["第二句。"], "Full result repeated old sentence or merged distinct start times")
        let finalEvents = full.parse(.data(try VolcengineWireFixture.result(["text": "第一句。第二句。末尾🙂。"], flags: 2)))
        try expect(finals(finalEvents) == ["末尾🙂。"] && finalEvents.contains(.completed), "Terminal full text lost uncommitted tail")

        var textOnly = codec()
        try expect(textOnly.parse(.data(try VolcengineWireFixture.result(["text": "中间🙂"]))).contains(.partial("中间🙂")), "Text-only interim omitted")
        try expect(finals(textOnly.parse(.data(try VolcengineWireFixture.result(["text": "中间🙂完成。"], flags: 2)))) == ["中间🙂完成。"], "Text-only final omitted")

        // Header扩展按header size跳过；不能把扩展字节误当长度。
        var extended = try VolcengineWireFixture.result(["text": "扩展。"], flags: 2, gzip: false)
        extended[0] = 0x12; extended.insert(contentsOf: [0, 0, 0, 0], at: 4)
        var extendedParser = codec()
        try expect(finals(extendedParser.parse(.data(extended))) == ["扩展。"], "Header extension length ignored")

        var invalidFrames: [Data] = []
        let valid = try VolcengineWireFixture.result(["text": "合法。"], flags: 2)
        var zeroHeader = valid; zeroHeader[0] = 0x10; invalidFrames.append(zeroHeader)
        var oversizedHeader = valid; oversizedHeader[0] = 0x1f; invalidFrames.append(Data(oversizedHeader.prefix(8)))
        invalidFrames.append(Data([0x11, 0x93, 0x11, 0, 0xff, 0xff]))
        var wrongLength = valid; wrongLength[7] &+= 1; invalidFrames.append(wrongLength)
        var unknownCompression = valid; unknownCompression[2] = 0x12; invalidFrames.append(unknownCompression)
        var corruptGzip = valid; corruptGzip[8] = 0; invalidFrames.append(corruptGzip)
        invalidFrames.append(try VolcengineWireFixture.frame(payload: Data("not json".utf8), flags: 2))
        invalidFrames.append(try VolcengineWireFixture.frame(payload: Data([0x7b, 0x22, 0xff, 0x22, 0x3a, 0x31, 0x7d]), flags: 2, gzip: false))
        var truncated = valid; truncated.removeLast(4); truncated.replaceSubrange(4..<8, with: VolcengineWireFixture.bigEndian(UInt32(truncated.count - 8))); invalidFrames.append(truncated)
        var truncatedError = try VolcengineWireFixture.frame(payload: Data("fixture only".utf8), gzip: false, errorCode: 45_000_001)
        truncatedError.removeLast(); invalidFrames.append(truncatedError)
        for frame in invalidFrames {
            var parser = codec()
            let events = parser.parse(.data(frame))
            try expect(failed(events) && !events.contains(.completed), "Malformed frame was accepted as completed")
            try expect(parser.parse(.data(valid)).isEmpty, "Failed protocol resumed after terminal failure")
        }
        var errorParser = codec()
        let serverError = errorParser.parse(.data(try VolcengineWireFixture.frame(payload: Data("fixture only".utf8), errorCode: 45_000_001)))
        try expect(failed(serverError) && !serverError.contains(.completed), "Server error was not propagated")

        // 不完整gzip头/尾必须抛错，不能以空输出或部分输出代表完整payload。
        let compressed = try Gzip.compress(Data("{}".utf8))
        for length in [3, compressed.count - 1, compressed.count - 8] {
            var rejected = false
            do { _ = try Gzip.decompress(compressed.prefix(length)) } catch { rejected = true }
            try expect(rejected, "Truncated gzip accepted without Z_STREAM_END")
        }
    }
}
