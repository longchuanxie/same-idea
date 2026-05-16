import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReadingStats } from '@/types';
import { STORAGE_KEYS } from '@/constants/storage';

interface ReadingSession {
  date: string;
  minutes: number;
  comicId: string;
}

interface StatsState {
  stats: ReadingStats;
  readingSessions: ReadingSession[];

  addReadingSession: (comicId: string, minutes: number) => void;
  getStats: () => ReadingStats;
  calculateWeeklyData: () => { day: string; hours: number }[];
}

const DEFAULT_STATS: ReadingStats = {
  totalHours: 0,
  currentStreak: 0,
  longestStreak: 0,
  completedComics: 0,
  weeklyData: [],
};

function getDayLabel(date: Date): string {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return days[date.getDay()];
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculateStreaks(dates: string[]) {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = [...new Set(dates)].sort();
  const today = getDateString(new Date());
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  let longestStreak = 1;
  let currentStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
    currentStreak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { currentStreak, longestStreak };
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: DEFAULT_STATS,
      readingSessions: [],

      addReadingSession: (comicId, minutes) => {
        if (minutes <= 0) return;

        const date = getDateString(new Date());
        set((state) => {
          const sessions = [...state.readingSessions, { date, minutes, comicId }];
          const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
          const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

          const dates = sessions.map((s) => s.date);
          const { currentStreak, longestStreak } = calculateStreaks(dates);
          const weeklyData = get().calculateWeeklyData();

          return {
            readingSessions: sessions,
            stats: {
              totalHours,
              currentStreak,
              longestStreak,
              completedComics: state.stats.completedComics,
              weeklyData,
            },
          };
        });
      },

      getStats: () => {
        const { stats, readingSessions } = get();
        const weeklyData = get().calculateWeeklyData();
        const totalMinutes = readingSessions.reduce((sum, s) => sum + s.minutes, 0);
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
        const dates = readingSessions.map((s) => s.date);
        const { currentStreak, longestStreak } = calculateStreaks(dates);

        return {
          ...stats,
          totalHours,
          currentStreak,
          longestStreak,
          weeklyData,
        };
      },

      calculateWeeklyData: () => {
        const { readingSessions } = get();
        const result: { day: string; hours: number }[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = getDateString(d);
          const dayLabel = getDayLabel(d);
          const dayMinutes = readingSessions
            .filter((s) => s.date === dateStr)
            .reduce((sum, s) => sum + s.minutes, 0);
          result.push({ day: dayLabel, hours: Math.round((dayMinutes / 60) * 100) / 100 });
        }

        return result;
      },
    }),
    {
      name: STORAGE_KEYS.STATS,
    }
  )
);
