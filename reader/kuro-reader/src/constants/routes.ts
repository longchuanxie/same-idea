export const ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  SUB_LIBRARY: '/library/:subLibraryId',
  COMIC_DETAIL: '/comic/:id',
  READER: '/reader/:comicId/:chapterId?',
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

export function comicDetailPath(id: string): string {
  return `/comic/${id}`;
}

export function readerPath(comicId: string, chapterId?: string): string {
  if (chapterId) {
    return `/reader/${comicId}/${chapterId}`;
  }
  return `/reader/${comicId}`;
}

export function subLibraryPath(subLibraryId: string): string {
  return `/library/${subLibraryId}`;
}

export function customCloudPath(): string {
  return '/import/custom-cloud';
}
