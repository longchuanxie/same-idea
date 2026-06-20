import React, { useState } from 'react';
import type { Bookmark } from '@/types';
import { cn } from '@/utils/cn';

interface BookmarkPanelProps {
  bookmarks: Bookmark[];
  onSelect: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
  onClose: () => void;
}

export const BookmarkPanel: React.FC<BookmarkPanelProps> = ({
  bookmarks,
  onSelect,
  onDelete,
  onClose,
}) => {
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}`;
  };

  const handleTouchStart = (id: string) => {
    setSwipedId(id);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative bg-surface rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50">
          <h3 className="font-display text-headline-sm text-primary">书签</h3>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
          </button>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">bookmark_border</span>
              <p className="font-body text-body-md text-on-surface-variant opacity-60">暂无书签</p>
              <p className="font-label text-label-sm text-on-surface-variant opacity-40">点击顶栏书签按钮添加</p>
            </div>
          ) : (
            <div className="py-2">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="relative overflow-hidden mx-3 my-1 rounded-xl"
                  onTouchStart={() => handleTouchStart(bm.id)}
                >
                  {/* 删除按钮（滑动显示） */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-error flex items-center justify-center rounded-r-xl">
                    <button
                      className="w-full h-full flex items-center justify-center"
                      onClick={() => {
                        onDelete(bm.id);
                        setSwipedId(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-on-error text-[20px]">delete</span>
                    </button>
                  </div>

                  {/* 内容 */}
                  <div
                    className={cn(
                      'bg-surface-container-low px-4 py-3 rounded-xl transition-transform duration-200 cursor-pointer',
                      swipedId === bm.id ? '-translate-x-20' : 'translate-x-0'
                    )}
                    onClick={() => {
                      if (swipedId === bm.id) {
                        setSwipedId(null);
                        return;
                      }
                      onSelect(bm);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-primary text-[16px]">bookmark</span>
                          <span className="font-label text-label-md text-primary truncate">
                            {bm.chapterTitle}
                          </span>
                        </div>
                        {bm.textPreview && (
                          <p className="font-body text-body-sm text-on-surface-variant line-clamp-2 mb-1 pl-6">
                            {bm.textPreview}
                          </p>
                        )}
                        <div className="flex items-center gap-3 pl-6">
                          <span className="font-label text-label-sm text-on-surface-variant opacity-60">
                            {bm.pageIndex != null ? `第 ${bm.pageIndex + 1} 页` : `${Math.round((bm.scrollRatio ?? 0) * 100)}%`}
                          </span>
                          <span className="font-label text-label-sm text-on-surface-variant opacity-40">
                            {formatTime(bm.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
