#!/usr/bin/env bash
# 复用真实LVGL配置与已内置OFL字库，仅host字形/语义验证，不连接硬件。
set -euo pipefail
fw="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
preview="${fw}/tools/ui-preview"
cmake -S "${preview}" -B "${preview}/build" -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=clang >/dev/null
cmake --build "${preview}/build" --target ib_ui_labels_test --parallel 4 >/dev/null
"${preview}/build/ib_ui_labels_test"
