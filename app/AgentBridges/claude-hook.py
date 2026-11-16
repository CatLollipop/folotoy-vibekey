#!/usr/bin/env python3
"""只转发当前Hook payload；不扫描历史文件、不把Hook正文写入日志。"""
import sys, os, json, pathlib, time, uuid, hashlib, subprocess, fcntl

def atomic(path, obj):
    temp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.tmp')
    fd=os.open(temp,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    with os.fdopen(fd,'w') as stream: json.dump(obj,stream,ensure_ascii=False)
    os.replace(temp,path)

def process_context():
    pid=os.getppid()
    for _ in range(10):
        try:
            comm=subprocess.check_output(['/bin/ps','-p',str(pid),'-o','comm='],text=True).strip()
            if 'claude' in pathlib.Path(comm).name.lower() or '/claude/versions/' in comm:
                tty=subprocess.check_output(['/bin/ps','-p',str(pid),'-o','tty='],text=True).strip()
                return pid,('/dev/'+tty if tty not in ['??','?',''] else None)
            pid=int(subprocess.check_output(['/bin/ps','-p',str(pid),'-o','ppid='],text=True).strip())
        except (ValueError,subprocess.SubprocessError): break
        if pid<=1: break
    return None,None

def main():
    payload=json.load(sys.stdin)
    session_id=str(payload.get('session_id',''))
    if not session_id or len(session_id)>200: return
    adapter=os.environ.get('VIBEKEY_HOOK_ADAPTER','claudeCode')
    if adapter not in ['claudeCode','workBuddy']: return
    pid,tty=process_context() if adapter=='claudeCode' else (None,None)
    instance_id=adapter+'-'+str(pid or os.getppid())+'-'+hashlib.sha256(session_id.encode()).hexdigest()[:12]
    root=pathlib.Path(os.environ.get('VIBEKEY_BRIDGE_ROOT',pathlib.Path.home()/'Library/Application Support/FoloButtonDev/AgentBridge'))
    instance=root/'instances'/instance_id
    for folder in [root,root/'instances',instance,root/'events']:
        folder.mkdir(parents=True,exist_ok=True,mode=0o700)
        if folder.is_symlink() or folder.stat().st_uid!=os.getuid(): return
        folder.chmod(0o700)
    with (instance/'lock').open('a') as lock:
        os.chmod(instance/'lock',0o600);fcntl.flock(lock,fcntl.LOCK_EX)
        state_file=instance/'state.json'
        try: state=json.loads(state_file.read_text())
        except (OSError,ValueError): state={'sequence':0,'turn':'session'}
        hook=payload.get('hook_event_name')
        if hook=='SessionEnd':
            try: (instance/'registration.json').unlink()
            except OSError: pass
            return
        if hook=='UserPromptSubmit': state['turn']=str(payload.get('prompt_id') or uuid.uuid4())
        mapping={'SessionStart':'idle','UserPromptSubmit':'receiving','PreToolUse':'working','PostToolUse':'thinking',
                 'Stop':'completed','StopFailure':'error','PermissionRequest':'waitingInput'}
        status=mapping.get(hook)
        if hook=='Notification':
            if payload.get('notification_type') in ['permission_prompt','elicitation_dialog']: status='waitingInput'
            else: return  # idle_prompt是提示，不是待批准，也不是新完成事件。
        if not status:return
        if hook=='PreToolUse' and 'search' in str(payload.get('tool_name','')).lower():status='searching'
        sequence=int(state.get('sequence',0))+1;state['sequence']=sequence;state['status']=status
        atomic(state_file,state)
        name='Claude Code' if adapter=='claudeCode' else 'WorkBuddy'
        registration={'protocolVersion':1,'adapterID':adapter,'instanceID':instance_id,'name':name,
          'sessions':[{'applicationID':adapter,'instanceID':instance_id,'sessionID':session_id,
                       'name':str(payload.get('session_title') or (name+' · '+pathlib.Path(str(payload.get('cwd',''))).name))[:200]}],
          'capabilities':['discover','observeState']+(['readReply'] if hook=='Stop' and payload.get('last_assistant_message') else []),
          'processID':pid,'terminalTTY':tty,'updatedAt':time.time()}
        atomic(instance/'registration.json',registration)
        event={'applicationID':adapter,'instanceID':instance_id,'sessionID':session_id,'turnID':state['turn'],
          'eventID':str(uuid.uuid4()),'sequence':sequence,'state':status,'timestamp':time.time()}
        envelope={'event':event}
        if hook=='Stop' and isinstance(payload.get('last_assistant_message'),str) and payload['last_assistant_message'].strip():
            text=payload['last_assistant_message'][:32000]
            envelope['reply']={'messageID':hashlib.sha256((state['turn']+text).encode()).hexdigest(),'text':text,'isFinal':True}
        atomic(root/'events'/(str(time.time_ns())+'-'+uuid.uuid4().hex+'.json'),envelope)
        if hook=='UserPromptSubmit':
            pending=instance/'pending-submit.json'
            try:
                request=json.loads(pending.read_text())
                prompt_hash=hashlib.sha256(str(payload.get('prompt','')).encode()).hexdigest()
                if request['sessionID']==session_id and request['promptHash']==prompt_hash and request['expiresAt']>time.time():
                    atomic(instance/('ack-'+request['requestID']+'.json'),{'requestID':request['requestID'],'status':'applied'})
            except (OSError,ValueError,KeyError): pass

if __name__=='__main__':
    try: main()
    except Exception: pass  # 通知失败不阻断原应用、不输出正文、也不向模型注入上下文。
