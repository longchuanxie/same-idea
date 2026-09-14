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

// ===== 音色包下载：去重 + 进度广播 =====

/** 进行中的预下载（并发触发共享同一次下载） */
let activeDownload: Promise<void> | null = null;
/** 完成前进度封顶值：100 只在下载真正结束（emitProgress(100)）时发出 */
const DOWNLOAD_PRE_COMPLETE_CAP = 95;
/** 下载进度百分比 0-100；-1 表示当前没有下载在进行 */
let progressPercent = -1;
const progressListeners = new Set<(percent: number) => void>();
/** 各文件完成度（模型 .onnx 为主件，附 .json 很小） */
const fileCompletion = new Map<string, number>();

function emitProgress(percent: number): void {
  progressPercent = percent;
  progressListeners.forEach((listener) => listener(percent));
}

/** 单文件进度 → 汇总百分比（多文件平均，只前进不回退，完成前封顶 95） */
function emitFileProgress(url: string, total: number, loaded: number): void {
  fileCompletion.set(url, total > 0 ? loaded / total : 0);
  let sum = 0;
  for (const value of fileCompletion.values()) sum += value;
  const percent = Math.min(DOWNLOAD_PRE_COMPLETE_CAP, Math.round((sum / Math.max(1, fileCompletion.size)) * 100));
  if (percent > progressPercent) emitProgress(percent);
}

/** 创建推理会话(模型已在 OPFS 时直接加载);失败后清空缓存以便重试 */
function createSession(): Promise<PiperSession> {
  sessionPromise ??= loadModule()
    .then((tts) =>
      tts.TtsSession.create({
        voiceId: PIPER_VOICE_ID,
        // 会话初始化若仍需取模型（如朗读时自动重试路径），进度同样汇入广播
        progress: (progress) => emitFileProgress(progress.url, progress.total, progress.loaded),
      })
    )
    .catch((error) => {
      sessionPromise = null;
      throw error;
    });
  return sessionPromise;
}

/**
 * 预下载音色模型并初始化推理会话。
 * 并发调用共享同一次下载；进度经 subscribePiperDownloadProgress 广播。
 */
export async function preloadPiperModel(): Promise<void> {
  if (activeDownload) return activeDownload;
  activeDownload = (async () => {
    try {
      const tts = await loadModule();
      if (!(await tts.stored()).includes(PIPER_VOICE_ID)) {
        fileCompletion.clear();
        emitProgress(0);
        await tts.download(PIPER_VOICE_ID, (progress) =>
          emitFileProgress(progress.url, progress.total, progress.loaded)
        );
        emitProgress(100);
      }
      await createSession();
    } finally {
      activeDownload = null;
      emitProgress(-1);
    }
  })();
  return activeDownload;
}

/** 当前是否正在下载音色包（下载中不再重复弹确认框） */
export function isPiperDownloading(): boolean {
  return activeDownload != null;
}

/** 订阅音色包下载进度（订阅即回放当前进度；-1 = 无下载）；返回退订函数 */
export function subscribePiperDownloadProgress(listener: (percent: number) => void): () => void {
  progressListeners.add(listener);
  listener(progressPercent);
  return () => {
    progressListeners.delete(listener);
  };
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
      // 若预下载正在进行，等它完成再建会话，避免并发重复下载
      const session = await (activeDownload ?? Promise.resolve()).then(createSession);
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
