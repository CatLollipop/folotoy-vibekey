import Foundation

/// 正式流式识别只构造一套豆包协议；设置试听、助手和显式live smoke共用。
nonisolated enum AssistantRecognitionFactory {
    static func make(profile: AssistantProfile, secrets: AssistantSecrets,
                     onFrameHeader: (@Sendable (VolcengineFrameHeader) -> Void)? = nil) throws -> any ASRSession {
        try profile.validate()
        try secrets.validateASR()
        guard let endpoint = URL(string: profile.asrWebSocketURL) else { throw AssistantError.invalidEndpoint }
        let options = ASROptions(purpose: .dictation, language: .auto, vocabulary: [])
        return StreamingCloudSession(purpose: .dictation, serviceName: "豆包") {
            VolcengineCodec(apiKey: secrets.asrKey, resourceID: profile.asrResourceID,
                            options: options, endpointURL: endpoint, onFrameHeader:onFrameHeader)
        }
    }
}
