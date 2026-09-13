import { describe, it, expect } from 'vitest'

import {
  OUTLINE_MAX_ENTRIES,
  OUTLINE_QUOTE_CHARS,
  buildOutlineMessages,
  buildOutlineSources,
  parseOutlineResult,
} from '@/services/ai/notesOutline'
import type { Annotation } from '@/types'

const NOW = new Date('2026-09-13T10:00:00')

const makeAnnotation = (overrides: Partial<Annotation> & { id: string }): Annotation => ({
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '权力的游戏开始了',
  note: '',
  startOffset: 0,
  endOffset: 8,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

describe('buildOutlineSources', () => {
  it('按更新时间新者在前、编号 1 起、截断引文', () => {
    const long = '长'.repeat(OUTLINE_QUOTE_CHARS + 50)
    const sources = buildOutlineSources(
      [
        makeAnnotation({ id: 'a1', updatedAt: new Date('2026-09-01') }),
        makeAnnotation({ id: 'a2', bookId: 'b2', selectedText: long, note: '批注', updatedAt: new Date('2026-09-10') }),
      ],
      (bookId) => `书${bookId}`
    )
    expect(sources[0]).toMatchObject({ index: 1, bookTitle: '书b2', note: '批注' })
    expect(sources[0].quote.length).toBe(OUTLINE_QUOTE_CHARS)
    expect(sources[1].index).toBe(2)
  })

  it('空引文条目被滤除；超过上限截到上限', () => {
    expect(buildOutlineSources([makeAnnotation({ id: 'a1', selectedText: '  ' })], () => '书')).toEqual([])
    const many = Array.from({ length: OUTLINE_MAX_ENTRIES + 10 }, (_, i) =>
      makeAnnotation({ id: `a${i}` })
    )
    expect(buildOutlineSources(many, () => '书').length).toBe(OUTLINE_MAX_ENTRIES)
  })
})

describe('buildOutlineMessages', () => {
  it('带条目编号与主题行', () => {
    const messages = buildOutlineMessages(
      [{ index: 1, quote: '一句话', note: '批注', bookTitle: '书A' }],
      '#权力'
    )
    const user = messages[1].content
    expect(user).toContain('主题：#权力')
    expect(user).toContain('[1]《书A》：「一句话」')
    expect(user).toContain('笔记：批注')
    expect(user).toContain('JSON')
  })
})

describe('parseOutlineResult', () => {
  it('完整形态；缺标题回退「提纲」', () => {
    expect(parseOutlineResult({ title: '权力与秩序', markdown: '## 一\n- 点 [1]' })).toEqual({
      title: '权力与秩序',
      markdown: '## 一\n- 点 [1]',
    })
    expect(parseOutlineResult({ markdown: '正文' })).toEqual({ title: '提纲', markdown: '正文' })
  })

  it('缺正文判废', () => {
    expect(parseOutlineResult({ title: '只有标题' })).toBeNull()
    expect(parseOutlineResult('nope')).toBeNull()
  })
})
