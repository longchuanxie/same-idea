import { getDB, STORE_NAMES } from './db'
import type { Bookmark } from '@/types'

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
  },

  async getByBookId(bookId: string): Promise<Bookmark[]> {
    const db = await getDB()
    const all = await db.getAll(STORE_NAMES.bookmarks) as any[]
    return all
      .filter((b) => b.bookId === bookId)
      .map((b) => ({ ...b, createdAt: new Date(b.createdAt) }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async findByPosition(bookId: string, chapterIndex: number, pageIndex?: number, scrollRatio?: number): Promise<Bookmark | undefined> {
    const db = await getDB()
    const all = await db.getAll(STORE_NAMES.bookmarks) as any[]
    return all
      .filter((b) => {
        if (b.bookId !== bookId || b.chapterIndex !== chapterIndex) return false
        if (pageIndex != null) return b.pageIndex === pageIndex
        if (scrollRatio != null) return Math.abs((b.scrollRatio ?? 0) - scrollRatio) < 0.01
        return false
      })
      .map((b) => ({ ...b, createdAt: new Date(b.createdAt) }))[0]
  },
}
