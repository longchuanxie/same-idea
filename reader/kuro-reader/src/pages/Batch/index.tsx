import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { ROUTES } from '@/constants/routes';

export const BatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { comics, coverUrls, loadComics, batchDelete, batchMarkAsRead } = useLibraryStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadComics();
  }, [loadComics]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === comics.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comics.map((c) => c.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBatchMarkAsRead = () => {
    if (selectedIds.size === 0) return;
    batchMarkAsRead(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (comics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">auto_stories</span>
          <p className="font-body text-body-md text-on-surface-variant">书架为空，没有可管理的内容</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors"
            onClick={() => navigate(ROUTES.IMPORT)}
          >
            去导入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-background border-b border-outline-variant px-margin-mobile py-unit w-full flex justify-between items-center h-16 max-w-max-width-content mx-auto pt-safe">
        <button className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">close</span>
          取消
        </button>
        <h1 className="font-display text-headline-md text-primary tracking-tight">批量管理</h1>
        <button className="font-label text-label-md text-primary font-bold hover:opacity-80 transition-opacity" onClick={selectAll}>
          全选
        </button>
      </header>

      <main className="flex-grow w-full max-w-max-width-content mx-auto px-margin-mobile py-6 pb-32">
        <div className="mb-6 flex justify-between items-end border-b border-outline-variant pb-2">
          <span className="font-label text-label-sm text-on-surface-variant uppercase tracking-widest">
            已选择 {selectedIds.size} 项
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {comics.map((comic) => {
            const isSelected = selectedIds.has(comic.id);
            return (
              <div key={comic.id} className="relative group cursor-pointer" onClick={() => toggleSelect(comic.id)}>
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-6 h-6 rounded grid place-content-center border transition-colors ${
                      isSelected ? 'bg-primary border-primary' : 'bg-surface-bright/80 border-outline'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5" style={{
                        clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
                        backgroundColor: 'white',
                      }} />
                    )}
                  </div>
                </div>
                <div className={`aspect-[2/3] w-full border relative overflow-hidden bg-surface-container-low mb-3 ${
                  isSelected ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {isSelected && <div className="absolute inset-0 bg-primary/5 mix-blend-multiply z-0" />}
                  {coverUrls[comic.id] ? (
                    <img
                      src={coverUrls[comic.id]}
                      alt={comic.title}
                      className="w-full h-full object-cover grayscale opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-variant flex items-center justify-center grayscale opacity-90">
                      <span className="material-symbols-outlined text-on-surface-variant text-5xl">auto_stories</span>
                    </div>
                  )}
                </div>
                <h3 className={`font-label text-label-md truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                  {comic.title}
                </h3>
                <p className="font-label text-label-sm text-on-surface-variant mt-1">
                  {comic.status === 'completed' ? '已完结' : `${comic.totalChapters} 话`}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      <div className="fixed bottom-gutter left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-surface-container-highest border border-outline-variant rounded-full z-50 flex justify-around items-center p-2 gap-2">
        <button
          className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group ${
            selectedIds.size > 0 ? 'text-on-surface-variant hover:bg-surface-dim' : 'text-on-surface-variant/40 cursor-not-allowed'
          }`}
          onClick={handleBatchDelete}
          disabled={selectedIds.size === 0}
        >
          <span className="material-symbols-outlined group-hover:text-primary mb-1">delete</span>
          <span className="font-label text-label-sm group-hover:text-primary">删除</span>
        </button>
        <button
          className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group border-l border-outline-variant/50 pl-6 ${
            selectedIds.size > 0 ? 'text-on-surface-variant hover:bg-surface-dim' : 'text-on-surface-variant/40 cursor-not-allowed'
          }`}
          onClick={handleBatchMarkAsRead}
          disabled={selectedIds.size === 0}
        >
          <span className="material-symbols-outlined group-hover:text-primary mb-1">done_all</span>
          <span className="font-label text-label-sm group-hover:text-primary">标为已读</span>
        </button>
      </div>
    </div>
  );
};
