/**
 * 划词翻译（句级选区消费）：查词管一个词，这里管一句话/一段。
 * 译向自动判定：原文中文 → 英文，其他 → 中文（对照阅读的双向都要）。
 * 与知识库同一套用户自配 AI 服务，仅点「翻译」时调用。
 */

import { chatCompletionJson, type AiProviderConfig } from '@/services/ai/aiClient'

/** 送译文本上限（超长截断——选区翻译的合理边界，整章翻译请走别的路） */
export const TRANSLATE_MAX_CHARS = 2000

export interface TranslateInput {
  text: string
  bookTitle?: string
}

export function buildTranslateMessages(input: TranslateInput): { role: 'system' | 'user'; content: string }[] {
  const bookLine = input.bookTitle ? `（出自《${input.bookTitle}》）` : ''
  return [
    {
      role: 'system',
      content: [
        '你是一位严谨的译者，为读者翻译阅读中选中的句子或段落。',
        '忠实原意、译文流畅自然，保留原文的语气与术语；不增译、不漏译、不加解说。',
        '严格只输出一个 JSON 对象，不要任何解释、前后缀或代码围栏。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: [
        `请翻译下面的选中文本${bookLine}：译向自动判定——原文是中文则译成英文，否则译成中文。`,
        '输出 JSON：{"translation":"译文"}',
        '',
        input.text.slice(0, TRANSLATE_MAX_CHARS),
      ].join('\n'),
    },
  ]
}

/** 解析翻译回复；无有效译文返回 null */
export function parseTranslateResult(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const translation = (raw as { translation?: unknown }).translation
  if (typeof translation !== 'string' || !translation.trim()) return null
  return translation.trim()
}

export async function translateSelection(
  config: AiProviderConfig,
  input: TranslateInput,
  signal?: AbortSignal
): Promise<string> {
  const raw = await chatCompletionJson<unknown>(config, {
    messages: buildTranslateMessages(input),
    signal,
  })
  const parsed = parseTranslateResult(raw)
  if (!parsed) {
    throw new Error('AI 没有返回可用的译文')
  }
  return parsed
}
