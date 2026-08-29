import React from 'react';

import { cn } from '@/utils/cn';

const TITLE_MAX_CHARS = 4;

interface TextReaderHeaderProps {
  visible: boolean;
  title: string;
  chapterTitle?: string;
  showChapterButton: boolean;
  isBookmarked: boolean;
  onBack: () => void;
  onOpenChapters: () => void;
  onToggleBookmark: () => void;
  onOpenSettings: () => void;
}

/** 文本阅读器顶栏（返回 / 标题 / 目录 / 书签 / 设置） */
export const TextReaderHeader: React.FC<TextReaderHeaderProps> = ({
  visible,
  title,
  chapterTitle,
  showChapterButton,
  isBookmarked,
  onBack,
  onOpenChapters,
  onToggleBookmark,
  onOpenSettings,
}) => (
  <header
    className={cn(
      'bg-surface/80 backdrop-blur-md w-full px-margin-mobile py-2 border-b border-outline-variant/50 pointer-events-auto pt-safe transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
      visible ? 'translate-y-0' : '-translate-y-full'
    )}
  >
    <div className="max-w-max-width-content mx-auto flex justify-between items-center">
      <button
        className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
        onClick={onBack}
        data-ui-control
      >
        <span className="material-symbols-outlined text-headline-md">arrow_back</span>
      </button>
      <div className="flex flex-col items-center max-w-[60%]">
        <h1 className="font-display text-headline-sm text-primary truncate w-full text-center">
          {title.length > TITLE_MAX_CHARS ? title.slice(0, TITLE_MAX_CHARS) : title}
        </h1>
        {showChapterButton && chapterTitle && (
          <span className="font-label text-label-sm text-on-surface-variant truncate w-full text-center">
            {chapterTitle}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {showChapterButton && (
          <button
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
            onClick={onOpenChapters}
            data-ui-control
            aria-label="章节目录"
          >
            <span className="material-symbols-outlined text-headline-md">format_list_bulleted</span>
          </button>
        )}
        {/* 书签按钮 */}
        <button
          className={`${isBookmarked ? 'text-primary' : 'text-on-surface-variant'} hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50`}
          onClick={onToggleBookmark}
          data-ui-control
          aria-label={isBookmarked ? '移除书签' : '添加书签'}
        >
          <span
            className="material-symbols-outlined text-headline-md"
            style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {isBookmarked ? 'bookmark' : 'bookmark_add'}
          </span>
        </button>
        <button
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
          onClick={onOpenSettings}
          data-ui-control
          aria-label="设置"
        >
          <span className="material-symbols-outlined text-headline-md">more_vert</span>
        </button>
      </div>
    </div>
  </header>
);
