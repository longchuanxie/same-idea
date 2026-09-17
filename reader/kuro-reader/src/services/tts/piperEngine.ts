import { CapacitorHttp } from '@capacitor/core';
import type * as PiperTts from '@mintplex-labs/piper-tts-web';

import { playBlob, type BlobPlaybackControls } from './blobPlayback';
import type { TtsEngine, TtsSpeakContext, TtsSpeakHandlers } from './types';

/** Piper 中文音色(单女声,medium 质量 ~60-80MB,首次使用时下载并存入 OPFS) */
export const PIPER_VOICE_ID = 'zh_CN-huayan-medium';

/** 库的类型声明遗漏了 opfs 写入接口，运行时确实导出（存储键按 URL 文件名推导） */
type PiperOpfsWriter = {
  writeBlob: (url: string, blob: Blob) => Promise<void>;
};

/** 模型文件源：HuggingFace 直连在部分网络不可达（fetch failed），自动切换镜像 */
const MODEL_SOURCE_ORIGINS = [
  'https://huggingface.co/diffusionstudio/piper-voices/resolve/main',
  'https://hf-mirror.com/diffusionstudio/piper-voices/resolve/main',
];
/** 模型相对路径（与库内 PATH_MAP[voiceId] 一致） */
const MODEL_RELATIVE_PATH = 'zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx';
/** 单源连接超时：超时未响应即切换下一源（进入流式读取后不再限时） */
const MODEL_SOURCE_CONNECT_TIMEOUT_MS = 12000;
/** 模型体进度映射到 5-95% 区间（0% 留给开始、100% 只在写入 OPFS 完成后发出） */
const MODEL_PROGRESS_RANGE_START = 5;
const MODEL_PROGRESS_RANGE_SPAN = 90;
/** 原生通道下载读取超时（大文件走慢速镜像时放宽） */
const MODEL_DOWNLOAD_READ_TIMEOUT_MS = 600000;
/** 进度值：-2 = 原生通道下载中（无细粒度进度）；-1 = 空闲 */
export const PROGRESS_INDETERMINATE = -2;

/** 订阅方口径：>=0 原样百分比；-2 不确定态原样透传；其余（-1 空闲）返回 null 表示不显示 */
export function normalizePiperDownloadPercent(percent: number): number | null {
  if (percent >= 0) return percent;
  return percent === PROGRESS_INDETERMINATE ? PROGRESS_INDETERMINATE : null;
}

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

/** 确保模型已就绪：缺失时（如取消过确认框后直接启用）走多源下载补齐 */
async function ensureModelReady(): Promise<void> {
  if (activeDownload) {
    await activeDownload;
    return;
  }
  if (!(await piperModelStored())) {
    await preloadPiperModel();
  }
}

/** 按源顺序拉取模型文件。每源两级尝试：
 *  1) window.fetch 流式（有细粒度进度，但受源站 CORS 限制——hf-mirror 不带 ACAO 头会失败）
 *  2) CapacitorHttp 原生请求（无 CORS 限制，无细粒度进度，经 onIndeterminate 通知） */
async function fetchModelFile(
  relPath: string,
  onProgress: (loaded: number, total: number) => void,
  onIndeterminate: () => void
): Promise<Blob> {
  let lastError: unknown = null;
  for (const origin of MODEL_SOURCE_ORIGINS) {
    const url = `${origin}/${relPath}`;
    // 一级：fetch 流式（进度）
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), MODEL_SOURCE_CONNECT_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      clearTimeout(connectTimer);
      const total = Number(res.headers.get('Content-Length') ?? 0);
      const reader = res.body?.getReader();
      if (reader) {
        const chunks: BlobPart[] = [];
        let loaded = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          if (total > 0) onProgress(loaded, total);
        }
        return new Blob(chunks);
      }
      return new Blob([await res.arrayBuffer()]);
    } catch (error) {
      clearTimeout(connectTimer);
      lastError = error;
    }
    // 二级：CapacitorHttp 原生请求（WebView 跨源被 CORS 拦截时仍可下载）
    try {
      onIndeterminate();
      const res = await CapacitorHttp.get({ url, responseType: 'arraybuffer', connectTimeout: MODEL_SOURCE_CONNECT_TIMEOUT_MS, readTimeout: MODEL_DOWNLOAD_READ_TIMEOUT_MS });
      return new Blob([res.data as ArrayBuffer]);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('模型源全部不可达');
}

/**
 * 预下载音色模型并初始化推理会话。
 * 并发调用共享同一次下载；进度经 subscribePiperDownloadProgress 广播。
 * 模型文件自实现多源下载（HF 直连 + hf-mirror 镜像）后经库 writeBlob 落入
 * OPFS——库按文件名存取，写入端不限制字节来源，会话初始化即可零网络加载。
 */
export async function preloadPiperModel(): Promise<void> {
  if (activeDownload) return activeDownload;
  activeDownload = (async () => {
    try {
      const tts = await loadModule();
      if (!(await tts.stored()).includes(PIPER_VOICE_ID)) {
        const modelOriginUrl = (file: string) => `${MODEL_SOURCE_ORIGINS[0]}/${MODEL_RELATIVE_PATH}${file}`;
        fileCompletion.clear();
        emitProgress(0);
        // 配置文件（.onnx.json，很小）
        const configBlob = await fetchModelFile(`${MODEL_RELATIVE_PATH}.json`, () => undefined, () => emitProgress(PROGRESS_INDETERMINATE));
        await (tts as PiperModule & PiperOpfsWriter).writeBlob(modelOriginUrl('.json'), configBlob);
        // 模型（.onnx，数十 MB，进度主要来自这里）
        let modelTotal = 0;
        const modelBlob = await fetchModelFile(MODEL_RELATIVE_PATH, (loaded, total) => {
          modelTotal = total || modelTotal;
          if (modelTotal > 0) {
            const percent = Math.min(MODEL_PROGRESS_RANGE_START + MODEL_PROGRESS_RANGE_SPAN, Math.round(MODEL_PROGRESS_RANGE_START + (loaded / modelTotal) * MODEL_PROGRESS_RANGE_SPAN));
            if (percent > progressPercent) emitProgress(percent);
          }
        }, () => emitProgress(PROGRESS_INDETERMINATE));
        await (tts as PiperModule & PiperOpfsWriter).writeBlob(modelOriginUrl(''), modelBlob);
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

/** 订阅音色包下载进度（订阅即回放当前进度；-2 = 原生通道下载无细粒度进度；-1 = 无下载）；返回退订函数 */
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
      // 若预下载正在进行，等它完成再建会话，避免并发重复下载；
      // 模型缺失时先经多源下载补齐，再建会话（库内直连 HF 在部分网络必失败）
      await ensureModelReady();
      const session = await createSession();
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
