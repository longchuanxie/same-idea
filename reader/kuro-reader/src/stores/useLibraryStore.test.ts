import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/parsers', () => ({
  getParserForFile: vi.fn(),
}))
vi.mock('@/services/parsers/comicArchiveParser', () => ({
  ComicArchiveParser: class {},
}))
vi.mock('@/services/storage/bookRepo', () => ({
  bookRepo: {
    getAll: vi.fn(),
    get: vi.fn(),
    save: vi.fn(),
    saveCover: vi.fn(),
    getCover: vi.fn(),
    deleteFully: vi.fn(),
  },
}))
vi.mock('@/services/storage/pageRepo', () => ({
  pageRepo: { savePage: vi.fn(), getPage: vi.fn(), saveAllPages: vi.fn() },
}))
vi.mock('@/services/storage/bookFileRepo', () => ({
  bookFileRepo: { save: vi.fn(), get: vi.fn() },
}))
vi.mock('@/services/storage/subLibraryRepo', () => ({
  subLibraryRepo: { getAll: vi.fn(), save: vi.fn(), delete: vi.fn() },
}))
vi.mock('@/services/storage/progressRepo', () => ({
  progressRepo: { getAll: vi.fn(), save: vi.fn(), remove: vi.fn() },
}))
vi.mock('@/services/storage/tagRepo', () => ({
  tagRepo: { getAll: vi.fn(), save: vi.fn(), delete: vi.fn() },
}))

import { STORAGE_KEYS } from '@/constants/storage'
import { getParserForFile } from '@/services/parsers'
import type { ParsedBook } from '@/services/parsers/types'
import { bookFileRepo } from '@/services/storage/bookFileRepo'
import { bookRepo } from '@/services/storage/bookRepo'
import { pageRepo } from '@/services/storage/pageRepo'
import { progressRepo } from '@/services/storage/progressRepo'
import { tagRepo } from '@/services/storage/tagRepo'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type { Book, ReadingProgress, Tag } from '@/types'
import { extractTitleFromFileName } from '@/utils/extractTitle'

const getParserForFileMock = vi.mocked(getParserForFile)
const bookRepoMock = vi.mocked(bookRepo, true)
const pageRepoMock = vi.mocked(pageRepo, true)
const bookFileRepoMock = vi.mocked(bookFileRepo, true)
const progressRepoMock = vi.mocked(progressRepo, true)
const tagRepoMock = vi.mocked(tagRepo, true)

const makeBook = (overrides: Partial<Book> & { id: string }): Book => ({
  title: overrides.id,
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'completed',
  totalChapters: 1,
  chapters: [
    { id: `${overrides.id}-ch1`, bookId: overrides.id, number: 1, title: '第1话', pages: [], status: 'unread' },
  ],
  addedAt: new Date(),
  isFavorite: false,
  ...overrides,
})

const makeProgress = (bookId: string, percentage: number): ReadingProgress => ({
  bookId,
  chapterId: `${bookId}-ch1`,
  page: 1,
  totalPages: 10,
  percentage,
  globalPageIndex: 0,
  totalImages: 10,
})

const resetLibraryState = (overrides: Partial<ReturnType<typeof useLibraryStore.getState>> = {}) => {
  useLibraryStore.setState({
    books: [],
    subLibraries: [],
    tags: [],
    coverUrls: {},
    readingProgress: {},
    isLoading: false,
    isImporting: false,
    importProgress: 0,
    error: null,
    batchImportTotal: 0,
    batchImportCurrent: 0,
    batchImportCurrentFile: '',
    ...overrides,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  resetLibraryState()
})

describe('selectors', () => {
  it('getContinueReading filters unfinished and sorts by lastReadAt desc', () => {
    const books = [
      makeBook({ id: 'b1', lastReadAt: new Date('2026-08-01') }),
      makeBook({ id: 'b2', lastReadAt: new Date('2026-08-03') }),
      makeBook({ id: 'b3', lastReadAt: new Date('2026-08-02') }),
      makeBook({ id: 'b4' }), // 有进度但从未标记 lastReadAt
    ]
    resetLibraryState({
      books,
      readingProgress: {
        b1: makeProgress('b1', 10),
        b2: makeProgress('b2', 50),
        b3: makeProgress('b3', 100), // 已读完
        b4: makeProgress('b4', 30),
      },
    })

    const result = useLibraryStore.getState().getContinueReading()
    // 无 lastReadAt 的排在最后
    expect(result.map((b) => b.id)).toEqual(['b2', 'b1', 'b4'])
  })

  it('getRecentlyRead returns at most 6 books sorted by lastReadAt', () => {
    const books = Array.from({ length: 8 }, (_, i) =>
      makeBook({ id: `b${i}`, lastReadAt: new Date(2026, 7, 1 + i) })
    )
    resetLibraryState({ books })

    const result = useLibraryStore.getState().getRecentlyRead()
    expect(result).toHaveLength(6)
    // 最近读的在前
    expect(result[0].id).toBe('b7')
    expect(result[5].id).toBe('b2')
  })

  it('getFavorites filters favorite books', () => {
    resetLibraryState({
      books: [makeBook({ id: 'b1', isFavorite: true }), makeBook({ id: 'b2' })],
    })
    expect(useLibraryStore.getState().getFavorites().map((b) => b.id)).toEqual(['b1'])
  })

  it('getBooksByTag maps tag bookIds and skips missing books', () => {
    const tag: Tag = {
      id: 't1', name: '科幻', color: '#000', bookIds: ['b2', 'b-missing', 'b1'], createdAt: new Date(),
    }
    resetLibraryState({
      books: [makeBook({ id: 'b1' }), makeBook({ id: 'b2' })],
      tags: [tag],
    })

    expect(useLibraryStore.getState().getBooksByTag('t1').map((b) => b.id)).toEqual(['b2', 'b1'])
    expect(useLibraryStore.getState().getBooksByTag('unknown')).toEqual([])
  })

  it('getTagsForBook returns tags referencing the book', () => {
    const tags: Tag[] = [
      { id: 't1', name: 'a', color: '#000', bookIds: ['b1'], createdAt: new Date() },
      { id: 't2', name: 'b', color: '#000', bookIds: ['b2'], createdAt: new Date() },
    ]
    resetLibraryState({ tags })
    expect(useLibraryStore.getState().getTagsForBook('b1').map((t) => t.id)).toEqual(['t1'])
  })
})

describe('batchMarkAsRead', () => {
  it('marks all chapters of targeted books as read and leaves others untouched', () => {
    resetLibraryState({
      books: [makeBook({ id: 'b1' }), makeBook({ id: 'b2' })],
    })

    useLibraryStore.getState().batchMarkAsRead(['b1'])

    const { books } = useLibraryStore.getState()
    expect(books[0].chapters.every((ch) => ch.status === 'read')).toBe(true)
    expect(books[1].chapters.every((ch) => ch.status === 'unread')).toBe(true)
  })
})

describe('updateProgress & removeContinueReading', () => {
  it('merges progress, persists to IndexedDB and stamps lastReadAt', () => {
    bookRepoMock.save.mockResolvedValue(undefined)
    progressRepoMock.save.mockResolvedValue(undefined)
    resetLibraryState({ books: [makeBook({ id: 'b1' })] })

    useLibraryStore.getState().updateProgress('b1', makeProgress('b1', 42))

    const { readingProgress, books } = useLibraryStore.getState()
    expect(readingProgress.b1.percentage).toBe(42)
    expect(books[0].lastReadAt).toBeInstanceOf(Date)
    expect(progressRepoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ bookId: 'b1', percentage: 42 })
    )
    expect(localStorage.getItem(STORAGE_KEYS.PROGRESS)).toBeNull()
    expect(bookRepoMock.save).toHaveBeenCalledTimes(1)
  })

  it('removeContinueReading deletes entry from IndexedDB', () => {
    progressRepoMock.remove.mockResolvedValue(undefined)
    resetLibraryState({
      readingProgress: { b1: makeProgress('b1', 10), b2: makeProgress('b2', 20) },
    })

    useLibraryStore.getState().removeContinueReading('b1')

    expect(progressRepoMock.remove).toHaveBeenCalledWith('b1')
    expect(useLibraryStore.getState().readingProgress.b1).toBeUndefined()
    expect(useLibraryStore.getState().readingProgress.b2.percentage).toBe(20)
  })

  it('loadBooks migrates legacy localStorage progress into IndexedDB once', async () => {
    bookRepoMock.getAll.mockResolvedValue([])
    bookRepoMock.getCover.mockResolvedValue(undefined)
    progressRepoMock.getAll.mockResolvedValue([])
    progressRepoMock.save.mockResolvedValue(undefined)

    localStorage.setItem(
      STORAGE_KEYS.PROGRESS,
      JSON.stringify({ b1: makeProgress('b1', 3), b2: makeProgress('b2', 7) })
    )

    await useLibraryStore.getState().loadBooks()

    // 旧数据已写入仓库并清除 localStorage 键
    expect(progressRepoMock.save).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem(STORAGE_KEYS.PROGRESS)).toBeNull()
    // 内存状态包含迁移后的进度
    const { readingProgress, isLoading } = useLibraryStore.getState()
    expect(readingProgress.b1.percentage).toBe(3)
    expect(readingProgress.b2.percentage).toBe(7)
    expect(isLoading).toBe(false)
  })
})

describe('removeBook', () => {
  it('deletes book, revokes cover URL and strips tag references', async () => {
    bookRepoMock.deleteFully.mockResolvedValue(undefined)
    tagRepoMock.save.mockResolvedValue(undefined)
    resetLibraryState({
      books: [makeBook({ id: 'b1' }), makeBook({ id: 'b2' })],
      coverUrls: { b1: 'blob:mock-1' },
      tags: [
        { id: 't1', name: 'a', color: '#000', bookIds: ['b1', 'b2'], createdAt: new Date() },
      ],
    })

    await useLibraryStore.getState().removeBook('b1')

    expect(bookRepoMock.deleteFully).toHaveBeenCalledWith('b1')
    expect(useLibraryStore.getState().books.map((b) => b.id)).toEqual(['b2'])
    expect(useLibraryStore.getState().coverUrls.b1).toBeUndefined()
    // 受影响标签已剥离引用并持久化
    expect(tagRepoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 't1', bookIds: ['b2'] })
    )
    expect(useLibraryStore.getState().tags[0].bookIds).toEqual(['b2'])
  })
})

describe('deleteTag', () => {
  it('removes tag and strips it from affected books', async () => {
    tagRepoMock.delete.mockResolvedValue(undefined)
    bookRepoMock.save.mockResolvedValue(undefined)
    resetLibraryState({
      books: [makeBook({ id: 'b1', tags: ['t1', 't2'] })],
      tags: [
        { id: 't1', name: 'a', color: '#000', bookIds: ['b1'], createdAt: new Date() },
        { id: 't2', name: 'b', color: '#000', bookIds: [], createdAt: new Date() },
      ],
    })

    await useLibraryStore.getState().deleteTag('t1')

    expect(tagRepoMock.delete).toHaveBeenCalledWith('t1')
    expect(useLibraryStore.getState().tags.map((t) => t.id)).toEqual(['t2'])
    expect(useLibraryStore.getState().books[0].tags).toEqual(['t2'])
    expect(bookRepoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'b1', tags: ['t2'] })
    )
  })
})

describe('addTagToBook / removeTagFromBook', () => {
  it('updates both sides without duplicates', async () => {
    bookRepoMock.save.mockResolvedValue(undefined)
    tagRepoMock.save.mockResolvedValue(undefined)
    resetLibraryState({
      books: [makeBook({ id: 'b1', tags: ['t1'] })],
      tags: [{ id: 't1', name: 'a', color: '#000', bookIds: ['b1'], createdAt: new Date() }],
    })

    await useLibraryStore.getState().addTagToBook('b1', 't1') // 幂等
    expect(useLibraryStore.getState().books[0].tags).toEqual(['t1'])
    expect(useLibraryStore.getState().tags[0].bookIds).toEqual(['b1'])

    await useLibraryStore.getState().removeTagFromBook('b1', 't1')
    expect(useLibraryStore.getState().books[0].tags).toEqual([])
    expect(useLibraryStore.getState().tags[0].bookIds).toEqual([])
  })
})

describe('importFile', () => {
  const comicParsed: ParsedBook = {
    format: 'comic',
    title: '测试漫画',
    coverBlob: new Blob(['cover']),
    imagePages: [new Blob(['p1']), new Blob(['p2'])],
    imagePageNames: ['001.jpg', '002.jpg'],
  }

  const textParsed: ParsedBook = {
    format: 'text',
    title: '测试小说',
    coverBlob: new Blob(['cover']),
    textFile: new Blob(['content']),
    textEncoding: 'utf-8',
    author: '某作者',
    chapters: [
      { title: '第一章', content: '甲' },
      { title: '第二章', content: '乙' },
    ],
  }

  it('rejects duplicate file title without invoking parser', async () => {
    resetLibraryState({ books: [makeBook({ id: 'b1', title: extractTitleFromFileName('测试漫画.cbz') })] })

    const result = await useLibraryStore.getState().importFile(new File(['x'], '测试漫画.cbz'))

    expect(result).toBeNull()
    expect(useLibraryStore.getState().error).toContain('已存在于书架中')
    expect(getParserForFileMock).not.toHaveBeenCalled()
    expect(useLibraryStore.getState().isImporting).toBe(false)
  })

  it('rejects unsupported formats', async () => {
    getParserForFileMock.mockReturnValue(null)

    const result = await useLibraryStore.getState().importFile(new File(['x'], 'file.xyz'))

    expect(result).toBeNull()
    expect(useLibraryStore.getState().error).toBe('不支持的文件格式')
  })

  it('rejects duplicate parsed title without writing any repo', async () => {
    getParserForFileMock.mockReturnValue({
      canParse: () => true,
      parse: vi.fn().mockResolvedValue({ ...comicParsed, title: '已有书名' }),
    })
    resetLibraryState({ books: [makeBook({ id: 'b1', title: '已有书名' })] })

    const result = await useLibraryStore.getState().importFile(new File(['x'], '新文件.cbz'))

    expect(result).toBeNull()
    expect(useLibraryStore.getState().error).toContain('已有书名')
    expect(bookRepoMock.saveCover).not.toHaveBeenCalled()
    expect(pageRepoMock.saveAllPages).not.toHaveBeenCalled()
  })

  it('imports comic: saves pages via pageRepo and returns book', async () => {
    getParserForFileMock.mockReturnValue({
      canParse: () => true,
      parse: vi.fn().mockResolvedValue(comicParsed),
    })
    bookRepoMock.saveCover.mockResolvedValue(undefined)
    pageRepoMock.saveAllPages.mockResolvedValue(undefined)
    bookRepoMock.save.mockResolvedValue(undefined)

    const result = await useLibraryStore.getState().importFile(new File(['x'], '新建.cbz'))

    expect(result).not.toBeNull()
    expect(result?.format).toBe('comic')
    expect(result?.tags).toEqual([])
    expect(result?.chapters[0].pages).toEqual(['001.jpg', '002.jpg'])

    expect(pageRepoMock.saveAllPages).toHaveBeenCalledWith(
      result!.id,
      `${result!.id}-ch1`,
      comicParsed.imagePages
    )
    expect(bookFileRepoMock.save).not.toHaveBeenCalled()

    const state = useLibraryStore.getState()
    expect(state.books.at(-1)?.id).toBe(result!.id)
    expect(state.coverUrls[result!.id]).toMatch(/^blob:/)
    expect(state.importProgress).toBe(100)
    expect(state.isImporting).toBe(false)
    expect(state.error).toBeNull()
  })

  it('imports text: saves original file via bookFileRepo and builds parsed chapters', async () => {
    getParserForFileMock.mockReturnValue({
      canParse: () => true,
      parse: vi.fn().mockResolvedValue(textParsed),
    })
    bookRepoMock.saveCover.mockResolvedValue(undefined)
    bookFileRepoMock.save.mockResolvedValue(undefined)
    bookRepoMock.save.mockResolvedValue(undefined)

    const result = await useLibraryStore.getState().importFile(new File(['x'], '新建.txt'))

    expect(result).not.toBeNull()
    expect(result?.format).toBe('text')
    expect(result?.author).toBe('某作者')
    expect(result?.totalChapters).toBe(2)
    expect(result?.chapters.map((c) => c.title)).toEqual(['第一章', '第二章'])

    expect(bookFileRepoMock.save).toHaveBeenCalledWith(result!.id, textParsed.textFile)
    expect(pageRepoMock.saveAllPages).not.toHaveBeenCalled()
  })

  it('uses streaming parse for files above 50MB when available', async () => {
    const parse = vi.fn()
    const parseStreaming = vi.fn().mockResolvedValue(comicParsed)
    getParserForFileMock.mockReturnValue({ canParse: () => true, parse, parseStreaming })

    const bigFile = new File(['x'], '大文件.cbz')
    Object.defineProperty(bigFile, 'size', { value: 51 * 1024 * 1024 })

    const result = await useLibraryStore.getState().importFile(bigFile)

    expect(result).not.toBeNull()
    expect(parseStreaming).toHaveBeenCalledTimes(1)
    expect(parse).not.toHaveBeenCalled()
  })

  it('resets importing state when parser throws', async () => {
    getParserForFileMock.mockReturnValue({
      canParse: () => true,
      parse: vi.fn().mockRejectedValue(new Error('压缩包损坏')),
    })

    const result = await useLibraryStore.getState().importFile(new File(['x'], '坏文件.cbz'))

    expect(result).toBeNull()
    const state = useLibraryStore.getState()
    expect(state.error).toBe('压缩包损坏')
    expect(state.isImporting).toBe(false)
    expect(state.importProgress).toBe(0)
  })
})
