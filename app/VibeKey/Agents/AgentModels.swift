import Foundation

/// 应用适配器的独立能力；未通过探测的能力绝不按支持处理。
nonisolated enum AgentCapability: String, Codable, CaseIterable, Sendable {
    case discover, activate, insertDraft, submit, stop, observeState, readReply
}

/// 会话状态只由官方生命周期事件产生。
nonisolated enum ConversationState: String, Codable, Sendable {
    case idle, listening, receiving, thinking, working, waitingInput, replying
    case searching, loading, completed, error, stopped, unknown
}

nonisolated struct ConversationEvent: Codable, Equatable, Sendable {
    let applicationID: String
    let instanceID: String
    let sessionID: String
    let turnID: String
    let eventID: String
    let sequence: UInt64
    let state: ConversationState
    let timestamp: Date
}

/// 原应用中的会话身份。会话名只留在内存和诊断界面，不写运行日志。
nonisolated struct AssistantAgentSession: Codable, Equatable, Identifiable, Sendable {
    let applicationID: String
    let instanceID: String
    let sessionID: String
    let name: String
    var id: String { String(decoding: try! JSONEncoder().encode([applicationID, instanceID, sessionID]), as: UTF8.self) }
}

/// 发送回执只描述原API接纳到哪一步，不能替代任务生命周期或最终回复。
/// 原生ID仅在宿主明确提供时填写；本机票据和正文hash不能冒充原生身份。
nonisolated struct AgentPromptReceipt: Codable, Equatable, Sendable {
    nonisolated enum Disposition: String, Codable, Sendable { case queued, accepted, admitted }
    let disposition: Disposition
    let nativePromptID: String?
    let nativeTurnID: String?
    init(disposition: Disposition, nativePromptID: String? = nil, nativeTurnID: String? = nil) {
        self.disposition = disposition; self.nativePromptID = nativePromptID; self.nativeTurnID = nativeTurnID
    }
}

nonisolated struct AgentReply: Equatable, Sendable {
    let session: AssistantAgentSession
    let turnID: String
    let messageID: String
    let text: String
    let isFinal: Bool
}

nonisolated struct AgentDiagnostic: Identifiable, Sendable {
    let id: String
    let name: String
    let capabilities: Set<AgentCapability>
    let detail: String
    let installed: Bool
    let verifiedAt: Date
    init(id: String, name: String, capabilities: Set<AgentCapability>, detail: String, installed: Bool, verifiedAt: Date) {
        self.id = id; self.name = name; self.capabilities = capabilities
        self.detail = AgentText.localized(detail); self.installed = installed; self.verifiedAt = verifiedAt
    }
    static let requiredCapabilities: Set<AgentCapability> = [.discover, .activate, .submit, .stop, .observeState, .readReply]
    var missing: Set<AgentCapability> { Self.requiredCapabilities.subtracting(capabilities) }
    var optionalMissing: Set<AgentCapability> { Set([AgentCapability.insertDraft]).subtracting(capabilities) }
    var isComplete: Bool { missing.isEmpty }
}

nonisolated enum AgentAdapterError: LocalizedError, Equatable {
    case blocked(String)
    case sessionChanged
    case deliveryUnknown
    case invalidResponse
    case officialChannelRequired
    var errorDescription: String? {
        switch self {
        case .blocked(let reason): AgentText.localized(reason)
        case .sessionChanged: String(localized: "原应用会话已变化，请重新选择会话", bundle: .l10n)
        case .deliveryUnknown: String(localized: "投递结果未知；请先检查原应用，避免重复发送", bundle: .l10n)
        case .invalidResponse: String(localized: "应用桥接返回无效数据", bundle: .l10n)
        case .officialChannelRequired: String(localized: "当前接入没有官方双向通道，无法发送或停止", bundle: .l10n)
        }
    }
}

/// 诊断来源于模型字符串，按稳定资源key查找；源文案仍为简体中文。
nonisolated enum AgentText {
    static func localized(_ value: String) -> String { AgentLocalizedKeys.lookup(value) }
}

/// 实现只控制其发现的原应用会话，不启动第二个 agent 进程恢复用户会话。
@MainActor protocol AgentAdapter: AnyObject {
    var id: String { get }
    var name: String { get }
    var onEvent: ((ConversationEvent) -> Void)? { get set }
    var onReply: ((AgentReply) -> Void)? { get set }
    func diagnose() async -> AgentDiagnostic
    func discover() async throws -> [AssistantAgentSession]
    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability>
    func activate(_ session: AssistantAgentSession) async throws
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws
    func submit(in session: AssistantAgentSession) async throws
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws
    func deliverPrompt(_ text: String, in session: AssistantAgentSession) async throws -> AgentPromptReceipt
    func stop(in session: AssistantAgentSession) async throws
    func poll(_ session: AssistantAgentSession?) async
}

extension AgentAdapter {
    /// 未能针对原生实例和会话提供当前能力证据时，一律无控制能力。
    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability> { [] }

    /// 兼容旧适配器仅证明其既有发送入口返回，不猜测排队、执行或原生turn身份。
    func deliverPrompt(_ text: String, in session: AssistantAgentSession) async throws -> AgentPromptReceipt {
        try await sendPrompt(text, in: session)
        return .init(disposition: .accepted)
    }

    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws {
        throw AgentAdapterError.officialChannelRequired
    }
}

/// 同一实例、会话和轮次内拒绝重复/乱序事件；不同实例的序号不互相覆盖。
nonisolated struct AgentEventFilter: Sendable {
    private var sequences: [String: UInt64] = [:]
    private var eventIDs: Set<String> = []
    private var order: [String] = []
    mutating func accepts(_ event: ConversationEvent) -> Bool {
        let fields = [event.applicationID, event.instanceID, event.sessionID, event.turnID]
        let scope = String(decoding: try! JSONEncoder().encode(fields), as: UTF8.self)
        let identity = String(decoding: try! JSONEncoder().encode(fields + [event.eventID]), as: UTF8.self)
        guard !eventIDs.contains(identity), sequences[scope].map({ event.sequence > $0 }) ?? true else { return false }
        sequences[scope] = event.sequence
        eventIDs.insert(identity)
        order.append(identity)
        if order.count > 2_048 { eventIDs.remove(order.removeFirst()) }
        if sequences.count > 1_024 { sequences = [scope: event.sequence] }
        return true
    }
}
