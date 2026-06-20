import { getDB } from './db'
import { STORE_NAMES } from './db'

const STORE_NAME = STORE_NAMES.bookFiles

/**
 * Repository for storing original book files (e.g. TXT, EPUB) by bookId.
 *
 * 使用 IndexedDB 的 bookFiles object store，以 bookId 为 key 存储原始文件 Blob。
 */
export const bookFileRepo = {
  async save(bookId: string, blob: Blob): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAME, blob, bookId)
  },

  async get(bookId: string): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAME, bookId) as Promise<Blob | undefined>
  },

  async delete(bookId: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAME, bookId)
  },
}
