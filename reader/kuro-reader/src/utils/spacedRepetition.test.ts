import { describe, it, expect } from 'vitest'

import type { ReviewCard, ReviewScheduling } from '@/types'
import {
  AGAIN_STEP_MS,
  EASE_MAX,
  EASE_MIN,
  INITIAL_SCHEDULING,
  isCardDue,
  isNewCard,
  scheduleReview,
} from '@/utils/spacedRepetition'

const NOW = new Date('2026-09-13T10:00:00')
const DAY_MS = 24 * 60 * 60 * 1000

const makeCard = (overrides: Partial<ReviewCard> & { id: string }): ReviewCard => ({
  bookId: 'b1',
  source: 'glossary-term',
  front: '术语',
  back: '定义',
  scheduling: INITIAL_SCHEDULING,
  dueAt: NOW.getTime(),
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

describe('scheduleReview', () => {
  it('首答「记得」：1 天后到期，repetitions=1', () => {
    const result = scheduleReview(INITIAL_SCHEDULING, 'good', NOW)
    expect(result.scheduling).toEqual({ intervalDays: 1, ease: 2.5, repetitions: 1 })
    expect(result.dueAt).toBe(NOW.getTime() + 1 * DAY_MS)
  })

  it('首答「熟了」：2 天起步 + 易度上调', () => {
    const result = scheduleReview(INITIAL_SCHEDULING, 'easy', NOW)
    expect(result.scheduling).toEqual({ intervalDays: 2, ease: 2.65, repetitions: 1 })
  })

  it('第二答走 6 天台阶；第三答起按 间隔×易度 递推', () => {
    const step1 = scheduleReview(INITIAL_SCHEDULING, 'good', NOW)
    const step2 = scheduleReview(step1.scheduling, 'good', NOW)
    expect(step2.scheduling.intervalDays).toBe(6)
    const step3 = scheduleReview(step2.scheduling, 'good', NOW)
    expect(step3.scheduling.intervalDays).toBe(Math.round(6 * 2.5))
  })

  it('「忘了」：repetitions 清零、易度 -0.2、10 分钟学习步（同日回来）', () => {
    const learned: ReviewScheduling = { intervalDays: 15, ease: 2.5, repetitions: 3 }
    const result = scheduleReview(learned, 'again', NOW)
    expect(result.scheduling).toEqual({ intervalDays: 0, ease: 2.3, repetitions: 0 })
    expect(result.dueAt).toBe(NOW.getTime() + AGAIN_STEP_MS)
  })

  it('易度钳制在 [1.3, 2.8]：连续答错/答对不越界', () => {
    const floor = { intervalDays: 1, ease: EASE_MIN, repetitions: 1 }
    expect(scheduleReview(floor, 'again', NOW).scheduling.ease).toBe(EASE_MIN)
    const ceiling = { intervalDays: 1, ease: 2.8, repetitions: 1 }
    expect(scheduleReview(ceiling, 'easy', NOW).scheduling.ease).toBe(EASE_MAX)
  })
})

describe('到期与新卡判定', () => {
  it('dueAt 早于现在即到期；dismissed 永不到期', () => {
    const due = makeCard({ id: 'c1', dueAt: NOW.getTime() - 1000 })
    const later = makeCard({ id: 'c2', dueAt: NOW.getTime() + DAY_MS })
    const dismissed = makeCard({ id: 'c3', dueAt: NOW.getTime() - 1000, dismissed: true })
    expect(isCardDue(due, NOW)).toBe(true)
    expect(isCardDue(later, NOW)).toBe(false)
    expect(isCardDue(dismissed, NOW)).toBe(false)
  })

  it('新卡 = 从未评过分', () => {
    expect(isNewCard(makeCard({ id: 'c1' }))).toBe(true)
    expect(isNewCard(makeCard({ id: 'c2', lastReviewedAt: NOW.getTime() }))).toBe(false)
  })
})
