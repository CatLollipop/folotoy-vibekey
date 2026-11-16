import Foundation

/// AXValue可能含占位提示，只有可验证的空内容证据才能作为覆盖原输入框的依据。
nonisolated enum CodexInputText {
    static func effective(_ value: String, placeholder: String, characterCount: Int? = nil, rangeText: String? = nil,
                          placeholderOnly: Bool = false, placeholderText: String? = nil,
                          hasContent: Bool = false, incomplete: Bool = false) -> String? {
        guard !incomplete, characterCount.map({ $0 >= 0 }) ?? true else { return nil }
        // 元数据冲突时保留范围中的正文；count=0不能抹掉实际可读的文本。
        if characterCount == 0, let rangeText, !rangeText.isEmpty { return rangeText }
        if hasContent {
            if let rangeText, !rangeText.isEmpty { return rangeText }
            return value.isEmpty ? nil : value // 附件或提及没有文字也不是空草稿。
        }
        if placeholderOnly {
            if value.isEmpty && (rangeText?.isEmpty ?? true) { return "" }
            guard let placeholderText, !placeholderText.isEmpty,
                  matchesHint(value, placeholderText),
                  placeholder.isEmpty || matchesHint(placeholder, placeholderText) else { return nil }
            // 类名并不足够；根value必须与实际placeholder子树文本一致。
            if let rangeText, !rangeText.isEmpty,
               !matchesHint(rangeText, placeholderText) {
                return rangeText
            }
            return ""
        }
        // 零长范围总会是空字符串，不能借它盖过非空raw与已知提示的冲突。
        if characterCount == 0, !value.isEmpty,
           placeholder.isEmpty || !matchesHint(value, placeholder) { return nil }
        if let rangeText {
            if rangeText.isEmpty, let characterCount, characterCount > 0 { return nil }
            return rangeText
        }
        if let characterCount {
            if characterCount == 0 {
                return ""
            }
            return value.isEmpty ? nil : value
        }
        // 仅AXValue与提示文案相等无法区分用户恰好输入相同内容，拒绝推断为空。
        if !placeholder.isEmpty, value == placeholder { return nil }
        return value
    }

    /// AX段落可能多带一个行末，不折叠空格或任意空白，以免抹去真实编辑内容。
    private static func matchesHint(_ value: String, _ hint: String) -> Bool {
        value == hint || value == hint + "\n" || value == hint + "\r\n"
    }
}

/// 结构与临时提示文本证据不写日志或持久化。未知/截断子树不能证明只含提示。
nonisolated struct CodexInputContent {
    var placeholder = false
    var text = false
    var nonText = false
    var incomplete = false
    var literalText: String? = nil
    var children: [CodexInputContent] = []

    var isPlaceholderOnly: Bool {
        let value = evidence(insidePlaceholder: false)
        return value.placeholder && !value.content && !value.incomplete
    }
    var hasContent: Bool { evidence(insidePlaceholder: false).content }
    var hasNonText: Bool { nonText || children.contains(where: \.hasNonText) }
    var isIncomplete: Bool { evidence(insidePlaceholder: false).incomplete }
    var placeholderText: String? {
        var parts: [String] = []
        guard collectPlaceholderText(inside: false, into: &parts), !parts.isEmpty else { return nil }
        return parts.joined()
    }

    private func collectPlaceholderText(inside: Bool, into parts: inout [String]) -> Bool {
        let inside = inside || placeholder
        guard !incomplete else { return false }
        if inside && text {
            guard let literalText else { return false }
            parts.append(literalText)
        }
        return children.allSatisfy { $0.collectPlaceholderText(inside: inside, into: &parts) }
    }

    private func evidence(insidePlaceholder: Bool) -> (placeholder: Bool, content: Bool, incomplete: Bool) {
        let inside = insidePlaceholder || placeholder
        var result = (placeholder: placeholder, content: nonText || (text && !inside), incomplete: incomplete)
        for child in children {
            let next = child.evidence(insidePlaceholder: inside)
            result.placeholder = result.placeholder || next.placeholder
            result.content = result.content || next.content
            result.incomplete = result.incomplete || next.incomplete
        }
        return result
    }
}
