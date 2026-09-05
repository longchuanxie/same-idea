import type * as PiperTts from '@mintplex-labs/piper-tts-web';

import { playBlob, type BlobPlaybackControls } from './blobPlayback';
import type { TtsEngine, TtsSpeakContext, TtsSpeakHandlers } from './types';

/** Piper 中文音色(单女声,medium 质量 ~60-80MB,首次使用时下载并存入 OPFS) */
export const PIPER_VOICE_ID = 'zh_CN-huayan-medium';

type PiperModule = typeof PiperTts;
type PiperSession = InstanceType<PiperModule['TtsSession']>;

let modulePromise: Promise<PiperModule> | null = null;
let sessionPromise: Promise<PiperSession> | null = null;

function loadModule(): Promise<PiperModule> {
  modulePromise ??= import('@mintplex-labs/piper-tts-web');
  return modulePromise;
}

/** 复用推理会话:模型加载/worker 启动只发生一次;失败后清空缓存以便重试 */
function getSession(): Promise<PiperSession> {
  sessionPromise ??= loadModule()
    .then((tts) => tts.TtsSession.create({ voiceId: PIPER_VOICE_ID }))
    .catch((error) => {
      sessionPromise = null;
      throw error;
    });
  return sessionPromise;
}

/**
 * 预下载音色模型并初始化推理会话(复用 getSession,不阻塞调用方之外的状态)。
 * 供设置确认后立即触发下载,避免用户被反复提示"需要下载"。
 */
export async function preloadPiperModel(): Promise<void> {
  await getSession();
}

/** 音色模型是否已缓存到本机(OPFS),供设置 UI 提示是否需要下载 */
export async function piperModelStored(): Promise<boolean> {
  try {
    const tts = await loadModule();
    const stored = await tts.stored();
    return stored.includes(PIPER_VOICE_ID);
  } catch {
    return false;
  }
}

/**
 * 神经网络引擎:Piper WASM 本地推理(浏览器 Worker 线程),离线可用。
 * 合成无语速参数,倍速经播放倍速实现。
 */
export class PiperEngine implements TtsEngine {
  readonly id = 'neural' as const;
  readonly label = '神经网络';
  private tokenRef = 0;
  private playback: BlobPlaybackControls | null = null;

  isAvailable(): boolean {
    return typeof window !== 'undefined';
  }

  speak(text: string, ctx: TtsSpeakContext, handlers: TtsSpeakHandlers): void {
    const token = ++this.tokenRef;
    void this.speakAsync(text, ctx, handlers, token);
  }

  private async speakAsync(
    text: string,
    ctx: TtsSpeakContext,
    handlers: TtsSpeakHandlers,
    token: number
  ): Promise<void> {
    try {
      const session = await getSession();
      if (token !== this.tokenRef) return;
      const wav = await session.predict(text);
      if (token !== this.tokenRef) return;
      this.playback = playBlob(wav, ctx, {
        onDone: () => {
          this.playback = null;
          handlers.onDone();
        },
        onError: (error) => {
          this.playback = null;
          handlers.onError(error);
        },
      }, () => token !== this.tokenRef);
    } catch (error) {
      if (token !== this.tokenRef) return;
      handlers.onError(error instanceof Error ? error : new Error('神经网络语音合成失败'));
    }
  }

  pause(): void {
    this.playback?.pause();
  }

  resume(): void {
    this.playback?.resume();
  }

  cancel(): void {
    this.tokenRef += 1;
    this.playback?.stop();
    this.playback = null;
  }

  dispose(): void {
    this.cancel();
  }
}
