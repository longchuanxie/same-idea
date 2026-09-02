import React from 'react';

import { COPY } from '@/constants/copy';

interface LongPressActionMenuExtraAction {
  label: string;
  icon?: string;
  /** 禁用态（识别中） */
  disabled?: boolean;
  onSelect: (page: number) => void;
}

interface LongPressActionMenuProps {
  /** 触发长按的页索引（0 起），随动作回调透传 */
  page: number;
  onAddPageNote: (page: number) => void;
  onOpenReaderSettings: (page: number) => void;
  onClose: () => void;
  /** 场景扩展动作（如漫画 OCR 识别本页文字） */
  extraAction?: LongPressActionMenuExtraAction;
}

/** 漫画/PDF 长按页级动作菜单：页级手记 / 阅读设置（锚定触发页） */
export const LongPressActionMenu: React.FC<LongPressActionMenuProps> = ({
  page,
  onAddPageNote,
  onOpenReaderSettings,
  onClose,
  extraAction,
}) => (
  <div className="fixed inset-0 z-[46]" onClick={onClose}>
    <div className="absolute inset-0 bg-on-background/30 animate-fade-in" />
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface rounded-card-lg border border-outline-variant shadow-paper-up py-2 w-52 animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="w-full text-left px-5 py-3 font-label text-label-md text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
        onClick={() => onAddPageNote(page)}
        data-ui-control
      >
        <span className="material-symbols-outlined text-icon-md text-secondary">edit_note</span>
        {COPY.annotation.addPageNote}
      </button>
      {extraAction && (
        <button
          className="w-full text-left px-5 py-3 font-label text-label-md text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2 disabled:opacity-50"
          onClick={() => extraAction.onSelect(page)}
          disabled={extraAction.disabled}
          data-ui-control
        >
          <span className="material-symbols-outlined text-icon-md text-secondary">
            {extraAction.icon ?? 'add'}
          </span>
          {extraAction.label}
        </button>
      )}
      <button
        className="w-full text-left px-5 py-3 font-label text-label-md text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
        onClick={() => onOpenReaderSettings(page)}
        data-ui-control
      >
        <span className="material-symbols-outlined text-icon-md text-on-surface-variant">tune</span>
        {COPY.annotation.readerSettings}
      </button>
    </div>
  </div>
);
