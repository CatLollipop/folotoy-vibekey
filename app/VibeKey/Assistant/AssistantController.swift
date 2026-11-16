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
    private(set) var deviceReplyError: String?
    private(set) var truncated = false
    private(set) var inputTokens = 0
    private(set) var outputTokens = 0
    var isRecording: Bool { phase == .recording }
    var isBusy: Bool { ![.idle, .completed, .stopped, .failed].contains(phase) }
    @ObservationIgnored var onPhase: ((AssistantPhase) -> Void)?
    /// 句final仍是录音中的增量；只有finish和事件流完整收敛才发final=true。
    @ObservationIgnored var onTranscript: ((String, Bool) -> Void)?
    /// 只发布最终回复正文；设备全文显示有独立协议，不混入ASR字幕。
    @ObservationIgnored var onReply: ((String) -> Void)?
    @ObservationIgnored var willRecord: (() -> Void)?
    @ObservationIgnored var sendToApplication: ((String) async throws -> Void)?
    @ObservationIgnored private let store: AssistantStore
    @ObservationIgnored private let service: any AssistantCloudServing
    @ObservationIgnored private let makeSource: () -> any AudioSource
    @ObservationIgnored private let makeRecognition: (AssistantProfile, AssistantSecrets) throws -> any ASRSession
    @ObservationIgnored private let player: (any AssistantAudioPlaying)?
    @ObservationIgnored private var source: (any AudioSource)?
    @ObservationIgnored private var capture: AssistantCaptureGate?
    @ObservationIgnored private var captureContext: (AssistantProfile, AssistantSecrets, Destination)?
    @ObservationIgnored private var recognition: (any ASRSession)?
    @ObservationIgnored private var recognitionEvents: Task<Void, Never>?
    @ObservationIgnored private var recognitionFailure: String?
    @ObservationIgnored private var recognitionFinals: [String] = []
    @ObservationIgnored private var recognitionPartial = ""
    @ObservationIgnored private var recognitionTextLimit = 8_192
    @ObservationIgnored private var operation: Task<Void, Never>?
    @ObservationIgnored private var timer: Task<Void, Never>?
    @ObservationIgnored private var generation = UUID()
    @ObservationIgnored private var history = AssistantHistory()
    @ObservationIgnored private var applicationWaiting = false
    @ObservationIgnored private var awaitingApplicationReceipt = false
    @ObservationIgnored private var pendingApplicationOutcome: ApplicationTurnOutcome?

    init(store: AssistantStore, service: any AssistantCloudServing = AssistantCloudClient(),
         player: (any AssistantAudioPlaying)? = nil,
         makeRecognition: @escaping (AssistantProfile, AssistantSecrets) throws -> any ASRSession,
         makeSource: @escaping () -> any AudioSource) {
        self.store = store; self.service = service; self.player = player; self.makeSource = makeSource
        self.makeRecognition = makeRecognition
    }

    func beginRecording(using override: (any AudioSource)? = nil) {
        cancel()
        do {
            willRecord?()
            let profile = store.profile, secrets = store.secrets
            try profile.validate(); try secrets.validateASR()
            let session = try makeRecognition(profile, secrets)
            transcript = ""; reply = ""; error = nil; deviceReplyError = nil; truncated = false
            let token = generation
            let buffer = AssistantCaptureGate(limit: profile.recordLimitSeconds * 16_000)
            recognition = session; recognitionFailure = nil
            recognitionFinals = []; recognitionPartial = ""; recognitionTextLimit = profile.historyBytes
            recognitionEvents = Task { [weak self] in
                for await event in session.events {
                    guard !Task.isCancelled, let self, generation == token,
                          phase == .recording || phase == .transcribing else { return }
                    switch event {
                    case .partial(let text): recognitionPartial = text
                    case .final(let text): recognitionFinals.append(text); recognitionPartial = ""
                    case .failure(let message):
                        recognitionFailure = message
                        fail(AssistantRecognitionFailure(message: message)); return
                    }
                    let text = TranscriptText.join(recognitionFinals + [recognitionPartial])
                    guard text.utf8.count <= recognitionTextLimit else { fail(AssistantError.responseTooLarge); return }
                    transcript = text; onTranscript?(text, false)
                }
            }
            let source = override ?? makeSource()
            source.onSamples = { [weak self] samples in
                if buffer.feed(samples, into: session) {
                    Task { @MainActor in
                        guard let self, self.generation == token, self.isRecording else { return }
                        self.endRecording()
                    }
                }
            }
            self.capture = buffer; self.source = source
            captureContext = (profile, secrets, destination)
            try source.start()
            setPhase(.recording)
            onTranscript?("", false)
            guard generation == token, isRecording else { return }
            timer = Task { [weak self] in
                try? await Task.sleep(for: .seconds(profile.recordLimitSeconds))
                guard !Task.isCancelled, let self, self.generation == token else { return }
                self.endRecording()
            }
        } catch { fail(error) }
    }

    func endRecording() {
        guard isRecording else { return }
        timer?.cancel(); timer = nil
        let heardSpeech = capture?.seal() ?? false
        source?.stop(); source = nil
        capture = nil
        guard heardSpeech else { fail(AssistantError.noSpeech); return }
        guard let session = recognition, let events = recognitionEvents,
              let (profile, secrets, destination) = captureContext else { fail(AssistantError.noSpeech); return }
        let token = generation
        setPhase(.transcribing)
        guard generation == token, phase == .transcribing else { return }
        operation = Task { [weak self] in
            guard let self else { return }
            do {
                try check(token)
                let result = await session.finish()
                // finish关闭events后，仍须等已排队句final/failure在主线程消费完。
                await events.value
                try check(token)
                if let message = recognitionFailure { throw AssistantRecognitionFailure(message: message) }
                guard phase == .transcribing else { return }
                let text = result.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !text.isEmpty else { throw AssistantError.noSpeech }
                guard text.utf8.count <= recognitionTextLimit else { throw AssistantError.responseTooLarge }
                recognition = nil; recognitionEvents = nil; captureContext = nil
                transcript = text; onTranscript?(text, true)
                try check(token)
                try await route(text, destination: destination, profile: profile, secrets: secrets, token: token)
            } catch { if generation == token, !Task.isCancelled { fail(error) } }
        }
    }

    func send(text: String) {
        let value = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !value.isEmpty else { return }
        cancel()
        let token = generation
        transcript = value; reply = ""; error = nil; deviceReplyError = nil; truncated = false
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
        try check(token)
        if destination == .application {
            guard let sendToApplication else { throw AssistantError.device("application_not_selected") }
            applicationWaiting = true; awaitingApplicationReceipt = true
            setPhase(.thinking)
            try check(token)
            try await sendToApplication(text)
            try check(token)
            awaitingApplicationReceipt = false
            // accepted 是投递状态，不是 agent 完成；完成由原会话的正式事件驱动。
            setPhase(.replying)
            // 最终回复可在onPhase中发布并更换generation，稍早的终态不能覆盖它。
            if generation == token, let pending = pendingApplicationOutcome { finishApplicationTurn(pending) }
            return
        }
        try secrets.validate()
        let messages = try history.messages(system: profile.systemPrompt, user: text, limit: profile.historyBytes)
        setPhase(.thinking)
        try check(token)
        let result = try await service.complete(messages: messages, profile: profile, secrets: secrets) { [weak self] text in
            await self?.updateReply(text, token: token)
        }
        try check(token)
        reply = result.text; truncated = result.truncated
        inputTokens = result.inputTokens; outputTokens = result.outputTokens
        history.append(user: text, assistant: result.text)
        onReply?(result.text)
        setPhase(.completed)
    }

    /// 原任务终止但没有正文也要结束等待；回执之前暂存，不覆盖已经展示的最终回复。
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

    /// 只展示当前会话最终assistant正文；暂停朗读后任何旧偏好均不能触发TTS。
    func showApplicationReply(_ text:String) {
        cancel()
        error = nil
        guard text.utf8.count <= 32_768 else { fail(AssistantError.responseTooLarge); return }
        reply = text; deviceReplyError = nil
        onReply?(text)
        setPhase(.completed)
    }

    func reportDeviceReplyError(_ message:String?) { deviceReplyError = message }

    func cancel() {
        generation = UUID()
        operation?.cancel(); operation = nil
        timer?.cancel(); timer = nil
        _ = capture?.seal(); source?.stop(); source = nil; capture = nil; captureContext = nil
        recognition?.cancel(); recognition = nil; recognitionEvents?.cancel(); recognitionEvents = nil
        recognitionFailure = nil; recognitionFinals = []; recognitionPartial = ""
        player?.stop()
        applicationWaiting = false; awaitingApplicationReceipt = false; pendingApplicationOutcome = nil
        if isBusy { setPhase(.stopped) }
    }
    func newConversation() { cancel(); history.clear(); transcript = ""; reply = ""; error = nil; deviceReplyError = nil; setPhase(.idle) }
    private func check(_ token: UUID) throws {
        try Task.checkCancellation()
        guard generation == token else { throw CancellationError() }
    }
    private func updateReply(_ text: String, token: UUID) { guard generation == token else { return }; reply = text; setPhase(.replying) }
    private func setPhase(_ phase: AssistantPhase) { self.phase = phase; onPhase?(phase) }
    private func fail(_ error: Error) {
        timer?.cancel(); timer = nil
        _ = capture?.seal(); source?.stop(); source = nil; capture = nil; captureContext = nil
        recognition?.cancel(); recognition = nil; recognitionEvents?.cancel(); recognitionEvents = nil
        applicationWaiting = false; awaitingApplicationReceipt = false; pendingApplicationOutcome = nil
        self.error = error.localizedDescription; setPhase(.failed)
    }
}

/// 音频线程只把有界样本送入ASR inbox并统计静音，不缓存整段，也不执行网络I/O。
nonisolated private final class AssistantCaptureGate: @unchecked Sendable {
    private let lock = NSLock()
    private let limit: Int
    private var sampleCount = 0
    private var heardSpeech = false
    private var closed = false
    private var fullReported = false
    init(limit: Int) { self.limit = limit }
    func feed(_ chunk: [Float], into session: any ASRSession) -> Bool {
        lock.withLock {
            guard !closed else { return false }
            let accepted = Array(chunk.prefix(max(0, limit - sampleCount)))
            sampleCount += accepted.count
            heardSpeech = heardSpeech || accepted.contains(where: { abs($0) > 0.003 })
            // feed只入非阻塞队列；和seal共用锁，避免末块在finish之后才进入会话。
            if !accepted.isEmpty { session.feed(accepted) }
            guard sampleCount >= limit, !fullReported else { return false }
            fullReported = true
            return true
        }
    }
    func seal() -> Bool { lock.withLock { closed = true; return sampleCount >= 4_000 && heardSpeech } }
}

nonisolated private struct AssistantRecognitionFailure: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}
