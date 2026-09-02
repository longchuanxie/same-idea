/** 漫画页 OCR（实验特性）：Tesseract.js 按页懒加载识别，
 *  输出与 PDF 文字层同构的带坐标文本项，复用文字级划线的可选层渲染。 */

import type { PositionedTextItem } from '@/services/pdfTextLayer';

/** 会话级缓存：`${bookId}:${pageIndex}` → 识别结果 */
const ocrCache = new Map<string, Promise<PositionedTextItem[]>>();

export function ocrCacheKey(bookId: string, pageIndex: number): string {
  return `${bookId}:${pageIndex}`;
}

/** Tesseract 词块 bbox 的最小形状 */
interface OcrWord {
  text?: string;
  bbox?: { x0: number; y0: number; x1: number; y1: number };
}

/** 页图尺寸（识别坐标归一化用）——由调用方传入，避免服务依赖 DOM */
export async function recognizePageText(
  imageUrl: string,
  imageWidth: number,
  imageHeight: number,
  languages = 'chi_sim+eng'
): Promise<PositionedTextItem[]> {
  // 动态 import：OCR 引擎不进主包，仅首次识别时加载 worker 与模型
  const { recognize } = await import('tesseract.js');
  const result = await recognize(imageUrl, languages);
  const words = ((result as unknown as { data?: { words?: OcrWord[] } }).data?.words ?? []) as OcrWord[];
  if (imageWidth <= 0 || imageHeight <= 0) return [];
  return words
    .filter((w) => w.text && w.text.trim() && w.bbox)
    .map((w) => ({
      str: w.text!.trim(),
      x: w.bbox!.x0 / imageWidth,
      y: w.bbox!.y0 / imageHeight,
      w: (w.bbox!.x1 - w.bbox!.x0) / imageWidth,
      h: (w.bbox!.y1 - w.bbox!.y0) / imageHeight,
    }));
}

/** 识别某页（带会话级缓存；图片 URL 与尺寸由阅读器提供） */
export function recognizeComicPage(
  bookId: string,
  pageIndex: number,
  imageUrl: string,
  imageWidth: number,
  imageHeight: number
): Promise<PositionedTextItem[]> {
  const key = ocrCacheKey(bookId, pageIndex);
  const cached = ocrCache.get(key);
  if (cached) return cached;
  const promise = recognizePageText(imageUrl, imageWidth, imageHeight).catch(() => {
    ocrCache.delete(key);
    return [];
  });
  ocrCache.set(key, promise);
  return promise;
}

export function clearOcrCache(bookId?: string): void {
  if (!bookId) {
    ocrCache.clear();
    return;
  }
  for (const key of ocrCache.keys()) {
    if (key.startsWith(`${bookId}:`)) ocrCache.delete(key);
  }
}
