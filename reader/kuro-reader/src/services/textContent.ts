import JSZip from 'jszip';

import {
  splitMarkdownIntoChapters,
  splitTextIntoChapters,
  cleanHtmlToText,
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

  // EPUB：提取可读文本并保留章节结构
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 找到 OPF 获取阅读顺序
    const containerXml = await zip.file('META-INF/container.xml')?.async('string');
    if (!containerXml) return { chapters: [{ id: 'ch1', title: '正文', content: '无法解析 EPUB 包结构' }], isEpub: true, isMarkdown: false };

    const opfMatch = containerXml.match(/full-path="([^"]+\.opf)"/);
    if (!opfMatch) return { chapters: [{ id: 'ch1', title: '正文', content: '无法找到 OPF 文档' }], isEpub: true, isMarkdown: false };

    const opfPath = opfMatch[1];
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
    const opfContent = await zip.file(opfPath)?.async('string');
    if (!opfContent) return { chapters: [{ id: 'ch1', title: '正文', content: '无法读取 OPF 内容' }], isEpub: true, isMarkdown: false };

    // 从 spine 提取阅读顺序
    const spineMatches = [...opfContent.matchAll(/<itemref[^>]+idref="([^"]+)"/g)];
    const spineIds = spineMatches.map(m => m[1]);

    // 从 manifest 映射 id → href（支持任意属性顺序）
    const manifestMap = new Map<string, string>();
    const itemMatches = [...opfContent.matchAll(/<item\s+([^>]+)>/g)];
    for (const m of itemMatches) {
      const attrs = m[1];
      const idMatch = attrs.match(/id="([^"]+)"/);
      const hrefMatch = attrs.match(/href="([^"]+)"/);
      if (idMatch && hrefMatch) {
        manifestMap.set(idMatch[1], hrefMatch[1]);
      }
    }

    // 从 ncx 获取章节标题
    const titleMap = new Map<string, string>();
    const ncxMatch = opfContent.match(/<item[^>]+href="([^"]+\.ncx)"[^>]+/i);
    if (ncxMatch) {
      const ncxPath = opfDir + ncxMatch[1];
      const ncxContent = await zip.file(ncxPath)?.async('string');
      if (ncxContent) {
        const navPointMatches = [...ncxContent.matchAll(/<navPoint[^>]*>[\s\S]*?<navLabel>\s*<text>([^<]+)<\/text>[\s\S]*?<content\s+src="([^"]+)"/g)];
        for (const m of navPointMatches) {
          const [, navLabel, srcWithAnchor] = m;
          const src = (srcWithAnchor ?? '').split('#')[0];
          titleMap.set(src, navLabel.trim());
        }
      }
    }

    // 按 spine 顺序读取章节内容
    const chapters: TextChapter[] = [];
    let chapterIndex = 0;

    for (const spineId of spineIds) {
      const href = manifestMap.get(spineId);
      if (!href) continue;

      const filePath = opfDir + href;
      const html = await zip.file(filePath)?.async('string');
      if (!html) continue;

      // 使用共享的 HTML 清理函数
      const text = cleanHtmlToText(html);
      if (text) {
        chapterIndex++;
        const title = titleMap.get(href) || `第${chapterIndex}章`;
        chapters.push({ id: `ch${chapterIndex}`, title, content: text });
      }
    }

    if (chapters.length === 0) {
      return { chapters: [{ id: 'ch1', title: '正文', content: 'EPUB 内容为空' }], isEpub: true, isMarkdown: false };
    }

    return { chapters, isEpub: true, isMarkdown: false };
  } catch {
    return { chapters: [{ id: 'ch1', title: '正文', content: 'EPUB 解析失败' }], isEpub: true, isMarkdown: false };
  }
}
