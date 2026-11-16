import Foundation

/// MiniMax使用原生speech_to_text，不复用OpenAI转写URL；仍走统一分段/取消链路。
nonisolated struct MiniMaxASRDecoder: SegmentDecoder {
    let baseURL: String
    let apiKey: String
    let partialInterval = Double.infinity
    let maxWholeSeconds = 30.0
    let prefersWholeDictation = true
    func decode(_ samples: [Float], options: ASROptions) async throws -> String {
        guard samples.count >= 4_000 else { return "" }
        var profile = AssistantProfile(); profile.minimaxBaseURL = baseURL
        do {
            return try await AssistantCloudClient().transcribe(samples: samples, profile: profile,
                secrets: .init(minimaxKey: apiKey, deepseekKey: ""))
        } catch AssistantError.noSpeech { return "" }
    }
}
