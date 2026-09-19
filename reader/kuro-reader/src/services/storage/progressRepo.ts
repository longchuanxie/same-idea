import type { ReadingProgress } from '@/types'

import { getDB, STORE_NAMES } from './db'
import { tombstoneRepo } from './tombstoneRepo'

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
    // 云同步墓碑：阻止远端副本在下次 LWW 合并时复活本条进度
    await tombstoneRepo.record('progress', bookId)
  },

  /** 备份恢复整库覆盖用：清空全部进度、不记墓碑（与书签/批注 deleteAll 同语义）。
   *  恢复的是旧快照，若逐条 remove 记墓碑，快照里旧时间戳的进度会在下次
   *  云同步被自己的墓碑连本地带远端一并判死——刚恢复的进度无声蒸发 */
  async deleteAll(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAMES.readingProgress)
  },
}
