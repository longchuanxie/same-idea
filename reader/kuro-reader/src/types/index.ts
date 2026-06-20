/**
 * 书籍格式判别。
 * - 'comic'：传统漫画（图片序列，来自 zip/cbz/rar/cbr/散图）
 * - 'pdf'：PDF 文档
 * - 'text'：纯文本 / EPUB 等文本格式
 */
export type BookFormat = 'comic' | 'pdf' | 'text'

/**
 * 页面引用（联合类型）。
 * 渲染器根据 kind 分派到对应实现。
 * - 'image'：图片页（漫画）
 * - 'pdf-page'：PDF 页面
 * - 'text-content'：文本内容（纯文本/EPUB）
 */
export type PageRef =
  | { kind: 'image'; index: number }
  | { kind: 'pdf-page'; pageNumber: number }
  | { kind: 'text-content' }

export interface Book {
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

/** @deprecated Use `Book` instead. Kept for incremental migration. */
export type Comic = Book

export interface Tag {
  id: string
  name: string
  color: string
  bookIds: string[]
  createdAt: Date
}

export interface Chapter {
  id: string
  bookId: string
  number: number
  title: string
  pages: string[]
  status: 'unread' | 'reading' | 'read'
  readAt?: Date
  /** 结构化页面引用。漫画可选（缺失时按 pages.length + index 推导）；PDF 必填。 */
  pageRefs?: PageRef[]
}

export interface ReadingProgress {
  bookId: string
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
  /** EPUB CFI 或其他富定位符。预留用。 */
  locator?: string
}

export interface Collection {
  id: string
  name: string
  bookIds: string[]
  createdAt: Date
}

export type PaperType = 'coated' | 'rice' | 'kraft' | 'newsprint' | 'matte' | 'eink'

/** 阅读主题预设 */
export type ReadingTheme = 'light' | 'green' | 'sepia' | 'dark'

/** 文本字体族 */
export type TextFontFamily = 'system' | 'serif' | 'kaiti' | 'sans'

/** 文本对齐方式 */
export type TextAlign = 'left' | 'justify'

/** 文本阅读模式 */
export type TextReadingMode = 'scroll' | 'paginate' | 'book'

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
  /** 文本阅读专属设置 */
  readingTheme: ReadingTheme
  textFontFamily: TextFontFamily
  textAlign: TextAlign
  firstLineIndent: boolean
  textLineHeight: number
  tapZoneEnabled: boolean
  autoScrollSpeed: number
  textReadingMode: TextReadingMode
}

export interface SecurityQuestion {
  question: string
  answerHash: string
  answerSalt: string
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
  /** 安全问题列表，设置密码锁时必须提供至少 1 个 */
  securityQuestions?: SecurityQuestion[]
}

export interface ReadingStats {
  totalHours: number
  currentStreak: number
  longestStreak: number
  completedBooks: number
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
  bookIds: string[]
  createdAt: Date
  updatedAt: Date
}

export type NavItem = 'home' | 'library' | 'import' | 'settings'

/** 书签 */
export interface Bookmark {
  id: string
  bookId: string
  chapterIndex: number
  chapterTitle: string
  pageIndex?: number
  scrollRatio?: number
  textPreview: string
  createdAt: Date
}

/** 批注样式类型 */
export type AnnotationStyle = 'underline' | 'wavy' | 'highlight'

/** 批注 */
export interface Annotation {
  id: string
  bookId: string
  chapterIndex: number
  chapterTitle: string
  selectedText: string
  note: string
  startOffset: number
  endOffset: number
  style?: AnnotationStyle // 默认 'highlight'
  createdAt: Date
  updatedAt: Date
}
