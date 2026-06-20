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

describe('bookFileRepo', () => {
  it('exposes save / get / delete methods', () => {
    expect(typeof bookFileRepo.save).toBe('function')
    expect(typeof bookFileRepo.get).toBe('function')
    expect(typeof bookFileRepo.delete).toBe('function')
  })

  it('save + get round-trips a blob', async () => {
    const data = new Blob(['hello world'], { type: 'text/plain' })
    await bookFileRepo.save('book-1', data)
    const result = await bookFileRepo.get('book-1')
    expect(result).toBeDefined()
  })

  it('get returns undefined for missing key', async () => {
    expect(await bookFileRepo.get('nonexistent')).toBeUndefined()
  })

  it('delete removes stored blob', async () => {
    await bookFileRepo.save('book-2', new Blob(['data']))
    await bookFileRepo.delete('book-2')
    expect(await bookFileRepo.get('book-2')).toBeUndefined()
  })
})
