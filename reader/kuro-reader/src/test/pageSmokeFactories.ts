import { vi } from 'vitest'

import type { Book, Tag } from '@/types'

/** 页面冒烟测试共用的 fixture 工厂（store mock 的返回形状保持最小够用） */

export function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'b1',
    title: '冒烟测试书',
    author: '作者',
    description: '',
    format: 'text',
    status: 'ongoing',
    isFavorite: false,
    addedAt: new Date('2026-08-01'),
    chapters: [{ id: 'ch-1', title: '第一章', status: 'unread' }],
    genres: [],
    tagIds: [],
    tags: [],
    sublibraryId: null,
    ...overrides,
  } as Book
}

export function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 'tag-1',
    name: '标签一',
    bookIds: ['b1'],
    createdAt: new Date('2026-08-01'),
    ...overrides,
  } as Tag
}

export function makeLibraryStoreState(overrides: Record<string, unknown> = {}) {
  return {
    books: [makeBook()],
    subLibraries: [{ id: 'sub-1', name: '特藏书库', bookIds: ['b1'], createdAt: new Date('2026-08-01') }],
    tags: [makeTag()],
    coverUrls: {},
    readingProgress: {},
    isLoading: false,
    error: null,
    // actions
    loadBooks: vi.fn(),
    importFile: vi.fn(),
    removeBook: vi.fn(),
    batchDelete: vi.fn(),
    batchMarkAsRead: vi.fn(),
    toggleFavorite: vi.fn(),
    updateBook: vi.fn(),
    updateProgress: vi.fn(),
    createSubLibrary: vi.fn(),
    addBooksToSubLibrary: vi.fn(),
    removeBooksFromSubLibrary: vi.fn(),
    renameSubLibrary: vi.fn(),
    deleteSubLibrary: vi.fn(),
    batchDeleteSubLibraries: vi.fn(),
    createTag: vi.fn(),
    renameTag: vi.fn(),
    deleteTag: vi.fn(),
    addTagToBook: vi.fn(),
    removeTagFromBook: vi.fn(),
    getBookById: vi.fn(() => makeBook()),
    getBooksByTag: vi.fn(() => []),
    getContinueReading: vi.fn(() => []),
    dismissContinueReading: vi.fn(),
    restoreContinueReading: vi.fn(),
    ...overrides,
  }
}

/** 把状态对象包成 zustand store mock（组件调用 + 静态读取双形态） */
export function wrapAsStoreMock(state: Record<string, unknown>) {
  const fn = vi.fn(() => state)
  return Object.assign(fn, { getState: vi.fn(() => state) })
}

export function makeStatsStoreState(overrides: Record<string, unknown> = {}) {
  return {
    readingSessions: [{ date: '2026-09-01', minutes: 30, bookId: 'b1' }],
    dailyGoalMinutes: 30,
    getTodayMinutes: vi.fn(() => 30),
    getStats: vi.fn(() => ({
      totalMinutes: 30,
      totalBooks: 1,
      weeklyData: Array.from({ length: 7 }, (_, i) => ({ day: `周${i}`, hours: i === 0 ? 0.5 : 0 })),
      currentStreak: 1,
      longestStreak: 1,
      favoriteHour: 21,
      completedCount: 0,
    })),
    setDailyGoalMinutes: vi.fn(),
    stats: { currentStreak: 1, totalMinutes: 30 },
    ...overrides,
  }
}

export function makeAppStoreState(overrides: Record<string, unknown> = {}) {
  return {
    theme: 'auto',
    settings: {
      theme: 'auto',
      paperMode: false,
      paperType: 'rice',
      textureIntensity: 50,
      readingDirection: 'ltr',
      pageTurnGestures: true,
      cloudSync: false,
      fontSize: 18,
      fontFamily: 'literata',
      brightness: 100,
      colorTemperature: 0,
      auth: { isEnabled: false, lockTimeout: 300000, maxAttempts: 5 },
      readingTheme: 'default',
      textFontFamily: 'literata',
      textAlign: 'left',
      firstLineIndent: true,
      textLineHeight: 1.8,
      tapZoneEnabled: true,
      autoAdvanceTextChapter: false,
      autoScrollSpeed: 40,
      textReadingMode: 'scroll',
      verticalWriting: false,
      ttsEngine: 'auto',
      ttsServerUrl: '',
      ttsServerModel: '',
      ttsServerVoice: '',
    },
    updateSettings: vi.fn(),
    setAuthenticated: vi.fn(),
    verifyGestureLock: vi.fn(async () => true),
    setupGestureLock: vi.fn(),
    verifySecurityQuestions: vi.fn(async () => true),
    resetLockViaSecurityQuestions: vi.fn(async () => true),
    togglePaperMode: vi.fn(),
    ...overrides,
  }
}
