import { describe, it, expect } from 'vitest'

import type { Annotation } from '@/types'
import { buildAnnotationMarkdown, buildMultiBookMarkdown, sanitizeFileName } from '@/utils/annotationExport'

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

  it('tagged annotations emit Obsidian-style #tag lines via tagNames map', () => {
    const md = buildAnnotationMarkdown(
      '书',
      undefined,
      [makeAnnotation({ id: 'a1', tagIds: ['t1', 't2'] }), makeAnnotation({ id: 'a2' })],
      EXPORTED_AT,
      new Map([['t1', '意象'], ['t2', '夜']])
    )
    expect(md).toContain('#意象 #夜')
    // 未打标签的手记不输出空标签行
    const noteCount = (md.match(/#意象/g) ?? []).length
    expect(noteCount).toBe(1)
  })

  it('tags without a matching map entry are skipped silently', () => {
    const md = buildAnnotationMarkdown(
      '书',
      undefined,
      [makeAnnotation({ tagIds: ['gone'] })],
      EXPORTED_AT,
      new Map()
    )
    expect(md).not.toContain('#gone')
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

describe('buildMultiBookMarkdown', () => {
  it('总标题 + 每书二级标题 + 章节分组结构完整', () => {
    const md = buildMultiBookMarkdown(
      [
        {
          bookTitle: '夜航',
          annotations: [
            makeAnnotation({ id: 'a1', bookId: 'b1', chapterIndex: 0, chapterTitle: '第一章' }),
            makeAnnotation({ id: 'a2', bookId: 'b1', chapterIndex: 1, chapterTitle: '第二章' }),
          ],
        },
        {
          bookTitle: '沙之书',
          annotations: [makeAnnotation({ id: 'a3', bookId: 'b2', chapterIndex: 0, chapterTitle: '引子' })],
        },
      ],
      EXPORTED_AT
    )

    expect(md).toContain('# 摘抄墙 · 全部手记')
    expect(md).toContain('书目 2 · 手记 3')
    expect(md).toContain('## 《夜航》')
    expect(md).toContain('## 《沙之书》')
    expect(md).toContain('## 第一章')
    expect(md).toContain('## 引子')
  })

  it('各书按最新手记更新时间倒序（最近动过的在前）', () => {
    const md = buildMultiBookMarkdown(
      [
        {
          bookTitle: '旧书',
          annotations: [makeAnnotation({ id: 'a1', updatedAt: new Date('2026-08-01T10:00:00') })],
        },
        {
          bookTitle: '新书',
          annotations: [makeAnnotation({ id: 'a2', updatedAt: new Date('2026-08-29T10:00:00') })],
        },
      ],
      EXPORTED_AT
    )
    expect(md.indexOf('## 《新书》')).toBeLessThan(md.indexOf('## 《旧书》'))
  })

  it('空手记的书不入正文；全部为空则只有头部落款', () => {
    const md = buildMultiBookMarkdown(
      [
        { bookTitle: '空书', annotations: [] },
        { bookTitle: '有书', annotations: [makeAnnotation({ id: 'a1' })] },
      ],
      EXPORTED_AT
    )
    expect(md).toContain('书目 1')
    expect(md).not.toContain('## 《空书》')
    expect(md).not.toContain('## 《空书》')
  })

  it('孤儿组《已移出的书》与其他书同样正常分组', () => {
    const md = buildMultiBookMarkdown(
      [{ bookTitle: '已移出的书', annotations: [makeAnnotation({ id: 'a1' })] }],
      EXPORTED_AT
    )
    expect(md).toContain('## 《已移出的书》')
    expect(md).toContain('原文句子')
  })

  it('标签行随行输出', () => {
    const md = buildMultiBookMarkdown(
      [{ bookTitle: '书', annotations: [makeAnnotation({ id: 'a1', tagIds: ['t1'] })] }],
      EXPORTED_AT,
      new Map([['t1', '意象']])
    )
    expect(md).toContain('#意象')
  })
})
