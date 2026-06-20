import type { SubLibrary } from '@/types'

import { getDB, STORE_NAMES } from './db'

export const subLibraryRepo = {
  async save(subLibrary: SubLibrary): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.sublibraries, subLibrary)
  },

  async get(id: string): Promise<SubLibrary | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.sublibraries, id) as Promise<SubLibrary | undefined>
  },

  async getAll(): Promise<SubLibrary[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.sublibraries) as Promise<SubLibrary[]>
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.sublibraries, id)
  },
}
