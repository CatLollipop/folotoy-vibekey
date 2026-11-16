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
        let wire = try profile.deviceData(secrets: .init(minimaxKey: "test-minimax", deepseekKey: "test-deepseek", asrKey:"test-doubao"))
        let object = try JSONSerialization.jsonObject(with: wire) as! [String: Any]
        try expect(object["llm_model"] as? String == "deepseek-flash", "Low-price model")
        try expect(object["asr_provider"] as? String == "volcengine_doubao_realtime" &&
                   object["asr_resource_id"] as? String == profile.asrResourceID &&
                   object["asr_key"] as? String == "test-doubao", "Device receives selected realtime provider")
        let legacy = Data(#"{"schema":1,"revision":7,"voiceID":"preserved-voice","minimaxBaseURL":"https://example.invalid/v1","autoSpeakReplies":false}"#.utf8)
        let migrated = try JSONDecoder().decode(AssistantProfile.self, from: legacy)
        try expect(migrated.schema == 2 && migrated.asrProvider == "volcengine_doubao_realtime" &&
                   migrated.voiceID == "preserved-voice" && migrated.revision == 7 && !migrated.autoSpeakReplies,
                   "Migration preserves TTS and conversation preferences while replacing cancelled ASR")
        for endpoint in ["ws://example.invalid", "wss://key@example.invalid", "wss://example.invalid?key=fixture"] {
            var invalid = profile; invalid.asrWebSocketURL = endpoint
            rejects { try invalid.validate() }
        }
        for resource in ["", "bad\nresource", String(repeating:"x",count:128)] {
            var invalid = profile; invalid.asrResourceID = resource
            rejects { try invalid.validate() }
        }
        let exported = String(decoding: try JSONEncoder().encode(profile), as: UTF8.self)
        try expect(!exported.contains("test-minimax") && !exported.contains("minimax_key"), "Public config cannot leak keys")
        var bad = profile; bad.minimaxBaseURL = "http://example.invalid"
        rejects { try bad.validate() }
        bad = profile; bad.systemPrompt = String(repeating: "中", count: 700)
        rejects { try bad.validate() }
        let request = try AssistantCloudClient.request(base: "https://example.invalid/v1", path: "t2a_v2", key: "fixture")
        try expect(request.url?.path == "/v1/t2a_v2", "Endpoint joining")
        for base in ["https://example.invalid/v1", "https://example.invalid/v1/"] {
            let joined = try AssistantCloudClient.request(base: base, path: "v1/t2a_v2", key: "fixture")
            try expect(joined.url?.path == "/v1/t2a_v2", "MiniMax version prefix is not duplicated")
        }
        let gateway = try AssistantCloudClient.request(base: "https://example.invalid/gateway/v1", path: "v1/t2a_v2", key: "fixture")
        try expect(gateway.url?.path == "/gateway/v1/t2a_v2", "Gateway prefix is preserved")
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
        let sharedCredentials = CredentialStore(url: directory.appending(path: "shared-credentials.json"))
        sharedCredentials.set("shared-doubao-fixture", for: "cloud.volcengine.apiKey")
        defaults.set("volc.bigasr.sauc.duration", forKey:"cloud.volcengine.model")
        let sharedStore = AssistantStore(credentials:sharedCredentials,defaults:defaults)
        try expect(sharedStore.asrKey == "shared-doubao-fixture" && sharedStore.profile.asrResourceID == "volc.bigasr.sauc.duration",
                   "Assistant reuses the user's selected Doubao credentials and resource")
        defaults.removeObject(forKey:"cloud.volcengine.model")
        store.minimaxKey = "fixture"; store.deepseekKey = "fixture"; store.asrKey = "fixture"; store.profile.autoSpeakReplies = false
        let source = FakeAudioSource()
        let controller = AssistantController(store: store, service: DelayedCloudFixture(), makeRecognition:{_,_ in ControlledRecognitionSession()}, makeSource: { source })
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
        try await testStreamingRecognition(store: store)
        try await testOfficialFunASRCompletion()
        try VolcengineCodecContracts.run()
        try await testOfficialDoubaoCompletion()
        try await testCancellationBeforeRequest(store:store)
        print("Assistant core tests: PASS (SSE, hex, history, config, WAV, application ordering, playback isolation, recording-time ASR, finish drain/failure/cancel/generation)")
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
        let app = AssistantController(store:store,service:DelayedCloudFixture(),player:audio,makeRecognition:{_,_ in ControlledRecognitionSession()},makeSource:{FakeAudioSource()})
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

    @MainActor static func testStreamingRecognition(store: AssistantStore) async throws {
        store.profile.autoSpeakReplies = false
        let source = FakeAudioSource()
        let initial = ControlledRecognitionSession(result:"第一句。第二句。",tail:[.final("第二句。")],delay:.milliseconds(25))
        var sessions = [initial]
        var constructions = 0
        let app = AssistantController(store:store,service:DelayedCloudFixture(),player:ControlledAudioPlayer(),makeRecognition:{_,_ in
            constructions += 1
            return sessions.removeFirst()
        },makeSource:{source})
        app.destination = .application
        var submitted:[String] = []
        var captions:[(String,Bool)] = []
        app.sendToApplication = { submitted.append($0) }
        app.onTranscript = { captions.append(($0,$1)) }
        app.beginRecording()
        try expect(constructions == 1 && app.phase == .recording,"Recognition was not created when recording began")
        source.emit([Float](repeating:0.02,count:4_800))
        try expect(initial.sampleCount == 4_800 && initial.finishCount == 0,"PCM was buffered until release instead of fed while recording")
        initial.emit(.partial("第一")); try await until { app.transcript == "第一" }
        initial.emit(.final("第一句。")); initial.emit(.partial("第二"))
        try await until { app.transcript == "第一句。第二" }
        try expect(submitted.isEmpty && !captions.contains(where:{$0.1}),"Sentence final prematurely froze captions or submitted the conversation")
        app.endRecording()
        try expect(app.phase == .transcribing,"Release did not wait for full ASR completion")
        try await until { submitted.count == 1 }
        try expect(submitted == ["第一句。第二句。"] && app.transcript == "第一句。第二句。","Tail sentence was lost before routing")
        try expect(captions.filter(\.1).map(\.0) == ["第一句。第二句。"],"Whole-session final was not emitted exactly once after finish")

        let failed = ControlledRecognitionSession();sessions.append(failed)
        app.beginRecording();source.emit([Float](repeating:0.02,count:4_800));failed.emit(.failure("fixture recognition failure"))
        try await until { app.phase == .failed }
        let samples = failed.sampleCount;source.emit([Float](repeating:0.02,count:320))
        try expect(failed.cancelCount > 0 && failed.sampleCount == samples && submitted.count == 1,"Failure did not stop microphone/ASR feed or incorrectly routed text")

        let failedAtFinish = ControlledRecognitionSession(result:"must not submit",tail:[.failure("fixture finish failure")])
        sessions.append(failedAtFinish);app.beginRecording();source.emit([Float](repeating:0.02,count:4_800));app.endRecording()
        try await until { app.phase == .failed }
        try expect(submitted.count == 1 && captions.filter(\.1).count == 1,"Failure queued during finish was missed before final/route")

        let old = ControlledRecognitionSession(result:"stale old recognition",tail:[.final("stale old recognition")],delay:.milliseconds(70),ignoreCancel:true)
        let fresh = ControlledRecognitionSession(result:"新会话",tail:[.final("新会话")])
        sessions += [old,fresh]
        app.beginRecording();source.emit([Float](repeating:0.02,count:4_800));app.endRecording()
        try await until { old.finishCount == 1 }
        app.beginRecording();source.emit([Float](repeating:0.02,count:4_800));fresh.emit(.partial("新"))
        try await until { app.transcript == "新" };app.endRecording()
        try await until { submitted.count == 2 }
        try await Task.sleep(for:.milliseconds(90))
        try expect(submitted == ["第一句。第二句。","新会话"] && app.transcript == "新会话" && old.cancelCount > 0,"Cancelled recognition changed a newer turn")

        let silent = ControlledRecognitionSession(result:"silence must not route");sessions.append(silent)
        app.beginRecording();source.emit([Float](repeating:0,count:4_800));app.endRecording()
        try expect(app.phase == .failed && silent.finishCount == 0 && silent.cancelCount > 0 && submitted.count == 2,"Silence gate no longer rejects empty recordings")

        store.profile.recordLimitSeconds = 1
        let capped = ControlledRecognitionSession(result:"录音上限",tail:[.final("录音上限")]);sessions.append(capped)
        app.beginRecording();source.emit([Float](repeating:0.02,count:17_000))
        try await until { submitted.count == 3 }
        try expect(capped.sampleCount == 16_000 && capped.finishCount == 1,"Recording cap leaked extra PCM or finished more than once")
        store.profile.recordLimitSeconds = 30
        app.cancel()
    }

    @MainActor static func testOfficialFunASRCompletion() async throws {
        for mode in FunASRTransportFixture.Completion.allCases {
            let transport = FunASRTransportFixture(mode:mode)
            let timing = CloudStreamTiming(readyTimeout:.milliseconds(100),finishTimeout:.milliseconds(40))
            let options = ASROptions(purpose:.dictation,language:.auto,vocabulary:[])
            let session = StreamingCloudSession(purpose:.dictation,serviceName:"Fun-ASR fixture",timing:timing,connectionFactory:transport) {
                BailianCodec(apiKey:"fixture",model:"fun-asr-realtime",region:.mainland,options:options)
            }
            let events = Task { var all:[TranscriptEvent]=[];for await event in session.events { all.append(event) };return all }
            session.feed([Float](repeating:0.01,count:4_800))
            let text = await session.finish(), collected = await events.value
            try expect(transport.audioMessages > 0,"Official pump did not stream binary PCM")
            let failures = collected.filter { if case .failure = $0 { return true };return false }
            if mode == .confirmed || mode == .closeCallbackBeforeQueuedFinal {
                try expect(text == "完整定稿" && failures.isEmpty,"Official task-finished did not complete the streaming session")
            } else {
                try expect(!failures.isEmpty,"Missing task-finished/early close silently returned a partial as successful final")
            }
        }
    }
    @MainActor static func testOfficialDoubaoCompletion() async throws {
        for mode in VolcengineTransportFixture.Completion.allCases {
            let transport = VolcengineTransportFixture(mode:mode)
            let timing = CloudStreamTiming(readyTimeout:.milliseconds(100),finishTimeout:.milliseconds(40))
            let options = ASROptions(purpose:.dictation,language:.auto,vocabulary:[])
            let session = StreamingCloudSession(purpose:.dictation,serviceName:"Doubao fixture",timing:timing,connectionFactory:transport) {
                VolcengineCodec(apiKey:"fixture",resourceID:"volc.seedasr.sauc.duration",options:options)
            }
            let events = Task { var all:[TranscriptEvent]=[];for await event in session.events { all.append(event) };return all }
            session.feed([Float](repeating:0.01,count:4_800))
            let text = await session.finish(), collected = await events.value
            try expect(transport.audioMessages > 0,"Official pump did not stream binary PCM")
            let failures = collected.filter { if case .failure = $0 { return true };return false }
            if mode == .confirmed || mode == .closeCallbackBeforeQueuedFinal || mode == .noInitialResponse {
                try expect(text == "完整定稿" && failures.isEmpty,"Official final frame did not complete the streaming session")
            } else {
                try expect(!failures.isEmpty,"Missing final frame/early close silently returned a partial as successful final")
            }
        }
    }
    @MainActor static func testCancellationBeforeRequest(store:AssistantStore) async throws {
        let cloud=CountingCloudFixture(),audio=ControlledAudioPlayer()
        let app=AssistantController(store:store,service:cloud,player:audio,makeRecognition:{_,_ in ControlledRecognitionSession()},makeSource:{FakeAudioSource()})
        app.send(text:"cancel before task starts");app.send(text:"latest")
        try await until { app.phase == .completed }
        try expect(cloud.requests == ["latest"],"A canceled queued operation still started a cloud request")
        app.onPhase = { phase in if phase == .thinking { app.cancel() } }
        app.send(text:"cancel in phase callback")
        try await until { app.phase == .stopped }
        try expect(cloud.requests == ["latest"],"A phase callback canceled the turn but the request was still sent")
        app.onPhase=nil
        store.profile.autoSpeakReplies=true
        app.speakApplicationReply("cancel queued speech");app.cancel()
        try await Task.sleep(for:.milliseconds(10))
        try expect(cloud.speechCalls == 0 && !audio.started,"Canceled queued speech still opened the player/TTS service")
        store.profile.autoSpeakReplies=false
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
    func emit(_ samples:[Float]) { onSamples?(samples) }
}

/// 只有ASR接口替身；测试生产Controller从采音到实时事件/finish/取消的完整调用链。
nonisolated private final class ControlledRecognitionSession: ASRSession, @unchecked Sendable {
    let events: AsyncStream<TranscriptEvent>
    private let continuation: AsyncStream<TranscriptEvent>.Continuation
    private let lock = NSLock()
    private var samples = 0, finishes = 0, cancels = 0
    private let result: String
    private let tail: [TranscriptEvent]
    private let delay: Duration
    private let ignoreCancel: Bool
    init(result:String = "fixture",tail:[TranscriptEvent] = [],delay:Duration = .zero,ignoreCancel:Bool = false) {
        (events,continuation) = AsyncStream.makeStream(of:TranscriptEvent.self)
        self.result=result;self.tail=tail;self.delay=delay;self.ignoreCancel=ignoreCancel
    }
    var sampleCount:Int { lock.withLock{samples} }
    var finishCount:Int { lock.withLock{finishes} }
    var cancelCount:Int { lock.withLock{cancels} }
    func emit(_ event:TranscriptEvent) { continuation.yield(event) }
    func feed(_ values:[Float]) { lock.withLock{samples += values.count} }
    func finish() async -> String {
        lock.withLock{finishes += 1}
        // 故意允许一次迟到回调，证明Controller确实通过generation隔离旧轮。
        try? await Task.sleep(for:delay)
        for event in tail { continuation.yield(event) }
        continuation.finish();return result
    }
    func cancel() { lock.withLock{cancels += 1};if !ignoreCancel { continuation.finish() } }
}

/// 故意忽略一次取消，模拟已在队列中的迟到网络回调。
nonisolated private struct DelayedCloudFixture: AssistantCloudServing {
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

nonisolated private final class CountingCloudFixture: AssistantCloudServing, @unchecked Sendable {
    private let lock=NSLock()
    private var values:[String]=[]
    private var speeches=0
    var requests:[String] { lock.withLock{values} }
    var speechCalls:Int { lock.withLock{speeches} }
    func complete(messages:[AssistantHistory.Message],profile:AssistantProfile,secrets:AssistantSecrets,
                  onText:@Sendable @escaping(String) async -> Void) async throws -> AssistantCompletion {
        let text=messages.last!.content;lock.withLock{values.append(text)}
        await onText(text);return .init(text:text,truncated:false,inputTokens:1,outputTokens:1)
    }
    func speech(text:String,profile:AssistantProfile,secrets:AssistantSecrets) -> AsyncThrowingStream<Data,Error> {
        lock.withLock{speeches += 1};return AsyncThrowingStream{$0.finish()}
    }
}
