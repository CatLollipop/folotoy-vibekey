import SwiftUI
import UniformTypeIdentifiers

/// 紧凑接入列表：宿主检测、组件安装和运行能力分别显示，诊断与连接参数按需展开。
struct AgentDiagnosticsView: View {
    @Bindable var hub: AgentHub
    @State private var integrations = AgentIntegrationManager()
    @State private var expanded: Set<AgentIntegrationKind> = []
    @State private var showSessions = false
    @State private var message: String?
    @State private var draft = ""
    @State private var kimiEndpoint = ""
    @State private var kimiToken = ""
    @State private var busy = false

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("智能体接入").font(.headline)
                    Text("自动检测本机 Agent；安装与卸载仅管理 AI 助理接入组件。")
                        .font(.caption).foregroundStyle(.secondary)
                }
                Spacer(minLength: 8)
                if hub.isRefreshing { ProgressView().controlSize(.small).accessibilityLabel("正在检测") }
                Button("立即检测") { Task { await refresh() } }
                    .controlSize(.small).disabled(hub.isRefreshing || integrations.operation != nil)
            }
            VStack(spacing: 0) {
                ForEach(AgentIntegrationKind.allCases) { kind in
                    if kind != AgentIntegrationKind.allCases.first { Divider().padding(.leading, 50) }
                    integrationRow(kind)
                }
            }
            .background(DS.cardFill, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(DS.cardStroke, lineWidth: 1))
            HStack(spacing: 4) {
                Text("页面打开时自动检测，能力以原应用实际回执为准。")
                Spacer(minLength: 4)
                if let date = integrations.lastDetectedAt { Text(date, style: .time).monospacedDigit() }
            }.font(.caption).foregroundStyle(.secondary)
            if let text = message ?? integrations.message ?? hub.lastError {
                Text(AgentText.localized(text)).font(.caption).foregroundStyle(.orange).textSelection(.enabled)
            }
            DisclosureGroup("原应用会话与接入测试", isExpanded: $showSessions) {
                sessionControls.padding(.top, 8)
            }.font(.subheadline)
        }
        .task {
            kimiEndpoint = hub.kimiEndpoint
            integrations.detect(diagnostics: hub.diagnostics)
            await refresh()
            while !Task.isCancelled {
                do { try await Task.sleep(for: .seconds(10)) } catch { return }
                guard !Task.isCancelled else { return }
                await refresh()
            }
        }
        .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.didLaunchApplicationNotification)) { _ in
            Task { await refresh() }
        }
        .onReceive(NSWorkspace.shared.notificationCenter.publisher(for: NSWorkspace.didTerminateApplicationNotification)) { _ in
            Task { await refresh() }
        }
    }

    private func integrationRow(_ kind: AgentIntegrationKind) -> some View {
        let status = integrations.status(kind)
        let diagnostic = hub.diagnostics.first { $0.id == kind.id }
        return VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                AgentBrandIcon(kind: kind)
                Button {
                    if !expanded.insert(kind).inserted { expanded.remove(kind) }
                } label: {
                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 6) {
                            Text(verbatim: kind.name).font(.system(size: 13, weight: .medium))
                            Image(systemName: expanded.contains(kind) ? "chevron.up" : "chevron.down")
                                .font(.system(size: 9, weight: .semibold)).foregroundStyle(.secondary)
                        }
                        HStack(spacing: 8) {
                            presenceLabel(status.presence)
                            Text(status.componentInstalled ? (kind.isBuiltIn ? "内置接入已启用" : "组件已安装") : "组件未安装")
                                .foregroundStyle(.secondary)
                        }.font(.caption)
                    }.frame(maxWidth: .infinity, alignment: .leading).contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(verbatim: kind.name))
                .accessibilityValue(expanded.contains(kind) ? Text("已展开") : Text("已收起"))
                Text(diagnostic?.isComplete == true ? "能力已探测" : "待验证")
                    .font(.caption).foregroundStyle(diagnostic?.isComplete == true ? DS.success : .secondary)
                    .fixedSize()
                if integrations.operation == kind { ProgressView().controlSize(.small).frame(width: 72) }
                else {
                    Button(status.componentInstalled ? "一键卸载" : "一键安装") { toggleComponent(kind, installed: status.componentInstalled) }
                        .controlSize(.small).frame(minWidth: 72)
                        .disabled(integrations.operation != nil || busy || hub.isSending)
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 9)
            if expanded.contains(kind) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(diagnostic?.detail ?? String(localized: "尚未取得能力检测结果。", bundle: .l10n))
                        .font(.caption).foregroundStyle(.secondary).textSelection(.enabled)
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 68), alignment: .leading)], alignment: .leading, spacing: 6) {
                        ForEach(AgentCapability.allCases, id: \.self) { capability in
                            Label(capabilityTitle(capability), systemImage: diagnostic?.capabilities.contains(capability) == true ? "checkmark.circle" : "minus.circle")
                                .font(.caption).foregroundStyle(diagnostic?.capabilities.contains(capability) == true ? DS.success : .secondary)
                        }
                    }
                    componentHelp(kind)
                    if kind == .kimiCode { kimiConfiguration }
                }.padding(.leading, 50).padding(.trailing, 12).padding(.bottom, 12)
            }
        }
    }

    @ViewBuilder private func presenceLabel(_ presence: AgentIntegrationStatus.Presence) -> some View {
        switch presence {
        case .running: Label("运行中", systemImage: "circle.fill").foregroundStyle(DS.success)
        case .detected: Label("已检测到", systemImage: "checkmark.circle").foregroundStyle(.secondary)
        case .notDetected: Label("未检测到", systemImage: "circle.dashed").foregroundStyle(.secondary)
        }
    }
    @ViewBuilder private func componentHelp(_ kind: AgentIntegrationKind) -> some View {
        Group {
            switch kind {
            case .claudeCode: Text("Hook 合并写入并备份；请在原 Claude Code 会话重新加载配置。")
            case .omp: Text("扩展安装后，在原 OMP 会话输入 /reload 加载；卸载后再次 /reload。")
            case .deepseekHarness:
                Text("安装生成本机插件包；需在 DSH 插件管理中加载到原运行实例。卸载后需在宿主中停用或重新加载。")
                if integrations.status(kind).componentInstalled {
                    Button("打开插件目录") { NSWorkspace.shared.activateFileViewerSelecting([AgentBridgeInstaller.dshPluginDirectory]) }.controlSize(.small)
                }
            case .workBuddy: Text("首次安装请选择当前 WorkBuddy 版本使用的 Hook JSON；此后记住位置，合并安装并保留备份。")
            case .kimiCode: Text("连接原 kimi web 服务；安装注册连接，卸载清除 AI 助理保存的地址和令牌。")
            case .claudeDesktop, .chatGPT: Text("内置辅助功能接入；安装启用，卸载停用。系统辅助功能权限与原应用数据保持不变。")
            }
        }.font(.caption).foregroundStyle(.secondary)
    }
    private var kimiConfiguration: some View {
        VStack(alignment: .leading, spacing: 6) {
            TextField("本机服务地址", text: $kimiEndpoint)
            SecureField("原 Kimi Code 服务访问令牌", text: $kimiToken)
            Button("保存并检测 Kimi") {
                perform {
                    try hub.configureKimi(endpoint: kimiEndpoint, token: kimiToken)
                    integrations.didConfigureKimi(hub: hub); kimiToken = ""
                    await refresh()
                }
            }.controlSize(.small).disabled(busy || hub.isSending || kimiToken.isEmpty || integrations.operation != nil)
        }.textFieldStyle(.roundedBorder)
    }
    private var sessionControls: some View {
        VStack(alignment: .leading, spacing: 8) {
            Picker("原应用会话", selection: Binding(get: { hub.selectedSession?.id ?? "" }, set: { id in
                if let session = hub.sessions.first(where: { $0.id == id }) { perform { try await hub.select(session) } }
                else { hub.clearSelection() }
            })) {
                Text("请选择会话").tag("")
                ForEach(hub.sessions) { session in Text(verbatim: session.name).tag(session.id) }
            }
            if hub.sessions.isEmpty { Text("暂未发现会话，请先加载接入组件并在原应用中打开会话。").font(.caption).foregroundStyle(.secondary) }
            TextEditor(text: $draft).frame(height: 64).overlay(RoundedRectangle(cornerRadius: 6).stroke(DS.cardStroke))
                .accessibilityLabel("接入测试消息")
            ViewThatFits(in: .horizontal) {
                HStack { sessionActions }
                VStack(alignment: .leading, spacing: 6) { sessionActions }
            }.controlSize(.small)
            Text("仅当前选中会话联动宠物与回复；发送、停止和最终回复需在原应用实测。")
                .font(.caption).foregroundStyle(.secondary)
        }
    }
    @ViewBuilder private var sessionActions: some View {
        Button("发送到所选会话") { let text = draft; perform { try await hub.sendPrompt(text); draft = "" } }
            .disabled(hub.selectedSession == nil || draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || busy || hub.isSending)
        Button("只写入原应用草稿") { perform { try await hub.insertDraft(draft) } }.disabled(hub.selectedSession == nil || draft.isEmpty || busy)
        Button("停止所选任务") { perform { try await hub.stop() } }.disabled(hub.selectedSession == nil || busy)
    }
    private func toggleComponent(_ kind: AgentIntegrationKind, installed: Bool) {
        message = nil
        var selectedFile: URL?
        if !installed, kind == .workBuddy, integrations.workBuddyConfigURL == nil {
            let panel = NSOpenPanel(); panel.canChooseDirectories = false; panel.allowsMultipleSelection = false
            panel.allowedContentTypes = [.json]
            panel.title = String(localized: "选择 WorkBuddy Hook 配置", bundle: .l10n)
            guard panel.runModal() == .OK, let url = panel.url else { return }
            selectedFile = url
        }
        Task {
            if installed { await integrations.uninstall(kind, hub: hub); if kind == .kimiCode { kimiEndpoint = hub.kimiEndpoint; kimiToken = "" } }
            else { expanded.insert(kind); await integrations.install(kind, hub: hub, workBuddyConfig: selectedFile) }
        }
    }
    /// 自动检测任务随页面消失取消；不启动Agent或改变其窗口/当前会话。
    private func refresh() async {
        guard integrations.operation == nil, !Task.isCancelled else { return }
        await hub.refresh()
        guard !Task.isCancelled else { return }
        integrations.detect(diagnostics: hub.diagnostics)
    }
    private func perform(_ operation: @escaping @MainActor () async throws -> Void) {
        guard !busy else { return }; busy = true; message = nil
        Task { defer { busy = false }; do { try await operation() } catch { message = error.localizedDescription } }
    }
    private func capabilityTitle(_ value: AgentCapability) -> LocalizedStringKey {
        switch value {
        case .discover: "发现"; case .activate: "选择"; case .insertDraft: "草稿"; case .submit: "发送"
        case .stop: "停止"; case .observeState: "状态"; case .readReply: "回复"
        }
    }
}
