import Foundation
import Darwin

/// 原进程扩展与桌面之间的私有邮箱。0700 目录和0600文件限制到当前系统用户，
/// 不开网络监听；命令由原进程执行并返回 applied，写入文件不等于提交成功。
@MainActor final class AgentMailbox {
    nonisolated struct Registration: Codable, Sendable {
        let protocolVersion: Int
        let adapterID: String
        let instanceID: String
        let name: String
        let capabilities: [AgentCapability]
        let sessions: [AssistantAgentSession]
        let updatedAt: Date
        let processID: Int32?
        let terminalTTY: String?
        var controlTransport: String? = nil
    }
    nonisolated struct Envelope: Codable, Sendable {
        let event: ConversationEvent
        let reply: MailboxReply?
        var nativeProcessID: Int32? = nil
    }
    nonisolated struct MailboxReply: Codable, Sendable {
        let messageID: String
        let text: String
        let isFinal: Bool
    }
    nonisolated struct Command: Codable, Sendable {
        let requestID: String
        let instanceID: String
        let sessionID: String
        let operation: String
        let text: String?
        let createdAt: Date
        let expiresAt: Date
    }
    nonisolated struct Receipt: Codable, Sendable {
        let requestID: String
        let status: String
        let error: String?
    }

    let root: URL
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    private var consumed: Set<String> = []

    init(root: URL? = nil) {
        self.root = root ?? FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("FoloButtonDev/AgentBridge", isDirectory: true)
        decoder = JSONDecoder(); decoder.dateDecodingStrategy = .secondsSince1970
        encoder = JSONEncoder(); encoder.dateEncodingStrategy = .secondsSince1970
    }

    func prepare() throws {
        for directory in [root, root.appendingPathComponent("instances"), root.appendingPathComponent("events")] {
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true,
                                                    attributes: [.posixPermissions: 0o700])
            guard !isSymbolicLink(directory) else { throw AgentAdapterError.blocked("桥接目录不能是符号链接") }
            try FileManager.default.setAttributes([.posixPermissions: 0o700], ofItemAtPath: directory.path)
        }
    }

    func registrations(for adapterID: String) -> [Registration] {
        let base = root.appendingPathComponent("instances")
        let directories = (try? FileManager.default.contentsOfDirectory(at: base, includingPropertiesForKeys: nil)) ?? []
        return directories.compactMap { directory -> Registration? in
            guard validComponent(directory.lastPathComponent), !isSymbolicLink(directory),
                  let item: Registration = read(directory.appendingPathComponent("registration.json")),
                  item.protocolVersion == 1, item.adapterID == adapterID,
                  item.instanceID == directory.lastPathComponent,
                  (Date().timeIntervalSince(item.updatedAt) < 20 ||
                    (adapterID == "claudeCode" && item.controlTransport != "claude-mod" && item.processID.map({ $0 > 0 && kill($0, 0) == 0 }) == true)),
                  Date().timeIntervalSince(item.updatedAt) > -30,
                  item.sessions.allSatisfy({ $0.applicationID == adapterID && $0.instanceID == item.instanceID }) else { return nil }
            return item
        }.prefix(64).map { $0 }
    }

    func events(for adapterID: String) -> [Envelope] {
        let base = root.appendingPathComponent("events")
        let files = ((try? FileManager.default.contentsOfDirectory(at: base, includingPropertiesForKeys: nil)) ?? [])
            .filter { $0.pathExtension == "json" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
        var result: [Envelope] = []
        for file in files.prefix(512) where !consumed.contains(file.lastPathComponent) {
            if let attributes = try? FileManager.default.attributesOfItem(atPath: file.path),
               let modified = attributes[.modificationDate] as? Date, Date().timeIntervalSince(modified) > 600 {
                try? FileManager.default.removeItem(at: file); continue
            }
            guard let envelope: Envelope = read(file), envelope.event.applicationID == adapterID else { continue }
            consumed.insert(file.lastPathComponent)
            if !suppressedLegacyClaude(envelope) { result.append(envelope) }
            // 成功消费后删除文件，正文不形成第二份永久聊天历史。
            try? FileManager.default.removeItem(at: file)
        }
        if consumed.count > 4_096 { consumed.removeAll() }
        return result.sorted { $0.event.sequence < $1.event.sequence }
    }

    /// 只按可证明的原CLI PID+原生session择一事件源，不猜测Hook与Mod的turnID关系。
    private func suppressedLegacyClaude(_ envelope: Envelope) -> Bool {
        guard envelope.event.applicationID == "claudeCode" else { return false }
        let registrations = registrations(for: "claudeCode")
        let source = registrations.first { $0.instanceID == envelope.event.instanceID }
        guard source?.controlTransport != "claude-mod",
              let pid = envelope.nativeProcessID ?? source?.processID, pid > 0 else { return false }
        return registrations.contains { item in
            item.controlTransport == "claude-mod" && item.processID == pid &&
                Date().timeIntervalSince(item.updatedAt) < 20 && item.sessions.contains {
                    $0.applicationID == "claudeCode" && $0.sessionID == envelope.event.sessionID
                }
        }
    }

    func command(_ operation: String, text: String? = nil, session: AssistantAgentSession) async throws {
        guard validComponent(session.instanceID),
              registrations(for: session.applicationID).contains(where: {
                  $0.instanceID == session.instanceID && $0.sessions.contains(where: {
                      $0.applicationID == session.applicationID && $0.instanceID == session.instanceID && $0.sessionID == session.sessionID
                  })
              }) else { throw AgentAdapterError.sessionChanged }
        let instance = root.appendingPathComponent("instances").appendingPathComponent(session.instanceID)
        let requests = instance.appendingPathComponent("requests")
        let responses = instance.appendingPathComponent("responses")
        for folder in [requests, responses] {
            guard !isSymbolicLink(folder) else { throw AgentAdapterError.invalidResponse }
            try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true,
                                                    attributes: [.posixPermissions: 0o700])
        }
        let requestID = UUID().uuidString
        let now = Date()
        let request = Command(requestID: requestID, instanceID: session.instanceID, sessionID: session.sessionID,
                              operation: operation, text: text, createdAt: now, expiresAt: now.addingTimeInterval(8))
        let requestFile = requests.appendingPathComponent(requestID + ".json")
        let responseFile = responses.appendingPathComponent(requestID + ".json")
        try Task.checkCancellation()
        try write(request, to: requestFile)
        defer { try? FileManager.default.removeItem(at: requestFile); try? FileManager.default.removeItem(at: responseFile) }
        let deadline = ContinuousClock.now + .seconds(9)
        repeat {
            if Task.isCancelled { throw AgentAdapterError.deliveryUnknown }
            if let receipt: Receipt = read(responseFile), receipt.requestID == requestID {
                switch receipt.status {
                case "applied": return
                case "failed": throw AgentAdapterError.blocked(receipt.error ?? "应用未执行命令")
                case "deliveryUnknown": throw AgentAdapterError.deliveryUnknown
                default: break // accepted 只表示原扩展已接收，继续等真正执行结果。
                }
            }
            do { try await Task.sleep(for: .milliseconds(80)) } catch { throw AgentAdapterError.deliveryUnknown }
        } while ContinuousClock.now < deadline
        throw AgentAdapterError.deliveryUnknown
    }

    func read<Value: Decodable>(_ url: URL) -> Value? {
        guard !isSymbolicLink(url), let attributes = try? FileManager.default.attributesOfItem(atPath: url.path),
              (attributes[.ownerAccountID] as? NSNumber)?.uint32Value == getuid(),
              (attributes[.size] as? NSNumber)?.intValue ?? Int.max <= 262_144,
              let data = try? Data(contentsOf: url) else { return nil }
        return try? decoder.decode(Value.self, from: data)
    }

    func write<Value: Encodable>(_ value: Value, to url: URL) throws {
        guard !isSymbolicLink(url) else { throw AgentAdapterError.invalidResponse }
        let data = try encoder.encode(value)
        guard data.count <= 262_144 else { throw AgentAdapterError.invalidResponse }
        try data.write(to: url, options: [.atomic, .completeFileProtectionUnlessOpen])
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: url.path)
    }

    private func validComponent(_ value: String) -> Bool {
        !value.isEmpty && value.count <= 128 && value.range(of: "^[A-Za-z0-9_-]+$", options: .regularExpression) != nil
    }
    private func isSymbolicLink(_ url: URL) -> Bool {
        (try? FileManager.default.attributesOfItem(atPath: url.path)[.type]) as? FileAttributeType == .typeSymbolicLink
    }
}

/// 通过原应用内扩展控制已存在会话；能力由最近心跳的真实实例声明。
@MainActor final class MailboxAgentAdapter: AgentAdapter {
    let id: String
    let name: String
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    private let mailbox: AgentMailbox
    init(id: String, name: String, mailbox: AgentMailbox) { self.id = id; self.name = name; self.mailbox = mailbox }
    var hasLiveInstances: Bool { !mailbox.registrations(for: id).isEmpty }
    /// 只有受支持的原进程官方扩展、20秒内心跳及同一原生会话同时匹配时才授予写入。
    /// Hook 的 live PID 可延长观察身份寿命，但绝不能延长控制凭据寿命。
    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability> {
        guard session.applicationID == id, let registration = mailbox.registrations(for: id).first(where: {
            $0.instanceID == session.instanceID && $0.sessions.contains(where: {
                $0.applicationID == id && $0.instanceID == session.instanceID && $0.sessionID == session.sessionID
            })
        }) else { return [] }
        var result = Set(registration.capabilities).intersection([.discover, .observeState, .readReply])
        result.insert(.activate) // 本地绑定，不激活宿主界面。
        let transports = ["omp": "omp-extension", "deepseekHarness": "dsh-plugin", "claudeCode": "claude-mod"]
        if transports[id] == registration.controlTransport, transports[id] != nil,
           Date().timeIntervalSince(registration.updatedAt) < 20 {
            result.formUnion(Set(registration.capabilities).intersection([.submit, .stop]))
        }
        return result
    }
    func diagnose() async -> AgentDiagnostic {
        let registrations = mailbox.registrations(for: id)
        // 展示一个真实原会话的能力，不能把不同实例的互补能力拼成“完整接入”。
        let capabilities = registrations.flatMap(\.sessions).map { self.capabilities(for: $0) }.max { $0.count < $1.count } ?? []
        return AgentDiagnostic(id: id, name: name, capabilities: capabilities,
                               detail: registrations.isEmpty ? "原应用桥接未连接，请安装桥接并在原会话加载" :
                                capabilities.contains(.submit) ? "原进程官方桥接已连接；发送等待原会话接收回执" :
                                "Hook 仅提供生命周期和回复，发送与停止需要官方双向接口",
                               installed: !registrations.isEmpty, verifiedAt: Date())
    }
    func discover() async throws -> [AssistantAgentSession] { mailbox.registrations(for: id).flatMap(\.sessions) }
    func activate(_ session: AssistantAgentSession) async throws {
        guard capabilities(for: session).contains(.activate) else { throw AgentAdapterError.sessionChanged }
    }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func submit(in session: AssistantAgentSession) async throws { throw AgentAdapterError.officialChannelRequired }
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws {
        guard capabilities(for: session).contains(.submit) else { throw AgentAdapterError.officialChannelRequired }
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, text.utf8.count <= 64_000 else {
            throw AgentAdapterError.blocked("消息为空或过长")
        }
        try await mailbox.command("sendPrompt", text: text, session: session)
    }
    func stop(in session: AssistantAgentSession) async throws {
        guard capabilities(for: session).contains(.stop) else { throw AgentAdapterError.officialChannelRequired }
        try await mailbox.command("stop", session: session)
    }
    func poll(_ session: AssistantAgentSession?) async {
        for envelope in mailbox.events(for: id) {
            onEvent?(envelope.event)
            guard let reply = envelope.reply,
                  let session = mailbox.registrations(for: id).flatMap(\.sessions).first(where: {
                      $0.instanceID == envelope.event.instanceID && $0.sessionID == envelope.event.sessionID
                  }) ?? notificationSession(envelope.event) else { continue }
            onReply?(AgentReply(session: session, turnID: envelope.event.turnID, messageID: reply.messageID,
                               text: reply.text, isFinal: reply.isFinal))
        }
    }
    /// Stop后宿主可能已退出/心跳已过期，仍可显示本轮私有邮箱提供的真实正文；不据此授予控制能力。
    private func notificationSession(_ event: ConversationEvent) -> AssistantAgentSession? {
        guard event.applicationID == id, !event.instanceID.isEmpty, !event.sessionID.isEmpty else { return nil }
        return .init(applicationID: id, instanceID: event.instanceID, sessionID: event.sessionID, name: name)
    }
}
