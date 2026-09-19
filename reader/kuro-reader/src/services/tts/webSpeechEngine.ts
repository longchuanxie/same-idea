import { TtsCancelledError, type TtsEngine, type TtsSpeakContext, type TtsSpeakHandlers } from './types';

export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** 浏览器 Web Speech 引擎:桌面浏览器默认路径,音色取决于操作系统/浏览器。
 *  命名与安卓端区分:App 内「系统语音」专指系统 TTS 引擎（nativeTtsEngine）,此处的 WebView 版实测无声 */
export class WebSpeechEngine implements TtsEngine {
  readonly id = 'system' as const;
  readonly label = '浏览器语音';
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
    // 起播事件：部分内核（微信 X5 等）对象存在却永不发声，编排器以此解除看门狗
    utterance.onstart = () => {
      if (token !== this.tokenRef) return;
      handlers.onStart?.();
    };
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
          : new Error(`浏览器语音播报失败:${cause}`)
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
