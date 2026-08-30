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

  constructor(private readonly config: ServerTtsConfig) {}

  isAvailable(): boolean {
    return normalizeServerUrl(this.config.url).length > 0;
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
    const base = normalizeServerUrl(this.config.url);
    try {
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
      if (token !== this.tokenRef) return;
      if (!response.ok) throw new Error(`TTS 服务返回 ${response.status}`);
      const blob = await response.blob();
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
  }
}
