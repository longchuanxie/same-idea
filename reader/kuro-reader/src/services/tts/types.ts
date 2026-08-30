export type TtsEngineId = 'system' | 'native' | 'neural' | 'server';
export type TtsEngineSetting = 'auto' | TtsEngineId;

export interface TtsSpeakContext {
  /** 倍速:1 / 1.25 / 1.5 / 2 */
  rate: number;
  /** BCP 47 语言标签,如 'zh-CN' */
  lang: string;
}

export interface TtsSpeakHandlers {
  /** 自然播完一块 */
  onDone: () => void;
  /** 播报失败;被 cancel 中止时引擎不回调(编排器以会话令牌判定),也可显式抛 TtsCancelledError */
  onError: (error: Error) => void;
}

/** 播放被 cancel 中止:编排器静默处理,不算错误 */
export class TtsCancelledError extends Error {
  constructor() {
    super('tts cancelled');
    this.name = 'TtsCancelledError';
  }
}

/**
 * 听书播报引擎统一接口。
 * 实现约定:
 * - 构造必须轻量(不得在构造器里加载 SDK/模型),重资源延迟到 speak 内动态 import
 * - speak 为回调式(非 Promise):onDone 之后编排器才会派发下一块
 * - cancel() 后不得再触发任何 handlers 回调,由编排器会话令牌接管推进
 */
export interface TtsEngine {
  readonly id: TtsEngineId;
  readonly label: string;
  isAvailable(): boolean;
  speak(text: string, ctx: TtsSpeakContext, handlers: TtsSpeakHandlers): void;
  pause(): void;
  resume(): void;
  cancel(): void;
  dispose(): void;
}
