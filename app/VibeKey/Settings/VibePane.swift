import SwiftUI

/// 用量置顶，接入列表居中；通知和测试等次要配置按需展开。
struct VibePane: View {
    let app: AppState
    @State private var showNotifications = false
    @State private var installed = false
    @State private var notificationError: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Codex 用量").font(.headline)
                AgentUsageDashboard(compact: true)
                Text("读取 Codex 账户的真实用量与会话元数据，不读取聊天正文。")
                    .font(.caption).foregroundStyle(.secondary)
            }
            AgentDiagnosticsView(hub: app.agentHub)
            Divider()
            DisclosureGroup("Codex 兼容通知", isExpanded: $showNotifications) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Text("Codex 通知 Hook").font(.subheadline)
                        Spacer()
                        Text(installed ? "已配置" : "未配置").font(.caption).foregroundStyle(.secondary)
                        Button(installed ? "一键卸载" : "一键安装") { updateNotification() }.controlSize(.small)
                        Button("测试通知") { app.agent.post(.done, source: "Codex") }.controlSize(.small)
                    }
                    Text("只管理 Codex 兼容通知；完整会话接入在上方列表配置。卸载保留其他 Hook 和账户设置。")
                        .font(.caption).foregroundStyle(.secondary)
                    if let notificationError { Text(notificationError).font(.caption).foregroundStyle(DS.danger) }
                }.padding(.top, 8)
            }.font(.subheadline)
            Text("选择原应用会话后，按住 Passport OK 说话；上键发送助手草稿，下键停止任务。当前会话状态联动宠物，回复以文字显示。")
                .font(.caption).foregroundStyle(.secondary)
        }
        .padding(.top, DS.Space.m)
        .onAppear { installed = AgentHookInstaller.isInstalled(.codex) }
    }
    /// 兼容通知与完整会话组件独立管理，删除时逐命令保留用户配置。
    private func updateNotification() {
        do {
            if installed { try AgentHookInstaller.uninstall(.codex) }
            else { try AgentHookInstaller.install(.codex) }
            installed = AgentHookInstaller.isInstalled(.codex); notificationError = nil
        } catch { notificationError = error.localizedDescription }
    }
}
