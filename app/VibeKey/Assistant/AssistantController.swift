import Foundation
import Observation

nonisolated enum AssistantPhase: String, Sendable {
    case idle, recording, transcribing, thinking, replying, speaking, completed, stopped, failed
}

/// 每次操作都有 generation；旧网络、音频和事件回调不能改变新一轮会话。
@MainActor @Observable final class AssistantController {
    enum Destination: String, CaseIterable { case cloud, application }
    enum ApplicationTurnOutcome { case completed, stopped, failed }
    var destination: Destination = .cloud
    private(set) var phase: AssistantPhase = .idle
    private(set) var transcript = ""
    private(set) var reply = ""
    private(set) var error: String?
    private(set) var truncated = false
    private(set) var inputTokens = 0
    private(set) var outputTokens = 0
    var isRecording: Bool { phase == .recording }
    var isBusy: Bool { ![.idle, .completed, .stopped, .failed].contains(phase) }
    @ObservationIgnored var onPhase: ((AssistantPhase) -> Void)?
    @ObservationIgnored var willRecord: (() -> Void)?
    @ObservationIgnored var sendToApplication: ((String) async throws -> Void)?
    @ObservationIgnored private let store: AssistantStore
    @ObservationIgnored private let service: any AssistantCloudServing
    @ObservationIgnored private let makeSource: () -> any AudioSource
    @ObservationIgnored private let player: any AssistantAudioPlaying
    @ObservationIgnored private var source: (any AudioSource)?
    @ObservationIgnored private var capture: AssistantCaptureBuffer?
    @ObservationIgnored private var captureDestination: Destination?
    @ObservationIgnored private var operation: Task<Void, Never>?
    @ObservationIgnored private var timer: Task<Void, Never>?
    @ObservationIgnored private var generation = UUID()
    @ObservationIgnored private var history = AssistantHistory()
    @ObservationIgnored private var applicationWaiting = false
    @ObservationIgnored private var awaitingApplicationReceipt = false
    @ObservationIgnored private var pendingApplicationOutcome: ApplicationTurnOutcome?

    init(store: AssistantStore, service: any AssistantCloudServing = AssistantCloudClient(),
         player: any AssistantAudioPlaying = AssistantPCMPlayer(),
         makeSource: @escaping () -> any AudioSource) {
        self.store = store; self.service = service; self.player = player; self.makeSource = makeSource
    }

    func beginRecording(using override: (any AudioSource)? = nil) {
        cancel()
        do {
            willRecord?()
            try store.profile.validate()
            guard !store.secrets.minimaxKey.isEmpty else { throw AssistantError.missingKey }
            transcript = ""; reply = ""; error = nil; truncated = false
            let token = generation
            let buffer = AssistantCaptureBuffer(limit: store.profile.recordLimitSeconds * 16_000)
            let source = override ?? makeSource()
            source.onSamples = { [weak self] samples in
                if buffer.append(samples) {
                    Task { @MainActor in
                        guard let self, self.generation == token, self.isRecording else { return }
                        self.endRecording()
                    }
                }
            }
            self.capture = buffer; self.source = source
            captureDestination = destination
            try source.start()
            setPhase(.recording)
            timer = Task { [weak self] in
                try? await Task.sleep(for: .seconds(self?.store.profile.recordLimitSeconds ?? 30))
                guard !Task.isCancelled, let self, self.generation == token else { return }
                self.endRecording()
            }
        } catch { fail(error) }
    }

    func endRecording() {
        guard isRecording else { return }
        timer?.cancel(); timer = nil
        source?.stop(); source = nil
        let samples = capture?.take() ?? []
        capture = nil
        guard samples.count >= 4_000,
              samples.contains(where: { abs($0) > 0.003 }) else { fail(AssistantError.noSpeech); return }
        let token = generation
        let profile = store.profile
        let secrets = store.secrets
        let destination = captureDestination ?? self.destination
        captureDestination = nil
        setPhase(.transcribing)
        operation = Task { [weak self] in
            guard let self else { return }
            do {
                let text = try await service.transcribe(samples: samples, profile: profile, secrets: secrets)
                try check(token)
                transcript = text
                try await route(text, destination: destination, profile: profile, secrets: secrets, token: token)
            } catch { if generation == token, !Task.isCancelled { fail(error) } }
        }
    }

    func send(text: String) {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        cancel()
        let token = generation
        transcript = value; reply = ""; error = nil; truncated = false
        let profile = store.profile
        let secrets = store.secrets
        let destination = destination
        operation = Task { [weak self] in
            guard let self else { return }
            do {
                try profile.validate()
                try await route(value, destination: destination, profile: profile, secrets: secrets, token: token)
            } catch { if generation == token, !Task.isCancelled { fail(error) } }
        }
    }

    private func route(_ text: String, destination: Destination, profile: AssistantProfile, secrets: AssistantSecrets, token: UUID) async throws {
        if destination == .application {
            guard let sendToApplication else { throw AssistantError.device("application_not_selected") }
            applicationWaiting = true; awaitingApplicationReceipt = true
            setPhase(.thinking)
            try await sendToApplication(text)
            try check(token)
            awaitingApplicationReceipt = false
            // accepted 是投递状态，不是 agent 完成；完成由原会话的正式事件驱动。
            setPhase(.replying)
            // final回复可在onPhase中开始播放并更换generation，此时不能让稍早的终态截断它。
            if generation == token, let pending = pendingApplicationOutcome { finishApplicationTurn(pending) }
            return
        }
        try secrets.validate()
        let messages = try history.messages(system: profile.systemPrompt, user: text, limit: profile.historyBytes)
        setPhase(.thinking)
        let result = try await service.complete(messages: messages, profile: profile, secrets: secrets) { [weak self] text in
            await self?.updateReply(text, token: token)
        }
        try check(token)
        reply = result.text; truncated = result.truncated
        inputTokens = result.inputTokens; outputTokens = result.outputTokens
        history.append(user: text, assistant: result.text)
        if profile.autoSpeakReplies {
            setPhase(.speaking)
            try await player.play(service.speech(text: result.text, profile: profile, secrets: secrets))
            try check(token)
        }
        setPhase(.completed)
    }

    /// 原任务终止但没有正文也要结束等待；回执之前暂存，朗读期间不取消已经播放的最终回复。
    func finishApplicationTurn(_ outcome: ApplicationTurnOutcome) {
        guard applicationWaiting, phase == .thinking || phase == .replying else { return }
        if awaitingApplicationReceipt { pendingApplicationOutcome = outcome; return }
        applicationWaiting = false; pendingApplicationOutcome = nil
        switch outcome {
        case .completed: setPhase(.completed)
        case .stopped: setPhase(.stopped)
        case .failed:
            error = String(localized: "原应用任务失败，请在原会话查看详情。", bundle: .l10n)
            setPhase(.failed)
        }
    }

    /// 只由已去重的当前会话 final assistant 消息调用；切换会话会取消旧轮播放。
    func speakApplicationReply(_ text: String) {
        // 即使用户关掉朗读，新回复也必须取消旧轮的网络/播放，不能让迟到回调覆盖当前正文。
        cancel()
        error = nil
        guard store.profile.autoSpeakReplies else { reply = text; setPhase(.completed); return }
        let token = generation
        reply = text
        let profile = store.profile; let secrets = store.secrets
        operation = Task { [weak self] in
            guard let self else { return }
            do {
                guard text.utf8.count <= 32_768 else { throw AssistantError.responseTooLarge }
                setPhase(.speaking)
                try await player.play(service.speech(text: text, profile: profile, secrets: secrets))
                try check(token)
                setPhase(.completed)
            } catch { if generation == token, !Task.isCancelled { fail(error) } }
        }
    }

    func cancel() {
        generation = UUID()
        operation?.cancel(); operation = nil
        timer?.cancel(); timer = nil
        source?.stop(); source = nil; capture = nil; captureDestination = nil
        player.stop()
        applicationWaiting = false; awaitingApplicationReceipt = false; pendingApplicationOutcome = nil
        if isBusy { setPhase(.stopped) }
    }
    func newConversation() { cancel(); history.clear(); transcript = ""; reply = ""; error = nil; setPhase(.idle) }
    private func check(_ token: UUID) throws {
        try Task.checkCancellation()
        guard generation == token else { throw CancellationError() }
    }
    private func updateReply(_ text: String, token: UUID) { guard generation == token else { return }; reply = text; setPhase(.replying) }
    private func setPhase(_ phase: AssistantPhase) { self.phase = phase; onPhase?(phase) }
    private func fail(_ error: Error) {
        source?.stop(); source = nil; capture = nil
        applicationWaiting = false; awaitingApplicationReceipt = false; pendingApplicationOutcome = nil
        self.error = error.localizedDescription; setPhase(.failed)
    }
}

/// 音频回调只写有界数组，主线程停止后一次取走；不在实时线程执行网络请求。
nonisolated private final class AssistantCaptureBuffer: @unchecked Sendable {
    private let lock = NSLock()
    private let limit: Int
    private var samples: [Float] = []
    private var fullReported = false
    init(limit: Int) { self.limit = limit; samples.reserveCapacity(limit) }
    func append(_ chunk: [Float]) -> Bool {
        lock.withLock {
            let remaining = max(0, limit - samples.count)
            samples.append(contentsOf: chunk.prefix(remaining))
            guard samples.count >= limit, !fullReported else { return false }
            fullReported = true
            return true
        }
    }
    func take() -> [Float] { lock.withLock { let out = samples; samples = []; return out } }
}
