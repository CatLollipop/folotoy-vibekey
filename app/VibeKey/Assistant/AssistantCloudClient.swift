import Foundation

nonisolated struct AssistantCompletion: Sendable {
    let text: String
    let truncated: Bool
    let inputTokens: Int
    let outputTokens: Int
}

/// 网络入口可替换，测试用假的服务验证取消与轮次隔离，不需要收费 API。
nonisolated protocol AssistantCloudServing: Sendable {
    func complete(messages: [AssistantHistory.Message], profile: AssistantProfile, secrets: AssistantSecrets,
                  onText: @Sendable @escaping (String) async -> Void) async throws -> AssistantCompletion
    func speech(text: String, profile: AssistantProfile, secrets: AssistantSecrets) -> AsyncThrowingStream<Data, Error>
}

/// 只负责DeepSeek对话与MiniMax朗读；实时识别由独立ASRSession在采音期间处理。
nonisolated struct AssistantCloudClient: AssistantCloudServing {
    let session: URLSession
    init(session: URLSession = .shared) { self.session = session }

    func complete(messages: [AssistantHistory.Message], profile: AssistantProfile, secrets: AssistantSecrets,
                  onText: @Sendable @escaping (String) async -> Void) async throws -> AssistantCompletion {
        var request = try Self.request(base: profile.deepseekBaseURL, path: "chat/completions", key: secrets.deepseekKey)
        request.setValue("text/event-stream", forHTTPHeaderField: "Accept")
        let encodedMessages = try JSONEncoder().encode(messages)
        let object: [String: Any] = [
            "model": profile.llmModel, "thinking": ["type": "disabled"], "stream": true,
            "stream_options": ["include_usage": true], "max_tokens": profile.maxOutputTokens,
            "messages": try JSONSerialization.jsonObject(with: encodedMessages),
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: object)
        let (bytes, response) = try await session.bytes(for: request)
        try Self.check(response)
        var parser = AssistantCompletionParser(limit: profile.replyBytes)
        for try await line in bytes.lines {
            try Task.checkCancellation()
            if try parser.consume(line: line) { await onText(parser.text) }
            if parser.done { break }
        }
        return try parser.result()
    }

    func speech(text: String, profile: AssistantProfile, secrets: AssistantSecrets) -> AsyncThrowingStream<Data, Error> {
        let reader = AssistantSpeechReader(session: session, text: text, profile: profile, secrets: secrets)
        // unfolding 按消费者的 next 拉取网络数据，以 TCP 背压限制合成快于播放的情况。
        return AsyncThrowingStream(unfolding: { try await reader.next() })
    }

    static func request(base: String, path: String, key: String) throws -> URLRequest {
        guard let baseURL = URL(string: base), baseURL.scheme == "https", baseURL.host != nil,
              baseURL.user == nil, baseURL.password == nil,
              baseURL.query == nil, baseURL.fragment == nil else { throw AssistantError.invalidEndpoint }
        // 服务商文档可能把 /v1 包含在 base URL 中；只消除这一段重叠，保留自定义网关前缀。
        let suffix = baseURL.path.split(separator: "/").last
        let parts = path.split(separator: "/")
        let joined = suffix == "v1" && parts.first == "v1" ? parts.dropFirst().joined(separator: "/") : path
        var request = URLRequest(url: baseURL.appending(path: joined), timeoutInterval: 60)
        request.httpMethod = "POST"
        request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        return request
    }

    static func check(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else { throw AssistantError.http(0) }
        guard (200..<300).contains(http.statusCode) else { throw AssistantError.http(http.statusCode) }
    }

    static func checkProvider(_ object: [String: Any]) throws {
        if let base = object["base_resp"] as? [String: Any], let code = base["status_code"] as? Int, code != 0 {
            throw AssistantError.provider(code)
        }
        if object["error"] != nil { throw AssistantError.provider(-1) }
    }
}

/// 对 DeepSeek 的终止、usage 与空 delta 单独建模，EOF 不能冒充成功。
nonisolated struct AssistantCompletionParser {
    let limit: Int
    private(set) var text = ""
    private(set) var done = false
    private(set) var finishReason: String?
    private var inputTokens = 0
    private var outputTokens = 0
    init(limit: Int) { self.limit = limit }

    mutating func consume(line: String) throws -> Bool {
        guard !done, line.hasPrefix("data:") else { return false }
        guard line.utf8.count <= 65_536 else { throw AssistantError.responseTooLarge }
        let payload = line.dropFirst(5).trimmingCharacters(in: .whitespaces)
        if payload == "[DONE]" { done = true; return false }
        guard let object = try JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: Any] else {
            throw AssistantError.incompleteStream
        }
        try AssistantCloudClient.checkProvider(object)
        if let usage = object["usage"] as? [String: Any] {
            inputTokens = usage["prompt_tokens"] as? Int ?? inputTokens
            outputTokens = usage["completion_tokens"] as? Int ?? outputTokens
        }
        guard let choice = (object["choices"] as? [[String: Any]])?.first else { return false }
        if let reason = choice["finish_reason"] as? String { finishReason = reason }
        guard let delta = choice["delta"] as? [String: Any], let content = delta["content"] as? String else { return false }
        guard text.utf8.count + content.utf8.count <= limit else { throw AssistantError.responseTooLarge }
        text += content
        return !content.isEmpty
    }

    func result() throws -> AssistantCompletion {
        guard done, finishReason != nil else { throw AssistantError.incompleteStream }
        guard finishReason == "stop" || finishReason == "length" else { throw AssistantError.provider(-1) }
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { throw AssistantError.emptyReply }
        return .init(text: value, truncated: finishReason == "length", inputTokens: inputTokens, outputTokens: outputTokens)
    }
}

nonisolated enum AssistantHex {
    static func decode(_ hex: String) throws -> Data {
        let bytes = Array(hex.utf8)
        guard bytes.count.isMultiple(of: 2) else { throw AssistantError.malformedAudio }
        func nibble(_ b: UInt8) -> UInt8? {
            switch b { case 48...57: b - 48; case 65...70: b - 55; case 97...102: b - 87; default: nil }
        }
        var out = Data(capacity: bytes.count / 2)
        for i in stride(from: 0, to: bytes.count, by: 2) {
            guard let a = nibble(bytes[i]), let b = nibble(bytes[i + 1]) else { throw AssistantError.malformedAudio }
            out.append(a << 4 | b)
        }
        return out
    }
}

/// 每条流只允许一个消费者；状态由 next 顺序持有，不另建不受限的生产队列。
nonisolated private final class AssistantSpeechReader: @unchecked Sendable {
    private let session: URLSession
    private let text: String
    private let profile: AssistantProfile
    private let secrets: AssistantSecrets
    private var iterator: AsyncLineSequence<URLSession.AsyncBytes>.AsyncIterator?
    private var finished = false

    init(session: URLSession, text: String, profile: AssistantProfile, secrets: AssistantSecrets) {
        self.session = session; self.text = text; self.profile = profile; self.secrets = secrets
    }

    func next() async throws -> Data? {
        try Task.checkCancellation()
        if finished { return nil }
        if iterator == nil {
            var request = try AssistantCloudClient.request(base: profile.minimaxBaseURL, path: "v1/t2a_v2", key: secrets.minimaxKey)
            request.httpBody = try JSONSerialization.data(withJSONObject: [
                "model": profile.ttsModel, "text": text, "stream": true,
                "stream_options": ["exclude_aggregated_audio": true],
                "voice_setting": ["voice_id": profile.voiceID, "speed": 1, "vol": 1, "pitch": 0],
                "audio_setting": ["format": "pcm", "sample_rate": 16_000, "channel": 1],
            ])
            let (bytes, response) = try await session.bytes(for: request)
            try AssistantCloudClient.check(response)
            iterator = bytes.lines.makeAsyncIterator()
        }
        var source = iterator!
        while let line = try await source.next() {
            iterator = source
            try Task.checkCancellation()
            guard line.hasPrefix("data:") else { continue }
            guard line.utf8.count <= 2_097_152 else { throw AssistantError.responseTooLarge }
            let payload = line.dropFirst(5).trimmingCharacters(in: .whitespaces)
            guard let object = try JSONSerialization.jsonObject(with: Data(payload.utf8)) as? [String: Any] else {
                throw AssistantError.malformedAudio
            }
            try AssistantCloudClient.checkProvider(object)
            guard let data = object["data"] as? [String: Any] else { continue }
            if (data["status"] as? Int) == 2 { finished = true }
            if let hex = data["audio"] as? String, !hex.isEmpty {
                return try AssistantHex.decode(hex)
            }
            if finished { return nil }
        }
        throw AssistantError.incompleteStream
    }
}
