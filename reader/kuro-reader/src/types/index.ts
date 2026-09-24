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
  /** 知识库内容类型偏好（小说/学术/自动检测）；缺省 'auto' */
  contentKind?: ContentKindPreference
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

/** 听书发音引擎(与 services/tts 的 TtsEngineSetting 一致;'native' 仅 App 内展示) */
export type TtsEngineOption = 'auto' | 'system' | 'native' | 'neural' | 'server'

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  paperMode: boolean
  paperType: PaperType
  textureIntensity: number
  /** 隐藏系统状态栏（沉浸阅读；仅原生端生效，顶部下滑可临时呼出） */
  hideStatusBar: boolean
  readingDirection: 'rtl' | 'ltr'
  pageTurnGestures: boolean
  fontSize: number
  fontFamily: 'literata' | 'inter'
  brightness: number
  colorTemperature: number
  auth: AuthConfig
  /** 文本阅读专属设置 */
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
  /** 听书发音引擎;auto=原生环境走系统语音引擎(Android 系统 TTS)、桌面走浏览器语音 */
  ttsEngine: TtsEngineOption
  /** 用户已取消过音色包下载确认,不再重复弹窗(再次主动选择神经网络视为同意) */
  ttsModelPromptDismissed: boolean
  /** 自定义 TTS 服务(OpenAI 兼容 /v1/audio/speech) */
  ttsServerUrl: string
  ttsServerModel: string
  ttsServerVoice: string
  /** 知识库 AI 服务(OpenAI 兼容 /v1/chat/completions;人物图谱/思维导图生成用,仅用户主动触发时调用) */
  knowledgeAiUrl: string
  knowledgeAiKey: string
  knowledgeAiModel: string
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

export type NavItem = 'home' | 'library' | 'knowledge' | 'import' | 'settings'

/** 图谱生成详细度：核心（只主要人物）/ 标准 / 详尽（含重要配角） */
export type GraphDetailLevel = 'core' | 'standard' | 'rich'

/** 生成范围（0 起章索引闭区间；to 省略 = 到末尾，适配连载书增量） */
export interface KnowledgeScopeRange {
  from: number
  to?: number
}

/** 生成选项：范围 / 增量补充 / 详细度（详细度仅人物图谱消费） */
export interface KnowledgeGenerationOptions {
  scope?: KnowledgeScopeRange
  /** true = 在现有同类型产物上并入新内容（旧证据坐标原样保留） */
  incremental?: boolean
  detail?: GraphDetailLevel
}

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

/** 书籍内容类型：决定知识库生成哪套任务（小说=人物/情节；学术=论点/术语） */
export type ContentKind = 'fiction' | 'academic'

/** 书籍的知识库内容类型偏好（'auto' 按文本启发式检测；存于书档案，随书记忆） */
export type ContentKindPreference = ContentKind | 'auto'

/** 知识产物类型：人物关系图谱 / 概念关系图谱 / 思维导图 / 概念术语卡 / 论文速览 / 叙事节拍（注册表见 services/ai/knowledgeTasks） */
export type KnowledgeArtifactType = 'character-graph' | 'concept-graph' | 'mindmap' | 'glossary' | 'paper-brief' | 'story-beats'

/** 贡献点的证据强度（论文速览卡）：实验支撑 / 理论证明 / 部分支撑 / 仅声称 */
export type ContributionStrength = 'experiment' | 'theory' | 'partial' | 'claim'

/** 叙事节拍的角色（结构位置语义；UI 展示用去黑话短标，见 utils/beatRoles） */
export type StoryBeatRole =
  | 'hook' // 开局
  | 'inciting' // 引子（打破日常的事件）
  | 'rising' // 推进
  | 'turn' // 转折
  | 'midpoint' // 中点
  | 'low' // 低谷
  | 'climax' // 高潮
  | 'resolution' // 结局
  | 'custom' // 未归类的关键节点

/** 叙事节拍条目：结构导航用——「高潮在哪一章，直接看」 */
export interface StoryBeat {
  /** 稳定 id（role+章+归一化标题，修订模式的定位键） */
  id: string
  role: StoryBeatRole
  /** 节拍标记事件（具体事件名，如「毒酒夜宴」） */
  title: string
  detail?: string
  /** 节拍所在章（0 起章索引；PDF 为页索引）——结构条与查看器的跳转目标 */
  chapterIndex: number
  /** 骨架原文摘句（本地逐字校验通过才有；失败时仅留章级跳转） */
  evidence?: KnowledgeEvidence
  /** 覆盖章节（0 起章索引；由分块盖章并入） */
  chapters?: number[]
  /** 读者人工校验过（修订模式的「已校验」章） */
  verified?: boolean
}

/** 叙事节拍数据：全书骨架单轮定位，按章升序 */
export interface StoryBeatsData {
  beats: StoryBeat[]
}

/** 论文速览：研究型读者的读前分流与批判性阅读卡（全部条目可回原文） */
export interface PaperBriefData {
  /** 一句话 TL;DR（解决什么问题、用什么方法、结果强在哪） */
  tldr: string
  contributions: {
    point: string
    strength: ContributionStrength
    evidence?: KnowledgeEvidence
    chapters?: number[]
    /** 读者人工校验过（修订模式的「已校验」章） */
    verified?: boolean
  }[]
  limitations: {
    point: string
    evidence?: KnowledgeEvidence
    chapters?: number[]
    verified?: boolean
  }[]
  /** 审稿人视角的问题（组会/评审可直接用） */
  questions: {
    question: string
    evidence?: KnowledgeEvidence
    chapters?: number[]
    verified?: boolean
  }[]
}

/** 人物图谱节点 */
export interface CharacterNode {
  /** 稳定 id（人物名归一化生成，merge 时同名合并） */
  id: string
  name: string
  /** 人物身份，如「主角 · 剑客」 */
  role?: string
  /** 一句话人物小传 */
  description?: string
  /** 重要性权重（关系数归一，仅展示排序用） */
  weight?: number
  /** 出现章节（0 起章索引；PDF 为页索引；升序去重）——图谱回原文的跳转目标 */
  chapters?: number[]
  /** 读者人工校验过（修订模式的「已校验」章） */
  verified?: boolean
}

/** 原文依据坐标：AI 逐字摘句经本地校验后定位（offsetRatio = 章内偏移/章长）。
 *  图谱关系边与术语卡定义共用此结构。 */
export interface KnowledgeEvidence {
  /** 逐字摘自原文的短句 */
  quote: string
  /** 0 起章索引 */
  chapterIndex: number
  /** 章内偏移占比（0..1，4 位小数），阅读器 ?goto= 直达用 */
  offsetRatio: number
}

/** 人物关系边（语义无向；source/target 仅决定描述视角） */
export interface CharacterEdge {
  source: string
  target: string
  /** 关系名，如「师徒」「恋人」「宿敌」 */
  relation: string
  description?: string
  /** 原文依据（本地校验通过才有；失败时用 chapters 章级回退） */
  evidence?: KnowledgeEvidence
  /** 关系出现的章节（0 起章索引；证据未定位时的跳转目标） */
  chapters?: number[]
  /** 读者人工校验过（修订模式的「已校验」章） */
  verified?: boolean
}

/** 术语卡条目：关键概念/术语 + 书内定义 + 定义原文坐标 */
export interface GlossaryTerm {
  /** 归一化术语名（merge 去重键） */
  id: string
  term: string
  /** 书中给出的定义或解释 */
  definition?: string
  /** 定义原文（本地校验通过才有；失败时用 chapters 章级回退） */
  evidence?: KnowledgeEvidence
  /** 术语出现/被定义的章节（0 起章索引） */
  chapters?: number[]
  /** 读者人工校验过（修订模式的「已校验」章） */
  verified?: boolean
}

/** 概念术语卡数据 */
export interface GlossaryData {
  terms: GlossaryTerm[]
}

/** 人物关系图谱数据 */
export interface CharacterGraphData {
  nodes: CharacterNode[]
  edges: CharacterEdge[]
}

/** 思维导图节点（递归树；根节点 title 即导图名） */
export interface MindmapNodeData {
  title: string
  detail?: string
  children?: MindmapNodeData[]
  /** 读者人工校验过（修订模式的「已校验」章） */
  verified?: boolean
}

/** 知识产物：由书本内容生成（或手工构建）的结构化知识件，按书归档 */
export interface KnowledgeArtifact {
  id: string
  bookId: string
  type: KnowledgeArtifactType
  title: string
  data: CharacterGraphData | MindmapNodeData | GlossaryData | PaperBriefData | StoryBeatsData
  /** 生成来源元信息：内容指纹用于书本内容变化后提示重新生成 */
  meta?: {
    /** 实际进入语料的章节数（范围生成时 < 原书总章数） */
    chapterCount: number
    contentFingerprint: string
    /** 生成时采用的内容视角（小说=人物情节 / 学术=论点术语） */
    contentKind?: ContentKind
    /** 生成时原书总章数（增量补充的基准：书变长即可续读新章） */
    bookChapterCount?: number
    /** 本次生成的章节范围（省略 = 全书） */
    scope?: KnowledgeScopeRange
    /** 图谱生成详细度（仅 character-graph） */
    detail?: GraphDetailLevel
    /** 实际分析的分块数（与 totalChunkCount 对账：分析完整性的凭据） */
    analyzedChunkCount?: number
    /** 分块总数（分块数由全书字数决定；字段保留供旧产物 meta 兼容） */
    totalChunkCount?: number
  }
  generator: 'ai' | 'manual'
  /** 手工修订次数（修订模式里的编辑/删除/校验都计 1）——重新生成前的覆盖警告依据 */
  manualEditCount?: number
  /** 书籍内容经替换更新后置位：UI 提示「内容已更新·待重跑」，重新生成覆盖落库即随新件消失 */
  stale?: boolean
  createdAt: Date
  updatedAt: Date
}

/** 复习卡排期状态（SM-2 简化版） */
export interface ReviewScheduling {
  /** 当前间隔（天）；0 = 尚未进入间隔排期（学习步：答错重来的 10 分钟步） */
  intervalDays: number
  /** 易度因子（1.3–2.8，2.5 起步） */
  ease: number
  /** 连续答对次数 */
  repetitions: number
}

/** 生词本条目：划词查过的词（按词去重，重复查刷新释义与语境；进复习队列） */
export interface VocabEntry {
  /** 稳定 id：归一化词生成（小写/空白折叠）——同词同条，复习排期不因重查而丢 */
  id: string
  word: string
  /** 发音（中文=拼音 / 外文=音标；查词服务没把握则省略） */
  pronunciation?: string
  /** 释义（中文，含词性；结合语境选义） */
  definition: string
  /** 用法/搭配提示 */
  note?: string
  /** 最近一次查词的语境句（原文截断，帮助回到记忆现场） */
  context: string
  bookId: string
  chapterIndex: number
  chapterTitle?: string
  /** 查词次数（去重更新的痕迹） */
  lookupCount: number
  createdAt: Date
  updatedAt: Date
}

/** 复习卡：术语卡条目/批注手记/生词进入复习队列后的形态（排期状态 + 卡面快照）。
 *  卡面从来源派生（collect + reconcile 对账），排期是读者劳动成果，独立持久化。 */
export interface ReviewCard {
  id: string
  bookId: string
  /** 卡面来源：术语卡条目 / 批注手记 / 生词 */
  source: 'glossary-term' | 'annotation' | 'vocab'
  /** 正面（术语名 / 划线原文） */
  front: string
  /** 背面（书内定义 / 批注文字） */
  back: string
  scheduling: ReviewScheduling
  /** 下次到期时间戳（ms） */
  dueAt: number
  /** 最近一次评分时间戳；undefined = 从未复习过（新卡） */
  lastReviewedAt?: number
  /** 读者明确移出复习（不再复习这张）；对账时不复活 */
  dismissed?: boolean
  createdAt: Date
  updatedAt: Date
}
