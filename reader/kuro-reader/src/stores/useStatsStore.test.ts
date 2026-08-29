import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import { useStatsStore } from '@/stores/useStatsStore'
import type { ReadingStats } from '@/types'

const DAY_MS = 24 * 60 * 60 * 1000
// 锚定 UTC 午夜，避免 toISOString 的 UTC 换算与本地时区产生跨日偏差
const BASE_TIME = Date.UTC(2026, 7, 24) // 2026-08-24T00:00:00Z

const DEFAULT_STATS: ReadingStats = {
  totalHours: 0,
  currentStreak: 0,
  longestStreak: 0,
  completedBooks: 0,
  weeklyData: [],
}

const resetStatsState = () => {
  useStatsStore.setState({ stats: DEFAULT_STATS, readingSessions: [] })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(BASE_TIME)
  resetStatsState()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('addReadingSession', () => {
  it('ignores non-positive minutes', () => {
    useStatsStore.getState().addReadingSession('book-1', 0)
    useStatsStore.getState().addReadingSession('book-1', -5)

    const { readingSessions, stats } = useStatsStore.getState()
    expect(readingSessions).toHaveLength(0)
    expect(stats.totalHours).toBe(0)
  })

  it('appends session and rounds totalHours to one decimal', () => {
    useStatsStore.getState().addReadingSession('book-1', 45)
    expect(useStatsStore.getState().readingSessions).toHaveLength(1)

    // 45 + 30 = 75min = 1.25h → 四舍五入到一位小数 = 1.3
    useStatsStore.getState().addReadingSession('book-1', 30)
    expect(useStatsStore.getState().stats.totalHours).toBe(1.3)
  })

  it('keeps streak at 1 when same day repeats', () => {
    useStatsStore.getState().addReadingSession('book-1', 10)
    useStatsStore.getState().addReadingSession('book-1', 10)

    const { stats } = useStatsStore.getState()
    expect(stats.currentStreak).toBe(1)
    expect(stats.longestStreak).toBe(1)
  })

  it('builds streak across consecutive days', () => {
    useStatsStore.getState().addReadingSession('book-1', 10)

    vi.setSystemTime(BASE_TIME + DAY_MS)
    useStatsStore.getState().addReadingSession('book-1', 10)

    vi.setSystemTime(BASE_TIME + 2 * DAY_MS)
    useStatsStore.getState().addReadingSession('book-1', 10)

    const { stats } = useStatsStore.getState()
    expect(stats.currentStreak).toBe(3)
    expect(stats.longestStreak).toBe(3)
  })

  it('keeps longestStreak but resets currentStreak after a gap', () => {
    useStatsStore.getState().addReadingSession('book-1', 10)

    vi.setSystemTime(BASE_TIME + DAY_MS)
    useStatsStore.getState().addReadingSession('book-1', 10)

    // 跳到第 5 天（中断两天）
    vi.setSystemTime(BASE_TIME + 4 * DAY_MS)
    useStatsStore.getState().addReadingSession('book-1', 10)

    const { stats } = useStatsStore.getState()
    expect(stats.longestStreak).toBe(2)
    expect(stats.currentStreak).toBe(1)
  })

  it('counts currentStreak ending yesterday', () => {
    // 今天是第 3 天，记录只覆盖第 1、2 天（昨天为止）
    vi.setSystemTime(BASE_TIME)
    useStatsStore.getState().addReadingSession('book-1', 10)

    vi.setSystemTime(BASE_TIME + DAY_MS)
    useStatsStore.getState().addReadingSession('book-1', 10)

    vi.setSystemTime(BASE_TIME + 2 * DAY_MS)
    const { stats } = useStatsStore.getState()
    expect(stats.currentStreak).toBe(2)
  })
})

describe('calculateWeeklyData', () => {
  it('returns a 7-day window ending today with per-day aggregation', () => {
    const todayStr = new Date(BASE_TIME).toISOString().split('T')[0]
    const sixDaysAgoStr = new Date(BASE_TIME - 6 * DAY_MS).toISOString().split('T')[0]

    useStatsStore.setState({
      readingSessions: [
        { date: todayStr, minutes: 30, bookId: 'book-1' },
        { date: todayStr, minutes: 30, bookId: 'book-1' },
        { date: sixDaysAgoStr, minutes: 90, bookId: 'book-1' },
        // 窗口外的历史记录不计入
        { date: new Date(BASE_TIME - 10 * DAY_MS).toISOString().split('T')[0], minutes: 600, bookId: 'book-1' },
      ],
    })

    const weekly = useStatsStore.getState().calculateWeeklyData()

    expect(weekly).toHaveLength(7)
    // 顺序为 6 天前 → 今天
    expect(weekly[0].hours).toBe(1.5)
    expect(weekly[6].hours).toBe(1)
    // 中间无记录的日子为 0
    expect(weekly.slice(1, 6).every((d) => d.hours === 0)).toBe(true)
  })
})

describe('getStats', () => {
  it('recomputes derived stats from sessions without mutating state', () => {
    const todayStr = new Date(BASE_TIME).toISOString().split('T')[0]
    useStatsStore.setState({
      readingSessions: [{ date: todayStr, minutes: 90, bookId: 'book-1' }],
      stats: { ...DEFAULT_STATS, completedBooks: 2 },
    })

    const result = useStatsStore.getState().getStats()

    expect(result.totalHours).toBe(1.5)
    expect(result.currentStreak).toBe(1)
    expect(result.completedBooks).toBe(2)
    expect(result.weeklyData).toHaveLength(7)
    // store 内 stats 未被修改
    expect(useStatsStore.getState().stats.totalHours).toBe(0)
  })
})
