import React, { useEffect, useCallback, useRef, useState } from 'react';
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
const SWIPE_TIMEOUT = 500;
const SCROLL_RETRY_INTERVAL = 100;
const SCROLL_MAX_RETRIES = 50;
const INITIAL_SCROLL_SETTLE_DELAY = 500;
const INTERSECTION_ROOT_MARGIN = '500px 0px';
const DOUBLE_CLICK_THRESHOLD = 300;

export const ReaderPage: React.FC = () => {
  const navigate = useNavigate();
  const { comicId, chapterId } = useParams<{ comicId: string; chapterId?: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isTogglingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const readingStartTimeRef = useRef<number>(0);
  const progressRef = useRef({ comicId: '', chapterId: '', currentPage: 1, totalPages: 0, globalPageIndex: 1, totalImages: 0 });
  const initialScrollDoneRef = useRef(false);
  const lastClickTimeRef = useRef<number>(0);
  const lastClickPageIndexRef = useRef<number>(-1);
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [uiAnimating, setUiAnimating] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);

  const {
    currentPage,
    currentChapterId,
    totalPages,
    direction,
    isUiVisible,
    pageUrls,
    chapterTitle,
    isLoading,
    fullscreenImageUrl,
    fullscreenPageIndex,
    isBottomBarVisible,
    openComic,
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
    scrollToPage: smoothScrollToPage,
    isDragging: isSmoothScrollDragging,
  } = useSmoothScroll({
    direction,
    onPageChange: goToPage,
    currentPage,
    totalPages,
  });
  const { updateProgress, getComicById, toggleFavorite } = useLibraryStore();
  const { addReadingSession } = useStatsStore();
  const { settings } = useAppStore();
  const paperModeEnabled = settings.paperMode;
  const textureIntensity = settings.textureIntensity;
  const paperType = settings.paperType;

  const comic = comicId ? getComicById(comicId) : undefined;
  const totalImages = comic?.chapters.reduce((sum, ch) => sum + ch.pages.length, 0) ?? totalPages;
  const currentChapterIndex = comic?.chapters.findIndex((ch) => ch.id === currentChapterId) ?? 0;
  const imagesBeforeCurrentChapter = comic?.chapters
    .slice(0, Math.max(0, currentChapterIndex))
    .reduce((sum, ch) => sum + ch.pages.length, 0) ?? 0;
  const globalPageIndex = imagesBeforeCurrentChapter + currentPage;

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
      initialScrollDoneRef.current = false;
      openComic(comicId, chapterId);
      readingStartTimeRef.current = Date.now();
    }
    return () => {
      if (readingStartTimeRef.current > 0 && comicId) {
        const elapsedMinutes = Math.floor((Date.now() - readingStartTimeRef.current) / 60000);
        if (elapsedMinutes > 0) {
          addReadingSession(comicId, elapsedMinutes);
        }
      }
      const lastProgress = progressRef.current;
      if (lastProgress.comicId && lastProgress.currentPage > 0 && lastProgress.totalPages > 0 && lastProgress.chapterId) {
        updateProgress(lastProgress.comicId, {
          comicId: lastProgress.comicId,
          chapterId: lastProgress.chapterId,
          page: lastProgress.currentPage,
          totalPages: lastProgress.totalPages,
          percentage: lastProgress.totalImages > 0 ? (lastProgress.globalPageIndex / lastProgress.totalImages) * PERCENT_MULTIPLIER : 0,
          globalPageIndex: lastProgress.globalPageIndex,
          totalImages: lastProgress.totalImages,
        });
      }
      closeReader();
    };
  }, [comicId, chapterId, openComic, closeReader, addReadingSession]);

  useEffect(() => {
    if (comicId && currentPage > 0 && totalPages > 0 && currentChapterId) {
      progressRef.current = { comicId, chapterId: currentChapterId, currentPage, totalPages, globalPageIndex, totalImages };
      updateProgress(comicId, {
        comicId,
        chapterId: currentChapterId,
        page: currentPage,
        totalPages,
        percentage: totalImages > 0 ? (globalPageIndex / totalImages) * PERCENT_MULTIPLIER : 0,
        globalPageIndex,
        totalImages,
      });
    }
  }, [comicId, currentChapterId, currentPage, totalPages, globalPageIndex, totalImages, updateProgress]);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

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
        const url = useReaderStore.getState().pageUrls[pageIndex];
        if (url) openFullscreen(url, pageIndex);
        return;
      }

      singleClickTimerRef.current = setTimeout(() => {
        singleClickTimerRef.current = null;
        toggleUi();
      }, DOUBLE_CLICK_THRESHOLD);
    },
    [toggleUi, openFullscreen]
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
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      if (isLongPressRef.current) return;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (elapsed > SWIPE_TIMEOUT) return;

      if (deltaX < 0) {
        nextPage();
      } else {
        prevPage();
      }
    },
    [direction, nextPage, prevPage, clearLongPress]
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

  const handleVerticalScroll = useCallback(() => {
    if (direction !== 'vertical') return;
    if (!initialScrollDoneRef.current) return;
    if (isSmoothScrollDragging()) return;
    const container = smoothScrollContainerRef.current;
    if (!container) return;
    const slots = container.querySelectorAll('[data-page-index]');
    if (slots.length === 0) return;

    const containerTop = container.scrollTop + container.clientHeight / 2;
    let closestPage = 1;
    let minDistance = Infinity;

    slots.forEach((slot) => {
      const pageIndex = Number((slot as HTMLElement).dataset.pageIndex);
      const slotCenter = (slot as HTMLElement).offsetTop + (slot as HTMLElement).clientHeight / 2;
      const distance = Math.abs(slotCenter - containerTop);
      if (distance < minDistance) {
        minDistance = distance;
        closestPage = pageIndex + 1;
      }
    });

    if (closestPage !== currentPage) {
      goToPage(closestPage);
    }
  }, [direction, currentPage, goToPage, isSmoothScrollDragging]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (fullscreenImageUrl) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevPage();
      } else if (e.key === 'Escape') {
        navigate(-1);
      }
    },
    [nextPage, prevPage, navigate, fullscreenImageUrl]
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
    const container = scrollContainerRef.current;
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
  }, [direction, totalPages, isLoading, loadPage]);

  useEffect(() => {
    if (direction !== 'vertical' || totalPages === 0 || isLoading || currentPage <= 1) {
      if (direction === 'vertical' && totalPages > 0 && !isLoading && currentPage <= 1) {
        initialScrollDoneRef.current = true;
      }
      return;
    }

    initialScrollDoneRef.current = false;
    let retryCount = 0;
    let cancelled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const onScrollSettled = () => {
      if (!cancelled) {
        initialScrollDoneRef.current = true;
      }
    };

    const attemptScroll = () => {
      if (cancelled) return;
      const container = scrollContainerRef.current;
      if (!container) {
        retryCount++;
        if (retryCount < SCROLL_MAX_RETRIES) {
          setTimeout(attemptScroll, SCROLL_RETRY_INTERVAL);
        } else {
          initialScrollDoneRef.current = true;
        }
        return;
      }
      const targetSlot = container.querySelector(`[data-page-index="${currentPage - 1}"]`);
      if (!targetSlot) {
        retryCount++;
        if (retryCount < SCROLL_MAX_RETRIES) {
          setTimeout(attemptScroll, SCROLL_RETRY_INTERVAL);
        } else {
          initialScrollDoneRef.current = true;
        }
        return;
      }

      smoothScrollToPage(currentPage);
      settleTimer = setTimeout(onScrollSettled, INITIAL_SCROLL_SETTLE_DELAY);
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(attemptScroll);
    });

    return () => {
      cancelled = true;
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [direction, totalPages, currentPage, isLoading, smoothScrollToPage]);

  useEffect(() => {
    return () => {
      clearLongPress();
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
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

  const progressPercent = totalPages > 0 ? (currentPage / totalPages) * PERCENT_MULTIPLIER : 0;

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
        className={`w-full h-screen overflow-auto scroll-smooth relative z-0 ${
          direction === 'vertical' ? 'overflow-y-auto' : 'overflow-hidden flex items-center justify-center'
        }`}
        onClick={handleMainClick}
        onScroll={handleVerticalScroll}
      >
        {direction === 'vertical' ? (
          <div className="max-w-max-width-content w-full flex flex-col items-center">
            {Array.from({ length: totalPages }, (_, idx) => {
              const url = pageUrls[idx];
              return (
                <div key={idx} data-page-index={idx} className="w-full">
                  {url ? (
                    <img
                      src={url}
                      alt={`Page ${idx + 1}`}
                      className={cn(
                        'w-full h-auto cursor-pointer'
                      )}
                      style={paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : undefined}
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
            {pageUrls[currentPage - 1] ? (
              <img
                key={currentPage}
                src={pageUrls[currentPage - 1]!}
                alt={`Page ${currentPage}`}
                className={cn(
                  'max-w-full max-h-full object-contain cursor-pointer animate-page-fade'
                )}
                style={paperModeEnabled && paperConfig ? { filter: paperConfig.imageFilter } : undefined}
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
                  onClick={() => setBottomBarVisible(true)}
                  data-ui-control
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
                <span className="font-label text-label-sm text-on-surface-variant tabular-nums w-8 text-right">{currentPage}</span>
                <div
                  className="flex-1 h-3 bg-surface-container-high/80 relative rounded-full cursor-pointer touch-none"
                  onClick={handleScrollTrackClick}
                  data-ui-control
                >
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/70 rounded-full transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 w-4 h-4 bg-primary rounded-full shadow-md ring-2 ring-surface"
                    style={{ left: `${progressPercent}%`, transform: 'translate(-50%, -50%)' }}
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

      {isBottomBarVisible && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 animate-fade-in"
          onClick={() => setBottomBarVisible(false)}
        />
      )}
      {isBottomBarVisible && (
        <ReaderBottomBar
          direction={direction}
          paperModeEnabled={paperModeEnabled}
          paperType={paperType}
          onDirectionChange={(dir) => {
            setDirection(dir);
          }}
          onPaperModeToggle={() => {
            const { togglePaperMode: toggle } = useAppStore.getState();
            toggle();
          }}
          onPaperTypeChange={(type) => {
            useAppStore.getState().updateSettings({ paperType: type });
          }}
          onClose={() => setBottomBarVisible(false)}
        />
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
