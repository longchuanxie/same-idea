import React, { useState, useMemo, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { BookCoverImage } from '@/components/atoms/BookCoverImage';
import { FormatBadge } from '@/components/atoms/FormatBadge';
import { COPY } from '@/constants/copy';
import { ROUTES, bookDetailPath, knowledgePath, readerPathForBook } from '@/constants/routes';
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { knowledgeRepo } from '@/services/storage/knowledgeRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Annotation, Book, KnowledgeArtifact } from '@/types';
import { cn } from '@/utils/cn';
import { globalSearch } from '@/utils/globalSearch';

/** 「最近添加」默认视图的取书数 */
const RECENT_BOOKS_LIMIT = 6;
/** 手记引文预览长度（字符） */
const EXCERPT_CHARS = 80;

/**
 * 全库检索：馆藏（元数据）+ 手记（划线与批注全文）+ 知识件（条目级内容）三路聚合。
 * 知识库工具的地基——搜到的一切都能跳回原处：
 * 手记回阅读器原句，知识件进查看器（再回原文），馆藏进档案卡。
 */
export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, coverUrls, tags, loadBooks } = useLibraryStore();
  const [query, setQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  // 进检索台即聚焦：搜索页唯一的动作就是输入，省一次点击
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // 手记与知识件随馆藏一次拉全（本地库体量，客户端过滤即时）
  useEffect(() => {
    let cancelled = false;
    annotationRepo.getAll().then((all) => {
      if (!cancelled) setAnnotations(all);
    });
    knowledgeRepo.getAll().then((all) => {
      if (!cancelled) setArtifacts(all);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasCriteria = Boolean(query.trim() || selectedTagId);

  const result = useMemo(
    () => globalSearch({ query, books, tags, annotations, artifacts, selectedTagId }),
    [query, books, tags, annotations, artifacts, selectedTagId]
  );

  const recentBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, RECENT_BOOKS_LIMIT);
  }, [books]);

  const openAnnotationInReader = (ann: Annotation, book: Book) => {
    // 文本书带 ?ann= 直达批注原句处；图页书页注带 ?page= 直达页码
    const page = book.format !== 'text' && ann.pageIndex != null ? ann.pageIndex + 1 : undefined;
    navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id, ann.id, page));
  };

  return (
    <div className="w-full max-w-max-width-content px-margin-mobile pt-8 flex flex-col gap-12">
      <section className="w-full">
        <div className="relative w-full border-b border-outline-variant focus-within:border-primary transition-colors duration-300">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            ref={searchInputRef}
            className="w-full bg-transparent border-none py-4 pl-10 pr-4 font-body text-body-lg text-primary placeholder:text-on-surface-variant focus:ring-0 focus:outline-none"
            placeholder={COPY.globalSearch.placeholder}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-2"
              onClick={() => setQuery('')}
            >
              <span className="material-symbols-outlined text-icon-md">close</span>
            </button>
          )}
        </div>
      </section>

      {tags.length > 0 && (
        <section className="w-full">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={cn(
                'chip px-3 py-1.5',
                selectedTagId === null
                  ? 'chip-active'
                  : ''
              )}
              onClick={() => setSelectedTagId(null)}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={cn(
                  'chip px-3 py-1.5',
                  selectedTagId === tag.id
                    ? 'text-on-primary border-transparent'
                    : ''
                )}
                style={selectedTagId === tag.id ? { backgroundColor: tag.color } : undefined}
                onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
              >
                {tag.name}
                <span className="ml-1 opacity-70">{tag.bookIds.length}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {hasCriteria && (
        <>
          {/* 馆藏：元数据命中（书名/作者/题材/标签） */}
          {result.books.length > 0 && (
            <section className="w-full flex flex-col gap-4">
              <h2 className="font-label text-label-md text-on-surface-variant uppercase tracking-widest">
                {COPY.globalSearch.booksSection} ({result.books.length})
              </h2>
              <div className="flex flex-col">
                {result.books.map((book) => (
                  <article
                    key={book.id}
                    className="py-4 border-b border-surface-variant flex gap-4 items-center group cursor-pointer hover:pl-2 transition-all"
                    onClick={() => navigate(bookDetailPath(book.id))}
                  >
                    <div className="w-12 h-16 flex-shrink-0 border border-outline-variant bg-surface-container overflow-hidden">
                      {coverUrls[book.id] ? (
                        <BookCoverImage url={coverUrls[book.id]} title={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">menu_book</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FormatBadge format={book.format} />
                        <span className="min-w-0 font-body text-body-lg text-primary group-hover:underline decoration-1 underline-offset-4 truncate">
                          {book.title}
                        </span>
                      </div>
                      {book.author && (
                        <span className="font-label text-label-sm text-on-surface-variant">{book.author}</span>
                      )}
                    </div>
                    {book.genres.length > 0 && (
                      <span className="font-label text-label-sm border border-outline-variant px-2 py-1 rounded text-secondary flex-shrink-0">
                        {book.genres[0]}
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* 手记：划线与批注全文命中，点击回原句 */}
          {result.annotationHits.length > 0 && (
            <section className="w-full flex flex-col gap-4">
              <h2 className="font-label text-label-md text-on-surface-variant uppercase tracking-widest">
                {COPY.globalSearch.annotationsSection} ({result.annotationHits.length})
              </h2>
              <div className="flex flex-col gap-3">
                {result.annotationHits.map(({ annotation: ann, book }) => {
                  const excerpt = ann.selectedText.slice(0, EXCERPT_CHARS);
                  return (
                    <button
                      key={ann.id}
                      className="card-link rounded-card-lg p-4 disabled:opacity-50"
                      onClick={() => book && openAnnotationInReader(ann, book)}
                      disabled={!book}
                    >
                      <p className="font-body text-body-md text-on-surface leading-relaxed">
                        「{excerpt}
                        {ann.selectedText.length > EXCERPT_CHARS ? '…' : ''}」
                      </p>
                      {ann.note && (
                        <p className="font-label text-label-sm text-on-surface-variant mt-2 flex items-start gap-1">
                          <span className="material-symbols-outlined text-icon-sm align-[-2px] flex-shrink-0">edit_note</span>
                          <span className="line-clamp-2">{ann.note}</span>
                        </p>
                      )}
                      <p className="font-label text-label-sm text-on-surface-faint mt-2.5 truncate">
                        ——《{book?.title ?? COPY.globalSearch.orphanBook}》· {ann.chapterTitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* 知识件：条目级内容命中（实体/关系/术语/导图节点/速览要点） */}
          {result.knowledgeHits.length > 0 && (
            <section className="w-full flex flex-col gap-4">
              <h2 className="font-label text-label-md text-on-surface-variant uppercase tracking-widest">
                {COPY.globalSearch.knowledgeSection} ({result.knowledgeHits.length})
              </h2>
              <div className="flex flex-col gap-2">
                {result.knowledgeHits.map(({ artifact, book, snippet, matchCount }) => {
                  const task = getKnowledgeTask(artifact.type);
                  return (
                    <article
                      key={artifact.id}
                      className="flex items-center gap-3 p-3 rounded-card border border-outline-variant bg-surface-container-low group cursor-pointer hover:bg-surface-container transition-all"
                      onClick={() => book && navigate(knowledgePath(book.id, artifact.id))}
                    >
                      <span
                        className="material-symbols-outlined text-icon-md text-primary shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {task.icon}
                      </span>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-label text-label-md text-on-surface truncate">{book?.title ?? COPY.globalSearch.orphanBook}</span>
                          <span className="font-label text-label-xs text-on-surface-faint shrink-0 rounded-full border border-outline-variant px-1.5 leading-4">
                            {task.label}
                          </span>
                          {matchCount > 1 && (
                            <span className="font-label text-label-xs text-on-surface-faint shrink-0">
                              {matchCount} 处
                            </span>
                          )}
                        </div>
                        <span className="font-body text-label-md text-on-surface-variant truncate">
                          {snippet}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* 三路全空 */}
          {result.books.length === 0 && result.annotationHits.length === 0 && result.knowledgeHits.length === 0 && (
            <section className="w-full flex flex-col items-center justify-center py-16 text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">search_off</span>
              <p className="font-body text-body-md text-on-surface-variant">{COPY.globalSearch.emptyTitle}</p>
              <p className="font-label text-label-sm text-on-surface-variant mt-2">{COPY.globalSearch.emptyHint}</p>
            </section>
          )}
        </>
      )}

      {!hasCriteria && books.length > 0 && (
        <section className="w-full flex flex-col gap-8">
          <div className="flex justify-between items-end">
            <h2 className="font-display text-display-lg-mobile text-primary">最近添加</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {recentBooks.map((book) => (
              <article
                key={book.id}
                className="group cursor-pointer flex flex-col"
                onClick={() => navigate(bookDetailPath(book.id))}
              >
                <div className="w-full border border-outline-variant bg-surface-container aspect-[2/3] overflow-hidden mb-3">
                  {coverUrls[book.id] ? (
                    <BookCoverImage
                      url={coverUrls[book.id]}
                      title={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-5xl">auto_stories</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 min-w-0 w-full">
                  <FormatBadge format={book.format} />
                  <h4 className="min-w-0 font-body text-body-lg text-primary leading-tight truncate">{book.title}</h4>
                </div>
                <p className="font-label text-label-md text-on-surface-variant mt-1">
                  {book.author || (book.status === 'completed' ? '已完结' : `${book.totalChapters} 话`)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!hasCriteria && books.length === 0 && (
        <section className="w-full flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">auto_stories</span>
          <p className="font-body text-body-md text-on-surface-variant">书架为空</p>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">导入书籍后可在此搜索</p>
          <button
            className="btn-secondary px-6 py-2 mt-4"
            onClick={() => navigate(ROUTES.IMPORT)}
          >
            去导入
          </button>
        </section>
      )}
    </div>
  );
};
