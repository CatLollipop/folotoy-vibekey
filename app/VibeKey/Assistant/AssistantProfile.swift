import Foundation

/// 助手公开配置不含密钥，可安全用于设置持久化和可分享的导出。
nonisolated struct AssistantProfile: Codable, Equatable, Sendable {
    var schema = 1
    var revision: UInt32 = 1
    var minimaxBaseURL = "https://api.minimax.cn"
    var deepseekBaseURL = "https://api.deepseek.com"
    var asrModel = "asr-1.0"
    var llmModel = "deepseek-flash"
    var ttsModel = "speech-2.8-turbo"
    var voiceID = "male-qn-qingse"
    var systemPrompt = "你是友好、可靠的中文AI助理。优先给出简短、清楚、适合语音朗读的回答；除非用户要求，控制在约120个汉字内。"
    var recordLimitSeconds = 30
    var maxOutputTokens = 512
    var historyBytes = 8_192
    var replyBytes = 4_096
    var autoSpeakReplies = true

    /// 设备固定供应商适配器有明确上限，设置页与同步入口统一校验。
    func validate() throws {
        for value in [minimaxBaseURL, deepseekBaseURL] {
            guard let url = URL(string: value), url.scheme == "https", url.host != nil,
                  url.user == nil, url.password == nil, url.query == nil, url.fragment == nil,
                  value.utf8.count <= 191 else { throw AssistantError.invalidEndpoint }
        }
        guard (1...30).contains(recordLimitSeconds), (32...512).contains(maxOutputTokens),
              (1_024...8_192).contains(historyBytes), (512...4_096).contains(replyBytes),
              !systemPrompt.isEmpty, systemPrompt.utf8.count <= 2_048,
              !voiceID.isEmpty, voiceID.utf8.count <= 95,
              !llmModel.isEmpty, llmModel.utf8.count <= 63,
              asrModel == "asr-1.0", ttsModel == "speech-2.8-turbo" else {
            throw AssistantError.invalidProfile
        }
    }

    /// 有密钥的线上包只存在内存中，不能作为导出数据或日志内容。
    func deviceData(secrets: AssistantSecrets) throws -> Data {
        try validate()
        try secrets.validate()
        let object: [String: Any] = [
            "schema": schema, "revision": revision,
            "minimax_base_url": minimaxBaseURL, "deepseek_base_url": deepseekBaseURL,
            "minimax_key": secrets.minimaxKey, "deepseek_key": secrets.deepseekKey,
            "llm_model": llmModel, "voice_id": voiceID, "system_prompt": systemPrompt,
            "record_limit_seconds": recordLimitSeconds, "max_output_tokens": maxOutputTokens,
            "history_bytes": historyBytes, "reply_bytes": replyBytes,
        ]
        let data = try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys])
        guard data.count <= 16_384 else { throw AssistantError.invalidProfile }
        return data
    }
}

nonisolated struct AssistantSecrets: Sendable {
    var minimaxKey: String
    var deepseekKey: String

    func validate() throws {
        guard !minimaxKey.isEmpty, !deepseekKey.isEmpty,
              minimaxKey.utf8.count <= 511, deepseekKey.utf8.count <= 255,
              !minimaxKey.contains(where: { $0.isNewline }),
              !deepseekKey.contains(where: { $0.isNewline }) else { throw AssistantError.missingKey }
    }
}

/// 所有错误只包含可展示的信息，不转存服务响应体，避免供应商回显请求中的凭据。
nonisolated enum AssistantError: LocalizedError, Equatable {
    case invalidEndpoint, invalidProfile, missingKey, noSpeech, emptyReply, incompleteStream
    case responseTooLarge, malformedAudio, cancelled, deviceUnavailable, upgradeRequired, deliveryUnknown
    case http(Int), provider(Int), device(String)

    var errorDescription: String? {
        switch self {
        case .invalidEndpoint: String(localized: "接口地址必须是有效的 HTTPS 地址，且不能包含凭据或查询参数。", bundle: .l10n)
        case .invalidProfile: String(localized: "助手配置超出设备支持范围，请检查模型、音色和长度限制。", bundle: .l10n)
        case .missingKey: String(localized: "请在本机填写有效的 MiniMax 和 DeepSeek API Key。", bundle: .l10n)
        case .noSpeech: String(localized: "没有检测到有效语音，请按住说话后重试。", bundle: .l10n)
        case .emptyReply: String(localized: "服务没有返回可用的回复。", bundle: .l10n)
        case .incompleteStream: String(localized: "回复流意外中断，本轮不会自动重发。", bundle: .l10n)
        case .responseTooLarge: String(localized: "回复超过安全长度限制，请缩短问题后重试。", bundle: .l10n)
        case .malformedAudio: String(localized: "语音返回格式无效，已停止播放。", bundle: .l10n)
        case .cancelled: String(localized: "已停止。", bundle: .l10n)
        case .deviceUnavailable: String(localized: "请先通过 USB 或已配对的 Wi-Fi 连接 Passport。", bundle: .l10n)
        case .upgradeRequired: String(localized: "设备未提供助手能力，请升级到本项目固件。", bundle: .l10n)
        case .deliveryUnknown: String(localized: "设备回执超时，结果未知；请重新查询状态，避免重复操作。", bundle: .l10n)
        case .http(let code): String(localized: "云服务请求失败（HTTP \(code)），请检查密钥、余额和网络。", bundle: .l10n)
        case .provider(let code): String(localized: "云服务返回错误（\(code)），请检查账户与配置。", bundle: .l10n)
        case .device(let code): String(localized: "设备拒绝操作：\(code)", bundle: .l10n)
        }
    }
}

/// 有界历史仅保留完整 user/assistant 对，失败和取消不会留下半轮对话。
nonisolated struct AssistantHistory: Sendable {
    struct Message: Codable, Equatable, Sendable {
        var role: String
        var content: String
    }
    private(set) var turns: [(user: String, assistant: String)] = []

    mutating func messages(system: String, user: String, limit: Int) throws -> [Message] {
        let fixed = system.utf8.count + user.utf8.count
        guard fixed <= limit else { throw AssistantError.responseTooLarge }
        while fixed + turns.reduce(0, { $0 + $1.user.utf8.count + $1.assistant.utf8.count }) > limit {
            turns.removeFirst()
        }
        return [.init(role: "system", content: system)] + turns.flatMap {
            [Message(role: "user", content: $0.user), Message(role: "assistant", content: $0.assistant)]
        } + [.init(role: "user", content: user)]
    }

    mutating func append(user: String, assistant: String) { turns.append((user, assistant)) }
    mutating func clear() { turns.removeAll(keepingCapacity: false) }
}
