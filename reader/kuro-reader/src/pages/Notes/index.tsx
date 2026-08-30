import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { COPY } from '@/constants/copy';
import { ROUTES, readerPathForBook } from '@/constants/routes';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Annotation, Book } from '@/types';
import {
  exportMultiBookMarkdown,
  type MultiBookEntry,
} from '@/utils/annotationExport';
import {
  EMPTY_ANNOTATION_FILTER,
  filterAnnotations,
  type AnnotationFilter,
  type AnnotationKind,
} from '@/utils/annotationFilter';
import { toast } from '@/utils/toast';

/** 引文预览长度（字符） */
const EXCERPT_CHARS = 80;

const KIND_OPTIONS: AnnotationKind[] = ['all', 'highlight', 'note'];
const KIND_LABELS: Record<AnnotationKind, string> = {
  all: COPY.notesWall.filterAll,
  highlight: COPY.notesWall.filterHighlight,
  note: COPY.notesWall.filterNote,
};

/** 手记 · 摘抄墙（建议书 6.x / Phase 5）：跨书批注与划线的聚合视图——活图书馆的镇馆之宝。 */
export const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, tags, loadBooks } = useLibraryStore();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [filter, setFilter] = useState<AnnotationFilter>(EMPTY_ANNOTATION_FILTER);

  useEffect(() => {
    loadBooks();
    let cancelled = false;
    annotationRepo.getAll().then((all) => {
      if (!cancelled) setAnnotations(all);
    });
    return () => {
      cancelled = true;
    };
  }, [loadBooks]);

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const tagById = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const sorted = useMemo(
    () =>
      [...annotations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [annotations]
  );

  const visible = useMemo(() => filterAnnotations(sorted, filter), [sorted, filter]);

  const openInReader = (ann: Annotation, book: Book) => {
    // 文本书带 ?ann= 直达批注原句处
    navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id, ann.id));
  };

  const setFilterPart = (part: Partial<AnnotationFilter>) =>
    setFilter((prev) => ({ ...prev, ...part }));

  /** 整墙导出：孤儿手记归《已移出的书》组；墙空提示 */
  const handleExportAll = () => {
    if (sorted.length === 0) {
      toast(COPY.toast.noAnnotations);
      return;
    }
    const orphanTitle = '已移出的书';
    const entries: MultiBookEntry[] = [...bookById.values()]
      .map((book) => ({
        bookTitle: book.title,
        annotations: sorted.filter((ann) => ann.bookId === book.id),
      }))
      .filter((entry) => entry.annotations.length > 0);
    const orphans = sorted.filter((ann) => !bookById.has(ann.bookId));
    if (orphans.length > 0) {
      entries.push({ bookTitle: orphanTitle, annotations: orphans });
    }
    const tagNames = new Map(tags.map((t) => [t.id, t.name]));
    exportMultiBookMarkdown(entries, tagNames);
  };

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8">
      <section className="flex flex-col gap-2 border-b border-outline-variant pb-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">摘抄墙</h2>
          {sorted.length > 0 && (
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0"
              onClick={handleExportAll}
              title={COPY.notesWall.exportAll}
            >
              <span className="material-symbols-outlined text-icon-md">ios_share</span>
              导出
            </button>
          )}
        </div>
        <p className="font-body text-body-md text-on-surface-variant">
          读过的句子都贴在这里——{sorted.length > 0 ? `共 ${sorted.length} 条手记` : '等你贴上第一张'}。
        </p>
      </section>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <span className="material-symbols-outlined text-on-surface-faint text-5xl mb-4 block">edit_note</span>
          <p className="font-body text-body-md text-on-surface-variant mb-2">墙上还没有手记</p>
          <p className="font-label text-label-sm text-on-surface-faint mb-8">
            阅读时长按一句话，就能把它贴上墙
          </p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant rounded-card px-6 py-2 hover:bg-surface-container transition-colors"
            onClick={() => navigate(ROUTES.LIBRARY)}
          >
            去书库挑一本
          </button>
        </div>
      ) : (
        <>
          {/* 检索台：搜索 + 形态/书/标签筛选 */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
              <input
                value={filter.query}
                onChange={(e) => setFilterPart({ query: e.target.value.slice(0, EXCERPT_CHARS) })}
                placeholder={COPY.notesWall.searchPlaceholder}
                className="flex-1 bg-transparent text-on-surface font-body text-body-sm focus:outline-none placeholder:text-on-surface-variant/40"
              />
              {filter.query && (
                <button
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-variant transition-colors"
                  onClick={() => setFilterPart({ query: '' })}
                  aria-label="清空"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">close</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {KIND_OPTIONS.map((kind) => (
                <button
                  key={kind}
                  onClick={() => setFilterPart({ kind })}
                  className={`px-2.5 py-1 rounded-full font-label text-label-xs border transition-colors ${
                    filter.kind === kind
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'text-on-surface-variant border-outline-variant hover:bg-surface-variant'
                  }`}
                >
                  {KIND_LABELS[kind]}
                </button>
              ))}
              <select
                value={filter.bookId}
                onChange={(e) => setFilterPart({ bookId: e.target.value })}
                aria-label={COPY.notesWall.filterBookAll}
                className="px-2 py-1 rounded-full font-label text-label-xs bg-surface-container-low text-on-surface-variant border border-outline-variant focus:outline-none focus:border-primary"
              >
                <option value="">{COPY.notesWall.filterBookAll}</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
              <select
                value={filter.tagId}
                onChange={(e) => setFilterPart({ tagId: e.target.value })}
                aria-label={COPY.notesWall.filterTagAll}
                className="px-2 py-1 rounded-full font-label text-label-xs bg-surface-container-low text-on-surface-variant border border-outline-variant focus:outline-none focus:border-primary"
              >
                <option value="">{COPY.notesWall.filterTagAll}</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-col items-center text-center py-12">
              <span className="material-symbols-outlined text-on-surface-faint text-4xl mb-3 block">filter_alt_off</span>
              <p className="font-body text-body-md text-on-surface-variant">{COPY.notesWall.emptyFiltered}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map((ann) => {
                const book = bookById.get(ann.bookId);
                const excerpt = ann.selectedText.slice(0, EXCERPT_CHARS);
                const annTags = (ann.tagIds ?? [])
                  .map((id) => tagById.get(id))
                  .filter((t): t is NonNullable<typeof t> => Boolean(t));
                return (
                  <button
                    key={ann.id}
                    className="text-left p-4 md:p-5 rounded-card-lg bg-surface-container-low border border-outline-variant hover:bg-surface-container transition-colors"
                    onClick={() => book && openInReader(ann, book)}
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
                    {annTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {annTags.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 rounded-full font-label text-label-xs border border-outline-variant text-on-surface-variant"
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="font-label text-label-sm text-on-surface-faint mt-2.5 truncate">
                      ——《{book?.title ?? '已移出的书'}》· {ann.chapterTitle}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesPage;
