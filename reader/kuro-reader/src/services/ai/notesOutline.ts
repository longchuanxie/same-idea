/**
 * 从划线与批注生成写作提纲（摘抄墙「生成提纲」消费）。
 *
 * 输入是摘抄墙**当前筛选结果**（标签/书/形态/关键词筛出的那组手记）——
 * 「按主题取材」的原料即所见。提纲/解析纯函数化便于测试；
 * 与知识库同一套用户自配 AI 服务，仅点「生成提纲」时调用。
 */

import { chatCompletionJson, type AiProviderConfig } from '@/services/ai/aiClient'
import type { Annotation } from '@/types'

/** 送入提纲的手记上限（多了既贵又散——先筛后提纲是正道） */
export const OUTLINE_MAX_ENTRIES = 40
/** 划线截断长度（提纲只需识別，不需要全文） */
export const OUTLINE_QUOTE_CHARS = 120

export interface OutlineSourceEntry {
  /** 1 起编号（提纲正文里 [n] 回指） */
  index: number
  quote: string
  note?: string
  bookTitle: string
}

export interface NotesOutlineResult {
  title: string
  markdown: string
}

/** 从筛选后的手记构建提纲原料（截断 + 编号，按更新时间新者在前） */
export function buildOutlineSources(
  annotations: Annotation[],
  bookTitleOf: (bookId: string) => string
): OutlineSourceEntry[] {
  return [...annotations]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, OUTLINE_MAX_ENTRIES)
    .map((ann, i) => ({
      index: i + 1,
      quote: ann.selectedText.slice(0, OUTLINE_QUOTE_CHARS).trim(),
      note: ann.note.trim() || undefined,
      bookTitle: bookTitleOf(ann.bookId),
    }))
    .filter((entry) => entry.quote.length > 0)
}

export function buildOutlineMessages(
  sources: OutlineSourceEntry[],
  focusLabel?: string
): { role: 'system' | 'user'; content: string }[] {
  const entryLines = sources
    .map((entry) =>
      [`[${entry.index}]《${entry.bookTitle}》：「${entry.quote}」`, entry.note ? `（笔记：${entry.note}）` : null]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n')
  return [
    {
      role: 'system',
      content: [
        '你是一位严谨的写作助手，任务是把读者的划线与批注整理成一份可动笔的提纲。',
        '只依据给定条目组织论点，不虚构条目里没有的内容。',
        '严格只输出一个 JSON 对象，不要任何解释、前后缀或代码围栏。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        focusLabel ? `主题：${focusLabel}` : '（未指定主题，从条目里提炼）',
        '',
        '读者的手记条目：',
        entryLines,
        '',
        '请输出 JSON：',
        '{"title":"提纲标题（≤16字）","markdown":"提纲正文（Markdown：## 小节标题 + 分点；引用条目处标注编号如 [1]）"}',
        '要求：',
        '- 提纲面向写作：论点小节 → 支撑要点，条目编号是小节的证据',
        '- 3-6 个小节，每节 2-4 个要点；条目不足支撑时给可写的角度而非硬凑',
        '- 不逐字堆砌引文，提炼观点；不虚构条目编号',
      ].join('\n'),
    },
  ]
}

interface RawOutlineResult {
  title?: unknown
  markdown?: unknown
}

/** 解析提纲回复；标题或正文缺失返回 null */
export function parseOutlineResult(raw: unknown): NotesOutlineResult | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as RawOutlineResult
  const title = typeof value.title === 'string' ? value.title.trim() : ''
  const markdown = typeof value.markdown === 'string' ? value.markdown.trim() : ''
  if (!markdown) return null
  return { title: title || '提纲', markdown }
}

export async function generateNotesOutline(
  config: AiProviderConfig,
  sources: OutlineSourceEntry[],
  focusLabel?: string,
  signal?: AbortSignal
): Promise<NotesOutlineResult> {
  const raw = await chatCompletionJson<unknown>(config, {
    messages: buildOutlineMessages(sources, focusLabel),
    signal,
  })
  const parsed = parseOutlineResult(raw)
  if (!parsed) {
    throw new Error('AI 没有返回可用的提纲')
  }
  return parsed
}
