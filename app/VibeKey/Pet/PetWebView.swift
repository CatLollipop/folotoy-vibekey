import SwiftUI
import WebKit

/// WebKit默认消费鼠标拖动；原生窗口拖拽由此处显式接管，穿透模式由NSPanel处理。
@MainActor
private final class PetHostingWebView: WKWebView {
    override func mouseDown(with event: NSEvent) { window?.performDrag(with: event) }
}

/// 独立离线页面只承载 Aora 动画；不注册原生脚本消息能力，也不接触对话正文或密钥。
@MainActor
final class PetWebRenderer: NSObject, WKNavigationDelegate {
    let webView: WKWebView
    private var loaded = false
    private var state: PetState = .idle
    private var reducedMotion = false
    private var paused = false
    private var appearance: PetAppearance = .dot
    private(set) var loadError: String?

    override init() {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        webView = PetHostingWebView(frame: .zero, configuration: configuration)
        super.init()
        webView.navigationDelegate = self
        webView.setValue(false, forKey: "drawsBackground")
        webView.isInspectable = false
        if let url = Self.resourceURL {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else {
            loadError = "AoraPet.bundle is missing"
        }
    }

    static var resourceURL: URL? {
        if let url = Bundle.main.url(forResource: "AoraPet", withExtension: "bundle"),
           let bundle = Bundle(url: url), let html = bundle.url(forResource: "index", withExtension: "html") {
            return html
        }
        // XcodeGen 的文件组资源会扁平复制；两种打包方式都必须只指向本地资源。
        return Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "AoraPet.bundle")
    }

    /// 用户明确重试目录时重载同一宿主；保持NSPanel已连接的WebView和当前设置。
    func reload() {
        loaded = false
        loadError = nil
        if let url = Self.resourceURL {
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        } else { loadError = "AoraPet.bundle is missing" }
    }

    func update(state: PetState, reducedMotion: Bool, paused: Bool = false, appearance: PetAppearance = .dot) {
        self.state = state
        self.reducedMotion = reducedMotion
        self.paused = paused
        self.appearance = appearance
        flush()
    }

    private func waitUntilReady() async throws {
        let deadline = ContinuousClock.now + .seconds(12)
        while !loaded {
            try Task.checkCancellation()
            if loadError != nil { throw PetExportError.unavailable }
            if ContinuousClock.now >= deadline { throw PetExportError.timeout }
            try await Task.sleep(for: .milliseconds(50))
        }
    }

    func catalog() async throws -> PetCatalog {
        try await waitUntilReady()
        let value = try await webView.callAsyncJavaScript("return JSON.stringify(window.AoraPetCatalog)", arguments: [:], in: nil, contentWorld: .page)
        guard let text = value as? String, let data = text.data(using: .utf8) else { throw PetExportError.invalidData }
        return try JSONDecoder().decode(PetCatalog.self, from: data)
    }

    /// 原生只接收一次有界二进制，导出参数中没有API Key或会话正文。
    func exportBundle(settings: PetSettings, revision: UInt32) async throws -> Data {
        try await waitUntilReady()
        var options: [String: Any] = settings.appearance.javascriptValue
        options["revision"] = revision
        options["enabled"] = settings.deviceEnabled
        options["fps"] = settings.deviceFPS
        options["brightness"] = settings.deviceBrightness
        options["state"] = settings.manualState.rawValue
        options["followConversation"] = settings.followConversation
        let value = try await webView.callAsyncJavaScript("return window.petHost.exportBundle(options)",
            arguments: ["options": options], in: nil, contentWorld: .page)
        guard let text = value as? String, let bytes = Data(base64Encoded: text), bytes.count <= 131072,
              bytes.count >= 112, bytes.prefix(8) == Data("AORAPET2".utf8) else { throw PetExportError.invalidData }
        return bytes
    }

    private func flush() {
        guard loaded else { return }
        // callAsyncJavaScript 通过参数传值，状态字符串不拼接为可执行源码。
        let arguments: [String: Any] = ["state": state.rawValue, "reducedMotion": reducedMotion, "paused": paused,
                                      "appearance": appearance.javascriptValue]
        Task { @MainActor [weak self] in
            guard let self else { return }
            do {
                _ = try await self.webView.callAsyncJavaScript("window.petHost.apply(state, reducedMotion, paused, appearance)",
                    arguments: arguments, in: nil, contentWorld: .page)
            } catch { self.loadError = error.localizedDescription }
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { loaded = true; flush() }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        loadError = error.localizedDescription
    }

    /// 禁止网页自己跳转到网络或其他文件；主页加载以外没有需要的导航。
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void) {
        decisionHandler(action.request.url == Self.resourceURL ? .allow : .cancel)
    }
}

struct PetPreview: NSViewRepresentable {
    let state: PetState
    let reducedMotion: Bool
    var appearance: PetAppearance = .dot
    func makeCoordinator() -> PetWebRenderer { PetWebRenderer() }
    func makeNSView(context: Context) -> WKWebView { context.coordinator.webView }
    func updateNSView(_ view: WKWebView, context: Context) {
        context.coordinator.update(state: state, reducedMotion: reducedMotion, appearance: appearance)
    }
    static func dismantleNSView(_ view: WKWebView, coordinator: PetWebRenderer) {
        coordinator.update(state: .idle, reducedMotion: true, paused: true)
        view.stopLoading()
    }
}
