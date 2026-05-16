import React, { useEffect } from 'react';
import { useStatsStore } from '@/stores/useStatsStore';
import { useLibraryStore } from '@/stores/useLibraryStore';

export const StatsPage: React.FC = () => {
  const { getStats } = useStatsStore();
  const { comics, loadComics } = useLibraryStore();
  const stats = getStats();

  useEffect(() => {
    loadComics();
  }, [loadComics]);

  const completedComics = comics.filter((c) =>
    c.chapters.length > 0 && c.chapters.every((ch) => ch.status === 'read')
  );

  const maxHours = Math.max(...stats.weeklyData.map((d) => d.hours), 1);

  return (
    <div className="w-full max-w-max-width-content px-margin-mobile md:px-0 py-8 md:py-16 flex flex-col gap-12">
      <section className="flex flex-col gap-2 border-b border-outline-variant pb-8">
        <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">阅读统计</h2>
        <p className="font-body text-body-md text-on-surface-variant">你在此留下的墨迹与时光。</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-outline-variant bg-transparent p-6 flex flex-col justify-between min-h-[160px] hover:bg-surface-container-lowest transition-colors">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-xl">schedule</span>
            <h3 className="font-label text-label-md uppercase tracking-widest">累计阅读时长</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display-lg-mobile md:text-display-lg text-primary">{stats.totalHours}</span>
            <span className="font-body text-body-md text-on-surface-variant">小时</span>
          </div>
        </div>
        <div className="border border-outline-variant bg-transparent p-6 flex flex-col justify-between min-h-[160px] hover:bg-surface-container-lowest transition-colors">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-xl">local_fire_department</span>
            <h3 className="font-label text-label-md uppercase tracking-widest">当前连续阅读</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display-lg-mobile md:text-display-lg text-primary">{stats.currentStreak}</span>
            <span className="font-body text-body-md text-on-surface-variant">天</span>
          </div>
        </div>
      </section>

      {completedComics.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
            <h3 className="font-display text-headline-md text-primary">
              已完成作品 <span className="text-on-surface-variant font-body text-body-md ml-2">({completedComics.length})</span>
            </h3>
          </div>
          <div className="flex flex-col">
            {completedComics.map((comic) => (
              <div key={comic.id} className="py-4 border-b border-surface-variant flex justify-between items-center group cursor-pointer hover:pl-2 transition-all">
                <div className="flex flex-col">
                  <span className="font-body text-body-lg text-primary group-hover:underline decoration-1 underline-offset-4">{comic.title}</span>
                  {comic.author && (
                    <span className="font-label text-label-sm text-on-surface-variant">{comic.author}</span>
                  )}
                </div>
                {comic.genres.length > 0 && (
                  <span className="font-label text-label-sm border border-outline-variant px-2 py-1 rounded text-secondary">{comic.genres[0]}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {stats.weeklyData.length > 0 && stats.weeklyData.some((d) => d.hours > 0) && (
        <section className="flex flex-col gap-6 mt-8">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-on-surface-variant">bar_chart</span>
            <h3 className="font-display text-headline-md text-primary">近期阅读趋势</h3>
          </div>
          <div className="w-full h-48 border border-outline-variant p-4 flex items-end justify-between gap-2 relative">
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-on-surface-variant font-label text-label-sm py-4 pl-2 opacity-50">
              <span>{maxHours.toFixed(1)}h</span>
              <span>{(maxHours / 2).toFixed(1)}h</span>
              <span>0</span>
            </div>
            <div className="w-full h-full flex items-end justify-around pl-8">
              {stats.weeklyData.map((d, i) => (
                <div
                  key={d.day}
                  className={`w-8 md:w-12 hover:opacity-80 transition-opacity ${i === stats.weeklyData.length - 1 ? 'bg-primary' : 'bg-surface-tint opacity-40'}`}
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-outline-variant bg-transparent p-6 flex flex-col justify-between min-h-[160px] hover:bg-surface-container-lowest transition-colors">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-xl">emoji_events</span>
            <h3 className="font-label text-label-md uppercase tracking-widest">最长连续阅读</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display-lg-mobile md:text-display-lg text-primary">{stats.longestStreak}</span>
            <span className="font-body text-body-md text-on-surface-variant">天</span>
          </div>
        </div>
        <div className="border border-outline-variant bg-transparent p-6 flex flex-col justify-between min-h-[160px] hover:bg-surface-container-lowest transition-colors">
          <div className="flex items-center gap-2 text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            <h3 className="font-label text-label-md uppercase tracking-widest">已完成作品</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-display-lg-mobile md:text-display-lg text-primary">{completedComics.length}</span>
            <span className="font-body text-body-md text-on-surface-variant">部</span>
          </div>
        </div>
      </section>

      {stats.totalHours === 0 && completedComics.length === 0 && (
        <section className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">query_stats</span>
          <p className="font-body text-body-md text-on-surface-variant">还没有阅读数据</p>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">开始阅读后，统计数据将在此显示</p>
        </section>
      )}
    </div>
  );
};
