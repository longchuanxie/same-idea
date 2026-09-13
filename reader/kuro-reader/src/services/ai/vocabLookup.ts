/**
 * 划词查词（生词本消费）：用户自配的 OpenAI 兼容服务当词典用。
 * 提示词/解析是纯函数（buildVocabMessages / parseVocabResult）便于测试；
 * 与知识库生成同一套凭据（knowledgeAi*），仅用户点「查词」时调用。
 */

import {
  chatCompletionJson,
  type AiProviderConfig,
} from '@/services/ai/aiClient'

export interface VocabLookupInput {
  word: string
  /** 语境句（选区前后截断的原文）——多义词选义的关键 */
  context: string
  bookTitle?: string
}

export interface VocabLookupResult {
  word: string
  pronunciation?: string
  definition: string
  note?: string
}

const VOCAB_SYSTEM_PROMPT = [
  '你是一本严谨的词典，任务是为读者解释阅读中遇到的词或短语。',
  '结合语境句判断义项；释义用中文，简洁准确，不编造不常见的义项。',
  '严格只输出一个 JSON 对象，不要输出任何解释、前后缀或代码围栏。',
].join('\n')

export function buildVocabMessages(input: VocabLookupInput): { role: 'system' | 'user'; content: string }[] {
  const bookLine = input.bookTitle ? `（出自《${input.bookTitle}》）` : ''
  return [
    { role: 'system', content: VOCAB_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        `要查的词：${input.word}${bookLine}`,
        input.context ? `语境句：${input.context}` : '（无语境句）',
        '',
        '请输出 JSON：',
        '{"word":"原词（照抄）","pronunciation":"发音：中文词给拼音、外文词给音标（没有把握就省略该字段）","definition":"中文释义：词性 + 结合语境的正确义项，可列至多 2 个（≤80字）","note":"搭配或用法提示（可省略，≤40字）"}',
        '要求：',
        '- 释义必须是中文；英文词给中文释义，中文词直接解释',
        '- 若是短语或习语，整体释义，不拆词',
        '- 语境句足以消歧时只给最贴切的一个义项',
      ].join('\n'),
    },
  ]
}

interface RawVocabResult {
  word?: unknown
  pronunciation?: unknown
  definition?: unknown
  note?: unknown
}

/** 解析查词回复；形状不对或缺释义返回 null（调用方提示失败） */
export function parseVocabResult(raw: unknown): VocabLookupResult | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as RawVocabResult
  const word = typeof value.word === 'string' ? value.word.trim() : ''
  const definition = typeof value.definition === 'string' ? value.definition.trim() : ''
  if (!definition) return null
  const pronunciation =
    typeof value.pronunciation === 'string' && value.pronunciation.trim() ? value.pronunciation.trim() : undefined
  const note = typeof value.note === 'string' && value.note.trim() ? value.note.trim() : undefined
  return { word: word || definition, pronunciation, definition, note }
}

export async function lookupWord(
  config: AiProviderConfig,
  input: VocabLookupInput,
  signal?: AbortSignal
): Promise<VocabLookupResult> {
  const raw = await chatCompletionJson<unknown>(config, { messages: buildVocabMessages(input), signal })
  const parsed = parseVocabResult(raw)
  if (!parsed) {
    throw new Error('词典没有返回可用的释义')
  }
  return parsed
}
