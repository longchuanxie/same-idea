import { getDB, STORE_NAMES } from './db'

/** 墓碑覆盖的记录类别：进度（按 bookId）、书签/批注（按 id）、整本书（按 bookId 级联） */
export type TombstoneKind = 'progress' | 'bookmark' | 'annotation' | 'book'

export interface TombstoneRecord {
  /** `${kind}:${key}` 复合主键 */
  id: string
  kind: TombstoneKind
  key: string
  deletedAt: string
}

export function tombstoneId(kind: TombstoneKind, key: string): string {
  return `${kind}:${key}`
}

export function makeTombstone(kind: TombstoneKind, key: string, deletedAt: string = new Date().toISOString()): TombstoneRecord {
  return { id: tombstoneId(kind, key), kind, key, deletedAt }
}

/**
 * 删除墓碑仓库（IndexedDB v7 起）。
 *
 * 云同步是 LWW 合并，远端没有"删除"语义——本地删除的进度/书签/批注
 * 会在下次同步时被远端副本复活。墓碑记录"何时删了什么"，合并时据此
 * 把双方已删除的记录从载荷中剔除；记录在删除之后又被重新创建/编辑
 * （时间戳晚于墓碑）时，记录胜出、墓碑随之失效。
 */
export const tombstoneRepo = {
  /** 记录一条删除墓碑（同 key 重复记录时保留较新的 deletedAt） */
  async record(kind: TombstoneKind, key: string): Promise<void> {
    const db = await getDB()
    const existing = (await db.get(STORE_NAMES.tombstones, tombstoneId(kind, key))) as TombstoneRecord | undefined
    const now = new Date().toISOString()
    if (existing && +new Date(existing.deletedAt) >= +new Date(now)) return
    await db.put(STORE_NAMES.tombstones, makeTombstone(kind, key, now))
  },

  /** 本地全部墓碑（上传载荷时并入） */
  async getAll(): Promise<TombstoneRecord[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.tombstones) as Promise<TombstoneRecord[]>
  },

  /** 同步落地：以合并结果整体替换本地墓碑（多端传播的中转站） */
  async replaceAll(records: TombstoneRecord[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.tombstones, 'readwrite')
    await tx.store.clear()
    await Promise.all(records.map((r) => tx.store.put(r)))
    await tx.done
  },

  /** 清理过期墓碑（默认 90 天，防同步载荷无限膨胀） */
  async purgeExpired(ttlDays = 90): Promise<void> {
    const db = await getDB()
    const cutoff = Date.now() - ttlDays * 24 * 60 * 60 * 1000
    const all = (await db.getAll(STORE_NAMES.tombstones)) as TombstoneRecord[]
    const tx = db.transaction(STORE_NAMES.tombstones, 'readwrite')
    await Promise.all(
      all
        .filter((r) => +new Date(r.deletedAt) < cutoff)
        .map((r) => tx.store.delete(r.id))
    )
    await tx.done
  },
}
