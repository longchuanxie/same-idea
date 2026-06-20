import type { Book } from '@/types'

import { getDB, STORE_NAMES } from './db'
import { pageRepo } from './pageRepo'
import { bookFileRepo } from './bookFileRepo'

export const bookRepo = {
  async save(book: Book): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.books, book)
  },

  async get(id: string): Promise<Book | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.books, id) as Promise<Book | undefined>
  },

  async getAll(): Promise<Book[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.books) as Promise<Book[]>
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.books, id)
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

  /** 删除一本书及其所有关联数据（页面、封面、原始文件） */
  async deleteFully(id: string): Promise<void> {
    await bookRepo.delete(id)
    await pageRepo.deleteAllPages(id)
    await bookRepo.deleteCover(id)
    await bookFileRepo.delete(id)
  },
}
