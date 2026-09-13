import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { NotesOutlineDialog, type NotesOutlineDialogState } from '@/components/molecules/NotesOutlineDialog';
import { COPY } from '@/constants/copy';
import { ROUTES, readerPathForBook, vocabularyPath } from '@/constants/routes';
import { isProviderConfigured } from '@/services/ai/aiClient';
import { buildOutlineSources, generateNotesOutline } from '@/services/ai/notesOutline';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { useAppStore } from '@/stores/useAppStore';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Annotation, Book } from '@/types';
import {
  buildThemedMarkdown,
  downloadTextFile,
  exportMultiBookMarkdown,
  type MultiBookEntry,
  type ThemedEntry,
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
/** 生成提纲的最少手记数——太少的原料提不出结构 */
const OUTLINE_MIN_ENTRIES = 3;

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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [outline, setOutline] = useState<NotesOutlineDialogState | null>(null);

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
    // 文本书带 ?ann= 直达批注原句处；图页书页注带 ?page= 直达页码
    const page = book.format !== 'text' && ann.pageIndex != null ? ann.pageIndex + 1 : undefined;
    navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id, ann.id, page));
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

  /** 按主题导出：同一标签下跨书的句子并排成列（写作取材视角）；未分类殿后 */
  const handleExportByTheme = () => {
    setExportMenuOpen(false);
    if (sorted.length === 0) {
      toast(COPY.toast.noAnnotations);
      return;
    }
    const themed: ThemedEntry[] = tags
      .map((tag) => ({
        tagName: tag.name,
        annotations: sorted.filter((ann) => (ann.tagIds ?? []).includes(tag.id)),
      }))
      .filter((entry) => entry.annotations.length > 0)
      .sort((a, b) => b.annotations.length - a.annotations.length);
    const untagged = sorted.filter((ann) => (ann.tagIds ?? []).length === 0);
    if (untagged.length > 0) {
      themed.push({ tagName: COPY.notesTheme.untagged, annotations: untagged });
    }
    const markdown = buildThemedMarkdown(
      themed,
      (bookId) => bookById.get(bookId)?.title ?? COPY.globalSearch.orphanBook,
      new Date(),
      new Map(tags.map((t) => [t.id, t.name])),
      COPY.notesTheme.untagged
    );
    const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    downloadTextFile(`摘抄墙-按主题-${stamp}.md`, markdown);
  };

  /** 生成提纲：以当前筛选结果为原料（按标签筛一组 → 提一份可动笔的骨架） */
  const runOutline = async () => {
    const sources = buildOutlineSources(visible, (bookId) =>
      bookById.get(bookId)?.title ?? COPY.globalSearch.orphanBook
    );
    if (sources.length === 0) {
      setOutline(null);
      return;
    }
    const { settings } = useAppStore.getState();
    const config = {
      baseUrl: settings.knowledgeAiUrl,
      apiKey: settings.knowledgeAiKey,
      model: settings.knowledgeAiModel,
    };
    if (!isProviderConfigured(config)) {
      toast(COPY.notesTheme.aiNotConfigured);
      return;
    }
    const focusLabel = filter.tagId
      ? `#${tagById.get(filter.tagId)?.name ?? ''}`
      : filter.query.trim()
        ? `关键词「${filter.query.trim()}」`
        : undefined;
    setOutline({ status: 'loading', sourceCount: sources.length });
    try {
      const result = await generateNotesOutline(config, sources, focusLabel);
      setOutline({ status: 'done', result, sourceCount: sources.length });
    } catch (e) {
      setOutline({
        status: 'error',
        error: e instanceof Error ? e.message : COPY.notesTheme.outlineFailed,
        sourceCount: sources.length,
      });
    }
  };

  const handleGenerateOutline = () => {
    if (visible.length < OUTLINE_MIN_ENTRIES) {
      toast(COPY.notesTheme.outlineEmpty);
      return;
    }
    void runOutline();
  };

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8">
      <section className="flex flex-col gap-2 border-b border-outline-variant pb-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">摘抄墙</h2>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => navigate(vocabularyPath())}
              title={COPY.vocab.notesEntry}
            >
              <span className="material-symbols-outlined text-icon-md">translate</span>
              {COPY.vocab.notesEntry}
            </button>
            {visible.length >= OUTLINE_MIN_ENTRIES && (
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                onClick={handleGenerateOutline}
                title={COPY.notesTheme.outlineAction}
              >
                <span className="material-symbols-outlined text-icon-md">edit_note</span>
                {COPY.notesTheme.outlineAction}
              </button>
            )}
            {sorted.length > 0 && (
              <div className="relative">
                <button
                  className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
                  onClick={() => setExportMenuOpen((v) => !v)}
                  title={COPY.notesWall.exportAll}
                >
                  <span className="material-symbols-outlined text-icon-md">ios_share</span>
                  导出
                </button>
                {exportMenuOpen && (
                  <>
                    <button
                      aria-label="收起导出菜单"
                      className="fixed inset-0 z-menu cursor-default"
                      onClick={() => setExportMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-8 z-menu w-48 bg-surface-bright border border-outline-variant rounded-card shadow-paper-up py-1 animate-scale-in origin-top-right">
                      <button
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors font-label text-label-md text-on-surface-variant hover:text-primary"
                        onClick={() => {
                          setExportMenuOpen(false);
                          handleExportAll();
                        }}
                      >
                        {COPY.notesTheme.exportByBook}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors font-label text-label-md text-on-surface-variant hover:text-primary"
                        onClick={handleExportByTheme}
                      >
                        {COPY.notesTheme.exportByTheme}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
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
            className="btn-secondary px-6 py-2"
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
                  <span className="material-symbols-outlined text-on-surface-variant text-icon-sm">close</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {KIND_OPTIONS.map((kind) => (
                <button
                  key={kind}
                  onClick={() => setFilterPart({ kind })}
                  className={`chip px-2.5 py-1 text-label-xs ${
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
                    className="card-link rounded-card-lg p-4 md:p-5"
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
                            className="chip px-2 py-0.5 text-label-xs"
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

      {/* 从划线生成的写作提纲 */}
      {outline && (
        <NotesOutlineDialog
          state={outline}
          onClose={() => setOutline(null)}
          onRetry={() => void runOutline()}
        />
      )}
    </div>
  );
};

export default NotesPage;
