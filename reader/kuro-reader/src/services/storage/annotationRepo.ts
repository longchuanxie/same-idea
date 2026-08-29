import type { Annotation } from '@/types'

import { getDB, STORE_NAMES } from './db'

/** IndexedDB 中的存储形态：日期字段为 ISO 字符串 */
type StoredAnnotation = Omit<Annotation, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

export const annotationRepo = {
  async add(annotation: Annotation): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.annotations, {
      ...annotation,
      createdAt: annotation.createdAt instanceof Date ? annotation.createdAt.toISOString() : annotation.createdAt,
      updatedAt: annotation.updatedAt instanceof Date ? annotation.updatedAt.toISOString() : annotation.updatedAt,
    })
  },

  async update(id: string, updates: Partial<Pick<Annotation, 'note' | 'style' | 'updatedAt'>>): Promise<void> {
    const db = await getDB()
    const existing = (await db.get(STORE_NAMES.annotations, id)) as StoredAnnotation | undefined
    if (!existing) return
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    await db.put(STORE_NAMES.annotations, updated)
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.annotations, id)
  },

  async getByBookId(bookId: string): Promise<Annotation[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.annotations)) as StoredAnnotation[]
    return all
      .filter((a) => a.bookId === bookId)
      .map((a) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  /** 备份导出用：返回全部批注（日期已还原为 Date） */
  async getAll(): Promise<Annotation[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.annotations)) as StoredAnnotation[]
    return all.map((a) => ({
      ...a,
      createdAt: new Date(a.createdAt),
      updatedAt: new Date(a.updatedAt),
    }))
  },

  /** 备份导入前清空（覆盖语义） */
  async deleteAll(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAMES.annotations)
  },

  async getByChapter(bookId: string, chapterIndex: number): Promise<Annotation[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.annotations)) as StoredAnnotation[]
    return all
      .filter((a) => a.bookId === bookId && a.chapterIndex === chapterIndex)
      .map((a) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      }))
      .sort((a, b) => a.startOffset - b.startOffset)
  },
}
