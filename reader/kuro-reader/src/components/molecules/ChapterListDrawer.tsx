import React from 'react';

import { cn } from '@/utils/cn';

interface ChapterListDrawerProps {
  chapters: { id: string; title: string; pages: string[] }[];
  currentChapterId: string | null;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
}

/** 漫画阅读器章节目录抽屉 */
export const ChapterListDrawer: React.FC<ChapterListDrawerProps> = ({
  chapters,
  currentChapterId,
  onSelect,
  onClose,
}) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-on-background/40 animate-fade-in" onClick={onClose} />
    <div className="relative w-[280px] max-w-[80vw] h-full bg-surface-bright shadow-2xl animate-slide-left flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
        <h3 className="font-display text-headline-sm text-primary">章节目录</h3>
        <button
          className="text-on-surface-variant hover:text-primary transition-colors w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-variant/50"
          onClick={onClose}
          data-ui-control
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chapters.map((chapter, idx) => {
          const isCurrentChapter = chapter.id === currentChapterId;
          return (
            <button
              key={chapter.id}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-outline-variant/30 transition-colors',
                isCurrentChapter
                  ? 'bg-primary/10 border-l-2 border-l-primary'
                  : 'hover:bg-surface-container'
              )}
              onClick={() => {
                onSelect(chapter.id);
                onClose();
              }}
              data-ui-control
            >
              <p
                className={cn(
                  'font-body text-body-md',
                  isCurrentChapter ? 'text-primary font-medium' : 'text-on-surface'
                )}
              >
                {chapter.title || `第${idx + 1}话`}
              </p>
              <p className="font-label text-label-sm text-on-surface-variant mt-0.5">
                {chapter.pages.length} 页
                {isCurrentChapter && ' · 当前'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  </div>
);
