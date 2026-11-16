#!/usr/bin/env bash
# 编译 Debug 提取字符串,再生成 Localizable.xcstrings(见 update-strings.py)。
set -euo pipefail
cd "$(dirname "$0")/.."
xcodegen generate --quiet
if [[ "$(xcode-select -p)" == *CommandLineTools* ]]; then
    ./scripts/build-clt.sh
else
    xcodebuild -project VibeKey.xcodeproj -scheme VibeKey -configuration Debug \
        -derivedDataPath build/DerivedData -destination 'platform=macOS' build | grep -E "error:|BUILD"
fi
python3 scripts/update-strings.py
