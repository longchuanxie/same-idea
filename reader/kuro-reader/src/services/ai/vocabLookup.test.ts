import { describe, it, expect } from 'vitest'

import { buildVocabMessages, parseVocabResult } from '@/services/ai/vocabLookup'

describe('buildVocabMessages', () => {
  it('提示词带词与语境句', () => {
    const messages = buildVocabMessages({ word: 'benevolent', context: 'a benevolent old man smiled', bookTitle: '远大前程' })
    expect(messages[0].role).toBe('system')
    const user = messages[1].content
    expect(user).toContain('benevolent')
    expect(user).toContain('a benevolent old man smiled')
    expect(user).toContain('《远大前程》')
    expect(user).toContain('JSON')
  })
})

describe('parseVocabResult', () => {
  it('完整形态：词/发音/释义/备注', () => {
    const result = parseVocabResult({
      word: 'benevolent',
      pronunciation: '/bəˈnevələnt/',
      definition: 'adj. 仁慈的，善意的',
      note: '常修饰长辈或组织',
    })
    expect(result).toEqual({
      word: 'benevolent',
      pronunciation: '/bəˈnevələnt/',
      definition: 'adj. 仁慈的，善意的',
      note: '常修饰长辈或组织',
    })
  })

  it('缺 word 时用释义兜底；空备注/空发音省略', () => {
    const result = parseVocabResult({ definition: 'n. 迂回；绕行' })
    expect(result).toEqual({ word: 'n. 迂回；绕行', pronunciation: undefined, note: undefined, definition: 'n. 迂回；绕行' })
  })

  it('缺释义或非对象返回 null（调用方提示失败）', () => {
    expect(parseVocabResult({ word: 'x' })).toBeNull()
    expect(parseVocabResult('nope')).toBeNull()
    expect(parseVocabResult(null)).toBeNull()
  })
})
