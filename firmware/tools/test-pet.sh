#!/usr/bin/env bash
# 纯host验证，不连接串口、不刷写设备。
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build/host-pet
"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -g \
  -Imain -Itests tests/test_ib_pet.c main/ib_pet.c main/ib_pet_motion.c main/ib_pet_bundle.c \
  -lm -o build/host-pet/test_ib_pet
build/host-pet/test_ib_pet
node ../scripts/test-pet-catalog.mjs
"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -fsanitize=address,undefined -g \
  -Imain tests/test_ib_pet_bundle.c main/ib_pet.c main/ib_pet_motion.c main/ib_pet_bundle.c \
  -lm -o build/host-pet/test_ib_pet_bundle
build/host-pet/test_ib_pet_bundle build/host-pet/catalog/*.aorapet
