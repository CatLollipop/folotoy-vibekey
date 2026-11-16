// swift-tools-version: 6.2
import PackageDescription
import Foundation

let localizedStringsPath = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    .appendingPathComponent("build/DerivedData/Build/Intermediates.noindex/VibeKey.build/Debug/VibeKey.build/Objects-normal/arm64").path

// Command Line Tools 构建入口；正式打包和 app-hosted XCTest 仍保留 XcodeGen 工程。
let package = Package(
    name: "AIAssistant",
    defaultLocalization: "zh-Hans",
    platforms: [.macOS("26.0")],
    products: [.executable(name: "VibeKey", targets: ["VibeKey"])],
    dependencies: [
        .package(url: "https://github.com/argmaxinc/argmax-oss-swift", exact: "1.1.1"),
        .package(url: "https://github.com/k2-fsa/sherpa-onnx", exact: "1.13.8"),
        .package(url: "https://github.com/sindresorhus/KeyboardShortcuts", from: "3.1.0"),
        .package(path: "Packages/AppUpdateKit"),
    ],
    targets: [
        .executableTarget(name: "VibeKey", dependencies: [
            .product(name: "WhisperKit", package: "argmax-oss-swift"),
            .product(name: "sherpa-onnx", package: "sherpa-onnx"),
            .product(name: "KeyboardShortcuts", package: "KeyboardShortcuts"),
            .product(name: "AppUpdateKit", package: "AppUpdateKit"),
            .product(name: "AppUpdateInstaller", package: "AppUpdateKit"),
        ], path: "VibeKey", exclude: ["Info.plist", "VibeKey.entitlements", "Assets.xcassets", "AppIcon.icon",
            "Localizable.xcstrings", "InfoPlist.xcstrings"],
        resources: [.copy("Resources"), .copy("Pet/Resources/AoraPet.bundle")],
        swiftSettings: [.unsafeFlags(["-default-isolation", "MainActor", "-emit-localized-strings",
            "-emit-localized-strings-path", localizedStringsPath]), .enableUpcomingFeature("NonisolatedNonsendingByDefault")]),
    ]
)
