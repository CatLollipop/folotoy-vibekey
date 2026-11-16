import Foundation
import Observation

/// 同一时间只运行一个配置事务，未收到 commit 回执不会更新“已应用版本”。
@MainActor @Observable final class AssistantDeviceSync {
    private(set) var busy = false
    private(set) var progress = 0.0
    private(set) var appliedRevision: UInt32 = 0
    private(set) var appliedPetRevision: UInt32 = 0
    private(set) var configured = false
    private(set) var mode = "companion"
    private(set) var state = "unknown"
    private(set) var error: String?
    private(set) var supportsAssistant = false
    private(set) var restarting = false
    @ObservationIgnored private let link: DeviceLink
    @ObservationIgnored private var operation: Task<Void, Never>?
    @ObservationIgnored private var generation = UUID()
    init(link: DeviceLink) { self.link = link }

    func receive(_ message: DeviceAssistantMessage) {
        guard message.ok else { return }
        if message.schema == 1 { supportsAssistant = true }
        if !message.mode.isEmpty { mode = message.mode }
        if !message.state.isEmpty { state = message.state }
        if ["status", "capabilities", "clear"].contains(message.op) {
            appliedRevision = message.revision
            appliedPetRevision = message.petRevision
            configured = message.configured
        }
    }

    func refresh() { perform { [self] in
        let capability = try await request([], op: "capabilities")
        guard capability.schema == 1 else { throw AssistantError.upgradeRequired }
        receive(capability)
        receive(try await request([], op: "status"))
    } }

    func sync(store: AssistantStore) {
        guard !busy else { return }
        guard store.save() else { error = store.saveError; return }
        let profile = store.profile; let secrets = store.secrets
        perform { [self] in
            let capability = try await request([], op: "capabilities")
            guard capability.schema == 1 else { throw AssistantError.upgradeRequired }
            supportsAssistant = true
            let data = try profile.deviceData(secrets: secrets)
            try await upload(data: data, kind: "profile", revision: profile.revision, maximum: capability.maximum)
            receive(try await request([], op: "status"))
            guard appliedRevision == profile.revision, configured else { throw AssistantError.deliveryUnknown }
        }
    }

    /// 宠物外观包独立于云凭据包；内置 Aora 资源版本由固件校验。
    func syncPet(_ data: Data, revision: UInt32 = 1) {
        perform { [self] in
            let capability = try await request([], op: "capabilities")
            guard capability.schema == 1 else { throw AssistantError.upgradeRequired }
            guard capability.petFormat == "aora-bundle-v2" else { throw AssistantError.upgradeRequired }
            try await upload(data: data, kind: "pet", revision: revision, maximum: capability.petMaximum)
            receive(try await request([], op: "status"))
            guard appliedPetRevision == revision else { throw AssistantError.deliveryUnknown }
        }
    }

    func setMode(_ value: String) { perform { [self] in
        guard value == "standalone" || value == "companion" else { throw AssistantError.invalidProfile }
        let boot = link.deviceBootID
        let acknowledgment = try await request([("value", .string(value))], op: "mode")
        receive(acknowledgment)
        if acknowledgment.restarting {
            restarting = true
            defer { restarting = false }
            // mode ACK 只证明已保存；等设备新 boot 的握手证据，再读取实际应用状态。
            let deadline = ContinuousClock.now + .seconds(35)
            while link.deviceBootID == boot || link.connection == .disconnected {
                try Task.checkCancellation()
                guard ContinuousClock.now < deadline else { throw AssistantError.deliveryUnknown }
                try await Task.sleep(for: .milliseconds(200))
            }
        }
        receive(try await request([], op: "status"))
        guard mode == value else { throw AssistantError.deliveryUnknown }
    } }
    func clearCredentials() { perform { [self] in
        receive(try await request([], op: "clear"))
        receive(try await request([], op: "status"))
    } }
    func cancel() { generation = UUID(); operation?.cancel(); operation = nil; link.assistantAbort(); busy = false }

    private func upload(data: Data, kind: String, revision: UInt32, maximum: Int) async throws {
        guard data.count <= maximum, maximum > 0 else { throw AssistantError.invalidProfile }
        _ = try await request([], op: "abort")
        _ = try await request([("kind", .string(kind)), ("rev", .int(Int(revision))),
            ("size", .int(data.count)), ("crc", .int(Int(CRC32.checksum(data))))], op: "begin", revision: revision)
        var offset = 0
        while offset < data.count {
            try Task.checkCancellation()
            let end = min(offset + 288, data.count)
            _ = try await request([("off", .int(offset)),
                ("d", .string(data[offset..<end].base64EncodedString()))], op: "chunk", revision: revision, offset: end)
            offset = end
            progress = Double(offset) / Double(data.count)
        }
        _ = try await request([], op: "commit", revision: revision, offset: data.count)
    }

    /// 每次异步回执后检查取消，旧事务不得继续上传或覆盖新事务进度。
    private func request(_ fields: [(String, FlatJSON.Value)], op: String,
                         revision: UInt32? = nil, offset: Int? = nil) async throws -> DeviceAssistantMessage {
        try Task.checkCancellation()
        let reply = try await link.assistantRequest(fields, op: op, revision: revision, offset: offset)
        try Task.checkCancellation()
        return reply
    }

    private func perform(_ body: @escaping @MainActor () async throws -> Void) {
        guard !busy else { return }
        busy = true; progress = 0; error = nil
        let token = UUID(); generation = token
        operation = Task { [weak self] in
            do { try await body() }
            catch { if !Task.isCancelled, self?.generation == token { self?.error = error.localizedDescription } }
            if self?.generation == token { self?.busy = false }
        }
    }
}
