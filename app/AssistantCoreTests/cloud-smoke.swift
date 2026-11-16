import Foundation
import AVFoundation

extension Bundle { static var l10n: Bundle { .main } }

/// 显式运行才调用收费API；只发送合成测试内容，凭据不进入参数、输出或报告。
@main struct AssistantCloudSmoke {
    @MainActor static func main() async throws {
        let arguments = CommandLine.arguments
        guard arguments.count == 2 || (arguments.count == 4 && arguments[2] == "--synthetic-realtime-asr-audio") else {
            fatalError("Usage: cloud-smoke REPORT.json [--synthetic-realtime-asr-audio FIXTURE.wav]")
        }
        let defaults = UserDefaults(suiteName: "local.folobutton.dev")!
        let store = AssistantStore(credentials: CredentialStore(), defaults: defaults)
        let secrets = store.secrets
        try secrets.validate()
        var profile = store.profile
        try profile.validate()
        profile.maxOutputTokens = 32
        let client = AssistantCloudClient()
        var report: [String: Any] = ["timestamp": ISO8601DateFormatter().string(from: Date()), "synthetic_content_only": true]
        var failed = false
        if ProcessInfo.processInfo.environment["ASR_ONLY"] != "1" {
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
        }
        if arguments.count == 4 {
            do {
                let result = try await testRealtimeASR(fileURL: URL(fileURLWithPath: arguments[3]), profile: profile, secrets: secrets)
                report["doubao_asr"] = result
                if result["ok"] as? Bool == true { print("Doubao streaming: PASS") }
                else { failed=true; print("Doubao streaming: FAIL") }
            } catch {
                // 不转存供应商error_message或文件路径；报告仅含稳定错误和计数。
                report["doubao_asr"] = ["ok": false, "error": "Streaming recognition did not complete"]
                failed = true; print("豆包 streaming: FAIL")
            }
        } else {
            report["doubao_asr"] = ["skipped": true, "reason": "No explicit synthetic audio fixture supplied"]
        }
        report["ok"] = !failed
        try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys]).write(to: URL(fileURLWithPath: arguments[1]), options: .atomic)
        if failed { exit(1) }
    }
    /// 以20ms采音节奏发送显式合成夹具；不把MiniMax朗读音频再自动上传到已取消的ASR接口。
    @MainActor private static func testRealtimeASR(fileURL: URL, profile: AssistantProfile, secrets: AssistantSecrets) async throws -> [String: Any] {
        try secrets.validateASR()
        let file = try AVAudioFile(forReading: fileURL)
        guard file.processingFormat.sampleRate > 0,
              Double(file.length) / file.processingFormat.sampleRate <= Double(profile.recordLimitSeconds),
              let buffer = AVAudioPCMBuffer(pcmFormat:file.processingFormat,frameCapacity:AVAudioFrameCount(file.length)) else {
            throw AssistantError.invalidProfile
        }
        try file.read(into:buffer)
        let samples = AudioConverter().convert(buffer)
        guard samples.count >= 4_000 else { throw AssistantError.noSpeech }
        let headers = SmokeASRHeaders()
        let session = try AssistantRecognitionFactory.make(profile:profile,secrets:secrets,onFrameHeader: { headers.append($0) })
        defer { session.cancel() }
        let progress = SmokeASRProgress()
        let started = Date()
        let events = Task {
            for await event in session.events {
                if progress.feeding { progress.updatesWhileFeeding += 1 }
                switch event {
                case .partial: progress.partials += 1
                case .final: progress.finals += 1
                case .failure(let message):
                    progress.failed = true
                    // 仅记录稳定协议stage与数字状态，不保存服务端说明或识别正文。
                    if let range = message.range(of:"\\[protocol:[a-z_]+\\]",options:.regularExpression) {
                        progress.failureStage = String(message[range])
                    }
                    progress.failureCodes = message.matches(of:/[0-9]{3,9}/).map { String($0.output) }
                }
            }
        }
        for offset in stride(from:0,to:samples.count,by:320) {
            try Task.checkCancellation()
            if progress.failed { break }
            session.feed(Array(samples[offset..<min(offset+320,samples.count)]))
            try await Task.sleep(for:.milliseconds(20))
        }
        progress.feeding = false
        let text = await session.finish()
        await events.value
        guard !progress.failed, !text.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty else {
            return ["ok":false,"stage":progress.failureStage,"codes":progress.failureCodes,"frame_headers":try headers.jsonValue(),
                    "partial_events":progress.partials,"sentence_final_events":progress.finals,
                    "updates_during_stream":progress.updatesWhileFeeding,"milliseconds":Int(Date().timeIntervalSince(started)*1000)]
        }
        return ["ok": true, "model": profile.asrModel, "audio_samples": samples.count,
                "partial_events": progress.partials, "sentence_final_events": progress.finals, "updates_during_stream": progress.updatesWhileFeeding,
                "transcript_characters": text.count, "milliseconds": Int(Date().timeIntervalSince(started)*1000)]
    }

}

/// 发送循环与事件consumer均在MainActor，使用引用状态避免捕获可变栈变量。
@MainActor private final class SmokeASRProgress {
    var failureStage="transport_or_no_speech",failureCodes:[String]=[]
    var failed=false,feeding=true
    var partials=0,finals=0,updatesWhileFeeding=0
}

/// 数字帧头用于协议诊断，不接收正文、音频、凭据或服务trace。
nonisolated private final class SmokeASRHeaders: @unchecked Sendable {
    private let lock=NSLock()
    private var frames:[VolcengineFrameHeader]=[]
    func append(_ value:VolcengineFrameHeader) { lock.withLock { frames.append(value); if frames.count > 32 { frames.removeFirst() } } }
    func jsonValue() throws -> Any {
        let values=lock.withLock { frames }
        return try JSONSerialization.jsonObject(with:JSONEncoder().encode(values))
    }
}
