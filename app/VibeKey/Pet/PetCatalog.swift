import Foundation

/// 目录来自固定官方引擎安装全部主题后的结果；不在Swift硬编码可选角色数量。
nonisolated struct PetCatalog: Codable, Sendable {
    struct Cast: Codable, Identifiable, Sendable {
        let id: String
        let name: String
        let englishName: String
        let shape: String
        let color: String
        let face: String
        let theme: String
        let themeName: String?
        let englishThemeName: String?
    }
    struct Choice: Codable, Identifiable, Sendable { let id: String; let name: String; let englishName: String? }
    struct Palette: Codable, Identifiable, Sendable { let id: String; let name: String; let hex: String }
    let casts: [Cast]
    let faces: [Choice]
    let states: [Choice]
    let colors: [Palette]
    static let empty = PetCatalog(casts: [], faces: [], states: [], colors: [])
}

nonisolated struct PetAppearance: Equatable, Sendable {
    var castID: String
    var faceID: String
    var colorID: String
    static let dot = PetAppearance(castID: "dot", faceID: "capsule", colorID: "cream")
    var javascriptValue: [String: String] { ["castId": castID, "faceId": faceID, "colorId": colorID] }
}

nonisolated enum PetExportError: LocalizedError {
    case unavailable, timeout, invalidData
    var errorDescription: String? {
        switch self {
        case .unavailable: String(localized: "宠物离线资源尚未准备好")
        case .timeout: String(localized: "宠物资源加载超时，请重试")
        case .invalidData: String(localized: "宠物资产导出失败，设备配置未改变")
        }
    }
}
