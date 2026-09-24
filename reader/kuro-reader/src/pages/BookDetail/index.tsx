import React, { useEffect, useState, useCallback, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { BookCoverImage } from '@/components/atoms/BookCoverImage';
import { BottomNavBar } from '@/components/atoms/BottomNavBar';
import { Button } from '@/components/atoms/Button';
import { FormatBadge } from '@/components/atoms/FormatBadge';
import { TopAppBar } from '@/components/atoms/TopAppBar';
import { CitationDialog } from '@/components/molecules/CitationDialog';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { KnowledgeSection } from '@/components/molecules/knowledge/KnowledgeSection';
import { COPY } from '@/constants/copy';
import { ROUTES, knowledgePath, notesPath, readerPathForBook } from '@/constants/routes';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useHistoryBack } from '@/hooks/useHistoryBack';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { recordUsageSignal } from '@/services/telemetry/usageSignals';
import { useKnowledgeStore } from '@/stores/useKnowledgeStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Annotation, Book, StoryBeatsData } from '@/types';
import { exportAnnotationsToMarkdown } from '@/utils/annotationExport';
import { beatRoleMeta, beatRulerRatio } from '@/utils/beatRoles';
import { cn } from '@/utils/cn';
import { describeLastRead } from '@/utils/readingProgress';
import { toast } from '@/utils/toast';

/** 章节标题已自带「第N话/章/回」前缀时，目录不再叠加序号 */
const TITLE_HAS_NUMBER_PREFIX = /^第\s*\d+\s*[话章回]/;

const TAG_INPUT_FOCUS_DELAY_MS = 50; // 等待弹窗渲染完成后聚焦
/** 档案卡手记区块展示的最近条数 */
const ANNOTATION_PREVIEW_COUNT = 3;
/** 目录默认折叠的预览章数：超过即收起（章节多的书不再把知识库/手记顶出两屏外） */
const TOC_PREVIEW_COUNT = 12;

type BookStatus = Book['status'];

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
  { value: 'hiatus', label: '休载中' },
];

export const BookDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const historyBack = useHistoryBack();
  const { id } = useParams<{ id: string }>();
  const {
    books, coverUrls, readingProgress, tags, loadBooks,
    toggleFavorite, updateBook, addTagToBook, removeTagFromBook, createTag, removeBook,
  } = useLibraryStore();
  // 叙事节拍件（若有）：目录上方的结构导览条数据源（loadArtifacts 由知识库区块的挂载触发）
  const knowledgeArtifacts = useKnowledgeStore((s) => s.artifactsByBook[id ?? '']);

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
  const [showCitation, setShowCitation] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
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
  useClickOutside(moreMenuRef, showMoreMenu, () => setShowMoreMenu(false));

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
    const tagNames = new Map(tags.map((t) => [t.id, t.name]));
    exportAnnotationsToMarkdown(book.title, book.author || undefined, bookAnnotations, tagNames);
  };

  if (!book) {
    return (
      <div className="paper-texture min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl">search_off</span>
          <p className="font-body text-body-md text-on-surface-variant">未找到该书籍</p>
          <button
            className="btn-secondary px-6 py-2"
            onClick={() => historyBack(ROUTES.LIBRARY)}
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

  // 长目录折叠：预览前 N 章；续读章落在预览之外时单独补一张（「继续阅读」入口不随折叠消失）
  const continueChapterIndex = continueChapter
    ? book.chapters.findIndex((ch) => ch.id === continueChapter.id)
    : -1;
  const tocCollapsed = book.chapters.length > TOC_PREVIEW_COUNT && !showAllChapters;
  const visibleChapters = tocCollapsed ? book.chapters.slice(0, TOC_PREVIEW_COUNT) : book.chapters;
  const overflowContinueChapter =
    tocCollapsed && continueChapter != null && continueChapterIndex >= TOC_PREVIEW_COUNT
      ? continueChapter
      : null;

  // 结构导览条：节拍尺比例坐标（与 BeatsView 同一留白算法）；章越界（书改版）的节拍跳过
  const beatsArtifact = knowledgeArtifacts?.find((a) => a.type === 'story-beats');
  const beatsData = beatsArtifact ? (beatsArtifact.data as StoryBeatsData) : null;
  const beatsChapterCount = beatsArtifact?.meta?.bookChapterCount ?? book.chapters.length;
  const visibleBeats = (beatsData?.beats ?? [])
    .filter((beat) => book.chapters[beat.chapterIndex])
    .map((beat, index) => ({
      beat,
      ratio: beatRulerRatio(beat.chapterIndex, beatsChapterCount),
      labelAbove: index % 2 === 1,
    }));

  const renderChapterCard = (ch: Book['chapters'][number]) => {
    const statusText = getChapterStatusText(ch.status);
    return (
      <button
        key={ch.id}
        className={`card-link p-4 flex justify-between items-center group ${
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
                {ch.number != null ? <>第 {ch.number} {book.format === 'text' ? '章' : '话'}</> : ch.title}
              </h3>
              {ch.number != null && (
                <p className="font-label text-label-sm text-on-surface-variant">{ch.title}</p>
              )}
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
  };

  const getStatusLabel = (status: BookStatus): string => {
    switch (status) {
      case 'completed': return '已完结';
      case 'ongoing': return '连载中';
      case 'hiatus': return '休载中';
    }
  };

  return (
    <div className="paper-texture h-[100dvh] overflow-y-auto overscroll-contain">
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
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface-variant hover:text-primary"
            onClick={() => {
              setShowMoreMenu(false);
              setShowCitation(true);
            }}
          >
            <span className="material-symbols-outlined text-icon-md">format_quote</span>
            <span className="font-label text-label-md">{COPY.citation.menuLabel}</span>
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
              <BookCoverImage
                url={coverUrls[book.id]}
                title={book.title}
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
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">作者</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">简介</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label className="font-label text-label-sm text-on-surface-variant mb-1 block">连载状态</label>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`chip px-3 py-1.5 ${
                          editStatus === opt.value
                            ? 'chip-active'
                            : ''
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
                    className="btn-primary px-6 py-2"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                  <button
                    className="btn-secondary px-6 py-2"
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
                    <span key={genre} className="chip px-2 py-1">
                      {genre}
                    </span>
                  ))}
                  <span className="chip px-2 py-1">
                    {getStatusLabel(book.status)}
                  </span>
                  <FormatBadge format={book.format} size="large" />
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {tags.filter((t) => t.bookIds.includes(book.id) && !book.genres.includes(t.name)).map((tag) => (
                    <span
                      key={tag.id}
                      className="chip px-3 py-1 text-on-primary"
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
                    className="chip border-dashed px-3 py-1 hover:text-primary"
                    onClick={() => {
                      setShowTagPanel(!showTagPanel);
                      setTimeout(() => tagInputRef.current?.focus(), TAG_INPUT_FOCUS_DELAY_MS);
                    }}
                  >
                    <span className="material-symbols-outlined text-icon-sm align-text-bottom">add</span>
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
                        className="btn-primary px-3 py-2"
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
                      {continueChapter ? continueChapter.number != null ? ` · 第 ${continueChapter.number} ${book.format === 'text' ? '章' : '话'}` : ` · ${continueChapter.title}` : ''}
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

        {/* 知识库区块：紧随档案卡（章节多的书不再被长目录顶出两屏外）；AI 通读生成的图谱/导图入口 */}
        <KnowledgeSection book={book} />

        {book.chapters.length > 0 && (
          <section className="py-8 border-t border-outline-variant animate-fade-in stagger-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-headline-md text-primary">目录</h2>
              <span className="flex items-center gap-0.5">
                <span className="font-label text-label-sm text-on-surface-variant">
                  共 {book.chapters.length} {book.format === 'text' ? '章' : '话'}
                </span>
              </span>
            </div>
            {/* 结构导览条：AI 梳理的叙事节拍按章距排布——点节拍直达该章（点距即节奏感） */}
            {visibleBeats.length > 0 && beatsArtifact && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-label text-label-sm text-on-surface-variant">
                    结构导览 · {visibleBeats.length} 个节拍
                  </span>
                  <button
                    className="font-label text-label-sm text-primary hover:opacity-80 transition-opacity"
                    onClick={() => navigate(knowledgePath(book.id, beatsArtifact.id))}
                  >
                    查看节拍详情
                  </button>
                </div>
                <div className="relative h-14" role="list" aria-label="叙事节拍结构条">
                  <div className="absolute left-0 right-0 top-1/2 border-t border-outline-variant" aria-hidden="true" />
                  {visibleBeats.map(({ beat, ratio, labelAbove }) => {
                    const meta = beatRoleMeta(beat.role);
                    return (
                      <button
                        key={beat.id}
                        role="listitem"
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center p-1.5 group"
                        style={{ left: `${ratio * 100}%` }}
                        onClick={() => {
                          recordUsageSignal('knowledge-beat-tap', { bookId: book.id });
                          navigate(readerPathForBook(book, book.chapters[beat.chapterIndex].id));
                        }}
                        title={`${meta.label} · 第 ${beat.chapterIndex + 1} ${book.format === 'text' ? '章' : '话'}：${beat.title}`}
                      >
                        <span
                          className="block w-2.5 h-2.5 rounded-full ring-2 ring-surface group-hover:scale-125 transition-transform"
                          style={{ backgroundColor: meta.color }}
                          aria-hidden="true"
                        />
                        <span
                          className={`absolute whitespace-nowrap font-label text-label-xs text-on-surface-variant group-hover:text-on-surface transition-colors ${
                            labelAbove ? 'bottom-full mb-0.5' : 'top-full mt-0.5'
                          }`}
                        >
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleChapters.map((ch) => renderChapterCard(ch))}
              {overflowContinueChapter && renderChapterCard(overflowContinueChapter)}
            </div>
            {book.chapters.length > TOC_PREVIEW_COUNT && (
              <button
                className="mt-4 font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
                onClick={() => setShowAllChapters((v) => !v)}
              >
                {showAllChapters ? '收起目录' : `展开全部 ${book.chapters.length} ${book.format === 'text' ? '章' : '话'}`}
                <span className="material-symbols-outlined text-icon-sm">
                  {showAllChapters ? 'expand_less' : 'expand_more'}
                </span>
              </button>
            )}
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
                    className="card-link p-4"
                    onClick={() => navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id, ann.id))}
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
            <div className="flex items-center gap-4">
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
                onClick={() => navigate(notesPath(book.id))}
              >
                查看全部
                <span className="material-symbols-outlined text-icon-sm">chevron_right</span>
              </button>
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
                onClick={() => void handleExportAnnotations()}
              >
                <span className="material-symbols-outlined text-icon-sm">ios_share</span>
                导出全部 Markdown
              </button>
            </div>
          </section>
        )}
      </main>

      <ConfirmDialog
        isOpen={confirmDelete}
        title={`把《${book.title}》从馆中移除？`}
        message={
          annotations.length > 0
            ? `它的 ${annotations.length} 条手记与阅读进度会一并消失。`
            : '它的阅读进度会一并消失。'
        }
        confirmLabel="移除"
        cancelLabel="留下"
        variant="danger"
        onConfirm={() => {
          setConfirmDelete(false);
          if (id) void removeBook(id);
          historyBack(ROUTES.LIBRARY);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
      <CitationDialog book={book} isOpen={showCitation} onClose={() => setShowCitation(false)} />
      <BottomNavBar active="library" />
    </div>
  );
};
