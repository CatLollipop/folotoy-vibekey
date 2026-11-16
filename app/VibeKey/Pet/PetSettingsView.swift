import SwiftUI

/// 目录由固定官方引擎提供；选择同时驱动高清预览、桌面挂件和下一次设备资产导出。
struct PetSettingsView: View {
    @Bindable var controller: PetController
    var onSyncPet: (@MainActor () async -> Void)? = nil
    var canSyncPet = true
    var syncingPet = false
    var petSyncStatus: String? = nil

    var body: some View {
        @Bindable var settings = controller.settings
        VStack(alignment: .leading, spacing: 14) {
            PetVisualSelector(controller: controller)
            Text("选择表情后固定显示；打开跟随会话状态可恢复自动联动。外观、脸型、配色与表情会一同同步到设备。")
                .font(.caption).foregroundStyle(Color.primary.opacity(0.72))
                .fixedSize(horizontal: false, vertical: true)
            heading("桌面宠物")
            Card {
                VStack(alignment: .leading, spacing: 14) {
                    Toggle("显示桌面宠物", isOn: $settings.enabled)
                    Slider(value: $settings.size, in: 100...400, step: 10) { Text("挂件大小") }
                    Toggle("始终置顶", isOn: $settings.alwaysOnTop)
                    Toggle("鼠标穿透", isOn: $settings.clickThrough)
                    Toggle("减少动画", isOn: $settings.reducedMotion)
                    Button("恢复挂件位置") { controller.resetPosition() }
                }
            }
            heading("设备点阵宠物")
            Card {
                VStack(alignment: .leading, spacing: 14) {
                    Toggle("显示设备宠物", isOn: $settings.deviceEnabled)
                    Stepper("动画帧率：\(settings.deviceFPS)", value: $settings.deviceFPS, in: 6...20)
                    Stepper("点阵亮度：\(settings.deviceBrightness)%", value: $settings.deviceBrightness, in: 10...100, step: 10)
                    Text("在设备配置同步后生效。离线页始终显示当前宠物。按住设备 OK 说话，松开结束。")
                        .font(.caption).foregroundStyle(Color.primary.opacity(0.72))
                        .fixedSize(horizontal: false, vertical: true)
                    if let onSyncPet {
                        HStack(spacing: 10) {
                            Button("同步到 Passport") { Task { await onSyncPet() } }
                                .disabled(syncingPet || !canSyncPet)
                            if syncingPet { ProgressView().controlSize(.small) }
                        }
                    }
                    if let petSyncStatus, !petSyncStatus.isEmpty {
                        Text(petSyncStatus).font(.caption)
                            .foregroundStyle(Color.primary.opacity(0.72))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
            VStack(alignment: .leading, spacing: 6) {
                Link("Powered by Aora Bot", destination: URL(string: "https://github.com/sam70361/aora-bot")!)
                Text("固定版本 0.2.0 · 独立离线运行")
                    .font(.caption).foregroundStyle(Color.primary.opacity(0.72))
            }
        }
        .font(.system(size: 13))
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .padding(.top, 20)
        .task { await controller.loadCatalog() }
    }

    private func heading(_ title: LocalizedStringKey) -> some View {
        Text(title).font(.system(size: 12, weight: .semibold)).foregroundStyle(Color.primary.opacity(0.72))
    }
}
