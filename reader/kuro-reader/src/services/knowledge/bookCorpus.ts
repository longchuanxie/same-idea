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
/** 分块总数上限（成本护栏：超长书取前 N 块，指纹记录真实块数） */
export const MAX_CHUNKS = 60

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

  const allChunks = packCorpusEntries(entries)
  const chunks = allChunks.slice(0, MAX_CHUNKS)
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
    totalChars,
    chapterTexts,
    fingerprint: computeCorpusFingerprint(chunks, coveredIndexes.length),
  }
}
