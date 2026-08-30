import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ROUTES, readerPathForBook } from '@/constants/routes';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import type { Annotation, Book } from '@/types';

/** 引文预览长度（字符） */
const EXCERPT_CHARS = 80;

/** 手记 · 摘抄墙（建议书 6.x / Phase 5）：跨书批注与划线的聚合视图——活图书馆的镇馆之宝。 */
export const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, loadBooks } = useLibraryStore();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

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

  const sorted = useMemo(
    () =>
      [...annotations].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [annotations]
  );

  const openInReader = (ann: Annotation, book: Book) => {
    navigate(readerPathForBook(book, book.chapters[ann.chapterIndex]?.id));
  };

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8">
      <section className="flex flex-col gap-2 border-b border-outline-variant pb-6 mb-8">
        <h2 className="font-display text-display-lg-mobile md:text-display-lg text-primary">摘抄墙</h2>
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
        <div className="flex flex-col gap-3">
          {sorted.map((ann) => {
            const book = bookById.get(ann.bookId);
            const excerpt = ann.selectedText.slice(0, EXCERPT_CHARS);
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
                <p className="font-label text-label-sm text-on-surface-faint mt-2.5 truncate">
                  ——《{book?.title ?? '已移出的书'}》· {ann.chapterTitle}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
