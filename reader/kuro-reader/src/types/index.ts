/**
 * 书籍格式判别。
 * - 'comic'：传统漫画（图片序列，来自 zip/cbz/rar/cbr/散图）
 * - 'pdf'：PDF 文档（Phase 4 起支持）
 */
export type BookFormat = 'comic' | 'pdf'

/**
 * 页面引用（联合类型）。
 * 渲染器根据 kind 分派到对应实现。
 */
export type PageRef = { kind: 'image'; index: number } | { kind: 'pdf-page'; pageNumber: number }

export interface Comic {
  id: string
  title: string
  author: string
  cover: string
  genres: string[]
  tags: string[]
  rating?: number
  description: string
  status: 'ongoing' | 'completed' | 'hiatus'
  totalChapters: number
  chapters: Chapter[]
  addedAt: Date
  lastReadAt?: Date
  isFavorite: boolean
  /** 书籍格式。undefined 视为 'comic' 以兼容旧数据。 */
  format?: BookFormat
}

export interface Tag {
  id: string
  name: string
  color: string
  comicIds: string[]
  createdAt: Date
}

export interface Chapter {
  id: string
  comicId: string
  number: number
  title: string
  pages: string[]
  status: 'unread' | 'reading' | 'read'
  readAt?: Date
  /** 结构化页面引用。漫画可选（缺失时按 pages.length + index 推导）；PDF 必填。 */
  pageRefs?: PageRef[]
}

export interface ReadingProgress {
  comicId: string
  chapterId: string
  page: number
  pageScrollRatio?: number
  chapterScrollRatio?: number
  readingMode?: 'vertical' | 'horizontal'
  pageLayout?: 'single' | 'double'
  totalPages: number
  percentage: number
  globalPageIndex: number
  totalImages: number
  /** EPUB CFI 或其他富定位符。Phase 1 不消费，预留给 EPUB。 */
  locator?: string
}

export interface Collection {
  id: string
  name: string
  comicIds: string[]
  createdAt: Date
}

export type PaperType = 'coated' | 'rice' | 'kraft' | 'newsprint' | 'matte' | 'eink'

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  paperMode: boolean
  paperType: PaperType
  textureIntensity: number
  readingDirection: 'rtl' | 'ltr'
  pageTurnGestures: boolean
  cloudSync: boolean
  fontSize: number
  fontFamily: 'literata' | 'inter'
  brightness: number
  colorTemperature: number
  auth: AuthConfig
}

export interface AuthConfig {
  isEnabled: boolean
  method: 'auto' | 'biometric' | 'gesture' | 'system_pin'
  lockTimeout: number
  maxAttempts: number
  gestureHash?: string
  gestureSalt?: string
  failedAttempts: number
  lockUntil?: number
}

export interface ReadingStats {
  totalHours: number
  currentStreak: number
  longestStreak: number
  completedComics: number
  weeklyData: { day: string; hours: number }[]
}

export interface ImportTask {
  id: string
  source: 'local' | 'webdav' | 'nas' | 'wifi'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  fileName: string
  fileSize: number
}

export interface CloudSourceConfig {
  protocol: 'webdav' | 'smb' | 'ftp' | 'onedrive' | 'nas'
  serverAddress: string
  port?: string
  path?: string
  username: string
  password: string
}

export interface SubLibrary {
  id: string
  name: string
  comicIds: string[]
  createdAt: Date
  updatedAt: Date
}

export type NavItem = 'home' | 'library' | 'import' | 'settings'
