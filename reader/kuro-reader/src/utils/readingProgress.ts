const PERCENT_MULTIPLIER = 100

export function clampProgressRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0
  return Math.min(1, Math.max(0, ratio))
}

export function getOverallReadingRatio(
  chapterIndex: number,
  chapterCount: number,
  chapterRatio: number
): number {
  if (chapterCount <= 0) return clampProgressRatio(chapterRatio)
  const safeChapterIndex = Math.min(
    chapterCount - 1,
    Math.max(0, Math.floor(chapterIndex))
  )
  return clampProgressRatio(
    (safeChapterIndex + clampProgressRatio(chapterRatio)) / chapterCount
  )
}

export function getOverallReadingPercent(
  chapterIndex: number,
  chapterCount: number,
  chapterRatio: number
): number {
  return Math.round(
    getOverallReadingRatio(chapterIndex, chapterCount, chapterRatio) * PERCENT_MULTIPLIER
  )
}
