import SwiftUI
import AppKit
import AVFoundation
import UniformTypeIdentifiers

/// 原生设置沿用现有分组；界面发意图，网络与设备事务由独立控制器执行。
struct AssistantPane: View {
    let app: AppState
    @State private var draft = ""
    @State private var testing = false
    @State private var testResult: String?
    @State private var holdingRecord = false

    var body: some View {
        @Bindable var store = app.assistantStore
        @Bindable var assistant = app.assistant
        VStack(alignment: .leading, spacing: 0) {
            SettingsSection(title: "权限") {
                VStack(spacing: 8) {
                    PermissionRow(symbol: "mic.fill", title: "麦克风", detail: "用于电脑端语音对话。", granted: app.permissions.microphone == .authorized) {
                        app.permissions.requestMicrophone()
                    }
                    PermissionRow(symbol: "accessibility", title: "辅助功能", detail: "用于控制你选中的桌面应用会话。", granted: app.permissions.accessibility) {
                        app.permissions.requestAccessibility()
                    }
                }
            }
            SettingsSection(title: "DeepSeek 对话", footer: "API Key 仅保存在本机私有凭据文件中；点击同步后会复制到你的 Passport。测试和对话会产生供应商 API 用量。") {
                Card {
                    VStack(alignment: .leading, spacing: 12) {
                        endpoint("DeepSeek 地址", text: $store.profile.deepseekBaseURL)
                        SecureField("DeepSeek API Key", text: $store.deepseekKey)
                            .textContentType(.password)
                        endpoint("对话模型", text: $store.profile.llmModel)
                        Text("默认关闭思考模式；回复以文字显示，实时识别在“识别模型”中配置。")
                            .font(.caption).foregroundStyle(.secondary)
                        HStack {
                            Button("保存配置") { _ = store.save() }
                            Button("测试 DeepSeek") { testLLM() }.disabled(testing)
                            Button("前往语音设置…") { app.windows.showSettings(.models) }
                        }
                        if testing { ProgressView().controlSize(.small) }
                        if let testResult { Text(testResult).font(.caption).textSelection(.enabled) }
                        if let error = store.saveError { Text(error).foregroundStyle(.red) }
                    }.textFieldStyle(.roundedBorder)
                }
            }
            SettingsSection(title: "对话偏好") {
                Card {
                    VStack(alignment: .leading, spacing: 12) {
                        Toggle("Passport 按住说话用于 AI 助理", isOn: $store.usePassportForAssistant)
                        Toggle("全局听写快捷键用于 AI 助理", isOn: $store.useGlobalShortcut)
                        Stepper("回复 Token 上限：\(store.profile.maxOutputTokens)", value: $store.profile.maxOutputTokens, in: 32...512, step: 32)
                        Text("系统提示词").font(.caption).foregroundStyle(.secondary)
                        TextEditor(text: $store.profile.systemPrompt).frame(height: 76)
                            .overlay(RoundedRectangle(cornerRadius: 5).stroke(.quaternary))
                    }
                }
            }
            SettingsSection(title: "试用 AI 助理", footer: "电脑助手模式需先在“智能体”中选择目标会话。此处的云对话使用 DeepSeek；设备独立对话不依赖电脑运行。") {
                Card {
                    VStack(alignment: .leading, spacing: 12) {
                        Picker("发送到", selection: $assistant.destination) {
                            Text("云端 AI 对话").tag(AssistantController.Destination.cloud)
                            Text("选中的应用会话").tag(AssistantController.Destination.application)
                        }.pickerStyle(.segmented)
                        TextField("输入问题，或按住下方按钮说话", text: $draft, axis: .vertical)
                            .lineLimit(2...4).textFieldStyle(.roundedBorder)
                        HStack {
                            Button("发送") { assistant.send(text: draft); draft = "" }.disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                            Text(assistant.isRecording ? "松开结束录音" : "按住说话")
                                .padding(.horizontal, 14).padding(.vertical, 7)
                                .background(assistant.isRecording ? Color.red.opacity(0.15) : Color.accentColor.opacity(0.12), in: RoundedRectangle(cornerRadius: 7))
                                .gesture(DragGesture(minimumDistance: 0)
                                    .onChanged { _ in if !holdingRecord { holdingRecord = true; assistant.beginRecording() } }
                                    .onEnded { _ in holdingRecord = false; assistant.endRecording() })
                                .accessibilityAddTraits(.isButton)
                                .accessibilityAction { if assistant.isRecording { assistant.endRecording() } else { assistant.beginRecording() } }
                            Button("停止") { assistant.cancel(); if assistant.destination == .application { Task { try? await app.agentHub.stop() } } }
                                .disabled(!assistant.isBusy && (assistant.destination != .application || app.agentHub.selectedSession == nil))
                            Button("新对话") { assistant.newConversation() }
                            Spacer()
                            Text(assistant.phase.title).font(.caption).foregroundStyle(.secondary)
                        }
                        if !assistant.transcript.isEmpty { Text(assistant.transcript).foregroundStyle(.secondary).textSelection(.enabled) }
                        if !assistant.reply.isEmpty { Text(assistant.reply).textSelection(.enabled) }
                        if let notice = assistant.deviceReplyError { Text(notice).font(.caption).foregroundStyle(.orange).textSelection(.enabled) }
                        if assistant.truncated { Text("回复达到长度上限，可继续追问。").font(.caption).foregroundStyle(.orange) }
                        if let error = assistant.error { Text(error).foregroundStyle(.red).textSelection(.enabled) }
                    }
                }
            }
            deviceSection
        }
    }

    private var deviceSection: some View {
        let sync = app.assistantSync
        return SettingsSection(title: "同步到 Passport", footer: "首次同步凭据请使用 USB；后续可用已配对的加密 Wi-Fi。独立模式在 Mac 关闭后仍可进行云端语音对话。") {
            Card {
                VStack(alignment: .leading, spacing: 12) {
                    LabeledContent("设备配置版本", value: sync.appliedRevision == 0 ? "—" : String(sync.appliedRevision))
                    LabeledContent("设备宠物版本", value: sync.appliedPetRevision == 0 ? "—" : String(sync.appliedPetRevision))
                    LabeledContent("当前模式", value: sync.mode == "standalone" ? String(localized: "独立云对话", bundle: .l10n) : String(localized: "电脑助手", bundle: .l10n))
                    HStack {
                        Button("读取设备状态") { sync.refresh() }
                        Button("同步云配置") { sync.sync(store: app.assistantStore) }
                        Button("独立云对话") { sync.setMode("standalone") }
                        Button("电脑助手") { sync.setMode("companion") }
                    }.disabled(sync.busy || app.deviceLink.connection == .disconnected)
                    HStack {
                        Button("同步宠物设置") { sync.syncPet(controller:app.pet) }
                            .disabled(sync.busy || app.deviceLink.connection == .disconnected)
                        Button("清除设备云凭据", role: .destructive) { sync.clearCredentials() }
                            .disabled(sync.busy || app.deviceLink.connection == .disconnected)
                        if sync.busy { Button("取消同步") { sync.cancel() } }
                    }
                    if sync.busy { ProgressView(value: sync.progress) }
                    if sync.restarting { Hint("设备正在重启，等待重新连接并确认模式…") }
                    if let error = sync.error { Text(error).foregroundStyle(.red).textSelection(.enabled) }
                }
            }
        }
    }

    private func endpoint(_ title: LocalizedStringKey, text: Binding<String>) -> some View {
        HStack { Text(title).frame(width: 106, alignment: .leading); TextField(title, text: text) }
    }
    private func testLLM() {
        guard app.assistantStore.save() else { return }
        testing = true; testResult = nil
        Task {
            defer { testing = false }
            do {
                var profile = app.assistantStore.profile; profile.maxOutputTokens = 32
                let result = try await AssistantCloudClient().complete(messages: [.init(role: "user", content: "只回复：连接成功")],
                    profile: profile, secrets: app.assistantStore.secrets, onText: { _ in })
                testResult = result.text
            } catch { testResult = error.localizedDescription }
        }
    }

}

extension AssistantPhase {
    var title: String {
        switch self {
        case .idle: String(localized: "待机", bundle: .l10n)
        case .recording: String(localized: "正在聆听", bundle: .l10n)
        case .transcribing: String(localized: "正在识别", bundle: .l10n)
        case .thinking: String(localized: "正在思考", bundle: .l10n)
        case .replying: String(localized: "正在回复", bundle: .l10n)
        case .speaking: String(localized: "正在朗读", bundle: .l10n)
        case .completed: String(localized: "已完成", bundle: .l10n)
        case .stopped: String(localized: "已停止", bundle: .l10n)
        case .failed: String(localized: "出错", bundle: .l10n)
        }
    }
}
