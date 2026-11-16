import Foundation

/// 正式AX读取与内存夹具共用的只读接口；不提供全局焦点、写入或发送能力。
nonisolated protocol CodexComposerSource {
    associatedtype Element: Hashable
    func processID(_ element: Element) -> Int32?
    func window(_ element: Element) -> Element?
    func parent(_ element: Element) -> Element?
    func value(_ element: Element) -> String?
    func placeholder(_ element: Element) -> String
    func characterCount(_ element: Element) -> Int?
    func rangeText(_ element: Element, count: Int) -> String?
    func role(_ element: Element) -> String
    func classes(_ element: Element) -> [String]
    /// nil表示读取失败；已知叶节点返回空数组。
    func children(_ element: Element) -> [Element]?
}

/// 读取绑定窗口内的完整composer快照。nil表示证据不足，调用方不能覆盖或发送。
nonisolated enum CodexComposerSnapshot {
    static func isInWindow<Source: CodexComposerSource>(_ input: Source.Element, window: Source.Element,
                                                       source: Source) -> Bool {
        guard let pid = source.processID(window), pid > 0 else { return false }
        return belongs(input, to: window, processID: pid, source: source)
    }

    static func text<Source: CodexComposerSource>(input: Source.Element, in window: Source.Element,
                                                source: Source) -> String? {
        guard let pid = source.processID(window), pid > 0,
              belongs(input, to: window, processID: pid, source: source),
              source.role(input) == "AXTextArea", let raw = source.value(input) else { return nil }
        let count = source.characterCount(input)
        let range = count.flatMap { (0...1_000_000).contains($0) ? source.rangeText(input, count: $0) : nil }
        var seen = Set<Source.Element>()
        var budget = 512
        let content = content(input, source: source, processID: pid, depth: 0, insidePlaceholder: false, budget: &budget, seen: &seen)
        guard !content.hasNonText else { return nil }
        return CodexInputText.effective(raw, placeholder: source.placeholder(input), characterCount: count,
                                        rangeText: range, placeholderOnly: content.isPlaceholderOnly, placeholderText: content.placeholderText,
                                        hasContent: content.hasContent, incomplete: content.isIncomplete)
    }

    private static func belongs<Source: CodexComposerSource>(_ input: Source.Element, to window: Source.Element,
                                                            processID: Int32, source: Source) -> Bool {
        guard source.processID(input) == processID else { return false }
        if let declared = source.window(input) { return declared == window }
        var current: Source.Element? = input
        var seen = Set<Source.Element>()
        for _ in 0..<64 {
            guard let node = current, seen.insert(node).inserted, source.processID(node) == processID else { return false }
            if node == window { return true }
            // 父链遇到另一个窗口即拒绝，不能再借应用根追到所选窗口。
            if source.role(node) == "AXWindow" { return false }
            current = source.parent(node)
        }
        return false
    }

    private static func content<Source: CodexComposerSource>(_ element: Source.Element, source: Source,
                                                            processID: Int32, depth: Int, insidePlaceholder: Bool, budget: inout Int,
                                                            seen: inout Set<Source.Element>) -> CodexInputContent {
        guard depth < 24, budget > 0, seen.insert(element).inserted,
              source.processID(element) == processID else { return .init(incomplete: true) }
        budget -= 1
        let role = source.role(element)
        guard !role.isEmpty, let children = source.children(element) else { return .init(incomplete: true) }
        let nonTextRoles = ["AXButton", "AXLink", "AXImage", "AXTextField", "AXMenuButton"]
        guard ["AXTextArea", "AXGroup", "AXScrollArea", "AXWebArea", "AXLayoutArea", "AXSection", "AXList", "AXListItem", "AXStaticText"].contains(role)
                || nonTextRoles.contains(role) else { return .init(incomplete: true) }
        let value = role == "AXStaticText" ? source.value(element) : nil
        if role == "AXStaticText", value == nil { return .init(incomplete: true) }
        // 非文本草稿同样保留。placeholder节点内的装饰文本按祖先语义排除。
        let hasText = value.map { !$0.isEmpty } ?? false
        let placeholder = source.classes(element).contains("placeholder")
        return .init(placeholder: placeholder, text: hasText,
                     nonText: nonTextRoles.contains(role) || (depth > 0 && role == "AXTextArea"),
                     literalText: (insidePlaceholder || placeholder) ? value : nil,
                     children: children.map { content($0, source: source, processID: processID, depth: depth + 1,
                                                       insidePlaceholder: insidePlaceholder || placeholder,
                                                       budget: &budget, seen: &seen) })
    }
}
