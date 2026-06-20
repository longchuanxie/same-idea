import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import type { TextChapter } from '@/pages/TextReader';

interface ChapterDrawerProps {
  chapters: TextChapter[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
  onClose: () => void;
}

export const ChapterDrawer: React.FC<ChapterDrawerProps> = ({
  chapters,
  currentChapterIndex,
  onSelectChapter,
  onClose,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLButtonElement>(null);

  // 滚动到当前章节
  useEffect(() => {
    if (currentItemRef.current && listRef.current) {
      const container = listRef.current;
      const item = currentItemRef.current;
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      
      if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
        item.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* 抽屉内容 */}
      <div
        className={cn(
          'relative w-[280px] max-w-[80vw] h-full bg-surface shadow-2xl animate-slide-in-left',
          'flex flex-col'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/50">
          <h2 className="font-display text-title-md text-on-surface">章节目录</h2>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
            onClick={onClose}
            aria-label="关闭"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 章节列表 */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto py-2 scrollbar-hide"
        >
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              ref={index === currentChapterIndex ? currentItemRef : undefined}
              className={cn(
                'w-full px-4 py-3 text-left transition-colors flex items-center gap-3',
                index === currentChapterIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface hover:bg-surface-variant/50'
              )}
              onClick={() => onSelectChapter(index)}
            >
              {index === currentChapterIndex && (
                <span className="material-symbols-outlined text-[18px] text-primary">play_arrow</span>
              )}
              <span
                className={cn(
                  'font-body text-body-sm truncate',
                  index === currentChapterIndex ? 'font-medium' : ''
                )}
              >
                {chapter.title}
              </span>
            </button>
          ))}
        </div>

        {/* 底部信息 */}
        <div className="px-4 py-3 border-t border-outline-variant/50 bg-surface-container-low">
          <p className="font-label text-label-sm text-on-surface-variant">
            共 {chapters.length} 章 · 当前第 {currentChapterIndex + 1} 章
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChapterDrawer;
