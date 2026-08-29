import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { OpdsEntry } from '@/services/opds';
import { downloadOpdsBook, fetchOpdsFeed } from '@/services/opds';
import type { Book } from '@/types';
import { cn } from '@/utils/cn';

interface OpdsBrowserProps {
  catalogUrl: string;
  username: string;
  password: string;
  /** 下载后的导入回调：返回导入结果（null 表示失败，错误已由调用方呈现） */
  onImportFile: (file: File) => Promise<Book | null>;
}

interface Crumb {
  title: string;
  url: string;
}

const credentialsOf = (username: string, password: string) => ({ username, password });

/** OPDS 目录浏览器：面包屑栈导航 + 出版物下载导入 */
export const OpdsBrowser: React.FC<OpdsBrowserProps> = ({
  catalogUrl,
  username,
  password,
  onImportFile,
}) => {
  const [trail, setTrail] = useState<Crumb[]>([]);
  const [entries, setEntries] = useState<OpdsEntry[]>([]);
  const [feedTitle, setFeedTitle] = useState('');
  const [nextUrl, setNextUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyEntry, setBusyEntry] = useState<string | null>(null);
  const [importedTitle, setImportedTitle] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const currentUrl = trail.length > 0 ? trail[trail.length - 1].url : catalogUrl;
  const credentials = credentialsOf(username, password);

  const openFeed = useCallback(
    async (url: string, crumb?: Crumb) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const feed = await fetchOpdsFeed(url, credentials);
        setEntries(feed.entries.filter((e) => e.isCatalog || e.acquisitions.length > 0));
        setFeedTitle(feed.title);
        setNextUrl(feed.nextHref);
        if (crumb) {
          setTrail((prev) => {
            const existingIndex = prev.findIndex((c) => c.url === crumb.url);
            if (existingIndex >= 0) return prev.slice(0, existingIndex + 1);
            return [...prev, crumb];
          });
        }
      } catch (e) {
        setLoadError((e as Error).message || '目录读取失败');
      } finally {
        setIsLoading(false);
      }
    },
    [credentials]
  );

  // 首次挂载加载根目录
  const didOpenRef = useRef(false);
  useEffect(() => {
    if (didOpenRef.current) return;
    didOpenRef.current = true;
    openFeed(catalogUrl);
  }, [catalogUrl, openFeed]);

  const handleOpenEntry = (entry: OpdsEntry) => {
    if (entry.isCatalog && entry.subsectionHref) {
      openFeed(entry.subsectionHref, { title: entry.title, url: entry.subsectionHref });
    }
  };

  const handleDownload = async (entry: OpdsEntry) => {
    if (busyEntry) return;
    setBusyEntry(entry.id);
    setActionError(null);
    setImportedTitle(null);
    try {
      const file = await downloadOpdsBook(entry, credentials);
      const book = await onImportFile(file);
      if (book) setImportedTitle(book.title);
    } catch (e) {
      setActionError((e as Error).message || '下载失败');
    } finally {
      setBusyEntry(null);
    }
  };

  const handleLoadMore = () => {
    if (nextUrl) openFeed(nextUrl);
  };

  return (
    <main className="w-full max-w-max-width-content px-margin-mobile md:px-margin-desktop pt-6 pb-32 flex-grow flex flex-col gap-4">
      {/* 面包屑（目录栈） */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        <button
          className="font-label text-label-sm text-on-surface-variant hover:text-primary transition-colors py-1 px-1 whitespace-nowrap"
          onClick={() => {
            setTrail([]);
            openFeed(catalogUrl);
          }}
        >
          目录首页
        </button>
        {trail.map((crumb, i) => (
          <React.Fragment key={crumb.url}>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
            <button
              className={cn(
                'font-label text-label-sm py-1 px-1 whitespace-nowrap transition-colors',
                i === trail.length - 1 ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-primary'
              )}
              onClick={() => openFeed(crumb.url, crumb)}
            >
              {crumb.title}
            </button>
          </React.Fragment>
        ))}
      </div>

      {!isLoading && !loadError && feedTitle && (
        <p className="font-label text-label-sm text-on-surface-variant">{feedTitle}</p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span className="font-label text-label-sm">正在读取目录...</span>
        </div>
      )}

      {loadError && (
        <div className="border border-error rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-body-md text-error">{loadError}</p>
          </div>
          <button
            className="self-start font-label text-label-sm text-primary hover:opacity-80 transition-opacity"
            onClick={() => openFeed(currentUrl)}
          >
            重试
          </button>
        </div>
      )}

      {/* 条目列表：目录在前 */}
      {!isLoading && !loadError && (
        <div className="flex flex-col gap-1">
          {[...entries].sort((a) => (a.isCatalog ? -1 : 1)).map((entry) => {
            const isBusy = busyEntry === entry.id;
            return (
              <button
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 py-3 px-3 rounded-lg transition-colors text-left',
                  entry.isCatalog || (!isBusy && !entry.isCatalog)
                    ? 'hover:bg-surface-variant'
                    : 'opacity-50 cursor-default'
                )}
                onClick={() => (entry.isCatalog ? handleOpenEntry(entry) : handleDownload(entry))}
                disabled={isBusy}
                data-ui-control
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  {entry.isCatalog ? 'folder' : isBusy ? 'progress_activity animate-spin' : 'book'}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-body text-body-md text-on-surface block truncate">{entry.title}</span>
                  <span className="font-label text-label-sm text-on-surface-variant block truncate">
                    {isBusy
                      ? '下载并导入中...'
                      : entry.isCatalog
                        ? entry.content ?? '子目录'
                        : entry.acquisitions[0]?.type?.split(';')[0] ?? '出版物'}
                  </span>
                </span>
                {entry.isCatalog && (
                  <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                )}
              </button>
            );
          })}
          {nextUrl && !isLoading && (
            <button
              className="py-3 font-label text-label-sm text-primary hover:opacity-80 transition-opacity"
              onClick={handleLoadMore}
            >
              加载更多
            </button>
          )}
          {!isLoading && entries.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">rss_feed</span>
              <p className="font-body text-body-md text-on-surface-variant">此目录为空</p>
            </div>
          )}
        </div>
      )}

      {importedTitle && (
        <section className="border border-primary rounded-lg p-4 bg-surface-bright">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-body text-body-md text-primary">《{importedTitle}》导入成功，可在书架中查看</p>
          </div>
        </section>
      )}

      {actionError && (
        <div className="border border-error rounded-lg p-4 bg-surface-bright">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <p className="font-body text-body-md text-error">{actionError}</p>
          </div>
        </div>
      )}
    </main>
  );
};
