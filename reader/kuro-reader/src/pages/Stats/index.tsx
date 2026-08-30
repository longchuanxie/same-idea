import React, { useEffect, useState } from 'react';

import { FormatBadge } from '@/components/atoms/FormatBadge';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { cn } from '@/utils/cn';
import {
  buildReadingHeatmap,
  getGoalStreak,
  getTodayMinutes,
} from '@/utils/readingHeatmap';

const HEATMAP_WEEKS = 15;
// 每日目标分钟档位（数值即业务语义，豁免魔数检查）
// eslint-disable-next-line no-magic-numbers
const GOAL_PRESETS = [15, 30, 60, 120];
/** 叙事小字：折算「安静的夜晚」时每夜平均阅读小时 */
const HOURS_PER_NIGHT = 1;

/** 年轮色阶（建议书 2.8-2）：读得越勤、印得越红（ink→seal） */
const HEATMAP_LEVEL_CLASSES = [
  'bg-surface-variant',
  'bg-seal/25',
  'bg-seal/50',
  'bg-seal/75',
  'bg-seal',
];

/** 数字叙事化（建议书 2.10-3）：大数字必须跟一行人话 */
const narrateTotalHours = (hours: number): string => {
  if (hours < HOURS_PER_NIGHT) return '时光尚浅，静候墨迹';
  return `大约 ${Math.round(hours / HOURS_PER_NIGHT)} 个安静的夜晚`;
};

export const StatsPage: React.FC = () => {
  const { getStats, readingSessions, dailyGoalMinutes, setDailyGoalMinutes } = useStatsStore();
  const { books, loadBooks } = useLibraryStore();
  const stats = getStats();
  const [goalEditing, setGoalEditing] = useState(false);

  const heatmap = buildReadingHeatmap(readingSessions, dailyGoalMinutes, HEATMAP_WEEKS);
  const todayMinutes = getTodayMinutes(readingSessions);
  const goalStreak = getGoalStreak(readingSessions, dailyGoalMinutes);
  const goalPercent = dailyGoalMinutes > 0
    ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100))
    : 0;

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const completedBooks = books.filter((b) =>
    b.chapters.length > 0 && b.chapters.every((ch) => ch.status === 'read')
  );

  const maxHours = Math.max(...stats.weeklyData.map((d) => d.hours), 1);

  /** 本期概览（建议书 6.10）：同类指标相邻呈现，衬线大数字 + mono 单位 + 叙事小字 */
  const overviewCards: { label: string; value: number; unit: string; narrative: string; icon: string }[] = [
    {
      label: '累计时长',
      value: stats.totalHours,
      unit: '小时',
      narrative: narrateTotalHours(stats.totalHours),
      icon: 'schedule',
    },
    {
      label: '连续开馆',
      value: stats.currentStreak,
      unit: '天',
      narrative: goalStreak > 0 ? `连续达标 ${goalStreak} 天` : '今天开馆即可续上',
      icon: 'local_fire_department',
    },
    {
      label: '最长连续',
      value: stats.longestStreak,
      unit: '天',
      narrative: stats.longestStreak > 0 ? `最长的一次，连续 ${stats.longestStreak} 天` : '纪录虚位以待',
      icon: 'emoji_events',
    },
    {
      label: '已归架',
      value: completedBooks.length,
      unit: '部',
      narrative: completedBooks.length > 0 ? '读完的作品都在架上' : '第一本归架后点亮',
      icon: 'check_circle',
    },
  ];

  return (
    <div className="w-full max-w-max-width-content px-margin-mobile md:px-0 py-8 md:py-16 flex flex-col gap-12">
      <section className="flex flex-col gap-2 border-b border-outline-variant pb-8">
        <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">图书馆台账</h2>
        <p className="font-body text-body-md text-on-surface-variant">你在此留下的墨迹与时光。</p>
      </section>

      {/* 本期概览：四数一屏，当前/最长连续相邻 */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {overviewCards.map(({ label, value, unit, narrative, icon }) => (
          <div
            key={label}
            className="border border-outline-variant rounded-card-lg p-4 md:p-5 flex flex-col gap-3 hover:bg-surface-container-lowest transition-colors"
          >
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-icon-md">{icon}</span>
              <h3 className="font-label text-label-sm uppercase tracking-widest">{label}</h3>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-headline-md md:text-headline-sm text-primary tabular-nums">{value}</span>
              <span className="font-mono text-label-sm text-on-surface-variant">{unit}</span>
            </div>
            <p className="font-body text-body-sm text-on-surface-faint leading-snug">{narrative}</p>
          </div>
        ))}
      </section>

      {/* 今日目标：展示与编辑分离（建议书 6.10） */}
      <section className="border border-outline-variant rounded-card-lg p-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-icon-md">flag</span>
          <h3 className="font-label text-label-md uppercase tracking-widest">今日之灯</h3>
          <button
            className="font-label text-label-sm text-on-surface-variant hover:text-primary transition-colors ml-auto"
            onClick={() => setGoalEditing(!goalEditing)}
          >
            {goalEditing ? '收起' : '调整目标'}
          </button>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-display-lg-mobile text-primary tabular-nums">{todayMinutes}</span>
          <span className="font-body text-body-md text-on-surface-variant">
            / {dailyGoalMinutes} 分钟 · 今日已读 {goalPercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-variant overflow-hidden">
          <div
            className="h-full bg-lamp rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
        {goalEditing && (
          <div className="flex items-center gap-2 pt-2">
            <span className="font-label text-label-sm text-on-surface-variant mr-1">目标</span>
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset}
                className={cn(
                  'px-3 py-1 rounded-full font-label text-label-sm border transition-colors',
                  dailyGoalMinutes === preset
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                )}
                onClick={() => setDailyGoalMinutes(preset)}
              >
                {preset} 分钟
              </button>
            ))}
          </div>
        )}
      </section>

      {completedBooks.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
            <h3 className="font-display text-headline-md text-primary">
              已归架作品 <span className="font-mono text-label-sm text-on-surface-variant ml-2">{completedBooks.length}</span>
            </h3>
          </div>
          <div className="flex flex-col">
            {completedBooks.map((book) => (
              <div key={book.id} className="py-4 border-b border-surface-variant flex justify-between items-center group cursor-pointer hover:pl-2 transition-all">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-body text-body-lg text-primary group-hover:underline decoration-1 underline-offset-4">{book.title}</span>
                    <FormatBadge format={book.format} />
                  </div>
                  {book.author && (
                    <span className="font-label text-label-sm text-on-surface-variant">{book.author}</span>
                  )}
                </div>
                {book.genres.length > 0 && (
                  <span className="font-label text-label-sm border border-outline-variant px-2 py-1 rounded text-secondary">{book.genres[0]}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
          <span className="material-symbols-outlined text-on-surface-variant">calendar_view_month</span>
          <h3 className="font-display text-headline-md text-primary">年轮 · 阅读热力图</h3>
          <span className="font-label text-label-sm text-on-surface-variant opacity-60 ml-auto">
            近 {HEATMAP_WEEKS} 周 · 以每日目标 {dailyGoalMinutes} 分钟定档
          </span>
        </div>
        <div className="overflow-x-auto pb-2">
          <div
            className="grid grid-flow-col grid-rows-7 gap-1 w-max"
            style={{ gridAutoColumns: 'minmax(0, 1fr)' }}
          >
            {heatmap.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date} · ${cell.minutes} 分钟`}
                className={`w-3.5 h-3.5 rounded-sm ${HEATMAP_LEVEL_CLASSES[cell.level]}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 mt-3 text-on-surface-variant">
            <span className="font-label text-label-xs">少</span>
            {HEATMAP_LEVEL_CLASSES.map((cls) => (
              <span key={cls} className={`w-3 h-3 rounded-sm ${cls}`} />
            ))}
            <span className="font-label text-label-xs">多</span>
          </div>
        </div>
      </section>

      {stats.weeklyData.length > 0 && stats.weeklyData.some((d) => d.hours > 0) && (
        <section className="flex flex-col gap-6 mt-8">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">bar_chart</span>
            <h3 className="font-display text-headline-md text-primary">近七日节奏</h3>
          </div>
          <div className="w-full h-48 border border-outline-variant p-4 flex items-end justify-between gap-2 relative">
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-on-surface-variant font-mono text-label-sm py-4 pl-2 opacity-50">
              <span>{maxHours.toFixed(1)}h</span>
              <span>{(maxHours / 2).toFixed(1)}h</span>
              <span>0</span>
            </div>
            <div className="w-full h-full flex items-end justify-around pl-8">
              {stats.weeklyData.map((d, i) => (
                <div
                  key={d.day}
                  className={`w-8 md:w-12 hover:opacity-80 transition-opacity ${i === stats.weeklyData.length - 1 ? 'bg-seal' : 'bg-seal/30'}`}
                  style={{ height: d.hours > 0 ? `${(d.hours / maxHours) * 100}%` : '2px' }}
                />
              ))}
            </div>
          </div>
          <div className="w-full flex justify-around pl-8 text-on-surface-variant font-label text-label-sm">
            {stats.weeklyData.map((d, i) => (
              <span key={d.day} className={i === stats.weeklyData.length - 1 ? 'text-primary font-bold' : ''}>{d.day}</span>
            ))}
          </div>
        </section>
      )}

      {stats.totalHours === 0 && completedBooks.length === 0 && (
        <section className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">query_stats</span>
          <p className="font-body text-body-md text-on-surface-variant">台账还是第一页</p>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">开始阅读后，墨迹会自己长出来</p>
        </section>
      )}
    </div>
  );
};
