#!/usr/bin/env bash
# 安装可重复的CLI开发环境；Apple账号认证不能由脚本绕过，CLT构建不依赖完整Xcode。
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
tools="${VIBEKEY_TOOLCHAINS:-$(dirname "${root}")/toolchains}"
command -v brew >/dev/null || { echo 'Please install Homebrew from its official installer.' >&2; exit 1; }
HOMEBREW_NO_AUTO_UPDATE=1 brew install xcodegen ninja python@3.12 cmake
export PATH="/opt/homebrew/opt/python@3.12/libexec/bin:$PATH"
export IDF_TOOLS_PATH="${tools}/espressif-tools"
mkdir -p "${tools}"
if [[ ! -d "${tools}/esp-idf-v5.5.3/.git" ]]; then
    git clone --branch v5.5.3 --depth 1 --recursive --shallow-submodules \
        https://github.com/espressif/esp-idf.git "${tools}/esp-idf-v5.5.3"
fi
actual="$(git -C "${tools}/esp-idf-v5.5.3" rev-parse HEAD)"
[[ "${actual}" == '2c211b236707889e8400c4dc5644dd5c4ee071e0' ]] || { echo 'Unexpected ESP-IDF commit; refusing installation.' >&2; exit 1; }
"${tools}/esp-idf-v5.5.3/install.sh" esp32c3
echo 'Ready. source scripts/dev-env.sh; app/scripts/build-clt.sh; cd firmware && idf.py build'
