import SwiftUI

/// Passport:连接状态、按键映射、蓝牙与息屏。
struct PassportPane: View {
    let app: AppState

    var body: some View {
        @Bindable var settings = app.settings
        VStack(alignment: .leading, spacing: 0) {
            SettingsSection(title: "设备") {
                PassportSetupView(model: app.passportSetup, assistantControls: app.assistantStore.usePassportForAssistant,
                                  standalone: app.assistantSync.mode == "standalone")
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
                SettingsSection(title: "AI 助理按键", footer: "电脑模式请先在“智能体”中选择已有会话；没有官方发送通道时仅提醒。模式与配置同步在 AI 助理页管理。") {
                    Card {
                        VStack(alignment: .leading, spacing: DS.Space.s) {
                            Text("连接电脑：按住 OK 录音，松开保存草稿；聊天流中草稿尾部可见后，再单独短按 OK 确认发送。上下键按屏阅读，长按下键打开会话与任务菜单。AI 助理：按住 OK 说话，松开提交云对话。长按上键切换运行模式。")
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

            SettingsSection(title: "语音输入目标", footer: "此处保留通用语音输入目标配置。AI 助理已有会话接入请到“智能体”选择；此设置不授予原应用会话的官方发送能力。") {
                Card { HStack { Text(settings.deviceTargetName); Spacer(); Image(systemName: "scope").foregroundStyle(.secondary) } }
            }

            SettingsSection(title: "按键", footer: "以下映射用于通用听写。原应用会话请在 AI 助理中启用 Passport 接管；连接电脑时松开录音只保存草稿，单独短按 OK 确认发送。") {
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
