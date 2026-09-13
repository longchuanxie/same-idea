import { describe, it, expect } from 'vitest'

import {
  SELECT_PER_BOOK_LIMIT,
  SELECT_TOTAL_LIMIT,
  excerptWindow,
  scoreChunk,
  selectTopChunks,
  tokenizeQuery,
} from '@/utils/qaRetrieval'

describe('tokenizeQuery', () => {
  it('CJK 出双字组，疑问虚词被滤掉', () => {
    const terms = tokenizeQuery('哪本书讲过注意力机制？')
    expect(terms).toContain('讲过')
    expect(terms).toContain('注意')
    expect(terms).toContain('意力')
    expect(terms).toContain('机制')
    expect(terms.some((t) => t.includes('哪本'))).toBe(false)
    expect(terms.some((t) => t === '什么')).toBe(false)
  })

  it('拉丁词整词小写，单词字母不收', () => {
    expect(tokenizeQuery('attention is all you need')).toEqual(
      expect.arrayContaining(['attention', 'need'])
    )
    expect(tokenizeQuery('a book about AI')).toEqual(expect.arrayContaining(['ai']))
  })

  it('单字 CJK 段保单字', () => {
    expect(tokenizeQuery('光')).toEqual(['光'])
  })
})

describe('scoreChunk', () => {
  it('命中词计分，词长加权', () => {
    const terms = tokenizeQuery('注意力机制')
    const hit = scoreChunk('注意力机制是模型的核心，注意力权重决定输出', terms)
    const miss = scoreChunk('这一章讲的是循环网络的展开', terms)
    expect(hit).toBeGreaterThan(0)
    expect(miss).toBe(0)
  })

  it('书名命中整体加成（问书名时该书段落提权）', () => {
    const terms = tokenizeQuery('三体 讲了什么')
    const withTitle = scoreChunk('宇宙很大，生活更大', terms, '三体')
    const withoutTitle = scoreChunk('宇宙很大，生活更大', terms)
    expect(withTitle).toBeGreaterThan(withoutTitle)
  })
})

describe('selectTopChunks', () => {
  const chunk = (bookId: string, chunkIndex: number, text: string) => ({
    bookId,
    bookTitle: `书${bookId}`,
    chunkIndex,
    label: `片段${chunkIndex + 1}`,
    text,
    chapterIndexes: [chunkIndex],
  })

  it('零分段排除；按分排序；每书限流保多样性', () => {
    const chunks = [
      chunk('a', 0, '注意力机制'),
      chunk('a', 1, '注意力机制'),
      chunk('a', 2, '注意力机制'),
      chunk('a', 3, '注意力机制'),
      chunk('b', 0, '注意力机制'),
      chunk('c', 0, '无关内容'),
    ]
    const selected = selectTopChunks(chunks, '注意力')
    expect(selected.map((c) => c.bookId).sort()).toEqual(['a', 'a', 'a', 'b'])
    expect(selected.every((c) => c.score > 0)).toBe(true)
  })

  it('空查询词条返回空（纯虚词问不出段）', () => {
    expect(selectTopChunks([chunk('a', 0, '任何内容')], '什么 怎么')).toEqual([])
  })

  it('总数上限生效', () => {
    const chunks = Array.from({ length: 10 }, (_, i) => chunk('a', i, '注意力机制'))
    expect(selectTopChunks(chunks, '注意力').length).toBeLessThanOrEqual(SELECT_TOTAL_LIMIT)
    expect(SELECT_PER_BOOK_LIMIT).toBe(3)
  })
})

describe('excerptWindow', () => {
  const text = 'A'.repeat(500) + '注意力在这里' + 'B'.repeat(500)

  it('命中词居中开窗，两端补省略号', () => {
    const excerpt = excerptWindow(text, '注意力', 100)
    expect(excerpt).toContain('注意力')
    expect(excerpt.startsWith('…')).toBe(true)
    expect(excerpt.endsWith('…')).toBe(true)
    expect(excerpt.length).toBeLessThanOrEqual(102)
  })

  it('无命中取段首（不补前省略号）', () => {
    const excerpt = excerptWindow(text, '查不到的词xyz', 50)
    expect(excerpt.startsWith('A')).toBe(true)
    expect(excerpt.endsWith('…')).toBe(true)
  })
})
