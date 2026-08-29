import { describe, expect, it } from 'vitest'

import { splitMarkdownIntoChapters } from './utils'

describe('splitMarkdownIntoChapters', () => {
  it('splits markdown by level one and level two headings', () => {
    const chapters = splitMarkdownIntoChapters([
      '# 第一章',
      '第一章正文',
      '',
      '## 第二节 ##',
      '第二节正文',
    ].join('\n'))

    expect(chapters).toEqual([
      { title: '第一章', content: '第一章正文' },
      { title: '第二节', content: '第二节正文' },
    ])
  })

  it('keeps content before the first heading as a preface', () => {
    const chapters = splitMarkdownIntoChapters('导语\n\n# 正文\n内容')

    expect(chapters).toEqual([
      { title: '前言', content: '导语' },
      { title: '正文', content: '内容' },
    ])
  })

  it('falls back to plain text chapter detection when headings are absent', () => {
    const chapters = splitMarkdownIntoChapters('Chapter 1\nContent')

    expect(chapters).toEqual([{ title: 'Chapter 1', content: 'Content' }])
  })
})
