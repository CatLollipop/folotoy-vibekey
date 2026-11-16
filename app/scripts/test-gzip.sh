#!/usr/bin/env bash
# 正式gzip与豆包EOS离线回归；只编译命令行夹具，不启动App/AX/设备或网络。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/gzip-tests
compiler=(swiftc -swift-version 6 -default-isolation MainActor -parse-as-library)
if [[ "${SANITIZE:-0}" == "1" ]]; then compiler+=(-sanitize=address); fi
"${compiler[@]}" \
  VibeKey/ASR/Cloud/Gzip.swift VibeKey/ASR/Cloud/VolcengineCodec.swift \
  VibeKey/ASR/Cloud/RealtimeCodec.swift VibeKey/ASR/ASRSession.swift \
  VibeKey/ASR/ASREngine.swift VibeKey/Support/SpeechLanguage.swift \
  GzipTests/main.swift -o build/gzip-tests/contracts
build/gzip-tests/contracts
