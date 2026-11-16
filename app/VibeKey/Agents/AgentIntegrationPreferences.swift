import Foundation

/// 缺少新偏好时保留原有接入；显式卸载后即使旧宿主仍在发心跳也不再接收其会话事件。
nonisolated enum AgentIntegrationPreferences {
    static func isEnabled(_ id: String, defaults: UserDefaults = .standard) -> Bool {
        (defaults.dictionary(forKey: "assistant.integration.enabled")?[id] as? Bool) ?? true
    }
    static func setEnabled(_ value: Bool, for id: String, defaults: UserDefaults = .standard) {
        var values = defaults.dictionary(forKey: "assistant.integration.enabled") ?? [:]
        values[id] = value
        defaults.set(values, forKey: "assistant.integration.enabled")
    }
}
