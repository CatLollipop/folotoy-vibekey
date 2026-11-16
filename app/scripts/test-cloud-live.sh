#!/usr/bin/env bash
# 用本机已保存的Key进行一次少量真实调用。参数是无密钥的JSON结果文件。
set -euo pipefail
cd "$(dirname "$0")/.."
[[ $# -eq 1 ]] || { echo 'Usage: scripts/test-cloud-live.sh REPORT.json' >&2; exit 1; }
mkdir -p build/assistant-tests
swiftc -swift-version 6 -parse-as-library \
    VibeKey/Assistant/AssistantProfile.swift VibeKey/Assistant/AssistantCloudClient.swift \
    VibeKey/Support/CredentialStore.swift VibeKey/Support/MultipartForm.swift \
    VibeKey/Support/Log.swift VibeKey/Audio/AudioSource.swift \
    AssistantCoreTests/cloud-smoke.swift -o build/assistant-tests/cloud-smoke
build/assistant-tests/cloud-smoke "$1"
