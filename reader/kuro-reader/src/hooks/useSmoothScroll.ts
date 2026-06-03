import { useCallback, useEffect, useRef } from 'react';

interface SmoothScrollOptions {
  direction: 'vertical' | 'horizontal';
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
  isActive?: boolean;
}

const SCROLL_THROTTLE_MS = 80;
const PROGRAMMATIC_SCROLL_TIMEOUT_MS = 800;
const INSTANT_SCROLL_SETTLE_MS = 100;
const READING_ANCHOR_RATIO = 0.2;

export const useSmoothScroll = (options: SmoothScrollOptions) => {
  const { direction, onPageChange, currentPage, totalPages, isActive = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const lastScrollEventRef = useRef(0);
  const lastDetectedPageRef = useRef(currentPage);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastDetectedPageRef.current = currentPage;
  }, [currentPage]);

  const scrollToPage = useCallback(
    (page: number, instant: boolean = false) => {
      const container = containerRef.current;
      if (!container || direction !== 'vertical' || !isActive) return;

      const targetIndex = page - 1;
      const targetSlot = container.querySelector(`[data-page-index="${targetIndex}"]`);
      if (!targetSlot) return;

      isProgrammaticScrollRef.current = true;
      const containerRect = container.getBoundingClientRect();
      const targetRect = (targetSlot as HTMLElement).getBoundingClientRect();
      const targetOffset = targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({ top: targetOffset, behavior: instant ? 'instant' : 'smooth' });

      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
      programmaticScrollTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        programmaticScrollTimerRef.current = null;
      }, instant ? INSTANT_SCROLL_SETTLE_MS : PROGRAMMATIC_SCROLL_TIMEOUT_MS);
    },
    [direction, isActive]
  );

  const detectPageFromScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || direction !== 'vertical' || !isActive) return;

    const containerRect = container.getBoundingClientRect();
    const readingAnchor = containerRect.top + containerRect.height * READING_ANCHOR_RATIO;
    const slots = container.querySelectorAll('[data-page-index]');

    let closestPage = 1;
    let minDistance = Infinity;
    let anchoredPage: number | null = null;

    slots.forEach((slot) => {
      const el = slot as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (rect.height === 0) return;
      const pageIndex = Number(el.dataset.pageIndex);
      const distance = Math.abs(rect.top - readingAnchor);
      if (rect.top <= readingAnchor && rect.bottom > readingAnchor) {
        anchoredPage = pageIndex + 1;
      }
      if (distance < minDistance) {
        minDistance = distance;
        closestPage = pageIndex + 1;
      }
    });

    if (anchoredPage !== null) {
      closestPage = anchoredPage;
    }

    if (closestPage !== lastDetectedPageRef.current) {
      lastDetectedPageRef.current = closestPage;
      if (!isProgrammaticScrollRef.current) {
        onPageChange(closestPage);
      }
    }
  }, [direction, isActive, onPageChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || direction !== 'vertical' || !isActive || totalPages === 0) return;

    let rafId: number | null = null;

    const onScroll = () => {
      const now = Date.now();
      if (now - lastScrollEventRef.current < SCROLL_THROTTLE_MS) {
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            rafId = null;
            detectPageFromScroll();
          });
        }
        return;
      }
      lastScrollEventRef.current = now;
      detectPageFromScroll();
    };

    container.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [direction, isActive, totalPages, detectPageFromScroll]);

  useEffect(() => {
    return () => {
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, []);

  return {
    containerRef,
    scrollToPage,
    setProgrammaticScroll: (value: boolean) => {
      isProgrammaticScrollRef.current = value;
      if (!value && programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
        programmaticScrollTimerRef.current = null;
      }
    },
    isDragging: () => isProgrammaticScrollRef.current,
  };
};

export default useSmoothScroll;
