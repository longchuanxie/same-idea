import { useEffect, useRef } from 'react';

import { useStatsStore } from '@/stores/useStatsStore';

const STATS_RECORD_INTERVAL = 60000;
const MS_PER_MINUTE = 60000;
const TAIL_RECORD_MINUTE_RATIO = 0.5;

/**
 * 阅读时长统计（文本/漫画阅读器共用）。
 * 每累计满 1 分钟记录一次会话；离开或切换书籍时补记超过 30 秒的尾段时间。
 */
export function useReadingStats(bookId: string | undefined): void {
  const addReadingSession = useStatsStore((s) => s.addReadingSession);
  const lastStatsRecordRef = useRef(0);

  useEffect(() => {
    if (!bookId) return;
    lastStatsRecordRef.current = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastStatsRecordRef.current;
      if (elapsed >= MS_PER_MINUTE) {
        addReadingSession(bookId, Math.round(elapsed / MS_PER_MINUTE));
        lastStatsRecordRef.current = now;
      }
    }, STATS_RECORD_INTERVAL);

    return () => {
      clearInterval(timer);
      // 保存最后一小段阅读时间
      const elapsedSinceLastRecord = Date.now() - lastStatsRecordRef.current;
      if (elapsedSinceLastRecord >= MS_PER_MINUTE * TAIL_RECORD_MINUTE_RATIO) {
        addReadingSession(bookId, Math.max(1, Math.round(elapsedSinceLastRecord / MS_PER_MINUTE)));
      }
    };
  }, [bookId, addReadingSession]);
}
