import React, { useCallback, useRef, useState } from 'react';

/** 触发跟手翻书的最小横向位移（px） */
const FLIP_SWIPE_THRESHOLD = 50;
/** 跟手进度分母：拖过视口宽度的该比例即翻满 */
const FLIP_DRAG_RADIUS_RATIO = 0.6;
/** 松手提交翻页的进度阈值 */
export const FLIP_COMMIT_PROGRESS_THRESHOLD = 0.35;
/** 动画类驱动的收尾时长（ms） */
const FLIP_ANIMATION_COMPLETE_MS = 600;
const FLIP_SNAPBACK_MS = 350;
/** 容器缺失时的兜底复位延迟（ms） */
const FLIP_STATE_RESET_DELAY_MS = 50;
/** 翻满时的页片转角 */
export const FLIP_ROTATION_DEG = 160;
/** JSX 阴影/书脊渲染参数 */
export const FLIP_EXIT_SHADOW_MAX_OPACITY = 0.25;
export const FLIP_ENTER_SHADOW_MAX_OPACITY = 0.3;
export const FLIP_EXIT_SHADOW_GRADIENT_END_PCT = 50;
export const FLIP_ENTER_SHADOW_GRADIENT_END_PCT = 40;
export const FLIP_SPINE_OPACITY = 0.5;

export interface BookFlipAnimationState {
  /** 与分页滑动共用的动画状态（goToPage 的滑动动画也在同一状态机上） */
  isPageAnimating: boolean;
  setIsPageAnimating: (value: boolean) => void;
  pageDirection: 'left' | 'right' | null;
  setPageDirection: (direction: 'left' | 'right' | null) => void;
  previousPageIndex: number | null;
  setPreviousPageIndex: (index: number | null) => void;
}

export interface UseBookFlipAnimationParams extends BookFlipAnimationState {
  /** 仅模拟翻书模式（textReadingMode === 'book'）启用 */
  enabled: boolean;
  totalPages: number;
  currentPageIndex: number;
  setCurrentPageIndex: (index: number) => void;
}

/**
 * 模拟翻书（book 模式）的跟手翻页动画：
 * - 触摸横拖启动翻书并跟手设置页片转角（flipProgress 0..1）
 * - 松手：进度超阈值提交翻页（CSS 类收尾），否则弹回原页
 * - 点击/键盘翻页走「startFlip + rAF 后 completeFlip」的组合（见 goToNext/PrevPage）
 *
 * 页片 DOM 结构（data-flip-exit / data-flip-enter）由阅读器 JSX 提供，
 * hook 通过 flipPageRef 挂载点查询并直接操作 transform/类名。
 */
export function useBookFlipAnimation({
  enabled,
  totalPages,
  currentPageIndex,
  setCurrentPageIndex,
  isPageAnimating,
  setIsPageAnimating,
  pageDirection,
  setPageDirection,
  previousPageIndex,
  setPreviousPageIndex,
}: UseBookFlipAnimationParams) {
  /** 翻书跟手进度 0~1 */
  const [flipProgress, setFlipProgress] = useState(0);
  /** 翻书交互页面容器（页片 data-flip-exit/enter 的挂载点） */
  const flipPageRef = useRef<HTMLDivElement>(null);
  /** 翻书手势起点（独立于分页滑动的 touchStartRef，两者同时写入不冲突） */
  const flipTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  const resetFlipState = useCallback(() => {
    setIsPageAnimating(false);
    setPageDirection(null);
    setPreviousPageIndex(null);
    setFlipProgress(0);
  }, [setIsPageAnimating, setPageDirection, setPreviousPageIndex]);

  /** 启动翻书动画（触摸横拖越过阈值 / 点击翻页时调用） */
  const startFlip = useCallback((targetIndex: number, direction: 'left' | 'right') => {
    if (isPageAnimating) return;
    if (targetIndex < 0 || targetIndex >= totalPages) return;

    setPreviousPageIndex(currentPageIndex);
    setPageDirection(direction);
    setIsPageAnimating(true);
    setFlipProgress(0);
    setCurrentPageIndex(targetIndex);
  }, [isPageAnimating, totalPages, currentPageIndex, setPreviousPageIndex, setPageDirection, setIsPageAnimating, setCurrentPageIndex]);

  /** 通过变换完成翻书（松手后调用） */
  const completeFlip = useCallback(() => {
    const el = flipPageRef.current;
    if (!el) {
      setTimeout(resetFlipState, FLIP_STATE_RESET_DELAY_MS);
      return;
    }

    const exitEl = el.querySelector('[data-flip-exit]') as HTMLElement | null;
    const enterEl = el.querySelector('[data-flip-enter]') as HTMLElement | null;
    const isForward = pageDirection === 'left';

    if (exitEl) {
      exitEl.classList.add('book-flip-complete-exit');
      exitEl.style.transform = `rotateY(${isForward ? -FLIP_ROTATION_DEG : FLIP_ROTATION_DEG}deg)`;
    }
    if (enterEl) {
      enterEl.classList.add('book-flip-complete-enter');
      enterEl.style.transform = 'rotateY(0deg)';
    }

    setTimeout(resetFlipState, FLIP_ANIMATION_COMPLETE_MS);
  }, [pageDirection, resetFlipState]);

  /** 弹回翻书（松手时未达到提交阈值） */
  const snapbackFlip = useCallback(() => {
    const el = flipPageRef.current;
    if (!el) {
      setTimeout(resetFlipState, FLIP_STATE_RESET_DELAY_MS);
      return;
    }

    const exitEl = el.querySelector('[data-flip-exit]') as HTMLElement | null;
    const enterEl = el.querySelector('[data-flip-enter]') as HTMLElement | null;
    const isForward = pageDirection === 'left';

    if (exitEl) {
      exitEl.classList.add('book-flip-snapback');
      exitEl.style.transform = 'rotateY(0deg)';
    }
    if (enterEl) {
      enterEl.classList.add('book-flip-snapback');
      enterEl.style.transform = `rotateY(${isForward ? FLIP_ROTATION_DEG : -FLIP_ROTATION_DEG}deg)`;
    }

    setTimeout(() => {
      setCurrentPageIndex(previousPageIndex ?? currentPageIndex);
      resetFlipState();
    }, FLIP_SNAPBACK_MS);
  }, [pageDirection, previousPageIndex, currentPageIndex, setCurrentPageIndex, resetFlipState]);

  const handleFlipTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    flipTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [enabled]);

  const handleFlipTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enabled || !flipTouchStartRef.current) return;

    const touch = e.touches[0];
    const rawDx = touch.clientX - flipTouchStartRef.current.x;
    const dy = touch.clientY - flipTouchStartRef.current.y;

    // 开始翻书检测
    if (!isPageAnimating && Math.abs(rawDx) > FLIP_SWIPE_THRESHOLD && Math.abs(rawDx) > Math.abs(dy)) {
      if (rawDx < 0 && currentPageIndex < totalPages - 1) {
        startFlip(currentPageIndex + 1, 'left');
      } else if (rawDx > 0 && currentPageIndex > 0) {
        startFlip(currentPageIndex - 1, 'right');
      }
      return;
    }

    // 跟手变换
    if (isPageAnimating && pageDirection) {
      // 翻书 surface 已设 touch-none，浏览器不会并发平移页面；React 合成事件的
      // preventDefault 挂在 passive 监听上无效，这里不做也不需要
      const containerWidth = window.innerWidth;
      const isForward = pageDirection === 'left';
      const adjustedDx = isForward ? (-rawDx - FLIP_SWIPE_THRESHOLD) : (rawDx - FLIP_SWIPE_THRESHOLD);
      const progress = Math.max(0, Math.min(1, adjustedDx / (containerWidth * FLIP_DRAG_RADIUS_RATIO)));
      setFlipProgress(progress);
    }
  }, [enabled, isPageAnimating, currentPageIndex, totalPages, pageDirection, startFlip]);

  const handleFlipTouchEnd = useCallback(() => {
    if (!enabled || !isPageAnimating) return;

    if (flipProgress > FLIP_COMMIT_PROGRESS_THRESHOLD) {
      completeFlip();
    } else {
      snapbackFlip();
    }
  }, [enabled, isPageAnimating, flipProgress, completeFlip, snapbackFlip]);

  return {
    /** 跟手进度（页片转角/阴影的 JSX 渲染数据源） */
    flipProgress,
    /** 页片容器 ref（挂到翻书交互的 main 元素） */
    flipPageRef,
    startFlip,
    completeFlip,
    snapbackFlip,
    handleFlipTouchStart,
    handleFlipTouchMove,
    handleFlipTouchEnd,
  };
}
