#!/usr/bin/env bash
# 仅编译正式权限模型并使用可注入读取器；不读TCC数据库、不打开App或申请权限。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/permission-tests
swiftc -swift-version 6 -default-isolation MainActor -parse-as-library \
  VibeKey/Support/Permissions.swift PermissionTests/main.swift -o build/permission-tests/contracts
build/permission-tests/contracts
