import Foundation

nonisolated final class AgentMockURLProtocol: URLProtocol, @unchecked Sendable {
    static let lock = NSLock()
    nonisolated(unsafe) static var failureCode = 0
    nonisolated(unsafe) static var paths: [String] = []
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        let path = request.url!.path
        Self.lock.withLock { Self.paths.append(path) }
        guard request.value(forHTTPHeaderField: "Authorization") == "Bearer test-local-token" else { client?.urlProtocol(self, didFailWithError: URLError(.userAuthenticationRequired)); return }
        let code = Self.lock.withLock { Self.failureCode }
        let object: [String: Any]
        if path == "/openapi.json" {
            object = ["paths": ["/api/v1/sessions": [:], "/api/v1/sessions/{session_id}/prompts": [:], "/api/v1/sessions/{session_id}:abort": [:]]]
        } else if path == "/api/v1/sessions" {
            object = ["code": code, "msg": "fixture", "data": ["items": [["id": "session_test", "title": "专用测试会话", "last_prompt": "NEVER PERSIST THIS"]], "has_more": false], "request_id": "test-request"]
        } else { client?.urlProtocol(self, didFailWithError: URLError(.unsupportedURL)); return }
        let bytes = try! JSONSerialization.data(withJSONObject: object)
        let response = HTTPURLResponse(url: request.url!, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: ["Content-Type":"application/json"])!
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: bytes); client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}

@main struct AgentCoreTests {
    @MainActor static func main() async throws {
        try testFiltering()
        try testKimiConversation()
        try testDeviceAssistantProtocol()
        try testAssistantHardware()
        try testSharedVoiceConfiguration()
        try await testKimiAPI()
        try await testMailboxReceipts()
        print("Agent core tests passed: event scope, Kimi official REST/WS, mailbox receipts, isolated hardware gestures, shared MiniMax voice")
    }
    static func check(_ value: @autoclosure () -> Bool, _ message: String) throws {
        if !value() { throw NSError(domain: "AgentCoreTests", code: 1, userInfo: [NSLocalizedDescriptionKey: message]) }
    }
    static func testAssistantHardware() throws {
        var router = AssistantHardwareRouter()
        try check(router.handle(.down,.down,ack:false,menuVisible:false) == nil, "Down press stopped before long/short decision")
        try check(router.handle(.down,.long,ack:false,menuVisible:false) == .openMenu, "Long Down did not open new assistant menu")
        try check(router.handle(.down,.up,ack:false,menuVisible:true) == nil, "Menu opening release moved selection or stopped task")
        try check(router.handle(.ok,.down,ack:false,menuVisible:true) == nil, "Menu OK began recording")
        try check(router.handle(.ok,.up,ack:false,menuVisible:true) == .confirm, "Menu OK did not confirm on release")
        try check(router.handle(.up,.down,ack:false,menuVisible:true) == nil, "Menu navigation fired early")
        try check(router.handle(.up,.up,ack:false,menuVisible:true) == .previous, "Menu Up submitted draft")
        _ = router.handle(.down,.down,ack:false,menuVisible:true)
        try check(router.handle(.down,.up,ack:false,menuVisible:true) == .next, "Menu Down stopped task")
        _ = router.handle(.up,.down,ack:false,menuVisible:false)
        try check(router.handle(.up,.up,ack:false,menuVisible:false) == .submitDraft, "Short Up did not submit selected Hub draft")
        _ = router.handle(.down,.down,ack:false,menuVisible:false)
        try check(router.handle(.down,.up,ack:false,menuVisible:false) == .stopTask, "Short Down did not stop selected task")
        try check(router.handle(.ok,.down,ack:false,menuVisible:false) == .recordStart, "OK did not start recording")
        _ = router.handle(.ok,.long,ack:false,menuVisible:false)
        try check(router.handle(.ok,.up,ack:false,menuVisible:false) == .recordStop, "Held OK release did not end recording")
        _ = router.handle(.ok,.down,ack:true,menuVisible:false)
        try check(router.handle(.ok,.up,ack:false,menuVisible:false) == nil, "Notification dismissal became recording or Codex follow-up")
        _ = router.handle(.up,.down,ack:false,menuVisible:false); router.reset()
        try check(router.handle(.up,.up,ack:false,menuVisible:false) == nil, "Reconnect delivered a stale submit")
    }
    @MainActor static func testSharedVoiceConfiguration() throws {
        let folder = FileManager.default.temporaryDirectory.appendingPathComponent("voice-settings-" + UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: folder) }
        let suite = "voice-settings-" + UUID().uuidString, defaults = UserDefaults(suiteName: suite)!
        defer { defaults.removePersistentDomain(forName: suite) }
        let credentials = CredentialStore(url: folder.appendingPathComponent("credentials.json"))
        let assistant = AssistantStore(credentials: credentials, defaults: defaults)
        assistant.profile.minimaxBaseURL = "https://speech.example.invalid"
        assistant.minimaxKey = "test-shared-voice-key"
        try check(assistant.save(), "Assistant voice config did not save")
        let cloud = CloudASRStore(defaults: defaults, credentials: credentials)
        try check(cloud.config(.minimax).apiKey == assistant.minimaxKey && cloud.config(.minimax).baseURL == assistant.profile.minimaxBaseURL, "MiniMax initial config did not reuse assistant credential/base")
        try check(ModelCatalog.model("cloud-minimax")?.cloudProvider == .minimax && !CloudProvider.minimax.isStreaming, "Native MiniMax ASR missing from selectable model catalog")
        var config = cloud.config(.minimax)
        try check(config.isComplete(for:.minimax), "Valid MiniMax native config rejected")
        config.baseURL = "https://speech.example.invalid?key=never-query"
        try check(!config.isComplete(for:.minimax), "Credential query accepted in MiniMax base")
        config = cloud.config(.minimax); config.model = "speech-2.8-turbo"
        try check(!config.isComplete(for:.minimax), "TTS model accepted as selectable ASR")
        config = cloud.config(.minimax); config.apiKey = "updated-shared-key"; cloud.update(.minimax,config)
        let reloaded = AssistantStore(credentials:credentials,defaults:defaults)
        try check(reloaded.minimaxKey == "updated-shared-key", "Voice and assistant used different credentials")
        try check(credentials.value(for:"cloud.minimax.apiKey") == nil, "Second MiniMax credential was stored")
        cloud.remove(.minimax)
        try check(credentials.value(for:"assistant.minimaxKey") == nil, "MiniMax removal left shared credential active")
    }
    static func event(instance: String = "one", session: String = "one", turn: String = "one", id: String = "one", sequence: UInt64 = 1) -> ConversationEvent {
        ConversationEvent(applicationID: "test", instanceID: instance, sessionID: session, turnID: turn, eventID: id,
                          sequence: sequence, state: .working, timestamp: Date())
    }
    static func testFiltering() throws {
        var filter = AgentEventFilter()
        try check(filter.accepts(event()), "first event missing")
        try check(!filter.accepts(event(sequence: 9)), "duplicate ID accepted with newer sequence")
        try check(filter.accepts(event(id: "two", sequence: 2)), "ordered event missing")
        try check(!filter.accepts(event(id: "stale", sequence: 1)), "stale event accepted")
        try check(filter.accepts(event(turn: "next", sequence: 0)), "new turn cannot restart sequence")
        try check(filter.accepts(event(instance: "other")), "one process suppresses another")
        let required = AgentDiagnostic(id:"test",name:"test",capabilities:[.discover,.activate,.submit,.stop,.observeState,.readReply],detail:"test",installed:true,verifiedAt:Date())
        try check(required.isComplete && required.optionalMissing == [.insertDraft], "native prompt adapter incorrectly requires draft")
    }
    static func frame(_ value: [String: Any]) throws -> KimiServerFrame {
        var payload = value; payload["session_id"] = payload["session_id"] ?? "session_test"; payload["agent_id"] = payload["agent_id"] ?? "main"
        return try JSONDecoder().decode(KimiServerFrame.self, from: JSONSerialization.data(withJSONObject: payload))
    }
    static func testKimiConversation() throws {
        var reducer = KimiConversationReducer()
        let history = try frame(["type":"turns", "turns":[["turn_id":"old", "status":"ended", "outcome":"completed"]]])
        try check(reducer.apply(history,sessionID:"session_test") == nil, "history was spoken")
        let oldEnd = try frame(["type":"turn.ended", "turn":["turn_id":"old","outcome":"completed"]])
        try check(reducer.apply(oldEnd,sessionID:"session_test") == nil, "historical completion repeated")
        let begin = try frame(["type":"turn.started", "turn":["turn_id":"live","status":"running"]])
        try check(reducer.apply(begin,sessionID:"session_test")?.state == .thinking, "real turn did not start")
        let reasoning = try frame(["type":"item.ended","turn_id":"live","item":["item_id":"r1","type":"reasoning","outcome":"completed","text":"hidden reasoning"]])
        _ = reducer.apply(reasoning,sessionID:"session_test")
        let child = try frame(["type":"turn.ended","agent_id":"child","turn":["turn_id":"live","outcome":"completed"]])
        try check(reducer.apply(child,sessionID:"session_test") == nil, "child completes parent turn")
        let response = try frame(["type":"item.ended","turn_id":"live","item":["item_id":"a1","type":"assistant_message","outcome":"completed","text":"正式回答"]])
        _ = reducer.apply(response,sessionID:"session_test")
        let end = try frame(["type":"turn.ended","turn":["turn_id":"live","outcome":"completed"]])
        let result = reducer.apply(end,sessionID:"session_test")
        try check(result?.reply?.text == "正式回答", "final assistant text not isolated")
        try check(reducer.apply(end,sessionID:"session_test") == nil, "corrected completion repeats speech")
        _ = reducer.apply(begin,sessionID:"session_test"); _ = reducer.apply(response,sessionID:"session_test")
        let interrupted = try frame(["type":"turn.ended","turn":["turn_id":"live","outcome":"interrupted","end_reason":"user_cancelled"]])
        let cancelled = reducer.apply(interrupted,sessionID:"session_test")
        try check(cancelled?.state == .stopped && cancelled?.reply == nil, "cancelled content spoken")
        _ = reducer.apply(begin,sessionID:"session_test"); _ = reducer.apply(response,sessionID:"session_test")
        let undone = try frame(["type":"turns.removed","turn_ids":["live"]]); _ = reducer.apply(undone,sessionID:"session_test")
        try check(reducer.apply(end,sessionID:"session_test") == nil, "undone turn spoken")
        let pending = try frame(["type":"interaction","status":"pending"])
        try check(reducer.apply(pending,sessionID:"session_test")?.state == .waitingInput, "real approval not represented")
    }
    static func testDeviceAssistantProtocol() throws {
        guard case .assistant(let mode)? = DeviceMessage.parse(#"{"t":"assistant","op":"mode","ok":1,"rid":9,"mode":"standalone","restarting":1}"#) else { throw AgentAdapterError.invalidResponse }
        try check(mode.restarting && mode.mode == "standalone", "Mode restart acknowledgement lost")
        guard case .assistant(let legacy)? = DeviceMessage.parse(#"{"t":"assistant","op":"mode","ok":1,"rid":9,"mode":"companion"}"#) else { throw AgentAdapterError.invalidResponse }
        try check(!legacy.restarting, "Old firmware cannot fabricate a restart")
        guard case .assistant(let ack)? = DeviceMessage.parse(#"{"t":"assistant","op":"chunk","ok":1,"rid":42,"rev":7,"off":576}"#) else { throw AgentAdapterError.invalidResponse }
        try check(DeviceAssistantProtocol.matches(ack,requestID:42,op:"chunk",revision:7,offset:576), "valid device acknowledgement rejected")
        var late=ack; late.requestID=41; late.ok=false
        try check(!DeviceAssistantProtocol.matches(late,requestID:42,op:"chunk",revision:7,offset:576), "late failed ack affects newer upload")
        var wrong=ack;wrong.offset=288
        try check(!DeviceAssistantProtocol.matches(wrong,requestID:42,op:"chunk",revision:7,offset:576), "offset mismatch advances upload")
        guard case .assistant(let state)? = DeviceMessage.parse(#"{"t":"assistant","op":"state","state":"thinking"}"#) else { throw AgentAdapterError.invalidResponse }
        try check(DeviceAssistantProtocol.acceptsUnsolicited(state) && !DeviceAssistantProtocol.acceptsUnsolicited(ack), "stale request responses accepted as unsolicited state")
        try check(DeviceMessage.parse(#"{"t":"assistant","op":"status","ok":1,"rid":1.5}"#) == nil, "fractional request ID accepted")
        try check(DeviceMessage.parse(#"{"t":"assistant","op":"commit","rid":1}"#) == nil, "missing ok means success")
        let empty=try DeviceAssistantProtocol.encode([("d",.string(""))],op:"chunk",requestID:UInt32.max)
        let padding=512-empty.count
        let boundary=try DeviceAssistantProtocol.encode([("d",.string(String(repeating:"a",count:padding)))],op:"chunk",requestID:UInt32.max)
        try check(boundary.count == 512, "line boundary excludes newline incorrectly")
        do { _=try DeviceAssistantProtocol.encode([("d",.string(String(repeating:"a",count:padding+1)))],op:"chunk",requestID:UInt32.max);throw AgentAdapterError.invalidResponse }
        catch AssistantError.invalidProfile { }
        let payload=Data(repeating:0xFE,count:288).base64EncodedString()
        let chunk=try DeviceAssistantProtocol.encode([("off",.int(16384)),("d",.string(payload))],op:"chunk",requestID:UInt32.max)
        try check(chunk.count <= 512, "full-size base64 chunk with rid exceeds firmware line buffer")
    }
    @MainActor static func testKimiAPI() async throws {
        for text in ["https://remote.example", "http://user:secret@127.0.0.1:58627", "http://127.0.0.1/api", "http://127.0.0.1?token=secret"] {
            try check(KimiAgentAdapter.localURL(text) == nil, "non-local credential destination accepted")
        }
        let config = URLSessionConfiguration.ephemeral; config.protocolClasses = [AgentMockURLProtocol.self]
        let client = KimiAgentAdapter(connection:.init(endpoint:"http://127.0.0.1:58627",token:"test-local-token"),network:URLSession(configuration:config))
        let good = await client.diagnose(); try check(good.isComplete, "official endpoint fixture was rejected")
        let sessions = try await client.discover(); try check(sessions.count == 1 && sessions[0].sessionID == "session_test", "session envelope shape changed")
        AgentMockURLProtocol.lock.withLock { AgentMockURLProtocol.failureCode = 40931 }
        let blocked = await client.diagnose(); try check(blocked.capabilities.isEmpty, "occupied server advertised as ready")
        let paths = AgentMockURLProtocol.lock.withLock { AgentMockURLProtocol.paths }
        try check(paths.allSatisfy { ["/openapi.json", "/api/v1/sessions"].contains($0) }, "diagnose mutated server or took over a session")
    }
    @MainActor static func testMailboxReceipts() async throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("vibekey-mailbox-"+UUID().uuidString)
        defer { try? FileManager.default.removeItem(at:root) }
        let mailbox = AgentMailbox(root:root); try mailbox.prepare()
        let instance = root.appendingPathComponent("instances/test-instance")
        try FileManager.default.createDirectory(at:instance,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700])
        let session = AssistantAgentSession(applicationID:"test",instanceID:"test-instance",sessionID:"existing",name:"Test only")
        let descriptor = AgentMailbox.Registration(protocolVersion:1,adapterID:"test",instanceID:"test-instance",name:"Test",capabilities:[.submit],sessions:[session],updatedAt:Date(),processID:nil,terminalTTY:nil)
        try mailbox.write(descriptor,to:instance.appendingPathComponent("registration.json"))
        let peer = Task { @MainActor in
            let requests = instance.appendingPathComponent("requests")
            var command: AgentMailbox.Command?
            for _ in 0..<100 {
                if let file = try? FileManager.default.contentsOfDirectory(at:requests,includingPropertiesForKeys:nil).first {
                    command = mailbox.read(file); if command != nil { break }
                }
                try await Task.sleep(for:.milliseconds(10))
            }
            guard let command else { throw AgentAdapterError.invalidResponse }
            try check(command.sessionID == "existing" && command.text == "dedicated test prompt", "wrong original session targeted")
            let response = instance.appendingPathComponent("responses/"+command.requestID+".json")
            try mailbox.write(AgentMailbox.Receipt(requestID:command.requestID,status:"accepted",error:nil),to:response)
            try await Task.sleep(for:.milliseconds(160))
            try mailbox.write(AgentMailbox.Receipt(requestID:command.requestID,status:"applied",error:nil),to:response)
        }
        let start = ContinuousClock.now
        try await mailbox.command("sendPrompt",text:"dedicated test prompt",session:session)
        try check(ContinuousClock.now-start >= .milliseconds(150), "accepted was confused with applied")
        try await peer.value
        let badSession = AssistantAgentSession(applicationID:"test",instanceID:"../escape",sessionID:"existing",name:"bad")
        do { try await mailbox.command("sendPrompt",text:"never write",session:badSession); throw AgentAdapterError.invalidResponse }
        catch AgentAdapterError.sessionChanged { }
    }
}
