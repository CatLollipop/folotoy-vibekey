import Foundation

/// Kimi Code官方WS帧的最小投影，未知字段忽略，未知事件不猜状态。
nonisolated struct KimiServerFrame: Decodable, Sendable {
    struct Turn: Decodable, Sendable { let turn_id: String; let status: String?; let outcome: String? }
    struct Item: Decodable, Sendable { let item_id: String; let type: String; let outcome: String?; let text: String? }
    let type: String
    let session_id: String?
    let agent_id: String?
    let status: String?
    let turn_id: String?
    let turn: Turn?
    let turns: [Turn]?
    let turn_ids: [String]?
    let item: Item?
    let item_id: String?
}

/// 只在实时轮次结束后输出最后一条assistant正文；历史快照、子Agent、思考和工具不朗读。
nonisolated struct KimiConversationReducer: Sendable {
    struct Output: Sendable { let state: ConversationState; let turnID: String; var reply: (id: String, text: String)? }
    private var activeTurns: Set<String> = []
    private var replies: [String: (id: String, text: String)] = [:]
    var activeTurnIDs: Set<String> { activeTurns }
    mutating func reset() { activeTurns.removeAll(); replies.removeAll() }
    mutating func apply(_ frame: KimiServerFrame, sessionID: String) -> Output? {
        guard frame.session_id == sessionID, frame.agent_id == "main" else { return nil }
        if frame.type == "turns" {
            // 重连快照替换旧状态；仅接管仍在运行的轮次，绝不播放已结束历史。
            activeTurns = Set((frame.turns ?? []).filter { $0.status == "running" }.map(\.turn_id))
            replies.removeAll()
            return nil
        }
        if frame.type == "turns.removed" {
            for id in frame.turn_ids ?? [] { activeTurns.remove(id); replies[id] = nil }; return nil
        }
        if frame.type == "interaction" { return Output(state: frame.status == "pending" ? .waitingInput : .unknown, turnID: "interaction") }
        if frame.type == "agent" { return frame.status == "running" ? Output(state: .thinking, turnID: "status") : nil }
        if frame.type == "turn.started", let turn = frame.turn {
            if activeTurns.insert(turn.turn_id).inserted { replies[turn.turn_id] = nil }
            return Output(state: .thinking, turnID: turn.turn_id)
        }
        if frame.type == "item.ended", let turnID = frame.turn_id, activeTurns.contains(turnID),
           let item = frame.item, item.type == "assistant_message", item.outcome == "completed", let text = item.text {
            replies[turnID] = (item.item_id, String(text.prefix(32_000)))
        }
        if frame.type == "item.removed", let turnID = frame.turn_id, replies[turnID]?.id == frame.item_id { replies[turnID] = nil }
        if frame.type == "item.started", let turnID = frame.turn_id, let item = frame.item {
            if item.type == "assistant_message" { return Output(state: .replying, turnID: turnID) }
            if item.type == "tool_call" { return Output(state: .working, turnID: turnID) }
        }
        if frame.type == "turn.ended", let turn = frame.turn, activeTurns.remove(turn.turn_id) != nil {
            let reply = replies.removeValue(forKey: turn.turn_id)
            return Output(state: turn.outcome == "completed" ? .completed : turn.outcome == "interrupted" ? .stopped : .error,
                          turnID: turn.turn_id, reply: turn.outcome == "completed" ? reply : nil)
        }
        return nil
    }
}
