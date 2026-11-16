import SwiftUI
import WebKit
import CoreFoundation

/// 设置页只托管离线选择器；允许的消息是选择意图，没有文件、网络或设备凭据能力。
struct PetVisualSelector: View {
    @Bindable var controller: PetController
    @Environment(\.locale) private var locale
    @State private var failed = false
    @State private var reloadID = UUID()

    var body: some View {
        ZStack {
            PetSelectorWebView(controller: controller, locale: locale, failed: $failed)
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
        .frame(height: 600)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .accessibilityLabel(Text("宠物外观与表情选择器"))
    }
}

/// 与挂件的拖拽WebView分开：此页必须保留网页按钮、键盘和滚动的原生事件。
private struct PetSelectorWebView: NSViewRepresentable {
    let controller: PetController
    let locale: Locale
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
        context.coordinator.payload = ["appearance": controller.settings.appearance.javascriptValue,
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
        init(controller: PetController, failed: Binding<Bool>) { self.controller = controller; self.failed = failed }
        static var resourceURL: URL? { PetWebRenderer.resourceURL?.deletingLastPathComponent().appendingPathComponent("selector.html") }

        func flush() {
            guard ready, let webView else { return }
            task?.cancel()
            let snapshot = payload
            task = Task { @MainActor [weak self] in
                do {
                    try Task.checkCancellation()
                    _ = try await webView.callAsyncJavaScript("window.petSelector.apply(payload)",
                        arguments: ["payload": snapshot], in: nil, contentWorld: .page)
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
                  let body = message.body as? [String: Any], body.count == 2,
                  let action = body["action"] as? String else { return }
            let settings = controller.settings, catalog = controller.catalog
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
