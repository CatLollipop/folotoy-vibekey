import Foundation
import Observation

/// 组合根注入同一个凭据存储，避免多个缓存实例相互覆盖；密钥从不写入 UserDefaults。
@MainActor @Observable final class AssistantStore {
    var profile: AssistantProfile
    var minimaxKey: String
    var deepseekKey: String
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
        profile = defaults.data(forKey: "assistant.profile").flatMap {
            try? JSONDecoder().decode(AssistantProfile.self, from: $0)
        } ?? AssistantProfile()
        minimaxKey = credentials.value(for: "assistant.minimaxKey") ?? ""
        deepseekKey = credentials.value(for: "assistant.deepseekKey") ?? ""
    }

    var secrets: AssistantSecrets {
        .init(minimaxKey: minimaxKey.trimmingCharacters(in: .whitespacesAndNewlines),
              deepseekKey: deepseekKey.trimmingCharacters(in: .whitespacesAndNewlines))
    }

    @discardableResult func save() -> Bool {
        do {
            try profile.validate()
            profile.revision = profile.revision == UInt32.max ? 1 : profile.revision + 1
            defaults.set(try JSONEncoder().encode(profile), forKey: "assistant.profile")
            credentials.set(secrets.minimaxKey, for: "assistant.minimaxKey")
            credentials.set(secrets.deepseekKey, for: "assistant.deepseekKey")
            saveError = nil
            return true
        } catch { saveError = error.localizedDescription; return false }
    }
}
