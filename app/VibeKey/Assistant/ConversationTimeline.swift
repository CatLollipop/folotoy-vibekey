import Foundation
import CryptoKit

/// 正文与投递分别建模；queued/accepted/admitted均不表示任务已经完成。
nonisolated enum ChatRole: String, Equatable, Sendable { case assistant, user, draft }
nonisolated enum ChatDelivery: String, Equatable, Sendable {
    case none, draft, submitting, queued, accepted, admitted, failed, unknown
}

/// 只保留本次观察到的正式消息。原生身份包含会话三元组、角色、轮次与消息ID。
nonisolated struct ConversationTimelineMessage: Equatable, Sendable {
    let id: String
    let identity: String
    let ordinal: UInt64
    let role: ChatRole
    var delivery: ChatDelivery
    let text: String
    let truncated: Bool
    let turnID: String?
    let messageID: String?
    let ticketID: UUID?
    var nativePromptID: String?
    var nativeTurnID: String?

    static func identity(_ fields: [String]) -> String {
        SHA256.hash(data: try! JSONEncoder().encode(fields)).map { String(format: "%02x", $0) }.joined()
    }

    /// 按UTF-8字节限额截断，不能把多字节标量切开。控制字符不进入设备正文。
    static func body(_ source: String, maximum: Int = 32_768) -> (text: String, truncated: Bool) {
        var text = "", bytes = 0, truncated = false
        for scalar in source.unicodeScalars {
            let value: String
            if scalar == "\t" { value = " " }
            else if scalar == "\n" || scalar.properties.generalCategory != .control { value = String(scalar) }
            else { continue }
            let count = value.utf8.count
            if bytes + count > maximum { truncated = true; break }
            text += value; bytes += count
        }
        return (text, truncated)
    }
}

/// 锚点是原消息中的UTF-8偏移，与自动折行或当前设备帧ID无关。
nonisolated struct ChatCursor: Equatable, Hashable, Sendable {
    let messageID: String
    let offset: Int
}

nonisolated struct ChatItem: Equatable, Sendable {
    let mid: String
    let role: ChatRole
    let delivery: ChatDelivery
    let head: Bool
    let tail: Bool
    let text: String
    let truncated: Bool
}

nonisolated struct ChatWindow: Equatable, Sendable {
    let items: [ChatItem]
    let page: Int
    let pages: Int
    let unread: Int
    let following: Bool
    let draftRevision: UInt32
    let visibleDraft: Bool
    let cursor: ChatCursor?
    let olderDropped: Bool
    /// 供下一次按屏导航使用；不传输给设备，不以页码猜测旧画面的阅读位置。
    let nextCursor: ChatCursor?
}

/// 固件只接有界气泡片段。显式13字折行与生产LVGL的156px正文宽度共用几何合同。
nonisolated enum ChatPagination {
    static let viewportHeight = 244
    static let lineHeight = 18
    static let padding = 12
    static let statusHeight = 18
    static let gap = 8
    static let columns = 13
    static let itemBytes = 128
    static let maximumItems = 4

    struct Source: Sendable {
        let id: String
        let role: ChatRole
        let delivery: ChatDelivery
        let text: String
        let truncated: Bool
    }
    private struct Line {
        let text: String
        let start: Int
        let end: Int
        let substituted: Bool
    }
    private struct Position: Equatable { let message: Int; let line: Int }
    struct Page {
        let items: [ChatItem]
        let cursor: ChatCursor?
        let next: ChatCursor?
    }
    private struct Prepared {
        let sources: [Source]
        let lines: [[Line]]
        func cursor(_ value: Position) -> ChatCursor? {
            guard sources.indices.contains(value.message), lines[value.message].indices.contains(value.line) else { return nil }
            return .init(messageID: sources[value.message].id, offset: lines[value.message][value.line].start)
        }
        func position(_ cursor: ChatCursor?) -> Position {
            guard let cursor, let index = sources.firstIndex(where: { $0.id == cursor.messageID }) else { return .init(message: 0, line: 0) }
            let line = lines[index].lastIndex(where: { $0.start <= max(0, cursor.offset) }) ?? 0
            return .init(message: index, line: line)
        }
    }

    /// 字体按Unicode标量逐个映射，组合字/ZWJ也必须逐标量占格；偏移仍对应原文UTF-8。
    private static func lines(_ source: String) -> [Line] {
        var result: [Line] = [], text = "", start = 0, offset = 0, count = 0, changed = false
        func flush(_ end: Int) {
            result.append(.init(text: text, start: start, end: end, substituted: changed))
            text = ""; count = 0; start = end; changed = false
        }
        for scalar in source.unicodeScalars {
            let raw = String(scalar), bytes = raw.utf8.count
            if raw == "\n" { offset += bytes; flush(offset); continue }
            let value = bytes > itemBytes ? "�" : raw
            if count == columns || text.utf8.count + value.utf8.count > itemBytes { flush(offset) }
            text += value; count += 1; changed = changed || value != raw; offset += bytes
        }
        // 保留原文末尾换行形成的空行，否则页与锚点会吞掉显式空白。
        if !text.isEmpty || result.isEmpty || source.hasSuffix("\n") { flush(offset) }
        return result
    }

    private static func prepare(_ sources: [Source]) -> Prepared {
        .init(sources: sources, lines: sources.map { lines($0.text) })
    }
    private static func render(_ prepared: Prepared, from first: Position, stopBefore: Position? = nil) -> Page {
        var position = first, items: [ChatItem] = [], height = 0
        while prepared.sources.indices.contains(position.message), items.count < maximumItems {
            if let stopBefore, position == stopBefore { break }
            let message = prepared.sources[position.message], allLines = prepared.lines[position.message]
            let firstLine = position.line, head = firstLine == 0
            let overhead = padding + ((message.role == .user || message.role == .draft) && head ? statusHeight : 0)
            let separation = items.isEmpty ? 0 : gap
            var text = "", count = 0, changed = false
            while position.line < allLines.count {
                if let stopBefore, position == stopBefore { break }
                let line = allLines[position.line]
                let candidate = count == 0 ? line.text : text + "\n" + line.text
                guard candidate.utf8.count <= itemBytes,
                      height + separation + overhead + (count + 1) * lineHeight <= viewportHeight else { break }
                text = candidate; count += 1; changed = changed || line.substituted
                position = .init(message: position.message, line: position.line + 1)
            }
            guard count > 0 else { break }
            let tail = position.line == allLines.count
            items.append(.init(mid: message.id, role: message.role, delivery: message.delivery,
                               head: head, tail: tail, text: text, truncated: message.truncated || changed))
            height += separation + overhead + count * lineHeight
            if tail { position = .init(message: position.message + 1, line: 0) }
        }
        return .init(items: items, cursor: prepared.cursor(first), next: prepared.cursor(position))
    }
    static func pages(_ sources: [Source]) -> [Page] {
        let prepared = prepare(sources)
        guard !sources.isEmpty else { return [.init(items: [], cursor: nil, next: nil)] }
        var output: [Page] = [], position = Position(message: 0, line: 0)
        while prepared.sources.indices.contains(position.message) {
            let page = render(prepared, from: position); output.append(page)
            guard let next = page.next else { break }
            let updated = prepared.position(next)
            guard updated != position else { break }
            position = updated
        }
        return output
    }
    static func window(_ sources: [Source], from cursor: ChatCursor?) -> Page {
        let prepared = prepare(sources)
        return render(prepared, from: prepared.position(cursor))
    }
    static func previous(_ sources: [Source], before cursor: ChatCursor?) -> ChatCursor? {
        let prepared = prepare(sources), stop = prepared.position(cursor)
        guard stop != Position(message: 0, line: 0) else { return prepared.cursor(stop) }
        var position = Position(message: 0, line: 0), previous = position
        while true {
            let page = render(prepared, from: position, stopBefore: stop)
            previous = position
            guard let next = page.next else { break }
            let updated = prepared.position(next)
            if updated == stop || updated == position { break }
            position = updated
        }
        return prepared.cursor(previous)
    }
    static func pageNumber(_ sources: [Source], cursor: ChatCursor?, pages: [Page]) -> Int {
        guard let cursor, let sourceIndex = sources.firstIndex(where: { $0.id == cursor.messageID }) else { return 1 }
        return (pages.lastIndex(where: { page in
            guard let value = page.cursor, let index = sources.firstIndex(where: { $0.id == value.messageID }) else { return false }
            return index < sourceIndex || (index == sourceIndex && value.offset <= cursor.offset)
        }) ?? 0) + 1
    }
}
