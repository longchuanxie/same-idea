import { describe, it, expect, beforeEach } from 'vitest'


import { annotationRepo } from '@/services/storage/annotationRepo'
import { bookFileRepo } from '@/services/storage/bookFileRepo'
import { bookmarkRepo } from '@/services/storage/bookmarkRepo'
import { bookRepo } from '@/services/storage/bookRepo'
import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { progressRepo } from '@/services/storage/progressRepo'
import type { Annotation, Book, Bookmark, ReadingProgress } from '@/types'

beforeEach(async () => {
  try {
    const db = await getDB()
    db.close()
  } catch {
    // first run: no DB yet
  }
  _resetDBForTesting()
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('kuro-reader-db')
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve()
  })
})

const makeBook = (id: string): Book => ({
  id,
  title: `书 ${id}`,
  author: '佚名',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 1,
  chapters: [],
  addedAt: new Date('2026-08-01T10:00:00'),
  isFavorite: false,
  format: 'text',
})

const makeAnnotation = (bookId: string): Annotation => ({
  id: `ann-${bookId}`,
  bookId,
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '一段文字',
  note: '笔记',
  startOffset: 0,
  endOffset: 4,
  style: 'highlight',
  createdAt: new Date('2026-08-01T10:00:00'),
  updatedAt: new Date('2026-08-01T10:00:00'),
})

const makeBookmark = (bookId: string): Bookmark => ({
  id: `bm-${bookId}`,
  bookId,
  chapterIndex: 0,
  chapterTitle: '第一章',
  pageIndex: 2,
  textPreview: '预览',
  createdAt: new Date('2026-08-01T10:00:00'),
})

const makeProgress = (bookId: string): ReadingProgress => ({
  bookId,
  chapterId: 'ch1',
  page: 2,
  totalPages: 10,
  percentage: 20,
  globalPageIndex: 2,
  totalImages: 0,
  updatedAt: 1000,
})

describe('bookRepo.deleteFully 级联清理', () => {
  it('删除书时同步清空其批注/书签/进度，他书数据保留', async () => {
    await bookRepo.save(makeBook('book-1'))
    await bookRepo.save(makeBook('book-2'))
    await bookFileRepo.save('book-1', new Blob(['内容'], { type: 'text/plain' }))
    await annotationRepo.add(makeAnnotation('book-1'))
    await annotationRepo.add(makeAnnotation('book-2'))
    await bookmarkRepo.add(makeBookmark('book-1'))
    await bookmarkRepo.add(makeBookmark('book-2'))
    await progressRepo.save(makeProgress('book-1'))
    await progressRepo.save(makeProgress('book-2'))

    await bookRepo.deleteFully('book-1')

    expect(await bookRepo.get('book-1')).toBeUndefined()
    expect(await bookFileRepo.get('book-1')).toBeUndefined()
    expect(await annotationRepo.getByBookId('book-1')).toEqual([])
    expect(await bookmarkRepo.getByBookId('book-1')).toEqual([])
    expect((await progressRepo.getAll()).map((p) => p.bookId)).toEqual(['book-2'])

    // 他书不受影响
    expect(await bookRepo.get('book-2')).toBeDefined()
    expect((await annotationRepo.getByBookId('book-2')).map((a) => a.id)).toEqual(['ann-book-2'])
    expect((await bookmarkRepo.getByBookId('book-2')).map((b) => b.id)).toEqual(['bm-book-2'])
  })

  it('删除无任何关联数据的书不报错', async () => {
    await bookRepo.save(makeBook('bare'))
    await expect(bookRepo.deleteFully('bare')).resolves.toBeUndefined()
    expect(await bookRepo.get('bare')).toBeUndefined()
  })
})
