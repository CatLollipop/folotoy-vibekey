import Foundation
import Observation

/// 组合根注入同一个凭据存储，避免多个缓存实例相互覆盖；密钥从不写入 UserDefaults。
@MainActor @Observable final class AssistantStore {
    var profile: AssistantProfile
    var minimaxKey: String
    var deepseekKey: String
    var asrKey: String
    var usePassportForAssistant: Bool { didSet { defaults.set(usePassportForAssistant, forKey: "assistant.passport") } }
    var useGlobalShortcut: Bool { didSet { defaults.set(useGlobalShortcut, forKey: "assistant.shortcut") } }
    private(set) var saveError: String?
    @ObservationIgnored private let credentials: CredentialStore
    @ObservationIgnored private let defaults: UserDefaults

    init(credentials: CredentialStore, defaults: UserDefaults = .standard) {
        self.credentials = credentials
        self.defaults = defaults
        usePassportForAssistant = defaults.object(forKey: "assistant.passport") as? Bool ?? true
        useGlobalShortcut = defaults.bool(forKey: "assistant.shortcut")
        var restoredProfile = defaults.data(forKey: "assistant.profile").flatMap {
            try? JSONDecoder().decode(AssistantProfile.self, from: $0)
        } ?? AssistantProfile()
        restoredProfile.asrResourceID = defaults.string(forKey: "cloud.volcengine.model") ?? restoredProfile.asrResourceID
        if let savedURL = defaults.string(forKey:"cloud.volcengine.baseURL"), URL(string:savedURL)?.scheme == "wss" {
            restoredProfile.asrWebSocketURL = savedURL
        }
        if restoredProfile.systemPrompt == "你是友好、可靠的中文AI助理。优先给出简短、清楚、适合语音朗读的回答；除非用户要求，控制在约120个汉字内。" {
            restoredProfile.systemPrompt = AssistantProfile.defaultSystemPrompt
        }
        restoredProfile.autoSpeakReplies = false
        profile = restoredProfile
        minimaxKey = credentials.value(for: "assistant.minimaxKey") ?? ""
        deepseekKey = credentials.value(for: "assistant.deepseekKey") ?? ""
        asrKey = credentials.value(for: "cloud.volcengine.apiKey") ?? ""
    }

    var secrets: AssistantSecrets {
        .init(minimaxKey: minimaxKey.trimmingCharacters(in: .whitespacesAndNewlines),
              deepseekKey: deepseekKey.trimmingCharacters(in: .whitespacesAndNewlines),
              asrKey: asrKey.trimmingCharacters(in: .whitespacesAndNewlines))
    }

    @discardableResult func save() -> Bool {
        do {
            try profile.validate()
            profile.revision = profile.revision == UInt32.max ? 1 : profile.revision + 1
            defaults.set(try JSONEncoder().encode(profile), forKey: "assistant.profile")
            credentials.set(secrets.minimaxKey, for: "assistant.minimaxKey")
            credentials.set(secrets.deepseekKey, for: "assistant.deepseekKey")
            credentials.set(secrets.asrKey, for: "cloud.volcengine.apiKey")
            defaults.set(profile.asrResourceID, forKey: "cloud.volcengine.model")
            defaults.set(profile.asrWebSocketURL, forKey: "cloud.volcengine.baseURL")
            saveError = nil
            return true
        } catch { saveError = error.localizedDescription; return false }
    }
}
