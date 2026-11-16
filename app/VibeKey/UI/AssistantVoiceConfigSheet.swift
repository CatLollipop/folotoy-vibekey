import SwiftUI
import AppKit
import AVFoundation
import UniformTypeIdentifiers

/// 识别模型页统一保存实时ASR与TTS；识别不再走MiniMax文件接口。
struct AssistantVoiceConfigSheet: View {
    let assistant: AssistantStore
    let cloud: CloudASRStore
    var onSaved: () -> Void = {}
    @Environment(\.dismiss) private var dismiss
    @State private var profile = AssistantProfile()
    @State private var asrKey = ""
    @State private var ttsKey = ""
    @State private var result: String?
    @State private var testing = false
    @State private var task: Task<Void, Never>?
    @State private var testGeneration = UUID()
    @State private var player = AssistantPCMPlayer()
    @State private var recognition: ASRSession?
    @State private var recognitionEvents: Task<Void, Never>?

    private var config: CloudConfig {
        .init(apiKey: asrKey.trimmingCharacters(in: .whitespacesAndNewlines), model: profile.asrResourceID,
              region: .mainland, baseURL: profile.asrWebSocketURL)
    }
    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.m) {
            Text("AI 助理 · 实时识别与朗读").font(.system(size: 16, weight: .semibold))
            Text("豆包边说边转写；MiniMax 负责朗读。配置供听写、字幕和设备共用。")
                .font(.system(size: 12)).foregroundStyle(.secondary)
            ScrollView {
                VStack(alignment: .leading, spacing: DS.Space.m) {
                    Text("豆包 · 实时语音识别").font(.headline)
                    Card {
                        VStack(spacing: DS.Space.m) {
                            row("API Key") { SecureField("粘贴豆包 API Key", text: $asrKey).textContentType(.password) }
                            Divider()
                            row("识别模型") {
                                ModelPickerField(selection: $profile.asrResourceID, options: CloudProvider.volcengine.knownModels,
                                                 loading: false, error: nil, onRefresh: nil,
                                                 placeholder: CloudProvider.volcengine.defaultModel)
                            }
                            Divider()
                            row("WSS 地址") { TextField("wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async", text: $profile.asrWebSocketURL) }
                        }
                    }
                    HStack {
                        Button("测试实时识别…", action: selectAudio).disabled(testing || !config.isComplete(for: .volcengine))
                        Spacer()
                        Link("获取豆包 API Key", destination: CloudProvider.volcengine.consoleURL)
                    }
                    Text("MiniMax · 语音朗读").font(.headline)
                    Card {
                        VStack(spacing: DS.Space.m) {
                            row("API Key") { SecureField("粘贴 MiniMax 朗读 API Key", text: $ttsKey).textContentType(.password) }
                            Divider()
                            row("接口地址") { TextField("https://api.minimax.cn", text: $profile.minimaxBaseURL) }
                            row("朗读模型") { Text(verbatim: profile.ttsModel); Spacer() }
                            Divider()
                            row("系统音色") { TextField("male-qn-qingse", text: $profile.voiceID) }
                        }
                    }
                    HStack {
                        Button("试听语音", action: testSpeech).disabled(testing || ttsKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        Spacer()
                        Link("获取 MiniMax API Key", destination: URL(string: "https://platform.minimax.cn/console/keys")!)
                    }
                    Card {
                        VStack(spacing: DS.Space.m) {
                            Toggle("自动朗读当前会话回复", isOn: $profile.autoSpeakReplies)
                            Divider()
                            Stepper("单句录音上限：\(profile.recordLimitSeconds) 秒", value: $profile.recordLimitSeconds, in: 1...30)
                        }
                    }
                    Hint("实时识别使用豆包，朗读使用 MiniMax。测试会产生相应服务用量；设备首次通过 USB 同步配置。")
                    if let result { Text(result).font(.caption).foregroundStyle(.secondary).textSelection(.enabled) }
                }.padding(.trailing, 4)
            }.frame(maxHeight: 570)
            HStack {
                if testing { ProgressView().controlSize(.small); Button("停止测试") { cancelTest() } }
                if cloud.isConfigured(.volcengine), !testing {
                    Button("移除实时识别密钥", role: .destructive) {
                        assistant.asrKey = ""; _ = assistant.save(); cloud.remove(.volcengine); onSaved(); dismiss()
                    }
                }
                Spacer()
                Button("取消") { dismiss() }.keyboardShortcut(.cancelAction)
                Button("保存") { save() }.buttonStyle(PrimaryButtonStyle()).keyboardShortcut(.defaultAction)
                    .disabled(testing || !config.isComplete(for: .volcengine))
            }
        }.padding(DS.Space.l).frame(width: 580)
            .textFieldStyle(.plain).buttonStyle(SecondaryButtonStyle())
            .onAppear {
                profile = assistant.profile; asrKey = assistant.asrKey; ttsKey = assistant.minimaxKey
                asrKey = cloud.config(.volcengine).apiKey
                profile.asrResourceID = cloud.config(.volcengine).model
            }
            .onDisappear { cancelTest() }
    }
    private func row(_ title: LocalizedStringKey, @ViewBuilder content: () -> some View) -> some View {
        HStack { Text(title).font(.system(size: 12.5)).foregroundStyle(.secondary).frame(width: 76, alignment: .leading); content().font(.system(size: 12.5)) }
    }
    private func save() {
        do {
            try profile.validate(); try AssistantSecrets(minimaxKey: "", deepseekKey: "", asrKey: config.apiKey).validateASR()
            var merged = assistant.profile
            merged.asrProvider = profile.asrProvider; merged.asrModel = profile.asrModel; merged.asrWebSocketURL = profile.asrWebSocketURL
            merged.asrResourceID = profile.asrResourceID
            merged.minimaxBaseURL = profile.minimaxBaseURL; merged.voiceID = profile.voiceID
            merged.autoSpeakReplies = profile.autoSpeakReplies; merged.recordLimitSeconds = profile.recordLimitSeconds
            assistant.profile = merged; assistant.asrKey = config.apiKey; assistant.minimaxKey = ttsKey
            guard assistant.save() else { result = assistant.saveError; return }
            cloud.update(.volcengine, config); onSaved(); dismiss()
        } catch { result = error.localizedDescription }
    }
    private func selectAudio() {
        let panel = NSOpenPanel(); panel.allowedContentTypes = [.audio]; panel.allowsMultipleSelection = false
        guard panel.runModal() == .OK, let url = panel.url else { return }
        let config = config, limit = profile.recordLimitSeconds
        test {
            let file = try AVAudioFile(forReading: url)
            guard file.processingFormat.sampleRate > 0, Double(file.length) / file.processingFormat.sampleRate <= Double(limit),
                  let buffer = AVAudioPCMBuffer(pcmFormat: file.processingFormat, frameCapacity: AVAudioFrameCount(file.length)) else { throw AssistantError.invalidProfile }
            try file.read(into: buffer)
            let samples = AudioConverter().convert(buffer)
            var testProfile = profile; testProfile.asrResourceID = config.model
            let session = try AssistantRecognitionFactory.make(profile: testProfile,
                secrets: .init(minimaxKey: "", deepseekKey: "", asrKey: config.apiKey))
            let token = testGeneration
            recognition = session
            var finalParts: [String] = [], failure: String?
            let events = Task { @MainActor in
                for await event in session.events {
                    guard !Task.isCancelled else { break }
                    switch event {
                    case .partial(let text): result = TranscriptText.join(finalParts + [text])
                    case .final(let text): finalParts.append(text); result = TranscriptText.join(finalParts)
                    case .failure(let message): failure = message; session.cancel()
                    }
                }
            }
            recognitionEvents = events
            defer {
                session.cancel(); events.cancel()
                if token == testGeneration { recognition = nil; recognitionEvents = nil }
            }
            for start in stride(from: 0, to: samples.count, by: 1_600) {
                try Task.checkCancellation()
                if let failure { throw NSError(domain: "DoubaoASR", code: 1, userInfo: [NSLocalizedDescriptionKey: failure]) }
                session.feed(Array(samples[start..<min(start + 1_600, samples.count)]))
                try await Task.sleep(for: .milliseconds(100))
            }
            let text = await session.finish(); await events.value
            if let failure { throw NSError(domain: "DoubaoASR", code: 1, userInfo: [NSLocalizedDescriptionKey: failure]) }
            guard !text.isEmpty else { throw AssistantError.noSpeech }
            return text
        }
    }
    private func testSpeech() {
        let profile = profile, key = ttsKey.trimmingCharacters(in: .whitespacesAndNewlines)
        test {
            try profile.validate()
            try await player.play(AssistantCloudClient().speech(text: "你好，我是你的AI助理。", profile: profile,
                secrets: .init(minimaxKey: key, deepseekKey: "")))
            return String(localized: "语音播放完成", bundle: .l10n)
        }
    }
    private func test(_ operation: @escaping @MainActor () async throws -> String) {
        cancelTest(); result = nil; testing = true
        let token = UUID(); testGeneration = token
        task = Task {
            defer { if token == testGeneration { testing = false } }
            guard !Task.isCancelled, token == testGeneration else { return }
            do { let text = try await operation(); if !Task.isCancelled, token == testGeneration { result = text } }
            catch { if !Task.isCancelled, token == testGeneration { result = error.localizedDescription } }
        }
    }
    private func cancelTest() {
        testGeneration = UUID(); task?.cancel(); task = nil
        recognition?.cancel(); recognition = nil; recognitionEvents?.cancel(); recognitionEvents = nil
        player.stop(); testing = false
    }
}
