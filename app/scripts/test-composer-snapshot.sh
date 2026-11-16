#!/usr/bin/env bash
# 编译正式共享解析/读取器，用内存AX模型验证；不访问任何App/原生AX/设备或网络。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/composer-tests
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Codex/CodexInputText.swift VibeKey/Codex/CodexComposerSnapshot.swift \
  VibeKey/Support/AXComposerReader.swift ComposerSnapshotTests/main.swift -o build/composer-tests/contracts
build/composer-tests/contracts
