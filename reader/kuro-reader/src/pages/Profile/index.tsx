import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { APP_CONFIG } from '@/constants/config';
import { ROUTES } from '@/constants/routes';
import { t } from '@/i18n';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useStatsStore } from '@/stores/useStatsStore';
import { formatBytes } from '@/utils/formatBytes';
import { getStorageUsage } from '@/utils/storage';

/** 借书证（建议书 6.12）：持证人与馆藏记忆，死卡片全部重造为真实功能。 */
const CARD_NO_DIGITS = 4;
export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { books, loadBooks } = useLibraryStore();
  const { stats } = useStatsStore();
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number }>({ used: 0, quota: 0 });
  const [annotationCount, setAnnotationCount] = useState(0);

  useEffect(() => {
    loadBooks();
    getStorageUsage().then(setStorageInfo);
    let cancelled = false;
    annotationRepo.getAll().then((all) => {
      if (!cancelled) setAnnotationCount(all.length);
    });
    return () => {
      cancelled = true;
    };
  }, [loadBooks]);

  const completedCount = books.filter(
    (b) => b.chapters.length > 0 && b.chapters.every((ch) => ch.status === 'read')
  ).length;
  const usedPercent = storageInfo.quota > 0 ? Math.round((storageInfo.used / storageInfo.quota) * 100) : 0;

  const cardFields: { label: string; value: string; onClick?: () => void }[] = [
    { label: t('藏书'), value: t('{{length}} 本', { length: books.length }), onClick: () => navigate(ROUTES.LIBRARY) },
    { label: t('已归架'), value: t('{{completedCount}} 部', { completedCount: completedCount }) },
    { label: t('手记'), value: t('{{annotationCount}} 条', { annotationCount: annotationCount }), onClick: () => navigate(ROUTES.NOTES) },
    { label: t('连续开馆'), value: t('{{currentStreak}} 天', { currentStreak: stats.currentStreak }), onClick: () => navigate(ROUTES.STATS) },
  ];

  return (
    <div className="pt-8 pb-16 px-margin-mobile max-w-max-width-content mx-auto w-full flex flex-col gap-8">
      {/* 借书证 */}
      <section className="relative rounded-card-lg border border-outline-variant bg-surface-container-low shadow-paper overflow-hidden">
        {/* 顶部朱砂条 */}
        <div className="h-1.5 bg-seal" aria-hidden="true" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-icon-lg">person</span>
              </div>
              <div>
                <h2 className="font-display text-headline-sm text-primary">{t('{{name}} 读者', { name: APP_CONFIG.name })}</h2>
                <p className="font-label text-label-sm text-on-surface-faint mt-0.5">{t('本地模式 · 馆藏与手记只存在这台设备')}</p>
              </div>
            </div>
            <span className="font-mono text-label-sm text-on-surface-faint hidden md:block">
              NO.{String(books.length).padStart(CARD_NO_DIGITS, '0')}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cardFields.map(({ label, value, onClick }) => (
              <button
                key={label}
                className="card-link p-3 disabled:cursor-default"
                onClick={onClick}
                disabled={!onClick}
              >
                <p className="font-label text-label-sm text-on-surface-faint">{label}</p>
                <p className="font-display text-headline-sm text-primary mt-1 tabular-nums">{value}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 馆容量 */}
      <section className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <span className="font-label text-label-md text-primary">{t('馆容量')}</span>
          <span className="font-mono text-label-sm text-on-surface-variant">
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}
          </span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant relative">
          <div className="absolute top-0 left-0 h-full bg-wood rounded-full transition-all duration-500 ease-out" style={{ width: `${usedPercent}%` }} />
        </div>
        <p className="font-body text-body-md text-on-surface-variant text-sm mt-1">{t('已藏 {{length}} 本书籍', { length: books.length })}</p>
      </section>

      {/* 真实功能入口（死卡片已清除：离线缓存/意见反馈无对应功能，不造假入口） */}
      <section className="flex flex-col">
        <button
          className="card-link rounded-card-lg px-6 py-4 flex items-center justify-between duration-200 mb-3"
          onClick={() => navigate(ROUTES.NOTES)}
        >
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
            <span className="font-label text-label-md text-primary">{t('我的手记')}</span>
          </span>
          <span className="font-mono text-label-sm text-on-surface-variant">{annotationCount}</span>
        </button>
        <button
          className="card-link rounded-card-lg px-6 py-4 flex items-center justify-between duration-200"
          onClick={() => navigate(ROUTES.STATS)}
        >
          <span className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">query_stats</span>
            <span className="font-label text-label-md text-primary">{t('阅读台账')}</span>
          </span>
          <span className="material-symbols-outlined text-icon-md text-on-surface-variant">chevron_right</span>
        </button>
        <p className="font-label text-label-sm text-on-surface-faint mt-6 px-1">
          {t('{{name}} · 版本 {{version}} · 本地优先的私人图书馆', { name: APP_CONFIG.name, version: APP_CONFIG.version })}</p>
      </section>
    </div>
  );
};
