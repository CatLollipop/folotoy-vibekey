import Foundation

// 独立测试不加载应用语言状态，产品仍使用真实 Localization.swift。
extension Bundle { static var l10n: Bundle { .main } }

@main struct AssistantCoreTests {
    static func expect(_ condition: @autoclosure () throws -> Bool, _ message: String) throws {
        guard try condition() else { fatalError(message) }
    }
    static func rejects(_ operation: () throws -> Void) {
        do { try operation(); fatalError("Expected rejection") } catch {}
    }

    @MainActor static func main() async throws {
        var parser = AssistantCompletionParser(limit: 32)
        try expect(try parser.consume(line: "data: {\"choices\":[{\"delta\":{\"content\":\"你好\"},\"finish_reason\":null}]}"), "Chinese delta")
        try expect(try !parser.consume(line: ": keep-alive"), "SSE comment")
        _ = try parser.consume(line: "data: {\"choices\":[{\"delta\":{},\"finish_reason\":\"stop\"}],\"usage\":{\"prompt_tokens\":12,\"completion_tokens\":2}}")
        rejects { _ = try parser.result() }
        _ = try parser.consume(line: "data: [DONE]")
        let result = try parser.result()
        try expect(result.text == "你好" && result.inputTokens == 12 && !result.truncated, "Final content/usage")
        for reason in ["content_filter", "tool_calls", "unexpected"] {
            var rejected = AssistantCompletionParser(limit: 128)
            _ = try rejected.consume(line: "data: {\"choices\":[{\"delta\":{\"content\":\"partial\"},\"finish_reason\":\"\(reason)\"}]}")
            _ = try rejected.consume(line: "data: [DONE]")
            rejects { _ = try rejected.result() }
        }
        var limited = AssistantCompletionParser(limit: 2)
        rejects { _ = try limited.consume(line: "data: {\"choices\":[{\"delta\":{\"content\":\"你\"}}]}") }
        var reasoning = AssistantCompletionParser(limit: 128)
        _ = try reasoning.consume(line: "data: {\"choices\":[{\"delta\":{\"reasoning_content\":\"private reasoning\"}}]}")
        try expect(reasoning.text.isEmpty, "Reasoning must not enter TTS")
        rejects { _ = try reasoning.consume(line: "data: {\"error\":{\"message\":\"not logged\"}}") }
        try expect(try AssistantHex.decode("00ff80AB") == Data([0,255,128,171]), "Hex decoding")
        rejects { _ = try AssistantHex.decode("abc") }
        rejects { _ = try AssistantHex.decode("0g") }

        var history = AssistantHistory()
        history.append(user: "old user", assistant: "old answer")
        history.append(user: "近", assistant: "好")
        let messages = try history.messages(system: "s", user: "u", limit: 8)
        try expect(messages.map(\.content) == ["s","近","好","u"], "Trim whole UTF-8 turns")
        rejects { _ = try history.messages(system: "long system", user: "u", limit: 2) }

        let profile = AssistantProfile()
        try profile.validate()
        let wire = try profile.deviceData(secrets: .init(minimaxKey: "test-minimax", deepseekKey: "test-deepseek"))
        let object = try JSONSerialization.jsonObject(with: wire) as! [String: Any]
        try expect(object["llm_model"] as? String == "deepseek-flash", "Low-price model")
        let exported = String(decoding: try JSONEncoder().encode(profile), as: UTF8.self)
        try expect(!exported.contains("test-minimax") && !exported.contains("minimax_key"), "Public config cannot leak keys")
        var bad = profile; bad.minimaxBaseURL = "http://example.invalid"
        rejects { try bad.validate() }
        bad = profile; bad.systemPrompt = String(repeating: "中", count: 700)
        rejects { try bad.validate() }
        let request = try AssistantCloudClient.request(base: "https://example.invalid/v1", path: "speech_to_text", key: "fixture")
        try expect(request.url?.path == "/v1/speech_to_text", "Endpoint joining")
        for base in ["https://example.invalid/v1", "https://example.invalid/v1/"] {
            let joined = try AssistantCloudClient.request(base: base, path: "v1/t2a_v2", key: "fixture")
            try expect(joined.url?.path == "/v1/t2a_v2", "MiniMax version prefix is not duplicated")
        }
        let gateway = try AssistantCloudClient.request(base: "https://example.invalid/gateway/v1", path: "v1/speech_to_text", key: "fixture")
        try expect(gateway.url?.path == "/gateway/v1/speech_to_text", "Gateway prefix is preserved")
        rejects { _ = try AssistantCloudClient.request(base: "https://example.invalid?key=fixture", path: "v1/t2a_v2", key: "fixture") }
        let wav = AudioFormats.wav([0,1,-1])
        try expect(wav.count == 50 && String(decoding: wav.prefix(4), as: UTF8.self) == "RIFF", "WAV container")

        let directory = FileManager.default.temporaryDirectory.appending(path: "assistant-tests-" + UUID().uuidString)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: directory) }
        let suite = "assistant-test-" + UUID().uuidString
        let defaults = UserDefaults(suiteName: suite)!
        defer { defaults.removePersistentDomain(forName: suite) }
        let store = AssistantStore(credentials: CredentialStore(url: directory.appending(path: "credentials.json")), defaults: defaults)
        store.minimaxKey = "fixture"; store.deepseekKey = "fixture"; store.profile.autoSpeakReplies = false
        let source = FakeAudioSource()
        let controller = AssistantController(store: store, service: DelayedCloudFixture(), makeSource: { source })
        controller.send(text: "old")
        try await Task.sleep(for: .milliseconds(10))
        controller.send(text: "new")
        try await Task.sleep(for: .milliseconds(120))
        try expect(controller.reply == "new reply" && controller.phase == .completed, "Late cancelled callback must not overwrite new turn")
        controller.send(text: "old")
        try await Task.sleep(for: .milliseconds(10))
        controller.speakApplicationReply("current app reply")
        try await Task.sleep(for: .milliseconds(120))
        try expect(controller.reply == "current app reply" && controller.phase == .completed, "Silent app reply must cancel old generation too")
        controller.beginRecording()
        controller.endRecording()
        try expect(controller.phase == .failed, "Empty recording must not submit a cloud request")
        controller.newConversation()
        try expect(controller.reply.isEmpty && controller.phase == .idle, "New conversation clears UI and history")
        try await testApplicationOutcomes(store: store)
        print("Assistant core tests: PASS (SSE, hex, history, config, WAV, cancellation/generation, application terminal/receipt/reply order, playback isolation)")
    }

    @MainActor static func until(_ condition: () -> Bool) async throws {
        for _ in 0..<100 {
            if condition() { return }
            try await Task.sleep(for:.milliseconds(2))
        }
        fatalError("Timed out waiting for fixture state")
    }
    @MainActor static func testApplicationOutcomes(store: AssistantStore) async throws {
        let audio = ControlledAudioPlayer()
        let app = AssistantController(store:store,service:DelayedCloudFixture(),player:audio,makeSource:{FakeAudioSource()})
        app.destination = .application
        app.sendToApplication = { _ in try await Task.sleep(for:.milliseconds(30)) }
        app.send(text:"failure before receipt")
        try await until { app.phase == .thinking }
        app.finishApplicationTurn(.failed)
        try expect(app.phase == .thinking,"Terminal state bypassed original application admission receipt")
        try await until { app.phase == .failed }
        try expect(app.error != nil,"Real task failure did not end waiting with an explanation")

        app.send(text:"no reply")
        try await until { app.phase == .replying }
        app.finishApplicationTurn(.completed)
        try expect(app.phase == .completed && !app.isBusy,"Completed task without a reply kept the assistant busy forever")

        app.send(text:"stop before receipt")
        try await until { app.phase == .thinking }
        app.finishApplicationTurn(.stopped)
        try await until { app.phase == .stopped }
        try expect(!app.isBusy,"Original stopped event did not end the applied application turn")

        // 与Coordinator相同的顺序：最终正文先到，终态先暂存，applied后才播放最终正文。
        app.onPhase = { phase in if phase == .replying { app.speakApplicationReply("final before receipt") } }
        app.send(text:"fast final")
        try await until { app.phase == .thinking }
        app.finishApplicationTurn(.completed)
        try await until { app.phase == .completed }
        try expect(app.reply == "final before receipt","Pending terminal state overwrote an early final reply")
        app.onPhase = nil

        store.profile.autoSpeakReplies = true
        app.speakApplicationReply("read current final")
        try await until { audio.started && app.phase == .speaking }
        let stops = audio.stopCount
        app.finishApplicationTurn(.completed); app.finishApplicationTurn(.stopped); app.finishApplicationTurn(.failed)
        try expect(app.phase == .speaking && audio.stopCount == stops,"Terminal event interrupted a final reply already being read aloud")
        audio.finish()
        try await until { app.phase == .completed }
        store.profile.autoSpeakReplies = false
    }
}

/// 不打开音频设备；让测试控制真实Controller何时从speaking恢复，检验终态不会截断播放。
@MainActor private final class ControlledAudioPlayer: AssistantAudioPlaying {
    var started = false
    var stopCount = 0
    private var continuation: CheckedContinuation<Void, Error>?
    func play(_ stream: AsyncThrowingStream<Data, Error>) async throws {
        started = true
        try await withCheckedThrowingContinuation { continuation = $0 }
    }
    func stop() { stopCount += 1; started = false; continuation?.resume(throwing:CancellationError()); continuation = nil }
    func finish() { continuation?.resume(); continuation = nil }
}

nonisolated private final class FakeAudioSource: AudioSource, @unchecked Sendable {
    var onSamples: (@Sendable ([Float]) -> Void)?
    func start() throws {}
    func stop() {}
}

/// 故意忽略一次取消，模拟已在队列中的迟到网络回调。
nonisolated private struct DelayedCloudFixture: AssistantCloudServing {
    func transcribe(samples: [Float], profile: AssistantProfile, secrets: AssistantSecrets) async throws -> String { "fixture" }
    func complete(messages: [AssistantHistory.Message], profile: AssistantProfile, secrets: AssistantSecrets,
                  onText: @Sendable @escaping (String) async -> Void) async throws -> AssistantCompletion {
        let user = messages.last!.content
        try? await Task.sleep(for: .milliseconds(user == "old" ? 80 : 5))
        await onText(user + " reply")
        return .init(text: user + " reply", truncated: false, inputTokens: 1, outputTokens: 1)
    }
    func speech(text: String, profile: AssistantProfile, secrets: AssistantSecrets) -> AsyncThrowingStream<Data, Error> {
        AsyncThrowingStream { $0.finish() }
    }
}
