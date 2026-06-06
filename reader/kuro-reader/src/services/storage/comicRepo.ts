import type { Comic } from '@/types'

import { getDB, STORE_NAMES } from './db'

export const comicRepo = {
  async save(comic: Comic): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.comics, comic)
  },

  async get(id: string): Promise<Comic | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.comics, id) as Promise<Comic | undefined>
  },

  async getAll(): Promise<Comic[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.comics) as Promise<Comic[]>
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.comics, id)
  },

  async saveCover(id: string, blob: Blob): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.covers, blob, id)
  },

  async getCover(id: string): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.covers, id) as Promise<Blob | undefined>
  },

  async deleteCover(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.covers, id)
  },
}
