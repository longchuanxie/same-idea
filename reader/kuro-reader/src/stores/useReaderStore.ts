import { create } from 'zustand';

import * as db from '@/services/storageService';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';

const PRELOAD_RADIUS = 10;
const INITIAL_LOAD_RADIUS = 3;

interface ComicCacheEntry {
  chapters: { id: string; title: string; pages: string[] }[];
}

interface ReaderState {
  currentComicId: string | null;
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
  comicCache: Record<string, ComicCacheEntry>;

  openComic: (comicId: string, chapterId?: string, startPage?: number) => Promise<void>;
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
let openComicCounter = 0;

export const useReaderStore = create<ReaderState>()((set, get) => ({
  currentComicId: null,
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
  comicCache: {},

  openComic: async (comicId, chapterId, startPage) => {
    const currentCall = ++openComicCounter;
    set({ isLoading: true, isUiVisible: false });
    try {
      const cached = get().comicCache[comicId];
      let chapters: { id: string; title: string; pages: string[] }[];

      if (cached) {
        chapters = cached.chapters;
      } else {
        const libraryComic = useLibraryStore.getState().getComicById(comicId);
        if (libraryComic) {
          chapters = libraryComic.chapters;
        } else {
          const comicData = await db.getComic(comicId);
          if (!comicData) {
            if (currentCall === openComicCounter) set({ isLoading: false });
            return;
          }
          chapters = comicData.chapters as { id: string; title: string; pages: string[] }[];
        }
        set((state) => ({
          comicCache: { ...state.comicCache, [comicId]: { chapters } },
        }));
      }

      if (currentCall !== openComicCounter) return;

      const progress = useLibraryStore.getState().readingProgress[comicId];
      const targetChapterId = chapterId ?? progress?.chapterId;
      const targetChapter = targetChapterId
        ? chapters.find((ch) => ch.id === targetChapterId)
        : chapters[0];

      if (!targetChapter) {
        if (currentCall === openComicCounter) set({ isLoading: false });
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

      if (currentCall !== openComicCounter) return;

      get().pageUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      loadingPages.clear();
      failedPages.clear();

      const initialUrls: (string | null)[] = new Array(pageCount).fill(null);
      set({
        currentComicId: comicId,
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

      if (currentCall !== openComicCounter) return;

      set({ isLoading: false });

      for (let offset = INITIAL_LOAD_RADIUS + 1; offset <= PRELOAD_RADIUS; offset++) {
        const after = center + offset;
        const before = center - offset;
        if (after < pageCount) get().loadPageSync(after);
        if (before >= 0) get().loadPageSync(before);
      }
    } catch {
      if (currentCall === openComicCounter) set({ isLoading: false });
    }
  },

  loadPage: async (pageIndex) => {
    const { currentComicId, currentChapterId, pageUrls, totalPages } = get();
    if (!currentComicId || !currentChapterId) return;
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    if (pageUrls[pageIndex] !== null) return;
    if (loadingPages.has(pageIndex)) return;
    if (failedPages.has(pageIndex)) return;

    loadingPages.add(pageIndex);
    try {
      const comicId = currentComicId;
      const chapterId = currentChapterId;
      const blob = await db.getPage(comicId, chapterId, pageIndex);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const currentState = get();
        if (
          currentState.currentComicId === comicId &&
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
    const { currentComicId, currentChapterId, pageUrls, totalPages } = get();
    if (!currentComicId || !currentChapterId) return;
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
    const { currentComicId, chapters, comicCache } = get();
    if (!currentComicId) return;

    const cached = comicCache[currentComicId];
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
      currentComicId: null,
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
