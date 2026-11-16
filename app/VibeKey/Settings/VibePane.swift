import SwiftUI

/// 智能体:查看 Codex 账户用量,用 Passport / 快捷键和 Claude Code、Codex 对话;
/// Agent 完成或请求确认时提醒你。
struct VibePane: View {
    let app: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            AgentDiagnosticsView(hub: app.agentHub).padding(.top, DS.Space.l)
            SettingsSection(title: "用量",
                            footer: "读取 Codex 账户的真实用量与会话元数据，不读取聊天正文。其他 Agent 暂无公开的用量接口时显示暂无数据。") {
                AgentUsageDashboard()
            }

            SettingsSection(title: "工作流") {
                Card {
                    VStack(alignment: .leading, spacing: DS.Space.s) {
                        step("1", "在上方选择原应用会话，或长按 Passport 下键选择云对话 / 应用会话")
                        step("2", "按住 OK 说话；上键只提交所选会话的助手草稿，下键停止所选任务")
                        step("3", "当前会话的状态联动宠物；最终回复按语音设置自动朗读")
                    }
                }
            }

            SettingsSection(title: "Codex 兼容通知", footer: "仅保留原 Codex 通知配置；Claude Code 的完整状态与回复 Hook 统一在上方安装。关闭 AI 助理硬件接管后，Passport 恢复原 Codex 操作。") {
                Card {
                    VStack(spacing: DS.Space.m) {
                        AgentHookRow(agent: .codex)
                    }
                }
                HStack {
                    Spacer()
                    Button("测试通知") { app.agent.post(.done, source: "Codex") }
                        .buttonStyle(SecondaryButtonStyle())
                }
                .padding(.top, DS.Space.xs)
            }
        }
    }

    private func step(_ number: String, _ text: LocalizedStringKey) -> some View {
        HStack(alignment: .top, spacing: DS.Space.s) {
            Text(verbatim: number)
                .font(.system(size: 11, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .frame(width: 18, height: 18)
                .background(Circle().fill(DS.accent))
            Text(text).font(.system(size: 12.5))
        }
    }
}

/// 一个 Agent 的配置行:名称 + 状态 + 一键配置。
private struct AgentHookRow: View {
    let agent: AgentHookInstaller.Agent
    @State private var installed = false
    @State private var error: String?

    var body: some View {
        HStack(spacing: DS.Space.m) {
            VStack(alignment: .leading, spacing: 2) {
                Text(verbatim: agent.name).font(.system(size: 13, weight: .medium))
                Text(verbatim: detail)
                    .font(.system(size: 11.5))
                    .foregroundStyle(error == nil ? Color.secondary : DS.danger)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
            if installed {
                Label("已配置", systemImage: "checkmark.circle.fill")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(DS.success)
            } else {
                Button("一键配置") { install() }
                    .buttonStyle(PrimaryButtonStyle())
            }
        }
        .onAppear { installed = AgentHookInstaller.isInstalled(agent) }
    }

    private var detail: String {
        if let error { return error }
        let path = agent.configURL.path.replacingOccurrences(of: NSHomeDirectory(), with: "~")
        if installed, let followUp = agent.followUp { return "\(path) · \(followUp)" }
        return path
    }

    private func install() {
        do {
            try AgentHookInstaller.install(agent)
            installed = true
            error = nil
        } catch {
            self.error = String(localized: "配置失败：\(error.localizedDescription)", bundle: .l10n)
        }
    }
}
