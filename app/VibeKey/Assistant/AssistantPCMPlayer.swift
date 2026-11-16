import AVFoundation

/// 播放器以语义接口注入；测试可控制播放完成/取消而不打开真实音频设备。
@MainActor protocol AssistantAudioPlaying: AnyObject {
    func play(_ stream: AsyncThrowingStream<Data, Error>) async throws
    func stop()
}

/// PCM 播放只排队四个100ms缓冲；消费者满时等待硬件消耗，网络端随之产生背压。
@MainActor final class AssistantPCMPlayer: AssistantAudioPlaying {
    private let engine = AVAudioEngine()
    private let node = AVAudioPlayerNode()
    private let format = AVAudioFormat(standardFormatWithSampleRate: 16_000, channels: 1)!
    private var generation = UUID()
    private var gate: AssistantPlaybackGate?

    init() { engine.attach(node); engine.connect(node, to: engine.mainMixerNode, format: format) }

    func play(_ stream: AsyncThrowingStream<Data, Error>) async throws {
        stop()
        let token = generation
        let gate = AssistantPlaybackGate(capacity: 4)
        self.gate = gate
        try engine.start()
        node.play()
        var carry = Data()
        defer { if generation == token { stop() } }
        for try await data in stream {
            try Task.checkCancellation()
            guard generation == token else { throw CancellationError() }
            carry.append(data)
            while carry.count >= 3_200 {
                try await schedule(Data(carry.prefix(3_200)), gate: gate, token: token)
                carry.removeFirst(3_200)
            }
        }
        guard carry.count.isMultiple(of: 2) else { throw AssistantError.malformedAudio }
        if !carry.isEmpty { try await schedule(carry, gate: gate, token: token) }
        try await gate.drain()
        guard generation == token else { throw CancellationError() }
    }

    private func schedule(_ pcm: Data, gate: AssistantPlaybackGate, token: UUID) async throws {
        try await gate.acquire()
        try Task.checkCancellation()
        guard generation == token else { throw CancellationError() }
        let frames = pcm.count / 2
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(frames)),
              let destination = buffer.floatChannelData?[0] else { throw AssistantError.malformedAudio }
        buffer.frameLength = AVAudioFrameCount(frames)
        pcm.withUnsafeBytes { bytes in
            for i in 0..<frames {
                let value = UInt16(bytes[i * 2]) | UInt16(bytes[i * 2 + 1]) << 8
                destination[i] = Float(Int16(bitPattern: value)) / 32_768
            }
        }
        node.scheduleBuffer(buffer, completionCallbackType: .dataPlayedBack) { _ in
            Task { await gate.release() }
        }
    }

    func stop() {
        generation = UUID()
        node.stop()
        engine.stop()
        if let gate { Task { await gate.cancel() } }
        gate = nil
    }
}

/// actor 管理播放配额及取消，不能在主线程阻塞等待音频回调。
private actor AssistantPlaybackGate {
    let capacity: Int
    private var count = 0
    private var cancelled = false
    private var waiters: [CheckedContinuation<Void, Error>] = []
    private var drainWaiters: [CheckedContinuation<Void, Error>] = []
    init(capacity: Int) { self.capacity = capacity }

    func acquire() async throws {
        guard !cancelled else { throw CancellationError() }
        if count < capacity { count += 1; return }
        try await withCheckedThrowingContinuation { waiters.append($0) }
    }
    func release() {
        guard !cancelled else { return }
        if !waiters.isEmpty { waiters.removeFirst().resume(); return }
        count = max(0, count - 1)
        if count == 0 { drainWaiters.forEach { $0.resume() }; drainWaiters.removeAll() }
    }
    func drain() async throws {
        guard !cancelled else { throw CancellationError() }
        if count == 0 { return }
        try await withCheckedThrowingContinuation { drainWaiters.append($0) }
    }
    func cancel() {
        cancelled = true
        waiters.forEach { $0.resume(throwing: CancellationError()) }; waiters.removeAll()
        drainWaiters.forEach { $0.resume(throwing: CancellationError()) }; drainWaiters.removeAll()
    }
}
