#!/usr/bin/env bash
# 编译真实Agent产品代码和官方Kimi协议夹具，无需Xcode.app，不启动用户会话或收费调用。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/agent-tests
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Agents/AgentModels.swift VibeKey/Agents/AgentLocalizedKeys.swift VibeKey/Agents/AgentMailbox.swift \
  VibeKey/Agents/KimiAgentAdapter.swift VibeKey/Agents/KimiConversationReducer.swift \
  VibeKey/Support/AppLanguage.swift VibeKey/Support/Localization.swift \
  VibeKey/Support/CredentialStore.swift VibeKey/Support/Log.swift \
  VibeKey/Device/DeviceProtocol.swift VibeKey/Device/DeviceAssistantProtocol.swift \
  VibeKey/Device/DeviceTypes.swift VibeKey/Device/DeviceText.swift VibeKey/Assistant/AssistantProfile.swift \
  VibeKey/Bridge/KeyPressTracker.swift VibeKey/Assistant/AssistantHardwareRouter.swift \
  VibeKey/Assistant/AssistantStore.swift VibeKey/ASR/Cloud/CloudProvider.swift \
  VibeKey/ASR/Cloud/CloudASRStore.swift VibeKey/Support/ModelOption.swift VibeKey/Models/ModelCatalog.swift \
  AgentCoreTests/main.swift -o build/agent-tests/core-tests
build/agent-tests/core-tests
node --test AgentBridges/tests/bridge.test.mjs
