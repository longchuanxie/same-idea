/**
 * 书籍格式判别。
 * - 'comic'：传统漫画（图片序列，来自 zip/cbz/rar/cbr/散图）
 * - 'pdf'：PDF 文档
 * - 'text'：TXT / Markdown / EPUB 等文本格式
 */
export type BookFormat = 'comic' | 'pdf' | 'text'

/**
 * 页面引用（联合类型）。
 * 渲染器根据 kind 分派到对应实现。
 * - 'image'：图片页（漫画）
 * - 'pdf-page'：PDF 页面
 * - 'text-content'：文本内容（TXT/Markdown/EPUB）
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
  /** 按书记忆的文本阅读模式（未设置时使用全局设置） */
  textReadingMode?: TextReadingMode
  /** 按书记忆的阅读主题（未设置时使用全局设置） */
  readingTheme?: ReadingTheme
  /** 最近更新时间戳（ms），云端同步合并用 */
  updatedAt?: number
}

export interface Collection {
  id: string
  name: string
  bookIds: string[]
  createdAt: Date
}

export type PaperType = 'coated' | 'rice' | 'kraft' | 'newsprint' | 'matte' | 'eink' | 'green' | 'night'

/** 阅读主题预设 */
export type ReadingTheme = 'light' | 'green' | 'sepia' | 'dark'

/** 文本字体族 */
export type TextFontFamily =
  | 'system'
  | 'serif'
  | 'kaiti'
  | 'fangSong'
  | 'sans'
  | 'rounded'
  | 'literata'
  | 'monospace'

/** 文本对齐方式 */
export type TextAlign = 'left' | 'justify'

/** 文本阅读模式 */
export type TextReadingMode = 'scroll' | 'paginate' | 'book' | 'columns'

/** 听书发音引擎(与 services/tts 的 TtsEngineSetting 对应,不含 'native'——原生环境归入系统语音语义) */
export type TtsEngineOption = 'auto' | 'system' | 'neural' | 'server'

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
  autoAdvanceTextChapter: boolean
  autoScrollSpeed: number
  textReadingMode: TextReadingMode
  /** 竖排书写（滚动模式下生效，日文/古典中文场景） */
  verticalWriting: boolean
  /** 听书发音引擎;auto=原生环境走设备语音、桌面走系统语音 */
  ttsEngine: TtsEngineOption
  /** 自定义 TTS 服务(OpenAI 兼容 /v1/audio/speech) */
  ttsServerUrl: string
  ttsServerModel: string
  ttsServerVoice: string
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

/** PDF 文字级划线的矩形：页面相对坐标（0..1），跨页选区多枚 */
export interface AnnotationRect {
  /** 章内页索引（0 起） */
  page: number
  x: number
  y: number
  w: number
  h: number
}

/** 批注稳定锚点：选中文本前后的上下文指纹 + 出现序号，内容表示变化后仍可重定位 */
export interface AnnotationAnchor {
  /** 选中文本前紧邻的上下文片段（已折叠空白，≤16 字符） */
  before: string
  /** 选中文本后紧邻的上下文片段（已折叠空白，≤16 字符） */
  after: string
  /** 全文中满足上下文指纹的第几次出现（0-based），消歧重复文本 */
  occurrence: number
}

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
  /** 稳定锚点（可选；旧数据无此字段时按偏移回退解析） */
  anchor?: AnnotationAnchor
  style?: AnnotationStyle // 默认 'highlight'
  /** 手记标签（可选；引用 useLibraryStore 的 Tag.id，空/缺省为未分类） */
  tagIds?: string[]
  /** 页级手记（可选；仅漫画/PDF 等图页书，值为章内页索引 0 起；有此字段即页注而非文字划线） */
  pageIndex?: number
  /** PDF 文字级划线矩形（可选；与 pageIndex 互斥——有 rects 即文字划线而非页注） */
  rects?: AnnotationRect[]
  createdAt: Date
  updatedAt: Date
}
