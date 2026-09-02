import type { Bookmark } from '@/types'

import { getDB, STORE_NAMES } from './db'
import { tombstoneRepo } from './tombstoneRepo'

/** IndexedDB 中的存储形态：日期字段为 ISO 字符串 */
type StoredBookmark = Omit<Bookmark, 'createdAt'> & {
  createdAt: string
}

const SCROLL_MATCH_EPSILON = 0.01; // 同一位置书签判定的滚动比例容差

export const bookmarkRepo = {
  async add(bookmark: Bookmark): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.bookmarks, {
      ...bookmark,
      createdAt: bookmark.createdAt instanceof Date ? bookmark.createdAt.toISOString() : bookmark.createdAt,
    })
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.bookmarks, id)
    await tombstoneRepo.record('bookmark', id)
  },

  async getByBookId(bookId: string): Promise<Bookmark[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.bookmarks)) as StoredBookmark[]
    return all
      .filter((b) => b.bookId === bookId)
      .map((b) => ({ ...b, createdAt: new Date(b.createdAt) }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  /** 备份导出用：返回全部书签（日期已还原为 Date） */
  async getAll(): Promise<Bookmark[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.bookmarks)) as StoredBookmark[]
    return all.map((b) => ({ ...b, createdAt: new Date(b.createdAt) }))
  },

  /** 备份导入前清空（覆盖语义） */
  async deleteAll(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAMES.bookmarks)
  },

  /** 删书级联：清空指定书的全部书签（整书墓碑阻止远端复活） */
  async deleteByBookId(bookId: string): Promise<void> {
    await tombstoneRepo.record('book', bookId)
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.bookmarks)) as StoredBookmark[]
    const ids = all.filter((b) => b.bookId === bookId).map((b) => b.id)
    const tx = db.transaction(STORE_NAMES.bookmarks, 'readwrite')
    await Promise.all(ids.map((id) => tx.store.delete(id)))
    await tx.done
  },

  async findByPosition(bookId: string, chapterIndex: number, pageIndex?: number, scrollRatio?: number): Promise<Bookmark | undefined> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.bookmarks)) as StoredBookmark[]
    return all
      .filter((b) => {
        if (b.bookId !== bookId || b.chapterIndex !== chapterIndex) return false
        if (pageIndex != null) return b.pageIndex === pageIndex
        if (scrollRatio != null) return Math.abs((b.scrollRatio ?? 0) - scrollRatio) < SCROLL_MATCH_EPSILON
        return false
      })
      .map((b) => ({ ...b, createdAt: new Date(b.createdAt) }))[0]
  },
}
