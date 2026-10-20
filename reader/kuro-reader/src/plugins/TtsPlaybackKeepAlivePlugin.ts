import { registerPlugin } from '@capacitor/core';

export interface TtsPlaybackForegroundContent {
  title: string;
  body: string;
}

/**
 * 听书的前台保活（Android）：
 * - start/update：mediaPlayback 前台服务持有常驻播报通知（id=1）与 PARTIAL_WAKE_LOCK，
 *   息屏后进程不被降级冻结、CPU 不休眠——分块播报的链式调度（TTS onDone → 下一块）
 *   得以持续，根治「息屏后听着听着就停」
 * - stop：撤通知、放锁、服务退场
 * start 只由用户前台开启听书触发（Android 12+ 前台服务启动限制）；息屏自动续播只发 update。
 * Web/iOS 无此插件（registerPlugin 回退未实现桥），调用方须自行 catch。
 */
export interface TtsPlaybackKeepAlivePlugin {
  start(options: TtsPlaybackForegroundContent): Promise<void>;
  update(options: TtsPlaybackForegroundContent): Promise<void>;
  stop(): Promise<void>;
}

export const TtsPlaybackKeepAlive = registerPlugin<TtsPlaybackKeepAlivePlugin>('TtsPlaybackKeepAlive');
