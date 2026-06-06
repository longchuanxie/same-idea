import { describe, it, expect, beforeEach } from 'vitest'

import { comicRepo } from '@/services/storage/comicRepo'
import { getDB, _resetDBForTesting } from '@/services/storage/db'
import type { Comic } from '@/types'

const makeComic = (id: string, overrides: Partial<Comic> = {}): Comic => ({
  id,
  title: `Comic ${id}`,
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'completed',
  totalChapters: 0,
  chapters: [],
  addedAt: new Date(0),
  isFavorite: false,
  ...overrides,
})

beforeEach(async () => {
  const db = await getDB()
  db.close()
  _resetDBForTesting()
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('kuro-reader-db')
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve()
  })
})

describe('comicRepo CRUD', () => {
  it('save and get a comic', async () => {
    const c = makeComic('a')
    await comicRepo.save(c)
    const got = await comicRepo.get('a')
    expect(got?.id).toBe('a')
    expect(got?.title).toBe('Comic a')
  })

  it('get returns undefined for missing id', async () => {
    expect(await comicRepo.get('nope')).toBeUndefined()
  })

  it('getAll returns all saved comics', async () => {
    await comicRepo.save(makeComic('a'))
    await comicRepo.save(makeComic('b'))
    const all = await comicRepo.getAll()
    expect(all.map(c => c.id).sort()).toEqual(['a', 'b'])
  })

  it('delete removes a comic', async () => {
    await comicRepo.save(makeComic('a'))
    await comicRepo.delete('a')
    expect(await comicRepo.get('a')).toBeUndefined()
  })
})

describe('comicRepo covers', () => {
  it('save and get a cover blob', async () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await comicRepo.saveCover('a', blob)
    const got = await comicRepo.getCover('a')
    expect(got).toBeDefined()
  })

  it('getCover returns undefined for missing id', async () => {
    expect(await comicRepo.getCover('nope')).toBeUndefined()
  })

  it('deleteCover removes the blob', async () => {
    await comicRepo.saveCover('a', new Blob(['x']))
    await comicRepo.deleteCover('a')
    expect(await comicRepo.getCover('a')).toBeUndefined()
  })
})

describe('comicRepo persistence shape', () => {
  it('preserves format field (BookFormat extension)', async () => {
    await comicRepo.save(makeComic('a', { format: 'pdf' }))
    const got = await comicRepo.get('a')
    expect(got?.format).toBe('pdf')
  })

  it('legacy comic without format roundtrips', async () => {
    const legacy = makeComic('a')
    await comicRepo.save(legacy)
    const got = await comicRepo.get('a')
    expect(got?.format).toBeUndefined()
  })
})
