import React, { useState, useRef, useEffect } from 'react';


export interface SubLibraryMenuProps {
  subLibraryId: string;
  subLibraryName: string;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export const SubLibraryMenu: React.FC<SubLibraryMenuProps> = ({
  subLibraryId,
  subLibraryName,
  onRename,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subLibraryName);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== subLibraryName) {
      onRename(subLibraryId, editName.trim());
    }
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete(subLibraryId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="子书库菜单"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 z-50 animate-fade-in">
          {isEditing ? (
            <div className="px-3 py-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-outline-variant rounded px-2 py-1 font-body text-body-sm text-on-background bg-surface focus:outline-none focus:border-primary mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditName(subLibraryName);
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-primary text-on-primary font-label text-label-sm py-1 rounded hover:opacity-90 transition-colors"
                  onClick={handleRename}
                >
                  保存
                </button>
                <button
                  className="flex-1 border border-outline-variant text-on-surface-variant font-label text-label-sm py-1 rounded hover:bg-surface-variant transition-colors"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(subLibraryName);
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                <span className="font-label text-label-md">重命名</span>
              </button>
              <div className="border-t border-outline-variant my-1" />
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors text-error hover:text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
                <span className="font-label text-label-md">删除</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SubLibraryMenu;
