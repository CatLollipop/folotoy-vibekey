import AppKit
import ApplicationServices
import CryptoKit

/// 保守的桌面兼容层：只控制当前窗口的绑定会话，只有显式 assistant 消息容器可朗读。
/// 不用整个窗口文字猜回复，也不用定时器猜任务成功。
@MainActor final class DesktopAXAgentAdapter: AgentAdapter {
    let id: String
    let name: String
    private let bundleIDs: [String]
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let inserter = TextInserter()
    private var boundTitles: [String: String] = [:]
    private var sequence: UInt64 = 0
    private var turns: [String: String] = [:]
    private var lastStates: [String: ConversationState] = [:]
    private var sawRunning: Set<String> = []
    private var lastReplies: [String: String] = [:]
    private var drafts: [String: String] = [:]
    private var observed: [String: Set<AgentCapability>] = [:]
    private var windowIDs: [AXUIElement: String] = [:]

    init(id: String, name: String, bundleIDs: [String]) { self.id = id; self.name = name; self.bundleIDs = bundleIDs }

    private var running: NSRunningApplication? {
        bundleIDs.lazy.flatMap { NSRunningApplication.runningApplications(withBundleIdentifier: $0) }.first { !$0.isTerminated }
    }
    func diagnose() async -> AgentDiagnostic {
        var capabilities: Set<AgentCapability> = []
        var detail = "未运行；打开应用后检测"
        let installed = bundleIDs.contains { NSWorkspace.shared.urlForApplication(withBundleIdentifier: $0) != nil }
        if !AXIsProcessTrusted() { detail = "需要辅助功能权限" }
        else if let app = running, let window = AgentSessionCatalogLoader.focusedWindow(of: app.processIdentifier) {
            _ = ElectronAccessibility.enable(processID: app.processIdentifier)
            _ = inspectControls(window)
            capabilities = observed[observationKey(window)] ?? []
            detail = "仅当前可见会话；状态需可见生成控件，朗读需明确 assistant 消息容器"
        }
        return AgentDiagnostic(id: id, name: name, capabilities: capabilities, detail: detail,
                               installed: installed, verifiedAt: Date())
    }

    func discover() async throws -> [AssistantAgentSession] {
        guard AXIsProcessTrusted(), let app = running,
              let window = AgentSessionCatalogLoader.focusedWindow(of: app.processIdentifier) else { return [] }
        let title = AgentAX.string(window, kAXTitleAttribute)
        let document = AgentAX.string(window, kAXDocumentAttribute)
        guard !title.isEmpty || !document.isEmpty else { return [] }
        let identity = document.isEmpty ? title : document
        let token = windowID(window) + "-" + Self.digest(identity)
        let session = AssistantAgentSession(applicationID: id, instanceID: "pid-\(app.processIdentifier)",
                                            sessionID: token, name: title.isEmpty ? name : title)
        boundTitles[session.id] = identity
        return [session]
    }

    /// Hook关联必须在当前窗口的文档/URL/Identifier看到同一原生ID；标题相同本身不够。
    func matchesNativeSession(_ nativeID: String, in session: AssistantAgentSession) -> Bool {
        guard nativeID.count >= 8, nativeID.count <= 200, let (_, window) = try? target(session) else { return false }
        let values = [AgentAX.string(window, kAXDocumentAttribute), AgentAX.string(window, kAXURLAttribute), AgentAX.string(window, kAXIdentifierAttribute)]
        let pattern = "(^|[^A-Za-z0-9_-])" + NSRegularExpression.escapedPattern(for: nativeID) + "($|[^A-Za-z0-9_-])"
        return values.contains { $0.range(of: pattern, options: .regularExpression) != nil }
    }

    func activate(_ session: AssistantAgentSession) async throws {
        let (app, window) = try target(session)
        app.activate(options: [.activateAllWindows])
        _ = AXUIElementSetAttributeValue(AXUIElementCreateApplication(app.processIdentifier), kAXFrontmostAttribute as CFString, kCFBooleanTrue)
        _ = AXUIElementPerformAction(window, kAXRaiseAction as CFString)
        _ = ElectronAccessibility.enable(processID: app.processIdentifier)
        guard NSWorkspace.shared.frontmostApplication?.processIdentifier == app.processIdentifier else {
            throw AgentAdapterError.blocked("无法前置原应用窗口")
        }
    }

    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf8.count <= 64_000 else {
            throw AgentAdapterError.blocked("草稿为空或过长")
        }
        try await activate(session)
        let (app, window) = try target(session)
        let controls = inspectControls(window)
        guard controls.stop == nil, let input = controls.composer else { throw AgentAdapterError.blocked("未找到空闲的聊天输入框") }
        let before = AgentAX.string(input, kAXValueAttribute)
        guard before.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw AgentAdapterError.blocked("原输入框已有草稿，请先处理后再发送")
        }
        guard AXUIElementSetAttributeValue(input, kAXFocusedAttribute as CFString, kCFBooleanTrue) == .success else {
            throw AgentAdapterError.blocked("无法聚焦原会话输入框")
        }
        var settable = DarwinBoolean(false)
        if AXUIElementIsAttributeSettable(input, kAXValueAttribute as CFString, &settable) == .success, settable.boolValue {
            guard AXUIElementSetAttributeValue(input, kAXValueAttribute as CFString, text as CFString) == .success else {
                throw AgentAdapterError.blocked("输入框拒绝写入草稿")
            }
        } else {
            guard await inserter.insert(text, target: app) == .pasted else { throw AgentAdapterError.blocked("未能向原输入框粘贴草稿") }
        }
        try await Task.sleep(for: .milliseconds(180))
        let (_, refreshed) = try target(session)
        guard let current = inspectControls(refreshed).composer,
              AgentAX.string(current, kAXValueAttribute).trimmingCharacters(in: .whitespacesAndNewlines) == text.trimmingCharacters(in: .whitespacesAndNewlines) else {
            throw AgentAdapterError.deliveryUnknown
        }
        drafts[session.id] = text
    }

    func submit(in session: AssistantAgentSession) async throws {
        try await activate(session)
        let (_, window) = try target(session)
        let controls = inspectControls(window)
        guard let draft = drafts[session.id], let input = controls.composer,
              AgentAX.string(input, kAXValueAttribute).trimmingCharacters(in: .whitespacesAndNewlines) == draft.trimmingCharacters(in: .whitespacesAndNewlines),
              let send = controls.send, controls.approval == nil else {
            throw AgentAdapterError.blocked("无法核对原会话草稿和发送控件")
        }
        // 只触发一次；AXPress 无效果时不再补回车，避免重复提交。
        guard AgentAX.press(send) else { throw AgentAdapterError.blocked("原应用发送按钮拒绝操作") }
        turns[session.id] = UUID().uuidString
        drafts[session.id] = nil
        let deadline = ContinuousClock.now + .seconds(2)
        repeat {
            try await Task.sleep(for: .milliseconds(80))
            let (_, after) = try target(session)
            let snapshot = inspectControls(after)
            if let composer = snapshot.composer, AgentAX.string(composer, kAXValueAttribute).isEmpty {
                emit(.receiving, session: session)
                return
            }
        } while ContinuousClock.now < deadline
        throw AgentAdapterError.deliveryUnknown
    }

    func stop(in session: AssistantAgentSession) async throws {
        try await activate(session)
        let (_, window) = try target(session)
        guard let button = inspectControls(window).stop, AgentAX.press(button) else {
            throw AgentAdapterError.blocked("未找到本会话的停止生成按钮")
        }
        let deadline = ContinuousClock.now + .seconds(2)
        repeat {
            try await Task.sleep(for: .milliseconds(80))
            let (_, current) = try target(session)
            if inspectControls(current).stop == nil {
                sawRunning.remove(session.id)
                emit(.stopped, session: session)
                return
            }
        } while ContinuousClock.now < deadline
        throw AgentAdapterError.deliveryUnknown
    }

    func poll(_ session: AssistantAgentSession?) async {
        guard let session, session.applicationID == id, let (_, window) = try? target(session) else { return }
        let controls = inspectControls(window)
        if controls.approval != nil { emit(.waitingInput, session: session); return }
        if controls.stop != nil {
            // 生成控件真实出现代表新一轮；手动发起的后续轮也不能复用上次completed的身份。
            if !sawRunning.contains(session.id) {
                turns[session.id] = UUID().uuidString
                lastReplies[session.id] = nil // 两轮可合法回答同样文本；只在本轮内去重。
            }
            sawRunning.insert(session.id)
            emit(.replying, session: session)
            return
        }
        guard sawRunning.remove(session.id) != nil else { return }
        // 必须真正见过生成控件再消失；消息稳定只是确认正文，不用于猜开始/结束。
        guard let reply = controls.reply else { emit(.unknown, session: session); return }
        let text = Self.replyText(reply)
        guard !text.isEmpty else { emit(.unknown, session: session); return }
        try? await Task.sleep(for: .milliseconds(250))
        guard let (_, refreshed) = try? target(session), let fresh = inspectControls(refreshed).reply,
              inspectControls(refreshed).stop == nil, Self.replyText(fresh) == text else {
            sawRunning.insert(session.id); return
        }
        let messageID = Self.digest(text)
        guard lastReplies[session.id] != messageID else { return }
        lastReplies[session.id] = messageID
        observed[observationKey(refreshed), default: []].insert(.readReply)
        emit(.completed, session: session)
        onReply?(AgentReply(session: session, turnID: turns[session.id] ?? "visible", messageID: messageID, text: text, isFinal: true))
    }

    private func target(_ session: AssistantAgentSession) throws -> (NSRunningApplication, AXUIElement) {
        guard session.applicationID == id, let app = running,
              session.instanceID == "pid-\(app.processIdentifier)",
              let window = AgentSessionCatalogLoader.focusedWindow(of: app.processIdentifier) else { throw AgentAdapterError.sessionChanged }
        let document = AgentAX.string(window, kAXDocumentAttribute)
        let identity = document.isEmpty ? AgentAX.string(window, kAXTitleAttribute) : document
        guard boundTitles[session.id] == identity, windowID(window) + "-" + Self.digest(identity) == session.sessionID else { throw AgentAdapterError.sessionChanged }
        return (app, window)
    }

    private struct Controls { var composer: AXUIElement?; var send: AXUIElement?; var stop: AXUIElement?; var approval: AXUIElement?; var reply: AXUIElement? }
    private func inspectControls(_ window: AXUIElement) -> Controls {
        var controls = Controls()
        let nodes = AgentAX.all(in: window, maxDepth: 45, maxNodes: 6_000) { node in
            AgentAX.bool(node, kAXHiddenAttribute) != true && AgentAX.bool(node, kAXEnabledAttribute) != false
        }
        let inputs = nodes.filter { AgentAX.string($0, kAXRoleAttribute) == "AXTextArea" }
        if inputs.count == 1 { controls.composer = inputs[0] }
        for node in nodes {
            let role = AgentAX.string(node, kAXRoleAttribute)
            let label = [AgentAX.string(node, kAXTitleAttribute), AgentAX.string(node, kAXDescriptionAttribute)]
            if role == "AXButton", AgentAX.hasAction(node, kAXPressAction) {
                if label.contains(where: CodexAccessibilityLabels.isSend) { controls.send = node }
                if label.contains(where: CodexAccessibilityLabels.isStop) { controls.stop = node }
                if label.contains(where: CodexAccessibilityLabels.isApproval) { controls.approval = node }
            }
            let identifier = AgentAX.string(node, kAXIdentifierAttribute).lowercased()
            let description = AgentAX.string(node, kAXDescriptionAttribute).lowercased()
            if ["assistant-message", "assistant-turn", "message-assistant"].contains(where: identifier.contains)
                || ["assistant message", "assistant response", "claude response", "claude 的回复", "助手回复"].contains(description) {
                controls.reply = node
            }
        }
        // 发送/停止控件常在不同时刻互相替换；能力记录在同一窗口会话内，不能要求同时可见。
        // 单有assistant容器不证明能读取正文，readReply只在完整回复实际通过稳定性检查后登记。
        let key = observationKey(window)
        var available: Set<AgentCapability> = [.discover, .activate]
        if controls.composer != nil { available.insert(.insertDraft) }
        if controls.send != nil { available.insert(.submit) }
        if controls.stop != nil { available.formUnion([.stop, .observeState]) }
        observed[key, default: []].formUnion(available)
        if observed.count > 64 { observed = [key: observed[key] ?? []] }
        return controls
    }

    private func observationKey(_ window: AXUIElement) -> String {
        let document = AgentAX.string(window, kAXDocumentAttribute)
        return "\(running?.processIdentifier ?? 0):" + windowID(window) + ":" + Self.digest(document.isEmpty ? AgentAX.string(window, kAXTitleAttribute) : document)
    }
    private func windowID(_ window: AXUIElement) -> String {
        if let value = windowIDs[window] { return value }
        if windowIDs.count > 128 { windowIDs.removeAll() }
        let value = UUID().uuidString
        windowIDs[window] = value
        return value
    }

    private static func replyText(_ root: AXUIElement) -> String {
        var texts: [String] = []
        func collect(_ node: AXUIElement, depth: Int) {
            guard depth < 25, texts.count < 2_000, AgentAX.bool(node, kAXHiddenAttribute) != true else { return }
            let role = AgentAX.string(node, kAXRoleAttribute)
            let identifier = AgentAX.string(node, kAXIdentifierAttribute).lowercased()
            if ["AXButton", "AXTextArea", "AXTextField"].contains(role)
                || ["thinking", "reasoning", "tool-result", "tool-call"].contains(where: identifier.contains) { return }
            if role == "AXStaticText" {
                let value = AgentAX.string(node, kAXValueAttribute)
                if !value.isEmpty { texts.append(value) }
            } else { for child in AgentAX.children(node) { collect(child, depth: depth + 1) } }
        }
        collect(root, depth: 0)
        return String(texts.joined(separator: "\n").prefix(32_000)).trimmingCharacters(in: .whitespacesAndNewlines)
    }
    private func emit(_ state: ConversationState, session: AssistantAgentSession) {
        guard lastStates[session.id] != state else { return }
        lastStates[session.id] = state; sequence += 1
        onEvent?(ConversationEvent(applicationID: id, instanceID: session.instanceID, sessionID: session.sessionID,
                                   turnID: turns[session.id] ?? "visible", eventID: UUID().uuidString, sequence: sequence,
                                   state: state, timestamp: Date()))
    }
    nonisolated private static func digest(_ value: String) -> String { SHA256.hash(data: Data(value.utf8)).map { String(format: "%02x", $0) }.joined() }
}
