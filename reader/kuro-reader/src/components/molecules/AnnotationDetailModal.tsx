import React, { useEffect, useState } from 'react';

import { COPY } from '@/constants/copy';
import type { Annotation, AnnotationStyle } from '@/types';

/** 批注编辑补丁：只携带变化字段，id 必填 */
export interface AnnotationEditPatch {
  id: string;
  note?: string;
  style?: AnnotationStyle;
}

interface AnnotationDetailModalProps {
  annotation: Annotation;
  /** 保存编辑（笔记可为空 = 转纯划线） */
  onEdit: (patch: AnnotationEditPatch) => void;
  /** 删除（调用方负责撤销 toast） */
  onDelete: (annotationId: string) => void;
  /** 回到批注原句处 */
  onNavigate: (annotation: Annotation) => void;
  onClose: () => void;
}

const STYLE_OPTIONS: AnnotationStyle[] = ['highlight', 'underline', 'wavy'];

/** 批注详情弹窗：查看 / 编辑 / 删除 / 回到原句 */
export const AnnotationDetailModal: React.FC<AnnotationDetailModalProps> = ({
  annotation,
  onEdit,
  onDelete,
  onNavigate,
  onClose,
}) => {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(annotation.note);
  const [style, setStyle] = useState<AnnotationStyle>(annotation.style ?? 'highlight');

  // 弹窗复用于不同批注时重置编辑态
  useEffect(() => {
    setEditing(false);
    setNote(annotation.note);
    setStyle(annotation.style ?? 'highlight');
  }, [annotation.id, annotation.note, annotation.style]);

  const saveEdit = () => {
    onEdit({ id: annotation.id, note: note.trim(), style });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-on-background/30" />
      <div
        className="relative bg-surface rounded-card-lg shadow-2xl border border-outline-variant/50 max-w-sm mx-4 p-5 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-secondary text-[18px]">edit_note</span>
          <span className="font-label text-label-md text-primary flex-1 truncate">{annotation.chapterTitle}</span>
          <span className="font-label text-label-xs text-on-surface-variant opacity-40 bg-surface-variant/50 px-1.5 py-0.5 rounded">
            {COPY.annotation.styleLabels[annotation.style ?? 'highlight']}
          </span>
        </div>

        <div className="bg-secondary/10 rounded-lg px-3 py-2 mb-3">
          <p className="font-body text-body-sm text-on-surface opacity-70 italic line-clamp-3">
            "{annotation.selectedText}"
          </p>
        </div>

        {editing ? (
          <div className="mb-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={COPY.annotation.notePlaceholder}
              className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-on-surface font-body text-body-sm resize-none focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-2">
              {STYLE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setStyle(option)}
                  className={`px-2 py-1 rounded-md font-label text-label-xs transition-colors ${
                    style === option
                      ? 'bg-primary/20 text-primary border border-primary/50'
                      : 'text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {COPY.annotation.styleLabels[option]}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                onClick={() => {
                  setEditing(false);
                  setNote(annotation.note);
                  setStyle(annotation.style ?? 'highlight');
                }}
              >
                {COPY.annotation.cancel}
              </button>
              <button
                className="px-4 py-1.5 rounded-lg font-label text-label-sm bg-primary text-on-primary hover:opacity-90 transition-opacity"
                onClick={saveEdit}
              >
                {COPY.annotation.save}
              </button>
            </div>
          </div>
        ) : (
          <>
            {annotation.note ? (
              <p className="font-body text-body-md text-on-surface mb-4">{annotation.note}</p>
            ) : (
              <p className="font-label text-label-xs text-on-surface-faint mb-4">{COPY.annotation.pureHighlight}</p>
            )}
            <div className="flex items-center justify-between gap-2">
              <button
                className="px-4 py-1.5 rounded-lg font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                onClick={() => {
                  setEditing(true);
                }}
              >
                {COPY.annotation.edit}
              </button>
              <div className="flex gap-2">
                <button
                  className="px-4 py-1.5 rounded-lg font-label text-label-sm text-error hover:bg-error/10 transition-colors"
                  onClick={() => {
                    onDelete(annotation.id);
                    onClose();
                  }}
                >
                  {COPY.annotation.remove}
                </button>
                <button
                  className="px-4 py-1.5 rounded-lg font-label text-label-sm bg-primary text-on-primary hover:opacity-90 transition-opacity"
                  onClick={() => {
                    onNavigate(annotation);
                    onClose();
                  }}
                >
                  {COPY.annotation.goTo}
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                className="px-4 py-1 rounded-lg font-label text-label-sm text-on-surface-faint hover:bg-surface-variant transition-colors"
                onClick={onClose}
              >
                {COPY.annotation.close}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
