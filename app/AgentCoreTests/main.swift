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
        try await run("filtering") { try testFiltering() }
        try await run("kimi-conversation") { try testKimiConversation() }
        try await run("device-protocol") { try testDeviceAssistantProtocol() }
        try await run("assistant-hardware") { try testAssistantHardware() }
        try await run("shared-voice-config") { try testSharedVoiceConfiguration() }
        try await run("kimi-response-classification") { try testKimiResponseClassification() }
        try await run("kimi-api") { try await testKimiAPI() }
        try await run("mailbox-receipts") { try await testMailboxReceipts() }
        print("Agent core tests passed: event scope, Kimi official REST/WS, mailbox receipts, isolated hardware gestures, shared Doubao voice")
    }
    @MainActor static func run(_ name:String,_ operation:() async throws -> Void) async throws {
        do { try await operation() }
        catch { throw NSError(domain:"AgentCoreTests.\(name)",code:1,userInfo:[NSLocalizedDescriptionKey:"\(name): \(String(reflecting:error))"]) }
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
        assistant.asrKey = "test-shared-voice-key"
        try check(assistant.save(), "Assistant voice config did not save")
        let cloud = CloudASRStore(defaults: defaults, credentials: credentials)
        try check(cloud.config(.volcengine).apiKey == assistant.asrKey && cloud.config(.volcengine).baseURL == assistant.profile.asrWebSocketURL, "Doubao did not reuse assistant credential/endpoint")
        try check(ModelCatalog.model("cloud-minimax") == nil && ModelCatalog.model("cloud-volcengine")?.cloudProvider == .volcengine && CloudProvider.volcengine.isStreaming, "Cancelled MiniMax ASR still selectable or Doubao is not streaming")
        var config = cloud.config(.volcengine)
        try check(config.isComplete(for:.volcengine), "Valid Doubao config rejected")
        config.baseURL = "wss://speech.example.invalid?key=never-query"
        try check(!config.isComplete(for:.volcengine), "Credential query accepted in Doubao endpoint")
        config = cloud.config(.volcengine); config.model = "speech-2.8-turbo"
        try check(!config.isComplete(for:.volcengine), "TTS model accepted as ASR")
        config = cloud.config(.volcengine); config.apiKey = "updated-shared-key"; cloud.update(.volcengine,config)
        let reloaded = AssistantStore(credentials:credentials,defaults:defaults)
        try check(reloaded.asrKey == "updated-shared-key", "ASR and assistant used different credentials")
        try check(credentials.value(for:"assistant.asrKey") == nil, "Second ASR credential was stored")
        cloud.remove(.volcengine)
        try check(credentials.value(for:"cloud.volcengine.apiKey") == nil, "ASR removal left shared credential active")
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
        let replyText=String(repeating:"中文🙂\n\"\\\u{0001}",count:40)
        let parts=try DeviceAssistantProtocol.replyChunks(replyText)
        try check(parts.map{$0.text}.joined()==replyText,"Reply chunking changed UTF-8 text")
        var replyOffset=0
        for part in parts {
            try check(part.offset==replyOffset && part.text.utf8.count<=64,"Reply offsets or chunk budget changed")
            let fields=try DeviceAssistantProtocol.replyFields(.update,generation:UInt32.max,offset:part.offset,text:part.text)
            let frame=try DeviceAssistantProtocol.encode(fields,op:"reply_update",requestID:UInt32.max)
            try check(frame.count<=512,"Escaped reply frame exceeds device limit")
            replyOffset += part.text.utf8.count
        }
        try check((try? DeviceAssistantProtocol.replyFields(.begin,generation:0)) == nil,"Reply generation zero accepted")
        try check((try? DeviceAssistantProtocol.replyChunks(String(repeating:"x",count:4097))) == nil,"Oversized device reply accepted")
        let bounded=DeviceAssistantProtocol.deviceReplyText(String(repeating:"中🙂",count:2000))
        try check(bounded.utf8.count<=4096 && bounded.contains("电脑"),"Long desktop reply was silently truncated")
        let longText = String(repeating: "实时字幕🙂", count: 30) + "最后两个字"
        let subtitle = try DeviceAssistantProtocol.encodeTranscript(.update, generation: UInt32.max, text: longText, final: true)
        let subtitleValue = try JSONSerialization.jsonObject(with: subtitle) as! [String: Any]
        let tail = subtitleValue["text"] as! String
        try check(subtitle.count <= 512 && tail.utf8.count <= 192 && longText.hasSuffix(tail) && subtitleValue["final"] as? Int == 1, "UTF-8 transcript tail or generation/final wire invalid")
        let controls = try DeviceAssistantProtocol.encodeTranscript(.update, generation: 1, text: String(repeating: "\u{0001}", count: 192))
        try check(controls.count <= 512, "Transcript JSON escaping bypassed frame limit")
        do { _ = try DeviceAssistantProtocol.encodeTranscript(.begin, generation: 0); throw AgentAdapterError.invalidResponse }
        catch AssistantError.invalidProfile { }
        let capabilityFrame = #"{"t":"assistant","op":"capabilities","ok":1,"rid":9,"schema":1,"profile_schema":2,"asr":"doubao-realtime","transcript":1,"reply_text":1,"tts":0,"single_pet":1,"retired_clean":1}"#
        guard case .assistant(let modern)? = DeviceMessage.parse(capabilityFrame) else { throw AgentAdapterError.invalidResponse }
        try check(modern.profileSchema == 2 && modern.asrProvider == "doubao-realtime" && modern.supportsTranscript && modern.supportsReplyText && modern.supportsSinglePetAsset && modern.retiredClean == true && DeviceAssistantProtocol.supportsTextAssistant(modern), "New streaming firmware capability lost")
        let presentation = DeviceAssistantPresentation(target: .application, phase: .failed, error: .checkMac)
        let packet = try DeviceAssistantProtocol.encodePetState("alerting", presentation: presentation)
        let value = try JSONSerialization.jsonObject(with: packet) as! [String: Any]
        try check(value["value"] as? String == "alerting" && value["target"] as? String == "application" && value["phase"] as? String == "failed" && value["error"] as? String == "check_mac", "Typed presentation lost or localized display text entered wire")
        let working = try JSONSerialization.jsonObject(with: DeviceAssistantProtocol.encodePetState("working", presentation: .init(target: .application, phase: nil))) as! [String: Any]
        try check(working["phase"] == nil && working["target"] as? String == "application", "Hub work was overwritten by an idle phase")
        let oldPacket = try JSONSerialization.jsonObject(with: DeviceAssistantProtocol.encodePetState("idle", presentation: nil)) as! [String: Any]
        try check(oldPacket["target"] == nil && oldPacket["phase"] == nil, "Legacy animation packet gained unintended caption metadata")
        do { _ = try DeviceAssistantProtocol.encodePetState("用户正文", presentation: nil); throw AgentAdapterError.invalidResponse }
        catch AssistantError.invalidProfile { }
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
    static func testKimiResponseClassification() throws {
        let url=URL(string:"http://127.0.0.1:58627/api/v1/sessions/existing/prompts")!
        let bad:[(Int,String)] = [(500,"{\"code\":0,\"data\":{\"status\":\"running\"}}"),
            (503,"{\"code\":40931,\"data\":{}}"),(200,"not-json"),(200,"{}"),
            (200,"{\"code\":0}"),(200,"{\"code\":false,\"data\":{}}"),(200,"{\"code\":39999,\"data\":{}}")]
        for (status,text) in bad {
            let response=HTTPURLResponse(url:url,statusCode:status,httpVersion:nil,headerFields:nil)!
            do { _=try KimiAgentAdapter.responsePayload(method:"POST",data:Data(text.utf8),response:response);throw AgentAdapterError.invalidResponse }
            catch AgentAdapterError.deliveryUnknown {}
        }
        let valid=HTTPURLResponse(url:url,statusCode:200,httpVersion:nil,headerFields:nil)!
        let payload=try KimiAgentAdapter.responsePayload(method:"POST",data:Data("{\"code\":0,\"data\":{\"status\":\"queued\"}}".utf8),response:valid)
        try check(payload["status"] as? String == "queued", "valid native admission was rejected")
        do { _=try KimiAgentAdapter.responsePayload(method:"GET",data:Data("{\"code\":40931,\"data\":{}}".utf8),response:valid);throw AgentAdapterError.invalidResponse }
        catch AgentAdapterError.blocked {}
    }
    @MainActor static func testKimiAPI() async throws {
        for text in ["https://remote.example", "http://user:secret@127.0.0.1:58627", "http://127.0.0.1/api", "http://127.0.0.1?token=secret"] {
            try check(KimiAgentAdapter.localURL(text) == nil, "non-local credential destination accepted")
        }
        let config = URLSessionConfiguration.ephemeral; config.protocolClasses = [AgentMockURLProtocol.self]
        let client = KimiAgentAdapter(connection:.init(endpoint:"http://127.0.0.1:58627",token:"test-local-token"),network:URLSession(configuration:config))
        let good = await client.diagnose(); try check(good.isComplete, "official endpoint fixture was rejected")
        let sessions = try await client.discover(); try check(sessions.count == 1 && sessions[0].sessionID == "session_test", "session envelope shape changed")
        try check(client.capabilities(for:sessions[0]).contains(.submit), "fresh discovered original session missing write capability")
        let foreign = AssistantAgentSession(applicationID:"kimiCode",instanceID:"other-server-epoch",sessionID:sessions[0].sessionID,name:"Foreign")
        try check(client.capabilities(for:foreign).isEmpty, "Kimi capabilities leaked across connection epochs")
        let unseen = AssistantAgentSession(applicationID:"kimiCode",instanceID:sessions[0].instanceID,sessionID:"not-discovered",name:"Unseen")
        try check(client.capabilities(for:unseen).isEmpty, "Kimi metadata notification granted write capability")
        AgentMockURLProtocol.lock.withLock { AgentMockURLProtocol.failureCode = 40931 }
        let blocked = await client.diagnose(); try check(blocked.capabilities.isEmpty, "occupied server advertised as ready")
        try check(client.capabilities(for:sessions[0]).isEmpty, "failed Kimi validation retained stale writes")
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
        let ready = AgentMailboxFixtureReady()
        let peer = Task { @MainActor in
            do {
                // 原进程先发布注册并用真实读取路径核对；显式就绪后才允许桌面侧发命令。
                let descriptor = AgentMailbox.Registration(protocolVersion:1,adapterID:"test",instanceID:"test-instance",name:"Test",capabilities:[.submit],sessions:[session],updatedAt:Date(),processID:nil,terminalTTY:nil)
                try mailbox.write(descriptor,to:instance.appendingPathComponent("registration.json"))
                guard let registered = mailbox.registrations(for:"test").flatMap(\.sessions).first(where:{$0 == session}) else {
                    throw NSError(domain:"AgentMailboxFixture",code:1,userInfo:[NSLocalizedDescriptionKey:"Peer registration was not visible through the actual mailbox reader"])
                }
                ready.complete(.success(registered))
                let requests = instance.appendingPathComponent("requests")
                var command: AgentMailbox.Command?
                for _ in 0..<100 {
                    try Task.checkCancellation()
                    if let file = try? FileManager.default.contentsOfDirectory(at:requests,includingPropertiesForKeys:nil).first {
                        command = mailbox.read(file); if command != nil { break }
                    }
                    try await Task.sleep(for:.milliseconds(10))
                }
                guard let command else { throw AgentAdapterError.invalidResponse }
                try check(command.sessionID == "existing" && command.text == "dedicated test prompt", "wrong original session targeted")
                let response = instance.appendingPathComponent("responses/"+command.requestID+".json")
                try mailbox.write(AgentMailbox.Receipt(requestID:command.requestID,status:"accepted",error:nil),to:response)
                // 有意跨过产品80ms轮询以验证accepted不等于applied；这不是启动同步等待。
                try await Task.sleep(for:.milliseconds(160))
                try mailbox.write(AgentMailbox.Receipt(requestID:command.requestID,status:"applied",error:nil),to:response)
            } catch {
                ready.complete(.failure(error))
                throw error
            }
        }
        defer { peer.cancel() }
        let registeredSession = try await ready.wait()
        let start = ContinuousClock.now
        do { try await mailbox.command("sendPrompt",text:"dedicated test prompt",session:registeredSession) }
        catch AgentAdapterError.sessionChanged {
            // 仍然失败，不重试/吞错；保留下一次偶发失败所需的脱敏fixture身份诊断。
            let path=instance.appendingPathComponent("registration.json")
            let disk:AgentMailbox.Registration?=mailbox.read(path)
            let listed=mailbox.registrations(for:"test")
            let age=disk.map{Int(Date().timeIntervalSince($0.updatedAt)*1000)} ?? -1
            let details="Mailbox positive command lost a ready fixture: exists=\(FileManager.default.fileExists(atPath:path.path)), decoded=\(disk != nil), visible=\(listed.count), matches=\(listed.contains(where:{$0.sessions.contains(registeredSession)})), age_ms=\(age)"
            throw NSError(domain:"AgentMailboxFixture",code:2,userInfo:[NSLocalizedDescriptionKey:details])
        }
        try check(ContinuousClock.now-start >= .milliseconds(150), "accepted was confused with applied")
        try await peer.value
        let badSession = AssistantAgentSession(applicationID:"test",instanceID:"../escape",sessionID:"existing",name:"bad")
        do { try await mailbox.command("sendPrompt",text:"never write",session:badSession); throw AgentAdapterError.invalidResponse }
        catch AgentAdapterError.sessionChanged { }
    }
}

/// 一次性就绪屏障：成功包含真实读取的会话，启动错误也会唤醒调用方，不靠固定sleep猜就绪。
@MainActor private final class AgentMailboxFixtureReady {
    private var outcome:Result<AssistantAgentSession,Error>?
    private var waiters:[CheckedContinuation<AssistantAgentSession,Error>]=[]
    func wait() async throws -> AssistantAgentSession {
        if let outcome { return try outcome.get() }
        return try await withCheckedThrowingContinuation { waiters.append($0) }
    }
    func complete(_ result:Result<AssistantAgentSession,Error>) {
        guard outcome == nil else { return }
        outcome=result
        for waiter in waiters { waiter.resume(with:result) }
        waiters.removeAll()
    }
}
