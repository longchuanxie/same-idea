import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { BookEditDialog } from '@/components/molecules/BookEditDialog';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { SubLibraryMenu } from '@/components/molecules/SubLibraryMenu';
import { ROUTES, bookDetailPath, subLibraryPath } from '@/constants/routes';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { cn } from '@/utils/cn';
import { FormatBadge } from '@/components/atoms/FormatBadge';
import type { Book } from '@/types';


export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    books,
    subLibraries,
    tags,
    coverUrls,
    isLoading,
    loadBooks,
    removeBook,
    batchDelete,
    batchMarkAsRead,
    toggleFavorite,
    updateBook,
    createSubLibrary,
    addBooksToSubLibrary,
    renameSubLibrary,
    deleteSubLibrary,
    batchDeleteSubLibraries,
    getBooksByTag,
  } = useLibraryStore();

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedSubLibIds, setSelectedSubLibIds] = useState<Set<string>>(new Set());
  const [showNewSubLibDialog, setShowNewSubLibDialog] = useState(false);
  const [showAddToSubLibDialog, setShowAddToSubLibDialog] = useState(false);
  const [newSubLibName, setNewSubLibName] = useState('');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'addedAt' | 'lastReadAt'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'default';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    if (location.state?.selectMode) {
      setIsSelectMode(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const subLibraryBookIds = new Set(subLibraries.flatMap((sl) => sl.bookIds));

  const displayedBooks = (() => {
    let result = activeTagId ? getBooksByTag(activeTagId) : books;
    result = result.filter((b) => !subLibraryBookIds.has(b.id));
    if (showFavoritesOnly) {
      result = result.filter((b) => b.isFavorite);
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'title':
          cmp = a.title.localeCompare(b.title, 'zh');
          break;
        case 'addedAt':
          cmp = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'lastReadAt': {
          const aTime = a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0;
          const bTime = b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  })();

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const allBookIds = new Set(displayedBooks.map((b) => b.id));
    const allSubLibIds = new Set(subLibraries.map((sl) => sl.id));
    const allSelected =
      selectedIds.size === displayedBooks.length &&
      displayedBooks.length > 0 &&
      selectedSubLibIds.size === subLibraries.length &&
      subLibraries.length > 0;

    if (allSelected) {
      setSelectedIds(new Set());
      setSelectedSubLibIds(new Set());
    } else {
      setSelectedIds(allBookIds);
      setSelectedSubLibIds(allSubLibIds);
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
    setSelectedSubLibIds(new Set());
  };

  const openConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: 'danger' | 'default'
  ) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, variant });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSingleDelete = (bookId: string, bookTitle: string) => {
    openConfirm(
      '删除书籍',
      `确定要删除《${bookTitle}》吗？此操作不可恢复。`,
      async () => {
        await removeBook(bookId);
        closeConfirm();
      },
      'danger'
    );
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    openConfirm(
      '批量删除',
      `确定要删除选中的 ${selectedIds.size} 本书籍吗？此操作不可恢复。`,
      async () => {
        await batchDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
        if (books.length <= selectedIds.size) {
          setIsSelectMode(false);
        }
        closeConfirm();
      },
      'danger'
    );
  };

  const handleBatchMarkAsRead = () => {
    if (selectedIds.size === 0) return;
    batchMarkAsRead(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleToggleFavorite = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(bookId);
  };

  const handleEditBook = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBook(book);
    setShowEditDialog(true);
  };

  const handleSaveBook = async (
    id: string,
    updates: Partial<Pick<Book, 'title' | 'author' | 'description' | 'status'>>
  ) => {
    await updateBook(id, updates);
    setShowEditDialog(false);
    setEditingBook(null);
  };

  const handleCreateSubLibrary = useCallback(async () => {
    if (!newSubLibName.trim()) return;
    await createSubLibrary(newSubLibName.trim(), Array.from(selectedIds));
    setShowNewSubLibDialog(false);
    setNewSubLibName('');
    exitSelectMode();
  }, [newSubLibName, selectedIds, createSubLibrary]);

  const handleAddToSubLibrary = useCallback(async (subLibraryId: string) => {
    if (selectedIds.size === 0) return;
    await addBooksToSubLibrary(subLibraryId, Array.from(selectedIds));
    setShowAddToSubLibDialog(false);
    exitSelectMode();
  }, [selectedIds, addBooksToSubLibrary]);

  const handleCreateEmptySubLibrary = useCallback(async () => {
    if (!newSubLibName.trim()) return;
    await createSubLibrary(newSubLibName.trim());
    setShowNewSubLibDialog(false);
    setNewSubLibName('');
  }, [newSubLibName, createSubLibrary]);

  const handleRenameSubLibrary = async (id: string, name: string) => {
    await renameSubLibrary(id, name);
  };

  const handleDeleteSubLibrary = (id: string, name: string) => {
    openConfirm(
      '删除子书库',
      `确定要删除子书库「${name}」吗？其中的书籍不会被删除。`,
      async () => {
        await deleteSubLibrary(id);
        closeConfirm();
      },
      'danger'
    );
  };

  const toggleSubLibSelect = (id: string) => {
    setSelectedSubLibIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchDeleteSubLibraries = () => {
    if (selectedSubLibIds.size === 0) return;
    const selectedSubLibs = subLibraries.filter((sl) => selectedSubLibIds.has(sl.id));
    const totalBooks = selectedSubLibs.reduce((sum, sl) => sum + sl.bookIds.length, 0);
    const names = selectedSubLibs.map((sl) => `「${sl.name}」`).join('、');

    openConfirm(
      '移除子书库',
      `确定要移除${names}共 ${selectedSubLibIds.size} 个子书库及其中的 ${totalBooks} 本书籍吗？此操作不可恢复。`,
      async () => {
        await batchDeleteSubLibraries(Array.from(selectedSubLibIds), true);
        setSelectedSubLibIds(new Set());
        if (selectedIds.size === 0 && selectedSubLibIds.size <= 1) {
          setIsSelectMode(false);
        }
        closeConfirm();
      },
      'danger'
    );
  };

  const handleBookClick = useCallback((bookId: string) => {
    if (isSelectMode) {
      toggleSelect(bookId);
    } else {
      navigate(bookDetailPath(bookId));
    }
  }, [isSelectMode, navigate]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="font-body text-body-md text-on-surface-variant">加载中...</p>
        </div>
      </div>
    );
  }

  if (books.length === 0 && subLibraries.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center px-margin-mobile max-w-max-width-content mx-auto w-full min-h-[60vh]">
        <div className="flex flex-col items-center text-center max-w-md w-full">
          <div className="w-64 h-64 mb-8 opacity-80 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: '120px' }}>
              auto_stories
            </span>
          </div>
          <h2 className="font-display text-headline-md text-primary mb-4 tracking-tight">书架空空如也</h2>
          <p className="font-body text-body-md text-on-surface-variant mb-12">
            开启你的第一次沉浸阅读，从导入书籍开始。
          </p>
          <div className="flex flex-col w-full gap-4">
            <button
              className="w-full bg-primary text-on-primary font-label text-label-md py-4 px-6 rounded hover:opacity-90 transition-colors"
              onClick={() => navigate(ROUTES.IMPORT)}
            >
              立即导入
            </button>
            <button
              className="w-full bg-transparent text-primary font-label text-label-md py-4 px-6 rounded hover:bg-surface-container transition-colors border border-outline-variant"
              onClick={() => navigate(ROUTES.SEARCH)}
            >
              去搜索发现
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-16">
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-headline-md text-primary">我的书架</h2>
          {isSelectMode && (
            <span className="font-label text-label-sm text-on-surface-variant">
              已选 {selectedIds.size + selectedSubLibIds.size} 项
            </span>
          )}
        </div>
        {isSelectMode ? (
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
        ) : (
          <div className="flex items-center gap-3">
            <span className="font-label text-label-sm text-on-surface-variant">{displayedBooks.length} 本</span>
            <div className="relative">
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span className="material-symbols-outlined text-lg">sort</span>
                排序
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 bg-surface-bright border border-outline-variant rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden animate-scale-in">
                  <button
                    className={cn(
                      'w-full text-left px-4 py-2.5 font-label text-label-md hover:bg-surface-container transition-colors flex items-center gap-2',
                      sortBy === 'addedAt' ? 'text-primary' : 'text-on-surface-variant'
                    )}
                    onClick={() => { setSortBy('addedAt'); setShowSortMenu(false); }}
                  >
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    添加时间
                    {sortBy === 'addedAt' && <span className="material-symbols-outlined text-sm ml-auto">{sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>}
                  </button>
                  <button
                    className={cn(
                      'w-full text-left px-4 py-2.5 font-label text-label-md hover:bg-surface-container transition-colors flex items-center gap-2',
                      sortBy === 'lastReadAt' ? 'text-primary' : 'text-on-surface-variant'
                    )}
                    onClick={() => { setSortBy('lastReadAt'); setShowSortMenu(false); }}
                  >
                    <span className="material-symbols-outlined text-lg">auto_stories</span>
                    最近阅读
                    {sortBy === 'lastReadAt' && <span className="material-symbols-outlined text-sm ml-auto">{sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>}
                  </button>
                  <button
                    className={cn(
                      'w-full text-left px-4 py-2.5 font-label text-label-md hover:bg-surface-container transition-colors flex items-center gap-2',
                      sortBy === 'title' ? 'text-primary' : 'text-on-surface-variant'
                    )}
                    onClick={() => { setSortBy('title'); setShowSortMenu(false); }}
                  >
                    <span className="material-symbols-outlined text-lg">title</span>
                    标题
                    {sortBy === 'title' && <span className="material-symbols-outlined text-sm ml-auto">{sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}</span>}
                  </button>
                  <div className="border-t border-outline-variant" />
                  <button
                    className="w-full text-left px-4 py-2.5 font-label text-label-md text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-2"
                    onClick={() => { setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setShowSortMenu(false); }}
                  >
                    <span className="material-symbols-outlined text-lg">{sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>
                    {sortOrder === 'asc' ? '升序' : '降序'}
                  </button>
                </div>
              )}
            </div>
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => setIsSelectMode(true)}
            >
              <span className="material-symbols-outlined text-lg">checklist</span>
              管理
            </button>
          </div>
        )}
      </div>

      {subLibraries.length > 0 && (
        <section className="mb-8">
          <h3 className="font-label text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">子书库</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {subLibraries.map((subLib) => {
              const isSubLibSelected = selectedSubLibIds.has(subLib.id);
              return (
              <article
                key={subLib.id}
                className="group cursor-pointer flex flex-col relative"
                onClick={() => {
                  if (isSelectMode) {
                    toggleSubLibSelect(subLib.id);
                  } else {
                    navigate(subLibraryPath(subLib.id));
                  }
                }}
              >
                {isSelectMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <div
                      className={`w-6 h-6 rounded grid place-content-center border transition-colors ${
                        isSubLibSelected ? 'bg-primary border-primary' : 'bg-surface-bright/80 border-outline'
                      }`}
                    >
                      {isSubLibSelected && (
                        <div className="w-3.5 h-3.5" style={{
                          clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
                          backgroundColor: 'white',
                        }} />
                      )}
                    </div>
                  </div>
                )}
                {!isSelectMode && (
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <SubLibraryMenu
                    subLibraryId={subLib.id}
                    subLibraryName={subLib.name}
                    onRename={handleRenameSubLibrary}
                    onDelete={(id) => handleDeleteSubLibrary(id, subLib.name)}
                  />
                </div>
                )}
                <div className={`border bg-surface-container aspect-[2/3] overflow-hidden mb-3 relative ${
                  isSelectMode && isSubLibSelected ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {isSelectMode && isSubLibSelected && <div className="absolute inset-0 bg-primary/5 mix-blend-multiply z-0" />}
                  {subLib.bookIds.length > 0 && coverUrls[subLib.bookIds[0]] ? (
                    <img
                      src={coverUrls[subLib.bookIds[0]]}
                      alt={subLib.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-5xl">folder</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/80 to-transparent p-3">
                    <p className="font-label text-label-sm text-on-primary">{subLib.bookIds.length} 本</p>
                  </div>
                </div>
                <h4 className="font-body text-body-lg text-primary leading-tight truncate">{subLib.name}</h4>
              </article>
              );
            })}
            {!isSelectMode && (
            <article
              className="group cursor-pointer flex flex-col"
              onClick={() => {
                setNewSubLibName('');
                setShowNewSubLibDialog(true);
              }}
            >
              <div className="border border-dashed border-outline-variant bg-surface-container-low aspect-[2/3] overflow-hidden mb-3 flex flex-col items-center justify-center hover:bg-surface-container transition-colors">
                <div className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center mb-3 bg-background group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-primary">add</span>
                </div>
                <span className="font-label text-label-md text-on-surface-variant group-hover:text-primary transition-colors">新建子书库</span>
              </div>
              <h4 className="font-body text-body-lg text-on-surface-variant leading-tight">&nbsp;</h4>
            </article>
            )}
          </div>
        </section>
      )}

      {(tags.length > 0 || books.some((b) => b.isFavorite)) && !isSelectMode && (
        <section className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={cn(
                'px-3 py-1.5 rounded-full font-label text-label-sm whitespace-nowrap transition-colors border',
                activeTagId === null && !showFavoritesOnly
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
              )}
              onClick={() => {
                setActiveTagId(null);
                setShowFavoritesOnly(false);
              }}
            >
              全部
            </button>
            {books.some((b) => b.isFavorite) && (
              <button
                className={cn(
                  'px-3 py-1.5 rounded-full font-label text-label-sm whitespace-nowrap transition-colors border flex items-center gap-1',
                  showFavoritesOnly
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
                )}
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  if (!showFavoritesOnly) setActiveTagId(null);
                }}
              >
                <span className="material-symbols-outlined text-[14px]" style={showFavoritesOnly ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
                收藏
              </button>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={cn(
                  'px-3 py-1.5 rounded-full font-label text-label-sm whitespace-nowrap transition-all border',
                  activeTagId === tag.id
                    ? 'text-white border-transparent'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
                )}
                style={activeTagId === tag.id ? { backgroundColor: tag.color } : undefined}
                onClick={() => {
                  setActiveTagId(activeTagId === tag.id ? null : tag.id);
                  setShowFavoritesOnly(false);
                }}
              >
                {tag.name}
                <span className="ml-1 opacity-70">{tag.bookIds.length}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {subLibraries.length === 0 && !isSelectMode && books.length > 0 && (
        <div className="mb-6">
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 border border-outline-variant rounded-full px-4 py-2"
            onClick={() => {
              setNewSubLibName('');
              setShowNewSubLibDialog(true);
            }}
          >
            <span className="material-symbols-outlined text-lg">create_new_folder</span>
            新建子书库
          </button>
        </div>
      )}

      {displayedBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {displayedBooks.map((book) => {
          const isSelected = selectedIds.has(book.id);
          return (
            <article
              key={book.id}
              className="group cursor-pointer flex flex-col relative"
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

              {!isSelectMode && (
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className={`w-8 h-8 rounded-full bg-surface-bright/90 backdrop-blur-sm flex items-center justify-center ${book.isFavorite ? 'text-primary' : 'text-on-surface-variant'} hover:text-primary shadow-sm transition-colors`}
                    onClick={(e) => handleToggleFavorite(book.id, e)}
                    aria-label={book.isFavorite ? '取消收藏' : '收藏'}
                  >
                    <span className="material-symbols-outlined text-[18px]" style={book.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {book.isFavorite ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                  <button
                    className="w-8 h-8 rounded-full bg-surface-bright/90 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-primary shadow-sm transition-colors"
                    onClick={(e) => handleEditBook(book, e)}
                    aria-label="编辑"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    className="w-8 h-8 rounded-full bg-surface-bright/90 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-error shadow-sm transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSingleDelete(book.id, book.title);
                    }}
                    aria-label="删除"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}

              <div className={`border bg-surface-container aspect-[2/3] overflow-hidden mb-3 relative ${
                isSelectMode && isSelected ? 'border-primary' : 'border-outline-variant'
              }`}>
                {isSelectMode && isSelected && <div className="absolute inset-0 bg-primary/5 mix-blend-multiply z-0" />}
                {coverUrls[book.id] ? (
                  <img
                    src={coverUrls[book.id]}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-5xl">auto_stories</span>
                  </div>
                )}
                {book.isFavorite && !isSelectMode && (
                  <div className="absolute bottom-2 left-2">
                    <span className="material-symbols-outlined text-primary text-[20px] drop-shadow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <FormatBadge format={book.format} />
                <h4 className={`font-body text-body-lg leading-tight truncate ${
                  isSelectMode && isSelected ? 'text-primary' : 'text-primary'
                }`}>{book.title}</h4>
              </div>
              <p className="font-label text-label-md text-on-surface-variant mt-1">
                {book.author || (book.status === 'completed' ? '已完结' : `${book.totalChapters} 话`)}
              </p>
            </article>
          );
        })}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">auto_stories</span>
          <p className="font-body text-body-md text-on-surface-variant mb-6">主书架暂无书籍</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors"
            onClick={() => navigate(ROUTES.IMPORT)}
          >
            去导入
          </button>
        </div>
      )}

      {isSelectMode && (
        <div className="fixed bottom-gutter md:bottom-gutter left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-surface-container-highest border border-outline-variant rounded-full z-50 flex justify-around items-center p-2 gap-2 md:mb-0 mb-20">
          {(selectedIds.size > 0 || selectedSubLibIds.size > 0) && (
            <button
              className="flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group text-on-surface-variant hover:bg-surface-dim"
              onClick={() => {
                if (selectedSubLibIds.size > 0 && selectedIds.size > 0) {
                  // 同时选中了子书库和书籍
                  const selectedSubLibs = subLibraries.filter((sl) => selectedSubLibIds.has(sl.id));
                  const subLibBookCount = selectedSubLibs.reduce((sum, sl) => sum + sl.bookIds.length, 0);
                  openConfirm(
                    '批量删除',
                    `确定要删除选中的 ${selectedIds.size} 本书籍和 ${selectedSubLibIds.size} 个子书库（含其中 ${subLibBookCount} 本书籍）吗？此操作不可恢复。`,
                    async () => {
                      await batchDelete(Array.from(selectedIds));
                      await batchDeleteSubLibraries(Array.from(selectedSubLibIds), true);
                      setSelectedIds(new Set());
                      setSelectedSubLibIds(new Set());
                      setIsSelectMode(false);
                      closeConfirm();
                    },
                    'danger'
                  );
                } else if (selectedSubLibIds.size > 0) {
                  handleBatchDeleteSubLibraries();
                } else {
                  handleBatchDelete();
                }
              }}
            >
              <span className="material-symbols-outlined group-hover:text-primary mb-1">delete</span>
              <span className="font-label text-label-sm group-hover:text-primary">
                {selectedSubLibIds.size > 0 && selectedIds.size === 0 ? '移除' : '删除'}
              </span>
            </button>
          )}
          {selectedIds.size > 0 && (
            <>
              <button
                className="flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group border-l border-outline-variant/50 pl-6 text-on-surface-variant hover:bg-surface-dim"
                onClick={handleBatchMarkAsRead}
              >
                <span className="material-symbols-outlined group-hover:text-primary mb-1">done_all</span>
                <span className="font-label text-label-sm group-hover:text-primary">标为已读</span>
              </button>
              <button
                className="flex flex-col items-center justify-center rounded-full px-4 py-2 transition-all group border-l border-outline-variant/50 pl-6 text-on-surface-variant hover:bg-surface-dim"
                onClick={() => setShowAddToSubLibDialog(true)}
              >
                <span className="material-symbols-outlined group-hover:text-primary mb-1">create_new_folder</span>
                <span className="font-label text-label-sm group-hover:text-primary">归入</span>
              </button>
            </>
          )}
          {selectedIds.size === 0 && selectedSubLibIds.size === 0 && (
            <p className="font-label text-label-md text-on-surface-variant/60 py-2">点击选择书籍或子书库</p>
          )}
        </div>
      )}

      {showNewSubLibDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40">
          <div className="bg-surface-bright border border-outline-variant rounded-lg p-6 mx-margin-mobile max-w-md w-full">
            <h3 className="font-display text-headline-md text-primary mb-4">新建子书库</h3>
            <input
              type="text"
              value={newSubLibName}
              onChange={(e) => setNewSubLibName(e.target.value)}
              placeholder="输入子书库名称"
              className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary mb-4"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                className="border border-outline-variant text-on-surface-variant font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                onClick={() => setShowNewSubLibDialog(false)}
              >
                取消
              </button>
              <button
                className="bg-primary text-on-primary font-label text-label-md px-6 py-2 rounded hover:opacity-90 transition-colors"
                onClick={isSelectMode && selectedIds.size > 0 ? handleCreateSubLibrary : handleCreateEmptySubLibrary}
                disabled={!newSubLibName.trim()}
              >
                {isSelectMode && selectedIds.size > 0 ? `创建并加入 ${selectedIds.size} 本` : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddToSubLibDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40">
          <div className="bg-surface-bright border border-outline-variant rounded-lg p-6 mx-margin-mobile max-w-md w-full">
            <h3 className="font-display text-headline-md text-primary mb-4">归入子书库</h3>
            {subLibraries.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4">
                {subLibraries.map((subLib) => (
                  <button
                    key={subLib.id}
                    className="w-full text-left p-3 border border-outline-variant rounded hover:bg-surface-container transition-colors flex items-center gap-3"
                    onClick={() => handleAddToSubLibrary(subLib.id)}
                  >
                    <span className="material-symbols-outlined text-on-surface-variant">folder</span>
                    <div className="flex-1">
                      <p className="font-label text-label-md text-primary">{subLib.name}</p>
                      <p className="font-label text-label-sm text-on-surface-variant">{subLib.bookIds.length} 本</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="font-body text-body-md text-on-surface-variant mb-4">暂无子书库，请先创建</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                className="border border-outline-variant text-on-surface-variant font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                onClick={() => setShowAddToSubLibDialog(false)}
              >
                取消
              </button>
              <button
                className="text-primary font-label text-label-md px-6 py-2 hover:bg-surface-variant transition-colors flex items-center gap-1"
                onClick={() => {
                  setShowAddToSubLibDialog(false);
                  setShowNewSubLibDialog(true);
                  setNewSubLibName('');
                }}
              >
                <span className="material-symbols-outlined text-lg">add</span>
                新建
              </button>
            </div>
          </div>
        </div>
      )}

      <BookEditDialog
        book={editingBook}
        isOpen={showEditDialog}
        onSave={handleSaveBook}
        onCancel={() => {
          setShowEditDialog(false);
          setEditingBook(null);
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
        variant={confirmDialog.variant}
        confirmLabel="确认"
        cancelLabel="取消"
      />
    </div>
  );
};

export default LibraryPage;
