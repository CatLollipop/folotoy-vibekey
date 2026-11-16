#!/usr/bin/env bash
# 使用注入夹具验证正式Hub；不连接应用、串口或任何模型服务。
set -euo pipefail
cd "$(dirname "$0")/.."
test_dir="$(mktemp -d "${TMPDIR:-/tmp}/vibekey-agent-hub.XXXXXX")"
trap 'rm -rf "$test_dir"' EXIT
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Agents/AgentModels.swift VibeKey/Agents/AgentLocalizedKeys.swift \
  VibeKey/Agents/AgentMailbox.swift VibeKey/Agents/AgentHub.swift VibeKey/Agents/AgentIntegrationPreferences.swift \
  VibeKey/Agents/ClaudeCodeAgentAdapter.swift VibeKey/Agents/WorkBuddyAgentAdapter.swift VibeKey/Agents/DesktopAXAgentAdapter.swift \
  VibeKey/Agents/KimiAgentAdapter.swift VibeKey/Agents/KimiConversationReducer.swift \
  VibeKey/Support/AppLanguage.swift VibeKey/Support/Localization.swift \
  VibeKey/Support/CredentialStore.swift VibeKey/Support/Log.swift \
  AgentHubTests/main.swift -o "$test_dir/hub-tests"
"$test_dir/hub-tests"
