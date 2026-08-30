import React, { useEffect, useState, useCallback, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BottomNavBar } from '@/components/atoms/BottomNavBar';
import { Button } from '@/components/atoms/Button';
import { FormatBadge } from '@/components/atoms/FormatBadge';
import { TopAppBar } from '@/components/atoms/TopAppBar';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { COPY } from '@/constants/copy';
import { ROUTES, readerPathForBook } from '@/constants/routes';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Annotation, Book } from '@/types';
import { exportAnnotationsToMarkdown } from '@/utils/annotationExport';
import { cn } from '@/utils/cn';
import { describeLastRead } from '@/utils/readingProgress';
import { toast } from '@/utils/toast';

/** 章节标题已自带「第N话/章/回」前缀时，目录不再叠加序号 */
const TITLE_HAS_NUMBER_PREFIX = /^第\s*\d+\s*[话章回]/;

const TAG_INPUT_FOCUS_DELAY_MS = 50; // 等待弹窗渲染完成后聚焦
/** 档案卡手记区块展示的最近条数 */
const ANNOTATION_PREVIEW_COUNT = 3;

type BookStatus = Book['status'];

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
  { value: 'hiatus', label: '休载中' },
];

export const BookDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    books, coverUrls, readingProgress, tags, loadBooks,
    toggleFavorite, updateBook, addTagToBook, removeTagFromBook, createTag, removeBook,
  } = useLibraryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<BookStatus>('ongoing');
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (books.length === 0) {
      loadBooks();
    }
  }, [books.length, loadBooks]);

  // 手记预览（档案卡的手记区块）
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    annotationRepo.getByBookId(id).then((all) => {
      if (!cancelled) setAnnotations(all);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ⋯ 菜单点击外部关闭
  useEffect(() => {
    if (!showMoreMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const book = books.find((b) => b.id === id);

  const enterEditMode = useCallback(() => {
    if (!book) return;
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditDescription(book.description);
    setEditStatus(book.status);
    setIsEditing(true);
  }, [book]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    await updateBook(id, {
      title: editTitle,
      author: editAuthor,
      description: editDescription,
      status: editStatus,
    });
    setIsEditing(false);
  }, [id, editTitle, editAuthor, editDescription, editStatus, updateBook]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleExportAnnotations = async () => {
    if (!book) return;
    const bookAnnotations = await annotationRepo.getByBookId(book.id);
    if (bookAnnotations.length === 0) {
      toast(COPY.toast.noAnnotations);
      return;
    }
    exportAnnotationsToMarkdown(book.title, book.author || undefined, bookAnnotations);
  };

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">search_off</span>
          <p className="font-body text-body-md text-on-surface-variant">未找到该书籍</p>
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

  const progress = readingProgress[book.id];
  const continueChapter = progress
    ? book.chapters.find((ch) => ch.id === progress.chapterId)
    : null;
  const firstUnreadChapter = book.chapters.find((ch) => ch.status === 'unread');
  const startChapter = continueChapter || firstUnreadChapter || book.chapters[0];
  const startReaderPath = continueChapter
    ? readerPathForBook(book)
    : readerPathForBook(book, startChapter?.id);

  const getChapterStatusText = (status: string): string => {
    switch (status) {
      case 'read': return '已读';
      case 'reading': return '继续阅读';
      default: return '';
    }
  };

  const getStatusLabel = (status: BookStatus): string => {
    switch (status) {
      case 'completed': return '已完结';
      case 'ongoing': return '连载中';
      case 'hiatus': return '休载中';
    }
  };

  return (
    <div className="paper-texture min-h-screen pb-0">
      <div className="fixed inset-0 noise-overlay z-0" />
      <TopAppBar variant="detail" onMore={() => setShowMoreMenu((v) => !v)} />
      {showMoreMenu && book && (
        <div
          ref={moreMenuRef}
          className="fixed top-[76px] right-4 z-menu w-48 bg-surface-bright border border-outline-variant rounded-card shadow-paper-up py-1 animate-scale-in origin-top-right"
        >
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
            onClick={() => {
              setShowMoreMenu(false);
              enterEditMode();
            }}
          >
            <span className="material-symbols-outlined text-icon-md">edit</span>
            <span className="font-label text-label-md">编辑档案</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
            onClick={() => {
              setShowMoreMenu(false);
              void handleExportAnnotations();
            }}
          >
            <span className="material-symbols-outlined text-icon-md">ios_share</span>
            <span className="font-label text-label-md">导出手记</span>
          </button>
          <div className="border-t border-outline-variant my-1" />
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-seal-soft transition-colors text-seal"
            onClick={() => {
              setShowMoreMenu(false);
              setConfirmDelete(true);
            }}
          >
            <span className="material-symbols-outlined text-icon-md">delete</span>
            <span className="font-label text-label-md">移出馆藏</span>
          </button>
        </div>
      )}
      <main className="relative z-10 pt-4 max-w-max-width-content mx-auto px-margin-mobile pb-32">
        <section className="flex flex-col md:flex-row gap-8 py-8 md:py-12 border-b border-outline-variant animate-slide-down">
          <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0 border border-outline-variant rounded bg-surface">
            {coverUrls[book.id] ? (
              <img
                src={coverUrls[book.id]}
                alt={book.title}
                className="w-full h-auto aspect-[2/3] object-cover rounded"
              />
            ) : (
              <div className="w-full h-auto aspect-[2/3] bg-surface-variant flex items-center justify-center rounded">
                <span className="material-symbols-outlined text-on-surface-variant text-6xl">menu_book</span>
              </div>
            )}
          </div>
          <div className="flex flex-col flex-grow justify-center text-center md:text-left">
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">名称</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">作者</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">简介</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-outline-variant rounded px-3 py-2 font-body text-body-md text-on-background bg-surface focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">连载状态</label>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`px-3 py-1.5 rounded-full border font-label text-label-sm transition-colors ${
                          editStatus === opt.value
                            ? 'bg-primary text-on-primary border-primary'
                            : 'border-outline-variant text-on-surface-variant hover:border-primary'
                        }`}
                        onClick={() => setEditStatus(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    className="bg-primary text-on-primary font-label text-label-md px-6 py-2 rounded hover:opacity-90 transition-colors"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                  <button
                    className="border border-outline-variant text-on-surface-variant font-label text-label-md px-6 py-2 rounded hover:bg-surface-variant transition-colors"
                    onClick={handleCancelEdit}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-center md:justify-between gap-2">
                  <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary mb-2 flex-1">
                    {book.title}
                  </h1>
                  <button
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant flex-shrink-0"
                    onClick={enterEditMode}
                    title="编辑信息"
                  >
                    <span className="material-symbols-outlined text-headline-md">edit</span>
                  </button>
                </div>
                {book.author && (
                  <p className="font-body text-body-md text-on-surface-variant mb-4">{book.author}</p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {book.genres.map((genre) => (
                    <span key={genre} className="px-2 py-1 border border-outline-variant rounded-full font-label text-label-sm text-on-surface-variant">
                      {genre}
                    </span>
                  ))}
                  <span className="px-2 py-1 border border-outline-variant rounded-full font-label text-label-sm text-on-surface-variant">
                    {getStatusLabel(book.status)}
                  </span>
                  <FormatBadge format={book.format} size="large" />
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {tags.filter((t) => t.bookIds.includes(book.id) && !book.genres.includes(t.name)).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-label text-label-sm text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button
                        className="ml-1 hover:opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (id) removeTagFromBook(id, tag.id);
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </span>
                  ))}
                  <button
                    className="px-3 py-1 border border-dashed border-outline-variant rounded-full font-label text-label-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                    onClick={() => {
                      setShowTagPanel(!showTagPanel);
                      setTimeout(() => tagInputRef.current?.focus(), TAG_INPUT_FOCUS_DELAY_MS);
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] align-text-bottom">add</span>
                    标签
                  </button>
                </div>

                {showTagPanel && (
                  <div className="bg-surface-container-low rounded-card-lg border border-outline-variant p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-label text-label-sm text-on-surface-variant">分类</span>
                      <button
                        aria-label="收起分类面板"
                        className="w-7 h-7 flex items-center justify-center rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                        onClick={() => setShowTagPanel(false)}
                      >
                        <span className="material-symbols-outlined text-icon-sm">close</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && newTagName.trim() && id) {
                            const existing = tags.find((t) => t.name.toLowerCase() === newTagName.trim().toLowerCase());
                            if (existing) {
                              await addTagToBook(id, existing.id);
                            } else {
                              const newTag = await createTag(newTagName.trim());
                              await addTagToBook(id, newTag.id);
                              setShowTagPanel(false);
                            }
                            setNewTagName('');
                          }
                        }}
                        placeholder="输入标签名称，按回车添加"
                        className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body text-body-md focus:outline-none focus:border-primary"
                      />
                      <button
                        className="px-3 py-2 bg-primary text-on-primary rounded-lg font-label text-label-md hover:opacity-90 transition-opacity"
                        onClick={async () => {
                          if (!newTagName.trim() || !id) return;
                          const existing = tags.find((t) => t.name.toLowerCase() === newTagName.trim().toLowerCase());
                          if (existing) {
                            await addTagToBook(id, existing.id);
                          } else {
                            const newTag = await createTag(newTagName.trim());
                            await addTagToBook(id, newTag.id);
                            setShowTagPanel(false);
                          }
                          setNewTagName('');
                        }}
                        disabled={!newTagName.trim()}
                      >
                        添加
                      </button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="font-label text-label-sm text-on-surface-variant w-full mb-1">已有标签：</span>
                        {tags.map((tag) => {
                          const isAttached = tag.bookIds.includes(book.id);
                          return (
                            <button
                              key={tag.id}
                              className={cn(
                                'px-3 py-1 rounded-full font-label text-label-sm transition-all',
                                isAttached
                                  ? 'ring-2 ring-offset-1'
                                  : 'opacity-60 hover:opacity-100'
                              )}
                              style={{
                                backgroundColor: tag.color,
                                color: '#fff',
                                '--tw-ring-color': isAttached ? tag.color : undefined,
                              } as React.CSSProperties}
                              onClick={async () => {
                                if (!id) return;
                                if (isAttached) {
                                  await removeTagFromBook(id, tag.id);
                                } else {
                                  await addTagToBook(id, tag.id);
                                }
                              }}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {book.description && (
                  <p className="font-body text-body-md text-on-surface-variant line-clamp-3 mb-8">
                    {book.description}
                  </p>
                )}
                {/* 进度上下文（书签动线）：档案卡与门厅同源 */}
                {progress && (
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-4 font-label text-label-sm text-on-surface-variant">
                    <span className="w-1 h-4 bg-seal rounded-sm flex-shrink-0" aria-hidden="true" />
                    <span>
                      在读
                      {continueChapter ? ` · 第 ${continueChapter.number} ${book.format === 'text' ? '章' : '话'}` : ''}
                      <span className="font-mono ml-1.5">{Math.round(progress.percentage)}%</span>
                    </span>
                    {book.lastReadAt && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{describeLastRead(book.lastReadAt)}读过</span>
                      </>
                    )}
                  </div>
                )}
                <div className="flex gap-3 items-stretch justify-center md:justify-start mt-auto">
                  <Button
                    variant="accent"
                    size="lg"
                    className="flex-1 md:flex-none md:min-w-44"
                    onClick={() => navigate(startReaderPath)}
                  >
                    {continueChapter ? '继续阅读' : '立即开读'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className={book.isFavorite ? 'text-primary' : ''}
                    onClick={() => toggleFavorite(book.id)}
                    aria-label="收藏"
                    title="收藏"
                  >
                    <span
                      className="material-symbols-outlined text-icon-md"
                      style={book.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {book.isFavorite ? 'bookmark' : 'bookmark_add'}
                    </span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {book.chapters.length > 0 && (
          <section className="py-8 animate-fade-in stagger-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-headline-md text-primary">目录</h2>
              <span className="font-label text-label-sm text-on-surface-variant">
                共 {book.chapters.length} {book.format === 'text' ? '章' : '话'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {book.chapters.map((ch) => {
                const statusText = getChapterStatusText(ch.status);
                return (
                  <button
                    key={ch.id}
                    className={`p-4 border border-outline-variant rounded hover:bg-surface-container transition-colors flex justify-between items-center group text-left ${
                      ch.status === 'reading' ? 'bg-surface-container-low' : ''
                    } ${ch.status === 'unread' ? 'opacity-70' : ''}`}
                    onClick={() => navigate(readerPathForBook(book, ch.id))}
                  >
                    <div>
                      {TITLE_HAS_NUMBER_PREFIX.test(ch.title) ? (
                        <h3 className="font-label text-label-md text-primary">{ch.title}</h3>
                      ) : (
                        <>
                          <h3 className="font-label text-label-md text-primary">
                            第 {ch.number} {book.format === 'text' ? '章' : '话'}
                          </h3>
                          <p className="font-label text-label-sm text-on-surface-variant">{ch.title}</p>
                        </>
                      )}
                    </div>
                    {statusText && (
                      <span className={`font-label text-label-sm ${ch.status === 'reading' ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {statusText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 手记区块（手记动线的书内聚合）：最近 3 条，点击回跳原文 */}
        {annotations.length > 0 && (
          <section className="py-8 border-t border-outline-variant">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-headline-md text-primary">手记</h2>
              <span className="font-mono text-label-sm text-on-surface-variant">{annotations.length} 条</span>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {[...annotations]
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, ANNOTATION_PREVIEW_COUNT)
                .map((ann) => (
                  <button
                    key={ann.id}
                    className="text-left p-4 rounded-card bg-surface-container-low border border-outline-variant hover:bg-surface-container transition-colors"
                    onClick={() => navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id))}
                  >
                    <p className="font-body text-body-md text-on-surface leading-relaxed line-clamp-2">
                      「{ann.selectedText}」
                    </p>
                    {ann.note && (
                      <p className="font-label text-label-sm text-on-surface-variant mt-1.5 line-clamp-1">
                        <span className="material-symbols-outlined text-icon-sm align-[-2px]">edit_note</span>{' '}
                        {ann.note}
                      </p>
                    )}
                    <p className="font-label text-label-sm text-on-surface-faint mt-1.5">{ann.chapterTitle}</p>
                  </button>
                ))}
            </div>
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
              onClick={() => void handleExportAnnotations()}
            >
              <span className="material-symbols-outlined text-icon-sm">ios_share</span>
              导出全部 Markdown
            </button>
          </section>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`把《${book.title}》从馆中移除？`}
        message={`它的 ${annotations.length} 条手记与阅读进度会一并消失。`}
        confirmLabel="移除"
        cancelLabel="留下"
        variant="danger"
        onConfirm={() => {
          setConfirmDelete(false);
          if (id) void removeBook(id);
          navigate(ROUTES.LIBRARY);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
      <BottomNavBar active="library" />
    </div>
  );
};
