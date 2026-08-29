export const STORAGE_KEYS = {
  SETTINGS: 'kuro-reader-settings',
  PROGRESS: 'kuro-reader-progress',
  STATS: 'kuro-reader-stats',
  AUTH: 'kuro-reader-auth',
  BOOKMARKS: 'kuro-reader-bookmarks',
  ANNOTATIONS: 'kuro-reader-annotations',
  /** 云端同步的 WebDAV 凭据与配置 */
  CLOUD_SYNC: 'kuro-reader-cloud-sync',
  /** 上次成功同步时间（ISO 字符串） */
  CLOUD_SYNC_LAST: 'kuro-reader-cloud-sync-last',
} as const;
