import React, { useState } from 'react';
import type { Annotation, AnnotationStyle } from '@/types';
import { cn } from '@/utils/cn';

interface AnnotationListProps {
  annotations: Annotation[];
  onEdit: (annotation: Annotation) => void;
  onDelete: (annotationId: string) => void;
  onNavigate: (annotation: Annotation) => void;
  onClose: () => void;
}

export const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  onEdit,
  onDelete,
  onNavigate,
  onClose,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hours}:${mins}`;
  };

  const startEdit = (ann: Annotation) => {
    setEditingId(ann.id);
    setEditNote(ann.note);
    setSwipedId(null);
  };

  const saveEdit = (annId: string) => {
    if (editNote.trim()) {
      onEdit({ id: annId, note: editNote.trim() } as Annotation);
    }
    setEditingId(null);
    setEditNote('');
  };

  // 获取样式图标和标签
  const getStyleInfo = (style?: AnnotationStyle) => {
    switch (style) {
      case 'underline':
        return { icon: 'format_underlined', label: '下划线' };
      case 'wavy':
        return { icon: 'wave', label: '波浪线' };
      case 'highlight':
      default:
        return { icon: 'format_color_fill', label: '背景色' };
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative bg-surface rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up shadow-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/50">
          <h3 className="font-display text-headline-sm text-primary">批注</h3>
          <div className="flex items-center gap-2">
            <span className="font-label text-label-sm text-on-surface-variant opacity-60">
              {annotations.length} 条
            </span>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {annotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-5xl opacity-40">edit_note</span>
              <p className="font-body text-body-md text-on-surface-variant opacity-60">暂无批注</p>
              <p className="font-label text-label-sm text-on-surface-variant opacity-40">选中文本后可添加批注</p>
            </div>
          ) : (
            <div className="py-2">
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  className="relative overflow-hidden mx-3 my-1 rounded-xl"
                  onTouchStart={() => setSwipedId(ann.id)}
                >
                  {/* 删除按钮 */}
                  <div className="absolute right-0 top-0 bottom-0 w-20 bg-error flex items-center justify-center rounded-r-xl">
                    <button
                      className="w-full h-full flex items-center justify-center"
                      onClick={() => {
                        onDelete(ann.id);
                        setSwipedId(null);
                      }}
                    >
                      <span className="material-symbols-outlined text-on-error text-[20px]">delete</span>
                    </button>
                  </div>

                  {/* 内容 */}
                  <div
                    className={cn(
                      'bg-surface-container-low px-4 py-3 rounded-xl transition-transform duration-200 cursor-pointer',
                      swipedId === ann.id ? '-translate-x-20' : 'translate-x-0'
                    )}
                    onClick={() => {
                      if (swipedId === ann.id) {
                        setSwipedId(null);
                        return;
                      }
                      onNavigate(ann);
                    }}
                  >
                    {/* 章节标题 + 时间 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-secondary text-[14px]">{getStyleInfo(ann.style).icon}</span>
                      <span className="font-label text-label-md text-primary truncate flex-1">
                        {ann.chapterTitle}
                      </span>
                      <span className="font-label text-label-xs text-on-surface-variant opacity-40 bg-surface-variant/50 px-1.5 py-0.5 rounded">
                        {getStyleInfo(ann.style).label}
                      </span>
                      <span className="font-label text-label-sm text-on-surface-variant opacity-40">
                        {formatTime(ann.updatedAt)}
                      </span>
                    </div>

                    {/* 选中文本 */}
                    <div className="bg-secondary/10 rounded-lg px-3 py-2 mb-2">
                      <p className="font-body text-body-sm text-on-surface opacity-70 line-clamp-2 italic">
                        "{ann.selectedText.length > 100 ? ann.selectedText.slice(0, 100) + '...' : ann.selectedText}"
                      </p>
                    </div>

                    {/* 批注内容 */}
                    {editingId === ann.id ? (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-on-surface font-body text-body-sm resize-none focus:outline-none focus:border-primary"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            className="px-3 py-1 rounded font-label text-label-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                            onClick={() => { setEditingId(null); setEditNote(''); }}
                          >
                            取消
                          </button>
                          <button
                            className="px-3 py-1 rounded font-label text-label-sm bg-primary text-on-primary hover:opacity-90 transition-opacity"
                            onClick={() => saveEdit(ann.id)}
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-body text-body-sm text-on-surface flex-1">
                          {ann.note}
                        </p>
                        <button
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(ann);
                          }}
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-[14px]">edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
