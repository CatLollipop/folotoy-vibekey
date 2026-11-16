import Foundation

/// Hook 安装和卸载共用同一份合并规则；只移除明确属于本应用的命令，不回滚用户后续修改。
nonisolated enum AgentComponentConfiguration {
    static func containsOwnedHook(at file: URL, owns: (String) -> Bool) -> Bool {
        guard let root = try? read(file), let hooks = root["hooks"] as? [String: Any] else { return false }
        return hooks.values.contains { value in
            (value as? [[String: Any]])?.contains { group in
                (group["hooks"] as? [[String: Any]])?.contains { entry in
                    (entry["command"] as? String).map(owns) ?? false
                } ?? false
            } ?? false
        }
    }

    static func install(at file: URL, events: [String], command: String, owns: (String) -> Bool) throws {
        var root = try read(file)
        guard root["hooks"] == nil || root["hooks"] is [String: Any] else { throw Failure.invalidConfiguration }
        var hooks = root["hooks"] as? [String: Any] ?? [:]
        for event in events {
            guard hooks[event] == nil || hooks[event] is [[String: Any]] else { throw Failure.invalidConfiguration }
            var groups = hooks[event] as? [[String: Any]] ?? []
            let found = groups.contains { group in
                (group["hooks"] as? [[String: Any]])?.contains { ($0["command"] as? String).map(owns) ?? false } ?? false
            }
            if !found { groups.append(["hooks": [["type": "command", "command": command, "timeout": 3]]]) }
            hooks[event] = groups
        }
        root["hooks"] = hooks
        try write(root, to: file, backupExtension: "vibekey-assistant.bak")
    }

    /// 备份卸载时的当前文件，再逐命令删除；保留 matcher、组内用户命令及非 Hook 设置。
    static func uninstall(at file: URL, owns: (String) -> Bool) throws {
        guard FileManager.default.fileExists(atPath: file.path) else { return }
        var root = try read(file)
        guard let current = root["hooks"] as? [String: Any] else {
            if root["hooks"] != nil { throw Failure.invalidConfiguration }
            return
        }
        var hooks = current
        var changed = false
        for (event, value) in current {
            guard let groups = value as? [[String: Any]] else { continue }
            var retained: [[String: Any]] = []
            for var group in groups {
                guard let entries = group["hooks"] as? [[String: Any]] else { retained.append(group); continue }
                let remaining = entries.filter { !(($0["command"] as? String).map(owns) ?? false) }
                if remaining.count == entries.count { retained.append(group); continue }
                changed = true
                if !remaining.isEmpty { group["hooks"] = remaining; retained.append(group) }
            }
            if retained.isEmpty { hooks.removeValue(forKey: event) } else { hooks[event] = retained }
        }
        guard changed else { return }
        if hooks.isEmpty { root.removeValue(forKey: "hooks") } else { root["hooks"] = hooks }
        try write(root, to: file, backupExtension: "vibekey-assistant-uninstall.bak")
    }

    private static func read(_ file: URL) throws -> [String: Any] {
        guard FileManager.default.fileExists(atPath: file.path) else { return [:] }
        let data = try Data(contentsOf: file)
        guard data.count <= 1_048_576, let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw Failure.invalidConfiguration
        }
        return root
    }

    private static func write(_ object: [String: Any], to file: URL, backupExtension: String) throws {
        let fm = FileManager.default
        try fm.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true,
                               attributes: [.posixPermissions: 0o700])
        if fm.fileExists(atPath: file.path) {
            let backup = file.appendingPathExtension(backupExtension)
            if !fm.fileExists(atPath: backup.path) {
                try writePrivate(Data(contentsOf: file), to: backup, replacing: false)
            }
        }
        let data = try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys, .prettyPrinted, .withoutEscapingSlashes])
        try writePrivate(data, to: file, replacing: true)
    }

    /// 临时文件创建时即为0600，防止含宿主令牌的配置在原子替换前短暂公开。
    private static func writePrivate(_ data: Data, to file: URL, replacing: Bool) throws {
        let fm = FileManager.default
        let temporary = file.deletingLastPathComponent().appendingPathComponent(".assistant-hook-" + UUID().uuidString)
        let descriptor = open(temporary.path, O_WRONLY | O_CREAT | O_EXCL | O_CLOEXEC, 0o600)
        guard descriptor >= 0 else { throw POSIXError(POSIXErrorCode(rawValue: errno) ?? .EIO) }
        let handle = FileHandle(fileDescriptor: descriptor, closeOnDealloc: true)
        defer { try? handle.close(); try? fm.removeItem(at: temporary) }
        try handle.write(contentsOf: data); try handle.synchronize(); try handle.close()
        if replacing, fm.fileExists(atPath: file.path) {
            _ = try fm.replaceItemAt(file, withItemAt: temporary, options: .usingNewMetadataOnly)
        } else { try fm.moveItem(at: temporary, to: file) }
    }

    enum Failure: LocalizedError {
        case invalidConfiguration, foreignComponent
        var errorDescription: String? {
            switch self {
            case .invalidConfiguration: String(localized: "配置文件格式不受支持，已保留原文件。", bundle: .l10n)
            case .foreignComponent: String(localized: "同名文件不属于 AI 助理，已保留原文件。", bundle: .l10n)
            }
        }
    }
}
