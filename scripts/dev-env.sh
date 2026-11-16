#!/usr/bin/env bash
# source scripts/dev-env.sh；工具链留在仓库外的相邻toolchains目录。
if [[ -n "${ZSH_VERSION:-}" ]]; then
    # zsh 不提供 BASH_SOURCE；%x 返回当前被 source 的脚本，不能用调用者的工作目录。
    eval '_vibekey_env_file=${(%):-%x}'
else
    _vibekey_env_file="${BASH_SOURCE[0]}"
fi
_vibekey_root="$(cd "$(dirname "${_vibekey_env_file}")/.." && pwd)"
_vibekey_tools="${VIBEKEY_TOOLCHAINS:-$(dirname "${_vibekey_root}")/toolchains}"
export IDF_TOOLS_PATH="${_vibekey_tools}/espressif-tools"
export IDF_PYTHON_ENV_PATH="${IDF_TOOLS_PATH}/python_env/idf5.5_py3.12_env"
export IDF_EXPORT="${_vibekey_tools}/esp-idf-v5.5.3/export.sh"
export PATH="/opt/homebrew/opt/python@3.12/libexec/bin:$PATH"
if [[ ! -f "${IDF_EXPORT}" ]]; then
    echo "ESP-IDF is missing. Run scripts/setup-dev.sh first." >&2
    return 1 2>/dev/null || exit 1
fi
source "${IDF_EXPORT}"
unset _vibekey_root _vibekey_tools _vibekey_env_file
