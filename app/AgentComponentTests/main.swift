import Foundation

/// 使用隔离临时目录验证真实合并/卸载逻辑，不读取用户的Hook或会话配置。
@main struct AgentComponentTests {
    static func main() throws {
        let fm = FileManager.default
        let root = fm.temporaryDirectory.appendingPathComponent("agent-components-" + UUID().uuidString)
        try fm.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? fm.removeItem(at: root) }
        let file = root.appendingPathComponent("settings.json")
        let owned = "VIBEKEY_HOOK_ADAPTER=test /usr/bin/python3 '/owned/claude-hook.py'"
        let owns: (String) -> Bool = { $0 == owned }
        func read() throws -> [String: Any] { try JSONSerialization.jsonObject(with: Data(contentsOf: file)) as! [String: Any] }
        func write(_ value: [String: Any]) throws { try JSONSerialization.data(withJSONObject: value).write(to: file) }
        let original: [String: Any] = ["theme": "dark", "hooks": ["Stop": [["matcher": "user", "hooks": [["type": "command", "command": "user-command"]]]]]]
        try write(original)
        try AgentComponentConfiguration.install(at: file, events: ["Stop", "SessionStart"], command: owned, owns: owns)
        try AgentComponentConfiguration.install(at: file, events: ["Stop", "SessionStart"], command: owned, owns: owns)
        var object = try read()
        var hooks = object["hooks"] as! [String: Any]
        expect((hooks["Stop"] as! [[String: Any]]).count == 2, "reinstall must not duplicate hooks")
        expect(AgentComponentConfiguration.containsOwnedHook(at: file, owns: owns), "installed hook must be detected")
        expect(fm.fileExists(atPath: file.appendingPathExtension("vibekey-assistant.bak").path), "installation backup")
        // 安装后用户新增配置，并把自己的命令加入同一组；卸载不得还原整份旧备份。
        object["laterSetting"] = ["keep": true]
        var groups = hooks["Stop"] as! [[String: Any]]
        groups[1]["matcher"] = "shared"
        groups[1]["hooks"] = [["type": "command", "command": owned], ["type": "command", "command": "later-user-command"]]
        hooks["Stop"] = groups
        hooks["CustomEvent"] = "unrecognized-user-value"
        object["hooks"] = hooks
        try write(object)
        let beforeUninstall = try Data(contentsOf: file)
        try AgentComponentConfiguration.uninstall(at: file, owns: owns)
        object = try read(); hooks = object["hooks"] as! [String: Any]
        expect(object["theme"] as? String == "dark" && object["laterSetting"] != nil, "preserve user settings added after install")
        expect(hooks["SessionStart"] == nil, "remove empty owned event")
        expect(hooks["CustomEvent"] as? String == "unrecognized-user-value", "preserve unknown event shape")
        groups = hooks["Stop"] as! [[String: Any]]
        expect(groups.count == 2 && groups[1]["matcher"] as? String == "shared", "preserve shared matcher")
        expect((groups[1]["hooks"] as! [[String: Any]])[0]["command"] as? String == "later-user-command", "preserve commands in shared hook group")
        expect(!AgentComponentConfiguration.containsOwnedHook(at: file, owns: owns), "uninstalled hook must disappear")
        expect(try Data(contentsOf: file.appendingPathExtension("vibekey-assistant-uninstall.bak")) == beforeUninstall, "backup current configuration before uninstall")
        let uninstalled = try Data(contentsOf: file)
        try AgentComponentConfiguration.uninstall(at: file, owns: owns)
        expect(try Data(contentsOf: file) == uninstalled, "uninstall is idempotent")
        try write(["hooks": ["Stop": "invalid-array"], "preserve": true])
        let invalid = try Data(contentsOf: file)
        do {
            try AgentComponentConfiguration.install(at: file, events: ["Stop"], command: owned, owns: owns)
            fatalError("malformed config must fail")
        } catch AgentComponentConfiguration.Failure.invalidConfiguration { }
        expect(try Data(contentsOf: file) == invalid, "invalid config must stay byte-identical")
        let newFile = root.appendingPathComponent("new/settings.json")
        try AgentComponentConfiguration.install(at: newFile, events: ["Stop"], command: owned, owns: owns)
        let permissions = try fm.attributesOfItem(atPath: newFile.path)[.posixPermissions] as! NSNumber
        expect(permissions.intValue == 0o600, "configuration permissions")
        try AgentComponentConfiguration.uninstall(at: newFile, owns: owns)
        // 用实际Codex通知安装器验证卸载边界，不执行任何通知命令。
        let codexFile = root.appendingPathComponent("codex-hooks.json")
        let codexSource = AgentHookInstaller.command(.done, agent: .codex)
        let claudeSource = AgentHookInstaller.command(.done, agent: .claudeCode)
        let mixed: [String: Any] = ["notify": ["user-notifier"], "hooks": ["Stop": [["matcher": "keep", "hooks": [
            ["type": "command", "command": codexSource], ["type": "command", "command": claudeSource],
            ["type": "command", "command": "unrelated-notification"]]]]]]
        try JSONSerialization.data(withJSONObject: mixed).write(to: codexFile)
        try AgentHookInstaller.uninstall(.codex, at: codexFile)
        let remainingConfig = try JSONSerialization.jsonObject(with: Data(contentsOf: codexFile)) as! [String: Any]
        let remainingHooks = remainingConfig["hooks"] as! [String: Any]
        let remainingGroups = remainingHooks["Stop"] as! [[String: Any]]
        let commands = (remainingGroups[0]["hooks"] as! [[String: Any]]).compactMap { $0["command"] as? String }
        expect(commands == [claudeSource, "unrelated-notification"], "Codex removal preserves Claude and user hooks")
        expect(remainingConfig["notify"] as? [String] == ["user-notifier"], "Codex removal preserves notify setting")
        let suite = "agent-components-test-" + UUID().uuidString
        let defaults = UserDefaults(suiteName: suite)!
        defer { defaults.removePersistentDomain(forName: suite) }
        expect(AgentIntegrationPreferences.isEnabled("omp", defaults: defaults), "existing integrations remain enabled")
        AgentIntegrationPreferences.setEnabled(false, for: "omp", defaults: defaults)
        expect(!AgentIntegrationPreferences.isEnabled("omp", defaults: defaults), "explicit uninstall persists")
        expect(AgentIntegrationPreferences.isEnabled("claudeCode", defaults: defaults), "other integration stays enabled")
        AgentIntegrationPreferences.setEnabled(true, for: "omp", defaults: defaults)
        expect(AgentIntegrationPreferences.isEnabled("omp", defaults: defaults), "reinstallation enables integration")
        print("PASS: component merge, ownership, backups, idempotency, invalid configuration, permissions and isolated preferences")
    }
    static func expect(_ result: Bool, _ message: String) {
        if !result { fatalError(message) }
    }
}
