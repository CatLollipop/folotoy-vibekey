// DeepSeek Harness原生Cordis Host插件。仅使用ctx.agents中现有的主会话，绝不resume/新建。
import { Mailbox } from './mailbox.mjs';
export function createBridgePlugin(createUserMessage) { return function apply(ctx) {
  const bridge=new Mailbox('deepseekHarness','DeepSeek Harness');
  const live=()=>ctx.agents.list().filter(agent=>agent.session?.meta?.origin!=='subagent' && agent.session?.header?.origin!=='subagent');
  const sessionID=agent=>String(agent.session?.id || agent.id);
  const current=new Map();
  const replies=new Map();
  const publish=()=>bridge.register(live().map(agent=>bridge.session(sessionID(agent),'DeepSeek · '+sessionID(agent).slice(0,12))),
    ['discover','activate','submit','stop','observeState','readReply']);
  const timer=setInterval(async()=>{
    try {
      publish();
      await bridge.drain(async request=>{
        const agent=live().find(item=>sessionID(item)===request.sessionID);
        if(!agent) throw new Error('Original Desktop session is no longer live');
        if(request.operation==='activate') return;
        if(request.operation==='sendPrompt') {
          // 原生Agent接口跨当前release/master稳定；不依赖发生过ABI变化的sessionController.prompt第二参数。
          const message=createUserMessage({content:[{type:'text',text:request.text}],source:{kind:'user',rpcId:request.requestID}});
          agent.followup(message); return;
        }
        if(request.operation==='stop') { agent.cancel({kind:'user'},{keepInbox:true}); return; }
        throw new Error('DSH has no native draft API; use direct send');
      });
    } catch { /* 插件不能让原Agent失败；桌面将根据心跳报告连接问题。 */ }
  },200); timer.unref?.(); publish();
  ctx.on('session/event',(session,event)=>{
    if(!live().some(agent=>sessionID(agent)===String(session.id))) return;
    const id=String(session.id), data=event.data;
    if(event.type==='turn/start') {current.set(id,String(data.turn));replies.delete(id);bridge.emit(id,'thinking',{turnID:String(data.turn)});}
    if(event.type==='tool/call') bridge.emit(id,/ask[_-]?user[_-]?question/i.test(data.name)?'waitingInput':/search/i.test(data.name)?'searching':'working',{turnID:String(data.turn)});
    if(event.type==='approval/asked') bridge.emit(id,'waitingInput',{turnID:current.get(id)||'live'});
    if(event.type==='approval/decided') bridge.emit(id,'working',{turnID:current.get(id)||'live'});
    if(event.type==='assistant/message' && !data.interrupted) {
      const content=data.message?.content;
      if(Array.isArray(content)) {
        const text=content.filter(part=>part.type==='text' && typeof part.text==='string').map(part=>part.text).join('\n');
        if(text.trim()) replies.set(id,{text:text.slice(0,32000),messageID:String(event.seq),isFinal:true});
      }
    }
    if(event.type==='turn/end') {
      const reason=data.reason?.kind;
      bridge.emit(id,reason==='completed'?'completed':reason==='aborted'?'stopped':'error',{
        turnID:String(data.turn),eventID:'session-event-'+event.seq,
        reply:reason==='completed'?replies.get(id):undefined}); replies.delete(id);
    }
  });
  ctx.on('agent/error',({agent,turn})=>bridge.emit(sessionID(agent),'error',{turnID:String(turn)}));
  ctx.on('dispose',()=>{clearInterval(timer);bridge.close();});
}; }
