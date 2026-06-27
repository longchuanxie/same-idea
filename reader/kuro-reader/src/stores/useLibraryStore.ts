import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants/storage';
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser';
import { getParserForFile } from '@/services/parsers';
import type { ParsedBook } from '@/services/parsers/types';
import { bookRepo } from '@/services/storage/bookRepo';
import { bookFileRepo } from '@/services/storage/bookFileRepo';
import { pageRepo } from '@/services/storage/pageRepo';
import { subLibraryRepo } from '@/services/storage/subLibraryRepo';
import { tagRepo } from '@/services/storage/tagRepo';
import type { Book, Chapter, ReadingProgress, SubLibrary, Tag } from '@/types';
import { extractTitleFromFileName } from '@/utils/extractTitle';

interface LibraryState {
  books: Book[];
  subLibraries: SubLibrary[];
  tags: Tag[];
  coverUrls: Record<string, string>;
  readingProgress: Record<string, ReadingProgress>;
  isLoading: boolean;
  isImporting: boolean;
  importProgress: number;
  error: string | null;
  batchImportTotal: number;
  batchImportCurrent: number;
  batchImportCurrentFile: string;

  loadBooks: () => Promise<void>;
  importFile: (file: File) => Promise<Book | null>;
  importFolder: (files: File[], folderName: string) => Promise<Book | null>;
  importArchivesAsSubLibrary: (files: File[], folderName: string) => Promise<SubLibrary | null>;
  removeBook: (id: string) => Promise<void>;
  updateProgress: (bookId: string, progress: ReadingProgress) => void;
  toggleFavorite: (id: string) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  batchMarkAsRead: (ids: string[]) => void;
  updateBook: (id: string, updates: Partial<Pick<Book, 'title' | 'author' | 'description' | 'status' | 'tags'>>) => Promise<void>;
  getContinueReading: () => Book[];
  removeContinueReading: (bookId: string) => void;
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

const TAG_COLORS = [
  '#E53935', '#D81B60', '#8E24AA', '#5E35B1', '#3949AB',
  '#1E88E5', '#039BE5', '#00ACC1', '#00897B', '#43A047',
  '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00',
  '#F4511E', '#6D4C41', '#757575', '#546E7A', '#78909C',
];

function getRandomColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

const STREAMING_THRESHOLD_MB = 50;
const BYTES_PER_MB = 1024 * 1024;

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
  isLoading: false,
  isImporting: false,
  importProgress: 0,
  error: null,
  batchImportTotal: 0,
  batchImportCurrent: 0,
  batchImportCurrentFile: '',

  loadBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await bookRepo.getAll();
      const booksWithTags = books.map((b) => ({
        ...b,
        tags: Array.isArray(b.tags) ? b.tags : [],
      }));
      const coverUrls: Record<string, string> = {};
      for (const book of booksWithTags) {
        const blob = await bookRepo.getCover(book.id);
        if (blob) {
          coverUrls[book.id] = URL.createObjectURL(blob);
        }
      }
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const readingProgress = stored ? JSON.parse(stored) : {};

      const subLibraries = await subLibraryRepo.getAll();
      const tags = await tagRepo.getAll();

      set({ books: booksWithTags, coverUrls, readingProgress, subLibraries, tags, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  importFile: async (file: File) => {
    set({ isImporting: true, importProgress: 0, error: null });
    try {
      set({ importProgress: 10 });

      // 检查是否已存在相同标题的书籍（避免重复导入）
      const fileTitle = extractTitleFromFileName(file.name);
      const existingBook = get().books.find(b => b.title === fileTitle || b.title === file.name);
      if (existingBook) {
        set({ 
          error: `「${existingBook.title}」已存在于书架中`, 
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

      set({ importProgress: 20 });

      const bookId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const chapterId = `${bookId}-ch1`;

      const useStreaming = file.size > STREAMING_THRESHOLD_MB * BYTES_PER_MB;

      let parsed: ParsedBook;

      if (useStreaming && parser.parseStreaming) {
        parsed = await parser.parseStreaming(file, (pct) => {
          set({ importProgress: 20 + Math.round(pct * 0.4) });
        });
      } else {
        parsed = await parser.parse(file, (pct) => {
          set({ importProgress: 20 + Math.round(pct * 0.4) });
        });
      }

      set({ importProgress: 60 });

      // 再次检查解析后的实际标题是否已存在（如 EPUB 内置标题）
      const existingByParsedTitle = get().books.find(b => b.title === parsed.title);
      if (existingByParsedTitle) {
        set({ 
          error: `「${parsed.title}」已存在于书架中`, 
          isImporting: false, 
          importProgress: 0 
        });
        return null;
      }

      const { book } = buildBookFromParsed(parsed, bookId);

      // Save cover
      await bookRepo.saveCover(bookId, parsed.coverBlob);

      // Save format-specific content
      if (parsed.format === 'comic') {
        await pageRepo.saveAllPages(bookId, chapterId, parsed.imagePages);
      } else if (parsed.format === 'text') {
        await bookFileRepo.save(bookId, parsed.textFile);
      }

      set({ importProgress: 80 });

      await bookRepo.save({ ...book, tags: [] });

      const coverUrl = URL.createObjectURL(parsed.coverBlob);

      set((state) => ({
        books: [...state.books, { ...book, tags: [] }],
        coverUrls: { ...state.coverUrls, [bookId]: coverUrl },
        isImporting: false,
        importProgress: 100,
      }));

      return { ...book, tags: [] };
    } catch (e) {
      set({ error: (e as Error).message, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  importFolder: async (files: File[], folderName: string) => {
    set({ isImporting: true, importProgress: 0, error: null });
    try {
      set({ importProgress: 20 });

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

      const bookId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const { book, chapter } = buildBookFromParsed(parsed, bookId);

      await bookRepo.saveCover(bookId, parsed.coverBlob);
      await pageRepo.saveAllPages(bookId, chapter.id, parsed.imagePages);

      set({ importProgress: 80 });

      await bookRepo.save({ ...book, tags: [] });

      const coverUrl = URL.createObjectURL(parsed.coverBlob);

      set((state) => ({
        books: [...state.books, { ...book, tags: [] }],
        coverUrls: { ...state.coverUrls, [bookId]: coverUrl },
        isImporting: false,
        importProgress: 100,
      }));

      return { ...book, tags: [] };
    } catch (e) {
      set({ error: (e as Error).message, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  importArchivesAsSubLibrary: async (files: File[], folderName: string) => {
    set({
      isImporting: true,
      importProgress: 0,
      error: null,
      batchImportTotal: files.length,
      batchImportCurrent: 0,
      batchImportCurrentFile: '',
    });

    const importedBookIds: string[] = [];
    const importedCovers: Record<string, string> = {};
    const importedBooks: Book[] = [];
    const skippedDuplicates: string[] = [];

    try {
      // 检查是否已存在同名子书库（避免重复导入）
      const existingSubLib = get().subLibraries.find(s => s.name === folderName);
      if (existingSubLib) {
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
          importProgress: Math.round(((i + 1) / files.length) * 90),
        });

        try {
          // 检查文件名提取标题是否已存在
          const title = extractTitleFromFileName(file.name);
          if (existingTitles.has(title)) {
            skippedDuplicates.push(file.name);
            continue;
          }

          const bookId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          const chapterId = `${bookId}-ch1`;

          // 根据文件类型选择合适的 parser
          const parser = getParserForFile(file);
          if (!parser) continue;

          const useStreaming = file.size > STREAMING_THRESHOLD_MB * BYTES_PER_MB;

          let parsed: ParsedBook;

          if (useStreaming && parser.parseStreaming) {
            parsed = await parser.parseStreaming(file, () => {});
          } else {
            parsed = await parser.parse(file);
          }

          // Skip if no content
          if (parsed.format === 'comic' && parsed.imagePages.length === 0) continue;

          const { book } = buildBookFromParsed(parsed, bookId);

          await bookRepo.saveCover(bookId, parsed.coverBlob);

          if (parsed.format === 'comic') {
            await pageRepo.saveAllPages(bookId, chapterId, parsed.imagePages);
          } else if (parsed.format === 'text') {
            await bookFileRepo.save(bookId, parsed.textFile);
          }

          await bookRepo.save({ ...book, tags: [] });

          importedBookIds.push(bookId);
          importedBooks.push({ ...book, tags: [] });
          importedCovers[bookId] = URL.createObjectURL(parsed.coverBlob);
          existingTitles.add(book.title);
        } catch {
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

      const now = new Date();
      const subLibrary: SubLibrary = {
        id: `sublib-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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
      const { [id]: _, ...restCoverUrls } = get().coverUrls;
      // 持久化受影响的标签（移除已删除书籍的引用）
      const affectedTags = get().tags.filter((t) => t.bookIds.includes(id));
      for (const tag of affectedTags) {
        const updatedTag = { ...tag, bookIds: tag.bookIds.filter((bid) => bid !== id) };
        await tagRepo.save(updatedTag);
      }
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
        coverUrls: restCoverUrls as Record<string, string>,
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
    set((state) => {
      const readingProgress = { ...state.readingProgress, [bookId]: progress };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(readingProgress));
      return { readingProgress };
    });
    const book = get().books.find((b) => b.id === bookId);
    if (book) {
      const updatedBook = { ...book, lastReadAt: new Date() };
      bookRepo.save(updatedBook);
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
    for (const id of ids) {
      await bookRepo.deleteFully(id);
      const coverUrl = get().coverUrls[id];
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    }
    // 持久化受影响的标签（移除已删除书籍的引用）
    const affectedTags = get().tags.filter((t) => t.bookIds.some((bid) => ids.includes(bid)));
    for (const tag of affectedTags) {
      const updatedTag = { ...tag, bookIds: tag.bookIds.filter((bid) => !ids.includes(bid)) };
      await tagRepo.save(updatedTag);
    }
    set((state) => ({
      books: state.books.filter((b) => !ids.includes(b.id)),
      coverUrls: Object.fromEntries(
        Object.entries(state.coverUrls).filter(([k]) => !ids.includes(k))
      ),
      tags: state.tags.map((t) => ({
        ...t,
        bookIds: t.bookIds.filter((bid) => !ids.includes(bid)),
      })),
    }));
  },

  batchMarkAsRead: (ids: string[]) => {
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
    const { books, readingProgress } = get();
    return books
      .filter((b) => readingProgress[b.id] && readingProgress[b.id].percentage < 100)
      .sort((a, b) => (b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0) - (a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0));
  },

  removeContinueReading: (bookId: string) => {
    const { readingProgress } = get();
    if (!readingProgress[bookId]) return;
    const { [bookId]: _, ...rest } = readingProgress;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(rest));
    set({ readingProgress: rest as Record<string, ReadingProgress> });
  },

  getRecentlyRead: () => {
    const { books } = get();
    return books
      .filter((b) => b.lastReadAt)
      .sort((a, b) => new Date(b.lastReadAt!).getTime() - new Date(a.lastReadAt!).getTime())
      .slice(0, 6);
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
      id: `sublib-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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

    if (deleteBooks && subLibrary.bookIds.length > 0) {
      // 删除子书库中的所有书籍
      for (const bookId of subLibrary.bookIds) {
        await bookRepo.deleteFully(bookId);
        const coverUrl = get().coverUrls[bookId];
        if (coverUrl) URL.revokeObjectURL(coverUrl);
      }
      // 持久化受影响的标签
      const affectedTags = get().tags.filter((t) =>
        t.bookIds.some((bid) => subLibrary.bookIds.includes(bid))
      );
      for (const tag of affectedTags) {
        const updatedTag = {
          ...tag,
          bookIds: tag.bookIds.filter((bid) => !subLibrary.bookIds.includes(bid)),
        };
        await tagRepo.save(updatedTag);
      }
    }

    await subLibraryRepo.delete(id);

    const bookIdsToDelete = deleteBooks ? subLibrary.bookIds : [];
    set((state) => ({
      subLibraries: state.subLibraries.filter((s) => s.id !== id),
      ...(deleteBooks
        ? {
            books: state.books.filter((b) => !bookIdsToDelete.includes(b.id)),
            coverUrls: Object.fromEntries(
              Object.entries(state.coverUrls).filter(([k]) => !bookIdsToDelete.includes(k))
            ),
            tags: state.tags.map((t) => ({
              ...t,
              bookIds: t.bookIds.filter((bid) => !bookIdsToDelete.includes(bid)),
            })),
          }
        : {}),
    }));
  },

  batchDeleteSubLibraries: async (ids: string[], deleteBooks = false) => {
    const allBookIdsToDelete: string[] = [];

    for (const id of ids) {
      const subLibrary = get().subLibraries.find((s) => s.id === id);
      if (!subLibrary) continue;

      if (deleteBooks) {
        allBookIdsToDelete.push(...subLibrary.bookIds);
      }

      await subLibraryRepo.delete(id);
    }

    // 如果需要删除书籍，执行书籍删除
    if (deleteBooks && allBookIdsToDelete.length > 0) {
      const uniqueBookIds = [...new Set(allBookIdsToDelete)];
      for (const bookId of uniqueBookIds) {
        await bookRepo.deleteFully(bookId);
        const coverUrl = get().coverUrls[bookId];
        if (coverUrl) URL.revokeObjectURL(coverUrl);
      }
      // 持久化受影响的标签
      const affectedTags = get().tags.filter((t) =>
        t.bookIds.some((bid) => uniqueBookIds.includes(bid))
      );
      for (const tag of affectedTags) {
        const updatedTag = {
          ...tag,
          bookIds: tag.bookIds.filter((bid) => !uniqueBookIds.includes(bid)),
        };
        await tagRepo.save(updatedTag);
      }

      set((state) => ({
        subLibraries: state.subLibraries.filter((s) => !ids.includes(s.id)),
        books: state.books.filter((b) => !uniqueBookIds.includes(b.id)),
        coverUrls: Object.fromEntries(
          Object.entries(state.coverUrls).filter(([k]) => !uniqueBookIds.includes(k))
        ),
        tags: state.tags.map((t) => ({
          ...t,
          bookIds: t.bookIds.filter((bid) => !uniqueBookIds.includes(bid)),
        })),
      }));
    } else {
      set((state) => ({
        subLibraries: state.subLibraries.filter((s) => !ids.includes(s.id)),
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
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
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
