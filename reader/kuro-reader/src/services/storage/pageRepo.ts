import { getDB, STORE_NAMES } from './db'

/** 页面在 pages store 中的键格式：bookId/chapterId/pageIndex */
export function makePageKey(bookId: string, chapterId: string, pageIndex: number): string {
  return `${bookId}/${chapterId}/${pageIndex}`
}

export const pageRepo = {
  async savePage(bookId: string, chapterId: string, pageIndex: number, blob: Blob): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.pages, blob, makePageKey(bookId, chapterId, pageIndex))
  },

  async getPage(bookId: string, chapterId: string, pageIndex: number): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.pages, makePageKey(bookId, chapterId, pageIndex)) as Promise<
      Blob | undefined
    >
  },

  async saveAllPages(bookId: string, chapterId: string, blobs: Blob[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    await Promise.all(
      blobs.map((blob, i) => tx.store.put(blob, makePageKey(bookId, chapterId, i)))
    )
    await tx.done
  },

  /** 删除某 book 所有页面（cursor 扫描前缀，确保不影响其他 book） */
  async deleteAllPages(bookId: string): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    const prefix = `${bookId}/`
    let cursor = await tx.store.openCursor()
    while (cursor) {
      if (typeof cursor.key === 'string' && cursor.key.startsWith(prefix)) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }
    await tx.done
  },
}
