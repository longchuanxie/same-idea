/**
 * 问藏书的检索层（本地关键词打分，无向量、无外部服务）。
 *
 * 查询分词：CJK 双字组 + 拉丁/数字词（低配但零依赖的 BM25 之魂）；
 * 打分：词频（封顶）× 词长权重 + 书名命中加成；选段：按分取前 N、
 * 每书限流保多书多样性。纯函数，测试见 qaRetrieval.test.ts。
 */

/** CJK 统一表意区间 */
const CJK_RUN = /[\u4e00-\u9fff]+/g
const LATIN_RUN = /[A-Za-z0-9]+/g

/** 疑问虚词双字组：不参与打分（「什么」「怎么」这类词谁的书里都有） */
const STOP_BIGRAMS = new Set([
  '什么', '怎么', '怎样', '如何', '为何', '为什', '哪个', '哪些', '哪本', '哪儿',
  '可以', '能不', '是不', '这个', '那个', '作者', '本书', '书中', '里的', '书的',
])

/** 单词词频计分封顶：防一个词刷屏的段落垄断 */
const TERM_COUNT_CAP = 5
/** 选段总数与每书上限 */
export const SELECT_TOTAL_LIMIT = 6
export const SELECT_PER_BOOK_LIMIT = 3
/** 词长达到该值的词条按重词计（拉丁整词/长词更可信） */
const LONG_TERM_MIN_CHARS = 3
const LONG_TERM_WEIGHT = 2
/** 书名命中加成（倍数）：问「三体」时《三体》的段落整体提权 */
const TITLE_MATCH_BONUS = 3

/** 查询分词：CJK 连续段出双字组（单字段保单字），拉丁/数字出整词（小写） */
export function tokenizeQuery(query: string): string[] {
  const terms: string[] = []
  for (const run of query.match(CJK_RUN) ?? []) {
    if (run.length === 1) {
      terms.push(run)
      continue
    }
    for (let i = 0; i + 2 <= run.length; i++) {
      const bigram = run.slice(i, i + 2)
      if (!STOP_BIGRAMS.has(bigram)) terms.push(bigram)
    }
  }
  for (const run of query.match(LATIN_RUN) ?? []) {
    if (run.length >= 2 || /\d/.test(run)) terms.push(run.toLowerCase())
  }
  return terms
}

function countCapped(text: string, term: string): number {
  let count = 0
  let index = text.indexOf(term)
  while (index >= 0 && count < TERM_COUNT_CAP) {
    count += 1
    index = text.indexOf(term, index + term.length)
  }
  return count
}

/** 单段打分：词频（封顶）× 词长权重；书名词命中整体加成 */
export function scoreChunk(
  text: string,
  terms: string[],
  bookTitleForBonus?: string
): number {
  let score = 0
  for (const term of terms) {
    const weight = term.length >= LONG_TERM_MIN_CHARS ? LONG_TERM_WEIGHT : 1
    score += countCapped(text, term) * weight
  }
  if (bookTitleForBonus) {
    for (const term of terms) {
      if (bookTitleForBonus.toLowerCase().includes(term)) {
        score += TITLE_MATCH_BONUS
      }
    }
  }
  return score
}

export interface RetrievalChunk {
  bookId: string
  bookTitle: string
  /** 该书内的块序号（excerpt 定位与展示用） */
  chunkIndex: number
  label: string
  text: string
  /** 覆盖章节（0 起；PDF 为页索引） */
  chapterIndexes: number[]
}

export interface ScoredChunk extends RetrievalChunk {
  score: number
}

/** 选段：分 > 0 才入列，按分排序，每书限流保多样性 */
export function selectTopChunks(
  chunks: RetrievalChunk[],
  query: string,
  totalLimit: number = SELECT_TOTAL_LIMIT,
  perBookLimit: number = SELECT_PER_BOOK_LIMIT
): ScoredChunk[] {
  const terms = tokenizeQuery(query)
  if (terms.length === 0) return []
  const perBook = new Map<string, number>()
  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(chunk.text, terms, chunk.bookTitle) }))
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((chunk) => {
      const used = perBook.get(chunk.bookId) ?? 0
      if (used >= perBookLimit) return false
      perBook.set(chunk.bookId, used + 1)
      return true
    })
    .slice(0, totalLimit)
}

/**
 * 命中开窗：取段落中第一个命中词的周边窗口，既缩提示词体积又居中相关性。
 * 没有命中（书名加成捞上来的段）取段首。
 */
export function excerptWindow(text: string, query: string, windowChars: number): string {
  const terms = tokenizeQuery(query)
  const head = Math.floor(windowChars / HALF)
  for (const term of terms) {
    const index = text.indexOf(term)
    if (index >= 0) {
      const start = Math.max(0, index - head)
      return sliceWithEllipsis(text, start, start + windowChars)
    }
  }
  return sliceWithEllipsis(text, 0, windowChars)
}

const HALF = 2

function sliceWithEllipsis(text: string, start: number, end: number): string {
  const piece = text.slice(start, end).trim()
  const prefix = start > 0 ? '…' : ''
  const suffix = end < text.length ? '…' : ''
  return `${prefix}${piece}${suffix}`
}
