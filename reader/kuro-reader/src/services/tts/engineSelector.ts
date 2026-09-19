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

/** 神经网络引擎在任何浏览器环境可用（WASM/模型在 speak 时按需加载），移动端最稳的兜底 */
export function isNeuralSupported(): boolean {
  return typeof window !== 'undefined';
}

function getAutoEngine(): TtsEngine {
  // 可用性链：App 内 WebView 无 Web Speech → 系统语音引擎（Android 系统 TTS）；
  // 浏览器连 speechSynthesis 都没有（少数国产内核）→ 神经网络离线语音兜底
  if (isNativeTtsAvailable()) return getNativeEngine();
  if (isWebSpeechSupported()) return getSystemEngine();
  return getPiperEngine();
}

/**
 * 解析可用的 TTS 引擎。
 * 不可用的设置(空服务地址、Web 端选系统语音引擎等)静默降级到 auto 语义;
 * 引擎实例全部轻量构造,重资源由引擎内部在 speak 时动态加载。
 */
export function resolveEngine(config: TtsEngineConfig): TtsEngine {
  switch (config.engine) {
    case 'system':
      // 安卓 WebView 即使暴露 speechSynthesis 也无声（实测），按不支持处理回退 auto 链
      return isWebSpeechSupported() && !isNativeTtsAvailable() ? getSystemEngine() : getAutoEngine();
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
