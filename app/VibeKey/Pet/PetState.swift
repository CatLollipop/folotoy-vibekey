import Foundation

/// 与固定版本 Aora 状态名一致；业务层只发布语义，不直接操纵动画计时器。
nonisolated enum PetState: String, CaseIterable, Codable, Sendable {
    case idle, sleeping, drowsy, bored, waking
    case poweringDown = "powering-down"
    case listening, thinking, searching, reading, writing, working, loading, progress, radar, orbit
    case dictating, uploading, sending, receiving, messaging, waiting, spawning, composing, dragging
    case happy, excited, laughing, playful, proud, celebrate, bouncing, shy, sad, angry, confused
    case suspicious, surprised, scared, curious, humming, alerting, notifying, refusing
}

/// Mac与设备共享角色/脸型/表情；画风只影响Mac，设备固定pixel/dot。
@MainActor @Observable
final class PetSettings {
    @ObservationIgnored private let defaults: UserDefaults
    var enabled: Bool { didSet { defaults.set(enabled, forKey: "pet.enabled") } }
    var size: Double { didSet { defaults.set(size, forKey: "pet.size") } }
    var alwaysOnTop: Bool { didSet { defaults.set(alwaysOnTop, forKey: "pet.top") } }
    var clickThrough: Bool { didSet { defaults.set(clickThrough, forKey: "pet.clickThrough") } }
    var reducedMotion: Bool { didSet { defaults.set(reducedMotion, forKey: "pet.reducedMotion") } }
    var deviceEnabled: Bool { didSet { defaults.set(deviceEnabled, forKey: "pet.deviceEnabled") } }
    var deviceFPS: Int { didSet { defaults.set(deviceFPS, forKey: "pet.deviceFPS") } }
    var deviceBrightness: Int { didSet { defaults.set(deviceBrightness, forKey: "pet.deviceBrightness") } }
    var castID: String { didSet { defaults.set(castID, forKey: "pet.castID") } }
    var faceID: String { didSet { defaults.set(faceID, forKey: "pet.faceID") } }
    var colorID: String { didSet { defaults.set(colorID, forKey: "pet.colorID") } }
    var desktopLookID: String { didSet { defaults.set(desktopLookID, forKey: "pet.desktopLookID") } }
    var followConversation: Bool { didSet { defaults.set(followConversation, forKey: "pet.followConversation") } }
    var manualState: PetState { didSet { defaults.set(manualState.rawValue, forKey: "pet.manualState") } }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        enabled = defaults.object(forKey: "pet.enabled") as? Bool ?? true
        size = min(400, max(100, defaults.object(forKey: "pet.size") as? Double ?? 220))
        alwaysOnTop = defaults.object(forKey: "pet.top") as? Bool ?? true
        clickThrough = defaults.bool(forKey: "pet.clickThrough")
        reducedMotion = defaults.bool(forKey: "pet.reducedMotion")
        deviceEnabled = defaults.object(forKey: "pet.deviceEnabled") as? Bool ?? true
        deviceFPS = min(20, max(6, defaults.object(forKey: "pet.deviceFPS") as? Int ?? 12))
        deviceBrightness = min(100, max(10, defaults.object(forKey: "pet.deviceBrightness") as? Int ?? 80))
        castID = defaults.string(forKey: "pet.castID") ?? "dot"
        faceID = defaults.string(forKey: "pet.faceID") ?? "capsule"
        colorID = defaults.string(forKey: "pet.colorID") ?? "cream"
        desktopLookID = defaults.string(forKey: "pet.desktopLookID") ?? "vector/solid"
        followConversation = defaults.object(forKey: "pet.followConversation") as? Bool ?? true
        manualState = defaults.string(forKey: "pet.manualState").flatMap(PetState.init(rawValue:)) ?? .idle
    }

    var appearance: PetAppearance {
        let parts = desktopLookID.split(separator: "/", maxSplits: 1).map(String.init)
        return PetAppearance(castID: castID, faceID: faceID, colorID: colorID,
                             styleID: parts.first ?? "vector", variantID: parts.count == 2 ? parts[1] : "solid")
    }

}
