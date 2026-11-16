// 使用Oh My Pi正式extension API，在用户原会话进程内加载；不启动第二个omp。
import crypto from 'node:crypto';
import { Mailbox,NotDeliveredError } from './mailbox.mjs';

export default function vibekeyExtension(pi) {
  let bridge, context, sessionID, timer, finalMessage, finalStop, pendingEnd;
  const admissions=new Map();
  const capabilities = () => ['discover','activate','submit','stop','observeState','readReply'];
  const publish = () => {
    if (!bridge || !context) return;
    const liveID = context.sessionManager.getSessionId();
    if (!liveID) return;
    sessionID = String(liveID);
    bridge.register([bridge.session(sessionID, 'OMP · '+context.cwd.split('/').pop())], capabilities());
  };
  const submit = async text => {
    if (typeof text !== 'string' || !text.trim()) throw new NotDeliveredError('Empty prompt');
    // 显式followUp在空闲时也只排队、不启动，因此空闲必须走省略deliverAs的原生入口。
    if(!context.isIdle()) { await pi.sendUserMessage(text,{deliverAs:'followUp'}); return; }
    const key=crypto.createHash('sha256').update(text).digest('hex');
    let resolve;const admitted=new Promise(done=>{resolve=done;});admissions.set(key,resolve);
    let timeout;
    try {
      const failure=new Promise((_,reject)=>{timeout=setTimeout(()=>{const error=new Error('OMP prompt delivery is not confirmed');error.code='DELIVERY_UNKNOWN';reject(error);},7000);});
      // native promise可能持续整轮；message_start中同正文的user事件才是提交回执。
      await Promise.race([admitted,Promise.resolve(pi.sendUserMessage(text)).then(()=>{
        if(admissions.has(key)){const error=new Error('OMP prompt finished without an admission receipt');error.code='DELIVERY_UNKNOWN';throw error;}
      }),failure]);
    } finally { clearTimeout(timeout);admissions.delete(key); }
  };
  pi.on('session_start', async (_event, ctx) => {
    context=ctx; bridge?.close(); bridge=new Mailbox('omp','OMP',{controlTransport:'omp-extension'}); finalMessage=undefined; publish();
    clearInterval(timer);
    timer=setInterval(async()=>{
      try {
        publish();
        // Extension的agent_end早于session真正idle；在后续心跳观察正式idle后才完成。
        if(pendingEnd && context.isIdle() && !context.hasPendingMessages()) {
          bridge.emit(sessionID,pendingEnd.state,{turnID:pendingEnd.turnID,reply:pendingEnd.reply});pendingEnd=undefined;
        }
        await bridge.drain(async request=>{
          if (request.sessionID!==String(context.sessionManager.getSessionId())) throw new NotDeliveredError('Original OMP session changed');
          if (request.operation==='activate') return; // 绑定原会话；无需抢占终端输入。
          if (request.operation==='sendPrompt') return submit(request.text);
          if (request.operation==='stop') { await context.abort(); return; }
          throw new NotDeliveredError('Unsupported operation');
        });
      } catch { /* 桥接失败不影响agent本身；心跳失效后桌面会显示阻塞。 */ }
    },200); timer.unref?.();
  });
  pi.on('agent_start',(_event,ctx)=>{context=ctx;pendingEnd=undefined;finalMessage=undefined;finalStop=undefined;bridge?.turns.set(sessionID,crypto.randomUUID());bridge?.emit(sessionID,'thinking');});
  pi.on('message_start',event=>{
    const message=event.message;if(message?.role!=='user')return;
    const text=typeof message.content==='string'?message.content:Array.isArray(message.content)?message.content.filter(p=>p.type==='text').map(p=>p.text).join('\n'):'';
    const key=crypto.createHash('sha256').update(text).digest('hex');const resolve=admissions.get(key);
    if(resolve){admissions.delete(key);resolve();}bridge?.emit(sessionID,'receiving');
  });
  pi.on('tool_approval_requested',()=>bridge?.emit(sessionID,'waitingInput'));
  pi.on('tool_approval_resolved',()=>bridge?.emit(sessionID,'working'));
  pi.on('plan_review_requested',()=>bridge?.emit(sessionID,'waitingInput'));
  pi.on('tool_execution_start', event=>{bridge?.emit(sessionID, /search/i.test(event.toolName||'')?'searching':'working');});
  pi.on('message_end', event=>{
    const message=event.message;
    if(message?.role!=='assistant' || !Array.isArray(message.content)) return;
    finalStop=message.stopReason;
    const text=message.content.filter(part=>part.type==='text' && typeof part.text==='string').map(part=>part.text).join('\n');
    if(text.trim()) finalMessage={text:text.slice(0,32000),messageID:message.id || crypto.randomUUID(),isFinal:true};
  });
  pi.on('agent_end',(event,ctx)=>{
    if(!bridge || event.isTerminal===false) return;
    const state=finalStop==='aborted'?'stopped':finalStop==='error'||finalStop==='length'?'error':finalStop==='stop'?'completed':'unknown';
    pendingEnd={state,turnID:bridge.turns.get(sessionID),reply:state==='completed'?finalMessage:undefined}; finalMessage=undefined;
  });
  pi.on('session_shutdown',()=>{clearInterval(timer);bridge?.close();bridge=undefined;});
}
