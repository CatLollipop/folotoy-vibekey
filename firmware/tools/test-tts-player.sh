#!/usr/bin/env bash
# pthread替身编译真实TTS播放器，测试背压/预缓冲/取消，不连接硬件或云端。
set -euo pipefail
fw="$(cd "$(dirname "$0")/.." && pwd)"
export TTS_TEST_FW="$fw"
python3 - <<'PY'
import os
from pathlib import Path
import subprocess
import tempfile
fw=Path(os.environ['TTS_TEST_FW'])
flags=['-std=c11','-Wall','-Wextra','-Werror','-pthread','-I'+str(fw/'tests/tts_fakes'),'-I'+str(fw/'main'),'-I'+str(fw/'tests')]
if os.environ.get('SANITIZE','1')!='0': flags+=['-fsanitize=address,undefined','-fno-omit-frame-pointer']
with tempfile.TemporaryDirectory(prefix='tts-player-test-') as directory:
    out=Path(directory)/'tts-player'
    subprocess.run([os.environ.get('CC','cc'),*flags,str(fw/'tests/test_ib_tts_player.c'),str(fw/'main/ib_tts_player.c'),'-o',str(out)],check=True)
    subprocess.run([str(out)],check=True,timeout=20)
PY
