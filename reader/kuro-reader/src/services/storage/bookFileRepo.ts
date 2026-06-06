import { getDB } from './db'

/**
 * IndexedDB store name for PDF original-file blob storage.
 *
 * **Phase 1 stub**: The 'bookFiles' object store does NOT yet exist in the
 * current DB schema (v3). Phase 3 will upgrade the DB to v4 and create this
 * store, at which point all methods below will start operating normally.
 *
 * Kept module-private (not exported via `STORE_NAMES` in `db.ts`) so that
 * other modules cannot accidentally depend on a store that does not exist.
 */
const STORE_NAME = 'bookFiles'

async function storeExists(): Promise<boolean> {
  const db = await getDB()
  return db.objectStoreNames.contains(STORE_NAME)
}

/**
 * Repository for storing original book files (e.g. PDF) by comicId.
 *
 * Phase 1 stub behavior (no v4 store yet):
 * - `save` throws a clear error to prevent silent data loss.
 * - `get` returns `undefined` so callers can degrade gracefully.
 * - `delete` is a no-op so cleanup flows do not fail.
 *
 * Phase 3 (DB v4) will register the 'bookFiles' object store and these
 * methods will perform real IDB reads/writes without changing their
 * signatures. Real CRUD tests will be added at that point.
 */
export const bookFileRepo = {
  async save(comicId: string, blob: Blob): Promise<void> {
    if (!(await storeExists())) {
      throw new Error(
        `bookFiles store not yet available (Phase 3 will introduce DB v4). comicId=${comicId}, size=${blob.size}`
      )
    }
    const db = await getDB()
    await db.put(STORE_NAME, blob, comicId)
  },

  async get(comicId: string): Promise<Blob | undefined> {
    if (!(await storeExists())) return undefined
    const db = await getDB()
    return db.get(STORE_NAME, comicId) as Promise<Blob | undefined>
  },

  async delete(comicId: string): Promise<void> {
    if (!(await storeExists())) return
    const db = await getDB()
    await db.delete(STORE_NAME, comicId)
  },
}
