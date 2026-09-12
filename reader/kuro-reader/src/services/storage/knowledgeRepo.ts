import type { KnowledgeArtifact } from '@/types'

import { getDB, STORE_NAMES } from './db'
import { tombstoneRepo } from './tombstoneRepo'

/** IndexedDB 中的存储形态：日期字段为 ISO 字符串 */
type StoredKnowledgeArtifact = Omit<KnowledgeArtifact, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

function reviveArtifact(stored: StoredKnowledgeArtifact): KnowledgeArtifact {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt),
  }
}

/**
 * 知识产物仓库（IndexedDB v8 起）。
 * 人物关系图谱 / 思维导图等由书本内容生成的结构化知识件。
 */
export const knowledgeRepo = {
  async save(artifact: KnowledgeArtifact): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.knowledgeArtifacts, {
      ...artifact,
      createdAt: artifact.createdAt instanceof Date ? artifact.createdAt.toISOString() : artifact.createdAt,
      updatedAt: artifact.updatedAt instanceof Date ? artifact.updatedAt.toISOString() : artifact.updatedAt,
    })
  },

  async get(id: string): Promise<KnowledgeArtifact | undefined> {
    const db = await getDB()
    const stored = (await db.get(STORE_NAMES.knowledgeArtifacts, id)) as StoredKnowledgeArtifact | undefined
    return stored ? reviveArtifact(stored) : undefined
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.knowledgeArtifacts, id)
    await tombstoneRepo.record('knowledge', id)
  },

  async getByBookId(bookId: string): Promise<KnowledgeArtifact[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.knowledgeArtifacts)) as StoredKnowledgeArtifact[]
    return all
      .filter((a) => a.bookId === bookId)
      .map(reviveArtifact)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  },

  /** 备份导出用：返回全部知识产物（日期已还原为 Date） */
  async getAll(): Promise<KnowledgeArtifact[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.knowledgeArtifacts)) as StoredKnowledgeArtifact[]
    return all.map(reviveArtifact)
  },

  /** 备份导入前清空（覆盖语义） */
  async deleteAll(): Promise<void> {
    const db = await getDB()
    await db.clear(STORE_NAMES.knowledgeArtifacts)
  },

  /** 删书级联：清空指定书的全部知识产物（整书墓碑阻止远端复活） */
  async deleteByBookId(bookId: string): Promise<void> {
    await tombstoneRepo.record('book', bookId)
    const db = await getDB()
    const keys = await db.getAllKeysFromIndex(STORE_NAMES.knowledgeArtifacts, 'bookId', bookId)
    const tx = db.transaction(STORE_NAMES.knowledgeArtifacts, 'readwrite')
    await Promise.all(keys.map((key) => tx.store.delete(key)))
    await tx.done
  },
}
