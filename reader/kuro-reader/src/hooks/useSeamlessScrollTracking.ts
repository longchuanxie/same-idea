import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { TextChapter } from '@/services/textContent';

/** 无缝续读窗口：视口所在章之后至少预拼接 AHEAD 章；窗口总量超 MAX 时裁剪远端，防止长章节数 DOM 无限增长 */
const SCROLL_WINDOW_AHEAD = 1;
const SCROLL_WINDOW_MAX = 6;
/** 向上回看：锚点进入窗口首章顶部该距离内即向前扩一章（带滚动补偿） */
const SCROLL_WINDOW_PREPEND_PX = 120;
/** 章末判定：滚动比例阈值 + 底部像素容差 */
const TEXT_SCROLL_END_THRESHOLD = 0.995;
const TEXT_SCROLL_END_EPSILON_PX = 2;

export interface ScrollTrackingCallbacks {
  /** 滚动时显示进度提示气泡 */
  showProgressHint: () => void;
  setScrollPercent: (percent: number) => void;
  setIsChapterEndPromptVisible: (visible: boolean) => void;
  /** 立即保存进度（防抖由进度保存 hook 承担） */
  scheduleProgressSave: (chapterIdx: number, scrollRat?: number) => void;
}

export interface UseSeamlessScrollTrackingParams extends ScrollTrackingCallbacks {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  bookId?: string;
  chapters: TextChapter[];
  currentChapterIndex: number;
  setCurrentChapterIndex: (index: number) => void;
  /** 无缝续读 = 滚动模式 + 章末自动衔接 */
  isSeamlessReading: boolean;
  textReadingMode: string;
  isLoading: boolean;
  ttsActive: boolean;
  isProgressDragging: boolean;
  verticalWriting: boolean;
}

/**
 * 滚动模式的进度追踪与无缝续读窗口维护：
 * - handleScroll：视口追踪所在章（章内百分比）、向后预拼接 / 向前扩窗 /
 *   超限裁剪，单章滚动时负责章末提示
 * - 窗口 start 变化（向前扩窗/前端裁剪）后按基准章补偿滚动位置，视口内容不跳动
 * - navigateToChapter：显式跳章时重置窗口并抑制一次视口追踪（scrollTo(0,0)
 *   引发的 scroll 事件不应把当前章拉回窗口首章）
 */
export function useSeamlessScrollTracking({
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
}: UseSeamlessScrollTrackingParams) {
  // 无缝续读：滚动模式下已拼接渲染的章节窗口 [start, end)
  const [scrollWindow, setScrollWindow] = useState({ start: 0, end: 1 });
  const scrollChapterElsRef = useRef<Map<number, HTMLElement>>(new Map());
  const scrollCompensationRef = useRef<{ referenceChapter: number; docPos: number } | null>(null);
  // 显式导航后抑制一次视口追踪
  const suppressViewTrackingRef = useRef(false);
  // scroll 模式重新挂载（模式切换回来）时重置拼接窗口的判定基准
  const wasScrollModeRef = useRef(false);

  /** 章节在滚动内容中的起点与尺寸（文档坐标，不随滚动变化；按排版轴抽象） */
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
  }, [scrollContainerRef, verticalWriting]);

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
          setScrollPercent(Math.round(chapterRatio * 100));
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
        scheduleProgressSave(activeIndex, chapterRatio);
        return;
      }
    }

    // —— 单章滚动（关闭自动衔接）：到底显示继续提示，手动续读 ——
    const ratio = anchor / scrollable;
    if (!isProgressDragging) {
      setScrollPercent(Math.round(ratio * 100));
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
    scheduleProgressSave(currentChapterIndex, ratio);
  }, [
    bookId,
    chapters.length,
    currentChapterIndex,
    isProgressDragging,
    isSeamlessReading,
    scrollContainerRef,
    scrollWindow,
    chapterGeometry,
    captureScrollCompensation,
    setCurrentChapterIndex,
    setIsChapterEndPromptVisible,
    setScrollPercent,
    scheduleProgressSave,
    showProgressHint,
    ttsActive,
    verticalWriting,
  ]);

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
  }, [scrollWindow, chapterGeometry, verticalWriting, scrollContainerRef]);

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
  }, [textReadingMode, isLoading, currentChapterIndex, chapters.length, setScrollPercent, scrollContainerRef]);

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

  /** 显式跳章：重置窗口到目标章并抑制一次视口追踪 */
  const navigateToChapter = useCallback((index: number) => {
    suppressViewTrackingRef.current = true;
    setScrollWindow({
      start: index,
      end: Math.min(chapters.length, index + 1 + SCROLL_WINDOW_AHEAD),
    });
  }, [chapters.length]);

  return {
    /** 拼接渲染窗口 [start, end)（JSX 据此渲染章列表） */
    scrollWindow,
    /** 章节元素登记表（JSX ref 回调写入，几何计算读取） */
    scrollChapterElsRef,
    handleScroll,
    navigateToChapter,
  };
}
