import { describe, it, expect, beforeEach } from 'vitest'

import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { pageRepo, makePageKey } from '@/services/storage/pageRepo'

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

describe('makePageKey', () => {
  it('produces stable key format', () => {
    expect(makePageKey('c1', 'ch1', 0)).toBe('c1/ch1/0')
  })

  it('handles larger page indexes', () => {
    expect(makePageKey('c1', 'ch1', 99)).toBe('c1/ch1/99')
  })
})

describe('pageRepo CRUD', () => {
  it('save and get single page', async () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await pageRepo.savePage('c1', 'ch1', 0, blob)
    const got = await pageRepo.getPage('c1', 'ch1', 0)
    expect(got).toBeDefined()
  })

  it('getPage returns undefined for missing key', async () => {
    expect(await pageRepo.getPage('c1', 'ch1', 0)).toBeUndefined()
  })

  it('saveAllPages saves an array', async () => {
    const blobs = [new Blob(['a']), new Blob(['bb']), new Blob(['ccc'])]
    await pageRepo.saveAllPages('c1', 'ch1', blobs)
    for (let i = 0; i < 3; i++) {
      const got = await pageRepo.getPage('c1', 'ch1', i)
      expect(got).toBeDefined()
    }
  })

  it('deleteAllPages removes all pages for a comic (cursor scan, isolates other comics)', async () => {
    await pageRepo.saveAllPages('c1', 'ch1', [new Blob(['a']), new Blob(['b'])])
    await pageRepo.saveAllPages('c2', 'ch1', [new Blob(['c'])])
    await pageRepo.deleteAllPages('c1')
    expect(await pageRepo.getPage('c1', 'ch1', 0)).toBeUndefined()
    expect(await pageRepo.getPage('c1', 'ch1', 1)).toBeUndefined()
    const c2Page = await pageRepo.getPage('c2', 'ch1', 0)
    expect(c2Page).toBeDefined()
  })
})
