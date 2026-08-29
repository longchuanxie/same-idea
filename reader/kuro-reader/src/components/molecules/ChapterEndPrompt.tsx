import React from 'react';

interface ChapterEndPromptProps {
  title: string;
  actionLabel: string;
  onNext: () => void;
}

/** 滚动到章节末尾时的「已读完本章」提示条 */
export const ChapterEndPrompt: React.FC<ChapterEndPromptProps> = ({
  title,
  actionLabel,
  onNext,
}) => (
  <div className="fixed inset-x-0 bottom-40 z-40 px-margin-mobile pointer-events-none">
    <div className="max-w-max-width-content mx-auto flex items-center justify-between gap-3 rounded-full bg-surface/90 backdrop-blur-md border border-outline-variant/60 shadow-lg px-4 py-3 pointer-events-auto">
      <span className="font-label text-label-sm text-on-surface-variant">{title}</span>
      <button
        className="px-4 py-2 rounded-full bg-primary text-on-primary font-label text-label-sm hover:opacity-90 transition-opacity"
        onClick={onNext}
        data-ui-control
      >
        {actionLabel}
      </button>
    </div>
  </div>
);
