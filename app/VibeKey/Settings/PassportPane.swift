import SwiftUI

/// Passport:连接状态、按键映射、蓝牙与息屏。
struct PassportPane: View {
    let app: AppState

    var body: some View {
        @Bindable var settings = app.settings
        VStack(alignment: .leading, spacing: 0) {
            SettingsSection(title: "设备") {
                PassportSetupView(model: app.passportSetup)
            }

            PassportConnectionSection(link: app.deviceLink)

            PassportWiFiSection(link: app.deviceLink)

            SettingsSection(title: "离线显示", footer: "设备断开电脑后直接显示当前宠物的点阵画，不再使用独立背景图片。") {
                Card {
                    HStack {
                        Text("离线页使用所选宠物")
                        Spacer()
                        Button("选择宠物…") { app.windows.showSettings(.pet) }
                    }
                }
            }

            if app.assistantStore.usePassportForAssistant {
                SettingsSection(title: "AI 助理按键", footer: "独立云对话模式由设备执行按键；模式与配置同步在 AI 助理页管理。") {
                    Card {
                        VStack(alignment: .leading, spacing: DS.Space.s) {
                            Text("按住 OK 说话，松开发送；上键提交助手草稿，下键停止，长按下键选择云对话或应用会话。")
                                .font(.system(size: 12.5))
                            HStack {
                                Button("选择智能体会话…") { app.windows.showSettings(.vibe) }
                                Button("管理助手与同步…") { app.windows.showSettings(.assistant) }
                            }.buttonStyle(SecondaryButtonStyle())
                        }
                    }
                }
            } else {
                AgentHealthSection()

            SettingsSection(title: "语音输入目标", footer: "长按设备下键选择应用；Agent 应用还可以继续选项目和会话。按住 OK 时会自动切换到所选应用和输入框，同时开始收音。") {
                Card { HStack { Text(settings.deviceTargetName); Spacer(); Image(systemName: "scope").foregroundStyle(.secondary) } }
            }

            SettingsSection(title: "按键", footer: "按住 OK 键说话，松开转写；上键发送当前 Codex 输入框，下键停止任务，长按上键切换模式；录音时长按下键取消。") {
                Card {
                    VStack(spacing: DS.Space.m) {
                        keyRow("▲ 上键", $settings.deviceUpAction)
                        Divider()
                        keyRow("▼ 下键", $settings.deviceDownAction)
                        Divider()
                        keyRow("▼ 长按下键", $settings.deviceDownLongAction)
                    }
                }
            }
            }

            SettingsSection(title: "屏幕") {
                Card {
                    VStack(spacing: DS.Space.m) {
                        SettingRow(title: "自动息屏") {
                            Picker("", selection: $settings.deviceScreenOff) {
                                Text("30 秒").tag(30)
                                Text("1 分钟").tag(60)
                                Text("5 分钟").tag(300)
                                Text("永不").tag(0)
                            }
                            .labelsHidden().fixedSize()
                        }
                    }
                }
            }
        }
    }

    private func keyRow(_ title: LocalizedStringKey, _ binding: Binding<KeyAction>) -> some View {
        SettingRow(title: title) {
            Picker("", selection: binding) {
                ForEach(KeyAction.selectable) { Text($0.title).tag($0) }
            }
            .labelsHidden().fixedSize()
        }
    }
}
