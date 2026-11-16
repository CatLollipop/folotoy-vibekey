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
    static func installOMP() throws {
        let source = try installResources().appendingPathComponent("omp-extension.mjs").absoluteString
        let folder = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".omp/agent/extensions")
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        let literal = String(decoding: try JSONEncoder().encode(source), as: UTF8.self)
        let wrapper = "// VibeKey bridge: 在原 OMP 会话 /reload 后加载。\nexport { default } from \(literal);\n"
        let file = folder.appendingPathComponent("vibekey-assistant.mjs")
        try Data(wrapper.utf8).write(to: file, options: .atomic)
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
    }
    static func installClaudeCode(configURL: URL? = nil) throws {
        try installHookConfig(adapter: "claudeCode", configURL: configURL ?? FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".claude/settings.json"))
    }
    /// WorkBuddy配置位置依实际版本选择；未观察到原应用回调之前，安装不代表接入成功。
    static func installWorkBuddy(configURL: URL) throws { try installHookConfig(adapter: "workBuddy", configURL: configURL) }
    private static func installHookConfig(adapter: String, configURL: URL) throws {
        let script = try installResources().appendingPathComponent("claude-hook.py")
        let file = configURL
        var root: [String: Any] = [:]
        let fm = FileManager.default
        if fm.fileExists(atPath: file.path) {
            let data = try Data(contentsOf: file)
            guard let value = try JSONSerialization.jsonObject(with: data) as? [String: Any] else { throw AgentAdapterError.invalidResponse }
            root = value
            let backup = file.appendingPathExtension("vibekey-assistant.bak")
            if !fm.fileExists(atPath: backup.path) {
                try data.write(to: backup, options: .atomic)
                try fm.setAttributes([.posixPermissions: 0o600], ofItemAtPath: backup.path)
            }
        } else { try fm.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700]) }
        var hooks = root["hooks"] as? [String: Any] ?? [:]
        let command = "VIBEKEY_HOOK_ADAPTER=" + adapter + " /usr/bin/python3 " + shellQuote(script.path)
        for hook in ["SessionStart", "SessionEnd", "UserPromptSubmit", "PreToolUse", "PostToolUse", "Stop", "StopFailure", "PermissionRequest", "Notification"] {
            var groups = hooks[hook] as? [[String: Any]] ?? []
            let exists = groups.contains { group in (group["hooks"] as? [[String: Any]])?.contains { ($0["command"] as? String)?.contains("AgentBridge/installed/claude-hook.py") == true } == true }
            if !exists { groups.append(["hooks": [["type": "command", "command": command, "timeout": 3]]]) }
            hooks[hook] = groups
        }
        root["hooks"] = hooks
        try JSONSerialization.data(withJSONObject: root, options: [.sortedKeys, .prettyPrinted]).write(to: file, options: .atomic)
        try fm.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
    }
    static func revealDSHPlugin() throws {
        let directory = try installResources()
        let plugin = directory.appendingPathComponent("deepseek-plugin", isDirectory: true)
        try FileManager.default.createDirectory(at: plugin, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
        for (source, target) in [("dsh-plugin.mjs", "index.mjs"), ("dsh-bridge.mjs", "dsh-bridge.mjs"), ("mailbox.mjs", "mailbox.mjs")] {
            try Data(contentsOf: directory.appendingPathComponent(source)).write(to: plugin.appendingPathComponent(target), options: .atomic)
        }
        let manifest = #"{"name":"vibekey-assistant-bridge","version":"1.0.0","type":"module","main":"index.mjs","exports":"./index.mjs","peerDependencies":{"@deepseek-ai/dsh-agent":"*","@deepseek-ai/dsh-llm":"*"}}"#
        try Data(manifest.utf8).write(to: plugin.appendingPathComponent("package.json"), options: .atomic)
        NSWorkspace.shared.activateFileViewerSelecting([plugin])
    }
    nonisolated private static func shellQuote(_ text: String) -> String { "'" + text.replacingOccurrences(of: "'", with: "'\\''") + "'" }
}
