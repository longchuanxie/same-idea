import axios from 'axios';


import { annotationRepo } from '@/services/storage/annotationRepo';
import { bookmarkRepo } from '@/services/storage/bookmarkRepo';
import { progressRepo } from '@/services/storage/progressRepo';
import { tombstoneRepo, type TombstoneKind } from '@/services/storage/tombstoneRepo';
import type { Annotation, Bookmark, ReadingProgress } from '@/types';

/** 同步载荷版本：v2 起携带可选 stats；v3 起携带可选 tombstones（删除墓碑） */
const SYNC_VERSION = 3;
/** 墓碑保留期：超过后随合并清理，防止载荷无限膨胀 */
const TOMBSTONE_TTL_DAYS = 90;
/** 同步文件在 WebDAV 根下的固定路径 */
const SYNC_FILE_PATH = '/kuro-reader-sync.json';
/** WebDAV 404 = 远端尚无同步文件（首次同步），直接上传 */
const HTTP_NOT_FOUND = 404;

/** 阅读时长簿（可同步形态）：sessions 按 (date,bookId) 归并，goal 以较新者为准 */
export interface SyncedStats {
  readingSessions: { date: string; minutes: number; bookId: string }[];
  dailyGoalMinutes: number;
}

/** 载荷中的删除墓碑形态（与 tombstoneRepo.TombstoneRecord 同构，JSON 序列化安全） */
export interface SyncTombstone {
  kind: TombstoneKind;
  key: string;
  deletedAt: string;
}

export interface SyncCredentials {
  /** WebDAV 根地址，如 http://nas:5005/dav */
  serverAddress: string;
  username?: string;
  password?: string;
}

export interface SyncPayload {
  version: number;
  exportedAt: string;
  readingProgress: Record<string, ReadingProgress>;
  bookmarks: Bookmark[];
  annotations: Annotation[];
  /** v2 起：可选。旧载荷/旧客户端无此字段，合并时保留本地 */
  stats?: SyncedStats;
  /** v3 起：可选。删除墓碑，合并时剔除双方已删除的记录 */
  tombstones?: SyncTombstone[];
}

export type SyncDirection = 'pushed' | 'merged';

export interface SyncResult {
  direction: SyncDirection;
  exportedAt: string;
  /** 本次同步的最终载荷（与远端一致）。多端「拉取」靠调用方 applyMergedPayloadToLocal 落地本地。 */
  payload: SyncPayload;
  counts: {
    progress: number;
    bookmarks: number;
    annotations: number;
  };
}

/** 规范化 WebDAV 根地址并拼接同步文件 URL */
export function buildSyncUrl(serverAddress: string): string {
  let url = serverAddress.trim();
  if (!url.startsWith('http')) url = `http://${url}`;
  url = url.replace(/\/+$/, '');
  return `${url}${SYNC_FILE_PATH}`;
}

function authConfig(credentials?: SyncCredentials) {
  return credentials?.username
    ? { auth: { username: credentials.username, password: credentials.password ?? '' } }
    : {};
}

/** 合并辅助：按时间戳取较新者（缺失时间戳视为 0，优先保留本地） */
function newerOf<T>(local: T, remote: T, localTime: number, remoteTime: number): T {
  return remoteTime > localTime ? remote : local;
}

/**
 * 归并阅读时长簿（v2）：
 * - sessions 按 (date, bookId) 键取 minutes 较大者——同一设备不会重复计同一天的同一本书，
 *   取 max 而非求和以避免双设备把同一次阅读算两遍；
 * - dailyGoalMinutes 取 exportedAt 较新的载荷的值；
 * - 一方无 stats（旧载荷）时保留另一方。
 */
export function mergeSyncedStats(
  localStats: SyncedStats | undefined,
  remoteStats: SyncedStats | undefined,
  localExportedAt: string,
  remoteExportedAt: string
): SyncedStats | undefined {
  if (!localStats) return remoteStats;
  if (!remoteStats) return localStats;

  const byKey = new Map<string, number>();
  for (const s of [...localStats.readingSessions, ...remoteStats.readingSessions]) {
    const key = `${s.date}|${s.bookId}`;
    byKey.set(key, Math.max(byKey.get(key) ?? 0, s.minutes));
  }

  const remoteNewer = +new Date(remoteExportedAt) > +new Date(localExportedAt);
  return {
    readingSessions: [...byKey.entries()].map(([key, minutes]) => {
      const [date, bookId] = key.split('|');
      return { date, bookId, minutes };
    }),
    dailyGoalMinutes: remoteNewer ? remoteStats.dailyGoalMinutes : localStats.dailyGoalMinutes,
  };
}

/** 归一化时间戳：ReadingProgress.updatedAt 是 epoch 毫秒，批注/书签日期经 JSON 往返后是 ISO 字符串 */
function toTime(value: number | string | Date | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return +new Date(value);
}

/** 双方墓碑按 kind:key 归并取较新 deletedAt，并清理超过保留期的过期墓碑 */
function mergeTombstones(local: SyncPayload, remote: SyncPayload): Map<string, SyncTombstone> {
  const byId = new Map<string, SyncTombstone>();
  const cutoff = Date.now() - TOMBSTONE_TTL_DAYS * 24 * 60 * 60 * 1000;
  for (const t of [...(local.tombstones ?? []), ...(remote.tombstones ?? [])]) {
    if (!t || !t.kind || !t.key) continue;
    if (+new Date(t.deletedAt) < cutoff) continue; // 过期墓碑随合并清理
    const id = `${t.kind}:${t.key}`;
    const prev = byId.get(id);
    if (!prev || +new Date(t.deletedAt) > +new Date(prev.deletedAt)) byId.set(id, t);
  }
  return byId;
}

/**
 * 逐条合并本地与远端载荷：
 * - 进度按 bookId、书签/批注按 id，取 updatedAt/createdAt 较新者
 * - stats（v2，可选）按 mergeSyncedStats 规则归并
 * - tombstones（v3，可选）先归并，再剔除"删除时间晚于记录最后更新"的记录；
 *   记录在删除之后被重新创建/编辑（时间戳晚于墓碑）时记录胜出，墓碑随之失效
 * - 载荷级 exportedAt 取较新者
 */
export function mergeSyncPayloads(local: SyncPayload, remote: SyncPayload): SyncPayload {
  const tombstones = mergeTombstones(local, remote);
  /** 命中即判死：kind 匹配且删除时间晚于记录时间。'book' 墓碑按 bookId 级联命中三种记录。 */
  const killedBy = (
    recordKind: 'progress' | 'bookmark' | 'annotation',
    recordKey: string,
    bookId: string,
    recordTime: number
  ): SyncTombstone | undefined => {
    for (const t of [tombstones.get(`${recordKind}:${recordKey}`), tombstones.get(`book:${bookId}`)]) {
      if (t && +new Date(t.deletedAt) > recordTime) return t;
    }
    return undefined;
  };

  const readingProgress: Record<string, ReadingProgress> = { ...local.readingProgress };
  for (const [bookId, remoteProgress] of Object.entries(remote.readingProgress)) {
    const localProgress = readingProgress[bookId];
    readingProgress[bookId] = localProgress
      ? newerOf(localProgress, remoteProgress, localProgress.updatedAt ?? 0, remoteProgress.updatedAt ?? 0)
      : remoteProgress;
  }
  const liveBookIds = new Set<string>();
  for (const [bookId, progress] of Object.entries(readingProgress)) {
    if (killedBy('progress', bookId, bookId, toTime(progress.updatedAt))) delete readingProgress[bookId];
    else liveBookIds.add(bookId);
  }

  const bookmarkById = new Map(local.bookmarks.map((b) => [b.id, b]));
  for (const remoteBookmark of remote.bookmarks) {
    const localBookmark = bookmarkById.get(remoteBookmark.id);
    bookmarkById.set(
      remoteBookmark.id,
      localBookmark
        ? newerOf(localBookmark, remoteBookmark, +new Date(localBookmark.createdAt), +new Date(remoteBookmark.createdAt))
        : remoteBookmark
    );
  }
  for (const [id, bookmark] of bookmarkById) {
    if (killedBy('bookmark', id, bookmark.bookId, +new Date(bookmark.createdAt))) {
      bookmarkById.delete(id);
    } else {
      liveBookIds.add(bookmark.bookId);
    }
  }

  const annotationById = new Map(local.annotations.map((a) => [a.id, a]));
  for (const remoteAnnotation of remote.annotations) {
    const localAnnotation = annotationById.get(remoteAnnotation.id);
    annotationById.set(
      remoteAnnotation.id,
      localAnnotation
        ? newerOf(localAnnotation, remoteAnnotation, +new Date(localAnnotation.updatedAt), +new Date(remoteAnnotation.updatedAt))
        : remoteAnnotation
    );
  }
  for (const [id, annotation] of annotationById) {
    if (killedBy('annotation', id, annotation.bookId, toTime(annotation.updatedAt))) {
      annotationById.delete(id);
    } else {
      liveBookIds.add(annotation.bookId);
    }
  }

  // 失效墓碑清理：墓碑对应的记录在删除后又被重新创建/编辑而存活时，移除墓碑，
  // 避免它继续误杀后续合并中的新记录
  const liveTombstoneKeys = new Set<string>([
    ...Object.keys(readingProgress).map((bookId) => `progress:${bookId}`),
    ...[...bookmarkById.keys()].map((id) => `bookmark:${id}`),
    ...[...annotationById.keys()].map((id) => `annotation:${id}`),
    ...[...liveBookIds].map((bookId) => `book:${bookId}`),
  ]);
  for (const [id] of [...tombstones]) {
    if (liveTombstoneKeys.has(id)) tombstones.delete(id);
  }

  return {
    version: SYNC_VERSION,
    exportedAt: newerOf(local.exportedAt, remote.exportedAt, +new Date(local.exportedAt), +new Date(remote.exportedAt)),
    readingProgress,
    bookmarks: [...bookmarkById.values()],
    annotations: [...annotationById.values()],
    stats: mergeSyncedStats(local.stats, remote.stats, local.exportedAt, remote.exportedAt),
    tombstones: [...tombstones.values()],
  };
}

/**
 * 执行一次云端同步：GET 远端载荷 → 逐条合并 → PUT 回写。
 * 远端不存在时视为首次同步（直接上传本地）。
 */
export async function runCloudSync(
  credentials: SyncCredentials,
  local: SyncPayload
): Promise<SyncResult> {
  const url = buildSyncUrl(credentials.serverAddress);
  const auth = authConfig(credentials);

  let merged = local;
  let direction: SyncDirection = 'pushed';

  try {
    const response = await axios.get<SyncPayload>(url, { ...auth, timeout: 30000 });
    const remote = response.data;
    if (remote && typeof remote === 'object' && Array.isArray(remote.annotations)) {
      merged = mergeSyncPayloads(local, remote);
      direction = 'merged';
    }
  } catch (e) {
    // 404 = 首次同步，直接上传；其他错误上抛
    const status = (e as { response?: { status?: number } }).response?.status;
    if (status !== HTTP_NOT_FOUND) throw e;
  }

  const exportedAt = new Date().toISOString();
  const payload: SyncPayload = { ...merged, version: SYNC_VERSION, exportedAt };
  await axios.put(url, payload, {
    ...auth,
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000,
  });

  return {
    direction,
    exportedAt,
    payload,
    counts: {
      progress: Object.keys(payload.readingProgress).length,
      bookmarks: payload.bookmarks.length,
      annotations: payload.annotations.length,
    },
  };
}

/**
 * 将合并结果落地本地（多端「拉取」环节）。
 * 进度/书签/批注写入 IndexedDB（repo 按键 upsert）；stats 存在时回写
 * useStatsStore（zustand persist 自行落 localStorage）。
 * v3 起：墓碑随载荷落地——先按墓碑删除本地对应记录（另一台设备删了，
 * 本机同步后也删），再把墓碑存入本地 tombstones store，供下次上传携带。
 */
export async function applyMergedPayloadToLocal(merged: SyncPayload): Promise<void> {
  for (const progress of Object.values(merged.readingProgress)) {
    await progressRepo.save(progress);
  }
  for (const bookmark of merged.bookmarks) {
    await bookmarkRepo.add(bookmark);
  }
  for (const annotation of merged.annotations) {
    await annotationRepo.add(annotation);
  }
  if (merged.stats) {
    applyStatsToLocal(merged.stats);
  }

  const tombstones = merged.tombstones ?? [];
  if (tombstones.length > 0) {
    for (const t of tombstones) {
      if (t.kind === 'progress') await progressRepo.remove(t.key);
      else if (t.kind === 'bookmark') await bookmarkRepo.remove(t.key);
      else if (t.kind === 'annotation') await annotationRepo.remove(t.key);
      else if (t.kind === 'book') await deleteBookRecords(t.key);
    }
    // 以合并结果整体覆盖本地墓碑表（remove 期间的临时写入被统一收敛）
    await tombstoneRepo.replaceAll(tombstones.map((t) => ({ ...t, id: `${t.kind}:${t.key}` })));
  }
}

/** 整书墓碑落地：删除该书名下全部进度/书签/批注 */
async function deleteBookRecords(bookId: string): Promise<void> {
  for (const annotation of await annotationRepo.getByBookId(bookId)) {
    await annotationRepo.remove(annotation.id);
  }
  for (const bookmark of await bookmarkRepo.getByBookId(bookId)) {
    await bookmarkRepo.remove(bookmark.id);
  }
  await progressRepo.remove(bookId);
}

/** 把同步后的阅读时长簿回写统计 store（模块注入避免 cloudSync ↔ store 循环依赖） */
let statsApplier: ((stats: SyncedStats) => void) | null = null;

/** 由应用装配层调用（main.tsx），注入 useStatsStore 的回写实现 */
export function registerStatsApplier(applier: (stats: SyncedStats) => void): void {
  statsApplier = applier;
}

function applyStatsToLocal(stats: SyncedStats): void {
  statsApplier?.(stats);
}
