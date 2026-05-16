import { create } from 'zustand';
import type { Comic, ReadingProgress, SubLibrary, Tag } from '@/types';
import * as db from '@/services/storageService';
import { parseArchiveFile, parseImageFiles, buildComicFromArchive } from '@/services/archiveParser';
import { STORAGE_KEYS } from '@/constants/storage';

interface LibraryState {
  comics: Comic[];
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

  loadComics: () => Promise<void>;
  importFile: (file: File) => Promise<Comic | null>;
  importFolder: (files: File[], folderName: string) => Promise<Comic | null>;
  importArchivesAsSubLibrary: (files: File[], folderName: string) => Promise<SubLibrary | null>;
  removeComic: (id: string) => Promise<void>;
  updateProgress: (comicId: string, progress: ReadingProgress) => void;
  toggleFavorite: (id: string) => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  batchMarkAsRead: (ids: string[]) => void;
  updateComic: (id: string, updates: Partial<Pick<Comic, 'title' | 'author' | 'description' | 'status' | 'tags'>>) => Promise<void>;
  getContinueReading: () => Comic[];
  removeContinueReading: (comicId: string) => void;
  getRecentlyRead: () => Comic[];
  getFavorites: () => Comic[];
  getComicsByTag: (tagId: string) => Comic[];

  createSubLibrary: (name: string, comicIds?: string[]) => Promise<SubLibrary>;
  renameSubLibrary: (id: string, name: string) => Promise<void>;
  deleteSubLibrary: (id: string) => Promise<void>;
  addComicsToSubLibrary: (subLibraryId: string, comicIds: string[]) => Promise<void>;
  removeComicsFromSubLibrary: (subLibraryId: string, comicIds: string[]) => Promise<void>;
  getSubLibraryComics: (subLibraryId: string) => Comic[];

  createTag: (name: string, color?: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTagToComic: (comicId: string, tagId: string) => Promise<void>;
  removeTagFromComic: (comicId: string, tagId: string) => Promise<void>;
  getTagsForComic: (comicId: string) => Tag[];
  getComicById: (comicId: string) => Comic | undefined;
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

export const useLibraryStore = create<LibraryState>()((set, get) => ({
  comics: [],
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

  loadComics: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawComics = await db.getAllComics();
      const comics = (rawComics as unknown as Comic[]).map((c) => ({
        ...c,
        tags: Array.isArray(c.tags) ? c.tags : [],
      }));
      const coverUrls: Record<string, string> = {};
      for (const comic of comics) {
        const blob = await db.getCover(comic.id);
        if (blob) {
          coverUrls[comic.id] = URL.createObjectURL(blob);
        }
      }
      const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const readingProgress = stored ? JSON.parse(stored) : {};

      const rawSubLibraries = await db.getAllSubLibraries();
      const subLibraries = rawSubLibraries as unknown as SubLibrary[];

      const rawTags = await db.getAllTags();
      const tags = rawTags as unknown as Tag[];

      set({ comics, coverUrls, readingProgress, subLibraries, tags, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  importFile: async (file: File) => {
    set({ isImporting: true, importProgress: 0, error: null });
    try {
      set({ importProgress: 20 });
      const parsed = await parseArchiveFile(file);
      set({ importProgress: 60 });

      const fileId = `comic-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const { comic, chapter } = buildComicFromArchive(parsed, fileId);

      if (parsed.coverBlob) {
        await db.saveCover(fileId, parsed.coverBlob);
      }

      const chapterId = chapter.id;
      await db.saveAllPages(fileId, chapterId, parsed.pages);
      set({ importProgress: 80 });

      const comicData = { ...comic, tags: [] } as unknown as Record<string, unknown>;
      await db.saveComic(comicData);

      let coverUrl = '';
      if (parsed.coverBlob) {
        coverUrl = URL.createObjectURL(parsed.coverBlob);
      }

      set((state) => ({
        comics: [...state.comics, { ...comic, tags: [] }],
        coverUrls: { ...state.coverUrls, [fileId]: coverUrl },
        isImporting: false,
        importProgress: 100,
      }));

      return { ...comic, tags: [] };
    } catch (e) {
      set({ error: (e as Error).message, isImporting: false, importProgress: 0 });
      return null;
    }
  },

  importFolder: async (files: File[], folderName: string) => {
    set({ isImporting: true, importProgress: 0, error: null });
    try {
      set({ importProgress: 20 });
      const parsed = await parseImageFiles(files, folderName);

      if (parsed.pages.length === 0) {
        set({ error: '该文件夹中没有找到图片文件', isImporting: false, importProgress: 0 });
        return null;
      }

      set({ importProgress: 50 });

      const fileId = `comic-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const { comic, chapter } = buildComicFromArchive(parsed, fileId);

      if (parsed.coverBlob) {
        await db.saveCover(fileId, parsed.coverBlob);
      }

      const chapterId = chapter.id;
      await db.saveAllPages(fileId, chapterId, parsed.pages);
      set({ importProgress: 80 });

      const comicData = { ...comic, tags: [] } as unknown as Record<string, unknown>;
      await db.saveComic(comicData);

      let coverUrl = '';
      if (parsed.coverBlob) {
        coverUrl = URL.createObjectURL(parsed.coverBlob);
      }

      set((state) => ({
        comics: [...state.comics, { ...comic, tags: [] }],
        coverUrls: { ...state.coverUrls, [fileId]: coverUrl },
        isImporting: false,
        importProgress: 100,
      }));

      return { ...comic, tags: [] };
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

    const importedComicIds: string[] = [];
    const importedCovers: Record<string, string> = {};
    const importedComics: Comic[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        set({
          batchImportCurrent: i + 1,
          batchImportCurrentFile: file.name,
          importProgress: Math.round(((i + 1) / files.length) * 90),
        });

        try {
          const parsed = await parseArchiveFile(file);
          if (parsed.pages.length === 0) continue;

          const fileId = `comic-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
          const { comic, chapter } = buildComicFromArchive(parsed, fileId);

          if (parsed.coverBlob) {
            await db.saveCover(fileId, parsed.coverBlob);
          }

          const chapterId = chapter.id;
          await db.saveAllPages(fileId, chapterId, parsed.pages);

          const comicData = { ...comic, tags: [] } as unknown as Record<string, unknown>;
          await db.saveComic(comicData);

          importedComicIds.push(fileId);
          importedComics.push({ ...comic, tags: [] });

          if (parsed.coverBlob) {
            importedCovers[fileId] = URL.createObjectURL(parsed.coverBlob);
          }
        } catch {
          continue;
        }
      }

      if (importedComicIds.length === 0) {
        set({
          error: '所有压缩包解析失败',
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
        comicIds: importedComicIds,
        createdAt: now,
        updatedAt: now,
      };
      await db.saveSubLibrary(subLibrary as unknown as Record<string, unknown>);

      set((state) => ({
        comics: [...state.comics, ...importedComics],
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

  removeComic: async (id: string) => {
    try {
      await db.deleteComicFully(id);
      const coverUrl = get().coverUrls[id];
      if (coverUrl) URL.revokeObjectURL(coverUrl);
      const { [id]: _, ...restCoverUrls } = get().coverUrls;
      set((state) => ({
        comics: state.comics.filter((c) => c.id !== id),
        coverUrls: restCoverUrls as Record<string, string>,
        tags: state.tags.map((t) => ({
          ...t,
          comicIds: t.comicIds.filter((cid) => cid !== id),
        })),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  updateProgress: (comicId, progress) => {
    set((state) => {
      const readingProgress = { ...state.readingProgress, [comicId]: progress };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(readingProgress));
      return { readingProgress };
    });
    set((state) => ({
      comics: state.comics.map((c) =>
        c.id === comicId ? { ...c, lastReadAt: new Date() } : c
      ),
    }));
  },

  toggleFavorite: async (id: string) => {
    const comic = get().comics.find((c) => c.id === id);
    if (!comic) return;
    const updated = { ...comic, isFavorite: !comic.isFavorite };
    await db.saveComic(updated as unknown as Record<string, unknown>);
    set((state) => ({
      comics: state.comics.map((c) => (c.id === id ? updated : c)),
    }));
  },

  batchDelete: async (ids: string[]) => {
    for (const id of ids) {
      await db.deleteComicFully(id);
      const coverUrl = get().coverUrls[id];
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    }
    set((state) => ({
      comics: state.comics.filter((c) => !ids.includes(c.id)),
      coverUrls: Object.fromEntries(
        Object.entries(state.coverUrls).filter(([k]) => !ids.includes(k))
      ),
      tags: state.tags.map((t) => ({
        ...t,
        comicIds: t.comicIds.filter((cid) => !ids.includes(cid)),
      })),
    }));
  },

  batchMarkAsRead: (ids: string[]) => {
    set((state) => ({
      comics: state.comics.map((c) =>
        ids.includes(c.id)
          ? {
              ...c,
              chapters: c.chapters.map((ch) => ({ ...ch, status: 'read' as const })),
            }
          : c
      ),
    }));
  },

  updateComic: async (id, updates) => {
    const comic = get().comics.find((c) => c.id === id);
    if (!comic) return;
    const updated = { ...comic, ...updates };
    await db.saveComic(updated as unknown as Record<string, unknown>);
    set((state) => ({
      comics: state.comics.map((c) => (c.id === id ? updated : c)),
    }));
  },

  getContinueReading: () => {
    const { comics, readingProgress } = get();
    return comics
      .filter((c) => readingProgress[c.id] && readingProgress[c.id].percentage < 100)
      .sort((a, b) => (b.lastReadAt ? new Date(b.lastReadAt).getTime() : 0) - (a.lastReadAt ? new Date(a.lastReadAt).getTime() : 0));
  },

  removeContinueReading: (comicId: string) => {
    const { readingProgress } = get();
    if (!readingProgress[comicId]) return;
    const { [comicId]: _, ...rest } = readingProgress;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(rest));
    set({ readingProgress: rest as Record<string, ReadingProgress> });
  },

  getRecentlyRead: () => {
    const { comics } = get();
    return comics
      .filter((c) => c.lastReadAt)
      .sort((a, b) => new Date(b.lastReadAt!).getTime() - new Date(a.lastReadAt!).getTime())
      .slice(0, 6);
  },

  getFavorites: () => {
    const { comics } = get();
    return comics.filter((c) => c.isFavorite);
  },

  getComicsByTag: (tagId: string) => {
    const { comics, tags } = get();
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) return [];
    return tag.comicIds
      .map((id) => comics.find((c) => c.id === id))
      .filter((c): c is Comic => c !== undefined);
  },

  createSubLibrary: async (name: string, comicIds: string[] = []) => {
    const now = new Date();
    const subLibrary: SubLibrary = {
      id: `sublib-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name,
      comicIds,
      createdAt: now,
      updatedAt: now,
    };
    await db.saveSubLibrary(subLibrary as unknown as Record<string, unknown>);
    set((state) => ({
      subLibraries: [...state.subLibraries, subLibrary],
    }));
    return subLibrary;
  },

  renameSubLibrary: async (id: string, name: string) => {
    const subLibrary = get().subLibraries.find((s) => s.id === id);
    if (!subLibrary) return;
    const updated = { ...subLibrary, name, updatedAt: new Date() };
    await db.saveSubLibrary(updated as unknown as Record<string, unknown>);
    set((state) => ({
      subLibraries: state.subLibraries.map((s) => (s.id === id ? updated : s)),
    }));
  },

  deleteSubLibrary: async (id: string) => {
    await db.deleteSubLibrary(id);
    set((state) => ({
      subLibraries: state.subLibraries.filter((s) => s.id !== id),
    }));
  },

  addComicsToSubLibrary: async (subLibraryId: string, comicIds: string[]) => {
    const subLibrary = get().subLibraries.find((s) => s.id === subLibraryId);
    if (!subLibrary) return;
    const mergedIds = [...new Set([...subLibrary.comicIds, ...comicIds])];
    const updated = { ...subLibrary, comicIds: mergedIds, updatedAt: new Date() };
    await db.saveSubLibrary(updated as unknown as Record<string, unknown>);
    set((state) => ({
      subLibraries: state.subLibraries.map((s) => (s.id === subLibraryId ? updated : s)),
    }));
  },

  removeComicsFromSubLibrary: async (subLibraryId: string, comicIds: string[]) => {
    const subLibrary = get().subLibraries.find((s) => s.id === subLibraryId);
    if (!subLibrary) return;
    const filteredIds = subLibrary.comicIds.filter((id) => !comicIds.includes(id));
    const updated = { ...subLibrary, comicIds: filteredIds, updatedAt: new Date() };
    await db.saveSubLibrary(updated as unknown as Record<string, unknown>);
    set((state) => ({
      subLibraries: state.subLibraries.map((s) => (s.id === subLibraryId ? updated : s)),
    }));
  },

  getSubLibraryComics: (subLibraryId: string) => {
    const { comics, subLibraries } = get();
    const subLibrary = subLibraries.find((s) => s.id === subLibraryId);
    if (!subLibrary) return [];
    return subLibrary.comicIds
      .map((id) => comics.find((c) => c.id === id))
      .filter((c): c is Comic => c !== undefined);
  },

  createTag: async (name: string, color?: string) => {
    const tag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      color: color || getRandomColor(),
      comicIds: [],
      createdAt: new Date(),
    };
    await db.saveTag(tag as unknown as Record<string, unknown>);
    set((state) => ({
      tags: [...state.tags, tag],
    }));
    return tag;
  },

  updateTag: async (id: string, updates) => {
    const tag = get().tags.find((t) => t.id === id);
    if (!tag) return;
    const updated = { ...tag, ...updates };
    await db.saveTag(updated as unknown as Record<string, unknown>);
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTag: async (id: string) => {
    await db.deleteTag(id);
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      comics: state.comics.map((c) => ({
        ...c,
        tags: Array.isArray(c.tags) ? c.tags.filter((tid) => tid !== id) : [],
      })),
    }));
  },

  addTagToComic: async (comicId: string, tagId: string) => {
    const { comics, tags } = get();
    const comic = comics.find((c) => c.id === comicId);
    const tag = tags.find((t) => t.id === tagId);
    if (!comic || !tag) return;

    const comicTags = Array.isArray(comic.tags) ? comic.tags : [];
    const updatedComic = { ...comic, tags: [...new Set([...comicTags, tagId])] };
    const updatedTag = { ...tag, comicIds: [...new Set([...tag.comicIds, comicId])] };

    await db.saveComic(updatedComic as unknown as Record<string, unknown>);
    await db.saveTag(updatedTag as unknown as Record<string, unknown>);

    set((state) => ({
      comics: state.comics.map((c) => (c.id === comicId ? updatedComic : c)),
      tags: state.tags.map((t) => (t.id === tagId ? updatedTag : t)),
    }));
  },

  removeTagFromComic: async (comicId: string, tagId: string) => {
    const { comics, tags } = get();
    const comic = comics.find((c) => c.id === comicId);
    const tag = tags.find((t) => t.id === tagId);
    if (!comic || !tag) return;

    const comicTags = Array.isArray(comic.tags) ? comic.tags : [];
    const updatedComic = { ...comic, tags: comicTags.filter((tid) => tid !== tagId) };
    const updatedTag = { ...tag, comicIds: tag.comicIds.filter((cid) => cid !== comicId) };

    await db.saveComic(updatedComic as unknown as Record<string, unknown>);
    await db.saveTag(updatedTag as unknown as Record<string, unknown>);

    set((state) => ({
      comics: state.comics.map((c) => (c.id === comicId ? updatedComic : c)),
      tags: state.tags.map((t) => (t.id === tagId ? updatedTag : t)),
    }));
  },

  getTagsForComic: (comicId: string) => {
    const { tags } = get();
    return tags.filter((t) => t.comicIds.includes(comicId));
  },

  getComicById: (comicId: string) => {
    const { comics } = get();
    return comics.find((c) => c.id === comicId);
  },
}));
