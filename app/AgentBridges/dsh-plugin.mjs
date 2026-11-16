// 正式宿主包负责创建合法UserMessage；生命周期逻辑单独做可运行协议测试。
import {createUserMessage} from '@deepseek-ai/dsh-llm';
import {createBridgePlugin} from './dsh-bridge.mjs';
export const name='vibekey-assistant-bridge';
export const inject=['agents'];
export const apply=createBridgePlugin(createUserMessage);
