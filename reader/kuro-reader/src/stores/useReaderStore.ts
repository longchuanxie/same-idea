import { create } from 'zustand';

import { bookRepo } from '@/services/storage/bookRepo';
import { pageRepo } from '@/services/storage/pageRepo';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';

const PRELOAD_RADIUS = 10;
const INITIAL_LOAD_RADIUS = 3;

interface BookCacheEntry {
  chapters: { id: string; title: string; pages: string[] }[];
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

  openBook: (bookId: string, chapterId?: string, startPage?: number) => Promise<void>;
  openChapter: (chapterId: string, startPage?: number) => Promise<void>;
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

  openBook: async (bookId, chapterId, startPage) => {
    const currentCall = ++openBookCounter;
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
    const { currentBookId, chapters, bookCache } = get();
    if (!currentBookId) return;

    const cached = bookCache[currentBookId];
    const chapterList = cached ? cached.chapters : chapters;
    const targetChapter = chapterList.find((ch) => ch.id === chapterId);
    if (!targetChapter) return;

    const pageCount = targetChapter.pages.length;
    const resolvedStartPage = startPage ? Math.max(1, Math.min(startPage, pageCount)) : 1;

    get().pageUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
    loadingPages.clear();
    failedPages.clear();

    const initialUrls: (string | null)[] = new Array(pageCount).fill(null);
    set({
      currentChapterId: chapterId,
      currentPage: resolvedStartPage,
      totalPages: pageCount,
      pageUrls: initialUrls,
      chapterTitle: targetChapter.title,
      isUiVisible: false,
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

    for (let offset = INITIAL_LOAD_RADIUS + 1; offset <= PRELOAD_RADIUS; offset++) {
      const after = center + offset;
      const before = center - offset;
      if (after < pageCount) get().loadPageSync(after);
      if (before >= 0) get().loadPageSync(before);
    }
  },

  closeReader: () => {
    const { pageUrls } = get();
    pageUrls.forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
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
