#!/usr/bin/env bash
# 使用项目IDF自带cJSON源码，在宿主NOR模型验证事务；不连接设备。
set -euo pipefail
fw="$(cd "$(dirname "$0")/.." && pwd)"
: "${IDF_PATH:?先激活ESP-IDF，或指定IDF_PATH以找到cJSON}"
json="${IDF_PATH}/components/json/cJSON"
out="$(mktemp -d "${TMPDIR:-/tmp}/assistant-store.XXXXXX")"
trap 'rm -rf "$out"' EXIT
cc -std=c11 -Wall -Wextra -Werror -Wno-misleading-indentation -I"$fw/tests/assistant_fakes" -I"$fw/main" -I"$fw/tests" -I"$json" \
 "$fw/tests/test_ib_assistant_store.c" "$fw/main/ib_assistant_store.c" "$fw/main/ib_crc32.c" "$fw/main/ib_pet_bundle.c" "$json/cJSON.c" -lm -o "$out/store"
"$out/store"
