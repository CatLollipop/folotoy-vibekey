import AppKit
import Foundation

/// 显式硬件诊断只注入合成事件，不启动应用发现、Hook、听写或任何云服务。
/// 使用正式通知归并/队列/DeviceLink；报告只保留ACK和字节数，不写消息正文或设备身份。
@MainActor enum DeviceNotificationDiagnostics {
    static func runIfRequested() -> Bool {
        let args = ProcessInfo.processInfo.arguments
        guard let index = args.firstIndex(of: "--diagnose-device-notification"),
              args.indices.contains(index + 1) else { return false }
        let output = URL(fileURLWithPath: args[index + 1])
        let requireWiFi = args.contains("--require-wifi")
        Task {
            let link = DeviceLink()
            // 本入口只验收USB/已配对Wi-Fi，不启动无关蓝牙扫描或权限交互。
            link.bluetoothEnabled = false
            let hub = AgentHub()
            let legacy = AgentNotifier()
            let coordinator = AgentNotificationCoordinator(hub: hub, legacy: legacy, link: link)
            var report: [String: Any] = ["synthetic": true, "stage": "connecting",
                "containsMessageBody": false, "requiredTransport": requireWiFi ? "wifi" : "usb"]
            var receipts: [[String: Any]] = []
            var finalNotice: PassportNotification?
            func save() {
                report["receipts"] = receipts
                guard let data = try? JSONSerialization.data(withJSONObject: report,
                    options: [.prettyPrinted, .sortedKeys]) else { return }
                try? data.write(to: output, options: .atomic)
            }
            coordinator.onDelivered = { notice, delivery in
                receipts.append(["revision": notice.revision, "bodyBytes": notice.text.utf8.count,
                    "transport": delivery.link, "schema": delivery.capability.schema,
                    "commitACK": delivery.commit.ok, "offset": delivery.commit.offset,
                    "checksumMatches": delivery.commit.checksum == notice.checksum,
                    "chunks": delivery.acknowledgedChunks, "resumedOffset": delivery.resumedOffset])
                if !notice.text.isEmpty { finalNotice = notice }
                save()
            }
            link.start()
            defer { coordinator.stop(); link.stop() }
            save()
            let connectionDeadline = ContinuousClock.now + .seconds(35)
            while (requireWiFi ? !link.wifiReady : link.connection != .usb),
                  ContinuousClock.now < connectionDeadline {
                try? await Task.sleep(for: .milliseconds(100))
            }
            if requireWiFi {
                link.suspendUSB()
                while link.connection != .wifi, ContinuousClock.now < connectionDeadline {
                    try? await Task.sleep(for: .milliseconds(100))
                }
            }
            guard link.connection == (requireWiFi ? .wifi : .usb) else {
                report["stage"] = "failed"; report["errorCode"] = "requested_transport_unavailable"
                save(); NSApp.terminate(nil); return
            }
            if args.contains("--test-companion-mic") {
                do {
                    let status = try await link.assistantRequest([], op: "status")
                    guard status.mode == "companion" else { throw DeviceNotificationError.invalid }
                    let counter = SampleCounter()
                    let microphone = PassportMicSource(link: link)
                    microphone.onSamples = { counter.append($0.count) }
                    link.sendState(.rec, mode: .dict)
                    try microphone.start()
                    try? await Task.sleep(for: .seconds(2))
                    microphone.stop()
                    link.sendState(.idle, mode: .dict)
                    report["companionMicSamples"] = counter.value
                    report["companionMicMinimumSamples"] = 24_000
                    // 2秒/16kHz预期约32K；预留codec启动与DMA边界，不把短流误报通过。
                    guard counter.value >= 24_000 else { throw DeviceNotificationError.unavailable }
                } catch {
                    report["stage"] = "failed"; report["errorCode"] = "companion_microphone_not_confirmed"
                    save(); NSApp.terminate(nil); return
                }
            }
            coordinator.start()
            // 真正的完成事件先到；最终正文晚到时必须升级同一通知，而不是再响一次。
            let session = AssistantAgentSession(applicationID: "codexHook", instanceID: "diagnostic",
                sessionID: UUID().uuidString, name: "Synthetic notification")
            let turn = UUID().uuidString
            let event = ConversationEvent(applicationID: session.applicationID, instanceID: session.instanceID,
                sessionID: session.sessionID, turnID: turn, eventID: "synthetic-completed",
                sequence: 1, state: .completed, timestamp: Date())
            coordinator.receive(event)
            report["stage"] = "waiting_completion_ack"; save()
            let deliveryDeadline = ContinuousClock.now + .seconds(90)
            while receipts.isEmpty, ContinuousClock.now < deliveryDeadline {
                try? await Task.sleep(for: .milliseconds(100))
            }
            guard !receipts.isEmpty else {
                report["stage"] = "failed"; report["errorCode"] = "completion_ack_missing"
                save(); NSApp.terminate(nil); return
            }
            let body = String(repeating: "这是固定合成通知正文，用于检查翻页、圆点和完成提醒。", count: 18)
            coordinator.receive(AgentReply(session: session, turnID: turn, messageID: "synthetic-final",
                text: body, isFinal: true))
            report["stage"] = "waiting_body_upgrade"; save()
            while finalNotice == nil, ContinuousClock.now < deliveryDeadline {
                try? await Task.sleep(for: .milliseconds(100))
            }
            guard let notice = finalNotice else {
                report["stage"] = "failed"; report["errorCode"] = "body_ack_missing"
                save(); NSApp.terminate(nil); return
            }
            do {
                let duplicate = try await link.sendNotification(notice)
                report["duplicateCommitACK"] = duplicate.commit.ok
                report["duplicateMarked"] = duplicate.commit.duplicate
                if args.contains("--clear-after") {
                    try await link.clearNotification(id: notice.id, revision: notice.revision)
                    report["clearACK"] = true
                }
                report["stage"] = "complete"
            } catch {
                report["stage"] = "failed"; report["errorCode"] = "duplicate_commit_not_confirmed"
            }
            save()
            NSApp.terminate(nil)
        }
        return true
    }

    /// 跨音频回调只累计样本数量，不保留音频或识别现场内容。
    private nonisolated final class SampleCounter: @unchecked Sendable {
        private let lock = NSLock()
        private var samples = 0
        func append(_ count: Int) { lock.withLock { samples += count } }
        var value: Int { lock.withLock { samples } }
    }
}
