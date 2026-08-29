# Kuro Reader 项目现状梳理

> 更新日期：2026-08-29，与 `comics` 分支工作区代码（含未提交改动）对齐。

## 一、项目概述

**Kuro Reader** 是一款本地书籍阅读器，支持 **漫画（ZIP/CBZ/RAR/CBR）** 与 **文本（TXT/Markdown/EPUB）** 双模式阅读，可部署为 Web 应用或 Android App。采用 Material Design 3 设计体系，提供沉浸式阅读体验和流畅的交互动画。

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
│   │   └── layouts/            # MainLayout, PageTransition, AuthGuard
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
│   │   ├── BookDetail/         # 书籍详情（漫画 & 文本通用）
│   │   ├── Reader/             # 漫画阅读器（~1660 行）
│   │   ├── TextReader/         # 文本阅读器（~2710 行，当前最大文件）
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
│   │   │   └── tagRepo.ts        # 标签
│   │   ├── archiveParser.ts    # 压缩包解析核心逻辑（双引擎 + 流式）
│   │   ├── textContent.ts      # 文本内容加载（TXT/MD/EPUB → 章节）+ 章节定位
│   │   ├── epubContent.ts      # EPUB 保真读取（XHTML→Markdown + 插图 object URL + NCX/nav 目录）
│   │   ├── opds.ts             # OPDS 目录解析（Atom）+ 认证拉取 + 出版物下载
│   │   ├── backHandler.ts      # Android 返回键处理器栈（浮层优先消费）
│   │   ├── cloudStorage.ts     # 云存储客户端（WebDAV/FTP 工厂）
│   │   ├── ftpClient.ts        # FTP 客户端（HTTP 代理模式）
│   │   ├── fileTransfer.ts     # 统一文件下载服务（Web/Native）
│   │   └── gestureAuth.ts      # 手势认证（SHA-256 + 盐值 + 时序安全比较）
│   ├── stores/                 # Zustand 状态管理
│   │   ├── useAppStore.ts      # 应用全局状态（主题、设置、认证）
│   │   ├── useLibraryStore.ts  # 书库状态（消费全部 storage repo）
│   │   ├── useReaderStore.ts   # 漫画阅读器状态（页面加载、预加载、缓存）
│   │   └── useStatsStore.ts    # 阅读统计状态
│   ├── types/
│   │   └── index.ts            # 全局类型定义（Book / PageRef / Bookmark / Annotation）
│   ├── utils/
│   │   ├── readerPagination.ts # 漫画翻页纯函数（步长/双页/点按区/键盘）
│   │   ├── textPageLayout.ts   # 文本分页视口布局计算
│   │   ├── textReaderNavigation.ts # 文本翻页与点按动作
│   │   ├── readingProgress.ts  # 整体阅读进度计算（跨章节）
│   │   ├── markdownDocument.ts # Markdown 文档解析（分页/结构化）
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
- **批量操作**: 批量删除、批量标记已读；文件夹批量导入自动创建子书库
- 导入按 `ParsedBook.format` 分派：comic 存页面图片到 `pageRepo`，text 存原始文件到 `bookFileRepo`

### 4.4 文件导入

1. **本地导入** ([Import](src/pages/Import/index.tsx)): ZIP/CBZ/RAR/CBR 漫画 + TXT/Markdown/EPUB 文本；散图文件夹导入；文件夹批量导入；大文件流式解析（>50MB）
2. **云端导入** ([CustomCloud](src/pages/CustomCloud/index.tsx)): WebDAV/NAS/FTP 连接后进入浏览模式（面包屑 + 目录导航），支持的书籍格式点击即下载导入；SMB/OneDrive 仅连接测试

### 4.5 解析器（策略模式）

[parsers/](src/services/parsers/) 注册顺序：`ComicArchiveParser` → `EpubParser` → `TextParser`（最宽泛匹配放最后）。接口定义 `canParse` / `parse` / `parseStreaming`。

| Parser | 格式 | 要点 |
|--------|------|------|
| ComicArchiveParser | zip/cbz/rar/cbr | JSZip 优先，RAR/失败回退 libarchive.js；流式解析；动态超时；自然排序 |
| EpubParser | epub | JSZip 解包；OPF spine 定序；NCX/EPUB3 nav 提取章节标题；导入期 XHTML 转纯文本 + 封面 |
| TextParser | txt/md/markdown | UTF-8/GBK 编码自动检测；导入时拆分章节；生成占位封面 |
| PdfParser | pdf | pdfjs-dist 逐页渲染为图片（≤1400px 宽 / 2x 上限，JPEG），复用漫画阅读器；原始文件存 bookFiles |

[archiveParser.ts](src/services/archiveParser.ts) 为压缩包解析核心：双引擎策略、流式解析（逐页回调避免内存峰值）、超时保护（基础 30s + 每MB 200ms）、2GB 上限、文件名自然排序。

### 4.6 数据存储

IndexedDB（`kuro-reader-db`，**v6**），9 个 Object Store，由 [db.ts](src/services/storage/db.ts) 单例管理：

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

**升级历史**: v1 初始（comics/pages/covers/sublibraries）→ v3 新增 tags → v4 新增 bookFiles → v5 新增 bookmarks/annotations → v6 新增 readingProgress（loadBooks 时自动迁移旧 localStorage 进度并清除旧键）。

> 历史遗留的旧版 `storageService.ts` 已删除，存储层统一为 repo 层，无重复实现。

### 4.7 认证系统

[gestureAuth.ts](src/services/gestureAuth.ts) + [GestureLock](src/components/organisms/GestureLock.tsx)：3x3 九宫格手势密码（最少 4 点）、SHA-256 + 随机盐值、时序安全比较、失败计数与临时锁定（30s）、自动锁定超时（1/3/5/15/30 分钟）、[AuthGuard](src/components/layouts/AuthGuard.tsx) 布局守卫。`AuthConfig` 预留安全问题找回机制。

### 4.8 云存储

[cloudStorage.ts](src/services/cloudStorage.ts) 工厂模式：WebDAV（PROPFIND + GET）、FTP（HTTP 代理转发；开发环境走 Vite 中间件 `/api/ftp`，生产环境 `VITE_FTP_PROXY_URL`）。

### 4.9 阅读统计

[useStatsStore](src/stores/useStatsStore.ts)：总阅读时长、连续天数、近 7 天数据、会话记录（每分钟采样）、localStorage 持久化。

### 4.10 设置

[Settings](src/pages/Settings/index.tsx)：主题、纸张模式、阅读方向、滑动翻页开关、字体字号、文本阅读专属设置（阅读主题/字体/对齐/行高/自动滚动等）、应用锁、存储用量、数据备份导出/导入（JSON）。

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

**32 个测试文件、305 个用例，全部通过**（`npm run test`，fake-indexeddb + jsdom 环境）。

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
| `parsers/boundaryFixtures.test.ts` | 边界矩阵回归：以 `test-fixtures/` 真实文件驱动真实解析管线（31 用例） |

测试基建：`src/test/setup.ts` 全局提供 fake-indexeddb 与 `URL.createObjectURL/revokeObjectURL` stub。覆盖重点在服务层、工具函数、Store 与阅读器子组件；**页面组件仍缺少测试**。

---

## 八、已知问题与待改进项

### 8.1 阅读器大型文件（持续拆分中）

- [TextReader/index.tsx](src/pages/TextReader/index.tsx) 约 **2710 行**（已从 3154 行拆出服务/5 个 Hook/7 个组件）
- [Reader/index.tsx](src/pages/Reader/index.tsx) 约 **1660 行**（已从 1731 行拆出章节抽屉与统计 Hook）

仍内联的高耦合块（后续深度拆分候选）：TextReader 分页引擎（paginateMeasuredContent）、翻书动画状态、约 350 行文本选区 effect、进度保存/镜像 ref 体系；Reader 垂直虚拟窗口与滚动恢复。

### 8.2 页面组件测试缺失

14 个页面组件无测试（阅读器子组件除外）；云存储/FTP 客户端无测试；认证流程无集成测试。

### 8.3 已解决（历史问题存档）

**阶段 2「内容闭环」（进行中，详见 ROADMAP.md）**：
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
| 页面组件 | 14 | ~8550（TextReader 2711 / Reader 1664） |
| 组件（非测试） | 30 | ~4590 |
| 服务层（非测试） | 20 | ~2050 |
| Store | 4 | ~1640 |
| 工具/常量 | 15 | ~1180 |
| Hooks | 8 | ~390 |
| 类型定义 | 1 | ~220 |
| 测试 | 22 | ~2100 |
| **合计（src，含测试）** | **~115** | **~20700** |
