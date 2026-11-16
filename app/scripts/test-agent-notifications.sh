#!/usr/bin/env bash
# 编译正式纯协议/合流/队列，无私人会话、串口或收费API。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/notification-tests
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Agents/AgentModels.swift VibeKey/Agents/AgentLocalizedKeys.swift \
  VibeKey/Agents/AgentNotificationReducer.swift VibeKey/Agents/AgentNotificationQueue.swift \
  VibeKey/Device/DeviceProtocol.swift VibeKey/Device/DeviceNotificationProtocol.swift VibeKey/Device/DeviceConversationProtocol.swift \
  VibeKey/Device/DeviceAssistantProtocol.swift VibeKey/Device/DeviceTypes.swift VibeKey/Device/DeviceText.swift \
  VibeKey/Support/CRC32.swift VibeKey/Assistant/AssistantProfile.swift \
  VibeKey/Vibe/AgentNotifier.swift VibeKey/Support/Log.swift \
  AgentNotificationTests/main.swift -o build/notification-tests/contracts
build/notification-tests/contracts
PYTHONDONTWRITEBYTECODE=1 python3 AgentBridges/tests/test_codex_hook.py
