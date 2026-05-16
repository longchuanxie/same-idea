import { useCallback, useEffect, useRef } from 'react';

interface SmoothScrollOptions {
  direction: 'vertical' | 'horizontal';
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

/**
 * useSmoothScroll Hook
 *
 * @description 优化条漫模式的触摸滚动体验
 * 使用 requestAnimationFrame + 主动事件监听实现跟手滑动
 * 通过原生事件绑定 passive: false 阻止默认滚动，实现完全自定义的触摸响应
 */
export const useSmoothScroll = (options: SmoothScrollOptions) => {
  const { direction, onPageChange, currentPage } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startScrollRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const lastTouchTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const slotPositionsRef = useRef<number[]>([]);
  const isProgrammaticScrollRef = useRef(false);
  const isMomentumScrollingRef = useRef(false);

  const updateSlotPositions = useCallback(() => {
    const container = containerRef.current;
    if (!container || direction !== 'vertical') return;
    const slots = container.querySelectorAll('[data-page-index]');
    slotPositionsRef.current = Array.from(slots).map(
      (slot) => (slot as HTMLElement).offsetTop
    );
  }, [direction]);

  const getPageFromScroll = useCallback(() => {
    const positions = slotPositionsRef.current;
    if (positions.length === 0) return currentPage;

    const container = containerRef.current;
    if (!container) return currentPage;

    const scrollCenter = container.scrollTop + container.clientHeight / 2;

    let closestPage = 1;
    let minDistance = Infinity;

    for (let i = 0; i < positions.length; i++) {
      const slot = container.querySelector(`[data-page-index="${i}"]`);
      if (!slot) continue;
      const slotHeight = (slot as HTMLElement).clientHeight;
      const slotCenter = positions[i] + slotHeight / 2;
      const distance = Math.abs(slotCenter - scrollCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestPage = i + 1;
      }
    }

    return closestPage;
  }, [currentPage]);

  const snapToNearestPage = useCallback(() => {
    const container = containerRef.current;
    if (!container || direction !== 'vertical') return;

    const targetPage = getPageFromScroll();
    if (targetPage !== currentPage && !isProgrammaticScrollRef.current) {
      onPageChange(targetPage);
    }
  }, [direction, currentPage, onPageChange, getPageFromScroll]);

  const applyMomentum = useCallback(() => {
    const container = containerRef.current;
    if (!container || direction !== 'vertical') return;

    const velocity = velocityRef.current;
    if (Math.abs(velocity) < 0.5) {
      isMomentumScrollingRef.current = false;
      snapToNearestPage();
      return;
    }

    container.scrollTop += velocity;
    velocityRef.current *= 0.95;

    rafIdRef.current = requestAnimationFrame(applyMomentum);
  }, [direction, snapToNearestPage]);

  const onTouchStart = useCallback(
    (e: TouchEvent) => {
      if (direction !== 'vertical') return;
      const touch = e.touches[0];
      isDraggingRef.current = true;
      isMomentumScrollingRef.current = false;
      startYRef.current = touch.clientY;
      startScrollRef.current = containerRef.current?.scrollTop ?? 0;
      lastTouchYRef.current = touch.clientY;
      lastTouchTimeRef.current = Date.now();
      velocityRef.current = 0;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      updateSlotPositions();
    },
    [direction, updateSlotPositions]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (direction !== 'vertical' || !isDraggingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const now = Date.now();
      const deltaY = touch.clientY - lastTouchYRef.current;
      const deltaTime = now - lastTouchTimeRef.current;

      if (deltaTime > 0) {
        velocityRef.current = deltaY * (16 / deltaTime);
      }

      lastTouchYRef.current = touch.clientY;
      lastTouchTimeRef.current = now;

      const container = containerRef.current;
      if (container) {
        container.scrollTop = startScrollRef.current - (touch.clientY - startYRef.current);
      }
    },
    [direction]
  );

  const onTouchEnd = useCallback(() => {
    if (direction !== 'vertical' || !isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (Math.abs(velocityRef.current) > 2) {
      isMomentumScrollingRef.current = true;
      rafIdRef.current = requestAnimationFrame(applyMomentum);
    } else {
      snapToNearestPage();
    }
  }, [direction, applyMomentum, snapToNearestPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || direction !== 'vertical') return;

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [direction, onTouchStart, onTouchMove, onTouchEnd]);

  const scrollToPage = useCallback(
    (page: number) => {
      const container = containerRef.current;
      if (!container || direction !== 'vertical') return;

      const positions = slotPositionsRef.current;
      if (positions.length === 0) {
        updateSlotPositions();
      }

      const targetIndex = page - 1;
      const targetPosition = slotPositionsRef.current[targetIndex];
      if (targetPosition === undefined) return;

      isProgrammaticScrollRef.current = true;
      container.scrollTo({ top: targetPosition, behavior: 'smooth' });

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    },
    [direction, updateSlotPositions]
  );

  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    scrollToPage,
    handleTouchStart: undefined,
    handleTouchMove: undefined,
    handleTouchEnd: undefined,
    isDragging: () => isDraggingRef.current || isMomentumScrollingRef.current,
  };
};

export default useSmoothScroll;
