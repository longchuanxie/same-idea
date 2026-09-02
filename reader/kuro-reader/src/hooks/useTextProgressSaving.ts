import { useCallback, useRef } from 'react';

import { getOverallReadingRatio } from '@/utils/readingProgress';
import { useAppStore } from '@/stores/useAppStore';
import type { Book, ReadingProgress } from '@/types';
import type { TextChapter } from '@/services/textContent';

/** 进度防抖保存间隔（ms） */
const PROGRESS_SAVE_DEBOUNCE = 500;
const PERCENT_MULTIPLIER = 100;

/** 卸载兜底保存所需的最新快照（事件回调/清理函数读取，绕开闭包过期） */
export interface TextProgressSnapshot {
  book: Book | undefined;
  chapters: TextChapter[];
  textPagesLength: number;
}

export interface UseTextProgressSavingParams {
  bookId?: string;
  book: Book | undefined;
  chapters: TextChapter[];
  textPages: string[];
  updateProgress: (bookId: string, progress: ReadingProgress) => void;
}

/**
 * 文本阅读器的进度保存体系：
 * - 镜像 ref（book/chapters/textPages）——滚动等高频回调与卸载清理里
 *   读取最新值而不重建回调，避免监听器反复解绑
 * - saveTextProgress 立即保存；scheduleProgressSave 防抖保存
 * - composeTextProgress 把定位信息组装成 ReadingProgress（保存与卸载兜底共用）
 */
export function useTextProgressSaving({
  bookId,
  book,
  chapters,
  textPages,
  updateProgress,
}: UseTextProgressSavingParams) {
  const bookRef = useRef(book);
  bookRef.current = book;
  const chaptersRef = useRef(chapters);
  chaptersRef.current = chapters;
  const textPagesLengthRef = useRef(textPages.length);
  textPagesLengthRef.current = textPages.length;
  const textPagesRef = useRef(textPages);
  textPagesRef.current = textPages;

  const progressSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 组装进度载荷：章定位（chapterId 兜底拼接）、章内/全书比例、locator、按书恢复的设置快照 */
  const composeTextProgress = useCallback((
    chapterIdx: number,
    pageIdx?: number,
    scrollRat?: number
  ): ReadingProgress | null => {
    if (!bookId) return null;
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
    return {
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
    };
  }, [bookId]);

  /** 立即保存进度（跳页/进度条提交等显式时机） */
  const saveTextProgress = useCallback((chapterIdx: number, pageIdx?: number, scrollRat?: number) => {
    const progress = composeTextProgress(chapterIdx, pageIdx, scrollRat);
    if (progress) updateProgress(progress.bookId, progress);
  }, [composeTextProgress, updateProgress]);

  /** 防抖保存（滚动等高频事件） */
  const scheduleProgressSave = useCallback((chapterIdx: number, scrollRat?: number) => {
    if (progressSaveTimerRef.current) clearTimeout(progressSaveTimerRef.current);
    progressSaveTimerRef.current = setTimeout(() => {
      progressSaveTimerRef.current = null;
      saveTextProgress(chapterIdx, undefined, scrollRat);
    }, PROGRESS_SAVE_DEBOUNCE);
  }, [saveTextProgress]);

  /** 取消未落地的防抖保存（卸载清理/切换保存目标时） */
  const cancelPendingSave = useCallback(() => {
    if (progressSaveTimerRef.current) {
      clearTimeout(progressSaveTimerRef.current);
      progressSaveTimerRef.current = null;
    }
  }, []);

  /** 卸载兜底保存用的最新快照 */
  const getProgressSnapshot = useCallback((): TextProgressSnapshot => ({
    book: bookRef.current,
    chapters: chaptersRef.current,
    textPagesLength: textPagesLengthRef.current,
  }), []);

  return {
    saveTextProgress,
    scheduleProgressSave,
    cancelPendingSave,
    getProgressSnapshot,
    composeTextProgress,
    /** 镜像 ref：听书自动续播/TTS 起播点等回调读取最新章节与分页结果 */
    chaptersRef,
    textPagesLengthRef,
    textPagesRef,
  };
}
