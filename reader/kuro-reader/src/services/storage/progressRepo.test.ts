import { describe, it, expect, beforeEach } from 'vitest'

import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { progressRepo } from '@/services/storage/progressRepo'
import type { ReadingProgress } from '@/types'

const makeProgress = (bookId: string, page: number): ReadingProgress => ({
  bookId,
  chapterId: `${bookId}-ch1`,
  page,
  totalPages: 10,
  percentage: page * 10,
  globalPageIndex: 0,
  totalImages: 10,
})

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

describe('progressRepo', () => {
  it('save and getAll roundtrip', async () => {
    const p1 = makeProgress('b1', 3)
    await progressRepo.save(p1)

    const all = await progressRepo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].bookId).toBe('b1')
    expect(all[0].page).toBe(3)
  })

  it('save overwrites same book progress', async () => {
    await progressRepo.save(makeProgress('b1', 2))
    await progressRepo.save(makeProgress('b1', 5))

    const all = await progressRepo.getAll()
    expect(all).toHaveLength(1)
    expect(all[0].page).toBe(5)
  })

  it('remove deletes the entry', async () => {
    await progressRepo.save(makeProgress('b1', 2))
    await progressRepo.save(makeProgress('b2', 4))

    await progressRepo.remove('b1')

    const all = await progressRepo.getAll()
    expect(all.map((p) => p.bookId)).toEqual(['b2'])
  })

  it('getAll returns empty when nothing stored', async () => {
    expect(await progressRepo.getAll()).toEqual([])
  })
})

describe('progressRepo.deleteAll', () => {
  it('清空全部进度且不记墓碑（备份恢复覆盖语义）', async () => {
    await progressRepo.save(makeProgress('b1', 2))
    await progressRepo.save(makeProgress('b2', 4))

    await progressRepo.deleteAll()

    expect(await progressRepo.getAll()).toEqual([])
    // 墓碑仓库无 progress 记录：若误走 remove 通道，下次云同步会把恢复的旧时间戳进度判死
    const db = await getDB()
    const tombstones = await db.getAll('tombstones')
    expect(tombstones.filter((t) => t.kind === 'progress')).toEqual([])
  })
})
