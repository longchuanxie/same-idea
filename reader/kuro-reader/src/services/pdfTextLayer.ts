/** PDF 文字层（带坐标）：从原始 PDF 提取逐页文本项的页面相对坐标，
 *  供 PDF 文字级划线的透明可选层渲染使用。 */

import { getDocument } from 'pdfjs-dist';

import { bookFileRepo } from '@/services/storage/bookFileRepo';

/** 单个文本项：坐标/尺寸均为页面相对比例（0..1），y 自页面顶部起算 */
export interface PositionedTextItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** pdfjs TextItem 的最小形状 */
interface PdfTextItem {
  str?: string;
  transform?: number[];
  width?: number;
}

/** 按书缓存整本书的逐页文本项（页序与渲染页一致，index = pageNumber - 1） */
const pdfTextLayerCache = new Map<string, Promise<PositionedTextItem[][]>>();
const CACHE_MAX = 4;

function evictIfNeeded(): void {
  while (pdfTextLayerCache.size >= CACHE_MAX) {
    const oldest = pdfTextLayerCache.keys().next().value;
    if (oldest === undefined) break;
    pdfTextLayerCache.delete(oldest);
  }
}

/** 从 pdfjs 文本项换算页面相对坐标（viewport scale=1；PDF y 轴向上 → 翻转为自顶部） */
function toPositionedItem(item: PdfTextItem, pageWidth: number, pageHeight: number): PositionedTextItem | null {
  if (!item.str || !item.transform || pageWidth <= 0 || pageHeight <= 0) return null;
  const [a, b, , d, e, f] = item.transform;
  // 字高取变换矩阵的纵向模长（近似字号，含旋转容忍）
  const fontHeight = Math.hypot(b, d) || Math.abs(d) || 1;
  const width = item.width ?? (Math.abs(a) * item.str.length * 0.5);
  return {
    str: item.str,
    // 文本基点 (e,f) 在基线左端：向上抬一个字高近似覆盖字形主体
    x: e / pageWidth,
    y: (pageHeight - f - fontHeight) / pageHeight,
    w: width / pageWidth,
    h: fontHeight / pageHeight,
  };
}

/** 从 PDF 二进制提取逐页带坐标文本项 */
export async function extractPdfTextItems(data: ArrayBuffer): Promise<PositionedTextItem[][]> {
  const bytes = data instanceof ArrayBuffer ? data : Uint8Array.from(data as ArrayLike<number>);
  const loadingTask = getDocument({ data: bytes });
  try {
    const doc = await loadingTask.promise;
    const pages: PositionedTextItem[][] = [];
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items: PositionedTextItem[] = [];
      for (const raw of content.items as PdfTextItem[]) {
        const positioned = toPositionedItem(raw, viewport.width, viewport.height);
        if (positioned && positioned.str.trim()) items.push(positioned);
      }
      pages.push(items);
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

/** 取某本书的逐页带坐标文本项（原始 PDF 存于 bookFiles；结果按书缓存） */
export async function getPdfTextItems(bookId: string): Promise<PositionedTextItem[][]> {
  const existing = pdfTextLayerCache.get(bookId);
  if (existing) return existing;

  evictIfNeeded();
  const promise = (async () => {
    const blob = await bookFileRepo.get(bookId);
    if (!blob) return [];
    return extractPdfTextItems(await blobToArrayBuffer(blob));
  })();
  pdfTextLayerCache.set(bookId, promise);
  return promise;
}

/** 清除某本书的文本项缓存（书籍删除时调用） */
export function clearPdfTextItemsCache(bookId: string): void {
  pdfTextLayerCache.delete(bookId);
}
