/** 书内全文检索：大小写不敏感的朴素扫描（CJK 友好，无分词依赖） */

import type { TextChapter } from '@/services/textContent';

export interface SearchHit {
  chapterIndex: number;
  chapterTitle: string;
  /** 命中在章节可检索文本中的起始偏移（与 textLength 同坐标系） */
  offset: number;
  length: number;
  /** 命中所在文本总长（供调用方做比例定位） */
  textLength: number;
  /** 摘录三段：命中前文 / 命中文本 / 命中后文 */
  before: string;
  match: string;
  after: string;
}

/** 最短检索词长度（更短的词命中噪音过大） */
export const MIN_QUERY_CHARS = 2;
/** 摘录窗口：命中前后各取的字符数 */
const EXCERPT_CONTEXT_CHARS = 20;
/** 单次检索命中上限（防大书全量命中拖垮渲染） */
const MAX_HITS = 50;

/** 章节的可检索文本：Markdown/EPUB 用展平规范化文本（与阅读器渲染坐标系一致） */
function searchableTextOf(chapter: TextChapter): string {
  return chapter.markdownDocument?.text ?? chapter.content;
}

function buildHit(chapter: TextChapter, chapterIndex: number, text: string, at: number, queryLength: number): SearchHit {
  return {
    chapterIndex,
    chapterTitle: chapter.title,
    offset: at,
    length: queryLength,
    textLength: text.length,
    before: text.slice(Math.max(0, at - EXCERPT_CONTEXT_CHARS), at),
    match: text.slice(at, at + queryLength),
    after: text.slice(at + queryLength, at + queryLength + EXCERPT_CONTEXT_CHARS),
  };
}

/**
 * 逐章扫描检索词，按章节顺序返回命中（同章内不重叠）。
 * query 少于 MIN_QUERY_CHARS 时视为无效，返回空。
 */
export function searchChapters(chapters: TextChapter[], query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < MIN_QUERY_CHARS) return [];

  const hits: SearchHit[] = [];
  for (let ci = 0; ci < chapters.length && hits.length < MAX_HITS; ci++) {
    const chapter = chapters[ci];
    // 摘录保留原文大小写：查找用小写副本，切片用原文
    const original = searchableTextOf(chapter);
    const lowered = original.toLowerCase();
    let from = 0;
    while (hits.length < MAX_HITS) {
      const at = lowered.indexOf(q, from);
      if (at < 0) break;
      hits.push(buildHit(chapter, ci, original, at, q.length));
      from = at + q.length;
    }
  }
  return hits;
}
