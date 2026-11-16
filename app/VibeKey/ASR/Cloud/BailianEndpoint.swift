import Foundation

/// Fun-ASR端点只由显式区域或用户地址决定，不在鉴权失败后自动跨区。
nonisolated enum BailianEndpoint {
    static let mainland = "wss://dashscope.aliyuncs.com/api-ws/v1/inference"
    static let international = "wss://dashscope-intl.aliyuncs.com/api-ws/v1/inference"
    static func defaultURL(region: String) -> String { region == "international" ? international : mainland }
    static func validated(_ text: String) -> URL? {
        guard text.utf8.count <= 191, let url = URL(string: text), url.scheme == "wss", url.host != nil,
              url.user == nil, url.password == nil, url.query == nil, url.fragment == nil else { return nil }
        return url
    }
    /// 旧服务曾保存无意义的通用HTTP默认值；仅迁移为此前明确选择的区域，不改已填写的WSS。
    static func restored(from defaults: UserDefaults) -> String {
        if let data = defaults.data(forKey: "assistant.profile"),
           let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let value = object["asrWebSocketURL"] as? String { return value }
        if let value = defaults.string(forKey: "cloud.bailian.baseURL"), validated(value) != nil { return value }
        return defaultURL(region: defaults.string(forKey: "cloud.bailian.region") ?? "mainland")
    }
}
