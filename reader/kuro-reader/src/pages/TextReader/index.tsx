import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';

import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

import { AnnotationDetailModal } from '@/components/molecules/AnnotationDetailModal';
import { AnnotationList } from '@/components/molecules/AnnotationList';
import { AnnotationPopup } from '@/components/molecules/AnnotationPopup';
import { AutoScrollBadge } from '@/components/molecules/AutoScrollBadge';
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
import { TranslatePopup, type TranslateState } from '@/components/molecules/TranslatePopup';
import { UndoToast } from '@/components/molecules/UndoToast';
import { VocabLookupPopup, type VocabLookupState } from '@/components/molecules/VocabLookupPopup';
import { COPY } from '@/constants/copy';
import { ANNOTATION_QUERY_PARAM, READER_GOTO_QUERY_PARAM, ROUTES, bookDetailPath, parseGotoParam } from '@/constants/routes';
import { getTextReaderFontFamily } from '@/constants/textReaderFonts';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useBackHandler } from '@/hooks/useBackHandler';
import {
  useBookFlipAnimation,
  FLIP_ROTATION_DEG,
  FLIP_EXIT_SHADOW_MAX_OPACITY,
  FLIP_ENTER_SHADOW_MAX_OPACITY,
  FLIP_EXIT_SHADOW_GRADIENT_END_PCT,
  FLIP_ENTER_SHADOW_GRADIENT_END_PCT,
  FLIP_SPINE_OPACITY,
} from '@/hooks/useBookFlipAnimation';
import { useEstimatedTimeLeft } from '@/hooks/useEstimatedTimeLeft';
import { useHistoryBack } from '@/hooks/useHistoryBack';
import { useLandscapeViewport } from '@/hooks/useLandscapeViewport';
import { useReadingStats } from '@/hooks/useReadingStats';
import { useSeamlessScrollTracking } from '@/hooks/useSeamlessScrollTracking';
import { useSpeech } from '@/hooks/useSpeech';
import { useTextProgressSaving } from '@/hooks/useTextProgressSaving';
import { useTextSelection, type TextSelectionInfo } from '@/hooks/useTextSelection';
import { useWakeLock } from '@/hooks/useWakeLock';
import { isProviderConfigured } from '@/services/ai/aiClient';
import { translateSelection } from '@/services/ai/translation';
import { lookupWord, type VocabLookupResult } from '@/services/ai/vocabLookup';
import { revokeEpubObjectUrls } from '@/services/epubContent';
import {
  findPreferredBreak,
  paginatePlainText,
  splitTextIntoPages,
} from '@/services/pagination/textPagination';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { bookmarkRepo } from '@/services/storage/bookmarkRepo';
import { vocabRepo, vocabEntryId } from '@/services/storage/vocabRepo';
import { loadTextContent, resolveTextChapterIndex, type TextChapter } from '@/services/textContent';
import { isPiperDownloading, normalizePiperDownloadPercent, piperModelStored, preloadPiperModel, PROGRESS_INDETERMINATE, subscribePiperDownloadProgress } from '@/services/tts/piperEngine';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Bookmark, Annotation, AnnotationStyle, TtsEngineOption, VocabEntry } from '@/types';
import { computeAnnotationAnchor, resolveAnnotationOffsets } from '@/utils/annotationAnchor';
import { getAnnotationPresentation } from '@/utils/annotationHighlight';
import { copyTextToClipboard } from '@/utils/clipboard';
import { cn } from '@/utils/cn';
import {
  PAPER_INK_COLOR,
  computePaperOpacity,
  getPaperBaseOpacity,
  getPaperConfig,
} from '@/utils/paperTexture';
import {
  getOverallReadingPercent,
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

const PROGRESS_HINT_AUTO_HIDE_MS = 1400;
const SWIPE_THRESHOLD = 50;
// 无缝续读窗口：视口所在章之后至少预拼接 AHEAD 章；窗口总量超 MAX 时裁剪远端，防止长章节数 DOM 无限增长
// 向上回看：锚点进入窗口首章顶部该距离内即向前扩一章（带滚动补偿）
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
// 划词查词：选区最长这么多个字符还算是「词或短语」（长了该走批注）
const VOCAB_LOOKUP_MAX_CHARS = 30;
// 语境句窗口：选区前后各取的原文长度
const VOCAB_CONTEXT_BEFORE_CHARS = 60;
const VOCAB_CONTEXT_AFTER_CHARS = 60;
// 百分比与比例换算
const PERCENT_MULTIPLIER = 100;

const TEXT_SEPIA_MAX_INTENSITY = 0.4; // 色温滤镜最大 sepia 强度
const HALF_DIVISOR = 2; // 二分查找中点 / 选区弹窗中心点 / 页边距均分
// UI 时序
const UI_AUTO_HIDE_AFTER_LOAD_MS = 3000;
const SELECTION_POPUP_MISCLICK_GUARD_MS = 400;
/** 原生选区幽灵回滚清扫延时：Chromium 对原生选区的 tap-collapse 会在 ~80ms 后原地回滚
 * （真机实测：外点取消后选区复活、动作条重亮），需补一刀延迟清除 */
const SELECTION_GHOST_SWEEP_DELAY_MS = 220;
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
/** 每行字数上界的字符密度倍率：CJK 按字宽 1em 计，拉丁字符约 0.5em，取 2 倍覆盖 */
const PAGE_CHAR_DENSITY_FACTOR = 2;
/** 每行字数下限：极窄视口的保底值，防容量上界算成 0 */
const MIN_CHARS_PER_LINE = 4;
// 翻书动画
const BOOK_FLIP_ANIMATION_MS = 900;
const PAGE_SLIDE_ANIMATION_MS = 650;
/** 字体就绪等待上限：超时先分页，字体迟到后由 loadingdone 重排补齐 */
const FONTS_READY_TIMEOUT_MS = 1500;
/** 测量容器图片加载等待上限：超时按当前状态先分页 */
const MEASURE_IMAGES_TIMEOUT_MS = 3000;
/** 页容量自校准：单次收缩步长（约半行）与累计上限，防病态循环 */
const CAPACITY_SHRINK_STEP_PX = 12;
const MAX_CAPACITY_SHRINK_PX = 240;
/** 页容量收缩下限：低于此值不再收缩（正常阅读不可能触达） */
const MIN_PAGE_CAPACITY_PX = 240;
/** 整章一页自检阈值：单页文本量超过页面理论容量的倍数即判定测量不可信 */
const SINGLE_PAGE_SANITY_FACTOR = 1.5;
const SINGLE_PAGE_MIN_CAPACITY_CHARS = 400;
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
const RANDOM_ID_RADIX = 36; // base36 随机串
const RANDOM_ID_SLICE_START = 2;
const RANDOM_ID_SLICE_END = 6;
const TEXT_PAGE_TITLE_MARGIN_BOTTOM = 32;
const TEXT_PAGE_TITLE_FONT_WEIGHT = '700';
const TEXT_PAGE_TITLE_OPACITY = '0.8';
// 块内拆页测量与渲染侧宽度对齐（对应 MarkdownReaderContent 的 Tailwind 类）
const BLOCKQUOTE_TEXT_INSET_PX = 20; // border-l-4(4px) + pl-4(16px)
const LIST_MARKER_GUTTER_BASE_PX = 16; // list-item 标记槽首层 1rem
const LIST_MARKER_GUTTER_STEP_PX = 20; // 每层嵌套加 1.25rem
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

export const TextReaderPage: React.FC = () => {
  const historyBack = useHistoryBack();
  const navigate = useNavigate();
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const [searchParams] = useSearchParams();
  /** 外部批注直达目标（?ann=<id>）；一次导航只消费一次 */
  const annTargetId = searchParams.get(ANNOTATION_QUERY_PARAM);
  /** 知识库原文直达（?goto=chapterIndex,offsetRatio）；一次导航只消费一次 */
  const gotoTarget = parseGotoParam(searchParams.get(READER_GOTO_QUERY_PARAM));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uiAutoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  /** 分页引擎收尾用的上一版页面镜像（声明位置在 useTextProgressSaving 之前，就近自建） */
  const previousPagesRef = useRef<string[]>([]);
  previousPagesRef.current = textPages;
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState<number | null>(null);
  const [pageDirection, setPageDirection] = useState<'left' | 'right' | null>(null);
  const [isPageAnimating, setIsPageAnimating] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const markdownMeasureRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 书签 & 批注状态
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isAnnotationListOpen, setIsAnnotationListOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<TextSelectionInfo | null>(null);
  const selectionPopupRef = useRef(selectionPopup);
  selectionPopupRef.current = selectionPopup;
  // 划词查词弹层（词/语境/结果 + 落库所需的书与章定位）
  const [vocabLookup, setVocabLookup] = useState<
    | (VocabLookupState & {
        position: { x: number; y: number };
        bookId: string;
        chapterIndex: number;
        chapterTitle: string;
      })
    | null
  >(null);
  // 划句翻译弹层（译文 + 原选区快照——存为批注要用）
  const [translateState, setTranslateState] = useState<
    | (TranslateState & {
        position: { x: number; y: number };
        selection: TextSelectionInfo;
      })
    | null
  >(null);
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<Annotation | null>(null);
  const selectionPopupTimeRef = useRef<number>(0);
  // 文本选区检测（鼠标拖选/触摸长按/selectionchange 兜底）整体收敛于 hook
  const {
    selectionInfo,
    setSelectionInfo,
    selectionInfoRef,
    isSelectingTextRef,
    lastTouchEndTimeRef,
  } = useTextSelection({ selectionPopupRef, scrollContainerRef });

  // 待处理的导航目标（书签/批注跳转后跨章节时暂存，等内容就绪后执行）
  const pendingNavRef = useRef<{
    chapterIndex: number;
    scrollRatio?: number;
    pageIndex?: number;
  } | null>(null);
  // 分页完成后跳过重置到第 0 页（用于媒体加载重分页时保留当前页）
  const preserveReadingPositionRef = useRef(false);
  // 分页定位请求：跨章节跳转/进度恢复把目标页排队，分页完成时同步消费，
  // 替代「定时器赌分页完成」的时序写法
  type PageRequest = { pageIndex?: number; ratio?: number };
  const pendingPageRequestRef = useRef<PageRequest | null>(null);
  // 最近一次完成分页的章节下标（判断现有 textPages 是否对当前章节有效）
  const paginatedChapterIndexRef = useRef(-1);
  /** 页容量自校准收缩量：渲染自检发现溢出时增长，收敛到本机「绝不裁字」的容量 */
  const pageCapacityShrinkRef = useRef(0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref 跨渲染稳定，列为依赖无意义
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

  /** 分页引擎统一收尾：消费定位请求 → 按字符偏移保留位置 → 重置到第 0 页。
   *  与现有分页逐字节一致时原地跳过：字体加载完成/无效 resize 触发的重复分页不得复位读者位置 */
  const applyPaginationResult = useCallback(
    (pages: string[]) => {
      const previousPages = previousPagesRef.current;
      const sameChapterPaginated = paginatedChapterIndexRef.current === currentChapterIndexRef.current;
      if (
        sameChapterPaginated &&
        previousPages.length === pages.length &&
        previousPages.every((page, index) => page === pages[index])
      ) {
        consumePendingPageIndex(pages.length);
        preserveReadingPositionRef.current = false;
        return;
      }
      setTextPages(pages);
      paginatedChapterIndexRef.current = currentChapterIndexRef.current;
      if (consumePendingPageIndex(pages.length)) return;
      if (preserveReadingPositionRef.current && sameChapterPaginated) {
        // 重切页后按字符偏移映射回「正在读的那段文字」所在新页（同下标会随切分漂移）；
        // 换章场景不沿用：旧章偏移对新章无意义
        preserveReadingPositionRef.current = false;
        let offset = 0;
        for (let i = 0; i < currentPageIndexRef.current && i < previousPages.length; i++) {
          offset += previousPages[i].length;
        }
        let acc = 0;
        let target = Math.max(0, pages.length - 1);
        for (let i = 0; i < pages.length; i++) {
          if (offset < acc + pages[i].length) {
            target = i;
            break;
          }
          acc += pages[i].length;
        }
        setCurrentPageIndex(target);
        return;
      }
      preserveReadingPositionRef.current = false;
      setCurrentPageIndex(TEXT_PAGE_RESET_INDEX);
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

  // 模拟翻书（book 模式）跟手动画收敛于 hook；与 goToPage 滑动动画共用下方分页状态
  const {
    flipProgress,
    flipPageRef,
    startFlip,
    completeFlip,
    handleFlipTouchStart,
    handleFlipTouchMove,
    handleFlipTouchEnd,
  } = useBookFlipAnimation({
    enabled: textReadingMode === 'book',
    totalPages: textPages.length,
    currentPageIndex,
    setCurrentPageIndex,
    isPageAnimating,
    setIsPageAnimating,
    pageDirection,
    setPageDirection,
    previousPageIndex,
    setPreviousPageIndex,
  });

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

  // 轻提示（撤销 / 方向引导 / AI 未配置的去设置出口）
  const [toast, setToast] = useState<{ message: string; undo?: () => void; actionLabel?: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string, undo?: () => void, actionLabel?: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, undo, actionLabel });
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
    // 显式直达意图（?ann= / ?goto=）优先于进度/章节恢复：无缝滚动窗口就位会重放本 effect，
    // 其 scrollTo(0,0) 会把直达定位归零——有直达参数时整体让位（直达自行设置章节与位置）
    if (annTargetId || gotoTarget) return;
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

  // 进度保存体系（镜像 ref + 组装 + 立即/防抖保存）收敛于 hook
  const {
    saveTextProgress,
    scheduleProgressSave,
    cancelPendingSave,
    composeTextProgress,
    chaptersRef,
    textPagesLengthRef,
    textPagesRef,
  } = useTextProgressSaving({ bookId, book, chapters, textPages, updateProgress });

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

  // 滚动进度追踪 + 无缝续读窗口维护（视口追踪/预拼接/扩窗/补偿）收敛于 hook
  const {
    scrollWindow,
    scrollChapterElsRef,
    handleScroll,
    navigateToChapter,
  } = useSeamlessScrollTracking({
    scrollContainerRef,
    bookId,
    chapters,
    currentChapterIndex,
    setCurrentChapterIndex,
    isSeamlessReading,
    textReadingMode,
    isLoading,
    ttsActive,
    isProgressDragging,
    verticalWriting,
    showProgressHint,
    setScrollPercent,
    setIsChapterEndPromptVisible,
    scheduleProgressSave,
  });

  // 离开时保存最终进度 + 清理 UI 定时器 + 持久化阅读设置
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      cancelPendingSave();
      if (uiAutoHideTimerRef.current) {
        clearTimeout(uiAutoHideTimerRef.current);
      }
      // 统一保存所有阅读设置到全局 store
      const s = settingsRef.current;
      const settingsUpdate: Partial<import('@/types').UserSettings> = {
        // 全局设置（实时同步的，这里作为安全保底的最终写入）
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

      // 保存最终阅读位置到继续阅读列表（载荷组装与常规保存共用 composeTextProgress）
      if (bookId) {
        const mode = settingsRef.current.textReadingMode;
        const chapterIdx = currentChapterIndexRef.current;
        const pageIdx = currentPageIndexRef.current;
        let scrollRatio: number | undefined;
        if (mode === 'scroll') {
          // 滚动模式：从滚动容器计算精确位置
          // 卸载时才读取 ref：loading 早退期间容器未挂载，无法在 effect 建立时捕获
          // eslint-disable-next-line react-hooks/exhaustive-deps -- 卸载时才读 ref：loading 早退期间容器未挂载，无法在 effect 建立时捕获
          const container = scrollContainerRef.current;
          if (container) {
            const scrollable = container.scrollHeight - container.clientHeight;
            scrollRatio = scrollable > 0 ? container.scrollTop / scrollable : 0;
          } else {
            // 容器未挂载（loading 早退）：退回最近一次展示的滚动百分比
            scrollRatio = scrollPercentRef.current / PERCENT_MULTIPLIER;
          }
        }
        const progress = composeTextProgress(
          chapterIdx,
          mode !== 'scroll' ? pageIdx : undefined,
          mode === 'scroll' ? scrollRatio : undefined
        );
        if (progress) {
          useLibraryStore.getState().updateProgress(progress.bookId, progress);
        }
      }
    };
  }, [bookId, cancelPendingSave, composeTextProgress]);

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
    if (translateState) { setTranslateState(null); return true; }
    if (vocabLookup) { setVocabLookup(null); return true; }
    if (selectionPopup) { setSelectionPopup(null); return true; }
    if (highlightedAnnotation) { setHighlightedAnnotation(null); return true; }
    if (isBottomBarVisible) { setIsBottomBarVisible(false); return true; }
    if (isAnnotationListOpen) { setIsAnnotationListOpen(false); return true; }
    if (isSearchPanelOpen) { setIsSearchPanelOpen(false); return true; }
    if (isChapterDrawerOpen) { setIsChapterDrawerOpen(false); return true; }
    if (uiVisible) { toggleUi(); return true; }
    return false;
  });

  const handleClose = useCallback(() => {
    // 统一返回：能退则退回來路；深链直进栈底时落回档案卡（返回动作不压栈）
    historyBack(bookId ? bookDetailPath(bookId) : ROUTES.HOME);
  }, [historyBack, bookId]);

  // 章节切换（显式导航：目录/书签/检索/上下章按钮，保留硬切语义）
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index);
      scrollContainerRef.current?.scrollTo(0, 0);
      setScrollPercent(0);
      setIsChapterEndPromptVisible(false);
      navigateToChapter(index);
      setIsChapterDrawerOpen(false);
    }
  }, [chapters.length, navigateToChapter]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- TTS 回调经 ref 中转（chaptersRef/goToNextChapterRef），保持零依赖避免播音中重建
  }, []), useCallback((message: string) => {
    showToast(message);
  }, [showToast]), useCallback((message: string) => {
    // 引擎哑火自动换挡（如系统语音无响应→神经网络）的告知，非错误不打断朗读
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
  // 音色包下载进度（null = 没有下载在进行；引擎层去重并发下载并广播进度）
  const [neuralDownloadPercent, setNeuralDownloadPercent] = useState<number | null>(null);
  useEffect(
    () => subscribePiperDownloadProgress((percent) => setNeuralDownloadPercent(normalizePiperDownloadPercent(percent))),
    []
  );
  const handleTtsEngineChange = useCallback(async (engine: TtsEngineOption) => {
    // 已取消过下载确认的用户不再重复打扰:再次主动选择即视为同意,直接启用
    const dismissed = useAppStore.getState().settings.ttsModelPromptDismissed;
    if (engine === 'neural' && !dismissed && !(await piperModelStored())) {
      // 下载已在后台进行:不再重复弹窗,直接启用引擎(就绪前朗读先走系统语音)
      if (isPiperDownloading()) {
        useAppStore.getState().updateSettings({ ttsEngine: engine });
        return;
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 分页镜像 ref 跨渲染稳定，列为依赖会引发听书期间无谓重建
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 选区状态 ref 跨渲染稳定，列为依赖无意义
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

  const paginateMeasuredContent = useCallback(async () => {
    if (!currentChapter || textReadingMode === 'scroll') {
      setTextPages([]);
      return;
    }

    const measureEl = measureRef.current;
    if (!measureEl) {
      paginateContent();
      return;
    }

    const { contentWidth, pageHeight: layoutPageHeight } = getCurrentTextPageLayout(isColumnsLayoutActive);
    // 自校准收缩量：设备度量漂移经渲染后自检发现溢出时增长，使本机分页容量
    // 收敛到「绝不裁字」的水平（见下方渲染自检 effect）
    const pageHeight = Math.max(MIN_PAGE_CAPACITY_PX, layoutPageHeight - pageCapacityShrinkRef.current);

    if (pageHeight <= 0 || contentWidth <= 0) return;

    // 单页容量上界（字符）：行数 × 每行字数上界（CJK 按字宽 1em，拉丁约 0.5em，取 2 倍覆盖）。
    // 二分搜索窗口收到一页量级：单次测量最多渲染一页多的文本而不是剩余全章，
    // 大章节分页的强制回流字节量从 O(整章) 降到 O(单页)。上界偏松只多费一点测量，
    // 偏紧只产生略松的页（每页仍经 fitsPage 验证），两端都不影响正确性。
    const linesPerPage = Math.max(1, Math.ceil(pageHeight / Math.max(1, fontSize * lineHeight)));
    const charsPerLineUpper = Math.max(MIN_CHARS_PER_LINE, Math.ceil(contentWidth / Math.max(1, fontSize)) * PAGE_CHAR_DENSITY_FACTOR);
    const pageLengthUpperBound = linesPerPage * charsPerLineUpper;

    // 等测量容器内的图片完成加载（含失败）再量：图片未就绪时高度是占位值，
    // 会把带图页排得过满，渲染时被 overflow-hidden 裁掉尾部内容。
    // 超时兜底保证分页最终总会执行。
    const pendingMeasureImages = markdownMeasureRef.current
      ? Array.from(markdownMeasureRef.current.querySelectorAll('img')).filter((img) => !img.complete)
      : [];
    if (pendingMeasureImages.length > 0) {
      await new Promise<void>((resolve) => {
        let remaining = pendingMeasureImages.length;
        const done = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
        };
        pendingMeasureImages.forEach((img) => {
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
        setTimeout(resolve, MEASURE_IMAGES_TIMEOUT_MS);
      });
    }

    measureEl.style.position = 'absolute';
    measureEl.style.left = '-99999px';
    measureEl.style.top = '0';
    measureEl.style.visibility = 'hidden';
    measureEl.style.pointerEvents = 'none';
    measureEl.style.width = `${contentWidth}px`;
    measureEl.style.fontSize = `${fontSize}px`;
    measureEl.style.lineHeight = String(lineHeight);
    measureEl.style.fontFamily = resolvedFontFamily;
    // 注意：不设 color——颜色不影响布局，设了就会把它拖进分页依赖，
    // 切主题/纸色会触发无谓的全章重排
    measureEl.style.whiteSpace = 'normal';
    measureEl.style.wordBreak = 'break-word';
    measureEl.style.boxSizing = 'border-box';
    measureEl.style.textAlign = textAlign === 'justify' ? 'justify' : 'left';

    /** 块内拆页的测量上下文：拆分发生在段内时，渲染宽度受块样式（左内边距/缩进）影响，
     *  裸文本测量会比真实渲染更宽更矮 → 页被塞得过满、底部正文被 overflow-hidden 裁掉 */
    interface SplitBlockContext {
      kind: 'paragraph' | 'blockquote' | 'list-item';
      listDepth?: number;
      /** 切片是否从块首开始（段首缩进只在块首出现，与渲染侧 visibleStart === block.start 对齐） */
      atBlockStart: boolean;
    }

    const measurePageHeight = (pageText: string, includeChapterTitle: boolean, block?: SplitBlockContext): number => {
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
      // 块样式与渲染侧 getBlockClassName/inline style 逐项对齐：
      // blockquote = border-l-4 + pl-4；list-item = 1rem + depth*1.25rem 的标记槽
      if (block?.kind === 'blockquote') {
        contentEl.style.paddingLeft = `${BLOCKQUOTE_TEXT_INSET_PX}px`;
      } else if (block?.kind === 'list-item') {
        contentEl.style.paddingLeft = `${LIST_MARKER_GUTTER_BASE_PX + (block.listDepth ?? 0) * LIST_MARKER_GUTTER_STEP_PX}px`;
      }
      // 段首缩进与渲染侧对齐：仅纯文本页与 paragraph 块首有 2em 缩进（引用/列表不带）
      const indentApplies = block ? block.kind === 'paragraph' && block.atBlockStart : true;
      contentEl.style.textIndent = firstLineIndent && indentApplies ? '2em' : '0';
      wrapper.appendChild(contentEl);

      measureEl.replaceChildren(wrapper);
      return measureEl.scrollHeight;
    };

    const fitsPage = (pageText: string, includeChapterTitle: boolean, block?: SplitBlockContext): boolean =>
      measurePageHeight(pageText, includeChapterTitle, block) <= pageHeight;

    const markdownDocument = currentChapter.markdownDocument;
    const markdownMeasureEl = markdownMeasureRef.current;
    if (markdownDocument && markdownMeasureEl) {
      const paginationEnd = getMarkdownPaginationEnd(markdownDocument);
      markdownMeasureEl.style.width = `${contentWidth}px`;
      markdownMeasureEl.style.fontSize = `${fontSize}px`;
      markdownMeasureEl.style.lineHeight = String(lineHeight);
      markdownMeasureEl.style.fontFamily = resolvedFontFamily;
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
              // 拆分测量带上块上下文：切片是否块首决定段首缩进，块类型决定渲染宽度
              const blockContext: SplitBlockContext = {
                kind: block.type as SplitBlockContext['kind'],
                listDepth: block.listDepth,
                atBlockStart: cursor === block.start,
              };
              if (fitsPage(remainingText, includeChapterTitle, blockContext)) break;

              let low = MIN_TEXT_PAGE_LENGTH;
              let high = Math.min(remainingText.length, pageLengthUpperBound);
              let best = MIN_TEXT_PAGE_LENGTH;
              while (low <= high) {
                const mid = Math.floor((low + high) / HALF_DIVISOR);
                if (fitsPage(remainingText.slice(0, mid), includeChapterTitle, blockContext)) {
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
        // 设备端自检：整章被收进一页说明测量高度不可信（个别 WebView 对屏外
        // 固定定位容器的高度返回异常），转投独立测量通道（scrollHeight）重切，
        // 宁可切分点不完美，不可整章一页导致后半章不可达
        const capacityChars = Math.max(
          SINGLE_PAGE_MIN_CAPACITY_CHARS,
          Math.floor((pageHeight / Math.max(1, fontSize * lineHeight)) * (contentWidth / Math.max(1, fontSize)))
        );
        if (pages.length > 1 || markdownDocument.text.length <= capacityChars * SINGLE_PAGE_SANITY_FACTOR) {
          applyPaginationResult(pages.length > 0 ? pages : ['']);
          return;
        }
      }
    }

    const pages = splitTextIntoPages(currentChapter.content, fitsPage, {
      maxPageLength: pageLengthUpperBound,
    });

    measureEl.removeAttribute('style');
    measureEl.replaceChildren();

    applyPaginationResult(pages);
  }, [
    currentChapter,
    textReadingMode,
    fontSize,
    lineHeight,
    resolvedFontFamily,
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
      // 延迟一帧确保 DOM 已渲染；再等字体就绪才测量：webfont（文学体 Literata 等
      // font-display: swap 字体）加载前后行宽不同，先测量后换字会让已切好的页面
      // 多出行数、页底文字被裁
      let cancelled = false;
      requestAnimationFrame(() => {
        // 字体就绪前不测量（webfont swap 会改变行宽）；个别 WebView ready 迟迟
        // 不 resolve，超时兜底先行分页，迟到时由 loadingdone 重排补齐
        const fontsReady = document.fonts?.ready ?? Promise.resolve();
        const timeout = new Promise<void>((resolve) => setTimeout(resolve, FONTS_READY_TIMEOUT_MS));
        Promise.race([fontsReady, timeout]).then(() => {
          if (!cancelled) void paginateMeasuredContent();
        });
      });
      return () => {
        cancelled = true;
      };
    } else if (textReadingMode !== 'scroll' && !currentChapter && !isLoading) {
      // 分页模式下但没有章节且不在加载中，说明章节为空
      setTextPages([]);
    }
  }, [textReadingMode, currentChapter, isLoading, paginateMeasuredContent]);

  // 窗口大小变化时重新分页
  useEffect(() => {
    if (textReadingMode === 'scroll') return;
    const handleResize = () => {
      // 旋转/分屏等布局变化重切页后，按字符偏移回到正在读的位置而不是弹回第 0 页
      preserveReadingPositionRef.current = true;
      requestAnimationFrame(() => void paginateMeasuredContent());
    };
    const handleMarkdownMediaLoad = () => {
      preserveReadingPositionRef.current = true;
      requestAnimationFrame(() => void paginateMeasuredContent());
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('markdown-media-load', handleMarkdownMediaLoad);
    // webfont 晚于首次分页完成加载（unicode-range 子集随翻页按需拉取）时重排；
    // 与现有分页一致时 applyPaginationResult 原地跳过，分页变化时按偏移保留位置
    const handleFontsLoadingDone = () => {
      preserveReadingPositionRef.current = true;
      requestAnimationFrame(() => void paginateMeasuredContent());
    };
    document.fonts?.addEventListener('loadingdone', handleFontsLoadingDone);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('markdown-media-load', handleMarkdownMediaLoad);
      document.fonts?.removeEventListener('loadingdone', handleFontsLoadingDone);
    };
  }, [textReadingMode, paginateMeasuredContent]);

  // 渲染自检（页容量自校准）：分页度量与真机渲染之间存在无法逐项消除的漂移
  // （字体回退行盒/textZoom/子像素取整）。当前页渲染后若文字越过裁切边界，
  // 增长页容量收缩量并重分页（按字符偏移保留位置），直到本机收敛到不裁字。
  useEffect(() => {
    if (textReadingMode === 'scroll' || !currentChapter || textPages.length === 0) return;
    const frame = requestAnimationFrame(() => {
      const content = document.querySelector('[data-reader-content]');
      const article = document.querySelector('[data-reader-article]');
      if (!content || !article) return;
      const articleRect = article.getBoundingClientRect();
      const padBottom = parseFloat(getComputedStyle(article).paddingBottom) || 0;
      const boundary = articleRect.bottom - padBottom;
      let overflow = 0;
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        if (rect.bottom > boundary) overflow = Math.max(overflow, rect.bottom - boundary);
      }
      if (overflow <= 1) return;
      const nextShrink = pageCapacityShrinkRef.current + Math.ceil(overflow) + CAPACITY_SHRINK_STEP_PX;
      if (nextShrink > MAX_CAPACITY_SHRINK_PX) return; // 已到上限，放弃继续收缩避免循环
      pageCapacityShrinkRef.current = nextShrink;
      preserveReadingPositionRef.current = true;
      void paginateMeasuredContent();
    });
    return () => cancelAnimationFrame(frame);
  }, [currentPageIndex, textPages, textReadingMode, currentChapter, paginateMeasuredContent]);

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

  // 翻书跟手交互（startFlip/completeFlip/snapbackFlip）已迁出至 useBookFlipAnimation hook

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
  }, [textReadingMode, goToNextPage, goToPrevPage]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 选区手势 ref 跨渲染稳定，列为依赖无意义
  }, [goToNextPage, goToPrevPage, toggleUi]);

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
    setIsAnnotationListOpen(false);

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

  // 文本选区检测已迁出至 useTextSelection hook（鼠标拖选/触摸长按/selectionchange 兜底）

  /** 选区归属章：以选区所在 article 的章为准（滚动模式多章同挂），取不到才回退当前章 */
  const resolveSelectionChapterIndex = useCallback(
    (sel: Pick<TextSelectionInfo, 'chapterIndex'>): number | null => {
      const candidate = sel.chapterIndex;
      if (candidate != null && candidate >= 0 && candidate < chapters.length) return candidate;
      return currentChapterIndex >= 0 && currentChapterIndex < chapters.length ? currentChapterIndex : null;
    },
    [chapters.length, currentChapterIndex]
  );

  // 保存批注：从选区信息构建批注（笔记可为空 = 纯划线）
  const buildAnnotationFromSelection = useCallback((
    sel: Pick<TextSelectionInfo, 'text' | 'contentOffset' | 'contentEndOffset' | 'chapterIndex'>,
    note: string,
    style: AnnotationStyle,
    tagIds: string[] = []
  ): Annotation | null => {
    const chapterIndex = resolveSelectionChapterIndex(sel);
    if (!bookId || chapterIndex == null) return null;
    const chapter = chapters[chapterIndex];
    if (!chapter) return null;

    // 章内源文本坐标系：渲染层写下的 data-source-start 锚点给出的偏移直接可用；
    // 取不到锚点（选区跨容器边界等）才回退到内容检索——绝不使用"看起来合理"的猜测值
    const content = chapter.content;
    const located = sel.contentOffset != null && sel.contentOffset >= 0
      ? {
          startOffset: sel.contentOffset,
          endOffset: sel.contentEndOffset != null && sel.contentEndOffset >= sel.contentOffset
            ? sel.contentEndOffset
            : sel.contentOffset + sel.text.length,
        }
      : (() => {
          const found = content.indexOf(sel.text);
          return found >= 0 ? { startOffset: found, endOffset: found + sel.text.length } : null;
        })();
    if (!located) return null;

    return {
      id: `ann-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END)}`,
      bookId,
      chapterIndex,
      chapterTitle: chapter.title,
      selectedText: sel.text,
      note,
      startOffset: located.startOffset,
      endOffset: located.endOffset,
      // 稳定锚点：以界面上真正选中的文本为针，与重挂时的比对口径一致，
      // 内容表示变化（EPUB 转换管线调整、换行归一）后仍可重定位
      anchor:
        located.endOffset > located.startOffset
          ? computeAnnotationAnchor(content, located.startOffset, located.endOffset, sel.text)
          : undefined,
      style,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [bookId, chapters, resolveSelectionChapterIndex]);

  const handleAnnotationSave = useCallback(async (note: string, style: AnnotationStyle, tagIds: string[] = []) => {
    if (!selectionPopup) return;
    const annotation = buildAnnotationFromSelection(selectionPopup, note, style, tagIds);
    if (!annotation) return;

    await annotationRepo.add(annotation);
    setAnnotations((prev) => [annotation, ...prev]);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  }, [selectionPopup, buildAnnotationFromSelection]);

  // 划词查词：短选区走词典（用户自配的 AI 服务），释义可收进生词本
  const handleVocabLookup = useCallback(async () => {
    const sel = selectionInfoRef.current;
    if (!sel) return;
    const word = sel.text.trim();
    if (!word || !bookId) return;
    const { settings: s } = useAppStore.getState();
    const config = { baseUrl: s.knowledgeAiUrl, apiKey: s.knowledgeAiKey, model: s.knowledgeAiModel };
    if (!isProviderConfigured(config)) {
      showToast(COPY.vocab.aiNotConfigured, () => navigate(ROUTES.SETTINGS), '去设置');
      return;
    }
    const chapterIndex = resolveSelectionChapterIndex(sel);
    const chapter = chapterIndex == null ? undefined : chapters[chapterIndex];
    if (chapterIndex == null || !chapter) return;
    const offset = sel.contentOffset != null && sel.contentOffset >= 0
      ? sel.contentOffset
      : chapter.content.indexOf(sel.text);
    const anchor = offset >= 0 ? offset : 0;
    const context = chapter.content
      .slice(
        Math.max(0, anchor - VOCAB_CONTEXT_BEFORE_CHARS),
        Math.min(chapter.content.length, anchor + word.length + VOCAB_CONTEXT_AFTER_CHARS)
      )
      .replace(/\s+/g, ' ')
      .trim();

    setSelectionInfo(null);
    window.getSelection()?.removeAllRanges();
    isSelectingTextRef.current = false;
    setVocabLookup({
      word,
      context,
      status: 'loading',
      position: {
        x: sel.position.x - SELECTION_POPUP_OFFSET_X,
        y: sel.position.y + SELECTION_POPUP_OFFSET_Y,
      },
      bookId,
      chapterIndex,
      chapterTitle: chapter.title,
    });

    try {
      const result = await lookupWord(config, { word, context, bookTitle: title });
      setVocabLookup((prev) => (prev ? { ...prev, status: 'done', result } : null));
    } catch (e) {
      setVocabLookup((prev) =>
        prev
          ? { ...prev, status: 'error', errorMessage: e instanceof Error ? e.message : COPY.vocab.lookupFailed }
          : null
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 选区/手势 ref 跨渲染稳定，列为依赖无意义
  }, [bookId, chapters, resolveSelectionChapterIndex, showToast, title]);

  // 收进生词本：按词去重（重查是更新不是新增），复习排期经稳定 id 得以保留
  const handleVocabSave = useCallback(async (result: VocabLookupResult) => {
    if (!vocabLookup) return;
    const id = vocabEntryId(vocabLookup.word);
    const existing = await vocabRepo.get(id);
    const now = new Date();
    const entry: VocabEntry = {
      id,
      word: vocabLookup.word,
      pronunciation: result.pronunciation,
      definition: result.definition,
      note: result.note,
      context: vocabLookup.context,
      bookId: vocabLookup.bookId,
      chapterIndex: vocabLookup.chapterIndex,
      chapterTitle: vocabLookup.chapterTitle,
      lookupCount: (existing?.lookupCount ?? 0) + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await vocabRepo.save(entry);
    setVocabLookup(null);
    showToast(COPY.vocab.savedToast);
  }, [vocabLookup, showToast]);

  // 划句翻译：长选区走译文（与查词互斥分流），存为批注走批注管线（原文+译文）
  const handleTranslate = useCallback(async () => {
    const sel = selectionInfoRef.current;
    if (!sel) return;
    const text = sel.text.trim();
    if (!text) return;
    const { settings: s } = useAppStore.getState();
    const config = { baseUrl: s.knowledgeAiUrl, apiKey: s.knowledgeAiKey, model: s.knowledgeAiModel };
    if (!isProviderConfigured(config)) {
      showToast(COPY.translate.aiNotConfigured, () => navigate(ROUTES.SETTINGS), '去设置');
      return;
    }
    const position = {
      x: sel.position.x - SELECTION_POPUP_OFFSET_X,
      y: sel.position.y + SELECTION_POPUP_OFFSET_Y,
    };
    setSelectionInfo(null);
    window.getSelection()?.removeAllRanges();
    isSelectingTextRef.current = false;
    setTranslateState({ text, status: 'loading', position, selection: sel });
    try {
      const translation = await translateSelection(config, { text, bookTitle: title });
      setTranslateState((prev) => (prev ? { ...prev, status: 'done', translation } : null));
    } catch (e) {
      setTranslateState((prev) =>
        prev
          ? { ...prev, status: 'error', errorMessage: e instanceof Error ? e.message : COPY.translate.failed }
          : null
      );
    }
  }, [showToast, title, selectionInfoRef, isSelectingTextRef, setSelectionInfo, navigate]);

  // 译文存为批注：原文划线 + 笔记即译文（进摘抄墙与复习队列）
  const handleTranslateSave = useCallback(
    (translation: string) => {
      if (!translateState) return;
      const annotation = buildAnnotationFromSelection(translateState.selection, translation, 'highlight', []);
      if (annotation) {
        void annotationRepo.add(annotation).then(() => {
          setAnnotations((prev) => [annotation, ...prev]);
        });
      }
      setTranslateState(null);
      showToast(COPY.translate.savedToast);
    },
    [translateState, buildAnnotationFromSelection, showToast]
  );

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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 选区/手势 ref 跨渲染稳定，列为依赖无意义
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 章节表 ref 跨渲染稳定，列为依赖无意义
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

  // 知识库原文直达（图谱人物/关系带 ?goto=chapterIndex,ratio）：同走定位原语，一次导航只消费一次
  const jumpToChapterRatioRef = useRef(jumpToChapterRatio);
  jumpToChapterRatioRef.current = jumpToChapterRatio;
  const gotoDoneRef = useRef<string | null>(null);
  useEffect(() => {
    if (!gotoTarget || isLoading || chapters.length === 0) return;
    if (gotoTarget.chapterIndex >= chapters.length) return;
    const key = `${gotoTarget.chapterIndex},${gotoTarget.ratio}`;
    if (gotoDoneRef.current === key) return;
    gotoDoneRef.current = key;
    jumpToChapterRatioRef.current(gotoTarget.chapterIndex, gotoTarget.ratio);
  }, [gotoTarget, isLoading, chapters.length]);

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
  // 听书范围与批注重叠时按段嵌套（听书 span 包在批注 mark 外层），不会丢文本。
  //
  // sourceBase = 本段文本在**章节源文本**中的起点（滚动模式为 0，分页模式为 pageStartOffset）。
  // 每个分段都写下 data-source-start，使纯文本/TXT 与 Markdown 共用同一套偏移锚点契约——
  // 选区 → 章内偏移的还原不再有"Markdown 走锚点、纯文本走 document.querySelector 猜测"两套规则。
  const renderTextWithRanges = (
    text: string,
    annotations: Annotation[],
    speech: { start: number; end: number } | null,
    sourceBase: number = TEXT_PAGE_RESET_INDEX
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
      let node: React.ReactNode = (
        <span key={`src-${segStart}`} data-source-start={sourceBase + segStart}>{segmentText}</span>
      );
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
            {/* 包住带锚点的 span 而不是替换它：批注命中段同样必须留 [data-source-start]，
                否则在已高亮的文字上再选词会取不到偏移（与 MarkdownReaderContent 的包法一致） */}
            {node}
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

  // 渲染带批注高亮与听书跟读高亮的文本（滚动模式：章节全文坐标系，sourceBase = 0）
  const renderContentWithAnnotations = (content: string, chapterIdx: number) => {
    const chapterAnns = currentChapterAnnotations.filter(
      (a) => a.chapterIndex === chapterIdx && a.startOffset >= 0 && a.endOffset > a.startOffset
    ).sort((a, b) => a.startOffset - b.startOffset);
    // 无批注时也走分段渲染：锚点必须常驻，否则"先选后批"的第一步就没有坐标系可用
    return renderTextWithRanges(content, chapterAnns, speechRange, TEXT_PAGE_RESET_INDEX);
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
    // 页内偏移一律叠加 pageStartOffset 落成"章内偏移"，锚点因此与滚动模式同坐标系
    return renderTextWithRanges(pageContent, pageAnns, pageSpeech, pageStartOffset);
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
          ) : (
            renderTextWithRanges(content, chapterAnns, chapterSpeechRange, TEXT_PAGE_RESET_INDEX)
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
          data-chapter-index={currentChapterIndex}
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
            data-chapter-index={currentChapterIndex}
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

      {/* 阅读进度指示器（页末右下） */}
      <TextProgressHint
        visible={isProgressHintVisible || isProgressDragging}
        overallPercent={overallReadingPercent}
        estimatedTimeLeft={estimatedTimeLeft}
      />

      {/* 音色包下载进度（页末左侧，与右侧阅读进度指示互不遮挡）；-2 = 原生通道兜底下载，无细粒度百分比 */}
      {neuralDownloadPercent != null && (
        <div
          className="fixed bottom-gutter left-margin-mobile z-toast pointer-events-none mb-safe animate-fade-in"
          role="status"
          aria-label={neuralDownloadPercent === PROGRESS_INDETERMINATE ? '语音包下载中' : `语音包下载中 ${neuralDownloadPercent}%`}
        >
          <div className="bg-on-surface/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-label-sm text-surface animate-spin">progress_activity</span>
            <span className="font-label text-label-sm text-surface tabular-nums">
              {neuralDownloadPercent === PROGRESS_INDETERMINATE ? '语音包下载中' : `语音包下载 ${neuralDownloadPercent}%`}
            </span>
          </div>
        </div>
      )}

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
          neuralDownloadPercent={neuralDownloadPercent}
          ttsServerUrl={settings.ttsServerUrl}
          ttsServerModel={settings.ttsServerModel}
          ttsServerVoice={settings.ttsServerVoice}
          onTtsEngineChange={handleTtsEngineChange}
          onTtsServerFieldChange={handleTtsServerFieldChange}
          onClose={() => setIsBottomBarVisible(false)}
        />
      )}

      {toast && <UndoToast message={toast.message} onUndo={toast.undo} actionLabel={toast.actionLabel} />}

      {/* 神经网络音色包首次下载确认 */}
      <ConfirmDialog
        isOpen={pendingNeuralConfirm}
        title="下载离线语音包"
        message="神经网络语音需先下载约 60-80MB 的中文音色包（仅下载一次，之后可离线使用）。是否继续？"
        confirmLabel="下载并启用"
        onConfirm={() => {
          setPendingNeuralConfirm(false);
          useAppStore.getState().updateSettings({ ttsEngine: 'neural' });
          showToast('正在后台下载离线语音包，期间朗读先走系统语音');
          void preloadPiperModel()
            .then(() => showToast('离线语音包已就绪，之后可离线朗读'))
            .catch(() => showToast('语音包下载失败，将在下次朗读时自动重试'));
        }}
        onCancel={() => {
          setPendingNeuralConfirm(false);
          useAppStore.getState().updateSettings({ ttsModelPromptDismissed: true });
        }}
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

      {/* 批注/书签列表面板（tab 切换） */}
      {isAnnotationListOpen && (
        <AnnotationList
          annotations={annotations}
          bookTitle={title}
          bookmarks={bookmarks}
          onBookmarkSelect={handleBookmarkSelect}
          onBookmarkDelete={handleBookmarkDelete}
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

      {/* 浮动动作条：选中后一键划线、复制、查词/翻译或打开批注弹窗 */}
      {selectionInfo && !selectionPopup && !vocabLookup && !translateState && (
        <SelectionFloatingButton
          position={selectionInfo.position}
          selectionRect={selectionInfo.rect}
          onHighlight={handleQuickHighlight}
          onLookup={
            selectionInfo.text.trim().length <= VOCAB_LOOKUP_MAX_CHARS
              ? () => void handleVocabLookup()
              : undefined
          }
          onTranslate={
            selectionInfo.text.trim().length > VOCAB_LOOKUP_MAX_CHARS
              ? () => void handleTranslate()
              : undefined
          }
          onCopy={() => {
            const text = selectionInfo.text;
            setSelectionInfo(null);
            window.getSelection()?.removeAllRanges();
            isSelectingTextRef.current = false;
            void copyTextToClipboard(text).then((copied) => {
              showToast(copied ? COPY.annotation.copiedToast : COPY.annotation.copyFailedToast);
            });
          }}
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
              chapterIndex: selectionInfo.chapterIndex,
            });
            setSelectionInfo(null);
          }}
          onCancel={() => {
            // click 到达时 Chromium 已把原生选区折叠为空，幽灵文本只能取自动作条状态
            const ghostText = selectionInfo.text;
            setSelectionInfo(null);
            window.getSelection()?.removeAllRanges();
            isSelectingTextRef.current = false;
            // 二段清扫：Chromium 对原生选区的 tap-collapse 会原地回滚，延迟补清；
            // 文本守卫避免误杀延时窗口内的新选区（重新长按至少需 500ms，物理上到不了 220ms）
            window.setTimeout(() => {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed && sel.toString().trim() === ghostText) sel.removeAllRanges();
            }, SELECTION_GHOST_SWEEP_DELAY_MS);
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

      {/* 划词查词弹层：翻词典 → 收进生词本 */}
      {vocabLookup && (
        <VocabLookupPopup
          state={vocabLookup}
          position={vocabLookup.position}
          onSave={(result) => void handleVocabSave(result)}
          onClose={() => setVocabLookup(null)}
        />
      )}

      {/* 划句翻译弹层：译文 → 复制 / 存为批注 */}
      {translateState && (
        <TranslatePopup
          state={translateState}
          position={translateState.position}
          onSaveAsNote={handleTranslateSave}
          onClose={() => setTranslateState(null)}
        />
      )}
    </div>
  );
};
