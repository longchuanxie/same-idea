import { describe, it, expect } from 'vitest'

import type { Annotation } from '@/types'
import { buildAnnotationMarkdown, sanitizeFileName } from '@/utils/annotationExport'

const makeAnnotation = (overrides: Partial<Annotation>): Annotation => ({
  id: 'a1',
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '原文句子',
  note: '这是笔记',
  startOffset: 0,
  endOffset: 4,
  style: 'highlight',
  createdAt: new Date('2026-08-29T10:00:00'),
  updatedAt: new Date('2026-08-29T10:30:00'),
  ...overrides,
})

const EXPORTED_AT = new Date('2026-08-29T14:30:00')

describe('buildAnnotationMarkdown', () => {
  it('builds header with title, author, time and count', () => {
    const md = buildAnnotationMarkdown(
      '夜航',
      '某作者',
      [makeAnnotation({})],
      EXPORTED_AT
    )

    expect(md).toContain('# 《夜航》批注')
    expect(md).toContain('作者：某作者')
    expect(md).toContain('导出时间：2026-08-29 14:30')
    expect(md).toContain('批注数量：1')
  })

  it('omits author line when empty', () => {
    const md = buildAnnotationMarkdown('夜航', '', [makeAnnotation({})], EXPORTED_AT)
    expect(md).not.toContain('作者：')
  })

  it('groups annotations by chapter in reading order', () => {
    const md = buildAnnotationMarkdown('书', undefined, [
      makeAnnotation({ id: 'a2', chapterIndex: 1, chapterTitle: '第二章', selectedText: '后文' }),
      makeAnnotation({ id: 'a1', chapterIndex: 0, chapterTitle: '第一章', selectedText: '前文' }),
    ], EXPORTED_AT)

    const ch1 = md.indexOf('## 第一章')
    const ch2 = md.indexOf('## 第二章')
    expect(ch1).toBeGreaterThan(-1)
    expect(ch2).toBeGreaterThan(ch1)
    expect(md.indexOf('前文')).toBeLessThan(md.indexOf('后文'))
  })

  it('quotes multi-line text as blockquote and includes note and style', () => {
    const md = buildAnnotationMarkdown('书', undefined, [
      makeAnnotation({
        selectedText: '第一行\n第二行',
        note: '很有启发',
        style: 'wavy',
      }),
    ], EXPORTED_AT)

    expect(md).toContain('> 第一行\n> 第二行')
    expect(md).toContain('**笔记**：很有启发')
    expect(md).toContain('`波浪线` · 2026-08-29 10:30')
  })

  it('omits note line for empty notes', () => {
    const md = buildAnnotationMarkdown('书', undefined, [
      makeAnnotation({ note: '   ' }),
    ], EXPORTED_AT)

    expect(md).not.toContain('**笔记**：')
    expect(md).toContain('原文句子')
  })

  it('does not mutate the input array when sorting', () => {
    const annotations = [
      makeAnnotation({ id: 'a2', chapterIndex: 1 }),
      makeAnnotation({ id: 'a1', chapterIndex: 0 }),
    ]
    buildAnnotationMarkdown('书', undefined, annotations, EXPORTED_AT)
    expect(annotations[0].id).toBe('a2')
  })
})

describe('sanitizeFileName', () => {
  it('strips illegal characters and trims', () => {
    expect(sanitizeFileName('书名: 上/下?')).toBe('书名 上下')
  })

  it('caps length and falls back to untitled', () => {
    expect(sanitizeFileName('长'.repeat(80)).length).toBe(50)
    expect(sanitizeFileName('///')).toBe('untitled')
  })
})
