import { describe, expect, it } from 'vitest'

import { splitMarkdownIntoChapters, splitTextIntoChapters, parseChineseNumeral } from './utils'

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

describe('splitTextIntoChapters 中文数字裸枚举', () => {
  it('一、二、三、递增序列按章节拆分', () => {
    const chapters = splitTextIntoChapters('一、开端\n内容一\n二、发展\n内容二\n三、终局\n内容三')
    expect(chapters).toEqual([
      { title: '一、开端', content: '内容一' },
      { title: '二、发展', content: '内容二' },
      { title: '三、终局', content: '内容三' },
    ])
  })

  it('括号包裹形态（（一）标题）按章节拆分，十一以上编号正确', () => {
    const text = Array.from({ length: 12 }, (_, i) => `（${['一','二','三','四','五','六','七','八','九','十','十一','十二'][i]}）第${i + 1}节\n内容${i + 1}`).join('\n')
    const chapters = splitTextIntoChapters(text)
    expect(chapters).toHaveLength(12)
    expect(chapters[0].title).toBe('（一）第1节')
    expect(chapters[10].title).toBe('（十一）第11节')
    expect(chapters[11].title).toBe('（十二）第12节')
  })

  it('杂乱无序的中文数字行增幅不足整批降级为正文', () => {
    const chapters = splitTextIntoChapters('开头\n三、乱入的列表项\n内容\n一、另一个列表项\n内容二\n二、再来一个\n内容三\n一、又一个重复\n内容四')
    expect(chapters).toEqual([
      { title: '正文', content: '开头\n三、乱入的列表项\n内容\n一、另一个列表项\n内容二\n二、再来一个\n内容三\n一、又一个重复\n内容四' },
    ])
  })

  it('parseChineseNumeral 覆盖简写/零填充/大写形态', () => {
    expect(parseChineseNumeral('十')).toBe(10)
    expect(parseChineseNumeral('十五')).toBe(15)
    expect(parseChineseNumeral('二十三')).toBe(23)
    expect(parseChineseNumeral('一百零三')).toBe(103)
    expect(parseChineseNumeral('一百二十三')).toBe(123)
    expect(parseChineseNumeral('贰')).toBe(2)
    expect(parseChineseNumeral('拾贰')).toBe(12)
    expect(parseChineseNumeral('第')).toBeNull()
    expect(parseChineseNumeral('')).toBeNull()
  })
})

describe('splitTextIntoChapters 超长无标题正文兜底切分', () => {
  it('超过阈值的无标题整本按段落边界切成伪章节', () => {
    const paragraph = '他缓缓抬起头，望向远处连绵起伏的山峦。'.repeat(90)
    const text = Array.from({ length: 60 }, () => paragraph).join('\n')
    expect(text.length).toBeGreaterThan(100_000)
    const chapters = splitTextIntoChapters(text)
    expect(chapters.length).toBeGreaterThan(1)
    expect(chapters[0].title).toBe('正文（一）')
    expect(chapters[1].title).toBe('正文（二）')
    // 每章收在目标大小附近（段落粒度允许少量超出）
    for (const chapter of chapters) {
      expect(chapter.content.length).toBeLessThanOrEqual(32_000)
    }
    // 切分无损：全文逐字保留
    expect(chapters.map((ch) => ch.content).join('\n')).toBe(text)
  })

  it('未超阈值的无标题整本仍为单章', () => {
    const text = Array.from({ length: 10 }, () => '普通正文内容。'.repeat(50)).join('\n')
    const chapters = splitTextIntoChapters(text)
    expect(chapters).toEqual([{ title: '正文', content: text }])
  })

  it('有标题的超长书不受兜底切分影响', () => {
    const paragraph = '长段落内容。'.repeat(20000)
    const text = ['第一章 起风', paragraph, '第二章 落雨', paragraph].join('\n')
    expect(text.length).toBeGreaterThan(100_000)
    const chapters = splitTextIntoChapters(text)
    expect(chapters.map((ch) => ch.title)).toEqual(['第一章 起风', '第二章 落雨'])
  })

  it('无换行的超长文本按字符硬切', () => {
    const text = '字'.repeat(150_000)
    const chapters = splitTextIntoChapters(text)
    expect(chapters.length).toBeGreaterThanOrEqual(5)
    expect(chapters.map((ch) => ch.content).join('')).toBe(text)
    expect(chapters[0].title).toBe('正文（一）')
  })
})
