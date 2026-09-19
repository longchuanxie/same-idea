import type { TtsSpeakContext, TtsSpeakHandlers } from './types';

/** 播放倍速的钳制范围(HTMLAudioElement playbackRate 合法区间内) */
const PLAYBACK_RATE_MIN = 0.5;
const PLAYBACK_RATE_MAX = 4;

export interface BlobPlaybackControls {
  pause(): void;
  resume(): void;
  stop(): void;
}

/**
 * 播放合成出的音频 Blob(神经网络/服务端引擎共用)。
 * isCancelled() 返回 true 后(引擎已被 cancel)不再触发任何回调。
 */
export function playBlob(
  blob: Blob,
  ctx: TtsSpeakContext,
  handlers: TtsSpeakHandlers,
  isCancelled: () => boolean
): BlobPlaybackControls {
  const audio = new Audio();
  const url = URL.createObjectURL(blob);
  audio.src = url;
  // 神经网络合成无语速参数:用播放倍速实现(浏览器默认保音调)
  audio.playbackRate = Math.min(PLAYBACK_RATE_MAX, Math.max(PLAYBACK_RATE_MIN, ctx.rate));
  let settled = false;
  const finish = (done: boolean, error?: Error) => {
    if (settled || isCancelled()) return;
    settled = true;
    URL.revokeObjectURL(url);
    if (done) handlers.onDone();
    else handlers.onError(error ?? new Error('音频播放失败'));
  };
  audio.onended = () => finish(true);
  audio.onerror = () => finish(false);
  void audio.play().catch((error) => finish(false, error instanceof Error ? error : undefined));
  return {
    pause: () => audio.pause(),
    resume: () => {
      void audio.play().catch(() => undefined);
    },
    stop: () => {
      audio.pause();
      audio.removeAttribute('src');
      // 先 removeAttribute 再读 audio.src 只会拿到空串——必须 revoke 建立时
      // 捕获的 url，否则被中途 stop 的音频（切章/切引擎/停止听书）全部泄漏
      URL.revokeObjectURL(url);
    },
  };
}
