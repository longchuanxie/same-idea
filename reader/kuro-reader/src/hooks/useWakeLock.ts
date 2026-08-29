import { useEffect, useRef } from 'react';

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
};

/**
 * 请求屏幕常亮（Wake Lock API）。
 * 浏览器不支持或请求被拒绝时静默降级，不影响阅读。
 */
export function useWakeLock(enabled = true): void {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const requestWakeLock = async () => {
      try {
        const navigatorWithWakeLock = navigator as WakeLockNavigator;
        if (!navigatorWithWakeLock.wakeLock) return;
        const sentinel = await navigatorWithWakeLock.wakeLock.request('screen');
        if (cancelled) {
          sentinel.release?.();
          return;
        }
        wakeLockRef.current = sentinel;
      } catch {
        // Wake Lock 不可用时静默忽略
      }
    };

    requestWakeLock();
    return () => {
      cancelled = true;
      wakeLockRef.current?.release?.();
      wakeLockRef.current = null;
    };
  }, [enabled]);
}
