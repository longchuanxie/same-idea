import { describe, it, expect, beforeEach } from 'vitest'

import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { textChapterCacheRepo } from '@/services/storage/textChapterCacheRepo'
import type { TextChapter } from '@/services/textContent'

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

const chapters = (count: number): TextChapter[] =>
  Array.from({ length: count }, (_, idx) => ({
    id: `ch${idx + 1}`,
    title: `第${idx + 1}章`,
    content: '内容'.repeat(50),
  }))

describe('textChapterCacheRepo', () => {
  it('save + get round-trips chapters', async () => {
    await textChapterCacheRepo.save({
      bookId: 'book-1',
      isMarkdown: false,
      totalChars: 100,
      chapters: chapters(3),
      cachedAt: Date.now(),
    })
    const record = await textChapterCacheRepo.get('book-1')
    expect(record).toBeDefined()
    expect(record?.isMarkdown).toBe(false)
    expect(record?.chapters).toHaveLength(3)
    expect(record?.chapters[0]?.id).toBe('ch1')
    expect(record?.chapters[2]?.title).toBe('第3章')
  })

  it('get returns undefined for missing book', async () => {
    expect(await textChapterCacheRepo.get('nonexistent')).toBeUndefined()
  })

  it('delete removes cached record', async () => {
    await textChapterCacheRepo.save({
      bookId: 'book-2',
      isMarkdown: true,
      totalChars: 1,
      chapters: chapters(1),
      cachedAt: Date.now(),
    })
    await textChapterCacheRepo.delete('book-2')
    expect(await textChapterCacheRepo.get('book-2')).toBeUndefined()
  })
})
