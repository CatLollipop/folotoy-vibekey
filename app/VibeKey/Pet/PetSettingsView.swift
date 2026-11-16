import SwiftUI

/// 目录由固定官方引擎提供；选择同时驱动高清预览、桌面挂件和下一次设备资产导出。
struct PetSettingsView: View {
    @Bindable var controller: PetController
    @State private var search = ""

    private var useChinese: Bool { Locale.current.language.languageCode?.identifier == "zh" }
    private var casts: [PetCatalog.Cast] {
        controller.catalog.casts.filter {
            $0.id == controller.settings.castID || search.isEmpty ||
            "\($0.name) \($0.englishName) \($0.id) \($0.theme) \($0.themeName ?? "") \($0.englishThemeName ?? "")".localizedCaseInsensitiveContains(search)
        }
    }
    private var selectedCast: PetCatalog.Cast? { controller.catalog.casts.first { $0.id == controller.settings.castID } }

    var body: some View {
        @Bindable var settings = controller.settings
        VStack(alignment: .leading, spacing: 14) {
            heading("外观与表情")
            Card {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .center, spacing: 18) {
                        PetPreview(state: controller.displayedState, reducedMotion: settings.reducedMotion,
                                   appearance: settings.appearance)
                            .frame(width: 170, height: 170)
                            .accessibilityLabel(Text("宠物实时预览"))
                        VStack(alignment: .leading, spacing: 8) {
                            Text(selectedCast.map { useChinese ? $0.name : $0.englishName } ?? "Aora Bot")
                                .font(.headline)
                            Text("电脑显示高清矢量动画，设备显示点阵动画。")
                                .foregroundStyle(Color.primary.opacity(0.72))
                                .fixedSize(horizontal: false, vertical: true)
                            if controller.loadingCatalog { ProgressView("加载宠物目录…").controlSize(.small) }
                            else if !controller.catalog.casts.isEmpty {
                                Text("\(controller.catalog.casts.count) 种外观 · \(controller.catalog.faces.count) 种脸型 · \(controller.catalog.states.count) 种表情")
                                    .font(.caption).foregroundStyle(Color.primary.opacity(0.72))
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                    if let error = controller.catalogError {
                        Text(error).font(.caption).foregroundStyle(.red)
                        Button("重新加载目录") { Task { await controller.loadCatalog() } }
                    }
                    // macOS原生placeholder会忽略prompt颜色，空值时显式绘制同等对比度提示。
                    ZStack(alignment: .leading) {
                        TextField("", text: $search).textFieldStyle(.roundedBorder)
                            .accessibilityLabel(Text("搜索外观名称或主题"))
                        if search.isEmpty {
                            Text("搜索外观名称或主题").foregroundStyle(Color.primary.opacity(0.72))
                                .padding(.horizontal, 6).allowsHitTesting(false).accessibilityHidden(true)
                        }
                    }
                    Picker("宠物外观", selection: Binding(get: { settings.castID }, set: { controller.chooseCast($0) })) {
                        ForEach(casts) { cast in
                            Text("\(useChinese ? cast.name : cast.englishName) · \(cast.id)").tag(cast.id)
                        }
                    }.disabled(controller.catalog.casts.isEmpty)
                    Picker("脸型", selection: $settings.faceID) {
                        ForEach(controller.catalog.faces) { face in
                            Text(useChinese ? face.name : (face.englishName ?? face.id)).tag(face.id)
                        }
                    }.disabled(controller.catalog.faces.isEmpty)
                    Picker("配色", selection: $settings.colorID) {
                        ForEach(controller.catalog.colors) { color in
                            Text("\(color.name) · \(color.hex)").tag(color.id)
                        }
                    }.disabled(controller.catalog.colors.isEmpty)
                    Toggle("跟随会话状态", isOn: $settings.followConversation)
                    Picker("表情", selection: Binding(get: { settings.manualState.rawValue }, set: {
                        if let state = PetState(rawValue: $0) { settings.manualState = state; settings.followConversation = false }
                    })) {
                        ForEach(controller.catalog.states) { state in
                            Text(useChinese ? state.name : (state.englishName ?? state.id)).tag(state.id)
                        }
                    }.disabled(controller.catalog.states.isEmpty)
                    Text("选择表情后固定显示；打开跟随会话状态可恢复自动联动。外观、脸型、配色与表情会一同同步到设备。")
                        .font(.caption).foregroundStyle(Color.primary.opacity(0.72))
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
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
                }
            }
            VStack(alignment: .leading, spacing: 6) {
                Link("Powered by Aora Bot", destination: URL(string: "https://github.com/sam70361/aora-bot")!)
                Text("固定版本 0.2.0 · 独立离线运行")
                    .font(.caption).foregroundStyle(Color.primary.opacity(0.72))
            }
        }
        .font(.system(size: 13))
        .frame(maxWidth: .infinity, minHeight: 960, alignment: .topLeading)
        .padding(.top, 20)
        .task { await controller.loadCatalog() }
    }

    private func heading(_ title: LocalizedStringKey) -> some View {
        Text(title).font(.system(size: 12, weight: .semibold)).foregroundStyle(Color.primary.opacity(0.72))
    }
}
