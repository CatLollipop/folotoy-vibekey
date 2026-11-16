import AppKit
import CryptoKit
import Carbon.HIToolbox

/// Claude Code现有Terminal会话的输入和Hook回执。不启动第二个CLI、不向tty写输出冒充输入。
@MainActor final class ClaudeCodeAgentAdapter: AgentAdapter {
    let id = "claudeCode"
    let name = "Claude Code"
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let mailbox: AgentMailbox
    private let reader: MailboxAgentAdapter
    private let inserter = TextInserter()
    private var drafts: [String: String] = [:]
    init(mailbox: AgentMailbox) {
        self.mailbox = mailbox
        reader = MailboxAgentAdapter(id: "claudeCode", name: "Claude Code", mailbox: mailbox)
        reader.onEvent = { [weak self] in self?.onEvent?($0) }
        reader.onReply = { [weak self] in self?.onReply?($0) }
    }
    func diagnose() async -> AgentDiagnostic {
        let registrations = mailbox.registrations(for: id)
        var capabilities = Set(registrations.flatMap(\.capabilities))
        let controllable = registrations.contains { $0.processID != nil && Self.validTTY($0.terminalTTY) }
        if controllable { capabilities.formUnion([.activate, .insertDraft, .submit]) }
        return AgentDiagnostic(id: id, name: name, capabilities: capabilities,
                               detail: registrations.isEmpty ? "安装 Hook 后在原 Claude Code 会话重新加载配置" :
                                controllable ? "已绑定原 Terminal tty；发送需正式 Hook 回执；停止能力仍需原应用确认" : "Hook 已连接，但未能核对原 Terminal tty；输入保持阻塞",
                               installed: !registrations.isEmpty, verifiedAt: Date())
    }
    func discover() async throws -> [AssistantAgentSession] { try await reader.discover() }
    func activate(_ session: AssistantAgentSession) async throws {
        let registration = try registration(session)
        try Self.focusTerminal(tty: registration.terminalTTY)
    }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf8.count <= 64_000 else { throw AgentAdapterError.blocked("消息为空或过长") }
        let registration = try registration(session)
        let state: State? = mailbox.read(instanceURL(session).appendingPathComponent("state.json"))
        guard let state, ["idle", "completed", "stopped"].contains(state.status) else { throw AgentAdapterError.blocked("Claude Code 正在工作或等待确认，请先在原终端处理") }
        try Self.focusTerminal(tty: registration.terminalTTY)
        guard let terminal = NSWorkspace.shared.frontmostApplication, terminal.bundleIdentifier == "com.apple.Terminal",
              await inserter.insert(text, target: terminal) == .pasted else { throw AgentAdapterError.blocked("无法向已选 Terminal 会话输入") }
        drafts[session.id] = text
    }
    func submit(in session: AssistantAgentSession) async throws {
        guard let text = drafts[session.id] else { throw AgentAdapterError.blocked("没有由助理写入的原终端草稿") }
        let registration = try registration(session)
        try Self.focusTerminal(tty: registration.terminalTTY)
        guard let terminal = NSWorkspace.shared.frontmostApplication, terminal.bundleIdentifier == "com.apple.Terminal" else { throw AgentAdapterError.sessionChanged }
        let requestID = UUID().uuidString
        let instance = instanceURL(session)
        let pending = instance.appendingPathComponent("pending-submit.json")
        let receipt = instance.appendingPathComponent("ack-" + requestID + ".json")
        let hash = SHA256.hash(data: Data(text.utf8)).map { String(format: "%02x", $0) }.joined()
        try mailbox.write(Pending(requestID: requestID, sessionID: session.sessionID, promptHash: hash,
                                  expiresAt: Date().addingTimeInterval(5)), to: pending)
        defer { try? FileManager.default.removeItem(at: pending); try? FileManager.default.removeItem(at: receipt) }
        // 发键前再次验证原Claude进程仍存在；发键后只等同会话同prompt的正式Hook，不补发。
        _ = try self.registration(session)
        guard KeySender.press(kVK_Return, processID: terminal.processIdentifier) else { throw AgentAdapterError.blocked("未能发送提交按键") }
        drafts[session.id] = nil
        let deadline = ContinuousClock.now + .seconds(5)
        repeat {
            try await Task.sleep(for: .milliseconds(80))
            if let ack: AgentMailbox.Receipt = mailbox.read(receipt), ack.requestID == requestID, ack.status == "applied" { return }
        } while ContinuousClock.now < deadline
        throw AgentAdapterError.deliveryUnknown
    }
    func stop(in session: AssistantAgentSession) async throws {
        // Esc缺少可关联的完成回执，不能因为发了按键就声称已停。用户可在原应用停止。
        throw AgentAdapterError.blocked("此 Claude Code Terminal 接入尚无可验证的停止回执，请在原终端停止")
    }
    func poll(_ session: AssistantAgentSession?) async { await reader.poll(session) }
    private func registration(_ session: AssistantAgentSession) throws -> AgentMailbox.Registration {
        guard let registration = mailbox.registrations(for: id).first(where: { $0.instanceID == session.instanceID && $0.sessions.contains(session) }),
              let pid = registration.processID, pid > 0, kill(pid, 0) == 0, Self.validTTY(registration.terminalTTY) else { throw AgentAdapterError.sessionChanged }
        return registration
    }
    private func instanceURL(_ session: AssistantAgentSession) -> URL { mailbox.root.appendingPathComponent("instances").appendingPathComponent(session.instanceID) }
    nonisolated private struct Pending: Codable { let requestID: String; let sessionID: String; let promptHash: String; let expiresAt: Date }
    nonisolated private struct State: Decodable { let status: String }
    nonisolated private static func validTTY(_ tty: String?) -> Bool { tty?.range(of: "^/dev/ttys[0-9A-Za-z]+$", options: .regularExpression) != nil }
    private static func focusTerminal(tty: String?) throws {
        guard validTTY(tty), let tty else { throw AgentAdapterError.blocked("没有可验证的原 Terminal tty") }
        let source = """
        tell application id "com.apple.Terminal"
          repeat with targetWindow in windows
            repeat with targetTab in tabs of targetWindow
              if tty of targetTab is "\(tty)" then
                set selected tab of targetWindow to targetTab
                set index of targetWindow to 1
                activate
                return true
              end if
            end repeat
          end repeat
        end tell
        return false
        """
        var error: NSDictionary?
        guard NSAppleScript(source: source)?.executeAndReturnError(&error).booleanValue == true, error == nil else {
            throw AgentAdapterError.blocked("未能定位原 Terminal 标签页；请检查自动化权限和原会话是否仍打开")
        }
    }
}
