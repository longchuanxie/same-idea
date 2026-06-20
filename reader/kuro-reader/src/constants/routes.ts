export const ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  SUB_LIBRARY: '/library/:subLibraryId',
  BOOK_DETAIL: '/book/:id',
  READER: '/reader/:bookId/:chapterId?',
  TEXT_READER: '/text-reader/:bookId',
  IMPORT: '/import',
  CUSTOM_CLOUD: '/import/custom-cloud',
  SETTINGS: '/settings',
  STATS: '/stats',
  PROFILE: '/profile',
  SEARCH: '/search',
  BATCH: '/batch',
  TAGS: '/tags',
  AUTH: '/auth',
} as const;

export function bookDetailPath(id: string): string {
  return `/book/${id}`;
}

export function readerPath(bookId: string, chapterId?: string): string {
  if (chapterId) {
    return `/reader/${bookId}/${chapterId}`;
  }
  return `/reader/${bookId}`;
}

export function textReaderPath(bookId: string): string {
  return `/text-reader/${bookId}`;
}

/**
 * 根据书籍格式返回正确的阅读器路径。
 * - 'text' → TextReaderPage
 * - 其他 → ReaderPage（图片阅读器）
 */
export function readerPathForBook(book: { id: string; format?: string }, chapterId?: string): string {
  if (book.format === 'text') {
    return textReaderPath(book.id);
  }
  return readerPath(book.id, chapterId);
}

export function subLibraryPath(subLibraryId: string): string {
  return `/library/${subLibraryId}`;
}

export function customCloudPath(): string {
  return '/import/custom-cloud';
}
