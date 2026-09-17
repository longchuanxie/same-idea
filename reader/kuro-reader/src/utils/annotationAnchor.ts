import type { Annotation, AnnotationAnchor } from '@/types'

/** 上下文指纹片段长度（字符） */
const CONTEXT_LENGTH = 16

/** 折叠空白：DOM 选区文本（Range.toString 不含块级换行）与源文本（含 \n\n 与缩进）的差异都要靠它抹平 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/** 引用文在正文中的一次命中 */
export interface QuoteMatch {
  startOffset: number
  endOffset: number
}

/** 空白归一化模式：collapse = 连续空白折叠为单空格；strip = 去掉全部空白 */
type WhitespaceMode = 'collapse' | 'strip'

function normalizeFor(quote: string, mode: WhitespaceMode): string {
  return mode === 'collapse' ? normalizeWhitespace(quote) : quote.replace(/\s+/g, '')
}

/**
 * 空白归一化索引：归一化文本的第 i 个字符 ↔ 源文本偏移。
 * boundaries 长度为「归一化长度 + 1」，因此一次命中可直接映射回源区间
 * （区间里的空白会被自然包含进去，正是跨段选区需要的效果）。
 */
function buildNormalizedMap(content: string, mode: WhitespaceMode): { text: string; boundaries: number[] } {
  let text = ''
  const boundaries: number[] = []
  let pendingWhitespace = false
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (/\s/.test(char)) {
      pendingWhitespace = true
      continue
    }
    // 前导空白丢弃；内部空白按模式落地（collapse 记一个空格，strip 不记）
    if (pendingWhitespace && text.length > 0 && mode === 'collapse') {
      text += ' '
      boundaries.push(index)
    }
    pendingWhitespace = false
    text += char
    boundaries.push(index)
  }
  // 末尾折叠出的空格与 trim 语义对齐，避免 needle 尾部多一个空格
  if (mode === 'collapse' && text.endsWith(' ')) {
    text = text.slice(0, -1)
    boundaries.pop()
  }
  boundaries.push(content.length)
  return { text, boundaries }
}

/** 在某个归一化空间里检索并映射回源偏移 */
function matchInNormalizedSpace(content: string, quote: string, mode: WhitespaceMode): QuoteMatch[] {
  const needle = normalizeFor(quote, mode)
  if (!needle) return []
  const { text, boundaries } = buildNormalizedMap(content, mode)
  const matches: QuoteMatch[] = []
  let cursor = text.indexOf(needle)
  while (cursor >= 0) {
    const startOffset = boundaries[cursor]
    const endOffset = boundaries[cursor + needle.length]
    if (Number.isFinite(startOffset) && Number.isFinite(endOffset) && endOffset > startOffset) {
      matches.push({ startOffset, endOffset })
    }
    cursor = text.indexOf(needle, cursor + 1)
  }
  return matches
}

/**
 * 在正文中定位引用文，返回全部候选（按源偏移升序）。
 *
 * 三级通道，严格优先（借鉴 Hypothesis 的多策略重挂：先用最精确的，失败才放宽）：
 *  1. 原文直接检索——偏移天然精确，绝大多数情况走这条；
 *  2. 连续空白折叠为单空格——DOM 文本的空格数与源文本不一致（换行、缩进）；
 *  3. 去掉全部空白——DOM 选中的文本不含块级换行，源文本却含 `\n\n`，
 *     跨段选区在源里"凭空多出"空白，只有整段忽略空白才比得上。
 *     这正是「跨段划线的批注刷新后整体消失」的根因。
 */
export function findQuoteMatches(content: string, quote: string): QuoteMatch[] {
  if (!quote) return []

  const matches: QuoteMatch[] = []
  let index = content.indexOf(quote)
  while (index >= 0) {
    matches.push({ startOffset: index, endOffset: index + quote.length })
    index = content.indexOf(quote, index + 1)
  }
  if (matches.length > 0) return matches

  const collapsed = matchInNormalizedSpace(content, quote, 'collapse')
  if (collapsed.length > 0) return collapsed
  return matchInNormalizedSpace(content, quote, 'strip')
}

/** 候选命中的前后上下文是否与锚点指纹一致 */
function matchesFingerprint(
  content: string,
  match: QuoteMatch,
  before: string,
  after: string
): boolean {
  const actualBefore = normalizeWhitespace(
    content.slice(Math.max(0, match.startOffset - CONTEXT_LENGTH), match.startOffset)
  )
  const actualAfter = normalizeWhitespace(content.slice(match.endOffset, match.endOffset + CONTEXT_LENGTH))
  const beforeMatches = before === '' ? true : actualBefore.endsWith(before)
  const afterMatches = after === '' ? true : actualAfter.startsWith(after)
  return beforeMatches && afterMatches
}

/**
 * 计算批注的稳定锚点：选中文本前后各 CONTEXT_LENGTH 字符的指纹 + 出现序号。
 * 内容表示变化（如 EPUB 转换管线调整）后仍可重定位。
 *
 * `quote` 为界面上真正选中的文本（DOM 选区文本）。它与 `content.slice(start,end)` 可能不一致
 * （例如跨段选区在源文本里多出换行、Markdown 语法在渲染时被吃掉），
 * 而重挂时比对用的正是界面上那份文本——所以计数与重挂必须用同一个针，否则 occurrence 会错位。
 */
export function computeAnnotationAnchor(
  content: string,
  startOffset: number,
  endOffset: number,
  quote?: string
): AnnotationAnchor {
  const selectedText = quote && quote.length > 0 ? quote : content.slice(startOffset, endOffset)
  const before = normalizeWhitespace(content.slice(Math.max(0, startOffset - CONTEXT_LENGTH), startOffset))
  const after = normalizeWhitespace(content.slice(endOffset, endOffset + CONTEXT_LENGTH))
  return {
    before,
    after,
    // 0-based：早于本位置、且能通过同一指纹谓词的候选数
    occurrence: countEarlierFingerprintMatches(content, selectedText, startOffset, before, after),
  }
}

function countEarlierFingerprintMatches(
  content: string,
  quote: string,
  startOffset: number,
  before: string,
  after: string
): number {
  let count = 0
  for (const match of findQuoteMatches(content, quote)) {
    if (match.startOffset >= startOffset) break
    if (matchesFingerprint(content, match, before, after)) count += 1
  }
  return count
}

/**
 * 将批注锚定到当前章节内容，返回解析后的偏移；无法定位时返回 null。
 * 解析顺序：上下文指纹 → 原偏移校验（空白容忍）→ 引用文首个命中（尽力而为）。
 */
export function resolveAnnotationOffsets(
  content: string,
  annotation: Pick<Annotation, 'selectedText' | 'startOffset' | 'endOffset' | 'anchor'>
): { startOffset: number; endOffset: number } | null {
  const { selectedText, startOffset, endOffset, anchor } = annotation
  if (!selectedText) return null

  // 1. 上下文指纹匹配（内容表示变化后的首选路径）
  if (anchor) {
    const match = findByFingerprint(content, selectedText, anchor)
    if (match) return match
  }

  // 2. 原偏移仍然指向同一文本
  if (startOffset >= 0 && endOffset > startOffset && endOffset <= content.length) {
    const slice = content.slice(startOffset, endOffset)
    if (slice === selectedText) return { startOffset, endOffset }
    // 空白差异容忍：DOM 选区不含块级换行，源文本含换行与缩进
    if (normalizeWhitespace(slice) === normalizeWhitespace(selectedText)) {
      return { startOffset, endOffset }
    }
  }

  // 3. 尽力而为：引用文定位（原文优先，空白归一化兜底）
  const candidates = findQuoteMatches(content, selectedText)
  if (candidates.length > 0) return candidates[0]

  return null
}

function findByFingerprint(
  content: string,
  selectedText: string,
  anchor: AnnotationAnchor
): { startOffset: number; endOffset: number } | null {
  const before = normalizeWhitespace(anchor.before)
  const after = normalizeWhitespace(anchor.after)
  let validMatches = 0
  for (const match of findQuoteMatches(content, selectedText)) {
    if (!matchesFingerprint(content, match, before, after)) continue
    if (validMatches === anchor.occurrence) {
      return { startOffset: match.startOffset, endOffset: match.endOffset }
    }
    validMatches += 1
  }
  return null
}
