import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AnnotationDetailModal, type AnnotationEditPatch } from '@/components/molecules/AnnotationDetailModal';
import { AnnotationList } from '@/components/molecules/AnnotationList';
import { AnnotationPopup } from '@/components/molecules/AnnotationPopup';
import { ChapterListDrawer } from '@/components/molecules/ChapterListDrawer';
import { FullscreenViewer } from '@/components/molecules/FullscreenViewer';
import { HorizontalReaderView } from '@/components/molecules/HorizontalReaderView';
import { InBookSearchPanel } from '@/components/molecules/InBookSearchPanel';
import { LongPressActionMenu } from '@/components/molecules/LongPressActionMenu';
import { ReaderBottomBar } from '@/components/molecules/ReaderBottomBar';
import { ReaderProgressTrack } from '@/components/molecules/ReaderProgressTrack';
import { COPY } from '@/constants/copy';
import { READER_PAGE_QUERY_PARAM } from '@/constants/routes';
import { useBackHandler } from '@/hooks/useBackHandler';
import { useReadingStats } from '@/hooks/useReadingStats';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useVerticalVirtualWindow, type ReaderProgressSnapshot } from '@/hooks/useVerticalVirtualWindow';
import { buildPdfSearchChapters, getPdfPageTexts } from '@/services/pdfText';
import { annotationRepo } from '@/services/storage/annotationRepo';
import type { TextChapter } from '@/services/textContent';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useReaderStore } from '@/stores/useReaderStore';
import type { Annotation } from '@/types';
import { cn } from '@/utils/cn';
import { buildPageNoteAnnotation, isPageNote } from '@/utils/pageAnnotation';
import { computePaperOpacity, getPaperBaseOpacity, getPaperConfig } from '@/utils/paperTexture';
import {
  getHorizontalPageSpread,
  getHorizontalPageStart,
  getHorizontalPageTurnTarget,
  getPageSpreadLabel,
  getPageTurnForKeyboard,
  getPageTurnForSwipe,
  getPageTurnForTapZone,
  getTapZone,
  type PageTurn,
} from '@/utils/readerPagination';

const LONG_PRESS_DURATION = 500;
const UI_ANIMATION_DURATION = 300;
const PERCENT_MULTIPLIER = 100;
const READER_SEPIA_MAX_INTENSITY = 0.4; // 色温滤镜最大 sepia 强度
const TOUCH_MOVE_THRESHOLD = 10;
const SWIPE_THRESHOLD = 50;

const SWIPE_TIMEOUT = 500;
const DOUBLE_CLICK_THRESHOLD = 300;
// 双击判定距离（px）：两次点击需足够接近才视为双击缩放
const DOUBLE_TAP_PROXIMITY_PX = 48;
const VERTICAL_PREPEND_BATCH_SIZE = 6;
const VERTICAL_PREPEND_THRESHOLD = 120;
const FIRST_PAGE_NOTICE_DURATION = 1600;
const FIRST_PAGE_NOTICE_TEXT = '已经到第一页';
const LAST_PAGE_NOTICE_TEXT = '已经到最后一页';
const DEFAULT_PAGE_SCROLL_RATIO = 0;
const MAX_PAGE_SCROLL_RATIO = 1;
const PAGE_PROGRESS_OFFSET = 1;
/** 检索命中页索引（0 起）→ goToPage 页码（1 起） */
const PAGE_INDEX_TO_PAGE_OFFSET = 1;
/** 页注弹窗纵向落点（视口高度的 1/3） */
const PAGE_NOTE_POPUP_VIEWPORT_DIVISOR = 3;
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
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const [searchParams] = useSearchParams();
  /** 页码直达（?page=，1 起；页级手记跳转）：挂载消费一次，不随重渲染触发重开书 */
  const initialPageRef = useRef<number | undefined>((() => {
    const raw = searchParams.get(READER_PAGE_QUERY_PARAM);
    const parsed = raw ? Number.parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : undefined;
  })());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isTogglingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const progressRef = useRef<ReaderProgressSnapshot>({
    bookId: '',
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
  const initialPageScrollRatioRef = useRef(DEFAULT_PAGE_SCROLL_RATIO);
  const initialChapterScrollRatioRef = useRef(DEFAULT_PAGE_SCROLL_RATIO);
  const firstPageNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const lastClickPageIndexRef = useRef<number>(-1);
  const lastClickXRef = useRef<number>(0);
  const lastClickYRef = useRef<number>(0);
  // 上一次单击的可回滚动作：双击时先回滚再缩放（单击零延迟方案）
  const lastClickRevertRef = useRef<(() => void) | null>(null);
  const [uiAnimating, setUiAnimating] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);
  const [showChapterEnd, setShowChapterEnd] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [readerNotice, setReaderNotice] = useState<string | null>(null);
  // PDF 文本层检索（漫画无文本不提供）：一次提取按书缓存于服务层
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [pdfSearchChapters, setPdfSearchChapters] = useState<TextChapter[] | null>(null);
  const [isExtractingPdfText, setIsExtractingPdfText] = useState(false);
  // 页级手记（漫画/PDF）：长按菜单 → 页注弹窗；手记面板复用文本批注组件
  const [longPressMenuPage, setLongPressMenuPage] = useState<number | null>(null);
  const [pageNotePopupPage, setPageNotePopupPage] = useState<number | null>(null);
  const [isAnnotationPanelOpen, setIsAnnotationPanelOpen] = useState(false);
  const [bookAnnotations, setBookAnnotations] = useState<Annotation[]>([]);
  const [editingPageNote, setEditingPageNote] = useState<Annotation | null>(null);

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
    openBook,
    openChapter,
    setPageLayout,
    toggleUi,
    setDirection,
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
  const { updateProgress, getBookById, toggleFavorite } = useLibraryStore();
  const { settings, theme } = useAppStore();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkSurface = theme === 'dark' || (theme === 'auto' && prefersDark);
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
      const sepiaValue = (colorTemperature / PERCENT_MULTIPLIER) * READER_SEPIA_MAX_INTENSITY;
      filters.push(`sepia(${sepiaValue})`);
    }
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [brightness, colorTemperature]);

  const currentChapterIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
  const nextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1
    ? chapters[currentChapterIndex + 1]
    : null;

  const book = bookId ? getBookById(bookId) : undefined;
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

  const showReaderNotice = useCallback((notice: string) => {
    setReaderNotice(notice);
    if (firstPageNoticeTimerRef.current) {
      clearTimeout(firstPageNoticeTimerRef.current);
    }
    firstPageNoticeTimerRef.current = setTimeout(() => {
      setReaderNotice(null);
      firstPageNoticeTimerRef.current = null;
    }, FIRST_PAGE_NOTICE_DURATION);
  }, []);

  const showFirstPageNotice = useCallback(() => {
    showReaderNotice(FIRST_PAGE_NOTICE_TEXT);
  }, [showReaderNotice]);

  const showLastPageNotice = useCallback(() => {
    showReaderNotice(LAST_PAGE_NOTICE_TEXT);
  }, [showReaderNotice]);

  // 垂直（条漫）虚拟滚动窗口：渲染区间、进度恢复、跳页、边界扩窗
  const {
    isRestoringVerticalScroll,
    verticalProgressPercent,
    verticalPageIndices,
    revealPreviousVerticalPage,
    verticalRenderStartIndex,
    verticalTouchStartYRef,
    jumpToVerticalPage,
    initializeWindow,
    resetForVerticalEntry,
    initialScrollDoneRef,
  } = useVerticalVirtualWindow({
    direction,
    isLoading,
    totalPages,
    currentPage,
    goToPage,
    loadPage,
    containerRef: smoothScrollContainerRef,
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
  });

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

  // Android 返回键：从最上层浮层开始逐层关闭
  useBackHandler(() => {
    if (fullscreenImageUrl) { closeFullscreen(); return true; }
    if (isSearchPanelOpen) { setIsSearchPanelOpen(false); return true; }
    if (pageNotePopupPage != null) { setPageNotePopupPage(null); return true; }
    if (longPressMenuPage != null) { setLongPressMenuPage(null); return true; }
    if (isAnnotationPanelOpen) { setIsAnnotationPanelOpen(false); return true; }
    if (isBottomBarVisible) { setBottomBarVisible(false); return true; }
    if (showChapterList) { setShowChapterList(false); return true; }
    if (isUiVisible) { toggleUi(); return true; }
    return false;
  });

  useEffect(() => {
    if (bookId) {
      // 直链/刷新进入时内存 books 为空：补一次加载，让标题/收藏态等元数据就位
      if (useLibraryStore.getState().books.length === 0) {
        useLibraryStore.getState().loadBooks();
      }
      const progress = useLibraryStore.getState().readingProgress[bookId];
      initialPageScrollRatioRef.current = progress && (!chapterId || progress.chapterId === chapterId)
        ? clampPageScrollRatio(progress.pageScrollRatio ?? DEFAULT_PAGE_SCROLL_RATIO)
        : DEFAULT_PAGE_SCROLL_RATIO;
      initialChapterScrollRatioRef.current = progress && (!chapterId || progress.chapterId === chapterId)
        ? clampPageScrollRatio(progress.chapterScrollRatio ?? DEFAULT_PAGE_SCROLL_RATIO)
        : DEFAULT_PAGE_SCROLL_RATIO;
      const initialVerticalTargetIndex = progress?.readingMode === 'vertical' && (!chapterId || progress.chapterId === chapterId)
        ? Math.max(0, (progress.page || 1) - 1)
        : 0;
      initializeWindow(initialVerticalTargetIndex);
      if (progress?.readingMode) {
        setDirection(progress.readingMode);
      }
      if (progress?.pageLayout) {
        setPageLayout(progress.pageLayout);
      }
      // ?page= 直达（页级手记跳转）：显式意图优先于进度恢复
      openBook(bookId, chapterId, initialPageRef.current);
    }

    return () => {
      const lastProgress = progressRef.current;
      if (lastProgress.bookId && lastProgress.currentPage > 0 && lastProgress.totalPages > 0 && lastProgress.chapterId) {
        updateProgress(lastProgress.bookId, {
          bookId: lastProgress.bookId,
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
  }, [bookId, chapterId, openBook, closeReader, updateProgress, setDirection, setPageLayout, initializeWindow]);

  // 阅读时长统计（与 TextReader 共用）
  useReadingStats(bookId);

  useEffect(() => {
    if (bookId && currentPage > 0 && totalPages > 0 && currentChapterId) {
      const pageScrollRatio = direction === 'vertical' && !initialScrollDoneRef.current
        ? initialPageScrollRatioRef.current
        : getCurrentPageScrollRatio();
      const chapterScrollRatio = direction === 'vertical' && !initialScrollDoneRef.current
        ? initialChapterScrollRatioRef.current
        : getCurrentChapterScrollRatio();
      const percentage = getReadingPercentage(globalPageIndex, totalImages, pageScrollRatio, direction);
      progressRef.current = {
        bookId,
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
      updateProgress(bookId, {
        bookId,
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
    bookId,
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
    setZoomScale(1);
  }, [currentPage, currentChapterId]);

  useEffect(() => {
    if (direction !== 'horizontal' || totalPages <= 0) return;
    const alignedPage = getHorizontalPageStart(currentPage, totalPages, pageLayout);
    if (alignedPage !== currentPage) {
      goToPage(alignedPage);
    }
  }, [currentPage, direction, goToPage, pageLayout, totalPages]);

  // PDF 检索入口：首次打开时提取文本层（一页一章伪章节，复用文本检索面板）
  const openPdfSearch = useCallback(async () => {
    if (!bookId) return;
    if (pdfSearchChapters) {
      setIsSearchPanelOpen(true);
      return;
    }
    setIsExtractingPdfText(true);
    showReaderNotice(COPY.searchInBook.extracting);
    try {
      const pages = await getPdfPageTexts(bookId);
      if (pages.length === 0) {
        showReaderNotice(COPY.searchInBook.extractFailed);
        return;
      }
      setPdfSearchChapters(buildPdfSearchChapters(pages));
      setIsSearchPanelOpen(true);
    } catch {
      showReaderNotice(COPY.searchInBook.extractFailed);
    } finally {
      setIsExtractingPdfText(false);
    }
  }, [bookId, pdfSearchChapters, showReaderNotice]);

  /** 按阅读方向分发跳页：垂直走视口驱动（支持页内落点），水平直接 goToPage。
   *  进度条拖拽/轨道点击/检索命中共用，保证松手后拇指、页码、视口三者一致。 */
  const jumpToReaderPage = useCallback((page: number, pageScrollRatio = DEFAULT_PAGE_SCROLL_RATIO) => {
    const target = Math.max(1, Math.min(page, totalPages));
    if (direction === 'vertical') {
      jumpToVerticalPage(target, pageScrollRatio);
    } else {
      goToPage(getHorizontalPageStart(target, totalPages, pageLayout));
    }
  }, [direction, totalPages, pageLayout, goToPage, jumpToVerticalPage]);

  // ── 页级手记（漫画/PDF） ──

  /** 手记面板打开时懒加载本书手记 */
  const openAnnotationPanel = useCallback(async () => {
    if (!bookId) return;
    setIsAnnotationPanelOpen(true);
    setBookAnnotations(await annotationRepo.getByBookId(bookId));
  }, [bookId]);

  const handlePageNoteSave = useCallback(async (note: string, _style: Annotation['style'], tagIds: string[] = []) => {
    if (!bookId || pageNotePopupPage == null) return;
    const chapter = chapters.find((ch) => ch.id === currentChapterId);
    const chapterIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
    if (!chapter || chapterIndex < 0) return;
    const annotation = buildPageNoteAnnotation({
      bookId,
      chapterIndex,
      chapterTitle: chapter.title,
      pageIndex: pageNotePopupPage,
      note,
      tagIds,
    });
    await annotationRepo.add(annotation);
    setBookAnnotations((prev) => [annotation, ...prev]);
    setPageNotePopupPage(null);
    showReaderNotice(COPY.annotation.pageNoteSaved);
  }, [bookId, pageNotePopupPage, chapters, currentChapterId, showReaderNotice]);

  const handlePageNoteEdit = useCallback(async (patch: AnnotationEditPatch) => {
    const updates: Partial<Pick<Annotation, 'note' | 'style' | 'tagIds' | 'updatedAt'>> = {};
    if (patch.note !== undefined) updates.note = patch.note;
    if (patch.style !== undefined) updates.style = patch.style;
    if (patch.tagIds !== undefined) updates.tagIds = patch.tagIds;
    await annotationRepo.update(patch.id, updates);
    setBookAnnotations((prev) => prev.map((a) => (a.id === patch.id ? { ...a, ...updates, updatedAt: new Date() } : a)));
    setEditingPageNote(null);
  }, []);

  const handlePageNoteDelete = useCallback(async (id: string) => {
    await annotationRepo.remove(id);
    setBookAnnotations((prev) => prev.filter((a) => a.id !== id));
    setEditingPageNote(null);
    showReaderNotice(COPY.annotation.deleted);
  }, [showReaderNotice]);

  /** 手记跳转：页注直达页码，其余到章 */
  const handlePageNoteNavigate = useCallback((ann: Annotation) => {
    setIsAnnotationPanelOpen(false);
    setEditingPageNote(null);
    const chapter = chapters[ann.chapterIndex];
    if (!chapter) return;
    if (isPageNote(ann)) {
      const page = (ann.pageIndex ?? 0) + PAGE_INDEX_TO_PAGE_OFFSET;
      if (chapter.id === currentChapterId) {
        goToPage(page);
      } else {
        openChapter(chapter.id, page);
      }
    } else if (chapter.id !== currentChapterId) {
      openChapter(chapter.id);
    }
  }, [chapters, currentChapterId, goToPage, openChapter]);

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

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const goReaderPageTurn = useCallback((turn: PageTurn) => {
    if (totalPages <= 0) return;
    const target = direction === 'horizontal'
      ? getHorizontalPageTurnTarget(currentPage, totalPages, pageLayout, turn)
      : Math.max(1, Math.min(currentPage + (turn === 'next' ? 1 : -1), totalPages));
    if (target !== currentPage) {
      goToPage(target);
      return;
    }
    if (direction === 'horizontal') {
      if (turn === 'prev') {
        showFirstPageNotice();
      } else {
        showLastPageNotice();
      }
    }
  }, [
    currentPage,
    direction,
    pageLayout,
    showFirstPageNotice,
    showLastPageNotice,
    totalPages,
    goToPage,
  ]);

  const goNextPage = useCallback(() => {
    goReaderPageTurn('next');
  }, [goReaderPageTurn]);

  const goPrevPage = useCallback(() => {
    goReaderPageTurn('prev');
  }, [goReaderPageTurn]);

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
      const isDoubleTap =
        now - lastClickTimeRef.current < DOUBLE_CLICK_THRESHOLD &&
        lastClickPageIndexRef.current === pageIndex &&
        Math.abs(e.clientX - lastClickXRef.current) < DOUBLE_TAP_PROXIMITY_PX &&
        Math.abs(e.clientY - lastClickYRef.current) < DOUBLE_TAP_PROXIMITY_PX;

      lastClickTimeRef.current = now;
      lastClickPageIndexRef.current = pageIndex;
      lastClickXRef.current = e.clientX;
      lastClickYRef.current = e.clientY;

      if (isDoubleTap) {
        // 双击：先回滚上一次单击的效果（如 UI 切换），再执行缩放
        lastClickRevertRef.current?.();
        lastClickRevertRef.current = null;
        if (zoomScale > 1) {
          setZoomScale(1);
        } else {
          setZoomScale(2);
          setZoomOrigin({ x: e.clientX, y: e.clientY });
        }
        return;
      }

      // 单击：立即执行，不再等待双击窗口
      if (direction === 'horizontal') {
        if (zoomScale > 1) {
          toggleUi();
          lastClickRevertRef.current = toggleUi;
          return;
        }

        const tapZone = getTapZone(e.clientX, window.innerWidth);
        const pageTurn = getPageTurnForTapZone(tapZone, readingDirection);
        if (!pageTurn) {
          toggleUi();
          lastClickRevertRef.current = toggleUi;
        } else {
          goReaderPageTurn(pageTurn);
          // 边缘翻页不做双击回滚：快速连点视为连续翻页（跨章边界回滚过于复杂）
          lastClickRevertRef.current = null;
        }
      } else {
        toggleUi();
        lastClickRevertRef.current = toggleUi;
      }
    },
    [toggleUi, direction, readingDirection, goReaderPageTurn, zoomScale]
  );

  const handleImageTouchStart = useCallback(
    (pageIndex: number, e: React.TouchEvent) => {
      isLongPressRef.current = false;
      const touch = e.touches[0];
      const startPos = { x: touch.clientX, y: touch.clientY };

      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        // 长按弹出页级动作菜单（页级手记 / 阅读设置），锚定触发页
        setLongPressMenuPage(pageIndex);
      }, LONG_PRESS_DURATION);

      if (direction === 'horizontal') {
        touchStartRef.current = {
          x: startPos.x,
          y: startPos.y,
          time: Date.now(),
        };
      }
    },
    [direction]
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
      if (zoomScale > 1) {
        touchStartRef.current = null;
        return;
      }
      if (!pageTurnGestures) {
        touchStartRef.current = null;
        return;
      }
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      if (isLongPressRef.current) return;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (elapsed > SWIPE_TIMEOUT) return;

      const pageTurn = getPageTurnForSwipe(deltaX, readingDirection);
      if (pageTurn) {
        goReaderPageTurn(pageTurn);
      }
    },
    [direction, goReaderPageTurn, clearLongPress, readingDirection, pageTurnGestures, zoomScale]
  );

  const handleHorizontalSurfaceClick = useCallback(
    (e: React.MouseEvent) => {
      handleImageClick(currentPage - 1, e);
    },
    [currentPage, handleImageClick]
  );

  const handleHorizontalSurfaceTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleImageTouchStart(currentPage - 1, e);
    },
    [currentPage, handleImageTouchStart]
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (fullscreenImageUrl) return;
      const pageTurn = getPageTurnForKeyboard(e.key, direction, readingDirection);
      if (pageTurn === 'next') {
        goNextPage();
      } else if (pageTurn === 'prev') {
        goPrevPage();
      }
    },
    [direction, goNextPage, goPrevPage, fullscreenImageUrl, readingDirection]
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
    return () => {
      clearLongPress();
      lastClickRevertRef.current = null;
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
      resetForVerticalEntry(currentPage);
      initialPageScrollRatioRef.current = DEFAULT_PAGE_SCROLL_RATIO;
      initialChapterScrollRatioRef.current = DEFAULT_PAGE_SCROLL_RATIO;
    }
    setDirection(nextDirection);
  }, [currentPage, setDirection, resetForVerticalEntry]);

  const progressPercent = totalPages > 0
    ? verticalProgressPercent ?? (
        direction === 'vertical'
          ? getReadingPercentage(progressRef.current.globalPageIndex, totalImages, progressRef.current.pageScrollRatio, direction)
          : getReadingPercentage(currentPage, totalPages, progressRef.current.pageScrollRatio, direction)
      )
    : DEFAULT_PAGE_SCROLL_RATIO;
  const horizontalPageSpread = useMemo(
    () => direction === 'horizontal'
      ? getHorizontalPageSpread(currentPage, totalPages, pageLayout, readingDirection)
      : [],
    [currentPage, direction, pageLayout, readingDirection, totalPages]
  );
  const currentPageLabel = useMemo(
    () => direction === 'horizontal' && pageLayout === 'double' && horizontalPageSpread.length > 0
      ? getPageSpreadLabel(horizontalPageSpread)
      : `${currentPage}`,
    [currentPage, direction, horizontalPageSpread, pageLayout]
  );

  if (isLoading) {
    return (
      <div className="bg-background text-on-background min-h-[100dvh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="font-body text-body-md text-on-surface-variant">加载中...</p>
        </div>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <div className="bg-background text-on-background min-h-[100dvh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">image_not_supported</span>
          <p className="font-body text-body-md text-on-surface-variant">无法加载页面</p>
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

  const paperConfig = paperModeEnabled ? getPaperConfig(paperType) : null;
  // 纹理层：幂曲线强度 + 暗色减淡；混合模式随纸型（浅色纸 multiply / 夜读纸 screen）
  const paperTextureLayer = paperModeEnabled && paperConfig
    ? {
        backgroundImage: paperConfig.svgFilter(
          computePaperOpacity(textureIntensity, getPaperBaseOpacity(paperType), isDarkSurface)
        ),
        mixBlendMode: paperConfig.blendMode as 'multiply' | 'screen',
      }
    : null;

  return (
    <div
      className={cn(
        'bg-background text-on-background font-body text-body-md min-h-[100dvh] relative overflow-hidden'
      )}
      style={
        paperModeEnabled && paperConfig
          ? { backgroundColor: paperConfig.bgColor, isolation: 'isolate' }
          : undefined
      }
    >
      {paperTextureLayer && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[-1]" style={paperTextureLayer} />
      )}
      <main
        ref={direction === 'vertical' ? smoothScrollContainerRef : scrollContainerRef}
        className={`w-full h-[100dvh] overflow-auto overscroll-contain relative z-0 ${
          direction === 'vertical' ? 'overflow-y-auto' : 'overflow-hidden flex items-center justify-center'
        }`}
        style={{ WebkitOverflowScrolling: 'touch', ...(displayFilter ? { filter: displayFilter } : {}) }}
        onClick={handleMainClick}
        onWheelCapture={handleVerticalWheelCapture}
        onTouchStartCapture={handleVerticalTouchStartCapture}
        onTouchMoveCapture={handleVerticalTouchMoveCapture}
      >
        {direction === 'vertical' ? (
          <div className="w-full max-w-max-width-content landscape:max-w-none mx-auto flex flex-col items-center">
            {verticalPageIndices.map((idx) => {
              const url = pageUrls[idx];
              return (
                <div
                  key={idx}
                  data-page-index={idx}
                  className="w-full min-h-[40vh] flex justify-center"
                  style={{ contain: 'layout style' }}
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Page ${idx + 1}`}
                      className={cn(
                        'w-full h-auto cursor-pointer landscape:max-w-none'
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
          <HorizontalReaderView
            pageLayout={pageLayout}
            readingDirection={readingDirection}
            pageUrls={pageUrls}
            currentPage={currentPage}
            currentPageLabel={currentPageLabel}
            totalPages={totalPages}
            horizontalPageSpread={horizontalPageSpread}
            zoomScale={zoomScale}
            zoomOrigin={zoomOrigin}
            paperConfig={paperModeEnabled && paperConfig ? paperConfig : null}
            onSurfaceClick={handleHorizontalSurfaceClick}
            onSurfaceTouchStart={handleHorizontalSurfaceTouchStart}
            onSurfaceTouchMove={handleImageTouchMove}
            onSurfaceTouchEnd={handleImageTouchEnd}
            onImageClick={handleImageClick}
          />
        )}
      </main>

      <div className="fixed top-gutter right-margin-mobile z-40 pointer-events-none mt-safe">
        <div className="bg-on-surface/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="font-label text-label-sm text-surface">{currentPageLabel} / {totalPages}</span>
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
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
                onClick={() => navigate(-1)}
                data-ui-control
              >
                <span className="material-symbols-outlined text-headline-md">arrow_back</span>
              </button>
              <div className="flex flex-col items-center flex-1 min-w-0 px-2">
                <h1 className="font-display text-headline-sm text-primary truncate w-full text-center" title={book?.title}>
                  {book?.title}
                </h1>
                <span className="font-label text-label-sm text-on-surface-variant truncate w-full text-center">
                  {chapterTitle}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {book?.format === 'pdf' && (
                  <button
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
                    onClick={openPdfSearch}
                    disabled={isExtractingPdfText}
                    data-ui-control
                    aria-label={COPY.searchInBook.search}
                  >
                    <span className="material-symbols-outlined text-headline-md">search</span>
                  </button>
                )}
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
                  onClick={openAnnotationPanel}
                  data-ui-control
                  aria-label={COPY.annotation.readerNotes}
                >
                  <span className="material-symbols-outlined text-headline-md">edit_note</span>
                </button>
                <button
                  className={`${book?.isFavorite ? 'text-primary' : 'text-on-surface-variant'} hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50`}
                  onClick={() => {
                    if (bookId) toggleFavorite(bookId);
                  }}
                  data-ui-control
                  aria-label={book?.isFavorite ? '取消收藏' : '收藏'}
                >
                  <span className="material-symbols-outlined text-headline-md" style={book?.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {book?.isFavorite ? 'bookmark' : 'bookmark_border'}
                  </span>
                </button>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
                  onClick={() => setShowChapterList(!showChapterList)}
                  data-ui-control
                  aria-label="章节目录"
                >
                  <span className="material-symbols-outlined text-headline-md">list</span>
                </button>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
                  onClick={() => setBottomBarVisible(true)}
                  data-ui-control
                  aria-label="阅读设置"
                >
                  <span className="material-symbols-outlined text-headline-md">tune</span>
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
              <ReaderProgressTrack
                totalPages={totalPages}
                direction={direction}
                pageLayout={pageLayout}
                readingDirection={readingDirection}
                progressPercent={progressPercent}
                currentPageLabel={currentPageLabel}
                onJump={jumpToReaderPage}
                onInteractStart={() => { isTogglingRef.current = true; }}
              />

              {direction === 'horizontal' && (
                <div className="flex justify-center gap-3 pb-2">
                  <button
                    className="w-11 h-11 rounded-full border border-outline-variant/60 flex items-center justify-center text-primary hover:bg-surface-variant/50 transition-colors bg-surface/50"
                    onClick={goPrevPage}
                    data-ui-control
                  >
                    <span className="material-symbols-outlined">navigate_before</span>
                  </button>
                  <button
                    className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                    onClick={goNextPage}
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
          <div className="bg-surface/95 backdrop-blur-md border border-outline-variant/50 rounded-2xl px-6 py-4 shadow-paper-up flex flex-col items-center gap-3 max-w-[280px]">
            <p className="font-body text-body-sm text-on-surface-variant">本章已读完</p>
            <button
              className="w-full bg-primary text-on-primary font-label text-label-md px-5 py-2.5 rounded-card-lg hover:opacity-90 transition-opacity"
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
          className="fixed inset-0 z-[45] bg-on-background/30 animate-fade-in"
          onClick={() => setBottomBarVisible(false)}
        />
      )}
      {isBottomBarVisible && (
        <ReaderBottomBar
          direction={direction}
          pageLayout={pageLayout}
          readingDirection={readingDirection}
          paperModeEnabled={paperModeEnabled}
          paperType={paperType}
          brightness={brightness}
          colorTemperature={colorTemperature}
          textureIntensity={textureIntensity}
          onTextureIntensityChange={(v) => useAppStore.getState().updateSettings({ textureIntensity: v })}
          onDirectionChange={handleReaderDirectionChange}
          onPageLayoutChange={(layout) => {
            setPageLayout(layout);
            if (direction === 'horizontal') {
              const alignedPage = getHorizontalPageStart(currentPage, totalPages, layout);
              if (alignedPage !== currentPage) {
                goToPage(alignedPage);
              }
            }
          }}
          onReadingDirectionChange={(nextReadingDirection) => {
            useAppStore.getState().updateSettings({ readingDirection: nextReadingDirection });
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
        <ChapterListDrawer
          chapters={chapters}
          currentChapterId={currentChapterId}
          onSelect={openChapter}
          onClose={() => setShowChapterList(false)}
        />
      )}

      {/* PDF 书内检索面板：命中页直达（chapterIndex 即页索引；统一走方向分发跳页） */}
      {isSearchPanelOpen && pdfSearchChapters && (
        <InBookSearchPanel
          chapters={pdfSearchChapters}
          onSelectHit={(hit) => {
            setIsSearchPanelOpen(false);
            jumpToReaderPage(hit.chapterIndex + PAGE_INDEX_TO_PAGE_OFFSET);
          }}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      )}

      {/* 长按页级动作菜单：页级手记 / 阅读设置 */}
      {longPressMenuPage != null && (
        <LongPressActionMenu
          page={longPressMenuPage}
          onAddPageNote={(page) => {
            setPageNotePopupPage(page);
            setLongPressMenuPage(null);
          }}
          onOpenReaderSettings={() => {
            setLongPressMenuPage(null);
            setBottomBarVisible(true);
          }}
          onClose={() => setLongPressMenuPage(null)}
        />
      )}

      {/* 页注弹窗（复用批注弹窗；锚点/样式对页注无意义，由 buildPageNoteAnnotation 归一） */}
      {pageNotePopupPage != null && (
        <AnnotationPopup
          selectedText={`${COPY.annotation.pageNote} · ${pageNotePopupPage + PAGE_INDEX_TO_PAGE_OFFSET}`}
          position={{ x: window.innerWidth / 2, y: window.innerHeight / PAGE_NOTE_POPUP_VIEWPORT_DIVISOR }}
          onSave={handlePageNoteSave}
          onCancel={() => setPageNotePopupPage(null)}
        />
      )}

      {/* 页注详情（手记列表点「编辑」进入） */}
      {editingPageNote && (
        <AnnotationDetailModal
          annotation={editingPageNote}
          onEdit={handlePageNoteEdit}
          onDelete={handlePageNoteDelete}
          onNavigate={handlePageNoteNavigate}
          onClose={() => setEditingPageNote(null)}
        />
      )}

      {/* 手记面板（本书全部手记：页注与文本划线共存） */}
      {isAnnotationPanelOpen && (
        <AnnotationList
          annotations={bookAnnotations}
          bookTitle={book?.title ?? ''}
          onEdit={(ann) => setEditingPageNote(bookAnnotations.find((a) => a.id === ann.id) ?? null)}
          onDelete={handlePageNoteDelete}
          onNavigate={handlePageNoteNavigate}
          onClose={() => setIsAnnotationPanelOpen(false)}
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
