import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopAppBar } from '@/components/atoms/TopAppBar';
import { BottomNavBar } from '@/components/atoms/BottomNavBar';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { ROUTES, readerPath } from '@/constants/routes';
import { cn } from '@/utils/cn';
import type { Comic } from '@/types';

type ComicStatus = Comic['status'];

const STATUS_OPTIONS: { value: ComicStatus; label: string }[] = [
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
  { value: 'hiatus', label: '休载中' },
];

export const ComicDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    comics, coverUrls, readingProgress, tags, loadComics,
    toggleFavorite, updateComic, addTagToComic, removeTagFromComic, createTag,
  } = useLibraryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<ComicStatus>('ongoing');
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (comics.length === 0) {
      loadComics();
    }
  }, [comics.length, loadComics]);

  const comic = comics.find((c) => c.id === id);

  const enterEditMode = useCallback(() => {
    if (!comic) return;
    setEditTitle(comic.title);
    setEditAuthor(comic.author);
    setEditDescription(comic.description);
    setEditStatus(comic.status);
    setIsEditing(true);
  }, [comic]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    await updateComic(id, {
      title: editTitle,
      author: editAuthor,
      description: editDescription,
      status: editStatus,
    });
    setIsEditing(false);
  }, [id, editTitle, editAuthor, editDescription, editStatus, updateComic]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  if (!comic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">search_off</span>
          <p className="font-body text-body-md text-on-surface-variant">未找到该漫画</p>
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

  const progress = readingProgress[comic.id];
  const continueChapter = progress
    ? comic.chapters.find((ch) => ch.id === progress.chapterId)
    : null;
  const firstUnreadChapter = comic.chapters.find((ch) => ch.status === 'unread');
  const startChapter = continueChapter || firstUnreadChapter || comic.chapters[0];

  const getChapterStatusText = (status: string): string => {
    switch (status) {
      case 'read': return '已读';
      case 'reading': return '继续阅读';
      default: return '';
    }
  };

  const getStatusLabel = (status: ComicStatus): string => {
    switch (status) {
      case 'completed': return '已完结';
      case 'ongoing': return '连载中';
      case 'hiatus': return '休载中';
    }
  };

  return (
    <div className="paper-texture min-h-screen pb-0">
      <div className="fixed inset-0 noise-overlay z-0" />
      <TopAppBar variant="detail" />
      <main className="relative z-10 pt-4 max-w-max-width-content mx-auto px-margin-mobile pb-32">
        <section className="flex flex-col md:flex-row gap-8 py-8 md:py-12 border-b border-outline-variant">
          <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0 border border-outline-variant rounded bg-surface">
            {coverUrls[comic.id] ? (
              <img
                src={coverUrls[comic.id]}
                alt={comic.title}
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
                    {comic.title}
                  </h1>
                  <button
                    className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant flex-shrink-0"
                    onClick={enterEditMode}
                    title="编辑信息"
                  >
                    <span className="material-symbols-outlined text-headline-md">edit</span>
                  </button>
                </div>
                {comic.author && (
                  <p className="font-body text-body-md text-on-surface-variant mb-4">{comic.author}</p>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {comic.genres.map((genre) => (
                    <span key={genre} className="px-2 py-1 border border-outline-variant rounded-full font-label text-label-sm text-on-surface-variant">
                      {genre}
                    </span>
                  ))}
                  <span className="px-2 py-1 border border-outline-variant rounded-full font-label text-label-sm text-on-surface-variant">
                    {getStatusLabel(comic.status)}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {tags.filter((t) => t.comicIds.includes(comic.id)).map((tag) => (
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
                          if (id) removeTagFromComic(id, tag.id);
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
                      setTimeout(() => tagInputRef.current?.focus(), 50);
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] align-text-bottom">add</span>
                    标签
                  </button>
                </div>

                {showTagPanel && (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant p-4 mb-4">
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
                              await addTagToComic(id, existing.id);
                            } else {
                              const newTag = await createTag(newTagName.trim());
                              await addTagToComic(id, newTag.id);
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
                            await addTagToComic(id, existing.id);
                          } else {
                            const newTag = await createTag(newTagName.trim());
                            await addTagToComic(id, newTag.id);
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
                          const isAttached = tag.comicIds.includes(comic.id);
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
                                  await removeTagFromComic(id, tag.id);
                                } else {
                                  await addTagToComic(id, tag.id);
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
                {comic.description && (
                  <p className="font-body text-body-md text-on-surface-variant line-clamp-3 mb-8">
                    {comic.description}
                  </p>
                )}
                <div className="flex gap-4 justify-center md:justify-start mt-auto">
                  <button
                    className="bg-primary text-on-primary font-label text-label-md px-8 py-3 rounded hover:opacity-90 transition-colors w-full md:w-auto"
                    onClick={() => navigate(readerPath(comic.id, startChapter?.id))}
                  >
                    {continueChapter ? '继续阅读' : '立即阅读'}
                  </button>
                  <button
                    className={`border border-outline-variant font-label text-label-md px-4 py-3 rounded hover:bg-surface-variant transition-colors flex items-center justify-center ${
                      comic.isFavorite ? 'text-primary' : 'text-on-surface-variant'
                    }`}
                    onClick={() => toggleFavorite(comic.id)}
                  >
                    <span className="material-symbols-outlined" style={comic.isFavorite ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {comic.isFavorite ? 'bookmark' : 'bookmark_add'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {comic.chapters.length > 0 && (
          <section className="py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-headline-md text-primary">目录</h2>
              <span className="font-label text-label-sm text-on-surface-variant">
                共 {comic.chapters.length} 话
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comic.chapters.map((ch) => {
                const statusText = getChapterStatusText(ch.status);
                return (
                  <button
                    key={ch.id}
                    className={`p-4 border border-outline-variant rounded hover:bg-surface-container transition-colors flex justify-between items-center group text-left ${
                      ch.status === 'reading' ? 'bg-surface-container-low' : ''
                    } ${ch.status === 'unread' ? 'opacity-70' : ''}`}
                    onClick={() => navigate(readerPath(comic.id, ch.id))}
                  >
                    <div>
                      <h3 className="font-label text-label-md text-primary">第 {ch.number} 话</h3>
                      <p className="font-label text-label-sm text-on-surface-variant">{ch.title}</p>
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
      </main>
      <BottomNavBar active="library" />
    </div>
  );
};
