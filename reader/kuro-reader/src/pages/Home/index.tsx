import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/atoms/Button';
import { FormatBadge } from '@/components/atoms/FormatBadge';
import { COPY } from '@/constants/copy';
import { ROUTES, bookDetailPath, readerPathForBook } from '@/constants/routes';
import { STORAGE_KEYS } from '@/constants/storage';
import { annotationRepo } from '@/services/storage/annotationRepo';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { useStatsStore } from '@/stores/useStatsStore';
import type { Annotation, Book } from '@/types';
import { describeLastRead } from '@/utils/readingProgress';
import { findAnniversary, pickDailyRevisit } from '@/utils/revisit';
import { toast } from '@/utils/toast';

const SEAT_FALLBACK_COUNT = 3;
const RECENT_ACCESSIONS_COUNT = 3;
const EXCERPT_PREVIEW_CHARS = 60;
/** 时段边界（小时，含头不含尾）：晨读 / 午后 / 掌灯 / 夜读 */
const MORNING_START_HOUR = 5;
const NOON_START_HOUR = 11;
const EVENING_START_HOUR = 17;
const NIGHT_START_HOUR = 23;
/** 灯芯辉光半径上限（px），随目标进度增长 */
const LAMP_GLOW_MAX_PX = 8;
/** 撤销窗口：移出座位后 5 秒内可撤销（进度本就保留，撤销只是重新显示卡片） */
/** 回望席隐藏记录形态：跨日自动失效 */
interface HiddenRevisit {
  id: string;
  date: string;
}

function toLocalDateStr(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 「今日不再看」：localStorage 记录 + 跨日自动失效（照 hiddenContinueIds 模式） */
function useHiddenRevisits(): {
  isHidden: (id: string) => boolean;
  hide: (id: string) => void;
} {
  const [hidden, setHidden] = useState<HiddenRevisit[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HIDDEN_REVISITS) ?? '[]') as HiddenRevisit[];
    } catch {
      return [];
    }
  });
  const todayStr = toLocalDateStr(new Date());
  const effective = hidden.filter((h) => h.date === todayStr);

  const persist = (next: HiddenRevisit[]) => {
    setHidden(next);
    localStorage.setItem(STORAGE_KEYS.HIDDEN_REVISITS, JSON.stringify(next));
  };

  return {
    isHidden: (id: string) => effective.some((h) => h.id === id),
    hide: (id: string) => persist([...effective, { id, date: todayStr }]),
  };
}

/** 时段问候（建议书 2.8-4）：一天至多四变，无动画 */
const getGreeting = (hour: number): string => {
  if (hour >= MORNING_START_HOUR && hour < NOON_START_HOUR) return '早安';
  if (hour >= NOON_START_HOUR && hour < EVENING_START_HOUR) return '午后好';
  if (hour >= EVENING_START_HOUR && hour < NIGHT_START_HOUR) return '掌灯时分';
  return '夜深了';
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    books,
    coverUrls,
    readingProgress,
    loadBooks,
    getContinueReading,
    dismissContinueReading,
    restoreContinueReading,
  } = useLibraryStore();
  const { dailyGoalMinutes, getTodayMinutes } = useStatsStore();

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [seatMenuFor, setSeatMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    let cancelled = false;
    annotationRepo.getAll().then((all) => {
      if (!cancelled) setAnnotations(all);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!seatMenuFor) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSeatMenuFor(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [seatMenuFor]);

  const continueReading = getContinueReading();
  const seatBook = continueReading[0];
  const otherSeats = continueReading.slice(1, SEAT_FALLBACK_COUNT);

  const todayMinutes = getTodayMinutes();
  const goalPct = dailyGoalMinutes > 0 ? Math.min(100, (todayMinutes / dailyGoalMinutes) * 100) : 0;
  const goalLit = goalPct >= 100;

  const bookById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const excerpts = useMemo(
    () =>
      [...annotations]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 2)
        .map((ann) => ({ ann, book: bookById.get(ann.bookId) }))
        .filter((x): x is { ann: Annotation; book: Book } => x.book !== undefined),
    [annotations, bookById]
  );

  const recentAccessions = useMemo(
    () =>
      [...books]
        .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        .slice(0, RECENT_ACCESSIONS_COUNT),
    [books]
  );

  // 回望席（呼吸的呼出环节）：周年手记/入藏优先，否则当日确定性回访
  const anniversary = useMemo(() => findAnniversary(annotations, books), [annotations, books]);
  const revisitPick = useMemo(
    () => pickDailyRevisit(books, readingProgress, annotations),
    [books, readingProgress, annotations]
  );
  /** 周年卡优先；无周年时展示回访卡 */
  const anniversaryBook = anniversary?.kind === 'book-added' ? anniversary.book : undefined;
  const anniversaryAnn = anniversary?.annotation;
  const revisitCardBook = anniversaryBook ?? revisitPick?.book ?? null;
  const revisitCardAnn = anniversaryAnn ?? revisitPick?.annotation ?? undefined;
  const hiddenRevisits = useHiddenRevisits();

  const handleDismissSeat = (bookId: string) => {
    setSeatMenuFor(null);
    dismissContinueReading(bookId);
    toast('已移出座位（进度还在）', {
      durationMs: 5000,
      action: { label: '撤销', onAction: () => restoreContinueReading(bookId) },
    });
  };

  const openExcerpt = (ann: Annotation, book: Book) => {
    const chapter = book.chapters[ann.chapterIndex];
    // 文本书带 ?ann= 直达批注原句处
    navigate(readerPathForBook(book, chapter?.id, ann.id));
  };

  const renderCover = (book: Book, className: string) =>
    coverUrls[book.id] ? (
      <img src={coverUrls[book.id]} alt={book.title} className={`w-full h-full object-cover ${className}`} />
    ) : (
      <div className="w-full h-full bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-on-surface-faint text-4xl">auto_stories</span>
      </div>
    );

  // ── 活空态：图书馆在等你 ──
  if (books.length === 0) {
    return (
      <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-16 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full border border-outline-variant flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-icon-lg text-on-surface-faint">local_library</span>
        </div>
        <h2 className="font-display text-display-lg-mobile text-primary mb-3">书架还空着</h2>
        <p className="font-body text-body-md text-on-surface-variant mb-10">
          从采编台带回第一本书吧
        </p>
        <div className="flex flex-col w-full max-w-xs gap-3">
          <Button variant="accent" size="lg" onClick={() => navigate(ROUTES.IMPORT)}>
            去采编
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-max-width-content mx-auto px-margin-mobile md:px-0 pt-8 pb-8">
      {/* 问候 + 你的座位 */}
      {seatBook && (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-display-lg-mobile text-primary leading-tight">
              {getGreeting(new Date().getHours())}。
              <span className="block text-headline-sm text-on-surface-variant mt-1">
                {describeLastRead(seatBook.lastReadAt) || '这一次'}，你在读——
              </span>
            </h2>
          </div>

          {(() => {
            const progress = readingProgress[seatBook.id];
            const pct = progress ? Math.round(progress.percentage) : 0;
            const chapter = progress?.chapterId
              ? seatBook.chapters.find((ch) => ch.id === progress.chapterId) ?? seatBook.chapters[0]
              : seatBook.chapters[0];
            return (
              <article
                className="relative flex border border-outline-variant rounded-card-lg shadow-paper overflow-hidden bg-surface-container-low cursor-pointer group"
                onClick={() => navigate(readerPathForBook(seatBook, chapter?.id))}
              >
                <div className="w-1/3 md:w-1/4 flex-shrink-0 border-r border-outline-variant bg-surface-container relative">
                  {renderCover(seatBook, 'aspect-[2/3]')}
                  {/* 进度丝带：书脊上的缎带，长度即进度 */}
                  <div
                    aria-hidden="true"
                    className="absolute top-2 right-0 w-1.5 bg-seal rounded-l-sm"
                    style={{ height: `calc(${pct}% - 8px)`, minHeight: 8 }}
                  />
                </div>
                <div className="p-4 md:p-6 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-start gap-2 mb-1">
                      <h3 className="font-display text-headline-md text-primary leading-tight truncate flex-1">
                        {seatBook.title}
                      </h3>
                      <div className="relative flex-shrink-0" ref={menuRef}>
                        <button
                          aria-label="座位选项"
                          className="w-8 h-8 -mt-1 -mr-1 flex items-center justify-center rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSeatMenuFor(seatMenuFor === seatBook.id ? null : seatBook.id);
                          }}
                        >
                          <span className="material-symbols-outlined text-icon-md">more_vert</span>
                        </button>
                        {seatMenuFor === seatBook.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-surface-bright border border-outline-variant rounded-card shadow-paper-up z-menu py-1 animate-scale-in origin-top-right">
                            <button
                              className="w-full text-left px-4 py-2.5 font-label text-label-md text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissSeat(seatBook.id);
                              }}
                            >
                              不再显示（进度保留）
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="font-label text-label-sm text-on-surface-variant">
                      {chapter
                        ? `第 ${chapter.number} ${seatBook.format === 'text' ? '章' : '话'}`
                        : `${seatBook.totalChapters} 话`}
                      <span className="font-mono ml-2">{pct}%</span>
                    </p>
                  </div>
                  <div className="mt-auto">
                    <div className="w-full h-0.5 bg-surface-container-highest mb-3" aria-hidden="true">
                      <div
                        className="h-full bg-seal transition-all duration-flow"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <Button variant="accent" size="md" className="w-full">
                      继续阅读
                    </Button>
                  </div>
                </div>
              </article>
            );
          })()}

          {otherSeats.map((book) => {
            const progress = readingProgress[book.id];
            const pct = progress ? Math.round(progress.percentage) : 0;
            return (
              <button
                key={book.id}
                className="w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-card hover:bg-surface-container-low transition-colors text-left"
                onClick={() => navigate(readerPathForBook(book))}
              >
                <div className="w-9 h-12 flex-shrink-0 rounded-sm overflow-hidden bg-surface-container border border-outline-variant">
                  {renderCover(book, '')}
                </div>
                <span className="font-body text-body-md text-primary truncate flex-1">{book.title}</span>
                <span className="font-mono text-label-sm text-on-surface-variant flex-shrink-0">{pct}%</span>
                <span
                  aria-hidden="true"
                  className="w-16 h-0.5 bg-surface-container-highest flex-shrink-0 overflow-hidden rounded-full"
                >
                  <span className="block h-full bg-seal" style={{ width: `${pct}%` }} />
                </span>
              </button>
            );
          })}
        </section>
      )}

      {/* 今日之灯 */}
      <section className="mb-10">
        <button
          className="w-full flex items-center gap-4 p-4 rounded-card border border-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors text-left"
          onClick={() => navigate(ROUTES.STATS)}
          aria-label={`今日已读 ${todayMinutes} 分钟，目标 ${dailyGoalMinutes} 分钟，查看台账`}
        >
          <span
            className="material-symbols-outlined text-icon-lg flex-shrink-0 transition-all"
            style={{
              color: 'rgb(var(--color-lamp))',
              fontVariationSettings: goalLit ? "'FILL' 1" : "'FILL' 0",
              filter: `drop-shadow(0 0 ${Math.round((goalPct / 100) * LAMP_GLOW_MAX_PX)}px rgba(var(--color-lamp) / 0.6))`,
            }}
          >
            lightbulb
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-baseline justify-between mb-1.5">
              <span className="font-label text-label-md text-on-surface">今日之灯</span>
              <span className="font-mono text-label-sm text-on-surface-variant">
                {todayMinutes}/{dailyGoalMinutes} 分钟
              </span>
            </span>
            <span className="block h-1 rounded-full bg-surface-container-highest overflow-hidden">
              <span
                className="block h-full rounded-full transition-all duration-flow"
                style={{
                  width: `${goalPct}%`,
                  backgroundColor: 'rgb(var(--color-lamp))',
                }}
              />
            </span>
            <span className="block font-label text-label-sm text-on-surface-faint mt-1.5">
              {goalLit
                ? '今日之灯已点亮'
                : `再读 ${Math.max(1, dailyGoalMinutes - todayMinutes)} 分钟，把它点亮`}
            </span>
          </span>
        </button>
      </section>

      {/* 摘抄墙：最近的划线与批注 */}
      {excerpts.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display text-headline-md text-on-background">摘抄墙</h2>
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => navigate(ROUTES.NOTES)}
            >
              全部
              <span className="material-symbols-outlined text-icon-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {excerpts.map(({ ann, book }) => (
              <button
                key={ann.id}
                className="text-left p-4 rounded-card bg-surface-container-low border border-outline-variant hover:bg-surface-container transition-colors"
                onClick={() => openExcerpt(ann, book)}
              >
                <p className="font-body text-body-md text-on-surface leading-relaxed line-clamp-2">
                  「{ann.selectedText.slice(0, EXCERPT_PREVIEW_CHARS)}
                  {ann.selectedText.length > EXCERPT_PREVIEW_CHARS ? '…' : ''}」
                </p>
                <p className="font-label text-label-sm text-on-surface-faint mt-2 truncate">
                  ——《{book.title}》· {ann.chapterTitle}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 回望席：呼吸的呼出环节——周年手记优先，否则当日确定性回访（每回望席至多一张卡） */}
      {(() => {
        if (!revisitCardBook) return null;
        if (hiddenRevisits.isHidden(revisitCardBook.id)) return null;

        const reasonText = anniversaryAnn
          ? COPY.revisit.anniversaryNote(anniversary?.yearsAgo ?? 1)
          : anniversaryBook
            ? COPY.revisit.anniversaryBook(anniversary?.yearsAgo ?? 1)
            : revisitPick?.reason === 'annotated-long-unread'
              ? COPY.revisit.revisitAnnotated
              : revisitPick?.reason === 'long-unread'
                ? COPY.revisit.revisitLongUnread
                : COPY.revisit.revisitRandom;

        return (
          <section className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <h2 className="font-display text-headline-md text-on-background">{COPY.revisit.sectionTitle}</h2>
              <button
                className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => {
                  hiddenRevisits.hide(revisitCardBook.id);
                  toast('今天先不看它', { durationMs: 3000 });
                }}
              >
                {COPY.revisit.dismissToday}
              </button>
            </div>
            <article
              className="flex border border-outline-variant rounded-card-lg shadow-paper overflow-hidden bg-surface-container-low cursor-pointer"
              onClick={() =>
                revisitCardAnn
                  ? openExcerpt(revisitCardAnn, revisitCardBook)
                  : navigate(bookDetailPath(revisitCardBook.id))
              }
            >
              <div className="w-24 md:w-32 flex-shrink-0 border-r border-outline-variant bg-surface-container">
                {renderCover(revisitCardBook, 'aspect-[2/3]')}
              </div>
              <div className="p-4 md:p-5 flex flex-col justify-center flex-1 min-w-0">
                <p className="font-label text-label-sm text-seal mb-1">{reasonText}</p>
                {revisitCardAnn && (
                  <p className="font-body text-body-md text-on-surface leading-relaxed line-clamp-2 mb-1.5">
                    「{revisitCardAnn.selectedText.slice(0, EXCERPT_PREVIEW_CHARS)}
                    {revisitCardAnn.selectedText.length > EXCERPT_PREVIEW_CHARS ? '…' : ''}」
                  </p>
                )}
                <p className="font-body text-body-md text-primary truncate">
                  《{revisitCardBook.title}》
                  {revisitCardAnn ? ` · ${revisitCardAnn.chapterTitle}` : ''}
                </p>
              </div>
            </article>
          </section>
        );
      })()}

      {/* 新近入藏 */}
      {recentAccessions.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="font-display text-headline-md text-on-background">新近入藏</h2>
            <button
              className="font-label text-label-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              onClick={() => navigate(ROUTES.IMPORT)}
            >
              去采编
              <span className="material-symbols-outlined text-icon-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {recentAccessions.map((book) => (
              <button
                key={book.id}
                className="text-left group flex flex-col"
                onClick={() => navigate(bookDetailPath(book.id))}
              >
                <div className="border border-outline-variant bg-surface-container aspect-[2/3] overflow-hidden mb-2 rounded-sm">
                  {renderCover(book, 'group-hover:scale-105 transition-transform duration-500 ease-out')}
                </div>
                <div className="flex items-center gap-1.5">
                  <FormatBadge format={book.format} />
                  <span className="font-body text-body-sm text-primary truncate">{book.title}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
