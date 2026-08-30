import React from 'react';

import type { Annotation } from '@/types';

interface AnnotationDetailModalProps {
  annotation: Annotation;
  onClose: () => void;
}

/** 批注详情弹窗（点击高亮批注时展示） */
export const AnnotationDetailModal: React.FC<AnnotationDetailModalProps> = ({
  annotation,
  onClose,
}) => (
  <div
    className="fixed inset-0 z-[65] flex items-center justify-center"
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-on-background/30" />
    <div
      className="relative bg-surface rounded-card-lg shadow-2xl border border-outline-variant/50 max-w-sm mx-4 p-5 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary text-[18px]">edit_note</span>
        <span className="font-label text-label-md text-primary">{annotation.chapterTitle}</span>
      </div>
      <div className="bg-secondary/10 rounded-lg px-3 py-2 mb-3">
        <p className="font-body text-body-sm text-on-surface opacity-70 italic line-clamp-3">
          "{annotation.selectedText}"
        </p>
      </div>
      <p className="font-body text-body-md text-on-surface mb-4">{annotation.note}</p>
      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    </div>
  </div>
);
