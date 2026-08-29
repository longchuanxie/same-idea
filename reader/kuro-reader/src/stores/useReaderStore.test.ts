import { describe, it, expect, beforeEach, vi } from 'vitest'

// useReaderStore 仅调用 useLibraryStore.getState()，用最小桩替代整个 store，
// 避免加载真实 library store 带来的 parser/IndexedDB 依赖
const { libraryGetState } = vi.hoisted(() => ({ libraryGetState: vi.fn() }))

vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: { getState: libraryGetState },
}))
vi.mock('@/services/storage/bookRepo', () => ({
  bookRepo: { get: vi.fn(), save: vi.fn(), saveCover: vi.fn(), deleteFully: vi.fn() },
}))
vi.mock('@/services/storage/pageRepo', () => ({
  pageRepo: { getPage: vi.fn(), savePage: vi.fn() },
}))

import { bookRepo } from '@/services/storage/bookRepo'
import { pageRepo } from '@/services/storage/pageRepo'
import { useAppStore } from '@/stores/useAppStore'
import { useReaderStore } from '@/stores/useReaderStore'

const bookRepoMock = vi.mocked(bookRepo, true)
const pageRepoMock = vi.mocked(pageRepo, true)

const createObjectURLMock = vi.fn()
const revokeObjectURLMock = vi.fn()

const makeChapters = () => [
  { id: 'ch1', title: '第一章', pages: Array.from({ length: 10 }, (_, i) => `p${i}.jpg`) },
  { id: 'ch2', title: '第二章', pages: Array.from({ length: 5 }, (_, i) => `q${i}.jpg`) },
]

const stubLibrary = (options: { book?: unknown; readingProgress?: Record<string, unknown> } = {}) => {
  libraryGetState.mockReturnValue({
    getBookById: vi.fn().mockReturnValue(options.book ?? undefined),
    readingProgress: options.readingProgress ?? {},
  })
}

beforeEach(async () => {
  // 冲刷上一用例遗留的 fire-and-forget 预加载 Promise，避免其 resolve 时污染本用例
  await new Promise((resolve) => setTimeout(resolve, 0))

  libraryGetState.mockReset()
  stubLibrary()

  // 本文件需要断言 create/revoke 的调用，用可追踪的桩覆盖 setup.ts 的全局桩
  let seq = 0
  createObjectURLMock.mockImplementation(() => `blob:page-${++seq}`)
  URL.createObjectURL = createObjectURLMock as unknown as typeof URL.createObjectURL
  URL.revokeObjectURL = revokeObjectURLMock as unknown as typeof URL.revokeObjectURL

  pageRepoMock.getPage.mockResolvedValue(new Blob(['img']))

  // closeReader 会 revoke 上一用例遗留的 URL，先清理再清零调用记录
  useReaderStore.getState().closeReader()
  useReaderStore.setState({ bookCache: {} })
  vi.clearAllMocks()
})

describe('page navigation', () => {
  it('nextPage/prevPage clamp at boundaries', () => {
    useReaderStore.setState({
      currentPage: 1,
      totalPages: 5,
      // 预填充 URL，避免触发预加载 IO
      pageUrls: ['blob:a', 'blob:b', 'blob:c', 'blob:d', 'blob:e'],
    })

    const store = useReaderStore.getState()
    store.nextPage()
    expect(useReaderStore.getState().currentPage).toBe(2)
    store.prevPage()
    store.prevPage()
    expect(useReaderStore.getState().currentPage).toBe(1)

    useReaderStore.setState({ currentPage: 5 })
    useReaderStore.getState().nextPage()
    expect(useReaderStore.getState().currentPage).toBe(5)
  })

  it('goToPage clamps to [1, totalPages]', () => {
    useReaderStore.setState({
      currentPage: 1,
      totalPages: 5,
      pageUrls: ['blob:a', 'blob:b', 'blob:c', 'blob:d', 'blob:e'],
    })

    const store = useReaderStore.getState()
    store.goToPage(99)
    expect(useReaderStore.getState().currentPage).toBe(5)
    store.goToPage(0)
    expect(useReaderStore.getState().currentPage).toBe(1)
    store.goToPage(3)
    expect(useReaderStore.getState().currentPage).toBe(3)
  })
})

describe('openBook', () => {
  it('resumes at progress.page of the same chapter', async () => {
    stubLibrary({
      book: { chapters: makeChapters() },
      readingProgress: {
        b1: { chapterId: 'ch2', page: 3, percentage: 40, globalPageIndex: 12, totalImages: 15 },
      },
    })

    await useReaderStore.getState().openBook('b1')

    const state = useReaderStore.getState()
    expect(state.currentChapterId).toBe('ch2')
    expect(state.chapterTitle).toBe('第二章')
    expect(state.currentPage).toBe(3)
    expect(state.totalPages).toBe(5)
    expect(state.pageUrls).toHaveLength(5)
    expect(state.isLoading).toBe(false)
    // 命中书库数据时无需查询 IndexedDB
    expect(bookRepoMock.get).not.toHaveBeenCalled()
  })

  it('resumes from globalPageIndex when progress points to another chapter', async () => {
    stubLibrary({
      book: { chapters: makeChapters() },
      readingProgress: {
        // 进度停在 ch1 第 4 页，但显式打开 ch2：globalPageIndex=12，ch1 共 10 页 → ch2 相对第 2 页
        b1: { chapterId: 'ch1', page: 4, percentage: 20, globalPageIndex: 12, totalImages: 15 },
      },
    })

    await useReaderStore.getState().openBook('b1', 'ch2')

    const state = useReaderStore.getState()
    expect(state.currentChapterId).toBe('ch2')
    expect(state.currentPage).toBe(2)
  })

  it('falls back to bookRepo when library has no book and bails when missing', async () => {
    stubLibrary()
    bookRepoMock.get.mockResolvedValue(undefined)

    useReaderStore.setState({ currentBookId: 'old' })
    await useReaderStore.getState().openBook('missing')

    expect(bookRepoMock.get).toHaveBeenCalledWith('missing')
    const state = useReaderStore.getState()
    expect(state.currentBookId).toBe('old')
    expect(state.isLoading).toBe(false)
  })

  it('clamps explicit startPage into chapter page count', async () => {
    stubLibrary({ book: { chapters: makeChapters() } })

    await useReaderStore.getState().openBook('b1', 'ch2', 99)

    expect(useReaderStore.getState().currentPage).toBe(5)
  })
})

describe('loadPage', () => {
  it('discards stale result when chapter changed mid-flight', async () => {
    useReaderStore.setState({
      currentBookId: 'b1',
      currentChapterId: 'ch1',
      currentPage: 1,
      totalPages: 2,
      pageUrls: [null, null],
    })

    let resolveBlob!: (blob: Blob) => void
    pageRepoMock.getPage.mockReturnValue(
      new Promise<Blob | undefined>((resolve) => {
        resolveBlob = resolve
      })
    )

    const pending = useReaderStore.getState().loadPage(0)
    // 加载期间章节被切换
    useReaderStore.setState({ currentChapterId: 'ch2' })

    resolveBlob(new Blob(['img']))
    await pending

    expect(useReaderStore.getState().pageUrls[0]).toBeNull()
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:page-1')
  })

  it('marks missing pages as failed and does not retry', async () => {
    useReaderStore.setState({
      currentBookId: 'b1',
      currentChapterId: 'ch1',
      currentPage: 1,
      totalPages: 2,
      pageUrls: [null, null],
    })
    pageRepoMock.getPage.mockResolvedValue(undefined)

    await useReaderStore.getState().loadPage(0)
    await useReaderStore.getState().loadPage(0)

    expect(pageRepoMock.getPage).toHaveBeenCalledTimes(1)
  })
})

describe('openChapter & closeReader', () => {
  it('openChapter resets chapter state and revokes previous URLs', async () => {
    useReaderStore.setState({
      currentBookId: 'b1',
      currentChapterId: 'ch1',
      currentPage: 1,
      totalPages: 2,
      pageUrls: ['blob:old-a', 'blob:old-b'],
      chapters: makeChapters(),
    })

    await useReaderStore.getState().openChapter('ch2', 99)

    const state = useReaderStore.getState()
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:old-a')
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:old-b')
    expect(state.currentChapterId).toBe('ch2')
    expect(state.chapterTitle).toBe('第二章')
    expect(state.currentPage).toBe(5)
    expect(state.totalPages).toBe(5)
    expect(state.pageUrls).toHaveLength(5)
  })

  it('closeReader revokes all URLs and resets state', () => {
    useReaderStore.setState({
      currentBookId: 'b1',
      currentChapterId: 'ch1',
      currentPage: 3,
      totalPages: 2,
      pageUrls: ['blob:a', 'blob:b'],
      chapterTitle: '第一章',
      chapters: makeChapters(),
      isUiVisible: true,
    })

    useReaderStore.getState().closeReader()

    const state = useReaderStore.getState()
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(2)
    expect(state.currentBookId).toBeNull()
    expect(state.currentChapterId).toBeNull()
    expect(state.currentPage).toBe(1)
    expect(state.totalPages).toBe(0)
    expect(state.pageUrls).toEqual([])
    expect(state.isUiVisible).toBe(false)
  })
})

describe('paper mode sync', () => {
  it('togglePaperMode flips store and app settings together', () => {
    const before = useReaderStore.getState().paperModeEnabled

    useReaderStore.getState().togglePaperMode()

    expect(useReaderStore.getState().paperModeEnabled).toBe(!before)
    expect(useAppStore.getState().settings.paperMode).toBe(!before)

    // 还原，避免污染其他用例
    useReaderStore.getState().togglePaperMode()
  })
})
