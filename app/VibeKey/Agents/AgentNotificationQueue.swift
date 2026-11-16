import Foundation

/// Mac胶囊自动到期与用户明确确认不是同一件事；前者不能丢弃设备尚未收到的通知。
nonisolated enum AgentNoticeDismissReason: Sendable, Equatable { case expired, user, sourceClear }

/// 有界队列单独可测；新正文只升级同nid，已在传输的旧rev回执不能删除新rev。
nonisolated struct AgentNotificationQueue: Sendable {
    private struct Entry: Sendable { var notice: PassportNotification; let created: Date; var ready: Date }
    private var entries: [Entry] = []
    var count: Int { entries.count }
    mutating func enqueue(_ notice: PassportNotification, at now: Date) {
        prune(at: now)
        if let index = entries.firstIndex(where: { $0.notice.id == notice.id }) {
            if notice.revision > entries[index].notice.revision { entries[index].notice = notice }
        } else {
            if entries.count == 16 { entries.removeFirst() }
            entries.append(.init(notice: notice, created: now, ready: now))
        }
    }
    mutating func next(at now: Date) -> PassportNotification? { prune(at: now); return entries.first(where: { $0.ready <= now })?.notice }
    mutating func delivered(_ notice: PassportNotification) { entries.removeAll { $0.notice.id == notice.id && $0.notice.revision <= notice.revision } }
    mutating func retry(_ notice: PassportNotification, at now: Date) {
        if let index = entries.firstIndex(where: { $0.notice.id == notice.id }) { entries[index].ready = now.addingTimeInterval(2) }
    }
    mutating func remove(id: String) { entries.removeAll { $0.notice.id == id } }
    mutating func cancel(id: String, reason: AgentNoticeDismissReason) {
        if reason != .expired { remove(id: id) }
    }
    mutating func removeAll() { entries.removeAll() }
    private mutating func prune(at now: Date) { entries.removeAll { now.timeIntervalSince($0.created) >= 300 } }
}
