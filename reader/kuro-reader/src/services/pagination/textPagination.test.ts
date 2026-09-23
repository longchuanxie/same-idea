import { describe, expect, it } from 'vitest'

import { findMaxFitLength, findPreferredBreak, splitTextIntoPages } from './textPagination'

describe('findPreferredBreak', () => {
  it('在回找窗口内命中句读', () => {
    const text = 'aaaa。bbbb'
    expect(findPreferredBreak(text, 8)).toBe(5) // index 8 起回找，命中 index5 的句号
  })

  it('窗口内无句读时维持 best', () => {
    const text = 'abcdefghij'
    expect(findPreferredBreak(text, 5)).toBe(5)
  })

  it('自定义窗口（旧版 ratio 0.2 / min 50）行为一致', () => {
    // 短文本下比例窗口为 0，但下限 50 生效
    const text = 'x'.repeat(10) + '。' + 'y'.repeat(5)
    expect(findPreferredBreak(text, 15, { ratio: 0.2, min: 50 })).toBe(11)
  })

  it('句末优先于更近的子句逗号（断句完整性）', () => {
    // 逗号在 index 5（更近），句号在 index 3 → 应断在完整句末而非子句
    const text = '甲乙丙。丁，戊己庚辛'
    expect(findPreferredBreak(text, 8)).toBe(4)
  })

  it('句末后吸收收尾引号，下一页不以半个引号开头', () => {
    const text = '甲乙丙。"丁戊己庚辛'
    expect(findPreferredBreak(text, 7)).toBe(5)
  })

  it('换行（段落边界）视作句末断点', () => {
    const text = '甲乙\n丙丁戊己庚辛'
    expect(findPreferredBreak(text, 7)).toBe(3)
  })

  it('句末超出牺牲上限时回退子句断点——不为等句号留出近整页空白', () => {
    // 句号在回退 280 字符处（超 max 200），逗号在回退 30 字符处（子句窗口 120 内）
    const text = 'x'.repeat(199) + '。' + 'y'.repeat(249) + '，' + 'z'.repeat(30)
    const best = text.length
    expect(findPreferredBreak(text, best)).toBe(best - 30)
  })
})

describe('findMaxFitLength', () => {
  it('二分找最大可容纳前缀', () => {
    const fits = (t: string) => t.length <= 7
    expect(findMaxFitLength('abcdefg hijklmn', fits)).toBe(7)
  })

  it('全部放得下时返回全文长度', () => {
    expect(findMaxFitLength('短文', () => true)).toBe(2)
  })

  it('什么都放不下时返回 0', () => {
    expect(findMaxFitLength('abcd', () => false)).toBe(0)
  })

  it('maxPrefix 剪枝：任何一次测量的前缀都不超过上界', () => {
    const fits = (t: string) => t.length <= 5
    const measured: number[] = []
    const best = findMaxFitLength('x'.repeat(300), (t) => {
      measured.push(t.length)
      return fits(t)
    }, { maxPageLength: 10 })
    expect(best).toBe(5)
    expect(Math.max(...measured)).toBeLessThanOrEqual(10)
  })
})

describe('splitTextIntoPages', () => {
  it('整章放得下时单页返回', () => {
    expect(splitTextIntoPages('短文本', () => true)).toEqual(['短文本'])
  })

  it('按容量顺序切分，断点优先落在句读上', () => {
    // 容量：任何长度 > 5 的前缀都放不下 → 每页最多 5 字符
    const fits = (t: string) => t.length <= 5
    const text = '一二三。五六七八九。十十一'
    const pages = splitTextIntoPages(text, fits)
    expect(pages.join('')).toBe(text)
    for (const page of pages) expect(page.length).toBeLessThanOrEqual(5)
    // 句读断点被优先使用：第一页以句号收尾
    expect(pages[0].endsWith('。')).toBe(true)
  })

  it('空内容返回空字符串单页（避免零页状态）', () => {
    expect(splitTextIntoPages('', () => true)).toEqual([''])
  })

  it('首页与后续页使用不同容量（首页含标题）', () => {
    const fits = (t: string, isFirst: boolean) => t.length <= (isFirst ? 3 : 6)
    const pages = splitTextIntoPages('abcdefghijklmnop', fits)
    expect(pages[0].length).toBeLessThanOrEqual(3)
    for (const page of pages.slice(1)) expect(page.length).toBeLessThanOrEqual(6)
  })

  it('测量永不容纳时靠逐字符回退兜底，不死循环', () => {
    // 容量 0（任何非空都放不下）：仍应终止且覆盖全部文本
    const text = 'abcd'
    const pages = splitTextIntoPages(text, () => false)
    expect(pages.join('')).toBe(text)
  })

  it('maxPageLength 剪枝二分窗口：所有测量文本不超过上界（整章直试一并跳过）', () => {
    const fits = (t: string) => t.length <= 8
    const measured: number[] = []
    const spyFits = (t: string) => {
      measured.push(t.length)
      return fits(t)
    }
    const text = '甲乙丙丁。'.repeat(50) // 250 字符
    const pages = splitTextIntoPages(text, spyFits, { maxPageLength: 12 })
    expect(pages.join('')).toBe(text)
    // 剩余超过上界时整章直试被跳过：任何一次测量的渲染量都不超过一页上界
    expect(Math.max(...measured)).toBeLessThanOrEqual(12)
    for (const page of pages) expect(page.length).toBeLessThanOrEqual(8)
  })

  it('宽松上界与无上界产出完全相同的页面', () => {
    const fits = (t: string) => t.length <= 7
    const text = '春风又绿江南岸。明月何时照我还。'
    expect(splitTextIntoPages(text, fits, { maxPageLength: 999 })).toEqual(
      splitTextIntoPages(text, fits)
    )
  })

  it('上界偏紧时页面只松不溢：每页仍全部通过 fitsPage 且覆盖全文', () => {
    // 真实容量 6，上界给 4：每页 ≤4 字，切分点仍优先句读
    const fits = (t: string) => t.length <= 6
    const text = '东风夜放花千树。更吹落、星如雨。'
    const pages = splitTextIntoPages(text, fits, { maxPageLength: 4 })
    expect(pages.join('')).toBe(text)
    for (const page of pages) expect(page.length).toBeLessThanOrEqual(4)
  })
})

describe('findMaxFitLength 容量播种', () => {
  it('播种提示不改变结果：任意 hint 下仍返回精确最大值', () => {
    const fits = (t: string) => t.length <= 37
    const text = 'x'.repeat(200)
    const noHint = findMaxFitLength(text, fits, { maxPageLength: 100 })
    for (const hint of [1, 10, 36, 37, 38, 50, 99, 100]) {
      expect(findMaxFitLength(text, fits, { maxPageLength: 100, searchHint: hint })).toBe(noHint)
    }
  })

  it('提示低于真实容量时线性外探后收敛到精确值', () => {
    const fits = (t: string) => t.length <= 43
    const text = 'y'.repeat(120)
    expect(findMaxFitLength(text, fits, { maxPageLength: 100, searchHint: 40 })).toBe(43)
  })

  it('提示高于真实容量时收缩窗口仍得精确值', () => {
    const fits = (t: string) => t.length <= 25
    const text = 'z'.repeat(120)
    expect(findMaxFitLength(text, fits, { maxPageLength: 100, searchHint: 60 })).toBe(25)
  })

  it('越界/非法提示被忽略（与无提示一致）', () => {
    const fits = (t: string) => t.length <= 7
    const text = 'a'.repeat(50)
    const expected = findMaxFitLength(text, fits, { maxPageLength: 20 })
    expect(findMaxFitLength(text, fits, { maxPageLength: 20, searchHint: 0 })).toBe(expected)
    expect(findMaxFitLength(text, fits, { maxPageLength: 20, searchHint: 21 })).toBe(expected)
    expect(findMaxFitLength(text, fits, { maxPageLength: 20, searchHint: Number.NaN })).toBe(expected)
  })
})

describe('splitTextIntoPages 页间容量播种', () => {
  it('播种后产出与无播种逐字节一致（均匀容量）', () => {
    const fits = (t: string) => t.length <= 23
    const text = '句子。'.repeat(200)
    expect(splitTextIntoPages(text, fits, { maxPageLength: 60, searchHint: 20 })).toEqual(
      splitTextIntoPages(text, fits, { maxPageLength: 60 })
    )
  })

  it('播种后产出与无播种逐字节一致（首页容量偏小）', () => {
    const fits = (t: string, isFirst: boolean) => t.length <= (isFirst ? 12 : 30)
    const text = '词，句。'.repeat(150)
    expect(splitTextIntoPages(text, fits, { maxPageLength: 60, searchHint: 29 })).toEqual(
      splitTextIntoPages(text, fits, { maxPageLength: 60 })
    )
  })

  it('均匀文本下探针数显著下降（页间播种生效）', () => {
    const text = '正文内容。'.repeat(400) // 2000 字符
    const fits = (t: string) => t.length <= 40
    const countProbes = () => {
      let count = 0
      splitTextIntoPages(text, (t) => { count += 1; return fits(t) }, { maxPageLength: 80 })
      return count
    }
    const seeded = countProbes() // splitTextIntoPages 内部自动播种：第 2 页起命中提示
    // 参照：禁用播种效果的方式不存在（播种是内部行为），用单页独立二分的下界估算：
    // 每页纯二分 ≈ log2(80) ≈ 7 探针 + 句读验证；播种后应显著低于该量级
    const perPageBinaryEstimate = 7
    const pages = splitTextIntoPages(text, fits, { maxPageLength: 80 })
    expect(seeded).toBeLessThan(perPageBinaryEstimate * pages.length)
  })
})
