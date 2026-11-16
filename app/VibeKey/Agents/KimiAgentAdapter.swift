import Foundation

/// Kimi Code 官方本机 Server API；只附着用户启动的 server，不创建或夺取已有会话。
@MainActor final class KimiAgentAdapter: AgentAdapter {
    nonisolated struct Connection: Sendable { let endpoint: String; let token: String }
    let id = "kimiCode"
    let name = "Kimi Code Desktop"
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private var webSocket: URLSessionWebSocketTask?
    private var receiveTask: Task<Void, Never>?
    private var selected: AssistantAgentSession?
    private var sequence: UInt64 = 0
    private var reducer = KimiConversationReducer()
    private var validated = false
    private var endedTurns: [String: ConversationState] = [:]
    private var connectionEpoch = UUID().uuidString
    private let network: URLSession
    private var connection: Connection?

    init(connection: Connection? = nil, network: URLSession? = nil) {
        self.connection = connection
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 8
        configuration.httpCookieStorage = nil
        configuration.urlCredentialStorage = nil
        self.network = network ?? URLSession(configuration: configuration, delegate: LocalAgentRedirectPolicy(), delegateQueue: nil)
    }
    var endpoint: String { connection?.endpoint ?? UserDefaults.standard.string(forKey: "assistant.kimi.endpoint") ?? "http://127.0.0.1:58627" }
    var token: String { connection?.token ?? CredentialStore.shared.value(for: "agent.kimi.token") ?? "" }

    func configure(endpoint: String, token: String) throws {
        guard Self.localURL(endpoint) != nil else { throw AgentAdapterError.blocked("Kimi 地址必须是本机 HTTP 服务，且不包含用户名、查询或路径") }
        UserDefaults.standard.set(endpoint, forKey: "assistant.kimi.endpoint")
        CredentialStore.shared.set(token, for: "agent.kimi.token")
        connection = nil; connectionEpoch = UUID().uuidString; validated = false; disconnect()
    }

    /// 仅清除AI助理保存的连接信息，不更改Kimi服务及其会话。
    func clearConfiguration() {
        disconnect()
        UserDefaults.standard.removeObject(forKey: "assistant.kimi.endpoint")
        CredentialStore.shared.set("", for: "agent.kimi.token")
        connection = nil; connectionEpoch = UUID().uuidString; validated = false
    }

    func diagnose() async -> AgentDiagnostic {
        do {
            guard !token.isEmpty else { throw AgentAdapterError.blocked("填写原 Kimi Code server 的本机访问令牌") }
            // Beta API 以运行版本的 schema 为准；缺少必要接口时保持阻塞，不猜替代端点。
            let schema = try await rawGET("/openapi.json")
            guard let paths = schema["paths"] as? [String: Any],
                  paths["/api/v1/sessions"] != nil,
                  paths["/api/v1/sessions/{session_id}/prompts"] != nil,
                  paths["/api/v1/sessions/{session_id}:abort"] != nil else { throw AgentAdapterError.blocked("此 Kimi Code 版本缺少所需 Server API") }
            _ = try await request("GET", "/api/v1/sessions?page_size=1")
            validated = true
            return AgentDiagnostic(id: id, name: name, capabilities: [.discover, .activate, .submit, .stop, .observeState, .readReply],
                                   detail: "官方本机会话 API 已连接；直接提交，无原应用草稿接口", installed: true, verifiedAt: Date())
        } catch {
            validated = false
            return AgentDiagnostic(id: id, name: name, capabilities: [], detail: error.localizedDescription, installed: !token.isEmpty, verifiedAt: Date())
        }
    }

    func discover() async throws -> [AssistantAgentSession] {
        guard validated else { return [] }
        let data = try await request("GET", "/api/v1/sessions?page_size=100")
        guard let items = data["items"] as? [[String: Any]] else { throw AgentAdapterError.invalidResponse }
        return items.compactMap { item in
            guard let sessionID = item["id"] as? String, Self.safeID(sessionID) else { return nil }
            return AssistantAgentSession(applicationID: id, instanceID: connectionEpoch, sessionID: sessionID,
                                         name: (item["title"] as? String).flatMap { $0.isEmpty ? nil : $0 } ?? "Kimi Code")
        }
    }

    func activate(_ session: AssistantAgentSession) async throws {
        guard validated, session.applicationID == id, session.instanceID == connectionEpoch, Self.safeID(session.sessionID) else { throw AgentAdapterError.sessionChanged }
        if selected == session, webSocket != nil { return }
        disconnect()
        var components = URLComponents(url: try baseURL(), resolvingAgainstBaseURL: false)!
        components.scheme = "ws"; components.path = "/api/v1/ws"
        guard let url = components.url else { throw AgentAdapterError.invalidResponse }
        var request = URLRequest(url: url)
        request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
        let socket = network.webSocketTask(with: request)
        webSocket = socket; selected = session; socket.resume()
        let requestID = UUID().uuidString
        try await socket.send(.string(Self.jsonString(["type": "subscribe", "request_id": requestID,
                                                      "session_id": session.sessionID, "agent_ids": ["main"]])))
        let handshakeTimeout = Task { try? await Task.sleep(for: .seconds(8)); if !Task.isCancelled { socket.cancel(with: .goingAway, reason: nil) } }
        defer { handshakeTimeout.cancel() }
        do {
            while true {
                let message = try await socket.receive()
                let bytes: Data
                switch message { case .data(let data): bytes = data; case .string(let text): bytes = Data(text.utf8); @unknown default: continue }
                guard bytes.count <= 1_048_576, let frame = try JSONSerialization.jsonObject(with: bytes) as? [String: Any] else { throw AgentAdapterError.invalidResponse }
                if frame["type"] as? String == "ping" { try await socket.send(.string("{\"type\":\"pong\"}")) }
                if frame["type"] as? String == "response", frame["request_id"] as? String == requestID {
                    guard frame["code"] as? Int == 0 else { throw AgentAdapterError.blocked("Kimi 未能附着原会话；可能被其他进程占用，不会自动夺取") }
                    break
                }
            }
        } catch { disconnect(); throw error }
        // 接收任务将订阅错误（例如40931会话被占用）作为错误事件交给诊断，不自动takeover。
        receiveTask = Task { [weak self] in
            do {
                while !Task.isCancelled {
                    let message = try await socket.receive()
                    let data: Data
                    switch message { case .data(let bytes): data = bytes; case .string(let text): data = Data(text.utf8); @unknown default: continue }
                    guard data.count <= 1_048_576, let frame = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw AgentAdapterError.invalidResponse }
                    try await self?.handle(frame, session: session, socket: socket)
                }
            } catch {
                guard !Task.isCancelled, let self else { return }
                self.emit(.error, session: session, turnID: "connection")
                self.webSocket = nil
                self.validated = false // 出错后由用户重新检测，不每400ms重试并触发认证封禁。
            }
        }
    }

    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws {
        throw AgentAdapterError.blocked("Kimi Server API 不提供原应用草稿写入，请使用直接发送")
    }
    func submit(in session: AssistantAgentSession) async throws {
        throw AgentAdapterError.blocked("Kimi Server API 不读取原应用未发送草稿，请使用直接发送")
    }
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf8.count <= 64_000 else { throw AgentAdapterError.blocked("消息为空或过长") }
        try await activate(session)
        let result = try await request("POST", "/api/v1/sessions/\(session.sessionID)/prompts", body: [
            "prompt_id": UUID().uuidString, "content": [["type": "text", "text": text]],
        ])
        guard let status = result["status"] as? String, ["running", "queued"].contains(status) else {
            throw AgentAdapterError.blocked("Kimi 未接受消息；请检查原会话")
        }
    }
    func stop(in session: AssistantAgentSession) async throws {
        guard selected == session else { throw AgentAdapterError.sessionChanged }
        guard let turnID = reducer.activeTurnIDs.first else { throw AgentAdapterError.blocked("尚未取得当前运行轮次，请等待状态同步后再停止") }
        _ = try await request("POST", "/api/v1/sessions/\(session.sessionID):abort", body: [:])
        let deadline = ContinuousClock.now + .seconds(8)
        repeat {
            if let ended = endedTurns[turnID] {
                guard ended == .stopped else { throw AgentAdapterError.blocked("原轮次已自行结束，未确认本次停止") }
                return
            }
            try await Task.sleep(for: .milliseconds(80))
        } while ContinuousClock.now < deadline
        throw AgentAdapterError.deliveryUnknown
    }
    func poll(_ session: AssistantAgentSession?) async {
        if let session, session.applicationID == id, webSocket == nil { try? await activate(session) }
    }

    private func handle(_ frame: [String: Any], session: AssistantAgentSession, socket: URLSessionWebSocketTask) async throws {
        guard selected == session, let type = frame["type"] as? String else { return }
        if type == "ping" { try await socket.send(.string("{\"type\":\"pong\"}")); return }
        if type == "response", let code = frame["code"] as? Int, code != 0 { throw AgentAdapterError.blocked("Kimi 订阅失败（\(code)），未夺取会话") }
        guard frame["session_id"] as? String == session.sessionID,
              frame["agent_id"] as? String == "main" || type == "interaction" else { return }
        let data = try JSONSerialization.data(withJSONObject: frame)
        let typed = try JSONDecoder().decode(KimiServerFrame.self, from: data)
        if let output = reducer.apply(typed, sessionID: session.sessionID) {
            if [.completed, .stopped, .error].contains(output.state) { endedTurns[output.turnID] = output.state }
            emit(output.state, session: session, turnID: output.turnID)
            if let reply = output.reply, !reply.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                onReply?(AgentReply(session: session, turnID: output.turnID, messageID: reply.id, text: reply.text, isFinal: true))
            }
        }
    }

    private func emit(_ state: ConversationState, session: AssistantAgentSession, turnID: String) {
        sequence += 1
        onEvent?(ConversationEvent(applicationID: id, instanceID: session.instanceID, sessionID: session.sessionID,
                                   turnID: turnID, eventID: UUID().uuidString, sequence: sequence, state: state, timestamp: Date()))
    }
    private func request(_ method: String, _ path: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        var request = URLRequest(url: URL(string: path, relativeTo: try baseURL())!)
        request.httpMethod = method; request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
        if let body { request.httpBody = try JSONSerialization.data(withJSONObject: body); request.setValue("application/json", forHTTPHeaderField: "Content-Type") }
        let (data, response) = try await network.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode), data.count <= 2_097_152,
              let envelope = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw AgentAdapterError.invalidResponse }
        guard envelope["code"] as? Int == 0 else {
            let code = envelope["code"] as? Int ?? -1
            throw AgentAdapterError.blocked("Kimi API 拒绝请求（\(code)）；不会自动夺取、重试或修改权限")
        }
        return envelope["data"] as? [String: Any] ?? [:]
    }
    private func rawGET(_ path: String) async throws -> [String: Any] {
        var request = URLRequest(url: URL(string: path, relativeTo: try baseURL())!)
        request.setValue("Bearer " + token, forHTTPHeaderField: "Authorization")
        let (data, response) = try await network.data(for: request)
        guard (response as? HTTPURLResponse)?.statusCode == 200, data.count <= 8_388_608,
              let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw AgentAdapterError.invalidResponse }
        return value
    }
    private func baseURL() throws -> URL { guard let url = Self.localURL(endpoint), !token.isEmpty else { throw AgentAdapterError.blocked("请配置 Kimi Code 本机服务和访问令牌") }; return url }
    nonisolated static func localURL(_ text: String) -> URL? {
        guard let url = URL(string: text), url.scheme == "http", ["127.0.0.1", "localhost", "[::1]", "::1"].contains(url.host ?? ""),
              url.user == nil, url.password == nil, url.query == nil, url.fragment == nil, ["", "/"].contains(url.path) else { return nil }
        return url
    }
    nonisolated private static func safeID(_ id: String) -> Bool { id.range(of: "^[A-Za-z0-9_-]{1,200}$", options: .regularExpression) != nil }
    private static func jsonString(_ object: [String: Any]) throws -> String { String(decoding: try JSONSerialization.data(withJSONObject: object), as: UTF8.self) }
    func disconnect() { receiveTask?.cancel(); receiveTask = nil; webSocket?.cancel(with: .goingAway, reason: nil); webSocket = nil; selected = nil; reducer.reset(); endedTurns.removeAll() }
}

/// 本机凭据不能随HTTP重定向离开用户配置的服务。
nonisolated private final class LocalAgentRedirectPolicy: NSObject, URLSessionTaskDelegate, @unchecked Sendable {
    func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse,
                    newRequest request: URLRequest, completionHandler: @escaping @Sendable (URLRequest?) -> Void) {
        completionHandler(nil)
    }
}
