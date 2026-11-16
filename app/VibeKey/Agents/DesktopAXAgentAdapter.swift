import AppKit

/// 已停用的历史桌面兼容入口；仅检测应用安装元数据，不读取或操作任何应用界面。
/// 保留类型名使旧调用显式失败，控制能力只能由正式API/RPC/扩展适配器声明。
@MainActor final class DesktopAXAgentAdapter: AgentAdapter {
    let id: String
    let name: String
    private let bundleIDs: [String]
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?

    init(id: String, name: String, bundleIDs: [String]) {
        self.id = id; self.name = name; self.bundleIDs = bundleIDs
    }

    func diagnose() async -> AgentDiagnostic {
        AgentDiagnostic(id: id, name: name, capabilities: [],
                        detail: "当前应用未连接官方双向接口，界面控制已停用",
                        installed: bundleIDs.contains { NSWorkspace.shared.urlForApplication(withBundleIdentifier: $0) != nil },
                        verifiedAt: Date())
    }
    func discover() async throws -> [AssistantAgentSession] { [] }
    func activate(_ session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func submit(in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func stop(in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func poll(_ session: AssistantAgentSession?) async { }
}
