/**
 * 书本语料聚合：为知识产物生成提供「可分析文本」。
 *
 * - text（TXT/MD/EPUB）：经 loadTextContent 取章节全文
 * - pdf：经 pdfText 服务取逐页文本层
 * - comic：无文本层，不支持（上层提示改用 OCR 实验入口或跳过）
 *
 * 输出为带标签分块（章节打包至目标体积，超长章节按段落切分），
 * 标签用于思维导图分支命名（如「第1-3章」）。
 */

import { getPdfPageTexts } from '@/services/pdfText'
import { loadTextContent } from '@/services/textContent'
import type { Book } from '@/types'

export interface BookCorpusChunk {
  /** 分块标签（分支名），如「第1-3章」或「第1-40页」 */
  label: string
  text: string
  /** 本块覆盖的章节索引（0 起；PDF 为页索引）——知识件回原文的跳转依据 */
  chapterIndexes: number[]
}

export interface BookCorpus {
  chunks: BookCorpusChunk[]
  /** 原书总章节数（PDF 为页数；范围生成时 > 语料覆盖数） */
  chapterCount: number
  /** 实际进入语料的章节数（范围生成 < chapterCount；全书两者相等） */
  coveredChapterCount: number
  /** 实际覆盖的章索引区间（未限范围时为 null）——meta.scope 的落库依据 */
  coveredRange: { from: number; to: number } | null
  /** 切块总数（与 chunks.length 一致；字段保留供产物 meta 对账兼容） */
  totalChunkCount: number
  totalChars: number
  /** 内容指纹：章节量+分块长度+块头部的确定性哈希，内容变化后提示重生成 */
  fingerprint: string
  /** 逐章全文（证据原文的本地校验与定位用；仅生成期间持有。
   *  按绝对章索引对齐，范围外的章为空串——回原文坐标不因范围生成错位） */
  chapterTexts: string[]
}

/** 每块目标字符数（CJK 约 1.5~2 token/字，兼顾上下文完整性与请求体积） */
export const CHUNK_TARGET_CHARS = 6000
/** 单章超长时的切分上限 */
export const CHUNK_SPLIT_CHARS = 9000

/** 全书骨架（digest）总预算：压在单块提示词注入上限（8k）之内，任何模型都吃得下 */
export const DIGEST_BUDGET_CHARS = 7600
/** 骨架里每章的最小配额（标题 + 首尾摘句）：低于此值改为等距采样减少章数 */
const DIGEST_MIN_PER_CHAPTER = 60
/** 单章首/尾摘句的配额上限（章少时也不至于单章吃掉半个预算） */
const DIGEST_MAX_PER_SIDE = 260
/** 章标题在骨架行里的截断长度 */
const DIGEST_TITLE_MAX_CHARS = 20
/** 骨架行里行首标签与省略号的固定开销（每章配额先扣掉再切摘句） */
const DIGEST_LINE_OVERHEAD_CHARS = 12
/** 尾句值得保留的最小间隔（正文比首句长这么多才补尾句） */
const DIGEST_MIN_TAIL_GAP = 8

export class BookCorpusError extends Error {
  constructor(message: string, readonly code: 'unsupported' | 'empty') {
    super(message)
    this.name = 'BookCorpusError'
  }
}

interface PackEntry {
  label: string
  text: string
  /** 所属章节索引（0 起；PDF 为页索引） */
  chapterIndex: number
}

/** 把章节/页组序列打包成目标体积的分块；单条超长按段落切分（碎片继承同章索引） */
export function packCorpusEntries(entries: PackEntry[]): BookCorpusChunk[] {
  const chunks: BookCorpusChunk[] = []
  let buffer: string[] = []
  let bufferChars = 0
  let bufferChapters = new Set<number>()

  const flush = () => {
    const text = buffer.join('\n\n').trim()
    const chapterIndexes = [...bufferChapters].sort((a, b) => a - b)
    buffer = []
    bufferChars = 0
    bufferChapters = new Set()
    if (text) chunks.push({ label: '', text, chapterIndexes })
  }

  for (const entry of entries) {
    const text = entry.text.trim()
    if (!text) continue
    if (text.length > CHUNK_SPLIT_CHARS) {
      flush()
      for (const piece of splitLongText(text)) {
        chunks.push({ label: '', text: piece, chapterIndexes: [entry.chapterIndex] })
      }
      continue
    }
    if (bufferChars + text.length > CHUNK_TARGET_CHARS && buffer.length > 0) {
      flush()
    }
    buffer.push(`${entry.label ? `【${entry.label}】\n` : ''}${text}`)
    bufferChars += text.length
    bufferChapters.add(entry.chapterIndex)
  }
  flush()
  return chunks.map((chunk, index) => ({ ...chunk, label: `片段${index + 1}` }))
}

/** 超长章节按段落聚合切分（尽量在段落边界断开） */
function splitLongText(text: string): string[] {
  const paragraphs = text.split(/\n+/)
  const pieces: string[] = []
  let current: string[] = []
  let currentChars = 0
  for (const paragraph of paragraphs) {
    if (currentChars + paragraph.length > CHUNK_TARGET_CHARS && current.length > 0) {
      pieces.push(current.join('\n').trim())
      current = []
      currentChars = 0
    }
    current.push(paragraph)
    currentChars += paragraph.length
  }
  const tail = current.join('\n').trim()
  if (tail) pieces.push(tail)
  return pieces
}

/** 指纹签名取每块头部字符数（长书免全文哈希的折中：头部改写也能反映内容变化） */
const FINGERPRINT_HEAD_CHARS = 80

/** FNV-1a 32 位哈希（确定性指纹，非加密用途）。
 *  函数体内的常量是算法规定的位混淆参数与进制位权，非业务阈值。 */
/* eslint-disable no-magic-numbers */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}
/* eslint-enable no-magic-numbers */

/** 内容指纹：块数 + 总字数 + 每块长度与头部字样 */
export function computeCorpusFingerprint(chunks: BookCorpusChunk[], chapterCount: number): string {
  const signature = chunks
    .map((chunk) => `${chunk.text.length}:${chunk.text.slice(0, FINGERPRINT_HEAD_CHARS)}`)
    .join('|')
  return `${chapterCount}-${chunks.length}-${fnv1a(signature)}`
}

/** 聚合一本书的可分析文本；不支持/无文本时抛 BookCorpusError。
 *  range（0 起章索引闭区间）限定生成范围——章节按绝对索引入列，
 *  证据定位与回原文跳转的章坐标与全书生成完全一致。 */
export async function buildBookCorpus(
  book: Book,
  range?: { from: number; to?: number }
): Promise<BookCorpus> {
  const entries: PackEntry[] = []
  const chapterTexts: string[] = []
  let chapterCount = 0
  // to 省略 = 直到末尾（增量补充：书还在连载，结尾未知）
  const inRange = (index: number) =>
    !range || (index >= range.from && (range.to == null || index <= range.to))

  if (book.format === 'text') {
    const { chapters } = await loadTextContent(book.id)
    chapterCount = chapters.length
    chapters.forEach((chapter, index) => {
      if (inRange(index)) {
        entries.push({ label: chapter.title, text: chapter.content, chapterIndex: index })
      }
      chapterTexts.push(inRange(index) ? chapter.content : '')
    })
  } else if (book.format === 'pdf') {
    const pages = await getPdfPageTexts(book.id)
    chapterCount = pages.length
    pages.forEach((pageText, index) => {
      // 逐页入列（打包按体积自然成组），章索引即页索引——回原文走 ?page= 直达
      if (inRange(index)) {
        entries.push({ label: `第${index + 1}页`, text: pageText, chapterIndex: index })
      }
      chapterTexts.push(inRange(index) ? pageText : '')
    })
  } else {
    throw new BookCorpusError('漫画没有可分析的文本层', 'unsupported')
  }

  const hasText = entries.some((entry) => entry.text.trim().length > 0)
  if (!hasText) {
    throw new BookCorpusError('这本书提不出可分析的文本（可能没有文字层）', 'empty')
  }

  // 分块数由全书字数自然决定（字数/6k 目标块），不设硬上限——
  // 长书全本覆盖靠分块并发控制耗时，不再以「取前 N 块」截断分析
  const chunks = packCorpusEntries(entries)
  const totalChars = chunks.reduce((sum, chunk) => sum + chunk.text.length, 0)
  const coveredIndexes = [...new Set(chunks.flatMap((chunk) => chunk.chapterIndexes))]
  const coveredRange =
    range && coveredIndexes.length > 0
      ? { from: Math.min(...coveredIndexes), to: Math.max(...coveredIndexes) }
      : null

  return {
    chunks,
    chapterCount,
    coveredChapterCount: coveredIndexes.length,
    coveredRange,
    totalChunkCount: chunks.length,
    totalChars,
    chapterTexts,
    fingerprint: computeCorpusFingerprint(chunks, coveredIndexes.length),
  }
}

/** 骨架里的单章行：标题 + 字数 + 首尾**逐字**摘句（ whitespace 不折叠——证据定位靠 indexOf 逐字命中） */
export interface DigestEntry {
  chapterIndex: number
  title: string
  line: string
}

/** 首尾摘句直接切原文原串：骨架行是章节真子串，模型逐字引用后必能在章文本中 indexOf 命中 */
function digestExcerpt(text: string, quota: number, fromEnd: boolean): string {
  const trimmed = text.trim()
  if (trimmed.length <= quota) return trimmed
  return fromEnd ? trimmed.slice(-quota) : trimmed.slice(0, quota)
}

/** 确定性选章：章数超出预算时等距采样，首尾章保序（同一本书永远得到同一份骨架） */
export function selectDigestChapters(total: number, budget: number): number[] {
  const maxAffordable = Math.max(1, Math.floor(budget / DIGEST_MIN_PER_CHAPTER))
  if (total <= maxAffordable) return Array.from({ length: total }, (_, i) => i)
  const selected: number[] = []
  for (let i = 0; i < maxAffordable; i++) {
    selected.push(Math.round((i * (total - 1)) / (maxAffordable - 1)))
  }
  return [...new Set(selected)].sort((a, b) => a - b)
}

/** 把章节序列压成全书骨架行：每章按配额切首尾摘句，超预算自动缩配额/采样。
 *  chapters 可携带 index（范围生成时的绝对章索引；缺省 = 数组序）——
 *  骨架行展示序号与 DigestEntry.chapterIndex 一律用绝对索引，回原文坐标不因范围生成错位 */
export function buildDigestEntries(
  chapters: { title: string; content: string; index?: number }[],
  budget: number = DIGEST_BUDGET_CHARS
): DigestEntry[] {
  if (chapters.length === 0) return []
  const indexes = selectDigestChapters(chapters.length, budget)
  const perChapter = Math.min(DIGEST_MAX_PER_SIDE, Math.floor(budget / indexes.length))
  const perSide = Math.max(1, Math.floor((perChapter - DIGEST_LINE_OVERHEAD_CHARS) / 2))
  return indexes.map((localIndex) => {
    const chapter = chapters[localIndex]
    const chapterIndex = chapter.index ?? localIndex
    const title = chapter.title.trim().slice(0, DIGEST_TITLE_MAX_CHARS) || `第${chapterIndex + 1}章`
    const chars = chapter.content.length
    const head = digestExcerpt(chapter.content, perSide, false)
    const tail =
      chapter.content.length > head.length + DIGEST_MIN_TAIL_GAP
        ? digestExcerpt(chapter.content, perSide, true)
        : ''
    return {
      chapterIndex,
      title,
      line: `第${chapterIndex + 1}章 ${title}（约${chars}字）：${head}${tail ? `……${tail}` : ''}`,
    }
  })
}

/**
 * 全书骨架语料：digest 即唯一分块——节拍等「全书视野」任务走这里，
 * 注册表/Store 的单块循环、重试、进度、盖章与证据校验全部原样复用。
 * chapterTexts 仍是全文（证据逐字定位在真章文本上进行，不受限于此压缩视图）。
 */
export async function buildDigestCorpus(
  book: Book,
  range?: { from: number; to?: number }
): Promise<BookCorpus> {
  const inRange = (index: number) =>
    !range || (index >= range.from && (range.to == null || index <= range.to))
  const chapterTexts: string[] = []
  const chapters: { title: string; content: string; index: number }[] = []
  let chapterCount = 0

  if (book.format === 'text') {
    const { chapters: textChapters } = await loadTextContent(book.id)
    chapterCount = textChapters.length
    textChapters.forEach((chapter, index) => {
      chapterTexts.push(inRange(index) ? chapter.content : '')
      if (inRange(index)) chapters.push({ title: chapter.title, content: chapter.content, index })
    })
  } else if (book.format === 'pdf') {
    const pages = await getPdfPageTexts(book.id)
    chapterCount = pages.length
    pages.forEach((pageText, index) => {
      chapterTexts.push(inRange(index) ? pageText : '')
      if (inRange(index)) chapters.push({ title: `第${index + 1}页`, content: pageText, index })
    })
  } else {
    throw new BookCorpusError('漫画没有可分析的文本层', 'unsupported')
  }

  const entries = buildDigestEntries(chapters)
  const text = entries.map((entry) => entry.line).join('\n')
  if (!text.trim()) {
    throw new BookCorpusError('这本书提不出可分析的文本（可能没有文字层）', 'empty')
  }
  const coveredIndexes = entries.map((entry) => entry.chapterIndex)
  const chunk: BookCorpusChunk = {
    label: '全书骨架',
    text,
    chapterIndexes: coveredIndexes,
  }
  const coveredRange =
    range && coveredIndexes.length > 0
      ? { from: Math.min(...coveredIndexes), to: Math.max(...coveredIndexes) }
      : null

  return {
    chunks: [chunk],
    chapterCount,
    coveredChapterCount: coveredIndexes.length,
    coveredRange,
    totalChunkCount: 1,
    totalChars: text.length,
    chapterTexts,
    fingerprint: computeCorpusFingerprint([chunk], chapterCount),
  }
}
