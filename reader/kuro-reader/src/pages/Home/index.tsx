import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { ROUTES, comicDetailPath, readerPath } from '@/constants/routes';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { comics, coverUrls, readingProgress, loadComics, getContinueReading, removeContinueReading, getFavorites } = useLibraryStore();

  useEffect(() => {
    loadComics();
  }, [loadComics]);

  const continueReading = getContinueReading().slice(0, 1);
  const favorites = getFavorites();

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8">
      {continueReading.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-headline-md text-on-background mb-6">继续阅读</h2>
          {continueReading.map((comic) => {
            const progress = readingProgress[comic.id];
            const pct = progress ? Math.round(progress.percentage) : 0;
            const chapter = progress?.chapterId
              ? comic.chapters.find((ch) => ch.id === progress.chapterId) ?? comic.chapters[0]
              : comic.chapters[0];
            return (
              <article
                key={comic.id}
                className="flex flex-row border border-outline-variant rounded overflow-hidden bg-background hover:bg-surface-container-low transition-colors group cursor-pointer noise-overlay mb-4 relative"
                onClick={() => navigate(readerPath(comic.id, chapter?.id))}
              >
                <button
                  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-surface transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeContinueReading(comic.id);
                  }}
                  aria-label="移除"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
                <div className="w-1/3 md:w-1/4 flex-shrink-0 border-r border-outline-variant bg-surface-container">
                  {coverUrls[comic.id] ? (
                    <img
                      src={coverUrls[comic.id]}
                      alt={comic.title}
                      className="w-full h-full object-cover aspect-[2/3]"
                    />
                  ) : (
                    <div className="w-full h-full aspect-[2/3] bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-4xl">menu_book</span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-6 flex flex-col justify-between flex-1">
                  <div>
                    {comic.genres.length > 0 && (
                      <span className="inline-block border border-outline-variant text-on-surface-variant font-label text-label-sm px-2 py-1 rounded mb-3">
                        {comic.genres[0]}
                      </span>
                    )}
                    <h3 className="font-display text-headline-md text-primary leading-tight mb-2 group-hover:underline decoration-1 underline-offset-4">
                      {comic.title}
                    </h3>
                    <p className="font-body text-body-md text-on-surface-variant mb-4">
                      {chapter ? `第 ${chapter.number} 话` : `${comic.totalChapters} 话`}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label text-label-sm text-on-surface-variant">阅读进度</span>
                      <span className="font-label text-label-sm text-primary">{pct}%</span>
                    </div>
                    <div className="w-full h-[2px] bg-secondary-container">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-display text-headline-md text-on-background">我的收藏</h2>
          <button
            className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
            onClick={() => navigate(ROUTES.LIBRARY)}
          >
            全部
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {favorites.slice(0, 6).map((comic) => (
              <article
                key={comic.id}
                className="group cursor-pointer flex flex-col"
                onClick={() => navigate(comicDetailPath(comic.id))}
              >
                <div className="border border-outline-variant bg-surface-container aspect-[2/3] overflow-hidden mb-3">
                  {coverUrls[comic.id] ? (
                    <img
                      src={coverUrls[comic.id]}
                      alt={comic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-5xl">auto_stories</span>
                    </div>
                  )}
                </div>
                <h4 className="font-body text-body-lg text-primary leading-tight truncate">{comic.title}</h4>
                <p className="font-label text-label-md text-on-surface-variant mt-1">
                  {comic.status === 'completed' ? '已完结' : `${comic.totalChapters} 话`}
                </p>
              </article>
            ))}
          </div>
        ) : comics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {comics.slice(0, 6).map((comic) => (
              <article
                key={comic.id}
                className="group cursor-pointer flex flex-col"
                onClick={() => navigate(comicDetailPath(comic.id))}
              >
                <div className="border border-outline-variant bg-surface-container aspect-[2/3] overflow-hidden mb-3">
                  {coverUrls[comic.id] ? (
                    <img
                      src={coverUrls[comic.id]}
                      alt={comic.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-5xl">auto_stories</span>
                    </div>
                  )}
                </div>
                <h4 className="font-body text-body-lg text-primary leading-tight truncate">{comic.title}</h4>
                <p className="font-label text-label-md text-on-surface-variant mt-1">
                  {comic.status === 'completed' ? '已完结' : `${comic.totalChapters} 话`}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-body text-body-md text-on-surface-variant mb-6">还没有收藏的漫画</p>
            <button
              className="font-label text-label-md text-primary border border-outline-variant px-6 py-2 hover:bg-surface-variant transition-colors"
              onClick={() => navigate(ROUTES.IMPORT)}
            >
              去导入
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
