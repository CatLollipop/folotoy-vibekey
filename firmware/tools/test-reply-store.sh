#!/usr/bin/env bash
# 一份4KiB正文的生命周期/不可变前缀/取消/UTF8边界；不联网或连接设备。
set -euo pipefail
fw="$(cd "$(dirname "$0")/.." && pwd)"
export REPLY_TEST_FW="$fw"
python3 - <<'PY'
import os,subprocess,tempfile
from pathlib import Path
fw=Path(os.environ['REPLY_TEST_FW'])
with tempfile.TemporaryDirectory(prefix='reply-store-') as directory:
    out=Path(directory)/'test'
    subprocess.run([os.environ.get('CC','cc'),'-std=c11','-Wall','-Wextra','-Werror','-pthread','-fsanitize=address,undefined','-I'+str(fw/'tests/tts_fakes'),'-I'+str(fw/'main'),'-I'+str(fw/'tests'),str(fw/'tests/test_ib_reply_store.c'),str(fw/'main/ib_reply_store.c'),str(fw/'main/ib_cloud_stream.c'),'-o',str(out)],check=True)
    subprocess.run([str(out)],check=True,timeout=15)
PY
