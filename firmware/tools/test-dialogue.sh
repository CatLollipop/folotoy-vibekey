#!/usr/bin/env bash
set -euo pipefail
fw="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
out="$(mktemp -d "${TMPDIR:-/tmp}/passport-dialogue.XXXXXX")"
trap 'rm -rf "${out}"' EXIT
cc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -I"${fw}/main" "${fw}/main/ib_dialogue_keys.c" "${fw}/tests/test_ib_dialogue_keys.c" -o "${out}/keys"
"${out}/keys"
json_dir="${IDF_PATH:-${fw}/../../toolchains/esp-idf-v5.5.3}/components/json/cJSON"
cc -std=c11 -Wall -Wextra -Werror -Wno-deprecated-declarations -fsanitize=address,undefined -c "${json_dir}/cJSON.c" -o "${out}/json.o"
cc -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -fno-omit-frame-pointer -I"${fw}/main" -I"${json_dir}" "${fw}/main/ib_conversation.c" "${fw}/tests/test_ib_conversation.c" "${out}/json.o" -o "${out}/wire"
"${out}/wire"
