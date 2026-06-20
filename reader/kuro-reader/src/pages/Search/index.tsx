import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { ROUTES, bookDetailPath } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { FormatBadge } from '@/components/atoms/FormatBadge';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, coverUrls, tags, loadBooks } = useLibraryStore();
  const [query, setQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const results = useMemo(() => {
    if (!query.trim() && !selectedTagId) return [];
    const q = query.toLowerCase().trim();
    return books.filter((b) => {
      const matchesQuery = !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genres.some((g) => g.toLowerCase().includes(q)) ||
        (Array.isArray(b.tags) ? b.tags : []).some((tid) => {
          const tag = tags.find((t) => t.id === tid);
          return tag && tag.name.toLowerCase().includes(q);
        });
      const matchesTag = !selectedTagId || (Array.isArray(b.tags) ? b.tags : []).includes(selectedTagId);
      return matchesQuery && matchesTag;
    });
  }, [query, books, tags, selectedTagId]);

  const recentBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 6);
  }, [books]);

  return (
    <div className="w-full max-w-max-width-content px-margin-mobile pt-8 flex flex-col gap-12">
      <section className="w-full">
        <div className="relative w-full border-b border-outline-variant focus-within:border-primary transition-colors duration-300">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="w-full bg-transparent border-none py-4 pl-10 pr-4 font-body text-body-lg text-primary placeholder:text-on-surface-variant focus:ring-0 focus:outline-none"
            placeholder="搜索标题、作者或题材..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-2"
              onClick={() => setQuery('')}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </section>

      {tags.length > 0 && (
        <section className="w-full">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={cn(
                'px-3 py-1.5 rounded-full font-label text-label-sm whitespace-nowrap transition-colors border',
                selectedTagId === null
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
              )}
              onClick={() => setSelectedTagId(null)}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={cn(
                  'px-3 py-1.5 rounded-full font-label text-label-sm whitespace-nowrap transition-all border',
                  selectedTagId === tag.id
                    ? 'text-white border-transparent'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary'
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

      {(query.trim() || selectedTagId) && results.length > 0 && (
        <section className="w-full flex flex-col gap-4">
          <h2 className="font-label text-label-md text-on-surface-variant uppercase tracking-widest">
            搜索结果 ({results.length})
          </h2>
          <div className="flex flex-col">
            {results.map((book) => (
              <article
                key={book.id}
                className="py-4 border-b border-surface-variant flex gap-4 items-center group cursor-pointer hover:pl-2 transition-all"
                onClick={() => navigate(bookDetailPath(book.id))}
              >
                <div className="w-12 h-16 flex-shrink-0 border border-outline-variant bg-surface-container overflow-hidden">
                  {coverUrls[book.id] ? (
                    <img src={coverUrls[book.id]} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">menu_book</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <FormatBadge format={book.format} />
                    <span className="font-body text-body-lg text-primary group-hover:underline decoration-1 underline-offset-4 truncate">
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

      {(query.trim() || selectedTagId) && results.length === 0 && (
        <section className="w-full flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">search_off</span>
          <p className="font-body text-body-md text-on-surface-variant">未找到匹配的书籍</p>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">尝试其他关键词或先导入书籍</p>
        </section>
      )}

      {!query.trim() && books.length > 0 && (
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
                <div className="border border-outline-variant bg-surface-container aspect-[2/3] overflow-hidden mb-3">
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
                </div>
                <div className="flex items-center gap-1.5">
                  <FormatBadge format={book.format} />
                  <h4 className="font-body text-body-lg text-primary leading-tight truncate">{book.title}</h4>
                </div>
                <p className="font-label text-label-md text-on-surface-variant mt-1">
                  {book.author || (book.status === 'completed' ? '已完结' : `${book.totalChapters} 话`)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!query.trim() && books.length === 0 && (
        <section className="w-full flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-4">auto_stories</span>
          <p className="font-body text-body-md text-on-surface-variant">书架为空</p>
          <p className="font-label text-label-sm text-on-surface-variant mt-2">导入书籍后可在此搜索</p>
          <button
            className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors mt-4"
            onClick={() => navigate(ROUTES.IMPORT)}
          >
            去导入
          </button>
        </section>
      )}
    </div>
  );
};
