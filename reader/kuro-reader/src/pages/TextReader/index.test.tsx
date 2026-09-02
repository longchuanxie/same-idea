import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// jsdom 缺 matchMedia（useLandscapeViewport 与初始视口判定需要）
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
    }),
    configurable: true,
  })
}

const fullSettings = {
  theme: 'auto' as const,
  paperMode: false,
  paperType: 'rice' as const,
  textureIntensity: 50,
  readingDirection: 'ltr' as const,
  pageTurnGestures: true,
  cloudSync: false,
  fontSize: 18,
  fontFamily: 'literata' as const,
  brightness: 100,
  colorTemperature: 0,
  auth: { isEnabled: false, lockTimeout: 300000, maxAttempts: 5 },
  readingTheme: 'default' as const,
  textFontFamily: 'literata' as const,
  textAlign: 'left' as const,
  firstLineIndent: true,
  textLineHeight: 1.8,
  tapZoneEnabled: true,
  autoAdvanceTextChapter: false,
  autoScrollSpeed: 40,
  textReadingMode: 'scroll' as const,
  verticalWriting: false,
  ttsEngine: 'auto' as const,
  ttsServerUrl: '',
  ttsServerModel: '',
  ttsServerVoice: '',
}

vi.mock('@/stores/useAppStore', () => ({
  useAppStore: Object.assign(
    vi.fn(() => ({ settings: fullSettings, theme: 'auto' })),
    { getState: vi.fn(() => ({ settings: fullSettings, updateSettings: vi.fn() })) }
  ),
}))

const fakeBook = {
  id: 'b1',
  title: '页面测试小说',
  format: 'text',
  isFavorite: false,
  addedAt: new Date('2026-08-01'),
  chapters: [{ id: 'ch-1', title: '第一章' }, { id: 'ch-2', title: '第二章' }],
  genres: [],
}

vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: Object.assign(
    vi.fn(() => ({
      books: [fakeBook],
      getBookById: vi.fn(() => fakeBook),
      updateProgress: vi.fn(),
      toggleFavorite: vi.fn(),
    })),
    {
      getState: vi.fn(() => ({
        books: [fakeBook],
        readingProgress: {},
        loadBooks: vi.fn(),
        updateProgress: vi.fn(),
        toggleFavorite: vi.fn(),
      })),
    }
  ),
}))

vi.mock('@/services/textContent', () => ({
  loadTextContent: vi.fn(async () => ({
    chapters: [
      { id: 'ch-1', title: '第一章', content: '这是第一章的正文内容，用于页面冒烟断言。' },
      { id: 'ch-2', title: '第二章', content: '第二章正文。' },
    ],
    isEpub: false,
    isMarkdown: false,
  })),
  resolveTextChapterIndex: vi.fn(() => 0),
}))

vi.mock('@/services/storage/annotationRepo', () => ({
  annotationRepo: { getByBookId: vi.fn(async () => []), add: vi.fn(), update: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/storage/bookmarkRepo', () => ({
  bookmarkRepo: { getByBookId: vi.fn(async () => []), add: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/tts/piperEngine', () => ({ piperModelStored: vi.fn(async () => false) }))
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: vi.fn(() => ({
    supported: false,
    speak: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setRate: vi.fn(),
    rate: 1,
    paused: false,
    engineLabel: 'auto',
  })),
}))
vi.mock('@/hooks/useReadingStats', () => ({ useReadingStats: vi.fn() }))
vi.mock('@/hooks/useWakeLock', () => ({ useWakeLock: vi.fn() }))
vi.mock('@/hooks/useAutoScroll', () => ({
  useAutoScroll: vi.fn(() => ({ isAutoScrolling: false, toggleAutoScroll: vi.fn() })),
}))
vi.mock('@/hooks/useEstimatedTimeLeft', () => ({ useEstimatedTimeLeft: vi.fn(() => null) }))

import { TextReaderPage } from '@/pages/TextReader'

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/text-reader/b1']}>
      <Routes>
        <Route path="/text-reader/:bookId/:chapterId?" element={<TextReaderPage />} />
      </Routes>
    </MemoryRouter>
  )

describe('TextReader 页面冒烟', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('滚动模式：加载章节并渲染正文与文章容器', async () => {
    renderPage()
    // 章节内容异步加载完成后出现在文章容器内
    expect(await screen.findByText(/这是第一章的正文内容/)).toBeTruthy()
    // 滚动模式的文章容器挂载（选区检测/几何计算都依赖该标记）
    await waitFor(() => {
      expect(document.querySelector('[data-reader-article]')).toBeTruthy()
    })
  })

  it('点击正文切换顶部 UI（标题/进度条出现）', async () => {
    renderPage()
    const article = await waitFor(() => {
      const el = document.querySelector('[data-reader-article]') as HTMLElement | null
      expect(el).toBeTruthy()
      return el as HTMLElement
    })
    article.click()
    // 顶栏渲染书名
    await waitFor(() => {
      expect(screen.getByText('页面测试小说')).toBeTruthy()
    })
  })
})
