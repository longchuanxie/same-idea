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

const DAY_MS = 86400000;
const WEEK_DAYS = 7; // 「N 周前」的换算基数

/** 「今天 / 昨天 / N 天前 / N 周前」——上次阅读时间的人文表达（门厅与档案卡共用） */
export function describeLastRead(lastReadAt?: Date | string): string {
  if (!lastReadAt) return '';
  const days = Math.floor((Date.now() - new Date(lastReadAt).getTime()) / DAY_MS);
  if (days <= 0) return '今天';
  if (days === 1) return '昨天';
  if (days < WEEK_DAYS) return `${days} 天前`;
  return `${Math.floor(days / WEEK_DAYS)} 周前`;
}
