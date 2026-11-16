#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/conversation-tests
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Assistant/ConversationRouter.swift VibeKey/Assistant/ConversationTimeline.swift VibeKey/Agents/AgentModels.swift VibeKey/Agents/AgentLocalizedKeys.swift \
  VibeKey/Device/DeviceConversationProtocol.swift VibeKey/Device/DeviceProtocol.swift \
  VibeKey/Device/DeviceTypes.swift VibeKey/Device/DeviceText.swift VibeKey/Assistant/AssistantProfile.swift \
  ConversationTests/main.swift ConversationTests/TimelineContracts.swift -o build/conversation-tests/contracts
build/conversation-tests/contracts
