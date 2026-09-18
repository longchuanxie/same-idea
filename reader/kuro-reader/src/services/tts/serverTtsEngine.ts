import { playBlob, type BlobPlaybackControls } from './blobPlayback';
import type { TtsEngine, TtsSpeakContext, TtsSpeakHandlers } from './types';

export interface ServerTtsConfig {
  url: string;
  model: string;
  voice: string;
}

/** 规范化用户输入的服务地址:补 http:// 协议、去尾部斜杠(手法同 cloudStorage) */
export function normalizeServerUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
}

/**
 * 自定义服务端引擎:OpenAI 兼容 /v1/audio/speech 接口,
 * 可对接 GPT-SoVITS(转接层)、fish-speech、alltalk 等自部署 TTS 服务。
 */
export class ServerTtsEngine implements TtsEngine {
  readonly id = 'server' as const;
  readonly label = '自定义服务';
  private tokenRef = 0;
  private playback: BlobPlaybackControls | null = null;
  /** 后台预取产物（speed 参与服务端合成，缓存键 = 文本 × 倍速） */
  private prefetch: { text: string; rate: number; promise: Promise<Blob> } | null = null;

  constructor(private readonly config: ServerTtsConfig) {}

  isAvailable(): boolean {
    return normalizeServerUrl(this.config.url).length > 0;
  }

  /** 当前分块播放期间后台预取下一分块音频，消除块间网络等待 */
  prepare(text: string, ctx: TtsSpeakContext): void {
    if (this.prefetch?.text === text && this.prefetch.rate === ctx.rate) return;
    const promise = this.fetchSpeech(text, ctx);
    promise.catch(() => undefined); // 未被消费的预取失败静默；speak 消费时按原路径报错
    this.prefetch = { text, rate: ctx.rate, promise };
  }

  speak(text: string, ctx: TtsSpeakContext, handlers: TtsSpeakHandlers): void {
    const token = ++this.tokenRef;
    void this.speakAsync(text, ctx, handlers, token);
  }

  private async fetchSpeech(text: string, ctx: TtsSpeakContext): Promise<Blob> {
    const base = normalizeServerUrl(this.config.url);
    const response = await fetch(`${base}/v1/audio/speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model || 'tts-1',
        voice: this.config.voice || 'alloy',
        input: text,
        speed: ctx.rate,
        response_format: 'mp3',
      }),
    });
    if (!response.ok) throw new Error(`TTS 服务返回 ${response.status}`);
    return response.blob();
  }

  private async speakAsync(
    text: string,
    ctx: TtsSpeakContext,
    handlers: TtsSpeakHandlers,
    token: number
  ): Promise<void> {
    // 命中同文本同倍速的预取产物则直接取用，否则现场请求
    const prefetch = this.prefetch?.text === text && this.prefetch.rate === ctx.rate
      ? this.prefetch.promise
      : null;
    this.prefetch = null;
    try {
      const blob = await (prefetch ?? this.fetchSpeech(text, ctx));
      if (token !== this.tokenRef) return;
      this.playback = playBlob(blob, ctx, {
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
      handlers.onError(error instanceof Error ? error : new Error('TTS 服务请求失败'));
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
