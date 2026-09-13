/**
 * 间隔重复排期（SM-2 简化版，复习席消费）。
 *
 * 三档评分：忘了（重来）/ 记得（正常递增）/ 熟了（加成递增）。
 * 全部纯函数、可注入时钟，排期规则集中在此便于测试与调参。
 */

import type { ReviewCard, ReviewScheduling } from '@/types'

export type ReviewGrade = 'again' | 'good' | 'easy'

/** 新卡初始排期：未排间隔、标准易度 */
export const INITIAL_SCHEDULING: ReviewScheduling = {
  intervalDays: 0,
  ease: 2.5,
  repetitions: 0,
}

export const EASE_MIN = 1.3
export const EASE_MAX = 2.8

/** 「忘了」的重新见面间隔：同场 10 分钟后（学习步，不跨日） */
export const AGAIN_STEP_MS = 10 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000
const EASE_AGAIN_PENALTY = 0.2
const EASE_EASY_BONUS = 0.15
const EASY_INTERVAL_BONUS = 1.3
/** SM-2 经典间隔台阶（天）：第 1/2 次答对后的固定间隔（熟了档给宽一点的台阶） */
const STEP_INTERVALS = {
  good: { first: 1, second: 6 },
  easy: { first: 2, second: 9 },
} as const

function clampEase(ease: number): number {
  return Math.min(EASE_MAX, Math.max(EASE_MIN, ease))
}

export interface ScheduledReview {
  scheduling: ReviewScheduling
  dueAt: number
}

/**
 * 对一张卡应用评分，返回新排期与到期时间。
 * - again：repetitions 清零、易度 -0.2，10 分钟后再见（当天学习步）
 * - good：repetitions +1，间隔走 1 → 6 → 上次间隔×易度 台阶
 * - easy：同 good 但易度 +0.15、间隔再乘 1.3（前两步给 2/9 天）
 */
export function scheduleReview(
  state: ReviewScheduling,
  grade: ReviewGrade,
  now: Date = new Date()
): ScheduledReview {
  if (grade === 'again') {
    return {
      scheduling: {
        intervalDays: 0,
        ease: clampEase(state.ease - EASE_AGAIN_PENALTY),
        repetitions: 0,
      },
      dueAt: now.getTime() + AGAIN_STEP_MS,
    }
  }

  const repetitions = state.repetitions + 1
  const ease = clampEase(grade === 'easy' ? state.ease + EASE_EASY_BONUS : state.ease)
  const steps = STEP_INTERVALS[grade]
  const intervalDays =
    repetitions === 1
      ? steps.first
      : repetitions === 2
        ? steps.second
        : Math.max(
            1,
            Math.round(
              state.intervalDays * (grade === 'easy' ? ease * EASY_INTERVAL_BONUS : ease)
            )
          )
  return {
    scheduling: { intervalDays, ease, repetitions },
    dueAt: now.getTime() + intervalDays * DAY_MS,
  }
}

/** 到期（含今天早些时候到期还没复习的） */
export function isCardDue(card: ReviewCard, now: Date = new Date()): boolean {
  return !card.dismissed && card.dueAt <= now.getTime()
}

/** 新卡：从未评过分（lastReviewedAt 空） */
export function isNewCard(card: ReviewCard): boolean {
  return card.lastReviewedAt == null
}
