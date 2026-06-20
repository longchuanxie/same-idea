import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { ROUTES, bookDetailPath } from '@/constants/routes';
import { FormatBadge } from '@/components/atoms/FormatBadge';

export const SubLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { subLibraryId } = useParams<{ subLibraryId: string }>();
  const {
    books,
    subLibraries,
    coverUrls,
    readingProgress,
    loadBooks,
    renameSubLibrary,
    deleteSubLibrary,
    removeBooksFromSubLibrary,
    batchDelete,
    batchMarkAsRead,
  } = useLibraryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (books.length === 0) {
      loadBooks();
    }
  }, [books.length, loadBooks]);

  const subLibrary = subLibraries.find((s) => s.id === subLibraryId);
  const subLibBooks = subLibrary
    ? subLibrary.bookIds
        .map((id) => books.find((b) => b.id === id))
        .filter((b): b is NonNullable<typeof b> => b !== undefined)
    : [];

  const enterEditMode = useCallback(() => {
    if (!subLibrary) return;
    setEditName(subLibrary.name);
    setIsEditing(true);
  }, [subLibrary]);

  const handleRename = useCallback(async () => {
    if (!subLibraryId || !editName.trim()) return;
    await renameSubLibrary(subLibraryId, editName.trim());
    setIsEditing(false);
  }, [subLibraryId, editName, renameSubLibrary]);

  const handleDeleteSubLibrary = useCallback(async () => {
    if (!subLibraryId) return;
    await deleteSubLibrary(subLibraryId);
    navigate(ROUTES.LIBRARY);
  }, [subLibraryId, deleteSubLibrary, navigate]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === subLibBooks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(subLibBooks.map((b) => b.id)));
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDelete(Array.from(selectedIds));
    if (subLibraryId) {
      await removeBooksFromSubLibrary(subLibraryId, Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    if (subLibBooks.length <= selectedIds.size) {
      setIsSelectMode(false);
    }
  };

  const handleBatchMarkAsRead = () => {
    if (selectedIds.size === 0) return;
    batchMarkAsRead(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleRemoveFromSubLib = async () => {
    if (selectedIds.size === 0 || !subLibraryId) return;
    await removeBooksFromSubLibrary(subLibraryId, Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBookClick = useCallback((bookId: string) => {
    if (isSelectMode) {
      toggleSelect(bookId);
    } else {
      navigate(bookDetailPath(bookId));
    }
  }, [isSelectMode, navigate]);

  if (!subLibrary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">folder_off</span>
          <p className="font-body text-body-md text-on-surface-variant">未找到该子书库</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors"
            onClick={() => navigate(ROUTES.LIBRARY)}
          >
            返回书架
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-texture min-h-screen pb-0">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-outline-variant flex justify-between items-center w-full px-margin-mobile py-unit h-16 max-w-max-width-content mx-auto pt-safe">
        <button
          aria-label="返回"
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          onClick={() => navigate(ROUTES.LIBRARY)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        {isEditing ? (
          <div className="flex-1 mx-4 flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 border border-outline-variant rounded px-3 py-1 font-display text-headline-md text-on-background bg-surface focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <button
              className="text-primary font-label text-label-md"
              onClick={handleRename}
            >
              保存
            </button>
          </div>
        ) : (
          <h1 className="font-display text-headline-md text-primary truncate max-w-[60%] text-center">
            {subLibrary.name}
          </h1>
        )}
        <button
          aria-label="编辑分组"
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          onClick={isEditing ? handleRename : enterEditMode}
        >
          <span className="material-symbols-outlined">{isEditing ? 'check' : 'edit'}</span>
        </button>
      </header>

      <main className="relative z-10 max-w-max-width-content mx-auto px-margin-mobile pt-8 pb-32">
        <div className="mb-8 flex items-center justify-between">
          <p className="font-label text-label-sm text-on-surface-variant uppercase tracking-widest">
            {subLibBooks.length} 本藏书
          </p>
          {!isSelectMode && (
            <div className="flex gap-2">
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => setIsSelectMode(true)}
              >
                <span className="material-symbols-outlined text-lg">checklist</span>
                管理
              </button>
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
                onClick={() => setShowDeleteDialog(true)}
              >
                <span className="material-symbols-outlined text-lg">delete</span>
                删除书库
              </button>
            </div>
          )}
          {isSelectMode && (
            <div className="flex items-center gap-3">
              <button
                className="font-label text-label-md text-primary hover:opacity-80 transition-opacity"
                onClick={selectAll}
              >
                全选
              </button>
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
                onClick={exitSelectMode}
              >
                取消
              </button>
            </div>
          )}
        </div>

        {subLibBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">folder_open</span>
            <p className="font-body text-body-md text-on-surface-variant mb-6">此子书库暂无书籍</p>
            <button
              className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors"
              onClick={() => navigate(ROUTES.LIBRARY)}
            >
              去书架添加
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-gutter gap-y-8">
            {subLibBooks.map((book) => {
              const isSelected = selectedIds.has(book.id);
              const progress = readingProgress[book.id];
              const pct = progress ? Math.round(progress.percentage) : 0;

              return (
                <article
                  key={book.id}
                  className="flex flex-col gap-3 group cursor-pointer relative"
                  onClick={() => handleBookClick(book.id)}
                >
                  {isSelectMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        className={`w-6 h-6 rounded grid place-content-center border transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'bg-surface-bright/80 border-outline'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-3.5 h-3.5" style={{
                            clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
                            backgroundColor: 'white',
                          }} />
                        )}
                      </div>
                    </div>
                  )}
                  <div className={`w-full aspect-[2/3] border bg-surface-container-lowest relative overflow-hidden rounded-sm ${
                    isSelectMode && isSelected ? 'border-primary' : 'border-outline-variant'
                  }`}>
                    {coverUrls[book.id] ? (
                      <img
                        src={coverUrls[book.id]}
                        alt={book.title}
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-5xl">auto_stories</span>
                      </div>
                    )}
                    {pct > 0 && pct < 100 && (
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-surface-variant">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    {pct >= 100 && (
                      <div className="absolute top-2 right-2 bg-background/90 px-2 py-0.5 border border-outline-variant rounded font-label text-[10px] text-primary">
                        已读完
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <FormatBadge format={book.format} />
                      <h3 className="font-label text-label-md text-on-background line-clamp-1 group-hover:underline decoration-1 underline-offset-4">
                        {book.title}
                      </h3>
                    </div>
                    <p className="font-label text-label-sm text-on-surface-variant mt-1">
                      {pct > 0 ? `${pct}% 读完` : '未开始'}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {isSelectMode && (
        <div className="fixed bottom-gutter left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-surface-container-highest border border-outline-variant rounded-full z-50 flex justify-around items-center p-2 gap-2">
          <button
            className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group ${
              selectedIds.size > 0 ? 'text-on-surface-variant hover:bg-surface-dim' : 'text-on-surface-variant/40 cursor-not-allowed'
            }`}
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0}
          >
            <span className="material-symbols-outlined group-hover:text-primary mb-1">delete</span>
            <span className="font-label text-label-sm group-hover:text-primary">删除</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group border-l border-outline-variant/50 pl-6 ${
              selectedIds.size > 0 ? 'text-on-surface-variant hover:bg-surface-dim' : 'text-on-surface-variant/40 cursor-not-allowed'
            }`}
            onClick={handleBatchMarkAsRead}
            disabled={selectedIds.size === 0}
          >
            <span className="material-symbols-outlined group-hover:text-primary mb-1">done_all</span>
            <span className="font-label text-label-sm group-hover:text-primary">标为已读</span>
          </button>
          <button
            className={`flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group border-l border-outline-variant/50 pl-6 ${
              selectedIds.size > 0 ? 'text-on-surface-variant hover:bg-surface-dim' : 'text-on-surface-variant/40 cursor-not-allowed'
            }`}
            onClick={handleRemoveFromSubLib}
            disabled={selectedIds.size === 0}
          >
            <span className="material-symbols-outlined group-hover:text-primary mb-1">folder_off</span>
            <span className="font-label text-label-sm group-hover:text-primary">移出</span>
          </button>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40">
          <div className="bg-surface-bright border border-outline-variant rounded-lg p-6 mx-margin-mobile max-w-md w-full">
            <h3 className="font-display text-headline-md text-primary mb-2">删除子书库</h3>
            <p className="font-body text-body-md text-on-surface-variant mb-6">
              确定要删除「{subLibrary.name}」吗？子书库中的漫画不会被删除，仅移除分组关系。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="border border-outline-variant text-on-surface-variant font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                onClick={() => setShowDeleteDialog(false)}
              >
                取消
              </button>
              <button
                className="bg-error text-on-error font-label text-label-md px-6 py-2 rounded hover:opacity-90 transition-colors"
                onClick={handleDeleteSubLibrary}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
