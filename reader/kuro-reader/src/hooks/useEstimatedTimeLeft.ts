import { useMemo } from 'react';

const CHARS_PER_MINUTE = 500;
const MINUTES_PER_HOUR = 60;
const FULL_PERCENT = 100;

/**
 * 按当前章节字数与阅读进度估算剩余阅读时间（假设 500 字/分钟）。
 */
export function useEstimatedTimeLeft(
  contentLength: number | undefined,
  scrollPercent: number
): string {
  return useMemo(() => {
    if (!contentLength || scrollPercent <= 0 || scrollPercent >= FULL_PERCENT) {
      return '';
    }

    const readChars = Math.round((contentLength * scrollPercent) / FULL_PERCENT);
    const remainingChars = contentLength - readChars;
    const remainingMinutes = Math.ceil(remainingChars / CHARS_PER_MINUTE);

    if (remainingMinutes < MINUTES_PER_HOUR) {
      return `${remainingMinutes}分钟`;
    }
    const hours = Math.floor(remainingMinutes / MINUTES_PER_HOUR);
    const mins = remainingMinutes % MINUTES_PER_HOUR;
    return `${hours}小时${mins}分钟`;
  }, [contentLength, scrollPercent]);
}
