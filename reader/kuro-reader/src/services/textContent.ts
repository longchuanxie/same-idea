import { loadEpubChapters } from '@/services/epubContent';
import type { ParsedTextChapter } from '@/services/parsers/types';
import {
  splitMarkdownIntoChapters,
  splitTextIntoChapters,
} from '@/services/parsers/utils';
import { bookFileRepo } from '@/services/storage/bookFileRepo';
import { textChapterCacheRepo } from '@/services/storage/textChapterCacheRepo';
import type { Chapter } from '@/types';
import { parseMarkdownDocument, type MarkdownDocument } from '@/utils/markdownDocument';

export interface TextChapter {
  id: string;
  title: string;
  content: string;
  markdownDocument?: MarkdownDocument;
}

const NORMALIZE_CHAPTER_TITLE_PATTERN = /[\s\u3000:：,，.。!！?？;；、\-—_《》<>[\]【】()（）"'“”‘’]/g;

/** 解析结果缓存的并发写去重：同书解析在途时跳过重复落库 */
const pendingCacheWrites = new Set<string>();

/** 把拆章产物映射为阅读器消费的 TextChapter（Markdown 章附带上解析文档） */
export const buildTextChapters = (
  parsedChapters: ParsedTextChapter[],
  isMarkdown: boolean
): TextChapter[] =>
  parsedChapters.map((ch, idx) => {
    const markdownDocument = isMarkdown ? parseMarkdownDocument(ch.content) : undefined;
    return {
      id: `ch${idx + 1}`,
      title: ch.title || `第${idx + 1}章`,
      content: markdownDocument?.text ?? ch.content,
      markdownDocument,
    };
  });

/**
 * 异步预热解析结果缓存（不阻塞调用方；失败静默——下次开书重走解析路径再试）。
 * 供导入完成点与 loadTextContent 未命中后的回填共用。
 */
export const warmTextChapterCache = (
  bookId: string,
  chapters: TextChapter[],
  isMarkdown: boolean
): void => {
  if (chapters.length === 0 || pendingCacheWrites.has(bookId)) return;
  pendingCacheWrites.add(bookId);
  void textChapterCacheRepo
    .save({
      bookId,
      isMarkdown,
      totalChars: chapters.reduce((sum, ch) => sum + ch.content.length, 0),
      chapters,
      cachedAt: Date.now(),
    })
    .catch(() => {
      // 存储配额不足等写入失败不致命：缓存仅是加速层
    })
    .finally(() => {
      pendingCacheWrites.delete(bookId);
    });
};


/**
 * 将 URL 中的 chapterId 解析为 textChapters 中的下标。
 * 依次尝试：精确 id 匹配 → 归一化标题匹配 → 旧版 `${bookId}-chN` 编号回退 → bookChapters 下标对齐。
 * 找不到时返回 -1。
 */
export const resolveTextChapterIndex = (
  textChapters: TextChapter[],
  bookChapters: Chapter[] | undefined,
  bookId: string,
  chapterId: string
): number => {
  const textChapterIndex = textChapters.findIndex((chapter) => chapter.id === chapterId);
  if (textChapterIndex >= 0) {
    return textChapterIndex;
  }

  const targetBookChapter = bookChapters?.find((chapter) => chapter.id === chapterId);
  const normalizedTargetTitle = targetBookChapter
    ? targetBookChapter.title.trim().toLowerCase().replace(NORMALIZE_CHAPTER_TITLE_PATTERN, '')
    : '';
  if (normalizedTargetTitle) {
    const titleMatchedIndex = textChapters.findIndex((chapter) =>
      chapter.title.trim().toLowerCase().replace(NORMALIZE_CHAPTER_TITLE_PATTERN, '') === normalizedTargetTitle
    );
    if (titleMatchedIndex >= 0) {
      return titleMatchedIndex;
    }
  }

  const legacyChapterPrefix = `${bookId}-ch`;
  if (chapterId.startsWith(legacyChapterPrefix)) {
    const chapterNumber = Number(chapterId.slice(legacyChapterPrefix.length));
    const textChapterIdIndex = textChapters.findIndex((chapter) => chapter.id === `ch${chapterNumber}`);
    if (textChapterIdIndex >= 0) {
      return textChapterIdIndex;
    }

    const index = chapterNumber - 1;
    if (Number.isInteger(index) && index >= 0 && index < textChapters.length) {
      return index;
    }
  }

  const bookChapterIndex = bookChapters?.findIndex((chapter) => chapter.id === chapterId) ?? -1;
  if (bookChapterIndex >= 0 && bookChapterIndex < textChapters.length) {
    return bookChapterIndex;
  }

  return -1;
};

/**
 * 从 bookFileRepo 加载文本内容。
 * - text/plain blob → 直接读取（使用常见文本章节规则拆分）
 * - text/markdown blob → 直接读取（使用 Markdown 标题拆分）
 * - application/epub+zip blob → 提取 XHTML/HTML 章节
 *
 * TXT/Markdown 走解析结果缓存（textChapterCache）：命中即免整本解码+拆章+逐章
 * Markdown 解析——长网文开书从秒级降到一次 IDB 结构化克隆。未命中（首次/旧数据）
 * 走原解析路径并异步回填缓存。EPUB 不缓存（图片 object URL 跨会话失效）。
 */
export async function loadTextContent(
  bookId: string
): Promise<{ chapters: TextChapter[]; isEpub: boolean; isMarkdown: boolean }> {
  // 缓存探测先于 blob 读取：命中时连原始文件都不必读。书籍文件导入后不可变
  // （重复导入按标题拦截、bookId 唯一），缓存记录与 blob 内容不存在漂移。
  const cached = await textChapterCacheRepo.get(bookId).catch(() => undefined);
  if (cached && cached.chapters.length > 0) {
    return { chapters: cached.chapters, isEpub: false, isMarkdown: cached.isMarkdown };
  }

  const blob = await bookFileRepo.get(bookId);
  if (!blob) return { chapters: [], isEpub: false, isMarkdown: false };

  const isEpub = blob.type === 'application/epub+zip';
  const isMarkdown = blob.type.startsWith('text/markdown') || blob.type.startsWith('text/x-markdown');

  if (!isEpub) {
    // 纯文本：使用共享的章节拆分函数
    const text = await blob.text();
    const parsedChapters = isMarkdown
      ? splitMarkdownIntoChapters(text)
      : splitTextIntoChapters(text);
    const chapters = buildTextChapters(parsedChapters, isMarkdown);
    warmTextChapterCache(bookId, chapters, isMarkdown);
    return { chapters, isEpub: false, isMarkdown };
  }

  // EPUB：走保真管线（XHTML → Markdown + 图片 object URL），复用 Markdown 分页/渲染
  try {
    const chapters = await loadEpubChapters(blob);
    return { chapters, isEpub: true, isMarkdown: false };
  } catch {
    return { chapters: [{ id: 'ch1', title: '正文', content: 'EPUB 解析失败' }], isEpub: true, isMarkdown: false };
  }
}