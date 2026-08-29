import { loadEpubChapters } from '@/services/epubContent';
import {
  splitMarkdownIntoChapters,
  splitTextIntoChapters,
} from '@/services/parsers/utils';
import { bookFileRepo } from '@/services/storage/bookFileRepo';
import type { Chapter } from '@/types';
import { parseMarkdownDocument, type MarkdownDocument } from '@/utils/markdownDocument';

export interface TextChapter {
  id: string;
  title: string;
  content: string;
  markdownDocument?: MarkdownDocument;
}

const NORMALIZE_CHAPTER_TITLE_PATTERN = /[\s\u3000:：,，.。!！?？;；、\-—_《》<>[\]【】()（）"'“”‘’]/g;

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
 */
export async function loadTextContent(
  bookId: string
): Promise<{ chapters: TextChapter[]; isEpub: boolean; isMarkdown: boolean }> {
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
    const chapters = parsedChapters.map((ch, idx) => {
      const markdownDocument = isMarkdown ? parseMarkdownDocument(ch.content) : undefined;
      return {
        id: `ch${idx + 1}`,
        title: ch.title || `第${idx + 1}章`,
        content: markdownDocument?.text ?? ch.content,
        markdownDocument,
      };
    });
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