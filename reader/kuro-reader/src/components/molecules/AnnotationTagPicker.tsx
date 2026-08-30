import React, { useState } from 'react';

import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Tag } from '@/types';
import { cn } from '@/utils/cn';

interface AnnotationTagPickerProps {
  selected: string[];
  /** 变更后的完整 tagIds 列表 */
  onChange: (tagIds: string[]) => void;
  /** 紧凑模式（弹窗内）隐藏新建输入 */
  allowCreate?: boolean;
}

/** 手记标签选择器：chips 多选 + 可选内联新建（复用书签标签体系 Tag） */
export const AnnotationTagPicker: React.FC<AnnotationTagPickerProps> = ({
  selected,
  onChange,
  allowCreate = false,
}) => {
  const tags = useLibraryStore((s) => s.tags);
  const createTag = useLibraryStore((s) => s.createTag);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const toggle = (tagId: string) => {
    onChange(
      selected.includes(tagId)
        ? selected.filter((id) => id !== tagId)
        : [...selected, tagId]
    );
  };

  const submitNew = async () => {
    const name = newName.trim();
    if (!name) return;
    const tag = await createTag(name);
    setNewName('');
    setCreating(false);
    onChange([...selected, tag.id]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag: Tag) => {
        const active = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggle(tag.id)}
            aria-pressed={active}
            className={cn(
              'px-2 py-0.5 rounded-full font-label text-label-xs border transition-colors',
              active
                ? 'bg-primary/20 text-primary border-primary/50'
                : 'text-on-surface-variant border-outline-variant hover:bg-surface-variant'
            )}
          >
            {tag.name}
          </button>
        );
      })}
      {allowCreate && !creating && (
        <button
          onClick={() => setCreating(true)}
          aria-label="新建标签"
          className="px-2 py-0.5 rounded-full font-label text-label-xs text-on-surface-variant border border-dashed border-outline-variant hover:bg-surface-variant transition-colors"
        >
          ＋
        </button>
      )}
      {allowCreate && creating && (
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={submitNew}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitNew();
            if (e.key === 'Escape') {
              setCreating(false);
              setNewName('');
            }
          }}
          placeholder="新标签名"
          autoFocus
          className="w-24 px-2 py-0.5 bg-surface-container-lowest border border-outline-variant/50 rounded-full font-label text-label-xs focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );
};
