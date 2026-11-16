import AppKit
import AVFoundation
import CoreFoundation
import Observation
import os

/// 编译正式Permissions类，所有系统读取均替换为内存读取器，不申请或改动本机权限。
@main
struct PermissionTests {
    @MainActor private final class Fixture {
        var microphone: AVAuthorizationStatus = .denied
        var accessibility = false
        var reads = 0

        var reader: Permissions.Reader {
            .init(microphone: { self.microphone }, accessibility: {
                self.reads += 1
                return self.accessibility
            })
        }
    }

    @MainActor static func main() {
        let fixture = Fixture()
        let center = NotificationCenter()
        let permissions = Permissions(reader: fixture.reader, notificationCenter: center)
        precondition(fixture.reads == 1 && !permissions.accessibility && !permissions.allRequiredGranted)

        // 正式Observation通知必须双向变化；不把旧的true缓存成永久授权。
        let changes = OSAllocatedUnfairLock(initialState: 0)
        withObservationTracking { _ = permissions.accessibility } onChange: {
            changes.withLock { $0 += 1 }
        }
        fixture.accessibility = true
        fixture.microphone = .authorized
        permissions.refresh()
        precondition(permissions.accessibility && permissions.allRequiredGranted)
        precondition(changes.withLock { $0 } == 1)
        withObservationTracking { _ = permissions.accessibility } onChange: {
            changes.withLock { $0 += 1 }
        }
        fixture.accessibility = false
        permissions.refresh()
        precondition(!permissions.accessibility && !permissions.allRequiredGranted)
        precondition(changes.withLock { $0 } == 2)

        let settings = Permissions.PollingOwner()
        let onboarding = Permissions.PollingOwner()
        fixture.accessibility = true
        let beforeAppear = fixture.reads
        permissions.startPolling(for: settings)
        precondition(permissions.accessibility && fixture.reads == beforeAppear + 1)
        // 重复onAppear不创建额外持有人，第二个页面仍有自己的订阅。
        permissions.startPolling(for: settings)
        permissions.startPolling(for: onboarding)
        permissions.stopPolling(for: settings)
        permissions.stopPolling(for: settings)
        fixture.accessibility = false
        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        precondition(!permissions.accessibility)

        // 使用真正的RunLoop公共模式计时器，验证非default模式也能看到系统读取变化。
        let tracking = RunLoop.Mode("AI-Assistant-Permission-Tracking-Test")
        CFRunLoopAddCommonMode(CFRunLoopGetMain(), CFRunLoopMode(rawValue: tracking.rawValue as CFString))
        fixture.accessibility = true
        let beforeTimer = fixture.reads
        let deadline = Date().addingTimeInterval(2.5)
        while fixture.reads == beforeTimer && Date() < deadline {
            _ = RunLoop.main.run(mode: tracking, before: deadline)
        }
        precondition(fixture.reads > beforeTimer && permissions.accessibility)

        // 最后一个页面退出必须同时注销激活监听和计时器，不持续轮询隐藏窗口。
        permissions.stopPolling(for: onboarding)
        fixture.accessibility = false
        let beforeHidden = fixture.reads
        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        _ = RunLoop.main.run(mode: tracking, before: Date().addingTimeInterval(1.2))
        precondition(fixture.reads == beforeHidden)
        permissions.startPolling(for: settings)
        precondition(!permissions.accessibility && fixture.reads == beforeHidden + 1)
        permissions.stopPolling(for: settings)

        // 页面/组合根被释放时清理资源，测试只留弱引用也不能维持轮询。
        weak var released: Permissions?
        do {
            let temporary = Permissions(reader: fixture.reader, notificationCenter: center)
            released = temporary
            temporary.startPolling(for: settings)
        }
        precondition(released == nil)
        let beforeReleased = fixture.reads
        center.post(name: NSApplication.didBecomeActiveNotification, object: nil)
        precondition(fixture.reads == beforeReleased)
        print("PASS: production permission observation false/true/false, immediate refresh, shared page owners, activation and common-mode lifecycle")
    }
}
