# Kuro Reader 项目现状梳理

> 更新日期：2026-09-12，与 `comics` 分支提交基线对齐（阶段 6「知识库形态」交付后）。

## 一、项目概述

**Kuro Reader** 是一座本地优先的**私人图书馆**：一款漫画（ZIP/CBZ/RAR/CBR）、PDF 与文本（TXT/Markdown/EPUB）统一阅读器，叠加「手记采集器官」能力——划线/批注、摘抄墙、书内检索、回望席、Markdown 导出嫁接 Obsidian/Notion；并自阶段 6 起走向**知识库形态**——由用户自配的 AI 服务（OpenAI 兼容）通读全书，生成人物关系图谱与全书思维导图，应用内可视化、可导出、随备份与云同步走。可部署为 Web 应用或 Android App。采用 Material Design 3 设计体系，提供沉浸式阅读体验和流畅的交互动画。

- **应用 ID**: `com.kuro.reader`
- **版本**: `1.0.0`（package.json 与 APP_CONFIG 常量已统一）
- **开源协议**: MIT License
- **在线指引页**: `docs/index.html`，由 GitHub Actions 自动部署（见「开发与构建」）

---

## 二、技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | React + TypeScript | React 18 / TS 5.3 |
| 构建 | Vite | 5.0 |
| 样式 | Tailwind CSS | 3.4 |
| 状态管理 | Zustand | 4.4 |
| 路由 | React Router DOM | 6.20 |
| 移动端桥接 | Capacitor | 8.x |
| 本地存储 | IndexedDB (idb) | 8.0.3 |
| 压缩包解析 | JSZip + libarchive.js | 3.10 / 2.0 |
| PDF 渲染 | pdfjs-dist | 6.2 |
| Markdown 渲染 | marked | 18.0 |
| 数学公式 | KaTeX | 0.16 |
| 代码高亮 | highlight.js | 11.11 |
| 图表 | mermaid | 11.16 |
| HTTP 客户端 | Axios | 1.16 |
| FTP 客户端 | basic-ftp | 6.0 |
| 测试 | Vitest + Testing Library | 4.1 |

---

## 三、项目结构

```
kuro-reader/
├── android/                    # Android 原生工程（Capacitor 生成）
│   └── app/src/main/java/com/kuro/reader/
│       ├── MainActivity.java     # 自定义主 Activity
│       └── FilePickerPlugin.java # 文件选择器原生插件
├── docs/                       # GitHub Pages 部署目录
│   ├── index.html                # 应用指引静态页（漫画 & 文本双模式介绍）
│   ├── downloads/app-release.apk # APK 安装包分发
│   └── screenshots/              # 应用截图
├── public/                     # icon.svg / manifest.json
├── screenshots/                # 开发过程截图
├── test-fixtures/              # 测试夹具库（脚本确定性生成，含边界场景目录 README）
├── scripts/
│   ├── generate-splash.cjs     # 闪屏生成脚本
│   └── generate-test-fixtures.mjs # 测试夹具生成器（npm run fixtures:generate）
├── server/
│   └── ftpProxy.ts             # Vite 开发服务器 FTP 代理中间件
├── src/
│   ├── components/             # 组件层（Atomic Design）
│   │   ├── atoms/              # BottomNavBar, TopAppBar, Collapsible, FormatBadge
│   │   ├── molecules/          # AnnotationDetailModal, AnnotationList, AnnotationPopup,
│   │   │                       # AutoScrollBadge, BookEditDialog, BookmarkPanel,
│   │   │                       # ChapterDrawer(文本), ChapterEndPrompt, ChapterListDrawer(漫画),
│   │   │                       # ConfirmDialog, FullscreenViewer, HorizontalReaderView,
│   │   │                       # MarkdownCodeBlock, MarkdownMath, MarkdownReaderContent,
│   │   │                       # ReaderBottomBar, SelectionFloatingButton, SubLibraryMenu,
│   │   │                       # TextProgressHint, TextReaderBottomBar, TextReaderFooter,
│   │   │                       # TextReaderHeader, UndoToast, OpdsBrowser, SpeechBadge
│   │   ├── organisms/          # GestureLock（手势密码九宫格）
│   │   ├── layouts/            # MainLayout, PageTransition, AuthGuard
│   │   └── knowledge/          # 知识库可视化：PanZoom（平移缩放画布）、CharacterGraphView
│   │                           # （力导向人物图谱）、MindmapView（水平树导图）、KnowledgeSection
│   │                           # （档案卡知识库区块）
│   ├── constants/
│   │   ├── config.ts           # 应用配置（版本、认证参数等）
│   │   ├── routes.ts           # 路由定义与路径辅助函数（readerPathForBook 按格式分派）
│   │   ├── storage.ts          # localStorage 键名常量
│   │   └── textReaderFonts.ts  # 文本阅读器 8 种字体预设
│   │   ├── cloudPath.ts        # 云端路径纯工具（规范化/拼接/面包屑/排序）
│   ├── utils/annotationAnchor.ts # 批注稳定锚点（指纹+occurrence）与自愈解析
│   ├── hooks/                  # useAutoScroll / useBackHandler / useEstimatedTimeLeft
│   │                           # useLandscapeViewport / useReadingStats / useSpeech（听书）
│   │                           # useSafeArea / useSmoothScroll / useStatusBar / useWakeLock
│   │                           # useLandscapeViewport / useReadingStats（双阅读器共用）
│   │                           # useSafeArea / useSmoothScroll / useStatusBar / useWakeLock
│   ├── pages/                  # 页面组件（14 个）
│   │   ├── Home/               # 首页（继续阅读 + 收藏）
│   │   ├── Library/            # 书库（含内联批量管理模式）
│   │   ├── SubLibrary/         # 子书库
│   │   ├── BookDetail/         # 书籍详情（漫画 & 文本通用；含知识库区块）
│   │   ├── Reader/             # 漫画阅读器（~1660 行）
│   │   ├── TextReader/         # 文本阅读器（~2710 行，当前最大文件）
│   │   ├── Knowledge/          # 知识产物查看器（/knowledge/:bookId/:artifactId）
│   │   ├── Import/             # 导入
│   │   ├── CustomCloud/        # 云端来源配置
│   │   ├── Settings/           # 设置
│   │   ├── Stats/              # 阅读统计
│   │   ├── Profile/            # 个人资料
│   │   ├── Search/             # 搜索
│   │   ├── Tags/               # 标签管理
│   │   └── Auth/               # 手势认证
│   ├── plugins/
│   │   └── FilePickerPlugin.ts # Capacitor 文件选择器插件前端封装
│   ├── services/
│   │   ├── ai/                 # 知识库 AI 层
│   │   │   ├── aiClient.ts       # OpenAI 兼容客户端（容错 JSON 抽取/超时/取消联动/连接测试）
│   │   │   └── knowledgeTasks.ts # 知识任务注册表（提示词 + 片段解析 + 合并；新产物在此追加）
│   │   ├── knowledge/
│   │   │   └── bookCorpus.ts     # 书本语料聚合（text 全格式 + PDF 文本层 → 分块 + 内容指纹）
│   │   ├── parsers/            # 书籍解析器（策略模式）
│   │   │   ├── index.ts          # Parser 注册表与分发（Comic → EPUB → Text）
│   │   │   ├── types.ts          # BookParser 接口、ParsedBook 判别联合
│   │   │   ├── comicArchiveParser.ts # 漫画压缩包解析器
│   │   │   ├── epubParser.ts     # EPUB 解析器（OPF spine + NCX + XHTML）
│   │   │   ├── textParser.ts     # TXT/Markdown 解析器（UTF-8/GBK 自动检测）
│   │   │   └── utils.ts          # 标题提取、章节拆分、HTML 清洗
│   │   ├── storage/            # IndexedDB 仓库层（唯一存储实现）
│   │   │   ├── db.ts             # 连接管理（v5，8 个 store）
│   │   │   ├── bookRepo.ts       # 书籍元数据 CRUD
│   │   │   ├── pageRepo.ts       # 页面图片 Blob CRUD
│   │   │   ├── bookFileRepo.ts   # 原始文本文件（TXT/MD/EPUB）存储
│   │   │   ├── bookmarkRepo.ts   # 书签（含备份用 getAll/deleteAll）
│   │   │   ├── annotationRepo.ts # 批注（含 bookId 索引、备份用 getAll/deleteAll）
│   │   │   ├── progressRepo.ts   # 阅读进度（v6 起，替代 localStorage）
│   │   │   ├── subLibraryRepo.ts # 子书库
│   │   │   ├── tagRepo.ts        # 标签
│   │   │   └── knowledgeRepo.ts  # 知识产物（v8 起，bookId 索引 + 墓碑）
│   │   ├── archiveParser.ts    # 压缩包解析核心逻辑（双引擎 + 流式）
│   │   ├── textContent.ts      # 文本内容加载（TXT/MD/EPUB → 章节）+ 章节定位
│   │   ├── epubContent.ts      # EPUB 保真读取（XHTML→Markdown + 插图 object URL + NCX/nav 目录）
│   │   ├── opds.ts             # OPDS 目录解析（Atom）+ 认证拉取 + 出版物下载
│   │   ├── cloudSync.ts        # 云端同步（WebDAV 单文件载荷 + 逐条 LWW 合并；v4 起含知识产物）
│   │   ├── backHandler.ts      # Android 返回键处理器栈（浮层优先消费）
│   │   ├── cloudStorage.ts     # 云存储客户端（WebDAV/FTP 工厂）
│   │   ├── ftpClient.ts        # FTP 客户端（HTTP 代理模式）
│   │   ├── fileTransfer.ts     # 统一文件下载服务（Web/Native）
│   │   └── gestureAuth.ts      # 手势认证（SHA-256 + 盐值 + 时序安全比较）
│   ├── stores/                 # Zustand 状态管理
│   │   ├── useAppStore.ts      # 应用全局状态（主题、设置、认证；含知识库 AI 服务凭据）
│   │   ├── useLibraryStore.ts  # 书库状态（消费全部 storage repo）
│   │   ├── useReaderStore.ts   # 漫画阅读器状态（页面加载、预加载、缓存）
│   │   ├── useStatsStore.ts    # 阅读统计状态
│   │   └── useKnowledgeStore.ts # 知识产物与生成状态机（分块进度/取消/覆盖式重生成）
│   ├── types/
│   │   └── index.ts            # 全局类型定义（Book / PageRef / Bookmark / Annotation）
│   ├── utils/
│   │   ├── readerPagination.ts # 漫画翻页纯函数（步长/双页/点按区/键盘）
│   │   ├── textPageLayout.ts   # 文本分页视口布局计算
│   │   ├── textReaderNavigation.ts # 文本翻页与点按动作
│   │   ├── readingProgress.ts  # 整体阅读进度计算（跨章节）
│   │   ├── markdownDocument.ts # Markdown 文档解析（分页/结构化）
│   │   ├── knowledgeMerge.ts   # 知识片段合并纯函数（图谱节点/边归并、导图拼枝、防失控上限）
│   │   ├── graphLayout.ts      # 力导向布局（确定性 FR，同输入同布局）
│   │   ├── mindmapLayout.ts    # 思维导图 XMind 双侧辐射布局（根居中、分支左右分流、深度定列叶序定行）
│   │   ├── knowledgeExport.ts  # 知识件导出（图谱→Mermaid、导图→Markdown 大纲）
│   │   ├── extractTitle.ts     # 文件名标题提取
│   │   ├── fileType.ts         # 文件类型判断（含 PDF 扩展名预留）
│   │   ├── paperTexture.ts     # 纸张纹理配置
│   │   ├── capacitor.ts        # 平台检测
│   │   ├── cn.ts               # clsx + tailwind-merge
│   │   └── storage.ts          # localStorage 读写辅助
│   ├── test/                   # 测试配置（setup + smoke）
│   ├── App.tsx                 # 应用入口（路由 + 主题 + 字体设置）
│   ├── main.tsx                # React 挂载点
│   └── index.css               # 全局样式 + 动画系统
├── capacitor.config.json       # Capacitor 配置
├── vite.config.ts              # Vite 配置（含 FTP 代理插件）
├── vitest.config.ts            # 测试配置
├── tailwind.config.js          # Tailwind 配置
└── package.json
```

> 仓库根位于 `kuro-reader` 上两级（`same-idea/`），CI 工作流 `.github/workflows/kuro-reader-pages.yml` 在仓库根目录。

---

## 四、功能模块详解

### 4.1 漫画阅读器（Reader）

[Reader/index.tsx](src/pages/Reader/index.tsx)，约 1660 行。已完成的拆分：
- 水平翻页 → [HorizontalReaderView](src/components/molecules/HorizontalReaderView.tsx) + [readerPagination](src/utils/readerPagination.ts) 纯函数
- 章节目录 → [ChapterListDrawer](src/components/molecules/ChapterListDrawer.tsx)
- 阅读时长统计 → 共享 [useReadingStats](src/hooks/useReadingStats.ts)（与 TextReader 共用）

**阅读模式**:
- **条漫模式（vertical）**: 垂直连续滚动，动态 prepend/append 页面、IntersectionObserver 懒加载、滚动位置恢复
- **页漫模式（horizontal）**: 左右翻页，单击区域翻页、滑动手势翻页、双页布局（步长与跨页计算由 `readerPagination` 提供）

**交互功能**:
- 单击中间区域切换 UI 覆盖层；双击缩放（2x）；长按打开底部设置栏
- 滑动翻页（可关闭）、键盘方向键翻页、进度条拖拽跳页
- 全屏查看器、章节目录侧边栏、章节末尾提示与下一章跳转

**性能优化**: 页面预加载（前后各 10 页）、优先加载半径（前后各 3 页）、条漫虚拟窗口渲染、Object URL 生命周期管理、章节缓存。

**纸张模式**: 6 种纸张类型（coated/rice/kraft/newsprint/matte/eink）+ 纹理强度 + 亮度/色温滤镜。

### 4.2 文本阅读器（TextReader）

[TextReader/index.tsx](src/pages/TextReader/index.tsx)，约 2710 行，是文本阅读的核心模块。已完成的拆分：
- 内容加载/章节定位 → [textContent](src/services/textContent.ts) 服务（loadTextContent / resolveTextChapterIndex / TextChapter）
- 共享 Hook → useReadingStats / useWakeLock / useAutoScroll / useLandscapeViewport / useEstimatedTimeLeft
- 展示组件 → TextReaderHeader / TextReaderFooter / TextProgressHint / AutoScrollBadge / ChapterEndPrompt / SelectionFloatingButton / AnnotationDetailModal

**阅读模式**（`TextReadingMode`，4 种）:
- **scroll**: 垂直滚动
- **paginate**: 单页分页（按视口测量分页）
- **book**: 仿真书双页
- **columns**: 多栏横排（横屏/桌面宽屏）

**核心功能**:
- 章节拆分与恢复：导入时由 parser 拆分章节（Markdown 按一二级标题、TXT 按常见章节格式、EPUB 按 spine），阅读时按章节 ID 或归一化标题定位
- 阅读进度保存与恢复（防抖保存，区分滚动比例/页码两种定位方式）
- 书签系统（[BookmarkPanel](src/components/molecules/BookmarkPanel.tsx)）与批注系统（[AnnotationPopup](src/components/molecules/AnnotationPopup.tsx) / [AnnotationList](src/components/molecules/AnnotationList.tsx)，支持高亮/下划线/波浪线三种样式）
- 章节抽屉（[ChapterDrawer](src/components/molecules/ChapterDrawer.tsx)）
- 自动滚动（可调速度）、点按区翻页（可开关）、自动进入下一章
- 竖排书写（滚动模式 writing-mode: vertical-rl，滚动/进度/点按/自动滚动全链路轴向感知）
- 8 种字体预设（宋体/楷体/仿宋/黑体/圆体/文学体/等宽/系统，[textReaderFonts](src/constants/textReaderFonts.ts)）
- 阅读主题（浅色/护眼绿/羊皮纸/深色）、字号、行高、对齐、首行缩进设置

**Markdown 渲染**（[MarkdownReaderContent](src/components/molecules/MarkdownReaderContent.tsx)）:
- marked 解析 + KaTeX 数学公式（[MarkdownMath](src/components/molecules/MarkdownMath.tsx)）
- highlight.js 代码高亮 + mermaid 图表（[MarkdownCodeBlock](src/components/molecules/MarkdownCodeBlock.tsx)）
- 文档结构化由 [markdownDocument](src/utils/markdownDocument.ts) 提供，支持分页计算
- 安全链接、响应式表格、增强代码块

### 4.3 书库管理

[useLibraryStore](src/stores/useLibraryStore.ts)（约 850 行）统一管理，存储全部走 `services/storage/` repo 层：

- **书籍 CRUD**: 导入、删除、编辑（标题/作者/描述/状态/标签）、收藏
- **子书库**: 创建、重命名、删除、添加/移除书籍
- **标签系统**: 创建、更新、删除标签
- **阅读进度**: 自动保存与恢复（localStorage 持久化）
- **批量操作**: 批量删除、批量标记已读；文件夹批量导入：文件名全部命中章节模式时自动**合并为一书多章**（公共前缀作书名），否则创建子书库
- 导入按 `ParsedBook.format` 分派：comic 存页面图片到 `pageRepo`，text 存原始文件到 `bookFileRepo`

### 4.4 文件导入

1. **本地导入** ([Import](src/pages/Import/index.tsx)): ZIP/CBZ/RAR/CBR 漫画 + TXT/Markdown/EPUB 文本；散图文件夹导入；文件夹批量导入；大文件流式解析（>50MB）
2. **云端导入** ([CustomCloud](src/pages/CustomCloud/index.tsx)): WebDAV/NAS/FTP 连接后进入浏览模式（面包屑 + 目录导航），支持的书籍格式点击即下载导入；SMB/OneDrive 仅连接测试

### 4.5 解析器（策略模式）

[parsers/](src/services/parsers/) 注册顺序：`ComicArchiveParser` → `EpubParser` → `TextParser`（最宽泛匹配放最后）。接口定义 `canParse` / `parse` / `parseStreaming`。

| Parser | 格式 | 要点 |
|--------|------|------|
| ComicArchiveParser | zip/cbz/rar/cbr | JSZip 优先，RAR/失败回退 libarchive.js；流式解析；动态超时；完整路径自然排序；**导入期章节识别**（目录模式/文件名序列/条漫宽高比） |
| EpubParser | epub | JSZip 解包；OPF spine 定序；NCX/EPUB3 nav 提取章节标题；导入期 XHTML 转纯文本 + 封面 |
| TextParser | txt/md/markdown | UTF-8/GBK 编码自动检测；导入时拆分章节；生成占位封面 |
| PdfParser | pdf | pdfjs-dist 逐页渲染为图片（≤1400px 宽 / 2x 上限，JPEG），复用漫画阅读器；原始文件存 bookFiles |

[archiveParser.ts](src/services/archiveParser.ts) 为压缩包解析核心：双引擎策略、流式解析（逐页回调避免内存峰值）、超时保护（基础 30s + 每MB 200ms）、2GB 上限、文件名自然排序。

### 4.6 数据存储

IndexedDB（`kuro-reader-db`，**v8**），11 个 Object Store，由 [db.ts](src/services/storage/db.ts) 单例管理：

| 代码引用名 | IndexedDB 实际名 | Key | 用途 |
|-----------|------------------|-----|------|
| `books` | `comics`（保留旧名兼容） | `id` | 书籍元数据 |
| `pages` | `pages` | 手动 key `${bookId}/${chapterId}/${pageIndex}` | 页面图片 Blob |
| `covers` | `covers` | 手动 key `${bookId}` | 封面 Blob |
| `sublibraries` | `sublibraries` | `id` | 子书库 |
| `tags` | `tags` | `id` | 标签 |
| `bookFiles` | `bookFiles` | 手动 key | 原始文本文件（TXT/MD/EPUB） |
| `bookmarks` | `bookmarks` | `id` | 书签（v5 新增） |
| `annotations` | `annotations` | `id` + `bookId` 索引 | 批注（v5 新增） |
| `readingProgress` | `readingProgress` | `bookId` | 阅读进度（v6 新增，自 localStorage 迁入） |
| `tombstones` | `tombstones` | `id` | 云同步删除墓碑（v7 新增，90 天过期清理） |
| `knowledgeArtifacts` | `knowledgeArtifacts` | `id` + `bookId` 索引 | 知识产物：人物图谱/思维导图（v8 新增） |

**升级历史**: v1 初始（comics/pages/covers/sublibraries）→ v3 新增 tags → v4 新增 bookFiles → v5 新增 bookmarks/annotations → v6 新增 readingProgress（loadBooks 时自动迁移旧 localStorage 进度并清除旧键）→ v7 新增 tombstones（云同步删除墓碑）→ v8 新增 knowledgeArtifacts。

> 历史遗留的旧版 `storageService.ts` 已删除，存储层统一为 repo 层，无重复实现。

### 4.7 认证系统

[gestureAuth.ts](src/services/gestureAuth.ts) + [GestureLock](src/components/organisms/GestureLock.tsx)：3x3 九宫格手势密码（最少 4 点）、SHA-256 + 随机盐值、时序安全比较、失败计数与临时锁定（30s）、自动锁定超时（1/3/5/15/30 分钟）、[AuthGuard](src/components/layouts/AuthGuard.tsx) 布局守卫。`AuthConfig` 预留安全问题找回机制。

### 4.8 云存储

[cloudStorage.ts](src/services/cloudStorage.ts) 工厂模式：WebDAV（PROPFIND + GET）、FTP（HTTP 代理转发；开发环境走 Vite 中间件 `/api/ftp`，生产环境 `VITE_FTP_PROXY_URL`）。

### 4.9 阅读统计

[useStatsStore](src/stores/useStatsStore.ts) + [readingHeatmap](src/utils/readingHeatmap.ts)：总阅读时长、连续天数、15 周日历热力图（按每日目标定档）、每日阅读目标与连续达标、近 7 天趋势、会话记录（每分钟采样）。

### 4.10 云端同步与设置

[cloudSync.ts](src/services/cloudSync.ts)：阅读进度（按 bookId+updatedAt）、批注与书签（按 id+时间戳）合并为单文件 JSON 载荷，经 WebDAV GET→合并→PUT 完成多端同步。设置页提供凭据配置、立即同步与上次同步时间。

### 4.11 设置

[Settings](src/pages/Settings/index.tsx)：主题、纸张模式、阅读方向、滑动翻页开关、字体字号、文本阅读专属设置（阅读主题/字体/对齐/行高/自动滚动等）、应用锁、知识库 AI 服务（**服务商预设下拉**：智谱 GLM/DeepSeek/OpenAI/硅基流动/Ollama 本机/自定义；贴 Key 后 800ms 防抖**自动连接测试并拉取 /v1/models 模型列表**，模型下拉以服务商返回为准）、存储用量、数据备份导出/导入（JSON，v4 起含知识产物）。

### 4.12 知识库（阶段 6，2026-09-12）

由用户自配的 AI 服务（OpenAI 兼容 /v1/chat/completions，可对接 GLM/DeepSeek/OpenAI/Ollama 本地）通读书本内容，生成结构化知识件；应用内可视化与导出。**凭据仅存本机，仅用户点「生成」时调用。**

- **数据层**: [KnowledgeArtifact](src/types/index.ts)（type: character-graph / mindmap，注册表驱动可扩展）；IndexedDB v8 `knowledgeArtifacts` store + [knowledgeRepo](src/services/storage/knowledgeRepo.ts)（bookId 索引、删书级联、knowledge/book 双墓碑防云同步复活）
- **语料与任务**: [bookCorpus](src/services/knowledge/bookCorpus.ts) 聚合 TXT/MD/EPUB 章节与 PDF 文本层为分块（6k 字/块、60 块成本护栏、FNV-1a 内容指纹）；[knowledgeTasks](src/services/ai/knowledgeTasks.ts) 注册表定义各产物的提示词/片段解析/合并（新产物类型追加一个条目即可全链路生效）
- **AI 接入**: [aiClient](src/services/ai/aiClient.ts) OpenAI 兼容客户端——智能 /vN 拼接（带 /v1、/v4 版本段的地址不再叠加 /v1）、容错 JSON 抽取、超时/取消联动、`listModels` 拉取全量模型（OpenAI `{data:[{id}]}` 与字符串数组双形态）；[providers](src/services/ai/providers.ts) 服务商预设注册表（智谱 GLM/DeepSeek/OpenAI/硅基流动/Ollama 本机/自定义，按地址反查当前预设）；模型列表拉回后若未选过模型自动落第一个（受控 select 空 value 会以首项示人、store 却为空，曾致知识库守卫误判"未配置"循环跳设置）；Android `allowMixedContent`（capacitor.config）——https 页面调 Ollama/WebDAV 等本机 http 服务不再被 WebView 混合内容拦截
- **生成状态机**: [useKnowledgeStore](src/stores/useKnowledgeStore.ts)——分块进度、单块一次重试、取消（AbortController）、覆盖式重生成（复用旧件 id）；**生成灵活性**：`options` 贯穿（[GenerationOptionsSheet](src/components/molecules/knowledge/GenerationOptionsSheet.tsx) 弹层）——章节范围（[buildBookCorpus](src/services/knowledge/bookCorpus.ts) 按 0 起绝对章索引过滤、chapterTexts 绝对对齐保证据定位与回跳不错位）、**增量补充**（`incremental` 只读上次 bookChapterCount 之后的新章、[mergeCharacterGraphs](src/utils/knowledgeMerge.ts) 以现有图谱为基底合并、已定位证据坐标直通不重校验）、详细度 core/standard/rich（图谱提示词人物上限 8/15/24 分档）；meta 记 scope/bookChapterCount/detail，任务卡展示"覆盖第 X-Y 章 · 核心版"与书有更新提示
- **合并纯函数**: [knowledgeMerge](src/utils/knowledgeMerge.ts)——同人名节点归并、无向边按端点对+关系去重、连接度截断（≤48 人物）防模型失控；导图按片段拼枝（≤24 分支、深宽限制）
- **可视化**: [CharacterGraphView](src/components/molecules/knowledge/CharacterGraphView.tsx) 力导向图谱（[graphLayout](src/utils/graphLayout.ts) 确定性 FR 布局；节点拖拽/点选人物卡看关系列表）；[MindmapView](src/components/molecules/knowledge/MindmapView.tsx) XMind 风格导图（[mindmapLayout](src/utils/mindmapLayout.ts) 根居中双侧辐射、八色分支、粗细随层级递减的 S 曲线、一级实底/二级浅底/三级彩线下划的层级版式，单片「片段N」中转层自动上提；折叠/展开带隐藏计数角标）；[PanZoom](src/components/molecules/knowledge/PanZoom.tsx) 统一画布（拖拽/双指捏合/滚轮/初始适配缩放）
- **图谱回原文（6-7）**: 分块语料携带覆盖章节（`chunk.chapterIndexes`）→ 人物记出现章节并集、关系边记依据摘句（提示词 `evidence` 逐字摘录）→ [resolveGraphEvidence](src/utils/knowledgeMerge.ts) 在真实章节文本中本地校验定位（indexOf 防幻觉引文，命中换算章内占比坐标，未命中回退章级）；查看器人物卡：出现章节 chips 回跳、证据原文引用块经 `?goto=chapterIndex,offsetRatio` 精确落到原文（TextReader 显式直达优先于进度恢复）；PDF 走 `?page=` 页级直达；导出附人物/关系表（含依据原文与位置）
- **内容类型分流（6-8）**: 小说与学术读者分流——按书内容类型（自动/小说/学术，档案卡切换随书记忆；[contentKind](src/utils/contentKind.ts) 启发式：参考文献/摘要/et al. 强信号 + 定义句式/小节编号累计，对白密度压制防误判）决定任务集：小说=人物图谱+情节导图；学术=论证导图（提示词按视角切换）+**概念术语卡**（`glossary` 新产物：术语/书内定义/定义原文校验定位回跳，[GlossaryView](src/components/molecules/knowledge/GlossaryView.tsx) 卡片列表）；其他视角已生成产物仍可达；导出术语 Markdown 速查表
- **动线**: 主菜单直达全局知识库聚合页（[KnowledgeHubPage](src/pages/KnowledgeHub/index.tsx)：`/knowledge-hub` 跨书总目，桌面侧边栏/移动底栏/顶栏菜单三入口，点卡直达查看器）；档案卡知识库区块（[KnowledgeSection](src/components/molecules/knowledge/KnowledgeSection.tsx)：内容类型切换 + 生成入口/进度/已生成直达）→ `/knowledge/:bookId/:artifactId` 查看器（重生成/导出/删除）；未配置 AI 引导直达设置；漫画书提示 OCR 路径
- **随行**: 导出 Mermaid 图谱源码 / Markdown 嵌套大纲（嫁接 Obsidian）；备份 v4 与云同步 SYNC_VERSION 4（按 id LWW + 墓碑剔除 + 整书级联）均携带知识产物

---

## 五、路由结构

| 路径 | 页面 | 认证守卫 | 布局 |
|------|------|----------|------|
| `/` | Home | AuthGuard | MainLayout |
| `/library` | Library | AuthGuard | MainLayout |
| `/library/:subLibraryId` | SubLibrary | AuthGuard | MainLayout |
| `/search` | Search | AuthGuard | MainLayout |
| `/import` | Import | AuthGuard | MainLayout |
| `/settings` | Settings | AuthGuard | MainLayout |
| `/stats` | Stats | AuthGuard | MainLayout |
| `/profile` | Profile | AuthGuard | MainLayout |
| `/book/:id` | BookDetail | 无 | 独立 |
| `/knowledge/:bookId/:artifactId` | Knowledge（知识产物查看器） | 无 | 独立 |
| `/reader/:bookId/:chapterId?` | Reader（漫画） | 无 | 独立 |
| `/text-reader/:bookId/:chapterId?` | TextReader（文本） | 无 | 独立 |
| `/import/custom-cloud` | CustomCloud | 无 | 独立 |
| `/tags` | Tags | 无 | 独立 |
| `/auth` | Auth | 无 | 独立 |

- `readerPathForBook()` 按书籍 `format` 自动分派到 Reader 或 TextReader
- 批量管理入口：首页「更多」菜单 → Library 的内联选择模式（`state.selectMode`）
- 底部导航栏 4 个 Tab: 首页 / 书库 / 导入 / 设置

---

## 六、设计系统

### 6.1 色彩体系（Material Design 3）

| Token | 浅色 | 深色 |
|-------|------|------|
| Background | `#FDF8F8` | `#111111` |
| On-Background | `#1C1B1C` | `#F4F0F0` |
| Primary | `#000000` | `#F4F0F0` |
| Surface | `#FDF8F8` | `#1C1B1C` |

### 6.2 字体

- **Display**: Playfair Display
- **Body**: Literata（默认）/ Inter（可选）
- **Label**: Inter
- **Icon**: Material Symbols Outlined
- 文本阅读器另有 8 种中文字体预设（`textReaderFonts.ts`）

### 6.3 动画系统

完整纯 CSS 动画系统（详见 [README.md](README.md) 动画章节），统一使用 `cubic-bezier(0.16, 1, 0.3, 1)`（MD3 emphasized easing）。

---

## 七、测试现状

**86 个测试文件、660 个用例，全部通过**（`npm run test`，fake-indexeddb + jsdom 环境；阶段 6 交付后）。

阶段 6 新增覆盖：

| 测试文件 | 覆盖范围 |
|----------|----------|
| `storage/knowledgeRepo.test.ts` | 知识产物仓库 CRUD / deleteByBookId 级联 / 墓碑记录 / 日期还原 |
| `services/ai/aiClient.test.ts` | OpenAI 兼容请求形状 / 端点 URL 智能拼接（裸根补 /v1、/vN 不叠加）/ listModels 解析（双形态/去重/错误）/ JSON 容错抽取 / HTTP 错误 |
| `services/ai/providers.test.ts` | 服务商预设唯一性 / 按地址反查预设（归一化匹配、协议缺省不混淆） |
| `services/knowledge/bookCorpus.test.ts` | 章节打包分块（覆盖章节索引） / 超长切段 / 指纹确定性 / PDF 逐页入列 / 漫画与空文本错误 |
| `utils/knowledgeMerge.test.ts` | 片段校验（防幻觉/限长/证据摘句）/ 节点边归并去重（章节并集/证据首胜）/ 截断剔除断边 / 证据本地校验定位（优先章/全书扫描/幻觉丢弃）/ 术语卡解析合并校验 / 导图限深限宽拼枝 |
| `utils/graphLayout.test.ts` | 布局确定性 / 画布边界 / 退化情形 / 相连节点更近趋势 |
| `utils/knowledgeExport.test.ts` | Mermaid 图谱构建（id 映射/引号转义）/ Markdown 大纲 / 导出文件名 |
| `stores/useKnowledgeStore.test.ts` | 生成状态机：未配置拦截 / 分块进度 / 中途取消 / 全块解析失败 / 覆盖式重生成复用 id / 删除双清 |
| `utils/contentKind.test.ts` | 文体检测：学术强信号 / 弱信号累计过线 / 对白压制 / 保守回落 / 多章采样 |
| `services/ai/knowledgeTasks.test.ts` | 任务按内容类型分流 / 导图双提示词（情节 vs 论点）/ 术语卡提示词约束 |
| `pages/Knowledge/index.test.tsx` | 查看器冒烟（元信息/图谱节点/缺位提示） |
| `services/cloudSync.test.ts`（增补） | 知识产物按 id LWW / 旧载荷兼容 / knowledge 与整书墓碑剔除 / 落地写库 |

阶段 4/5 新增覆盖：

| 测试文件 | 覆盖范围 |
|----------|----------|
| `storage/annotationRepo.test.ts` | 批注仓库 CRUD / deleteByBookId 级联 / update 白名单 |
| `storage/bookmarkRepo.test.ts` | 书签仓库 CRUD / deleteByBookId / 位置查找 |
| `storage/bookRepo.test.ts` | deleteFully 级联清理（批注/书签/进度，他书保留） |
| `components/SelectionFloatingButton.test.tsx` | 划线/批注双动作条 |
| `components/AnnotationPopup.test.tsx` | 空笔记纯划线 / 笔记+样式 / 取消 |
| `components/AnnotationList.test.tsx` | 纯划线标识 / 清空转划线 / 跳转 |
| `components/AnnotationDetailModal.test.tsx` | 编辑补丁 / 删除 / 回到此处 |
| `components/AnnotationTagPicker.test.tsx` | chips 多选 / 内联新建 / Escape |
| `components/InBookSearchPanel.test.tsx` | 防抖检索 / 命中定位 / 三态 |
| `utils/textSearch.test.ts` | 书内检索：大小写/CJK/MD坐标/上限 |
| `utils/annotationFilter.test.ts` | 摘抄墙四维过滤交集 |
| `utils/revisit.test.ts` | 周年/当日回访/重读候选确定性 |
| `constants/routes.test.ts` | ?ann= 批注直达路由；?goto= 知识库原文直达（解析/文本书 goto/PDF page/漫画回档案卡） |

以下为存量测试清单（阶段 3 收官时）：

| 测试文件 | 覆盖范围 |
|----------|----------|
| `test/smoke.test.ts` | 基础冒烟 |
| `parsers/comicArchiveParser.test.ts` | 漫画压缩包解析器 |
| `parsers/index.test.ts` | Parser 注册与分发 |
| `parsers/types.test.ts` | 类型定义 |
| `parsers/utils.test.ts` | 标题提取 / 章节拆分 / HTML 清洗 |
| `storage/pageRepo.test.ts` | 页面仓库 CRUD |
| `storage/bookFileRepo.test.ts` | 原始文件仓库 |
| `types/index.test.ts` | 类型守卫 |
| `utils/extractTitle.test.ts` | 标题提取 |
| `utils/fileType.test.ts` | 文件类型判断 |
| `utils/markdownDocument.test.ts` | Markdown 文档解析 |
| `utils/readerPagination.test.ts` | 漫画翻页纯函数 |
| `utils/readingProgress.test.ts` | 整体进度计算 |
| `utils/textPageLayout.test.ts` | 文本分页布局 |
| `utils/textReaderNavigation.test.ts` | 文本翻页导航 |
| `constants/textReaderFonts.test.ts` | 字体预设 |
| `components/HorizontalReaderView.test.tsx` | 水平阅读视图组件 |
| `components/MarkdownReaderContent.test.tsx` | Markdown 渲染组件 |
| `stores/useStatsStore.test.ts` | 阅读统计（streak/周聚合/fake timers） |
| `stores/useAppStore.test.ts` | 主题与设置同步 / 认证超时 / 手势锁失败锁定 / persist merge |
| `stores/useLibraryStore.test.ts` | 选择器 / 进度持久化 / 删除联动 / importFile 六分支（mock repo+parser） |
| `stores/useReaderStore.test.ts` | 翻页边界 / 续读页码换算 / loadPage 竞态 / closeReader |
| `storage/progressRepo.test.ts` | 进度仓库 CRUD（v6） |
| `pages/CustomCloud/index.test.tsx` | 云端浏览全流程（连接/导航/下载导入/错误/断开） |
| `services/epubContent.test.ts` | XHTML→Markdown 转换 / zip 路径解析 / 真实 EPUB 包集成（图片+目录） |
| `utils/annotationAnchor.test.ts` | 批注指纹锚点：表征变化重定位 / 同上下文消歧 / 三级回退 |
| `utils/annotationExport.test.ts` | 批注导出 Markdown 构建 / 文件名清理 |
| `hooks/useSpeech.test.tsx` | TTS 分块队列 / 会话失效 / 倍速 / 降级 |
| `services/opds.test.ts` | OPDS Atom 解析 / 文件名推断 / Basic 认证 |
| `components/OpdsBrowser.test.tsx` | OPDS 浏览（加载/下钻/下载导入/错误） |
| `parsers/boundaryFixtures.test.ts` | 边界矩阵回归：以 `test-fixtures/` 真实文件驱动真实解析管线（含章节识别 5 类，36 用例） |
| `services/cloudSync.test.ts` | 同步载荷合并（逐条 LWW）/ 同步 URL / GET-MERGE-PUT 流程 |
| `utils/comicChapterSplit.test.ts` | 漫画章节拆分：目录模式/序列/宽高比/过度细分回退 |
| `utils/imageSize.test.ts` | PNG/JPEG 头部尺寸读取 |
| `utils/readingHeatmap.test.ts` | 日历热力图聚合 / 强度分档 / 目标连续达标 |

测试基建：`src/test/setup.ts` 全局提供 fake-indexeddb 与 `URL.createObjectURL/revokeObjectURL` stub。覆盖重点在服务层、工具函数、Store 与阅读器子组件；**页面组件仍缺少测试**。

---

## 八、已知问题与待改进项

### 8.1 阅读器大型文件（持续拆分中）

- [TextReader/index.tsx](src/pages/TextReader/index.tsx) 约 **2570 行**（2026-09-02 拆出 services/pagination 切分策略、useTextSelection 选区检测、useBookFlipAnimation 翻书动画、useTextProgressSaving 进度保存、useSeamlessScrollTracking 滚动追踪五个模块；此前已拆出服务/5 个 Hook/7 个组件）
- [Reader/index.tsx](src/pages/Reader/index.tsx) 约 **1300 行**（2026-09-02 拆出 useVerticalVirtualWindow hook + ReaderProgressTrack/LongPressActionMenu 组件，2013 → 1300）

至此 TextReader 的既定拆分候选（分页策略/选区检测/翻书动画/进度保存/滚动追踪）全部收口；剩余内联块（听书控制、批注面板编排等）规模小、暂无拆分必要。

### 8.2 页面组件测试缺失

除 Auth/Reader 外的全部 12 个页面均有冒烟渲染测试（2026-09-02，含共享 fixture 工厂 src/test/pageSmokeFactories.ts）；Auth（手势锁交互复杂）与 Reader 页（其分子组件已覆盖）暂缺页面级测试；云存储/FTP 客户端无测试；认证流程无集成测试。

### 8.2.1 阶段 4/5 遗留（采集器官边界外，见 ROADMAP.md 第五节）- ~~PDF 逐页转 JPEG 丢弃 textLayer——不可检索~~ → services/pdfText 逐页提取 + PDF 顶栏检索直达页码（2026-08-30）
- ~~漫画/PDF 无批注~~ → 页级手记（Annotation.pageIndex 页码锚定：长按动作菜单/手记面板/摘抄墙 ?page= 直达，同步导出全兼容）（2026-08-30）
- ~~图片内文字级批注（划线级）仍缺~~ → 双路交付（2026-09-02）：PDF 走 pdfTextLayer 坐标文本项 + PdfTextLayerOverlay 透明可选层（rects 批注，划线/批注/回显/`?ann=` 直达）；漫画走 Tesseract.js OCR 实验入口（长按「识别本页文字」，动态 import 不进主包，会话级缓存）。OCR 识别质量待真实漫画验证（观察项）
- 分发反馈渠道未建立，采集器官价值假设待真实用户验证（P2）
- ~~云同步 LWW 无删除墓碑：本地删除的条目可能被远端副本复活~~ → SYNC_VERSION 3 墓碑（tombstones store + 合并剔除 + 多端接力传播 + 90 天过期清理）（2026-09-02）

### 8.3 已解决（历史问题存档）

**阶段 6「知识库形态」（2026-09-12，详见 ROADMAP.md）**：
- ~~知识组织只能外流到 Obsidian/Notion~~ → 应用内生成并可视化人物关系图谱与全书思维导图（AI 通读 + 力导向/水平树自研视图），导出 Mermaid/Markdown 继续嫁接外部知识库
- ~~AI 能力缺位（原观察项）~~ → 用户自配 OpenAI 兼容服务接入（本地优先：凭据只存本机、仅生成时调用、Ollama 可本地跑）
- ~~知识件跨设备会丢~~ → 备份 v4 + 云同步 v4 均携带（LWW + knowledge/book 墓碑 + 删书级联）
- 工程附修：E2E 验证中发现并修复 SVG 直接引用 RGB 三元组 CSS 变量导致图谱渲染全黑（统一 `rgb(var(--color-*))`）、查看器顶栏 back 变体无 more 按钮导致菜单不可达（改用 detail 变体）；顺手清理了基线遗留的 lint 错误（TextReader/PdfTextLayerOverlay 等导入顺序与魔数）与 cloudSync 测试的日历时间腐烂（固定日期墓碑改相对时间）

**阶段 4/5「知识闭环 + 呼出环节」（2026-08-30，详见 ROADMAP.md）**：
- ~~批注必须写非空笔记（划线入口卡死）~~ → 划线/批注分离，纯划线零输入保存
- ~~批注详情只读~~ → 编辑/删除/「回到此处」
- ~~摘抄墙跳转只到章节级~~ → ?ann= 直达批注原句
- ~~书内内容找不回~~ → 书内全文检索（textSearch + InBookSearchPanel）
- ~~摘抄墙无检索无筛选~~ → 四维过滤（query/书/标签/形态）+ 手记标签 tagIds
- ~~删除书后批注/书签/进度成孤儿~~ → deleteFully 级联清理（兑现删除弹窗承诺）
- ~~云同步合并不落地本地（多端拉取无效）~~ → applyMergedPayloadToLocal 写回 IndexedDB
- ~~阅读统计不同步不备份（换机年轮断）~~ → SYNC_VERSION 2 + 备份 v3 含时长簿
- ~~划完线之后没有任何东西回到用户面前~~ → 回望席（周年手记/当日确定性回访）+ 整墙导出

**阶段 2「内容闭环」（2026-08-29，详见 ROADMAP.md）**：
- ~~WebDAV/FTP 云端导入断头路~~ → 浏览模式 + 下载导入（969b1e6）
- ~~EPUB 丢图丢结构~~ → XHTML→Markdown 保真管线 + NCX/nav 目录（cddf9fc）
- ~~PDF 仅类型预留~~ → pdfjs 逐页渲染复用漫画阅读器
- ~~批注锚点脆弱~~ → 指纹锚点 + 自愈解析，内容表示变化后可重定位
- ~~进度恢复/跳转依赖定时器赌时序~~ → 分页定位请求队列，分页完成同步消费

**阶段 1「信任与手感」（2026-08-29，详见 ROADMAP.md）**：
- ~~备份导出遗漏书签/批注~~ → 备份格式 v2 含全部数据，导入兼容 v1 并覆盖写入
- ~~阅读进度存 localStorage（易丢失）~~ → DB v6 + progressRepo，自动迁移旧数据
- ~~Android 硬件返回键无策略~~ → backHandler 栈：浮层逐层关闭 → 路由后退 → 退出
- ~~漫画单击 300ms 双击判定延迟~~ → 单击立即执行 + 双击补偿回滚
- ~~阅读偏好全局化~~ → textReadingMode/readingTheme 按书记忆（全局值作默认）
- ~~双栏模式竖屏静默失效~~ → toast 提示旋转设备
- ~~书签/批注删除不可撤销~~ → toast + 5 秒撤销
- ~~批量管理仅首页菜单入口~~ → 书库页内新增入口
- ~~顶栏触控目标 40px~~ → 44px
- ~~cloudSync 空壳开关~~ → 核实未在 UI 暴露，无问题；同步实现留待阶段 3

- ~~ESLint 全量基线不绿（约 465 个错误/警告）~~ → 已全部清零：import 顺序自动修复；`eqeqeq` 配置 `null: 'ignore'`（保留 `x == null` 判空惯例）；`import/default` 关闭（React CJS 默认导出误报）；`no-magic-numbers` 266 处全部消除（通用单位因子入 ignore 列表，业务阈值/时长/比例提取为命名常量，预设表用定向豁免）；6 处 `any` 改为存储形态类型/接口声明；7 个 hook 依赖警告修复或定向豁免
- ~~版本号不一致（package.json 0.0.0 vs APP_CONFIG 1.0.0）~~ → 已统一为 `1.0.0`
- ~~Batch 孤儿页面（无入口的重复实现）~~ → 已删除 `BatchPage` 与 `ROUTES.BATCH`；批量管理功能实际位于 Library 内联选择模式（首页「更多」菜单入口）
- ~~Store 无测试~~ → 4 个 Store 已补齐 60 个用例
- ~~存储层重复（storageService.ts 与 repo 层并存）~~ → `storageService.ts` 已删除，统一走 repo 层
- ~~comicRepo / ComicDetail 漫画专用命名~~ → 已泛化为 bookRepo / BookDetail / Book

---

## 九、开发与构建

### 命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | TypeScript 检查 + Vite 构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行测试（vitest 4，勿用已移除的 `--reporter=basic`） |
| `npm run test:watch` | 监听模式测试 |
| `npm run test:ui` | Vitest UI |
| `npm run typecheck` | 仅类型检查 |

### Android 构建

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug   # 或 assembleRelease
```

### CI / 部署

- `.github/workflows/kuro-reader-pages.yml`：push 到 `comics` 分支且 `reader/kuro-reader/docs/**` 有变更时，将 `docs/` 部署到 GitHub Pages。
- `.github/workflows/kuro-reader-ci.yml`：push/PR 触发 lint + typecheck + test + build 四道门禁。

### 环境变量

| 变量 | 用途 |
|------|------|
| `VITE_FTP_PROXY_URL` | FTP 代理服务器地址（生产环境） |

---

## 十、代码规模统计

| 类别 | 文件数 | 行数 |
|------|--------|------|
| 页面组件 | 15 | ~8900（TextReader 2711 / Reader 1664） |
| 组件（非测试） | 35 | ~5300（含知识库可视化 4 件） |
| 服务层（非测试） | 25 | ~2600（含 ai/knowledge 两层） |
| Store | 5 | ~1850 |
| 工具/常量 | 19 | ~2100（含图谱/导图布局与合并纯函数） |
| Hooks | 8 | ~390 |
| 类型定义 | 1 | ~320 |
| 测试 | 82 | ~5200 |
| **合计（src，含测试）** | **~165** | **~40800** |
