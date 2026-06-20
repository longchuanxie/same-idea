import type { Tag } from '@/types'

import { getDB, STORE_NAMES } from './db'

export const tagRepo = {
  async save(tag: Tag): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.tags, tag)
  },

  async get(id: string): Promise<Tag | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.tags, id) as Promise<Tag | undefined>
  },

  async getAll(): Promise<Tag[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.tags) as Promise<Tag[]>
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.tags, id)
  },
}
