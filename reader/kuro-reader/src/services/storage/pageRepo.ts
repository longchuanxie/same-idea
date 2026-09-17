import { getDB, STORE_NAMES } from './db'

/** 页面在 pages store 中的键格式：bookId/chapterId/pageIndex */
export function makePageKey(bookId: string, chapterId: string, pageIndex: number): string {
  return `${bookId}/${chapterId}/${pageIndex}`
}

/** deleteAllPages 键区间上界种子：'0' 是 id 字母表 [0-9a-z] 中最小的字符 */
const PAGE_KEY_UPPER_BOUND = '0'

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

  /**
   * 删除某 book 所有页面（键区间扫描，复杂度只与该书页数相关）。
   * 键形如 `bookId/chapterId/pageIndex`：区间 [`${bookId}/`, `${bookId}0`) 恰好覆盖该书全部键——
   * 其他书键要么以更小字符接在前缀后（< 下界），要么 ≥ '0'（> 上界）；bookId 本身不含 '/'。
   */
  async deleteAllPages(bookId: string): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    const range = IDBKeyRange.bound(`${bookId}/`, `${bookId}${PAGE_KEY_UPPER_BOUND}`, false, true)
    let cursor = await tx.store.openCursor(range)
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
    await tx.done
  },
}
