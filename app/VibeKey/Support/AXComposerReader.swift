import ApplicationServices
import Foundation

/// 只读取调用方明确绑定的输入框与窗口，不查询应用全局焦点，不输出用户内容。
nonisolated enum AXComposerReader {
    static func text(_ input: AXUIElement, in window: AXUIElement) -> String? {
        CodexComposerSnapshot.text(input: input, in: window, source: SystemSource())
    }

    static func isInWindow(_ input: AXUIElement, window: AXUIElement) -> Bool {
        CodexComposerSnapshot.isInWindow(input, window: window, source: SystemSource())
    }

    private struct SystemSource: CodexComposerSource {
        func processID(_ element: AXUIElement) -> Int32? {
            var pid: pid_t = 0
            return AXUIElementGetPid(element, &pid) == .success ? pid : nil
        }
        func window(_ element: AXUIElement) -> AXUIElement? { typedElement(element, key: kAXWindowAttribute) }
        func parent(_ element: AXUIElement) -> AXUIElement? { typedElement(element, key: kAXParentAttribute) }
        func value(_ element: AXUIElement) -> String? { attribute(element, key: kAXValueAttribute) as? String }
        func placeholder(_ element: AXUIElement) -> String { attribute(element, key: "AXPlaceholderValue") as? String ?? "" }
        func characterCount(_ element: AXUIElement) -> Int? { (attribute(element, key: "AXNumberOfCharacters") as? NSNumber)?.intValue }
        func role(_ element: AXUIElement) -> String { attribute(element, key: kAXRoleAttribute) as? String ?? "" }
        func classes(_ element: AXUIElement) -> [String] { attribute(element, key: "AXDOMClassList") as? [String] ?? [] }
        func children(_ element: AXUIElement) -> [AXUIElement]? {
            var result: CFTypeRef?
            let error = AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &result)
            if error == .attributeUnsupported || error == .noValue { return [] }
            guard error == .success else { return nil }
            guard let array = result as? [AXUIElement] else { return nil }
            return array
        }
        func rangeText(_ element: AXUIElement, count: Int) -> String? {
            var range = CFRange(location: 0, length: count)
            guard let parameter = AXValueCreate(.cfRange, &range) else { return nil }
            var result: CFTypeRef?
            guard AXUIElementCopyParameterizedAttributeValue(element, kAXStringForRangeParameterizedAttribute as CFString,
                                                             parameter, &result) == .success else { return nil }
            return result as? String
        }
        private func attribute(_ element: AXUIElement, key: String) -> CFTypeRef? {
            var result: CFTypeRef?
            guard AXUIElementCopyAttributeValue(element, key as CFString, &result) == .success else { return nil }
            return result
        }
        private func typedElement(_ element: AXUIElement, key: String) -> AXUIElement? {
            guard let value = attribute(element, key: key), CFGetTypeID(value) == AXUIElementGetTypeID() else { return nil }
            return unsafeDowncast(value, to: AXUIElement.self)
        }
    }
}
