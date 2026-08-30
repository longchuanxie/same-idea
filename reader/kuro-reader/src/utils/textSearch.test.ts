import { describe, it, expect } from 'vitest'

import type { TextChapter } from '@/services/textContent'
import {
  MIN_QUERY_CHARS,
  searchChapters,
} from '@/utils/textSearch'

const makeChapter = (title: string, content: string, flatText?: string): TextChapter => ({
  id: `ch-${title}`,
  title,
  content,
  ...(flatText !== undefined
    ? { markdownDocument: { text: flatText, blocks: [], spans: [], frontMatter: {} } }
    : {}),
})

describe('searchChapters', () => {
  it('大小写不敏感命中，摘录保留原文大小写', () => {
    const chapters = [makeChapter('第一章', 'The Garden of Forking Paths. garden is quiet.')]
    const hits = searchChapters(chapters, 'GARDEN')
    expect(hits).toHaveLength(2)
    expect(hits[0].match).toBe('Garden')
    expect(hits[1].match).toBe('garden')
  })

  it('CJK 无分词直接子串命中', () => {
    const chapters = [makeChapter('雨夜', '他推开门，雨夜里只有一盏灯。')]
    const hits = searchChapters(chapters, '雨夜')
    expect(hits).toHaveLength(1)
    expect(hits[0].chapterTitle).toBe('雨夜')
    expect(hits[0].before).toBe('他推开门，')
    expect(hits[0].match).toBe('雨夜')
    expect(hits[0].after).toBe('里只有一盏灯。')
  })

  it('多章按章节顺序返回，offset 为章内偏移', () => {
    const chapters = [
      makeChapter('一', '甲乙丙丁'),
      makeChapter('二', '丁甲乙戊'),
    ]
    const hits = searchChapters(chapters, '甲乙')
    expect(hits.map((h) => h.chapterIndex)).toEqual([0, 1])
    expect(hits[0].offset).toBe(0)
    expect(hits[1].offset).toBe(1)
  })

  it('同章内命中不重叠（向后步进）', () => {
    const chapters = [makeChapter('一', 'ababab')]
    const hits = searchChapters(chapters, 'ab')
    expect(hits.map((h) => h.offset)).toEqual([0, 2, 4])
  })

  it('Markdown 章节优先用 markdownDocument.text 检索', () => {
    const chapters = [
      makeChapter('一', '# 标题\n正文内容', '标题正文内容'),
    ]
    const hits = searchChapters(chapters, '正文内容')
    expect(hits).toHaveLength(1)
    expect(hits[0].offset).toBe(2) // 「标题」之后的扁平文本偏移
  })

  it('少于最短字符数的检索词返回空', () => {
    const chapters = [makeChapter('一', '甲乙丙')]
    expect(searchChapters(chapters, '')).toEqual([])
    expect(searchChapters(chapters, '甲')).toEqual([])
    expect(searchChapters(chapters, '  ')).toEqual([])
    expect(MIN_QUERY_CHARS).toBe(2)
  })

  it('无命中返回空数组', () => {
    expect(searchChapters([makeChapter('一', '甲乙丙')], '不存在')).toEqual([])
  })

  it('命中量到达上限即停（50）', () => {
    const chapters = [makeChapter('一', 'ab '.repeat(200))]
    const hits = searchChapters(chapters, 'ab')
    expect(hits).toHaveLength(50)
    expect(hits[49].offset).toBe(49 * 3)
  })
})
