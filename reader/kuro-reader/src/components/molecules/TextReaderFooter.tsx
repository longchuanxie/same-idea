import React from 'react';

import { cn } from '@/utils/cn';

interface TextReaderFooterProps {
  visible: boolean;
  showChapterNav: boolean;
  /** 0-based 当前后章下标 */
  chapterIndex: number;
  chapterTotal: number;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  scrollPercent: number;
  dragPercent: number;
  isDragging: boolean;
  onSliderChange: (value: number) => void;
  onSliderDragStart: () => void;
  onSliderCommit: () => void;
  rightLabel: string;
}

/** 文本阅读器底部进度条（章节导航 + 自动滚动 + 进度滑杆） */
export const TextReaderFooter: React.FC<TextReaderFooterProps> = ({
  visible,
  showChapterNav,
  chapterIndex,
  chapterTotal,
  onPrevChapter,
  onNextChapter,
  isAutoScrolling,
  onToggleAutoScroll,
  scrollPercent,
  dragPercent,
  isDragging,
  onSliderChange,
  onSliderDragStart,
  onSliderCommit,
  rightLabel,
}) => (
  <div
    className={cn(
      'w-full pointer-events-auto bg-surface/60 backdrop-blur-md pb-safe pt-4 px-margin-mobile transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
      visible ? 'translate-y-0' : 'translate-y-full'
    )}
  >
    <div className="max-w-max-width-content mx-auto">
      {/* 章节导航按钮 */}
      {showChapterNav && (
        <div className="flex items-center justify-between mb-3">
          <button
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm font-label transition-colors',
              chapterIndex > 0
                ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                : 'bg-surface-container-high/50 text-on-surface-variant/50 cursor-not-allowed'
            )}
            onClick={onPrevChapter}
            disabled={chapterIndex === 0}
            data-ui-control
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            上一章
          </button>
          <span className="font-label text-label-sm text-on-surface-variant">
            {chapterIndex + 1} / {chapterTotal}
          </span>
          <button
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm font-label transition-colors',
              chapterIndex < chapterTotal - 1
                ? 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                : 'bg-surface-container-high/50 text-on-surface-variant/50 cursor-not-allowed'
            )}
            onClick={onNextChapter}
            disabled={chapterIndex === chapterTotal - 1}
            data-ui-control
          >
            下一章
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      )}
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <button
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center transition-colors',
            isAutoScrolling
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          )}
          onClick={onToggleAutoScroll}
          data-ui-control
          aria-label={isAutoScrolling ? '停止自动滚动' : '开始自动滚动'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isAutoScrolling ? 'pause' : 'play_arrow'}
          </span>
        </button>
        <span className="font-label text-label-sm text-on-surface-variant tabular-nums w-10 text-right">
          {isDragging ? dragPercent : scrollPercent}%
        </span>
        <div className="flex-1 relative h-8 flex items-center group">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isDragging ? dragPercent : scrollPercent}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            onPointerDown={onSliderDragStart}
            onPointerUp={onSliderCommit}
            className="progress-slider w-full"
            data-ui-control
          />
        </div>
        <span className="font-label text-label-sm text-on-surface-variant">{rightLabel}</span>
      </div>
    </div>
  </div>
);
