import Foundation

/// AI助理独立的硬件手势状态机；启用后绝不把未处理的上/下键交给旧Codex桥。
nonisolated struct AssistantHardwareRouter: Sendable {
    enum Action: Equatable, Sendable { case recordStart, recordStop, submitDraft, stopTask, openMenu, previous, next, confirm }
    private var presses = KeyPressTracker()
    mutating func reset() { presses.reset() }
    mutating func handle(_ key: DeviceKey, _ event: DeviceKeyEvent, ack: Bool, menuVisible: Bool) -> Action? {
        switch event {
        case .down:
            let owner: KeyPressTracker.Owner = ack ? .agentAck : menuVisible ? .switcher : .normal
            guard let accepted = presses.began(key, owner: owner), accepted == .normal, key == .ok else { return nil }
            return .recordStart
        case .long:
            guard presses.longPressed(key) == .normal, key == .down else { return nil }
            return .openMenu
        case .up:
            guard let result = presses.ended(key) else { return nil }
            if result.owner == .normal {
                if key == .ok { return .recordStop }
                guard result.isTap else { return nil }
                return key == .up ? .submitDraft : .stopTask
            }
            guard result.owner == .switcher, result.isTap else { return nil }
            switch key { case .up: return .previous; case .down: return .next; case .ok: return .confirm }
        }
    }
}
