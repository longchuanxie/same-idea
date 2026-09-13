import { describe, it, expect } from 'vitest'

import {
  TRANSLATE_MAX_CHARS,
  buildTranslateMessages,
  parseTranslateResult,
} from '@/services/ai/translation'

describe('buildTranslateMessages', () => {
  it('带译向判定、书名与 JSON 指令', () => {
    const messages = buildTranslateMessages({ text: 'The night was dark.', bookTitle: '长夜' })
    const user = messages[1].content
    expect(user).toContain('译成英文，否则译成中文')
    expect(user).toContain('《长夜》')
    expect(user).toContain('The night was dark.')
    expect(user).toContain('"translation"')
  })

  it('超长文本截断到上限', () => {
    const long = 'a'.repeat(TRANSLATE_MAX_CHARS + 500)
    const user = buildTranslateMessages({ text: long })[1].content
    expect(user).not.toContain('a'.repeat(TRANSLATE_MAX_CHARS + 1))
  })
})

describe('parseTranslateResult', () => {
  it('有效译文返回 trim 后的字符串', () => {
    expect(parseTranslateResult({ translation: '  夜色深沉。 ' })).toBe('夜色深沉。')
  })

  it('缺译文/非对象判废', () => {
    expect(parseTranslateResult({})).toBeNull()
    expect(parseTranslateResult({ translation: '   ' })).toBeNull()
    expect(parseTranslateResult('nope')).toBeNull()
  })
})
