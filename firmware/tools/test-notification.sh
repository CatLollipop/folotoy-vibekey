#!/usr/bin/env bash
# 生产通知store/热模式事务，不访问网络或设备。
set -euo pipefail
fw="$(cd "$(dirname "$0")/.." && pwd)"
export NOTIFICATION_TEST_FW="$fw"
python3 - <<'PY'
import os,subprocess,tempfile
from pathlib import Path
fw=Path(os.environ['NOTIFICATION_TEST_FW'])
idf=Path(os.environ.get('IDF_PATH',fw.parents[1]/'toolchains/esp-idf-v5.5.3'))
json_dir=idf/'components/json/cJSON'
if not (json_dir/'cJSON.c').is_file():raise SystemExit('IDF_PATH must contain the official cJSON source for production wire tests')
with tempfile.TemporaryDirectory(prefix='notification-') as directory:
    for name,sources in [('notification',['ib_notification','ib_cloud_stream','ib_crc32']),('hot_mode',['ib_hot_mode']),('notification_wire',['ib_notification_wire','ib_notification','ib_cloud_stream','ib_crc32'])]:
        out=Path(directory)/name
        vendor=[]
        if name=='notification_wire':
            obj=Path(directory)/'cJSON.o'
            # 官方依赖的sprintf仅触发macOS SDK弃用诊断；不改vendor，也不降低本项目的Werror。
            subprocess.run([os.environ.get('CC','cc'),'-std=c11','-Wall','-Wextra','-Werror','-Wno-deprecated-declarations','-fsanitize=address,undefined','-c',str(json_dir/'cJSON.c'),'-o',str(obj)],check=True)
            vendor=[str(obj)]
        cmd=[os.environ.get('CC','cc'),'-std=c11','-Wall','-Wextra','-Werror','-pthread','-fsanitize=address,undefined','-I'+str(json_dir),'-I'+str(fw/'tests/tts_fakes'),'-I'+str(fw/'main'),'-I'+str(fw/'tests'),str(fw/f'tests/test_ib_{name}.c')]+[str(fw/f'main/{s}.c') for s in sources]+vendor+['-o',str(out)]
        subprocess.run(cmd,check=True);subprocess.run([str(out)],check=True,timeout=15)
PY
