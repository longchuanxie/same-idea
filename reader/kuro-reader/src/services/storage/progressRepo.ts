import type { ReadingProgress } from '@/types'

import { getDB, STORE_NAMES } from './db'

/** 阅读进度仓库（IndexedDB v6 起，替代 localStorage 存储） */
export const progressRepo = {
  async getAll(): Promise<ReadingProgress[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.readingProgress)
  },

  async save(progress: ReadingProgress): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.readingProgress, progress)
  },

  async remove(bookId: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.readingProgress, bookId)
  },
}
