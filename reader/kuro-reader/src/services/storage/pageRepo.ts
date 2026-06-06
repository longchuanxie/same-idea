import { getDB, STORE_NAMES } from './db'

/** 页面在 pages store 中的键格式：comicId/chapterId/pageIndex */
export function makePageKey(comicId: string, chapterId: string, pageIndex: number): string {
  return `${comicId}/${chapterId}/${pageIndex}`
}

export const pageRepo = {
  async savePage(comicId: string, chapterId: string, pageIndex: number, blob: Blob): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.pages, blob, makePageKey(comicId, chapterId, pageIndex))
  },

  async getPage(comicId: string, chapterId: string, pageIndex: number): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.pages, makePageKey(comicId, chapterId, pageIndex)) as Promise<
      Blob | undefined
    >
  },

  async saveAllPages(comicId: string, chapterId: string, blobs: Blob[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    await Promise.all(
      blobs.map((blob, i) => tx.store.put(blob, makePageKey(comicId, chapterId, i)))
    )
    await tx.done
  },

  /** 删除某 comic 所有页面（cursor 扫描前缀，确保不影响其他 comic） */
  async deleteAllPages(comicId: string): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    const prefix = `${comicId}/`
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
