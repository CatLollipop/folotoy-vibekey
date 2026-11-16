import AppKit

/// 安装独立扩展资源和合并Hook；不重启或恢复用户正在运行的会话。
@MainActor enum AgentBridgeInstaller {
    static var installedDirectory: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("FoloButtonDev/AgentBridge/installed", isDirectory: true)
    }
    static func installResources() throws -> URL {
        let fm = FileManager.default
        let directory = installedDirectory
        try fm.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        for name in ["mailbox.mjs", "omp-extension.mjs", "dsh-plugin.mjs", "dsh-bridge.mjs", "claude-hook.py"] {
            guard let resource = Bundle.main.url(forResource: name, withExtension: nil, subdirectory: "AgentBridges") else {
                throw AgentAdapterError.blocked("安装包缺少应用桥接资源，请重新构建应用")
            }
            let target = directory.appendingPathComponent(name)
            try Data(contentsOf: resource).write(to: target, options: .atomic)
            try fm.setAttributes([.posixPermissions: 0o600], ofItemAtPath: target.path)
        }
        return directory
    }
    static var claudeCodeConfigURL: URL { FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".claude/settings.json") }
    static var ompExtensionURL: URL { FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".omp/agent/extensions/vibekey-assistant.mjs") }
    static var dshPluginDirectory: URL { installedDirectory.appendingPathComponent("deepseek-plugin", isDirectory: true) }
    static func installOMP() throws {
        let source = try installResources().appendingPathComponent("omp-extension.mjs").absoluteString
        let folder = ompExtensionURL.deletingLastPathComponent()
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        let literal = String(decoding: try JSONEncoder().encode(source), as: UTF8.self)
        let wrapper = "// VibeKey bridge: 在原 OMP 会话 /reload 后加载。\nexport { default } from \(literal);\n"
        let file = ompExtensionURL
        if FileManager.default.fileExists(atPath:file.path), !isOMPInstalled() { throw AgentComponentConfiguration.Failure.foreignComponent }
        try Data(wrapper.utf8).write(to: file, options: .atomic)
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
    }
    static func installClaudeCode(configURL: URL? = nil) throws {
        let file = configURL ?? claudeCodeConfigURL
        try installHookConfig(adapter: "claudeCode", configURL: file)
        let legacy = Set(AgentHookInstaller.Agent.claudeCode.events.map { AgentHookInstaller.command($0.event, agent: .claudeCode) })
        // 只迁移本应用旧精确命令；通用scheme、用户自写Hook和Codex通知都不删除。
        try AgentComponentConfiguration.uninstall(at: file) { legacy.contains($0) }
    }
    /// WorkBuddy配置位置依实际版本选择；未观察到原应用回调之前，安装不代表接入成功。
    static func installWorkBuddy(configURL: URL) throws { try installHookConfig(adapter: "workBuddy", configURL: configURL) }
    private static func installHookConfig(adapter: String, configURL: URL) throws {
        let script = try installResources().appendingPathComponent("claude-hook.py")
        let command = "VIBEKEY_HOOK_ADAPTER=" + adapter + " /usr/bin/python3 " + shellQuote(script.path)
        try AgentComponentConfiguration.install(at:configURL,
            events:["SessionStart","SessionEnd","UserPromptSubmit","PreToolUse","PostToolUse","Stop","StopFailure","PermissionRequest","Notification"],
            command:command,owns:{ ownedHook($0,adapter:adapter) })
    }
    static func isHookInstalled(adapter:String,configURL:URL) -> Bool {
        AgentComponentConfiguration.containsOwnedHook(at:configURL) { ownedHook($0,adapter:adapter) }
    }
    static func uninstallHook(adapter:String,configURL:URL) throws {
        try AgentComponentConfiguration.uninstall(at:configURL) { command in
            ownedHook(command,adapter:adapter) || (adapter == "claudeCode" && command.contains("folobutton-dev://agent") && command.contains("source=Claude%20Code"))
        }
    }
    private static func ownedHook(_ command:String,adapter:String) -> Bool {
        command.contains("VIBEKEY_HOOK_ADAPTER="+adapter+" ") && command.contains("AgentBridge/installed/claude-hook.py")
    }
    static func isOMPInstalled() -> Bool {
        guard let text=try? String(contentsOf:ompExtensionURL,encoding:.utf8) else { return false }
        return text.hasPrefix("// VibeKey bridge:") && text.contains("AgentBridge/installed/omp-extension.mjs")
    }
    static func uninstallOMP() throws {
        guard FileManager.default.fileExists(atPath:ompExtensionURL.path) else { return }
        guard isOMPInstalled() else { throw AgentComponentConfiguration.Failure.foreignComponent }
        try FileManager.default.removeItem(at:ompExtensionURL)
    }
    static func isDSHInstalled() -> Bool {
        guard let data=try? Data(contentsOf:dshPluginDirectory.appendingPathComponent("package.json")),
              let object=try? JSONSerialization.jsonObject(with:data) as? [String:Any] else { return false }
        return object["name"] as? String == "vibekey-assistant-bridge"
    }
    static func uninstallDSH() throws {
        guard FileManager.default.fileExists(atPath:dshPluginDirectory.path) else { return }
        guard isDSHInstalled() else { throw AgentComponentConfiguration.Failure.foreignComponent }
        // 只删除此包固定文件，保留用户在目录中新增的文件和所有宿主配置。
        for name in ["index.mjs","dsh-bridge.mjs","mailbox.mjs","package.json"] {
            let file=dshPluginDirectory.appendingPathComponent(name)
            if FileManager.default.fileExists(atPath:file.path) { try FileManager.default.removeItem(at:file) }
        }
        if (try FileManager.default.contentsOfDirectory(atPath:dshPluginDirectory.path)).isEmpty {
            try FileManager.default.removeItem(at:dshPluginDirectory)
        }
    }
    @discardableResult static func installDSHPlugin() throws -> URL {
        let directory = try installResources()
        let plugin = dshPluginDirectory
        if FileManager.default.fileExists(atPath:plugin.appendingPathComponent("package.json").path), !isDSHInstalled() {
            throw AgentComponentConfiguration.Failure.foreignComponent
        }
        try FileManager.default.createDirectory(at: plugin, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        for (source, target) in [("dsh-plugin.mjs", "index.mjs"), ("dsh-bridge.mjs", "dsh-bridge.mjs"), ("mailbox.mjs", "mailbox.mjs")] {
            try Data(contentsOf: directory.appendingPathComponent(source)).write(to: plugin.appendingPathComponent(target), options: .atomic)
        }
        let manifest = #"{"name":"vibekey-assistant-bridge","version":"1.0.0","type":"module","main":"index.mjs","exports":"./index.mjs","peerDependencies":{"@deepseek-ai/dsh-agent":"*","@deepseek-ai/dsh-llm":"*"}}"#
        try Data(manifest.utf8).write(to: plugin.appendingPathComponent("package.json"), options: .atomic)
        return plugin
    }
    static func revealDSHPlugin() throws {
        NSWorkspace.shared.activateFileViewerSelecting([try installDSHPlugin()])
    }
    nonisolated private static func shellQuote(_ text: String) -> String { "'" + text.replacingOccurrences(of: "'", with: "'\\''") + "'" }
}
