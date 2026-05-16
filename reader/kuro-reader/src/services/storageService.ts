import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'kuro-reader-db';
const DB_VERSION = 3;

const STORE_COMICS = 'comics';
const STORE_PAGES = 'pages';
const STORE_COVERS = 'covers';
const STORE_SUBLIBRARIES = 'sublibraries';
const STORE_TAGS = 'tags';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_COMICS)) {
          db.createObjectStore(STORE_COMICS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PAGES)) {
          db.createObjectStore(STORE_PAGES);
        }
        if (!db.objectStoreNames.contains(STORE_COVERS)) {
          db.createObjectStore(STORE_COVERS);
        }
        if (!db.objectStoreNames.contains(STORE_SUBLIBRARIES)) {
          db.createObjectStore(STORE_SUBLIBRARIES, { keyPath: 'id' });
        }
        if (oldVersion < 3 && !db.objectStoreNames.contains(STORE_TAGS)) {
          db.createObjectStore(STORE_TAGS, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveComic(comic: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  await db.put(STORE_COMICS, comic);
}

export async function getComic(id: string): Promise<Record<string, unknown> | undefined> {
  const db = await getDB();
  return db.get(STORE_COMICS, id);
}

export async function getAllComics(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll(STORE_COMICS);
}

export async function deleteComic(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_COMICS, id);
}

export async function saveCover(comicId: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put(STORE_COVERS, blob, comicId);
}

export async function getCover(comicId: string): Promise<Blob | undefined> {
  const db = await getDB();
  return db.get(STORE_COVERS, comicId);
}

export async function savePage(
  comicId: string,
  chapterId: string,
  pageIndex: number,
  blob: Blob
): Promise<void> {
  const key = `${comicId}/${chapterId}/${pageIndex}`;
  const db = await getDB();
  await db.put(STORE_PAGES, blob, key);
}

export async function getPage(
  comicId: string,
  chapterId: string,
  pageIndex: number
): Promise<Blob | undefined> {
  const key = `${comicId}/${chapterId}/${pageIndex}`;
  const db = await getDB();
  return db.get(STORE_PAGES, key);
}

export async function saveAllPages(
  comicId: string,
  chapterId: string,
  blobs: Blob[]
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_PAGES, 'readwrite');
  for (let i = 0; i < blobs.length; i++) {
    const key = `${comicId}/${chapterId}/${i}`;
    await tx.store.put(blobs[i], key);
  }
  await tx.done;
}

export async function deleteAllPages(comicId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_PAGES, 'readwrite');
  let cursor = await tx.store.openCursor();
  while (cursor) {
    const key = cursor.key as string;
    if (key.startsWith(`${comicId}/`)) {
      await cursor.delete();
    }
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function deleteComicFully(id: string): Promise<void> {
  await deleteComic(id);
  await deleteAllPages(id);
  const db = await getDB();
  await db.delete(STORE_COVERS, id);
}

export async function getStorageUsage(): Promise<{ used: number; quota: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return {
      used: est.usage ?? 0,
      quota: est.quota ?? 0,
    };
  }
  return { used: 0, quota: 0 };
}

export async function saveSubLibrary(subLibrary: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  await db.put(STORE_SUBLIBRARIES, subLibrary);
}

export async function getSubLibrary(id: string): Promise<Record<string, unknown> | undefined> {
  const db = await getDB();
  return db.get(STORE_SUBLIBRARIES, id);
}

export async function getAllSubLibraries(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll(STORE_SUBLIBRARIES);
}

export async function deleteSubLibrary(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_SUBLIBRARIES, id);
}

export async function saveTag(tag: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  await db.put(STORE_TAGS, tag);
}

export async function getTag(id: string): Promise<Record<string, unknown> | undefined> {
  const db = await getDB();
  return db.get(STORE_TAGS, id);
}

export async function getAllTags(): Promise<Record<string, unknown>[]> {
  const db = await getDB();
  return db.getAll(STORE_TAGS);
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_TAGS, id);
}
