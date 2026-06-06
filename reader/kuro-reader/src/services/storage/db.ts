import { openDB, type IDBPDatabase } from 'idb'

/**
 * IndexedDB 数据库名称
 */
const DB_NAME = 'kuro-reader-db'

/**
 * 当前数据库版本
 *
 * 升级历史：
 * - v1: 初始版本（comics / pages / covers / sublibraries）
 * - v3: 新增 tags store
 *
 * Phase 3 升级到 v4 时仅需在此处和 upgrade 回调中追加逻辑。
 */
const DB_VERSION = 3

/**
 * v3 版本号常量（用于 upgrade 回调中的 oldVersion 比较）
 *
 * 当 oldVersion < V3_TAGS_INTRODUCED 时表示数据库尚未包含 tags store，需要创建。
 */
const V3_TAGS_INTRODUCED = 3

/**
 * 对象存储（object store）名称常量
 *
 * 所有 storage 子模块（comics/pages/covers 等）应通过此对象引用 store 名称，
 * 避免在调用方硬编码字符串。
 */
export const STORE_NAMES = {
  comics: 'comics',
  pages: 'pages',
  covers: 'covers',
  sublibraries: 'sublibraries',
  tags: 'tags',
} as const

/**
 * 模块级单例 Promise，确保 openDB 只被调用一次
 */
let dbPromise: Promise<IDBPDatabase> | null = null

/**
 * 懒加载获取 IndexedDB 连接
 *
 * 首次调用时打开数据库并执行 upgrade 回调创建 object store，
 * 后续调用复用同一 Promise，避免重复打开连接。
 *
 * @returns 已打开的 IDBPDatabase 实例
 */
export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAMES.comics)) {
          db.createObjectStore(STORE_NAMES.comics, { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.pages)) {
          db.createObjectStore(STORE_NAMES.pages)
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.covers)) {
          db.createObjectStore(STORE_NAMES.covers)
        }
        if (!db.objectStoreNames.contains(STORE_NAMES.sublibraries)) {
          db.createObjectStore(STORE_NAMES.sublibraries, { keyPath: 'id' })
        }
        if (oldVersion < V3_TAGS_INTRODUCED && !db.objectStoreNames.contains(STORE_NAMES.tags)) {
          db.createObjectStore(STORE_NAMES.tags, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

/**
 * 重置 DB 连接单例
 *
 * **仅供测试使用**，不应在生产代码中调用。
 * 配合 fake-indexeddb 使用时，可在每个测试之间清理连接状态，
 * 确保测试隔离。
 */
export function _resetDBForTesting(): void {
  dbPromise = null
}
