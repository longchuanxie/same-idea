import { describe, expect, it } from 'vitest'

import type { Book, ReadingProgress } from '@/types'

import {
  buildContinueWidgetPayload,
  buildStatsWidgetPayload,
  EMPTY_CONTINUE_PAYLOAD,
} from './widgetPayload'

const textBook: Book = {
  id: 'b1',
  title: '测试书',
  format: 'text',
  chapters: [{ id: 'ch-1', title: '第一章' }],
} as unknown as Book

const progress: ReadingProgress = {
  bookId: 'b1',
  chapterId: 'ch-1',
  page: 0,
  totalPages: 1,
  percentage: 33.4,
  globalPageIndex: 0,
  totalImages: 0,
} as ReadingProgress

describe('widgetPayload · 继续阅读', () => {
  it('书名/章节/百分比/深链路由齐备，文本格式走 text-reader', () => {
    expect(buildContinueWidgetPayload({ book: textBook, progress })).toEqual({
      bookId: 'b1',
      bookTitle: '测试书',
      chapterTitle: '第一章',
      percent: 33,
      route: '/text-reader/b1/ch-1',
    })
  })

  it('非文本格式走页级 reader 路由', () => {
    const comic = { ...textBook, format: 'comic', chapters: [] } as unknown as Book
    expect(buildContinueWidgetPayload({ book: comic, progress: { ...progress, chapterId: '' } }))
      .toMatchObject({ route: '/reader/b1' })
  })

  it('未知章节显示空标题；无进度时百分比为 0', () => {
    const payload = buildContinueWidgetPayload({ book: textBook })
    expect(payload).toMatchObject({ chapterTitle: '', percent: 0, route: '/text-reader/b1' })
  })

  it('百分比夹取到 0-100，非法值归零', () => {
    expect(buildContinueWidgetPayload({ book: textBook, progress: { ...progress, percentage: 150 } }))
      .toMatchObject({ percent: 100 })
    expect(
      buildContinueWidgetPayload({
        book: textBook,
        progress: { ...progress, percentage: Number.NaN },
      })
    ).toMatchObject({ percent: 0 })
  })

  it('书 id 缺失返回 null；空载荷常量供清空小组件', () => {
    expect(buildContinueWidgetPayload({ book: { ...textBook, id: '' } })).toBeNull()
    expect(EMPTY_CONTINUE_PAYLOAD.bookId).toBe('')
  })
})

describe('widgetPayload · 阅读统计', () => {
  it('正整数直通', () => {
    expect(buildStatsWidgetPayload({ todayMinutes: 32, dailyGoalMinutes: 60, streakDays: 3 })).toEqual({
      todayMinutes: 32,
      goalMinutes: 60,
      streakDays: 3,
    })
  })

  it('负数/非有限值归零（原生端只认非负整数）', () => {
    expect(
      buildStatsWidgetPayload({
        todayMinutes: -5,
        dailyGoalMinutes: Number.NaN,
        streakDays: 1.9,
      })
    ).toEqual({ todayMinutes: 0, goalMinutes: 0, streakDays: 2 })
  })
})
