import Foundation

/// 只连接语义接口，云服务、Agent 与宠物互不依赖；AppState 持有其生命周期。
@MainActor final class AssistantCoordinator {
    private let assistant: AssistantController
    private let store: AssistantStore
    private let hub: AgentHub
    private let pet: PetController
    private let link: DeviceLink
    private let sync: AssistantDeviceSync
    private var originalKey: ((DeviceKey, DeviceKeyEvent, Bool) -> Void)?
    private var originalConnection: ((DeviceLink.Connection) -> Void)?
    private var pendingApplicationReply: AgentReply?
    private var hardware = AssistantHardwareRouter()
    private var menuItems: [AssistantAgentSession?] = []
    private var menuIndex = 0
    private var menuVisible = false
    private var menuGeneration = UUID()
    private var menuTimeout: Task<Void, Never>?
    private var selectionTask: Task<Void, Never>?
    private var selectionGeneration = UUID()
    private var hardwareError: String?
    private var devicePhase: DeviceAssistantPresentation.Phase?
    private var replyTransfer:Task<Void,Never>?
    private var replyGeneration:UInt32 = UInt32.random(in:1...UInt32.max)
    private var transcriptGeneration: UInt32 = UInt32.random(in: 1...UInt32.max)

    init(assistant: AssistantController, store: AssistantStore, hub: AgentHub,
         pet: PetController, link: DeviceLink, sync: AssistantDeviceSync) {
        self.assistant = assistant; self.store = store; self.hub = hub
        self.pet = pet; self.link = link; self.sync = sync
    }

    func start() {
        assistant.sendToApplication = { [weak hub] text in
            guard let hub else { throw AgentAdapterError.blocked("agent_unavailable") }
            try await hub.sendPrompt(text)
        }
        assistant.onPhase = { [weak self] phase in
            guard let self else { return }
            self.apply(Self.petState(phase), phase: .init(rawValue: phase.rawValue))
            if [.recording,.stopped,.failed,.idle].contains(phase) { clearDeviceReply() }
            if store.usePassportForAssistant, sync.mode != "standalone" {
                if phase == .recording {
                    transcriptGeneration = transcriptGeneration == UInt32.max ? 1 : transcriptGeneration + 1
                    link.sendAssistantTranscript(.clear, generation: 0)
                    link.sendAssistantTranscript(.begin, generation: transcriptGeneration)
                } else if phase == .stopped || phase == .failed {
                    link.sendAssistantTranscript(.clear, generation: transcriptGeneration)
                }
            }
            if [.recording, .transcribing, .stopped, .failed].contains(phase) { self.pendingApplicationReply = nil }
            if phase == .replying, self.assistant.destination == .application,
               let reply = self.pendingApplicationReply, self.hub.selectedSession?.id == reply.session.id {
                self.pendingApplicationReply = nil
                self.assistant.showApplicationReply(reply.text)
            }
        }
        assistant.onReply = { [weak self] text in self?.displayDeviceReply(text) }
        assistant.onTranscript = { [weak self] text, final in
            guard let self, store.usePassportForAssistant, sync.mode != "standalone" else { return }
            link.sendAssistantTranscript(.update, generation: transcriptGeneration, text: text, final: final)
        }
        hub.onSelectionChange = { [weak self] session in
            self?.pendingApplicationReply = nil; self?.hardwareError = nil; self?.clearDeviceReply()
            if let self, store.usePassportForAssistant, sync.mode != "standalone" { link.sendAssistantTranscript(.clear, generation: 0) }
            self?.assistant.destination = session == nil ? .cloud : .application
            self?.assistant.cancel(); self?.apply(.idle, phase: .idle)
        }
        hub.onEvent = { [weak self] event in
            guard let self, assistant.destination == .application || !assistant.isBusy,
                  !assistant.isRecording, assistant.phase != .transcribing, assistant.phase != .speaking else { return }
            self.apply(Self.petState(event.state))
            switch event.state {
            case .completed: assistant.finishApplicationTurn(.completed)
            case .stopped: assistant.finishApplicationTurn(.stopped)
            case .error: assistant.finishApplicationTurn(.failed)
            default: break
            }
        }
        hub.onReply = { [weak self] reply in
            guard let self, reply.isFinal, hub.selectedSession?.id == reply.session.id,
                  !assistant.isRecording, assistant.phase != .transcribing,
                  assistant.destination == .application || !assistant.isBusy else { return }
            if assistant.destination == .application, assistant.phase == .thinking {
                // 极快回复可能早于发送回执；等原提交收敛后显示，不取消尚在确认的投递。
                pendingApplicationReply = reply; return
            }
            assistant.showApplicationReply(reply.text)
        }
        link.onAssistantMessage = { [weak self] message in
            guard let self else { return }
            sync.receive(message)
            if sync.mode == "standalone", !message.state.isEmpty {
                let state = PetState(rawValue: message.state) ?? Self.devicePetState(message.state)
                pet.setState(state)
            }
        }
        originalKey = link.onKey
        link.onKey = { [weak self] key, event, ack in
            guard let self else { return }
            guard store.usePassportForAssistant else {
                originalKey?(key, event, ack); return
            }
            // 独立模式的按键由固件消费；接管开启时任何事件都不能回落到旧Codex。
            guard sync.mode != "standalone" else { return }
            guard selectionTask == nil else { return }
            if let action = hardware.handle(key, event, ack: ack, menuVisible: menuVisible) { handleHardware(action) }
        }
        originalConnection = link.onConnectionChange
        link.onConnectionChange = { [weak self] connection in
            guard let self else { return }
            originalConnection?(connection)
            hardware.reset(); closeMenu(); cancelSelection(); clearDeviceReply()
            if connection == .disconnected { assistant.cancel() }
            else if connection == .usb || connection == .wifi {
                sync.refresh(); link.sendAssistantTranscript(.clear, generation: 0); apply(pet.state, phase: devicePhase)
            }
        }
        pet.start()
        hub.start()
        observeChanges({ [weak self] in _ = self?.store.usePassportForAssistant }) { [weak self] in
            self?.hardware.reset(); self?.closeMenu(); self?.cancelSelection(); self?.assistant.cancel()
            if let self, !store.usePassportForAssistant, sync.mode != "standalone" {
                link.sendPetState("idle"); link.sendAssistantTranscript(.clear, generation: 0)
            }
        }
        observeChanges({ [weak self] in _ = self?.assistant.destination }) { [weak self] in
            guard let self else { return }
            if assistant.destination == .cloud, hub.selectedSession != nil { hub.clearSelection() }
            apply(pet.state, phase: assistant.isBusy ? .init(rawValue: assistant.phase.rawValue) : (devicePhase == nil ? nil : .idle))
        }
    }

    func stop() { clearDeviceReply(); cancelSelection(); closeMenu(); assistant.cancel(); hub.shutdown(); pet.stop(); sync.cancel() }

    private func clearDeviceReply() {
        replyTransfer?.cancel();replyTransfer=nil
        replyGeneration = replyGeneration == UInt32.max ? 1 : replyGeneration+1
        if store.usePassportForAssistant, sync.mode != "standalone", sync.supportsTextReplies { link.clearAssistantReply() }
    }
    private func displayDeviceReply(_ text:String) {
        clearDeviceReply()
        guard store.usePassportForAssistant,sync.mode != "standalone",link.connection != .disconnected else { return }
        guard sync.supportsTextReplies else { assistant.reportDeviceReplyError(AssistantError.upgradeRequired.localizedDescription); return }
        let token=replyGeneration
        assistant.reportDeviceReplyError(nil)
        replyTransfer=Task { [weak self] in
            guard let self,!Task.isCancelled,token==replyGeneration else { return }
            do {
                try await link.sendAssistantReply(text,generation:token)
            } catch {
                guard !Task.isCancelled,token==replyGeneration else { return }
                link.clearAssistantReply()
                assistant.reportDeviceReplyError(String(localized:"Passport 文字显示失败，请在电脑查看本轮回复。\(error.localizedDescription)",bundle:.l10n))
            }
        }
    }

    /// 旧DeviceBridge只显示这个覆盖状态，菜单优先，绝不显示旧Codex的发送提示。
    func deviceDisplay() -> (DeviceUIState, String)? {
        guard store.usePassportForAssistant, sync.mode != "standalone" else { return nil }
        if menuVisible { link.sendKeyHints(ok: .check, up: .up, down: .down); return (.list, "AI ASSISTANT") }
        if selectionTask != nil { link.sendKeyHints(ok: nil, up: nil, down: nil); return (.proc, "OPENING SESSION") }
        link.sendKeyHints(ok: .mic, up: assistant.destination == .application ? .send : nil, down: .stop)
        if hardwareError != nil { return (.err, "CHECK MAC") }
        if assistant.isBusy { return (assistant.isRecording ? .rec : .proc, assistant.phase.rawValue.uppercased()) }
        return (.idle, assistant.destination == .cloud ? "CLOUD READY" : "SESSION READY")
    }
    private func handleHardware(_ action: AssistantHardwareRouter.Action) {
        hardwareError = nil
        switch action {
        case .recordStart: assistant.beginRecording(using: PassportMicSource(link: link))
        case .recordStop: assistant.endRecording()
        case .submitDraft:
            guard assistant.destination == .application, let session = hub.selectedSession else { return }
            Task {
                guard assistant.destination == .application, hub.selectedSession == session else { return }
                do { try await hub.submit() }
                catch { if hub.selectedSession == session { hardwareError = error.localizedDescription; apply(.alerting, phase: .failed) } }
            }
        case .stopTask:
            let session = hub.selectedSession
            assistant.cancel()
            if assistant.destination == .application, let session {
                Task {
                    guard assistant.destination == .application, hub.selectedSession == session else { return }
                    do { try await hub.stop() }
                    catch { if hub.selectedSession == session { hardwareError = error.localizedDescription; apply(.alerting, phase: .failed) } }
                }
            }
        case .openMenu: openMenu()
        case .previous: moveMenu(-1)
        case .next: moveMenu(1)
        case .confirm: confirmMenu()
        }
    }
    private func openMenu() {
        assistant.cancel(); menuGeneration = UUID(); menuVisible = true
        rebuildMenu(); showMenu()
        let token = menuGeneration
        Task {
            await hub.refresh()
            guard menuVisible, menuGeneration == token else { return }
            // 检测期间仍可导航；更新会话列表时保留用户正指向的项。
            let wasBack = menuIndex == menuItems.count
            let highlighted = menuItems.indices.contains(menuIndex) ? menuItems[menuIndex]?.id : nil
            rebuildMenu()
            menuIndex = wasBack ? menuItems.count : highlighted.flatMap { id in menuItems.firstIndex(where: { $0?.id == id }) } ?? 0
            showMenu()
        }
    }
    private func rebuildMenu() {
        menuItems = [nil] + hub.sessions
        menuIndex = assistant.destination == .application ? menuItems.firstIndex(where: { $0?.id == hub.selectedSession?.id }) ?? 0 : 0
    }
    private func showMenu() {
        guard menuVisible else { return }
        link.sendState(.list, mode: .dict, msg: "AI ASSISTANT")
        link.sendList(title: "AI ASSISTANT", items: menuItems.map { $0?.name ?? "CLOUD CHAT" } + ["BACK"], selected: menuIndex)
        menuTimeout?.cancel()
        let token = menuGeneration
        menuTimeout = Task { try? await Task.sleep(for: .seconds(30)); if !Task.isCancelled, token == menuGeneration { closeMenu() } }
    }
    private func moveMenu(_ step: Int) {
        guard menuVisible else { return }
        menuIndex = (menuIndex + step + menuItems.count + 1) % (menuItems.count + 1)
        showMenu()
    }
    private func confirmMenu() {
        guard menuVisible else { return }
        let index = menuIndex, choices = menuItems
        closeMenu()
        guard choices.indices.contains(index) else { return }
        guard let session = choices[index] else { hub.clearSelection(); assistant.destination = .cloud; return }
        let token = UUID(); selectionGeneration = token
        apply(.loading, phase: .preparing, target: .application)
        selectionTask = Task {
            defer {
                if token == selectionGeneration {
                    selectionTask = nil
                    if hardwareError == nil { apply(.idle, phase: .idle) }
                }
            }
            do { try await hub.select(session); assistant.destination = .application }
            catch { if !Task.isCancelled { hardwareError = error.localizedDescription; apply(.alerting, phase: .failed) } }
        }
    }
    private func cancelSelection() { selectionGeneration = UUID(); selectionTask?.cancel(); selectionTask = nil }
    private func closeMenu() { menuGeneration = UUID(); menuVisible = false; menuTimeout?.cancel(); menuTimeout = nil }

    private func apply(_ state: PetState, phase: DeviceAssistantPresentation.Phase? = nil,
                       target: DeviceAssistantPresentation.Target? = nil) {
        pet.setState(state)
        devicePhase = phase
        if store.usePassportForAssistant, sync.mode != "standalone" {
            link.sendPetState(state.rawValue, presentation: .init(
                target: target ?? (assistant.destination == .cloud ? .cloud : .application), phase: phase,
                error: phase == .failed && hardwareError != nil ? .checkMac : nil))
        }
    }

    private static func petState(_ phase: AssistantPhase) -> PetState {
        switch phase {
        case .idle: .idle
        case .recording: .listening
        case .transcribing: .uploading
        case .thinking: .thinking
        case .replying: .composing
        case .speaking: .humming
        case .completed: .celebrate
        case .stopped: .poweringDown
        case .failed: .alerting
        }
    }
    private static func petState(_ state: ConversationState) -> PetState {
        switch state {
        case .idle, .unknown: .idle
        case .listening: .listening
        case .receiving: .receiving
        case .thinking: .thinking
        case .working: .working
        case .waitingInput: .waiting
        case .replying: .composing
        case .searching: .searching
        case .loading: .loading
        case .completed: .celebrate
        case .error: .alerting
        case .stopped: .poweringDown
        }
    }
    private static func devicePetState(_ state: String) -> PetState {
        switch state {
        case "recording": .listening
        case "transcribing": .uploading
        case "replying": .composing
        case "speaking": .humming
        case "done", "completed": .celebrate
        case "error", "failed": .alerting
        case "stopped": .poweringDown
        default: .idle
        }
    }
}
