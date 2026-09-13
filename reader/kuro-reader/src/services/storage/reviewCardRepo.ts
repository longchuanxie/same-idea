import type { ReviewCard } from '@/types'

import { getDB, STORE_NAMES } from './db'
import { tombstoneRepo } from './tombstoneRepo'

/** IndexedDB 中的存储形态：日期字段为 ISO 字符串 */
type StoredReviewCard = Omit<ReviewCard, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

function reviveCard(stored: StoredReviewCard): ReviewCard {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
  }
}

/**
 * 复习卡仓库（IndexedDB v9 起）。
 * 排期状态是读者劳动成果：随备份 v5 与云同步 v5 走（按 id LWW）；
 * 删除（含对账清孤儿）记 review 墓碑防远端复活。
 */
export const reviewCardRepo = {
  async save(card: ReviewCard): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.reviewCards, {
      ...card,
      createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
      updatedAt: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
    })
  },

  async get(id: string): Promise<ReviewCard | undefined> {
    const db = await getDB()
    const stored = (await db.get(STORE_NAMES.reviewCards, id)) as StoredReviewCard | undefined
    return stored ? reviveCard(stored) : undefined
  },

  async getAll(): Promise<ReviewCard[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.reviewCards)) as StoredReviewCard[]
    return all.map(reviveCard)
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.reviewCards, id)
    await tombstoneRepo.record('review', id)
  },

  /** 批删（对账清孤儿）：逐条记墓碑，远端副本一并剔除 */
  async removeMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.reviewCards, 'readwrite')
    await Promise.all(ids.map((id) => tx.store.delete(id)))
    await tx.done
    await Promise.all(ids.map((id) => tombstoneRepo.record('review', id)))
  },

  /** 删书级联：清空指定书的复习卡（整书墓碑阻止远端复活） */
  async deleteByBookId(bookId: string): Promise<void> {
    await tombstoneRepo.record('book', bookId)
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.reviewCards)) as StoredReviewCard[]
    const tx = db.transaction(STORE_NAMES.reviewCards, 'readwrite')
    await Promise.all(
      all.filter((card) => card.bookId === bookId).map((card) => tx.store.delete(card.id))
    )
    await tx.done
  },

  async deleteAll(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAMES.reviewCards)
  },
}
