# Kuro Reader

一款专注于本地漫画阅读体验的跨平台应用，支持 Web、Android 部署。采用 Material Design 3 设计体系，提供沉浸式的阅读体验。

## 功能特性

### 核心阅读
- 支持 ZIP/CBZ、RAR/CBR 等主流漫画压缩格式
- 条漫/页漫双模式阅读，支持自适应缩放
- 阅读进度自动保存与续读
- 双页阅读模式支持
- 手势密码保护隐私

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
│   │   ├── atoms/            # 原子组件
│   │   ├── molecules/        # 分子组件
│   │   ├── organisms/        # 有机体组件
│   │   └── layouts/          # 布局组件
│   ├── constants/            # 常量与配置
│   ├── hooks/                # 自定义 Hooks
│   ├── pages/                # 页面组件
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

### 使用 Android Studio 调试
```bash
npx cap open android
```

## 设计系统

项目采用 Material Design 3 设计规范，主要设计 Token：

| Token | 值 |
|-------|-----|
| 主色调 | `#1A1A1A` |
| 背景色 | `#FDF8F8` |
| 强调色 | 柔和红 `#E53E3E`、柔和绿 `#38A169` |
| 圆角 | 48dp (大) / 16dp (中) / 8dp (小) |

## 浏览器支持

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## 开源协议

MIT License
