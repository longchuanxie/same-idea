import { afterEach, describe, expect, it, vi } from 'vitest';

import { NativeTtsEngine } from './nativeTtsEngine';
import { TtsUnavailableError } from './types';

// ── 插件 mock：与 Capacitor 代理同构（任何属性访问都返回"桥接包装函数"）──
const pluginState = vi.hoisted(() => ({
  speakImpl: null as ((options: { text: string }) => Promise<void>) | null,
  speakCalls: 0,
  stopCalls: 0,
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
          if (prop === 'stop') {
            pluginState.stopCalls += 1;
            return Promise.resolve();
          }
          // 与真机一致：插件未实现的方法在代理上照样可访问、调用即 reject
          // （属性访问永远不会得到 undefined，运行时探测能力不可行）
          return Promise.reject(new Error(`"TextToSpeech.${String(prop)}()" is not implemented on android`));
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
    pluginState.stopCalls = 0;
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

  it('pause 走 stop 降级：挂起回调被令牌拦截，resume 整块重播', async () => {
    vi.useFakeTimers();
    const deferreds: Array<() => void> = [];
    pluginState.speakImpl = () =>
      new Promise<void>((resolve) => {
        deferreds.push(resolve);
      });
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。世界。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    await vi.advanceTimersByTimeAsync(0); // 越过 loadPlugin，进入「播报中」
    engine.pause();
    expect(pluginState.stopCalls).toBe(1);

    deferreds[0]?.(); // 暂停后旧 speak 才决议：令牌已换代，不得推进队列
    await vi.advanceTimersByTimeAsync(0);
    expect(onDone).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();

    engine.resume();
    await vi.advanceTimersByTimeAsync(0); // resume 的重播越过 loadPlugin 到达桥接
    expect(pluginState.speakCalls).toBe(2); // 当前分块整块重播
    deferreds[1]?.();
    await vi.advanceTimersByTimeAsync(0);
    expect(onDone).toHaveBeenCalledTimes(1); // 重播完成后正常推进
  });

  it('插件尚未加载时 pause：挂起的 speakAsync 被中止，不会在暂停态播完整块', async () => {
    vi.useFakeTimers();
    pluginState.speakImpl = async () => undefined;
    const onDone = vi.fn();
    const onError = vi.fn();
    const engine = new NativeTtsEngine();

    engine.speak('你好。', { rate: 1, lang: 'zh-CN' }, { onDone, onError });
    // 同步紧跟 pause：此刻 speakAsync 仍挂在 loadPlugin 上、this.plugin 还是 null
    engine.pause();
    await vi.advanceTimersByTimeAsync(1000);

    expect(pluginState.speakCalls).toBe(0); // 未到达桥接即被令牌拦截
    expect(onDone).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });
});
