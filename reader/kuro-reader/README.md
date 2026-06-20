# Kuro Reader

一款专注于本地漫画阅读体验的跨平台应用，支持 Web、Android 部署。采用 Material Design 3 设计体系，提供沉浸式的阅读体验和流畅的交互动画。

## 功能特性

### 核心阅读
- 支持 ZIP/CBZ、RAR/CBR 等主流漫画压缩格式
- 条漫/页漫双模式阅读，支持自适应缩放
- 阅读进度自动保存与续读
- 双页阅读模式支持
- 手势密码保护隐私
- 水平翻页交叉淡入过渡动画

### 内容管理
- 本地压缩包导入
- 文件夹批量导入（自动识别压缩包并创建子书库）
- WebDAV / NAS 云端来源连接
- FTP 服务器浏览与导入
- 子书库分类管理
- 标签系统与收藏功能

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
│   │   ├── atoms/            # 原子组件 (BottomNavBar, TopAppBar, Collapsible)
│   │   ├── molecules/        # 分子组件 (ConfirmDialog, FullscreenViewer, ...)
│   │   ├── organisms/        # 有机体组件 (GestureLock)
│   │   └── layouts/         # 布局组件 (MainLayout, PageTransition, AuthGuard)
│   ├── constants/            # 常量与配置
│   ├── hooks/                # 自定义 Hooks
│   ├── pages/                # 页面组件 (14 个页面)
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
