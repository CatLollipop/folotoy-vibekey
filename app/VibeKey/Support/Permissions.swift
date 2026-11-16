import AppKit
import AVFoundation
import ApplicationServices

/// 麦克风与辅助功能权限。系统音频录制权限没有公开的查询接口,第一次采集时由系统弹窗申请。
@MainActor @Observable
final class Permissions {
    /// 每个可见权限页面持有独立身份，重复出现不累计，关闭其它页面不会停止自己的刷新。
    struct PollingOwner: Hashable, Sendable {
        private let id = UUID()
        init() {}
    }

    /// 正式路径只读本进程的系统权限；测试可注入读取器，不申请或变更真实权限。
    struct Reader {
        var microphone: @MainActor () -> AVAuthorizationStatus
        var accessibility: @MainActor () -> Bool

        static var system: Reader {
            Reader(microphone: { AVCaptureDevice.authorizationStatus(for: .audio) },
                   accessibility: { AXIsProcessTrusted() })
        }
    }

    private(set) var microphone: AVAuthorizationStatus = .notDetermined
    private(set) var accessibility = false
    @ObservationIgnored private let reader: Reader
    @ObservationIgnored private let notificationCenter: NotificationCenter
    @ObservationIgnored private var pollingOwners = Set<PollingOwner>()
    @ObservationIgnored private var timer: Timer?
    @ObservationIgnored private var activationObserver: NSObjectProtocol?

    init(reader: Reader = .system, notificationCenter: NotificationCenter = .default) {
        self.reader = reader
        self.notificationCenter = notificationCenter
        refresh()
    }

    isolated deinit {
        timer?.invalidate()
        if let activationObserver { notificationCenter.removeObserver(activationObserver) }
    }

    func refresh() {
        microphone = reader.microphone()
        accessibility = reader.accessibility()
    }

    var allRequiredGranted: Bool { microphone == .authorized && accessibility }

    /// 页面出现立即读取，返回本应用也立即读取；仅在至少一个权限页面可见时保留轮询。
    func startPolling(for owner: PollingOwner) {
        refresh()
        pollingOwners.insert(owner)
        guard timer == nil else { return }
        let timer = Timer(timeInterval: 1, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.refresh() }
        }
        self.timer = timer
        // 菜单跟踪与模态交互期间仍更新，避免默认run loop mode暂停导致旧状态滞留。
        RunLoop.main.add(timer, forMode: .common)
        activationObserver = notificationCenter.addObserver(forName: NSApplication.didBecomeActiveNotification,
                                                            object: nil, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated { self?.refresh() }
        }
    }

    func stopPolling(for owner: PollingOwner) {
        pollingOwners.remove(owner)
        guard pollingOwners.isEmpty else { return }
        timer?.invalidate()
        timer = nil
        if let activationObserver { notificationCenter.removeObserver(activationObserver) }
        activationObserver = nil
    }

    func requestMicrophone() {
        switch microphone {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .audio) { _ in
                Task { @MainActor in self.refresh() }
            }
        default:
            open("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
        }
    }

    func requestAccessibility() {
        let options = ["AXTrustedCheckOptionPrompt": true] as CFDictionary
        if !AXIsProcessTrustedWithOptions(options) {
            open("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
        }
        refresh()
    }

    func openSystemAudioSettings() {
        open("x-apple.systempreferences:com.apple.preference.security?Privacy_AudioCapture")
    }

    private func open(_ url: String) {
        if let u = URL(string: url) { NSWorkspace.shared.open(u) }
    }
}
