import SwiftUI
import WebKit
import CoreFoundation

/// 设置页只托管离线选择器；允许的消息是选择意图，没有文件、网络或设备凭据能力。
struct PetVisualSelector: View {
    @Bindable var controller: PetController
    var canvasHeight:CGFloat = 600
    var onSyncPet: (@MainActor () async -> Void)? = nil
    var canSyncPet = true
    var syncingPet = false
    var petSyncStatus: String? = nil
    @Environment(\.locale) private var locale
    @State private var failed = false
    @State private var reloadID = UUID()

    var body: some View {
        ZStack {
            PetSelectorWebView(controller: controller, locale: locale, onSyncPet: onSyncPet,
                               canSyncPet: canSyncPet, syncingPet: syncingPet,
                               petSyncStatus: petSyncStatus, failed: $failed)
                .id(reloadID)
            if failed {
                VStack(spacing: 14) {
                    Text("宠物预览暂不可用，请重新加载。")
                    Button("重新加载") { failed = false; reloadID = UUID() }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color(nsColor: .windowBackgroundColor))
            }
        }
        .frame(height: canvasHeight)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .accessibilityLabel(Text("宠物外观与表情选择器"))
    }
}

/// 与挂件的拖拽WebView分开：此页必须保留网页按钮、键盘和滚动的原生事件。
private struct PetSelectorWebView: NSViewRepresentable {
    let controller: PetController
    let locale: Locale
    let onSyncPet: (@MainActor () async -> Void)?
    let canSyncPet: Bool
    let syncingPet: Bool
    let petSyncStatus: String?
    @Binding var failed: Bool

    func makeCoordinator() -> Coordinator { Coordinator(controller: controller, failed: $failed) }
    func makeNSView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.userContentController.add(WeakPetSelectionHandler(context.coordinator), name: "petSelection")
        let view = WKWebView(frame: .zero, configuration: configuration)
        view.navigationDelegate = context.coordinator
        view.isInspectable = false
        context.coordinator.webView = view
        if let url = Coordinator.resourceURL {
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else { failed = true }
        return view
    }
    func updateNSView(_ view: WKWebView, context: Context) {
        // 读取这些可观察字段，使会话事件和原生控件变更都能刷新选择器。
        context.coordinator.onSyncPet = onSyncPet
        context.coordinator.canSyncPet = canSyncPet
        context.coordinator.syncingPet = syncingPet
        let settings = controller.settings
        context.coordinator.payload = ["appearance": settings.appearance.javascriptValue,
            "settings": ["desktopEnabled": settings.enabled, "size": settings.size,
                         "alwaysOnTop": settings.alwaysOnTop, "clickThrough": settings.clickThrough,
                         "reducedMotion": settings.reducedMotion, "deviceEnabled": settings.deviceEnabled,
                         "deviceFPS": settings.deviceFPS, "deviceBrightness": settings.deviceBrightness],
            "sync": ["available": onSyncPet != nil, "connected": canSyncPet,
                     "busy": syncingPet, "status": String((petSyncStatus ?? "").prefix(400))],
            "state": controller.displayedState.rawValue,
            "followConversation": controller.settings.followConversation,
            "reducedMotion": controller.settings.reducedMotion,
            "locale": locale.language.languageCode?.identifier == "zh" ? "zh" : "en"]
        context.coordinator.flush()
    }
    static func dismantleNSView(_ view: WKWebView, coordinator: Coordinator) {
        coordinator.ready = false
        coordinator.task?.cancel()
        view.configuration.userContentController.removeScriptMessageHandler(forName: "petSelection")
        view.evaluateJavaScript("window.petSelector?.destroy()", completionHandler: nil)
        view.navigationDelegate = nil
        view.stopLoading()
    }

    @MainActor final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        let controller: PetController
        var failed: Binding<Bool>
        weak var webView: WKWebView?
        var ready = false
        var payload: [String: Any] = [:]
        var task: Task<Void, Never>?
        var onSyncPet: (@MainActor () async -> Void)?
        var canSyncPet = false
        var syncingPet = false
        private var localSyncing = false
        init(controller: PetController, failed: Binding<Bool>) { self.controller = controller; self.failed = failed }
        static var resourceURL: URL? { PetWebRenderer.resourceURL?.deletingLastPathComponent().appendingPathComponent("selector.html") }

        func flush() {
            guard ready, let webView else { return }
            task?.cancel()
            var snapshot = payload
            if var sync = snapshot["sync"] as? [String: Any] {
                sync["busy"] = syncingPet || localSyncing
                snapshot["sync"] = sync
            }
            let arguments = snapshot
            task = Task { @MainActor [weak self] in
                do {
                    try Task.checkCancellation()
                    _ = try await webView.callAsyncJavaScript("window.petSelector.apply(payload)",
                        arguments: ["payload": arguments], in: nil, contentWorld: .page)
                } catch is CancellationError { }
                catch { if !Task.isCancelled { self?.failed.wrappedValue = true } }
            }
        }
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            task?.cancel()
            task = Task { @MainActor [weak self] in
                guard let self else { return }
                await controller.loadCatalog()
                // 另一位调用者正在载入同一目录时，等待它完成后再开放原生选择意图。
                while controller.loadingCatalog && !Task.isCancelled {
                    try? await Task.sleep(for: .milliseconds(30))
                }
                guard !Task.isCancelled else { return }
                ready = !controller.catalog.casts.isEmpty
                failed.wrappedValue = !ready
                flush()
            }
        }
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { failed.wrappedValue = true }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) { failed.wrappedValue = true }
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { ready = false; failed.wrappedValue = true }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void) {
            decisionHandler(action.targetFrame?.isMainFrame == true && action.request.url == Self.resourceURL ? .allow : .cancel)
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard ready, message.name == "petSelection", message.frameInfo.isMainFrame,
                  message.frameInfo.request.url == Self.resourceURL,
                  let body = message.body as? [String: Any], (1...3).contains(body.count),
                  let action = body["action"] as? String else { return }
            let settings = controller.settings, catalog = controller.catalog
            if action == "setting" {
                applySetting(body)
                return
            }
            if Set(body.keys) == ["action"] {
                switch action {
                case "resetPosition": controller.resetPosition()
                case "syncPet":
                    guard canSyncPet, !syncingPet, !localSyncing, let onSyncPet else { return }
                    localSyncing = true
                    flush()
                    // 用户已发起的事务由上层管理，关闭选择器不会取消或重复提交它。
                    Task { @MainActor [weak self] in
                        await onSyncPet()
                        self?.localSyncing = false
                        self?.flush()
                    }
                case "attribution":
                    NSWorkspace.shared.open(URL(string: "https://github.com/sam70361/aora-bot")!)
                default: break
                }
                return
            }
            if action == "follow" {
                // NSNumber的任意整数不能伪装为布尔开关。
                guard Set(body.keys) == ["action", "enabled"], let value = body["enabled"] as? NSNumber,
                      CFGetTypeID(value) == CFBooleanGetTypeID() else { return }
                settings.followConversation = value.boolValue
                return
            }
            guard Set(body.keys) == ["action", "id"], let id = body["id"] as? String,
                  !id.isEmpty, id.utf8.count <= 80 else { return }
            switch action {
            case "cast": controller.chooseCast(id)
            case "style": controller.chooseStyle(id)
            case "face" where catalog.faces.contains(where: { $0.id == id }): settings.faceID = id
            case "color" where catalog.colors.contains(where: { $0.id == id }): settings.colorID = id
            case "state" where catalog.states.contains(where: { $0.id == id }):
                if let state = PetState(rawValue: id) { settings.manualState = state; settings.followConversation = false }
            default: break
            }
        }

        /// 精确键集合及类型/步进校验；网页不能选择UserDefaults键或越界写入设置。
        private func applySetting(_ body: [String: Any]) {
            guard Set(body.keys) == ["action", "key", "value"], let key = body["key"] as? String,
                  let value = body["value"] as? NSNumber else { return }
            let settings = controller.settings
            if CFGetTypeID(value) == CFBooleanGetTypeID() {
                switch key {
                case "desktopEnabled": settings.enabled = value.boolValue
                case "alwaysOnTop": settings.alwaysOnTop = value.boolValue
                case "clickThrough": settings.clickThrough = value.boolValue
                case "reducedMotion": settings.reducedMotion = value.boolValue
                case "deviceEnabled": settings.deviceEnabled = value.boolValue
                default: break
                }
                return
            }
            let number = value.doubleValue
            guard number.isFinite, number.rounded() == number else { return }
            switch key {
            case "size" where (100...400).contains(number) && number.truncatingRemainder(dividingBy: 10) == 0:
                settings.size = number
            case "deviceFPS" where (6...20).contains(number): settings.deviceFPS = Int(number)
            case "deviceBrightness" where (10...100).contains(number) && number.truncatingRemainder(dividingBy: 10) == 0:
                settings.deviceBrightness = Int(number)
            default: break
            }
        }
    }
}

/// WKUserContentController持有handler；弱转发避免关闭设置页后保留controller和WebKit进程。
@MainActor private final class WeakPetSelectionHandler: NSObject, WKScriptMessageHandler {
    weak var target: (any WKScriptMessageHandler)?
    init(_ target: any WKScriptMessageHandler) { self.target = target }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}
