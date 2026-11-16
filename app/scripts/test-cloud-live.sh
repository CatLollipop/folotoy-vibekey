#!/usr/bin/env bash
# 显式调用DeepSeek（朗读暂停，不调用TTS）；豆包只有传合成夹具时才调用。BUILD_ONLY=1只编译，不读Key或联网。
set -euo pipefail
cd "$(dirname "$0")/.."
[[ $# -eq 1 || ( $# -eq 3 && "$2" == '--synthetic-realtime-asr-audio' ) ]] || {
    echo 'Usage: scripts/test-cloud-live.sh REPORT.json [--synthetic-realtime-asr-audio FIXTURE.wav]' >&2; exit 1;
}
mkdir -p build/assistant-tests
swiftc -swift-version 6 -parse-as-library \
    VibeKey/Assistant/AssistantProfile.swift VibeKey/Assistant/AssistantCloudClient.swift \
    VibeKey/Assistant/AssistantStore.swift VibeKey/Assistant/AssistantRecognitionFactory.swift \
    VibeKey/ASR/ASRSession.swift VibeKey/ASR/ASREngine.swift VibeKey/Support/SpeechLanguage.swift \
    VibeKey/ASR/Cloud/CloudProvider.swift VibeKey/Support/ModelOption.swift \
    VibeKey/ASR/Cloud/BailianEndpoint.swift VibeKey/ASR/Cloud/VolcengineCodec.swift VibeKey/ASR/Cloud/Gzip.swift \
    VibeKey/ASR/Cloud/BailianCodec.swift \
    VibeKey/ASR/Cloud/RealtimeCodec.swift VibeKey/ASR/Cloud/StreamingCloudSession.swift \
    VibeKey/Support/CredentialStore.swift VibeKey/Support/MultipartForm.swift \
    VibeKey/Support/Log.swift VibeKey/Audio/AudioSource.swift \
    AssistantCoreTests/cloud-smoke.swift -o build/assistant-tests/cloud-smoke
if [[ "${BUILD_ONLY:-0}" != 1 ]]; then build/assistant-tests/cloud-smoke "$@"; fi
