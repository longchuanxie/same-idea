import React, { useEffect, useState } from 'react';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { getStorageUsage } from '@/utils/storage';
import { APP_CONFIG } from '@/constants/config';

export const ProfilePage: React.FC = () => {
  const { books, loadBooks } = useLibraryStore();
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number }>({ used: 0, quota: 0 });

  useEffect(() => {
    loadBooks();
    getStorageUsage().then(setStorageInfo);
  }, [loadBooks]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usedPercent = storageInfo.quota > 0 ? Math.round((storageInfo.used / storageInfo.quota) * 100) : 0;

  return (
    <div className="pt-8 pb-16 px-margin-mobile max-w-max-width-content mx-auto w-full flex flex-col gap-8">
      <section className="flex flex-col items-center justify-center text-center py-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border border-outline-variant mb-4 bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '48px' }}>person</span>
        </div>
        <h2 className="font-display text-display-lg-mobile text-primary">{APP_CONFIG.name} 用户</h2>
        <div className="mt-2 inline-flex items-center gap-2">
          <span className="font-label text-label-md text-on-surface-variant uppercase tracking-widest">本地模式</span>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <span className="font-label text-label-md text-primary">本地存档</span>
          <span className="font-label text-label-sm text-on-surface-variant">
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}
          </span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant relative">
          <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${usedPercent}%` }} />
        </div>
        <p className="font-body text-body-md text-on-surface-variant text-sm mt-1">
          已导入 {books.length} 本书籍
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <a className="col-span-2 group border border-outline-variant bg-surface p-6 flex items-start gap-4 hover:bg-surface-container transition-colors duration-200 cursor-pointer">
          <div className="p-3 border border-outline-variant rounded-full text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_download</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-display text-headline-sm text-primary mb-1">离线缓存</h3>
            <p className="font-body text-body-md text-on-surface-variant">管理已下载的内容，清理临时文件。</p>
          </div>
        </a>
        <a className="col-span-1 group border border-outline-variant bg-surface p-5 flex flex-col justify-between min-h-[140px] hover:bg-surface-container transition-colors duration-200 cursor-pointer">
          <div className="flex justify-between items-start w-full">
            <span className="material-symbols-outlined text-primary">auto_stories</span>
            <span className="font-label text-label-md text-on-surface-variant">{books.length}</span>
          </div>
          <h3 className="font-label text-label-md text-primary font-bold mt-4">我的书籍</h3>
        </a>
        <a className="col-span-1 group border border-outline-variant bg-surface p-5 flex flex-col justify-between min-h-[140px] hover:bg-surface-container transition-colors duration-200 cursor-pointer">
          <div className="flex justify-between items-start w-full">
            <span className="material-symbols-outlined text-primary">forum</span>
          </div>
          <h3 className="font-label text-label-md text-primary font-bold mt-4">意见反馈</h3>
        </a>
        <a className="col-span-2 group border border-outline-variant bg-surface px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">info</span>
            <h3 className="font-label text-label-md text-primary font-bold">关于 {APP_CONFIG.name}</h3>
          </div>
          <span className="font-label text-label-sm text-outline uppercase tracking-wider">版本 {APP_CONFIG.version}</span>
        </a>
      </section>
    </div>
  );
};
