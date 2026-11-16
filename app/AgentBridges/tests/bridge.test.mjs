import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {Mailbox,writePrivate,NotDeliveredError} from '../mailbox.mjs';
import ompExtension from '../omp-extension.mjs';
import {createBridgePlugin} from '../dsh-bridge.mjs';
const dshPlugin=createBridgePlugin(value=>value);
const roots=[];
const temporary=()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'vibekey-bridge-test-'));roots.push(root);return root;};
const events=root=>fs.readdirSync(path.join(root,'events')).map(n=>JSON.parse(fs.readFileSync(path.join(root,'events',n),'utf8')));
const wait=async predicate=>{for(let i=0;i<100;i++){const value=predicate();if(value)return value;await new Promise(r=>setTimeout(r,20));}throw new Error('Timed out');};
const registration=root=>fs.readdirSync(path.join(root,'instances')).map(n=>path.join(root,'instances',n)).find(p=>fs.existsSync(path.join(p,'registration.json')));
function command(instance,sessionID,operation,text,{requestID=crypto.randomUUID(),expiresAt=Date.now()/1000+5}={}){
 const descriptor=JSON.parse(fs.readFileSync(path.join(instance,'registration.json'),'utf8'));
 writePrivate(path.join(instance,'requests',requestID+'.json'),{requestID,instanceID:descriptor.instanceID,sessionID,operation,text,createdAt:Date.now()/1000,expiresAt});
 return path.join(instance,'responses',requestID+'.json');
}
const receipt=file=>fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):undefined;

test('mailbox distinguishes accepted from applied and never replays a completed request',async()=>{
 const root=temporary(),box=new Mailbox('test','Test',{root});box.register([box.session('original','Test')],['submit']);
 let finish; const pending=new Promise(resolve=>{finish=resolve;});let calls=0;
 const result=command(box.instance,'original','sendPrompt','test speech');
 const draining=box.drain(async()=>{calls++;await pending;});
 assert.equal(receipt(result).status,'accepted');finish();await draining;assert.equal(receipt(result).status,'applied');
 const requestID=path.basename(result,'.json');command(box.instance,'original','sendPrompt','test speech',{requestID});await box.drain(()=>{calls++;});
 assert.equal(calls,1);assert.equal(fs.statSync(root).mode&0o777,0o700);assert.equal(fs.statSync(result).mode&0o777,0o600);
 const wrong=command(box.instance,'another-session','sendPrompt','must not deliver');await box.drain(()=>{calls++;});assert.equal(receipt(wrong).status,'failed');assert.equal(calls,1);
 const stale=command(box.instance,'original','sendPrompt','expired',{expiresAt:Date.now()/1000-1});await box.drain(()=>{calls++;});assert.equal(receipt(stale).status,'failed');assert.equal(calls,1);
});

test('OMP extension submits through official original-session API without touching editor',async()=>{
 const root=temporary();process.env.VIBEKEY_BRIDGE_ROOT=root;
 const handlers=new Map(),sentMessages=[];let editor='',idle=true;
 const pi={on:(name,handler)=>handlers.set(name,handler),sendUserMessage:(text,options)=>{assert.equal(options,undefined,'idle sends must not be parked with explicit followUp');sentMessages.push(text);handlers.get('message_start')({message:{role:'user',content:[{type:'text',text}]}});return new Promise(()=>{});}};
 const context={cwd:'/dedicated-test',sessionManager:{getSessionId:()=> 'test-omp-session'},ui:{supportsEditor:true,getEditorText:()=>editor,setEditorText:text=>{editor=text;}},isIdle:()=>idle,hasPendingMessages:()=>false,abort:async()=>{}};
 ompExtension(pi);await handlers.get('session_start')({},context);
 try{
  const instance=registration(root);
  const descriptor=JSON.parse(fs.readFileSync(path.join(instance,'registration.json'),'utf8'));
  assert.equal(descriptor.controlTransport,'omp-extension');assert.equal(descriptor.capabilities.includes('insertDraft'),false);
  editor='原会话手动草稿';
  const inserted=command(instance,'test-omp-session','insertDraft','必须保留在助理本机');
  await wait(()=>receipt(inserted)?.status==='failed');assert.equal(editor,'原会话手动草稿');
  const sent=command(instance,'test-omp-session','sendPrompt','专用测试消息');
  await wait(()=>receipt(sent)?.status==='applied');assert.deepEqual(sentMessages,['专用测试消息']);assert.equal(editor,'原会话手动草稿');
  handlers.get('agent_start')({},context);handlers.get('message_end')({message:{role:'assistant',stopReason:'stop',content:[{type:'thinking',thinking:'do not speak'},{type:'text',text:'测试回复'}]}});idle=false;handlers.get('agent_end')({},context);assert.equal(events(root).some(x=>x.event.state==='completed'),false);idle=true;
  const completed=await wait(()=>events(root).find(x=>x.event.state==='completed'));assert.equal(completed.reply.text,'测试回复');
  handlers.get('agent_start')({},context);handlers.get('message_end')({message:{role:'assistant',stopReason:'error',content:[{type:'text',text:'error should not speak'}]}});handlers.get('agent_end')({},context);await wait(()=>events(root).some(x=>x.event.state==='error'));
  assert.equal(events(root).filter(x=>x.reply).length,1);assert.ok(events(root).some(x=>x.event.state==='error'));
  handlers.get('tool_approval_requested')({});assert.ok(events(root).some(x=>x.event.state==='waitingInput'));
 }finally{handlers.get('session_shutdown')();delete process.env.VIBEKEY_BRIDGE_ROOT;}
});

test('DSH plugin admits prompts only to existing root sessions and excludes subagent completions',async()=>{
 const root=temporary();process.env.VIBEKEY_BRIDGE_ROOT=root;
 const handlers=new Map(),prompts=[],cancels=[];
 const main={session:{id:'main-session',header:{}},followup:message=>prompts.push(message),cancel:(...args)=>cancels.push(args)};
 const child={session:{id:'child-session',header:{origin:'subagent'}},cancel:()=>assert.fail('must not cancel child')};
 const ctx={on:(event,fn)=>handlers.set(event,fn),agents:{list:()=>[main,child]},sessionController:{prompt:async(request)=>{prompts.push(request);return {accepted:true};}}};
 dshPlugin(ctx);
 try{
  const instance=registration(root);const descriptor=JSON.parse(fs.readFileSync(path.join(instance,'registration.json'),'utf8'));assert.deepEqual(descriptor.sessions.map(x=>x.sessionID),['main-session']);
  const sent=command(instance,'main-session','sendPrompt','test original session');await wait(()=>receipt(sent)?.status==='applied');assert.equal(prompts[0].source.kind,'user');assert.equal(prompts[0].content[0].text,'test original session');
  const stopped=command(instance,'main-session','stop');await wait(()=>receipt(stopped)?.status==='applied');assert.deepEqual(cancels,[[{kind:'user'},{keepInbox:true}]]);
  handlers.get('session/event')(child.session,{type:'turn/end',seq:3,data:{turn:1,reason:{kind:'completed'}}});assert.equal(events(root).length,0);
  handlers.get('session/event')(main.session,{type:'turn/start',seq:0,data:{turn:1}});
  handlers.get('session/event')(main.session,{type:'assistant/message',seq:1,data:{turn:1,message:{content:[{type:'reasoning',text:'hidden'},{type:'text',text:'正式回复'}]}}});
  handlers.get('session/event')(main.session,{type:'turn/end',seq:2,data:{turn:1,reason:{kind:'completed'}}});assert.equal(events(root).find(x=>x.reply).reply.text,'正式回复');
  main.followup=async message=>{prompts.push(message);throw new Error('Native inbox accepted before error');};
  const uncertain=command(instance,'main-session','sendPrompt','uncertain native fixture');await wait(()=>receipt(uncertain)?.status==='deliveryUnknown');
 }finally{handlers.get('dispose')();delete process.env.VIBEKEY_BRIDGE_ROOT;}
});

test('Claude-compatible hook filters idle nags and transfers only current final assistant text',()=>{
 const root=temporary();const script=new URL('../claude-hook.py',import.meta.url);
 const run=payload=>{const result=spawnSync('/usr/bin/python3',[script.pathname],{input:JSON.stringify({session_id:'test-hook-session',cwd:'/dedicated-test',...payload}),encoding:'utf8',env:{...process.env,VIBEKEY_BRIDGE_ROOT:root,VIBEKEY_HOOK_ADAPTER:'workBuddy',PYTHONDONTWRITEBYTECODE:'1'}});assert.equal(result.status,0);assert.equal(result.stdout,'');};
 run({hook_event_name:'SessionStart',session_title:'专用测试会话'});run({hook_event_name:'Notification',notification_type:'idle_prompt'});assert.equal(events(root).length,1);
 run({hook_event_name:'UserPromptSubmit',prompt:'测试输入'});run({hook_event_name:'Stop',last_assistant_message:'最终测试回复'});
 const finished=events(root).find(x=>x.reply);assert.equal(finished.reply.text,'最终测试回复');assert.equal(finished.event.applicationID,'workBuddy');
 assert.equal(JSON.stringify(events(root)).includes('测试输入'),false);
});

test.after(()=>{for(const root of roots)fs.rmSync(root,{recursive:true,force:true});});

test('Claude official Mod admits only original-session API prompts and preserves final text boundaries',async()=>{
 const root=temporary();process.env.VIBEKEY_BRIDGE_ROOT=root;
 const {perform}=await import('../claude-mod/hooks/mailbox-helper.mjs');
 const {register}=await import('../claude-mod/hooks/register.js');
 const handlers=new Map(),sent=[],aborted=[];let tick,cancelled=false,drop=false,throwNative=false,nativeID='claude-original-test';
 const $={plugin:{root:'/fixture/plugin'},session:{id:async()=>nativeID},
  process:{hookEnv:async()=>({CLAUDE_PID:String(process.pid),CLAUDE_CODE_SESSION_ID:nativeID}),run:async(argv,options)=>{assert.deepEqual(argv,['/usr/bin/env','node','/fixture/plugin/hooks/mailbox-helper.mjs']);
   return {exitCode:0,stdout:JSON.stringify(perform(JSON.parse(options.stdin)))};}},
  clock:{every:(_ms,fn)=>{tick=fn;return {cancel:()=>{cancelled=true;}};}},
  prompt:{submit:async args=>{sent.push(args);if(throwNative)throw new Error('Original session changed');return drop?{drop:'Policy refused'}:{text:args.text};}},
  turn:{abort:async args=>{aborted.push(args);}},
 };
 register((name,fn)=>handlers.set(name,fn));const next=async e=>e;
 await handlers.get('session.start')($,{isInteractive:true},next);
 try{
  const instance=registration(root),descriptor=JSON.parse(fs.readFileSync(path.join(instance,'registration.json'),'utf8'));
  assert.equal(descriptor.controlTransport,'claude-mod');assert.equal(descriptor.sessions[0].sessionID,nativeID);
  const sentReceipt=command(instance,nativeID,'sendPrompt','only confirmed local draft');await tick();
  assert.equal(receipt(sentReceipt).status,'applied');assert.deepEqual(sent,[{text:'only confirmed local draft',asUser:true}]);
  await tick();assert.equal(sent.length,1,'completed mailbox request replayed');
  drop=true;const denied=command(instance,nativeID,'sendPrompt','refused fixture');await tick();assert.equal(receipt(denied).status,'failed');
  drop=false;throwNative=true;const uncertain=command(instance,nativeID,'sendPrompt','native call failed after possible admission');await tick();assert.equal(receipt(uncertain).status,'deliveryUnknown');
  await handlers.get('turn.start')($,{turnId:'original-turn'},next);
  const stop=command(instance,nativeID,'stop');await tick();assert.equal(receipt(stop).status,'applied');assert.deepEqual(aborted,[{turnId:'original-turn'}]);
  await handlers.get('turn.complete')($,{turnId:'child-turn',agentId:'subagent',answer:'must not report',reason:'answer',isAborted:false},next);
  await handlers.get('turn.complete')($,{turnId:'original-turn',answer:'Visible final answer',reason:'answer',isAborted:false},next);
  const output=events(root);assert.deepEqual(output.map(x=>x.event.state),['thinking','completed']);
  assert.deepEqual(output.map(x=>x.event.sequence),[1,2]);assert.equal(output.at(-1).reply.text,'Visible final answer');
  nativeID='different-native-session';const changed=command(instance,'claude-original-test','sendPrompt','must never enter another session');await tick();
  assert.equal(receipt(changed),undefined);assert.equal(sent.length,3);
 }finally{await handlers.get('session.end')($,{},next);assert.equal(cancelled,true);delete process.env.VIBEKEY_BRIDGE_ROOT;}
});


test('Claude Mod file helper executable works from installed paths containing spaces',()=>{
 const root=temporary(),plugin=path.join(root,'Application Support','plugin');
 fs.cpSync(new URL('../claude-mod/',import.meta.url),plugin,{recursive:true,dereference:true});
 const result=spawnSync(process.execPath,[path.join(plugin,'hooks/mailbox-helper.mjs')],{
  input:JSON.stringify({operation:'init',sessionID:'existing-native-fixture',nativePID:process.pid}),encoding:'utf8',
  env:{...process.env,VIBEKEY_BRIDGE_ROOT:path.join(root,'private mailbox')},
 });
 assert.equal(result.status,0,result.stderr);const output=JSON.parse(result.stdout);
 assert.match(output.instanceID,/^[A-Za-z0-9_-]+$/);
 const reg=JSON.parse(fs.readFileSync(path.join(root,'private mailbox','instances',output.instanceID,'registration.json'),'utf8'));
 assert.equal(reg.controlTransport,'claude-mod');assert.equal(reg.sessions[0].sessionID,'existing-native-fixture');
});

test('Claude Hook defers only to a Mod with the exact official native PID and session',()=>{
 const root=temporary(),box=new Mailbox('claudeCode','Claude Code',{root,controlTransport:'claude-mod',processID:process.pid});
 box.register([box.session('shared-native-session','Fixture')],['discover','submit']);
 const script=new URL('../claude-hook.py',import.meta.url).pathname;
 const invoke=session=>spawnSync('/usr/bin/python3',[script],{encoding:'utf8',
  input:JSON.stringify({session_id:session,hook_event_name:'Stop',last_assistant_message:'Fixture final reply'}),
  env:{...process.env,VIBEKEY_BRIDGE_ROOT:root,VIBEKEY_HOOK_ADAPTER:'claudeCode',CLAUDE_PID:String(process.pid),CLAUDE_CODE_SESSION_ID:session}});
 assert.equal(invoke('shared-native-session').status,0);assert.equal(events(root).length,0,'same native instance emitted twice');
 assert.equal(invoke('different-native-session').status,0);assert.equal(events(root).length,1,'different native session suppressed');
 const file=path.join(box.instance,'registration.json');const reg=JSON.parse(fs.readFileSync(file,'utf8'));reg.processID=process.ppid;writePrivate(file,reg);
 assert.equal(invoke('shared-native-session').status,0);assert.equal(events(root).length,2,'same session in a different process was merged');
});


test('mailbox marks invoked native exceptions unknown and only explicit local preflight as failed',async()=>{
 const root=temporary(),box=new Mailbox('test','Test',{root});box.register([box.session('original','Test')],['submit']);
 let calls=0;const unknown=command(box.instance,'original','sendPrompt','native admits then transport rejects');
 await box.drain(async()=>{calls++;throw new Error('Native call rejected after admission');});
 assert.equal(receipt(unknown).status,'deliveryUnknown');
 const requestID=path.basename(unknown,'.json');command(box.instance,'original','sendPrompt','must not replay',{requestID});await box.drain(()=>{calls++;});assert.equal(calls,1);
 const rejected=command(box.instance,'original','sendPrompt','local preflight rejection');
 await box.drain(()=>{throw new NotDeliveredError('Original native identity changed before invocation');});
 assert.equal(receipt(rejected).status,'failed');
});
