import { create } from 'zustand';

import { bookRepo } from '@/services/storage/bookRepo';
import { pageRepo } from '@/services/storage/pageRepo';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';

const PRELOAD_RADIUS = 10;
const INITIAL_LOAD_RADIUS = 3;
/** 下一章头部预取页数：覆盖分割线露出 → 跨章晋升 → 晋升后首屏窗口 */
const NEXT_CHAPTER_PREFETCH_COUNT = 6;
/** 上一章尾部预取页数：水平模式回翻跨章即时换装 */
const PREV_CHAPTER_PREFETCH_COUNT = 2;

interface BookCacheEntry {
  chapters: { id: string; title: string; pages: string[] }[];
}

/** 相邻章节预取：urls 按该章页索引对齐（pageCount 长度），未就绪槽位为 null */
interface AdjacentChapterPrefetch {
  chapterId: string;
  title: string;
  pageCount: number;
  urls: (string | null)[];
}

interface ReaderState {
  currentBookId: string | null;
  currentChapterId: string | null;
  currentPage: number;
  totalPages: number;
  direction: 'vertical' | 'horizontal';
  pageLayout: 'single' | 'double';
  isUiVisible: boolean;
  pageUrls: (string | null)[];
  chapterTitle: string;
  chapters: { id: string; title: string; pages: string[] }[];
  isLoading: boolean;
  fullscreenImageUrl: string | null;
  fullscreenPageIndex: number;
  isBottomBarVisible: boolean;
  paperModeEnabled: boolean;
  bookCache: Record<string, BookCacheEntry>;
  /** 下一章头部预取（跨章续读分割线用）；null = 未预取/已消费 */
  nextChapterPrefetch: AdjacentChapterPrefetch | null;
  /** 上一章尾部预取（水平回翻跨章用） */
  prevChapterPrefetch: AdjacentChapterPrefetch | null;

  openBook: (bookId: string, chapterId?: string, startPage?: number) => Promise<void>;
  openChapter: (chapterId: string, startPage?: number) => Promise<void>;
  /** 幂等预取当前章的相邻章节头部/尾部页（不触碰当前 pageUrls） */
  prefetchAdjacentChapters: () => Promise<void>;
  /** 跨章晋升：把下一章预取 URL 原子转为当前 pageUrls；预取未就绪返回 false */
  promoteToNextChapter: (startPage?: number) => boolean;
  loadPage: (pageIndex: number) => Promise<void>;
  loadPageSync: (pageIndex: number) => void;
  ensurePagesAround: (centerPage: number, radius: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  toggleUi: () => void;
  setDirection: (dir: 'vertical' | 'horizontal') => void;
  setPageLayout: (layout: 'single' | 'double') => void;
  closeReader: () => void;
  openFullscreen: (url: string, pageIndex: number) => void;
  closeFullscreen: () => void;
  setBottomBarVisible: (visible: boolean) => void;
  toggleBottomBar: () => void;
  setPaperModeEnabled: (enabled: boolean) => void;
  togglePaperMode: () => void;
}

const loadingPages = new Set<number>();
const failedPages = new Set<number>();
let openBookCounter = 0;
let openChapterCounter = 0;

/** 回收并清空相邻章节预取（未消费的 URL 一并 revoke） */
function clearAdjacentPrefetches(): void {
  const { nextChapterPrefetch, prevChapterPrefetch } = useReaderStore.getState();
  nextChapterPrefetch?.urls.forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
  prevChapterPrefetch?.urls.forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
  if (nextChapterPrefetch || prevChapterPrefetch) {
    useReaderStore.setState({ nextChapterPrefetch: null, prevChapterPrefetch: null });
  }
}

/** 把指定章节的预取 URL 移交出去（所有权转移给 pageUrls，不再回收）；无预取返回 null */
function takePrefetchFor(chapterId: string): (string | null)[] | null {
  const { nextChapterPrefetch, prevChapterPrefetch } = useReaderStore.getState();
  const taken =
    nextChapterPrefetch?.chapterId === chapterId
      ? nextChapterPrefetch
      : prevChapterPrefetch?.chapterId === chapterId
        ? prevChapterPrefetch
        : null;
  if (!taken) return null;
  if (nextChapterPrefetch && nextChapterPrefetch !== taken) {
    nextChapterPrefetch.urls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }
  if (prevChapterPrefetch && prevChapterPrefetch !== taken) {
    prevChapterPrefetch.urls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }
  useReaderStore.setState({ nextChapterPrefetch: null, prevChapterPrefetch: null });
  return taken.urls;
}

export const useReaderStore = create<ReaderState>()((set, get) => ({
  currentBookId: null,
  currentChapterId: null,
  currentPage: 1,
  totalPages: 0,
  direction: 'vertical',
  pageLayout: 'single',
  isUiVisible: false,
  pageUrls: [],
  chapterTitle: '',
  chapters: [],
  isLoading: false,
  fullscreenImageUrl: null,
  fullscreenPageIndex: -1,
  isBottomBarVisible: false,
  paperModeEnabled: useAppStore.getState().settings.paperMode,
  bookCache: {},
  nextChapterPrefetch: null,
  prevChapterPrefetch: null,

  openBook: async (bookId, chapterId, startPage) => {
    const currentCall = ++openBookCounter;
    // 换书使在途的 openChapter 一并失效：两个会话计数器必须同进退，
    // 否则旧书的章节装载会在 await 期间把新书的 pageUrls 当旧页 revoke 掉（跨书竞态）
    openChapterCounter += 1;
    set({ isLoading: true, isUiVisible: false });
    try {
      const cached = get().bookCache[bookId];
      let chapters: { id: string; title: string; pages: string[] }[];

      if (cached) {
        chapters = cached.chapters;
      } else {
        const libraryBook = useLibraryStore.getState().getBookById(bookId);
        if (libraryBook) {
          chapters = libraryBook.chapters;
        } else {
          const bookData = await bookRepo.get(bookId);
          if (!bookData) {
            if (currentCall === openBookCounter) set({ isLoading: false });
            return;
          }
          chapters = bookData.chapters as { id: string; title: string; pages: string[] }[];
        }
        set((state) => ({
          bookCache: { ...state.bookCache, [bookId]: { chapters } },
        }));
      }

      if (currentCall !== openBookCounter) return;

      const progress = useLibraryStore.getState().readingProgress[bookId];
      const targetChapterId = chapterId ?? progress?.chapterId;
      const targetChapter = targetChapterId
        ? chapters.find((ch) => ch.id === targetChapterId)
        : chapters[0];

      if (!targetChapter) {
        if (currentCall === openBookCounter) set({ isLoading: false });
        return;
      }

      const pageCount = targetChapter.pages.length;
      const resolvedChapterId = targetChapter.id;
      const title = targetChapter.title;

      let resolvedStartPage = startPage ?? 1;
      if (!startPage) {
        if (progress && progress.chapterId === resolvedChapterId && progress.page > 0) {
          resolvedStartPage = Math.max(1, Math.min(progress.page, pageCount));
        } else if (progress && progress.globalPageIndex > 0 && progress.totalImages > 0) {
          const totalImagesBeforeThisChapter = chapters
            .slice(0, chapters.findIndex((ch) => ch.id === resolvedChapterId))
            .reduce((sum, ch) => sum + ch.pages.length, 0);
          const relativeIndex = progress.globalPageIndex - totalImagesBeforeThisChapter;
          resolvedStartPage = Math.max(1, Math.min(relativeIndex, pageCount));
        }
      } else {
        resolvedStartPage = Math.max(1, Math.min(startPage, pageCount));
      }

      if (currentCall !== openBookCounter) return;

      get().pageUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      clearAdjacentPrefetches();
      loadingPages.clear();
      failedPages.clear();

      const initialUrls: (string | null)[] = new Array(pageCount).fill(null);
      set({
        currentBookId: bookId,
        currentChapterId: resolvedChapterId,
        currentPage: resolvedStartPage,
        totalPages: pageCount,
        pageUrls: initialUrls,
        chapterTitle: title,
        chapters,
      });

      const center = resolvedStartPage - 1;
      const criticalPages: Promise<void>[] = [];
      for (let offset = 0; offset <= INITIAL_LOAD_RADIUS; offset++) {
        const after = center + offset;
        const before = center - offset;
        if (after < pageCount) criticalPages.push(get().loadPage(after));
        if (before >= 0 && before !== after && offset > 0) criticalPages.push(get().loadPage(before));
      }
      await Promise.all(criticalPages);

      if (currentCall !== openBookCounter) return;

      set({ isLoading: false });

      for (let offset = INITIAL_LOAD_RADIUS + 1; offset <= PRELOAD_RADIUS; offset++) {
        const after = center + offset;
        const before = center - offset;
        if (after < pageCount) get().loadPageSync(after);
        if (before >= 0) get().loadPageSync(before);
      }
    } catch {
      if (currentCall === openBookCounter) set({ isLoading: false });
    }
  },

  loadPage: async (pageIndex) => {
    const { currentBookId, currentChapterId, pageUrls, totalPages } = get();
    if (!currentBookId || !currentChapterId) return;
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    if (pageUrls[pageIndex] !== null) return;
    if (loadingPages.has(pageIndex)) return;
    if (failedPages.has(pageIndex)) return;

    loadingPages.add(pageIndex);
    try {
      const bookId = currentBookId;
      const chapterId = currentChapterId;
      const blob = await pageRepo.getPage(bookId, chapterId, pageIndex);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const currentState = get();
        if (
          currentState.currentBookId === bookId &&
          currentState.currentChapterId === chapterId &&
          pageIndex < currentState.pageUrls.length &&
          currentState.pageUrls[pageIndex] === null
        ) {
          set((state) => {
            const newUrls = [...state.pageUrls];
            newUrls[pageIndex] = url;
            return { pageUrls: newUrls };
          });
        } else {
          URL.revokeObjectURL(url);
        }
      } else {
        failedPages.add(pageIndex);
      }
    } finally {
      loadingPages.delete(pageIndex);
    }
  },

  loadPageSync: (pageIndex) => {
    const { currentBookId, currentChapterId, pageUrls, totalPages } = get();
    if (!currentBookId || !currentChapterId) return;
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    if (pageUrls[pageIndex] !== null) return;
    if (loadingPages.has(pageIndex)) return;
    if (failedPages.has(pageIndex)) return;

    get().loadPage(pageIndex);
  },

  ensurePagesAround: (centerPage, radius) => {
    const { totalPages } = get();
    const center = centerPage - 1;
    get().loadPageSync(center);
    for (let offset = 1; offset <= radius; offset++) {
      const after = center + offset;
      const before = center - offset;
      if (after < totalPages) get().loadPageSync(after);
      if (before >= 0) get().loadPageSync(before);
    }
  },

  nextPage: () => {
    const state = get();
    const newPage = Math.min(state.currentPage + 1, state.totalPages);
    set({ currentPage: newPage });
    if (newPage !== state.currentPage) {
      get().ensurePagesAround(newPage, PRELOAD_RADIUS);
    }
  },

  prevPage: () => {
    const state = get();
    const newPage = Math.max(state.currentPage - 1, 1);
    set({ currentPage: newPage });
    if (newPage !== state.currentPage) {
      get().ensurePagesAround(newPage, PRELOAD_RADIUS);
    }
  },

  goToPage: (page) => {
    const { totalPages } = get();
    const newPage = Math.max(1, Math.min(page, totalPages));
    set({ currentPage: newPage });
    get().ensurePagesAround(newPage, PRELOAD_RADIUS);
  },

  toggleUi: () =>
    set((state) => ({ isUiVisible: !state.isUiVisible })),

  setDirection: (dir) => set({ direction: dir }),
  setPageLayout: (layout) => set({ pageLayout: layout }),

  openChapter: async (chapterId, startPage) => {
    const { currentBookId, chapters, bookCache, currentChapterId: fromChapterId } = get();
    if (!currentBookId) return;

    const cached = bookCache[currentBookId];
    const chapterList = cached ? cached.chapters : chapters;
    const targetChapter = chapterList.find((ch) => ch.id === chapterId);
    if (!targetChapter) return;

    const pageCount = targetChapter.pages.length;

    // 同章重选：不重载直接定位，避免无谓的整屏占位打断
    if (chapterId === fromChapterId) {
      get().goToPage(Math.max(1, Math.min(startPage ?? 1, pageCount)));
      return;
    }

    const currentCall = ++openChapterCounter;
    const resolvedStartPage = startPage ? Math.max(1, Math.min(startPage, pageCount)) : 1;
    const center = resolvedStartPage - 1;

    // 先备好关键页再换装：旧章画面保持可见，跨章瞬间不出现整屏加载占位
    const prepared: (string | null)[] = takePrefetchFor(chapterId)
      ?? new Array<string | null>(pageCount).fill(null);
    const extractInto = async (pageIndex: number) => {
      if (pageIndex < 0 || pageIndex >= pageCount || prepared[pageIndex] !== null) return;
      try {
        const blob = await pageRepo.getPage(currentBookId, chapterId, pageIndex);
        if (!blob || currentCall !== openChapterCounter || prepared[pageIndex] !== null) {
          if (blob) {
            const stale = URL.createObjectURL(blob);
            URL.revokeObjectURL(stale);
          }
          return;
        }
        prepared[pageIndex] = URL.createObjectURL(blob);
      } catch {
        // 单页提取失败不阻塞换装，留给常规 loadPage 兜底
      }
    };
    const criticalPages: Promise<void>[] = [];
    for (let offset = 0; offset <= INITIAL_LOAD_RADIUS; offset++) {
      const after = center + offset;
      const before = center - offset;
      if (after < pageCount) criticalPages.push(extractInto(after));
      if (before >= 0 && before !== after && offset > 0) criticalPages.push(extractInto(before));
    }
    await Promise.all(criticalPages);
    // 换装前校验仍在同一本书：await 期间 openBook 可能已换书，旧书结果一律丢弃
    if (currentCall !== openChapterCounter || get().currentBookId !== currentBookId) return;

    // 原子换装
    get().pageUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    clearAdjacentPrefetches();
    loadingPages.clear();
    failedPages.clear();
    set({
      currentChapterId: chapterId,
      currentPage: resolvedStartPage,
      totalPages: pageCount,
      pageUrls: prepared,
      chapterTitle: targetChapter.title,
      isUiVisible: false,
    });

    for (let offset = INITIAL_LOAD_RADIUS + 1; offset <= PRELOAD_RADIUS; offset++) {
      const after = center + offset;
      const before = center - offset;
      if (after < pageCount) get().loadPageSync(after);
      if (before >= 0) get().loadPageSync(before);
    }
  },

  prefetchAdjacentChapters: async () => {
    const { currentBookId, currentChapterId, chapters } = get();
    if (!currentBookId || !currentChapterId) return;
    const index = chapters.findIndex((ch) => ch.id === currentChapterId);
    if (index < 0) return;
    const next = index < chapters.length - 1 ? chapters[index + 1] : null;
    const prev = index > 0 ? chapters[index - 1] : null;

    // 占位先行同步写入：并发调用由 chapterId 判重挡下
    if (next && get().nextChapterPrefetch?.chapterId !== next.id) {
      set({
        nextChapterPrefetch: {
          chapterId: next.id,
          title: next.title,
          pageCount: next.pages.length,
          urls: new Array<string | null>(next.pages.length).fill(null),
        },
      });
    }
    if (prev && get().prevChapterPrefetch?.chapterId !== prev.id) {
      set({
        prevChapterPrefetch: {
          chapterId: prev.id,
          title: prev.title,
          pageCount: prev.pages.length,
          urls: new Array<string | null>(prev.pages.length).fill(null),
        },
      });
    }

    const fillPrefetch = async (
      chapterId: string,
      pageIndexes: number[],
      slot: 'nextChapterPrefetch' | 'prevChapterPrefetch'
    ) => {
      for (const pageIndex of pageIndexes) {
        // 已就绪/已消费/已换章的槽位直接跳过，不做多余提取
        const before = get()[slot];
        if (!before || before.chapterId !== chapterId || before.urls[pageIndex] !== null) continue;
        let blob: Blob | undefined;
        try {
          blob = await pageRepo.getPage(currentBookId, chapterId, pageIndex);
        } catch {
          continue;
        }
        if (!blob) continue;
        const pf = get()[slot];
        if (!pf || pf.chapterId !== chapterId || pf.urls[pageIndex] !== null) continue;
        const urls = [...pf.urls];
        urls[pageIndex] = URL.createObjectURL(blob);
        set({ [slot]: { ...pf, urls } } as Partial<ReaderState>);
      }
    };

    if (next) {
      const count = Math.min(NEXT_CHAPTER_PREFETCH_COUNT, next.pages.length);
      await fillPrefetch(next.id, Array.from({ length: count }, (_, i) => i), 'nextChapterPrefetch');
    }
    if (prev) {
      const count = Math.min(PREV_CHAPTER_PREFETCH_COUNT, prev.pages.length);
      const pageCount = prev.pages.length;
      await fillPrefetch(
        prev.id,
        Array.from({ length: count }, (_, i) => pageCount - 1 - i),
        'prevChapterPrefetch'
      );
    }
  },

  promoteToNextChapter: (startPage = 1) => {
    const pf = get().nextChapterPrefetch;
    if (!pf || pf.pageCount <= 0 || pf.urls[0] === null) return false;

    const oldUrls = get().pageUrls;
    const prevUrls = get().prevChapterPrefetch?.urls ?? [];
    set({
      currentChapterId: pf.chapterId,
      chapterTitle: pf.title,
      totalPages: pf.pageCount,
      currentPage: Math.max(1, Math.min(startPage, pf.pageCount)),
      pageUrls: [...pf.urls],
      nextChapterPrefetch: null,
      prevChapterPrefetch: null,
    });
    oldUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    prevUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });

    // 新章就位后立刻预取它的下一章，连续追读不回头等
    void get().prefetchAdjacentChapters();
    return true;
  },

  closeReader: () => {
    const { pageUrls } = get();
    pageUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    clearAdjacentPrefetches();
    loadingPages.clear();
    failedPages.clear();
    set({
      currentBookId: null,
      currentChapterId: null,
      currentPage: 1,
      totalPages: 0,
      isUiVisible: false,
      pageUrls: [],
      chapterTitle: '',
      chapters: [],
      fullscreenImageUrl: null,
      fullscreenPageIndex: -1,
      isBottomBarVisible: false,
      pageLayout: 'single',
    });
  },

  openFullscreen: (url, pageIndex) =>
    set({ fullscreenImageUrl: url, fullscreenPageIndex: pageIndex }),

  closeFullscreen: () =>
    set({ fullscreenImageUrl: null, fullscreenPageIndex: -1 }),

  setBottomBarVisible: (visible) => set({ isBottomBarVisible: visible }),

  toggleBottomBar: () =>
    set((state) => ({ isBottomBarVisible: !state.isBottomBarVisible })),

  setPaperModeEnabled: (enabled) => {
    useAppStore.getState().updateSettings({ paperMode: enabled });
    set({ paperModeEnabled: enabled });
  },

  togglePaperMode: () => {
    const current = get().paperModeEnabled;
    useAppStore.getState().updateSettings({ paperMode: !current });
    set({ paperModeEnabled: !current });
  },
}));
