#!/usr/bin/env python3
"""仅在 SwiftPM 的本地 checkout 展开两个 Xcode 专用 SwiftUI 宏，保留运行时行为。"""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
dependency = root / '.build/checkouts/KeyboardShortcuts/Sources/KeyboardShortcuts'
recorder = dependency / 'Recorder.swift'
policy = dependency / 'ConflictPolicy.swift'
if not recorder.exists() or not policy.exists():
    raise SystemExit('Run swift package --package-path app resolve first.')
text = recorder.read_text()
if '\n#Preview {' in text:
    # 3.1.0 的文件末尾只有三个设计时预览；不删除任何产品函数。
    start = text.index('\n#Preview {')
    tail = text[start:]
    if tail.count('#Preview {') != 3 or not tail.rstrip().endswith('#endif'):
        raise SystemExit('Unexpected KeyboardShortcuts preview layout; refusing to patch.')
    recorder.chmod(0o644)
    recorder.write_text(text[:start] + '\n#endif\n')
text = policy.read_text()
old = '''extension EnvironmentValues {
\t@Entry
\tvar keyboardShortcutsConflictPolicy = KeyboardShortcuts.ConflictPolicy.default
}'''
new = '''private struct AssistantConflictPolicyKey: EnvironmentKey {
    static let defaultValue = KeyboardShortcuts.ConflictPolicy.default
}
extension EnvironmentValues {
    var keyboardShortcutsConflictPolicy: KeyboardShortcuts.ConflictPolicy {
        get { self[AssistantConflictPolicyKey.self] }
        set { self[AssistantConflictPolicyKey.self] = newValue }
    }
}'''
if old in text:
    policy.chmod(0o644)
    policy.write_text(text.replace(old, new))
elif 'AssistantConflictPolicyKey' not in text:
    raise SystemExit('Unexpected KeyboardShortcuts environment property; refusing to patch.')
print('CLT compatibility: expanded EnvironmentKey and excluded design-time previews in local checkout.')

utilities = dependency / 'Utilities.swift'
text = utilities.read_text()
if 'bundle: .module,' in text:
    utilities.chmod(0o644)
    utilities.write_text(text.replace('bundle: .module,', 'bundle: .assistantShortcutResources,'))
helper = dependency / 'AssistantResourceBundle.swift'
helper.write_text('import Foundation\nextension Bundle {\n    static let assistantShortcutResources: Bundle = {\n        if let root = Bundle.main.resourceURL,\n           let bundle = Bundle(url: root.appendingPathComponent("KeyboardShortcuts_KeyboardShortcuts.bundle")) {\n            return bundle\n        }\n        return .module\n    }()\n}\n')
