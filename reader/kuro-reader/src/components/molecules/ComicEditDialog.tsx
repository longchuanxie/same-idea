import React, { useState, useEffect } from 'react';

import type { Comic } from '@/types';

export interface ComicEditDialogProps {
  comic: Comic | null;
  isOpen: boolean;
  onSave: (id: string, updates: Partial<Pick<Comic, 'title' | 'author' | 'description' | 'status'>>) => void;
  onCancel: () => void;
}

export const ComicEditDialog: React.FC<ComicEditDialogProps> = ({
  comic,
  isOpen,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ongoing' | 'completed' | 'hiatus'>('ongoing');

  useEffect(() => {
    if (comic) {
      setTitle(comic.title);
      setAuthor(comic.author || '');
      setDescription(comic.description || '');
      setStatus(comic.status);
    }
  }, [comic]);

  if (!isOpen || !comic) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(comic.id, {
      title: title.trim(),
      author: author.trim() || undefined,
      description: description.trim() || undefined,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/40 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-surface-bright border border-outline-variant rounded-lg p-6 mx-margin-mobile max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-headline-md text-primary mb-4">编辑漫画信息</h3>

        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label className="font-label text-label-sm text-on-surface-variant mb-1 block">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="漫画标题"
              className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="font-label text-label-sm text-on-surface-variant mb-1 block">作者</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="作者名称"
              className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-label text-label-sm text-on-surface-variant mb-1 block">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="漫画描述"
              rows={3}
              className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="font-label text-label-sm text-on-surface-variant mb-2 block">状态</label>
            <div className="flex gap-3">
              <button
                className={`flex-1 py-2 px-4 rounded border font-label text-label-md transition-colors ${
                  status === 'ongoing'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                }`}
                onClick={() => setStatus('ongoing')}
              >
                连载中
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded border font-label text-label-md transition-colors ${
                  status === 'completed'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                }`}
                onClick={() => setStatus('completed')}
              >
                已完结
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            className="border border-outline-variant text-on-surface-variant font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="bg-primary text-on-primary font-label text-label-md px-6 py-2 rounded hover:opacity-90 transition-colors"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComicEditDialog;
