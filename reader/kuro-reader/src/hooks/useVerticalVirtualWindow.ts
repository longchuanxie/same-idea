import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { ReadingProgress } from '@/types';

const PERCENT_MULTIPLIER = 100;
const PAGE_PROGRESS_OFFSET = 1;
const DEFAULT_PAGE_SCROLL_RATIO = 0;
const MAX_PAGE_SCROLL_RATIO = 1;
const SCROLL_RETRY_INTERVAL = 150;
const LAYOUT_STABLE_DELAY = 100;
const INITIAL_SCROLL_SETTLE_DELAY = 600;
const INTERSECTION_ROOT_MARGIN = '800px 0px';
const PROGRESS_SAVE_DEBOUNCE = 300;
const TOUCH_MOVE_THRESHOLD = 10;
const VERTICAL_RESTORE_PRELOAD_COUNT = 8;
const VERTICAL_PREPEND_BATCH_SIZE = 6;
const VERTICAL_APPEND_BATCH_SIZE = 8;
const VERTICAL_PREPEND_THRESHOLD = 120;
const VERTICAL_APPEND_THRESHOLD = 600;
const READING_ANCHOR_RATIO = 0.2;
/** 晋升后等待新章 DOM 提交的最大帧数（约 1s，超时直接解冻） */
const PROMOTION_SCROLL_MAX_ATTEMPTS = 60;
/** 晋升提前量（px）：视口顶边距分割线 ≤ 该值时触发，保证补偿后像素级连续 */
const PROMOTION_LEAD_PX = 2;

const clampPageScrollRatio = (ratio: number): number =>
  Math.max(DEFAULT_PAGE_SCROLL_RATIO, Math.min(MAX_PAGE_SCROLL_RATIO, ratio));

/** 进度快照：阅读器各处以 ref 共享的最新进度（避免重渲染抖动） */
export interface ReaderProgressSnapshot {
  bookId: string;
  chapterId: string;
  currentPage: number;
  pageScrollRatio: number;
  chapterScrollRatio: number;
  readingMode: 'vertical' | 'horizontal';
  pageLayout: 'single' | 'double';
  totalPages: number;
  globalPageIndex: number;
  totalImages: number;
  percentage: number;
}

const getReadingPercentage = (
  globalPageIndex: number,
  totalImages: number,
  pageScrollRatio: number
): number => {
  if (totalImages <= 0) return DEFAULT_PAGE_SCROLL_RATIO;
  const pageProgress = globalPageIndex - PAGE_PROGRESS_OFFSET + pageScrollRatio;
  return (pageProgress / totalImages) * PERCENT_MULTIPLIER;
};

export interface VerticalReadingPosition {
  page: number;
  pageScrollRatio: number;
}

/** 垂直模式跨章续读：本章末尾拼接的「分割线 + 下一章头部页」 */
export interface NextChapterContinuation {
  chapterId: string;
  title: string;
  pageCount: number;
  /** 下一章头部预取 URL（按下一章页索引对齐）；首槽就绪才渲染续读页槽位 */
  prefetchUrls: (string | null)[] | null;
  /** 续读区进入视口时无缝晋升下一章；返回 false 表示预取未就绪 */
  promote: (startPage: number) => boolean;
  /** 渲染窗口触底时请求预取相邻章（幂等） */
  requestPrefetch: () => void;
}

export interface VerticalVirtualWindowParams {
  direction: 'vertical' | 'horizontal';
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
  loadPage: (pageIndex: number) => Promise<void>;
  /** 垂直模式滚动容器（useSmoothScroll 暴露的 ref） */
  containerRef: React.RefObject<HTMLDivElement | null>;
  setProgrammaticScroll: (value: boolean) => void;
  bookId?: string;
  currentChapterId?: string | null;
  imagesBeforeCurrentChapter: number;
  totalImages: number;
  progressRef: React.MutableRefObject<ReaderProgressSnapshot>;
  updateProgress: (bookId: string, progress: ReadingProgress) => void;
  getCurrentVerticalReadingPosition: () => VerticalReadingPosition | null;
  getCurrentChapterScrollRatio: () => number;
  showFirstPageNotice: () => void;
  /** 跨章续读配置；null = 没有下一章（章末只出完结卡） */
  continuation?: NextChapterContinuation | null;
}

/**
 * 垂直（条漫）模式的虚拟滚动窗口：
 * - 只渲染 [renderStart, renderEnd) 的页槽，向上 prepend / 向下 append 扩窗
 * - 初始进度恢复（等图片布局稳定后校准滚动）
 * - 跳页（含页内落点反解）、边界回滚手势、滚动驱动的进度更新
 *
 * 水平模式不启用（enabled = direction === 'vertical'），全部 effect 短路。
 */
export function useVerticalVirtualWindow({
  direction,
  isLoading,
  totalPages,
  currentPage,
  goToPage,
  loadPage,
  containerRef,
  setProgrammaticScroll,
  bookId,
  currentChapterId,
  imagesBeforeCurrentChapter,
  totalImages,
  progressRef,
  updateProgress,
  getCurrentVerticalReadingPosition,
  getCurrentChapterScrollRatio,
  showFirstPageNotice,
  continuation,
}: VerticalVirtualWindowParams) {
  const [isRestoringVerticalScroll, setIsRestoringVerticalScroll] = useState(false);
  const [verticalProgressPercent, setVerticalProgressPercent] = useState<number | null>(null);
  const [verticalBufferStartIndex, setVerticalBufferStartIndex] = useState(0);
  const [verticalRenderStartIndex, setVerticalRenderStartIndex] = useState(0);
  const [verticalRenderEndIndex, setVerticalRenderEndIndex] = useState(VERTICAL_RESTORE_PRELOAD_COUNT);

  const initialScrollDoneRef = useRef(false);
  const initialScrollRestoreKeyRef = useRef('');
  const isPrependingVerticalScrollRef = useRef(false);
  const isPromotingNextChapterRef = useRef(false);
  /** 跨章晋升自行接管窗口与滚动，换章复位 effect 需让位一次 */
  const skipNextChapterResetRef = useRef(false);
  const lastChapterKeyRef = useRef('');
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verticalTouchStartYRef = useRef(DEFAULT_PAGE_SCROLL_RATIO);

  /** 开书/换章时按恢复进度初始化窗口 */
  const initializeWindow = useCallback((initialTargetIndex: number) => {
    initialScrollDoneRef.current = false;
    initialScrollRestoreKeyRef.current = '';
    setVerticalBufferStartIndex(Math.max(0, initialTargetIndex - VERTICAL_PREPEND_BATCH_SIZE));
    setVerticalRenderStartIndex(initialTargetIndex);
    setVerticalRenderEndIndex(initialTargetIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
  }, []);

  /** 水平 → 垂直切换时以当前页重建窗口（不沿用旧进度落点） */
  const resetForVerticalEntry = useCallback((page: number) => {
    const nextTargetIndex = Math.max(0, page - PAGE_PROGRESS_OFFSET);
    setVerticalBufferStartIndex(Math.max(0, nextTargetIndex - VERTICAL_PREPEND_BATCH_SIZE));
    setVerticalRenderStartIndex(nextTargetIndex);
    setVerticalRenderEndIndex(nextTargetIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
    initialScrollDoneRef.current = false;
    initialScrollRestoreKeyRef.current = '';
    setVerticalProgressPercent(null);
  }, []);

  /** 垂直 → 水平切换：清空垂直进度展示 */
  const clearVerticalProgress = useCallback(() => {
    setVerticalProgressPercent(null);
  }, []);

  // ── 滚动驱动的进度更新（防抖保存） ──
  useEffect(() => {
    if (isLoading) return;
    if (direction !== 'vertical') {
      setVerticalProgressPercent(null);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const updateVerticalProgress = () => {
      if (isPrependingVerticalScrollRef.current) return;
      const position = getCurrentVerticalReadingPosition();
      if (!position || !bookId || !currentChapterId || totalPages === 0) return;

      const verticalGlobalPageIndex = imagesBeforeCurrentChapter + position.page;
      const chapterScrollRatio = getCurrentChapterScrollRatio();
      const percentage = getReadingPercentage(verticalGlobalPageIndex, totalImages, position.pageScrollRatio);

      progressRef.current = {
        bookId,
        chapterId: currentChapterId,
        currentPage: position.page,
        pageScrollRatio: position.pageScrollRatio,
        chapterScrollRatio,
        readingMode: 'vertical',
        pageLayout: progressRef.current.pageLayout,
        totalPages,
        globalPageIndex: verticalGlobalPageIndex,
        totalImages,
        percentage,
      };
      setVerticalProgressPercent(percentage);

      if (!initialScrollDoneRef.current) return;
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
      progressSaveTimerRef.current = setTimeout(() => {
        const latestProgress = progressRef.current;
        if (!latestProgress.bookId || !latestProgress.chapterId) return;
        updateProgress(latestProgress.bookId, {
          bookId: latestProgress.bookId,
          chapterId: latestProgress.chapterId,
          page: latestProgress.currentPage,
          pageScrollRatio: latestProgress.pageScrollRatio,
          chapterScrollRatio: latestProgress.chapterScrollRatio,
          readingMode: latestProgress.readingMode,
          pageLayout: latestProgress.pageLayout,
          totalPages: latestProgress.totalPages,
          percentage: latestProgress.percentage,
          globalPageIndex: latestProgress.globalPageIndex,
          totalImages: latestProgress.totalImages,
        });
      }, PROGRESS_SAVE_DEBOUNCE);
    };

    container.addEventListener('scroll', updateVerticalProgress, { passive: true });
    updateVerticalProgress();

    return () => {
      container.removeEventListener('scroll', updateVerticalProgress);
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
        progressSaveTimerRef.current = null;
      }
    };
  }, [
    bookId,
    currentChapterId,
    direction,
    isLoading,
    totalPages,
    totalImages,
    imagesBeforeCurrentChapter,
    getCurrentVerticalReadingPosition,
    getCurrentChapterScrollRatio,
    containerRef,
    progressRef,
    updateProgress,
  ]);

  // ── 窗口边界收敛 ──
  useEffect(() => {
    if (direction !== 'vertical' || totalPages <= 0) return;
    setVerticalBufferStartIndex((startIndex) => Math.max(0, Math.min(startIndex, totalPages - 1)));
    setVerticalRenderStartIndex((startIndex) => Math.max(0, Math.min(startIndex, totalPages - 1)));
    setVerticalRenderEndIndex((endIndex) => Math.max(1, Math.min(endIndex, totalPages)));
  }, [direction, totalPages]);

  // ── 窗口内页面预载 ──
  useEffect(() => {
    if (direction !== 'vertical' || totalPages <= 0 || isLoading) return;
    const startIndex = Math.max(0, Math.min(verticalBufferStartIndex, verticalRenderStartIndex, totalPages - 1));
    const endIndex = Math.max(verticalRenderStartIndex + 1, Math.min(verticalRenderEndIndex, totalPages));
    for (let pageIndex = startIndex; pageIndex < endIndex; pageIndex++) {
      loadPage(pageIndex);
    }
  }, [
    direction,
    isLoading,
    loadPage,
    totalPages,
    verticalBufferStartIndex,
    verticalRenderEndIndex,
    verticalRenderStartIndex,
  ]);

  const saveVerticalProgressForPage = useCallback((page: number) => {
    if (!bookId || !currentChapterId || totalPages === 0) return;
    const verticalGlobalPageIndex = imagesBeforeCurrentChapter + page;
    const percentage = getReadingPercentage(verticalGlobalPageIndex, totalImages, DEFAULT_PAGE_SCROLL_RATIO);
    const nextProgress: ReaderProgressSnapshot = {
      bookId,
      chapterId: currentChapterId,
      currentPage: page,
      pageScrollRatio: DEFAULT_PAGE_SCROLL_RATIO,
      chapterScrollRatio: getCurrentChapterScrollRatio(),
      readingMode: 'vertical',
      pageLayout: progressRef.current.pageLayout,
      totalPages,
      globalPageIndex: verticalGlobalPageIndex,
      totalImages,
      percentage,
    };

    progressRef.current = nextProgress;
    setVerticalProgressPercent(percentage);
    updateProgress(bookId, {
      bookId,
      chapterId: currentChapterId,
      page,
      pageScrollRatio: nextProgress.pageScrollRatio,
      chapterScrollRatio: nextProgress.chapterScrollRatio,
      readingMode: nextProgress.readingMode,
      pageLayout: nextProgress.pageLayout,
      totalPages,
      percentage,
      globalPageIndex: verticalGlobalPageIndex,
      totalImages,
    });
  }, [
    bookId,
    currentChapterId,
    getCurrentChapterScrollRatio,
    imagesBeforeCurrentChapter,
    totalImages,
    totalPages,
    progressRef,
    updateProgress,
  ]);

  /** 向上扩窗：prepend 上一页并补偿 scrollTop，避免视口跳动 */
  const revealPreviousVerticalPage = useCallback(() => {
    if (direction !== 'vertical' || isLoading || isRestoringVerticalScroll) return;
    const container = containerRef.current;
    if (!container) return;
    if (isPrependingVerticalScrollRef.current) return;
    if (verticalRenderStartIndex <= 0) {
      showFirstPageNotice();
      return;
    }

    isPrependingVerticalScrollRef.current = true;
    setProgrammaticScroll(true);
    const previousPageIndex = verticalRenderStartIndex - PAGE_PROGRESS_OFFSET;
    const nextBufferStartIndex = Math.min(verticalBufferStartIndex, previousPageIndex);

    loadPage(previousPageIndex)
      .finally(() => {
        setVerticalBufferStartIndex(nextBufferStartIndex);
        setVerticalRenderStartIndex(previousPageIndex);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const previousPageSlot = container.querySelector(`[data-page-index="${previousPageIndex}"]`);
            if (previousPageSlot) {
              const containerRect = container.getBoundingClientRect();
              const previousPageTop = (previousPageSlot as HTMLElement).getBoundingClientRect().top - containerRect.top;
              container.scrollTop += previousPageTop;
            }
            saveVerticalProgressForPage(previousPageIndex + PAGE_PROGRESS_OFFSET);
            requestAnimationFrame(() => {
              isPrependingVerticalScrollRef.current = false;
              setProgrammaticScroll(false);
            });
          });
        });
      });
  }, [
    direction,
    isLoading,
    isRestoringVerticalScroll,
    loadPage,
    saveVerticalProgressForPage,
    setProgrammaticScroll,
    showFirstPageNotice,
    containerRef,
    verticalBufferStartIndex,
    verticalRenderStartIndex,
  ]);

  // ── 跨章晋升：续读区（分割线 + 下一章头部页）进入视口时无缝并入下一章 ──

  /** 测量晋升落点：移除高度（分割线以上全部内容）与锚点在下一章内的页内落点 */
  const measurePromotion = useCallback(
    (ignoreVisibility: boolean) => {
      if (!continuation?.prefetchUrls || continuation.prefetchUrls[0] === null) return null;
      const container = containerRef.current;
      if (!container) return null;
      const firstAppendedSlot = container.querySelector('[data-appended-index="0"]');
      if (!firstAppendedSlot) return null;

      const containerRect = container.getBoundingClientRect();
      const firstAppendedTop =
        (firstAppendedSlot as HTMLElement).getBoundingClientRect().top - containerRect.top + container.scrollTop;
      // 视口顶边抵达分割线才晋升：此后「新 scrollTop = 旧 scrollTop - 移除高度」
      // 恒成立，画面像素级连续；更早触发会把尚在视口里的上一章内容顶出屏幕
      if (!ignoreVisibility && firstAppendedTop - container.scrollTop > PROMOTION_LEAD_PX) {
        return null;
      }

      // 阅读锚点若已越过分割线，说明快速滚动越界：反解下一章内的起始页与页内比例
      const readingAnchor = containerRect.top + containerRect.height * READING_ANCHOR_RATIO;
      let startPage = 1;
      let pageScrollRatio = DEFAULT_PAGE_SCROLL_RATIO;
      container.querySelectorAll('[data-appended-index]').forEach((slot) => {
        const el = slot as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.height === 0) return;
        if (rect.top <= readingAnchor && rect.bottom > readingAnchor) {
          startPage = Number(el.dataset.appendedIndex) + PAGE_PROGRESS_OFFSET;
          pageScrollRatio = clampPageScrollRatio((readingAnchor - rect.top) / rect.height);
        }
      });
      return { startPage, pageScrollRatio, removedHeight: firstAppendedTop };
    },
    [continuation, containerRef]
  );

  const tryPromoteNextChapter = useCallback(
    (ignoreVisibility: boolean): boolean => {
      if (direction !== 'vertical') return false;
      if (isPromotingNextChapterRef.current || isPrependingVerticalScrollRef.current) return false;
      if (isRestoringVerticalScroll || !initialScrollDoneRef.current) return false;
      const measurement = measurePromotion(ignoreVisibility);
      if (!measurement || !continuation) return false;
      const { startPage, pageScrollRatio, removedHeight } = measurement;
      if (!continuation.promote(startPage)) return false;

      const startIndex = Math.max(0, startPage - PAGE_PROGRESS_OFFSET);
      const oldScrollTop = containerRef.current?.scrollTop ?? DEFAULT_PAGE_SCROLL_RATIO;

      isPromotingNextChapterRef.current = true;
      // 冻结上拉扩窗与滚动进度写入，等新章挂载、进度 effect 重挂后自然接管
      isPrependingVerticalScrollRef.current = true;
      skipNextChapterResetRef.current = true;
      setProgrammaticScroll(true);
      setVerticalBufferStartIndex(Math.max(0, startIndex - VERTICAL_PREPEND_BATCH_SIZE));
      setVerticalRenderStartIndex(startIndex);
      setVerticalRenderEndIndex(startIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
      initialScrollDoneRef.current = true;
      initialScrollRestoreKeyRef.current = `${bookId ?? ''}:${continuation.chapterId}:${continuation.pageCount}`;

      const finishPromotion = () => {
        setTimeout(() => {
          isPrependingVerticalScrollRef.current = false;
          isPromotingNextChapterRef.current = false;
          setProgrammaticScroll(false);
        }, LAYOUT_STABLE_DELAY);
      };
      // 等 React 提交新章 DOM（条带章标识切换、目标页槽位就位）后再落滚动位置。
      // 不能用「续读槽位消失」判定：晋升后新章自己的续读区可能随即渲染同名槽位。
      const applyPromotedScroll = (attempt: number) => {
        const container = containerRef.current;
        if (!container) {
          finishPromotion();
          return;
        }
        const stripChapter = container.querySelector('[data-strip-chapter]')?.getAttribute('data-strip-chapter');
        const targetSlot = container.querySelector(`[data-page-index="${startIndex}"]`);
        if (stripChapter !== continuation.chapterId || !targetSlot) {
          if (attempt > PROMOTION_SCROLL_MAX_ATTEMPTS) {
            finishPromotion();
            return;
          }
          requestAnimationFrame(() => applyPromotedScroll(attempt + 1));
          return;
        }
        if (startPage === PAGE_PROGRESS_OFFSET) {
          // 常规路径：视口尚未越过分割线太深，减去被移除的上方高度即保持原画面
          container.scrollTop = Math.max(DEFAULT_PAGE_SCROLL_RATIO, oldScrollTop - removedHeight);
        } else {
          // 快速滚动越界：按页内落点直接定位（窗口已重建到目标页）
          const containerRect = container.getBoundingClientRect();
          const slotRect = (targetSlot as HTMLElement).getBoundingClientRect();
          const anchorOffset = containerRect.height * READING_ANCHOR_RATIO;
          const target =
            slotRect.top - containerRect.top + container.scrollTop + pageScrollRatio * slotRect.height - anchorOffset;
          container.scrollTo({
            top: Math.max(0, Math.min(target, container.scrollHeight - container.clientHeight)),
            behavior: 'instant',
          });
        }
        finishPromotion();
      };
      requestAnimationFrame(() => applyPromotedScroll(0));
      return true;
    },
    [bookId, continuation, direction, isRestoringVerticalScroll, measurePromotion, containerRef, setProgrammaticScroll]
  );

  // ── 换章复位：抽屉选章等路径换章后，窗口与滚动归位到新章（跨章晋升自行接管时让位） ──
  useEffect(() => {
    const chapterKey = `${bookId ?? ''}:${currentChapterId ?? ''}`;
    if (lastChapterKeyRef.current === chapterKey) return;
    const isFirstObservation = lastChapterKeyRef.current === '';
    lastChapterKeyRef.current = chapterKey;
    if (isFirstObservation || direction !== 'vertical') return;
    if (skipNextChapterResetRef.current) {
      skipNextChapterResetRef.current = false;
      return;
    }

    const startIndex = Math.max(0, currentPage - PAGE_PROGRESS_OFFSET);
    setVerticalBufferStartIndex(Math.max(0, startIndex - VERTICAL_PREPEND_BATCH_SIZE));
    setVerticalRenderStartIndex(startIndex);
    setVerticalRenderEndIndex(startIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
    setVerticalProgressPercent(null);
    if (currentPage <= PAGE_PROGRESS_OFFSET) {
      const container = containerRef.current;
      if (container) container.scrollTop = DEFAULT_PAGE_SCROLL_RATIO;
      initialScrollDoneRef.current = true;
      initialScrollRestoreKeyRef.current = `${chapterKey}:${totalPages}`;
    }
  }, [bookId, currentChapterId, currentPage, direction, totalPages, containerRef]);

  // ── 边界回滚：滚轮/触摸上拉到窗口顶端时向上扩窗 ──
  useEffect(() => {
    if (
      isLoading ||
      direction !== 'vertical' ||
      isRestoringVerticalScroll ||
      !initialScrollDoneRef.current
    ) return;
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = DEFAULT_PAGE_SCROLL_RATIO;
    const isReaderEvent = (event: Event): boolean =>
      event.target instanceof Node && container.contains(event.target);

    const handleWheel = (event: WheelEvent) => {
      if (!isReaderEvent(event)) return;
      if (event.deltaY < DEFAULT_PAGE_SCROLL_RATIO) {
        if (container.scrollTop <= VERTICAL_PREPEND_THRESHOLD) {
          event.preventDefault();
        }
        revealPreviousVerticalPage();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (!isReaderEvent(event)) return;
      touchStartY = event.touches[0]?.clientY ?? DEFAULT_PAGE_SCROLL_RATIO;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isReaderEvent(event)) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      if (currentY - touchStartY > TOUCH_MOVE_THRESHOLD) {
        if (container.scrollTop <= VERTICAL_PREPEND_THRESHOLD) {
          event.preventDefault();
        }
        revealPreviousVerticalPage();
        touchStartY = currentY;
      }
    };

    const handleScroll = () => {
      if (container.scrollTop <= VERTICAL_PREPEND_THRESHOLD) {
        revealPreviousVerticalPage();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel, { capture: true });
      window.removeEventListener('touchstart', handleTouchStart, { capture: true });
      window.removeEventListener('touchmove', handleTouchMove, { capture: true });
      isPrependingVerticalScrollRef.current = false;
      setProgrammaticScroll(false);
    };
  }, [
    direction,
    isLoading,
    isRestoringVerticalScroll,
    revealPreviousVerticalPage,
    containerRef,
    setProgrammaticScroll,
  ]);

  // ── 向下扩窗：接近底部时 append 批量页；触底后转入跨章续读（预取 + 晋升检查） ──
  useEffect(() => {
    if (isLoading || direction !== 'vertical' || totalPages <= 0) return;
    const container = containerRef.current;
    if (!container) return;

    const appendNextPages = () => {
      if (verticalRenderEndIndex >= totalPages) {
        continuation?.requestPrefetch();
        tryPromoteNextChapter(false);
        return;
      }
      const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceToBottom > VERTICAL_APPEND_THRESHOLD) return;
      setVerticalRenderEndIndex((endIndex) =>
        Math.min(totalPages, Math.max(endIndex, verticalRenderStartIndex + 1) + VERTICAL_APPEND_BATCH_SIZE)
      );
    };

    container.addEventListener('scroll', appendNextPages, { passive: true });
    appendNextPages();

    return () => {
      container.removeEventListener('scroll', appendNextPages);
    };
  }, [
    continuation,
    direction,
    isLoading,
    containerRef,
    totalPages,
    verticalRenderEndIndex,
    verticalRenderStartIndex,
    tryPromoteNextChapter,
  ]);

  // ── 预取就绪而用户停在章末：补一次晋升检查（无新滚动事件也能接上） ──
  useEffect(() => {
    if (direction !== 'vertical' || isLoading || totalPages <= 0) return;
    if (!continuation?.prefetchUrls || verticalRenderEndIndex < totalPages) return;
    tryPromoteNextChapter(false);
  }, [continuation, direction, isLoading, totalPages, verticalRenderEndIndex, tryPromoteNextChapter]);

  // ── 视口内页槽懒加载（IntersectionObserver） ──
  useEffect(() => {
    if (direction !== 'vertical' || totalPages === 0 || isLoading) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = Number((entry.target as HTMLElement).dataset.pageIndex);
            if (!isNaN(pageIndex)) {
              loadPage(pageIndex);
            }
          }
        });
      },
      {
        root: container,
        rootMargin: INTERSECTION_ROOT_MARGIN,
      }
    );

    const slots = container.querySelectorAll('[data-page-index]');
    slots.forEach((slot) => observer.observe(slot));

    return () => observer.disconnect();
  }, [direction, totalPages, isLoading, loadPage, containerRef]);

  // ── 初始进度恢复：等图片布局稳定后校准滚动落点 ──
  useEffect(() => {
    if (direction !== 'vertical' || totalPages === 0 || isLoading) {
      return;
    }
    const restoreKey = `${bookId ?? ''}:${currentChapterId ?? ''}:${totalPages}`;
    if (initialScrollRestoreKeyRef.current === restoreKey) {
      return;
    }

    const targetPage = currentPage;
    if (targetPage <= 1) {
      initialScrollRestoreKeyRef.current = restoreKey;
      initialScrollDoneRef.current = true;
      return;
    }

    initialScrollRestoreKeyRef.current = restoreKey;
    initialScrollDoneRef.current = false;
    setIsRestoringVerticalScroll(true);
    setProgrammaticScroll(true);
    let cancelled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let layoutCheckTimer: ReturnType<typeof setTimeout> | null = null;

    const onScrollSettled = () => {
      if (!cancelled) {
        initialScrollDoneRef.current = true;
        setIsRestoringVerticalScroll(false);
        setProgrammaticScroll(false);
      }
    };

    const scrollToTarget = () => {
      if (cancelled) return;
      const container = containerRef.current;
      if (!container) return;
      const targetSlot = container.querySelector(`[data-page-index="${targetPage - 1}"]`);
      if (!targetSlot) return;
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetSlot?.getBoundingClientRect();
      const pageTop = targetRect
        ? targetRect.top - containerRect.top + container.scrollTop
        : DEFAULT_PAGE_SCROLL_RATIO;
      container.scrollTo({ top: pageTop, behavior: 'instant' });
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(onScrollSettled, INITIAL_SCROLL_SETTLE_DELAY);
    };

    const onImageLoaded = () => {
      if (cancelled) return;
      if (layoutCheckTimer) clearTimeout(layoutCheckTimer);
      layoutCheckTimer = setTimeout(() => {
        if (!cancelled) {
          scrollToTarget();
        }
      }, LAYOUT_STABLE_DELAY);
    };

    const loadPagesBeforeTarget = async () => {
      const pageLoadTasks: Promise<void>[] = [];
      const startPageIndex = Math.max(0, targetPage - PAGE_PROGRESS_OFFSET);
      const endPageIndex = Math.min(totalPages, startPageIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
      for (let pageIndex = startPageIndex; pageIndex < endPageIndex; pageIndex++) {
        pageLoadTasks.push(loadPage(pageIndex));
      }
      await Promise.all(pageLoadTasks);
    };

    const attemptScroll = () => {
      if (cancelled) return;
      const container = containerRef.current;
      if (!container) {
        setTimeout(attemptScroll, SCROLL_RETRY_INTERVAL);
        return;
      }

      const targetSlot = container.querySelector(`[data-page-index="${targetPage - 1}"]`);
      if (!targetSlot) {
        setTimeout(attemptScroll, SCROLL_RETRY_INTERVAL);
        return;
      }

      const restoreSlots = Array.from(container.querySelectorAll('[data-page-index]'))
        .filter((slot) => {
          const pageIndex = Number((slot as HTMLElement).dataset.pageIndex);
          const targetIndex = targetPage - PAGE_PROGRESS_OFFSET;
          return !isNaN(pageIndex) && pageIndex >= targetIndex && pageIndex < targetIndex + VERTICAL_RESTORE_PRELOAD_COUNT;
        });
      const restoreImages = restoreSlots
        .map((slot) => slot.querySelector('img'))
        .filter((img): img is HTMLImageElement => img !== null);

      if (restoreImages.length === 0) {
        setTimeout(attemptScroll, SCROLL_RETRY_INTERVAL);
        return;
      }

      restoreImages.forEach((img) => {
        if (!img.complete || img.naturalHeight === 0) {
          img.addEventListener('load', onImageLoaded, { once: true });
        }
      });

      const hasUnreadyImage = restoreImages.some((img) => !img.complete || img.naturalHeight === 0);
      if (hasUnreadyImage) {
        const targetImg = targetSlot?.querySelector('img') ?? restoreImages.find((img) => !img.complete || img.naturalHeight === 0);
        if (!targetImg) {
          setTimeout(attemptScroll, SCROLL_RETRY_INTERVAL);
          return;
        }
        const onLoad = () => {
          cleanup();
          requestAnimationFrame(() => {
            requestAnimationFrame(scrollToTarget);
          });
        };
        const onError = () => {
          cleanup();
          initialScrollDoneRef.current = true;
          setIsRestoringVerticalScroll(false);
          setProgrammaticScroll(false);
        };
        const cleanup = () => {
          targetImg.removeEventListener('load', onLoad);
          targetImg.removeEventListener('error', onError);
        };
        targetImg.addEventListener('load', onLoad, { once: false });
        targetImg.addEventListener('error', onError, { once: true });
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToTarget);
      });
    };

    loadPagesBeforeTarget()
      .then(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(attemptScroll);
        });
      })
      .catch(() => {
        initialScrollDoneRef.current = true;
        setIsRestoringVerticalScroll(false);
        setProgrammaticScroll(false);
      });

    return () => {
      cancelled = true;
      if (settleTimer) clearTimeout(settleTimer);
      if (layoutCheckTimer) clearTimeout(layoutCheckTimer);
      setIsRestoringVerticalScroll(false);
      setProgrammaticScroll(false);
    };
  }, [
    bookId,
    currentChapterId,
    direction,
    totalPages,
    currentPage,
    isLoading,
    loadPage,
    containerRef,
    setProgrammaticScroll,
  ]);

  // ── 跳页：扩渲染窗口 → 预载周边页 → 滚动到页槽位（垂直模式的视口必须由这里驱动） ──
  const verticalJumpTokenRef = useRef(0);
  const jumpToVerticalPage = useCallback((targetPage: number, pageScrollRatio = DEFAULT_PAGE_SCROLL_RATIO) => {
    const page = Math.max(1, Math.min(targetPage, totalPages));
    if (totalPages === 0 || page === currentPage) return;
    const inPageRatio = clampPageScrollRatio(pageScrollRatio);
    verticalJumpTokenRef.current += 1;
    const token = verticalJumpTokenRef.current;
    const isStale = () => token !== verticalJumpTokenRef.current;

    goToPage(page);
    setVerticalBufferStartIndex(Math.max(0, page - PAGE_PROGRESS_OFFSET - VERTICAL_PREPEND_BATCH_SIZE));
    setVerticalRenderStartIndex(Math.max(0, page - PAGE_PROGRESS_OFFSET));
    setVerticalRenderEndIndex(page - PAGE_PROGRESS_OFFSET + VERTICAL_RESTORE_PRELOAD_COUNT);
    setProgrammaticScroll(true);
    setIsRestoringVerticalScroll(true);

    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    let layoutTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (isStale()) return;
      setIsRestoringVerticalScroll(false);
      setProgrammaticScroll(false);
    };
    const scrollToTarget = () => {
      if (isStale()) return;
      const container = containerRef.current;
      if (!container) return;
      const slot = container.querySelector(`[data-page-index="${page - 1}"]`);
      if (!slot) return;
      const containerRect = container.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      // 页内落点：进度条语义 pageScrollRatio = (scrollTop + 阅读锚点 - 页顶)/页高，
      // 反解出目标 scrollTop，使松手后拇指与视口逐像素一致
      const pageTop = slotRect.top - containerRect.top + container.scrollTop;
      const anchorOffset = containerRect.height * READING_ANCHOR_RATIO;
      const target = pageTop + inPageRatio * slotRect.height - anchorOffset;
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTo({ top: Math.max(0, Math.min(target, maxScroll)), behavior: 'instant' });
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(finish, INITIAL_SCROLL_SETTLE_DELAY);
    };
    const attempt = () => {
      if (isStale()) return;
      const container = containerRef.current;
      if (!container || !container.querySelector(`[data-page-index="${page - 1}"]`)) {
        setTimeout(attempt, SCROLL_RETRY_INTERVAL);
        return;
      }
      scrollToTarget();
      // 图片加载会改变槽位高度：布局稳定后再校准一次
      if (layoutTimer) clearTimeout(layoutTimer);
      layoutTimer = setTimeout(scrollToTarget, LAYOUT_STABLE_DELAY);
    };

    const start = Math.max(0, page - PAGE_PROGRESS_OFFSET);
    const end = Math.min(totalPages, start + VERTICAL_RESTORE_PRELOAD_COUNT);
    const tasks: Promise<void>[] = [];
    for (let i = start; i < end; i++) tasks.push(loadPage(i));
    void Promise.all(tasks).then(() => {
      if (!isStale()) attempt();
    });
  }, [totalPages, currentPage, goToPage, setProgrammaticScroll, loadPage, containerRef]);

  /** 手动跨章晋升（续读分割线点击）：无视视口位置直接并入下一章 */
  const promoteNextChapterNow = useCallback(() => tryPromoteNextChapter(true), [tryPromoteNextChapter]);

  return {
    /** 是否正在恢复/跳转滚动（期间暂停用户手势驱动的窗口扩张与进度覆盖） */
    isRestoringVerticalScroll,
    /** 垂直模式实时百分比（null = 未启用/未知，由调用方回退） */
    verticalProgressPercent,
    /** 当前渲染窗口内的页索引列表 */
    verticalPageIndices: Array.from(
      {
        length: Math.max(
          0,
          Math.min(verticalRenderEndIndex, totalPages) - Math.max(0, verticalRenderStartIndex)
        ),
      },
      (_, idx) => Math.max(0, verticalRenderStartIndex) + idx
    ),
    /** 渲染窗口已触达本章末页：渲染跨章续读区（分割线 + 下一章头部页）或完结卡 */
    verticalAppendReady:
      direction === 'vertical' && totalPages > 0 && verticalRenderEndIndex >= totalPages,
    /** 向上扩窗（触摸上拉捕获手势复用） */
    revealPreviousVerticalPage,
    /** 渲染窗口起始索引（图片 loading eager/lazy 判定用） */
    verticalRenderStartIndex,
    /** 触摸捕获手势的 Y 起点（供 <main> 的 touchstart/touchmove 捕获处理） */
    verticalTouchStartYRef,
    /** 垂直模式跳页（含页内落点） */
    jumpToVerticalPage,
    /** 开书/换章初始化窗口 */
    initializeWindow,
    /** 水平 → 垂直切换时重置窗口 */
    resetForVerticalEntry,
    /** 清空垂直百分比展示 */
    clearVerticalProgress,
    /** 初始滚动是否已完成（未完成期间进度恢复值优先于实测值） */
    initialScrollDoneRef,
    /** 跨章晋升进行中（滚动补偿未落位，期间不要按 DOM 实测写进度） */
    promotionActiveRef: isPromotingNextChapterRef,
    /** 手动跨章晋升（续读分割线点击）：无视视口位置直接并入下一章 */
    promoteNextChapterNow,
  };
}
