import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FullscreenViewer } from '@/components/molecules/FullscreenViewer';
import { ReaderBottomBar } from '@/components/molecules/ReaderBottomBar';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useReaderStore } from '@/stores/useReaderStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { useAppStore } from '@/stores/useAppStore';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { cn } from '@/utils/cn';
import { getPaperConfig } from '@/utils/paperTexture';

const LONG_PRESS_DURATION = 500;
const UI_ANIMATION_DURATION = 300;
const PERCENT_MULTIPLIER = 100;
const TOUCH_MOVE_THRESHOLD = 10;
const SWIPE_THRESHOLD = 50;
const STATS_RECORD_INTERVAL = 60000;
const MS_PER_MINUTE = 60000;
const CLICK_REGION_RATIO = 1 / 3;
const SWIPE_TIMEOUT = 500;
const SCROLL_RETRY_INTERVAL = 150;
const LAYOUT_STABLE_DELAY = 100;
const INITIAL_SCROLL_SETTLE_DELAY = 600;
const INTERSECTION_ROOT_MARGIN = '800px 0px';
const DOUBLE_CLICK_THRESHOLD = 300;
const PROGRESS_SAVE_DEBOUNCE = 300;
const VERTICAL_RESTORE_PRELOAD_COUNT = 8;
const VERTICAL_PREPEND_BATCH_SIZE = 6;
const VERTICAL_APPEND_BATCH_SIZE = 8;
const VERTICAL_PREPEND_THRESHOLD = 120;
const VERTICAL_APPEND_THRESHOLD = 600;
const FIRST_PAGE_NOTICE_DURATION = 1600;
const DEFAULT_PAGE_SCROLL_RATIO = 0;
const MAX_PAGE_SCROLL_RATIO = 1;
const PAGE_PROGRESS_OFFSET = 1;
const READING_ANCHOR_RATIO = 0.2;

const clampPageScrollRatio = (ratio: number): number =>
  Math.max(DEFAULT_PAGE_SCROLL_RATIO, Math.min(MAX_PAGE_SCROLL_RATIO, ratio));

const getReadingPercentage = (
  globalPageIndex: number,
  totalImages: number,
  pageScrollRatio: number,
  readingMode: 'vertical' | 'horizontal'
): number => {
  if (totalImages <= 0) return DEFAULT_PAGE_SCROLL_RATIO;
  const pageProgress = readingMode === 'vertical'
    ? globalPageIndex - PAGE_PROGRESS_OFFSET + pageScrollRatio
    : globalPageIndex;
  return (pageProgress / totalImages) * PERCENT_MULTIPLIER;
};

export const ReaderPage: React.FC = () => {
  const navigate = useNavigate();
  const { comicId, chapterId } = useParams<{ comicId: string; chapterId?: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isTogglingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const readingStartTimeRef = useRef<number>(0);
  const lastStatsRecordRef = useRef<number>(0);
  const progressRef = useRef({
    comicId: '',
    chapterId: '',
    currentPage: 1,
    pageScrollRatio: DEFAULT_PAGE_SCROLL_RATIO,
    chapterScrollRatio: DEFAULT_PAGE_SCROLL_RATIO,
    readingMode: 'vertical' as 'vertical' | 'horizontal',
    pageLayout: 'single' as 'single' | 'double',
    totalPages: 0,
    globalPageIndex: 1,
    totalImages: 0,
    percentage: DEFAULT_PAGE_SCROLL_RATIO,
  });
  const initialScrollDoneRef = useRef(false);
  const initialScrollRestoreKeyRef = useRef('');
  const initialPageScrollRatioRef = useRef(DEFAULT_PAGE_SCROLL_RATIO);
  const initialChapterScrollRatioRef = useRef(DEFAULT_PAGE_SCROLL_RATIO);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstPageNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPrependingVerticalScrollRef = useRef(false);
  const verticalTouchStartYRef = useRef(DEFAULT_PAGE_SCROLL_RATIO);
  const lastClickTimeRef = useRef<number>(0);
  const lastClickPageIndexRef = useRef<number>(-1);
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingProgressRef = useRef(false);
  const dragPageRef = useRef<number | null>(null);
  const [dragPage, setDragPage] = useState<number | null>(null);
  const [uiAnimating, setUiAnimating] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [showChapterEnd, setShowChapterEnd] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [verticalProgressPercent, setVerticalProgressPercent] = useState<number | null>(null);
  const [isRestoringVerticalScroll, setIsRestoringVerticalScroll] = useState(false);
  const [verticalBufferStartIndex, setVerticalBufferStartIndex] = useState(0);
  const [verticalRenderStartIndex, setVerticalRenderStartIndex] = useState(0);
  const [verticalRenderEndIndex, setVerticalRenderEndIndex] = useState(VERTICAL_RESTORE_PRELOAD_COUNT);
  const [readerNotice, setReaderNotice] = useState<string | null>(null);

  const {
    currentPage,
    currentChapterId,
    totalPages,
    direction,
    pageLayout,
    isUiVisible,
    pageUrls,
    chapterTitle,
    chapters,
    isLoading,
    fullscreenImageUrl,
    fullscreenPageIndex,
    isBottomBarVisible,
    openComic,
    openChapter,
    setPageLayout,
    toggleUi,
    setDirection,
    nextPage,
    prevPage,
    goToPage,
    closeReader,
    openFullscreen,
    closeFullscreen,
    setBottomBarVisible,
    loadPage,
  } = useReaderStore();

  const {
    containerRef: smoothScrollContainerRef,
    setProgrammaticScroll,
  } = useSmoothScroll({
    direction,
    onPageChange: goToPage,
    currentPage,
    totalPages,
    isActive: !isLoading,
  });
  const { updateProgress, getComicById, toggleFavorite } = useLibraryStore();
  const { addReadingSession } = useStatsStore();
  const { settings } = useAppStore();
  const readingDirection = settings.readingDirection;
  const pageTurnGestures = settings.pageTurnGestures;
  const paperModeEnabled = settings.paperMode;
  const textureIntensity = settings.textureIntensity;
  const paperType = settings.paperType;
  const brightness = settings.brightness;
  const colorTemperature = settings.colorTemperature;

  const displayFilter = useMemo(() => {
    const filters: string[] = [];
    if (brightness < 100) filters.push(`brightness(${brightness / 100})`);
    if (colorTemperature > 0) {
      const sepiaValue = colorTemperature / 100 * 0.4;
      filters.push(`sepia(${sepiaValue})`);
    }
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [brightness, colorTemperature]);

  const currentChapterIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
    ? chapters[currentChapterIndex + 1]
    : null;

  const comic = comicId ? getComicById(comicId) : undefined;
  const totalImages = chapters.reduce((sum, ch) => sum + ch.pages.length, 0) || totalPages;
  const imagesBeforeCurrentChapter = chapters
    .slice(0, Math.max(0, currentChapterIndex))
    .reduce((sum, ch) => sum + ch.pages.length, 0);
  const globalPageIndex = imagesBeforeCurrentChapter + currentPage;

  const getCurrentVerticalReadingPosition = useCallback(() => {
    if (direction !== 'vertical') return null;
    const container = smoothScrollContainerRef.current;
    if (!container) return null;

    const containerRect = container.getBoundingClientRect();
    const readingAnchorOffset = containerRect.height * READING_ANCHOR_RATIO;
    const readingAnchor = containerRect.top + readingAnchorOffset;
    const slots = container.querySelectorAll('[data-page-index]');

    let targetSlot: HTMLElement | null = null;
    let minDistance = Infinity;

    for (const slot of slots) {
      const el = slot as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (rect.height === DEFAULT_PAGE_SCROLL_RATIO) continue;
      const distance = Math.abs(rect.top - readingAnchor);
      if (rect.top <= readingAnchor && rect.bottom > readingAnchor) {
        targetSlot = el;
        break;
      }
      if (!targetSlot && distance < minDistance) {
        minDistance = distance;
        targetSlot = el;
      }
    }

    if (!targetSlot) return null;

    const page = Number(targetSlot.dataset.pageIndex) + PAGE_PROGRESS_OFFSET;
    if (isNaN(page)) return null;

    const targetRect = (targetSlot as HTMLElement).getBoundingClientRect();
    const pageTop = targetRect.top - containerRect.top + container.scrollTop;
    const pageHeight = Math.max(DEFAULT_PAGE_SCROLL_RATIO, targetRect.height);

    if (pageHeight === DEFAULT_PAGE_SCROLL_RATIO) {
      return { page, pageScrollRatio: DEFAULT_PAGE_SCROLL_RATIO };
    }

    return {
      page,
      pageScrollRatio: clampPageScrollRatio((container.scrollTop + readingAnchorOffset - pageTop) / pageHeight),
    };
  }, [direction, smoothScrollContainerRef]);

  const getCurrentPageScrollRatio = useCallback(() => {
    return getCurrentVerticalReadingPosition()?.pageScrollRatio ?? progressRef.current.pageScrollRatio;
  }, [getCurrentVerticalReadingPosition]);

  const getCurrentChapterScrollRatio = useCallback(() => {
    if (direction !== 'vertical') return DEFAULT_PAGE_SCROLL_RATIO;
    const container = smoothScrollContainerRef.current;
    if (!container) return progressRef.current.chapterScrollRatio;

    const scrollableDistance = container.scrollHeight - container.clientHeight;
    if (scrollableDistance <= DEFAULT_PAGE_SCROLL_RATIO) {
      return DEFAULT_PAGE_SCROLL_RATIO;
    }

    return clampPageScrollRatio(container.scrollTop / scrollableDistance);
  }, [direction, smoothScrollContainerRef]);

  useEffect(() => {
    if (direction === 'horizontal' && currentPage >= totalPages && totalPages > 0 && nextChapter) {
      setShowChapterEnd(true);
    } else {
      setShowChapterEnd(false);
    }
  }, [currentPage, totalPages, direction, nextChapter]);

  useEffect(() => {
    if (isUiVisible) {
      setUiAnimating(true);
      requestAnimationFrame(() => {
        setUiVisible(true);
      });
    } else {
      setUiVisible(false);
      const timer = setTimeout(() => setUiAnimating(false), UI_ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isUiVisible]);

  useEffect(() => {
    if (comicId) {
      const progress = useLibraryStore.getState().readingProgress[comicId];
      initialScrollDoneRef.current = false;
      initialScrollRestoreKeyRef.current = '';
      initialPageScrollRatioRef.current = progress && (!chapterId || progress.chapterId === chapterId)
        ? clampPageScrollRatio(progress.pageScrollRatio ?? DEFAULT_PAGE_SCROLL_RATIO)
        : DEFAULT_PAGE_SCROLL_RATIO;
      initialChapterScrollRatioRef.current = progress && (!chapterId || progress.chapterId === chapterId)
        ? clampPageScrollRatio(progress.chapterScrollRatio ?? DEFAULT_PAGE_SCROLL_RATIO)
        : DEFAULT_PAGE_SCROLL_RATIO;
      const initialVerticalTargetIndex = progress?.readingMode === 'vertical' && (!chapterId || progress.chapterId === chapterId)
        ? Math.max(0, (progress.page || 1) - 1)
        : 0;
      setVerticalBufferStartIndex(Math.max(0, initialVerticalTargetIndex - VERTICAL_PREPEND_BATCH_SIZE));
      setVerticalRenderStartIndex(initialVerticalTargetIndex);
      setVerticalRenderEndIndex(initialVerticalTargetIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
      if (progress?.readingMode) {
        setDirection(progress.readingMode);
      }
      if (progress?.pageLayout) {
        setPageLayout(progress.pageLayout);
      }
      openComic(comicId, chapterId);
      readingStartTimeRef.current = Date.now();
      lastStatsRecordRef.current = Date.now();
    }

    const statsTimer = setInterval(() => {
      if (comicId && lastStatsRecordRef.current > 0) {
        const now = Date.now();
        const elapsed = now - lastStatsRecordRef.current;
        if (elapsed >= MS_PER_MINUTE) {
          const minutes = Math.round(elapsed / MS_PER_MINUTE);
          addReadingSession(comicId, minutes);
          lastStatsRecordRef.current = now;
        }
      }
    }, STATS_RECORD_INTERVAL);

    return () => {
      clearInterval(statsTimer);
      if (readingStartTimeRef.current > 0 && comicId) {
        const now = Date.now();
        const elapsedSinceLastRecord = now - lastStatsRecordRef.current;
        if (elapsedSinceLastRecord >= MS_PER_MINUTE * 0.5) {
          const minutes = Math.max(1, Math.round(elapsedSinceLastRecord / MS_PER_MINUTE));
          addReadingSession(comicId, minutes);
        }
      }
      const lastProgress = progressRef.current;
      if (lastProgress.comicId && lastProgress.currentPage > 0 && lastProgress.totalPages > 0 && lastProgress.chapterId) {
        updateProgress(lastProgress.comicId, {
          comicId: lastProgress.comicId,
          chapterId: lastProgress.chapterId,
          page: lastProgress.currentPage,
          pageScrollRatio: lastProgress.pageScrollRatio,
          chapterScrollRatio: lastProgress.chapterScrollRatio,
          readingMode: lastProgress.readingMode,
          pageLayout: lastProgress.pageLayout,
          totalPages: lastProgress.totalPages,
          percentage: lastProgress.percentage,
          globalPageIndex: lastProgress.globalPageIndex,
          totalImages: lastProgress.totalImages,
        });
      }
      closeReader();
    };
  }, [comicId, chapterId, openComic, closeReader, addReadingSession, updateProgress, setDirection, setPageLayout]);

  useEffect(() => {
    if (comicId && currentPage > 0 && totalPages > 0 && currentChapterId) {
      const pageScrollRatio = direction === 'vertical' && !initialScrollDoneRef.current
        ? initialPageScrollRatioRef.current
        : getCurrentPageScrollRatio();
      const chapterScrollRatio = direction === 'vertical' && !initialScrollDoneRef.current
        ? initialChapterScrollRatioRef.current
        : getCurrentChapterScrollRatio();
      const percentage = getReadingPercentage(globalPageIndex, totalImages, pageScrollRatio, direction);
      progressRef.current = {
        comicId,
        chapterId: currentChapterId,
        currentPage,
        pageScrollRatio,
        chapterScrollRatio,
        readingMode: direction,
        pageLayout,
        totalPages,
        globalPageIndex,
        totalImages,
        percentage,
      };
      updateProgress(comicId, {
        comicId,
        chapterId: currentChapterId,
        page: currentPage,
        pageScrollRatio,
        chapterScrollRatio,
        readingMode: direction,
        pageLayout,
        totalPages,
        percentage,
        globalPageIndex,
        totalImages,
      });
    }
  }, [
    comicId,
    currentChapterId,
    currentPage,
    totalPages,
    globalPageIndex,
    totalImages,
    imagesBeforeCurrentChapter,
    direction,
    pageLayout,
    getCurrentPageScrollRatio,
    getCurrentChapterScrollRatio,
    updateProgress,
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (direction !== 'vertical') {
      setVerticalProgressPercent(null);
      return;
    }
    const container = smoothScrollContainerRef.current;
    if (!container) return;

    const updateVerticalProgress = () => {
      if (isPrependingVerticalScrollRef.current) return;
      const position = getCurrentVerticalReadingPosition();
      if (!position || !comicId || !currentChapterId || totalPages === 0) return;

      const verticalGlobalPageIndex = imagesBeforeCurrentChapter + position.page;
      const chapterScrollRatio = getCurrentChapterScrollRatio();
      const percentage = getReadingPercentage(verticalGlobalPageIndex, totalImages, position.pageScrollRatio, direction);

      progressRef.current = {
        comicId,
        chapterId: currentChapterId,
        currentPage: position.page,
        pageScrollRatio: position.pageScrollRatio,
        chapterScrollRatio,
        readingMode: direction,
        pageLayout,
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
        if (!latestProgress.comicId || !latestProgress.chapterId) return;
        updateProgress(latestProgress.comicId, {
          comicId: latestProgress.comicId,
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
    comicId,
    currentChapterId,
    direction,
    isLoading,
    pageLayout,
    totalPages,
    totalImages,
    imagesBeforeCurrentChapter,
    getCurrentVerticalReadingPosition,
    getCurrentChapterScrollRatio,
    smoothScrollContainerRef,
    updateProgress,
  ]);

  useEffect(() => {
    setZoomScale(1);
  }, [currentPage, currentChapterId]);

  useEffect(() => {
    if (direction !== 'vertical' || totalPages <= 0) return;
    setVerticalBufferStartIndex((startIndex) => Math.max(0, Math.min(startIndex, totalPages - 1)));
    setVerticalRenderStartIndex((startIndex) => Math.max(0, Math.min(startIndex, totalPages - 1)));
    setVerticalRenderEndIndex((endIndex) => Math.max(1, Math.min(endIndex, totalPages)));
  }, [direction, totalPages]);

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

  const showFirstPageNotice = useCallback(() => {
    setReaderNotice('已经到第一页');
    if (firstPageNoticeTimerRef.current) {
      clearTimeout(firstPageNoticeTimerRef.current);
    }
    firstPageNoticeTimerRef.current = setTimeout(() => {
      setReaderNotice(null);
      firstPageNoticeTimerRef.current = null;
    }, FIRST_PAGE_NOTICE_DURATION);
  }, []);

  const saveVerticalProgressForPage = useCallback((page: number) => {
    if (!comicId || !currentChapterId || totalPages === 0) return;
    const verticalGlobalPageIndex = imagesBeforeCurrentChapter + page;
    const percentage = getReadingPercentage(
      verticalGlobalPageIndex,
      totalImages,
      DEFAULT_PAGE_SCROLL_RATIO,
      'vertical'
    );
    const nextProgress = {
      comicId,
      chapterId: currentChapterId,
      currentPage: page,
      pageScrollRatio: DEFAULT_PAGE_SCROLL_RATIO,
      chapterScrollRatio: getCurrentChapterScrollRatio(),
      readingMode: 'vertical' as const,
      pageLayout,
      totalPages,
      globalPageIndex: verticalGlobalPageIndex,
      totalImages,
      percentage,
    };

    progressRef.current = nextProgress;
    setVerticalProgressPercent(percentage);
    updateProgress(comicId, {
      comicId,
      chapterId: currentChapterId,
      page,
      pageScrollRatio: nextProgress.pageScrollRatio,
      chapterScrollRatio: nextProgress.chapterScrollRatio,
      readingMode: nextProgress.readingMode,
      pageLayout,
      totalPages,
      percentage,
      globalPageIndex: verticalGlobalPageIndex,
      totalImages,
    });
  }, [
    comicId,
    currentChapterId,
    getCurrentChapterScrollRatio,
    imagesBeforeCurrentChapter,
    pageLayout,
    totalImages,
    totalPages,
    updateProgress,
  ]);

  const revealPreviousVerticalPage = useCallback(() => {
    if (direction !== 'vertical' || isLoading || isRestoringVerticalScroll) return;
    const container = smoothScrollContainerRef.current;
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
    smoothScrollContainerRef,
    verticalBufferStartIndex,
    verticalRenderStartIndex,
  ]);

  const handleVerticalWheelCapture = useCallback(
    (event: React.WheelEvent<HTMLElement>) => {
      if (direction !== 'vertical' || event.deltaY >= DEFAULT_PAGE_SCROLL_RATIO) return;
      const container = smoothScrollContainerRef.current;
      if (!container || container.scrollTop > VERTICAL_PREPEND_THRESHOLD) return;
      event.preventDefault();
      event.stopPropagation();
      revealPreviousVerticalPage();
    },
    [direction, revealPreviousVerticalPage, smoothScrollContainerRef]
  );

  const handleVerticalTouchStartCapture = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (direction !== 'vertical') return;
      verticalTouchStartYRef.current = event.touches[0]?.clientY ?? DEFAULT_PAGE_SCROLL_RATIO;
    },
    [direction]
  );

  const handleVerticalTouchMoveCapture = useCallback(
    (event: React.TouchEvent<HTMLElement>) => {
      if (direction !== 'vertical') return;
      const container = smoothScrollContainerRef.current;
      if (!container || container.scrollTop > VERTICAL_PREPEND_THRESHOLD) return;
      const currentY = event.touches[0]?.clientY ?? verticalTouchStartYRef.current;
      if (currentY - verticalTouchStartYRef.current <= TOUCH_MOVE_THRESHOLD) return;
      event.preventDefault();
      event.stopPropagation();
      revealPreviousVerticalPage();
      verticalTouchStartYRef.current = currentY;
    },
    [direction, revealPreviousVerticalPage, smoothScrollContainerRef]
  );

  useEffect(() => {
    if (
      isLoading ||
      direction !== 'vertical' ||
      isRestoringVerticalScroll ||
      !initialScrollDoneRef.current
    ) return;
    const container = smoothScrollContainerRef.current;
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
    smoothScrollContainerRef,
    setProgrammaticScroll,
  ]);

  useEffect(() => {
    if (isLoading || direction !== 'vertical' || totalPages <= 0) return;
    const container = smoothScrollContainerRef.current;
    if (!container) return;

    const appendNextPages = () => {
      if (verticalRenderEndIndex >= totalPages) return;
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
    direction,
    isLoading,
    smoothScrollContainerRef,
    totalPages,
    verticalRenderEndIndex,
    verticalRenderStartIndex,
  ]);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const pageStep = pageLayout === 'double' && direction === 'horizontal' ? 2 : 1;

  const goNextPage = useCallback(() => {
    const target = Math.min(currentPage + pageStep, totalPages);
    goToPage(target);
  }, [currentPage, pageStep, totalPages, goToPage]);

  const goPrevPage = useCallback(() => {
    const target = Math.max(currentPage - pageStep, 1);
    goToPage(target);
  }, [currentPage, pageStep, goToPage]);

  const handleImageClick = useCallback(
    (pageIndex: number, e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        isLongPressRef.current = false;
        return;
      }
      if (isTogglingRef.current) {
        isTogglingRef.current = false;
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[data-ui-control]')) return;
      e.stopPropagation();

      const now = Date.now();
      const isDoubleClick =
        now - lastClickTimeRef.current < DOUBLE_CLICK_THRESHOLD &&
        lastClickPageIndexRef.current === pageIndex;

      lastClickTimeRef.current = now;
      lastClickPageIndexRef.current = pageIndex;

      if (isDoubleClick) {
        if (singleClickTimerRef.current) {
          clearTimeout(singleClickTimerRef.current);
          singleClickTimerRef.current = null;
        }
        if (zoomScale > 1) {
          setZoomScale(1);
        } else {
          setZoomScale(2);
          setZoomOrigin({ x: e.clientX, y: e.clientY });
        }
        return;
      }

      if (direction === 'horizontal') {
        const clickX = e.clientX;
        const screenWidth = window.innerWidth;
        const regionWidth = screenWidth * CLICK_REGION_RATIO;
        const isRtl = readingDirection === 'rtl';

        if (clickX < regionWidth) {
          singleClickTimerRef.current = setTimeout(() => {
            singleClickTimerRef.current = null;
            isRtl ? goPrevPage() : goNextPage();
          }, DOUBLE_CLICK_THRESHOLD);
        } else if (clickX > screenWidth - regionWidth) {
          singleClickTimerRef.current = setTimeout(() => {
            singleClickTimerRef.current = null;
            isRtl ? goNextPage() : goPrevPage();
          }, DOUBLE_CLICK_THRESHOLD);
        } else {
          singleClickTimerRef.current = setTimeout(() => {
            singleClickTimerRef.current = null;
            toggleUi();
          }, DOUBLE_CLICK_THRESHOLD);
        }
      } else {
        singleClickTimerRef.current = setTimeout(() => {
          singleClickTimerRef.current = null;
          toggleUi();
        }, DOUBLE_CLICK_THRESHOLD);
      }
    },
    [toggleUi, direction, readingDirection, goNextPage, goPrevPage, zoomScale]
  );

  const handleImageTouchStart = useCallback(
    (_pageIndex: number, e: React.TouchEvent) => {
      isLongPressRef.current = false;
      const touch = e.touches[0];
      const startPos = { x: touch.clientX, y: touch.clientY };

      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        setBottomBarVisible(true);
      }, LONG_PRESS_DURATION);

      if (direction === 'horizontal') {
        touchStartRef.current = {
          x: startPos.x,
          y: startPos.y,
          time: Date.now(),
        };
      }
    },
    [direction, setBottomBarVisible]
  );

  const handleImageTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (longPressTimerRef.current) {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - (touchStartRef.current?.x ?? 0));
        const dy = Math.abs(touch.clientY - (touchStartRef.current?.y ?? 0));
        if (dx > TOUCH_MOVE_THRESHOLD || dy > TOUCH_MOVE_THRESHOLD) {
          clearLongPress();
        }
      }
    },
    [clearLongPress]
  );

  const handleImageTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearLongPress();

      if (direction !== 'horizontal' || !touchStartRef.current) return;
      if (!pageTurnGestures) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      if (isLongPressRef.current) return;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (elapsed > SWIPE_TIMEOUT) return;

      const isForward = deltaX < 0;
      const shouldGoForward = readingDirection === 'rtl' ? isForward : !isForward;
      if (shouldGoForward) {
        goNextPage();
      } else {
        goPrevPage();
      }
    },
    [direction, goNextPage, goPrevPage, clearLongPress, readingDirection, pageTurnGestures]
  );

  const handleMainClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        isLongPressRef.current = false;
        return;
      }
      if (isTogglingRef.current) {
        isTogglingRef.current = false;
        return;
      }
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[data-ui-control]')) return;
      toggleUi();
    },
    [toggleUi]
  );

  const handleScrollTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetPage = Math.max(1, Math.min(Math.round(ratio * totalPages), totalPages));
    goToPage(targetPage);
    isTogglingRef.current = true;
  }, [totalPages, goToPage]);

  const getPageFromClientX = useCallback((clientX: number) => {
    const track = progressTrackRef.current;
    if (!track || totalPages === 0) return 1;
    const rect = track.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.max(1, Math.min(Math.round(ratio * totalPages), totalPages));
  }, [totalPages]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingProgressRef.current = true;
    isTogglingRef.current = true;
    const page = getPageFromClientX(e.clientX);
    dragPageRef.current = page;
    setDragPage(page);
  }, [getPageFromClientX]);

  const handleProgressTouchStart = useCallback((e: React.TouchEvent) => {
    isDraggingProgressRef.current = true;
    isTogglingRef.current = true;
    const touch = e.touches[0];
    const page = getPageFromClientX(touch.clientX);
    dragPageRef.current = page;
    setDragPage(page);
  }, [getPageFromClientX]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingProgressRef.current) return;
      const page = getPageFromClientX(e.clientX);
      dragPageRef.current = page;
      setDragPage(page);
    };

    const handleMouseUp = () => {
      if (!isDraggingProgressRef.current) return;
      isDraggingProgressRef.current = false;
      const page = dragPageRef.current;
      dragPageRef.current = null;
      setDragPage(null);
      if (page !== null) {
        goToPage(page);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingProgressRef.current) return;
      const touch = e.touches[0];
      const page = getPageFromClientX(touch.clientX);
      dragPageRef.current = page;
      setDragPage(page);
    };

    const handleTouchEnd = () => {
      if (!isDraggingProgressRef.current) return;
      isDraggingProgressRef.current = false;
      const page = dragPageRef.current;
      dragPageRef.current = null;
      setDragPage(null);
      if (page !== null) {
        goToPage(page);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [getPageFromClientX, goToPage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (fullscreenImageUrl) return;
      const isRtl = readingDirection === 'rtl';
      const isNextKey = isRtl ? e.key === 'ArrowLeft' : (e.key === 'ArrowRight' || e.key === 'ArrowDown');
      const isPrevKey = isRtl ? e.key === 'ArrowRight' : (e.key === 'ArrowLeft' || e.key === 'ArrowUp');
      if (isNextKey) {
        goNextPage();
      } else if (isPrevKey) {
        goPrevPage();
      } else if (e.key === 'Escape') {
        navigate(-1);
      }
    },
    [goNextPage, goPrevPage, navigate, fullscreenImageUrl, readingDirection]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (direction === 'horizontal' && totalPages > 0) {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [direction, totalPages]);

  useEffect(() => {
    if (direction !== 'vertical' || totalPages === 0 || isLoading) return;
    const container = smoothScrollContainerRef.current;
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
  }, [direction, totalPages, isLoading, loadPage, smoothScrollContainerRef]);

  useEffect(() => {
    if (direction !== 'vertical' || totalPages === 0 || isLoading) {
      return;
    }
    const restoreKey = `${comicId ?? ''}:${currentChapterId ?? ''}:${totalPages}`;
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
      const container = smoothScrollContainerRef.current;
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
      const container = smoothScrollContainerRef.current;
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
    comicId,
    currentChapterId,
    direction,
    totalPages,
    currentPage,
    isLoading,
    loadPage,
    smoothScrollContainerRef,
    setProgrammaticScroll,
  ]);

  useEffect(() => {
    return () => {
      clearLongPress();
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
      }
      if (firstPageNoticeTimerRef.current) {
        clearTimeout(firstPageNoticeTimerRef.current);
      }
    };
  }, [clearLongPress]);

  const handleFullscreenPrev = useCallback(() => {
    const prevIdx = fullscreenPageIndex - 1;
    const url = useReaderStore.getState().pageUrls[prevIdx];
    if (prevIdx >= 0 && url) {
      openFullscreen(url, prevIdx);
    }
  }, [fullscreenPageIndex, openFullscreen]);

  const handleFullscreenNext = useCallback(() => {
    const nextIdx = fullscreenPageIndex + 1;
    const urls = useReaderStore.getState().pageUrls;
    const url = urls[nextIdx];
    if (nextIdx < urls.length && url) {
      openFullscreen(url, nextIdx);
    }
  }, [fullscreenPageIndex, openFullscreen]);

  const handleReaderDirectionChange = useCallback((nextDirection: 'vertical' | 'horizontal') => {
    if (nextDirection === 'vertical') {
      const nextTargetIndex = Math.max(0, currentPage - PAGE_PROGRESS_OFFSET);
      setVerticalBufferStartIndex(Math.max(0, nextTargetIndex - VERTICAL_PREPEND_BATCH_SIZE));
      setVerticalRenderStartIndex(nextTargetIndex);
      setVerticalRenderEndIndex(nextTargetIndex + VERTICAL_RESTORE_PRELOAD_COUNT);
      initialScrollDoneRef.current = false;
      initialScrollRestoreKeyRef.current = '';
      initialPageScrollRatioRef.current = DEFAULT_PAGE_SCROLL_RATIO;
      initialChapterScrollRatioRef.current = DEFAULT_PAGE_SCROLL_RATIO;
      setVerticalProgressPercent(null);
    }
    setDirection(nextDirection);
  }, [currentPage, setDirection]);

  const progressPercent = totalPages > 0
    ? verticalProgressPercent ?? (
        direction === 'vertical'
          ? getReadingPercentage(progressRef.current.globalPageIndex, totalImages, progressRef.current.pageScrollRatio, direction)
          : getReadingPercentage(currentPage, totalPages, progressRef.current.pageScrollRatio, direction)
      )
    : DEFAULT_PAGE_SCROLL_RATIO;
  const verticalPageIndices = useMemo(
    () => Array.from(
      {
        length: Math.max(
          0,
          Math.min(verticalRenderEndIndex, totalPages) - Math.max(0, verticalRenderStartIndex)
        ),
      },
      (_, idx) => Math.max(0, verticalRenderStartIndex) + idx
    ),
    [totalPages, verticalRenderEndIndex, verticalRenderStartIndex]
  );

  if (isLoading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="font-body text-body-md text-on-surface-variant">加载中...</p>
        </div>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">image_not_supported</span>
          <p className="font-body text-body-md text-on-surface-variant">无法加载漫画页面</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors"
            onClick={() => navigate(-1)}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const paperOpacity = paperModeEnabled ? textureIntensity / 100 : 0;
  const paperConfig = paperModeEnabled ? getPaperConfig(paperType) : null;

  return (
    <div
      className={cn(
        'bg-background text-on-background font-body text-body-md min-h-screen relative overflow-hidden'
      )}
      style={
        paperModeEnabled && paperConfig
          ? {
              backgroundColor: paperConfig.bgColor,
              backgroundImage: paperConfig.svgFilter(paperOpacity),
            }
          : undefined
      }
    >
      <main
        ref={direction === 'vertical' ? smoothScrollContainerRef : scrollContainerRef}
        className={`w-full h-screen overflow-auto relative z-0 ${
          direction === 'vertical' ? 'overflow-y-auto' : 'overflow-hidden flex items-center justify-center'
        }`}
        style={{ WebkitOverflowScrolling: 'touch', ...(displayFilter ? { filter: displayFilter } : {}) }}
        onClick={handleMainClick}
        onWheelCapture={handleVerticalWheelCapture}
        onTouchStartCapture={handleVerticalTouchStartCapture}
        onTouchMoveCapture={handleVerticalTouchMoveCapture}
      >
        {direction === 'vertical' ? (
          <div className="max-w-max-width-content w-full flex flex-col items-center">
            {verticalPageIndices.map((idx) => {
              const url = pageUrls[idx];
              return (
                <div
                  key={idx}
                  data-page-index={idx}
                  className="w-full min-h-[40vh]"
                  style={{ contain: 'layout style' }}
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Page ${idx + 1}`}
                      className={cn(
                        'w-full h-auto cursor-pointer'
                      )}
                      style={{
                        ...(paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : {}),
                        willChange: 'transform',
                      }}
                      loading={
                        isRestoringVerticalScroll ||
                        idx < currentPage ||
                        idx < verticalRenderStartIndex + VERTICAL_PREPEND_BATCH_SIZE
                          ? 'eager'
                          : 'lazy'
                      }
                      draggable={false}
                      onClick={(e) => handleImageClick(idx, e)}
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] flex items-center justify-center bg-surface-container">
                      <span className="material-symbols-outlined text-on-surface-variant text-3xl animate-spin">progress_activity</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {pageLayout === 'double' && currentPage < totalPages && pageUrls[currentPage - 1] && pageUrls[currentPage] ? (
              <div className="flex items-center justify-center h-full w-full gap-1 animate-page-fade">
                {readingDirection === 'rtl' ? (
                  <>
                    <img
                      key={`r-${currentPage}`}
                      src={pageUrls[currentPage]!}
                      alt={`Page ${currentPage + 1}`}
                      className="max-w-[50%] max-h-full object-contain cursor-pointer"
                      style={{ ...(paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : {}), willChange: 'transform' }}
                      draggable={false}
                      onClick={(e) => handleImageClick(currentPage, e)}
                      onTouchStart={(e) => handleImageTouchStart(currentPage, e)}
                      onTouchMove={handleImageTouchMove}
                      onTouchEnd={handleImageTouchEnd}
                    />
                    <img
                      key={`l-${currentPage - 1}`}
                      src={pageUrls[currentPage - 1]!}
                      alt={`Page ${currentPage}`}
                      className="max-w-[50%] max-h-full object-contain cursor-pointer"
                      style={{ ...(paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : {}), willChange: 'transform' }}
                      draggable={false}
                      onClick={(e) => handleImageClick(currentPage - 1, e)}
                      onTouchStart={(e) => handleImageTouchStart(currentPage - 1, e)}
                      onTouchMove={handleImageTouchMove}
                      onTouchEnd={handleImageTouchEnd}
                    />
                  </>
                ) : (
                  <>
                    <img
                      key={`l-${currentPage - 1}`}
                      src={pageUrls[currentPage - 1]!}
                      alt={`Page ${currentPage}`}
                      className="max-w-[50%] max-h-full object-contain cursor-pointer"
                      style={{ ...(paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : {}), willChange: 'transform' }}
                      draggable={false}
                      onClick={(e) => handleImageClick(currentPage - 1, e)}
                      onTouchStart={(e) => handleImageTouchStart(currentPage - 1, e)}
                      onTouchMove={handleImageTouchMove}
                      onTouchEnd={handleImageTouchEnd}
                    />
                    <img
                      key={`r-${currentPage}`}
                      src={pageUrls[currentPage]!}
                      alt={`Page ${currentPage + 1}`}
                      className="max-w-[50%] max-h-full object-contain cursor-pointer"
                      style={{ ...(paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : {}), willChange: 'transform' }}
                      draggable={false}
                      onClick={(e) => handleImageClick(currentPage, e)}
                      onTouchStart={(e) => handleImageTouchStart(currentPage, e)}
                      onTouchMove={handleImageTouchMove}
                      onTouchEnd={handleImageTouchEnd}
                    />
                  </>
                )}
              </div>
            ) : pageUrls[currentPage - 1] ? (
              <img
                key={currentPage}
                src={pageUrls[currentPage - 1]!}
                alt={`Page ${currentPage}`}
                className={cn(
                  'max-w-full max-h-full object-contain cursor-pointer animate-page-fade',
                  zoomScale > 1 && 'transition-transform duration-200'
                )}
                style={{
                  ...(paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : {}),
                  willChange: 'transform',
                  ...(zoomScale > 1 ? {
                    transform: `scale(${zoomScale})`,
                    transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
                  } : {}),
                }}
                draggable={false}
                onClick={(e) => handleImageClick(currentPage - 1, e)}
                onTouchStart={(e) => handleImageTouchStart(currentPage - 1, e)}
                onTouchMove={handleImageTouchMove}
                onTouchEnd={handleImageTouchEnd}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl animate-spin">progress_activity</span>
                <p className="font-label text-label-sm text-on-surface-variant">{currentPage} / {totalPages}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed top-gutter right-margin-mobile z-40 pointer-events-none mt-safe">
        <div className="bg-on-surface/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="font-label text-label-sm text-surface">{currentPage} / {totalPages}</span>
        </div>
      </div>

      {readerNotice && (
        <div className="fixed top-gutter left-1/2 -translate-x-1/2 z-40 pointer-events-none mt-safe">
          <div className="bg-on-surface/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
            <span className="font-label text-label-sm text-surface">{readerNotice}</span>
          </div>
        </div>
      )}

      {(uiAnimating || uiVisible) && (
        <div
          className={`fixed inset-0 pointer-events-none z-50 flex flex-col justify-between ${
            uiVisible ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        >
          <header
            className={`bg-surface/80 backdrop-blur-md w-full px-margin-mobile py-2 border-b border-outline-variant/50 pointer-events-auto pt-safe transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              uiVisible ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            <div className="max-w-max-width-content mx-auto flex justify-between items-center">
              <button
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
                onClick={() => navigate(-1)}
                data-ui-control
              >
                <span className="material-symbols-outlined text-headline-md">arrow_back</span>
              </button>
              <h1 className="font-display text-headline-sm text-primary truncate max-w-[60%] text-center">
                {chapterTitle}
              </h1>
              <div className="flex items-center gap-1">
                <button
                  className={`${comic?.isFavorite ? 'text-primary' : 'text-on-surface-variant'} hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50`}
                  onClick={() => {
                    if (comicId) toggleFavorite(comicId);
                  }}
                  data-ui-control
                  aria-label={comic?.isFavorite ? '取消收藏' : '收藏'}
                >
                  <span className="material-symbols-outlined text-headline-md" style={comic?.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {comic?.isFavorite ? 'bookmark' : 'bookmark_border'}
                  </span>
                </button>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
                  onClick={() => setShowChapterList(!showChapterList)}
                  data-ui-control
                  aria-label="章节目录"
                >
                  <span className="material-symbols-outlined text-headline-md">list</span>
                </button>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
                  onClick={() => setBottomBarVisible(true)}
                  data-ui-control
                  aria-label="设置"
                >
                  <span className="material-symbols-outlined text-headline-md">more_vert</span>
                </button>
              </div>
            </div>
          </header>

          <div
            className={`w-full pointer-events-auto bg-surface/60 backdrop-blur-md pb-safe pt-4 px-margin-mobile transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              uiVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="max-w-max-width-content mx-auto flex flex-col gap-3">
              <div className="flex items-center justify-center gap-3">
                <span className="font-label text-label-sm text-on-surface-variant tabular-nums w-8 text-right">
                  {dragPage ?? currentPage}
                </span>
                <div
                  ref={progressTrackRef}
                  className="flex-1 h-3 bg-surface-container-high/80 relative rounded-full cursor-pointer touch-none select-none"
                  onClick={handleScrollTrackClick}
                  onMouseDown={handleProgressMouseDown}
                  onTouchStart={handleProgressTouchStart}
                  data-ui-control
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/70 rounded-full transition-all duration-150"
                    style={{ width: `${dragPage !== null ? ((dragPage / totalPages) * PERCENT_MULTIPLIER) : progressPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-primary rounded-full shadow-md ring-2 ring-surface"
                    style={{ left: `${dragPage !== null ? ((dragPage / totalPages) * PERCENT_MULTIPLIER) : progressPercent}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
                <span className="font-label text-label-sm text-on-surface-variant tabular-nums w-8">{totalPages}</span>
              </div>

              {direction === 'horizontal' && (
                <div className="flex justify-center gap-3 pb-2">
                  <button
                    className="w-11 h-11 rounded-full border border-outline-variant/60 flex items-center justify-center text-primary hover:bg-surface-variant/50 transition-colors bg-surface/50"
                    onClick={prevPage}
                    data-ui-control
                  >
                    <span className="material-symbols-outlined">navigate_before</span>
                  </button>
                  <button
                    className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                    onClick={nextPage}
                    data-ui-control
                  >
                    <span className="material-symbols-outlined">navigate_next</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showChapterEnd && nextChapter && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
          <div className="bg-surface/95 backdrop-blur-md border border-outline-variant/50 rounded-2xl px-6 py-4 shadow-lg flex flex-col items-center gap-3 max-w-[280px]">
            <p className="font-body text-body-sm text-on-surface-variant">本章已读完</p>
            <button
              className="w-full bg-primary text-on-primary font-label text-label-md px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              onClick={() => {
                setShowChapterEnd(false);
                openChapter(nextChapter.id);
              }}
              data-ui-control
            >
              下一章: {nextChapter.title}
            </button>
          </div>
        </div>
      )}

      {isBottomBarVisible && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 animate-fade-in"
          onClick={() => setBottomBarVisible(false)}
        />
      )}
      {isBottomBarVisible && (
        <ReaderBottomBar
          direction={direction}
          pageLayout={pageLayout}
          paperModeEnabled={paperModeEnabled}
          paperType={paperType}
          brightness={brightness}
          colorTemperature={colorTemperature}
          onDirectionChange={handleReaderDirectionChange}
          onPageLayoutChange={(layout) => {
            setPageLayout(layout);
          }}
          onPaperModeToggle={() => {
            const { togglePaperMode: toggle } = useAppStore.getState();
            toggle();
          }}
          onPaperTypeChange={(type) => {
            useAppStore.getState().updateSettings({ paperType: type });
          }}
          onBrightnessChange={(value) => {
            useAppStore.getState().updateSettings({ brightness: value });
          }}
          onColorTemperatureChange={(value) => {
            useAppStore.getState().updateSettings({ colorTemperature: value });
          }}
          onClose={() => setBottomBarVisible(false)}
        />
      )}

      {showChapterList && chapters.length > 0 && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-on-background/40 animate-fade-in"
            onClick={() => setShowChapterList(false)}
          />
          <div className="relative w-[280px] max-w-[80vw] h-full bg-surface-bright shadow-2xl animate-slide-left flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
              <h3 className="font-display text-headline-sm text-primary">章节目录</h3>
              <button
                className="text-on-surface-variant hover:text-primary transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-variant/50"
                onClick={() => setShowChapterList(false)}
                data-ui-control
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chapters.map((chapter, idx) => {
                const isCurrentChapter = chapter.id === currentChapterId;
                return (
                  <button
                    key={chapter.id}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-outline-variant/30 transition-colors',
                      isCurrentChapter
                        ? 'bg-primary/10 border-l-2 border-l-primary'
                        : 'hover:bg-surface-container'
                    )}
                    onClick={() => {
                      openChapter(chapter.id);
                      setShowChapterList(false);
                    }}
                    data-ui-control
                  >
                    <p className={cn(
                      'font-body text-body-md',
                      isCurrentChapter ? 'text-primary font-medium' : 'text-on-surface'
                    )}>
                      {chapter.title || `第${idx + 1}话`}
                    </p>
                    <p className="font-label text-label-sm text-on-surface-variant mt-0.5">
                      {chapter.pages.length} 页
                      {isCurrentChapter && ' · 当前'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {fullscreenImageUrl && (
        <FullscreenViewer
          imageUrl={fullscreenImageUrl}
          pageIndex={fullscreenPageIndex}
          totalPages={totalPages}
          onClose={closeFullscreen}
          onPrevPage={handleFullscreenPrev}
          onNextPage={handleFullscreenNext}
        />
      )}
    </div>
  );
};
