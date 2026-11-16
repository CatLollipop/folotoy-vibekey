import Foundation

/// 编程 Agent(Claude Code / Codex)的通知 hook 一键配置。
/// 两者的 hook 格式相同(`{"hooks": {事件: [{"hooks": [{"type": "command", "command": ...}]}]}}`),
/// 所以共用同一套合并逻辑,只是文件位置和事件名不同:
/// - Claude Code:`~/.claude/settings.json`,Stop → done、Notification → input、UserPromptSubmit → clear;
/// - Codex:`~/.codex/hooks.json`,Stop → done、PermissionRequest → input、UserPromptSubmit → clear。
/// 只追加本 app 的条目,保留已有配置;文件已存在时先备份为 `<文件>.folobutton-dev.bak`。
/// Codex 的 `notify` 设置不受影响(它只能有一个程序,可能已被其他工具使用)。
nonisolated enum AgentHookInstaller {
    enum Agent: String, CaseIterable, Identifiable, Sendable {
        case claudeCode, codex

        var id: String { rawValue }

        var name: String {
            switch self {
            case .claudeCode: "Claude Code"
            case .codex: "Codex"
            }
        }

        /// 配置文件位置。
        var configURL: URL {
            let home = FileManager.default.homeDirectoryForCurrentUser
            switch self {
            case .claudeCode: return home.appendingPathComponent(".claude/settings.json")
            case .codex: return home.appendingPathComponent(".codex/hooks.json")
            }
        }

        /// Agent 事件 → VibeKey 通知事件。
        var events: [(hook: String, event: AgentNotifier.Event)] {
            switch self {
            case .claudeCode: [("Stop", .done), ("Notification", .input), ("UserPromptSubmit", .clear)]
            case .codex: [("Stop", .done), ("PermissionRequest", .input), ("UserPromptSubmit", .clear)]
            }
        }

        /// 安装后还需要用户做的事(Codex 需要在 CLI 里信任新 hook)。
        var followUp: String? {
            switch self {
            case .claudeCode: nil
            case .codex: String(localized: "在 Codex 里输入 /hooks 信任一次后生效", bundle: .l10n)
            }
        }
    }

    private static let marker = "folobutton-dev://agent"
    private static var codexHelperURL: URL {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("FoloButtonDev/AgentBridge/installed/codex-hook.py")
    }

    static func command(_ event: AgentNotifier.Event, agent: Agent) -> String {
        if agent == .codex {
            let quoted = "'" + codexHelperURL.path.replacingOccurrences(of: "'", with: "'\\''") + "'"
            // 正文仅经0600邮箱，不经过URL/进程参数；注释标记供精确升级/卸载拥有的命令。
            return "/usr/bin/python3 \(quoted) --event \(event.rawValue) # \(marker)?source=Codex"
        }
        let source = agent.name.replacingOccurrences(of: " ", with: "%20")
        return "open -g '\(marker)?event=\(event.rawValue)&source=\(source)'"
    }

    static func isInstalled(_ agent: Agent, at url: URL? = nil) -> Bool {
        guard let text = try? String(contentsOf: url ?? agent.configURL, encoding: .utf8) else { return false }
        return agent == .codex ? text.contains("AgentBridge/installed/codex-hook.py") : text.contains(marker)
    }

    /// 合并写入 hook;重复执行不会产生重复条目。`url` 仅供测试指定文件。
    static func install(_ agent: Agent, at url: URL? = nil) throws {
        if agent == .codex, url == nil { try installCodexHelper() }
        let file = url ?? agent.configURL
        let fm = FileManager.default
        var root: [String: Any] = [:]
        if let data = try? Data(contentsOf: file), !data.isEmpty {
            guard let parsed = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                throw NSError(domain: "VibeKey", code: 4, userInfo: [NSLocalizedDescriptionKey:
                    String(localized: "\(file.lastPathComponent) 不是有效的 JSON 对象", bundle: .l10n)])
            }
            root = parsed
            try backupOnce(data, beside: file)
        } else {
            try fm.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true)
        }
        var hooks = root["hooks"] as? [String: Any] ?? [:]
        for (hook, event) in agent.events {
            var groups = hooks[hook] as? [[String: Any]] ?? []
            if agent == .codex {
                // 原位升级旧命令，保留同组用户 Hook 和运行选项。
                for index in groups.indices {
                    guard var entries = groups[index]["hooks"] as? [[String: Any]] else { continue }
                    for entry in entries.indices {
                        if let value = entries[entry]["command"] as? String,
                           value.contains(marker), value.contains("source=Codex") { entries[entry]["command"] = command(event, agent: agent) }
                    }
                    groups[index]["hooks"] = entries
                }
            }
            let exists = groups.contains { group in
                (group["hooks"] as? [[String: Any]])?.contains { entry in
                    guard let value = entry["command"] as? String, value.contains(marker) else { return false }
                    return agent != .codex || value.contains("source=Codex")
                } == true
            }
            if !exists {
                groups.append(["hooks": [["type": "command", "command": command(event, agent: agent)]]])
            }
            hooks[hook] = groups
        }
        root["hooks"] = hooks
        let data = try JSONSerialization.data(withJSONObject: root, options: [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes])
        try data.write(to: file, options: .atomic)
    }

    /// 已配置的旧通知只升级本应用自己的条目；不会启用从未安装的Hook或覆盖其他notify。
    static func upgradeCodexIfInstalled() throws {
        guard let text = try? String(contentsOf: Agent.codex.configURL, encoding: .utf8),
              text.contains(marker), text.contains("source=Codex") else { return }
        try install(.codex)
    }
    private static func installCodexHelper() throws {
        guard let source = Bundle.main.url(forResource: "codex-hook.py", withExtension: nil, subdirectory: "AgentBridges") else {
            throw NSError(domain: "VibeKey", code: 4, userInfo: [NSLocalizedDescriptionKey:
                String(localized: "安装包缺少应用桥接资源，请重新构建应用", bundle: .l10n)])
        }
        let target = codexHelperURL
        try FileManager.default.createDirectory(at: target.deletingLastPathComponent(), withIntermediateDirectories: true,
                                               attributes: [.posixPermissions: 0o700])
        try Data(contentsOf: source).write(to: target, options: .atomic)
        try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: target.path)
    }

    /// 仅卸载本应用为此Agent注册的通知命令，不恢复旧备份覆盖用户新配置。
    static func uninstall(_ agent:Agent,at url:URL?=nil) throws {
        let source=agent.name.replacingOccurrences(of:" ",with:"%20")
        try AgentComponentConfiguration.uninstall(at:url ?? agent.configURL) { command in
            command.contains(marker) && command.contains("source="+source)
        }
    }

    /// 首次安装时保存原配置;重复安装不覆盖这份备份。临时文件和备份均只允许本人读取。
    private static func backupOnce(_ data: Data, beside file: URL) throws {
        let backup = file.appendingPathExtension("folobutton-dev.bak")
        let temp = file.deletingLastPathComponent().appendingPathComponent(".folobutton-\(UUID().uuidString).tmp")
        let fd = open(temp.path, O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC, 0o600)
        guard fd >= 0 else { throw POSIXError(POSIXErrorCode(rawValue: errno) ?? .EIO) }
        let handle = FileHandle(fileDescriptor: fd, closeOnDealloc: true)
        defer {
            try? handle.close()
            try? FileManager.default.removeItem(at: temp)
        }
        try handle.write(contentsOf: data)
        try handle.synchronize()
        if link(temp.path, backup.path) != 0, errno != EEXIST {
            throw POSIXError(POSIXErrorCode(rawValue: errno) ?? .EIO)
        }
    }
}
