/** PDF 文本层：从原始 PDF 提取逐页文本，供书内检索使用（此前逐页转 JPEG 后文本被丢弃） */

import { getDocument } from 'pdfjs-dist';

import { bookFileRepo } from '@/services/storage/bookFileRepo';
import type { TextChapter } from '@/services/textContent';

/** pdfjs TextContentItem 的最小形状（str 存在即为文本项） */
interface MinimalTextItem {
  str?: string;
}

/** 文本提取结果按书缓存的内存上限（防长会话累积） */
const PDF_TEXT_CACHE_MAX = 8;

const pdfTextCache = new Map<string, Promise<string[]>>();

function evictCacheIfNeeded(): void {
  while (pdfTextCache.size >= PDF_TEXT_CACHE_MAX) {
    const oldest = pdfTextCache.keys().next().value;
    if (oldest === undefined) break;
    pdfTextCache.delete(oldest);
  }
}

/** 两个文本项拼接时是否需要补空格（拉丁/数字边界直接相连会粘词） */
function needsSpaceBetween(prev: string, next: string): boolean {
  if (!prev || !next) return false;
  const last = prev[prev.length - 1];
  const first = next[0];
  return /[\p{L}\p{N}]/u.test(last) && /[\p{L}\p{N}]/u.test(first);
}

/** 从 pdfjs 文本项序列合成一行行可读文本 */
function mergeTextItems(items: MinimalTextItem[]): string {
  let text = '';
  for (const item of items) {
    const str = item.str ?? '';
    if (!str) continue;
    if (needsSpaceBetween(text, str)) text += ' ';
    text += str;
  }
  // 压缩多余空白（保留换行语义由 pdfjs 的 EOL 项天然携带）
  return text.replace(/[ \t]+/g, ' ').trim();
}

/** 从 PDF 二进制提取逐页文本（页序与渲染页一致，index = pageNumber - 1）；
 *  pdfjs 6 的销毁挂在 loadingTask 上（文档代理无 destroy） */
export async function extractPdfPageTexts(data: ArrayBuffer): Promise<string[]> {
  // 跨 realm 安全转换：不能依赖 instanceof（测试环境的字节可能来自不同 realm）
  const bytes = data instanceof ArrayBuffer ? data : Uint8Array.from(data as ArrayLike<number>);
  const loadingTask = getDocument({ data: bytes });
  try {
    const doc = await loadingTask.promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(mergeTextItems(content.items as MinimalTextItem[]));
    }
    return pages;
  } finally {
    await loadingTask.destroy();
  }
}

/** jsdom 的 Blob 缺 arrayBuffer——FileReader 兜底 */
async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/** 取某本书的逐页文本（原始 PDF 存于 bookFiles；结果按书缓存） */
export async function getPdfPageTexts(bookId: string): Promise<string[]> {
  const existing = pdfTextCache.get(bookId);
  if (existing) return existing;

  evictCacheIfNeeded();
  const promise = (async () => {
    const blob = await bookFileRepo.get(bookId);
    if (!blob) return [];
    return extractPdfPageTexts(await blobToArrayBuffer(blob));
  })();
  pdfTextCache.set(bookId, promise);
  return promise;
}

/** 清除某本书的文本缓存（书籍删除/文件替换时调用） */
export function clearPdfTextCache(bookId: string): void {
  pdfTextCache.delete(bookId);
}

/**
 * 把逐页文本包装成检索用的伪章节（一页一章）：
 * 复用 InBookSearchPanel——命中的 chapterIndex 即页索引（0 起）。
 */
export function buildPdfSearchChapters(pages: string[]): TextChapter[] {
  return pages.map((text, index) => ({
    id: `pdf-page-${index + 1}`,
    title: `第 ${index + 1} 页`,
    content: text,
  }));
}
