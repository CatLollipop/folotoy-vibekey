#!/usr/bin/env bash
set -euo pipefail
fw="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "${fw}/build/host-reply"
cc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -g -I"${fw}/main" \
  -c "${fw}/main/ib_reply_view.c" -o "${fw}/build/host-reply/view.o"
# 只检查组件对象：ASan自身允许分配，生产分页组件不允许引用任何堆分配函数。
if nm -u "${fw}/build/host-reply/view.o" | rg -q '(^|[[:space:]_])(malloc|calloc|realloc|free)$'; then
  echo "Reply view unexpectedly references heap allocation" >&2
  exit 1
fi
cc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -g -I"${fw}/main" \
  "${fw}/tests/test_ib_reply_view.c" "${fw}/build/host-reply/view.o" -o "${fw}/build/host-reply/test"
"${fw}/build/host-reply/test"
