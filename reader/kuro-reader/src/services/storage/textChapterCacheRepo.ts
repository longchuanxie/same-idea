import type { TextChapter } from '@/services/textContent'

import { getDB, STORE_NAMES } from './db'

/**
 * 文本书籍解析结果的持久化缓存记录。
 *
 * 长网文（数 MB TXT）每次开书都重跑「读 blob → 整本解码 → 拆章（→ Markdown 逐章解析）」，
 * 在移动端是秒级阻塞。导入/首次开书解析成功后把 TextChapter[] 整体落库，
 * 之后开书一次 IDB 读取（结构化克隆）即得全部章节。
 *
 * 仅缓存 TXT/Markdown：EPUB 章节内容携带运行期生成的图片 object URL，
 * 跨会话失效，不可缓存。
 */
export interface TextChapterCacheRecord {
  bookId: string
  isMarkdown: boolean
  /** 全部章节正文总字符数（诊断/观测用） */
  totalChars: number
  chapters: TextChapter[]
  cachedAt: number
}

export const textChapterCacheRepo = {
  async get(bookId: string): Promise<TextChapterCacheRecord | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.textChapterCache, bookId) as Promise<TextChapterCacheRecord | undefined>
  },

  async save(record: TextChapterCacheRecord): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.textChapterCache, record)
  },

  async delete(bookId: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.textChapterCache, bookId)
  },
}
