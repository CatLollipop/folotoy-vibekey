import Foundation

extension Bundle { static var l10n: Bundle { .main } }

/// 显式运行才调用收费API；只发送合成测试内容，凭据不进入参数、输出或报告。
@main struct AssistantCloudSmoke {
    @MainActor static func main() async throws {
        guard CommandLine.arguments.count == 2 else { fatalError("Usage: cloud-smoke REPORT.json") }
        let credentials = CredentialStore()
        let secrets = AssistantSecrets(minimaxKey: credentials.value(for: "assistant.minimaxKey") ?? "",
                                       deepseekKey: credentials.value(for: "assistant.deepseekKey") ?? "")
        try secrets.validate()
        let defaults = UserDefaults(suiteName: "local.folobutton.dev")!
        var profile = defaults.data(forKey: "assistant.profile").flatMap { try? JSONDecoder().decode(AssistantProfile.self, from: $0) } ?? AssistantProfile()
        try profile.validate()
        profile.maxOutputTokens = 32
        let client = AssistantCloudClient()
        var report: [String: Any] = ["timestamp": ISO8601DateFormatter().string(from: Date()), "synthetic_content_only": true]
        var failed = false
        do {
            let start = Date()
            let result = try await client.complete(messages: [.init(role: "user", content: "只回复：连接成功")], profile: profile, secrets: secrets, onText: { _ in })
            report["deepseek"] = ["ok": true, "model": profile.llmModel, "response": result.text,
                "milliseconds": Int(Date().timeIntervalSince(start) * 1000), "input_tokens": result.inputTokens, "output_tokens": result.outputTokens]
            print("DeepSeek: PASS")
        } catch { report["deepseek"] = ["ok": false, "error": error.localizedDescription]; failed = true; print("DeepSeek: FAIL") }
        var pcm = Data()
        do {
            let start = Date()
            for try await chunk in client.speech(text: "你好，我是AI助理。", profile: profile, secrets: secrets) {
                guard pcm.count + chunk.count <= 320_000 else { throw AssistantError.responseTooLarge }
                pcm.append(chunk)
            }
            guard !pcm.isEmpty, pcm.count.isMultiple(of: 2) else { throw AssistantError.malformedAudio }
            report["minimax_tts"] = ["ok": true, "model": profile.ttsModel, "bytes": pcm.count,
                "pcm_seconds_at_16k_s16le": Double(pcm.count) / 32_000,
                "milliseconds": Int(Date().timeIntervalSince(start) * 1000)]
            print("MiniMax TTS: PASS")
        } catch { report["minimax_tts"] = ["ok": false, "error": error.localizedDescription]; failed = true; print("MiniMax TTS: FAIL") }
        if !pcm.isEmpty {
            do {
                let start = Date()
                let samples: [Float] = pcm.withUnsafeBytes { (bytes: UnsafeRawBufferPointer) in
                    var values = [Float](); values.reserveCapacity(pcm.count / 2)
                    for i in 0..<(pcm.count / 2) {
                        let low = UInt16(bytes[2 * i])
                        let high = UInt16(bytes[2 * i + 1]) << 8
                        let sample = Int16(bitPattern: low | high)
                        values.append(Float(sample) / 32_768)
                    }
                    return values
                }
                let text = try await client.transcribe(samples: samples, profile: profile, secrets: secrets)
                let valid = text.contains("你好") && (text.contains("助理") || text.contains("助手"))
                report["minimax_asr"] = ["ok": valid, "model": profile.asrModel, "synthetic_transcript": text,
                    "milliseconds": Int(Date().timeIntervalSince(start) * 1000)]
                if !valid { failed = true }
                print(valid ? "MiniMax ASR / PCM round-trip: PASS" : "MiniMax ASR / PCM round-trip: FAIL")
            } catch { report["minimax_asr"] = ["ok": false, "error": error.localizedDescription]; failed = true; print("MiniMax ASR: FAIL") }
        }
        report["ok"] = !failed
        try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys]).write(to: URL(fileURLWithPath: CommandLine.arguments[1]), options: .atomic)
        if failed { exit(1) }
    }
}
