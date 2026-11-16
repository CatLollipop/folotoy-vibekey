import Foundation

nonisolated struct ASROptions: Sendable {
    var purpose: ASRPurpose
    var language: SpeechLanguage
    var vocabulary: [String]
}

@MainActor
protocol ASREngine: AnyObject {
    var isLoaded: Bool { get }
    /// 加载模型(耗时操作,可重复调用)。
    func prepare() async throws
    func makeSession(_ options: ASROptions) async throws -> ASRSession
    func unload()
}
