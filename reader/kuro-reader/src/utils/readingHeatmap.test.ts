import { describe, it, expect } from 'vitest'

import {
  buildReadingHeatmap,
  getTodayMinutes,
  getGoalStreak,
  toLocalDateStr,
} from '@/utils/readingHeatmap'

// 固定「今天」：2026-08-29（周六）
const TODAY = new Date(2026, 7, 29, 12, 0, 0)

const dayStr = (offsetDays: number): string => {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + offsetDays)
  return toLocalDateStr(d)
}

describe('toLocalDateStr', () => {
  it('formats local date without UTC shift', () => {
    // 本地 23:30 不应被换算到第二天
    expect(toLocalDateStr(new Date(2026, 7, 29, 23, 30))).toBe('2026-08-29')
  })
})

describe('buildReadingHeatmap', () => {
  it('produces weeks*7 cells ending today, first cell on a Sunday', () => {
    const cells = buildReadingHeatmap([], 30, 15, TODAY)
    expect(cells).toHaveLength(15 * 7)
    expect(cells[cells.length - 1].date).toBe(dayStr(0))
    const first = new Date(cells[0].date + 'T12:00:00')
    expect(first.getDay()).toBe(0) // 周日
  })

  it('aggregates sessions of the same day', () => {
    const sessions = [
      { date: dayStr(0), minutes: 20 },
      { date: dayStr(0), minutes: 15 },
    ]
    const cells = buildReadingHeatmap(sessions, 30, 4, TODAY)
    const todayCell = cells.find((c) => c.date === dayStr(0))!
    expect(todayCell.minutes).toBe(35)
    expect(todayCell.level).toBe(3) // goal ≤ minutes < 2*goal
  })

  it('maps minutes to intensity levels relative to goal', () => {
    const sessions = [
      { date: dayStr(0), minutes: 10 }, // < goal/2 → 1
      { date: dayStr(-1), minutes: 20 }, // < goal → 2
      { date: dayStr(-2), minutes: 45 }, // < 2*goal → 3
      { date: dayStr(-3), minutes: 90 }, // ≥ 2*goal → 4
    ]
    const cells = buildReadingHeatmap(sessions, 30, 4, TODAY)
    const byDate = new Map(cells.map((c) => [c.date, c.level]))
    expect(byDate.get(dayStr(0))).toBe(1)
    expect(byDate.get(dayStr(-1))).toBe(2)
    expect(byDate.get(dayStr(-2))).toBe(3)
    expect(byDate.get(dayStr(-3))).toBe(4)
    expect(byDate.get(dayStr(-4))).toBe(0)
  })
})

describe('getTodayMinutes', () => {
  it('sums only today sessions', () => {
    const sessions = [
      { date: dayStr(0), minutes: 15 },
      { date: dayStr(0), minutes: 10 },
      { date: dayStr(-1), minutes: 60 },
    ]
    expect(getTodayMinutes(sessions, TODAY)).toBe(25)
  })
})

describe('getGoalStreak', () => {
  it('counts today when goal met, chaining backwards', () => {
    const sessions = [
      { date: dayStr(0), minutes: 30 },
      { date: dayStr(-1), minutes: 30 },
      { date: dayStr(-2), minutes: 10 }, // 未达标，中断
      { date: dayStr(-3), minutes: 30 },
    ]
    expect(getGoalStreak(sessions, 30, TODAY)).toBe(2)
  })

  it('today not yet met does not break yesterday-ending streak', () => {
    const sessions = [
      { date: dayStr(-1), minutes: 30 },
      { date: dayStr(-2), minutes: 30 },
    ]
    expect(getGoalStreak(sessions, 30, TODAY)).toBe(2)
  })

  it('resets after a gap', () => {
    const sessions = [
      { date: dayStr(0), minutes: 30 },
      { date: dayStr(-2), minutes: 30 }, // 昨天缺失
    ]
    expect(getGoalStreak(sessions, 30, TODAY)).toBe(1)
  })

  it('returns 0 for zero goal', () => {
    expect(getGoalStreak([{ date: dayStr(0), minutes: 60 }], 0, TODAY)).toBe(0)
  })
})
