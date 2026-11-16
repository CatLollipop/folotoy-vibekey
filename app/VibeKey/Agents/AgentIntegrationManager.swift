import AppKit
import Observation

/// 接入组件与Agent应用分开检测：安装Hook不等于宿主已加载，也不代表所有能力通过。
nonisolated enum AgentIntegrationKind: String, CaseIterable, Identifiable, Sendable {
    case claudeCode, claudeDesktop, chatGPT, omp, deepseekHarness, kimiCode, workBuddy
    var id: String { rawValue }
    var name: String {
        switch self {
        case .claudeCode: "Claude Code"
        case .claudeDesktop: "Claude Desktop"
        case .chatGPT: "ChatGPT.App / Codex"
        case .omp: "OMP / Oh My Pi"
        case .deepseekHarness: "DeepSeek Harness"
        case .kimiCode: "Kimi Code Desktop"
        case .workBuddy: "WorkBuddy"
        }
    }
    var bundleIDs: [String] {
        switch self {
        case .claudeDesktop: ["com.anthropic.claudefordesktop", "com.anthropic.claude"]
        case .chatGPT: ["com.openai.codex", "com.openai.chat"]
        case .deepseekHarness: ["com.deepseek.dsh", "ai.deepseek.dsh.desktop.next"]
        case .workBuddy: ["com.tencent.workbuddy.mac"]
        default: []
        }
    }
    var executableNames: [String] {
        switch self {
        case .claudeCode: ["claude"]
        case .omp: ["omp"]
        case .deepseekHarness: ["dsh"]
        case .kimiCode: ["kimi"]
        default: []
        }
    }
    var isBuiltIn: Bool { self == .claudeDesktop || self == .chatGPT }
}

nonisolated struct AgentIntegrationStatus: Sendable {
    enum Presence: Sendable { case notDetected, detected, running }
    var presence: Presence = .notDetected
    var componentInstalled = false
}

/// UI只触发安装意图；文件变更限定为本应用组件，检测不启动或重启用户的Agent进程。
@MainActor @Observable final class AgentIntegrationManager {
    private(set) var statuses: [AgentIntegrationKind: AgentIntegrationStatus] = [:]
    private(set) var operation: AgentIntegrationKind?
    private(set) var message: String?
    private(set) var lastDetectedAt: Date?
    private let defaults: UserDefaults
    init(defaults: UserDefaults = .standard) { self.defaults = defaults }

    func status(_ kind: AgentIntegrationKind) -> AgentIntegrationStatus { statuses[kind] ?? .init() }

    func detect(diagnostics: [AgentDiagnostic]) {
        for kind in AgentIntegrationKind.allCases {
            let running = kind.bundleIDs.contains { !NSRunningApplication.runningApplications(withBundleIdentifier: $0).isEmpty }
            let application = kind.bundleIDs.contains { NSWorkspace.shared.urlForApplication(withBundleIdentifier: $0) != nil }
            let executable = kind.executableNames.contains { executableExists($0) }
            let bridge = diagnostics.first { $0.id == kind.id }.map { !$0.capabilities.isEmpty } ?? false
            statuses[kind] = .init(presence: running || bridge ? .running : application || executable ? .detected : .notDetected,
                                   componentInstalled: componentInstalled(kind))
        }
        lastDetectedAt = Date()
    }

    func install(_ kind: AgentIntegrationKind, hub: AgentHub, workBuddyConfig: URL? = nil) async {
        guard operation == nil else { return }
        operation = kind; message = nil
        defer { operation = nil }
        do {
            switch kind {
            case .claudeCode: try AgentBridgeInstaller.installClaudeCode()
            case .omp: try AgentBridgeInstaller.installOMP()
            case .deepseekHarness: try AgentBridgeInstaller.installDSHPlugin()
            case .workBuddy:
                guard let file = workBuddyConfig ?? workBuddyConfigURL else { return }
                try AgentBridgeInstaller.installWorkBuddy(configURL: file)
                defaults.set(file.path, forKey: "assistant.integration.workBuddy.configPath")
            case .kimiCode: defaults.set(true, forKey: "assistant.integration.kimi.registered")
            case .claudeDesktop, .chatGPT: break // 仅启用通知与诊断；无官方双向通道时不授予发送。
            }
            hub.setIntegrationEnabled(true, id: kind.id)
            message = String(localized: "接入组件已安装；实际连接状态以重新检测结果为准。", bundle: .l10n)
            await hub.refresh()
        } catch { message = error.localizedDescription }
        detect(diagnostics: hub.diagnostics)
    }

    func uninstall(_ kind: AgentIntegrationKind, hub: AgentHub) async {
        guard operation == nil else { return }
        operation = kind; message = nil
        defer { operation = nil }
        do {
            switch kind {
            case .claudeCode: try AgentBridgeInstaller.uninstallHook(adapter: kind.id, configURL: AgentBridgeInstaller.claudeCodeConfigURL)
            case .omp: try AgentBridgeInstaller.uninstallOMP()
            case .deepseekHarness: try AgentBridgeInstaller.uninstallDSH()
            case .workBuddy:
                if let file = workBuddyConfigURL { try AgentBridgeInstaller.uninstallHook(adapter: kind.id, configURL: file) }
                defaults.removeObject(forKey: "assistant.integration.workBuddy.configPath")
            case .kimiCode:
                hub.clearKimiConfiguration()
                defaults.removeObject(forKey: "assistant.integration.kimi.registered")
            case .claudeDesktop, .chatGPT: break
            }
            hub.setIntegrationEnabled(false, id: kind.id)
            message = String(localized: "接入组件已卸载，Agent 应用和会话数据已保留。原应用内已加载的扩展需重新加载后移除。", bundle: .l10n)
            await hub.refresh()
        } catch { message = error.localizedDescription }
        detect(diagnostics: hub.diagnostics)
    }

    var workBuddyConfigURL: URL? {
        defaults.string(forKey: "assistant.integration.workBuddy.configPath").map { URL(fileURLWithPath: $0) }
    }
    func didConfigureKimi(hub: AgentHub) {
        defaults.set(true, forKey: "assistant.integration.kimi.registered")
        hub.setIntegrationEnabled(true, id: AgentIntegrationKind.kimiCode.id)
    }
    private func componentInstalled(_ kind: AgentIntegrationKind) -> Bool {
        guard AgentIntegrationPreferences.isEnabled(kind.id, defaults: defaults) else { return false }
        switch kind {
        case .claudeCode: return AgentBridgeInstaller.isHookInstalled(adapter: kind.id, configURL: AgentBridgeInstaller.claudeCodeConfigURL)
        case .omp: return AgentBridgeInstaller.isOMPInstalled()
        case .deepseekHarness: return AgentBridgeInstaller.isDSHInstalled()
        case .workBuddy: return workBuddyConfigURL.map { AgentBridgeInstaller.isHookInstalled(adapter: kind.id, configURL: $0) } ?? false
        case .kimiCode: return defaults.bool(forKey: "assistant.integration.kimi.registered") || !(CredentialStore.shared.value(for: "agent.kimi.token") ?? "").isEmpty
        case .claudeDesktop, .chatGPT: return true
        }
    }
    private func executableExists(_ name: String) -> Bool {
        let home = FileManager.default.homeDirectoryForCurrentUser
        let search = (ProcessInfo.processInfo.environment["PATH"] ?? "").split(separator: ":").map(String.init) +
            [home.appendingPathComponent(".local/bin").path, home.appendingPathComponent("bin").path, "/opt/homebrew/bin", "/usr/local/bin"]
        return search.contains { FileManager.default.isExecutableFile(atPath: URL(fileURLWithPath: $0).appendingPathComponent(name).path) }
    }
}
