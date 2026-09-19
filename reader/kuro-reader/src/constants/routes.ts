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
  REVIEW: '/review',
  VOCABULARY: '/vocabulary',
  ASK: '/ask',
  ATLAS: '/atlas',
  KNOWLEDGE_HUB: '/knowledge-hub',
  KNOWLEDGE: '/knowledge/:bookId/:artifactId',
  AUTH: '/auth',
} as const;

export function bookDetailPath(id: string): string {
  return `/book/${id}`;
}

/** 全局知识库聚合页（主菜单直达；产物查看器仍走 knowledgePath） */
export function knowledgeHubPath(): string {
  return '/knowledge-hub';
}

/** 文本阅读器的批注直达查询参数（摘抄墙/回望席等外部跳转用） */
export const ANNOTATION_QUERY_PARAM = 'ann';
/** 图页阅读器的页码直达查询参数（1 起；页级手记跳转用） */
export const READER_PAGE_QUERY_PARAM = 'page';
/** 文本阅读器的知识库原文直达查询参数（值 `chapterIndex,offsetRatio`） */
export const READER_GOTO_QUERY_PARAM = 'goto';

export function readerPath(bookId: string, chapterId?: string, page?: number): string {
  const base = chapterId ? `/reader/${bookId}/${chapterId}` : `/reader/${bookId}`;
  return page != null ? `${base}?${READER_PAGE_QUERY_PARAM}=${page}` : base;
}

export function textReaderPath(bookId: string, chapterId?: string, annotationId?: string): string {
  const base = chapterId ? `/text-reader/${bookId}/${chapterId}` : `/text-reader/${bookId}`;
  return annotationId ? `${base}?${ANNOTATION_QUERY_PARAM}=${encodeURIComponent(annotationId)}` : base;
}

/** 解析 ?goto= 值（`chapterIndex,offsetRatio`）；形状不对返回 null */
export function parseGotoParam(value: string | null): { chapterIndex: number; ratio: number } | null {
  if (!value) return null;
  const match = value.match(/^(\d+),(\d*\.?\d+)$/);
  if (!match) return null;
  const chapterIndex = Number(match[1]);
  const ratio = Number(match[2]);
  if (!Number.isInteger(chapterIndex) || chapterIndex < 0) return null;
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) return null;
  return { chapterIndex, ratio };
}

/**
 * 知识库回原文的统一跳转路径。
 * - text：目标章 + ?goto= 章内占比定位（TextReader 消费）
 * - pdf：章内页直达（?page= 索引+1；PDF 单章含全部页）
 * - 其他（漫画等）：落回档案卡
 */
export function knowledgeSourcePath(
  book: { id: string; format?: string; chapters?: { id: string }[] },
  chapterIndex: number,
  offsetRatio?: number
): string {
  const chapters = book.chapters ?? [];
  if (book.format === 'text') {
    const chapterId = chapters[chapterIndex]?.id ?? chapters[0]?.id;
    const base = chapterId ? `/text-reader/${book.id}/${chapterId}` : `/text-reader/${book.id}`;
    return offsetRatio != null
      ? `${base}?${READER_GOTO_QUERY_PARAM}=${chapterIndex},${offsetRatio}`
      : base;
  }
  if (book.format === 'pdf') {
    return readerPath(book.id, chapters[0]?.id, chapterIndex + 1);
  }
  return bookDetailPath(book.id);
}

/**
 * 根据书籍格式返回正确的阅读器路径。
 * - 'text' → TextReaderPage（annotationId 可选：直达批注原句处）
 * - 其他 → ReaderPage（page 可选：1 起页码直达，页级手记跳转用）
 */
export function readerPathForBook(
  book: { id: string; format?: string },
  chapterId?: string,
  annotationId?: string,
  page?: number
): string {
  if (book.format === 'text') {
    return textReaderPath(book.id, chapterId, annotationId);
  }
  return readerPath(book.id, chapterId, page);
}

export function subLibraryPath(subLibraryId: string): string {
  return `/library/${subLibraryId}`;
}

/** 复习席路径（Home 今日待复习入口跳转用） */
export function reviewPath(): string {
  return '/review';
}

/** 生词本路径（摘抄墙入口跳转用） */
export function vocabularyPath(): string {
  return '/vocabulary';
}

/** 摘抄墙路径；bookId 可选——档案卡「查看全部手记」按本书筛选直达 */
export function notesPath(bookId?: string): string {
  return bookId ? `/notes?bookId=${encodeURIComponent(bookId)}` : '/notes';
}

/** 问藏书的路径（知识库聚合页入口跳转用） */
export function askPath(): string {
  return '/ask';
}

/** 跨书图谱路径（知识库聚合页入口跳转用） */
export function atlasPath(): string {
  return '/atlas';
}

/** 知识产物查看器路径（档案卡知识库区块跳转用） */
export function knowledgePath(bookId: string, artifactId: string): string {
  return `/knowledge/${bookId}/${artifactId}`;
}

export function customCloudPath(): string {
  return '/import/custom-cloud';
}

/** 设置页路径；focus='ai' 携带锚点参数——AI 未配置引导深链直达知识库组（Settings 消费后滚动+高亮） */
export function settingsPath(focus?: 'ai'): string {
  return focus ? `${ROUTES.SETTINGS}?focus=ai` : ROUTES.SETTINGS;
}
