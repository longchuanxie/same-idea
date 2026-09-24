import { readerPathForBook } from '@/constants/routes';
import type { Book, ReadingProgress } from '@/types';


/**
 * 小组件载荷的纯构建逻辑（与原生字段一一对应，便于单测）。
 */

export interface ContinueWidgetPayload {
  bookId: string
  bookTitle: string
  chapterTitle: string
  /** 0-100 整数 */
  percent: number
  /** 点击小组件回跳的路由（JS 侧按书格式拼好） */
  route: string
  /** 封面缩略图（JPEG base64，无 dataURL 前缀）；换书时才重推 */
  coverBase64?: string
}

export interface StatsWidgetPayload {
  todayMinutes: number
  goalMinutes: number
  streakDays: number
}

export const EMPTY_CONTINUE_PAYLOAD: ContinueWidgetPayload = {
  bookId: '',
  bookTitle: '',
  chapterTitle: '',
  percent: 0,
  route: '',
}

export interface ContinueWidgetSource {
  book: Pick<Book, 'id' | 'title' | 'format' | 'chapters'>
  progress?: Pick<ReadingProgress, 'chapterId' | 'percentage'> | undefined
}

/** 由书与进度构建「继续阅读」载荷；书无效返回 null（调用方清空小组件） */
export function buildContinueWidgetPayload(source: ContinueWidgetSource): ContinueWidgetPayload | null {
  const { book, progress } = source
  if (!book?.id) return null
  const chapterId = progress?.chapterId ?? ''
  const chapterTitle =
    (book.chapters ?? []).find((chapter) => chapter.id === chapterId)?.title ?? ''
  const rawPercent = progress?.percentage ?? 0
  const percent = Math.max(0, Math.min(100, Math.round(Number.isFinite(rawPercent) ? rawPercent : 0)))
  return {
    bookId: book.id,
    bookTitle: (book.title || '').trim() || '未命名书',
    chapterTitle,
    percent,
    route: readerPathForBook(book, chapterId || undefined),
  }
}

export interface StatsWidgetSource {
  todayMinutes: number
  dailyGoalMinutes: number
  streakDays: number
}

export function buildStatsWidgetPayload(source: StatsWidgetSource): StatsWidgetPayload {
  const safeInt = (value: number): number =>
    Number.isFinite(value) && value > 0 ? Math.round(value) : 0
  return {
    todayMinutes: safeInt(source.todayMinutes),
    goalMinutes: safeInt(source.dailyGoalMinutes),
    streakDays: safeInt(source.streakDays),
  }
}
