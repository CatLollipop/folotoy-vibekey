import Foundation

/// 所有对象均为夹具；不启动用户应用，不读取私人会话或真实邮箱。
@MainActor final class FixtureAdapter: AgentAdapter {
    let id: String
    let name = "Fixture"
    var onEvent: ((ConversationEvent) -> Void)?
    var onReply: ((AgentReply) -> Void)?
    var listed: [AssistantAgentSession] = []
    var authorized = Set<String>()
    var activations = 0, sends = 0, stops = 0
    var sentSession: AssistantAgentSession?
    var failUnknown = false
    init(_ id: String) { self.id = id }
    func diagnose() async -> AgentDiagnostic { .init(id:id,name:name,capabilities:[.submit,.stop],detail:"Fixture",installed:true,verifiedAt:Date()) }
    func discover() async throws -> [AssistantAgentSession] { listed }
    func capabilities(for session: AssistantAgentSession) -> Set<AgentCapability> {
        authorized.contains(session.id) ? [.discover,.activate,.submit,.stop,.observeState,.readReply] : []
    }
    func activate(_ session: AssistantAgentSession) async throws { activations += 1 }
    func insertDraft(_ text: String, in session: AssistantAgentSession) async throws { fatalError("Remote draft must not be used") }
    func submit(in session: AssistantAgentSession) async throws { fatalError("Split submit must not be used") }
    func sendPrompt(_ text: String, in session: AssistantAgentSession) async throws {
        sends += 1; sentSession = session
        if failUnknown { throw AgentAdapterError.deliveryUnknown }
    }
    func stop(in session: AssistantAgentSession) async throws { stops += 1 }
    func poll(_ session: AssistantAgentSession?) async {}
}

@main struct HubContractTests {
    @MainActor static func main() async throws {
        let root=FileManager.default.temporaryDirectory.appendingPathComponent("agent-hub-fixture-"+UUID().uuidString)
        let suite="agent-hub-fixture-"+UUID().uuidString
        let defaults=UserDefaults(suiteName:suite)!
        defer {try? FileManager.default.removeItem(at:root);defaults.removePersistentDomain(forName:suite)}
        let mailbox=AgentMailbox(root:root);try mailbox.prepare()
        let adapter=FixtureAdapter("omp")
        let first=AssistantAgentSession(applicationID:"omp",instanceID:"native-one",sessionID:"existing",name:"One")
        let second=AssistantAgentSession(applicationID:"omp",instanceID:"native-two",sessionID:"existing",name:"Two")
        adapter.listed=[first,second];adapter.authorized=[first.id]
        let hub=AgentHub(defaults:defaults,mailbox:mailbox,adapters:[adapter]);await hub.refresh()
        try require(hub.sessions.count==2,"Original instances merged")
        try await hub.select(second);try require(adapter.activations==0,"Selecting changed original app")
        try require(hub.capabilities(for:second).isEmpty,"App union authorized another instance")
        do{try await hub.sendPrompt("must not be sent",in:second);throw Failure.failed("Unauthorized send accepted")}catch AgentAdapterError.officialChannelRequired{}
        try require(adapter.sends==0,"Blocked send reached adapter")
        try await hub.sendPrompt("confirmed fixture",in:first)
        try require(adapter.sends==1 && adapter.sentSession==first,"Explicit send followed selection instead of pinned native identity")
        adapter.failUnknown=true
        do{try await hub.sendPrompt("unknown fixture",in:first);throw Failure.failed("Unknown result treated as success")}catch AgentAdapterError.deliveryUnknown{}
        try require(adapter.sends==2,"Unknown delivery was automatically retried")
        try await hub.stop(in:first);try require(adapter.stops==1,"Stop bypassed explicit target")
        let notice=AssistantAgentSession(applicationID:"codexHook",instanceID:"original-server",sessionID:"existing-thread",name:"Codex notification")
        hub.registerNotificationSession(notice)
        try require(hub.selectReadOnly(notice),"Hook-only native notification cannot be selected")
        try require(adapter.activations==0 && hub.capabilities(for:notice).isEmpty,"Notification granted writes or activated UI")
        await hub.refresh();try require(hub.sessions.contains(notice),"Event identity vanished without fresh registration")
        let forged=AssistantAgentSession(applicationID:"codexHook",instanceID:"unseen",sessionID:"thread",name:"Unseen")
        try require(!hub.selectReadOnly(forged),"Unobserved identity could be selected")
        let colonA=AssistantAgentSession(applicationID:"omp",instanceID:"a:b",sessionID:"c",name:"A")
        let colonB=AssistantAgentSession(applicationID:"omp",instanceID:"a",sessionID:"b:c",name:"B")
        try require(colonA.id != colonB.id,"Native identity delimiter collision")
        hub.setIntegrationEnabled(false,id:"chatGPT")
        try require(hub.selectedSession==nil && !hub.sessions.contains(notice),"Disabled source remained selectable")
        try testMailboxAuthorization(mailbox)
        try await testCancelledMailbox(mailbox)
        try testClaudeSourcePreference(mailbox)
        print("AgentHub contracts passed: local selection, notification-only identities, exact capabilities, no retries")
    }
    @MainActor static func testMailboxAuthorization(_ mailbox:AgentMailbox) throws {
        let id="omp",instance="fixture-native"
        let folder=mailbox.root.appendingPathComponent("instances/"+instance)
        try FileManager.default.createDirectory(at:folder,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700])
        let native=AssistantAgentSession(applicationID:id,instanceID:instance,sessionID:"existing",name:"Canonical")
        let renamed=AssistantAgentSession(applicationID:id,instanceID:instance,sessionID:"existing",name:"Notification title")
        var reg=AgentMailbox.Registration(protocolVersion:1,adapterID:id,instanceID:instance,name:"Fixture",capabilities:[.discover,.submit,.stop],sessions:[native],updatedAt:Date(),processID:nil,terminalTTY:nil)
        let file=folder.appendingPathComponent("registration.json")
        let adapter=MailboxAgentAdapter(id:id,name:"Fixture",mailbox:mailbox)
        try mailbox.write(reg,to:file);try require(!adapter.capabilities(for:native).contains(.submit),"Legacy registration gained controls")
        reg.controlTransport="omp-extension";try mailbox.write(reg,to:file)
        try require(adapter.capabilities(for:renamed).contains(.submit),"Display title invalidated native identity")
        let other=AssistantAgentSession(applicationID:id,instanceID:"other",sessionID:"existing",name:"Other")
        try require(adapter.capabilities(for:other).isEmpty,"Transport capability leaked between instances")
        try FileManager.default.removeItem(at:file);try require(adapter.capabilities(for:native).isEmpty,"Disconnected bridge retained controls")
        let claudeInstance="stale-claude"
        let claudeFolder=mailbox.root.appendingPathComponent("instances/"+claudeInstance)
        try FileManager.default.createDirectory(at:claudeFolder,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700])
        let claudeSession=AssistantAgentSession(applicationID:"claudeCode",instanceID:claudeInstance,sessionID:"original",name:"Claude")
        var stale=AgentMailbox.Registration(protocolVersion:1,adapterID:"claudeCode",instanceID:claudeInstance,name:"Fixture",capabilities:[.discover,.submit,.stop],sessions:[claudeSession],updatedAt:Date().addingTimeInterval(-60),processID:ProcessInfo.processInfo.processIdentifier,terminalTTY:nil)
        stale.controlTransport=nil;try mailbox.write(stale,to:claudeFolder.appendingPathComponent("registration.json"))
        let claude=ClaudeCodeAgentAdapter(mailbox:mailbox)
        try require(claude.capabilities(for:claudeSession).contains(.discover),"Live Hook observation identity was lost")
        try require(!claude.capabilities(for:claudeSession).contains(.submit),"Live PID extended expired control lease")

    }
    @MainActor static func testCancelledMailbox(_ mailbox:AgentMailbox) async throws {
        let instance="cancel-fixture",session=AssistantAgentSession(applicationID:"test",instanceID:"cancel-fixture",sessionID:"existing",name:"Fixture")
        let folder=mailbox.root.appendingPathComponent("instances/"+instance)
        try FileManager.default.createDirectory(at:folder,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700])
        let reg=AgentMailbox.Registration(protocolVersion:1,adapterID:"test",instanceID:instance,name:"Fixture",capabilities:[.submit],sessions:[session],updatedAt:Date(),processID:nil,terminalTTY:nil)
        try mailbox.write(reg,to:folder.appendingPathComponent("registration.json"))
        let pending=Task {try await mailbox.command("sendPrompt",text:"isolated cancellation fixture",session:session)}
        let requests=folder.appendingPathComponent("requests")
        var written=false
        for _ in 0..<100 {
            if ((try? FileManager.default.contentsOfDirectory(atPath:requests.path)) ?? []).contains(where:{$0.hasSuffix(".json")}) {written=true;break}
            try await Task.sleep(for:.milliseconds(10))
        }
        try require(written,"Command fixture did not reach transport")
        pending.cancel()
        do{try await pending.value;throw Failure.failed("Cancelled transport reported success")}catch AgentAdapterError.deliveryUnknown{}
    }
    @MainActor static func testClaudeSourcePreference(_ mailbox:AgentMailbox) throws {
        let pid=ProcessInfo.processInfo.processIdentifier
        let modID="claude-mod-source",legacyID="claude-hook-source",sid="native-shared"
        for instance in [modID,legacyID] {
            let folder=mailbox.root.appendingPathComponent("instances/"+instance)
            try FileManager.default.createDirectory(at:folder,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700])
            let session=AssistantAgentSession(applicationID:"claudeCode",instanceID:instance,sessionID:sid,name:"Fixture")
            var reg=AgentMailbox.Registration(protocolVersion:1,adapterID:"claudeCode",instanceID:instance,name:"Fixture",capabilities:[.observeState],sessions:[session],updatedAt:Date(),processID:pid,terminalTTY:nil)
            if instance==modID {reg.controlTransport="claude-mod"}
            try mailbox.write(reg,to:folder.appendingPathComponent("registration.json"))
        }
        func envelope(_ instance:String,_ session:String,_ eventID:String,_ nativePID:Int32) -> AgentMailbox.Envelope {
            .init(event:.init(applicationID:"claudeCode",instanceID:instance,sessionID:session,turnID:eventID,eventID:eventID,sequence:1,state:.completed,timestamp:Date()),reply:.init(messageID:eventID,text:"Dedicated fixture",isFinal:true),nativeProcessID:nativePID)
        }
        let events=mailbox.root.appendingPathComponent("events")
        try mailbox.write(envelope(legacyID,sid,"hook",pid),to:events.appendingPathComponent("01.json"))
        try mailbox.write(envelope(modID,sid,"mod",pid),to:events.appendingPathComponent("02.json"))
        try mailbox.write(envelope(legacyID,"other-session","different-session",pid),to:events.appendingPathComponent("03.json"))
        try mailbox.write(envelope(legacyID,sid,"different-process",pid+1),to:events.appendingPathComponent("04.json"))
        let received=mailbox.events(for:"claudeCode")
        try require(Set(received.map(\.event.eventID))==["mod","different-session","different-process"],"Claude source choice merged distinct native identities or emitted duplicate Hook")
    }
    enum Failure:Error {case failed(String)}
    static func require(_ value:Bool,_ message:String)throws{if !value{throw Failure.failed(message)}}
}
