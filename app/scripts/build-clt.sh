#!/usr/bin/env bash
# 无需完整Xcode的开发构建；只在本地依赖checkout展开设计时宏，原Xcode构建入口保持可用。
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-lock-guard.sh
swift package resolve
python3 scripts/prepare-clt-build.py
swift build -c debug
bin_dir="$(swift build -c debug --show-bin-path)"
python3 scripts/package-clt.py "${bin_dir}"
scripts/remove-broken-symlinks.sh "build/AI 助理.app"
codesign --force --deep --sign - --entitlements VibeKey/VibeKey.entitlements "build/AI 助理.app"
codesign --verify --deep --strict --verbose=2 "build/AI 助理.app"
echo "Built app/build/AI 助理.app"
