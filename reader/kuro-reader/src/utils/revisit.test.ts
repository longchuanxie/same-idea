import { describe, it, expect } from 'vitest'

import type { Annotation, Book, ReadingProgress } from '@/types'
import {
  findAnniversary,
  pickDailyRevisit,
  findRereadCandidates,
  dateSeed,
  REVISIT_MAX_CARDS,
} from '@/utils/revisit'

const TODAY = new Date('2026-08-30T15:00:00')

const makeBook = (overrides: Partial<Book> & { id: string }): Book => ({
  title: `书 ${overrides.id}`,
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 2,
  chapters: [
    { id: 'c1', bookId: overrides.id, number: 1, title: '一', pages: [], status: 'read' },
    { id: 'c2', bookId: overrides.id, number: 2, title: '二', pages: [], status: 'unread' },
  ],
  addedAt: new Date('2026-07-01T10:00:00'),
  isFavorite: false,
  format: 'text',
  ...overrides,
})

const makeAnnotation = (overrides: Partial<Annotation> & { id: string; bookId: string }): Annotation => ({
  chapterIndex: 0,
  chapterTitle: '一',
  selectedText: '句子',
  note: '笔记',
  startOffset: 0,
  endOffset: 2,
  style: 'highlight',
  createdAt: new Date('2026-08-01T10:00:00'),
  updatedAt: new Date('2026-08-01T10:00:00'),
  ...overrides,
})

const makeProgress = (percentage: number): ReadingProgress => ({
  bookId: 'b1',
  chapterId: 'c1',
  page: 1,
  totalPages: 10,
  percentage,
  globalPageIndex: 0,
  totalImages: 0,
})

describe('findAnniversary', () => {
  it('命中整年周年的手记', () => {
    const ann = makeAnnotation({
      id: 'a1',
      bookId: 'b1',
      createdAt: new Date('2025-08-30T09:00:00'),
      updatedAt: new Date('2025-08-30T09:00:00'),
    })
    const hit = findAnniversary([ann], [], TODAY)
    expect(hit?.kind).toBe('annotation')
    expect(hit?.yearsAgo).toBe(1)
    expect(hit?.annotation?.id).toBe('a1')
  })

  it('命中整年周年的入藏', () => {
    const book = makeBook({ id: 'b1', addedAt: new Date('2024-08-30T10:00:00') })
    const hit = findAnniversary([], [book], TODAY)
    expect(hit?.kind).toBe('book-added')
    expect(hit?.yearsAgo).toBe(2)
  })

  it('手记周年优先于入藏周年', () => {
    const ann = makeAnnotation({ id: 'a1', bookId: 'b1', createdAt: new Date('2025-08-30T09:00:00') })
    const book = makeBook({ id: 'b1', addedAt: new Date('2023-08-30T10:00:00') })
    expect(findAnniversary([ann], [book], TODAY)?.kind).toBe('annotation')
  })

  it('非同年同月同日返回 null（闰年 2/29 每年只在当天命中）', () => {
    const ann = makeAnnotation({ id: 'a1', bookId: 'b1', createdAt: new Date('2025-08-29T09:00:00') })
    expect(findAnniversary([ann], [], TODAY)).toBeNull()
  })
})

describe('pickDailyRevisit', () => {
  it('同一天多次调用结果确定（刷新不变）', () => {
    const books = [makeBook({ id: 'b1' }), makeBook({ id: 'b2' }), makeBook({ id: 'b3' })]
    const first = pickDailyRevisit(books, {}, [], TODAY)
    for (let i = 0; i < 5; i++) {
      expect(pickDailyRevisit(books, {}, [], TODAY)?.book.id).toBe(first?.book.id)
    }
  })

  it('不同日期产出不同种子（大概率不同书）', () => {
    expect(dateSeed(new Date('2026-08-30'))).not.toBe(dateSeed(new Date('2026-08-31')))
  })

  it('优先「有手记且久未翻阅」的书，并携带其中一条手记', () => {
    const annotated = makeBook({ id: 'b1', lastReadAt: new Date('2026-07-01T10:00:00') }) // 60 天未读
    const recent = makeBook({ id: 'b2', lastReadAt: new Date('2026-08-29T10:00:00') }) // 昨天
    const annotations = [makeAnnotation({ id: 'a1', bookId: 'b1' })]
    const pick = pickDailyRevisit([annotated, recent], {}, annotations, TODAY)
    expect(pick?.book.id).toBe('b1')
    expect(pick?.annotation?.id).toBe('a1')
    expect(pick?.reason).toBe('annotated-long-unread')
  })

  it('无候选书返回 null', () => {
    expect(pickDailyRevisit([], {}, [], TODAY)).toBeNull()
    expect(pickDailyRevisit([makeBook({ id: 'b1', chapters: [] })], {}, [], TODAY)).toBeNull()
  })
})

describe('findRereadCandidates', () => {
  it('有手记 + 超过未读门槛 + 未读完 → 候选，按手记数排序', () => {
    const twoNotes = makeBook({ id: 'b1', lastReadAt: new Date('2026-06-01T10:00:00') })
    const oneNote = makeBook({ id: 'b2', lastReadAt: new Date('2026-07-01T10:00:00') })
    const annotations = [
      makeAnnotation({ id: 'a1', bookId: 'b1' }),
      makeAnnotation({ id: 'a2', bookId: 'b1' }),
      makeAnnotation({ id: 'a3', bookId: 'b2' }),
    ]
    const result = findRereadCandidates([oneNote, twoNotes], {}, annotations, TODAY)
    expect(result.map((b) => b.id)).toEqual(['b1', 'b2'])
  })

  it('读完但有笔记的书仍可回访', () => {
    const finished = makeBook({ id: 'b1', lastReadAt: new Date('2026-05-01T10:00:00') })
    const annotations = [makeAnnotation({ id: 'a1', bookId: 'b1' })]
    const progress = { b1: makeProgress(100) }
    expect(findRereadCandidates([finished], progress, annotations, TODAY)).toHaveLength(1)
  })

  it('无手记或近期刚读的书不是候选', () => {
    const noNotes = makeBook({ id: 'b1', lastReadAt: new Date('2026-06-01T10:00:00') })
    const recent = makeBook({ id: 'b2', lastReadAt: new Date('2026-08-20T10:00:00') })
    const annotations = [makeAnnotation({ id: 'a1', bookId: 'b2' })]
    expect(findRereadCandidates([noNotes, recent], {}, annotations, TODAY)).toHaveLength(0)
  })

  it('展示上限常量为 2', () => {
    expect(REVISIT_MAX_CARDS).toBe(2)
  })
})
