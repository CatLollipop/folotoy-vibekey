// 仅文件传输助手，不导入Claude客户端，不创建/恢复会话，不调用模型。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Mailbox,writePrivate} from './mailbox.mjs';
const component=value=>typeof value==='string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
export function perform(input) {
  if(!['init','tick','heartbeat','receipt','event','close'].includes(input.operation) || typeof input.sessionID!=='string' || !input.sessionID || input.sessionID.length>512)throw new Error('Invalid bridge request');
  if(!Number.isSafeInteger(input.nativePID)||input.nativePID<=0)throw new Error('Missing native CLI provenance');
  if(input.operation!=='init' && !component(input.instanceID))throw new Error('Invalid instance');
  const bridge=new Mailbox('claudeCode','Claude Code',{instanceID:input.instanceID,controlTransport:'claude-mod',processID:input.nativePID});
  if(input.operation==='init' || input.operation==='tick' || input.operation==='heartbeat'){
    // Mac未运行/已停用时也只保留10分钟临时事件，不积累第二份聊天历史。
    for(const name of fs.readdirSync(bridge.events).filter(n=>n.endsWith('.json')).slice(0,1024)){
      const file=path.join(bridge.events,name),stat=fs.lstatSync(file);
      if(stat.isFile()&&!stat.isSymbolicLink()&&stat.uid===process.getuid()&&Date.now()-stat.mtimeMs>600000)fs.unlinkSync(file);
    }
    bridge.register([bridge.session(input.sessionID,'Claude Code · '+input.sessionID.slice(0,12))],['discover','activate','submit','stop','observeState','readReply']);
    let request;
    if(input.operation==='tick')for(const name of fs.readdirSync(bridge.requests).filter(n=>/^[A-Za-z0-9_-]+\.json$/.test(n)).slice(0,32)){
      const file=path.join(bridge.requests,name),stat=fs.lstatSync(file);
      if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==process.getuid()||stat.size>262144)continue;
      let candidate;try{candidate=JSON.parse(fs.readFileSync(file,'utf8'));}catch{continue;}
      if(!component(candidate.requestID)||name!==candidate.requestID+'.json')continue;
      const response=path.join(bridge.responses,name);
      if(fs.existsSync(response)){fs.unlinkSync(file);continue;}
      const valid=candidate.instanceID===bridge.instanceID && candidate.sessionID===input.sessionID &&
        candidate.expiresAt>Date.now()/1000 && candidate.expiresAt<Date.now()/1000+30 &&
        ['sendPrompt','stop'].includes(candidate.operation) &&
        (candidate.operation==='stop'||typeof candidate.text==='string'&&candidate.text.trim()&&Buffer.byteLength(candidate.text)<=64000);
      writePrivate(response,{requestID:candidate.requestID,status:valid?'accepted':'failed',...(valid?{}:{error:'Original session or command is invalid'})});
      fs.unlinkSync(file);if(valid){request=candidate;break;}
    }
    return {instanceID:bridge.instanceID,request};
  }
  if(input.operation==='receipt'){
    if(!component(input.requestID)||!['applied','failed','deliveryUnknown'].includes(input.status))throw new Error('Invalid receipt');
    const file=path.join(bridge.responses,input.requestID+'.json');
    const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.uid!==process.getuid()||stat.size>1024)throw new Error('Unsafe receipt');
    const existing=JSON.parse(fs.readFileSync(file,'utf8'));if(existing.status!=='accepted')throw new Error('Receipt already final');
    writePrivate(file,{requestID:input.requestID,status:input.status,error:typeof input.error==='string'?input.error.slice(0,200):undefined});
  }
  if(input.operation==='event'){
    if(!['thinking','working','searching','waitingInput','completed','stopped','error'].includes(input.state)||typeof input.turnID!=='string'||input.turnID.length>512)throw new Error('Invalid event');
    const reply=input.reply?.isFinal===true && typeof input.reply.text==='string' && input.reply.text.length<=32000
      ?{messageID:String(input.reply.messageID).slice(0,512),text:input.reply.text,isFinal:true}:undefined;
    if(!Number.isSafeInteger(input.sequence)||input.sequence<1)throw new Error('Invalid sequence');
    bridge.sequence=input.sequence-1;bridge.emit(input.sessionID,input.state,{turnID:input.turnID,reply});
  }
  if(input.operation==='close')bridge.close();
  return {};
}
if(process.argv[1] && fs.realpathSync(process.argv[1])===fs.realpathSync(fileURLToPath(import.meta.url))){
  try{
    const chunks=[];let size=0;for await(const chunk of process.stdin){size+=chunk.length;if(size>262144)throw new Error('Input too large');chunks.push(chunk);}
    process.stdout.write(JSON.stringify(perform(JSON.parse(Buffer.concat(chunks).toString('utf8')))));
  }catch{process.stderr.write('Private bridge helper rejected input\n');process.exitCode=1;}
}
