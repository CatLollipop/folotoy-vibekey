#!/usr/bin/env bash
# 生产lazy mic/tone任务与codec所有权的pthread/ASan/UBSan验证。
set -euo pipefail
fw="$(cd "$(dirname "$0")/.." && pwd)"
out="$(mktemp -d "${TMPDIR:-/tmp}/audio-runtime.XXXXXX")"
trap 'rm -rf "$out"' EXIT
"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -pthread -fsanitize=address,undefined -I"$fw/tests/audio_fakes" -I"$fw/main" -I"$fw/tests" "$fw/tests/test_ib_audio_runtime.c" "$fw/main/ib_audio.c" "$fw/main/ib_adpcm.c" "$fw/main/ib_protocol.c" "$fw/main/ib_icons.c" -lm -o "$out/test"
for failure in 1 2 3;do "$out/test" "$failure";done
"$out/test"
