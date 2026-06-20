# Kuro Reader 项目现状梳理

## 一、项目概述

**Kuro Reader** 是一款专注于本地漫画阅读体验的跨平台应用，支持 Web 和 Android 部署。采用 Material Design 3 设计体系，提供沉浸式阅读体验和流畅的交互动画。

- **应用 ID**: `com.kuro.reader`
- **版本**: `0.0.0`（package.json）/ `1.0.0`（config 常量）
- **开源协议**: MIT License

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
| HTTP 客户端 | Axios | 1.16 |
| FTP 客户端 | basic-ftp | 6.0 |
| 测试 | Vitest + Testing Library | 4.1 |

---

## 三、项目结构

```
kuro-reader/
├── android/                    # Android 原生工程（Capacitor 生成）
│   └── app/src/main/java/
│       ├── com/getcapacitor/myapp/   # Capacitor 默认 MainActivity
│       └── com/kuro/reader/          # 自定义原生代码
│           ├── MainActivity.java     # 自定义主 Activity
│           └── FilePickerPlugin.java # 文件选择器原生插件
├── public/
│   ├── icon.svg
│   └── manifest.json
├── screenshots/                # 应用截图
├── scripts/
│   └── generate-splash.cjs     # 闪屏生成脚本
├── server/
│   └── ftpProxy.ts             # Vite 开发服务器 FTP 代理中间件
├── src/
│   ├── components/             # 组件层（Atomic Design）
│   │   ├── atoms/              # 原子组件：BottomNavBar, TopAppBar, Collapsible
│   │   ├── molecules/          # 分子组件：ComicEditDialog, ConfirmDialog, FullscreenViewer, ReaderBottomBar, SubLibraryMenu
│   │   ├── organisms/          # 有机体组件：GestureLock
│   │   └── layouts/            # 布局组件：MainLayout, PageTransition, AuthGuard
│   ├── constants/              # 常量与配置
│   │   ├── config.ts           # 应用配置（支持格式、认证参数等）
│   │   ├── routes.ts           # 路由定义与路径辅助函数
│   │   └── storage.ts          # localStorage 键名常量
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useSafeArea.ts      # 安全区适配
│   │   ├── useSmoothScroll.ts  # 平滑滚动
│   │   └── useStatusBar.ts     # 状态栏控制
│   ├── pages/                  # 页面组件（14 个）
│   │   ├── Home/               # 首页（继续阅读 + 收藏）
│   │   ├── Library/            # 书库
│   │   ├── SubLibrary/         # 子书库
│   │   ├── ComicDetail/        # 漫画详情
│   │   ├── Reader/             # 阅读器（核心页面，~1700 行）
│   │   ├── Import/             # 导入
│   │   ├── CustomCloud/        # 云端来源配置
│   │   ├── Settings/           # 设置
│   │   ├── Stats/              # 阅读统计
│   │   ├── Profile/            # 个人资料
│   │   ├── Search/             # 搜索
│   │   ├── Tags/               # 标签管理
│   │   ├── Batch/              # 批量操作
│   │   └── Auth/               # 手势认证
│   ├── plugins/
│   │   └── FilePickerPlugin.ts # Capacitor 文件选择器插件前端封装
│   ├── services/               # 服务层
│   │   ├── parsers/            # 书籍解析器（策略模式）
│   │   │   ├── index.ts        # Parser 注册与分发
│   │   │   ├── types.ts        # BookParser 接口、ParsedBook 联合类型
│   │   │   └── comicArchiveParser.ts  # 漫画压缩包解析器适配器
│   │   ├── storage/            # 存储仓库层（新架构）
│   │   │   ├── db.ts           # IndexedDB 连接管理（v3）
│   │   │   ├── comicRepo.ts    # 漫画 CRUD
│   │   │   ├── pageRepo.ts     # 页面 Blob CRUD
│   │   │   └── bookFileRepo.ts # PDF 原始文件存储（Phase 3 预留桩）
│   │   ├── archiveParser.ts    # 压缩包解析核心逻辑
│   │   ├── cloudStorage.ts     # 云存储客户端（WebDAV/FTP 工厂）
│   │   ├── ftpClient.ts        # FTP 客户端（HTTP 代理模式）
│   │   ├── fileTransfer.ts     # 统一文件下载服务（Web/Native）
│   │   ├── gestureAuth.ts      # 手势认证（SHA-256 + 盐值 + 时序安全比较）
│   │   └── storageService.ts   # 存储服务（旧版，与 db.ts 存在重复）
│   ├── stores/                 # Zustand 状态管理
│   │   ├── useAppStore.ts      # 应用全局状态（主题、设置、认证）
│   │   ├── useLibraryStore.ts  # 书库状态（漫画、子书库、标签、进度）
│   │   ├── useReaderStore.ts   # 阅读器状态（页面加载、预加载、缓存）
│   │   └── useStatsStore.ts    # 阅读统计状态
│   ├── types/
│   │   └── index.ts            # 全局类型定义
│   ├── utils/
│   │   ├── capacitor.ts        # 平台检测
│   │   ├── cn.ts               # clsx + tailwind-merge
│   │   ├── extractTitle.ts     # 文件名标题提取
│   │   ├── fileType.ts         # 文件类型判断
│   │   └── paperTexture.ts     # 纸张纹理配置
│   ├── test/                   # 测试配置
│   ├── App.tsx                 # 应用入口（路由 + 主题 + 字体设置）
│   ├── main.tsx                # React 挂载点
│   └── index.css               # 全局样式 + 动画系统
├── capacitor.config.json       # Capacitor 配置
├── vite.config.ts              # Vite 配置（含 FTP 代理插件）
├── vitest.config.ts            # 测试配置
├── tailwind.config.js          # Tailwind 配置
└── package.json
```

---

## 四、功能模块详解

### 4.1 核心阅读器

阅读器是项目最核心的模块，位于 [Reader/index.tsx](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/pages/Reader/index.tsx)，约 1700 行代码。

**阅读模式**:
- **条漫模式（vertical）**: 垂直连续滚动，支持动态 prepend/append 页面、IntersectionObserver 懒加载、滚动位置恢复
- **页漫模式（horizontal）**: 左右翻页，支持单击区域翻页、滑动手势翻页、双页布局

**交互功能**:
- 单击中间区域切换 UI 覆盖层
- 双击缩放（2x，以点击位置为原点）
- 长按打开底部设置栏
- 滑动翻页（可关闭）
- 键盘方向键翻页
- 进度条拖拽跳页
- 全屏查看器（长按图片触发）
- 章节末尾提示与下一章跳转
- 章节目录侧边栏

**性能优化**:
- 页面预加载（当前页前后各 10 页）
- 优先加载半径（当前页前后各 3 页同步加载）
- 条漫模式虚拟窗口渲染（仅渲染可视范围 + 缓冲区）
- Object URL 生命周期管理（离开阅读器时 revoke）
- 漫画章节缓存（comicCache）

**纸张模式**:
- 6 种纸张类型：coated / rice / kraft / newsprint / matte / eink
- 可调纹理强度
- 亮度与色温滤镜

### 4.2 书库管理

通过 [useLibraryStore](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/stores/useLibraryStore.ts) 管理：

- **漫画 CRUD**: 导入、删除、编辑（标题/作者/描述/状态/标签）、收藏
- **子书库**: 创建、重命名、删除、添加/移除漫画
- **标签系统**: 创建、更新、删除标签，为漫画添加/移除标签
- **阅读进度**: 自动保存与恢复（localStorage 持久化）
- **批量操作**: 批量删除、批量标记已读
- **批量导入**: 文件夹导入自动创建子书库

### 4.3 文件导入

支持两种导入方式：

1. **本地文件导入** ([Import](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/pages/Import/index.tsx)):
   - 单个压缩包导入（ZIP/CBZ/RAR/CBR）
   - 散图文件夹导入
   - 文件夹批量导入（自动创建子书库）
   - 大文件流式解析（>50MB 自动切换）

2. **云端导入** ([CustomCloud](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/pages/CustomCloud/index.tsx)):
   - WebDAV / NAS 协议浏览与下载
   - FTP 协议浏览与下载（通过 HTTP 代理）

### 4.4 压缩包解析

[archiveParser.ts](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/services/archiveParser.ts) 核心逻辑：

- **双引擎策略**: ZIP/CBZ 优先使用 JSZip，失败回退 libarchive.js；RAR/CBR 直接使用 libarchive.js
- **流式解析**: 大文件逐页提取并回调保存，避免内存峰值
- **超时保护**: 根据文件大小动态计算超时（基础 30s + 每MB 200ms）
- **文件大小限制**: 最大 2GB
- **自然排序**: 图片按文件名自然排序（数字感知）

**Parser 策略模式** ([parsers/](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/services/parsers)):
- `BookParser` 接口定义 `canParse` / `parse` / `parseStreaming`
- `ComicArchiveParser` 适配现有解析逻辑
- 预留 `PdfParser`（Phase 4）

### 4.5 数据存储

**IndexedDB** (v3)，5 个 Object Store：

| Store | KeyPath | 用途 |
|-------|---------|------|
| `comics` | `id` | 漫画元数据 |
| `pages` | 手动 key (`comicId/chapterId/pageIndex`) | 页面图片 Blob |
| `covers` | 手动 key (`comicId`) | 封面图片 Blob |
| `sublibraries` | `id` | 子书库 |
| `tags` | `id` | 标签 |

**存储层架构问题**: 存在两套存储实现：
- `storageService.ts` — 旧版，使用 `Record<string, unknown>` 类型
- `storage/db.ts` + `comicRepo.ts` + `pageRepo.ts` + `bookFileRepo.ts` — 新版，使用强类型

当前 `useLibraryStore` 仍使用旧版 `storageService.ts`，新版 repo 层尚未被主流程消费。

**预留**: `bookFileRepo` 为 Phase 3 的 PDF 原始文件存储预留（DB v4 升级时创建 `bookFiles` store）。

### 4.6 认证系统

[gestureAuth.ts](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/services/gestureAuth.ts) + [GestureLock](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/components/organisms/GestureLock.tsx):

- 手势密码（3x3 九宫格，最少 4 点）
- SHA-256 + 随机盐值哈希
- 时序安全比较（防侧信道攻击）
- 失败计数与临时锁定（超限后锁定 30s）
- 自动锁定超时（1/3/5/15/30 分钟可选）
- [AuthGuard](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/components/layouts/AuthGuard.tsx) 布局守卫

### 4.7 云存储

[cloudStorage.ts](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/services/cloudStorage.ts) 工厂模式：

- **WebDAVClient**: PROPFIND 列目录 + GET 下载
- **FTPClient**: 通过 HTTP 代理转发 FTP 命令（浏览器无法直接 FTP）
  - 开发环境：Vite 中间件 `/api/ftp` 代理
  - 生产环境：`VITE_FTP_PROXY_URL` 环境变量配置代理地址

### 4.8 阅读统计

[useStatsStore](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/stores/useStatsStore.ts):

- 总阅读时长
- 当前/最长连续阅读天数
- 近 7 天每日阅读时长
- 阅读会话记录（每分钟采样）
- 数据持久化到 localStorage

### 4.9 设置与数据管理

[Settings](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/pages/Settings/index.tsx):

- 主题切换（浅色/深色/跟随系统）
- 纸张模式与类型/强度
- 阅读方向（RTL/LTR）
- 滑动翻页开关
- 字体与字号
- 应用锁配置
- 存储用量查看
- 数据备份导出/导入（JSON 格式）

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
| `/comic/:id` | ComicDetail | 无 | 独立 |
| `/reader/:comicId/:chapterId?` | Reader | 无 | 独立 |
| `/import/custom-cloud` | CustomCloud | 无 | 独立 |
| `/tags` | Tags | 无 | 独立 |
| `/auth` | Auth | 无 | 独立 |

底部导航栏 4 个 Tab: Home / Library / Import / Settings

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
- **Body**: Literata (默认) / Inter (可选)
- **Label**: Inter
- **Icon**: Material Symbols Outlined

### 6.3 动画系统

完整的纯 CSS 动画系统，统一使用 `cubic-bezier(0.16, 1, 0.3, 1)` (MD3 emphasized easing)：
- 入场动画：fadeIn / scaleIn / slideUp / slideDown / slideInRight / slideInLeft / staggerFadeIn
- 页面过渡：pageEnter / pageExit
- 交互反馈：cardHover / press / shimmer / pulseSoft / shake / ripple
- 阅读器专用：fullscreenEnter / pageFade
- 展开/折叠：expand / collapse
- Toggle 弹簧缓动

---

## 七、测试现状

| 测试文件 | 覆盖范围 |
|----------|----------|
| `smoke.test.ts` | 基础冒烟测试 |
| `comicArchiveParser.test.ts` | 压缩包解析器 |
| `parsers/index.test.ts` | Parser 分发逻辑 |
| `parsers/types.test.ts` | 类型定义测试 |
| `comicRepo.test.ts` | 漫画仓库 CRUD |
| `pageRepo.test.ts` | 页面仓库 CRUD |
| `bookFileRepo.test.ts` | PDF 文件仓库桩测试 |
| `types/index.test.ts` | 类型守卫测试 |
| `extractTitle.test.ts` | 标题提取 |
| `fileType.test.ts` | 文件类型判断 |

测试使用 `fake-indexeddb` + `jsdom` 环境，覆盖了服务层和工具函数，但**页面组件和 Store 缺少测试**。

---

## 八、已知架构问题与待改进项

### 8.1 存储层重复

`storageService.ts` 和 `storage/db.ts` + repo 层存在功能重复：
- `storageService.ts` 使用 `Record<string, unknown>` 弱类型，被 `useLibraryStore` 直接消费
- `storage/db.ts` + repo 层使用强类型 `Comic` / `Tag` 等，但尚未被主流程使用
- 两者各自维护独立的 DB 连接单例

**建议**: 统一迁移到 repo 层，移除 `storageService.ts`。

### 8.2 Reader 页面过大

[Reader/index.tsx](file:///d:/workplace/visual/same-idea/reader/kuro-reader/src/pages/Reader/index.tsx) 约 1700 行，包含：
- 条漫/页漫双模式渲染
- 手势处理（点击/长按/滑动/双击缩放）
- 进度保存与恢复
- 垂直滚动虚拟窗口管理
- UI 覆盖层动画
- 章节切换
- 全屏查看器

**建议**: 拆分为多个子组件和自定义 Hook。

### 8.3 版本号不一致

- `package.json`: `0.0.0`
- `APP_CONFIG`: `1.0.0`

### 8.4 PDF 支持预留但未实现

- `BookFormat` 类型已定义 `'pdf'`
- `ParsedPdfBook` 接口已定义
- `bookFileRepo` 已预留（Phase 3 桩）
- DB v4 升级计划已注释
- 但实际 PDF 解析和渲染尚未实现

### 8.5 Batch 页面路由已定义但可能未完整

`ROUTES.BATCH = '/batch'` 已定义，但 App.tsx 路由中未注册对应路由。

### 8.6 测试覆盖不足

- 14 个页面组件均无测试
- 4 个 Store 均无测试
- 云存储/FTP 客户端无测试
- 认证流程无集成测试

---

## 九、开发与构建

### 命令

| 命令 | 用途 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | TypeScript 检查 + Vite 构建 |
| `npm run lint` | ESLint 检查 |
| `npm run test` | 运行测试 |
| `npm run test:watch` | 监听模式测试 |
| `npm run test:ui` | Vitest UI |
| `npm run typecheck` | 仅类型检查 |

### Android 构建

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug   # 或 assembleRelease
```

### 环境变量

| 变量 | 用途 |
|------|------|
| `VITE_FTP_PROXY_URL` | FTP 代理服务器地址（生产环境） |

---

## 十、代码规模统计

| 类别 | 文件数 | 估算行数 |
|------|--------|----------|
| 页面组件 | 14 | ~3500 |
| Store | 4 | ~900 |
| 服务层 | 12 | ~1800 |
| 组件 | 10 | ~1200 |
| 工具/Hook | 8 | ~400 |
| 类型定义 | 1 | ~130 |
| 样式 | 1 | ~640 |
| 测试 | 10 | ~600 |
| **总计** | ~60 | ~9200 |
