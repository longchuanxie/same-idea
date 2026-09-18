import { describe, expect, it } from 'vitest'

import { findPreferredBreak, splitTextIntoPages } from './textPagination'

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
