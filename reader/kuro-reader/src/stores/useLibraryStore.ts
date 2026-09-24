import { create, type StoreApi } from 'zustand';

import { getRandomCatalogColor, migrateTagColor } from '@/constants/catalogColors';
import { STORAGE_KEYS } from '@/constants/storage';
import { getParserForFile } from '@/services/parsers';
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser';
import type { ParsedBook, ParsedTextBook } from '@/services/parsers/types';
import { bookFileRepo } from '@/services/storage/bookFileRepo';
import { bookRepo } from '@/services/storage/bookRepo';
import { knowledgeRepo } from '@/services/storage/knowledgeRepo';
import { pageRepo } from '@/services/storage/pageRepo';
import { progressRepo } from '@/services/storage/progressRepo';
import { subLibraryRepo } from '@/services/storage/subLibraryRepo';
import { tagRepo } from '@/services/storage/tagRepo';
import { textChapterCacheRepo } from '@/services/storage/textChapterCacheRepo';
import { recordUsageSignal } from '@/services/telemetry/usageSignals';
import { buildTextChapters, warmTextChapterCache } from '@/services/textContent';
import type { Book, Chapter, ReadingProgress, SubLibrary, Tag } from '@/types';
import { deriveMergedBookTitle, extractArchiveChapterInfo } from '@/utils/comicChapterSplit';
import { extractTitleFromFileName } from '@/utils/extractTitle';

/** 替换确认弹窗的对照数据：书架现存 vs 新文件 */
export interface PendingBookReplace {
  existingBookId: string;
  existingTitle: string;
  existingAuthor: string;
  existingChapters: number;
  incomingTitle: string;
  incomingAuthor: string;
  incomingChapters: number;
  incomingFileName: string;
}

export interface LibraryState {
  books: Book[];
  subLibraries: SubLibrary[];
  tags: Tag[];
  coverUrls: Record<string, string>;
  readingProgress: Record<string, ReadingProgress>;
  /** 已从门厅座位移出的书（仅隐藏，进度保留） */
  hiddenContinueIds: string[];
  isLoading: boolean;
  isImporting: boolean;
  importProgress: number;
  error: string | null;
  /** 部分成功警示：导入整体成功但个别文件被跳过/失败时的汇总说明（供页面 toast） */
  importWarning: string | null;
  /** 同标题文本导入的替换确认（importFile 解析后暂停在此，UI 弹「替换/保留两本/取消」） */
  pendingReplace: PendingBookReplace | null;
  batchImportTotal: number;
  batchImportCurrent: number;
  batchImportCurrentFile: string;

  loadBooks: () => Promise<void>;
  importFile: (file: File, opts?: ImportOptions) => Promise<Book | null>;
  resolvePendingReplace: (decision: 'replace' | 'keep-both' | 'cancel') => Promise<Book | null>;
  importFolder: (files: File[], folderName: string, opts?: ImportOptions) => Promise<Book | null>;
  importArchivesAsSubLibrary: (files: File[], folderName: string, opts?: ImportOptions) => Promise<SubLibrary | null>;
  importArchivesAsBook: (files: File[], fallbackTitle: string, opts?: ImportOptions) => Promise<Book | null>;
  removeBook: (id: string) => Promise<void>;
  updateProgress: (bookId: string, progress: ReadingProgress) => void;
  toggleFavorite: (id: string) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  batchMarkAsRead: (ids: string[]) => void;
  updateBook: (id: string, updates: Partial<Pick<Book, 'title' | 'author' | 'description' | 'status' | 'tags' | 'contentKind'>>) => Promise<void>;
  getContinueReading: () => Book[];
  removeContinueReading: (bookId: string) => void;
  /** 仅把书移出门厅「你的座位」，阅读进度保留（可经 restoreContinueReading 撤销） */
  dismissContinueReading: (bookId: string) => void;
  restoreContinueReading: (bookId: string) => void;
  getRecentlyRead: () => Book[];
  getFavorites: () => Book[];
  getBooksByTag: (tagId: string) => Book[];

  createSubLibrary: (name: string, bookIds?: string[]) => Promise<SubLibrary>;
  renameSubLibrary: (id: string, name: string) => Promise<void>;
  deleteSubLibrary: (id: string, deleteBooks?: boolean) => Promise<void>;
  batchDeleteSubLibraries: (ids: string[], deleteBooks?: boolean) => Promise<void>;
  addBooksToSubLibrary: (subLibraryId: string, bookIds: string[]) => Promise<void>;
  removeBooksFromSubLibrary: (subLibraryId: string, bookIds: string[]) => Promise<void>;
  getSubLibraryBooks: (subLibraryId: string) => Book[];

  createTag: (name: string, color?: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTagToBook: (bookId: string, tagId: string) => Promise<void>;
  removeTagFromBook: (bookId: string, tagId: string) => Promise<void>;
  getTagsForBook: (bookId: string) => Tag[];
  getBookById: (bookId: string) => Book | undefined;
}

function getRandomColor(): string {
  return getRandomCatalogColor();
}

/**
 * 读取全部阅读进度。
 * 旧版本进度存于 localStorage：IndexedDB 为空时执行一次性迁移后清除旧键。
 */
async function loadProgressWithMigration(): Promise<Record<string, ReadingProgress>> {
  let progressList = await progressRepo.getAll();
  if (progressList.length === 0) {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (stored) {
      try {
        const legacy = JSON.parse(stored) as Record<string, ReadingProgress>;
        progressList = Object.values(legacy);
        await Promise.all(progressList.map((p) => progressRepo.save(p)));
      } catch {
        // 损坏的旧数据直接丢弃
      }
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    }
  }
  const readingProgress: Record<string, ReadingProgress> = {};
  for (const p of progressList) {
    readingProgress[p.bookId] = p;
  }
  return readingProgress;
}

const STREAMING_THRESHOLD_MB = 50;
const BYTES_PER_MB = 1024 * 1024;
// id 随机段：base36 串，跳过 "0." 前缀取 6 位
const RANDOM_ID_RADIX = 36;
const RANDOM_ID_SUBSTRING_START = 2;
const RANDOM_ID_SUBSTRING_LENGTH = 8;
// 导入进度锚点（%）
const IMPORT_PROGRESS_PARSING_BASE = 20;
const IMPORT_PROGRESS_PARSING_SPAN = 0.4;
const IMPORT_PROGRESS_BATCH_BASE = 90;
// 派生列表
const RECENTLY_READ_LIMIT = 6;
const PERCENT_MULTIPLIER = 100;

/** 导入归属选项：从特藏室发起导入时指定 subLibraryId，新书直接归入该特藏室 */
export interface ImportOptions {
  subLibraryId?: string;
}

/** 部分成功警示文案：整体导入成功但存在被跳过/解析失败的文件时非空 */
const WARNING_NAME_PREVIEW_LIMIT = 3;

/** 汇总文件名用于提示：最多列 3 个，多则「等 N 个」 */
function summarizeFileNames(names: string[]): string {
  const shown = names.slice(0, WARNING_NAME_PREVIEW_LIMIT).join('、');
  return names.length > WARNING_NAME_PREVIEW_LIMIT ? `${shown} 等 ${names.length} 个文件` : shown;
}

/** 部分成功警示文案：整体导入成功但存在被跳过/解析失败的文件时非空 */
/** 在役封面 object URL 登记处：loadBooks 整表置换时回收「不在新表」的 URL。
 *  并发轮次（首页挂载 × 云同步落地）各自的进入快照看不到对方新建的 URL，
 *  只靠快照回收会漏掉被后一轮整表覆盖掉的孤儿——登记处补齐这一路 */
const liveCoverUrls = new Set<string>();

/** 登记一个进入 coverUrls 状态的 object URL（创建处调用） */
function trackCoverObjectUrl(url: string): string {
  liveCoverUrls.add(url);
  return url;
}

/** 导入完成点预热文本书解析缓存：TXT 直接用导入时已拆好的章节落库，
 *  首次开书即免整本重解析（长网文为秒级收益）。Markdown 的逐章 parseMarkdownDocument
 *  成本较高，不在导入期跑——留待首次开书回填，此后同样命中缓存 */
function warmTextCacheFromParsed(bookId: string, parsed: ParsedBook): void {
  if (parsed.format !== 'text' || !parsed.chapters || parsed.chapters.length === 0) return;
  const type = parsed.textFile.type;
  if (type.startsWith('text/markdown') || type.startsWith('text/x-markdown')) return;
  warmTextChapterCache(bookId, buildTextChapters(parsed.chapters, false), false);
}

/** 替换更新流资格：书架上的书与导入文件都是 TXT/MD 文本（EPUB 章节带运行期 object URL 不跨会话，不接） */
const TEXT_REPLACE_FILE_PATTERN = /\.(txt|md|markdown)$/i;

function isTextReplaceCandidate(existing: Book, file: File): boolean {
  return existing.format === 'text' && TEXT_REPLACE_FILE_PATTERN.test(file.name);
}

/** 保留两本时的去重标题：书名（2）、书名（3）…… */
function uniqueImportTitle(base: string, books: Book[]): string {
  const titles = new Set(books.map((b) => b.title));
  if (!titles.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}（${n}）`;
    if (!titles.has(candidate)) return candidate;
  }
}

/** 替换确认挂起期间的载荷（含大体积解析产物，不入 zustand 状态避免无谓订阅） */
let pendingReplacePayload: { parsed: ParsedTextBook; file: File; opts?: ImportOptions } | null = null;

type LibraryStoreApi = Pick<StoreApi<LibraryState>, 'setState' | 'getState'>;

/** 导入落库尾段：封面/格式内容/repo 持久化 + 书架状态更新（importFile 与「保留两本」共用） */
async function persistParsedAsNewBook(
  parsed: ParsedBook,
  opts: ImportOptions | undefined,
  api: LibraryStoreApi,
  titleOverride?: string,
): Promise<Book> {
  const bookId = `book-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`;
  const chapterId = `${bookId}-ch1`;

  const { book } = buildBookFromParsed(parsed, bookId);
  const titled = titleOverride ? { ...book, title: titleOverride } : book;

  await bookRepo.saveCover(bookId, parsed.coverBlob);

  if (parsed.format === 'comic') {
    if (parsed.chapters && parsed.chapters.length > 0) {
      for (let i = 0; i < parsed.chapters.length; i++) {
        await pageRepo.saveAllPages(bookId, `${bookId}-ch${i + 1}`, parsed.chapters[i].imagePages);
      }
    } else {
      await pageRepo.saveAllPages(bookId, chapterId, parsed.imagePages);
    }
  } else if (parsed.format === 'pdf') {
    await pageRepo.saveAllPages(bookId, chapterId, parsed.imagePages);
    await bookFileRepo.save(bookId, parsed.pdfFile);
  } else if (parsed.format === 'text') {
    await bookFileRepo.save(bookId, parsed.textFile);
    warmTextCacheFromParsed(bookId, parsed);
  }

  api.setState({ importProgress: 80 });

  await bookRepo.save({ ...titled, tags: [] });

  const coverUrl = trackCoverObjectUrl(URL.createObjectURL(parsed.coverBlob));

  api.setState((state) => ({
    books: [...state.books, { ...titled, tags: [] }],
    coverUrls: { ...state.coverUrls, [bookId]: coverUrl },
    isImporting: false,
    importProgress: 100,
  }));

  if (opts?.subLibraryId) {
    await api.getState().addBooksToSubLibrary(opts.subLibraryId, [titled.id]);
  }

  return { ...titled, tags: [] };
}

function buildPartialImportWarning(failedFiles: string[], unsupportedFiles: string[]): string | null {
  if (failedFiles.length === 0 && unsupportedFiles.length === 0) return null;
  if (failedFiles.length === 0) {
    return `已跳过 ${unsupportedFiles.length} 个不支持合并的文件（仅图片档案可并入一书）：${summarizeFileNames(unsupportedFiles)}`;
  }
  if (unsupportedFiles.length === 0) {
    return `${failedFiles.length} 个压缩包解析失败未并入：${summarizeFileNames(failedFiles)}`;
  }
  return `部分文件未并入：解析失败 ${failedFiles.length} 个、类型不支持 ${unsupportedFiles.length} 个`;
}

/** 将 ParsedBook 转换为 Book + Chapter 实体 */
function buildBookFromParsed(parsed: ParsedBook, bookId: string): { book: Book; chapter: Chapter } {
  const chapterId = `${bookId}-ch1`;

  const book: Book = {
    id: bookId,
    title: parsed.title,
    author: '',
    cover: '',
    genres: [],
    tags: [],
    description: '',
    status: 'completed',
    totalChapters: 1,
    chapters: [],
    addedAt: new Date(),
    isFavorite: false,
    format: parsed.format,
  };

  let pages: string[] = [];
  let pageRefs = parsed.pageRefs;

  if (parsed.format === 'comic') {
    pages = parsed.imagePageNames;
  }

  // PDF：导入时已逐页渲染为图片，复用漫画阅读器
  if (parsed.format === 'pdf') {
    pages = parsed.imagePageNames;
  }

  // 漫画：导入期识别出 ≥2 章时构建多章（目录模式/文件名序列/条漫宽高比）
  if (parsed.format === 'comic' && parsed.chapters && parsed.chapters.length > 0) {
    book.totalChapters = parsed.chapters.length;
    book.chapters = parsed.chapters.map((ch, idx) => ({
      id: `${bookId}-ch${idx + 1}`,
      bookId,
      number: idx + 1,
      title: ch.title,
      pages: ch.imagePageNames,
      status: 'unread' as const,
    }));
  }

  // 文本格式：支持多章节
  if (parsed.format === 'text') {
    // 提取作者（如果解析器提供了）
    if (parsed.author) {
      book.author = parsed.author;
    }

    // 如果解析器拆分了章节，为每个章节创建 Chapter 实体
    if (parsed.chapters && parsed.chapters.length > 0) {
      book.totalChapters = parsed.chapters.length;
      const chapters: Chapter[] = parsed.chapters.map((ch, idx) => ({
        id: `${bookId}-ch${idx + 1}`,
        bookId,
        number: idx + 1,
        title: ch.title || `第${idx + 1}章`,
        pages: [],
        status: 'unread',
        pageRefs: [{ kind: 'text-content' as const }],
      }));
      book.chapters = chapters;
    } else {
      // 未拆分章节，使用默认单章节
      pageRefs = parsed.pageRefs || [{ kind: 'text-content' as const }];
    }
  }

  // 如果还没有章节，创建默认章节
  if (book.chapters.length === 0) {
    const chapter: Chapter = {
      id: chapterId,
      bookId,
      number: 1,
      title: parsed.title,
      pages,
      status: 'unread',
      pageRefs,
    };
    book.chapters = [chapter];
  }

  return { book, chapter: book.chapters[0] };
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  books: [],
  subLibraries: [],
  tags: [],
  coverUrls: {},
  readingProgress: {},
  hiddenContinueIds: (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HIDDEN_CONTINUE);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  })(),
  isLoading: false,
  isImporting: false,
  importProgress: 0,
  error: null,
  importWarning: null,
  pendingReplace: null,
  batchImportTotal: 0,
  batchImportCurrent: 0,
  batchImportCurrentFile: '',

  loadBooks: async () => {
    set({ isLoading: true, error: null });
    // 进入时快照旧封面表：并发触发时各轮回收各自快照，不会误删上一轮刚生成的新 URL
    const previousCoverUrls = get().coverUrls;
    try {
      const books = await bookRepo.getAll();
      const booksWithTags = books.map((b) => ({
        ...b,
        tags: Array.isArray(b.tags) ? b.tags : [],
      }));
      const coverUrls: Record<string, string> = {};
      for (const book of booksWithTags) {
        const blob = await bookRepo.getCover(book.id);
        // 空 blob（生成失败的残留）会产出加载失败的 URL，浏览器转而渲染 alt 大字
        if (blob && blob.size > 0) {
          coverUrls[book.id] = trackCoverObjectUrl(URL.createObjectURL(blob));
        }
      }
      // 整体重载回收不再在役的封面 URL：loadBooks 会被首页挂载/云同步反复触发，不回收即会话级泄漏。
      // 回收两路并集（快照兜底未登记存量 + 登记处抓并发轮孤儿）里不在新表的 URL
      const retainedUrls = new Set(Object.values(coverUrls));
      const retireUrl = (url?: string) => {
        if (url && !retainedUrls.has(url)) URL.revokeObjectURL(url);
      };
      Object.values(previousCoverUrls).forEach(retireUrl);
      liveCoverUrls.forEach(retireUrl);
      liveCoverUrls.clear();
      retainedUrls.forEach((url) => liveCoverUrls.add(url));
      const readingProgress = await loadProgressWithMigration();

      const subLibraries = await subLibraryRepo.getAll();
      // 存量标签的旧色板在加载期归一为分类色（不回写数据库）
      const rawTags = await tagRepo.getAll();
      const tags = (Array.isArray(rawTags) ? rawTags : []).map((t) => ({
        ...t,
        color: migrateTagColor(t.color) ?? t.color,
      }));

      set({ books: booksWithTags, coverUrls, readingProgress, subLibraries, tags, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  importFile: async (file: File, opts?: ImportOptions) => {
    // 导入重入守卫：并发导入会在 books 更新前读到旧列表、绕过按标题去重，
    // 产生重复书目（双击/OPDS 下载与本地导入并行等场景）
    if (get().isImporting) {
      set({ error: '已有导入正在进行中，请等待完成后再导入' });
      return null;
    }
    set({ isImporting: true, importProgress: 0, error: null, importWarning: null });
    try {
      set({ importProgress: 10 });

      // 同标题命中不再一律拦截：文本书换新文件（追更主路径）放行到解析后再弹替换确认，
      // 其余格式（漫画/PDF/EPUB）维持「已存在」报错
      const fileTitle = extractTitleFromFileName(file.name);
      const existingByFileTitle = get().books.find(b => b.title === fileTitle || b.title === file.name);
      if (existingByFileTitle && !isTextReplaceCandidate(existingByFileTitle, file)) {
        set({
          error: `「${existingByFileTitle.title}」已存在于书架中`,
          isImporting: false,
          importProgress: 0
        });
        return null;
      }

      // 根据文件类型选择合适的 parser
      const parser = getParserForFile(file);
      if (!parser) {
        set({ error: '不支持的文件格式', isImporting: false, importProgress: 0 });
        return null;
      }

      set({ importProgress: IMPORT_PROGRESS_PARSING_BASE });

      const useStreaming = file.size > STREAMING_THRESHOLD_MB * BYTES_PER_MB;

      let parsed: ParsedBook;

      if (useStreaming && parser.parseStreaming) {
        parsed = await parser.parseStreaming(file, (pct) => {
          set({ importProgress: IMPORT_PROGRESS_PARSING_BASE + Math.round(pct * IMPORT_PROGRESS_PARSING_SPAN) });
        });
      } else {
        parsed = await parser.parse(file, (pct) => {
          set({ importProgress: IMPORT_PROGRESS_PARSING_BASE + Math.round(pct * IMPORT_PROGRESS_PARSING_SPAN) });
        });
      }

      set({ importProgress: 60 });

      // 解析后再查碰撞：真实标题（EPUB/MD 内置标题）优先，文件名标题兜底
      const existingByParsedTitle = get().books.find(b => b.title === parsed.title);
      const collisionBook = existingByParsedTitle ?? existingByFileTitle;
      if (collisionBook) {
        if (parsed.format !== 'text' || !isTextReplaceCandidate(collisionBook, file)) {
          set({
            error: `「${collisionBook.title}」已存在于书架中`,
            isImporting: false,
            importProgress: 0
          });
          return null;
        }
        // 同书换新文件：导入暂停，弹「替换内容 / 保留两本 / 取消」确认（进度/标签/收藏全保留）
        pendingReplacePayload = { parsed, file, opts: opts ?? undefined };
        set({
          pendingReplace: {
            existingBookId: collisionBook.id,
            existingTitle: collisionBook.title,
            existingAuthor: collisionBook.author,
            existingChapters: collisionBook.totalChapters,
            incomingTitle: parsed.title,
            incomingAuthor: parsed.author ?? '',
            incomingChapters: parsed.chapters?.length ?? 0,
            incomingFileName: file.name,
          },
          importProgress: 0,
        });
        return null;
      }

      return await persistParsedAsNewBook(parsed, opts, { setState: set, getState: get });
    } catch (e) {
      set({ error: (e as Error).message, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  resolvePendingReplace: async (decision) => {
    const pending = get().pendingReplace;
    const payload = pendingReplacePayload;
    if (!pending || !payload) {
      set({ pendingReplace: null, isImporting: false });
      return null;
    }
    pendingReplacePayload = null;

    if (decision === 'cancel') {
      set({ pendingReplace: null, isImporting: false, importProgress: 0 });
      return null;
    }

    try {
      if (decision === 'keep-both') {
        const title = uniqueImportTitle(payload.parsed.title, get().books);
        set({ pendingReplace: null });
        return await persistParsedAsNewBook(payload.parsed, payload.opts, { setState: set, getState: get }, title);
      }

      const existing = get().books.find(b => b.id === pending.existingBookId);
      if (!existing) {
        set({ error: '原书已不在书架中，替换未执行', pendingReplace: null, isImporting: false, importProgress: 0 });
        return null;
      }

      // 替换：同 bookId 换内容——进度锚/标签/收藏/入库时间全保留，标题作者与章节数取新文件
      const { book: rebuilt } = buildBookFromParsed(payload.parsed, existing.id);
      const replaced: Book = {
        ...existing,
        title: payload.parsed.title,
        author: payload.parsed.author || existing.author,
        totalChapters: rebuilt.totalChapters,
        chapters: rebuilt.chapters,
      };

      await bookFileRepo.save(existing.id, payload.parsed.textFile);
      // 旧章节缓存必删（否则开书读到替换前的章）；在途旧预热与本次写入的理论竞态接受
      // ——预热写只在导入/开书瞬间发出，替换隔着数秒的人机确认
      await textChapterCacheRepo.delete(existing.id);
      warmTextCacheFromParsed(existing.id, payload.parsed);

      await bookRepo.save(replaced);

      // 知识件标过期不删除（生成花费在册）：重跑覆盖落库后随新件消失
      const artifacts = await knowledgeRepo.getByBookId(existing.id);
      for (const artifact of artifacts) {
        if (!artifact.stale) await knowledgeRepo.save({ ...artifact, stale: true });
      }
      recordUsageSignal('book-replace', { bookId: existing.id });

      set((state) => ({
        books: state.books.map((b) => (b.id === replaced.id ? replaced : b)),
        pendingReplace: null,
        isImporting: false,
        importProgress: 100,
      }));
      return replaced;
    } catch (e) {
      set({ error: (e as Error).message, pendingReplace: null, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  importFolder: async (files: File[], folderName: string, opts?: ImportOptions) => {
    // 导入重入守卫：并发导入会在 books 更新前读到旧列表、绕过按标题去重，
    // 产生重复书目（双击/OPDS 下载与本地导入并行等场景）
    if (get().isImporting) {
      set({ error: '已有导入正在进行中，请等待完成后再导入' });
      return null;
    }
    set({ isImporting: true, importProgress: 0, error: null, importWarning: null });
    try {
      set({ importProgress: IMPORT_PROGRESS_PARSING_BASE });

      // 检查是否已存在相同名称的书籍（避免重复导入）
      const existingBook = get().books.find(b => b.title === folderName);
      if (existingBook) {
        set({ 
          error: `「${folderName}」已存在于书架中`, 
          isImporting: false, 
          importProgress: 0 
        });
        return null;
      }

      const parsed = await new ComicArchiveParser().parseImageFolder(files, folderName);

      if (parsed.format !== 'comic' || parsed.imagePages.length === 0) {
        set({ error: '该文件夹中没有找到图片文件', isImporting: false, importProgress: 0 });
        return null;
      }

      set({ importProgress: 50 });

      const bookId = `book-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`;
      const { book, chapter } = buildBookFromParsed(parsed, bookId);

      await bookRepo.saveCover(bookId, parsed.coverBlob);
      if (parsed.chapters && parsed.chapters.length > 0) {
        for (let i = 0; i < parsed.chapters.length; i++) {
          await pageRepo.saveAllPages(bookId, `${bookId}-ch${i + 1}`, parsed.chapters[i].imagePages);
        }
      } else {
        await pageRepo.saveAllPages(bookId, chapter.id, parsed.imagePages);
      }

      set({ importProgress: 80 });

      await bookRepo.save({ ...book, tags: [] });

      const coverUrl = trackCoverObjectUrl(URL.createObjectURL(parsed.coverBlob));

      set((state) => ({
        books: [...state.books, { ...book, tags: [] }],
        coverUrls: { ...state.coverUrls, [bookId]: coverUrl },
        isImporting: false,
        importProgress: 100,
      }));

      if (opts?.subLibraryId) {
        await get().addBooksToSubLibrary(opts.subLibraryId, [book.id]);
      }

      return { ...book, tags: [] };
    } catch (e) {
      set({ error: (e as Error).message, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  importArchivesAsBook: async (files: File[], fallbackTitle: string, opts?: ImportOptions) => {
    // 导入重入守卫：并发导入会在 books 更新前读到旧列表、绕过按标题去重，
    // 产生重复书目（双击/OPDS 下载与本地导入并行等场景）
    if (get().isImporting) {
      set({ error: '已有导入正在进行中，请等待完成后再导入' });
      return null;
    }
    set({ isImporting: true, importProgress: 0, error: null, importWarning: null });
    try {
      // 按文件名中的章节序号排序（无序号的排最后）
      const sorted = [...files]
        .map((file) => ({ file, info: extractArchiveChapterInfo(file.name) }))
        .sort((a, b) => {
          const an = a.info?.number ?? Number.MAX_SAFE_INTEGER;
          const bn = b.info?.number ?? Number.MAX_SAFE_INTEGER;
          return an !== bn ? an - bn : a.file.name.localeCompare(b.file.name);
        });

      const bookId = `book-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`;
      const chapterPayloads: { chapter: Chapter; pages: Blob[] }[] = [];
      let coverBlob: Blob | null = null;
      // 部分失败记账：解析抛错的文件与类型不支持合并的文件（结束时有书入库则汇总警示）
      const failedFiles: string[] = [];
      const unsupportedFiles: string[] = [];

      for (let i = 0; i < sorted.length; i++) {
        set({ importProgress: IMPORT_PROGRESS_PARSING_BASE + Math.round(((i + 1) / sorted.length) * IMPORT_PROGRESS_PARSING_SPAN * PERCENT_MULTIPLIER) });
        const parser = getParserForFile(sorted[i].file);
        if (!parser) {
          unsupportedFiles.push(sorted[i].file.name);
          continue;
        }
        try {
          const parsed = await parser.parse(sorted[i].file);
          // 合并仅支持图片型档案（文本类原始文件存储模型为单文件一书）
          if (parsed.format !== 'comic') {
            unsupportedFiles.push(sorted[i].file.name);
            continue;
          }
          if (!coverBlob) coverBlob = parsed.coverBlob;

          // 文件内部已识别出多章时按章并入；否则整个文件为一章
          const groups =
            parsed.chapters && parsed.chapters.length > 0
              ? parsed.chapters
              : [{ title: sorted[i].info?.title ?? parsed.title, imagePages: parsed.imagePages, imagePageNames: parsed.imagePageNames }];
          for (const group of groups) {
            const number = chapterPayloads.length + 1;
            const id = `${bookId}-ch${number}`;
            chapterPayloads.push({
              chapter: {
                id,
                bookId,
                number,
                title: group.title,
                pages: group.imagePageNames,
                status: 'unread' as const,
              },
              pages: group.imagePages,
            });
          }
        } catch {
          failedFiles.push(sorted[i].file.name);
          continue;
        }
      }

      if (chapterPayloads.length === 0 || !coverBlob) {
        const detail = failedFiles.length > 0 ? `（${summarizeFileNames(failedFiles)}）` : '';
        set({ error: `所有压缩包解析失败${detail}`, isImporting: false, importProgress: 0 });
        return null;
      }

      const title = deriveMergedBookTitle(files.map((f) => f.name), fallbackTitle);
      const existing = get().books.find((b) => b.title === title);
      if (existing) {
        set({ error: `「${existing.title}」已存在于书架中`, isImporting: false, importProgress: 0 });
        return null;
      }

      const book: Book = {
        id: bookId,
        title,
        author: '',
        cover: '',
        genres: [],
        tags: [],
        description: '',
        status: 'ongoing',
        totalChapters: chapterPayloads.length,
        chapters: chapterPayloads.map((c) => c.chapter),
        addedAt: new Date(),
        isFavorite: false,
        format: 'comic',
      };

      await bookRepo.saveCover(bookId, coverBlob);
      for (const { chapter, pages } of chapterPayloads) {
        await pageRepo.saveAllPages(bookId, chapter.id, pages);
      }

      set({ importProgress: IMPORT_PROGRESS_BATCH_BASE });

      await bookRepo.save({ ...book, tags: [] });

      const coverUrl = trackCoverObjectUrl(URL.createObjectURL(coverBlob));
      set((state) => ({
        books: [...state.books, { ...book, tags: [] }],
        coverUrls: { ...state.coverUrls, [bookId]: coverUrl },
        isImporting: false,
        importProgress: 100,
        importWarning: buildPartialImportWarning(failedFiles, unsupportedFiles),
      }));

      if (opts?.subLibraryId) {
        await get().addBooksToSubLibrary(opts.subLibraryId, [book.id]);
      }

      return { ...book, tags: [] };
    } catch (e) {
      set({ error: (e as Error).message, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  importArchivesAsSubLibrary: async (files: File[], folderName: string, opts?: ImportOptions) => {
    // 导入重入守卫：并发导入会在 books 更新前读到旧列表、绕过按标题去重，
    // 产生重复书目（双击/OPDS 下载与本地导入并行等场景）
    if (get().isImporting) {
      set({ error: '已有导入正在进行中，请等待完成后再导入' });
      return null;
    }
    set({
      isImporting: true,
      importProgress: 0,
      error: null,
      importWarning: null,
      batchImportTotal: files.length,
      batchImportCurrent: 0,
      batchImportCurrentFile: '',
    });

    const importedBookIds: string[] = [];
    const importedCovers: Record<string, string> = {};
    const importedBooks: Book[] = [];
    const skippedDuplicates: string[] = [];
    // 批内解析失败记账：不静默吞——用户得知道少了哪几本（与 importArchivesAsBook 同口径）
    const failedFiles: string[] = [];

    try {
      // 检查是否已存在同名子书库（避免重复导入）；指定特藏室目标时改为并入该特藏室，无需查重
      const existingSubLib = get().subLibraries.find(s => s.name === folderName);
      if (!opts?.subLibraryId && existingSubLib) {
        set({ 
          error: `子书库「${folderName}」已存在`, 
          isImporting: false, 
          importProgress: 0,
          batchImportTotal: 0,
          batchImportCurrent: 0,
          batchImportCurrentFile: '',
        });
        return null;
      }

      // 获取现有书籍标题用于去重
      const existingTitles = new Set(get().books.map(b => b.title));

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        set({
          batchImportCurrent: i + 1,
          batchImportCurrentFile: file.name,
          importProgress: Math.round(((i + 1) / files.length) * IMPORT_PROGRESS_BATCH_BASE),
        });

        try {
          // 检查文件名提取标题是否已存在
          const title = extractTitleFromFileName(file.name);
          if (existingTitles.has(title)) {
            skippedDuplicates.push(file.name);
            continue;
          }

          const bookId = `book-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`;
          const chapterId = `${bookId}-ch1`;

          // 根据文件类型选择合适的 parser
          const parser = getParserForFile(file);
          if (!parser) {
            failedFiles.push(file.name);
            continue;
          }

          const useStreaming = file.size > STREAMING_THRESHOLD_MB * BYTES_PER_MB;

          let parsed: ParsedBook;

          if (useStreaming && parser.parseStreaming) {
            parsed = await parser.parseStreaming(file, () => {});
          } else {
            parsed = await parser.parse(file);
          }

          // Skip if no content
          if (parsed.format === 'comic' && parsed.imagePages.length === 0) {
            failedFiles.push(file.name);
            continue;
          }

          const { book } = buildBookFromParsed(parsed, bookId);

          await bookRepo.saveCover(bookId, parsed.coverBlob);

          if (parsed.format === 'comic') {
            if (parsed.chapters && parsed.chapters.length > 0) {
              for (let i = 0; i < parsed.chapters.length; i++) {
                await pageRepo.saveAllPages(bookId, `${bookId}-ch${i + 1}`, parsed.chapters[i].imagePages);
              }
            } else {
              await pageRepo.saveAllPages(bookId, chapterId, parsed.imagePages);
            }
          } else if (parsed.format === 'text') {
            await bookFileRepo.save(bookId, parsed.textFile);
            warmTextCacheFromParsed(bookId, parsed);
          }

          await bookRepo.save({ ...book, tags: [] });

          importedBookIds.push(bookId);
          importedBooks.push({ ...book, tags: [] });
          importedCovers[bookId] = trackCoverObjectUrl(URL.createObjectURL(parsed.coverBlob));
          existingTitles.add(book.title);
        } catch {
          failedFiles.push(file.name);
          continue;
        }
      }

      if (importedBookIds.length === 0) {
        const msg = skippedDuplicates.length > 0
          ? `所有文件均已存在（跳过了 ${skippedDuplicates.length} 个重复文件）`
          : '所有压缩包解析失败';
        set({
          error: msg,
          isImporting: false,
          importProgress: 0,
          batchImportTotal: 0,
          batchImportCurrent: 0,
          batchImportCurrentFile: '',
        });
        return null;
      }

      set({ importProgress: 95 });

      // 指定特藏室目标：并入既有特藏室，不新建
      if (opts?.subLibraryId) {
        await get().addBooksToSubLibrary(opts.subLibraryId, importedBookIds);
        const target = get().subLibraries.find((s) => s.id === opts.subLibraryId);
        set((state) => ({
          books: [...state.books, ...importedBooks],
          coverUrls: { ...state.coverUrls, ...importedCovers },
          subLibraries: target
            ? state.subLibraries.map((s) => (s.id === target.id ? target : s))
            : state.subLibraries,
          isImporting: false,
          importProgress: 100,
          batchImportTotal: 0,
          batchImportCurrent: 0,
          batchImportCurrentFile: '',
          importWarning: buildPartialImportWarning(failedFiles, []),
        }));
        return target ?? null;
      }

      const now = new Date();
      const subLibrary: SubLibrary = {
        id: `sublib-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`,
        name: folderName,
        bookIds: importedBookIds,
        createdAt: now,
        updatedAt: now,
      };
      await subLibraryRepo.save(subLibrary);

      set((state) => ({
        books: [...state.books, ...importedBooks],
        coverUrls: { ...state.coverUrls, ...importedCovers },
        subLibraries: [...state.subLibraries, subLibrary],
        isImporting: false,
        importProgress: 100,
        batchImportTotal: 0,
        batchImportCurrent: 0,
        batchImportCurrentFile: '',
        importWarning: buildPartialImportWarning(failedFiles, []),
      }));

      return subLibrary;
    } catch (e) {
      set({
        error: (e as Error).message,
        isImporting: false,
        importProgress: 0,
        batchImportTotal: 0,
        batchImportCurrent: 0,
        batchImportCurrentFile: '',
      });
      return null;
    }
  },

  removeBook: async (id: string) => {
    try {
      await bookRepo.deleteFully(id);
      const coverUrl = get().coverUrls[id];
      if (coverUrl) URL.revokeObjectURL(coverUrl);
      const { [id]: _cover, ...restCoverUrls } = get().coverUrls;
      const { [id]: _progress, ...restProgress } = get().readingProgress;
      // 持久化受影响的标签（移除已删除书籍的引用）
      const affectedTags = get().tags.filter((t) => t.bookIds.includes(id));
      for (const tag of affectedTags) {
        const updatedTag = { ...tag, bookIds: tag.bookIds.filter((bid) => bid !== id) };
        await tagRepo.save(updatedTag);
      }
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        coverUrls: restCoverUrls as Record<string, string>,
        readingProgress: restProgress,
        tags: state.tags.map((t) => ({
          ...t,
          bookIds: t.bookIds.filter((bid) => bid !== id),
        })),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updateProgress: (bookId, progress) => {
    // 中央打点：云端同步按 updatedAt 做逐条合并
    const stamped: ReadingProgress = { ...progress, updatedAt: Date.now() };
    set((state) => ({
      readingProgress: { ...state.readingProgress, [bookId]: stamped },
    }));
    // 持久化到 IndexedDB（fire-and-forget，与书籍元数据保存策略一致）；吞掉 rejection 防悬挂
    progressRepo.save(stamped).catch(() => {});
    const book = get().books.find((b) => b.id === bookId);
    if (book) {
      const updatedBook = { ...book, lastReadAt: new Date() };
      bookRepo.save(updatedBook).catch(() => {});
      set((state) => ({
        books: state.books.map((b) =>
          b.id === bookId ? updatedBook : b
        ),
      }));
    }
  },

  toggleFavorite: async (id: string) => {
    const book = get().books.find((b) => b.id === id);
    if (!book) return;
    const updated = { ...book, isFavorite: !book.isFavorite };
    await bookRepo.save(updated);
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? updated : b)),
    }));
  },

  batchDelete: async (ids: string[]) => {
    // 逐本记录成败：中途失败不让 UI 与数据库脱节（已删的从界面消失，失败的书原样保留）
    const deletedIds: string[] = [];
    let firstError: string | null = null;
    for (const id of ids) {
      try {
        await bookRepo.deleteFully(id);
        deletedIds.push(id);
        const coverUrl = get().coverUrls[id];
        if (coverUrl) URL.revokeObjectURL(coverUrl);
      } catch (e) {
        firstError = firstError ?? (e as Error).message;
      }
    }
    // 持久化受影响的标签（移除已删除书籍的引用）
    const affectedTags = get().tags.filter((t) => t.bookIds.some((bid) => deletedIds.includes(bid)));
    for (const tag of affectedTags) {
      const updatedTag = { ...tag, bookIds: tag.bookIds.filter((bid) => !deletedIds.includes(bid)) };
      try {
        await tagRepo.save(updatedTag);
      } catch (e) {
        firstError = firstError ?? (e as Error).message;
      }
    }
    if (firstError) set({ error: firstError });
    if (deletedIds.length === 0) return;
    set((state) => ({
      books: state.books.filter((b) => !deletedIds.includes(b.id)),
      coverUrls: Object.fromEntries(
        Object.entries(state.coverUrls).filter(([k]) => !deletedIds.includes(k))
      ),
      readingProgress: Object.fromEntries(
        Object.entries(state.readingProgress).filter(([k]) => !deletedIds.includes(k))
      ),
      tags: state.tags.map((t) => ({
        ...t,
        bookIds: t.bookIds.filter((bid) => !deletedIds.includes(bid)),
      })),
    }));
  },

  batchMarkAsRead: (ids: string[]) => {
    // 先落库再改内存：只改内存会在下次 loadBooks（重启/回前台）后回退（fire-and-forget 与 updateProgress 同策略）
    for (const id of ids) {
      const book = get().books.find((b) => b.id === id);
      if (!book) continue;
      bookRepo
        .save({ ...book, chapters: book.chapters.map((ch) => ({ ...ch, status: 'read' as const })) })
        .catch(() => {});
    }
    set((state) => ({
      books: state.books.map((b) =>
        ids.includes(b.id)
          ? {
              ...b,
              chapters: b.chapters.map((ch) => ({ ...ch, status: 'read' as const })),
            }
          : b
      ),
    }));
  },

  updateBook: async (id, updates) => {
    const book = get().books.find((b) => b.id === id);
    if (!book) return;
    const updated = { ...book, ...updates };
    await bookRepo.save(updated);
    set((state) => ({
      books: state.books.map((b) => (b.id === id ? updated : b)),
    }));
  },

  getContinueReading: () => {
    const { books, readingProgress, hiddenContinueIds } = get();
    return books
      .filter(
        (b) =>
          readingProgress[b.id] &&
          readingProgress[b.id].percentage < PERCENT_MULTIPLIER &&
          !hiddenContinueIds.includes(b.id)
      )
      .sort((a, b) => (b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0) - (a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0));
  },

  removeContinueReading: (bookId: string) => {
    const { readingProgress } = get();
    if (!readingProgress[bookId]) return;
    const { [bookId]: _, ...rest } = readingProgress;
    // DB 删除失败吞掉：内存已先行移除，别让 unhandled rejection 外溢（与 updateProgress 同约定）
    progressRepo.remove(bookId).catch(() => {});
    set({ readingProgress: rest as Record<string, ReadingProgress> });
  },

  dismissContinueReading: (bookId: string) => {
    const { hiddenContinueIds } = get();
    if (hiddenContinueIds.includes(bookId)) return;
    const next = [...hiddenContinueIds, bookId];
    set({ hiddenContinueIds: next });
    try {
      localStorage.setItem(STORAGE_KEYS.HIDDEN_CONTINUE, JSON.stringify(next));
    } catch {
      // localStorage 不可用时仅本次会话生效
    }
  },

  restoreContinueReading: (bookId: string) => {
    const { hiddenContinueIds } = get();
    if (!hiddenContinueIds.includes(bookId)) return;
    const next = hiddenContinueIds.filter((id) => id !== bookId);
    set({ hiddenContinueIds: next });
    try {
      localStorage.setItem(STORAGE_KEYS.HIDDEN_CONTINUE, JSON.stringify(next));
    } catch {
      // 同上
    }
  },

  getRecentlyRead: () => {
    const { books } = get();
    return books
      .filter((b) => b.lastReadAt)
      .sort((a, b) => new Date(b.lastReadAt!).getTime() - new Date(a.lastReadAt!).getTime())
      .slice(0, RECENTLY_READ_LIMIT);
  },

  getFavorites: () => {
    const { books } = get();
    return books.filter((b) => b.isFavorite);
  },

  getBooksByTag: (tagId: string) => {
    const { books, tags } = get();
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) return [];
    return tag.bookIds
      .map((id) => books.find((b) => b.id === id))
      .filter((b): b is Book => b !== undefined);
  },

  createSubLibrary: async (name: string, bookIds: string[] = []) => {
    const now = new Date();
    const subLibrary: SubLibrary = {
      id: `sublib-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`,
      name,
      bookIds,
      createdAt: now,
      updatedAt: now,
    };
    await subLibraryRepo.save(subLibrary);
    set((state) => ({
      subLibraries: [...state.subLibraries, subLibrary],
    }));
    return subLibrary;
  },

  renameSubLibrary: async (id: string, name: string) => {
    const subLibrary = get().subLibraries.find((s) => s.id === id);
    if (!subLibrary) return;
    const updated = { ...subLibrary, name, updatedAt: new Date() };
    await subLibraryRepo.save(updated);
    set((state) => ({
      subLibraries: state.subLibraries.map((s) => (s.id === id ? updated : s)),
    }));
  },

  deleteSubLibrary: async (id: string, deleteBooks = false) => {
    const subLibrary = get().subLibraries.find((s) => s.id === id);
    if (!subLibrary) return;

    // 逐本记账（与 batchDelete 同口径）：中途失败的书留在书架/UI 不脱节，不静默残留孤儿
    const removedBookIds: string[] = [];
    let firstError: string | null = null;
    if (deleteBooks && subLibrary.bookIds.length > 0) {
      // 删除子书库中的所有书籍
      for (const bookId of subLibrary.bookIds) {
        try {
          await bookRepo.deleteFully(bookId);
          removedBookIds.push(bookId);
          const coverUrl = get().coverUrls[bookId];
          if (coverUrl) URL.revokeObjectURL(coverUrl);
        } catch (e) {
          firstError = firstError ?? (e as Error).message;
        }
      }
      // 持久化受影响的标签
      const affectedTags = get().tags.filter((t) =>
        t.bookIds.some((bid) => removedBookIds.includes(bid))
      );
      for (const tag of affectedTags) {
        const updatedTag = {
          ...tag,
          bookIds: tag.bookIds.filter((bid) => !removedBookIds.includes(bid)),
        };
        try {
          await tagRepo.save(updatedTag);
        } catch (e) {
          firstError = firstError ?? (e as Error).message;
        }
      }
    }

    await subLibraryRepo.delete(id);

    set((state) => ({
      subLibraries: state.subLibraries.filter((s) => s.id !== id),
      ...(removedBookIds.length > 0
        ? {
            books: state.books.filter((b) => !removedBookIds.includes(b.id)),
            coverUrls: Object.fromEntries(
              Object.entries(state.coverUrls).filter(([k]) => !removedBookIds.includes(k))
            ),
            readingProgress: Object.fromEntries(
              Object.entries(state.readingProgress).filter(([k]) => !removedBookIds.includes(k))
            ),
            tags: state.tags.map((t) => ({
              ...t,
              bookIds: t.bookIds.filter((bid) => !removedBookIds.includes(bid)),
            })),
          }
        : {}),
      ...(firstError ? { error: firstError } : {}),
    }));
  },

  batchDeleteSubLibraries: async (ids: string[], deleteBooks = false) => {
    const allBookIdsToDelete: string[] = [];
    // 逐项记账：删成功的子书库/书才从 UI 消失，失败的留原样且错误可见（与 batchDelete 同口径）
    const deletedSubLibIds: string[] = [];
    let firstError: string | null = null;

    for (const id of ids) {
      const subLibrary = get().subLibraries.find((s) => s.id === id);
      if (!subLibrary) continue;

      if (deleteBooks) {
        allBookIdsToDelete.push(...subLibrary.bookIds);
      }

      try {
        await subLibraryRepo.delete(id);
        deletedSubLibIds.push(id);
      } catch (e) {
        firstError = firstError ?? (e as Error).message;
      }
    }

    // 如果需要删除书籍，执行书籍删除
    const removedBookIds: string[] = [];
    if (deleteBooks && allBookIdsToDelete.length > 0) {
      const uniqueBookIds = [...new Set(allBookIdsToDelete)];
      for (const bookId of uniqueBookIds) {
        try {
          await bookRepo.deleteFully(bookId);
          removedBookIds.push(bookId);
          const coverUrl = get().coverUrls[bookId];
          if (coverUrl) URL.revokeObjectURL(coverUrl);
        } catch (e) {
          firstError = firstError ?? (e as Error).message;
        }
      }
      // 持久化受影响的标签
      const affectedTags = get().tags.filter((t) =>
        t.bookIds.some((bid) => removedBookIds.includes(bid))
      );
      for (const tag of affectedTags) {
        const updatedTag = {
          ...tag,
          bookIds: tag.bookIds.filter((bid) => !removedBookIds.includes(bid)),
        };
        try {
          await tagRepo.save(updatedTag);
        } catch (e) {
          firstError = firstError ?? (e as Error).message;
        }
      }

      set((state) => ({
        subLibraries: state.subLibraries.filter((s) => !deletedSubLibIds.includes(s.id)),
        books: state.books.filter((b) => !removedBookIds.includes(b.id)),
        coverUrls: Object.fromEntries(
          Object.entries(state.coverUrls).filter(([k]) => !removedBookIds.includes(k))
        ),
        readingProgress: Object.fromEntries(
          Object.entries(state.readingProgress).filter(([k]) => !removedBookIds.includes(k))
        ),
        tags: state.tags.map((t) => ({
          ...t,
          bookIds: t.bookIds.filter((bid) => !removedBookIds.includes(bid)),
        })),
        ...(firstError ? { error: firstError } : {}),
      }));
    } else {
      set((state) => ({
        subLibraries: state.subLibraries.filter((s) => !deletedSubLibIds.includes(s.id)),
        ...(firstError ? { error: firstError } : {}),
      }));
    }
  },

  addBooksToSubLibrary: async (subLibraryId: string, bookIds: string[]) => {
    const subLibrary = get().subLibraries.find((s) => s.id === subLibraryId);
    if (!subLibrary) return;
    const mergedIds = [...new Set([...subLibrary.bookIds, ...bookIds])];
    const updated = { ...subLibrary, bookIds: mergedIds, updatedAt: new Date() };
    await subLibraryRepo.save(updated);
    set((state) => ({
      subLibraries: state.subLibraries.map((s) => (s.id === subLibraryId ? updated : s)),
    }));
  },

  removeBooksFromSubLibrary: async (subLibraryId: string, bookIds: string[]) => {
    const subLibrary = get().subLibraries.find((s) => s.id === subLibraryId);
    if (!subLibrary) return;
    const filteredIds = subLibrary.bookIds.filter((id) => !bookIds.includes(id));
    const updated = { ...subLibrary, bookIds: filteredIds, updatedAt: new Date() };
    await subLibraryRepo.save(updated);
    set((state) => ({
      subLibraries: state.subLibraries.map((s) => (s.id === subLibraryId ? updated : s)),
    }));
  },

  getSubLibraryBooks: (subLibraryId: string) => {
    const { books, subLibraries } = get();
    const subLibrary = subLibraries.find((s) => s.id === subLibraryId);
    if (!subLibrary) return [];
    return subLibrary.bookIds
      .map((id) => books.find((b) => b.id === id))
      .filter((b): b is Book => b !== undefined);
  },

  createTag: async (name: string, color?: string) => {
    const tag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).substring(RANDOM_ID_SUBSTRING_START, RANDOM_ID_SUBSTRING_LENGTH)}`,
      name: name.trim(),
      color: color || getRandomColor(),
      bookIds: [],
      createdAt: new Date(),
    };
    await tagRepo.save(tag);
    set((state) => ({
      tags: [...state.tags, tag],
    }));
    return tag;
  },

  updateTag: async (id: string, updates) => {
    const tag = get().tags.find((t) => t.id === id);
    if (!tag) return;
    const updated = { ...tag, ...updates };
    await tagRepo.save(updated);
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTag: async (id: string) => {
    await tagRepo.delete(id);
    // 持久化受影响的书籍（移除已删除标签的引用）
    const affectedBooks = get().books.filter(
      (b) => Array.isArray(b.tags) && b.tags.includes(id)
    );
    for (const book of affectedBooks) {
      const updatedBook = {
        ...book,
        tags: book.tags.filter((tid) => tid !== id),
      };
      await bookRepo.save(updatedBook);
    }
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      books: state.books.map((b) => ({
        ...b,
        tags: Array.isArray(b.tags) ? b.tags.filter((tid) => tid !== id) : [],
      })),
    }));
  },

  addTagToBook: async (bookId: string, tagId: string) => {
    const { books, tags } = get();
    const book = books.find((b) => b.id === bookId);
    const tag = tags.find((t) => t.id === tagId);
    if (!book || !tag) return;

    const bookTags = Array.isArray(book.tags) ? book.tags : [];
    const updatedBook = { ...book, tags: [...new Set([...bookTags, tagId])] };
    const updatedTag = { ...tag, bookIds: [...new Set([...tag.bookIds, bookId])] };

    await bookRepo.save(updatedBook);
    await tagRepo.save(updatedTag);

    set((state) => ({
      books: state.books.map((b) => (b.id === bookId ? updatedBook : b)),
      tags: state.tags.map((t) => (t.id === tagId ? updatedTag : t)),
    }));
  },

  removeTagFromBook: async (bookId: string, tagId: string) => {
    const { books, tags } = get();
    const book = books.find((b) => b.id === bookId);
    const tag = tags.find((t) => t.id === tagId);
    if (!book || !tag) return;

    const bookTags = Array.isArray(book.tags) ? book.tags : [];
    const updatedBook = { ...book, tags: bookTags.filter((tid) => tid !== tagId) };
    const updatedTag = { ...tag, bookIds: tag.bookIds.filter((bid) => bid !== bookId) };

    await bookRepo.save(updatedBook);
    await tagRepo.save(updatedTag);

    set((state) => ({
      books: state.books.map((b) => (b.id === bookId ? updatedBook : b)),
      tags: state.tags.map((t) => (t.id === tagId ? updatedTag : t)),
    }));
  },

  getTagsForBook: (bookId: string) => {
    const { tags } = get();
    return tags.filter((t) => t.bookIds.includes(bookId));
  },

  getBookById: (bookId: string) => {
    const { books } = get();
    return books.find((b) => b.id === bookId);
  },
}));
