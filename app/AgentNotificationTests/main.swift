import Foundation

extension Bundle { nonisolated static var l10n: Bundle { .main } }

/// 运行正式身份合流、队列、UTF-8分块、ACK解析和模式门禁；不启动任何应用/设备/收费服务。
@main struct AgentNotificationTests {
    static func check(_ value: @autoclosure () throws -> Bool, _ reason: String) throws {
        if try !value() { throw NSError(domain: "NotificationTests", code: 1, userInfo: [NSLocalizedDescriptionKey: reason]) }
    }
    static func event(session: String = "test-session", turn: String = "test-turn", id: String = "test-event") -> ConversationEvent {
        .init(applicationID: "omp", instanceID: "test-instance", sessionID: session, turnID: turn,
              eventID: id, sequence: 1, state: .completed, timestamp: Date(timeIntervalSince1970: 100))
    }
    static func reply(text: String = "专用合成回复🙂。", session: String = "test-session", turn: String = "test-turn") -> AgentReply {
        .init(session: .init(applicationID: "omp", instanceID: "test-instance", sessionID: session, name: "Test"),
              turnID: turn, messageID: "test-message", text: text, isFinal: true)
    }
    @MainActor static func main() async throws {
        var reducer = AgentNotificationReducer()
        let generic = reducer.receive(event())!
        try check(generic.text.isEmpty && generic.kind == .done && generic.revision == 1, "Completion without body must remain an explicit generic completion")
        let body = reducer.receive(reply())!
        try check(body.id == generic.id && body.revision == 2 && !body.text.isEmpty, "Late reply changed event identity instead of upgrading revision")
        try check(reducer.receive(event()) == nil && reducer.receive(reply()) == nil, "Duplicate source requeued the same completion")
        var reversed = AgentNotificationReducer()
        try check(reversed.receive(reply()) == nil, "Reply without true completion invented completion")
        let together = reversed.receive(event())!
        try check(together.text == body.text && together.id == body.id && together.revision == 1, "Reply-before-event lost body or identity")
        let other = reducer.receive(event(session: "different"))!
        try check(other.id != body.id, "Notification leaked across original sessions")
        let firstUnbound = reducer.receive(event(turn: "session", id: "unknown-first"))!
        let nextUnbound = reducer.receive(event(turn: "session", id: "unknown-second"))!
        try check(firstUnbound.id != nextUnbound.id && reducer.receive(reply(turn: "session")) == nil, "Unbound turn folded later completion or accepted ambiguous body")
        try check(DeviceNotificationProtocol.identity(["a:b", "c"]) != DeviceNotificationProtocol.identity(["a", "b:c"]), "Identity encoding has delimiter collision")
        let huge = String(repeating: "中文🙂", count: 600)
        let clipped = reducer.receive(reply(text: huge))!
        try check(clipped.truncated && clipped.text.utf8.count <= 2_048 && String(data: Data(clipped.text.utf8), encoding: .utf8) != nil, "UTF-8 body budget or explicit truncation missing")

        let escaped = PassportNotification(id: generic.id, revision: UInt32.max, source: "专用测试", kind: .done,
            text: String(repeating: "\u{0000}\"\\\n🙂", count: 170), truncated: false)
        let parts = try DeviceNotificationProtocol.chunks(escaped)
        try check(parts.map(\.text).joined() == escaped.text, "Escaped chunk reconstruction changed body")
        var next = 0
        for part in parts {
            try check(part.offset == next && part.text.utf8.count <= 96, "UTF-8 chunk offset mismatch")
            let packet = try DeviceNotificationProtocol.encode(op: "chunk", requestID: UInt32.max, id: escaped.id,
                revision: escaped.revision, fields: [("off", .int(part.offset)), ("text", .string(part.text))])
            try check(packet.count <= 512, "Escaped wire exceeds 511B plus newline")
            next += part.text.utf8.count
        }
        let wire = "{\"t\":\"notification\",\"op\":\"commit\",\"rid\":7,\"nid\":\"\(body.id)\",\"rev\":2,\"ok\":1,\"off\":\(body.text.utf8.count),\"crc\":\(body.checksum),\"duplicate\":1}"
        guard case .notification(let ack) = DeviceMessage.parse(wire) else { throw DeviceNotificationError.invalid }
        try check(ack.duplicate && DeviceNotificationProtocol.matches(ack, requestID: 7, op: "commit", id: body.id, revision: 2,
            offset: body.text.utf8.count, checksum: body.checksum), "Real notification ACK did not match")
        for (rid, op, id, rev, off, crc) in [(UInt32(8),"commit",body.id,UInt32(2),body.text.utf8.count,body.checksum),
            (7,"begin",body.id,2,body.text.utf8.count,body.checksum), (7,"commit",other.id,2,body.text.utf8.count,body.checksum),
            (7,"commit",body.id,3,body.text.utf8.count,body.checksum), (7,"commit",body.id,2,0,body.checksum),
            (7,"commit",body.id,2,body.text.utf8.count,body.checksum &+ 1)] {
            try check(!DeviceNotificationProtocol.matches(ack, requestID: rid, op: op, id: id, revision: rev, offset: off, checksum: crc), "Mismatched ACK advanced transaction")
        }
        try check(DeviceMessage.parse(wire.replacingOccurrences(of: "\"rid\":7", with: "\"rid\":true")) == nil, "Boolean rid accepted")
        try check(DeviceMessage.parse(wire.replacingOccurrences(of: "\"rev\":2", with: "\"rev\":0")) == nil, "Zero notification revision accepted")
        try check(DeviceMessage.parse(wire.replacingOccurrences(of: "\"ok\":1", with: "\"ok\":1.2")) == nil, "Fractional ok was rounded into success")
        try check(DeviceMessage.parse(wire.replacingOccurrences(of: "\"off\":\(body.text.utf8.count)", with: "\"off\":1.5")) == nil, "Fractional offset was rounded")

        let now = Date(timeIntervalSince1970: 1_000)
        var queue = AgentNotificationQueue()
        queue.enqueue(generic, at: now); queue.enqueue(body, at: now)
        try check(queue.count == 1 && queue.next(at: now)?.revision == 2, "Queue failed to merge body upgrade")
        queue.delivered(generic)
        try check(queue.count == 1, "Old commit ACK removed newer body revision")
        queue.retry(body, at: now)
        try check(queue.next(at: now) == nil && queue.next(at: now.addingTimeInterval(2)) == body, "Busy did not retain exact identity for retry")
        // 实际Notifier自动到期路径(只缩短注入的计时)，队列模拟cloud忙31秒仍须保留同nid rev2。
        let notifier = AgentNotifier(completionLifetime: .milliseconds(2))
        var notices: [AgentNotifier.Notice] = []
        notifier.onNotice = { notices.append($0) }
        notifier.post(.done, source: "Codex")
        let originalNoticeID = notifier.current!.notificationID
        try await Task.sleep(for: .milliseconds(20))
        try check(notices.last?.event == .clear && notices.last?.dismissReason == .expired
                  && notices.last?.notificationID == originalNoticeID, "Automatic expiry lost its clear reason or exact Notice identity")
        queue.cancel(id: body.id, reason: notices.last!.dismissReason!)
        try check(queue.next(at: now.addingTimeInterval(31)) == body, "Mac capsule expiry deleted >15s delayed device body")
        queue.enqueue(other, at: now)
        queue.cancel(id: body.id, reason: .user)
        try check(queue.count == 1 && queue.next(at: now.addingTimeInterval(31))?.id == other.id, "Explicit dismissal cleared another original session")
        for index in 0..<20 { queue.enqueue(.init(id: DeviceNotificationProtocol.identity([String(index)]), revision: 1, source: "Test", kind: .input, text: "", truncated: false), at: now) }
        try check(queue.count == 16 && queue.next(at: now.addingTimeInterval(301)) == nil && queue.count == 0, "Queue is not bounded by count/time")

        guard case .assistant(let oldCap) = DeviceMessage.parse("{\"t\":\"assistant\",\"op\":\"capabilities\",\"ok\":1,\"schema\":1}") else { throw DeviceNotificationError.invalid }
        try check(!DeviceAssistantProtocol.supportsHotMode(oldCap), "Old firmware can still be sent a rebooting mode switch")
        var hot = oldCap; hot.supportsHotMode = true; hot.mode = "companion"
        try check(DeviceAssistantProtocol.supportsHotMode(hot) && DeviceAssistantProtocol.acceptsHotModeAcknowledgment(hot, target: "companion"), "Hot mode capability/actual acknowledgment rejected")
        hot.restarting = true
        try check(!DeviceAssistantProtocol.acceptsHotModeAcknowledgment(hot, target: "companion"), "Reboot mode ACK falsely accepted")
        hot.restarting = false
        try check(!DeviceAssistantProtocol.acceptsHotModeAcknowledgment(hot, target: "standalone"), "Wrong actual mode accepted")
        // 正式hello路由策略：USB先握手后Wi-Fi只能保活，不能重放mic1抢走USB或mic0停掉USB。
        let usbFirst = DeviceLinkRouting.afterHandshake(.usb, usb: true, wifi: false, ble: false)
        let wifiLater = DeviceLinkRouting.afterHandshake(.wifi, usb: true, wifi: true, ble: false)
        try check(usbFirst.selected == .usb && usbFirst.replay == .usb && wifiLater.selected == .usb && wifiLater.replay == nil,
                  "Standby Wi-Fi handshake can steal/stop active USB microphone")
        for wanted in [false, true] {
            let cached: [HostCommand] = [.state(.idle, mode: .dict, msg: ""), .mic(wanted)]
            let standbyWrites = wifiLater.replay == nil ? [] : cached.map(\.line)
            try check(standbyWrites.isEmpty, "Standby hello replayed idle/mic command")
        }
        let wifiFirst = DeviceLinkRouting.afterHandshake(.wifi, usb: false, wifi: true, ble: false)
        let usbLater = DeviceLinkRouting.afterHandshake(.usb, usb: true, wifi: true, ble: false)
        try check(wifiFirst.selected == .wifi && wifiFirst.replay == .wifi && usbLater.selected == .usb && usbLater.replay == .usb,
                  "Wi-Fi-first or winning USB takeover no longer restores cached microphone state")
        try check(DeviceLinkRouting.preferred(usb: false, wifi: true, ble: false) == .wifi
                  && DeviceLinkRouting.preferred(usb: false, wifi: false, ble: true) == .ble
                  && DeviceLinkRouting.preferred(usb: false, wifi: false, ble: false) == nil,
                  "Disconnect failover priority changed")
        print("PASS: notification identity/revision/order/UTF8/511B/ACK/CRC/expiry/queue/hot-mode and dual-link routing contracts")
    }
}
