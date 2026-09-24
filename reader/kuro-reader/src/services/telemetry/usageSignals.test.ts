import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearUsageSignals,
  exportUsageSignalsJson,
  getUsageSignals,
  recordUsageSignal,
} from './usageSignals'

describe('usageSignals', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('累加计数并保留首末时间戳与样本', () => {
    recordUsageSignal('book-replace', { bookId: 'b1' })
    recordUsageSignal('book-replace', { bookId: 'b2' })

    const record = getUsageSignals()['book-replace']
    expect(record?.count).toBe(2)
    expect(record?.firstAt).toBeGreaterThan(0)
    expect(record?.lastAt).toBeGreaterThanOrEqual(record!.firstAt)
    expect(record?.recent.map((s) => s.bookId)).toEqual(['b1', 'b2'])
  })

  it('无上下文时不落 bookId 字段', () => {
    recordUsageSignal('knowledge-beat-tap')

    const sample = getUsageSignals()['knowledge-beat-tap']?.recent[0]
    expect(sample?.bookId).toBeUndefined()
    expect(sample?.ts).toBeGreaterThan(0)
  })

  it('recent 样本封顶 20 条（保留最新）', () => {
    for (let i = 0; i < 25; i++) {
      recordUsageSignal('knowledge-back-to-source', { bookId: `b${i}` })
    }

    const record = getUsageSignals()['knowledge-back-to-source']
    expect(record?.count).toBe(25)
    expect(record?.recent).toHaveLength(20)
    expect(record?.recent[0]?.bookId).toBe('b5')
    expect(record?.recent[19]?.bookId).toBe('b24')
  })

  it('写入失败（隐私模式/配额）静默不抛', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })

    expect(() => recordUsageSignal('book-replace')).not.toThrow()
  })

  it('导出为带时间戳的 JSON 快照，清空后回到空映射', () => {
    recordUsageSignal('book-replace', { bookId: 'b1' })

    const parsed = JSON.parse(exportUsageSignalsJson())
    expect(parsed.exportedAt).toBeTruthy()
    expect(parsed.events['book-replace'].count).toBe(1)

    clearUsageSignals()
    expect(getUsageSignals()).toEqual({})
  })
})
