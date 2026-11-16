import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {Mailbox,writePrivate} from '../mailbox.mjs';
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

test('OMP extension controls original editor and returns real assistant text, never reasoning or errors',async()=>{
 const root=temporary();process.env.VIBEKEY_BRIDGE_ROOT=root;
 const handlers=new Map(),sent=[];let editor='',idle=true;
 const pi={on:(name,handler)=>handlers.set(name,handler),sendUserMessage:(text,options)=>{assert.equal(options,undefined,'idle sends must not be parked with explicit followUp');sent.push(text);handlers.get('message_start')({message:{role:'user',content:[{type:'text',text}]}});return new Promise(()=>{});}};
 const context={cwd:'/dedicated-test',sessionManager:{getSessionId:()=> 'test-omp-session'},ui:{supportsEditor:true,getEditorText:()=>editor,setEditorText:text=>{editor=text;}},isIdle:()=>idle,hasPendingMessages:()=>false,abort:async()=>{}};
 ompExtension(pi);await handlers.get('session_start')({},context);
 try{
  const instance=registration(root);const inserted=command(instance,'test-omp-session','insertDraft','专用测试草稿');
  await wait(()=>receipt(inserted)?.status==='applied');assert.equal(editor,'专用测试草稿');
  const submitted=command(instance,'test-omp-session','submit');await wait(()=>receipt(submitted)?.status==='applied');assert.deepEqual(sent,['专用测试草稿']);assert.equal(editor,'');
  editor='原会话手动草稿';const unowned=command(instance,'test-omp-session','submit');await wait(()=>receipt(unowned)?.status==='failed');assert.deepEqual(sent,['专用测试草稿']);editor='';
  const changed=command(instance,'test-omp-session','insertDraft','助手草稿');await wait(()=>receipt(changed)?.status==='applied');editor='已被手动修改';
  const modified=command(instance,'test-omp-session','submit');await wait(()=>receipt(modified)?.status==='failed');assert.deepEqual(sent,['专用测试草稿']);editor='';
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
