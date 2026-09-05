import { Marked, type Token, type Tokens } from 'marked'

const LAST_ASCII_CONTROL_CODE = 31
const DELETE_ASCII_CONTROL_CODE = 127

const markdownLexer = new Marked()

export type MarkdownBlockType =
  | 'paragraph'
  | 'heading'
  | 'blockquote'
  | 'code'
  | 'list-item'
  | 'table'
  | 'math'
  | 'footnote'
  | 'divider'

export type MarkdownSpanType =
  | 'strong'
  | 'emphasis'
  | 'delete'
  | 'code'
  | 'link'
  | 'image'
  | 'math'
  | 'kbd'
  | 'sub'
  | 'sup'
  | 'mark'
  | 'underline'

export interface MarkdownBlock {
  type: MarkdownBlockType
  start: number
  end: number
  depth?: number
  language?: string
  id?: string
  listDepth?: number
  listOrdered?: boolean
  listTask?: boolean
  listChecked?: boolean
  listContentStart?: number
  footnoteLabel?: string
  table?: MarkdownTable
}

export interface MarkdownTableCell {
  start: number
  end: number
  header: boolean
  align: 'center' | 'left' | 'right' | null
}

export interface MarkdownTable {
  rows: MarkdownTableCell[][]
}

export interface MarkdownSpan {
  type: MarkdownSpanType
  start: number
  end: number
  href?: string
  title?: string | null
  alt?: string
  display?: boolean
  formula?: string
  id?: string
}

export interface MarkdownDocument {
  text: string
  blocks: MarkdownBlock[]
  spans: MarkdownSpan[]
  frontMatter: Record<string, string>
}

interface MarkdownDocumentBuilder {
  text: string
  blocks: MarkdownBlock[]
  spans: MarkdownSpan[]
}

function appendText(builder: MarkdownDocumentBuilder, text: string): void {
  builder.text += text
}

/** 还原 Markdown 行内转义：`\,` → `,`、`\*` → `*`（仅作用于公式之外的正文） */
function resolveMarkdownEscapes(text: string): string {
  return text.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, '$1')
}

/**
 * 行内公式切词。入参必须是相邻 text/escape token 的 **raw** 拼接：
 * marked 会把 `\,` 这类转义拆成独立 escape token（text 只剩 `,`，丢掉反斜杠），
 * 若按 token 分别喂进来，`$h = 85\,\mathrm{m}$` 会被切成三段、公式永远匹配不上；
 * 公式命中段保留原始反斜杠（KaTeX 需要 `\,`/`\mathrm`），未命中段还原转义再入正文。
 */
function appendTextWithInlineMath(builder: MarkdownDocumentBuilder, raw: string): void {
  const pattern = /\$(?!\s)([^$\n]+?)(?<!\s)\$/g
  let cursor = 0
  for (const match of raw.matchAll(pattern)) {
    const matchIndex = match.index ?? cursor
    if (matchIndex > cursor) appendText(builder, resolveMarkdownEscapes(raw.slice(cursor, matchIndex)))
    const start = builder.text.length
    appendText(builder, match[1])
    builder.spans.push({
      type: 'math',
      start,
      end: builder.text.length,
      formula: match[1],
    })
    cursor = matchIndex + match[0].length
  }
  if (cursor < raw.length) appendText(builder, resolveMarkdownEscapes(raw.slice(cursor)))
}

function getChildTokens(token: Token): Token[] {
  return 'tokens' in token && Array.isArray(token.tokens) ? token.tokens : []
}

function appendInlineTokens(
  builder: MarkdownDocumentBuilder,
  tokens: Token[],
  htmlStack: Array<{ tag: MarkdownSpanType; start: number }> = []
): void {
  // 相邻 text/escape token 的 raw 缓冲：一次喂给公式切词，避免 escape 切分打断 $...$
  let pendingRaw = ''
  const flushPending = () => {
    if (pendingRaw) {
      appendTextWithInlineMath(builder, pendingRaw)
      pendingRaw = ''
    }
  }
  for (const token of tokens) {
    if (token.type !== 'text' && token.type !== 'escape') flushPending()
    switch (token.type) {
      case 'strong':
      case 'em':
      case 'del':
      case 'link': {
        const styledToken = token as Tokens.Strong | Tokens.Em | Tokens.Del | Tokens.Link
        const start = builder.text.length
        appendInlineTokens(builder, styledToken.tokens, htmlStack)
        const type: MarkdownSpanType = token.type === 'em' ? 'emphasis' : token.type === 'del' ? 'delete' : token.type
        builder.spans.push({
          type,
          start,
          end: builder.text.length,
          ...(token.type === 'link' ? { href: (styledToken as Tokens.Link).href } : {}),
        })
        break
      }
      case 'codespan': {
        const start = builder.text.length
        appendText(builder, token.text)
        builder.spans.push({ type: 'code', start, end: builder.text.length })
        break
      }
      case 'image': {
        const image = token as Tokens.Image
        const start = builder.text.length
        appendText(builder, image.text ? `[图片：${image.text}]` : '[图片]')
        builder.spans.push({
          type: 'image',
          start,
          end: builder.text.length,
          href: image.href,
          title: image.title,
          alt: image.text,
        })
        break
      }
      case 'br':
        appendText(builder, '\n')
        break
      case 'html':
        if (/^<br\s*\/?\s*>$/i.test(token.text.trim())) {
          appendText(builder, '\n')
          break
        }
        {
          const opening = /^<(kbd|sub|sup|mark|u)>$/i.exec(token.text.trim())
          if (opening) {
            const tag = opening[1].toLowerCase() === 'u'
              ? 'underline'
              : opening[1].toLowerCase() as MarkdownSpanType
            htmlStack.push({ tag, start: builder.text.length })
            break
          }
          const closing = /^<\/(kbd|sub|sup|mark|u)>$/i.exec(token.text.trim())
          if (closing) {
            const tag = closing[1].toLowerCase() === 'u'
              ? 'underline'
              : closing[1].toLowerCase() as MarkdownSpanType
            const stackIndex = htmlStack.map((entry) => entry.tag).lastIndexOf(tag)
            if (stackIndex >= 0) {
              const [entry] = htmlStack.splice(stackIndex, 1)
              if (builder.text.length > entry.start) {
                builder.spans.push({ type: tag, start: entry.start, end: builder.text.length })
              }
            }
          }
        }
        break
      case 'escape':
      case 'text': {
        const textToken = token as Tokens.Escape | Tokens.Text
        const childTokens = getChildTokens(token)
        if (childTokens.length) {
          flushPending()
          appendInlineTokens(builder, childTokens, htmlStack)
        } else {
          // raw 保留 `\,` 的反斜杠（text 与 raw 相同；escape 的 text 已丢反斜杠）
          pendingRaw += textToken.raw ?? textToken.text
        }
        break
      }
      default: {
        const childTokens = getChildTokens(token)
        if (childTokens.length) {
          flushPending()
          appendInlineTokens(builder, childTokens, htmlStack)
        } else if ('text' in token && typeof token.text === 'string') {
          pendingRaw += token.raw ?? token.text
        }
        break
      }
    }
  }
  flushPending()
}

function beginBlock(builder: MarkdownDocumentBuilder): number {
  if (builder.text.length > 0 && !builder.text.endsWith('\n\n')) {
    builder.text += builder.text.endsWith('\n') ? '\n' : '\n\n'
  }
  return builder.text.length
}

function appendInlineBlock(
  builder: MarkdownDocumentBuilder,
  type: MarkdownBlockType,
  tokens: Token[],
  options?: Pick<MarkdownBlock, 'depth' | 'language'>
): void {
  const start = beginBlock(builder)
  appendInlineTokens(builder, tokens)
  const end = builder.text.length
  if (end > start) builder.blocks.push({ type, start, end, ...options })
}

function appendList(builder: MarkdownDocumentBuilder, list: Tokens.List, depth = 0): void {
  list.items.forEach((item, index) => {
    const start = beginBlock(builder)
    const marker = list.ordered ? `${Number(list.start || 1) + index}. ` : '• '
    appendText(builder, marker)
    const listContentStart = builder.text.length
    const inlineTokens = item.tokens.flatMap((child) => {
      if (child.type === 'list') return []
      const childTokens = getChildTokens(child)
      return childTokens.length ? childTokens : 'text' in child ? [child] : []
    })
    appendInlineTokens(builder, inlineTokens)
    builder.blocks.push({
      type: 'list-item',
      start,
      end: builder.text.length,
      listDepth: depth,
      listOrdered: list.ordered,
      listTask: item.task,
      listChecked: item.checked,
      listContentStart,
    })

    item.tokens.forEach((child) => {
      if (child.type === 'list') appendList(builder, child as Tokens.List, depth + 1)
    })
  })
}

function appendBlockTokens(builder: MarkdownDocumentBuilder, tokens: Token[]): void {
  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const heading = token as Tokens.Heading
        appendInlineBlock(builder, 'heading', heading.tokens, { depth: heading.depth })
        break
      }
      case 'paragraph': {
        const paragraph = token as Tokens.Paragraph
        const mathMatch = /^\$\$[ \t]*\n?([\s\S]+?)\n?\$\$\s*$/.exec(paragraph.raw)
        if (mathMatch) {
          const start = beginBlock(builder)
          appendText(builder, mathMatch[1].trim())
          builder.blocks.push({ type: 'math', start, end: builder.text.length })
        } else {
          appendInlineBlock(builder, 'paragraph', paragraph.tokens)
        }
        break
      }
      case 'blockquote': {
        const blockquote = token as Tokens.Blockquote
        const start = beginBlock(builder)
        const inlineTokens = blockquote.tokens.flatMap((child) => {
          const childTokens = getChildTokens(child)
          return childTokens.length ? childTokens : 'text' in child ? [child] : []
        })
        appendInlineTokens(builder, inlineTokens)
        const end = builder.text.length
        if (end > start) builder.blocks.push({ type: 'blockquote', start, end })
        break
      }
      case 'code': {
        const code = token as Tokens.Code
        const start = beginBlock(builder)
        appendText(builder, code.text)
        builder.blocks.push({ type: 'code', start, end: builder.text.length, language: code.lang })
        break
      }
      case 'list': {
        appendList(builder, token as Tokens.List)
        break
      }
      case 'table': {
        const table = token as Tokens.Table
        const rows = [table.header, ...table.rows]
        const start = beginBlock(builder)
        const tableRows = rows.map((row, rowIndex) => {
          const cells = row.map((cell, cellIndex) => {
            const cellStart = builder.text.length
            appendInlineTokens(builder, cell.tokens)
            const parsedCell: MarkdownTableCell = {
              start: cellStart,
              end: builder.text.length,
              header: cell.header,
              align: cell.align,
            }
            if (cellIndex < row.length - 1) appendText(builder, '\t')
            return parsedCell
          })
          if (rowIndex < rows.length - 1) appendText(builder, '\n')
          return cells
        })
        builder.blocks.push({ type: 'table', start, end: builder.text.length, table: { rows: tableRows } })
        break
      }
      case 'hr': {
        const start = beginBlock(builder)
        appendText(builder, '────────')
        builder.blocks.push({ type: 'divider', start, end: builder.text.length })
        break
      }
      case 'html': {
        const text = (token as Tokens.HTML).text.replace(/<[^>]*>/g, '').trim()
        if (text) {
          const start = beginBlock(builder)
          appendText(builder, text)
          builder.blocks.push({ type: 'paragraph', start, end: builder.text.length })
        }
        break
      }
      case 'text': {
        const childTokens = getChildTokens(token)
        appendInlineBlock(builder, 'paragraph', childTokens.length ? childTokens : [token])
        break
      }
      default:
        break
    }
  }
}

interface PreparedMarkdown {
  body: string
  frontMatter: Record<string, string>
  footnotes: Array<{ label: string; text: string }>
}

function prepareMarkdown(markdown: string): PreparedMarkdown {
  const frontMatter: Record<string, string> = {}
  let body = markdown.replace(/^\uFEFF/, '')
  const frontMatterMatch = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(body)
  if (frontMatterMatch) {
    frontMatterMatch[1].split(/\r?\n/).forEach((line) => {
      const separator = line.indexOf(':')
      if (separator <= 0) return
      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
      if (key) frontMatter[key] = value
    })
    body = body.slice(frontMatterMatch[0].length)
  }

  const definitions = new Map<string, string>()
  const definitionPattern = /^\[\^([^\]]+)\]:[ \t]*(.*(?:\r?\n(?: {2,}|\t).*)*)$/gm
  body = body.replace(definitionPattern, (_match, rawLabel: string, rawText: string) => {
    const label = rawLabel.trim()
    const text = rawText.replace(/\r?\n(?: {2,}|\t)/g, '\n').trim()
    if (label && text) definitions.set(label, text)
    return ''
  })

  const orderedLabels: string[] = []
  body = body.replace(/\[\^([^\]]+)\]/g, (reference, rawLabel: string) => {
    const label = rawLabel.trim()
    if (!definitions.has(label)) return reference
    if (!orderedLabels.includes(label)) orderedLabels.push(label)
    const number = orderedLabels.indexOf(label) + 1
    return `[〔${number}〕](#footnote-${createMarkdownHeadingId(label)})`
  })

  return {
    body,
    frontMatter,
    footnotes: orderedLabels.map((label) => ({ label, text: definitions.get(label) ?? '' })),
  }
}

function appendFootnotes(
  builder: MarkdownDocumentBuilder,
  footnotes: PreparedMarkdown['footnotes']
): void {
  if (footnotes.length === 0) return
  const dividerStart = beginBlock(builder)
  appendText(builder, '────────')
  builder.blocks.push({ type: 'divider', start: dividerStart, end: builder.text.length })

  const headingStart = beginBlock(builder)
  appendText(builder, '脚注')
  builder.blocks.push({ type: 'heading', start: headingStart, end: builder.text.length, depth: 4 })

  footnotes.forEach((footnote, index) => {
    const start = beginBlock(builder)
    appendText(builder, `${index + 1}. `)
    appendInlineTokens(builder, markdownLexer.lexer(footnote.text, { gfm: true, breaks: true }))
    builder.blocks.push({
      type: 'footnote',
      start,
      end: builder.text.length,
      id: `footnote-${createMarkdownHeadingId(footnote.label)}`,
      footnoteLabel: footnote.label,
    })
  })
}

export function parseMarkdownDocument(markdown: string): MarkdownDocument {
  const prepared = prepareMarkdown(markdown)
  const builder: MarkdownDocumentBuilder = { text: '', blocks: [], spans: [] }
  appendBlockTokens(builder, markdownLexer.lexer(prepared.body, { gfm: true, breaks: true }))
  appendFootnotes(builder, prepared.footnotes)

  const text = builder.text.trimEnd()
  const textLength = text.length
  const usedHeadingIds = new Map<string, number>()
  const blocks = builder.blocks
    .map((block) => ({
      ...block,
      end: Math.min(block.end, textLength),
      ...(block.table ? {
        table: {
          rows: block.table.rows.map((row) => row.map((cell) => ({
            ...cell,
            end: Math.min(cell.end, textLength),
          }))),
        },
      } : {}),
    }))
    .filter((block) => block.start < block.end)
    .map((block) => {
      if (block.type !== 'heading') return block
      const baseId = createMarkdownHeadingId(text.slice(block.start, block.end))
      const occurrence = usedHeadingIds.get(baseId) ?? 0
      usedHeadingIds.set(baseId, occurrence + 1)
      return { ...block, id: occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}` }
    })
  const footnoteReferenceCounts = new Map<string, number>()
  const spans = builder.spans
    .map((span) => ({ ...span, end: Math.min(span.end, textLength) }))
    .filter((span) => span.start < span.end)
    .sort((left, right) => left.start - right.start)
    .map((span) => {
      if (span.type !== 'link' || !span.href?.startsWith('#footnote-')) return span
      const baseId = span.href.replace('#footnote-', 'footnote-ref-')
      const occurrence = footnoteReferenceCounts.get(baseId) ?? 0
      footnoteReferenceCounts.set(baseId, occurrence + 1)
      return { ...span, id: occurrence === 0 ? baseId : `${baseId}-${occurrence + 1}` }
    })

  return {
    text,
    blocks,
    spans,
    frontMatter: prepared.frontMatter,
  }
}

export function isSafeMarkdownLink(href: string): boolean {
  const value = href.trim()
  if (!value || hasControlCharacter(value)) return false
  if (value.startsWith('#')) return true
  if (/^(https?:|mailto:)/i.test(value)) return true
  return !/^[a-z][a-z\d+.-]*:/i.test(value)
}

export function isSafeMarkdownImageSource(source: string): boolean {
  const value = source.trim()
  if (!value || hasControlCharacter(value)) return false
  if (/^(https?:|blob:)/i.test(value)) return true
  if (/^data:image\/(?:avif|gif|jpeg|png|webp);base64,/i.test(value)) return true
  return !/^[a-z][a-z\d+.-]*:/i.test(value)
}

function hasControlCharacter(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code <= LAST_ASCII_CONTROL_CODE || code === DELETE_ASCII_CONTROL_CODE
  })
}

export function createMarkdownHeadingId(heading: string): string {
  const normalized = heading
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || 'section'
}
