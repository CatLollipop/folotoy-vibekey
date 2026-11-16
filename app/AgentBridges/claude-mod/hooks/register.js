// Claude Code 官方 Mod API。只在加载本插件的原 CLI 会话发送/停止，不读历史或控制窗口。
// process.run 仅运行私有文件邮箱助手；模型输入始终调用原进程的 $.prompt.submit。
async function call($, state, operation, fields={}) {
  const result=await $.process.run(['/usr/bin/env','node',`${$.plugin.root}/hooks/mailbox-helper.mjs`], {
    stdin:JSON.stringify({operation,instanceID:state.instanceID,sessionID:state.sessionID,nativePID:state.nativePID,...fields}),timeoutMs:3000,
  });
  if(result.exitCode!==0 || result.isStdoutTruncated) throw new Error('Private bridge helper failed');
  return JSON.parse(result.stdout);
}
async function emit($, state, value, turnID, reply) {
  if(!state.instanceID || state.ended)return;
  await call($,state,'event',{state:value,turnID,reply,sequence:++state.sequence});
}
export function register(on) {
  const state={instanceID:undefined,sessionID:undefined,ended:false,nativePID:undefined,sequence:0};
  let timer,busy=false,activeTurn;
  on('session.start',async($,e,next)=>{
    const result=await next(e);
    if(!e.isInteractive)return result; // 不把 SDK/-p 或子进程当作可控制的用户原会话。
    try {
      state.sessionID=await $.session.id();
      const context=await $.process.hookEnv();
      const nativePID=Number(context.CLAUDE_PID);
      if(context.CLAUDE_CODE_SESSION_ID!==state.sessionID || !Number.isSafeInteger(nativePID) || nativePID<=0)throw new Error('Native CLI identity unavailable');
      state.nativePID=nativePID;
      const initialized=await call($,state,'init');state.instanceID=initialized.instanceID;state.ended=false;
      timer=$.clock.every(500,async()=>{
        if(state.ended)return;
        if(busy){try{await call($,state,'heartbeat');}catch{}return;}busy=true;
        try {
          if(await $.session.id()!==state.sessionID)throw new Error('Original session changed');
          const {request}=await call($,state,'tick');if(!request)return;
          let status='applied',error,invoked=false,refused=false;
          try {
            if(request.sessionID!==state.sessionID || request.instanceID!==state.instanceID || await $.session.id()!==state.sessionID)throw new Error('Original session changed');
            if(request.operation==='sendPrompt') {
              invoked=true;const admitted=await $.prompt.submit({text:request.text,asUser:true});
              if('drop' in admitted){refused=true;throw new Error('Original session declined the prompt');}
              if(typeof admitted.text!=='string' || await $.session.id()!==state.sessionID){status='deliveryUnknown';error='Missing same-session native prompt admission';}
            } else if(request.operation==='stop') {
              if(!activeTurn)throw new Error('No running native turn');
              invoked=true;await $.turn.abort({turnId:activeTurn});
            } else throw new Error('Unsupported operation');
          } catch(failure) {
            // 调用后抛错无法证明未投递；拒绝结果可确定，其他错误保持未知且绝不自动重试。
            const message=String(failure?.message||failure);
            status=!invoked||refused?'failed':'deliveryUnknown';
            error=message.slice(0,200);
          }
          await call($,state,'receipt',{requestID:request.requestID,status,error});
        } catch { /* 心跳失效即撤销控制能力，不影响宿主会话。 */ }
        finally {busy=false;}
      });
    } catch { state.instanceID=undefined; }
    return result;
  });
  on('turn.start',async($,e,next)=>{
    if(e.agentId===undefined){activeTurn=e.turnId;try{await emit($,state,'thinking',e.turnId);}catch{}}
    return next(e);
  });
  on('turn.complete',async($,e,next)=>{
    const result=await next(e);
    if(e.agentId===undefined){
      const completion=e.isAborted||e.reason==='aborted'?'stopped':e.reason==='answer'?'completed':'error';
      // 官方 answer 是本轮最终可见正文，不读取整个 transcript，不包含思考或工具日志。
      const reply=completion==='completed' && typeof e.answer==='string' && e.answer.trim()
        ?{messageID:e.turnId,text:e.answer.slice(0,32000),isFinal:true}:undefined;
      try{await emit($,state,completion,e.turnId,reply);}catch{}
      if(activeTurn===e.turnId)activeTurn=undefined;
    }
    return result;
  });
  on('session.end',async($,e,next)=>{
    state.ended=true;timer?.cancel();
    if(state.instanceID){try{await call($,state,'close');}catch{}}
    return next(e);
  });
}
