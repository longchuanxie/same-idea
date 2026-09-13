import type { VocabEntry } from '@/types'

import { getDB, STORE_NAMES } from './db'
import { tombstoneRepo } from './tombstoneRepo'

/** IndexedDB 中的存储形态：日期字段为 ISO 字符串 */
type StoredVocabEntry = Omit<VocabEntry, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

function reviveEntry(stored: StoredVocabEntry): VocabEntry {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
  }
}

/** 归一化词 → 稳定条目 id（小写、空白折叠）：同词同条，重查是更新不是新增 */
export function vocabEntryId(word: string): string {
  return `vocab-${word.trim().toLowerCase().replace(/\s+/g, ' ')}`
}

/**
 * 生词本仓库（IndexedDB v10 起）。
 * 条目 id 由词归一化生成——按词去重；随备份 v5 与云同步 v5 走（按 id LWW），
 * 删除记 vocab 墓碑防远端复活。
 */
export const vocabRepo = {
  async save(entry: VocabEntry): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.vocabEntries, {
      ...entry,
      createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
      updatedAt: entry.updatedAt instanceof Date ? entry.updatedAt.toISOString() : entry.updatedAt,
    })
  },

  async get(id: string): Promise<VocabEntry | undefined> {
    const db = await getDB()
    const stored = (await db.get(STORE_NAMES.vocabEntries, id)) as StoredVocabEntry | undefined
    return stored ? reviveEntry(stored) : undefined
  },

  async getAll(): Promise<VocabEntry[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.vocabEntries)) as StoredVocabEntry[]
    return all
      .map(reviveEntry)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.vocabEntries, id)
    await tombstoneRepo.record('vocab', id)
  },

  /** 删书级联：清空指定书的生词（整书墓碑阻止远端复活） */
  async deleteByBookId(bookId: string): Promise<void> {
    await tombstoneRepo.record('book', bookId)
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.vocabEntries)) as StoredVocabEntry[]
    const tx = db.transaction(STORE_NAMES.vocabEntries, 'readwrite')
    await Promise.all(
      all.filter((entry) => entry.bookId === bookId).map((entry) => tx.store.delete(entry.id))
    )
    await tx.done
  },

  async deleteAll(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAMES.vocabEntries)
  },
}
