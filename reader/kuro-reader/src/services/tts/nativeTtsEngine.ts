import { Capacitor } from '@capacitor/core';

import { TtsCancelledError, TtsUnavailableError, type TtsEngine, type TtsSpeakContext, type TtsSpeakHandlers } from './types';

interface NativeTtsPlugin {
  speak(options: { text: string; lang?: string; rate?: number; pitch?: number; volume?: number }): Promise<void>;
  stop(): Promise<void>;
  pause?: () => Promise<void>;
  resume?: () => Promise<void>;
}

/** 引擎初始化中的拒绝特征：插件侧 TTS 引擎异步初始化未完成（App 冷启动后头几秒）或设备根本没有引擎 */
const UNAVAILABLE_CODE = 'UNAVAILABLE';
const UNAVAILABLE_MESSAGE = 'Not yet initialized or not available';
/** 引擎初始化宽限窗口：真机冷启动即点喇叭时引擎可能仍在初始化,窗口内按 400ms 重试而非判死 */
const INIT_GRACE_MS = 5000;
const INIT_RETRY_INTERVAL_MS = 400;

function isUnavailableRejection(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  if (code === UNAVAILABLE_CODE) return true;
  return error instanceof Error && error.message.includes(UNAVAILABLE_MESSAGE);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let pluginPromise: Promise<{ plugin: NativeTtsPlugin | null } | null> | null = null;

/**
 * 插件导出的 TextToSpeech 是 Capacitor 代理：任何属性访问（含 then）都返回桥接包装函数。
 * 它一旦作为 Promise 决议值流转，引擎会把它当 thenable 采纳并调用 proxy.then——该调用
 * 永不回调（内层另抛 "then() is not implemented"），链路将永久挂死。故用容器对象包住流转。
 */
function loadPlugin(): Promise<{ plugin: NativeTtsPlugin | null } | null> {
  pluginPromise ??= import('@capacitor-community/text-to-speech')
    .then((module) => ({ plugin: (module.TextToSpeech ?? null) as NativeTtsPlugin | null }))
    .catch(() => null);
  return pluginPromise;
}

/** 安卓 WebView 不支持 Web Speech API,原生引擎（系统 TTS）是移动端唯一路径 */
export function isNativeTtsAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * 系统语音引擎（Capacitor 插件,走 Android 系统 TTS 引擎）。
 * - speak 前的旧播报由插件 Flush 队列语义清空（等价于「新一轮先 stop」防抢话）
 * - 引擎初始化中的 speak 拒绝在宽限窗口内重试;窗口外仍不可用归一为 TtsUnavailableError
 * - 插件无 pause/resume API 时降级:暂停=停止并记住当前分块,恢复=整块重播(分块 ≤200 字,代价可接受)
 */
export class NativeTtsEngine implements TtsEngine {
  readonly id = 'native' as const;
  readonly label = '系统语音';
  private tokenRef = 0;
  private plugin: NativeTtsPlugin | null = null;
  private current: { text: string; ctx: TtsSpeakContext; handlers: TtsSpeakHandlers } | null = null;

  isAvailable(): boolean {
    return isNativeTtsAvailable();
  }

  speak(text: string, ctx: TtsSpeakContext, handlers: TtsSpeakHandlers): void {
    const token = ++this.tokenRef;
    this.current = { text, ctx, handlers };
    void this.speakAsync(text, ctx, handlers, token);
  }

  private async speakAsync(
    text: string,
    ctx: TtsSpeakContext,
    handlers: TtsSpeakHandlers,
    token: number
  ): Promise<void> {
    const holder = await loadPlugin();
    if (token !== this.tokenRef) return;
    const plugin = holder?.plugin ?? null;
    this.plugin = plugin;
    if (!plugin) {
      handlers.onError(new Error('系统语音插件加载失败'));
      return;
    }
    // 插件无起播事件：调用即视为已起播（设备缺 TTS 引擎时 speak 会立即 reject,走 onError）
    handlers.onStart?.();
    const graceDeadline = Date.now() + INIT_GRACE_MS;
    for (;;) {
      try {
        await plugin.speak({ text, lang: ctx.lang, rate: ctx.rate });
        if (token !== this.tokenRef) return;
        this.current = null;
        handlers.onDone();
        return;
      } catch (error) {
        if (token !== this.tokenRef) return;
        // 初始化中的拒绝在宽限窗口内重试;窗口外仍不可用判终态,出路走 TtsUnavailableError
        if (isUnavailableRejection(error) && Date.now() < graceDeadline) {
          await delay(INIT_RETRY_INTERVAL_MS);
          if (token !== this.tokenRef) return;
          continue;
        }
        this.current = null;
        if (isUnavailableRejection(error)) {
          handlers.onError(new TtsUnavailableError('本机没有可用的系统语音引擎,可在系统设置的「文字转语音」中安装或启用后重试'));
          return;
        }
        // 插件在 stop() 后可能 reject,已 cancel 的会话由令牌拦截;显式中止归一为取消
        handlers.onError(error instanceof Error && error.message ? error : new TtsCancelledError());
        return;
      }
    }
  }

  pause(): void {
    const plugin = this.plugin;
    if (!plugin) return;
    if (plugin.pause) {
      void plugin.pause();
      return;
    }
    const current = this.current;
    this.tokenRef += 1;
    this.current = null;
    void plugin.stop();
    if (current) this.current = current; // 保留供 resume 重播
  }

  resume(): void {
    const plugin = this.plugin;
    if (!plugin) return;
    if (plugin.resume) {
      void plugin.resume();
      return;
    }
    const current = this.current;
    if (!current) return;
    this.current = null;
    this.speak(current.text, current.ctx, current.handlers);
  }

  cancel(): void {
    this.tokenRef += 1;
    this.current = null;
    void this.plugin?.stop().catch(() => undefined);
  }

  dispose(): void {
    this.cancel();
  }
}
