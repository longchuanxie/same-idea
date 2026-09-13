/**
 * 前情提要的本地纯函数层（欢迎回来卡消费）。
 *
 * 断点续读的定向仪：离开天数、上次停在哪、你留过的痕迹（手记）、
 * AI 前情的取材窗口（当前章之前的内容）。全部纯函数可测。
 */

import type { Annotation, Book, ReadingProgress } from '@/types'

/** 离开多久算「回来的人」（天） */
export const REAPPEAR_AFTER_DAYS = 7
/** AI 前情取材：文本书取当前章之前的章数 */
export const PRIOR_CHAPTERS_FOR_TEXT = 3
/** AI 前情取材：PDF 取当前页之前的页数（页的信息量小，多取几页） */
export const PRIOR_PAGES_FOR_PDF = 10
/** 欢迎回来卡展示的痕迹手记数 */
export const TRACE_ANNOTATIONS_COUNT = 3

/** 距上次阅读的天数（无记录返回 null——从没读过谈不上回来） */
export function daysSinceLastRead(book: Book, now: Date = new Date()): number | null {
  if (!book.lastReadAt) return null
  const ms = now.getTime() - new Date(book.lastReadAt).getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

/** 离开够久，值得一张「欢迎回来」卡 */
export function isReturningReader(book: Book, now: Date = new Date()): boolean {
  const days = daysSinceLastRead(book, now)
  return days != null && days >= REAPPEAR_AFTER_DAYS
}

/** 上次停的章（0 起索引）：进度章优先，退而按全书占比折算 */
export function currentChapterIndexOf(
  book: Book,
  progress: ReadingProgress | undefined,
  chapterCount: number
): number {
  if (progress?.chapterId) {
    const index = book.chapters.findIndex((ch) => ch.id === progress.chapterId)
    if (index >= 0) return index
  }
  const ratio = progress ? Math.min(1, Math.max(0, progress.percentage / 100)) : 0
  return Math.min(chapterCount - 1, Math.floor(ratio * Math.max(chapterCount, 1)))
}

/** 你留下的痕迹：离当前章最近的手记优先（同距取更新者），至多 N 条 */
export function pickTracedAnnotations(
  annotations: Annotation[],
  currentChapterIndex: number,
  count: number = TRACE_ANNOTATIONS_COUNT
): Annotation[] {
  return [...annotations]
    .sort((a, b) => {
      const distance = Math.abs(a.chapterIndex - currentChapterIndex) - Math.abs(b.chapterIndex - currentChapterIndex)
      if (distance !== 0) return distance
      return +new Date(b.updatedAt) - +new Date(a.updatedAt)
    })
    .slice(0, count)
}

/** AI 前情取材窗口（0 起闭区间）：当前章之前的内容；从开头读起返回 null（没有前情） */
export function priorChapterWindow(
  format: Book['format'],
  chapterCount: number,
  currentIndex: number
): { from: number; to: number } | null {
  if (currentIndex <= 0 || chapterCount <= 1) return null
  const span = format === 'pdf' ? PRIOR_PAGES_FOR_PDF : PRIOR_CHAPTERS_FOR_TEXT
  const from = Math.max(0, currentIndex - span)
  const to = Math.min(currentIndex - 1, chapterCount - 1)
  if (to < from) return null
  return { from, to }
}
