import { CapacitorHttp } from '@capacitor/core';
import type * as PiperTts from '@mintplex-labs/piper-tts-web';

import { playBlob, type BlobPlaybackControls } from './blobPlayback';
import type { TtsEngine, TtsSpeakContext, TtsSpeakHandlers } from './types';

/** Piper 中文音色(单女声,medium 质量 ~60-80MB,首次使用时下载并存入 OPFS) */
export const PIPER_VOICE_ID = 'zh_CN-huayan-medium';

/** 模型仓（Piper 官方音色库镜像） */
const MODEL_REPO = 'diffusionstudio/piper-voices';
/** 模型文件源顺序：HF 直连（官方 CDN 固定 CORS，部分网络不可达）→ hf-mirror（国内可达，
 *  但其 /resolve 的 307 在 Chromium cors 模式下复检必败——实测，需经 revision API 走
 *  /api/resolve-cache 直出） */
const MODEL_HF_ORIGIN = `https://huggingface.co/${MODEL_REPO}`;
const MODEL_MIRROR_ORIGIN = 'https://hf-mirror.com';
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

/**
 * 按库的 OPFS 约定写入模型文件：根目录 piper/ 下以模型 URL 尾段（<voiceId>.onnx[.json]）为键。
 * 库未导出 writeBlob（内部实现且强制 HF 域校验），TtsSession/stored() 读取同约定，自写可被识别。
 */
async function writeModelBlobToOpfs(basename: string, blob: Blob): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle('piper', { create: true });
  const file = await dir.getFileHandle(basename, { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
}

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
  // onnxWasm 基座按环境切换：dev 下 Vite 只对 node_modules 的 ?import 模块请求正确伺服
  // （public 静态文件会 500）；生产构建 public/piper-wasm 随 dist 拷入 APK。
  const onnxWasmBase = import.meta.env.DEV ? '/node_modules/onnxruntime-web/dist/' : '/piper-wasm/';
  sessionPromise ??= loadModule()
    .then((tts) =>
      tts.TtsSession.create({
        voiceId: PIPER_VOICE_ID,
        // WASM 本地伺服：库默认 CDN（cdnjs/jsdelivr）在部分网络不可达，
        // 且 node_modules 的 ort JS 版本须与本地 wasm 匹配，防 CDN 版本漂移错配
        wasmPaths: {
          onnxWasm: onnxWasmBase,
          piperData: '/piper-wasm/piper_phonemize.data',
          piperWasm: '/piper-wasm/piper_phonemize.wasm',
        },
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
 *  1) window.fetch 流式（有细粒度进度；受源站 CORS 限制）
 *  2) CapacitorHttp 原生请求（无 CORS 限制，无细粒度进度，经 onIndeterminate 通知） */
type ModelSource = {
  label: string;
  /** 原生兜底通道的直拼 URL 基座（无 CORS，307 也能跟） */
  origin: string;
  /** 解析出 fetch 流式可用的最终 URL；失败时回退 origin 直拼 */
  resolveUrl: (relPath: string, signal: AbortSignal) => Promise<string>;
};

/** hf-mirror：/resolve 307 跳转的 CORS 复检在 Chromium 下必败（本地实测），
 *  经 revision API 拿 sha 后走 /api/resolve-cache 直出（单跳 302 到 CDN，实测可过） */
async function mirrorDirectUrl(relPath: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(`${MODEL_MIRROR_ORIGIN}/api/models/${MODEL_REPO}/revision/main`, {
    signal,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const info = (await res.json()) as { sha?: string };
  if (!info.sha) throw new Error('镜像 revision API 未返回 sha');
  return `${MODEL_MIRROR_ORIGIN}/api/resolve-cache/models/${MODEL_REPO}/${info.sha}/${relPath}`;
}

const MODEL_SOURCES: ModelSource[] = [
  {
    label: 'HF 直连',
    origin: MODEL_HF_ORIGIN,
    resolveUrl: async (relPath) => `${MODEL_HF_ORIGIN}/resolve/main/${relPath}`,
  },
  {
    label: 'hf-mirror',
    origin: `${MODEL_MIRROR_ORIGIN}/${MODEL_REPO}/resolve/main`,
    resolveUrl: mirrorDirectUrl,
  },
];

async function fetchModelFile(
  relPath: string,
  onProgress: (loaded: number, total: number) => void,
  onIndeterminate: () => void
): Promise<Blob> {
  let lastError: unknown = null;
  for (const source of MODEL_SOURCES) {
    const fallbackUrl = `${source.origin}/${relPath}`;
    // 一级：fetch 流式（进度）。mirror 的 sha 解析也在连接超时守护内。
    const controller = new AbortController();
    const connectTimer = setTimeout(() => controller.abort(), MODEL_SOURCE_CONNECT_TIMEOUT_MS);
    let url = fallbackUrl;
    try {
      url = await source.resolveUrl(relPath, controller.signal);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
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
    // 二级：CapacitorHttp 原生请求（WebView 跨源被 CORS 拦截时仍可下载；
    // 原生栈无 CORS 且能跟随 307/302，镜像解析失败时回退 origin 直拼 URL）
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
/**
 * 预下载音色模型并初始化推理会话。
 * 并发调用共享同一次下载；进度经 subscribePiperDownloadProgress 广播。
 * 模型文件自实现多源下载（HF 直连 + hf-mirror 镜像两段式）后按库的 OPFS 约定
 * 写入根目录 piper/（文件名取模型 URL 尾段）——TtsSession 读取同约定，会话初始化即可零网络加载。
 */
export async function preloadPiperModel(): Promise<void> {
  if (activeDownload) return activeDownload;
  activeDownload = (async () => {
    try {
      const tts = await loadModule();
      if (!(await tts.stored()).includes(PIPER_VOICE_ID)) {
        fileCompletion.clear();
        emitProgress(0);
        // 配置文件（.onnx.json，很小）
        const configBlob = await fetchModelFile(`${MODEL_RELATIVE_PATH}.json`, () => undefined, () => emitProgress(PROGRESS_INDETERMINATE));
        await writeModelBlobToOpfs(`${PIPER_VOICE_ID}.onnx.json`, configBlob);
        // 模型（.onnx，数十 MB，进度主要来自这里）
        let modelTotal = 0;
        const modelBlob = await fetchModelFile(MODEL_RELATIVE_PATH, (loaded, total) => {
          modelTotal = total || modelTotal;
          if (modelTotal > 0) {
            const percent = Math.min(MODEL_PROGRESS_RANGE_START + MODEL_PROGRESS_RANGE_SPAN, Math.round(MODEL_PROGRESS_RANGE_START + (loaded / modelTotal) * MODEL_PROGRESS_RANGE_SPAN));
            if (percent > progressPercent) emitProgress(percent);
          }
        }, () => emitProgress(PROGRESS_INDETERMINATE));
        await writeModelBlobToOpfs(`${PIPER_VOICE_ID}.onnx`, modelBlob);
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
  /** 后台预合成产物（文本即缓存键；合成结果与倍速无关，倍速在播放端实现） */
  private prefetch: { text: string; promise: Promise<Blob> } | null = null;
  /** 会话内 predict 串行队列：现场推理与后台预合成共用，杜绝并发 predict（同会话并发无合同） */
  private queue: Promise<unknown> = Promise.resolve();

  isAvailable(): boolean {
    return typeof window !== 'undefined';
  }

  /** 当前分块播放期间后台预合成下一分块，消除块间解析间隙 */
  prepare(text: string): void {
    if (this.prefetch?.text === text) return;
    const promise = this.enqueuePredict(text);
    promise.catch(() => undefined); // 未被消费的预合成失败静默；speak 消费时按原路径报错
    this.prefetch = { text, promise };
  }

  speak(text: string, ctx: TtsSpeakContext, handlers: TtsSpeakHandlers): void {
    const token = ++this.tokenRef;
    void this.speakAsync(text, ctx, handlers, token);
  }

  /** 排入串行队列执行一次推理；队列吞掉前置失败，本结果照常 reject 给调用方 */
  private enqueuePredict(text: string): Promise<Blob> {
    const result = this.queue.then(() => this.predictWav(text));
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async predictWav(text: string): Promise<Blob> {
    // 若预下载正在进行，等它完成再建会话，避免并发重复下载；
    // 模型缺失时先经多源下载补齐，再建会话（库内直连 HF 在部分网络必失败）
    await ensureModelReady();
    const session = await createSession();
    return session.predict(text);
  }

  private async speakAsync(
    text: string,
    ctx: TtsSpeakContext,
    handlers: TtsSpeakHandlers,
    token: number
  ): Promise<void> {
    try {
      // 命中同文本预合成产物则直接取用，否则现场推理（同样走串行队列）
      const prefetch = this.prefetch?.text === text ? this.prefetch.promise : null;
      this.prefetch = null;
      const wav = await (prefetch ?? this.enqueuePredict(text));
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
    this.prefetch = null;
  }
}
