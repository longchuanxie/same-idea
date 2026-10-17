import type { SanitizeSummary } from '@/services/contentSanitizer'
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
 *
 * 净化（A/B 类规则）生效后的缓存约定（2026-10-16）：
 * - TXT 记录携带 sanitizeRev（净化配置指纹）与 sanitizeSummary（命中摘要），
 *   配置/规则变化 → rev 不匹配 → textContent 重算整本并覆盖回写；
 * - Markdown 记录 sanitizeRev 固定为 'md'（净化不接 MD：章节另有结构文档渲染管线）；
 * - 旧记录无 sanitizeRev 字段 = 视为不匹配，下次开书自动重算一次（一次性迁移成本）。
 *
 * 来源指纹（2026-10-17 判例：EPUB 曾借导入预热把无图纯文本写进缓存，开书命中后
 * 图片永久消失）：记录必须携带 fileType（text/* 才可信）；无 fileType 的旧记录
 * 一律不信任——含历史上被 EPUB 投毒的记录，忽略后下次开书从原件重算自愈。
 */
export interface TextChapterCacheRecord {
  bookId: string
  isMarkdown: boolean
  /** 全部章节正文总字符数（诊断/观测用） */
  totalChars: number
  chapters: TextChapter[]
  cachedAt: number
  /** 净化配置指纹（缺省 = 旧记录，按不匹配处理触发重算） */
  sanitizeRev?: string
  /** 该 rev 下的净化命中摘要（确认门样例与已净化计数） */
  sanitizeSummary?: SanitizeSummary
  /** 源文件 MIME（text/* 可信；EPUB 等其他类型禁止入缓存） */
  fileType?: string
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
