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
            self.apply(Self.petState(phase))
            if [.recording, .transcribing, .stopped, .failed].contains(phase) { self.pendingApplicationReply = nil }
            if phase == .replying, self.assistant.destination == .application,
               let reply = self.pendingApplicationReply, self.hub.selectedSession?.id == reply.session.id {
                self.pendingApplicationReply = nil
                self.assistant.speakApplicationReply(reply.text)
            }
        }
        hub.onSelectionChange = { [weak self] session in
            self?.pendingApplicationReply = nil; self?.assistant.cancel(); self?.apply(.idle)
            self?.assistant.destination = session == nil ? .cloud : .application
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
                // 极快回复可能早于发送回执；等原提交收敛后播放，不取消尚在确认的投递。
                pendingApplicationReply = reply; return
            }
            assistant.speakApplicationReply(reply.text)
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
            hardware.reset(); closeMenu(); cancelSelection()
            if connection == .disconnected { assistant.cancel() }
            else if connection == .usb || connection == .wifi { sync.refresh() }
        }
        pet.start()
        hub.start()
        observeChanges({ [weak self] in _ = self?.store.usePassportForAssistant }) { [weak self] in
            self?.hardware.reset(); self?.closeMenu(); self?.cancelSelection(); self?.assistant.cancel()
        }
        observeChanges({ [weak self] in _ = self?.assistant.destination }) { [weak self] in
            guard let self else { return }
            if assistant.destination == .cloud, hub.selectedSession != nil { hub.clearSelection() }
        }
    }

    func stop() { cancelSelection(); closeMenu(); assistant.cancel(); hub.shutdown(); pet.stop(); sync.cancel() }

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
                catch { if hub.selectedSession == session { hardwareError = error.localizedDescription; apply(.alerting) } }
            }
        case .stopTask:
            let session = hub.selectedSession
            assistant.cancel()
            if assistant.destination == .application, let session {
                Task {
                    guard assistant.destination == .application, hub.selectedSession == session else { return }
                    do { try await hub.stop() }
                    catch { if hub.selectedSession == session { hardwareError = error.localizedDescription; apply(.alerting) } }
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
        selectionTask = Task {
            defer { if token == selectionGeneration { selectionTask = nil } }
            do { try await hub.select(session); assistant.destination = .application }
            catch { if !Task.isCancelled { hardwareError = error.localizedDescription; apply(.alerting) } }
        }
    }
    private func cancelSelection() { selectionGeneration = UUID(); selectionTask?.cancel(); selectionTask = nil }
    private func closeMenu() { menuGeneration = UUID(); menuVisible = false; menuTimeout?.cancel(); menuTimeout = nil }

    private func apply(_ state: PetState) {
        pet.setState(state)
        if sync.mode != "standalone" { link.sendPetState(state.rawValue) }
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
