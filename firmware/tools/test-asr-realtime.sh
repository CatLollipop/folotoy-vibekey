#!/usr/bin/env bash
# 编译生产WSS运行器与Fun-ASR解析器；transport替身不联网，不读取密钥或设备。
set -euo pipefail
fw="$(cd "$(dirname "$0")/.." && pwd)"
export ASR_TEST_FW="$fw"
python3 - <<'PY'
import os,subprocess,tempfile
from pathlib import Path
fw=Path(os.environ['ASR_TEST_FW'])
flags=['-std=c11','-Wall','-Wextra','-Werror','-pthread','-I'+str(fw/'tests/asr_fakes'),'-I'+str(fw/'tests/assistant_fakes'),'-I'+str(fw/'tests/tts_fakes'),'-I'+str(fw/'main'),'-I'+str(fw/'tests')]
if os.environ.get('SANITIZE','1')!='0':flags+=['-fsanitize=address,undefined','-fno-omit-frame-pointer']
with tempfile.TemporaryDirectory(prefix='asr-realtime-test-') as directory:
    out=Path(directory)/'asr'
    subprocess.run([os.environ.get('CC','cc'),*flags,str(fw/'tests/test_ib_asr_realtime.c'),str(fw/'main/ib_asr_realtime.c'),str(fw/'main/ib_asr_events.c'),str(fw/'main/ib_doubao_asr.c'),'-o',str(out)],check=True)
    subprocess.run([str(out)],check=True,timeout=15)
    fixture_cli=Path(directory)/'fixture-cli'
    subprocess.run([os.environ.get('CC','cc'),*flags,str(fw/'tests/test_doubao_fixture_cli.c'),str(fw/'main/ib_doubao_asr.c'),str(fw/'main/ib_asr_events.c'),'-o',str(fixture_cli)],check=True)
    import json
    fixtures=json.loads((fw/'tests/fixtures/doubao-asr-wire.json').read_text())['fixtures']
    for fixture in fixtures:
        wire=bytes.fromhex(fixture['frame_hex'])
        result=subprocess.run([str(fixture_cli)],input=wire,capture_output=True,check=True,timeout=5).stdout.decode().split('\n',4)
        expected=fixture['expected']
        compressed=(wire[2]&15)!=0
        if compressed:assert result[0]=='asr_unsupported_compression',(fixture['name'],result)
        elif expected.get('valid') and not expected.get('error_code'):
            assert result[0]=='ok',(fixture['name'],result)
            assert bool(int(result[1]))==expected.get('terminal',False),(fixture['name'],result)
            if 'sequence' in expected:assert int(result[2])==expected['sequence'],(fixture['name'],result)
            if 'text' in expected or 'partial' in expected:assert result[4]==expected.get('text',expected.get('partial')),(fixture['name'],result)
        else:assert result[0]!='ok',(fixture['name'],result)
    print(f'Doubao synthetic wire fixtures: {len(fixtures)} PASS (compression0 negotiated)')

PY
