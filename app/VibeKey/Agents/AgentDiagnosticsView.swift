import SwiftUI
import UniformTypeIdentifiers

/// 显示真实能力缺口和原会话选择；未验证项保持阻塞，不用静态成功图标。
struct AgentDiagnosticsView: View {
    @Bindable var hub: AgentHub
    @State private var message: String?
    @State private var draft = ""
    @State private var kimiEndpoint = ""
    @State private var kimiToken = ""
    @State private var busy = false
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading) {
                    Text("应用接入与会话").font(.headline)
                    Text("选择原应用会话；只有当前所选会话的最终回复会进入自动朗读。")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                Button("重新检测") { Task { await hub.refresh() } }.disabled(hub.isRefreshing)
            }
            ForEach(hub.diagnostics) { diagnostic in
                GroupBox {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack { Text(diagnostic.name).fontWeight(.medium); Spacer(); Text(diagnostic.isComplete ? "能力已探测" : "接入未完成").foregroundStyle(diagnostic.isComplete ? .green : .orange) }
                        Text(diagnostic.detail).font(.caption).foregroundStyle(.secondary)
                        HStack(spacing: 8) {
                            ForEach(AgentCapability.allCases, id: \.self) { capability in
                                Label(capabilityTitle(capability), systemImage: diagnostic.capabilities.contains(capability) ? "checkmark.circle" : "exclamationmark.circle")
                                    .font(.caption2).foregroundStyle(diagnostic.capabilities.contains(capability) ? .primary : .secondary)
                            }
                        }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            Picker("原应用会话", selection: Binding(get: { hub.selectedSession?.id ?? "" }, set: { id in
                if let session = hub.sessions.first(where: { $0.id == id }) { perform { try await hub.select(session) } }
                else { hub.clearSelection() }
            })) {
                Text("请选择会话").tag("")
                ForEach(hub.sessions) { session in Text(session.name).tag(session.id) }
            }
            TextEditor(text: $draft).frame(minHeight: 75, maxHeight: 110).border(.secondary.opacity(0.2))
            HStack {
                Button("发送到所选会话") { let text = draft; perform { try await hub.sendPrompt(text); draft = "" } }
                    .disabled(hub.selectedSession == nil || draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || busy || hub.isSending)
                Button("只写入原应用草稿") { perform { try await hub.insertDraft(draft) } }.disabled(hub.selectedSession == nil || draft.isEmpty || busy)
                Button("停止所选任务") { perform { try await hub.stop() } }.disabled(hub.selectedSession == nil || busy)
            }
            HStack {
                Button("安装 Claude Code Hook") { install { try AgentBridgeInstaller.installClaudeCode(); message = "Hook 已合并并备份；在原 Claude Code 会话重新加载配置后检测" } }
                Button("安装 OMP 扩展") { install { try AgentBridgeInstaller.installOMP(); message = "扩展已安装；在原 OMP 会话输入 /reload 后检测" } }
                Button("导出 DSH 原生插件") { install { try AgentBridgeInstaller.revealDSHPlugin(); message = "插件目录已打开；通过 DSH 插件管理加载到原 Desktop runtime 后检测" } }
                Button("配置 WorkBuddy Hook") {
                    let panel = NSOpenPanel(); panel.canChooseDirectories = false; panel.allowsMultipleSelection = false
                    panel.allowedContentTypes = [.json]
                    if panel.runModal() == .OK, let url = panel.url {
                        install { try AgentBridgeInstaller.installWorkBuddy(configURL: url); message = "Hook 已合并并备份；在原 WorkBuddy 加载配置后重新检测" }
                    }
                }
            }.font(.caption)
            GroupBox("Kimi Code 本机服务") {
                VStack(alignment: .leading) {
                    TextField("本机服务地址", text: $kimiEndpoint)
                    SecureField("原 Kimi Code 服务访问令牌", text: $kimiToken)
                    Button("保存并检测 Kimi") { perform { try hub.configureKimi(endpoint: kimiEndpoint, token: kimiToken); kimiToken = ""; await hub.refresh() } }
                    Text("使用原 kimi web 服务；不会新建、夺取会话或修改模型与批准设置。Kimi Work 的界面不等同于 Kimi Code API。")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            if let message = message ?? hub.lastError { Text(AgentText.localized(message)).font(.caption).foregroundStyle(.orange).textSelection(.enabled) }
            Text("缺少能力的应用保持未完成；实际发送、停止、运行状态和回复朗读都需要在专用测试会话逐项验收。")
                .font(.caption).foregroundStyle(.secondary)
        }.task { kimiEndpoint = hub.kimiEndpoint; await hub.refresh() }
    }
    private func perform(_ operation: @escaping @MainActor () async throws -> Void) {
        guard !busy else { return }; busy = true; message = nil
        Task { defer { busy = false }; do { try await operation() } catch { message = error.localizedDescription } }
    }
    private func install(_ operation: () throws -> Void) { do { try operation() } catch { message = error.localizedDescription } }
    private func capabilityTitle(_ value: AgentCapability) -> String {
        let text = switch value {
        case .discover: "发现"; case .activate: "选择"; case .insertDraft: "草稿"; case .submit: "发送"
        case .stop: "停止"; case .observeState: "状态"; case .readReply: "回复"
        }
        return AgentText.localized(text)
    }
}
