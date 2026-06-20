import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { bookDetailPath } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { FormatBadge } from '@/components/atoms/FormatBadge';

const TAG_COLORS = [
  '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB',
  '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047',
  '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00',
  '#F4511E', '#6D4C41', '#757575', '#546E7A', '#78909C',
];

export const TagsPage: React.FC = () => {
  const navigate = useNavigate();
  const { tags, coverUrls, createTag, updateTag, deleteTag, getBooksByTag } = useLibraryStore();
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredBooks = selectedTagId ? getBooksByTag(selectedTagId) : [];

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    await createTag(name, newTagColor);
    setNewTagName('');
    setNewTagColor(TAG_COLORS[0]);
    setIsCreating(false);
  };

  const handleUpdateTag = async (tagId: string) => {
    const name = newTagName.trim();
    if (!name) return;
    await updateTag(tagId, { name, color: newTagColor });
    setEditingTagId(null);
    setNewTagName('');
  };

  const handleDeleteTag = async (tagId: string) => {
    if (confirm('确定要删除这个标签吗？关联的书籍将移除此标签。')) {
      await deleteTag(tagId);
      if (selectedTagId === tagId) setSelectedTagId(null);
    }
  };

  const startEditing = (tag: typeof tags[0]) => {
    setEditingTagId(tag.id);
    setNewTagName(tag.name);
    setNewTagColor(tag.color);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="relative z-10 w-full max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-16">
      <header className="mb-8">
        <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2">标签管理</h1>
        <p className="font-body text-body-md text-on-surface-variant">为书籍添加标签，快速分类和查找。</p>
      </header>

      <div className="mb-6">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full font-label text-label-md hover:opacity-90 transition-opacity"
          onClick={() => {
            setIsCreating(true);
            setEditingTagId(null);
            setNewTagName('');
            setNewTagColor(TAG_COLORS[0]);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          新建标签
        </button>
      </div>

      {(isCreating || editingTagId) && (
        <div className="bg-surface rounded-xl border border-outline-variant p-5 mb-6">
          <h3 className="font-label text-label-md text-on-surface mb-4">
            {editingTagId ? '编辑标签' : '新建标签'}
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-label text-label-sm text-on-surface-variant mb-1 block">标签名称</label>
              <input
                ref={inputRef}
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    editingTagId ? handleUpdateTag(editingTagId) : handleCreateTag();
                  }
                }}
                placeholder="输入标签名称"
                className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body text-body-md focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-label-sm text-on-surface-variant mb-2 block">选择颜色</label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full transition-transform hover:scale-110',
                      newTagColor === color && 'ring-2 ring-offset-2 ring-primary scale-110'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                    aria-label={`选择颜色 ${color}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg font-label text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors"
                onClick={() => {
                  setIsCreating(false);
                  setEditingTagId(null);
                }}
              >
                取消
              </button>
              <button
                className="px-4 py-2 rounded-lg font-label text-label-md bg-primary text-on-primary hover:opacity-90 transition-opacity disabled:opacity-40"
                onClick={() => {
                  editingTagId ? handleUpdateTag(editingTagId) : handleCreateTag();
                }}
                disabled={!newTagName.trim()}
              >
                {editingTagId ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tags.length === 0 && !isCreating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">label</span>
          <p className="font-body text-body-md text-on-surface-variant">还没有标签</p>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">点击上方按钮创建第一个标签</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className={cn(
              'bg-surface rounded-xl border border-outline-variant overflow-hidden transition-colors',
              selectedTagId === tag.id && 'border-primary bg-surface-container-lowest'
            )}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-label text-label-lg text-on-surface">{tag.name}</span>
                  <span className="font-label text-label-sm text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">
                    {tag.bookIds.length}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(tag);
                    }}
                    aria-label="编辑"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag.id);
                    }}
                    aria-label="删除"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                  <span className="material-symbols-outlined text-on-surface-variant ml-1">
                    {selectedTagId === tag.id ? 'expand_less' : 'expand_more'}
                  </span>
                </div>
              </div>
            </div>

            {selectedTagId === tag.id && (
              <div className="px-4 pb-4">
                {filteredBooks.length === 0 ? (
                  <p className="font-body text-body-sm text-on-surface-variant py-2">暂无关联书籍</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {filteredBooks.map((book) => (
                      <button
                        key={book.id}
                        className="flex flex-col items-center gap-2 group text-left"
                        onClick={() => navigate(bookDetailPath(book.id))}
                      >
                        <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-surface-container border border-outline-variant group-hover:border-primary transition-colors">
                          {coverUrls[book.id] ? (
                            <img
                              src={coverUrls[book.id]}
                              alt={book.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant">image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 w-full justify-center">
                          <FormatBadge format={book.format} />
                          <span className="font-label text-label-sm text-on-surface truncate text-center">
                            {book.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
