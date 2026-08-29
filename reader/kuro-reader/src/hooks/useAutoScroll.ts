import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const AUTO_SCROLL_INTERVAL = 50;

export interface AutoScrollController {
  isAutoScrolling: boolean;
  toggleAutoScroll: () => void;
}

/**
 * 文本阅读自动滚动：按固定间隔递增容器 scrollTop。
 * 拥有 isAutoScrolling 状态与定时器生命周期。
 */
export function useAutoScroll(
  scrollContainerRef: RefObject<HTMLElement | null>,
  speed: number
): AutoScrollController {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isAutoScrolling) {
      timerRef.current = setInterval(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop += speed;
        }
      }, AUTO_SCROLL_INTERVAL);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAutoScrolling, speed, scrollContainerRef]);

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev);
  }, []);

  return { isAutoScrolling, toggleAutoScroll };
}
