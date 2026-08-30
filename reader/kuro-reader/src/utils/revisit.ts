/** 回望席：让图书馆「呼出」——周年手记、当日回访、重读候选的确定性纯函数 */

import type { Annotation, Book, ReadingProgress } from '@/types';

export interface AnniversaryHit {
  kind: 'annotation' | 'book-added';
  /** 周年对应的当年日期（今日） */
  date: string;
  /** 距今整年数（≥1） */
  yearsAgo: number;
  annotation?: Annotation;
  book?: Book;
}

export interface RevisitPick {
  book: Book;
  /** 该书与回望相关的一条手记（可能无） */
  annotation?: Annotation;
  /** 推荐语动机（用于卡片文案渲染方） */
  reason: 'annotated-long-unread' | 'long-unread' | 'deterministic';
}

const MS_PER_DAY = 86400000;
/** 「N 天未读」的门槛：超过才算「久未翻阅」 */
const LONG_UNREAD_DAYS = 30;
/** 重读候选的未读门槛（天） */
const REREAD_UNREAD_DAYS = 45;
/** 回望席展示上限 */
export const REVISIT_MAX_CARDS = 2;

/** 本地日期 YYYY-MM-DD */
function toLocalDateStr(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysSince(date: Date | string, today: Date): number {
  return Math.floor((today.getTime() - new Date(date).getTime()) / MS_PER_DAY);
}

function lastReadDays(book: Book, today: Date): number {
  return book.lastReadAt ? daysSince(book.lastReadAt, today) : Number.MAX_SAFE_INTEGER;
}

function isReadFinished(book: Book, progress?: ReadingProgress): boolean {
  return (progress?.percentage ?? 0) >= 100 || book.chapters.every((c) => c.status === 'read');
}

/**
 * 周年检索：同月同日且 ≥1 年前的手记/入藏。
 * 优先手记（有原句可回访），同年份取更新的；无周年时降级返回 null（调用方可再退「上月今日」）。
 */
export function findAnniversary(
  annotations: Annotation[],
  books: Book[],
  today: Date = new Date()
): AnniversaryHit | null {
  const month = today.getMonth();
  const day = today.getDate();

  const anniversaries: AnniversaryHit[] = [];
  for (const ann of annotations) {
    const created = new Date(ann.createdAt);
    const yearsAgo = today.getFullYear() - created.getFullYear();
    if (yearsAgo >= 1 && created.getMonth() === month && created.getDate() === day) {
      anniversaries.push({ kind: 'annotation', date: toLocalDateStr(today), yearsAgo, annotation: ann });
    }
  }
  for (const book of books) {
    const created = new Date(book.addedAt);
    const yearsAgo = today.getFullYear() - created.getFullYear();
    if (yearsAgo >= 1 && created.getMonth() === month && created.getDate() === day) {
      anniversaries.push({ kind: 'book-added', date: toLocalDateStr(today), yearsAgo, book });
    }
  }

  if (anniversaries.length === 0) return null;
  // 手记周年优先，其后整年数大者优先，再取更新的
  return anniversaries.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'annotation' ? -1 : 1;
    if (a.yearsAgo !== b.yearsAgo) return b.yearsAgo - a.yearsAgo;
    const aTime = a.annotation ? +new Date(a.annotation.updatedAt) : a.book ? +new Date(a.book.addedAt) : 0;
    const bTime = b.annotation ? +new Date(b.annotation.updatedAt) : b.book ? +new Date(b.book.addedAt) : 0;
    return bTime - aTime;
  })[0];
}

/** 伪随机数生成器（mulberry32）：同一种子产出同一序列，保证「当日回访」全天稳定。
 *  函数体内的常量是算法规定的位混淆参数，非业务阈值。 */
/* eslint-disable no-magic-numbers */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* eslint-enable no-magic-numbers */

/** 日期字符串 → 稳定数值种子（同一日期同一种子）：YYYYMMDD 十进制编码 */
export function dateSeed(date: Date): number {
  // eslint-disable-next-line no-magic-numbers -- YYYYMMDD 进制位权
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * 当日回访：以日期为种子从候选中确定性抽取（当天刷新页面不变，明天换一批）。
 * 候选优先级：有手记且久未翻阅 > 久未翻阅 > 全部藏书。
 * progress 保留在签名中供调用方传递上下文（当前判定仅依赖 lastReadAt/手记）。
 */
export function pickDailyRevisit(
  books: Book[],
  _progress: Record<string, ReadingProgress>,
  annotations: Annotation[],
  today: Date = new Date()
): RevisitPick | null {
  const candidates = books.filter((b) => b.chapters.length > 0);
  if (candidates.length === 0) return null;

  const annotationsByBook = new Map<string, Annotation[]>();
  for (const ann of annotations) {
    const list = annotationsByBook.get(ann.bookId) ?? [];
    list.push(ann);
    annotationsByBook.set(ann.bookId, list);
  }

  const annotatedLongUnread = candidates.filter(
    (b) => (annotationsByBook.get(b.id)?.length ?? 0) > 0 && lastReadDays(b, today) > LONG_UNREAD_DAYS
  );
  const longUnread = candidates.filter((b) => lastReadDays(b, today) > LONG_UNREAD_DAYS);
  const pool = annotatedLongUnread.length > 0 ? annotatedLongUnread : longUnread.length > 0 ? longUnread : candidates;

  const rng = mulberry32(dateSeed(today));
  const book = pool[Math.floor(rng() * pool.length)];

  const picks = annotationsByBook.get(book.id) ?? [];
  const annotation = picks.length > 0 ? picks[Math.floor(rng() * picks.length)] : undefined;
  const reason: RevisitPick['reason'] =
    annotatedLongUnread.includes(book) ? 'annotated-long-unread' : longUnread.includes(book) ? 'long-unread' : 'deterministic';

  return { book, annotation, reason };
}

/**
 * 重读候选：有手记、久未翻阅，且（未读完，或读完但仍留有笔记）。
 * 按「手记多者在前」排序——留痕越多的书越值得回访。
 */
export function findRereadCandidates(
  books: Book[],
  progress: Record<string, ReadingProgress>,
  annotations: Annotation[],
  today: Date = new Date()
): Book[] {
  const annotationsByBook = new Map<string, number>();
  for (const ann of annotations) {
    annotationsByBook.set(ann.bookId, (annotationsByBook.get(ann.bookId) ?? 0) + 1);
  }

  return books
    .filter((b) => {
      const noteCount = annotationsByBook.get(b.id) ?? 0;
      if (noteCount === 0) return false;
      if (lastReadDays(b, today) <= REREAD_UNREAD_DAYS) return false;
      return !isReadFinished(b, progress[b.id]) || noteCount > 0;
    })
    .sort((a, b) => (annotationsByBook.get(b.id) ?? 0) - (annotationsByBook.get(a.id) ?? 0));
}

export interface RevisitCardTargets {
  /** 卡片展示与跳转的书（周年手记所属书 / 周年入藏书 / 当日回访书；书已移出时为 null） */
  book: Book | null;
  /** 卡片携带的手记（周年手记或回访书的一条手记） */
  annotation?: Annotation;
}

/**
 * 解析回望席卡片目标：周年优先——
 * - 手记周年：书必须是该手记所属的书（此前错配为当日回访书，导致显示与跳转都指向无关的书）
 * - 入藏周年：书即当年入藏的书（无手记）
 * - 无周年：当日确定性回访
 * 周年手记所属书已被移出时降级为当日回访；回访书缺失时为 null（区块不渲染）。
 */
export function resolveRevisitTargets(
  anniversary: AnniversaryHit | null,
  pick: RevisitPick | null,
  bookById: ReadonlyMap<string, Book>
): RevisitCardTargets {
  if (anniversary) {
    if (anniversary.kind === 'book-added' && anniversary.book) {
      return { book: anniversary.book };
    }
    if (anniversary.annotation) {
      const book = bookById.get(anniversary.annotation.bookId);
      if (book) return { book, annotation: anniversary.annotation };
    }
  }
  if (pick) return { book: pick.book, annotation: pick.annotation };
  return { book: null };
}
