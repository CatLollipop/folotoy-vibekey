#!/usr/bin/env bash
set -euo pipefail
fw="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
mkdir -p "${fw}/build/host-transcript"
cc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -g -I"${fw}/main" \
  "${fw}/tests/test_ib_transcript_view.c" "${fw}/main/ib_transcript_view.c" -o "${fw}/build/host-transcript/test"
"${fw}/build/host-transcript/test"
