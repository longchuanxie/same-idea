import { describe, it, expect } from 'vitest'

import {
  buildRecapMessages,
  buildRecapSourceText,
  parseRecapResult,
  recapUnitLabel,
} from '@/services/ai/readingRecap'
import type { Book } from '@/types'

describe('buildRecapSourceText', () => {
  it('单元带标签拼接', () => {
    const text = buildRecapSourceText([
      { label: '第2章', text: '内容A' },
      { label: '第3章', text: '内容B' },
    ])
    expect(text).toContain('【第2章】\n内容A')
    expect(text).toContain('【第3章】\n内容B')
  })

  it('超限从最前段丢起（最旧的先舍），装不下的整段丢', () => {
    const text = buildRecapSourceText(
      [
        { label: '旧', text: 'x'.repeat(60) },
        { label: '中', text: 'y'.repeat(60) },
        { label: '新', text: 'z'.repeat(60) },
      ],
      130
    )
    expect(text).not.toContain('【旧】')
    expect(text).toContain('【中】')
    expect(text).toContain('【新】')
    expect(text.length).toBeLessThanOrEqual(130)
    // 上限更紧时连「中」也装不下：只保住最新的
    const tighter = buildRecapSourceText(
      [
        { label: '旧', text: 'x'.repeat(60) },
        { label: '中', text: 'y'.repeat(60) },
        { label: '新', text: 'z'.repeat(60) },
      ],
      100
    )
    expect(tighter).toContain('【新】')
    expect(tighter).not.toContain('【中】')
  })
})

describe('buildRecapMessages', () => {
  it('带书名、即将进入的单元与 JSON 指令', () => {
    const messages = buildRecapMessages('长夜', '章', 4, '前情正文')
    const user = messages[1].content
    expect(user).toContain('《长夜》')
    expect(user).toContain('第 4 章')
    expect(user).toContain('前情正文')
    expect(user).toContain('resumeHint')
    expect(user).toContain('不剧透未来')
  })
})

describe('recapUnitLabel', () => {
  it('文本书按章、PDF 按页', () => {
    const book = (format: Book['format']) => ({ format }) as Book
    expect(recapUnitLabel(book('text'))).toBe('章')
    expect(recapUnitLabel(book('pdf'))).toBe('页')
  })
})

describe('parseRecapResult', () => {
  it('完整形态；条目截到 5 条、坏条目滤除', () => {
    const parsed = parseRecapResult({
      recap: ['第一条', '  ', 42, '第二条'],
      resumeHint: ' 主角刚抵达边境 ',
    })
    expect(parsed).toEqual({ recap: ['第一条', '第二条'], resumeHint: '主角刚抵达边境' })
    const six = parseRecapResult({ recap: ['1', '2', '3', '4', '5', '6'] })
    expect(six?.recap.length).toBe(5)
  })

  it('空 recap 或形状不对判废', () => {
    expect(parseRecapResult({ recap: [] })).toBeNull()
    expect(parseRecapResult({ recap: '不是数组' })).toBeNull()
    expect(parseRecapResult(null)).toBeNull()
  })
})
