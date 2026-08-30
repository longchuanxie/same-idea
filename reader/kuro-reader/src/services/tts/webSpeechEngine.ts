import { TtsCancelledError, type TtsEngine, type TtsSpeakContext, type TtsSpeakHandlers } from './types';

export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** 系统 Web Speech 引擎:桌面浏览器默认路径,音色取决于操作系统/浏览器 */
export class WebSpeechEngine implements TtsEngine {
  readonly id = 'system' as const;
  readonly label = '系统语音';
  private tokenRef = 0;

  isAvailable(): boolean {
    return isWebSpeechSupported();
  }

  speak(text: string, ctx: TtsSpeakContext, handlers: TtsSpeakHandlers): void {
    const synth = window.speechSynthesis;
    if (!synth) {
      handlers.onError(new Error('当前环境不支持系统语音'));
      return;
    }
    const token = ++this.tokenRef;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ctx.rate;
    utterance.lang = ctx.lang;
    utterance.onend = () => {
      if (token !== this.tokenRef) return;
      handlers.onDone();
    };
    utterance.onerror = (event) => {
      if (token !== this.tokenRef) return;
      const cause = (event as SpeechSynthesisErrorEvent).error;
      handlers.onError(
        cause === 'canceled' || cause === 'interrupted'
          ? new TtsCancelledError()
          : new Error(`系统语音播报失败:${cause}`)
      );
    };
    // 先清空残留的播报队列(上一会话/其他来源),保持每次播报从干净状态开始
    synth.cancel();
    synth.speak(utterance);
  }

  pause(): void {
    window.speechSynthesis?.pause();
  }

  resume(): void {
    window.speechSynthesis?.resume();
  }

  cancel(): void {
    this.tokenRef += 1;
    const synth = window.speechSynthesis;
    if (!synth) return;
    // Chrome 在 pause 状态下 cancel 可能不生效:先 resume 再 cancel
    synth.resume();
    synth.cancel();
  }

  dispose(): void {
    this.cancel();
  }
}
