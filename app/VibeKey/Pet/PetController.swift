import AppKit
import SwiftUI

/// 原生挂件窗口的生命周期由 AppState 管理，只有一个 renderer，不启动独立进程。
@MainActor @Observable
final class PetController {
    let settings: PetSettings
    private(set) var state: PetState = .idle
    private(set) var caption = ""
    private(set) var catalog: PetCatalog = .empty
    private(set) var catalogError: String?
    private(set) var loadingCatalog = false
    @ObservationIgnored private var panel: NSPanel?
    @ObservationIgnored private var renderer: PetWebRenderer?
    @ObservationIgnored private var running = false
    @ObservationIgnored private var observers: [NSObjectProtocol] = []

    init(settings: PetSettings? = nil) { self.settings = settings ?? PetSettings() }

    var displayedState: PetState { settings.followConversation ? state : settings.manualState }

    func loadCatalog() async {
        guard catalog.casts.isEmpty, !loadingCatalog else { return }
        loadingCatalog = true
        defer { loadingCatalog = false }
        do {
            catalog = try await ensureRenderer().catalog()
            // 固定目录升级或偏好损坏时恢复有效值，避免UI选择与实际导出角色不一致。
            if !catalog.casts.contains(where: { $0.id == settings.castID }) { chooseCast("dot") }
            if !catalog.faces.contains(where: { $0.id == settings.faceID }) {
                settings.faceID = catalog.casts.first(where: { $0.id == settings.castID })?.face ?? "capsule"
            }
            if !catalog.colors.contains(where: { $0.id == settings.colorID }) {
                settings.colorID = catalog.casts.first(where: { $0.id == settings.castID })?.color ?? "cream"
            }
            catalogError = nil
        } catch { catalogError = error.localizedDescription }
    }

    /// 导出当前完整角色资产；设备ACK之前不修改本地“已同步”的含义。
    func makeDeviceConfiguration(revision: UInt32) async throws -> Data {
        guard revision > 0 else { throw PetExportError.invalidData }
        return try await ensureRenderer().exportBundle(settings: settings, revision: revision)
    }

    func chooseCast(_ id: String) {
        guard let choice = catalog.casts.first(where: { $0.id == id }) else { return }
        settings.castID = choice.id
        settings.faceID = choice.face
        settings.colorID = choice.color
    }

    private func ensureRenderer() -> PetWebRenderer {
        if let renderer { return renderer }
        let renderer = PetWebRenderer()
        renderer.update(state: displayedState, reducedMotion: settings.reducedMotion,
                        paused: !running || !settings.enabled, appearance: settings.appearance)
        self.renderer = renderer
        return renderer
    }

    func start() {
        guard !running else { return }
        running = true
        observeSettings()
        refresh()
        let center = NSWorkspace.shared.notificationCenter
        observers.append(center.addObserver(forName: NSWorkspace.willSleepNotification, object: nil, queue: .main) {
            [weak self] _ in MainActor.assumeIsolated { self?.pauseAnimation(true) }
        })
        observers.append(center.addObserver(forName: NSWorkspace.didWakeNotification, object: nil, queue: .main) {
            [weak self] _ in MainActor.assumeIsolated { self?.refresh() }
        })
    }

    func stop() {
        running = false
        for observer in observers { NSWorkspace.shared.notificationCenter.removeObserver(observer) }
        observers.removeAll()
        pauseAnimation(true)
        panel?.orderOut(nil)
        panel = nil
        renderer = nil
    }

    func setState(_ state: PetState, caption: String = "") {
        self.state = state
        self.caption = String(caption.prefix(160))
        renderer?.update(state: displayedState, reducedMotion: settings.reducedMotion,
                         paused: !running || !settings.enabled, appearance: settings.appearance)
    }

    func resetPosition() {
        guard let panel, let screen = NSScreen.main else { return }
        panel.setFrameOrigin(NSPoint(x: screen.visibleFrame.maxX - panel.frame.width - 28,
                                     y: screen.visibleFrame.minY + 34))
    }

    private func pauseAnimation(_ paused: Bool) {
        renderer?.update(state: displayedState, reducedMotion: settings.reducedMotion, paused: paused,
                         appearance: settings.appearance)
    }

    private func makePanel() {
        let renderer = self.renderer ?? PetWebRenderer()
        self.renderer = renderer
        let panel = NSPanel(contentRect: NSRect(x: 0, y: 0, width: settings.size, height: settings.size),
            styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.isMovableByWindowBackground = true
        panel.hidesOnDeactivate = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        panel.contentView = renderer.webView
        panel.setFrameAutosaveName("AoraDesktopPet")
        self.panel = panel
        if !panel.setFrameUsingName("AoraDesktopPet") { resetPosition() }
    }

    private func refresh() {
        guard running else { return }
        guard settings.enabled else { pauseAnimation(true); panel?.orderOut(nil); return }
        if panel == nil { makePanel() }
        guard let panel else { return }
        let size = min(400, max(100, settings.size))
        panel.setContentSize(NSSize(width: size, height: size))
        panel.level = settings.alwaysOnTop ? .floating : .normal
        panel.ignoresMouseEvents = settings.clickThrough
        panel.orderFrontRegardless()
        renderer?.update(state: displayedState, reducedMotion: settings.reducedMotion, appearance: settings.appearance)
    }

    /// Observation 会在字段变更前回调；下一轮主线程刷新，避免捕获旧设置。
    private func observeSettings() {
        withObservationTracking {
            _ = settings.enabled; _ = settings.size; _ = settings.alwaysOnTop
            _ = settings.clickThrough; _ = settings.reducedMotion
            _ = settings.castID; _ = settings.faceID; _ = settings.colorID
            _ = settings.followConversation; _ = settings.manualState
        } onChange: { [weak self] in
            Task { @MainActor [weak self] in
                guard let self, self.running else { return }
                self.refresh()
                self.observeSettings()
            }
        }
    }
}
