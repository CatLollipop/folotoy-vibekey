import Foundation
extension Bundle { nonisolated static var l10n: Bundle { .main } }

@main struct ConversationTests {
    @MainActor static func main() throws {
        var checks = 0
        func check(_ value: @autoclosure () -> Bool, _ message: String) {
            precondition(value(), message); checks += 1
        }
        let a = AssistantAgentSession(applicationID: "omp", instanceID: "test-one", sessionID: "alpha", name: "同名会话")
        let b = AssistantAgentSession(applicationID: "omp", instanceID: "test-two", sessionID: "alpha", name: "同名会话")
        let route = ConversationRouter()
        let bindingA = route.bind(a, writable: true)
        check(route.stage("给A的草稿", for: bindingA), "A draft rejected")
        let draftA = route.current!.draftRevision
        let bindingB = route.bind(b, writable: false)
        check(route.current?.draft == "", "Draft crossed session instance")
        check(!route.beginCapture(bindingB), "Notification-only session allowed recording")
        check(!route.stage("迟到的A", for: bindingA), "Late ASR overwrote current session")
        let reboundA = route.bind(a, writable: true)
        check(reboundA.revision != bindingA.revision && route.current?.draft == "给A的草稿", "Jump lost draft or reused binding revision")
        check(route.prepareSubmission(draftRevision: draftA + 1) == nil, "Stale version sent")
        let ticket = route.prepareSubmission(draftRevision: draftA)!
        check(route.prepareSubmission(draftRevision: draftA) == nil, "Duplicate confirmation sent twice")
        check(route.stage("A的新草稿", for: reboundA), "New draft during receipt rejected")
        route.resolve(ticket, outcome: .accepted)
        check(route.current?.draft == "A的新草稿" && route.phase == "draft", "Old receipt erased newer draft")
        let newer = route.prepareSubmission(draftRevision: route.current!.draftRevision)!
        route.resolve(newer, outcome: .unknown)
        check(route.current?.delivery == .unknown && route.prepareSubmission(draftRevision: route.current!.draftRevision) == nil, "Unknown receipt silently retried")
        let unknownVersion = route.current!.draftRevision
        route.acknowledgeUnknown(ticketID: UUID())
        check(route.current?.delivery == .unknown, "Unrelated reconciliation unlocked another submission")
        route.acknowledgeUnknown(ticketID: newer.id)
        check(route.current!.draftRevision != unknownVersion && route.current?.draft == "A的新草稿", "Manual reconciliation lost draft or reused confirmation")
        let failed = route.prepareSubmission(draftRevision: route.current!.draftRevision)!
        route.resolve(failed, outcome: .failed)
        check(route.current!.draftRevision != failed.revision && route.current?.delivery == .ready, "Known rejection did not require a fresh explicit confirmation")
        check(route.beginCapture(reboundA), "Valid capture blocked")
        route.partial("正在识别")
        route.failCapture()
        check(route.phase == "error" && route.current?.draft == "A的新草稿", "ASR failure erased draft or remained invisible")
        check(route.beginCapture(reboundA) && route.phase == "recording", "New explicit recording could not recover from ASR failure")
        route.partial("第二次识别")
        _ = route.bind(b, writable: true)
        route.partial("旧识别回调")
        check(route.current?.draft == "" && route.captureText == "", "Capture leaked after jump")
        let colonA = AssistantAgentSession(applicationID: "a:b", instanceID: "c", sessionID: "d", name: "")
        let colonB = AssistantAgentSession(applicationID: "a", instanceID: "b:c", sessionID: "d", name: "")
        check(ConversationKey(colonA).wireID != ConversationKey(colonB).wireID, "Opaque route has delimiter collision")
        var event = DeviceConversationMessage(op: "event", session: bindingB.wireID, revision: bindingB.revision,
            draftRevision: 1, gesture: 7, action: "confirm")
        check(route.consume(event, boot: "one") && !route.consume(event, boot: "one"), "Duplicate gesture accepted")
        event.action = "record_stop"
        check(!route.consume(event, boot: "one"), "Confirm gesture changed owner into recording")
        event.gesture = 8; event.action = "record_start"
        check(route.consume(event, boot: "one"), "New recording gesture rejected")
        event.action = "record_stop"
        check(route.consume(event, boot: "one") && !route.consume(event, boot: "one"), "Stop must pair exactly once")
        event.action = "confirm"
        check(!route.consume(event, boot: "one"), "Held recording gesture also confirmed its own draft")
        let source = String(repeating: "中英WM\\\"🙂\n", count: 180)
        let pages = ConversationRouter.pages(source)
        check(pages.joined() == source, "Pagination lost or duplicated UTF-8")
        for (index, page) in pages.enumerated() {
            check(page.utf8.count <= 128, "Device pane memory exceeded")
            let frame = try DeviceConversationProtocol.encode(op: "pane", requestID: UInt32.max, fields: [
                ("sid", .string(bindingA.wireID)), ("rev", .int(Int(UInt32.max))), ("role", .string("agent")),
                ("page", .int(index + 1)), ("pages", .int(pages.count)), ("text", .string(page))])
            check(frame.count <= 512, "Escaped pane exceeds physical line")
        }
        let valid: [String: Any] = ["t": "conversation", "op": "event", "action": "confirm", "sid": bindingA.wireID,
            "rev": 1, "drev": 1, "gid": 1, "boot": "00000001"]
        check(DeviceConversationProtocol.parse(valid) != nil, "Valid confirm rejected")
        for field in ["rev", "drev", "gid"] {
            var invalid = valid; invalid[field] = true
            check(DeviceConversationProtocol.parse(invalid) == nil, "Boolean numeric field accepted")
            invalid[field] = 1.2
            check(DeviceConversationProtocol.parse(invalid) == nil, "Fractional numeric field accepted")
        }
        let quota = ConversationRouter()
        for n in 0..<16 {
            let s = AssistantAgentSession(applicationID: "omp", instanceID: "fixture", sessionID: "s\(n)", name: "Test")
            check(quota.stage("保留", for: quota.bind(s, writable: true)), "Draft quota rejected early")
        }
        let last = quota.bind(a, writable: true)
        check(!quota.stage("第十七份", for: last) && quota.entries.values.filter { !$0.draft.isEmpty }.count == 16,
              "Draft quota evicted unsent content")
        print("PASS: \(checks) session binding, drafts, stale ASR, delivery uncertainty, pagination and wire checks")
    }
}
