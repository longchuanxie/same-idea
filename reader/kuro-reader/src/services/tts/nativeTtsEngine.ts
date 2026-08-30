import { Capacitor } from '@capacitor/core';

import { TtsCancelledError, type TtsEngine, type TtsSpeakContext, type TtsSpeakHandlers } from './types';

interface NativeTtsPlugin {
  speak(options: { text: string; lang?: string; rate?: number; pitch?: number; volume?: number }): Promise<void>;
  stop(): Promise<void>;
  pause?: () => Promise<void>;
  resume?: () => Promise<void>;
}

let pluginPromise: Promise<NativeTtsPlugin | null> | null = null;

function loadPlugin(): Promise<NativeTtsPlugin | null> {
  pluginPromise ??= import('@capacitor-community/text-to-speech')
    .then((module) => (module.TextToSpeech ?? null) as NativeTtsPlugin | null)
    .catch(() => null);
  return pluginPromise;
}

/** 安卓 WebView 不支持 Web Speech API,原生引擎是移动端唯一路径 */
export function isNativeTtsAvailable(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * 原生 TTS 引擎(Capacitor 插件,走系统 TTS 引擎)。
 * 插件无 pause/resume API 时降级:暂停=停止并记住当前分块,恢复=整块重播(分块 ≤200 字,代价可接受)。
 */
export class NativeTtsEngine implements TtsEngine {
  readonly id = 'native' as const;
  readonly label = '设备语音';
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
    const plugin = await loadPlugin();
    if (token !== this.tokenRef) return;
    this.plugin = plugin;
    if (!plugin) {
      handlers.onError(new Error('设备语音引擎加载失败'));
      return;
    }
    try {
      await plugin.speak({ text, lang: ctx.lang, rate: ctx.rate });
      if (token !== this.tokenRef) return;
      this.current = null;
      handlers.onDone();
    } catch (error) {
      if (token !== this.tokenRef) return;
      this.current = null;
      // 插件在 stop() 后可能 reject,已 cancel 的会话由令牌拦截;显式中止归一为取消
      handlers.onError(error instanceof Error && error.message ? error : new TtsCancelledError());
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
