/** 云端文件浏览的纯路径工具（WebDAV/FTP 通用，路径以 / 分隔） */

/** 规范化云端路径：以 / 开头、无结尾斜杠、合并连续斜杠 */
export function normalizeCloudPath(path: string): string {
  const merged = path.replace(/\/+/g, '/');
  const withLeading = merged.startsWith('/') ? merged : `/${merged}`;
  const trimmed = withLeading.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** 拼接目录与子项名 */
export function joinCloudPath(dir: string, name: string): string {
  const base = normalizeCloudPath(dir);
  return `${base === '/' ? '' : base}/${name}`;
}

/** 取父目录；根目录返回 null */
export function parentCloudPath(path: string): string | null {
  const normalized = normalizeCloudPath(path);
  if (normalized === '/') return null;
  const parent = normalized.slice(0, normalized.lastIndexOf('/'));
  return parent === '' ? '/' : parent;
}

export interface CloudBreadcrumb {
  name: string;
  path: string;
}

/** 面包屑分段：'/' → []，'/a/b' → [{name:'a',path:'/a'},{name:'b',path:'/a/b'}] */
export function cloudPathBreadcrumbs(path: string): CloudBreadcrumb[] {
  const normalized = normalizeCloudPath(path);
  if (normalized === '/') return [];
  const segments = normalized.slice(1).split('/');
  return segments.map((name, i) => ({
    name,
    path: `/${segments.slice(0, i + 1).join('/')}`,
  }));
}

/** 目录在前、同类型按名称排序（供文件列表展示）；用码元比较避免 ICU 环境差异 */
export function sortCloudEntries<T extends { name: string; isDirectory: boolean }>(files: T[]): T[] {
  return [...files].sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}
