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
  ttsSupported: boolean;
  ttsActive: boolean;
  onToggleTTS: () => void;
  scrollPercent: number;
  dragPercent: number;
  isDragging: boolean;
  onSliderChange: (value: number) => void;
  onSliderDragStart: () => void;
  onSliderCommit: () => void;
  /** 滑杆右侧的页码/格式标（滚动模式为格式徽记，分页模式为页码） */
  rightLabel: string;
}

/** 文本阅读器底栏（建议书 6.9 精简）：章节导航行 + 进度行。
 *  TTS 与自动滚动合并为「播报」圆钮组；页码走 mono 字体。 */
export const TextReaderFooter: React.FC<TextReaderFooterProps> = ({
  visible,
  showChapterNav,
  chapterIndex,
  chapterTotal,
  onPrevChapter,
  onNextChapter,
  isAutoScrolling,
  onToggleAutoScroll,
  ttsSupported,
  ttsActive,
  onToggleTTS,
  scrollPercent,
  dragPercent,
  isDragging,
  onSliderChange,
  onSliderDragStart,
  onSliderCommit,
  rightLabel,
}) => {
  const broadcastActive = isAutoScrolling || ttsActive;

  return (
    <div
      className={cn(
        'w-full pointer-events-auto bg-surface/60 backdrop-blur-md pb-safe pt-4 px-margin-mobile transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="max-w-max-width-content mx-auto">
        {/* 章节导航行：mono 页码（第 N/M 章，点击语义交给章节抽屉） */}
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
              <span className="material-symbols-outlined text-icon-sm">chevron_left</span>
              上一章
            </button>
            <span className="font-mono text-label-sm text-on-surface-variant tabular-nums">
              {chapterIndex + 1}/{chapterTotal}
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
              <span className="material-symbols-outlined text-icon-sm">chevron_right</span>
            </button>
          </div>
        )}
        {/* 进度行：播报组（TTS+自动滚动）+ mono 百分比 + 滑杆 + 页码 */}
        <div className="flex items-center gap-3">
          <div
              className={cn(
                'flex items-center rounded-full p-1 gap-0.5 border transition-colors',
                broadcastActive
                  ? 'bg-primary/10 border-primary/40'
                  : 'bg-surface-container-high border-transparent'
              )}
              role="group"
              aria-label="播报"
            >
              {ttsSupported && (
                <button
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                    ttsActive
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-highest'
                  )}
                  onClick={onToggleTTS}
                  data-ui-control
                  aria-label={ttsActive ? '停止听书' : '开始听书'}
                  title="听书"
                >
                  <span className="material-symbols-outlined text-icon-md">volume_up</span>
                </button>
              )}
              <button
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                  isAutoScrolling
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                )}
                onClick={onToggleAutoScroll}
                data-ui-control
                aria-label={isAutoScrolling ? '停止自动滚动' : '开始自动滚动'}
                title="自动滚动"
              >
                <span className="material-symbols-outlined text-icon-md">
                  {isAutoScrolling ? 'pause' : 'play_arrow'}
                </span>
              </button>
          </div>
          <span className="font-mono text-label-sm text-on-surface-variant tabular-nums w-10 text-right">
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
          <span className="font-mono text-label-sm text-on-surface-variant">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};
