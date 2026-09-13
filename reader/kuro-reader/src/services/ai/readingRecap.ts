/**
 * 前情提要的 AI 层（欢迎回来卡「生成前情提要」消费）。
 * 取材 = 当前章之前的内容（文本书 3 章 / PDF 10 页），
 * 产出 ≤5 条剧情/论点回顾 + 一句「此刻处境」。提示词/解析纯函数化。
 */

import { chatCompletionJson, type AiProviderConfig } from '@/services/ai/aiClient'
import type { Book } from '@/types'

/** 送入前情的总字数上限（跨章累计，超长按后段截——离续读点越近越重要） */
export const RECAP_MAX_CHARS = 24000
/** 前情回顾条数上限（提示词约定至多 5 条） */
const RECAP_MAX_ITEMS = 5

export interface RecapResult {
  /** 前情回顾（≤5 条） */
  recap: string[]
  /** 此刻处境一句话 */
  resumeHint: string
}

/** 单位称呼：文本书按章、PDF 按页 */
export function recapUnitLabel(book: Book): string {
  return book.format === 'pdf' ? '页' : '章'
}

/** 组装取材正文：各单元带标签；累计超限从最前段丢起（最旧的内容先舍） */
export function buildRecapSourceText(
  unitTexts: { label: string; text: string }[],
  maxChars: number = RECAP_MAX_CHARS
): string {
  const parts: string[] = []
  let total = 0
  for (const unit of unitTexts) {
    const piece = `【${unit.label}】\n${unit.text.trim()}`
    parts.push(piece)
    total += piece.length
  }
  while (parts.length > 1 && total > maxChars) {
    total -= parts[0].length
    parts.shift()
  }
  return parts.join('\n\n').slice(0, maxChars)
}

export function buildRecapMessages(
  bookTitle: string,
  unitLabel: string,
  nextUnitNumber: number,
  sourceText: string
): { role: 'system' | 'user'; content: string }[] {
  return [
    {
      role: 'system',
      content: [
        '你是一位严谨的读书助手，任务是为久别续读的读者生成前情提要。',
        '只依据给定文本回顾，不推测后续剧情、不引入文本之外的知识。',
        '严格只输出一个 JSON 对象，不要任何解释、前后缀或代码围栏。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `读者正在续读《${bookTitle}》，即将进入第 ${nextUnitNumber} ${unitLabel}。`,
        '下面是此前读过的内容：',
        '',
        sourceText,
        '',
        '请输出 JSON：',
        '{"recap":["此前发生的关键情节或论点（每条≤40字，至多5条，按时间序）"],"resumeHint":"一句话点明此刻的处境或悬念（≤30字）"}',
        '要求：',
        '- recap 只挑影响续读理解的关键：转折、人物动向、核心论点',
        '- resumeHint 是读者合上书那一刻的场景，不剧透未来',
        '- 不虚构文本中没有的内容',
      ].join('\n'),
    },
  ]
}

interface RawRecapResult {
  recap?: unknown
  resumeHint?: unknown
}

/** 解析前情回复；recap 为空数组或形状不对返回 null */
export function parseRecapResult(raw: unknown): RecapResult | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as RawRecapResult
  if (!Array.isArray(value.recap)) return null
  const recap = value.recap
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, RECAP_MAX_ITEMS)
  if (recap.length === 0) return null
  const resumeHint =
    typeof value.resumeHint === 'string' && value.resumeHint.trim() ? value.resumeHint.trim() : ''
  return { recap, resumeHint }
}

export async function generateRecap(
  config: AiProviderConfig,
  input: {
    bookTitle: string
    unitLabel: string
    nextUnitNumber: number
    unitTexts: { label: string; text: string }[]
  },
  signal?: AbortSignal
): Promise<RecapResult> {
  const sourceText = buildRecapSourceText(input.unitTexts)
  const raw = await chatCompletionJson<unknown>(config, {
    messages: buildRecapMessages(input.bookTitle, input.unitLabel, input.nextUnitNumber, sourceText),
    signal,
  })
  const parsed = parseRecapResult(raw)
  if (!parsed) {
    throw new Error('AI 没有返回可用的前情提要')
  }
  return parsed
}
