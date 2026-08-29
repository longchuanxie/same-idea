import { describe, expect, it } from 'vitest'

import {
  isSafeMarkdownImageSource,
  isSafeMarkdownLink,
  parseMarkdownDocument,
} from './markdownDocument'

describe('parseMarkdownDocument', () => {
  it('converts markdown syntax into readable text and style metadata', () => {
    const document = parseMarkdownDocument('### 标题\n\n这是 **粗体**、*斜体* 和 `代码`。')

    expect(document.text).toBe('标题\n\n这是 粗体、斜体 和 代码。')
    expect(document.blocks.map((block) => block.type)).toEqual(['heading', 'paragraph'])
    expect(document.spans.map((span) => span.type)).toEqual(['strong', 'emphasis', 'code'])
  })

  it('renders lists, quotes and tables as structured readable text', () => {
    const document = parseMarkdownDocument('> 引用\n\n- 项目一\n- 项目二\n\n| A | B |\n| - | - |\n| 1 | 2 |')

    expect(document.text).toContain('引用')
    expect(document.text).toContain('• 项目一')
    expect(document.text).toContain('A\tB')
    expect(document.blocks.map((block) => block.type)).toContain('table')
    expect(document.blocks.find((block) => block.type === 'table')?.table?.rows).toHaveLength(2)
  })

  it('never treats unsafe protocols as links', () => {
    expect(isSafeMarkdownLink('https://example.com')).toBe(true)
    expect(isSafeMarkdownLink('#chapter')).toBe(true)
    expect(isSafeMarkdownLink('./chapter-2.md')).toBe(true)
    expect(isSafeMarkdownLink('javascript:alert(1)')).toBe(false)
    expect(isSafeMarkdownLink('data:text/html,test')).toBe(false)
  })

  it('keeps images and unique heading anchors as rendering metadata', () => {
    const document = parseMarkdownDocument('## Same\n\n![Cover](https://example.com/cover.png "Cover")\n\n## Same')
    const headings = document.blocks.filter((block) => block.type === 'heading')
    const image = document.spans.find((span) => span.type === 'image')

    expect(headings.map((heading) => heading.id)).toEqual(['same', 'same-2'])
    expect(image).toMatchObject({
      href: 'https://example.com/cover.png',
      alt: 'Cover',
      title: 'Cover',
    })
    expect(isSafeMarkdownImageSource('data:image/png;base64,AAAA')).toBe(true)
    expect(isSafeMarkdownImageSource('data:text/html;base64,AAAA')).toBe(false)
  })

  it('preserves nested list depth instead of flattening nested items into their parent', () => {
    const document = parseMarkdownDocument('- Parent\n  - Child\n    1. Grandchild')
    const items = document.blocks.filter((block) => block.type === 'list-item')

    expect(items.map((item) => item.listDepth)).toEqual([0, 1, 2])
    expect(items.map((item) => document.text.slice(item.start, item.end))).toEqual([
      '• Parent',
      '• Child',
      '1. Grandchild',
    ])
  })

  it('extracts front matter and renders footnotes as linked document blocks', () => {
    const document = parseMarkdownDocument([
      '---',
      'title: "Reader notes"',
      'author: Kuro',
      '---',
      '正文脚注[^note]。',
      '',
      '[^note]: 支持 **格式** 的脚注。',
    ].join('\n'))

    expect(document.frontMatter).toEqual({ title: 'Reader notes', author: 'Kuro' })
    expect(document.text).not.toContain('author:')
    expect(document.spans).toContainEqual(expect.objectContaining({ type: 'link', href: '#footnote-note' }))
    expect(document.spans).toContainEqual(expect.objectContaining({ id: 'footnote-ref-note' }))
    expect(document.blocks).toContainEqual(expect.objectContaining({
      type: 'footnote',
      id: 'footnote-note',
      footnoteLabel: 'note',
    }))
  })

  it('keeps task-list state separate from its readable text', () => {
    const document = parseMarkdownDocument('- [x] Done\n- [ ] Pending')
    const tasks = document.blocks.filter((block) => block.listTask)

    expect(tasks).toHaveLength(2)
    expect(tasks.map((task) => task.listChecked)).toEqual([true, false])
    expect(document.text).toContain('• Done')
    expect(document.text).not.toContain('☑')
  })

  it('preserves inline and display math plus safe inline HTML semantics', () => {
    const document = parseMarkdownDocument('公式 $E = mc^2$。\n\n$$\nx^2 + y^2 = z^2\n$$\n\n按 <kbd>Ctrl</kbd>，H<sub>2</sub>O。')

    expect(document.spans).toContainEqual(expect.objectContaining({ type: 'math', formula: 'E = mc^2' }))
    expect(document.blocks).toContainEqual(expect.objectContaining({ type: 'math' }))
    expect(document.spans.map((span) => span.type)).toEqual(expect.arrayContaining(['kbd', 'sub']))
  })

  it('keeps all source offsets inside the trimmed document', () => {
    const document = parseMarkdownDocument('**text**  \n\n| A |\n| - |\n| B |  \n\n')

    expect(document.text.endsWith(' ')).toBe(false)
    expect(document.blocks.every((block) => block.end <= document.text.length)).toBe(true)
    expect(document.spans.every((span) => span.end <= document.text.length)).toBe(true)
    expect(document.blocks
      .flatMap((block) => block.table?.rows.flat() ?? [])
      .every((cell) => cell.end <= document.text.length)).toBe(true)
  })
})
