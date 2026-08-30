import React, { useState, useRef, useEffect } from 'react';

import { COPY } from '@/constants/copy';

import type { AnnotationStyle } from '../../types';


const POPUP_EDGE_MARGIN_PX = 16;
const POPUP_VERTICAL_OFFSET_PX = 8;
const VIEWPORT_EDGE_MARGIN_PX = 8;
const MAX_SELECTED_TEXT_CHARS = 150;
interface AnnotationPopupProps {
  selectedText: string;
  position: { x: number; y: number } | null;
  /** 笔记可为空——空笔记即纯划线 */
  onSave: (note: string, style: AnnotationStyle) => void;
  onCancel: () => void;
}

export const AnnotationPopup: React.FC<AnnotationPopupProps> = ({
  selectedText,
  position,
  onSave,
  onCancel,
}) => {
  const [note, setNote] = useState('');
  const [style, setStyle] = useState<AnnotationStyle>('highlight');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    onSave(note.trim(), style);
  };

  if (!position) return null;

  // 计算弹出位置，避免超出视口
  const popupWidth = 320;
  const popupMaxHeight = 280;
  const left = Math.min(position.x, window.innerWidth - popupWidth - POPUP_EDGE_MARGIN_PX);
  const top = position.y + POPUP_VERTICAL_OFFSET_PX;

  return (
    <div className="fixed inset-0 z-[70]" onClick={onCancel}>
      <div
        className="absolute bg-surface rounded-card-lg shadow-2xl border border-outline-variant/50 overflow-hidden animate-fade-in"
        style={{
          left: Math.max(VIEWPORT_EDGE_MARGIN_PX, left),
          top: Math.min(top, window.innerHeight - popupMaxHeight - POPUP_EDGE_MARGIN_PX),
          width: popupWidth,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 选中文本预览 */}
        <div className="px-4 py-3 bg-primary/10 border-b border-outline-variant/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[14px]">format_quote</span>
            <span className="font-label text-label-sm text-primary">选中文本</span>
          </div>
          <p className="font-body text-body-sm text-on-surface line-clamp-3 pl-5 opacity-80">
            {selectedText.length > MAX_SELECTED_TEXT_CHARS ? selectedText.slice(0, MAX_SELECTED_TEXT_CHARS) + '...' : selectedText}
          </p>
        </div>

        {/* 样式选择器 */}
        <div className="px-4 py-2 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="font-label text-label-xs text-on-surface-variant">样式：</span>
            <button
              onClick={() => setStyle('highlight')}
              className={`px-2 py-1 rounded-md font-label text-label-xs transition-colors ${
                style === 'highlight'
                  ? 'bg-primary/20 text-primary border border-primary/50'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="annotation-marker annotation-marker-v1">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">brush</span>
                水彩笔
              </span>
            </button>
            <button
              onClick={() => setStyle('underline')}
              className={`px-2 py-1 rounded-md font-label text-label-xs transition-colors ${
                style === 'underline'
                  ? 'bg-primary/20 text-primary border border-primary/50'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">format_underlined</span>
              下划线
            </button>
            <button
              onClick={() => setStyle('wavy')}
              className={`px-2 py-1 rounded-md font-label text-label-xs transition-colors ${
                style === 'wavy'
                  ? 'bg-primary/20 text-primary border border-primary/50'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] align-middle mr-1">wave</span>
              波浪线
            </button>
          </div>
        </div>

        {/* 批注输入 */}
        <div className="px-4 py-3">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={COPY.annotation.notePlaceholder}
            rows={3}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-on-surface font-body text-body-sm resize-none focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 px-4 pb-3">
          <button
            className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="px-4 py-1.5 rounded-lg font-label text-label-sm bg-primary text-on-primary hover:opacity-90 transition-opacity"
            onClick={handleSave}
          >
            {note.trim() ? COPY.annotation.saveNote : COPY.annotation.saveHighlightOnly}
          </button>
        </div>
      </div>
    </div>
  );
};
