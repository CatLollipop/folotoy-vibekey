import SwiftUI
import AppKit
import AVFoundation
import UniformTypeIdentifiers

/// 识别模型页的统一语音表单；保存一次同时更新听写/字幕与AI助理，始终只用同一密钥。
struct MiniMaxVoiceConfigSheet: View {
    let assistant: AssistantStore
    let cloud: CloudASRStore
    var onSaved: () -> Void = {}
    @Environment(\.dismiss) private var dismiss
    @State private var profile = AssistantProfile()
    @State private var apiKey = ""
    @State private var result: String?
    @State private var testing = false
    @State private var task: Task<Void, Never>?
    @State private var testGeneration = UUID()
    @State private var player = AssistantPCMPlayer()

    private var config: CloudConfig { .init(apiKey: apiKey.trimmingCharacters(in: .whitespacesAndNewlines),
                                          model: "asr-1.0", region: .mainland, baseURL: profile.minimaxBaseURL) }
    var body: some View {
        VStack(alignment: .leading, spacing: DS.Space.m) {
            VStack(alignment: .leading, spacing: 4) {
                Text("MiniMax · 语音识别与朗读").font(.system(size: 16, weight: .semibold))
                Text("一处配置，供听写、字幕、AI 助理和 Passport 独立对话共用。")
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            Card {
                VStack(spacing: DS.Space.m) {
                    row("API Key") { SecureField("粘贴 MiniMax API Key", text: $apiKey).textContentType(.password) }
                    Divider()
                    row("接口地址") { TextField("https://api.minimax.cn", text: $profile.minimaxBaseURL) }
                    Divider()
                    row("识别模型") { Text("asr-1.0"); Spacer() }
                    row("朗读模型") { Text("speech-2.8-turbo"); Spacer() }
                    Divider()
                    row("系统音色") { TextField("male-qn-qingse", text: $profile.voiceID) }
                }
            }.textFieldStyle(.plain)
            Card {
                VStack(spacing: DS.Space.m) {
                    Toggle("自动朗读当前会话回复", isOn: $profile.autoSpeakReplies)
                    Divider()
                    Stepper("单句录音上限：\(profile.recordLimitSeconds) 秒", value: $profile.recordLimitSeconds, in: 1...30)
                }
            }
            Hint("密钥仅保存一份。语音测试会产生 MiniMax API 用量；使用系统音色，不调用音色克隆或设计接口。")
            HStack(spacing: DS.Space.s) {
                Button("测试语音识别…", action: selectAudio).disabled(testing || !config.isComplete(for: .minimax))
                Button("试听语音", action: testSpeech).disabled(testing || !config.isComplete(for: .minimax))
                if testing {
                    ProgressView().controlSize(.small)
                    Button("停止测试") { cancelTest() }
                }
                Spacer()
                Link("获取 API Key", destination: CloudProvider.minimax.consoleURL)
            }.buttonStyle(SecondaryButtonStyle())
            if let result { Text(result).font(.caption).foregroundStyle(.secondary).textSelection(.enabled).lineLimit(4) }
            HStack {
                if cloud.isConfigured(.minimax) {
                    Button("移除配置", role: .destructive) {
                        assistant.minimaxKey = ""; _ = assistant.save(); cloud.remove(.minimax); onSaved(); dismiss()
                    }.buttonStyle(SecondaryButtonStyle())
                }
                Spacer()
                Button("取消") { dismiss() }.buttonStyle(SecondaryButtonStyle()).keyboardShortcut(.cancelAction)
                Button("保存") { save() }.buttonStyle(PrimaryButtonStyle()).keyboardShortcut(.defaultAction)
                    .disabled(testing || !config.isComplete(for: .minimax))
            }
        }.padding(DS.Space.l).frame(width: 560)
            .onAppear { profile = assistant.profile; apiKey = assistant.minimaxKey }
            .onDisappear { cancelTest() }
    }
    private func row(_ title: LocalizedStringKey, @ViewBuilder content: () -> some View) -> some View {
        HStack { Text(title).font(.system(size: 12.5)).foregroundStyle(.secondary).frame(width: 76, alignment: .leading); content().font(.system(size: 12.5)) }
    }
    private func save() {
        do {
            try profile.validate()
            var merged = assistant.profile
            merged.minimaxBaseURL = profile.minimaxBaseURL; merged.voiceID = profile.voiceID
            merged.asrModel = "asr-1.0"; merged.ttsModel = "speech-2.8-turbo"
            merged.autoSpeakReplies = profile.autoSpeakReplies; merged.recordLimitSeconds = profile.recordLimitSeconds
            assistant.profile = merged; assistant.minimaxKey = config.apiKey
            guard assistant.save() else { result = assistant.saveError; return }
            cloud.update(.minimax, config)
            onSaved(); dismiss()
        } catch { result = error.localizedDescription }
    }
    private func selectAudio() {
        let panel = NSOpenPanel(); panel.allowedContentTypes = [.audio]; panel.allowsMultipleSelection = false
        guard panel.runModal() == .OK, let url = panel.url else { return }
        let profile = profile, key = config.apiKey
        test {
            let file = try AVAudioFile(forReading: url)
            guard file.processingFormat.sampleRate > 0, Double(file.length) / file.processingFormat.sampleRate <= Double(profile.recordLimitSeconds),
                  let buffer = AVAudioPCMBuffer(pcmFormat: file.processingFormat, frameCapacity: AVAudioFrameCount(file.length)) else { throw AssistantError.invalidProfile }
            try file.read(into: buffer)
            return try await AssistantCloudClient().transcribe(samples: AudioConverter().convert(buffer), profile: profile,
                secrets: .init(minimaxKey: key, deepseekKey: ""))
        }
    }
    private func testSpeech() {
        let profile = profile, key = config.apiKey
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
            do { let text = try await operation(); if !Task.isCancelled, token == testGeneration { result = text } }
            catch { if !Task.isCancelled, token == testGeneration { result = error.localizedDescription } }
        }
    }
    private func cancelTest() { testGeneration = UUID(); task?.cancel(); task = nil; player.stop(); testing = false }
}
