# 本地阅读器技术设计文档（现代 UI 版）

版本：V2.0  
依据原型：本地阅读器 V4 Modern UI  
文档类型：技术设计文档 / 实施计划 / LLM 执行规格  
目标读者：LLM 开发 Agent、LLM UI Agent、架构 Agent、测试 Agent  
目标平台：Android 手机、Android 平板、iOS、iPadOS、Windows  
产品定位：无需登录、本地优先、跨端一致的文本、漫画、PDF 阅读工作台

---

## 0. 文档更新说明

本版技术设计文档基于最新 V4 Modern UI 原型重写，重点调整以下技术方向：

1. UI 架构从传统纸感阅读器升级为现代阅读工作台。
2. 首页采用 Bento 式信息概览，不再是普通列表首页。
3. 书架页明确禁止无限下拉，采用分区、分页、聚合、快速定位。
4. 引入现代 App Shell：手机底部导航，平板与桌面侧边导航。
5. 引入 Command Search 作为全局搜索与操作入口。
6. 引入日间 / 夜读 / 紧凑密度切换。
7. 组件系统从“书籍卡片集合”升级为 Design System + Motion System。
8. 阅读器保持沉浸，但工具栏改为现代浮层式 Reader Toolbar。
9. 技术实现需服务最新 UI 的信息架构，而不是沿用旧版无限网格书库。

LLM 执行时必须以本文件为最新技术依据。

---

# 1. 产品与技术目标

## 1.1 产品目标

开发一款现代化本地阅读工作台，支持用户在多个平台上管理和阅读本地内容：

- TXT
- EPUB
- Markdown
- HTML
- PDF
- CBZ
- ZIP 图片包
- CBR / RAR，视技术与授权支持
- 图片目录

核心体验链路：

```text
导入 / 扫描本地内容
→ 自动识别元数据
→ 进入分区书架
→ 文本 / 漫画 / PDF 专业阅读
→ 保存进度、标签、笔记、书签
→ 本地备份与跨端迁移
```

## 1.2 UI 技术目标

最新 UI 要求技术侧支持：

- 现代 App Shell
- Bento 首页布局
- 分区分页书架
- 系列聚合
- Command Search
- 响应式布局
- 主题切换
- 密度切换
- 现代卡片组件
- 轻玻璃面板
- 沉浸式阅读器
- Reader Toolbar
- 非无限滚动的书库数据加载策略

## 1.3 不做范围

V1 仍然不做：

- 登录注册
- 手机号绑定
- 第三方授权
- 在线书城
- 在线漫画源
- 内容推荐流
- 社区
- 云账号同步
- DRM 解密
- 阅读页广告
- 默认上传用户文件

---

# 2. 总体技术架构

## 2.1 分层架构

```text
Flutter Presentation Layer
├── App Shell
├── Modern Design System
├── Responsive Layout
├── Motion System
├── Reader UI
└── Feature Pages

Application Layer
├── HomeService
├── ShelfService
├── ImportScanService
├── MetadataService
├── SearchService
├── ReaderService
├── NotesService
├── BackupService
├── SettingsService
└── PlatformService

Domain Layer
├── Book
├── ShelfSection
├── Series
├── Tag
├── ReadingProgress
├── ReaderDocument
├── Bookmark
├── Note
├── SearchResult
└── BackupManifest

Infrastructure Layer
├── LocalDatabase
├── FileSystemAdapter
├── ArchiveAdapter
├── TextParser
├── ComicParser
├── PdfAdapter
├── CacheManager
├── SearchIndex
├── BackupEngine
└── PlatformBridge
```

## 2.2 推荐技术栈

| 层级 | 推荐方案 |
|---|---|
| 跨端 UI | Flutter |
| 状态管理 | Riverpod |
| 路由 | go_router |
| 数据库 | drift + SQLite |
| 本地缓存 | 文件系统缓存 + SQLite 索引 |
| 全文搜索 | SQLite FTS5，后续可替换搜索引擎 |
| 文件选择 | file_picker + 平台桥接 |
| Android 目录授权 | SAF / 原生桥接 |
| Windows 拖拽 | desktop drop 插件或平台通道 |
| PDF | PdfAdapter 抽象，底层库可替换 |
| 性能核心 | Rust Core 分阶段引入 |
| 日志 | 本地日志，默认不上传 |
| 测试 | Unit / Widget / Integration / Golden |

## 2.3 LLM 实现边界

LLM 不得把业务逻辑写入 Widget。

正确依赖方向：

```text
Page / Widget
→ Controller / ViewModel
→ Service
→ Repository / Adapter
→ Database / FileSystem
```

禁止：

```text
ShelfPage 直接扫描目录
ReaderPage 直接写 SQLite
BookCard 直接解析 EPUB
SearchPage 直接遍历文件系统
```

---

# 3. 工程目录结构

```text
local_reader/
├── app/
│   ├── main.dart
│   ├── bootstrap.dart
│   ├── app.dart
│   ├── router.dart
│   └── app_environment.dart
│
├── design_system/
│   ├── tokens/
│   │   ├── app_colors.dart
│   │   ├── app_spacing.dart
│   │   ├── app_radius.dart
│   │   ├── app_typography.dart
│   │   └── app_motion.dart
│   ├── theme/
│   │   ├── app_theme.dart
│   │   ├── light_theme.dart
│   │   ├── dark_theme.dart
│   │   └── density_theme.dart
│   ├── components/
│   │   ├── app_shell/
│   │   ├── cards/
│   │   ├── buttons/
│   │   ├── chips/
│   │   ├── panels/
│   │   ├── dialogs/
│   │   ├── states/
│   │   └── reader_toolbar/
│   └── responsive/
│       ├── breakpoints.dart
│       ├── adaptive_layout.dart
│       └── layout_density.dart
│
├── features/
│   ├── onboarding/
│   ├── home/
│   ├── shelf/
│   ├── search/
│   ├── import_scan/
│   ├── metadata/
│   ├── series/
│   ├── reader_text/
│   ├── reader_comic/
│   ├── reader_pdf/
│   ├── notes/
│   ├── backup/
│   ├── cache/
│   ├── privacy/
│   └── settings/
│
├── domain/
│   ├── entities/
│   ├── value_objects/
│   ├── repositories/
│   └── services/
│
├── infrastructure/
│   ├── database/
│   ├── filesystem/
│   ├── archive/
│   ├── parsers/
│   ├── pdf/
│   ├── cache/
│   ├── search/
│   ├── backup/
│   └── platform/
│
├── rust_core/
│   ├── crates/
│   ├── ffi/
│   └── tests/
│
├── test/
│   ├── unit/
│   ├── widget/
│   ├── integration/
│   ├── golden/
│   └── fixtures/
│
└── docs/
    ├── technical_design.md
    ├── llm_context.md
    ├── architecture_decisions.md
    ├── api_contracts/
    └── qa/
```

---

# 4. 最新 UI 对应的信息架构

## 4.1 一级导航

手机端：

```text
首页
书架
搜索
笔记
设置
```

平板 / 桌面端：

```text
侧边导航
├── 首页
├── 书架
├── 搜索
├── 笔记
└── 设置
```

说明：

- 最新 UI 将“书库”更名为“书架”，更符合产品心智。
- “搜索”不仅是搜索页，也是命令式入口的基础。
- “笔记”作为一级入口保留，强化长期阅读资产。

## 4.2 路由设计

```text
/onboarding
/home
/shelf
/search
/book/:bookId
/book/:bookId/edit
/series
/series/:seriesId
/reader/text/:bookId
/reader/comic/:bookId
/reader/pdf/:bookId
/notes
/notes/:noteId
/import
/scan
/backup
/cache
/privacy
/settings
```

## 4.3 页面与技术模块映射

| UI 页面 | 技术模块 |
|---|---|
| 首页 | HomeService / HomeController |
| 书架 | ShelfService / ShelfController |
| 搜索 | SearchService / CommandSearchController |
| 详情 | BookDetailService / MetadataService |
| 系列 | SeriesService |
| 文本阅读 | TextReaderService |
| 漫画阅读 | ComicReaderService |
| PDF 阅读 | PdfReaderService |
| 笔记 | NotesService |
| 导入扫描 | ImportScanService |
| 设置 | SettingsService |
| 备份缓存隐私 | BackupService / CacheManager / PrivacyPage |

---

# 5. 现代 Design System 技术规格

## 5.1 设计关键词

技术实现必须服务以下视觉关键词：

- 现代
- 克制
- 阅读工作台
- 低饱和
- 轻玻璃质感
- 清晰层级
- 不复古堆叠
- 不无限信息流
- 无 emoji
- 无强烈 AI 风

## 5.2 颜色 Token

### Light Theme

```dart
class AppColorsLight {
  static const bg = Color(0xFFEFF1F4);
  static const bgSecondary = Color(0xFFE7EAF0);

  static const surface = Color(0xC2FFFFFF);
  static const surfaceSolid = Color(0xFFFFFFFF);
  static const surfaceSecondary = Color(0xFFF5F6F8);

  static const ink = Color(0xFF15171A);
  static const muted = Color(0xFF717780);
  static const subtle = Color(0xFF9AA1AA);

  static const line = Color(0x1A15171A);
  static const lineStrong = Color(0x2915171A);

  static const accent = Color(0xFF3F5F86);
  static const accentWarm = Color(0xFF7D5A4E);
  static const accentSoft = Color(0xFFDFE9F5);

  static const success = Color(0xFF647A62);
  static const danger = Color(0xFF9A594F);
}
```

### Dark Theme

```dart
class AppColorsDark {
  static const bg = Color(0xFF101215);
  static const bgSecondary = Color(0xFF171A1F);

  static const surface = Color(0xC21D2025);
  static const surfaceSolid = Color(0xFF1D2025);
  static const surfaceSecondary = Color(0xFF242830);

  static const ink = Color(0xFFEEF1F4);
  static const muted = Color(0xFFA4ABB5);
  static const subtle = Color(0xFF777F8B);

  static const line = Color(0x1AFFFFFF);
  static const lineStrong = Color(0x2EFFFFFF);

  static const accent = Color(0xFF93B8DF);
  static const accentWarm = Color(0xFFD0A092);
  static const accentSoft = Color(0xFF233549);
}
```

## 5.3 圆角与阴影

```dart
class AppRadius {
  static const sm = 12.0;
  static const md = 18.0;
  static const lg = 24.0;
  static const xl = 32.0;
}
```

```dart
class AppShadows {
  static const card = [
    BoxShadow(
      color: Color(0x1A1E2734),
      blurRadius: 40,
      offset: Offset(0, 14),
    ),
  ];

  static const elevated = [
    BoxShadow(
      color: Color(0x291E2734),
      blurRadius: 90,
      offset: Offset(0, 30),
    ),
  ];
}
```

## 5.4 字体

UI 字体：

```text
系统无衬线字体
```

阅读正文：

```text
系统衬线字体优先
```

原则：

- 不内置未经授权字体。
- UI 更现代，正文保留文艺阅读感。
- 支持用户导入字体作为增强功能。

## 5.5 密度系统

最新 UI 提供“紧凑密度”切换，因此技术上需要定义 LayoutDensity：

```dart
enum LayoutDensity {
  comfortable,
  compact,
}
```

影响范围：

- 卡片内边距
- 书架间距
- 列表高度
- 工具栏高度
- 圆角大小
- 页面留白

不影响：

- 阅读正文行距，正文行距属于 ReaderSettings。
- 用户设置的阅读字号。

---

# 6. 现代 App Shell 设计

## 6.1 AppShell 组件职责

`AppShell` 是最新 UI 的全局容器，负责：

- 响应式导航
- 顶部栏
- 命令搜索入口
- 内容区域
- 底部导航
- 侧边导航
- 主题切换
- 密度切换
- 页面过渡动画

## 6.2 响应式规则

```text
compact: width < 600
medium: 600 <= width < 1000
expanded: width >= 1000
```

| 断点 | 导航 | 布局 |
|---|---|---|
| compact | 底部导航 | 单列 |
| medium | 侧边导航优先 | 双栏 |
| expanded | 侧边导航 | 多栏 |

## 6.3 AppShell 结构

```dart
class AppShell extends ConsumerWidget {
  final Widget child;
  final AppRoute activeRoute;
  final String title;
  final String subtitle;
  final List<Widget> actions;

  const AppShell({
    required this.child,
    required this.activeRoute,
    required this.title,
    required this.subtitle,
    this.actions = const [],
  });
}
```

## 6.4 顶部栏 TopBar

TopBar 包含：

- 页面标题
- 页面副标题
- Command Search 入口
- 导入按钮
- 筛选按钮

手机端：

- 可以隐藏 Command Search 大输入框。
- 搜索入口放在 icon button 或底部导航。

桌面端：

- TopBar 中间显示 Command Search。
- 右侧显示导入、筛选、视图设置。

---

# 7. 首页 Bento 技术设计

## 7.1 首页模块

最新 UI 首页由 Bento Grid 组成：

```text
Hero Continue Reading Card
Library Metrics
Recent Reading Section
```

## 7.2 HomeViewState

```dart
class HomeViewState {
  final ContinueReadingItem? continueReading;
  final LibraryMetrics metrics;
  final List<BookCardViewModel> recentReading;
  final List<BookCardViewModel> recentAdded;
  final ScanStatus? scanStatus;
}
```

## 7.3 LibraryMetrics

```dart
class LibraryMetrics {
  final int totalBooks;
  final int readingCount;
  final int seriesCount;
  final int missingFileCount;
  final DateTime? lastScanAt;
}
```

## 7.4 HomeService 合约

```text
watchHomeViewState() -> Stream<HomeViewState>
getContinueReading() -> ContinueReadingItem?
getLibraryMetrics() -> LibraryMetrics
getRecentReading(limit) -> List<Book>
getRecentAdded(limit) -> List<Book>
```

## 7.5 首页实现要求

- 首页不得变成内容推荐流。
- 最近阅读固定展示有限数量。
- 继续阅读大卡必须优先加载。
- 数据为空时展示导入引导。
- 扫描状态只作为轻量提醒，不阻塞首页。

---

# 8. 书架页技术设计：禁止无限下拉

## 8.1 设计原则

最新 UI 明确要求：

> 书架页不是无限信息流，不使用无限下拉作为主浏览方式。

书架页应采用：

- 智能书架侧栏
- 当前书架内搜索
- 分区展示
- 分页浏览
- 系列聚合
- 快速定位
- 查看全部

## 8.2 ShelfViewState

```dart
class ShelfViewState {
  final List<ShelfFilterItem> filters;
  final ShelfFilterId activeFilter;
  final List<ShelfSection> sections;
  final ShelfSort sort;
  final ShelfDisplayMode displayMode;
  final bool isLoading;
  final ShelfError? error;
}
```

## 8.3 ShelfSection

```dart
class ShelfSection {
  final String id;
  final String title;
  final String subtitle;
  final ShelfSectionType type;
  final List<ShelfItem> items;
  final int totalCount;
  final int page;
  final int pageSize;
  final bool hasNext;
  final bool hasPrevious;
}
```

## 8.4 ShelfSectionType

```dart
enum ShelfSectionType {
  continueReading,
  recentAdded,
  series,
  favorites,
  unread,
  missingFiles,
  customTag,
  format,
}
```

## 8.5 ShelfService 合约

```text
watchShelfView(filter, sort, displayMode) -> Stream<ShelfViewState>
getShelfSection(sectionId, page, pageSize) -> ShelfSection
getShelfFilters() -> List<ShelfFilterItem>
setActiveFilter(filterId)
setSort(sort)
setDisplayMode(displayMode)
searchWithinShelf(keyword, filterId) -> List<ShelfSearchResult>
```

## 8.6 分页策略

推荐分页大小：

| 平台 | pageSize |
|---|---:|
| 手机 | 12 |
| 平板 | 18 |
| 桌面 | 24 |

实现要求：

- 每个分区独立分页。
- 当前页数据加载时不影响其他分区。
- 分页切换保留当前筛选条件。
- 不一次性加载全部书籍卡片。
- 大书库使用数据库 LIMIT / OFFSET 或 cursor pagination。

## 8.7 系列聚合策略

书架默认不让每一卷都占据主空间。  
漫画和长篇系列应优先显示为 SeriesShelfCard。

```dart
class SeriesShelfCardViewModel {
  final String seriesId;
  final String title;
  final int totalVolumes;
  final int readVolumes;
  final int currentVolumeIndex;
  final double progress;
  final String? coverPath;
}
```

## 8.8 书架页验收标准

- 不出现无尽连续长网格。
- 每个分区展示固定数量。
- 最近添加有分页。
- 系列以聚合卡片展示。
- 文件丢失单独处理。
- 手机端筛选栏横向滚动，不挤压内容。
- 桌面端侧边书架固定。
- 当前书架内搜索可用。

---

# 9. Command Search 技术设计

## 9.1 定位

最新 UI 的搜索不只是搜索页，而是全局命令入口的雏形。

Command Search 支持：

- 搜书名
- 搜作者
- 搜标签
- 搜系列
- 搜正文
- 搜笔记
- 执行命令，例如“导入文件”“扫描目录”“打开设置”

## 9.2 SearchResult 类型

```dart
sealed class SearchResult {
  String get id;
  String get title;
  String get subtitle;
}

class BookSearchResult extends SearchResult {}
class ChapterSearchResult extends SearchResult {}
class NoteSearchResult extends SearchResult {}
class PdfSearchResult extends SearchResult {}
class CommandSearchResult extends SearchResult {}
```

## 9.3 SearchService 合约

```text
search(keyword, scope) -> Stream<SearchState>
searchLibrary(keyword, filters) -> List<BookSearchResult>
searchFullText(keyword) -> Stream<FullTextSearchResult>
searchNotes(keyword) -> List<NoteSearchResult>
searchCommands(keyword) -> List<CommandSearchResult>
executeCommand(commandId)
```

## 9.4 搜索 UI 状态

```text
empty
typing
loading
results
noResults
indexBuilding
error
```

## 9.5 搜索跳转要求

搜索结果必须能跳转到：

- 书籍详情
- 文本章节位置
- 漫画页
- PDF 页
- 笔记详情
- 设置页面
- 导入扫描页面

---

# 10. 阅读器 UI 技术设计

## 10.1 统一 ReaderShell

文本、漫画、PDF 阅读器共享 ReaderShell：

```dart
class ReaderShell extends ConsumerWidget {
  final Widget content;
  final ReaderTopInfo topInfo;
  final ReaderToolbarConfig toolbar;
  final ReaderMode readerMode;
}
```

ReaderShell 负责：

- 全屏沉浸
- 顶部轻量信息
- 底部 Reader Toolbar
- 工具栏显示隐藏
- 横竖屏切换
- 阅读进度保存触发
- 手势区分发

## 10.2 Reader Toolbar

最新 UI 使用现代浮层工具栏：

- 半透明背景
- 胶囊按钮
- 底部悬浮
- 自动隐藏
- 点击中部呼出

工具项：

文本：

```text
目录
搜索
字体
主题
书签
笔记
```

漫画：

```text
缩略图
单页 / 双页
方向
裁边
下一卷
```

PDF：

```text
目录
跳页
搜索
高亮
书签
批注
```

## 10.3 阅读器状态

```text
loading
ready
toolbarVisible
toolbarHidden
searching
showingToc
showingSettings
error
fileMissing
permissionLost
```

## 10.4 文本阅读器

支持：

- TXT
- EPUB
- Markdown
- HTML

技术要求：

- 文本进度使用 chapterId + characterOffset。
- 字号变化后位置稳定。
- 横竖屏切换后位置稳定。
- 文本搜索结果可跳转。
- 长按文字支持选择、摘录、笔记。

## 10.5 漫画阅读器

支持：

- CBZ
- ZIP 图片包
- 图片目录
- CBR / RAR，视支持情况

技术要求：

- 图片自然排序。
- 当前页优先加载。
- 前后页预加载。
- 双页模式正确处理封面。
- 支持从右到左。
- 支持条漫模式。
- 缩略图导航异步生成。
- 大图降采样。
- 自动裁边可关闭。

## 10.6 PDF 阅读器

技术要求：

- PDF 渲染通过 PdfAdapter 抽象。
- 支持页码跳转。
- 支持缩放。
- 支持目录。
- 支持文本搜索，若有文本层。
- 批注和高亮默认保存在本地数据库，不写回原 PDF。

---

# 11. 数据模型

## 11.1 Book

```dart
class Book {
  final String id;
  final String title;
  final String? subtitle;
  final String? author;
  final BookType type;
  final FileFormat format;
  final String filePath;
  final String? fileHash;
  final String? fileFingerprint;
  final int fileSize;
  final DateTime modifiedAt;
  final String? coverPath;
  final String? seriesId;
  final double? volumeIndex;
  final bool favorite;
  final ReadingStatus status;
  final bool userEditedMetadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? lastReadAt;
}
```

## 11.2 ShelfItem

```dart
sealed class ShelfItem {}

class BookShelfItem extends ShelfItem {
  final BookCardViewModel book;
}

class SeriesShelfItem extends ShelfItem {
  final SeriesShelfCardViewModel series;
}

class ActionShelfItem extends ShelfItem {
  final String title;
  final String actionId;
}
```

## 11.3 ReadingProgress

```dart
class ReadingProgress {
  final String id;
  final String bookId;
  final String? chapterId;
  final int? pageIndex;
  final int? characterOffset;
  final double percentage;
  final double? scrollOffset;
  final int? pdfPage;
  final int? comicPage;
  final DateTime updatedAt;
  final String? deviceInfo;
}
```

## 11.4 ReaderSettings

```dart
class ReaderSettings {
  final String? fontFamily;
  final double fontSize;
  final double lineHeight;
  final double paragraphSpacing;
  final double pageMargin;
  final ReaderTheme theme;
  final TextReaderMode textMode;
  final ComicDisplayMode comicMode;
  final ComicReadingDirection comicDirection;
  final PdfDisplayMode pdfMode;
}
```

## 11.5 AppSettings

```dart
class AppSettings {
  final AppThemeMode themeMode;
  final LayoutDensity layoutDensity;
  final bool reduceMotion;
  final bool useSystemBrightness;
  final bool enableAutoScan;
  final int cacheLimitMb;
}
```

---

# 12. 数据库表设计

必须创建：

```text
books
series
tags
book_tags
reading_progress
notes
bookmarks
scan_roots
scan_records
metadata_overrides
shelf_preferences
reader_settings
search_index
search_fts
cache_records
backup_records
app_settings
```

## 12.1 shelf_preferences

用于保存最新 UI 的书架状态：

```sql
CREATE TABLE shelf_preferences (
  id TEXT PRIMARY KEY,
  active_filter TEXT NOT NULL,
  sort TEXT NOT NULL,
  display_mode TEXT NOT NULL,
  density TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## 12.2 search_fts

```sql
CREATE VIRTUAL TABLE search_fts USING fts5(
  book_id,
  content_type,
  chapter_id,
  page_index,
  text,
  tokenize = 'unicode61'
);
```

## 12.3 关键索引

```sql
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_series ON books(series_id);
CREATE INDEX idx_books_last_read ON books(last_read_at);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_format ON books(format);
CREATE INDEX idx_progress_book ON reading_progress(book_id);
CREATE INDEX idx_notes_book ON notes(book_id);
CREATE INDEX idx_scan_records_path ON scan_records(file_path);
```

---

# 13. 文件导入与扫描技术设计

## 13.1 ImportScanService 合约

```text
pickFiles() -> List<FileAsset>
pickDirectory() -> ScanRoot
scanRoot(rootId) -> Stream<ScanEvent>
scanFiles(files) -> Stream<ImportEvent>
cancelScan(scanId)
detectMissingFiles() -> List<Book>
relocateBook(bookId, newPath) -> Result<Book>
```

## 13.2 ScanEvent

```text
ScanStarted
FileDiscovered
FileParsed
FileSkipped
FileFailed
ScanProgress
ScanCompleted
ScanCancelled
```

## 13.3 导入策略

1. 判断文件格式。
2. 检查是否支持。
3. 计算快速指纹。
4. 判断重复。
5. 提取元数据。
6. 提取封面。
7. 入库。
8. 异步生成搜索索引。
9. 异步生成缩略图和缓存。

## 13.4 UI 对接

最新 UI 的导入扫描页展示：

- 扫描状态大卡
- 新增 / 更新 / 失败指标
- 导入明细列表
- 失败项重试

因此服务层需要提供：

```dart
class ImportScanViewState {
  final ScanStatus status;
  final double progress;
  final int addedCount;
  final int updatedCount;
  final int failedCount;
  final List<ImportResultItem> items;
}
```

---

# 14. 缓存与性能设计

## 14.1 缓存类型

```text
cover_cache
comic_page_cache
comic_thumbnail_cache
pdf_page_cache
text_render_cache
search_index_cache
metadata_cache
```

## 14.2 现代 UI 下的性能重点

最新 UI 有更多现代卡片和玻璃面板，因此性能上必须注意：

- 不滥用 BackdropFilter。
- 桌面端可用玻璃效果，低端移动设备降级。
- 书架卡片分页加载。
- 首页 Bento 只加载摘要数据。
- 封面图使用缩略图，不直接加载原图。
- 漫画页与 PDF 页不要在主线程解码。

## 14.3 动态降级策略

```dart
class VisualPerformancePolicy {
  final bool enableBlur;
  final bool enableShadows;
  final bool enablePageTransition;
  final bool enableSkeletonAnimation;
}
```

触发降级条件：

- 用户开启减少动画。
- 设备性能较低。
- 页面卡顿超过阈值。
- 电量或系统设置要求降低动态效果。

---

# 15. Motion System 技术设计

## 15.1 动效原则

最新 UI 的动效应现代、轻、快，不做复古翻书动画。

推荐：

- 页面淡入 + 轻微上移
- 卡片 hover 上浮
- Reader Toolbar 淡入
- 书架分页淡入
- 搜索结果快速出现
- 扫描进度连续缓动

避免：

- 夸张弹跳
- 3D 翻书
- 粒子效果
- 强烈 AI 光效
- 长时间动画

## 15.2 Motion Token

```dart
class AppMotion {
  static const fast = Duration(milliseconds: 180);
  static const normal = Duration(milliseconds: 260);
  static const slow = Duration(milliseconds: 360);

  static const curve = Curves.easeOutCubic;
}
```

## 15.3 页面切换

```text
opacity 0 → 1
translateY 10 → 0
duration 260ms
curve easeOutCubic
```

## 15.4 书架分页

```text
旧页淡出 120ms
新页淡入 + translateY 6px 180ms
保持滚动位置在分区顶部
```

## 15.5 Reader Toolbar

```text
出现：opacity 0 → 1，translateY 12 → 0，180ms
隐藏：opacity 1 → 0，translateY 0 → 12，140ms
```

---

# 16. 平台适配

## 16.1 Android 手机

技术重点：

- SAF 文件权限。
- 底部导航。
- 音量键翻页。
- 横竖屏切换。
- 后台切回恢复阅读器状态。

## 16.2 Android 平板

技术重点：

- 侧边导航。
- 多列书架。
- 漫画横屏双页。
- 文本双栏阅读。
- 分屏适配。

## 16.3 Windows

技术重点：

- 左侧导航。
- Command Search。
- 鼠标 hover。
- 右键菜单。
- 拖拽导入。
- 高 DPI。
- 快捷键。

快捷键建议：

```text
Ctrl + K：打开 Command Search
Ctrl + O：导入文件
Ctrl + F：搜索
Ctrl + ,：设置
F11：全屏阅读
← / →：翻页
Space：下一页
Esc：关闭浮层
```

## 16.4 iOS

技术重点：

- 文件 App 集成。
- 分享菜单导入。
- 沙盒权限说明。
- 后台扫描限制处理。
- 安全区域适配。

## 16.5 iPadOS

技术重点：

- 侧边导航。
- 分屏。
- 键盘快捷键。
- 漫画双页。
- PDF 批注。
- Apple Pencil 批注可作为增强项。

---

# 17. 完整实施计划

本项目继续采用完整 V1 策略，不退回 MVP。

## 阶段 0：上下文冻结

目标：让所有 LLM Agent 读取最新 V4 Modern UI 规范。

任务：

- 写入本技术文档。
- 写入现代 UI 原型说明。
- 更新 `docs/llm_context.md`。
- 标记旧版纸感 UI 为 deprecated。
- 明确书架禁止无限下拉。
- 创建架构决策记录。

验收：

- LLM 上下文中明确 V4 Modern 是最新 UI。
- 不再生成旧版复古纸感页面。
- 不再生成无限滚动书库。

---

## 阶段 1：工程框架与现代 Design System

任务：

- 创建 Flutter 工程。
- 接入 Riverpod。
- 接入 go_router。
- 定义 Theme Token。
- 定义 Density Token。
- 定义 Motion Token。
- 实现 AppShell。
- 实现 TopBar。
- 实现底部导航。
- 实现侧边导航。
- 实现 Modern Card、Chip、Button、Command Input。
- 实现日间 / 夜读 / 紧凑密度切换。

验收：

- 手机显示底部导航。
- 平板和桌面显示侧边导航。
- 首页能在三个断点正常展示。
- 主题切换可用。
- 密度切换可用。

---

## 阶段 2：数据库与领域模型

任务：

- 创建 drift 数据库。
- 创建所有核心表。
- 创建实体模型。
- 创建 Repository。
- 创建数据库迁移。
- 创建 seed 数据。
- 创建测试 fixture。

验收：

- Book 可增删改查。
- ReadingProgress 可保存。
- ShelfPreference 可保存。
- AppSettings 可保存。
- 重启后状态保留。

---

## 阶段 3：首页 Bento 与书架数据服务

任务：

- 实现 HomeService。
- 实现 HomeViewState。
- 实现 LibraryMetrics。
- 实现 ShelfService。
- 实现 ShelfSection。
- 实现分区分页接口。
- 实现系列聚合卡片数据。
- 实现书架筛选状态保存。

验收：

- 首页 Bento 正确显示。
- 继续阅读大卡可用。
- 书架分区固定展示。
- 最近添加分页可切换。
- 不一次性加载全量书籍。
- 手机书架筛选横向滚动。
- 桌面书架侧栏固定。

---

## 阶段 4：导入扫描与元数据

任务：

- 文件选择。
- 目录选择。
- Windows 拖拽。
- iOS 分享导入。
- 文件格式识别。
- 快速指纹。
- 重复检测。
- 元数据提取。
- 封面提取。
- 导入结果页。
- 文件丢失处理。

验收：

- 可导入多种文件。
- 可扫描目录。
- 导入失败有明细。
- 文件丢失可处理。
- 原始文件不被移动或删除。

---

## 阶段 5：书籍详情、标签、系列

任务：

- 书籍详情页。
- 元数据编辑。
- 标签管理。
- 系列列表。
- 系列详情。
- 卷序调整。
- 系列继续阅读。

验收：

- 元数据可编辑。
- 手动编辑不被覆盖。
- 标签可增删改。
- 系列可聚合。
- 下一卷可跳转。

---

## 阶段 6：Command Search 与全文索引

任务：

- 实现 Command Search UI。
- 实现书库搜索。
- 实现命令搜索。
- 实现 TXT / EPUB / Markdown / HTML 索引。
- 实现 PDF 文本层索引。
- 实现笔记索引。
- 实现搜索结果跳转。

验收：

- Ctrl + K 可打开搜索，桌面端。
- 搜索书名可返回。
- 搜索正文可返回上下文。
- 搜索结果可跳转。
- 索引构建不阻塞阅读。

---

## 阶段 7：文本阅读器

任务：

- TXT 打开。
- 编码识别。
- EPUB 打开。
- Markdown 渲染。
- HTML 渲染。
- 文本分页。
- 滚动模式。
- 阅读设置。
- 目录。
- 搜索。
- 书签。
- 笔记。
- 阅读进度保存。

验收：

- 字号变化后位置稳定。
- 横竖屏切换后位置稳定。
- Reader Toolbar 可隐藏。
- 笔记和书签可跳转。

---

## 阶段 8：漫画阅读器

任务：

- CBZ。
- ZIP 图片包。
- 图片目录。
- CBR / RAR 能力评估。
- 图片自然排序。
- 单页。
- 双页。
- 条漫。
- 从右到左。
- 缩略图。
- 裁边。
- 下一卷。
- 大图降采样。

验收：

- 500MB 漫画可打开。
- 双页显示正确。
- 条漫连续。
- 大图不崩溃。
- 缩略图可跳页。

---

## 阶段 9：PDF 阅读器

任务：

- PdfAdapter。
- PDF 打开。
- 缩放。
- 页码跳转。
- 目录。
- 搜索。
- 高亮。
- 批注。
- 书签。
- 加密 PDF 提示。

验收：

- 普通 PDF 可打开。
- 目录可跳转。
- 搜索可用。
- 批注本地保存。
- 加密 PDF 不崩溃。

---

## 阶段 10：笔记、备份、缓存、隐私

任务：

- 笔记列表。
- 笔记详情。
- 摘录。
- PDF 批注列表。
- 漫画页备注。
- Markdown 导出。
- JSON 导出。
- 备份导出。
- 备份导入。
- 缓存管理。
- 隐私说明。

验收：

- 笔记可跳回原文。
- 备份跨平台导入。
- 清理缓存不影响原文件。
- 隐私说明明确默认不上传。

---

## 阶段 11：跨端适配与性能

任务：

- Android 权限。
- Windows 拖拽和快捷键。
- iOS 文件 App。
- iPadOS 分屏。
- 高 DPI。
- 低性能设备视觉降级。
- 大书库测试。
- 大文件测试。
- Golden Test。

验收：

- 五个平台主流程可用。
- 10,000 本书架可管理。
- 500MB 漫画可打开。
- 2GB PDF 可逐页加载。
- UI 不因玻璃效果明显卡顿。

---

# 18. LLM 执行规则

## 18.1 每次任务前必须确认

LLM 在实现任何模块前，必须输出：

```text
当前模块：
关联 UI：
依赖服务：
涉及数据表：
涉及路由：
是否影响 AppShell：
是否影响书架分页：
测试方式：
风险：
```

## 18.2 UI Agent 禁止事项

不得：

- 重新改回复古纸感主视觉。
- 给书架做无限下拉。
- 使用 emoji。
- 使用强烈 AI 风背景。
- 使用高饱和荧光色。
- 在阅读页放广告。
- 新增登录入口。

## 18.3 架构 Agent 审查重点

必须检查：

- 页面是否包含业务逻辑。
- 书架是否分页。
- 首页是否只加载摘要。
- 搜索是否有索引策略。
- 阅读进度是否稳定。
- 是否有错误处理。
- 是否破坏本地优先原则。

---

# 19. 测试计划

## 19.1 Unit Test

覆盖：

- ShelfService 分页
- ShelfSection 查询
- Series 聚合
- SearchService
- MetadataService
- ReadingProgress
- BackupService
- ReaderSettings
- AppSettings
- FileFormatDetector

## 19.2 Widget Test

覆盖：

- AppShell compact / medium / expanded
- Home Bento
- Shelf 分区分页
- Command Search
- Book Detail
- Reader Toolbar
- Settings Theme / Density
- EmptyState
- ErrorState

## 19.3 Golden Test

必须覆盖：

- 首页日间主题
- 首页夜读主题
- 书架日间主题
- 书架夜读主题
- 文本阅读页
- 漫画阅读页
- PDF 阅读页
- 手机 / 平板 / 桌面三断点

## 19.4 Integration Test

核心流程：

```text
首次打开 → 导入文件 → 进入书架 → 打开阅读 → 保存进度 → 重启 → 继续阅读
```

```text
扫描目录 → 生成系列 → 进入系列 → 打开漫画 → 双页 → 下一卷
```

```text
打开搜索 → 搜正文 → 跳转文本位置 → 添加笔记 → 笔记页查看
```

```text
导出备份 → 清除数据 → 导入备份 → 恢复书架与进度
```

---

# 20. 技术验收标准

## 20.1 UI 验收

- 最新 UI 为现代工作台风格。
- 首页为 Bento 概览。
- 书架不使用无限下拉。
- 书架支持分区分页。
- 侧边导航和底部导航适配正确。
- 日间 / 夜读主题可用。
- 紧凑密度可用。
- Reader Toolbar 现代浮层可用。
- 无 emoji。
- 无强烈 AI 风。

## 20.2 功能验收

- 可导入文件。
- 可扫描目录。
- 可统一管理文本、漫画、PDF。
- 可保存阅读进度。
- 可添加标签、收藏、书签、笔记。
- 可搜索书库和正文。
- 可导出和导入备份。
- 可清理缓存。
- 可处理文件丢失。

## 20.3 性能验收

- 首页首屏不阻塞。
- 书架不一次性渲染全量数据。
- 10,000 本书可管理。
- 500MB 漫画可打开。
- 大 PDF 可逐页加载。
- 玻璃效果可降级。
- 搜索索引后台构建。

## 20.4 安全与隐私验收

- 无登录系统。
- 无默认上传。
- 无默认删除原始文件。
- 清除数据有二次确认。
- 备份说明清楚。
- 权限失效有可理解提示。

---

# 21. 最终交付定义

V1 完成时，必须具备：

1. 最新现代 UI 已实现。
2. 首页、书架、搜索、详情、系列、阅读器、笔记、导入、设置完整。
3. 书架采用分区分页，不是无限下拉。
4. 手机、平板、桌面布局一致但不机械拉伸。
5. Android、iOS、iPadOS、Windows 主流程可用。
6. TXT、EPUB、Markdown、HTML、PDF、CBZ、ZIP 图片包、图片目录可读。
7. CBR / RAR 根据技术可行性支持或明确降级。
8. 阅读进度、标签、收藏、笔记稳定保存。
9. 数据可备份和迁移。
10. 核心测试通过。
11. UI 风格符合现代、克制、本地阅读工作台定位。

---

# 22. LLM 优先实施顺序

```text
1. 更新 LLM 上下文为 V4 Modern UI
2. AppShell + Design System + Theme/Density
3. 数据库与领域模型
4. Home Bento
5. Shelf 分区分页
6. Import / Scan
7. Metadata / Series / Tags
8. Command Search
9. Text Reader
10. Comic Reader
11. PDF Reader
12. Notes
13. Backup / Cache / Privacy
14. Cross-platform adaptation
15. Performance / Tests / Release Candidate
```

任何 LLM Agent 若偏离此顺序，必须说明原因和影响范围。

---
