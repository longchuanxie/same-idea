export const ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  SUB_LIBRARY: '/library/:subLibraryId',
  BOOK_DETAIL: '/book/:id',
  READER: '/reader/:bookId/:chapterId?',
  TEXT_READER: '/text-reader/:bookId/:chapterId?',
  IMPORT: '/import',
  CUSTOM_CLOUD: '/import/custom-cloud',
  SETTINGS: '/settings',
  STATS: '/stats',
  PROFILE: '/profile',
  SEARCH: '/search',
  TAGS: '/tags',
  NOTES: '/notes',
  AUTH: '/auth',
} as const;

export function bookDetailPath(id: string): string {
  return `/book/${id}`;
}

/** 文本阅读器的批注直达查询参数（摘抄墙/回望席等外部跳转用） */
export const ANNOTATION_QUERY_PARAM = 'ann';

export function readerPath(bookId: string, chapterId?: string): string {
  if (chapterId) {
    return `/reader/${bookId}/${chapterId}`;
  }
  return `/reader/${bookId}`;
}

export function textReaderPath(bookId: string, chapterId?: string, annotationId?: string): string {
  const base = chapterId ? `/text-reader/${bookId}/${chapterId}` : `/text-reader/${bookId}`;
  return annotationId ? `${base}?${ANNOTATION_QUERY_PARAM}=${encodeURIComponent(annotationId)}` : base;
}

/**
 * 根据书籍格式返回正确的阅读器路径。
 * - 'text' → TextReaderPage（annotationId 可选：直达批注原句处）
 * - 其他 → ReaderPage（图片阅读器，批注直达不适用，忽略 annotationId）
 */
export function readerPathForBook(
  book: { id: string; format?: string },
  chapterId?: string,
  annotationId?: string
): string {
  if (book.format === 'text') {
    return textReaderPath(book.id, chapterId, annotationId);
  }
  return readerPath(book.id, chapterId);
}

export function subLibraryPath(subLibraryId: string): string {
  return `/library/${subLibraryId}`;
}

export function customCloudPath(): string {
  return '/import/custom-cloud';
}
