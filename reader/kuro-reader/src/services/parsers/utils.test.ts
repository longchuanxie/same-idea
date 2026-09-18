import { describe, expect, it } from 'vitest'

import { splitMarkdownIntoChapters, splitTextIntoChapters } from './utils'

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

describe('splitTextIntoChapters 数字行防误判', () => {
  it('小数开头的行（3.5 星…）不拆章', () => {
    const chapters = splitTextIntoChapters('前言内容\n3.5 星的评价让人信服\n正文继续')
    expect(chapters).toEqual([{ title: '正文', content: '前言内容\n3.5 星的评价让人信服\n正文继续' }])
  })

  it('裸数字开头的行（1024 个读者）不拆章——与年份/数量无法区分，一律视作正文', () => {
    const chapters = splitTextIntoChapters('第一部分\n正文一二三\n1024 个读者捧场\n正文四五六')
    expect(chapters).toHaveLength(1)
    expect(chapters[0].title).toBe('第一部分')
  })

  it('零填充编号（001 标题）仍按章节拆分', () => {
    const chapters = splitTextIntoChapters('001 开局一把刀\n主角登场\n002 装备全靠捡\n剧情推进')
    expect(chapters).toEqual([
      { title: '001 开局一把刀', content: '主角登场' },
      { title: '002 装备全靠捡', content: '剧情推进' },
    ])
  })

  it('递增编号序列（1. 2. 3.）按章节拆分', () => {
    const chapters = splitTextIntoChapters('1. 起源\n内容一\n2. 发展\n内容二\n3. 终局\n内容三')
    expect(chapters).toEqual([
      { title: '1. 起源', content: '内容一' },
      { title: '2. 发展', content: '内容二' },
      { title: '3. 终局', content: '内容三' },
    ])
  })

  it('日记体等值编号（2024. 春/夏/冬）增幅不足整批降级为正文', () => {
    const chapters = splitTextIntoChapters('2024. 春\n内容一\n2024. 夏\n内容二\n2024. 冬\n内容三')
    expect(chapters).toEqual([
      { title: '正文', content: '2024. 春\n内容一\n2024. 夏\n内容二\n2024. 冬\n内容三' },
    ])
  })

  it('数字行降级不影响可信模式（第X章照常成章）', () => {
    const chapters = splitTextIntoChapters('第一章 开端\n正文\n1998. 冬天的故事\n续写\n1997. 夏天的故事\n续写二')
    expect(chapters).toHaveLength(1)
    expect(chapters[0].title).toBe('第一章 开端')
    expect(chapters[0].content).toContain('1997. 夏天的故事')
  })
})
