import Foundation

/// 直接调用正式Router、排版和线协议；只使用内存合成消息，不访问宿主、网络或设备。
@MainActor enum TimelineContracts {
    static func run(_ check: (Bool, String) -> Void) throws {
        func unwrapped(_ text: String) -> String { text.unicodeScalars.filter { $0.value != 10 }.map(String.init).joined() }
        func rows(_ text: String) -> [String] { text.unicodeScalars.split(separator: "\n", omittingEmptySubsequences: false).map(String.init) }
        func session(_ index: Int) -> AssistantAgentSession {
            .init(applicationID: "omp", instanceID: "fixture", sessionID: "native-\(index)", name: "Fixture")
        }
        func reply(_ router: ConversationRouter, _ session: AssistantAgentSession, _ turn: String, _ text: String, id: String = "answer", final: Bool = true) {
            router.receive(.init(session: session, turnID: turn, messageID: id, text: text, isFinal: final))
        }
        let route = ConversationRouter(), a = session(1), b = session(2)
        let binding = route.bind(a, writable: true)
        reply(route, a, "one", "相同的正文")
        reply(route, a, "two", "相同的正文")
        reply(route, a, "two", "重复回包不产生新消息")
        reply(route, a, "partial", "思考和中间输出", final: false)
        check(route.current!.messages.map(\.turnID) == ["one", "two"], "Final messages were overwritten, duplicated, or partial content was appended")
        _ = route.bind(b, writable: true)
        reply(route, b, "one", "B的第一轮")
        reply(route, a, "three", "迟到的A正文")
        check(route.current?.messages.count == 1 && route.current?.reply == "B的第一轮", "A/B native sessions crossed")
        _ = route.bind(a, writable: true)
        check(route.current?.messages.map(\.turnID) == ["one", "two", "three"], "Per-session chronological order was lost")
        check(route.chatWindow().following && route.chatWindow().unread == 0, "Selecting a background session at latest retained a false unread hint")
        check(route.current!.messages.allSatisfy { $0.id.count == 16 }, "Wire message identity is not fixed 16 hex")
        check(route.stage("排队的提问", for: route.binding!), "Draft staging failed")
        let queued = route.prepareSubmission(draftRevision: route.current!.draftRevision)!
        check(route.current?.messages.last?.delivery == .submitting, "Confirmation did not create a pending local user message")
        check(!route.chatWindow().items.contains { $0.role == .draft }, "Same revision was rendered as draft and submitting user message")
        route.resolve(queued, outcome: .queued, nativePromptID: "native-prompt")
        check(route.current?.messages.last?.delivery == .queued && route.current?.messages.last?.nativePromptID == "native-prompt", "Queued admission was falsely presented as sent")
        check(route.current?.draft.isEmpty == true, "Accepted queue ticket was left as a second draft")
        for outcome in [ConversationRouter.Outcome.accepted, .admitted] {
            check(route.stage("下一条", for: route.binding!), "Fresh draft rejected")
            let ticket = route.prepareSubmission(draftRevision: route.current!.draftRevision)!
            route.resolve(ticket, outcome: outcome)
        }
        check(Array(route.current!.messages.suffix(2)).map(\.delivery) == [.accepted, .admitted], "API accepted and native admitted were collapsed")
        check(route.stage("失败的提问", for: route.binding!), "Failure draft rejected")
        let failed = route.prepareSubmission(draftRevision: route.current!.draftRevision)!
        route.resolve(failed, outcome: .failed)
        check(route.current?.messages.last?.delivery == .failed && route.current?.draft == failed.text, "Known rejection looked sent or erased draft")
        let unknown = route.prepareSubmission(draftRevision: route.current!.draftRevision)!
        route.resolve(unknown, outcome: .unknown)
        for n in 0..<80 { reply(route, a, "later-\(n)", "保留未知票据") }
        check(route.current!.messages.count <= 64 && route.current!.olderDropped, "Session message bound was not enforced")
        check(route.current!.messages.contains { $0.ticketID == unknown.id && $0.delivery == .unknown }, "Eviction removed uncertain delivery evidence")
        check(!route.beginCapture(route.binding!) && !route.chatWindow().visibleDraft, "Unknown delivery allowed recording or duplicate draft confirmation")
        route.acknowledgeUnknown(ticketID: unknown.id)
        check(route.current!.messages.first { $0.ticketID == unknown.id }?.delivery == .unknown, "Manual reconciliation falsely marked an unknown message delivered")

        let reading = ConversationRouter(); _ = reading.bind(a, writable: true)
        reply(reading, a, "long", String(repeating: "中", count: 500))
        reading.page(-1)
        let old = reading.chatWindow()
        check(!old.following && old.cursor != nil, "UP did not establish a reading anchor")
        reply(reading, a, "new", "新消息不得打断阅读")
        let stable = reading.chatWindow()
        check(stable.cursor == old.cursor && stable.items == old.items && stable.unread == 1 && reading.hasUnseen, "New reply moved old reading content")
        _ = reading.bind(b, writable: true)
        reply(reading, a, "background", "后台第二条新消息")
        _ = reading.bind(a, writable: true)
        check(!reading.chatWindow().following && reading.chatWindow().cursor == old.cursor && reading.chatWindow().unread == 2,
              "Reopening a background old-reading session lost its anchor or unread messages")
        reading.page(1, from: old.cursor)
        check(reading.chatWindow().cursor == old.nextCursor, "A key from the previously committed window skipped content")
        reading.latest()
        check(reading.chatWindow().following && reading.chatWindow().unread == 0, "Latest did not clear unread and restore following")
        check(reading.locate(turnID: "long", messageID: "answer") && reading.chatWindow().cursor?.offset == 0, "Notification did not locate the actual native message")
        let beforeNotice = reading.current!.messages.count
        check(!reading.locate(turnID: "not-observed", messageID: nil) && reading.current!.messages.count == beforeNotice, "Generic notification inserted a fake assistant answer")
        reading.page(-1)
        check(reading.stage(String(repeating: "未发草稿", count: 100), for: reading.binding!), "Long draft rejected")
        let revision = reading.current!.draftRevision
        reading.page(-1)
        check(!reading.chatWindow().visibleDraft && reading.prepareSubmission(draftRevision: revision) == nil, "Confirmation sent a draft hidden below the reading window")
        reading.latest()
        check(reading.chatWindow().visibleDraft, "Draft tail could not become explicitly visible")
        check(reading.beginCapture(reading.binding!) && reading.chatWindow().following, "Explicit recording did not return to latest")
        for n in 0..<10 { reading.partial("增量\(n)") }
        check(reading.current!.messages.count == beforeNotice && reading.chatWindow().items.filter { $0.role == .draft }.count == 1, "ASR increments appended permanent messages")
        let firstCaptureID = reading.chatWindow().items.last?.mid
        reading.endCapture()
        check(reading.beginCapture(reading.binding!) && reading.chatWindow().items.last?.mid != firstCaptureID, "Two recognition generations reused one ephemeral message identity")
        reading.partial(String(repeating: "🙂", count: 8_192))
        check(reading.captureText.utf8.count <= 8_192 && reading.chatWindow().items.last?.truncated == true, "Live transcription exceeded its byte budget or silently clipped")
        reading.endCapture()

        let limits = ConversationRouter(); _ = limits.bind(a, writable: false)
        reply(limits, a, "huge", String(repeating: "🙂", count: 20_000))
        check(limits.current!.messages[0].text.utf8.count == 32_768 && limits.current!.messages[0].truncated, "Message truncation was not UTF-8 bounded and visible")
        for index in 0..<64 {
            for n in 0..<12 { reply(limits, session(index), "m\(n)", "短消息") }
        }
        check(limits.entries.values.reduce(0) { $0 + $1.messages.count } <= 512, "Global message count exceeded 512")
        for index in 0..<64 { reply(limits, session(index), "bytes", String(repeating: "文", count: 10_000)) }
        check(limits.entries.values.reduce(0) { $0 + $1.messages.reduce(0) { $0 + $1.text.utf8.count } } <= 1_048_576, "Global UTF-8 budget exceeded 1MiB")

        let text = String(repeating: "中🙂WM\"", count: 180)
        let sources = [ChatPagination.Source(id: "0123456789abcdef", role: .assistant, delivery: .none, text: text, truncated: false),
                       ChatPagination.Source(id: "fedcba9876543210", role: .draft, delivery: .draft, text: "确认前的草稿", truncated: false)]
        let pages = ChatPagination.pages(sources)
        let rebuilt = unwrapped(pages.flatMap(\.items).filter { $0.mid == sources[0].id }.map(\.text).joined())
        check(rebuilt == text, "UTF-8 pagination lost or duplicated native message text")
        check(pages.first?.items.first?.head == true && pages.last?.items.last?.tail == true, "True message head/tail flags were reversed")
        for page in pages {
            check(page.items.count <= 4, "Viewport exceeded four bounded item slots")
            var height = 0
            for (index, item) in page.items.enumerated() {
                let lines = rows(item.text)
                check(lines.allSatisfy { $0.unicodeScalars.count <= 13 }, "A rendered row exceeded 13 scalar font columns")
                height += (index == 0 ? 0 : 8) + 12 + 18 * lines.count + ((item.role == .user || item.role == .draft) && item.head ? 18 : 0)
                check(item.text.utf8.count <= 128, "Bubble exceeded device UTF-8 capacity")
                let data = try DeviceConversationProtocol.encode(op: "window_item", requestID: UInt32.max, fields: [
                    ("sid", .string(binding.wireID)), ("rev", .int(Int(UInt32.max))), ("wid", .int(Int(UInt32.max))),
                    ("index", .int(index)), ("mid", .string(item.mid)), ("role", .string(item.role.rawValue)),
                    ("delivery", .string(item.delivery.rawValue)), ("head", .int(item.head ? 1 : 0)),
                    ("tail", .int(item.tail ? 1 : 0)), ("trunc", .int(item.truncated ? 1 : 0)), ("text", .string(item.text))])
                check(data.count <= 512, "Full escaped message frame exceeded the physical UART line")
            }
            check(height <= 244, "Bubble layout exceeded the agreed 244px viewport")
        }
        let weird = ChatPagination.pages([.init(id: "0123456789abcdef", role: .assistant, delivery: .none,
            text: "\n\n" + String(repeating: "a\u{0301}", count: 3) + "\n", truncated: false)])
        check(!weird.isEmpty && weird.last?.next == nil, "Blank lines or combining Unicode created an endless pagination cursor")
        let shaped = "a\u{0301}" + "👨‍👩‍👧‍👦" + "\u{007f}\u{0085}" + "中文"
        let clean = ConversationTimelineMessage.body(String(repeating: shaped, count: 60))
        check(!clean.text.unicodeScalars.contains { $0.properties.generalCategory == .control && $0 != "\n" }, "DEL/C1 controls survived device normalization")
        var shapedText = ""
        for page in ChatPagination.pages([.init(id: "0123456789abcdef", role: .assistant, delivery: .none, text: clean.text, truncated: false)]) {
            for item in page.items {
                // 生产字体不支持的非ASCII标量至多扩成3B方框；C缓存193B包含结尾NUL。
                let mappedUpperBound = item.text.unicodeScalars.reduce(0) { $0 + ($1.value < 128 ? 1 : 3) }
                check(mappedUpperBound <= 192, "Scalar fallback expansion exceeded the production 193B font buffer")
                check(rows(item.text).allSatisfy { $0.unicodeScalars.count <= 13 }, "Joined emoji/combining marks escaped scalar-width wrapping")
                shapedText += unwrapped(item.text)
            }
        }
        check(shapedText == clean.text, "Scalar wrapping lost ZWJ or non-BMP UTF-8 text")
        for raw in [String(repeating: "\"", count: 260), String(repeating: "\\", count: 260)] {
            for page in ChatPagination.pages([.init(id: "0123456789abcdef", role: .user, delivery: .submitting, text: raw, truncated: false)]) {
                for (index, item) in page.items.enumerated() {
                    let encoded = try DeviceConversationProtocol.encode(op: "window_item", requestID: UInt32.max, fields: [
                        ("sid", .string(binding.wireID)), ("rev", .int(Int(UInt32.max))), ("wid", .int(Int(UInt32.max))),
                        ("index", .int(index)), ("mid", .string(item.mid)), ("role", .string(item.role.rawValue)),
                        ("delivery", .string(item.delivery.rawValue)), ("head", .int(item.head ? 1 : 0)),
                        ("tail", .int(item.tail ? 1 : 0)), ("trunc", .int(0)), ("text", .string(item.text))])
                    check(encoded.count <= 512, "Worst-case quote/backslash escaping exceeded the production frame")
                }
            }
        }
    }
}
