import AppKit

/// 只在桌面挂件窗口内提供原生菜单，避免 WebKit 的网页菜单抢占右键。
@MainActor
final class PetContextMenu: NSObject {
    private weak var window: NSWindow?
    private var eventMonitor: Any?
    private let openSettings: () -> Void

    init(window: NSWindow, openSettings: @escaping () -> Void) {
        self.window = window
        self.openSettings = openSettings
        super.init()
        eventMonitor = NSEvent.addLocalMonitorForEvents(matching: [.rightMouseDown, .leftMouseDown]) { [weak self] event in
            let consumed = MainActor.assumeIsolated { self?.handle(event) ?? false }
            return consumed ? nil : event
        }
    }

    isolated deinit { stop() }

    /// 隐藏仍可恢复原窗口；只在挂件真正停止时移除事件监视器。
    func stop() {
        if let eventMonitor { NSEvent.removeMonitor(eventMonitor) }
        eventMonitor = nil
    }

    private func handle(_ event: NSEvent) -> Bool {
        guard let window, event.window === window, !window.ignoresMouseEvents,
              event.type == .rightMouseDown || event.modifierFlags.contains(.control),
              let contentView = window.contentView else { return false }
        let menu = NSMenu()
        let settings = NSMenuItem(title: String(localized: "宠物设置", bundle: .l10n),
                                  action: #selector(showSettings), keyEquivalent: "")
        settings.target = self
        menu.addItem(settings)
        NSMenu.popUpContextMenu(menu, with: event, for: contentView)
        return true
    }

    @objc private func showSettings() { openSettings() }
}
