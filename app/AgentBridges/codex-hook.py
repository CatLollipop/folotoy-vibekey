#!/usr/bin/env python3
"""只转发本次正式Codex Hook；正文经0600瞬时邮箱，URL仅带会话元数据，不扫描聊天历史。"""
import sys, os, json, pathlib, time, uuid, hashlib, subprocess, fcntl, urllib.parse

def atomic(path, value):
    temporary = path.with_name('.' + path.name + '.' + uuid.uuid4().hex + '.tmp')
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, 'w') as stream:
        json.dump(value, stream, ensure_ascii=False)
    os.replace(temporary, path)

def codex_process():
    pid = os.getppid()
    for _ in range(10):
        try:
            name = subprocess.check_output(['/bin/ps', '-p', str(pid), '-o', 'comm='], text=True).strip()
            if 'codex' in pathlib.Path(name).name.lower(): return str(pid)
            pid = int(subprocess.check_output(['/bin/ps', '-p', str(pid), '-o', 'ppid='], text=True).strip())
            if pid <= 1: break
        except (ValueError, subprocess.SubprocessError): break
    return 'hook'

def main():
    raw = sys.stdin.buffer.read(1_048_577)
    if len(raw) > 1_048_576: return
    payload = json.loads(raw)
    session = str(uuid.UUID(str(payload.get('session_id', '')))).lower()
    fallback = sys.argv[2] if len(sys.argv) == 3 and sys.argv[1] == '--event' else ''
    mapping = {'Stop': 'done', 'PermissionRequest': 'input', 'UserPromptSubmit': 'clear'}
    if payload.get('hook_event_name') and payload['hook_event_name'] not in mapping: return
    event = mapping.get(payload.get('hook_event_name'), fallback)
    if event not in ['done', 'input', 'clear']: return
    # 同一宿主/原会话的URL和邮箱事件使用完全相同的身份，不能各自造完成通知。
    instance = 'codex-' + codex_process() + '-' + hashlib.sha256(session.encode()).hexdigest()[:12]
    root = pathlib.Path(os.environ.get('VIBEKEY_BRIDGE_ROOT', pathlib.Path.home() / 'Library/Application Support/FoloButtonDev/AgentBridge'))
    state_dir = root / 'instances' / instance
    for folder in [root, root / 'instances', state_dir, root / 'events']:
        folder.mkdir(parents=True, exist_ok=True, mode=0o700)
        if folder.is_symlink() or folder.stat().st_uid != os.getuid(): return
        folder.chmod(0o700)
    with (state_dir / 'lock').open('a') as lock:
        os.chmod(state_dir / 'lock', 0o600); fcntl.flock(lock, fcntl.LOCK_EX)
        state_file = state_dir / 'notification-state.json'
        if state_file.is_symlink(): return
        try: state = json.loads(state_file.read_text())
        except (OSError, ValueError): state = {'sequence': 0}
        turn = payload.get('turn_id')
        if not isinstance(turn, str) or not turn or len(turn) > 200: turn = str(uuid.uuid4())
        event_id = ('done:' + turn if event == 'done' else event + ':' + str(payload.get('tool_use_id') or turn))
        sequence = int(state.get('sequence', 0)) + 1
        atomic(state_file, {'sequence': sequence})
        envelope = {'event': {'applicationID': 'codexHook', 'instanceID': instance, 'sessionID': session,
                    'turnID': turn, 'eventID': event_id, 'sequence': sequence,
                    'state': {'done': 'completed', 'input': 'waitingInput', 'clear': 'receiving'}[event], 'timestamp': time.time()}}
        text = payload.get('last_assistant_message')
        if event == 'done' and isinstance(text, str) and text.strip():
            text = text[:32000]
            envelope['reply'] = {'messageID': hashlib.sha256((turn + text).encode()).hexdigest(), 'text': text, 'isFinal': True}
        atomic(root / 'events' / (str(time.time_ns()) + '-' + uuid.uuid4().hex + '.json'), envelope)
    if os.environ.get('VIBEKEY_HOOK_NO_OPEN') != '1':
        project = ''.join(c for c in pathlib.Path(str(payload.get('cwd', ''))).name if c.isascii() and (c.isalnum() or c in '._-'))[:15]
        query = urllib.parse.urlencode({'event': event, 'source': 'Codex', 'thread': session, 'turn': turn,
                                       'instance': instance, 'event_id': event_id, 'project': project})
        subprocess.run(['/usr/bin/open', '-g', '-b', 'local.folobutton.dev', 'folobutton-dev://agent?' + query],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)

if __name__ == '__main__':
    try: main()
    except Exception: pass  # 通知失败不阻断宿主；不输出payload、识别正文或令牌。
