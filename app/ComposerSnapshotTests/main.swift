import Foundation

/// 只使用内存AX模型调用正式读取器，不查询任何进程、窗口、剪贴板或权限。
@main
nonisolated struct ComposerSnapshotTests {
    private struct Node {
        var pid: Int32 = 42
        var window: Int?
        var parent: Int?
        var value: String? = ""
        var placeholder = ""
        var count: Int?
        var range: String?
        var role: String
        var classes: [String] = []
        var children: [Int]? = []
    }
    private final class Fixture: CodexComposerSource {
        var nodes: [Int: Node] = [1: .init(role: "AXWindow", children: [2]),
                                  2: .init(window: 1, parent: 1, count: 0, range: "", role: "AXTextArea")]
        func processID(_ element: Int) -> Int32? { nodes[element]?.pid }
        func window(_ element: Int) -> Int? { nodes[element]?.window }
        func parent(_ element: Int) -> Int? { nodes[element]?.parent }
        func value(_ element: Int) -> String? { nodes[element]?.value }
        func placeholder(_ element: Int) -> String { nodes[element]?.placeholder ?? "" }
        func characterCount(_ element: Int) -> Int? { nodes[element]?.count }
        func rangeText(_ element: Int, count: Int) -> String? { nodes[element]?.range }
        func role(_ element: Int) -> String { nodes[element]?.role ?? "" }
        func classes(_ element: Int) -> [String] { nodes[element]?.classes ?? [] }
        func children(_ element: Int) -> [Int]? { nodes[element]?.children }
    }
    private static func read(_ fixture: Fixture, input: Int = 2) -> String? {
        CodexComposerSnapshot.text(input: input, in: 1, source: fixture)
    }
    private static func placeholder() -> Fixture {
        let source = Fixture()
        source.nodes[2] = .init(window: 1, parent: 1, value: "message hint\n", count: 13, range: "message hint\n", role: "AXTextArea", children: [3])
        source.nodes[3] = .init(parent: 2, role: "AXGroup", classes: ["placeholder"], children: [4])
        source.nodes[4] = .init(parent: 3, value: "message hint", role: "AXStaticText")
        return source
    }

    static func main() {
        var assertions = 0
        func expect(_ condition: @autoclosure () -> Bool, _ name: String) {
            precondition(condition(), name)
            assertions += 1
        }
        let source = Fixture()
        expect(read(source) == "", "known empty composer")
        source.nodes[2]?.value = "Ask anything"
        source.nodes[2]?.placeholder = "Ask anything"
        source.nodes[2]?.range = nil
        expect(read(source) == "", "known zero count and matching formal placeholder")
        source.nodes[2]?.count = 12
        source.nodes[2]?.range = "Ask anything"
        expect(read(source) == "Ask anything", "actual text can equal formal placeholder")
        source.nodes[2]?.count = nil
        expect(read(source) == nil, "matching text alone cannot prove empty")
        source.nodes[2]?.count = 0
        source.nodes[2]?.value = "real unsent draft"
        source.nodes[2]?.placeholder = "Ask"
        source.nodes[2]?.range = nil
        expect(read(source) == nil, "zero count cannot erase conflicting raw draft")
        source.nodes[2]?.range = ""
        expect(read(source) == nil, "zero-length range cannot erase conflicting raw draft")
        source.nodes[2]?.value = "Ask "
        expect(read(source) == nil, "whitespace edits cannot be erased as a matching hint")
        source.nodes[2]?.value = "real unsent draft"
        source.nodes[2]?.range = "real unsent draft"
        expect(read(source) == "real unsent draft", "nonempty range overrides contradictory zero count")
        source.nodes[2]?.count = 3
        source.nodes[2]?.value = "   "
        source.nodes[2]?.range = "   "
        expect(read(source) == "   ", "real whitespace remains a nonempty draft")
        source.nodes[2]?.value = ""
        source.nodes[2]?.range = ""
        expect(read(source) == nil, "positive count plus empty values is unverified")
        source.nodes[2]?.count = -1
        expect(read(source) == nil, "invalid character count")

        let generated = placeholder()
        expect(read(generated) == "", "bounded placeholder-only structure despite AX count/value")
        generated.nodes[2]?.value = "message hint "
        generated.nodes[2]?.range = "message hint "
        expect(read(generated) == nil, "placeholder evidence does not trim real whitespace edits")
        generated.nodes[2]?.value = "real draft"
        generated.nodes[2]?.range = "real draft"
        expect(read(generated) == nil, "placeholder child text must agree with root value")
        generated.nodes[2]?.value = "message hint\n"
        generated.nodes[2]?.range = "new actual content"
        expect(read(generated) == "new actual content", "range contradicting generated placeholder is retained")
        generated.nodes[2]?.range = nil
        generated.nodes[2]?.placeholder = "different formal hint"
        expect(read(generated) == nil, "conflicting formal hint and placeholder class cannot erase value")
        generated.nodes[2]?.placeholder = ""
        generated.nodes[2]?.children = [3, 5]
        generated.nodes[5] = .init(parent: 2, value: "message hint", role: "AXStaticText")
        generated.nodes[2]?.range = "message hint"
        expect(read(generated) == "message hint", "real text alongside placeholder preserved")
        generated.nodes[5]?.role = "AXImage"
        generated.nodes[2]?.value = ""
        generated.nodes[2]?.range = ""
        generated.nodes[2]?.count = 0
        expect(read(generated) == nil, "attachment-only draft cannot be overwritten")
        generated.nodes[2]?.children = [3]
        generated.nodes[3]?.children = [5]
        expect(read(generated) == nil, "attachment under placeholder ancestor is still retained")
        generated.nodes[5]?.role = "AXUnparsedRole"
        expect(read(generated) == nil, "unknown node role is not empty evidence")
        generated.nodes[5]?.role = "AXGroup"
        generated.nodes[5]?.children = nil
        expect(read(generated) == nil, "unreadable subtree blocks empty inference")
        generated.nodes[5]?.children = [3]
        expect(read(generated) == nil, "cyclic subtree blocks empty inference")

        let scoped = Fixture()
        scoped.nodes[2]?.window = 9
        expect(read(scoped) == nil, "different declared window rejected")
        scoped.nodes[2]?.window = 1
        scoped.nodes[2]?.pid = 43
        expect(read(scoped) == nil, "different input process rejected")
        scoped.nodes[2]?.pid = 42
        scoped.nodes[1]?.pid = 43
        expect(read(scoped) == nil, "different bound window process rejected")
        scoped.nodes[1]?.pid = 42
        scoped.nodes[2]?.window = nil
        expect(read(scoped) == "", "same-process parent chain proves bound window")
        scoped.nodes[9] = .init(role: "AXWindow", children: [2])
        scoped.nodes[2]?.parent = 9
        expect(read(scoped) == nil, "other window in parent chain is not bypassed")
        scoped.nodes[2]?.parent = 2
        expect(read(scoped) == nil, "cyclic parent chain rejected")
        scoped.nodes[2]?.parent = 1
        scoped.nodes[2]?.value = nil
        expect(read(scoped) == nil, "unreadable AXValue cannot mean empty")

        let deep = Fixture()
        deep.nodes[2]?.children = [3]
        for id in 3...28 { deep.nodes[id] = .init(parent: id - 1, role: "AXGroup", children: [id + 1]) }
        deep.nodes[29] = .init(parent: 28, role: "AXImage")
        expect(read(deep) == nil, "depth-limited unknown content is retained")
        let wide = Fixture()
        wide.nodes[2]?.children = Array(3...520)
        for id in 3...520 { wide.nodes[id] = .init(parent: 2, role: "AXGroup") }
        expect(read(wide) == nil, "node budget cannot prove empty")

        // 同一正式读取器贯穿投递的四个检查点，发送后重新出现提示不再误报未知。
        let transaction = placeholder()
        expect(read(transaction) == "", "insert guard sees placeholder as empty")
        transaction.nodes[2]?.value = "synthetic prompt"
        transaction.nodes[2]?.count = 16
        transaction.nodes[2]?.range = "synthetic prompt"
        transaction.nodes[2]?.children = [5]
        transaction.nodes[5] = .init(parent: 2, value: "synthetic prompt", role: "AXStaticText")
        expect(read(transaction) == "synthetic prompt", "write-back verification uses effective content")
        expect(read(transaction) == "synthetic prompt", "pre-submit verifies same unchanged draft")
        let after = placeholder()
        expect(read(after) == "", "post-submit placeholder proves composer cleared")
        print("PASS: \(assertions) production composer snapshot fixtures; placeholder, real drafts, contradictory evidence, attachments, scoped ownership and submit lifecycle")
    }
}
