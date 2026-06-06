import { describe, it, expect, beforeEach } from 'vitest'

import { bookFileRepo } from '@/services/storage/bookFileRepo'
import { getDB, _resetDBForTesting } from '@/services/storage/db'

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

describe('bookFileRepo interface (Phase 1 stub)', () => {
  it('exposes save / get / delete methods', () => {
    expect(typeof bookFileRepo.save).toBe('function')
    expect(typeof bookFileRepo.get).toBe('function')
    expect(typeof bookFileRepo.delete).toBe('function')
  })

  it('save throws clear error in Phase 1 (no v4 store yet)', async () => {
    await expect(bookFileRepo.save('a', new Blob(['x']))).rejects.toThrow(
      /bookFiles store not yet available/i
    )
  })

  it('get returns undefined when store missing', async () => {
    expect(await bookFileRepo.get('a')).toBeUndefined()
  })

  it('delete is a no-op when store missing', async () => {
    await expect(bookFileRepo.delete('a')).resolves.toBeUndefined()
  })
})
