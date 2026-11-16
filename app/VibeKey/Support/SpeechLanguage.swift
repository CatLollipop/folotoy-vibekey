import Foundation

/// 识别语言。`auto` 交给引擎自动检测(Apple Speech 不支持自动检测,用系统首选语言)。
nonisolated enum SpeechLanguage: String, CaseIterable, Identifiable, Sendable {
    case auto, zh, en, ja, ko, yue

    var id: String { rawValue }

    var title: String {
        switch self {
        case .auto: String(localized: "自动检测", bundle: .l10n)
        case .zh: String(localized: "中文", bundle: .l10n)
        case .en: "English"
        case .ja: String(localized: "日本語", bundle: .l10n)
        case .ko: "한국어"
        case .yue: String(localized: "粤语", bundle: .l10n)
        }
    }

    /// Apple Speech 使用的区域;`auto` 取系统首选语言。
    var appleLocale: Locale {
        switch self {
        case .zh: Locale(identifier: "zh-CN")
        case .en: Locale(identifier: "en-US")
        case .ja: Locale(identifier: "ja-JP")
        case .ko: Locale(identifier: "ko-KR")
        case .yue: Locale(identifier: "yue-CN")
        // Apple Speech 不能自动检测语言:系统语言里有中文就用中文,否则用第一首选语言。
        case .auto:
            Locale.preferredLanguages.contains(where: { $0.hasPrefix("zh") })
                ? Locale(identifier: "zh-CN")
                : Locale(identifier: Locale.preferredLanguages.first ?? "en-US")
        }
    }

    /// Whisper / SenseVoice 的语言代码,nil 表示自动检测。
    var isoCode: String? { self == .auto ? nil : rawValue }
}
