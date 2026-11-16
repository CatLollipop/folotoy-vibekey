import Foundation

/// 仅提供安装器使用的事件枚举；测试不实例化通知器、不发送系统或设备通知。
nonisolated enum AgentNotifier {
    enum Event: String { case done, input, clear }
}
