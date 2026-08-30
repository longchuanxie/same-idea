import React from 'react';

import { cn } from '@/utils/cn';

interface TextReaderHeaderProps {
  visible: boolean;
  title: string;
  chapterTitle?: string;
  showChapterButton: boolean;
  isBookmarked: boolean;
  /** 收藏统一 bookmark 隐喻（建议书 6.9：替代原 heart） */
  isFavorite: boolean;
  onBack: () => void;
  onOpenChapters: () => void;
  onToggleBookmark: () => void;
  onToggleFavorite: () => void;
  /** 手记合入口：书签列表 + 批注列表（动线三：从设置面板第 16 组提升为顶栏直达） */
  onOpenAnnotations: () => void;
  onOpenSettings: () => void;
}

/** 文本阅读器顶栏（返回 / 书名全名 / 章节名 / 目录 / 手记 / 收藏 / 设置）
 *  书名弹性截断（建议书 6.9：原 4 字硬截已废弃），完整书名走 title 提示 */
export const TextReaderHeader: React.FC<TextReaderHeaderProps> = ({
  visible,
  title,
  chapterTitle,
  showChapterButton,
  isBookmarked,
  isFavorite,
  onBack,
  onOpenChapters,
  onToggleBookmark,
  onToggleFavorite,
  onOpenAnnotations,
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
        className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50 flex-shrink-0"
        onClick={onBack}
        data-ui-control
      >
        <span className="material-symbols-outlined text-headline-md">arrow_back</span>
      </button>
      <div className="flex flex-col items-center flex-1 min-w-0 px-2">
        <h1 className="font-display text-headline-sm text-primary truncate w-full text-center" title={title}>
          {title}
        </h1>
        {showChapterButton && chapterTitle && (
          <span className="font-label text-label-sm text-on-surface-variant truncate w-full text-center">
            {chapterTitle}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
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
        {/* 手记合入口（书签列表 + 批注列表） */}
        <button
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50"
          onClick={onOpenAnnotations}
          data-ui-control
          aria-label="手记列表"
        >
          <span className="material-symbols-outlined text-headline-md">edit_note</span>
        </button>
        {/* 收藏：bookmark 统一隐喻 */}
        <button
          className={`${isFavorite ? 'text-seal' : 'text-on-surface-variant'} hover:text-primary transition-colors flex items-center justify-center w-11 h-11 rounded-full hover:bg-surface-variant/50`}
          onClick={onToggleFavorite}
          data-ui-control
          aria-label={isFavorite ? '取消收藏' : '收藏本书'}
        >
          <span
            className="material-symbols-outlined text-headline-md"
            style={isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {isFavorite ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
        {/* 书签（当前章节标记） */}
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
          aria-label="阅读设置"
        >
          <span className="material-symbols-outlined text-headline-md">tune</span>
        </button>
      </div>
    </div>
  </header>
);
