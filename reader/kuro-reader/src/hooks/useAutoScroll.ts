import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const AUTO_SCROLL_INTERVAL = 50;

export interface AutoScrollController {
  isAutoScrolling: boolean;
  toggleAutoScroll: () => void;
}

/**
 * 文本阅读自动滚动：按固定间隔递增容器滚动位置。
 * axis='y' 为常规纵向滚动；'x' 用于竖排（writing-mode: vertical-rl，
 * 内容向左延伸，故 scrollLeft 递减）。拥有状态与定时器生命周期。
 */
export function useAutoScroll(
  scrollContainerRef: RefObject<HTMLElement | null>,
  speed: number,
  axis: 'y' | 'x' = 'y'
): AutoScrollController {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isAutoScrolling) {
      timerRef.current = setInterval(() => {
        const container = scrollContainerRef.current;
        if (container) {
          if (axis === 'x') {
            container.scrollLeft -= speed;
          } else {
            container.scrollTop += speed;
          }
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
  }, [isAutoScrolling, speed, axis, scrollContainerRef]);

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev);
  }, []);

  return { isAutoScrolling, toggleAutoScroll };
}
