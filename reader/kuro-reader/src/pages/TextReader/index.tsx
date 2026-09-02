import React, { useEffect, useLayoutEffect, useCallback, useRef, useState, useMemo } from 'react';

import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AnnotationDetailModal } from '@/components/molecules/AnnotationDetailModal';
import { AnnotationList } from '@/components/molecules/AnnotationList';
import { AnnotationPopup } from '@/components/molecules/AnnotationPopup';
import { AutoScrollBadge } from '@/components/molecules/AutoScrollBadge';
import { BookmarkPanel } from '@/components/molecules/BookmarkPanel';
import { ChapterDrawer } from '@/components/molecules/ChapterDrawer';
import { ChapterEndPrompt } from '@/components/molecules/ChapterEndPrompt';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { InBookSearchPanel } from '@/components/molecules/InBookSearchPanel';
import { MarkdownReaderContent } from '@/components/molecules/MarkdownReaderContent';
import { SelectionFloatingButton } from '@/components/molecules/SelectionFloatingButton';
import { SpeechBadge } from '@/components/molecules/SpeechBadge';
import { TextProgressHint } from '@/components/molecules/TextProgressHint';
import { TextReaderBottomBar } from '@/components/molecules/TextReaderBottomBar';
import { TextReaderFooter } from '@/components/molecules/TextReaderFooter';
import { TextReaderHeader } from '@/components/molecules/TextReaderHeader';
import { UndoToast } from '@/components/molecules/UndoToast';
import { ANNOTATION_QUERY_PARAM } from '@/constants/routes';
import { getTextReaderFontFamily } from '@/constants/textReaderFonts';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useBackHandler } from '@/hooks/useBackHandler';
import { useEstimatedTimeLeft } from '@/hooks/useEstimatedTimeLeft';
import { useLandscapeViewport } from '@/hooks/useLandscapeViewport';
import { useReadingStats } from '@/hooks/useReadingStats';
import { useSpeech } from '@/hooks/useSpeech';
import { useWakeLock } from '@/hooks/useWakeLock';
import { revokeEpubObjectUrls } from '@/services/epubContent';
import {
  findPreferredBreak,
  paginatePlainText,
  splitTextIntoPages,
} from '@/services/pagination/textPagination';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { bookmarkRepo } from '@/services/storage/bookmarkRepo';
import { loadTextContent, resolveTextChapterIndex, type TextChapter } from '@/services/textContent';
import { piperModelStored } from '@/services/tts/piperEngine';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Bookmark, Annotation, AnnotationStyle, TtsEngineOption } from '@/types';
import { computeAnnotationAnchor, resolveAnnotationOffsets } from '@/utils/annotationAnchor';
import { getAnnotationPresentation } from '@/utils/annotationHighlight';
import { cn } from '@/utils/cn';
import { computePaperOpacity, getPaperBaseOpacity, getPaperConfig } from '@/utils/paperTexture';
import {
  getOverallReadingPercent,
  getOverallReadingRatio,
} from '@/utils/readingProgress';
import {
  getMarkdownPaginationEnd,
  getTextPageLayout,
} from '@/utils/textPageLayout';
import {
  getNextTextPageIndex,
  getPaginatedTapAction,
} from '@/utils/textReaderNavigation';
import type { SearchHit } from '@/utils/textSearch';

const PROGRESS_SAVE_DEBOUNCE = 500;
const PROGRESS_HINT_AUTO_HIDE_MS = 1400;
const SWIPE_THRESHOLD = 50;
const TEXT_SCROLL_END_THRESHOLD = 0.995;
const TEXT_SCROLL_END_EPSILON_PX = 2;
// 无缝续读窗口：视口所在章之后至少预拼接 AHEAD 章；窗口总量超 MAX 时裁剪远端，防止长章节数 DOM 无限增长
const SCROLL_WINDOW_AHEAD = 1;
const SCROLL_WINDOW_MAX = 6;
// 向上回看：锚点进入窗口首章顶部该距离内即向前扩一章（带滚动补偿）
const SCROLL_WINDOW_PREPEND_PX = 120;
const TEXT_READER_DESKTOP_MEDIA_QUERY = '(min-width: 768px)';
const TEXT_READER_COLUMNS_LG_MEDIA_QUERY = '(min-width: 1024px)';
const TEXT_READER_COLUMNS_MEDIA_QUERY = '(orientation: landscape)';
const MIN_TEXT_PAGE_LENGTH = 1;
const TEXT_PAGE_RESET_INDEX = 0;
const TEXT_COLUMNS_PAGE_STEP = 2;
const UNDO_TOAST_AUTO_HIDE_MS = 5000;
const HINT_TOAST_AUTO_HIDE_MS = 2500;
const SELECTION_POPUP_OFFSET_X = 160;
const SELECTION_POPUP_OFFSET_Y = 40;
// 百分比与比例换算
const PERCENT_MULTIPLIER = 100;
/** 纸型底色上的正文字色（暖墨，与漫画纸底一致的可读性） */
const PAPER_INK_COLOR = '#3a352c';

const TEXT_SEPIA_MAX_INTENSITY = 0.4; // 色温滤镜最大 sepia 强度
const HALF_DIVISOR = 2; // 二分查找中点 / 选区弹窗中心点 / 页边距均分
// UI 时序
const UI_AUTO_HIDE_AFTER_LOAD_MS = 3000;
const SELECTION_CHANGE_DEBOUNCE_MS = 100;
const SELECTION_POPUP_MISCLICK_GUARD_MS = 400;
// 触摸翻页与点按区
const SWIPE_TAP_SUPPRESS_WINDOW_MS = 500;
const TAP_ZONE_CENTER_RATIO = 0.25;
const TAP_ZONE_EDGE_RATIO = 0.75;
const TAP_ZONE_PAGE_SCROLL_RATIO = 0.8;
// 隐藏测量容器
const PAGE_MEASURE_RESERVED_HEIGHT_PX = 128;
const PAGE_MEASURE_MAX_WIDTH_PX = 680;
const PAGE_MEASURE_SIDE_PADDING_PX = 48;
// 分页二分搜索窗口
// 翻书动画
const BOOK_FLIP_ANIMATION_MS = 900;
const PAGE_SLIDE_ANIMATION_MS = 650;
const FLIP_ANIMATION_COMPLETE_MS = 600;
const FLIP_SNAPBACK_MS = 350;
const FLIP_STATE_RESET_DELAY_MS = 50;
const FLIP_ROTATION_DEG = 160;
const FLIP_DRAG_RADIUS_RATIO = 0.6;
const FLIP_COMMIT_PROGRESS_THRESHOLD = 0.35;
const FLIP_EXIT_SHADOW_MAX_OPACITY = 0.25;
const FLIP_ENTER_SHADOW_MAX_OPACITY = 0.3;
const FLIP_EXIT_SHADOW_GRADIENT_END_PCT = 50;
const FLIP_ENTER_SHADOW_GRADIENT_END_PCT = 40;
const FLIP_SPINE_OPACITY = 0.5;
// 听书跟读
/** 跟随滚动时高亮目标的目标落点（视口高度比例，偏上） */
const SPEECH_FOLLOW_ANCHOR_RATIO = 0.4;
/** 高亮目标越出视口舒适区（顶部 25% 以上 / 底部 85% 以下）才触发跟随滚动，避免打扰手动浏览 */
const SPEECH_FOLLOW_ZONE_START = 0.25;
const SPEECH_FOLLOW_ZONE_END = 0.85;
// 书签 / 批注
const BOOKMARK_MATCH_EPSILON = 0.02;
const BOOKMARK_PREVIEW_BEFORE_CHARS = 20;
const BOOKMARK_PREVIEW_AFTER_CHARS = 30;
const BOOKMARK_PREVIEW_PAGE_CHARS = 50;
const MIN_SELECTION_TEXT_LENGTH = 2;
const RANDOM_ID_RADIX = 36; // base36 随机串
const RANDOM_ID_SLICE_START = 2;
const RANDOM_ID_SLICE_END = 6;
const TEXT_PAGE_TITLE_MARGIN_BOTTOM = 32;
const TEXT_PAGE_TITLE_FONT_WEIGHT = '700';
const TEXT_PAGE_TITLE_OPACITY = '0.8';
const TEXT_CHAPTER_END_PROMPT_LABELS = {
  title: '\u5df2\u8bfb\u5b8c\u672c\u7ae0',
  action: '\u7ee7\u7eed\u4e0b\u4e00\u7ae0',
} as const;

const getCurrentTextPageLayout = (isColumnsLayoutActive: boolean) => getTextPageLayout({
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  isColumnsLayoutActive,
  isLandscapeViewport: window.matchMedia(TEXT_READER_COLUMNS_MEDIA_QUERY).matches,
  isDesktopViewport: window.matchMedia(TEXT_READER_DESKTOP_MEDIA_QUERY).matches,
  isLargeViewport: window.matchMedia(TEXT_READER_COLUMNS_LG_MEDIA_QUERY).matches,
});

interface TextSelectionInfo {
  text: string;
  position: { x: number; y: number };
  contentOffset?: number;
  contentEndOffset?: number;
}

export const TextReaderPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const [searchParams] = useSearchParams();
  /** 外部批注直达目标（?ann=<id>）；一次导航只消费一次 */
  const annTargetId = searchParams.get(ANNOTATION_QUERY_PARAM);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uiAutoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 无缝续读：滚动模式下已拼接渲染的章节窗口 [start, end)；start 变化（向前扩窗/裁剪）时需滚动补偿
  const [scrollWindow, setScrollWindow] = useState({ start: 0, end: 1 });
  const scrollChapterElsRef = useRef<Map<number, HTMLElement>>(new Map());
  const scrollCompensationRef = useRef<{ referenceChapter: number; docPos: number } | null>(null);
  // 显式导航（goToChapter）后抑制一次视口追踪：scrollTo(0,0) 引发的 scroll 事件不应把当前章拉回窗口首章
  const suppressViewTrackingRef = useRef(false);
  // scroll 模式重新挂载（模式切换回来）时重置拼接窗口的判定基准
  const wasScrollModeRef = useRef(false);

  const [chapters, setChapters] = useState<TextChapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uiVisible, setUiVisible] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isEpub, setIsEpub] = useState(false);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [localFontSize, setLocalFontSize] = useState<number | null>(null);
  const [localLineHeight, setLocalLineHeight] = useState<number | null>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isProgressHintVisible, setIsProgressHintVisible] = useState(false);
  const [isChapterEndPromptVisible, setIsChapterEndPromptVisible] = useState(false);
  const [ttsActive, setTtsActive] = useState(false);
  const [isProgressDragging, setIsProgressDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);
  const isLandscapeViewport = useLandscapeViewport(TEXT_READER_COLUMNS_MEDIA_QUERY);

  // 分页模式状态
  const [textPages, setTextPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState<number | null>(null);
  const [pageDirection, setPageDirection] = useState<'left' | 'right' | null>(null);
  const [isPageAnimating, setIsPageAnimating] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0); // 翻书跟手进度 0~1
  const measureRef = useRef<HTMLDivElement>(null);
  const markdownMeasureRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const flipPageRef = useRef<HTMLDivElement>(null); // 翻书交互页面容器

  // 书签 & 批注状态
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);
  const [isAnnotationListOpen, setIsAnnotationListOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<TextSelectionInfo | null>(null);
  const selectionPopupRef = useRef(selectionPopup);
  selectionPopupRef.current = selectionPopup;
  // 浮动批注按钮：选中文本后先显示一个小按钮，点击后再弹出批注编辑窗
  const [selectionInfo, setSelectionInfo] = useState<TextSelectionInfo | null>(null);
  const selectionInfoRef = useRef(selectionInfo);
  selectionInfoRef.current = selectionInfo;
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<Annotation | null>(null);
  const isSelectingTextRef = useRef(false);
  const selectionPopupTimeRef = useRef<number>(0);
  const lastTouchEndTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const LONG_PRESS_DURATION = 500;
  const LONG_PRESS_THRESHOLD = 15;

  // 待处理的导航目标（书签/批注跳转后跨章节时暂存，等内容就绪后执行）
  const pendingNavRef = useRef<{
    chapterIndex: number;
    scrollRatio?: number;
    pageIndex?: number;
  } | null>(null);
  // 分页完成后跳过重置到第 0 页（用于媒体加载重分页时保留当前页）
  const skipNextPageResetRef = useRef(false);
  // 分页定位请求：跨章节跳转/进度恢复把目标页排队，分页完成时同步消费，
  // 替代「定时器赌分页完成」的时序写法
  type PageRequest = { pageIndex?: number; ratio?: number };
  const pendingPageRequestRef = useRef<PageRequest | null>(null);
  // 最近一次完成分页的章节下标（判断现有 textPages 是否对当前章节有效）
  const paginatedChapterIndexRef = useRef(-1);

  const { getBookById, updateProgress } = useLibraryStore();
  const { settings } = useAppStore();

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const localFontSizeRef = useRef(localFontSize);
  localFontSizeRef.current = localFontSize;
  const localLineHeightRef = useRef(localLineHeight);
  localLineHeightRef.current = localLineHeight;
  const currentChapterIndexRef = useRef(currentChapterIndex);
  currentChapterIndexRef.current = currentChapterIndex;
  const currentPageIndexRef = useRef(currentPageIndex);
  currentPageIndexRef.current = currentPageIndex;
  const scrollPercentRef = useRef(scrollPercent);
  scrollPercentRef.current = scrollPercent;

  /**
   * 请求某次分页完成后跳页。当前章节分页已就绪则立即消费（零等待），
   * 否则排队，由分页完成点消费（慢设备不再依赖固定延时）。
   */
  const requestPageAfterPagination = useCallback(
    (target: number | { ratio: number }) => {
      const request: PageRequest = typeof target === 'number' ? { pageIndex: target } : target;
      const ready =
        paginatedChapterIndexRef.current === currentChapterIndexRef.current &&
        textPagesLengthRef.current > 0;
      if (ready) {
        const totalPages = textPagesLengthRef.current;
        const desired =
          request.pageIndex ?? Math.floor((request.ratio ?? 0) * totalPages);
        setCurrentPageIndex(Math.max(0, Math.min(desired, totalPages - 1)));
        return;
      }
      pendingPageRequestRef.current = request;
    },
    []
  );

  /** 分页完成点消费定位请求；返回是否消费了请求 */
  const consumePendingPageIndex = useCallback((totalPages: number): boolean => {
    const request = pendingPageRequestRef.current;
    if (!request) return false;
    pendingPageRequestRef.current = null;
    let desired = request.pageIndex ?? 0;
    if (request.pageIndex == null && request.ratio != null) {
      desired = Math.floor(request.ratio * totalPages);
    }
    setCurrentPageIndex(totalPages > 0 ? Math.max(0, Math.min(desired, totalPages - 1)) : 0);
    return true;
  }, []);

  /** 分页引擎统一收尾：消费定位请求 → 保留当前页 → 重置到第 0 页 */
  const applyPaginationResult = useCallback(
    (pages: string[]) => {
      setTextPages(pages);
      paginatedChapterIndexRef.current = currentChapterIndexRef.current;
      if (consumePendingPageIndex(pages.length)) return;
      if (skipNextPageResetRef.current) {
        skipNextPageResetRef.current = false;
      } else {
        setCurrentPageIndex(TEXT_PAGE_RESET_INDEX);
      }
    },
    [consumePendingPageIndex]
  );

  const showProgressHint = useCallback(() => {
    setIsProgressHintVisible(true);
    if (progressHintTimerRef.current) {
      clearTimeout(progressHintTimerRef.current);
    }
    progressHintTimerRef.current = setTimeout(() => {
      setIsProgressHintVisible(false);
      progressHintTimerRef.current = null;
    }, PROGRESS_HINT_AUTO_HIDE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (progressHintTimerRef.current) {
        clearTimeout(progressHintTimerRef.current);
      }
    };
  }, []);

  const fontSize = localFontSize ?? settings.fontSize;
  const lineHeight = localLineHeight ?? settings.textLineHeight;
  const textFontFamily = settings.textFontFamily;
  const textAlign = settings.textAlign;
  const firstLineIndent = settings.firstLineIndent;
  const tapZoneEnabled = settings.tapZoneEnabled;
  const autoAdvanceTextChapter = settings.autoAdvanceTextChapter;
  const autoScrollSpeed = settings.autoScrollSpeed;
  const textReadingMode = settings.textReadingMode;
  const brightness = settings.brightness;
  const colorTemperature = settings.colorTemperature;
  const isColumnsReadingMode = textReadingMode === 'columns';
  // 无缝续读：滚动模式 + 章末自动衔接开启（下一章拼接在当前章下方，滚动自然过渡）
  const isSeamlessReading = textReadingMode === 'scroll' && autoAdvanceTextChapter;
  // 竖排书写仅在滚动模式生效（分页引擎为横向测量，不与竖排混用）
  const verticalWriting = settings.verticalWriting && textReadingMode === 'scroll';
  const isColumnsLayoutActive = isColumnsReadingMode && isLandscapeViewport;
  const textPageStep = isColumnsLayoutActive ? TEXT_COLUMNS_PAGE_STEP : 1;

  const book = bookId ? getBookById(bookId) : undefined;
  const title = book?.title ?? '未知书籍';
  const currentChapter = chapters[currentChapterIndex];
  const hasMultipleChapters = chapters.length > 1;

  // 屏幕常亮 / 自动滚动 / 剩余时间估算（共享 Hook）
  useWakeLock();
  const { isAutoScrolling, toggleAutoScroll } = useAutoScroll(scrollContainerRef, autoScrollSpeed, verticalWriting ? 'x' : 'y');

  // EPUB 插图 object URL 生命周期：离开阅读器时统一回收
  useEffect(() => {
    return () => revokeEpubObjectUrls();
  }, []);
  const estimatedTimeLeft = useEstimatedTimeLeft(currentChapter?.content.length, scrollPercent);

  // 字体映射
  const resolvedFontFamily = useMemo(() => {
    return getTextReaderFontFamily(textFontFamily);
  }, [textFontFamily]);

  // 阅读主题样式（单源定义见 @/constants/readerThemes）


  // 阅读外观 = 纸型（与漫画阅读同源）：底色恒纸型色、文字恒暖墨；
  // 纹理层 multiply 混入纸色（paperMode 关闭时仅无噪声，底色不变）
  const paperConfigForBg = getPaperConfig(settings.paperType);
  const effectiveBg = paperConfigForBg.bgColor;
  const effectiveColor = paperConfigForBg.inkColor ?? PAPER_INK_COLOR;
  const paperTextureLayer = useMemo(() => {
    if (!settings.paperMode) return null;
    const config = getPaperConfig(settings.paperType);
    const opacity = computePaperOpacity(
      settings.textureIntensity,
      getPaperBaseOpacity(settings.paperType),
      false
    );
    return {
      backgroundImage: config.svgFilter(opacity),
      mixBlendMode: config.blendMode as 'multiply' | 'screen',
    };
  }, [settings.paperMode, settings.paperType, settings.textureIntensity]);

  const displayFilter = useMemo(() => {
    const filters: string[] = [];
    if (brightness < PERCENT_MULTIPLIER) filters.push(`brightness(${brightness / PERCENT_MULTIPLIER})`);
    if (colorTemperature > 0) {
      const sepiaValue = (colorTemperature / PERCENT_MULTIPLIER) * TEXT_SEPIA_MAX_INTENSITY;
      filters.push(`sepia(${sepiaValue})`);
    }
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [brightness, colorTemperature]);

  // 加载文本内容
  useEffect(() => {
    if (!bookId) return;
    // 直链/刷新进入时内存 books 为空：补一次加载，让标题/收藏态等元数据就位
    if (useLibraryStore.getState().books.length === 0) {
      useLibraryStore.getState().loadBooks();
    }
    let cancelled = false;
    setIsLoading(true);
    loadTextContent(bookId).then(({ chapters: loadedChapters, isEpub: epub, isMarkdown: markdown }) => {
      if (cancelled) return;
      setChapters(loadedChapters);
      setIsEpub(epub);
      setIsMarkdown(markdown);
      setIsLoading(false);
      // 加载完成后自动显示 UI 3 秒
      setUiVisible(true);
      if (uiAutoHideTimerRef.current) clearTimeout(uiAutoHideTimerRef.current);
      uiAutoHideTimerRef.current = setTimeout(() => {
        setUiVisible(false);
        uiAutoHideTimerRef.current = null;
      }, UI_AUTO_HIDE_AFTER_LOAD_MS);
    }).catch(() => {
      if (cancelled) return;
      setChapters([{ id: 'ch1', title: '正文', content: '加载失败' }]);
      setIsLoading(false);
    });
    return () => { cancelled = true };
  }, [bookId]);

  // 轻提示（撤销 / 方向引导）
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, undo?: () => void) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undo });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, undo ? UNDO_TOAST_AUTO_HIDE_MS : HINT_TOAST_AUTO_HIDE_MS);
  }, []);

  // 按书偏好恢复每本书只执行一次：本 effect 依赖 textReadingMode，若每次依赖变化都覆盖，
  // 用户刚切换的模式会被书内旧值当场回滚（切换不立即落进度，旧值仍在 readingProgress 里）
  const restoredPrefsBookIdRef = useRef<string | null>(null);

  // 恢复阅读位置（增强：支持章节+分页恢复）
  useEffect(() => {
    if (!bookId || isLoading) return;
    if (chapterId) {
      const targetChapterIndex = resolveTextChapterIndex(chapters, book?.chapters, bookId, chapterId);
      if (targetChapterIndex >= 0) {
        setCurrentChapterIndex(targetChapterIndex);
        setCurrentPageIndex(0);
        setScrollPercent(0);
        requestAnimationFrame(() => {
          scrollContainerRef.current?.scrollTo(0, 0);
        });
      }
      return;
    }

    const progress = useLibraryStore.getState().readingProgress[bookId];
    if (!progress) return;

    // 按书记忆的阅读偏好：有则覆盖全局设置（语义为「上次读这本书时的模式/主题」）。
    // 仅在首次恢复本书时执行，避免 effect 因 textReadingMode 依赖重跑时把用户刚切换的模式改回去
    if (restoredPrefsBookIdRef.current !== bookId) {
      restoredPrefsBookIdRef.current = bookId;
      const appState = useAppStore.getState();
      if (progress.textReadingMode && progress.textReadingMode !== appState.settings.textReadingMode) {
        appState.updateSettings({ textReadingMode: progress.textReadingMode });
      }
    }

    // 从 locator 解析文本阅读定位信息
    let locatorData: { chapterIndex?: number; pageIndex?: number; scrollRatio?: number } | null = null;
    if (progress.locator) {
      try { locatorData = JSON.parse(progress.locator); } catch { /* ignore */ }
    }

    const restoredChapterIndex = locatorData?.chapterIndex ?? 0;
    // 恢复定位时使用本书偏好的模式（updateSettings 要到下一渲染才生效）
    const effectiveReadingMode = progress.textReadingMode ?? textReadingMode;

    if (effectiveReadingMode === 'scroll') {
      // 滚动模式：恢复章节 + 滚动位置
      if (restoredChapterIndex > 0 && restoredChapterIndex < chapters.length) {
        setCurrentChapterIndex(restoredChapterIndex);
      }
      const ratio = locatorData?.scrollRatio ?? progress.pageScrollRatio ?? 0;
      if (ratio > 0) {
        requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (!container) return;
          // 恢复定位映射到章内（无缝续读窗口含后续章，整容器换算会越过本章末尾）
          let target = ratio * (verticalWriting
            ? container.scrollWidth - container.clientWidth
            : container.scrollHeight - container.clientHeight);
          const el = container.querySelector<HTMLElement>(`[data-chapter-index="${restoredChapterIndex}"]`);
          if (el) {
            const hostRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const chapterStart = verticalWriting
              ? Math.abs(container.scrollLeft) + (hostRect.right - elRect.right)
              : container.scrollTop + (elRect.top - hostRect.top);
            const chapterSize = verticalWriting ? elRect.width : elRect.height;
            target = chapterStart + ratio * Math.max(0, chapterSize - container.clientHeight);
          }
          if (verticalWriting) {
            container.scrollLeft = -target;
          } else {
            container.scrollTop = target;
          }
        });
      }
    } else {
      // 分页/翻书模式：恢复章节 + 页索引
      if (restoredChapterIndex > 0 && restoredChapterIndex < chapters.length) {
        setCurrentChapterIndex(restoredChapterIndex);
      }
      const pageIndex = locatorData?.pageIndex ?? 0;
      if (pageIndex > 0) {
        // 排队定位请求，分页完成时消费（已就绪则立即生效）
        requestPageAfterPagination(pageIndex);
      }
    }
    // verticalWriting 只在 rAF 内读取：加入依赖会让恢复定位在竖排开关切换时重放、跳回恢复点
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapterId, isLoading, textReadingMode, chapters, book?.chapters, requestPageAfterPagination]);

  // 直链/刷新进入时 store 尚无书目（顶栏书名会显示「未知书籍」）：挂载补一次聚合读取
  useEffect(() => {
    if (!useLibraryStore.getState().books.length) {
      void useLibraryStore.getState().loadBooks();
    }
  }, []);

  // 统计阅读时长（共享 Hook）
  useReadingStats(bookId);

  // 保存阅读进度的通用函数（使用 ref 避免循环依赖）
  const bookRef = useRef(book);
  bookRef.current = book;
  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;
  const textPagesLengthRef = useRef(textPages.length);
  textPagesLengthRef.current = textPages.length;
  const textPagesRef = useRef(textPages);
  textPagesRef.current = textPages;

  const saveTextProgress = useCallback((chapterIdx: number, pageIdx?: number, scrollRat?: number) => {
    if (!bookId) return;
    const b = bookRef.current;
    const chs = chaptersRef.current;
    const tpLen = textPagesLengthRef.current;
    const chapterId = b?.chapters[chapterIdx]?.id ?? `${bookId}-ch${chapterIdx + 1}`;
    const locator = JSON.stringify({
      chapterIndex: chapterIdx,
      pageIndex: pageIdx,
      scrollRatio: scrollRat,
    });
    const ratio = scrollRat ?? (pageIdx != null && tpLen > 0 ? (pageIdx + 1) / tpLen : 0);
    const overallRatio = getOverallReadingRatio(chapterIdx, chs.length, ratio);
    // 保存时读取最新设置，供下次打开本书时按书恢复
    const currentSettings = useAppStore.getState().settings;
    updateProgress(bookId, {
      bookId,
      chapterId,
      page: pageIdx != null ? pageIdx + 1 : 1,
      pageScrollRatio: scrollRat,
      chapterScrollRatio: ratio,
      readingMode: 'vertical',
      totalPages: tpLen || 1,
      percentage: overallRatio * PERCENT_MULTIPLIER,
      globalPageIndex: chapterIdx,
      totalImages: chs.length,
      locator,
      textReadingMode: currentSettings.textReadingMode,
      readingTheme: currentSettings.readingTheme,
    });
  }, [bookId, updateProgress]);

  // 进度条拖动
  const handleProgressSliderValueChange = useCallback((val: number) => {
    setDragPercent(val);
    showProgressHint();
  }, [showProgressHint]);

  const goToPageRef = useRef<((index: number, direction: 'left' | 'right') => void) | null>(null);

  const handleProgressSliderCommit = useCallback(() => {
    setIsProgressDragging(false);
    const ratio = dragPercent / PERCENT_MULTIPLIER;

    if (textReadingMode === 'scroll') {
      const container = scrollContainerRef.current;
      if (container) {
        let target = ratio * (verticalWriting
          ? container.scrollWidth - container.clientWidth
          : container.scrollHeight - container.clientHeight);
        if (isSeamlessReading) {
          // 无缝续读：比例映射到当前章内部（窗口含后续章，不能用整容器换算）
          const el = container.querySelector<HTMLElement>(`[data-chapter-index="${currentChapterIndex}"]`);
          if (el) {
            const hostRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const chapterStart = verticalWriting
              ? Math.abs(container.scrollLeft) + (hostRect.right - elRect.right)
              : container.scrollTop + (elRect.top - hostRect.top);
            const chapterSize = verticalWriting ? elRect.width : elRect.height;
            target = chapterStart + ratio * Math.max(0, chapterSize - container.clientHeight);
          }
        }
        if (verticalWriting) {
          container.scrollTo({ left: -target, behavior: 'smooth' });
        } else {
          container.scrollTo({ top: target, behavior: 'smooth' });
        }
      }
      saveTextProgress(currentChapterIndex, undefined, ratio);
    } else {
      // 分页/翻书模式：跳转到对应页
      if (textPages.length > 0) {
        const targetPage = Math.min(
          Math.floor(ratio * textPages.length),
          textPages.length - 1
        );
        const direction = targetPage > currentPageIndex ? 'left' : targetPage < currentPageIndex ? 'right' : null;
        if (direction && targetPage !== currentPageIndex) {
          goToPageRef.current?.(targetPage, direction);
        }
        saveTextProgress(currentChapterIndex, targetPage);
      }
    }
    setScrollPercent(dragPercent);
    showProgressHint();
  }, [dragPercent, textReadingMode, currentChapterIndex, textPages.length, currentPageIndex, isSeamlessReading, saveTextProgress, showProgressHint, verticalWriting]);

  // 章节在滚动内容中的起点与尺寸（文档坐标，不随滚动变化；按排版轴抽象）
  const chapterGeometry = useCallback((index: number): { start: number; size: number } | null => {
    const host = scrollContainerRef.current;
    const el = scrollChapterElsRef.current.get(index);
    if (!host || !el) return null;
    const hostRect = host.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (verticalWriting) {
      // vertical-rl：块流自右向左延伸，scrollLeft 为负方向，|scrollLeft| 即阅读推进距离
      return {
        start: Math.abs(host.scrollLeft) + (hostRect.right - elRect.right),
        size: elRect.width,
      };
    }
    return {
      start: host.scrollTop + (elRect.top - hostRect.top),
      size: elRect.height,
    };
  }, [verticalWriting]);

  /** 记录滚动补偿基准：窗口增缩后按基准章的位移同步滚动位置，视口内容不跳动 */
  const captureScrollCompensation = useCallback((refChapter: number): boolean => {
    const geo = chapterGeometry(refChapter);
    if (!geo) return false;
    scrollCompensationRef.current = { referenceChapter: refChapter, docPos: geo.start };
    return true;
  }, [chapterGeometry]);

  // 滚动进度追踪
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !bookId) return;
    const anchor = verticalWriting ? Math.abs(container.scrollLeft) : container.scrollTop;
    const scrollable = verticalWriting
      ? container.scrollWidth - container.clientWidth
      : container.scrollHeight - container.clientHeight;
    if (scrollable <= 0) return;
    showProgressHint();

    // —— 无缝续读：视口追踪所在章 + 章内百分比 + 预拼接窗口（听书期间让位播报，切章由 speech 播完回调独占） ——
    if (isSeamlessReading && !ttsActive) {
      const rendered = [...scrollChapterElsRef.current.keys()].sort((a, b) => a - b);
      if (rendered.length > 0) {
        let activeIndex = rendered[rendered.length - 1];
        for (const idx of rendered) {
          const geo = chapterGeometry(idx);
          if (!geo) continue;
          if (anchor >= geo.start) {
            activeIndex = idx;
          }
        }
        // 显式导航后的首个 scroll 事件：保持导航目标章，不做视口追踪
        if (suppressViewTrackingRef.current) {
          suppressViewTrackingRef.current = false;
          if (scrollChapterElsRef.current.has(currentChapterIndex)) {
            activeIndex = currentChapterIndex;
          }
        }
        const activeGeo = chapterGeometry(activeIndex);
        const activeStart = activeGeo?.start ?? 0;
        const chapterRatio = activeGeo && activeGeo.size > 0
          ? Math.min(1, Math.max(0, (anchor - activeStart) / activeGeo.size))
          : 0;
        if (activeIndex !== currentChapterIndex) {
          setCurrentChapterIndex(activeIndex);
        }
        if (!isProgressDragging) {
          setScrollPercent(Math.round(chapterRatio * PERCENT_MULTIPLIER));
        }

        // 窗口维护：向后预拼接 / 向前扩窗（带补偿）/ 超限裁剪（带补偿）
        const win = scrollWindow;
        let newStart = win.start;
        let newEnd = Math.max(win.end, Math.min(chapters.length, activeIndex + 1 + SCROLL_WINDOW_AHEAD));
        if (activeIndex === win.start && win.start > 0) {
          const firstGeo = chapterGeometry(win.start);
          if (firstGeo && anchor - firstGeo.start <= SCROLL_WINDOW_PREPEND_PX) {
            if (captureScrollCompensation(win.start)) {
              newStart = win.start - 1;
            }
          }
        }
        if (newEnd - newStart > SCROLL_WINDOW_MAX) {
          if (activeIndex - newStart >= newEnd - 1 - activeIndex) {
            // 视口偏窗口后部 → 裁掉前端（上方内容移除，需补偿；基准章取裁剪后仍在 DOM 的前一章）
            if (captureScrollCompensation(activeIndex - 1)) {
              newStart = activeIndex - 1;
            }
          } else {
            newEnd = activeIndex + 1 + SCROLL_WINDOW_AHEAD + 1;
          }
          if (newEnd - newStart > SCROLL_WINDOW_MAX) {
            newEnd = newStart + SCROLL_WINDOW_MAX;
          }
        }
        if (newStart !== win.start || newEnd !== win.end) {
          setScrollWindow({ start: Math.max(0, newStart), end: Math.min(chapters.length, newEnd) });
        }

        // 防抖保存进度（章内比例）
        if (progressSaveTimerRef.current) clearTimeout(progressSaveTimerRef.current);
        progressSaveTimerRef.current = setTimeout(() => {
          saveTextProgress(activeIndex, undefined, chapterRatio);
        }, PROGRESS_SAVE_DEBOUNCE);
        return;
      }
    }

    // —— 单章滚动（关闭自动衔接）：到底显示继续提示，手动续读 ——
    const ratio = anchor / scrollable;
    if (!isProgressDragging) {
      setScrollPercent(Math.round(ratio * PERCENT_MULTIPLIER));
    }
    const hasNextChapter = currentChapterIndex < chapters.length - 1;
    const endPosition = verticalWriting
      ? anchor + container.clientWidth
      : anchor + container.clientHeight;
    const contentSize = verticalWriting ? container.scrollWidth : container.scrollHeight;
    const isAtChapterEnd = ratio >= TEXT_SCROLL_END_THRESHOLD ||
      endPosition >= contentSize - TEXT_SCROLL_END_EPSILON_PX;
    // 听书期间章末提示让位播报进度，避免提前切换当前章的朗读内容
    if (!ttsActive) {
      setIsChapterEndPromptVisible(hasNextChapter && isAtChapterEnd);
    }

    // 防抖保存进度
    if (progressSaveTimerRef.current) clearTimeout(progressSaveTimerRef.current);
    progressSaveTimerRef.current = setTimeout(() => {
      saveTextProgress(currentChapterIndex, undefined, ratio);
    }, PROGRESS_SAVE_DEBOUNCE);
  }, [bookId, currentChapterIndex, chapters.length, isSeamlessReading, ttsActive, scrollWindow, chapterGeometry, captureScrollCompensation, saveTextProgress, isProgressDragging, showProgressHint, verticalWriting]);

  // 窗口 start 变化（向前扩窗/前端裁剪）后补偿滚动位置：上方内容增删了多少，滚动位置同步加减多少
  useLayoutEffect(() => {
    const comp = scrollCompensationRef.current;
    if (!comp) return;
    scrollCompensationRef.current = null;
    const geo = chapterGeometry(comp.referenceChapter);
    const container = scrollContainerRef.current;
    if (!geo || !container) return;
    const delta = geo.start - comp.docPos;
    if (delta === 0) return;
    if (verticalWriting) {
      container.scrollLeft = -(Math.abs(container.scrollLeft) + delta);
    } else {
      container.scrollTop += delta;
    }
  }, [scrollWindow, chapterGeometry, verticalWriting]);

  // 滚动模式重新挂载（从分页模式切回）时，重置拼接窗口与滚动位置到当前章
  useEffect(() => {
    const isScroll = textReadingMode === 'scroll';
    const wasScroll = wasScrollModeRef.current;
    wasScrollModeRef.current = isScroll;
    if (!isScroll || wasScroll || isLoading) return;
    scrollContainerRef.current?.scrollTo(0, 0);
    setScrollPercent(0);
    setScrollWindow({
      start: Math.max(0, Math.min(currentChapterIndex, chapters.length - 1)),
      end: Math.min(chapters.length, currentChapterIndex + 1 + SCROLL_WINDOW_AHEAD),
    });
  }, [textReadingMode, isLoading, currentChapterIndex, chapters.length]);

  // 当前章落在拼接窗口之外时（进书恢复、深链等）重置窗口覆盖当前章；窗内则补足向后预拼接量
  useEffect(() => {
    if (!isSeamlessReading || isLoading || chapters.length === 0) return;
    setScrollWindow((win) => {
      const desiredEnd = Math.min(chapters.length, currentChapterIndex + 1 + SCROLL_WINDOW_AHEAD);
      if (currentChapterIndex >= win.start && currentChapterIndex < win.end) {
        return win.end >= desiredEnd ? win : { start: win.start, end: desiredEnd };
      }
      const start = Math.max(0, Math.min(currentChapterIndex, chapters.length - 1));
      return { start, end: Math.min(chapters.length, start + 1 + SCROLL_WINDOW_AHEAD) };
    });
  }, [isSeamlessReading, isLoading, currentChapterIndex, chapters.length]);

  // 离开时保存最终进度 + 清理 UI 定时器 + 持久化阅读设置
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current);
      }
      if (uiAutoHideTimerRef.current) {
        clearTimeout(uiAutoHideTimerRef.current);
      }
      // 统一保存所有阅读设置到全局 store
      const s = settingsRef.current;
      const settingsUpdate: Partial<import('@/types').UserSettings> = {
        // 全局设置（实时同步的，这里作为安全保底的最终写入）
        readingTheme: s.readingTheme,
        textFontFamily: s.textFontFamily,
        textAlign: s.textAlign,
        firstLineIndent: s.firstLineIndent,
        tapZoneEnabled: s.tapZoneEnabled,
        autoAdvanceTextChapter: s.autoAdvanceTextChapter,
        autoScrollSpeed: s.autoScrollSpeed,
        textReadingMode: s.textReadingMode,
        brightness: s.brightness,
        colorTemperature: s.colorTemperature,
        // 局部覆盖的设置
        fontSize: localFontSizeRef.current ?? s.fontSize,
        textLineHeight: localLineHeightRef.current ?? s.textLineHeight,
      };
      useAppStore.getState().updateSettings(settingsUpdate);

      // 保存最终阅读位置到继续阅读列表
      if (bookId) {
        const chapterIdx = currentChapterIndexRef.current;
        const pageIdx = currentPageIndexRef.current;
        const b = bookRef.current;
        const chs = chaptersRef.current;
        const tpLen = textPagesLengthRef.current;
        const mode = settingsRef.current.textReadingMode;
        const chapterId = b?.chapters[chapterIdx]?.id ?? `${bookId}-ch${chapterIdx + 1}`;

        let scrollRatio: number | undefined;
        let ratio: number;

        if (mode === 'scroll') {
          // 滚动模式：从滚动容器计算精确位置
          // 卸载时才读取 ref：loading 早退期间容器未挂载，无法在 effect 建立时捕获
          // eslint-disable-next-line react-hooks/exhaustive-deps
          const container = scrollContainerRef.current;
          if (container) {
            const scrollable = container.scrollHeight - container.clientHeight;
            scrollRatio = scrollable > 0 ? container.scrollTop / scrollable : 0;
          }
          ratio = scrollRatio ?? scrollPercentRef.current / PERCENT_MULTIPLIER;
        } else {
          // 分页/翻书模式
          ratio = tpLen > 0 ? (pageIdx + 1) / tpLen : 0;
        }
        const overallRatio = getOverallReadingRatio(chapterIdx, chs.length, ratio);

        const locator = JSON.stringify({
          chapterIndex: chapterIdx,
          pageIndex: mode !== 'scroll' ? pageIdx : undefined,
          scrollRatio: mode === 'scroll' ? scrollRatio : undefined,
        });

        useLibraryStore.getState().updateProgress(bookId, {
          bookId,
          chapterId,
          page: mode !== 'scroll' ? pageIdx + 1 : 1,
          pageScrollRatio: mode === 'scroll' ? scrollRatio : undefined,
          chapterScrollRatio: ratio,
          readingMode: 'vertical',
          totalPages: tpLen || 1,
          percentage: overallRatio * PERCENT_MULTIPLIER,
          globalPageIndex: chapterIdx,
          totalImages: chs.length,
          locator,
          textReadingMode: settingsRef.current.textReadingMode,
          readingTheme: settingsRef.current.readingTheme,
        });
      }
    };
  }, [bookId]);

  // 点击切换 UI
  const toggleUi = useCallback(() => {
    // 取消待执行的自动隐藏定时器，避免用户操作后被意外隐藏
    if (uiAutoHideTimerRef.current) {
      clearTimeout(uiAutoHideTimerRef.current);
      uiAutoHideTimerRef.current = null;
    }
    setUiVisible(prev => !prev);
  }, []);

  // Android 返回键：从最上层浮层开始逐层关闭
  useBackHandler(() => {
    if (selectionPopup) { setSelectionPopup(null); return true; }
    if (highlightedAnnotation) { setHighlightedAnnotation(null); return true; }
    if (isBottomBarVisible) { setIsBottomBarVisible(false); return true; }
    if (isBookmarkPanelOpen) { setIsBookmarkPanelOpen(false); return true; }
    if (isAnnotationListOpen) { setIsAnnotationListOpen(false); return true; }
    if (isSearchPanelOpen) { setIsSearchPanelOpen(false); return true; }
    if (isChapterDrawerOpen) { setIsChapterDrawerOpen(false); return true; }
    if (uiVisible) { toggleUi(); return true; }
    return false;
  });

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 章节切换（显式导航：目录/书签/检索/上下章按钮，保留硬切语义）
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      suppressViewTrackingRef.current = true;
      setCurrentChapterIndex(index);
      scrollContainerRef.current?.scrollTo(0, 0);
      setScrollPercent(0);
      setIsChapterEndPromptVisible(false);
      setScrollWindow({ start: index, end: Math.min(chapters.length, index + 1 + SCROLL_WINDOW_AHEAD) });
      setIsChapterDrawerOpen(false);
    }
  }, [chapters.length]);

  const goToNextChapter = useCallback(() => {
    goToChapter(currentChapterIndex + 1);
  }, [currentChapterIndex, goToChapter]);
  const goToNextChapterRef = useRef<(() => void) | null>(null);
  goToNextChapterRef.current = goToNextChapter;

  const goToPrevChapter = useCallback(() => {
    goToChapter(currentChapterIndex - 1);
  }, [currentChapterIndex, goToChapter]);

  // ========== 听书（Web Speech API） ==========
  const speech = useSpeech(useCallback(() => {
    // 当前章播完：自动续播下一章；全书结束则停止
    if (currentChapterIndexRef.current < chaptersRef.current.length - 1) {
      goToNextChapterRef.current?.();
    } else {
      setTtsActive(false);
    }
  }, []), useCallback((message: string) => {
    showToast(message);
  }, [showToast]));

  const handleToggleTTS = useCallback(() => {
    if (ttsActive) {
      setTtsActive(false);
      speech.stop();
    } else {
      setTtsActive(true);
    }
  }, [ttsActive, speech]);

  // 听书引擎切换:神经网络首次启用前确认音色包下载体积
  const [pendingNeuralConfirm, setPendingNeuralConfirm] = useState(false);
  const handleTtsEngineChange = useCallback(async (engine: TtsEngineOption) => {
    if (engine === 'neural' && !(await piperModelStored())) {
      setPendingNeuralConfirm(true);
      return;
    }
    useAppStore.getState().updateSettings({ ttsEngine: engine });
  }, []);
  const handleTtsServerFieldChange = useCallback((field: 'url' | 'model' | 'voice', value: string) => {
    useAppStore.getState().updateSettings(
      field === 'url' ? { ttsServerUrl: value } : field === 'model' ? { ttsServerModel: value } : { ttsServerVoice: value }
    );
  }, []);

  // 听书期间挂起匀速自动滚动（跟滚改由高亮驱动，两套滚动并存会互相打断产生抖动），退出听书恢复原状态
  const isAutoScrollingRef = useRef(isAutoScrolling);
  isAutoScrollingRef.current = isAutoScrolling;
  const autoScrollWasActiveBeforeTtsRef = useRef(false);
  const prevTtsActiveRef = useRef(false);
  useEffect(() => {
    if (ttsActive && !prevTtsActiveRef.current) {
      if (isAutoScrollingRef.current) {
        autoScrollWasActiveBeforeTtsRef.current = true;
        toggleAutoScroll();
      }
    } else if (!ttsActive && prevTtsActiveRef.current) {
      if (autoScrollWasActiveBeforeTtsRef.current && !isAutoScrollingRef.current) {
        toggleAutoScroll();
      }
      autoScrollWasActiveBeforeTtsRef.current = false;
    }
    prevTtsActiveRef.current = ttsActive;
  }, [ttsActive, toggleAutoScroll]);

  // 听书开启/换章时：从当前阅读位置起播（滚动模式按进度比例、分页模式按当前页偏移换算字符起点）
  const chapterSpeechText = currentChapter
    ? currentChapter.markdownDocument?.text ?? currentChapter.content
    : '';
  /** 当前播报范围（章节坐标系）：驱动正文范围高亮渲染 */
  const speechRange = ttsActive ? speech.currentChunkRange : null;

  const { start: speechStart, stop: speechStop } = speech;
  useEffect(() => {
    if (!ttsActive || !chapterSpeechText) return;
    let startChar = 0;
    if (textReadingMode === 'scroll') {
      const ratio = scrollPercentRef.current / PERCENT_MULTIPLIER;
      if (ratio > 0 && ratio < 1) startChar = Math.floor(ratio * chapterSpeechText.length);
    } else if (paginatedChapterIndexRef.current === currentChapterIndexRef.current) {
      // 分页/翻书模式：页文本是章节可读文本的顺序切片，起播点 = 当前页之前所有页的长度和
      let offset = 0;
      for (let i = 0; i < currentPageIndexRef.current && i < textPagesLengthRef.current; i++) {
        offset += textPagesRef.current[i].length;
      }
      startChar = Math.min(offset, chapterSpeechText.length);
    }
    let slice = chapterSpeechText.slice(startChar);
    let baseOffset = startChar;
    if (!slice.trim()) {
      slice = chapterSpeechText;
      baseOffset = 0;
    }
    speechStart(slice, baseOffset);
    return () => speechStop();
  }, [ttsActive, currentChapterIndex, chapterSpeechText, textReadingMode, speechStart, speechStop]);

  // 滚动模式跟读滚动：高亮目标越出视口舒适区时平滑滚到落点（听书时匀速自动滚动已挂起，不会互相打断）
  useEffect(() => {
    if (!ttsActive || textReadingMode !== 'scroll' || !speechRange) return;
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      const target = container?.querySelector<HTMLElement>('.speech-reading');
      if (!container || !target) return;
      const rect = target.getBoundingClientRect();
      const view = container.getBoundingClientRect();
      if (rect.height <= 0 || view.height <= 0) return;
      if (verticalWriting) {
        // 竖排：阅读沿横轴推进，落点取视口横向中点
        if (rect.left < view.left + view.width * SPEECH_FOLLOW_ZONE_START
          || rect.right > view.left + view.width * SPEECH_FOLLOW_ZONE_END) {
          const delta = rect.left + rect.width / 2 - (view.left + view.width / 2);
          container.scrollBy({ left: delta, behavior: 'smooth' });
        }
      } else if (rect.top - view.top < view.height * SPEECH_FOLLOW_ZONE_START
        || (rect.bottom - view.top) / view.height > SPEECH_FOLLOW_ZONE_END) {
        const delta = rect.top + rect.height / 2 - (view.top + view.height * SPEECH_FOLLOW_ANCHOR_RATIO);
        container.scrollBy({ top: delta, behavior: 'smooth' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [ttsActive, speechRange, textReadingMode, verticalWriting]);

  // 分页/翻书模式跟读翻页：按播报偏移定位目标页，仅向前跟随（页文本是章节文本的顺序切片）
  useEffect(() => {
    if (!ttsActive || textReadingMode === 'scroll' || !speechRange) return;
    if (paginatedChapterIndexRef.current !== currentChapterIndexRef.current) return;
    let offset = 0;
    let targetPage = -1;
    for (let i = 0; i < textPages.length; i++) {
      if (speechRange.start >= offset && speechRange.start < offset + textPages[i].length) {
        targetPage = i;
        break;
      }
      offset += textPages[i].length;
    }
    if (targetPage > currentPageIndex) {
      goToPageRef.current?.(targetPage, 'left');
    }
  }, [ttsActive, speechRange, textReadingMode, textPages, currentPageIndex]);

  // 点击区域翻页
  const handleTapZoneClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-ui-control]')) return;
    // 批注高亮点击
    if (target.closest('mark')) return;

    // 如果正在进行文本选中，不处理点击
    if (isSelectingTextRef.current) {
      isSelectingTextRef.current = false;
      return;
    }

    // 抑制触摸选区后合成的 click：touchend 后 500ms 内的 click 视为合成事件
    if (Date.now() - lastTouchEndTimeRef.current < SWIPE_TAP_SUPPRESS_WINDOW_MS) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    }

    // 如果有文本选中，不处理点击（让批注弹窗正常工作）
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    
    // 如果没有启用点击分区，任何点击都切换 UI
    if (!tapZoneEnabled) {
      toggleUi();
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // 中间区域显示/隐藏 UI
    if (x > width * TAP_ZONE_CENTER_RATIO && x < width * TAP_ZONE_EDGE_RATIO && y > height * TAP_ZONE_CENTER_RATIO && y < height * TAP_ZONE_EDGE_RATIO) {
      toggleUi();
      return;
    }

    // 竖排：左右区域横向翻卷（左=前进，右=后退）
    if (verticalWriting) {
      if (x < width * TAP_ZONE_CENTER_RATIO) {
        scrollContainerRef.current?.scrollBy({ left: -width * TAP_ZONE_PAGE_SCROLL_RATIO, behavior: 'smooth' });
        return;
      }
      if (x > width * TAP_ZONE_EDGE_RATIO) {
        scrollContainerRef.current?.scrollBy({ left: width * TAP_ZONE_PAGE_SCROLL_RATIO, behavior: 'smooth' });
        return;
      }
      toggleUi();
      return;
    }

    // 上方/左方区域向上翻页
    if (y < height * TAP_ZONE_CENTER_RATIO || x < width * TAP_ZONE_CENTER_RATIO) {
      scrollContainerRef.current?.scrollBy({ top: -height * TAP_ZONE_PAGE_SCROLL_RATIO, behavior: 'smooth' });
      return;
    }

    // 下方/右方区域向下翻页
    if (y > height * TAP_ZONE_EDGE_RATIO || x > width * TAP_ZONE_EDGE_RATIO) {
      scrollContainerRef.current?.scrollBy({ top: height * TAP_ZONE_PAGE_SCROLL_RATIO, behavior: 'smooth' });
      return;
    }
  }, [tapZoneEnabled, toggleUi, verticalWriting]);

  // 分页引擎：将文本按视口高度拆分为多页
  const paginateContent = useCallback(() => {
    if (!currentChapter || textReadingMode === 'scroll') {
      setTextPages([]);
      return;
    }
    const measureEl = measureRef.current;
    if (!measureEl) return;

    const containerHeight = window.innerHeight - PAGE_MEASURE_RESERVED_HEIGHT_PX; // 减去上下 padding
    const containerWidth = Math.min(PAGE_MEASURE_MAX_WIDTH_PX, window.innerWidth - PAGE_MEASURE_SIDE_PADDING_PX);
    if (containerHeight <= 0 || containerWidth <= 0) return;

    const pages = paginatePlainText({
      measureEl,
      content: currentChapter.content,
      containerHeight,
      containerWidth,
      fontSize,
      lineHeight,
      fontFamily: resolvedFontFamily,
      firstLineIndent,
    });

    applyPaginationResult(pages);
  }, [currentChapter, textReadingMode, fontSize, lineHeight, resolvedFontFamily, firstLineIndent, applyPaginationResult]);

  const paginateMeasuredContent = useCallback(() => {
    if (!currentChapter || textReadingMode === 'scroll') {
      setTextPages([]);
      return;
    }

    const measureEl = measureRef.current;
    if (!measureEl) {
      paginateContent();
      return;
    }

    const { contentWidth, pageHeight } = getCurrentTextPageLayout(isColumnsLayoutActive);

    if (pageHeight <= 0 || contentWidth <= 0) return;


    measureEl.style.position = 'absolute';
    measureEl.style.left = '-99999px';
    measureEl.style.top = '0';
    measureEl.style.visibility = 'hidden';
    measureEl.style.pointerEvents = 'none';
    measureEl.style.width = `${contentWidth}px`;
    measureEl.style.fontSize = `${fontSize}px`;
    measureEl.style.lineHeight = String(lineHeight);
    measureEl.style.fontFamily = resolvedFontFamily;
    measureEl.style.color = effectiveColor;
    measureEl.style.whiteSpace = 'normal';
    measureEl.style.wordBreak = 'break-word';
    measureEl.style.boxSizing = 'border-box';
    measureEl.style.textAlign = textAlign === 'justify' ? 'justify' : 'left';

    const measurePageHeight = (pageText: string, includeChapterTitle: boolean): number => {
      const wrapper = document.createElement('div');

      if (includeChapterTitle && hasMultipleChapters && currentChapter) {
        const titleEl = document.createElement('h2');
        titleEl.textContent = currentChapter.title;
        titleEl.style.textAlign = 'center';
        titleEl.style.fontWeight = TEXT_PAGE_TITLE_FONT_WEIGHT;
        titleEl.style.marginBottom = `${TEXT_PAGE_TITLE_MARGIN_BOTTOM}px`;
        titleEl.style.opacity = TEXT_PAGE_TITLE_OPACITY;
        wrapper.appendChild(titleEl);
      }

      const contentEl = document.createElement('div');
      contentEl.textContent = pageText;
      contentEl.style.whiteSpace = 'pre-wrap';
      contentEl.style.wordBreak = 'break-word';
      contentEl.style.textIndent = firstLineIndent ? '2em' : '0';
      wrapper.appendChild(contentEl);

      measureEl.replaceChildren(wrapper);
      return measureEl.scrollHeight;
    };

    const fitsPage = (pageText: string, includeChapterTitle: boolean): boolean =>
      measurePageHeight(pageText, includeChapterTitle) <= pageHeight;

    const markdownDocument = currentChapter.markdownDocument;
    const markdownMeasureEl = markdownMeasureRef.current;
    if (markdownDocument && markdownMeasureEl) {
      const paginationEnd = getMarkdownPaginationEnd(markdownDocument);
      markdownMeasureEl.style.width = `${contentWidth}px`;
      markdownMeasureEl.style.fontSize = `${fontSize}px`;
      markdownMeasureEl.style.lineHeight = String(lineHeight);
      markdownMeasureEl.style.fontFamily = resolvedFontFamily;
      markdownMeasureEl.style.color = effectiveColor;
      markdownMeasureEl.style.textAlign = textAlign === 'justify' ? 'justify' : 'left';

      const measuredBlocks = Array.from(
        markdownMeasureEl.querySelectorAll<HTMLElement>('[data-markdown-block-index]')
      );
      if (measuredBlocks.length === markdownDocument.blocks.length) {
        const measuredTitle = markdownMeasureEl
          .querySelector<HTMLElement>('[data-markdown-measure-title]');
        const titleStyle = measuredTitle ? window.getComputedStyle(measuredTitle) : null;
        const titleHeight = measuredTitle
          ? measuredTitle.getBoundingClientRect().height
            + Number.parseFloat(titleStyle?.marginTop || '0')
            + Number.parseFloat(titleStyle?.marginBottom || '0')
          : 0;
        const pages: string[] = [];
        let pageStart = 0;
        let usedHeight = 0;

        const pushPage = (end: number) => {
          if (end <= pageStart) return;
          pages.push(markdownDocument.text.slice(pageStart, end));
          pageStart = end;
          usedHeight = 0;
        };

        markdownDocument.blocks
          .filter((block) => block.start < paginationEnd)
          .forEach((block, blockIndex) => {
          const element = measuredBlocks[blockIndex];
          const computedStyle = window.getComputedStyle(element);
          const blockHeight = element.getBoundingClientRect().height
            + Number.parseFloat(computedStyle.marginTop || '0')
            + Number.parseFloat(computedStyle.marginBottom || '0');
          const availableHeight = pageHeight - (pages.length === 0 ? titleHeight : 0);

          if (usedHeight > 0 && usedHeight + blockHeight > availableHeight) {
            pushPage(block.start);
          }

          const freshAvailableHeight = pageHeight - (pages.length === 0 ? titleHeight : 0);
          const containsImage = markdownDocument.spans.some(
            (span) => span.type === 'image' && span.start < block.end && span.end > block.start
          );
          const canSplitInside = !containsImage && (
            block.type === 'paragraph'
            || block.type === 'blockquote'
            || block.type === 'list-item'
          );

          if (blockHeight > freshAvailableHeight && canSplitInside) {
            if (pageStart < block.start) pushPage(block.start);
            let cursor = block.start;
            while (cursor < block.end) {
              const includeChapterTitle = pages.length === 0;
              const remainingText = markdownDocument.text.slice(cursor, block.end);
              if (fitsPage(remainingText, includeChapterTitle)) break;

              let low = MIN_TEXT_PAGE_LENGTH;
              let high = remainingText.length;
              let best = MIN_TEXT_PAGE_LENGTH;
              while (low <= high) {
                const mid = Math.floor((low + high) / HALF_DIVISOR);
                if (fitsPage(remainingText.slice(0, mid), includeChapterTitle)) {
                  best = mid;
                  low = mid + 1;
                } else {
                  high = mid - 1;
                }
              }
              const splitLength = Math.max(MIN_TEXT_PAGE_LENGTH, findPreferredBreak(remainingText, best));
              pushPage(cursor + splitLength);
              cursor += splitLength;
            }
            if (pageStart < block.end) pushPage(block.end);
            return;
          }

          usedHeight += blockHeight;
        });

        pushPage(paginationEnd);
        applyPaginationResult(pages.length > 0 ? pages : ['']);
        return;
      }
    }

    const pages = splitTextIntoPages(currentChapter.content, fitsPage);

    measureEl.removeAttribute('style');
    measureEl.replaceChildren();

    applyPaginationResult(pages);
  }, [
    currentChapter,
    textReadingMode,
    fontSize,
    lineHeight,
    resolvedFontFamily,
    effectiveColor,
    textAlign,
    hasMultipleChapters,
    firstLineIndent,
    paginateContent,
    isColumnsLayoutActive,
    applyPaginationResult,
  ]);

  // 当章节或模式变化时重新分页
  useEffect(() => {
    if (textReadingMode !== 'scroll' && currentChapter) {
      // 延迟一帧确保 DOM 已渲染
      requestAnimationFrame(() => paginateMeasuredContent());
    } else if (textReadingMode !== 'scroll' && !currentChapter && !isLoading) {
      // 分页模式下但没有章节且不在加载中，说明章节为空
      setTextPages([]);
    }
  }, [textReadingMode, currentChapter, isLoading, paginateMeasuredContent]);

  // 窗口大小变化时重新分页
  useEffect(() => {
    if (textReadingMode === 'scroll') return;
    const handleResize = () => {
      requestAnimationFrame(() => paginateMeasuredContent());
    };
    const handleMarkdownMediaLoad = () => {
      skipNextPageResetRef.current = true;
      requestAnimationFrame(() => paginateMeasuredContent());
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('markdown-media-load', handleMarkdownMediaLoad);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('markdown-media-load', handleMarkdownMediaLoad);
    };
  }, [textReadingMode, paginateMeasuredContent]);

  // 翻页
  // 连滚翻页：动画期间的后续翻页暂存，动画结束立即执行（建议书 B2，替代硬拦截的生硬感）
  const pendingPageRef = useRef<{ index: number; direction: 'left' | 'right' } | null>(null);

  const goToPage = useCallback((index: number, direction: 'left' | 'right') => {
    if (isPageAnimating) {
      // 仅接受与当前方向相同的连续翻页，且目标页有效
      if (index >= 0 && index < textPages.length) {
        pendingPageRef.current = { index, direction };
      }
      return;
    }
    if (index < 0 || index >= textPages.length) return;

    // 记录前一页索引
    setPreviousPageIndex(currentPageIndex);
    setPageDirection(direction);
    setIsPageAnimating(true);

    // 根据阅读模式设置不同的动画时长
    const animationDuration = textReadingMode === 'book' ? BOOK_FLIP_ANIMATION_MS : PAGE_SLIDE_ANIMATION_MS;

    // 先设置新页索引，让 React 渲染新页
    setCurrentPageIndex(index);

    // 等待动画完成后清除状态；若有连滚请求则立即接续下一跳
    setTimeout(() => {
      const pending = pendingPageRef.current;
      pendingPageRef.current = null;
      setIsPageAnimating(false);
      setPageDirection(null);
      setPreviousPageIndex(null);
      if (pending) {
        goToPageRef.current?.(pending.index, pending.direction);
      }
    }, animationDuration);
  }, [textPages.length, isPageAnimating, currentPageIndex, textReadingMode]);
  goToPageRef.current = goToPage;

  // ========== 翻书跟手交互 ==========

  // 启动翻书动画（触摸开始时调用）
  const startFlip = useCallback((targetIndex: number, direction: 'left' | 'right') => {
    if (isPageAnimating) return;
    if (targetIndex < 0 || targetIndex >= textPages.length) return;

    setPreviousPageIndex(currentPageIndex);
    setPageDirection(direction);
    setIsPageAnimating(true);
    setFlipProgress(0);
    setCurrentPageIndex(targetIndex);
  }, [isPageAnimating, textPages.length, currentPageIndex]);

  // 通过变换完成翻书（松手后调用）
  const completeFlip = useCallback(() => {
    const el = flipPageRef.current;
    if (!el) {
      setTimeout(() => {
        setIsPageAnimating(false);
        setPageDirection(null);
        setPreviousPageIndex(null);
        setFlipProgress(0);
      }, FLIP_STATE_RESET_DELAY_MS);
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

    setTimeout(() => {
      setIsPageAnimating(false);
      setPageDirection(null);
      setPreviousPageIndex(null);
      setFlipProgress(0);
    }, FLIP_ANIMATION_COMPLETE_MS);
  }, [pageDirection]);

  // 弹回翻书（松手时未达到阈值）
  const snapbackFlip = useCallback(() => {
    const el = flipPageRef.current;
    if (!el) {
      setTimeout(() => {
        setIsPageAnimating(false);
        setPageDirection(null);
        setPreviousPageIndex(null);
        setFlipProgress(0);
      }, FLIP_STATE_RESET_DELAY_MS);
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
      setIsPageAnimating(false);
      setPageDirection(null);
      setPreviousPageIndex(null);
      setFlipProgress(0);
    }, FLIP_SNAPBACK_MS);
  }, [pageDirection, previousPageIndex, currentPageIndex]);

  const goToNextPage = useCallback(() => {
    if (textReadingMode === 'book') {
      // 翻书模式：启动翻书动画 + 完成动画（用于点击/键盘触发）
      if (isPageAnimating) return;
      if (currentPageIndex < textPages.length - 1) {
        startFlip(currentPageIndex + 1, 'left');
        requestAnimationFrame(() => completeFlip());
      } else if (hasMultipleChapters && currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentPageIndex(0);
        setScrollPercent(0);
      }
    } else {
      const targetPageIndex = getNextTextPageIndex(
        currentPageIndex,
        textPages.length,
        textPageStep
      );
      if (targetPageIndex !== null) {
        goToPage(targetPageIndex, 'left');
      } else if (hasMultipleChapters && currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentPageIndex(0);
        setScrollPercent(0);
      }
    }
  }, [textReadingMode, isPageAnimating, currentPageIndex, textPages.length, textPageStep, currentChapterIndex, chapters.length, hasMultipleChapters, startFlip, completeFlip, goToPage]);

  const goToPrevPage = useCallback(() => {
    if (textReadingMode === 'book') {
      // 翻书模式：启动翻书动画 + 完成动画（用于点击/键盘触发）
      if (isPageAnimating) return;
      if (currentPageIndex > 0) {
        startFlip(currentPageIndex - 1, 'right');
        requestAnimationFrame(() => completeFlip());
      } else if (hasMultipleChapters && currentChapterIndex > 0) {
        // 回退跨章：排队末页定位请求（ratio=1 → 分页完成消费时钳到上一章最后一页），
        // 直接绕过 requestPageAfterPagination 的就绪判断（此刻 ref 仍指向当前章，会按旧章页数立即误消费）
        pendingPageRequestRef.current = { ratio: 1 };
        setCurrentChapterIndex(currentChapterIndex - 1);
        setCurrentPageIndex(0);
        setScrollPercent(0);
      }
    } else {
      const targetPageIndex = Math.max(currentPageIndex - textPageStep, 0);
      if (targetPageIndex !== currentPageIndex) {
        goToPage(targetPageIndex, 'right');
      } else if (hasMultipleChapters && currentChapterIndex > 0) {
        // 回退跨章：排队末页定位请求（ratio=1 → 分页完成消费时钳到上一章最后一页）
        pendingPageRequestRef.current = { ratio: 1 };
        setCurrentChapterIndex(currentChapterIndex - 1);
        setCurrentPageIndex(0);
        setScrollPercent(0);
      }
    }
  }, [textReadingMode, isPageAnimating, currentPageIndex, textPageStep, currentChapterIndex, hasMultipleChapters, startFlip, completeFlip, goToPage]);

  // 触摸滑动处理
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // 只在分页模式下处理滑动
    if (textReadingMode === 'scroll') return;

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        // 左滑 → 下一页
        goToNextPage();
      } else {
        // 右滑 → 上一页
        goToPrevPage();
      }
    }
  }, [textReadingMode, goToNextPage, goToPrevPage]);

  // 分页模式的进度计算 + 保存
  useEffect(() => {
    if (textReadingMode === 'scroll') return;
    if (textPages.length > 0) {
      const visibleEndPage = Math.min(currentPageIndex + textPageStep, textPages.length);
      const progress = visibleEndPage / textPages.length;
      setScrollPercent(Math.round(progress * PERCENT_MULTIPLIER));
      showProgressHint();
      // 保存分页模式进度
      saveTextProgress(currentChapterIndex, currentPageIndex);
    }
  }, [currentPageIndex, textPages.length, textReadingMode, textPageStep, currentChapterIndex, saveTextProgress, showProgressHint]);

  useEffect(() => {
    if (!isColumnsLayoutActive || currentPageIndex === 0) return;
    const alignedPageIndex = currentPageIndex - (currentPageIndex % TEXT_COLUMNS_PAGE_STEP);
    if (alignedPageIndex !== currentPageIndex) {
      setCurrentPageIndex(alignedPageIndex);
    }
  }, [currentPageIndex, isColumnsLayoutActive]);

  // 键盘快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (textReadingMode === 'scroll') {
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          scrollContainerRef.current?.scrollBy({ top: -300, behavior: 'smooth' });
        }
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          scrollContainerRef.current?.scrollBy({ top: 300, behavior: 'smooth' });
        }
      } else {
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          goToPrevPage();
        }
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          e.preventDefault();
          goToNextPage();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, textReadingMode, goToNextPage, goToPrevPage]);

  // 点击区域处理（分页模式）
  const handlePaginateClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isButton = target.closest('button') !== null;
    const isUiControl = target.closest('[data-ui-control]') !== null;
    const isHorizontalScrollRegion = target.closest('[data-reader-horizontal-scroll]') !== null;
    if (isButton || (isUiControl && !isHorizontalScrollRegion)) return;
    // 批注高亮点击
    if (target.closest('mark')) return;

    // 如果正在进行文本选中，不处理点击
    if (isSelectingTextRef.current) {
      isSelectingTextRef.current = false;
      return;
    }

    // 抑制触摸选区后合成的 click：touchend 后 500ms 内的 click 视为合成事件
    if (Date.now() - lastTouchEndTimeRef.current < SWIPE_TAP_SUPPRESS_WINDOW_MS) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    }

    // 如果有文本选中，不处理点击
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const tapAction = getPaginatedTapAction({
      clientOffsetX: x,
      viewportWidth: width,
      isButton,
      isUiControl,
      isHorizontalScrollRegion,
    });

    // 左侧 30% → 上一页
    if (tapAction === 'previous') {
      goToPrevPage();
      return;
    }
    // 右侧 30% → 下一页
    if (tapAction === 'next') {
      goToNextPage();
      return;
    }
    // 中间 → 切换 UI
    if (tapAction === 'toggle-ui') toggleUi();
  }, [goToNextPage, goToPrevPage, toggleUi]);

  // 翻书触摸开始
  const handleFlipTouchStart = useCallback((e: React.TouchEvent) => {
    if (textReadingMode !== 'book') return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [textReadingMode]);

  // 翻书触摸移动（跟手）
  const handleFlipTouchMove = useCallback((e: React.TouchEvent) => {
    if (textReadingMode !== 'book' || !touchStartRef.current) return;

    const touch = e.touches[0];
    const rawDx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // 开始翻书检测
    if (!isPageAnimating && Math.abs(rawDx) > SWIPE_THRESHOLD && Math.abs(rawDx) > Math.abs(dy)) {
      if (rawDx < 0 && currentPageIndex < textPages.length - 1) {
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
      const adjustedDx = isForward ? (-rawDx - SWIPE_THRESHOLD) : (rawDx - SWIPE_THRESHOLD);
      const progress = Math.max(0, Math.min(1, adjustedDx / (containerWidth * FLIP_DRAG_RADIUS_RATIO)));
      setFlipProgress(progress);
    }
  }, [textReadingMode, isPageAnimating, currentPageIndex, textPages.length, pageDirection, startFlip]);

  // 翻书触摸结束
  const handleFlipTouchEnd = useCallback(() => {
    if (textReadingMode !== 'book' || !isPageAnimating) return;

    if (flipProgress > FLIP_COMMIT_PROGRESS_THRESHOLD) {
      completeFlip();
    } else {
      snapbackFlip();
    }
  }, [textReadingMode, isPageAnimating, flipProgress, completeFlip, snapbackFlip]);

  // 翻页动画 class
  const getPageAnimClass = useCallback((isCurrentPage: boolean) => {
    if (!pageDirection || !isPageAnimating) return '';
    
    if (textReadingMode === 'book') {
      // 翻书模式：当前页是退出动画，新页是进入动画
      return isCurrentPage
        ? (pageDirection === 'left' ? 'book-page-flip-exit' : 'book-page-flip-exit-reverse')
        : (pageDirection === 'left' ? 'book-page-flip-enter' : 'book-page-flip-enter-reverse');
    } else {
      // 左右滑动模式
      return isCurrentPage
        ? (pageDirection === 'left' ? 'text-page-exit-left' : 'text-page-exit-right')
        : (pageDirection === 'left' ? 'text-page-enter-right' : 'text-page-enter-left');
    }
  }, [pageDirection, isPageAnimating, textReadingMode]);

  // ========== 书签功能 ==========

  // 加载书签
  useEffect(() => {
    if (!bookId) return;
    bookmarkRepo.getByBookId(bookId).then(setBookmarks);
  }, [bookId]);

  // 检查当前位置是否已加书签
  useEffect(() => {
    if (!bookId || bookmarks.length === 0) {
      setIsBookmarked(false);
      return;
    }
    const found = bookmarks.some((bm) => {
      if (bm.chapterIndex !== currentChapterIndex) return false;
      if (textReadingMode === 'scroll') {
        return Math.abs((bm.scrollRatio ?? 0) - scrollPercent / PERCENT_MULTIPLIER) < BOOKMARK_MATCH_EPSILON;
      }
      return bm.pageIndex === currentPageIndex;
    });
    setIsBookmarked(found);
  }, [bookId, bookmarks, currentChapterIndex, currentPageIndex, scrollPercent, textReadingMode]);

  // 添加/移除书签
  const toggleBookmark = useCallback(async () => {
    if (!bookId || !currentChapter) return;

    if (isBookmarked) {
      // 移除当前书签
      const bm = bookmarks.find((b) => {
        if (b.chapterIndex !== currentChapterIndex) return false;
        if (textReadingMode === 'scroll') {
          return Math.abs((b.scrollRatio ?? 0) - scrollPercent / PERCENT_MULTIPLIER) < BOOKMARK_MATCH_EPSILON;
        }
        return b.pageIndex === currentPageIndex;
      });
      if (bm) {
        await bookmarkRepo.remove(bm.id);
        setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
      }
    } else {
      // 添加书签
      const content = currentChapter.content;
      let textPreview = '';
      if (textReadingMode === 'scroll') {
        const container = scrollContainerRef.current;
        if (container) {
          const ratio = container.scrollTop / (container.scrollHeight - container.clientHeight || 1);
          const charPos = Math.floor(content.length * ratio);
          textPreview = content.slice(Math.max(0, charPos - BOOKMARK_PREVIEW_BEFORE_CHARS), charPos + BOOKMARK_PREVIEW_AFTER_CHARS);
        }
      } else if (textPages[currentPageIndex]) {
        textPreview = textPages[currentPageIndex].slice(0, BOOKMARK_PREVIEW_PAGE_CHARS);
      }

      const bookmark: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END)}`,
        bookId,
        chapterIndex: currentChapterIndex,
        chapterTitle: currentChapter.title,
        pageIndex: textReadingMode !== 'scroll' ? currentPageIndex : undefined,
        scrollRatio: textReadingMode === 'scroll' ? scrollPercent / PERCENT_MULTIPLIER : undefined,
        textPreview: textPreview || currentChapter.title,
        createdAt: new Date(),
      };
      await bookmarkRepo.add(bookmark);
      setBookmarks((prev) => [bookmark, ...prev]);
    }
  }, [bookId, currentChapter, currentChapterIndex, currentPageIndex, textReadingMode, scrollPercent, textPages, bookmarks, isBookmarked]);

  // 书签跳转
  const handleBookmarkSelect = useCallback((bm: Bookmark) => {
    setIsBookmarkPanelOpen(false);

    if (bm.chapterIndex === currentChapterIndex) {
      // 同章节：直接定位
      if (textReadingMode === 'scroll') {
        if (bm.scrollRatio != null) {
          const container = scrollContainerRef.current;
          if (container) {
            const scrollable = container.scrollHeight - container.clientHeight;
            container.scrollTo({ top: bm.scrollRatio * scrollable, behavior: 'smooth' });
          }
        }
      } else {
        if (bm.pageIndex != null) {
          setCurrentPageIndex(bm.pageIndex);
        }
      }
    } else {
      // 跨章节：暂存目标，等章节内容加载完成后跳转
      pendingNavRef.current = {
        chapterIndex: bm.chapterIndex,
        scrollRatio: bm.scrollRatio,
        pageIndex: bm.pageIndex,
      };
      setCurrentChapterIndex(bm.chapterIndex);
      setCurrentPageIndex(0);

      if (textReadingMode === 'scroll') {
        // 滚动模式：延迟两帧等 DOM 渲染完成后滚动
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const nav = pendingNavRef.current;
            if (nav && nav.scrollRatio != null) {
              const container = scrollContainerRef.current;
              if (container) {
                const scrollable = container.scrollHeight - container.clientHeight;
                container.scrollTop = nav.scrollRatio * scrollable;
              }
            }
            pendingNavRef.current = null;
          });
        });
      } else if (bm.pageIndex != null) {
        // 分页模式：排队定位请求，新章节分页完成时消费（已就绪则立即生效）
        requestPageAfterPagination(bm.pageIndex);
      }
    }
  }, [currentChapterIndex, textReadingMode, requestPageAfterPagination]);

  // 书签删除
  const handleBookmarkDelete = useCallback(async (id: string) => {
    const deleted = bookmarks.find((b) => b.id === id);
    await bookmarkRepo.remove(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    if (deleted) {
      showToast('已删除书签', () => {
        bookmarkRepo.add(deleted).then(() => {
          if (bookId) bookmarkRepo.getByBookId(bookId).then(setBookmarks);
        });
      });
    }
  }, [bookmarks, bookId, showToast]);

  // ========== 批注功能 ==========

  // 加载批注
  useEffect(() => {
    if (!bookId) return;
    annotationRepo.getByBookId(bookId).then(setAnnotations);
  }, [bookId]);

  // 当前章节的批注：按当前章节内容重新解析锚点（内容表示变化后自愈），不可定位的隐藏
  const currentChapterAnnotations = useMemo(() => {
    const content = chapters[currentChapterIndex]?.content ?? '';
    return annotations
      .filter((a) => a.chapterIndex === currentChapterIndex)
      .map((a) => {
        const resolved = resolveAnnotationOffsets(content, a);
        return resolved ? { ...a, startOffset: resolved.startOffset, endOffset: resolved.endOffset } : null;
      })
      .filter((a): a is Annotation => a !== null);
  }, [annotations, currentChapterIndex, chapters]);

  // 文本选中检测
  useEffect(() => {
    // mousedown 仅用于记录起始位置，不设置选中标记
    // 避免简单点击被误判为文本选中从而拦截菜单/翻页
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reader-article]')) return;
      // 点击文章区域时清除之前的选区标记，让 click 能正常处理
      isSelectingTextRef.current = false;
    };

    const handleMouseUp = () => {
      // 延迟一帧检测选区，确保浏览器已完成选区更新
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          isSelectingTextRef.current = false;
          return;
        }
        const text = sel.toString().trim();
        if (text.length < MIN_SELECTION_TEXT_LENGTH) {
          isSelectingTextRef.current = false;
          return;
        }

        const anchorNode = sel.anchorNode;
        if (!anchorNode) return;
        let node: Node | null = anchorNode.nodeType === Node.TEXT_NODE
          ? anchorNode.parentElement
          : anchorNode as HTMLElement;
        while (node) {
          if (node instanceof Element && node.hasAttribute('data-reader-article')) break;
          node = node.parentNode;
        }
        if (!node || !(node instanceof Element)) {
          isSelectingTextRef.current = false;
          return;
        }

        isSelectingTextRef.current = true;
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const selectionOffsets = computeSelectionOffsets(sel);
        let contentOffset = selectionOffsets.start;
        let contentEndOffset = selectionOffsets.end;

        // 修正 trim 造成的偏移：sel.toString() 可能含前导空白，trim 后 text 起始位置后移
        if (contentOffset >= 0) {
          const rawSelText = sel.toString();
          const trimShift = rawSelText.indexOf(text);
          if (trimShift > 0) contentOffset += trimShift;
          const trailingTrim = rawSelText.length - trimShift - text.length;
          if (contentEndOffset >= 0 && trailingTrim > 0) contentEndOffset -= trailingTrim;
        }

        setSelectionInfo({
          text,
          position: { x: rect.left + rect.width / HALF_DIVISOR, y: rect.top },
          contentOffset: contentOffset >= 0 ? contentOffset : undefined,
          contentEndOffset: contentEndOffset >= 0 ? contentEndOffset : undefined,
        });
      });
    };

    // 检查选区是否在文章内容区域内
    const isSelectionInArticle = (): boolean => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return false;
      let node: Node | null = sel.anchorNode.nodeType === Node.TEXT_NODE
        ? sel.anchorNode.parentElement
        : sel.anchorNode as HTMLElement;
      while (node) {
        if (node instanceof Element && node.hasAttribute('data-reader-article')) return true;
        node = node.parentNode;
      }
      return false;
    };

    // 计算选区起始位置在章节内容中的字符偏移（排除章节标题等额外 DOM 元素）
    const computeSelectionOffsets = (sel: Selection): { start: number; end: number } => {
      const contentEl = document.querySelector('[data-reader-content]');
      if (!contentEl || !sel.rangeCount) return { start: -1, end: -1 };
      const range = sel.getRangeAt(0);

      const getSourceOffset = (container: Node, offset: number): number | null => {
        const element = container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : container as Element;
        const sourceElement = element?.closest<HTMLElement>('[data-source-start]');
        if (!sourceElement) return null;

        const sourceStart = Number(sourceElement.dataset.sourceStart);
        if (!Number.isFinite(sourceStart)) return null;
        const localRange = document.createRange();
        localRange.selectNodeContents(sourceElement);
        localRange.setEnd(container, offset);
        return sourceStart + localRange.toString().length;
      };

      const markdownStart = getSourceOffset(range.startContainer, range.startOffset);
      const markdownEnd = getSourceOffset(range.endContainer, range.endOffset);
      if (markdownStart != null && markdownEnd != null) {
        return { start: markdownStart, end: markdownEnd };
      }

      const startRange = document.createRange();
      startRange.selectNodeContents(contentEl);
      startRange.setEnd(range.startContainer, range.startOffset);
      const endRange = document.createRange();
      endRange.selectNodeContents(contentEl);
      endRange.setEnd(range.endContainer, range.endOffset);
      return { start: startRange.toString().length, end: endRange.toString().length };
    };

    // 从当前 window.getSelection() 显示浮动批注按钮
    const showFloatingButton = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const text = sel.toString().trim();
      if (text.length < MIN_SELECTION_TEXT_LENGTH) return;
      if (!isSelectionInArticle()) return;

      isSelectingTextRef.current = true;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const selectionOffsets = computeSelectionOffsets(sel);
      let contentOffset = selectionOffsets.start;
      let contentEndOffset = selectionOffsets.end;

      // 修正 trim 造成的偏移：sel.toString() 可能含前导空白，trim 后 text 起始位置后移
      if (contentOffset >= 0) {
        const rawSelText = sel.toString();
        const trimShift = rawSelText.indexOf(text);
        if (trimShift > 0) contentOffset += trimShift;
        const trailingTrim = rawSelText.length - trimShift - text.length;
        if (contentEndOffset >= 0 && trailingTrim > 0) contentEndOffset -= trailingTrim;
      }

      setSelectionInfo({
        text,
        position: { x: rect.left + rect.width / HALF_DIVISOR, y: rect.top },
        contentOffset: contentOffset >= 0 ? contentOffset : undefined,
        contentEndOffset: contentEndOffset >= 0 ? contentEndOffset : undefined,
      });
    };

    // 在文本节点中从 offset 向两侧搜索最近的非空白字符位置
    const findNearestNonWS = (text: string, offset: number): number => {
      for (let d = 0; d < text.length; d++) {
        if (offset + d < text.length && !/\s/.test(text[offset + d])) return offset + d;
        if (offset - d >= 0 && !/\s/.test(text[offset - d])) return offset - d;
      }
      return -1;
    };

    // 在文本节点中选中从 pos 开始的词/字
    const selectFromPos = (node: Text, text: string, pos: number): boolean => {
      const isCJK = (ch: string) => /[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(ch);
      const isWordChar = (ch: string) => !/\s/.test(ch);
      let start = pos, end = pos + 1;
      if (isCJK(text[start])) {
        end = start + 1;
      } else {
        while (start > 0 && isWordChar(text[start - 1]) && !isCJK(text[start - 1])) start--;
        while (end < text.length && isWordChar(text[end]) && !isCJK(text[end])) end++;
      }
      if (start >= end) return false;
      const sel = window.getSelection();
      if (!sel) return false;
      const r = document.createRange();
      r.setStart(node, start);
      r.setEnd(node, end);
      sel.removeAllRanges();
      sel.addRange(r);
      return true;
    };

    // 回退方案：通过 elementFromPoint 找到元素，再在其中找文本节点
    const selectFromElement = (x: number, y: number): boolean => {
      const el = document.elementFromPoint(x, y);
      if (!el || !el.closest('[data-reader-article]')) return false;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      let node: Text | null;
      while ((node = walker.nextNode() as Text | null)) {
        const t = node.textContent || '';
        const p = t.search(/\S/);
        if (p >= 0 && selectFromPos(node, t, p)) return true;
      }
      return false;
    };

    // 在指定坐标创建文本选区（长按选词）
    const selectWordAtPoint = (x: number, y: number): boolean => {
      const range = document.caretRangeFromPoint?.(x, y) ?? null;

      if (range && range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
        const node = range.startContainer as Text;
        const text = node.textContent || '';
        let offset = range.startOffset;
        if (offset >= text.length) offset = Math.max(0, text.length - 1);
        if (offset >= 0 && offset < text.length) {
          if (/\s/.test(text[offset])) {
            // 偏移落在空白（如换行符）上，搜索最近的非空白字符
            const nearest = findNearestNonWS(text, offset);
            if (nearest >= 0) return selectFromPos(node, text, nearest);
          } else {
            return selectFromPos(node, text, offset);
          }
        }
      }

      // caretRangeFromPoint 失败或无法定位文本，使用 elementFromPoint 回退
      return selectFromElement(x, y);
    };

    // 清除长按定时器
    const clearLongPress = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    };

    // ===== 触摸事件 =====
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reader-article]')) return;

      // 如果已有文本选区，用户很可能在拖拽原生选区手柄进行扩选，
      // 不干扰浏览器原生行为，让 selectionchange 统一处理
      const existingSel = window.getSelection();
      if (existingSel && !existingSel.isCollapsed && existingSel.toString().trim().length >= MIN_SELECTION_TEXT_LENGTH) {
        isSelectingTextRef.current = true;
        clearLongPress();
        return;
      }

      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      isSelectingTextRef.current = false;

      // 启动长按定时器
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        if (touchStartPosRef.current) {
          selectWordAtPoint(touchStartPosRef.current.x, touchStartPosRef.current.y);
          showFloatingButton();
        }
      }, LONG_PRESS_DURATION);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 移动超过阈值则取消长按
      if (longPressTimerRef.current && touchStartPosRef.current) {
        const touch = e.touches[0];
        const dx = touch.clientX - touchStartPosRef.current.x;
        const dy = touch.clientY - touchStartPosRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_THRESHOLD) {
          clearLongPress();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-reader-article]')) return;

      // 保存触摸坐标（供下方 selectWordAtPoint 使用）
      const savedPos = touchStartPosRef.current;
      clearLongPress();
      touchStartPosRef.current = null;

      // 记录 touchend 时间戳，用于抑制合成 click
      lastTouchEndTimeRef.current = Date.now();

      // 判断是否为滚动模式
      const isScrollMode = !!scrollContainerRef.current;

      setTimeout(() => {
        if (isSelectingTextRef.current) return; // 长按定时器已处理

        // 1. 先检查是否已有选区（真机原生长按选词）
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length >= MIN_SELECTION_TEXT_LENGTH) {
          showFloatingButton();
          return;
        }

        // 2. 没有现成选区时，主动在触摸点选词
        //    - 滚动模式：任何触摸都触发（无翻页冲突）
        //    - 分页模式：仅长按（定时器已超时）才触发，避免与翻页冲突
        if (savedPos && isScrollMode) {
          if (selectWordAtPoint(savedPos.x, savedPos.y)) {
            showFloatingButton();
          }
        }
      }, SELECTION_CHANGE_DEBOUNCE_MS);
    };

    // selectionchange：通用批注触发器 — 检测文章区域内任何文本选区变化
    // 当用户完成选中（释放鼠标 / 松开选择手柄）后，选区趋于稳定，触发浮动批注按钮
    const SELECTION_STABLE_DELAY = 600;
    let selectionChangeDebounce: ReturnType<typeof setTimeout> | null = null;
    const handleSelectionChange = () => {
      if (selectionChangeDebounce) clearTimeout(selectionChangeDebounce);
      selectionChangeDebounce = setTimeout(() => {
        selectionChangeDebounce = null;
        // 批注编辑弹窗已打开时不干扰
        if (selectionPopupRef.current) return;
        const sel = window.getSelection();
        const hasSelection = sel && !sel.isCollapsed && sel.toString().trim().length >= MIN_SELECTION_TEXT_LENGTH;
        if (hasSelection) {
          // 有效选区 → 等选区稳定后显示浮动批注按钮
          showFloatingButton();
        } else if (selectionInfoRef.current) {
          // 无有效选区但浮动按钮仍在显示 → 清除
          setSelectionInfo(null);
          isSelectingTextRef.current = false;
        }
      }, SELECTION_STABLE_DELAY);
    };

    // 阻止阅读区域内的系统上下文菜单（避免 Google Lens / OCR 图片识别等原生菜单干扰）
    // 我们通过 selectWordAtPoint + selectionchange 自行管理文本选区，无需依赖原生 ActionMode
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-reader-article]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      clearLongPress();
      if (selectionChangeDebounce) clearTimeout(selectionChangeDebounce);
    };
  }, []);

  // 保存批注：从选区信息构建批注（笔记可为空 = 纯划线）
  const buildAnnotationFromSelection = useCallback((
    sel: Pick<TextSelectionInfo, 'text' | 'contentOffset' | 'contentEndOffset'>,
    note: string,
    style: AnnotationStyle,
    tagIds: string[] = []
  ): Annotation | null => {
    if (!bookId || !currentChapter) return null;

    const content = currentChapter.content;
    // 优先使用从选区 Range 计算的精确偏移，回退到 indexOf
    const startOffset = sel.contentOffset != null && sel.contentOffset >= 0
      ? sel.contentOffset
      : content.indexOf(sel.text);
    const endOffset = sel.contentEndOffset != null && sel.contentEndOffset >= startOffset
      ? sel.contentEndOffset
      : startOffset >= 0 ? startOffset + sel.text.length : 0;

    return {
      id: `ann-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END)}`,
      bookId,
      chapterIndex: currentChapterIndex,
      chapterTitle: currentChapter.title,
      selectedText: sel.text,
      note,
      startOffset: startOffset >= 0 ? startOffset : 0,
      endOffset,
      // 稳定锚点：内容表示变化后仍可重定位
      anchor:
        startOffset >= 0 && endOffset > startOffset
          ? computeAnnotationAnchor(content, startOffset, endOffset)
          : undefined,
      style,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [bookId, currentChapter, currentChapterIndex]);

  const handleAnnotationSave = useCallback(async (note: string, style: AnnotationStyle, tagIds: string[] = []) => {
    if (!selectionPopup) return;
    const annotation = buildAnnotationFromSelection(selectionPopup, note, style, tagIds);
    if (!annotation) return;

    await annotationRepo.add(annotation);
    setAnnotations((prev) => [annotation, ...prev]);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  }, [selectionPopup, buildAnnotationFromSelection]);

  // 纯划线：一键保存当前选区为无笔记高亮（划线/批注分离，零输入）
  const handleQuickHighlight = useCallback(async () => {
    const sel = selectionInfoRef.current;
    if (!sel) return;
    const annotation = buildAnnotationFromSelection(sel, '', 'highlight');
    if (!annotation) return;

    await annotationRepo.add(annotation);
    setAnnotations((prev) => [annotation, ...prev]);
    setSelectionInfo(null);
    window.getSelection()?.removeAllRanges();
    isSelectingTextRef.current = false;
  }, [buildAnnotationFromSelection]);

  // 批注编辑（补丁式：id 必填，note/style/tagIds 可选；note 置空即转纯划线）
  const handleAnnotationEdit = useCallback(async (updated: { id: string; note?: string; style?: AnnotationStyle; tagIds?: string[] }) => {
    const updates: Partial<Pick<Annotation, 'note' | 'style' | 'tagIds' | 'updatedAt'>> = {};
    if (updated.note !== undefined) updates.note = updated.note;
    if (updated.style !== undefined) updates.style = updated.style;
    if (updated.tagIds !== undefined) updates.tagIds = updated.tagIds;
    await annotationRepo.update(updated.id, updates);
    setAnnotations((prev) => prev.map((a) => {
      if (a.id !== updated.id) return a;
      return {
        ...a,
        ...(updated.note !== undefined ? { note: updated.note } : {}),
        ...(updated.style !== undefined ? { style: updated.style } : {}),
        ...(updated.tagIds !== undefined ? { tagIds: updated.tagIds } : {}),
        updatedAt: new Date(),
      };
    }));
  }, []);

  // 批注删除
  const handleAnnotationDelete = useCallback(async (id: string) => {
    const deleted = annotations.find((a) => a.id === id);
    await annotationRepo.remove(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    if (deleted) {
      showToast('已删除批注', () => {
        annotationRepo.add(deleted).then(() => {
          if (bookId) annotationRepo.getByBookId(bookId).then(setAnnotations);
        });
      });
    }
  }, [annotations, bookId, showToast]);

  // 批注跳转：根据批注的 startOffset 定位到正文中的具体位置
  // 跨章节定位原语（对外可复用）：切章 + 内容渲染后按占比定位。
  // 分页模式经 requestPageAfterPagination 排队消费；滚动模式双帧后定位。
  const jumpToChapterRatio = useCallback((chapterIndex: number, ratio: number) => {
    // 暂存目标，等章节内容加载完成后跳转
    pendingNavRef.current = {
      chapterIndex,
      scrollRatio: undefined, // 由 ratio 直接驱动
      pageIndex: undefined,
    };
    // 先设置章节，让内容加载
    setCurrentChapterIndex(chapterIndex);
    setCurrentPageIndex(0);

    if (textReadingMode === 'scroll') {
      // 滚动模式：延迟两帧等 DOM 渲染后计算位置并滚动
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (pendingNavRef.current) {
            const container = scrollContainerRef.current;
            if (container) {
              const scrollable = container.scrollHeight - container.clientHeight;
              container.scrollTop = ratio * scrollable;
            }
          }
          pendingNavRef.current = null;
        });
      });
    } else {
      requestPageAfterPagination({ ratio });
    }
  }, [textReadingMode, requestPageAfterPagination]);

  // 批注定位（同章亦适用）：偏移按章节正文长度折算占比后走定位原语
  const jumpToAnnotation = useCallback((ann: Annotation) => {
    const chapter = chaptersRef.current[ann.chapterIndex];
    const ratio = chapter && chapter.content.length > 0 ? ann.startOffset / chapter.content.length : 0;
    jumpToChapterRatio(ann.chapterIndex, ratio);
  }, [jumpToChapterRatio]);

  // 书内检索命中定位：命中偏移与 textLength 同坐标系，占比直接可用
  const handleSearchHitSelect = useCallback((hit: SearchHit) => {
    setIsSearchPanelOpen(false);
    const ratio = hit.textLength > 0 ? hit.offset / hit.textLength : 0;
    jumpToChapterRatio(hit.chapterIndex, ratio);
  }, [jumpToChapterRatio]);

  const handleAnnotationNavigate = useCallback((ann: Annotation) => {
    setIsAnnotationListOpen(false);

    if (ann.chapterIndex === currentChapterIndex) {
      // 同章节：直接定位到批注位置
      if (textReadingMode === 'scroll') {
        const chapter = chapters[currentChapterIndex];
        if (chapter && chapter.content.length > 0) {
          const ratio = ann.startOffset / chapter.content.length;
          const container = scrollContainerRef.current;
          if (container) {
            const scrollable = verticalWriting
              ? container.scrollWidth - container.clientWidth
              : container.scrollHeight - container.clientHeight;
            const target = ratio * scrollable;
            if (verticalWriting) {
              container.scrollTo({ left: -target, behavior: 'smooth' });
            } else {
              container.scrollTo({ top: target, behavior: 'smooth' });
            }
          }
        }
      } else {
        // 分页模式：根据 offset 找到对应页
        if (textPages.length > 0 && currentChapter) {
          let cumLen = 0;
          for (let i = 0; i < textPages.length; i++) {
            cumLen += textPages[i].length;
            if (ann.startOffset < cumLen) {
              setCurrentPageIndex(i);
              break;
            }
          }
        }
      }
    } else {
      jumpToAnnotation(ann);
    }
  }, [currentChapterIndex, currentChapter, textReadingMode, textPages, chapters, verticalWriting, jumpToAnnotation]);

  // 外部批注直达（摘抄墙/回望席/档案卡带 ?ann=<id>）：显式意图优先于进度恢复。
  // 统一走跨章节定位路径（分页模式经 requestPageAfterPagination 排队，滚动模式双帧后定位）。
  const jumpToAnnotationRef = useRef(jumpToAnnotation);
  jumpToAnnotationRef.current = jumpToAnnotation;
  const annJumpDoneRef = useRef<string | null>(null);
  useEffect(() => {
    if (!bookId || !annTargetId || isLoading || chapters.length === 0) return;
    if (annJumpDoneRef.current === annTargetId) return;
    let cancelled = false;
    annotationRepo.getByBookId(bookId).then((all) => {
      if (cancelled) return;
      const target = all.find((a) => a.id === annTargetId);
      if (!target) return;
      annJumpDoneRef.current = annTargetId;
      jumpToAnnotationRef.current(target);
    });
    return () => {
      cancelled = true;
    };
  }, [bookId, annTargetId, isLoading, chapters.length]);

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

  // 按边界点把文本切段渲染：批注端点与听书范围端点并入边界集合，任一分段内命中状态一致，
  // 听书范围与批注重叠时按段嵌套（听书 span 包在批注 mark 外层），不会丢文本
  const renderTextWithRanges = (
    text: string,
    annotations: Annotation[],
    speech: { start: number; end: number } | null
  ): React.ReactNode[] => {
    const points = new Set<number>([0, text.length]);
    annotations.forEach((a) => {
      points.add(Math.max(0, Math.min(a.startOffset, text.length)));
      points.add(Math.max(0, Math.min(a.endOffset, text.length)));
    });
    if (speech) {
      points.add(Math.max(0, Math.min(speech.start, text.length)));
      points.add(Math.max(0, Math.min(speech.end, text.length)));
    }
    const sorted = [...points].sort((a, b) => a - b);
    const parts: React.ReactNode[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const segStart = sorted[i];
      const segEnd = sorted[i + 1];
      if (segEnd <= segStart) continue;
      const segmentText = text.slice(segStart, segEnd);
      const ann = annotations.find((a) => a.startOffset <= segStart && a.endOffset >= segEnd);
      let node: React.ReactNode = segmentText;
      if (ann) {
        const presentation = getAnnotationPresentation(ann.style, effectiveColor, ann.id);
        node = (
          <mark
            key={`ann-${ann.id}-${segStart}`}
            style={presentation.style}
            className={`transition-colors hover:opacity-80 ${presentation.className}`}
            title={ann.note || undefined}
            onClick={(e) => {
              e.stopPropagation();
              setHighlightedAnnotation(ann);
            }}
          >
            {segmentText}
          </mark>
        );
      }
      if (speech && speech.start <= segStart && speech.end >= segEnd) {
        node = (
          <span key={`speech-${segStart}`} className="speech-reading">{node}</span>
        );
      }
      parts.push(node);
    }
    return parts;
  };

  // 渲染带批注高亮与听书跟读高亮的文本（滚动模式：章节全文坐标系）
  const renderContentWithAnnotations = (content: string, chapterIdx: number) => {
    const chapterAnns = currentChapterAnnotations.filter(
      (a) => a.chapterIndex === chapterIdx && a.startOffset >= 0 && a.endOffset > a.startOffset
    ).sort((a, b) => a.startOffset - b.startOffset);
    if (chapterAnns.length === 0 && !speechRange) return content;
    return renderTextWithRanges(content, chapterAnns, speechRange);
  };

  // 分页模式下渲染批注高亮：将章节级偏移映射为页内偏移
  const renderContentWithAnnotationsForPage = (pageContent: string, chapterIdx: number, pageStartOffset: number) => {
    const pageEnd = pageStartOffset + pageContent.length;
    const pageAnns = currentChapterAnnotations.filter(
      (a) => a.chapterIndex === chapterIdx && a.startOffset >= 0 && a.endOffset > a.startOffset
        && a.startOffset < pageEnd && a.endOffset > pageStartOffset
    ).map((a) => ({
      ...a,
      startOffset: Math.max(0, a.startOffset - pageStartOffset),
      endOffset: Math.min(pageContent.length, a.endOffset - pageStartOffset),
    })).sort((a, b) => a.startOffset - b.startOffset);
    // 听书范围裁剪到本页窗口后转为页内坐标；完全不在页内则为 null
    const pageSpeech = speechRange
      ? (() => {
          const clippedStart = Math.max(speechRange.start, pageStartOffset);
          const clippedEnd = Math.min(speechRange.end, pageEnd);
          return clippedEnd > clippedStart
            ? { start: clippedStart - pageStartOffset, end: clippedEnd - pageStartOffset }
            : null;
        })()
      : null;
    if (pageAnns.length === 0 && !pageSpeech) return pageContent;
    return renderTextWithRanges(pageContent, pageAnns, pageSpeech);
  };

  // 计算指定页在完整章节中的起始偏移（通过累积页长度计算，避免 indexOf 在重复内容时定位错误）
  const getPageStartOffset = (pageIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < pageIndex && i < textPages.length; i++) {
      offset += textPages[i].length;
    }
    return offset;
  };

  // 渲染文章内容
  const renderArticleContent = (pageContent?: string, pageIndex?: number) => {
    const content = pageContent ?? currentChapter?.content ?? '';
    const shouldShowChapterTitle = pageIndex == null || pageIndex === TEXT_PAGE_RESET_INDEX;
    const pageStartOffset = pageIndex != null ? getPageStartOffset(pageIndex) : TEXT_PAGE_RESET_INDEX;
    const markdownDocument = currentChapter?.markdownDocument;

    return (
      <div>
        {shouldShowChapterTitle && hasMultipleChapters && currentChapter && (
          <h2 className="text-center font-bold mb-8 opacity-80">
            {currentChapter.title}
          </h2>
        )}
        <div
          data-reader-content
          style={markdownDocument ? undefined : {
            textIndent: firstLineIndent ? '2em' : '0',
          }}
          className={markdownDocument ? 'break-words' : 'whitespace-pre-wrap break-words'}
        >
          {markdownDocument ? (
            <MarkdownReaderContent
              document={markdownDocument}
              startOffset={pageStartOffset}
              endOffset={pageStartOffset + content.length}
              annotations={currentChapterAnnotations}
              color={effectiveColor}
              firstLineIndent={firstLineIndent}
              paginated={pageIndex != null}
              highlightRange={speechRange}
              onAnnotationClick={setHighlightedAnnotation}
              onInternalLink={pageIndex != null ? (href) => {
                let targetId = href.slice(1)
                try {
                  targetId = decodeURIComponent(targetId)
                } catch {
                  // Keep the original fragment when it is not valid URI encoding.
                }
                const targetOffset = markdownDocument.blocks.find(
                  (block) => block.id === targetId
                )?.start ?? markdownDocument.spans.find((span) => span.id === targetId)?.start
                if (targetOffset == null) return

                let offset = 0
                const targetPage = textPages.findIndex((page) => {
                  const pageEnd = offset + page.length
                  const containsTarget = targetOffset >= offset && targetOffset < pageEnd
                  offset = pageEnd
                  return containsTarget
                })
                if (targetPage >= 0 && targetPage !== currentPageIndex) {
                  goToPage(targetPage, targetPage > currentPageIndex ? 'left' : 'right')
                }
              } : undefined}
            />
          ) : pageContent != null && pageIndex != null
            ? renderContentWithAnnotationsForPage(content, currentChapterIndex, pageStartOffset)
            : renderContentWithAnnotations(content, currentChapterIndex)}
        </div>
      </div>
    );
  };

  /** 无缝续读：按章渲染 article 内容（标题 + 正文 + 章级批注；听书高亮仅作用于当前章） */
  const renderChapterArticle = (chapterIdx: number) => {
    const chapter = chapters[chapterIdx];
    if (!chapter) return null;
    const content = chapter.content;
    const chapterAnns = annotations
      .filter((a) => a.chapterIndex === chapterIdx)
      .map((a) => {
        const resolved = resolveAnnotationOffsets(content, a);
        return resolved ? { ...a, startOffset: resolved.startOffset, endOffset: resolved.endOffset } : null;
      })
      .filter((a): a is Annotation => a !== null)
      .filter((a) => a.startOffset >= 0 && a.endOffset > a.startOffset)
      .sort((a, b) => a.startOffset - b.startOffset);
    const chapterSpeechRange = chapterIdx === currentChapterIndex ? speechRange : null;
    return (
      <div>
        {hasMultipleChapters && (
          <h2 className="text-center font-bold mb-8 opacity-80">
            {chapter.title}
          </h2>
        )}
        <div
          data-reader-content
          style={chapter.markdownDocument ? undefined : {
            textIndent: firstLineIndent ? '2em' : '0',
          }}
          className={chapter.markdownDocument ? 'break-words' : 'whitespace-pre-wrap break-words'}
        >
          {chapter.markdownDocument ? (
            <MarkdownReaderContent
              document={chapter.markdownDocument}
              startOffset={TEXT_PAGE_RESET_INDEX}
              endOffset={content.length}
              annotations={chapterAnns}
              color={effectiveColor}
              firstLineIndent={firstLineIndent}
              paginated={false}
              highlightRange={chapterSpeechRange}
              onAnnotationClick={setHighlightedAnnotation}
            />
          ) : chapterAnns.length > 0 || chapterSpeechRange ? (
            renderTextWithRanges(content, chapterAnns, chapterSpeechRange)
          ) : (
            content
          )}
        </div>
      </div>
    );
  };

  const renderPagedArticle = (pageIndex: number) => {
    const pageLayout = getCurrentTextPageLayout(isColumnsLayoutActive);
    const articleStyle = {
      fontSize: `${fontSize}px`,
      lineHeight,
      fontFamily: resolvedFontFamily,
      color: effectiveColor,
      WebkitUserSelect: 'text' as const,
      userSelect: 'text' as const,
      WebkitTouchCallout: 'none' as const,
    };

    const articleClassName = cn(
      'mx-auto h-full overflow-hidden',
      textAlign === 'justify' ? 'text-justify' : 'text-left'
    );

    if (!isColumnsLayoutActive) {
      return (
        <article
          data-reader-article
          className={articleClassName}
          style={{
            ...articleStyle,
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: `${pageLayout.articleWidth}px`,
            paddingBlock: `${pageLayout.verticalPadding}px`,
            paddingInline: `${pageLayout.horizontalPadding / HALF_DIVISOR}px`,
          }}
        >
          {renderArticleContent(textPages[pageIndex], pageIndex)}
        </article>
      );
    }

    const nextPageIndex = pageIndex + 1;

    return (
      <div className="h-full w-full flex gap-0 px-4 lg:px-8 py-10 lg:py-14">
        {[pageIndex, nextPageIndex].map((spreadPageIndex) => (
          <article
            key={spreadPageIndex}
            data-reader-article
            className={cn(
              'h-full min-w-0 flex-1 overflow-hidden px-6 lg:px-10',
              spreadPageIndex === pageIndex && 'border-r border-outline-variant/30',
              textAlign === 'justify' ? 'text-justify' : 'text-left'
            )}
            style={articleStyle}
          >
            {textPages[spreadPageIndex]
              ? renderArticleContent(textPages[spreadPageIndex], spreadPageIndex)
              : null}
          </article>
        ))}
      </div>
    );
  };

  const pageIndicatorText = (() => {
    if (textPages.length === 0) return isEpub ? 'EPUB' : isMarkdown ? 'MD' : 'TXT';
    if (!isColumnsLayoutActive) return `${currentPageIndex + 1}/${textPages.length}`;

    const firstVisiblePage = currentPageIndex + 1;
    const lastVisiblePage = Math.min(currentPageIndex + textPageStep, textPages.length);
    return firstVisiblePage === lastVisiblePage
      ? `${firstVisiblePage}/${textPages.length}`
      : `${firstVisiblePage}-${lastVisiblePage}/${textPages.length}`;
  })();
  const displayedChapterPercent = isProgressDragging ? dragPercent : scrollPercent;
  const overallReadingPercent = getOverallReadingPercent(
    currentChapterIndex,
    chapters.length,
    displayedChapterPercent / PERCENT_MULTIPLIER
  );
  const isReaderNavigationVisible = uiVisible || isChapterEndPromptVisible;

  return (
    <div
      className="font-body min-h-[100dvh] relative overflow-hidden"
      data-speech-paused={ttsActive && speech.paused ? 'true' : undefined}
      style={{
        backgroundColor: effectiveBg,
        color: effectiveColor,
        isolation: 'isolate',
      }}
    >
      {/* 纸张纹理层：位于主题色之上、正文之下（负 z），multiply 混入纸色 */}
      {paperTextureLayer && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[-1]"
          style={paperTextureLayer}
        />
      )}
      {/* 隐藏的测量容器 */}
      <div ref={measureRef} className="absolute pointer-events-none" aria-hidden="true" />
      {currentChapter?.markdownDocument && textReadingMode !== 'scroll' && (
        <div
          ref={markdownMeasureRef}
          className="fixed left-[-99999px] top-0 invisible pointer-events-none break-words"
          aria-hidden="true"
        >
          {hasMultipleChapters && (
            <h2 data-markdown-measure-title className="text-center font-bold mb-8 opacity-80">
              {currentChapter.title}
            </h2>
          )}
          <MarkdownReaderContent
            document={currentChapter.markdownDocument}
            annotations={[]}
            color={effectiveColor}
            firstLineIndent={firstLineIndent}
            paginated
            measurementMode
            onAnnotationClick={() => undefined}
          />
        </div>
      )}

      {/* 滚动模式 */}
      {textReadingMode === 'scroll' && (
        <main
          ref={scrollContainerRef}
          className={cn('w-full h-[100dvh] overscroll-contain', verticalWriting ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto')}
          style={{
            WebkitOverflowScrolling: 'touch',
            // 禁用浏览器原生 scroll anchoring：窗口增缩的滚动补偿由本组件的 layout effect 接管
            overflowAnchor: 'none',
            ...(verticalWriting ? { writingMode: 'vertical-rl' as const } : {}),
            ...(displayFilter ? { filter: displayFilter } : {}),
          }}
          onClick={handleTapZoneClick}
          onScroll={handleScroll}
        >
          {(() => {
            // 竖排下块向为水平：max-w 会把章宽钳在 680px，溢出列会叠印到下一章上，必须让盒宽随内容增长
            const articleClassName = cn(
              verticalWriting
                ? 'px-6 py-16 md:py-24'
                : 'max-w-[680px] mx-auto px-6 py-16 md:py-24',
              textAlign === 'justify' ? 'text-justify' : 'text-left'
            );
            const articleStyle = {
              fontSize: `${fontSize}px`,
              lineHeight,
              fontFamily: resolvedFontFamily,
              color: effectiveColor,
              WebkitUserSelect: 'text' as const,
              userSelect: 'text' as const,
              WebkitTouchCallout: 'none' as const,
            };
            if (!currentChapter) {
              return (
                <article data-reader-article className={articleClassName} style={articleStyle}>
                  <div className="text-center text-on-surface-variant py-24">
                    <span className="material-symbols-outlined text-6xl block mb-4">description</span>
                    <p>暂无内容</p>
                  </div>
                </article>
              );
            }
            // 无缝续读渲染拼接窗口内的章节；关闭自动衔接时仅渲染当前章
            const renderedIndices = isSeamlessReading
              ? Array.from({ length: Math.max(0, scrollWindow.end - scrollWindow.start) }, (_, i) => scrollWindow.start + i)
              : [currentChapterIndex];
            return (
              <>
                {renderedIndices.map((idx) => (
                  <article
                    key={idx}
                    data-reader-article
                    data-chapter-index={idx}
                    ref={(el) => {
                      if (el) scrollChapterElsRef.current.set(idx, el);
                      else scrollChapterElsRef.current.delete(idx);
                    }}
                    className={articleClassName}
                    style={articleStyle}
                  >
                    {renderChapterArticle(idx)}
                  </article>
                ))}
                {isSeamlessReading && scrollWindow.end >= chapters.length && (
                  <div
                    className={cn(
                      'px-6 pb-24 pt-2 text-center text-sm opacity-50',
                      verticalWriting ? '' : 'max-w-[680px] mx-auto'
                    )}
                    style={{ color: effectiveColor }}
                  >
                    —— 全书完 ——
                  </div>
                )}
              </>
            );
          })()}
        </main>
      )}

      {/* 左右翻页 / 模拟翻书模式 */}
      {textReadingMode !== 'scroll' && (
        <main
          ref={flipPageRef}
          className={cn(
            'w-full h-[100dvh] relative touch-none',
            textReadingMode === 'book' ? 'book-flip-container' : ''
          )}
          style={{
            ...(displayFilter ? { filter: displayFilter } : {}),
          }}
          onClick={handlePaginateClick}
          onTouchStart={(e) => {
            if ((e.target as HTMLElement).closest('[data-reader-horizontal-scroll]')) return;
            handleTouchStart(e);
            handleFlipTouchStart(e);
          }}
          onTouchMove={(e) => {
            if ((e.target as HTMLElement).closest('[data-reader-horizontal-scroll]')) return;
            handleFlipTouchMove(e);
          }}
          onTouchEnd={(e) => {
            if ((e.target as HTMLElement).closest('[data-reader-horizontal-scroll]')) {
              touchStartRef.current = null;
              return;
            }
            if (textReadingMode === 'book') {
              if (isPageAnimating) {
                // 正在翻页动画中，处理翻书完成逻辑
                handleFlipTouchEnd();
              } else {
                // 非翻页状态，处理文本选中检测
                handleTouchEnd(e);
              }
            } else {
              handleTouchEnd(e);
            }
          }}
        >
          {textPages.length > 0 && textPages[Math.min(currentPageIndex, textPages.length - 1)] !== undefined ? (
            <>
              {/* 前一页（退出动画） */}
              {isPageAnimating && previousPageIndex !== null && textPages[previousPageIndex] !== undefined && (
                <div
                  key={`page-${previousPageIndex}-exit`}
                  data-flip-exit
                  className={cn(
                    'absolute inset-0 w-full h-full overflow-hidden book-flip-page book-flip-page-backface',
                    textReadingMode !== 'book' && getPageAnimClass(true)
                  )}
                  style={textReadingMode === 'book' ? {
                    transformOrigin: pageDirection === 'left' ? 'left center' : 'right center',
                    transform: `rotateY(${pageDirection === 'left' ? -FLIP_ROTATION_DEG * flipProgress : FLIP_ROTATION_DEG * flipProgress}deg)`,
                    zIndex: 3,
                  } : undefined}
                >
                  {renderPagedArticle(previousPageIndex)}
                  {/* 翻页阴影 */}
                  {textReadingMode === 'book' && (
                    <>
                      <div className="book-page-shadow" style={{
                        background: flipProgress > 0 && flipProgress < 1
                          ? `linear-gradient(to ${pageDirection === 'left' ? 'left' : 'right'}, rgba(0,0,0,${FLIP_EXIT_SHADOW_MAX_OPACITY * flipProgress}) 0%, transparent ${FLIP_EXIT_SHADOW_GRADIENT_END_PCT}%)`
                          : undefined,
                      }} />
                      <div className="book-spine-highlight" style={{ opacity: flipProgress > 0 && flipProgress < 1 ? FLIP_SPINE_OPACITY : 0 }} />
                    </>
                  )}
                </div>
              )}
              
              {/* 当前页（book 模式：静止在底层被揭开；paginate：滑入） */}
              <div
                key={`page-${currentPageIndex}-enter`}
                data-flip-enter
                className={cn(
                  'w-full h-[100dvh] overflow-hidden',
                  isPageAnimating ? 'absolute inset-0 book-flip-page' : '',
                  textReadingMode !== 'book' && isPageAnimating && getPageAnimClass(false)
                )}
                style={textReadingMode === 'book' && isPageAnimating ? { zIndex: 1 } : undefined}
              >
                {renderPagedArticle(Math.min(currentPageIndex, textPages.length - 1))}
                {/* 翻起页投在静止页上的投影（随翻起渐弱） */}
                {textReadingMode === 'book' && isPageAnimating && (
                  <div
                    className="book-page-shadow"
                    style={{
                      background: `linear-gradient(to ${pageDirection === 'left' ? 'right' : 'left'}, rgba(0,0,0,${FLIP_ENTER_SHADOW_MAX_OPACITY * (1 - flipProgress)}) 0%, transparent ${FLIP_ENTER_SHADOW_GRADIENT_END_PCT}%)`,
                    }}
                  />
                )}
              </div>
            </>
          ) : isLoading ? (
            <div className="w-full h-[100dvh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl animate-spin opacity-50">progress_activity</span>
                <p className="opacity-50">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-[100dvh] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl opacity-50">description</span>
                <p className="opacity-50">暂无内容</p>
              </div>
            </div>
          )}

          {/* 翻页模式左右点击区域指示（淡显示） */}
          {uiVisible && (
            <>
              <div className="absolute left-0 top-0 w-[30%] h-full pointer-events-none flex items-center justify-start pl-3 opacity-0 hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-4xl">chevron_left</span>
              </div>
              <div className="absolute right-0 top-0 w-[30%] h-full pointer-events-none flex items-center justify-end pr-3 opacity-0 hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-4xl">chevron_right</span>
              </div>
            </>
          )}
        </main>
      )}

      {/* 进度指示器（常驻右上角） */}
      <TextProgressHint
        visible={isProgressHintVisible || isProgressDragging}
        overallPercent={overallReadingPercent}
        estimatedTimeLeft={estimatedTimeLeft}
      />

      {/* 自动滚动指示器 */}
      {isAutoScrolling && <AutoScrollBadge />}

      {/* 听书悬浮控制 */}
      {ttsActive && speech.supported && (
        <SpeechBadge
          rate={speech.rate}
          paused={speech.paused}
          engineLabel={speech.engineLabel}
          synthesizing={speech.synthesizing}
          onCycleRate={speech.cycleRate}
          onPauseResume={() => (speech.paused ? speech.resume() : speech.pause())}
          onStop={handleToggleTTS}
        />
      )}

      {/* UI overlay - 始终渲染，通过 opacity/pointer-events 控制可见性，确保返回按钮和点击区域始终可用 */}
      {textReadingMode === 'scroll' && isChapterEndPromptVisible && currentChapterIndex < chapters.length - 1 && (
        <ChapterEndPrompt
          title={TEXT_CHAPTER_END_PROMPT_LABELS.title}
          actionLabel={TEXT_CHAPTER_END_PROMPT_LABELS.action}
          onNext={goToNextChapter}
        />
      )}

      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col justify-between transition-opacity duration-300',
          isReaderNavigationVisible ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'
        )}
      >
          {/* 顶栏 */}
          <TextReaderHeader
            visible={uiVisible}
            title={title}
            chapterTitle={currentChapter?.title}
            showChapterButton={hasMultipleChapters}
            isBookmarked={isBookmarked}
            isFavorite={book?.isFavorite ?? false}
            onBack={handleClose}
            onOpenChapters={() => setIsChapterDrawerOpen(true)}
            onToggleBookmark={toggleBookmark}
            onToggleFavorite={() => {
              if (bookId) useLibraryStore.getState().toggleFavorite(bookId);
            }}
            onOpenAnnotations={() => setIsAnnotationListOpen(true)}
            onOpenSearch={() => setIsSearchPanelOpen(true)}
            onOpenSettings={() => setIsBottomBarVisible(true)}
          />

          {/* 底部进度条 */}
          <TextReaderFooter
            visible={isReaderNavigationVisible}
            showChapterNav={hasMultipleChapters}
            chapterIndex={currentChapterIndex}
            chapterTotal={chapters.length}
            onPrevChapter={goToPrevChapter}
            onNextChapter={goToNextChapter}
            isAutoScrolling={isAutoScrolling}
            onToggleAutoScroll={toggleAutoScroll}
            ttsSupported={speech.supported}
            ttsActive={ttsActive}
            onToggleTTS={handleToggleTTS}
            scrollPercent={scrollPercent}
            dragPercent={dragPercent}
            isDragging={isProgressDragging}
            onSliderChange={handleProgressSliderValueChange}
            onSliderDragStart={() => {
              setIsProgressDragging(true);
              setDragPercent(scrollPercent);
            }}
            onSliderCommit={handleProgressSliderCommit}
            rightLabel={
              textReadingMode === 'scroll'
                ? (isEpub ? 'EPUB' : isMarkdown ? 'MD' : 'TXT')
                : pageIndicatorText
            }
          />
        </div>

      {/* 底栏遮罩 */}
      {isBottomBarVisible && (
        <div
          className="fixed inset-0 z-[45] bg-on-background/30 animate-fade-in"
          onClick={() => { setIsBottomBarVisible(false); toggleUi(); }}
        />
      )}

      {/* 文本阅读设置栏 */}
      {isBottomBarVisible && (
        <TextReaderBottomBar
          fontSize={fontSize}
          lineHeight={lineHeight}
          paperModeEnabled={settings.paperMode}
          paperType={settings.paperType}
          brightness={brightness}
          colorTemperature={colorTemperature}
          textFontFamily={textFontFamily}
          textAlign={textAlign}
          firstLineIndent={firstLineIndent}
          tapZoneEnabled={tapZoneEnabled}
          autoAdvanceTextChapter={autoAdvanceTextChapter}
          autoScrollSpeed={autoScrollSpeed}
          textReadingMode={textReadingMode}
          onFontSizeChange={(size) => setLocalFontSize(size)}
          onLineHeightChange={(lh) => setLocalLineHeight(lh)}
          onPaperModeToggle={() => useAppStore.getState().togglePaperMode()}
          onPaperTypeChange={(type) => useAppStore.getState().updateSettings({ paperType: type })}
          onBrightnessChange={(v) => useAppStore.getState().updateSettings({ brightness: v })}
          textureIntensity={settings.textureIntensity}
          onTextureIntensityChange={(v) => useAppStore.getState().updateSettings({ textureIntensity: v })}
          onColorTemperatureChange={(v) => useAppStore.getState().updateSettings({ colorTemperature: v })}
          onTextFontFamilyChange={(family) => useAppStore.getState().updateSettings({ textFontFamily: family })}
          onTextAlignChange={(align) => useAppStore.getState().updateSettings({ textAlign: align })}
          onFirstLineIndentToggle={() => useAppStore.getState().updateSettings({ firstLineIndent: !firstLineIndent })}
          verticalWriting={verticalWriting}
          onVerticalWritingToggle={() => useAppStore.getState().updateSettings({ verticalWriting: !settings.verticalWriting })}
          onTapZoneEnabledToggle={() => useAppStore.getState().updateSettings({ tapZoneEnabled: !tapZoneEnabled })}
          onAutoAdvanceTextChapterToggle={() => useAppStore.getState().updateSettings({ autoAdvanceTextChapter: !autoAdvanceTextChapter })}
          onAutoScrollSpeedChange={(speed) => useAppStore.getState().updateSettings({ autoScrollSpeed: speed })}
          onTextReadingModeChange={(mode) => {
            useAppStore.getState().updateSettings({ textReadingMode: mode });
            setCurrentPageIndex(0);
            if (mode === 'columns' && !isLandscapeViewport) {
              showToast('双栏阅读需要横屏，旋转设备后生效');
            }
          }}
          ttsEngine={settings.ttsEngine}
          ttsServerUrl={settings.ttsServerUrl}
          ttsServerModel={settings.ttsServerModel}
          ttsServerVoice={settings.ttsServerVoice}
          onTtsEngineChange={handleTtsEngineChange}
          onTtsServerFieldChange={handleTtsServerFieldChange}
          onClose={() => setIsBottomBarVisible(false)}
        />
      )}

      {toast && <UndoToast message={toast.message} onUndo={toast.undo} />}

      {/* 神经网络音色包首次下载确认 */}
      <ConfirmDialog
        isOpen={pendingNeuralConfirm}
        title="下载离线语音包"
        message="神经网络语音需先下载约 60-80MB 的中文音色包（仅下载一次，之后可离线使用）。是否继续？"
        confirmLabel="下载并启用"
        onConfirm={() => {
          setPendingNeuralConfirm(false);
          useAppStore.getState().updateSettings({ ttsEngine: 'neural' });
        }}
        onCancel={() => setPendingNeuralConfirm(false)}
      />

      {/* 章节目录抽屉 */}
      {isChapterDrawerOpen && (
        <ChapterDrawer
          chapters={chapters}
          currentChapterIndex={currentChapterIndex}
          onSelectChapter={goToChapter}
          onClose={() => setIsChapterDrawerOpen(false)}
        />
      )}

      {/* 书签面板 */}
      {isBookmarkPanelOpen && (
        <BookmarkPanel
          bookmarks={bookmarks}
          onSelect={handleBookmarkSelect}
          onDelete={handleBookmarkDelete}
          onClose={() => setIsBookmarkPanelOpen(false)}
        />
      )}

      {/* 批注列表面板 */}
      {isAnnotationListOpen && (
        <AnnotationList
          annotations={annotations}
          bookTitle={title}
          onEdit={handleAnnotationEdit}
          onDelete={handleAnnotationDelete}
          onNavigate={handleAnnotationNavigate}
          onClose={() => setIsAnnotationListOpen(false)}
        />
      )}

      {/* 书内检索面板 */}
      {isSearchPanelOpen && (
        <InBookSearchPanel
          chapters={chapters}
          onSelectHit={handleSearchHitSelect}
          onClose={() => setIsSearchPanelOpen(false)}
        />
      )}

      {/* 浮动动作条：选中后一键划线或打开批注弹窗 */}
      {selectionInfo && !selectionPopup && (
        <SelectionFloatingButton
          position={selectionInfo.position}
          onHighlight={handleQuickHighlight}
          onOpen={() => {
            selectionPopupTimeRef.current = Date.now();
            setSelectionPopup({
              text: selectionInfo.text,
              position: {
                x: selectionInfo.position.x - SELECTION_POPUP_OFFSET_X,
                y: selectionInfo.position.y + SELECTION_POPUP_OFFSET_Y,
              },
              contentOffset: selectionInfo.contentOffset,
              contentEndOffset: selectionInfo.contentEndOffset,
            });
            setSelectionInfo(null);
          }}
          onCancel={() => {
            setSelectionInfo(null);
            window.getSelection()?.removeAllRanges();
            isSelectingTextRef.current = false;
          }}
        />
      )}

      {/* 批注弹窗 */}
      {selectionPopup && (
        <AnnotationPopup
          selectedText={selectionPopup.text}
          position={selectionPopup.position}
          onSave={handleAnnotationSave}
          onCancel={() => {
            // 防止弹窗刚渲染就被 click 事件关闭
            if (Date.now() - selectionPopupTimeRef.current < SELECTION_POPUP_MISCLICK_GUARD_MS) return;
            setSelectionPopup(null);
            setSelectionInfo(null);
            window.getSelection()?.removeAllRanges();
            isSelectingTextRef.current = false;
          }}
        />
      )}

      {/* 批注详情弹窗：查看 / 编辑 / 删除 / 回到原句 */}
      {highlightedAnnotation && (
        <AnnotationDetailModal
          annotation={highlightedAnnotation}
          onEdit={handleAnnotationEdit}
          onDelete={handleAnnotationDelete}
          onNavigate={handleAnnotationNavigate}
          onClose={() => setHighlightedAnnotation(null)}
        />
      )}
    </div>
  );
};
