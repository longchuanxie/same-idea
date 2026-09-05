# AGENTS.md — 墨韵 (MoYun) 本地阅读器

> 本文件为 AI Agent 提供项目上下文、编码规范和执行约束。任何 Agent 在本项目中执行任务前必须阅读并遵守本文件。

---

## 1. 项目概述

**产品名称**：墨韵 (MoYun) / 本地阅读器
**产品定位**：无需登录、本地优先、跨端一致的文本/漫画/PDF 阅读工作台
**目标平台**：Android 手机、Android 平板、iOS、iPadOS、Windows
**当前阶段**：设计/规划阶段 → 进入 Flutter 工程实现

### 核心原则

- 默认不上传用户文件
- 默认不删除/移动/改写用户原始文件
- 无登录注册、无在线书源、无推荐流
- 书架禁止无限下拉，采用分区分页

### 支持格式

TXT、EPUB、Markdown、HTML、PDF、CBZ、ZIP 图片包、图片目录、CBR/RAR（视技术可行性）

---

## 2. 技术栈

| 层级 | 方案 |
|---|---|
| 跨端 UI | Flutter |
| 状态管理 | Riverpod |
| 路由 | go_router |
| 数据库 | drift + SQLite |
| 全文搜索 | SQLite FTS5 |
| 文件选择 | file_picker + 平台桥接 |
| PDF | PdfAdapter 抽象层 |
| 性能核心 | Rust Core（分阶段引入） |
| 测试 | Unit / Widget / Integration / Golden |

> **注意**：早期文档（`.trae/documents/technical-architecture.md`）中记录的 React + Capacitor 方案已被废弃，以 Flutter 方案为准。

---

## 3. 项目结构

### 3.1 当前目录

```
book-reader/
├── .trae/documents/          # 产品需求文档 + 早期架构文档（已废弃）
└── docs/
    ├── 本地阅读器_原型UI_现代化改版/
    │   └── local_reader_ui_prototype_v4_modern/   # 可交互 HTML 原型
    │       ├── index.html
    │       ├── app.js
    │       ├── styles.css
    │       └── 现代化改版说明.md
    └── 本地阅读器_技术设计文档_现代UI版/          # 最新技术设计文档
        ├── 本地阅读器_技术设计文档_现代UI版.md     # 主文档（V2.0，1857 行）
        ├── 现代UI技术验收清单.md
        └── modern_ui_implementation_plan_llm.json  # LLM 执行计划
```

### 3.2 规划中的 Flutter 工程结构

```
local_reader/
├── app/                    # 应用入口、路由、环境
├── design_system/          # Design Token、主题、组件、响应式
│   ├── tokens/             # 颜色、间距、圆角、字体、动效
│   ├── theme/              # 亮色/暗色/密度主题
│   ├── components/         # 通用组件（Shell、卡片、按钮、面板等）
│   └── responsive/         # 断点、自适应布局、密度
├── features/               # 功能模块
│   ├── onboarding/         # 引导
│   ├── home/               # Bento 首页
│   ├── shelf/              # 分区分页书架
│   ├── search/             # Command Search
│   ├── import_scan/        # 导入扫描
│   ├── metadata/           # 元数据管理
│   ├── series/             # 系列聚合
│   ├── reader_text/        # 文本阅读器
│   ├── reader_comic/       # 漫画阅读器
│   ├── reader_pdf/         # PDF 阅读器
│   ├── notes/              # 笔记
│   ├── backup/             # 备份
│   ├── cache/              # 缓存
│   ├── privacy/            # 隐私
│   └── settings/           # 设置
├── domain/                 # 领域模型、仓储接口
│   ├── entities/
│   ├── value_objects/
│   ├── repositories/
│   └── services/
├── infrastructure/         # 数据库、文件系统、解析器、缓存
│   ├── database/
│   ├── filesystem/
│   ├── parsers/
│   ├── pdf/
│   ├── search/
│   └── platform/
├── rust_core/              # Rust 性能核心（分阶段引入）
└── test/                   # 单元/Widget/集成/Golden 测试
```

---

## 4. 不可违反的规则（Non-Negotiables）

以下规则在任何情况下都不可违反：

1. **UI 基准**：以 V4 Modern UI 为最新 UI 基准，禁止回退到复古纸感主视觉
2. **书架分页**：书架页禁止无限下拉，必须采用分区分页
3. **无账号体系**：禁止登录注册账号体系
4. **无在线内容**：禁止在线书源、在线书城、爬虫、推荐流
5. **本地优先**：默认不上传用户文件
6. **文件安全**：默认不删除、不移动、不改写用户原始文件
7. **风格克制**：无 emoji，无强烈 AI 风，无荧光渐变，无过度拟物
8. **分层架构**：业务逻辑不得写入 Widget

---

## 5. 架构与编码规范

### 5.1 分层依赖方向（必须遵守）

```
Page / Widget
  → Controller / ViewModel
    → Service
      → Repository / Adapter
        → Database / FileSystem
```

**禁止**：
- ShelfPage 直接扫描目录
- ReaderPage 直接写 SQLite
- BookCard 直接解析 EPUB
- SearchPage 直接遍历文件系统

### 5.2 数据访问规则

- 数据读写必须通过 Repository
- 文件访问必须通过 Adapter
- 阅读器通过 ReaderService
- 书架通过 ShelfService
- 搜索通过 SearchService

### 5.3 UI 组件规范

- 使用 Design System 中定义的 Token（颜色、间距、圆角、字体、动效）
- 不在组件中硬编码颜色值或尺寸
- 响应式布局遵循三断点：compact（手机）、medium（平板）、expanded（桌面）
- 主题切换：日间 / 夜读 / 紧凑密度
- 动效克制：淡入 + 轻微上移，避免夸张弹跳/3D 翻书/粒子效果

### 5.4 书架数据加载

- 必须使用分页或游标查询，不一次性加载全量
- 封面使用缩略图
- 系列使用聚合卡片

### 5.5 阅读器规范

- 字号变化后阅读位置必须稳定
- PDF 批注默认不写回原文件
- 漫画页异步解码
- PDF 逐页加载

### 5.6 禁止魔法数

- 代码中不得出现未命名的硬编码数字或字符串常量
- 所有数值常量必须提取为具名常量或 Design Token，语义清晰可读

**错误示例**：
```dart
// 禁止：数字含义不明
Container(padding: EdgeInsets.all(16))
if (items.length > 20) { ... }
Future.delayed(Duration(milliseconds: 300))
```

**正确示例**：
```dart
// 提取为具名常量
static const double shelfItemPadding = AppSpacing.md;
static const int shelfPageSize = 20;
static const Duration fadeTransitionDuration = AppMotion.durationMedium;

Container(padding: EdgeInsets.all(shelfItemPadding))
if (items.length > shelfPageSize) { ... }
Future.delayed(fadeTransitionDuration)
```

- 例外：`0`、`1`、`-1` 等自明数值无需提取；Dart/Flutter 框架要求的惯用写法（如 `flex: 1`）无需提取

### 5.7 禁止占位内容

- 禁止在代码中保留占位文本、假数据、TODO 样式的临时代码
- 禁止使用 `Lorem ipsum`、`placeholder`、`TODO: replace`、`fake data` 等占位内容
- 禁止提交仅用于演示的硬编码假数据列表
- 如果某功能的数据源尚未实现，应使用空状态（EmptyState）组件或加载状态，而非填充假数据

**禁止**：
```dart
// 禁止：假数据
final books = ['书名1', '书名2', '书名3'];
Text('这里是占位文字');
// TODO: 后续替换为真实数据
```

**正确**：
```dart
// 使用真实数据源或空状态
final books = ref.watch(shelfProvider);
if (books.isEmpty) return const EmptyState();
```

### 5.8 编码后必须执行 Lint

- 每次编码完成后，必须执行 `flutter analyze` 检查并修复所有 lint 错误和警告
- 不允许提交存在 lint error 或 lint warning 的代码
- 如果 lint 规则与业务需求冲突，应通过 `// ignore:` 注释显式忽略并注明原因，而非全局禁用规则

```bash
# 编码完成后必须执行
flutter analyze

# 如有错误必须修复后才能继续
```

---

## 6. 关键文档索引

Agent 在执行任务前应先阅读相关文档：

| 文档 | 路径 | 用途 |
|---|---|---|
| 产品需求文档 | `.trae/documents/prd.md` | 产品功能规格、UI 设计规范 |
| 技术设计文档（最新） | `docs/本地阅读器_技术设计文档_现代UI版/本地阅读器_技术设计文档_现代UI版.md` | **主要技术依据**，22 章节完整规格 |
| 技术验收清单 | `docs/本地阅读器_技术设计文档_现代UI版/现代UI技术验收清单.md` | 交付验收标准 |
| LLM 执行计划 | `docs/本地阅读器_技术设计文档_现代UI版/modern_ui_implementation_plan_llm.json` | 12 阶段实施计划 |
| UI 改版说明 | `docs/本地阅读器_原型UI_现代化改版/local_reader_ui_prototype_v4_modern/现代化改版说明.md` | V4 Modern UI 变更说明 |
| 可交互原型 | `docs/本地阅读器_原型UI_现代化改版/local_reader_ui_prototype_v4_modern/` | HTML 原型（18 个页面） |
| 早期架构文档 | `.trae/documents/technical-architecture.md` | **已废弃**，仅供参考历史 |

> **冲突处理**：当文档间存在冲突时，以技术设计文档 V2.0 为准。

---

## 7. 实施阶段顺序

Agent 必须按以下顺序推进，若偏离需说明原因和影响范围：

| 阶段 | 名称 | 核心任务 |
|---|---|---|
| 0 | 上下文冻结 | 标记 V4 Modern UI 为最新基准，废弃旧纸感 UI |
| 1 | 工程框架与 Design System | Flutter 工程、Riverpod、go_router、Theme/Density/Motion Token、AppShell |
| 2 | 数据库与领域模型 | books、series、tags、reading_progress、notes、shelf_preferences 等表 |
| 3 | 首页 Bento 与书架数据服务 | HomeService、ShelfService、分页查询、系列聚合 |
| 4 | 导入扫描与元数据 | 文件选择、目录扫描、格式识别、重复检测、元数据提取 |
| 5 | 详情、标签、系列 | 书籍详情、元数据编辑、标签管理、系列列表、卷序调整 |
| 6 | Command Search 与全文索引 | Command UI、书库搜索、正文索引、笔记索引 |
| 7 | 文本阅读器 | TXT/EPUB/MD/HTML、分页/滚动、目录、搜索、书签、笔记 |
| 8 | 漫画阅读器 | CBZ/ZIP/图片目录、单页/双页/条漫、缩略图、裁边 |
| 9 | PDF 阅读器 | PdfAdapter、缩放、目录、搜索、高亮、批注、书签 |
| 10 | 笔记、备份、缓存、隐私 | 笔记列表/导出、备份、缓存清理、隐私说明 |
| 11 | 跨端适配与性能 | Android SAF、Windows 拖拽、iOS 文件 App、iPadOS 分屏、性能测试 |

---

## 8. 路由设计

```
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

---

## 9. 测试要求

### Unit Test

覆盖 ShelfService 分页、SearchService、MetadataService、ReadingProgress、BackupService、ReaderSettings、FileFormatDetector 等。

### Widget Test

覆盖 AppShell 三断点、Home Bento、Shelf 分区分页、Command Search、Book Detail、Reader Toolbar、Settings Theme/Density、EmptyState、ErrorState。

### Golden Test

必须覆盖首页/书架/阅读页在日间/夜读主题和手机/平板/桌面三断点下的截图对比。

### Integration Test

核心流程：
- 首次打开 → 导入文件 → 进入书架 → 打开阅读 → 保存进度 → 重启 → 继续阅读
- 扫描目录 → 生成系列 → 进入系列 → 打开漫画 → 双页 → 下一卷
- 打开搜索 → 搜正文 → 跳转文本位置 → 添加笔记 → 笔记页查看
- 导出备份 → 清除数据 → 导入备份 → 恢复书架与进度

---

## 10. 性能目标

- 首页首屏不阻塞
- 书架不一次性渲染全量数据
- 10,000 本书可管理
- 500MB 漫画可打开
- 大 PDF 可逐页加载
- 玻璃效果可降级
- 搜索索引后台构建

---

## 11. V1 不做范围

- 登录注册、手机号绑定、第三方授权
- 在线书城、在线漫画源、内容推荐流、社区
- 云账号同步
- DRM 解密
- 阅读页广告
- 默认上传用户文件

---

## 12. Agent 执行检查清单

每次提交代码或完成阶段任务时，Agent 应自查：

- [ ] 是否违反了不可违反规则？
- [ ] UI 是否以 V4 Modern UI 为基准？
- [ ] 业务逻辑是否写入了 Widget？
- [ ] 书架是否使用了无限下拉？
- [ ] 数据访问是否通过 Repository/Adapter？
- [ ] 是否使用了 Design Token 而非硬编码值？
- [ ] 代码中是否存在魔法数（未命名的硬编码常量）？
- [ ] 代码中是否存在占位内容（假数据、placeholder、TODO 临时代码）？
- [ ] 是否执行了 `flutter analyze` 并修复了所有 lint 错误和警告？
- [ ] 是否遵循了当前实施阶段的顺序？
- [ ] 是否有 emoji 或强烈 AI 风？
- [ ] 是否默认上传/删除/改写了用户文件？
- [ ] 新增功能是否有对应测试？
