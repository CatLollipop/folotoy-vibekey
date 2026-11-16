#!/usr/bin/env bash
# 同份LVGL/C渲染回归：本地菜单优先、缓存恢复、真实字幕快照冻结。不连接设备/供应商。
set -euo pipefail
fw="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
preview="${fw}/tools/ui-preview"
if [[ ! -f "${fw}/build/host-pet/catalog/miso-shades.aorapet" ]]; then node "${fw}/../scripts/test-pet-catalog.mjs" >/dev/null; fi
cmake -S "${preview}" -B "${preview}/build" -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=clang >/dev/null
cmake --build "${preview}/build" --target ib_ui_preview --parallel 4 >/dev/null
out="$(mktemp -d "${TMPDIR:-/tmp}/passport-ui.XXXXXX")"
trap 'rm -rf "${out}"' EXIT
"${preview}/build/ib_ui_preview" "${out}" 1 >/dev/null
same(){
    local a=("${out}/"*"$1.png") b=("${out}/"*"$2.png")
    cmp -s "${a[0]}" "${b[0]}" || { echo "UI regression: $1 / $2 differ" >&2; exit 1; }
}
same run_mode_companion_select_assistant run_mode_survives_remote_updates
same transcript_fixture_final_frozen transcript_fixture_late_partial_ignored
same transcript_fixture_error_overrides transcript_fixture_error_rejects_late
same reply_quiet_final_frozen reply_quiet_late_partial_ignored
same down_menu_wifi_000ms down_menu_wifi_settled
same down_menu_wifi_000ms down_menu_wifi_background_cached
same down_menu_wifi_000ms down_menu_wifi_return_pending
same down_menu_remote_000ms down_menu_remote_settled
same down_menu_remote_return_000ms down_menu_remote_return_settled
printf 'Display UI: UP/DOWN menu atomic entry/return and owner cache, final/error freeze, production notification/reply page restore and actual capture cue lifecycle passed.\n'
