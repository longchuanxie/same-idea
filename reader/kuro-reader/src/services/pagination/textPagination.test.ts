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
})
