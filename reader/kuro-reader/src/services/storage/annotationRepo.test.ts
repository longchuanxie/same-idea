import { describe, it, expect, beforeEach } from 'vitest'


import { annotationRepo } from '@/services/storage/annotationRepo'
import { getDB, _resetDBForTesting } from '@/services/storage/db'
import type { Annotation } from '@/types'

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

const makeAnnotation = (overrides: Partial<Annotation> & { id: string; bookId: string }): Annotation => ({
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '划线的文本',
  note: '一条笔记',
  startOffset: 0,
  endOffset: 5,
  style: 'highlight',
  createdAt: new Date('2026-08-01T10:00:00'),
  updatedAt: new Date('2026-08-01T10:00:00'),
  ...overrides,
})

describe('annotationRepo', () => {
  it('add + getByBookId 只返回该书批注并按 updatedAt 倒序', async () => {
    const older = makeAnnotation({ id: 'ann-1', bookId: 'book-1' })
    const newer = makeAnnotation({
      id: 'ann-2',
      bookId: 'book-1',
      updatedAt: new Date('2026-08-02T10:00:00'),
    })
    const other = makeAnnotation({ id: 'ann-3', bookId: 'book-2' })
    await annotationRepo.add(older)
    await annotationRepo.add(newer)
    await annotationRepo.add(other)

    const result = await annotationRepo.getByBookId('book-1')
    expect(result.map((a) => a.id)).toEqual(['ann-2', 'ann-1'])
    expect(result[0].createdAt instanceof Date).toBe(true)
  })

  it('deleteByBookId 只清空指定书的批注，他书批注保留', async () => {
    await annotationRepo.add(makeAnnotation({ id: 'ann-1', bookId: 'book-1' }))
    await annotationRepo.add(makeAnnotation({ id: 'ann-2', bookId: 'book-1' }))
    await annotationRepo.add(makeAnnotation({ id: 'ann-3', bookId: 'book-2' }))

    await annotationRepo.deleteByBookId('book-1')

    expect(await annotationRepo.getByBookId('book-1')).toEqual([])
    const survivors = await annotationRepo.getByBookId('book-2')
    expect(survivors.map((a) => a.id)).toEqual(['ann-3'])
  })

  it('deleteByBookId 对无批注的书是安全空操作', async () => {
    await expect(annotationRepo.deleteByBookId('ghost')).resolves.toBeUndefined()
    expect(await annotationRepo.getAll()).toEqual([])
  })

  it('update 修改笔记与样式并刷新 updatedAt', async () => {
    await annotationRepo.add(makeAnnotation({ id: 'ann-1', bookId: 'book-1' }))
    await annotationRepo.update('ann-1', { note: '改后的笔记', style: 'wavy' })
    const [updated] = await annotationRepo.getByBookId('book-1')
    expect(updated.note).toBe('改后的笔记')
    expect(updated.style).toBe('wavy')
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
      new Date('2026-08-01T10:00:00').getTime()
    )
  })
})
