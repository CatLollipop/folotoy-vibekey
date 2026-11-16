#!/usr/bin/env python3
"""将SwiftPM真实可执行文件和运行资源装入开发app，不调用Xcode工具。"""
import json
import plistlib
import re
import shutil
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
project = (root / 'project.yml').read_text()
def project_version(name):
    # 两条构建路径必须使用同一个版本源，避免修复后CLT安装包仍显示旧版本。
    match = re.search(r'^\s+' + re.escape(name) + r':\s*"([0-9A-Za-z.+-]+)"\s*$', project, re.MULTILINE)
    if not match:
        raise ValueError('Missing project version: ' + name)
    return match.group(1)

binaries = Path(sys.argv[1]).resolve()
app = root / 'build/AI 助理.app'
if app.exists():
    shutil.rmtree(app)
contents = app / 'Contents'
resources = contents / 'Resources'
frameworks = contents / 'Frameworks'
for p in (resources, frameworks, contents / 'MacOS'):
    p.mkdir(parents=True, exist_ok=True)
executable = contents / 'MacOS/FoloVibe Key'
shutil.copy2(binaries / 'VibeKey', executable)
info = plistlib.loads((root / 'VibeKey/Info.plist').read_bytes())
info.update(CFBundleName='AI 助理', CFBundleDisplayName='AI 助理', CFBundleIdentifier='local.folobutton.dev',
            CFBundleExecutable='FoloVibe Key', CFBundleDevelopmentRegion='zh-Hans',
            CFBundleShortVersionString=project_version('MARKETING_VERSION'),
            CFBundleVersion=project_version('CURRENT_PROJECT_VERSION'), LSMinimumSystemVersion='26.0',
            NSAppleEventsUsageDescription='AI 助理需要控制你选中的终端会话，用于向 Claude Code 输入语音指令。')
for key in list(info):
    if isinstance(info[key], str) and '$(' in info[key]:
        info[key] = ''
for key in ['NSMicrophoneUsageDescription', 'NSAudioCaptureUsageDescription', 'NSBluetoothAlwaysUsageDescription']:
    if key in info:
        info[key] = info[key].replace('FoloVibe Key', 'AI 助理')
for item in binaries.glob('*.framework'):
    shutil.copytree(item, frameworks / item.name, symlinks=True)
for item in binaries.glob('*.bundle'):
    shutil.copytree(item, resources / item.name, symlinks=True)
for path in [root / 'VibeKey/Resources', root / 'VibeKey/Pet/Resources']:
    for item in path.iterdir():
        destination = resources / item.name
        if item.is_dir(): shutil.copytree(item, destination, dirs_exist_ok=True)
        else: shutil.copy2(item, destination)
for source in ['AgentBridges', 'DeviceAssets']:
    path = root / source
    if path.exists(): shutil.copytree(path, resources / source, dirs_exist_ok=True)

# Foundation按标准.strings读取；不需要Xcode的xcstringstool，保持与en.json同源。
english = json.loads((root / 'Localization/en.json').read_text())
catalog = json.loads((root / 'VibeKey/Localizable.xcstrings').read_text())
keys = sorted(set(catalog['strings']) | set(english))
def quoted(text): return json.dumps(text, ensure_ascii=False)
for locale in ['zh-Hans', 'en']:
    folder = resources / f'{locale}.lproj'
    folder.mkdir(exist_ok=True)
    values = [(key, english.get(key, key) if locale == 'en' else key) for key in keys]
    (folder / 'Localizable.strings').write_text('\n'.join(f'{quoted(k)} = {quoted(v)};' for k,v in values)+'\n')
    (folder / 'InfoPlist.strings').write_text(f'"CFBundleDisplayName" = "{"AI Assistant" if locale == "en" else "AI 助理"}";\n')

iconset = root / 'build/Assistant.iconset'
iconset.mkdir(exist_ok=True)
for icon in (root / 'VibeKey/Assets.xcassets/AppIcon.appiconset').glob('*.png'):
    shutil.copy2(icon, iconset / icon.name)
subprocess.run(['iconutil', '-c', 'icns', str(iconset), '-o', str(resources / 'AppIcon.icns')], check=True)
info['CFBundleIconFile'] = 'AppIcon'
(contents / 'Info.plist').write_bytes(plistlib.dumps(info, sort_keys=True))
subprocess.run(['install_name_tool', '-add_rpath', '@executable_path/../Frameworks', str(executable)], check=True)
print('Packaged AI 助理.app from compiled SwiftPM executable and offline resources.')
