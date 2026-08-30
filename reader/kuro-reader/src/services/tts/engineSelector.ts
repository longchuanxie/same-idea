import { NativeTtsEngine, isNativeTtsAvailable } from './nativeTtsEngine';
import { PiperEngine } from './piperEngine';
import { ServerTtsEngine } from './serverTtsEngine';
import type { TtsEngine, TtsEngineSetting } from './types';
import { WebSpeechEngine, isWebSpeechSupported } from './webSpeechEngine';

export type { TtsEngineSetting } from './types';

export interface TtsEngineConfig {
  engine: TtsEngineSetting;
  serverUrl: string;
  serverModel: string;
  serverVoice: string;
}

let systemEngine: WebSpeechEngine | null = null;
let nativeEngine: NativeTtsEngine | null = null;
let piperEngine: PiperEngine | null = null;

function getSystemEngine(): TtsEngine {
  systemEngine ??= new WebSpeechEngine();
  return systemEngine;
}

function getNativeEngine(): TtsEngine {
  nativeEngine ??= new NativeTtsEngine();
  return nativeEngine;
}

function getPiperEngine(): TtsEngine {
  piperEngine ??= new PiperEngine();
  return piperEngine;
}

function getAutoEngine(): TtsEngine {
  // 原生环境(安卓 WebView)不支持 Web Speech,必须走设备语音
  return isNativeTtsAvailable() ? getNativeEngine() : getSystemEngine();
}

/**
 * 解析可用的 TTS 引擎。
 * 不可用的设置(空服务地址、Web 端选设备语音等)静默降级到 auto 语义;
 * 引擎实例全部轻量构造,重资源由引擎内部在 speak 时动态加载。
 */
export function resolveEngine(config: TtsEngineConfig): TtsEngine {
  switch (config.engine) {
    case 'system':
      return isWebSpeechSupported() ? getSystemEngine() : getAutoEngine();
    case 'native':
      return isNativeTtsAvailable() ? getNativeEngine() : getAutoEngine();
    case 'neural':
      return getPiperEngine();
    case 'server': {
      const server = new ServerTtsEngine({
        url: config.serverUrl,
        model: config.serverModel,
        voice: config.serverVoice,
      });
      return server.isAvailable() ? server : getAutoEngine();
    }
    case 'auto':
    default:
      return getAutoEngine();
  }
}
