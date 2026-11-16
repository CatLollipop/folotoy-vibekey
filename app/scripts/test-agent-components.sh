#!/usr/bin/env bash
# 临时目录内验证组件合并/卸载，不访问用户配置，不与应用构建目录共用产物。
set -euo pipefail
cd "$(dirname "$0")/.."
test_dir="$(mktemp -d "${TMPDIR:-/tmp}/vibekey-agent-components.XXXXXX")"
trap 'rm -rf "$test_dir"' EXIT
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Agents/AgentComponentConfiguration.swift VibeKey/Agents/AgentIntegrationPreferences.swift \
  VibeKey/Support/AppLanguage.swift VibeKey/Support/Localization.swift \
  VibeKey/Vibe/AgentHookInstaller.swift AgentComponentTests/HookNotifierFixture.swift \
  AgentComponentTests/main.swift -o "$test_dir/component-tests"
"$test_dir/component-tests"
