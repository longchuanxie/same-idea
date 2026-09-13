/**
 * 问藏书（RAG 问答）：先在馆藏里检索相关选段，再让用户自配的 AI 基于选段作答。
 *
 * 证据链沿用知识库的防幻觉原则——AI 的支撑句必须逐字命中原文才给「回原文」链接；
 * 语料按书缓存（bookCorpus 全量分块），重复提问不重读全书。
 */

import { chatCompletionJson, type AiProviderConfig } from '@/services/ai/aiClient'
import { buildBookCorpus } from '@/services/knowledge/bookCorpus'
import type { Book } from '@/types'
import {
  excerptWindow,
  selectTopChunks,
  type RetrievalChunk,
} from '@/utils/qaRetrieval'

/** 每段开窗字符数（6 段 ≈ 一万字内，与知识库单次生成的请求体量同量级） */
export const EXCERPT_WINDOW_CHARS = 1600
/** offsetRatio 保留 4 位小数（与知识库证据坐标一致） */
const RATIO_PRECISION = 1e4
/** 引文条数上限（提示词约定 1-4 条） */
const MAX_CITATIONS = 4

export interface QaExcerpt {
  /** 1 起编号（提示词段落号，引文回指） */
  index: number
  bookId: string
  bookTitle: string
  format: 'text' | 'pdf'
  label: string
  chapterIndexes: number[]
  /** 开窗后的节选文本 */
  text: string
}

export interface QaCitationLocation {
  bookId: string
  bookTitle: string
  chapterIndex: number
  offsetRatio: number
}

export interface QaCitation {
  excerptIndex: number
  quote: string
  /** 本地校验定位（防幻觉：原文找不到则 null——展示但不给链接） */
  location: QaCitationLocation | null
}

export interface QaResult {
  answer: string
  citations: QaCitation[]
  /** 参与检索的书数（「翻了多少本书」的凭据） */
  searchedBookCount: number
}

export class LibraryQaError extends Error {
  constructor(
    message: string,
    readonly code: 'no-hits' | 'empty-answer'
  ) {
    super(message)
    this.name = 'LibraryQaError'
  }
}

// ---- 语料缓存（每书一次构建；藏书内容入馆后不变，无需失效） ----

interface BookQaCorpus {
  chunks: { chunkIndex: number; label: string; text: string; chapterIndexes: number[] }[]
  chapterTexts: string[]
}

const corpusCache = new Map<string, BookQaCorpus>()

/** 构建并缓存一本书的可检索语料；漫画/无文本返回 null */
export async function loadBookQaCorpus(book: Book): Promise<BookQaCorpus | null> {
  const cached = corpusCache.get(book.id)
  if (cached) return cached
  if (book.format !== 'text' && book.format !== 'pdf') return null
  try {
    const corpus = await buildBookCorpus(book)
    const entry: BookQaCorpus = {
      chunks: corpus.chunks.map((chunk, index) => ({
        chunkIndex: index,
        label: chunk.label,
        text: chunk.text,
        chapterIndexes: chunk.chapterIndexes,
      })),
      chapterTexts: corpus.chapterTexts,
    }
    corpusCache.set(book.id, entry)
    return entry
  } catch {
    return null
  }
}

/** 跨书检索：打分选段 + 命中开窗，产出提示词用的节选 */
export async function retrieveExcerpts(
  books: Book[],
  query: string
): Promise<{ excerpts: QaExcerpt[]; searchedBookCount: number }> {
  const pool: RetrievalChunk[] = []
  let searchedBookCount = 0
  for (const book of books) {
    const corpus = await loadBookQaCorpus(book)
    if (!corpus) continue
    searchedBookCount += 1
    for (const chunk of corpus.chunks) {
      pool.push({
        bookId: book.id,
        bookTitle: book.title,
        chunkIndex: chunk.chunkIndex,
        label: chunk.label,
        text: chunk.text,
        chapterIndexes: chunk.chapterIndexes,
      })
    }
  }

  const selected = selectTopChunks(pool, query)
  return {
    excerpts: selected.map((chunk, i) => ({
      index: i + 1,
      bookId: chunk.bookId,
      bookTitle: chunk.bookTitle,
      format: (books.find((b) => b.id === chunk.bookId)?.format === 'pdf' ? 'pdf' : 'text'),
      label: chunk.label,
      chapterIndexes: chunk.chapterIndexes,
      text: excerptWindow(chunk.text, query, EXCERPT_WINDOW_CHARS),
    })),
    searchedBookCount,
  }
}

// ---- 提示词与解析（纯函数，测试可直达） ----

export function buildQaMessages(
  query: string,
  excerpts: QaExcerpt[]
): { role: 'system' | 'user'; content: string }[] {
  const excerptLines = excerpts
    .map(
      (excerpt) =>
        `【段落${excerpt.index}｜《${excerpt.bookTitle}》｜${excerpt.label}】\n${excerpt.text}`
    )
    .join('\n\n')
  return [
    {
      role: 'system',
      content: [
        '你是一位严谨的图书馆研究员，只依据给定选段回答读者的提问。',
        '选段里没有答案就直说「选段里没有找到」——不推测、不用外部知识补全。',
        '严格只输出一个 JSON 对象，不要任何解释、前后缀或代码围栏。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `读者提问：${query}`,
        '',
        '相关选段（从馆藏检索）：',
        excerptLines,
        '',
        '请输出 JSON：',
        '{"answer":"基于选段的回答（≤300字，可分点；用到某段内容处标注段落号如 [1]）","citations":[{"excerpt":1,"quote":"支撑该回答的原文短句（从对应段落逐字摘录，≤40字）"}]}',
        '要求：',
        '- 只依据选段作答；选段不足以回答时明确说明缺什么',
        '- citations 给 1-4 条最关键的支撑句',
        '- quote 必须逐字摘自对应段落，不得改写、翻译、拼接',
      ].join('\n'),
    },
  ]
}

export interface ParsedQaAnswer {
  answer: string
  citations: { excerpt: number; quote: string }[]
}

/** 解析问答回复；answer 缺失或形状不对返回 null */
export function parseQaAnswer(raw: unknown): ParsedQaAnswer | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as { answer?: unknown; citations?: unknown }
  if (typeof value.answer !== 'string' || !value.answer.trim()) return null
  const citations: ParsedQaAnswer['citations'] = []
  if (Array.isArray(value.citations)) {
    for (const item of value.citations.slice(0, MAX_CITATIONS)) {
      if (!item || typeof item !== 'object') continue
      const entry = item as { excerpt?: unknown; quote?: unknown }
      if (typeof entry.excerpt !== 'number' || typeof entry.quote !== 'string') continue
      if (!entry.quote.trim()) continue
      citations.push({ excerpt: entry.excerpt, quote: entry.quote.trim() })
    }
  }
  return { answer: value.answer.trim(), citations }
}

/** 引文本地校验：在章全文里逐字找 quote → 章内占比坐标（?goto= 直达用）。
 *  先搜选段覆盖的章，找不到再全书扫；都没有 = 未定位（不给链接）。 */
export function locateQuote(
  chapterTexts: string[],
  quote: string,
  hintChapterIndexes: number[] = []
): { chapterIndex: number; offsetRatio: number } | null {
  const target = quote.trim()
  if (!target) return null
  const tryChapter = (chapterIndex: number) => {
    const text = chapterTexts[chapterIndex]
    if (!text) return null
    const index = text.indexOf(target)
    if (index < 0) return null
    return {
      chapterIndex,
      offsetRatio: Math.round((index / text.length) * RATIO_PRECISION) / RATIO_PRECISION,
    }
  }
  for (const chapterIndex of hintChapterIndexes) {
    const found = tryChapter(chapterIndex)
    if (found) return found
  }
  for (let chapterIndex = 0; chapterIndex < chapterTexts.length; chapterIndex++) {
    const found = tryChapter(chapterIndex)
    if (found) return found
  }
  return null
}

// ---- 编排 ----

/** 问藏书一步到位：检索 → 作答 → 引文校验定位 */
export async function askLibrary(
  config: AiProviderConfig,
  query: string,
  books: Book[],
  signal?: AbortSignal
): Promise<QaResult> {
  const { excerpts, searchedBookCount } = await retrieveExcerpts(books, query)
  if (excerpts.length === 0) {
    throw new LibraryQaError('馆藏里没有检索到与问题相关的内容', 'no-hits')
  }

  const raw = await chatCompletionJson<unknown>(config, {
    messages: buildQaMessages(query, excerpts),
    signal,
  })
  const parsed = parseQaAnswer(raw)
  if (!parsed) {
    throw new LibraryQaError('AI 没有返回可用的回答', 'empty-answer')
  }

  const excerptByIndex = new Map(excerpts.map((excerpt) => [excerpt.index, excerpt]))
  const citations: QaCitation[] = parsed.citations
    .map((citation) => {
      const excerpt = excerptByIndex.get(citation.excerpt)
      if (!excerpt) return null
      const chapterTexts = corpusCache.get(excerpt.bookId)?.chapterTexts ?? []
      const location = locateQuote(chapterTexts, citation.quote, excerpt.chapterIndexes)
      return {
        excerptIndex: citation.excerpt,
        quote: citation.quote,
        location: location
          ? {
              bookId: excerpt.bookId,
              bookTitle: excerpt.bookTitle,
              chapterIndex: location.chapterIndex,
              offsetRatio: location.offsetRatio,
            }
          : null,
      }
    })
    .filter((citation): citation is QaCitation => citation != null)

  return { answer: parsed.answer, citations, searchedBookCount }
}
