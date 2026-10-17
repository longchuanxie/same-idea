/**
 * MOBI/AZW/AZW3/PRC 导入期解析器：foliate-js 打开容器，
 * 元数据（EXTH）给书名/作者，逐节抽纯文本给书架的章节数与字数统计。
 * 阅读期走 mobiContent 的保真管线（Markdown + 图片），与本解析器产物无关。
 */

import { isMobiBlob, openMobiBook, type MobiBook } from '@/services/mobiContent'
import { extractTitleFromFilename } from '@/services/parsers/utils'

import type { BookParser, ParsedBook, ParsedTextBook, ParsedTextChapter, ParserProgressCallback } from './types'

const PROGRESS = {
  BUFFER_READ: 20,
  BOOK_OPENED: 50,
  CHAPTERS_EXTRACTED: 90,
} as const;

const MOBI_FILE_PATTERN = /\.(mobi|azw3?|prc)$/i;

export function isMobiFile(name: string): boolean {
  return MOBI_FILE_PATTERN.test(name);
}

/** 导入期的章节数与字数统计走阅读期同一条解析管线（含图片替换），
 *  以 Document 文本取纯文本——单节损坏跳过不拖垮整书 */
async function sectionPlainTexts(book: MobiBook): Promise<string[]> {
  const texts: string[] = [];
  for (const section of book.sections) {
    try {
      const doc = await section.createDocument();
      const text = (doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text) texts.push(text);
    } catch {
      continue;
    }
  }
  return texts;
}

export class MobiParser implements BookParser {
  canParse(input: { name: string }): boolean {
    return isMobiFile(input.name);
  }

  async parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook> {
    onProgress?.(PROGRESS.BUFFER_READ);
    const arrayBuffer = await file.arrayBuffer();

    const blob = new Blob([arrayBuffer]);
    if (!(await isMobiBlob(blob))) {
      throw new Error('不是有效的 MOBI 文件（缺少 BOOKMOBI 头）');
    }

    onProgress?.(PROGRESS.BOOK_OPENED);
    const book = await openMobiBook(blob);
    const metadata = book.metadata;

    const texts = await sectionPlainTexts(book);
    const chapters: ParsedTextChapter[] = texts.map((content, index) => ({
      title: `第${index + 1}章`,
      content,
    }));
    onProgress?.(PROGRESS.CHAPTERS_EXTRACTED);

    const coverBlob = await book.getCover().catch(() => undefined);
    const textFile = new Blob([arrayBuffer], { type: 'application/x-mobipocket-ebook' });
    const title = metadata.title || extractTitleFromFilename(file.name);

    const result: ParsedTextBook = {
      format: 'text',
      title,
      coverBlob: coverBlob ?? new Blob(),
      textFile,
      textEncoding: 'utf-8',
      chapters,
      author: metadata.author?.filter(Boolean).join(', ') || undefined,
    };

    onProgress?.(100);
    return result;
  }
}
