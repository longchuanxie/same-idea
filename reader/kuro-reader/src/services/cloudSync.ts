import axios from 'axios';

import type { Annotation, Bookmark, ReadingProgress } from '@/types';

/** 同步载荷版本 */
const SYNC_VERSION = 1;
/** 同步文件在 WebDAV 根下的固定路径 */
const SYNC_FILE_PATH = '/kuro-reader-sync.json';

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
}

export type SyncDirection = 'pushed' | 'merged';

export interface SyncResult {
  direction: SyncDirection;
  exportedAt: string;
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
 * 逐条合并本地与远端载荷：
 * - 进度按 bookId、书签/批注按 id，取 updatedAt/createdAt 较新者
 * - 载荷级 exportedAt 取较新者
 */
export function mergeSyncPayloads(local: SyncPayload, remote: SyncPayload): SyncPayload {
  const readingProgress: Record<string, ReadingProgress> = { ...local.readingProgress };
  for (const [bookId, remoteProgress] of Object.entries(remote.readingProgress)) {
    const localProgress = readingProgress[bookId];
    readingProgress[bookId] = localProgress
      ? newerOf(localProgress, remoteProgress, localProgress.updatedAt ?? 0, remoteProgress.updatedAt ?? 0)
      : remoteProgress;
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

  return {
    version: SYNC_VERSION,
    exportedAt: newerOf(local.exportedAt, remote.exportedAt, +new Date(local.exportedAt), +new Date(remote.exportedAt)),
    readingProgress,
    bookmarks: [...bookmarkById.values()],
    annotations: [...annotationById.values()],
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
    if (status !== 404) throw e;
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
    counts: {
      progress: Object.keys(payload.readingProgress).length,
      bookmarks: payload.bookmarks.length,
      annotations: payload.annotations.length,
    },
  };
}
