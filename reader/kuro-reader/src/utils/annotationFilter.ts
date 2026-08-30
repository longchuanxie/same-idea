/** 摘抄墙过滤：跨书手记的检索/筛选纯函数 */

import type { Annotation } from '@/types';
import { isPageNote } from '@/utils/pageAnnotation';

/** 手记形态：纯划线（无笔记文字）或批注（带笔记） */
export type AnnotationKind = 'all' | 'highlight' | 'note';

export interface AnnotationFilter {
  /** 命中引文或笔记（大小写不敏感子串） */
  query: string;
  /** 限定书（空串 = 全部） */
  bookId: string;
  /** 限定标签（空串 = 全部） */
  tagId: string;
  /** 形态筛选 */
  kind: AnnotationKind;
}

export const EMPTY_ANNOTATION_FILTER: AnnotationFilter = {
  query: '',
  bookId: '',
  tagId: '',
  kind: 'all',
};

/** 过滤条件是否为默认态（无需过滤时跳过计算） */
export function isEmptyAnnotationFilter(filter: AnnotationFilter): boolean {
  return (
    filter.query.trim() === '' &&
    filter.bookId === '' &&
    filter.tagId === '' &&
    filter.kind === 'all'
  );
}

/**
 * 按条件过滤手记：
 * - query 命中引文或笔记（页级手记的引文即「第 N 页」）
 * - bookId/tagId 精确匹配（tagId 匹配手记的 tagIds 引用）
 * - kind: highlight = 无笔记的文字划线（页级手记无论有无笔记都不算纯划线）；note = 有笔记批注或页级手记
 * 保持输入顺序不变。
 */
export function filterAnnotations(annotations: Annotation[], filter: AnnotationFilter): Annotation[] {
  if (isEmptyAnnotationFilter(filter)) return annotations;

  const q = filter.query.trim().toLowerCase();
  return annotations.filter((ann) => {
    if (filter.bookId && ann.bookId !== filter.bookId) return false;
    if (filter.tagId && !(ann.tagIds ?? []).includes(filter.tagId)) return false;
    if (filter.kind === 'highlight' && (ann.note.trim() !== '' || isPageNote(ann))) return false;
    if (filter.kind === 'note' && ann.note.trim() === '' && !isPageNote(ann)) return false;
    if (
      q &&
      !ann.selectedText.toLowerCase().includes(q) &&
      !ann.note.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}
