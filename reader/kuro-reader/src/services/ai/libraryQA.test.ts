import { describe, it, expect } from 'vitest'

import { buildQaMessages, locateQuote, parseQaAnswer, type QaExcerpt } from '@/services/ai/libraryQA'

const EXCERPT: QaExcerpt = {
  index: 1,
  bookId: 'b1',
  bookTitle: '论文A',
  format: 'text',
  label: '片段3',
  chapterIndexes: [2, 3],
  text: '注意力机制按相关性对输入加权。',
}

describe('buildQaMessages', () => {
  it('提示词带问题、段落标签与 JSON 指令', () => {
    const messages = buildQaMessages('注意力是什么', [EXCERPT])
    expect(messages[0].role).toBe('system')
    const user = messages[1].content
    expect(user).toContain('注意力是什么')
    expect(user).toContain('【段落1｜《论文A》｜片段3】')
    expect(user).toContain('注意力机制按相关性对输入加权')
    expect(user).toContain('JSON')
    expect(user).toContain('逐字摘录')
  })
})

describe('parseQaAnswer', () => {
  it('完整形态：回答 + 引文', () => {
    const parsed = parseQaAnswer({
      answer: '注意力机制按相关性加权 [1]',
      citations: [{ excerpt: 1, quote: '注意力机制按相关性对输入加权' }],
    })
    expect(parsed?.answer).toBe('注意力机制按相关性加权 [1]')
    expect(parsed?.citations).toEqual([{ excerpt: 1, quote: '注意力机制按相关性对输入加权' }])
  })

  it('引文超量截到 4 条；坏引文条目跳过', () => {
    const parsed = parseQaAnswer({
      answer: '答',
      citations: [
        { excerpt: 1, quote: 'a' },
        { excerpt: 2, quote: 'b' },
        { excerpt: 3, quote: 'c' },
        { excerpt: 4, quote: 'd' },
        { excerpt: 5, quote: 'e' },
        { excerpt: 'x', quote: '坏条目' },
        { excerpt: 6 },
      ],
    })
    expect(parsed?.citations.length).toBe(4)
  })

  it('缺回答判废', () => {
    expect(parseQaAnswer({ citations: [] })).toBeNull()
    expect(parseQaAnswer('nope')).toBeNull()
    expect(parseQaAnswer(null)).toBeNull()
  })
})

describe('locateQuote', () => {
  const chapterTexts = ['', '第一章没有目标句', '这一章里藏着目标句：注意力按相关性加权，之后输出。']

  it('先搜提示章（命中即返回章内占比）', () => {
    const found = locateQuote(chapterTexts, '注意力按相关性加权', [2])
    expect(found?.chapterIndex).toBe(2)
    expect(found?.offsetRatio).toBeGreaterThan(0)
    expect(found?.offsetRatio).toBeLessThanOrEqual(1)
  })

  it('提示章没有则全书扫描', () => {
    const found = locateQuote(chapterTexts, '注意力按相关性加权', [0])
    expect(found?.chapterIndex).toBe(2)
  })

  it('找不到返回 null（幻觉引文不给链接）', () => {
    expect(locateQuote(chapterTexts, '原文里没有这句话')).toBeNull()
    expect(locateQuote(chapterTexts, '   ')).toBeNull()
  })
})
