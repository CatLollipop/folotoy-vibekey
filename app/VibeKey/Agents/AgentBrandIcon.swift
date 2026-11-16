import AppKit
import SwiftUI

/// 接入行的官方图标保留原色；装有宿主时显示其当前App图标，其他情况使用离线品牌资源。
struct AgentBrandIcon: View {
    let kind: AgentIntegrationKind
    static let side: CGFloat = 28
    @State private var image: NSImage?

    init(kind: AgentIntegrationKind) {
        self.kind = kind
        // 首帧直接使用官方资源，避免页面出现后再从通用占位图切换。
        _image = State(initialValue: AgentBrandIcons.image(for: kind))
    }

    var body: some View {
        Group {
            if let image {
                Image(nsImage: image).resizable().renderingMode(.original).interpolation(.high).scaledToFit()
            } else {
                // 仅资源损坏时使用系统占位，不用其他厂商品牌代替当前Agent。
                Image(systemName: "app.dashed").resizable().scaledToFit().foregroundStyle(.secondary)
            }
        }
        .frame(width: Self.side, height: Self.side)
        .accessibilityHidden(true) // 名称由同一行的文字按钮朗读，避免重复。
        .task(id: AgentBrandIcons.applicationURL(for: kind)?.path ?? kind.id) {
            image = AgentBrandIcons.image(for: kind)
        }
    }
}

/// 只读取本机已注册的应用和打包资源，不联网、不启动应用；SwiftUI状态负责保存解码结果。
@MainActor enum AgentBrandIcons {
    static func applicationURL(for kind: AgentIntegrationKind) -> URL? {
        for identifier in kind.bundleIDs {
            if let url = NSRunningApplication.runningApplications(withBundleIdentifier: identifier)
                .compactMap(\.bundleURL).first, FileManager.default.fileExists(atPath: url.path) { return url }
        }
        for identifier in kind.bundleIDs {
            if let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: identifier),
               FileManager.default.fileExists(atPath: url.path) { return url }
        }
        return nil
    }

    static func image(for kind: AgentIntegrationKind, bundle: Bundle = .main, preferInstalled: Bool = true) -> NSImage? {
        if preferInstalled, let application = applicationURL(for: kind) {
            return NSWorkspace.shared.icon(forFile: application.path)
        }
        return resourceURL(for: kind, bundle: bundle).flatMap { NSImage(contentsOf: $0) }
    }

    /// 同时支持Xcode资源平铺、开发app文件夹和SwiftPM的Resources副本。
    static func resourceURL(for kind: AgentIntegrationKind, bundle: Bundle = .main) -> URL? {
        let name = resourceName(for: kind)
        for subdirectory in ["AgentIcons", "Resources/AgentIcons", nil] as [String?] {
            if let url = bundle.url(forResource: name, withExtension: "png", subdirectory: subdirectory) { return url }
        }
        #if SWIFT_PACKAGE
        for subdirectory in ["Resources/AgentIcons", "AgentIcons"] {
            if let url = Bundle.module.url(forResource: name, withExtension: "png", subdirectory: subdirectory) { return url }
        }
        #endif
        return nil
    }

    static func resourceName(for kind: AgentIntegrationKind) -> String {
        switch kind {
        case .claudeCode, .claudeDesktop: "agent-claude"
        case .chatGPT: "agent-codex"
        case .omp: "agent-omp"
        case .deepseekHarness: "agent-deepseek-harness"
        case .kimiCode: "agent-kimi"
        case .workBuddy: "agent-workbuddy"
        }
    }
}
