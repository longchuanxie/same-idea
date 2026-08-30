import { describe, it, expect, beforeEach } from 'vitest'


import { bookmarkRepo } from '@/services/storage/bookmarkRepo'
import { getDB, _resetDBForTesting } from '@/services/storage/db'
import type { Bookmark } from '@/types'

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

const makeBookmark = (overrides: Partial<Bookmark> & { id: string; bookId: string }): Bookmark => ({
  chapterIndex: 0,
  chapterTitle: '第一章',
  pageIndex: 3,
  textPreview: '书签处预览',
  createdAt: new Date('2026-08-01T10:00:00'),
  ...overrides,
})

describe('bookmarkRepo', () => {
  it('add + getByBookId 只返回该书书签', async () => {
    await bookmarkRepo.add(makeBookmark({ id: 'bm-1', bookId: 'book-1' }))
    await bookmarkRepo.add(makeBookmark({ id: 'bm-2', bookId: 'book-2' }))

    const result = await bookmarkRepo.getByBookId('book-1')
    expect(result.map((b) => b.id)).toEqual(['bm-1'])
    expect(result[0].createdAt instanceof Date).toBe(true)
  })

  it('deleteByBookId 只清空指定书的书签，他书保留', async () => {
    await bookmarkRepo.add(makeBookmark({ id: 'bm-1', bookId: 'book-1' }))
    await bookmarkRepo.add(makeBookmark({ id: 'bm-2', bookId: 'book-1' }))
    await bookmarkRepo.add(makeBookmark({ id: 'bm-3', bookId: 'book-2' }))

    await bookmarkRepo.deleteByBookId('book-1')

    expect(await bookmarkRepo.getByBookId('book-1')).toEqual([])
    const survivors = await bookmarkRepo.getByBookId('book-2')
    expect(survivors.map((b) => b.id)).toEqual(['bm-3'])
  })

  it('deleteByBookId 对无书签的书是安全空操作', async () => {
    await expect(bookmarkRepo.deleteByBookId('ghost')).resolves.toBeUndefined()
    expect(await bookmarkRepo.getAll()).toEqual([])
  })

  it('findByPosition 按pageIndex 命中同章同页书签', async () => {
    await bookmarkRepo.add(makeBookmark({ id: 'bm-1', bookId: 'book-1', chapterIndex: 2, pageIndex: 5 }))
    await bookmarkRepo.add(makeBookmark({ id: 'bm-2', bookId: 'book-1', chapterIndex: 2, pageIndex: 9 }))

    const hit = await bookmarkRepo.findByPosition('book-1', 2, 5)
    expect(hit?.id).toBe('bm-1')
    expect(await bookmarkRepo.findByPosition('book-1', 2, 7)).toBeUndefined()
  })
})
