#!/usr/bin/env bash
# 仅需 macOS Command Line Tools；编译真实产品代码，不启动硬件或收费服务。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/assistant-tests
swiftc -swift-version 6 -parse-as-library \
    VibeKey/Assistant/AssistantProfile.swift VibeKey/Assistant/AssistantCloudClient.swift \
    VibeKey/Assistant/AssistantStore.swift VibeKey/Assistant/AssistantController.swift \
    VibeKey/Assistant/AssistantPCMPlayer.swift VibeKey/Support/CredentialStore.swift \
    VibeKey/ASR/ASRSession.swift VibeKey/ASR/Cloud/BailianEndpoint.swift \
    VibeKey/ASR/ASREngine.swift VibeKey/Support/SpeechLanguage.swift VibeKey/Support/ModelOption.swift \
    VibeKey/ASR/Cloud/CloudProvider.swift VibeKey/ASR/Cloud/RealtimeCodec.swift \
    VibeKey/ASR/Cloud/VolcengineCodec.swift VibeKey/ASR/Cloud/Gzip.swift \
    VibeKey/ASR/Cloud/BailianCodec.swift VibeKey/ASR/Cloud/StreamingCloudSession.swift \
    VibeKey/Support/MultipartForm.swift VibeKey/Support/Log.swift VibeKey/Audio/AudioSource.swift \
    AssistantCoreTests/main.swift AssistantCoreTests/ASRContractFixtures.swift -o build/assistant-tests/core-tests
build/assistant-tests/core-tests
