import React, { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JSZip from 'jszip';

import { useLibraryStore } from '@/stores/useLibraryStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { useAppStore } from '@/stores/useAppStore';
import { bookFileRepo } from '@/services/storage/bookFileRepo';
import { bookmarkRepo } from '@/services/storage/bookmarkRepo';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { cn } from '@/utils/cn';
import { TextReaderBottomBar } from '@/components/molecules/TextReaderBottomBar';
import { ChapterDrawer } from '@/components/molecules/ChapterDrawer';
import { BookmarkPanel } from '@/components/molecules/BookmarkPanel';
import { AnnotationPopup } from '@/components/molecules/AnnotationPopup';
import { AnnotationList } from '@/components/molecules/AnnotationList';
import { splitTextIntoChapters, cleanHtmlToText } from '@/services/parsers/utils';
import type { Bookmark, Annotation, AnnotationStyle, Chapter } from '@/types';

const STATS_RECORD_INTERVAL = 60000;
const MS_PER_MINUTE = 60000;
const PROGRESS_SAVE_DEBOUNCE = 500;
const AUTO_SCROLL_INTERVAL = 50;
const SWIPE_THRESHOLD = 50;
const TEXT_SCROLL_END_THRESHOLD = 0.995;
const TEXT_SCROLL_END_EPSILON_PX = 2;
const TEXT_READER_ARTICLE_MAX_WIDTH = 680;
const TEXT_READER_HORIZONTAL_PADDING = 48;
const TEXT_READER_MOBILE_VERTICAL_PADDING = 64;
const TEXT_READER_DESKTOP_VERTICAL_PADDING = 96;
const TEXT_READER_DESKTOP_MEDIA_QUERY = '(min-width: 768px)';
const TEXT_READER_COLUMNS_LG_MEDIA_QUERY = '(min-width: 1024px)';
const TEXT_READER_COLUMNS_MEDIA_QUERY = '(orientation: landscape)';
const TEXT_PAGE_MEASURE_SAFETY_PX = 24;
const TEXT_COLUMNS_MOBILE_INLINE_PADDING = 32;
const TEXT_COLUMNS_LG_INLINE_PADDING = 64;
const TEXT_COLUMNS_MOBILE_VERTICAL_PADDING = 80;
const TEXT_COLUMNS_LG_VERTICAL_PADDING = 112;
const TEXT_COLUMNS_MOBILE_ARTICLE_INLINE_PADDING = 48;
const TEXT_COLUMNS_LG_ARTICLE_INLINE_PADDING = 80;
const TEXT_PAGE_BREAK_SEARCH_RATIO = 0.25;
const TEXT_PAGE_BREAK_SEARCH_MIN = 32;
const TEXT_PAGE_BREAK_SEARCH_MAX = 120;
const MIN_TEXT_PAGE_LENGTH = 1;
const EMPTY_TEXT_PAGE_INDEX = 0;
const TEXT_PAGE_RESET_INDEX = 0;
const TEXT_COLUMNS_PAGE_STEP = 2;
const TEXT_PAGE_TITLE_MARGIN_BOTTOM = 32;
const TEXT_PAGE_TITLE_FONT_WEIGHT = '700';
const TEXT_PAGE_TITLE_OPACITY = '0.8';
const TEXT_PAGE_BREAK_CHARS = new Set([
  '\n',
  '\r',
  '\t',
  ' ',
  '\u3000',
  '\u3002',
  '\uff0c',
  '\uff01',
  '\uff1f',
  '\uff1b',
  '\uff1a',
  '\u3001',
  '.',
  ',',
  '!',
  '?',
  ';',
  ':',
]);
const TEXT_CHAPTER_END_PROMPT_LABELS = {
  title: '\u5df2\u8bfb\u5b8c\u672c\u7ae0',
  action: '\u7ee7\u7eed\u4e0b\u4e00\u7ae0',
} as const;
const NORMALIZE_CHAPTER_TITLE_PATTERN = /[\s\u3000:：,，.。!！?？;；、\-—_《》<>[\]【】()（）"'“”‘’]/g;

export interface TextChapter {
  id: string;
  title: string;
  content: string;
}

interface TextPageMetrics {
  contentWidth: number;
  pageHeight: number;
}

const getTextPageMetrics = (isColumnsLayoutActive: boolean): TextPageMetrics => {
  if (isColumnsLayoutActive) {
    const isLargeViewport = window.matchMedia(TEXT_READER_COLUMNS_LG_MEDIA_QUERY).matches;
    const outerInlinePadding = isLargeViewport
      ? TEXT_COLUMNS_LG_INLINE_PADDING
      : TEXT_COLUMNS_MOBILE_INLINE_PADDING;
    const verticalPadding = isLargeViewport
      ? TEXT_COLUMNS_LG_VERTICAL_PADDING
      : TEXT_COLUMNS_MOBILE_VERTICAL_PADDING;
    const articleInlinePadding = isLargeViewport
      ? TEXT_COLUMNS_LG_ARTICLE_INLINE_PADDING
      : TEXT_COLUMNS_MOBILE_ARTICLE_INLINE_PADDING;
    const spreadContentWidth = window.innerWidth - outerInlinePadding;

    return {
      contentWidth: Math.floor((spreadContentWidth / TEXT_COLUMNS_PAGE_STEP) - articleInlinePadding),
      pageHeight: window.innerHeight - verticalPadding - TEXT_PAGE_MEASURE_SAFETY_PX,
    };
  }

  const verticalPadding = window.matchMedia(TEXT_READER_DESKTOP_MEDIA_QUERY).matches
    ? TEXT_READER_DESKTOP_VERTICAL_PADDING
    : TEXT_READER_MOBILE_VERTICAL_PADDING;
  const articleWidth = Math.min(TEXT_READER_ARTICLE_MAX_WIDTH, window.innerWidth);

  return {
    contentWidth: articleWidth - TEXT_READER_HORIZONTAL_PADDING,
    pageHeight: window.innerHeight - (verticalPadding * 2) - TEXT_PAGE_MEASURE_SAFETY_PX,
  };
};

const resolveTextChapterIndex = (
  textChapters: TextChapter[],
  bookChapters: Chapter[] | undefined,
  bookId: string,
  chapterId: string
): number => {
  const textChapterIndex = textChapters.findIndex((chapter) => chapter.id === chapterId);
  if (textChapterIndex >= 0) {
    return textChapterIndex;
  }

  const targetBookChapter = bookChapters?.find((chapter) => chapter.id === chapterId);
  const normalizedTargetTitle = targetBookChapter
    ? targetBookChapter.title.trim().toLowerCase().replace(NORMALIZE_CHAPTER_TITLE_PATTERN, '')
    : '';
  if (normalizedTargetTitle) {
    const titleMatchedIndex = textChapters.findIndex((chapter) =>
      chapter.title.trim().toLowerCase().replace(NORMALIZE_CHAPTER_TITLE_PATTERN, '') === normalizedTargetTitle
    );
    if (titleMatchedIndex >= 0) {
      return titleMatchedIndex;
    }
  }

  const legacyChapterPrefix = `${bookId}-ch`;
  if (chapterId.startsWith(legacyChapterPrefix)) {
    const chapterNumber = Number(chapterId.slice(legacyChapterPrefix.length));
    const textChapterIdIndex = textChapters.findIndex((chapter) => chapter.id === `ch${chapterNumber}`);
    if (textChapterIdIndex >= 0) {
      return textChapterIdIndex;
    }

    const index = chapterNumber - 1;
    if (Number.isInteger(index) && index >= 0 && index < textChapters.length) {
      return index;
    }
  }

  const bookChapterIndex = bookChapters?.findIndex((chapter) => chapter.id === chapterId) ?? -1;
  if (bookChapterIndex >= 0 && bookChapterIndex < textChapters.length) {
    return bookChapterIndex;
  }

  return -1;
};

/**
 * 从 bookFileRepo 加载文本内容。
 * - text/plain blob → 直接读取（使用共享的章节拆分函数）
 * - application/epub+zip blob → 提取 XHTML/HTML 章节
 */
async function loadTextContent(bookId: string): Promise<{ chapters: TextChapter[]; isEpub: boolean }> {
  const blob = await bookFileRepo.get(bookId);
  if (!blob) return { chapters: [], isEpub: false };

  const isEpub = blob.type === 'application/epub+zip';

  if (!isEpub) {
    // 纯文本：使用共享的章节拆分函数
    const text = await blob.text();
    const parsedChapters = splitTextIntoChapters(text);
    const chapters = parsedChapters.map((ch, idx) => ({
      id: `ch${idx + 1}`,
      title: ch.title || `第${idx + 1}章`,
      content: ch.content,
    }));
    return { chapters, isEpub: false };
  }

  // EPUB：提取可读文本并保留章节结构
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 找到 OPF 获取阅读顺序
    const containerXml = await zip.file('META-INF/container.xml')?.async('string');
    if (!containerXml) return { chapters: [{ id: 'ch1', title: '正文', content: '无法解析 EPUB 包结构' }], isEpub: true };

    const opfMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
    if (!opfMatch) return { chapters: [{ id: 'ch1', title: '正文', content: '无法找到 OPF 文档' }], isEpub: true };

    const opfPath = opfMatch[1];
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    const opfContent = await zip.file(opfPath)?.async('string');
    if (!opfContent) return { chapters: [{ id: 'ch1', title: '正文', content: '无法读取 OPF 内容' }], isEpub: true };

    // 从 spine 提取阅读顺序
    const spineMatches = [...opfContent.matchAll(/<itemref[^>]+idref="([^"]+)"/g)];
    const spineIds = spineMatches.map(m => m[1]);

    // 从 manifest 映射 id → href（支持任意属性顺序）
    const manifestMap = new Map<string, string>();
    const itemMatches = [...opfContent.matchAll(/<item\s+([^>]+)>/g)];
    for (const m of itemMatches) {
      const attrs = m[1];
      const idMatch = attrs.match(/id="([^"]+)"/);
      const hrefMatch = attrs.match(/href="([^"]+)"/);
      if (idMatch && hrefMatch) {
        manifestMap.set(idMatch[1], hrefMatch[1]);
      }
    }

    // 从 ncx 获取章节标题
    const titleMap = new Map<string, string>();
    const ncxMatch = opfContent.match(/<item[^>]+href="([^"]+\.ncx)"[^>]+/i);
    if (ncxMatch) {
      const ncxPath = opfDir + ncxMatch[1];
      const ncxContent = await zip.file(ncxPath)?.async('string');
      if (ncxContent) {
        const navPointMatches = [...ncxContent.matchAll(/<navPoint[^>]*>[\s\S]*?<navLabel>\s*<text>([^<]+)<\/text>[\s\S]*?<content\s+src="([^"]+)"/g)];
        for (const m of navPointMatches) {
          const src = m[2].split('#')[0];
          titleMap.set(src, m[1].trim());
        }
      }
    }

    // 按 spine 顺序读取章节内容
    const chapters: TextChapter[] = [];
    let chapterIndex = 0;
    
    for (const spineId of spineIds) {
      const href = manifestMap.get(spineId);
      if (!href) continue;
      
      const filePath = opfDir + href;
      const html = await zip.file(filePath)?.async('string');
      if (!html) continue;
      
      // 使用共享的 HTML 清理函数
      const text = cleanHtmlToText(html);
      if (text) {
        chapterIndex++;
        const title = titleMap.get(href) || `第${chapterIndex}章`;
        chapters.push({ id: `ch${chapterIndex}`, title, content: text });
      }
    }

    if (chapters.length === 0) {
      return { chapters: [{ id: 'ch1', title: '正文', content: 'EPUB 内容为空' }], isEpub: true };
    }

    return { chapters, isEpub: true };
  } catch {
    return { chapters: [{ id: 'ch1', title: '正文', content: 'EPUB 解析失败' }], isEpub: true };
  }
}

export const TextReaderPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const readingStartTimeRef = useRef<number>(Date.now());
  const lastStatsRecordRef = useRef<number>(Date.now());
  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const uiAutoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoAdvancedChapterRef = useRef<number | null>(null);

  const [chapters, setChapters] = useState<TextChapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [uiVisible, setUiVisible] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(false);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isEpub, setIsEpub] = useState(false);
  const [localFontSize, setLocalFontSize] = useState<number | null>(null);
  const [localLineHeight, setLocalLineHeight] = useState<number | null>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<string>('');
  const [isChapterEndPromptVisible, setIsChapterEndPromptVisible] = useState(false);
  const [isProgressDragging, setIsProgressDragging] = useState(false);
  const [dragPercent, setDragPercent] = useState(0);
  const [isLandscapeViewport, setIsLandscapeViewport] = useState(() =>
    window.matchMedia(TEXT_READER_COLUMNS_MEDIA_QUERY).matches
  );

  // 分页模式状态
  const [textPages, setTextPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [previousPageIndex, setPreviousPageIndex] = useState<number | null>(null);
  const [pageDirection, setPageDirection] = useState<'left' | 'right' | null>(null);
  const [isPageAnimating, setIsPageAnimating] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0); // 翻书跟手进度 0~1
  const measureRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const flipPageRef = useRef<HTMLDivElement>(null); // 翻书交互页面容器

  // 书签 & 批注状态
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isBookmarkPanelOpen, setIsBookmarkPanelOpen] = useState(false);
  const [isAnnotationListOpen, setIsAnnotationListOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{ text: string; position: { x: number; y: number }; contentOffset?: number } | null>(null);
  const selectionPopupRef = useRef(selectionPopup);
  selectionPopupRef.current = selectionPopup;
  // 浮动批注按钮：选中文本后先显示一个小按钮，点击后再弹出批注编辑窗
  const [selectionInfo, setSelectionInfo] = useState<{ text: string; position: { x: number; y: number }; contentOffset?: number } | null>(null);
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
  // 分页完成后跳过重置到第 0 页（用于跨章节导航时保留目标页）
  const skipNextPageResetRef = useRef(false);
  // 跨章节分页导航的定时器（防止重复触发时旧定时器干扰）
  const pendingNavTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清理导航定时器，避免在已卸载组件上执行状态更新
  useEffect(() => {
    return () => {
      if (pendingNavTimerRef.current) clearTimeout(pendingNavTimerRef.current);
    };
  }, []);

  const { getBookById, updateProgress } = useLibraryStore();
  const { addReadingSession } = useStatsStore();
  const { settings } = useAppStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia(TEXT_READER_COLUMNS_MEDIA_QUERY);
    const handleChange = () => setIsLandscapeViewport(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 用 ref 追踪所有阅读设置最新值，供退出时统一保存
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

  const fontSize = localFontSize ?? settings.fontSize;
  const lineHeight = localLineHeight ?? settings.textLineHeight;
  const readingTheme = settings.readingTheme;
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
  const isColumnsLayoutActive = isColumnsReadingMode && isLandscapeViewport;
  const textPageStep = isColumnsLayoutActive ? TEXT_COLUMNS_PAGE_STEP : 1;

  const book = bookId ? getBookById(bookId) : undefined;
  const title = book?.title ?? '未知书籍';
  const currentChapter = chapters[currentChapterIndex];
  const hasMultipleChapters = chapters.length > 1;

  // 字体映射
  const resolvedFontFamily = useMemo(() => {
    const fontMap: Record<string, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: '"Noto Serif SC", "Source Han Serif SC", "STSong", serif',
      kaiti: '"STKaiti", "KaiTi", "楷体", serif',
      sans: '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif',
    };
    return fontMap[textFontFamily] || fontMap.serif;
  }, [textFontFamily]);

  // 阅读主题样式
  const themeStyles = useMemo(() => {
    const themes: Record<string, { bg: string; color: string }> = {
      light: { bg: '#ffffff', color: '#1a1a1a' },
      green: { bg: '#c7edcc', color: '#2d3a2d' },
      sepia: { bg: '#f5e6c8', color: '#5b4636' },
      dark: { bg: '#1a1a1a', color: '#b8b8b8' },
    };
    return themes[readingTheme] || themes.light;
  }, [readingTheme]);

  const displayFilter = useMemo(() => {
    const filters: string[] = [];
    if (brightness < 100) filters.push(`brightness(${brightness / 100})`);
    if (colorTemperature > 0) {
      const sepiaValue = colorTemperature / 100 * 0.4;
      filters.push(`sepia(${sepiaValue})`);
    }
    return filters.length > 0 ? filters.join(' ') : undefined;
  }, [brightness, colorTemperature]);

  // 加载文本内容
  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    setIsLoading(true);
    loadTextContent(bookId).then(({ chapters: loadedChapters, isEpub: epub }) => {
      if (cancelled) return;
      setChapters(loadedChapters);
      setIsEpub(epub);
      setIsLoading(false);
      // 加载完成后自动显示 UI 3 秒
      setUiVisible(true);
      if (uiAutoHideTimerRef.current) clearTimeout(uiAutoHideTimerRef.current);
      uiAutoHideTimerRef.current = setTimeout(() => {
        setUiVisible(false);
        uiAutoHideTimerRef.current = null;
      }, 3000);
    }).catch(() => {
      if (cancelled) return;
      setChapters([{ id: 'ch1', title: '正文', content: '加载失败' }]);
      setIsLoading(false);
    });
    return () => { cancelled = true };
  }, [bookId]);

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

    // 从 locator 解析文本阅读定位信息
    let locatorData: { chapterIndex?: number; pageIndex?: number; scrollRatio?: number } | null = null;
    if (progress.locator) {
      try { locatorData = JSON.parse(progress.locator); } catch { /* ignore */ }
    }

    const restoredChapterIndex = locatorData?.chapterIndex ?? 0;

    if (textReadingMode === 'scroll') {
      // 滚动模式：恢复章节 + 滚动位置
      if (restoredChapterIndex > 0 && restoredChapterIndex < chapters.length) {
        setCurrentChapterIndex(restoredChapterIndex);
      }
      const ratio = locatorData?.scrollRatio ?? progress.pageScrollRatio ?? 0;
      if (ratio > 0) {
        // 延迟等待 DOM 渲染完成
        requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (container) {
            const targetScroll = ratio * (container.scrollHeight - container.clientHeight);
            container.scrollTop = targetScroll;
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
        // 需要等待分页引擎重新计算后再设置页索引
        // 使用 ref 获取最新的 textPages.length，避免闭包捕获旧值
        const timer = setTimeout(() => {
          const totalPages = textPagesLengthRef.current;
          // 将页索引限制在有效范围内，避免越界导致空白页
          const safeIndex = totalPages > 0 ? Math.min(pageIndex, totalPages - 1) : 0;
          if (safeIndex > 0) {
            setCurrentPageIndex(safeIndex);
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [bookId, chapterId, isLoading, textReadingMode, chapters, book?.chapters]);

  // 统计阅读时间
  useEffect(() => {
    if (!bookId) return;
    readingStartTimeRef.current = Date.now();
    lastStatsRecordRef.current = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastStatsRecordRef.current;
      if (elapsed >= MS_PER_MINUTE) {
        const minutes = Math.round(elapsed / MS_PER_MINUTE);
        addReadingSession(bookId, minutes);
        lastStatsRecordRef.current = now;
      }
    }, STATS_RECORD_INTERVAL);

    return () => {
      clearInterval(timer);
      // 保存最后一小段阅读时间
      const elapsedSinceLastRecord = Date.now() - lastStatsRecordRef.current;
      if (elapsedSinceLastRecord >= MS_PER_MINUTE * 0.5) {
        addReadingSession(bookId, Math.max(1, Math.round(elapsedSinceLastRecord / MS_PER_MINUTE)));
      }
    };
  }, [bookId, addReadingSession]);

  // 保存阅读进度的通用函数（使用 ref 避免循环依赖）
  const bookRef = useRef(book);
  bookRef.current = book;
  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;
  const textPagesLengthRef = useRef(textPages.length);
  textPagesLengthRef.current = textPages.length;

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
    updateProgress(bookId, {
      bookId,
      chapterId,
      page: pageIdx != null ? pageIdx + 1 : 1,
      pageScrollRatio: scrollRat,
      chapterScrollRatio: ratio,
      readingMode: 'vertical',
      totalPages: tpLen || 1,
      percentage: ratio * 100,
      globalPageIndex: chapterIdx,
      totalImages: chs.length,
      locator,
    });
  }, [bookId, updateProgress]);

  // 进度条拖动
  const handleProgressSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setDragPercent(val);
  }, []);

  const goToPageRef = useRef<((index: number, direction: 'left' | 'right') => void) | null>(null);

  const handleProgressSliderCommit = useCallback(() => {
    setIsProgressDragging(false);
    const ratio = dragPercent / 100;

    if (textReadingMode === 'scroll') {
      const container = scrollContainerRef.current;
      if (container) {
        const scrollable = container.scrollHeight - container.clientHeight;
        container.scrollTo({ top: ratio * scrollable, behavior: 'smooth' });
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
  }, [dragPercent, textReadingMode, currentChapterIndex, textPages.length, currentPageIndex, saveTextProgress]);

  // 滚动进度追踪
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !bookId) return;
    const scrollable = container.scrollHeight - container.clientHeight;
    if (scrollable <= 0) return;
    const ratio = container.scrollTop / scrollable;
    if (!isProgressDragging) {
      setScrollPercent(Math.round(ratio * 100));
    }

    const hasNextChapter = currentChapterIndex < chapters.length - 1;
    const isAtChapterEnd = ratio >= TEXT_SCROLL_END_THRESHOLD ||
      container.scrollTop + container.clientHeight >= container.scrollHeight - TEXT_SCROLL_END_EPSILON_PX;
    if (hasNextChapter && isAtChapterEnd) {
      if (autoAdvanceTextChapter) {
        if (autoAdvancedChapterRef.current !== currentChapterIndex) {
          autoAdvancedChapterRef.current = currentChapterIndex;
          setIsChapterEndPromptVisible(false);
          setCurrentChapterIndex(currentChapterIndex + 1);
          requestAnimationFrame(() => {
            scrollContainerRef.current?.scrollTo(0, 0);
            setScrollPercent(0);
          });
        }
      } else {
        setIsChapterEndPromptVisible(true);
      }
    } else {
      setIsChapterEndPromptVisible(false);
      if (!isAtChapterEnd) {
        autoAdvancedChapterRef.current = null;
      }
    }

    // 防抖保存进度
    if (progressSaveTimerRef.current) clearTimeout(progressSaveTimerRef.current);
    progressSaveTimerRef.current = setTimeout(() => {
      saveTextProgress(currentChapterIndex, undefined, ratio);
    }, PROGRESS_SAVE_DEBOUNCE);
  }, [bookId, currentChapterIndex, chapters.length, autoAdvanceTextChapter, saveTextProgress, isProgressDragging]);

  // 离开时保存最终进度 + 清理 UI 定时器 + 持久化阅读设置
  useEffect(() => {
    return () => {
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
          const container = scrollContainerRef.current;
          if (container) {
            const scrollable = container.scrollHeight - container.clientHeight;
            scrollRatio = scrollable > 0 ? container.scrollTop / scrollable : 0;
          }
          ratio = scrollRatio ?? scrollPercentRef.current / 100;
        } else {
          // 分页/翻书模式
          ratio = tpLen > 0 ? (pageIdx + 1) / tpLen : 0;
        }

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
          percentage: ratio * 100,
          globalPageIndex: chapterIdx,
          totalImages: chs.length,
          locator,
        });
      }
    };
  }, []);

  // 点击切换 UI
  const toggleUi = useCallback(() => {
    // 取消待执行的自动隐藏定时器，避免用户操作后被意外隐藏
    if (uiAutoHideTimerRef.current) {
      clearTimeout(uiAutoHideTimerRef.current);
      uiAutoHideTimerRef.current = null;
    }
    setUiVisible(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 屏幕常亮
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Wake Lock 不可用时静默忽略
      }
    };
    requestWakeLock();
    return () => {
      wakeLockRef.current?.release?.();
    };
  }, []);

  // 自动滚动
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollTimerRef.current = setInterval(() => {
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop += autoScrollSpeed;
        }
      }, AUTO_SCROLL_INTERVAL);
    } else {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    }
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isAutoScrolling, autoScrollSpeed]);

  // 计算预计剩余时间
  useEffect(() => {
    if (!currentChapter || scrollPercent === 0) {
      setEstimatedTimeLeft('');
      return;
    }
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const totalChars = currentChapter.content.length;
    const readChars = Math.round(totalChars * scrollPercent / 100);
    const remainingChars = totalChars - readChars;
    // 假设平均阅读速度 500 字/分钟
    const remainingMinutes = Math.ceil(remainingChars / 500);
    
    if (remainingMinutes < 60) {
      setEstimatedTimeLeft(`${remainingMinutes}分钟`);
    } else {
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      setEstimatedTimeLeft(`${hours}小时${mins}分钟`);
    }
  }, [scrollPercent, currentChapter]);

  // 章节切换
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index);
      scrollContainerRef.current?.scrollTo(0, 0);
      setScrollPercent(0);
      setIsChapterEndPromptVisible(false);
      autoAdvancedChapterRef.current = null;
      setIsChapterDrawerOpen(false);
    }
  }, [chapters.length]);

  const goToNextChapter = useCallback(() => {
    goToChapter(currentChapterIndex + 1);
  }, [currentChapterIndex, goToChapter]);

  const goToPrevChapter = useCallback(() => {
    goToChapter(currentChapterIndex - 1);
  }, [currentChapterIndex, goToChapter]);

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
    if (Date.now() - lastTouchEndTimeRef.current < 500) {
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
    if (x > width * 0.25 && x < width * 0.75 && y > height * 0.25 && y < height * 0.75) {
      toggleUi();
      return;
    }

    // 上方/左方区域向上翻页
    if (y < height * 0.25 || x < width * 0.25) {
      scrollContainerRef.current?.scrollBy({ top: -height * 0.8, behavior: 'smooth' });
      return;
    }

    // 下方/右方区域向下翻页
    if (y > height * 0.75 || x > width * 0.75) {
      scrollContainerRef.current?.scrollBy({ top: height * 0.8, behavior: 'smooth' });
      return;
    }
  }, [tapZoneEnabled, toggleUi]);

  // 切换自动滚动
  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling(prev => !prev);
  }, []);

  // 分页引擎：将文本按视口高度拆分为多页
  const paginateContent = useCallback(() => {
    if (!currentChapter || textReadingMode === 'scroll') {
      setTextPages([]);
      return;
    }
    const measureEl = measureRef.current;
    if (!measureEl) return;

    const containerHeight = window.innerHeight - 128; // 减去上下 padding
    
    // 获取实际的文章容器宽度（使用 max-w-[680px] + px-6）
    const maxWidth = Math.min(680, window.innerWidth - 48); // 680px 或屏幕宽度减去左右 padding
    const containerWidth = maxWidth;
    
    if (containerHeight <= 0 || containerWidth <= 0) return;

    const content = currentChapter.content;
    const paragraphs = content.split('\n');
    
    const pages: string[] = [];
    let currentPageParagraphs: string[] = [];

    // 临时设置测量容器样式
    measureEl.style.position = 'absolute';
    measureEl.style.visibility = 'hidden';
    measureEl.style.width = `${containerWidth}px`;
    measureEl.style.fontSize = `${fontSize}px`;
    measureEl.style.lineHeight = String(lineHeight);
    measureEl.style.fontFamily = resolvedFontFamily;
    measureEl.style.whiteSpace = 'pre-wrap';
    measureEl.style.wordBreak = 'break-word';
    measureEl.style.textIndent = firstLineIndent ? '2em' : '0';

    for (const para of paragraphs) {
      // 先测量单独这个段落是否已经超过容器高度
      measureEl.textContent = para;
      const paraHeight = measureEl.scrollHeight;

      if (paraHeight > containerHeight) {
        // 超长段落：先把之前积累的段落封存为一页
        if (currentPageParagraphs.length > 0) {
          pages.push(currentPageParagraphs.join('\n'));
          currentPageParagraphs = [];
        }
        // 按字符二分拆分超长段落
        let remaining = para;
        while (remaining.length > 0) {
          // 先用剩余全部内容测量
          measureEl.textContent = remaining;
          if (measureEl.scrollHeight <= containerHeight) {
            currentPageParagraphs.push(remaining);
            break;
          }
          // 二分查找最大可容纳字符数
          let lo = 1;
          let hi = remaining.length;
          let best = 1;
          while (lo <= hi) {
            const mid = Math.floor((lo + hi) / 2);
            measureEl.textContent = remaining.slice(0, mid);
            if (measureEl.scrollHeight <= containerHeight) {
              best = mid;
              lo = mid + 1;
            } else {
              hi = mid - 1;
            }
          }
          // 尝试在 best 附近找一个更好的断点（句号、逗号、空格等）
          let splitAt = best;
          const breakChars = ['。', '！', '？', '；', '，', '.', '!', '?', ';', ',', ' ', '\u3000'];
          const searchRange = Math.min(50, Math.floor(best * 0.2));
          for (let i = best; i >= Math.max(1, best - searchRange); i--) {
            if (breakChars.includes(remaining[i - 1])) {
              splitAt = i;
              break;
            }
          }
          pages.push(remaining.slice(0, splitAt));
          remaining = remaining.slice(splitAt);
        }
      } else {
        // 正常段落：追加并检查是否溢出
        currentPageParagraphs.push(para);
        measureEl.textContent = currentPageParagraphs.join('\n');
        const measuredHeight = measureEl.scrollHeight;

        if (measuredHeight > containerHeight && currentPageParagraphs.length > 1) {
          // 当前段落导致溢出，回退一页
          currentPageParagraphs.pop();
          pages.push(currentPageParagraphs.join('\n'));
          currentPageParagraphs = [para];
        }
      }
    }

    // 最后一页
    if (currentPageParagraphs.length > 0) {
      pages.push(currentPageParagraphs.join('\n'));
    }

    // 清理
    measureEl.style.position = '';
    measureEl.style.visibility = '';
    measureEl.textContent = '';

    setTextPages(pages);
    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
    } else {
      setCurrentPageIndex(0); // 重置到第一页
    }
  }, [currentChapter, textReadingMode, fontSize, lineHeight, resolvedFontFamily, firstLineIndent]);

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

    const { contentWidth, pageHeight } = getTextPageMetrics(isColumnsLayoutActive);

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
    measureEl.style.color = themeStyles.color;
    measureEl.style.whiteSpace = 'normal';
    measureEl.style.wordBreak = 'break-word';
    measureEl.style.boxSizing = 'border-box';
    measureEl.style.textAlign = textAlign === 'justify' ? 'justify' : 'left';

    const measurePageHeight = (pageText: string): number => {
      const wrapper = document.createElement('div');

      if (hasMultipleChapters && currentChapter) {
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

    const fitsPage = (pageText: string): boolean => measurePageHeight(pageText) <= pageHeight;

    const findPreferredBreak = (text: string, best: number): number => {
      const searchRange = Math.min(
        TEXT_PAGE_BREAK_SEARCH_MAX,
        Math.max(TEXT_PAGE_BREAK_SEARCH_MIN, Math.floor(best * TEXT_PAGE_BREAK_SEARCH_RATIO))
      );
      const minBreak = Math.max(MIN_TEXT_PAGE_LENGTH, best - searchRange);

      for (let index = best; index >= minBreak; index--) {
        if (TEXT_PAGE_BREAK_CHARS.has(text[index - 1])) {
          return index;
        }
      }

      return best;
    };

    const pages: string[] = [];
    let remaining = currentChapter.content;

    while (remaining.length > 0) {
      if (fitsPage(remaining)) {
        pages.push(remaining);
        break;
      }

      let low = MIN_TEXT_PAGE_LENGTH;
      let high = remaining.length;
      let best = EMPTY_TEXT_PAGE_INDEX;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (fitsPage(remaining.slice(0, mid))) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      let splitAt = best > EMPTY_TEXT_PAGE_INDEX
        ? findPreferredBreak(remaining, best)
        : MIN_TEXT_PAGE_LENGTH;

      while (splitAt > MIN_TEXT_PAGE_LENGTH && !fitsPage(remaining.slice(0, splitAt))) {
        splitAt--;
      }

      pages.push(remaining.slice(0, splitAt));
      remaining = remaining.slice(splitAt);
    }

    measureEl.removeAttribute('style');
    measureEl.replaceChildren();

    setTextPages(pages.length > 0 ? pages : ['']);
    if (skipNextPageResetRef.current) {
      skipNextPageResetRef.current = false;
    } else {
      setCurrentPageIndex(TEXT_PAGE_RESET_INDEX);
    }
  }, [
    currentChapter,
    textReadingMode,
    fontSize,
    lineHeight,
    resolvedFontFamily,
    themeStyles.color,
    textAlign,
    hasMultipleChapters,
    firstLineIndent,
    paginateContent,
    isColumnsLayoutActive,
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [textReadingMode, paginateMeasuredContent]);

  // 翻页
  const goToPage = useCallback((index: number, direction: 'left' | 'right') => {
    if (isPageAnimating) return;
    if (index < 0 || index >= textPages.length) return;
    
    // 记录前一页索引
    setPreviousPageIndex(currentPageIndex);
    setPageDirection(direction);
    setIsPageAnimating(true);
    
    // 根据阅读模式设置不同的动画时长
    const animationDuration = textReadingMode === 'book' ? 900 : 500; // 翻书模式 900ms，左右滑动 500ms
    
    // 先设置新页索引，让 React 渲染新页
    setCurrentPageIndex(index);
    
    // 等待动画完成后清除状态
    setTimeout(() => {
      setIsPageAnimating(false);
      setPageDirection(null);
      setPreviousPageIndex(null);
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
      }, 50);
      return;
    }

    const exitEl = el.querySelector('[data-flip-exit]') as HTMLElement | null;
    const enterEl = el.querySelector('[data-flip-enter]') as HTMLElement | null;
    const isForward = pageDirection === 'left';

    if (exitEl) {
      exitEl.classList.add('book-flip-complete-exit');
      exitEl.style.transform = `rotateY(${isForward ? -160 : 160}deg)`;
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
    }, 450);
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
      }, 50);
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
      enterEl.style.transform = `rotateY(${isForward ? 160 : -160}deg)`;
    }

    setTimeout(() => {
      setCurrentPageIndex(previousPageIndex ?? currentPageIndex);
      setIsPageAnimating(false);
      setPageDirection(null);
      setPreviousPageIndex(null);
      setFlipProgress(0);
    }, 350);
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
      const targetPageIndex = Math.min(currentPageIndex + textPageStep, textPages.length - 1);
      if (targetPageIndex !== currentPageIndex) {
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
        setCurrentChapterIndex(currentChapterIndex - 1);
        setCurrentPageIndex(0);
        setScrollPercent(0);
      }
    } else {
      const targetPageIndex = Math.max(currentPageIndex - textPageStep, 0);
      if (targetPageIndex !== currentPageIndex) {
        goToPage(targetPageIndex, 'right');
      } else if (hasMultipleChapters && currentChapterIndex > 0) {
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
      setScrollPercent(Math.round(progress * 100));
      // 保存分页模式进度
      saveTextProgress(currentChapterIndex, currentPageIndex);
    }
  }, [currentPageIndex, textPages.length, textReadingMode, textPageStep, currentChapterIndex, saveTextProgress]);

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
      if (e.key === 'Escape') navigate(-1);
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
    if (target.closest('button') || target.closest('[data-ui-control]')) return;
    // 批注高亮点击
    if (target.closest('mark')) return;

    // 如果正在进行文本选中，不处理点击
    if (isSelectingTextRef.current) {
      isSelectingTextRef.current = false;
      return;
    }

    // 抑制触摸选区后合成的 click：touchend 后 500ms 内的 click 视为合成事件
    if (Date.now() - lastTouchEndTimeRef.current < 500) {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;
    }

    // 如果有文本选中，不处理点击
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // 左侧 30% → 上一页
    if (x < width * 0.3) {
      goToPrevPage();
      return;
    }
    // 右侧 30% → 下一页
    if (x > width * 0.7) {
      goToNextPage();
      return;
    }
    // 中间 → 切换 UI
    toggleUi();
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
      e.preventDefault();
      const containerWidth = window.innerWidth;
      const isForward = pageDirection === 'left';
      const adjustedDx = isForward ? (-rawDx - SWIPE_THRESHOLD) : (rawDx - SWIPE_THRESHOLD);
      const progress = Math.max(0, Math.min(1, adjustedDx / (containerWidth * 0.6)));
      setFlipProgress(progress);
    }
  }, [textReadingMode, isPageAnimating, currentPageIndex, textPages.length, pageDirection, startFlip]);

  // 翻书触摸结束
  const handleFlipTouchEnd = useCallback(() => {
    if (textReadingMode !== 'book' || !isPageAnimating) return;

    if (flipProgress > 0.35) {
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
        return Math.abs((bm.scrollRatio ?? 0) - scrollPercent / 100) < 0.02;
      }
      return bm.pageIndex === currentPageIndex;
    });
    setIsBookmarked(found);
  }, [bookmarks, currentChapterIndex, currentPageIndex, scrollPercent, textReadingMode]);

  // 添加/移除书签
  const toggleBookmark = useCallback(async () => {
    if (!bookId || !currentChapter) return;

    if (isBookmarked) {
      // 移除当前书签
      const bm = bookmarks.find((b) => {
        if (b.chapterIndex !== currentChapterIndex) return false;
        if (textReadingMode === 'scroll') {
          return Math.abs((b.scrollRatio ?? 0) - scrollPercent / 100) < 0.02;
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
          textPreview = content.slice(Math.max(0, charPos - 20), charPos + 30);
        }
      } else if (textPages[currentPageIndex]) {
        textPreview = textPages[currentPageIndex].slice(0, 50);
      }

      const bookmark: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        bookId,
        chapterIndex: currentChapterIndex,
        chapterTitle: currentChapter.title,
        pageIndex: textReadingMode !== 'scroll' ? currentPageIndex : undefined,
        scrollRatio: textReadingMode === 'scroll' ? scrollPercent / 100 : undefined,
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
      if (textReadingMode !== 'scroll' && bm.pageIndex != null) {
        skipNextPageResetRef.current = true;
      }
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
      } else {
        // 分页模式：等分页计算完成后定位（skipNextPageResetRef 已阻止重置）
        if (pendingNavTimerRef.current) clearTimeout(pendingNavTimerRef.current);
        pendingNavTimerRef.current = setTimeout(() => {
          pendingNavTimerRef.current = null;
          const nav = pendingNavRef.current;
          if (nav && nav.pageIndex != null) {
            const safeIndex = Math.min(nav.pageIndex, textPagesLengthRef.current - 1);
            if (safeIndex >= 0) setCurrentPageIndex(safeIndex);
          }
          pendingNavRef.current = null;
        }, 350);
      }
    }
  }, [currentChapterIndex, textReadingMode]);

  // 书签删除
  const handleBookmarkDelete = useCallback(async (id: string) => {
    await bookmarkRepo.remove(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ========== 批注功能 ==========

  // 加载批注
  useEffect(() => {
    if (!bookId) return;
    annotationRepo.getByBookId(bookId).then(setAnnotations);
  }, [bookId]);

  // 当前章节的批注
  const currentChapterAnnotations = useMemo(() => {
    return annotations.filter((a) => a.chapterIndex === currentChapterIndex);
  }, [annotations, currentChapterIndex]);

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
        if (text.length < 2) {
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
        let contentOffset = computeSelectionOffset(sel);

        // 修正 trim 造成的偏移：sel.toString() 可能含前导空白，trim 后 text 起始位置后移
        if (contentOffset >= 0) {
          const rawSelText = sel.toString();
          const trimShift = rawSelText.indexOf(text);
          if (trimShift > 0) contentOffset += trimShift;
        }

        setSelectionInfo({
          text,
          position: { x: rect.left + rect.width / 2, y: rect.top },
          contentOffset: contentOffset >= 0 ? contentOffset : undefined,
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
    const computeSelectionOffset = (sel: Selection): number => {
      // 使用 data-reader-content 而非 data-reader-article，避免章节标题 <h2> 文字干扰偏移计算
      const contentEl = document.querySelector('[data-reader-content]');
      if (!contentEl || !sel.rangeCount) return -1;
      const range = sel.getRangeAt(0);
      const preRange = document.createRange();
      preRange.selectNodeContents(contentEl);
      preRange.setEnd(range.startContainer, range.startOffset);
      return preRange.toString().length;
    };

    // 从当前 window.getSelection() 显示浮动批注按钮
    const showFloatingButton = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const text = sel.toString().trim();
      if (text.length < 2) return;
      if (!isSelectionInArticle()) return;

      isSelectingTextRef.current = true;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      let contentOffset = computeSelectionOffset(sel);

      // 修正 trim 造成的偏移：sel.toString() 可能含前导空白，trim 后 text 起始位置后移
      if (contentOffset >= 0) {
        const rawSelText = sel.toString();
        const trimShift = rawSelText.indexOf(text);
        if (trimShift > 0) contentOffset += trimShift;
      }

      setSelectionInfo({
        text,
        position: { x: rect.left + rect.width / 2, y: rect.top },
        contentOffset: contentOffset >= 0 ? contentOffset : undefined,
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
      const range = (document as any).caretRangeFromPoint?.(x, y) as Range | null;

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
      if (existingSel && !existingSel.isCollapsed && existingSel.toString().trim().length >= 2) {
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
        if (sel && !sel.isCollapsed && sel.toString().trim().length >= 2) {
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
      }, 100);
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
        const hasSelection = sel && !sel.isCollapsed && sel.toString().trim().length >= 2;
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

  // 保存批注
  const handleAnnotationSave = useCallback(async (note: string, style: AnnotationStyle) => {
    if (!bookId || !currentChapter || !selectionPopup) return;

    const content = currentChapter.content;
    // 优先使用从选区 Range 计算的精确偏移，回退到 indexOf
    const startOffset = selectionPopup.contentOffset != null && selectionPopup.contentOffset >= 0
      ? selectionPopup.contentOffset
      : content.indexOf(selectionPopup.text);
    const endOffset = startOffset >= 0 ? startOffset + selectionPopup.text.length : 0;

    const annotation: Annotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookId,
      chapterIndex: currentChapterIndex,
      chapterTitle: currentChapter.title,
      selectedText: selectionPopup.text,
      note,
      startOffset: startOffset >= 0 ? startOffset : 0,
      endOffset,
      style,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await annotationRepo.add(annotation);
    setAnnotations((prev) => [annotation, ...prev]);
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  }, [bookId, currentChapter, currentChapterIndex, selectionPopup]);

  // 批注编辑
  const handleAnnotationEdit = useCallback(async (updated: Annotation) => {
    const updates: Partial<Pick<Annotation, 'note' | 'style' | 'updatedAt'>> = {};
    if (updated.note !== undefined) updates.note = updated.note;
    if (updated.style !== undefined) updates.style = updated.style;
    await annotationRepo.update(updated.id, updates);
    setAnnotations((prev) => prev.map((a) => {
      if (a.id !== updated.id) return a;
      return {
        ...a,
        ...(updated.note !== undefined ? { note: updated.note } : {}),
        ...(updated.style !== undefined ? { style: updated.style } : {}),
        updatedAt: new Date(),
      };
    }));
  }, []);

  // 批注删除
  const handleAnnotationDelete = useCallback(async (id: string) => {
    await annotationRepo.remove(id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // 批注跳转：根据批注的 startOffset 定位到正文中的具体位置
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
            const scrollable = container.scrollHeight - container.clientHeight;
            container.scrollTo({ top: ratio * scrollable, behavior: 'smooth' });
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
      // 跨章节：暂存目标 offset，等章节内容加载完成后跳转
      pendingNavRef.current = {
        chapterIndex: ann.chapterIndex,
        scrollRatio: undefined, // 需要在内容加载后从 startOffset 计算
        pageIndex: undefined,
      };
      // 先设置章节，让内容加载
      setCurrentChapterIndex(ann.chapterIndex);
      setCurrentPageIndex(0);

      if (textReadingMode === 'scroll') {
        // 滚动模式：延迟两帧等 DOM 渲染后计算位置并滚动
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const nav = pendingNavRef.current;
            if (nav) {
              const chapter = chaptersRef.current[ann.chapterIndex];
              if (chapter && chapter.content.length > 0) {
                const ratio = ann.startOffset / chapter.content.length;
                const container = scrollContainerRef.current;
                if (container) {
                  const scrollable = container.scrollHeight - container.clientHeight;
                  container.scrollTop = ratio * scrollable;
                }
              }
            }
            pendingNavRef.current = null;
          });
        });
      } else {
        // 分页模式：等分页计算完成后定位到包含批注的页
        skipNextPageResetRef.current = true;
        if (pendingNavTimerRef.current) clearTimeout(pendingNavTimerRef.current);
        pendingNavTimerRef.current = setTimeout(() => {
          pendingNavTimerRef.current = null;
          const nav = pendingNavRef.current;
          if (nav) {
            const chapter = chaptersRef.current[ann.chapterIndex];
            const pages = textPagesLengthRef.current;
            if (chapter && pages > 0) {
              // 用 startOffset 占比估算页码
              const ratio = ann.startOffset / chapter.content.length;
              const targetPage = Math.min(
                Math.floor(ratio * pages),
                pages - 1
              );
              setCurrentPageIndex(Math.max(0, targetPage));
            }
          }
          pendingNavRef.current = null;
        }, 350);
      }
    }
  }, [currentChapterIndex, textReadingMode, textPages, chapters]);

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

  // 渲染带批注高亮的文本
  const renderContentWithAnnotations = (content: string, chapterIdx: number) => {
    const chapterAnns = currentChapterAnnotations.filter(
      (a) => a.chapterIndex === chapterIdx && a.startOffset >= 0 && a.endOffset > a.startOffset
    );
    if (chapterAnns.length === 0) return content;

    // 按 startOffset 排序并构建片段
    const sorted = [...chapterAnns].sort((a, b) => a.startOffset - b.startOffset);
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    sorted.forEach((ann) => {
      // 跳过与前一批注重叠的批注（避免 slice 产生空/负区间导致文本丢失）
      if (ann.startOffset < lastEnd) return;
      // 添加批注前的普通文本
      if (ann.startOffset > lastEnd) {
        parts.push(content.slice(lastEnd, ann.startOffset));
      }
      // 添加高亮文本（根据样式选择不同的 CSS 类）
      const highlightText = content.slice(ann.startOffset, ann.endOffset);
      
      // 根据样式选择 CSS 样式
      const getAnnotationStyle = (style?: AnnotationStyle): React.CSSProperties => {
        switch (style) {
          case 'underline':
            return {
              textDecoration: 'underline',
              textDecorationColor: themeStyles.color,
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
              cursor: 'pointer',
            };
          case 'wavy':
            return {
              textDecoration: 'underline wavy',
              textDecorationColor: themeStyles.color,
              textDecorationThickness: '1.5px',
              textUnderlineOffset: '4px',
              cursor: 'pointer',
            };
          case 'highlight':
          default:
            // 使用 color-mix 将当前文字色与透明混合，实现半透明背景，适配所有阅读主题
            return {
              backgroundColor: `color-mix(in srgb, ${themeStyles.color} 20%, transparent)`,
              borderRadius: '2px',
              padding: '0 2px',
              cursor: 'pointer',
            };
        }
      };

      parts.push(
        <mark
          key={`ann-${ann.id}`}
          style={getAnnotationStyle(ann.style)}
          className="transition-colors hover:opacity-80"
          title={ann.note}
          onClick={(e) => {
            e.stopPropagation();
            setHighlightedAnnotation(ann);
          }}
        >
          {highlightText}
        </mark>
      );
      lastEnd = ann.endOffset;
    });

    // 添加剩余文本
    if (lastEnd < content.length) {
      parts.push(content.slice(lastEnd));
    }

    return parts;
  };

  // 分页模式下渲染批注高亮：将章节级偏移映射为页内偏移
  const renderContentWithAnnotationsForPage = (pageContent: string, chapterIdx: number, pageStartOffset: number) => {
    const pageEnd = pageStartOffset + pageContent.length;
    const pageAnns = currentChapterAnnotations.filter(
      (a) => a.chapterIndex === chapterIdx && a.startOffset >= 0 && a.endOffset > a.startOffset
        && a.startOffset < pageEnd && a.endOffset > pageStartOffset
    );
    if (pageAnns.length === 0) return pageContent;

    // 将章节偏移映射为页内偏移并排序
    const mapped = pageAnns.map((a) => ({
      ...a,
      pageStart: Math.max(0, a.startOffset - pageStartOffset),
      pageEnd: Math.min(pageContent.length, a.endOffset - pageStartOffset),
    })).sort((a, b) => a.pageStart - b.pageStart);

    const parts: React.ReactNode[] = [];
    let lastEnd = 0;

    mapped.forEach((ann) => {
      // 跳过与前一批注重叠的批注
      if (ann.pageStart < lastEnd) return;
      if (ann.pageStart > lastEnd) parts.push(pageContent.slice(lastEnd, ann.pageStart));
      const highlightText = pageContent.slice(ann.pageStart, ann.pageEnd);
      const getAnnotationStyle = (style?: AnnotationStyle): React.CSSProperties => {
        switch (style) {
          case 'underline':
            return { textDecoration: 'underline', textDecorationColor: themeStyles.color, textDecorationThickness: '2px', textUnderlineOffset: '3px', cursor: 'pointer' };
          case 'wavy':
            return { textDecoration: 'underline wavy', textDecorationColor: themeStyles.color, textDecorationThickness: '1.5px', textUnderlineOffset: '4px', cursor: 'pointer' };
          case 'highlight':
          default:
            return { backgroundColor: `color-mix(in srgb, ${themeStyles.color} 20%, transparent)`, borderRadius: '2px', padding: '0 2px', cursor: 'pointer' };
        }
      };
      parts.push(
        <mark key={`ann-${ann.id}`} style={getAnnotationStyle(ann.style)} className="transition-colors hover:opacity-80" title={ann.note}
          onClick={(e) => { e.stopPropagation(); setHighlightedAnnotation(ann); }}>
          {highlightText}
        </mark>
      );
      lastEnd = ann.pageEnd;
    });
    if (lastEnd < pageContent.length) parts.push(pageContent.slice(lastEnd));
    return parts;
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

    return (
      <div>
        {hasMultipleChapters && currentChapter && (
          <h2 className="text-center font-bold mb-8 opacity-80">
            {currentChapter.title}
          </h2>
        )}
        <div
          data-reader-content
          style={{
            textIndent: firstLineIndent ? '2em' : '0',
          }}
          className="whitespace-pre-wrap break-words"
        >
          {pageContent && pageIndex != null
            ? renderContentWithAnnotationsForPage(content, currentChapterIndex, getPageStartOffset(pageIndex))
            : renderContentWithAnnotations(content, currentChapterIndex)}
        </div>
      </div>
    );
  };

  const renderPagedArticle = (pageIndex: number) => {
    const articleStyle = {
      fontSize: `${fontSize}px`,
      lineHeight,
      fontFamily: resolvedFontFamily,
      color: themeStyles.color,
      WebkitUserSelect: 'text' as const,
      userSelect: 'text' as const,
      WebkitTouchCallout: 'none' as const,
    };

    const articleClassName = cn(
      'max-w-[680px] mx-auto px-6 py-16 md:py-24 h-full overflow-hidden',
      textAlign === 'justify' ? 'text-justify' : 'text-left'
    );

    if (!isColumnsLayoutActive) {
      return (
        <article
          data-reader-article
          className={articleClassName}
          style={articleStyle}
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
    if (textPages.length === 0) return isEpub ? 'EPUB' : 'TXT';
    if (!isColumnsLayoutActive) return `${currentPageIndex + 1}/${textPages.length}`;

    const firstVisiblePage = currentPageIndex + 1;
    const lastVisiblePage = Math.min(currentPageIndex + textPageStep, textPages.length);
    return firstVisiblePage === lastVisiblePage
      ? `${firstVisiblePage}/${textPages.length}`
      : `${firstVisiblePage}-${lastVisiblePage}/${textPages.length}`;
  })();
  const isReaderNavigationVisible = uiVisible || isChapterEndPromptVisible;

  return (
    <div
      className="font-body min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: themeStyles.bg,
        color: themeStyles.color,
      }}
    >
      {/* 隐藏的测量容器 */}
      <div ref={measureRef} className="absolute pointer-events-none" aria-hidden="true" />

      {/* 滚动模式 */}
      {textReadingMode === 'scroll' && (
        <main
          ref={scrollContainerRef}
          className="w-full h-screen overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            ...(displayFilter ? { filter: displayFilter } : {}),
          }}
          onClick={handleTapZoneClick}
          onScroll={handleScroll}
        >
          <article
            data-reader-article
            className={cn(
              'max-w-[680px] mx-auto px-6 py-16 md:py-24',
              textAlign === 'justify' ? 'text-justify' : 'text-left'
            )}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
              fontFamily: resolvedFontFamily,
              color: themeStyles.color,
              WebkitUserSelect: 'text',
              userSelect: 'text',
              WebkitTouchCallout: 'none',
            }}
          >
            {currentChapter ? renderArticleContent() : (
              <div className="text-center text-on-surface-variant py-24">
                <span className="material-symbols-outlined text-6xl block mb-4">description</span>
                <p>暂无内容</p>
              </div>
            )}
          </article>
        </main>
      )}

      {/* 左右翻页 / 模拟翻书模式 */}
      {textReadingMode !== 'scroll' && (
        <main
          ref={flipPageRef}
          className={cn(
            'w-full h-screen relative',
            textReadingMode === 'book' ? 'book-flip-container' : ''
          )}
          style={{
            ...(displayFilter ? { filter: displayFilter } : {}),
          }}
          onClick={handlePaginateClick}
          onTouchStart={(e) => {
            handleTouchStart(e);
            handleFlipTouchStart(e);
          }}
          onTouchMove={handleFlipTouchMove}
          onTouchEnd={(e) => {
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
                    'absolute inset-0 w-full h-screen overflow-hidden book-flip-page',
                    textReadingMode !== 'book' && getPageAnimClass(true)
                  )}
                  style={textReadingMode === 'book' ? {
                    transformOrigin: pageDirection === 'left' ? 'left center' : 'right center',
                    transform: `rotateY(${pageDirection === 'left' ? -160 * flipProgress : 160 * flipProgress}deg)`,
                    zIndex: 3,
                  } : undefined}
                >
                  {renderPagedArticle(previousPageIndex)}
                  {/* 翻页阴影 */}
                  {textReadingMode === 'book' && (
                    <>
                      <div className="book-page-shadow" style={{
                        background: flipProgress > 0 && flipProgress < 1
                          ? `linear-gradient(to ${pageDirection === 'left' ? 'left' : 'right'}, rgba(0,0,0,${0.25 * flipProgress}) 0%, transparent 50%)`
                          : undefined,
                      }} />
                      <div className="book-spine-highlight" style={{ opacity: flipProgress > 0 && flipProgress < 1 ? 0.5 : 0 }} />
                    </>
                  )}
                </div>
              )}
              
              {/* 当前页（进入动画或静态显示） */}
              <div
                key={`page-${currentPageIndex}-enter`}
                data-flip-enter
                className={cn(
                  'w-full h-screen overflow-hidden',
                  isPageAnimating ? 'absolute inset-0 book-flip-page' : '',
                  textReadingMode !== 'book' && isPageAnimating && getPageAnimClass(false)
                )}
                style={textReadingMode === 'book' && isPageAnimating ? {
                  transformOrigin: pageDirection === 'left' ? 'right center' : 'left center',
                  transform: `rotateY(${pageDirection === 'left' ? 160 * (1 - flipProgress) : -160 * (1 - flipProgress)}deg)`,
                  zIndex: 2,
                } : undefined}
              >
                {renderPagedArticle(Math.min(currentPageIndex, textPages.length - 1))}
                {/* 翻页阴影 */}
                {textReadingMode === 'book' && isPageAnimating && (
                  <>
                    <div className="book-page-shadow" style={{
                      background: flipProgress < 1
                        ? `linear-gradient(to ${pageDirection === 'left' ? 'right' : 'left'}, rgba(0,0,0,${0.3 * (1 - flipProgress)}) 0%, transparent 40%)`
                        : undefined,
                    }} />
                    <div className="book-spine-highlight" style={{ opacity: flipProgress < 1 ? 0.4 * (1 - flipProgress) : 0 }} />
                  </>
                )}
              </div>
            </>
          ) : isLoading ? (
            <div className="w-full h-screen flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl animate-spin opacity-50">progress_activity</span>
                <p className="opacity-50">加载中...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-screen flex items-center justify-center">
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
      <div className="fixed top-gutter right-margin-mobile z-40 pointer-events-none mt-safe">
        <div className="bg-on-surface/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
          {estimatedTimeLeft && (
            <span className="font-label text-label-sm text-surface opacity-80">{estimatedTimeLeft}</span>
          )}
          <span className="font-label text-label-sm text-surface">{scrollPercent}%</span>
        </div>
      </div>

      {/* 自动滚动指示器 */}
      {isAutoScrolling && (
        <div className="fixed bottom-20 right-4 z-40 pointer-events-none">
          <div className="bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
            <span className="font-label text-label-sm text-on-primary">自动滚动中</span>
          </div>
        </div>
      )}

      {/* UI overlay - 始终渲染，通过 opacity/pointer-events 控制可见性，确保返回按钮和点击区域始终可用 */}
      {textReadingMode === 'scroll' && isChapterEndPromptVisible && currentChapterIndex < chapters.length - 1 && (
        <div className="fixed inset-x-0 bottom-40 z-40 px-margin-mobile pointer-events-none">
          <div className="max-w-max-width-content mx-auto flex items-center justify-between gap-3 rounded-full bg-surface/90 backdrop-blur-md border border-outline-variant/60 shadow-lg px-4 py-3 pointer-events-auto">
            <span className="font-label text-label-sm text-on-surface-variant">
              {TEXT_CHAPTER_END_PROMPT_LABELS.title}
            </span>
            <button
              className="px-4 py-2 rounded-full bg-primary text-on-primary font-label text-label-sm hover:opacity-90 transition-opacity"
              onClick={goToNextChapter}
              data-ui-control
            >
              {TEXT_CHAPTER_END_PROMPT_LABELS.action}
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col justify-between transition-opacity duration-300',
          isReaderNavigationVisible ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'
        )}
      >
          {/* 顶栏 */}
          <header
            className={cn(
              'bg-surface/80 backdrop-blur-md w-full px-margin-mobile py-2 border-b border-outline-variant/50 pointer-events-auto pt-safe transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              uiVisible ? 'translate-y-0' : '-translate-y-full'
            )}
          >
            <div className="max-w-max-width-content mx-auto flex justify-between items-center">
              <button
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
                onClick={handleClose}
                data-ui-control
              >
                <span className="material-symbols-outlined text-headline-md">arrow_back</span>
              </button>
              <div className="flex flex-col items-center max-w-[60%]">
                <h1 className="font-display text-headline-sm text-primary truncate w-full text-center">
                  {title.length > 4 ? title.slice(0, 4) : title}
                </h1>
                {hasMultipleChapters && currentChapter && (
                  <span className="font-label text-label-sm text-on-surface-variant truncate w-full text-center">
                    {currentChapter.title}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasMultipleChapters && (
                  <button
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
                    onClick={() => setIsChapterDrawerOpen(true)}
                    data-ui-control
                    aria-label="章节目录"
                  >
                    <span className="material-symbols-outlined text-headline-md">format_list_bulleted</span>
                  </button>
                )}
                {/* 书签按钮 */}
                <button
                  className={`${isBookmarked ? 'text-primary' : 'text-on-surface-variant'} hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50`}
                  onClick={toggleBookmark}
                  data-ui-control
                  aria-label={isBookmarked ? '移除书签' : '添加书签'}
                >
                  <span
                    className="material-symbols-outlined text-headline-md"
                    style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {isBookmarked ? 'bookmark' : 'bookmark_add'}
                  </span>
                </button>
                <button
                  className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
                  onClick={() => setIsBottomBarVisible(true)}
                  data-ui-control
                  aria-label="设置"
                >
                  <span className="material-symbols-outlined text-headline-md">more_vert</span>
                </button>
              </div>
            </div>
          </header>

          {/* 底部进度条 */}
          <div
            className={cn(
              'w-full pointer-events-auto bg-surface/60 backdrop-blur-md pb-safe pt-4 px-margin-mobile transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
              isReaderNavigationVisible ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            <div className="max-w-max-width-content mx-auto">
              {/* 章节导航按钮 */}
              {hasMultipleChapters && (
                <div className="flex items-center justify-between mb-3">
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm font-label transition-colors',
                      currentChapterIndex > 0
                        ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                        : 'bg-surface-container-high/50 text-on-surface-variant/50 cursor-not-allowed'
                    )}
                    onClick={goToPrevChapter}
                    disabled={currentChapterIndex === 0}
                    data-ui-control
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    上一章
                  </button>
                  <span className="font-label text-label-sm text-on-surface-variant">
                    {currentChapterIndex + 1} / {chapters.length}
                  </span>
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm font-label transition-colors',
                      currentChapterIndex < chapters.length - 1
                        ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                        : 'bg-surface-container-high/50 text-on-surface-variant/50 cursor-not-allowed'
                    )}
                    onClick={goToNextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                    data-ui-control
                  >
                    下一章
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              )}
              {/* 进度条 */}
              <div className="flex items-center gap-3">
                <button
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                    isAutoScrolling
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  )}
                  onClick={toggleAutoScroll}
                  data-ui-control
                  aria-label={isAutoScrolling ? '停止自动滚动' : '开始自动滚动'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isAutoScrolling ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <span className="font-label text-label-sm text-on-surface-variant tabular-nums w-10 text-right">
                  {isProgressDragging ? dragPercent : scrollPercent}%
                </span>
                <div className="flex-1 relative h-8 flex items-center group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={isProgressDragging ? dragPercent : scrollPercent}
                    onChange={handleProgressSliderChange}
                    onPointerDown={() => {
                      setIsProgressDragging(true);
                      setDragPercent(scrollPercent);
                    }}
                    onPointerUp={handleProgressSliderCommit}
                    className="progress-slider w-full"
                    data-ui-control
                  />
                </div>
                <span className="font-label text-label-sm text-on-surface-variant">
                  {textReadingMode === 'scroll'
                    ? (isEpub ? 'EPUB' : 'TXT')
                    : pageIndicatorText
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* 底栏遮罩 */}
      {isBottomBarVisible && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 animate-fade-in"
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
          readingTheme={readingTheme}
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
          onColorTemperatureChange={(v) => useAppStore.getState().updateSettings({ colorTemperature: v })}
          onReadingThemeChange={(theme) => useAppStore.getState().updateSettings({ readingTheme: theme })}
          onTextFontFamilyChange={(family) => useAppStore.getState().updateSettings({ textFontFamily: family })}
          onTextAlignChange={(align) => useAppStore.getState().updateSettings({ textAlign: align })}
          onFirstLineIndentToggle={() => useAppStore.getState().updateSettings({ firstLineIndent: !firstLineIndent })}
          onTapZoneEnabledToggle={() => useAppStore.getState().updateSettings({ tapZoneEnabled: !tapZoneEnabled })}
          onAutoAdvanceTextChapterToggle={() => useAppStore.getState().updateSettings({ autoAdvanceTextChapter: !autoAdvanceTextChapter })}
          onAutoScrollSpeedChange={(speed) => useAppStore.getState().updateSettings({ autoScrollSpeed: speed })}
          onTextReadingModeChange={(mode) => {
            useAppStore.getState().updateSettings({ textReadingMode: mode });
            setCurrentPageIndex(0);
          }}
          onBookmarkListOpen={() => setIsBookmarkPanelOpen(true)}
          onAnnotationListOpen={() => setIsAnnotationListOpen(true)}
          onFavoriteToggle={() => {
            if (bookId) useLibraryStore.getState().toggleFavorite(bookId);
          }}
          isBookmarked={isBookmarked}
          isFavorite={book?.isFavorite}
          onClose={() => setIsBottomBarVisible(false)}
        />
      )}

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
          onEdit={handleAnnotationEdit}
          onDelete={handleAnnotationDelete}
          onNavigate={handleAnnotationNavigate}
          onClose={() => setIsAnnotationListOpen(false)}
        />
      )}

      {/* 浮动批注按钮：选中文本后显示一个小按钮，点击后弹出批注编辑窗 */}
      {selectionInfo && !selectionPopup && (
        <>
          {/* 透明遮罩：点击空白区域取消选区 */}
          <div
            className="fixed inset-0 z-[68]"
            onClick={() => {
              setSelectionInfo(null);
              window.getSelection()?.removeAllRanges();
              isSelectingTextRef.current = false;
            }}
          />
          {/* 浮动按钮 */}
          <button
            className="fixed z-[69] bg-primary text-on-primary rounded-full shadow-lg flex items-center gap-1.5 pl-2.5 pr-3 py-2 animate-fade-in hover:shadow-xl active:scale-95 transition-shadow"
            style={{
              left: Math.max(8, Math.min(selectionInfo.position.x - 24, window.innerWidth - 100)),
              top: Math.max(8, Math.min(selectionInfo.position.y - 52, window.innerHeight - 48)),
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectionPopupTimeRef.current = Date.now();
              setSelectionPopup({
                text: selectionInfo.text,
                position: {
                  x: selectionInfo.position.x - 160,
                  y: selectionInfo.position.y + 40,
                },
                contentOffset: selectionInfo.contentOffset,
              });
              setSelectionInfo(null);
            }}
            data-ui-control
          >
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
            <span className="font-label text-label-sm">批注</span>
          </button>
        </>
      )}

      {/* 批注弹窗 */}
      {selectionPopup && (
        <AnnotationPopup
          selectedText={selectionPopup.text}
          position={selectionPopup.position}
          onSave={handleAnnotationSave}
          onCancel={() => {
            // 防止弹窗刚渲染就被 click 事件关闭
            if (Date.now() - selectionPopupTimeRef.current < 400) return;
            setSelectionPopup(null);
            setSelectionInfo(null);
            window.getSelection()?.removeAllRanges();
            isSelectingTextRef.current = false;
          }}
        />
      )}

      {/* 批注详情弹窗 */}
      {highlightedAnnotation && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center"
          onClick={() => setHighlightedAnnotation(null)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-surface rounded-xl shadow-2xl border border-outline-variant/50 max-w-sm mx-4 p-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-[18px]">edit_note</span>
              <span className="font-label text-label-md text-primary">{highlightedAnnotation.chapterTitle}</span>
            </div>
            <div className="bg-secondary/10 rounded-lg px-3 py-2 mb-3">
              <p className="font-body text-body-sm text-on-surface opacity-70 italic line-clamp-3">
                "{highlightedAnnotation.selectedText}"
              </p>
            </div>
            <p className="font-body text-body-md text-on-surface mb-4">{highlightedAnnotation.note}</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                onClick={() => setHighlightedAnnotation(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
