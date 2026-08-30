/** 页级手记：漫画/PDF 等图页书的整页批注（无文字划线，锚定章内页码） */

import type { Annotation } from '@/types';

export interface PageNoteInput {
  bookId: string;
  chapterIndex: number;
  chapterTitle: string;
  /** 章内页索引（0 起） */
  pageIndex: number;
  note: string;
  tagIds?: string[];
  id?: string;
}

/** 页级手记判定（任何携带 pageIndex 的手记） */
export function isPageNote(annotation: Pick<Annotation, 'pageIndex'>): boolean {
  return typeof annotation.pageIndex === 'number' && annotation.pageIndex >= 0;
}

/** 页级手记的展示标题（selectedText 复用此文案，保证墙/列表/详情一致） */
export function pageNoteTitle(pageIndex: number): string {
  return `第 ${pageIndex + 1} 页`;
}

/** 页级手记id 前缀（与文本批注 ann- 区分，便于排查） */
const PAGE_NOTE_ID_PREFIX = 'pagenote-';
/** 随机 id 段的 base36 截取长度 */
const PAGE_NOTE_ID_RANDOM_CHARS = 8;

/** 构建页级手记（不落库，纯构建；调用方负责 annotationRepo.add） */
export function buildPageNoteAnnotation(input: PageNoteInput): Annotation {
  const now = new Date();
  return {
    id: input.id ?? `${PAGE_NOTE_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, PAGE_NOTE_ID_RANDOM_CHARS)}`,
    bookId: input.bookId,
    chapterIndex: input.chapterIndex,
    chapterTitle: input.chapterTitle,
    selectedText: pageNoteTitle(input.pageIndex),
    note: input.note,
    startOffset: 0,
    endOffset: 0,
    style: 'highlight',
    tagIds: input.tagIds && input.tagIds.length > 0 ? input.tagIds : undefined,
    pageIndex: input.pageIndex,
    createdAt: now,
    updatedAt: now,
  };
}
