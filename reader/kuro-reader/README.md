# Kuro Reader

一座只属于你、不断生长的**私人图书馆**——本地优先的漫画与文本统一阅读器，支持漫画（ZIP/CBZ/RAR/CBR）、PDF 与文本（TXT/Markdown/EPUB），可部署为 Web 应用或 Android App。采用 Material Design 3 设计体系，提供沉浸式的阅读体验和流畅的交互动画。

它记得你读到哪里（进度与年轮），书架随你的阅读而变化（座位/回望席），每一句划线都能贴上摘抄墙、被检索、被回访、被一键带走（导出 Markdown 嫁接 Obsidian/Notion）——读的时候是一座馆，读完后还是一个手记采集器官。

## 功能特性

### 核心阅读
- 支持 ZIP/CBZ、RAR/CBR 漫画压缩格式，以及 TXT、Markdown、EPUB、PDF 文本与文档格式
- Markdown 支持标题、强调、列表、引用、增强代码块、响应式表格、安全链接和 Mermaid 图表
- 文本阅读支持宋体、楷体、仿宋、黑体、圆体、文学体、等宽和系统字体预设
- 条漫/页漫双模式阅读，支持自适应缩放
- 阅读进度自动保存与续读（进度、阅读模式、主题按书记忆）
- 竖排书写模式（vertical-rl，日文/古典中文场景）
- TTS 听书（系统语音/神经语音/自建服务端三路引擎可切换）
- 双页阅读模式支持
- 手势密码保护隐私
- 水平翻页交叉淡入过渡动画

### 手记 · 知识采集
- 划线/批注分离：划线零输入一键保存，批注随手写笔记
- 水彩笔/下划线/波浪线三种笔触，批注带稳定锚点（内容重排版后仍可回位）
- 摘抄墙：跨书手记聚合视图——检索、按书/标签/形态筛选、手记标签
- 书内全文检索（章节级命中定位）
- 手记详情编辑/删除/「回到此处」；摘抄墙点击直达原句
- 门厅「回望席」：周年手记回访、当日确定性回访——图书馆会呼出
- 单书与整墙 Markdown 导出（Obsidian/Notion 兼容 #标签 行）
- 阅读统计：日历热力图、每日目标、连续达标；纳入云同步与备份

### 内容管理
- 本地压缩包导入；多文件合并导入（一话一文件自动合并为一书多章）
- 漫画导入期章节识别（目录模式/文件名序列/条漫宽高比三层判定链）
- 文件夹批量导入（自动创建子书库）
- WebDAV / NAS 云端来源连接；FTP 服务器浏览与导入；OPDS 目录（Calibre/Komga/Kavita）
- 子书库分类管理
- 标签系统与收藏功能
- WebDAV 多端同步（进度/批注/书签/阅读统计，逐条 LWW 合并并落地本地）

### 平台适配
- 移动端状态栏安全区适配
- 安卓原生文件选择器集成
- 平滑滚动与触控优化
- 启动图标与闪屏定制

### 交互与动画
- 底部导航栏滑动指示器（跟随活跃 Tab 平滑移动）
- 方向感知页面过渡（前进/后退自动适配滑动方向）
- 阅读器 UI 覆盖层滑入/滑出动画
- 弹窗/菜单 scale-in 缩放入场动画
- 设置页展开/折叠区域平滑过渡
- 弹簧缓动 Toggle 开关
- 漫画详情页交错入场动画

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 状态 | Zustand 4 |
| 路由 | React Router 6 |
| 移动端 | Capacitor 8 |
| 存储 | IndexedDB (idb) |
| 压缩包 | JSZip + libarchive.js |

## 项目结构

```
kuro-reader/
├── android/                  # Android 原生工程
├── src/
│   ├── components/           # 组件层 (Atomic Design)
│   │   ├── atoms/            # 原子组件 (BottomNavBar, TopAppBar, Collapsible, FormatBadge)
│   │   ├── molecules/        # 分子组件 (ConfirmDialog, FullscreenViewer, MarkdownReaderContent, ...)
│   │   ├── organisms/        # 有机体组件 (GestureLock)
│   │   └── layouts/         # 布局组件 (MainLayout, PageTransition, AuthGuard)
│   ├── constants/            # 常量与配置
│   ├── hooks/                # 自定义 Hooks
│   ├── pages/                # 页面组件 (14 个页面，含 Reader 漫画阅读器与 TextReader 文本阅读器)
│   ├── plugins/              # Capacitor 自定义插件
│   ├── services/             # 服务层
│   ├── stores/               # Zustand 状态管理
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
├── capacitor.config.json     # Capacitor 配置
└── package.json
```

## 开发环境

### 前置要求
- Node.js 18+
- Java 17+ (Android 构建)
- Android Studio (Android 开发)

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产包
```bash
npm run build
```

### 代码规范检查
```bash
npm run lint
```

## 动画系统

项目内置完整的 CSS 动画系统，所有动画均为纯 CSS 实现，无需额外依赖。

### 入场动画

| 工具类 | 效果 |
|--------|------|
| `animate-fade-in` | 淡入（200ms ease-out） |
| `animate-scale-in` | 缩放淡入（250ms cubic-bezier(0.16,1,0.3,1)） |
| `animate-slide-up` | 从底部滑入 |
| `animate-slide-down` | 从顶部滑入 |
| `animate-slide-in-right` | 从右侧滑入 |
| `animate-slide-in-left` | 从左侧滑入 |
| `animate-stagger-fade-in` | 子元素交错淡入（最多 12 个，0.05s 间隔） |

### 页面过渡

| 工具类 | 效果 |
|--------|------|
| `animate-page-enter` | 页面进入（上移 16px + 淡入） |
| `animate-page-exit` | 页面退出（上移 -8px + 淡出） |

### 交互动画

| 工具类 | 效果 |
|--------|------|
| `animate-card-hover` | 卡片悬停上浮 + 阴影 |
| `animate-press` | 按下缩放反馈 |
| `animate-shimmer` | 闪光扫描加载效果 |
| `animate-pulse-soft` | 柔和脉冲 |
| `animate-shake` | 水平抖动（错误提示） |
| `toggle-spring` | 弹簧缓动 Toggle 容器 |
| `toggle-thumb-spring` | 弹簧缓动 Toggle 滑块 |
| `animate-ripple` | 按压涟漪效果 |

### 阅读器专用

| 工具类 | 效果 |
|--------|------|
| `animate-fullscreen-enter` | 全屏查看器淡入+缩放进入 |
| `animate-page-fade` | 翻页交叉淡入 |

### 展开/折叠

| 工具类 | 效果 |
|--------|------|
| `animate-expand` | max-height 展开动画 |
| `animate-collapse` | max-height 折叠动画 |

可通过 `<Collapsible>` 原子组件使用展开/折叠动画。

## Android 构建

### 同步 Web 资源到 Android 工程
```bash
npx cap sync android
```

### 构建 Debug APK
```bash
cd android
./gradlew assembleDebug
```

构建产物位于 `android/app/build/outputs/apk/debug/app-debug.apk`。
### 构建正式APK
```bash
cd android
./gradlew assembleRelease
```
构建产物位于 `android/app/build/outputs/apk/release/app-release.apk`。
### 使用 Android Studio 调试
```bash
npx cap open android
```

## 设计系统

项目采用 Material Design 3 设计规范，主要设计 Token：

| Token | 值 |
|-------|-----|
| 主色调 | `#000000` (纯黑) |
| 背景色 | `#FDF8F8` (暖白) |
| 表面色 | `#FFFFFF` / `#F5F0F0` / `#EDEBEB` / `#E6E3E3` |
| 主字体 | Playfair Display (Display), Literata (Body), Inter (Label) |
| 强调色 | 柔和红 `#E53E3E`、柔和绿 `#38A169` |

动画曲线统一使用 `cubic-bezier(0.16, 1, 0.3, 1)` (Material Design 3 emphasized easing)。

## 浏览器支持

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## 开源协议

MIT License
