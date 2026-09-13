import { describe, it, expect } from 'vitest'

import type { Annotation, Book, ReadingProgress } from '@/types'
import {
  REAPPEAR_AFTER_DAYS,
  currentChapterIndexOf,
  daysSinceLastRead,
  isReturningReader,
  pickTracedAnnotations,
  priorChapterWindow,
} from '@/utils/readingRecap'

const NOW = new Date('2026-09-13T10:00:00')

const makeBook = (overrides: Partial<Book> & { title: string }): Book => ({
  id: 'b1',
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 1,
  chapters: [
    { id: 'ch1', bookId: 'b1', number: 1, title: '第一章', pages: [], status: 'unread' },
    { id: 'ch2', bookId: 'b1', number: 2, title: '第二章', pages: [], status: 'unread' },
    { id: 'ch3', bookId: 'b1', number: 3, title: '第三章', pages: [], status: 'unread' },
    { id: 'ch4', bookId: 'b1', number: 4, title: '第四章', pages: [], status: 'unread' },
  ],
  addedAt: new Date('2026-01-01'),
  isFavorite: false,
  ...overrides,
})

describe('daysSinceLastRead / isReturningReader', () => {
  it('按天取整；无记录不算回来', () => {
    expect(daysSinceLastRead(makeBook({ title: '书', lastReadAt: new Date('2026-09-01') }), NOW)).toBe(12)
    expect(daysSinceLastRead(makeBook({ title: '书' }), NOW)).toBeNull()
  })

  it(`离开 ≥${REAPPEAR_AFTER_DAYS} 天才算回来`, () => {
    expect(isReturningReader(makeBook({ title: '书', lastReadAt: new Date('2026-09-08') }), NOW)).toBe(false)
    expect(isReturningReader(makeBook({ title: '书', lastReadAt: new Date('2026-09-01') }), NOW)).toBe(true)
  })
})

describe('currentChapterIndexOf', () => {
  const book = makeBook({ title: '书' })
  const progressOf = (overrides: Partial<ReadingProgress>): ReadingProgress => ({
    bookId: 'b1',
    chapterId: '',
    page: 0,
    totalPages: 100,
    percentage: 0,
    globalPageIndex: 0,
    totalImages: 0,
    ...overrides,
  })

  it('进度章优先命中；对不上按占比折算', () => {
    expect(currentChapterIndexOf(book, progressOf({ chapterId: 'ch3' }), 4)).toBe(2)
    expect(currentChapterIndexOf(book, progressOf({ percentage: 75 }), 4)).toBe(3)
    expect(currentChapterIndexOf(book, undefined, 4)).toBe(0)
  })
})

describe('pickTracedAnnotations', () => {
  const makeAnnotation = (id: string, chapterIndex: number, updatedAt: string): Annotation => ({
    bookId: 'b1',
    chapterIndex,
    chapterTitle: `第${chapterIndex + 1}章`,
    selectedText: `句${id}`,
    note: '',
    startOffset: 0,
    endOffset: 1,
    createdAt: new Date(updatedAt),
    updatedAt: new Date(updatedAt),
    id,
  })

  it('离当前章近者优先，同距取新者，截到 3 条', () => {
    const picked = pickTracedAnnotations(
      [
        makeAnnotation('far', 0, '2026-08-01'),
        makeAnnotation('near-a', 3, '2026-08-01'),
        makeAnnotation('near-b', 3, '2026-09-01'),
        makeAnnotation('exact', 2, '2026-08-01'),
      ],
      2
    )
    expect(picked.map((a) => a.id)).toEqual(['exact', 'near-b', 'near-a'])
  })
})

describe('priorChapterWindow', () => {
  it('文本书取前 3 章；PDF 取前 10 页；开头无前情', () => {
    expect(priorChapterWindow('text', 40, 5)).toEqual({ from: 2, to: 4 })
    expect(priorChapterWindow('pdf', 40, 5)).toEqual({ from: 0, to: 4 })
    expect(priorChapterWindow('text', 40, 0)).toBeNull()
    expect(priorChapterWindow('text', 1, 0)).toBeNull()
  })
})
