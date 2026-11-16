// 原进程扩展共用的私有文件邮箱；没有执行任意代码或任意文件路径的命令。
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const defaultRoot = () => process.env.VIBEKEY_BRIDGE_ROOT || path.join(os.homedir(), 'Library/Application Support/FoloButtonDev/AgentBridge');
const safeComponent = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
export function privateDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(directory);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.uid !== process.getuid()) throw new Error('Unsafe mailbox directory');
  fs.chmodSync(directory, 0o700);
}
export function writePrivate(file, value) {
  const bytes = JSON.stringify(value);
  if (Buffer.byteLength(bytes) > 262144) throw new Error('Mailbox message too large');
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  fs.writeFileSync(temporary, bytes, { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, file);
}

export class Mailbox {
  constructor(adapterID, name, { root = defaultRoot(), instanceID = crypto.randomUUID() } = {}) {
    if (!safeComponent(adapterID) || !safeComponent(instanceID)) throw new Error('Invalid bridge identity');
    this.adapterID = adapterID; this.name = name; this.root = root; this.instanceID = instanceID;
    this.instance = path.join(root, 'instances', instanceID);
    this.requests = path.join(this.instance, 'requests'); this.responses = path.join(this.instance, 'responses');
    this.events = path.join(root, 'events'); this.sequence = 0; this.busy = false; this.turns = new Map();
    for (const directory of [root, path.join(root, 'instances'), this.instance, this.requests, this.responses, this.events]) privateDirectory(directory);
  }
  session(sessionID, name) { return { applicationID: this.adapterID, instanceID: this.instanceID, sessionID: String(sessionID), name: String(name).slice(0,200) }; }
  register(sessions, capabilities) {
    this.sessions = sessions;
    const signature=JSON.stringify({sessions,capabilities});
    if(signature===this.registrationSignature && Date.now()-(this.registrationWrittenAt||0)<2000)return;
    this.registrationSignature=signature;this.registrationWrittenAt=Date.now();
    writePrivate(path.join(this.instance, 'registration.json'), {
      protocolVersion: 1, adapterID: this.adapterID, instanceID: this.instanceID, name: this.name,
      sessions, capabilities, processID: process.pid, updatedAt: Date.now()/1000,
    });
  }
  emit(sessionID, state, { turnID = this.turns.get(sessionID) || 'live', reply, eventID = crypto.randomUUID() } = {}) {
    const sequence = ++this.sequence;
    writePrivate(path.join(this.events, Date.now().toString().padStart(16,'0') + '-' + crypto.randomUUID() + '.json'), {
      event: { applicationID: this.adapterID, instanceID: this.instanceID, sessionID: String(sessionID),
        turnID: String(turnID), eventID, sequence, state, timestamp: Date.now()/1000 }, reply,
    });
  }
  async drain(handler) {
    if (this.busy) return;
    this.busy = true;
    try {
      for (const name of fs.readdirSync(this.requests).filter(n => /^[A-Za-z0-9_-]+\.json$/.test(n)).slice(0,32)) {
        const file = path.join(this.requests, name); let request;
        try {
          const stat = fs.lstatSync(file);
          if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== process.getuid() || stat.size > 262144) continue;
          request = JSON.parse(fs.readFileSync(file, 'utf8'));
          if (!safeComponent(request.requestID) || name !== request.requestID + '.json' || request.instanceID !== this.instanceID) continue;
          const response = path.join(this.responses, name);
          // 最终回执持久保存到Swift消费，重复请求绝不再次执行。
          if (fs.existsSync(response)) continue;
          if (!(request.expiresAt > Date.now()/1000) || request.expiresAt > Date.now()/1000+30) throw new Error('Command expired');
          if (!this.sessions?.some(s => s.sessionID === request.sessionID)) throw new Error('Original session changed');
          if (!['activate','insertDraft','submit','sendPrompt','stop'].includes(request.operation)) throw new Error('Unsupported operation');
          if (request.text != null && (typeof request.text !== 'string' || Buffer.byteLength(request.text)>64000)) throw new Error('Invalid prompt');
          writePrivate(response, {requestID:request.requestID,status:'accepted'});
          try {
            await handler(request);
            writePrivate(response, {requestID:request.requestID,status:'applied'});
          } catch(error) {
            writePrivate(response, {requestID:request.requestID,status:error?.code==='DELIVERY_UNKNOWN'?'deliveryUnknown':'failed',error:String(error?.message || error).slice(0,300)});
          }
        } catch(error) {
          if (request && safeComponent(request.requestID)) writePrivate(path.join(this.responses,request.requestID+'.json'), {requestID:request.requestID,status:'failed',error:String(error?.message || error).slice(0,300)});
        } finally { try { fs.unlinkSync(file); } catch {} }
      }
      // 超过10分钟的孤立正文不保留；正常情况下Swift读取后立即删除。
      for (const name of fs.readdirSync(this.events).slice(0,1024)) {
        const file=path.join(this.events,name); const stat=fs.lstatSync(file);
        if(stat.isFile() && !stat.isSymbolicLink() && Date.now()-stat.mtimeMs>600000) fs.unlinkSync(file);
      }
    } finally { this.busy=false; }
  }
  close() { try { fs.unlinkSync(path.join(this.instance,'registration.json')); } catch {} }
}
