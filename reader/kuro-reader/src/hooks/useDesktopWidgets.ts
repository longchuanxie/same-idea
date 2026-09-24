import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { WidgetBridge } from '@/plugins/WidgetBridgePlugin';
import {
  syncContinueWidgetFromLibrary,
  syncStatsWidgetFromStats,
} from '@/services/widget/widgetBridge';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { isNativePlatform } from '@/utils/capacitor';

/**
 * 桌面小组件接线（仅原生平台生效）：
 * - 深链：小组件点击 → MainActivity 携路由 → 冷启动 consumePendingRoute /
 *   暖启动 widgetRoute 事件 → react-router 导航
 * - 数据：订阅书架进度（继续阅读）与时长簿（阅读统计）变化，防抖推送；
 *   App 启动后兜底推一次初始数据（覆盖小组件新添加/设备重启后的陈旧态）
 */

const CONTINUE_PUSH_DEBOUNCE_MS = 1500;
const STATS_PUSH_DEBOUNCE_MS = 1500;
/** 初始推送延迟：等书架 loadBooks 完成（AuthGuard 挂载后进行） */
const INITIAL_PUSH_DELAY_MS = 2000;

function debouncePush(fn: () => void, ms: number): { run: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return {
    run: () => {
      if (timer != null) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        fn();
      }, ms);
    },
    cancel: () => {
      if (timer != null) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

export function useDesktopWidgets(): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNativePlatform()) return;
    let cancelled = false;
    let removeRouteListener: (() => void) | undefined;

    const navigateRoute = (route: string) => {
      if (!route) return;
      navigate(route);
    };

    void (async () => {
      // 冷启动：JS 就绪前点击小组件积压的路由，就绪后取走并导航
      try {
        const { route } = await WidgetBridge.consumePendingRoute();
        if (!cancelled && route) navigateRoute(route);
      } catch {
        // 原生桥缺席：跳过
      }
      try {
        const listener = await WidgetBridge.addListener('widgetRoute', (data) => {
          navigateRoute(data.route);
        });
        removeRouteListener = () => {
          void listener.remove();
        };
      } catch {
        // 同上
      }
    })();

    const debouncedContinue = debouncePush(() => {
      void syncContinueWidgetFromLibrary();
    }, CONTINUE_PUSH_DEBOUNCE_MS);
    const debouncedStats = debouncePush(() => {
      void syncStatsWidgetFromStats();
    }, STATS_PUSH_DEBOUNCE_MS);

    const unsubscribeLibrary = useLibraryStore.subscribe((state, prev) => {
      if (state.readingProgress !== prev.readingProgress || state.books !== prev.books) {
        debouncedContinue.run();
      }
    });
    const unsubscribeStats = useStatsStore.subscribe((state, prev) => {
      if (state.readingSessions !== prev.readingSessions || state.dailyGoalMinutes !== prev.dailyGoalMinutes) {
        debouncedStats.run();
      }
    });

    const initialTimer = setTimeout(() => {
      void syncContinueWidgetFromLibrary();
      void syncStatsWidgetFromStats();
    }, INITIAL_PUSH_DELAY_MS);

    return () => {
      cancelled = true;
      removeRouteListener?.();
      unsubscribeLibrary();
      unsubscribeStats();
      clearTimeout(initialTimer);
      debouncedContinue.cancel();
      debouncedStats.cancel();
    };
  }, [navigate]);
}
