import { afterEach, describe, expect, it, vi } from 'vitest';

import { NativeTtsEngine } from './nativeTtsEngine';
import { TtsUnavailableError } from './types';

// ── 插件 mock：与 Capacitor 代理同构（任何属性访问都返回"桥接包装函数"）──
const pluginState = vi.hoisted(() => ({
  speakImpl: null as ((options: { text: string }) => Promise<void>) | null,
  speakCalls: 0,
}));

vi.mock('@capacitor-community/text-to-speech', () => ({
  TextToSpeech: new Proxy(
    {},
    {
      get: (_target, prop) => {
        // then 包装永不回调任何 callback——与真实 Capacitor 代理行为一致：
        // 一旦被当 thenable 采纳，Promise 链将永久挂死（回归用例见下）
        if (prop === 'then') {
          return (_res: unknown, _rej: unknown) => undefined;
        }
        return (options: unknown) => {
          if (prop === 'speak') {
            pluginState.speakCalls += 1;
            return pluginState.speakImpl?.(options as { text: string }) ?? Promise.resolve();
          }
          return Promise.resolve();
        };
      },
    }
  ),
}));

function unavailableRejection(): Error {
  const error = new Error('Not yet initialized or not available on this device.') as Error & { code: string };
  error.code = 'UNAVAILABLE';
  return error;
}

describe('NativeTtsEngine（系统语音引擎）', () => {
  afterEach(() => {
    vi.useRealTimers();
    pluginState.speakImpl = null;
    pluginState.speakCalls = 0;
  });

  it('Capacitor 代理经 Promise 链流转不挂死：speak 正常到达桥接并完成', async () => {
    vi.useFakeTimers();
    pluginState.speakImpl = async () => undefined;
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    await vi.advanceTimersByTimeAsync(500);

    expect(pluginState.speakCalls).toBe(1);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('引擎初始化中的拒绝在宽限窗口内重试，就绪后正常播报', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    pluginState.speakImpl = async () => {
      attempts += 1;
      // 前两次模拟引擎尚未初始化完成（真机冷启动即点喇叭）
      if (attempts < 3) throw unavailableRejection();
    };
    const onStart = vi.fn();
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。', { rate: 1, lang: 'zh-CN' }, { onStart, onDone, onError });
    await vi.advanceTimersByTimeAsync(1000);

    expect(attempts).toBe(3);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('宽限窗口后仍不可用：归一为 TtsUnavailableError 且停止重试', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    pluginState.speakImpl = async () => {
      attempts += 1;
      throw unavailableRejection();
    };
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    await vi.advanceTimersByTimeAsync(6000);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(TtsUnavailableError);
    expect(onDone).not.toHaveBeenCalled();
    const attemptsAtError = attempts;
    await vi.advanceTimersByTimeAsync(2000);
    expect(attempts).toBe(attemptsAtError);
  });

  it('一般播报失败不重试：原始错误信息如实上报', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    pluginState.speakImpl = async () => {
      attempts += 1;
      throw new Error('引擎崩溃');
    };
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    await vi.advanceTimersByTimeAsync(1000);

    expect(attempts).toBe(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: '引擎崩溃' }));
  });

  it('宽限期间 cancel：不再回调任何 handler', async () => {
    vi.useFakeTimers();
    let attempts = 0;
    pluginState.speakImpl = async () => {
      attempts += 1;
      throw unavailableRejection();
    };
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    await vi.advanceTimersByTimeAsync(0);
    engine.cancel();
    const attemptsAtCancel = attempts;
    await vi.advanceTimersByTimeAsync(6000);

    expect(attempts).toBe(attemptsAtCancel);
    expect(onError).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
