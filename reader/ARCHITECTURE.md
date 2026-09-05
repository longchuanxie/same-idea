# Kuro Reader - 技术架构文档 (ARCHITECTURE)

## 1. 技术栈选型

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| **框架** | **React 18.2 + TypeScript 5.3** | 组件化开发，类型安全，生态成熟 |
| **构建工具** | **Vite 5.0** | 快速冷启动，HMR，现代化构建 |
| **样式方案** | **Tailwind CSS 3.4** | 原型已大量使用 Tailwind 类名，原子化 CSS 与设计系统完美契合 |
| **状态管理** | **Zustand 4.4** | 轻量、简洁，适合中小型应用，无需 Provider 嵌套 |
| **路由** | **React Router 6.20** | 声明式路由，支持嵌套路由和懒加载 |
| **本地存储** | **IndexedDB (via idb 7.1)** | 大文件存储（漫画图片/压缩包），结构化数据 |
| **文件处理** | **JSZip 3.10** | 解压 ZIP/CBZ（RAR 延期到后续迭代） |
| **图片处理** | **CSS Filters + Canvas API** | 灰度、sepia、对比度调整（阅读器模式） |
| **PWA** | **Vite PWA Plugin 0.17** | 离线阅读，添加到主屏幕 |
| **移动端打包** | **Capacitor 5.5** | 将 Web App 打包为 iOS/Android 原生应用 |
| **认证** | **@capacitor/local-authentication 5.0** | 生物识别（指纹/面容）+ 系统 PIN |
| **手势密码** | **自定义 React 组件** | 3×3 九宫格图案解锁，纯前端实现 |

---

## 2. 项目目录结构

```
kuro-reader/
├── public/                          # 静态资源
│   ├── manifest.json                # PWA 配置
│   └── icons/
├── src/
│   ├── main.tsx                     # 应用入口
│   ├── App.tsx                      # 根组件
│   ├── index.css                    # 全局样式 + Tailwind 导入
│   │
│   ├── components/                  # 组件层
│   │   ├── atoms/                   # 原子组件
│   │   ├── molecules/               # 分子组件
│   │   ├── organisms/               # 有机体组件
│   │   └── layouts/                 # 布局组件
│   │
│   ├── pages/                       # 页面层
│   │   ├── Home/
│   │   ├── Library/
│   │   ├── ComicDetail/
│   │   ├── Reader/
│   │   ├── Import/
│   │   ├── Settings/
│   │   ├── Stats/
│   │   ├── Profile/
│   │   └── Search/
│   │
│   ├── hooks/                       # 自定义 Hooks
│   ├── stores/                      # Zustand 状态仓库
│   ├── types/                       # TypeScript 类型定义
│   ├── utils/                       # 工具函数
│   ├── services/                    # 业务服务层
│   │   ├── storage/                 # 本地存储服务
│   │   ├── import/                  # 导入服务
│   │   ├── reader/                  # 阅读器服务
│   │   └── auth/                    # 认证服务（手势/生物识别）
│   │
│   ├── constants/                   # 常量定义
│   └── assets/                      # 图片、字体等资源
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts               # Tailwind 配置（设计系统 Token）
├── tsconfig.json
├── package.json
├── capacitor.config.ts              # Capacitor 配置
├── android/                         # Android 原生项目（Capacitor 生成）
└── ios/                             # iOS 原生项目（Capacitor 生成）
```

---

## 3. Tailwind 配置（设计系统 Token）

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material You 风格色彩系统
        surface: {
          DEFAULT: '#fdf8f8',
          dim: '#ddd9d9',
          bright: '#fdf8f8',
          variant: '#e6e1e1',
        },
        'surface-container': {
          lowest: '#ffffff',
          low: '#f7f2f2',
          DEFAULT: '#f1eded',
          high: '#ece7e7',
          highest: '#e6e1e1',
        },
        primary: {
          DEFAULT: '#000000',
          fixed: '#e5e2e1',
          'fixed-dim': '#c8c6c5',
        },
        secondary: {
          DEFAULT: '#5e5e5e',
          container: '#e4e2e2',
        },
        outline: {
          DEFAULT: '#747878',
          variant: '#c4c7c7',
        },
        // Dark Mode 色彩
        dark: {
          background: '#131313',
          surface: '#201f1f',
          primary: '#d0bcff',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Literata', 'serif'],
        label: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '32px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '28px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      spacing: {
        unit: '8px',
        gutter: '24px',
        'margin-mobile': '24px',
        'margin-desktop': '120px',
        'max-width-content': '720px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
}
```

---

## 4. 状态管理架构（Zustand）

### 4.1 Store 模块划分

```
stores/
├── useAppStore.ts        # 全局应用状态（主题、导航、认证）
├── useLibraryStore.ts    # 书库状态（漫画列表、收藏、阅读进度）
├── useReaderStore.ts     # 阅读器运行时状态（当前页、UI显隐）
├── useSettingsStore.ts   # 用户设置（偏好、认证配置）
├── useImportStore.ts     # 导入状态（任务队列、进度）
└── useStatsStore.ts      # 阅读统计（派生数据，订阅 LibraryStore）
```

### 4.2 Store 设计示例

```typescript
// stores/useAppStore.ts - 合并主题、导航、认证
interface AppState {
  theme: 'light' | 'dark' | 'auto';
  isAuthenticated: boolean;
  lastAuthTime: number;
  authConfig: AuthConfig;
  
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setAuthenticated: (value: boolean) => void;
  updateAuthConfig: (config: Partial<AuthConfig>) => void;
  checkAuthTimeout: () => boolean;
}

// stores/useLibraryStore.ts - 漫画数据单一数据源
interface LibraryState {
  comics: Comic[];
  collections: Collection[];
  readingProgress: Record<string, ReadingProgress>;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  addComic: (comic: Comic) => void;
  removeComic: (id: string) => void;
  updateProgress: (comicId: string, progress: ReadingProgress) => void;
  batchDelete: (ids: string[]) => void;
  batchMarkAsRead: (ids: string[]) => void;
  
  // Selectors
  getContinueReading: () => Comic | null;
  getRecentlyRead: () => Comic[];
}

// stores/useReaderStore.ts - 纯运行时状态，不存储漫画数据
interface ReaderState {
  currentComicId: string | null;
  currentChapterId: string | null;
  currentPage: number;
  totalPages: number;
  direction: 'vertical' | 'horizontal';
  isUiVisible: boolean;
  
  // Actions
  openComic: (comicId: string, chapterId?: string) => void;
  nextPage: () => void;
  prevPage: () => void;
  toggleUi: () => void;
  setDirection: (dir: 'vertical' | 'horizontal') => void;
  closeReader: () => void;
}

// stores/useStatsStore.ts - 派生数据，自动计算
interface StatsState {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  completedComics: number;
  weeklyData: { day: string; hours: number }[];
}

// 使用 Zustand subscribe 监听 LibraryStore 变化自动更新统计
useStatsStore.subscribe((state) => {
  const library = useLibraryStore.getState();
  state.recalculateStats(library.readingProgress);
});
```

---

## 5. 路由设计

```typescript
// App.tsx 路由配置
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// components/layouts/AuthGuard.tsx - 认证守卫
const AuthGuard: React.FC = () => {
  const { isEnabled, isAuthenticated, checkAuthTimeout } = useAppStore();
  const location = useLocation();
  
  // 认证未启用，直接通过
  if (!isEnabled) return <Outlet />;
  
  // 认证已超时，重定向到认证页
  if (!isAuthenticated || checkAuthTimeout()) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

// App.tsx 路由配置
const App = () => (
  <BrowserRouter>
    <Routes>
      {/* 认证页面（不受保护） */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* 受保护路由 */}
      <Route element={<AuthGuard />}>
        {/* 主布局路由 */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* 独立布局路由 */}
        <Route path="/comic/:id" element={<ComicDetailPage />} />
        <Route path="/reader/:comicId/:chapterId?" element={<ReaderLayout />}>
          <Route index element={<ReaderPage />} />
        </Route>
        <Route path="/import/custom-cloud" element={<CustomCloudPage />} />
        <Route path="/batch" element={<BatchPage />} />
      </Route>
      
      {/* 兜底：未匹配路由重定向到首页 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
```

---

## 6. 数据模型

### 6.1 核心类型

```typescript
// types/index.ts

interface Comic {
  id: string;
  title: string;
  author: string;
  cover: string; // Blob URL or local path
  genres: string[];
  rating?: number;
  description: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  totalChapters: number;
  chapters: Chapter[];
  addedAt: Date;
  lastReadAt?: Date;
}

interface Chapter {
  id: string;
  comicId: string;
  number: number;
  title: string;
  pages: string[]; // Array of image URLs/paths
  status: 'unread' | 'reading' | 'read';
  readAt?: Date;
}

interface ReadingProgress {
  comicId: string;
  chapterId: string;
  page: number;
  totalPages: number;
  percentage: number;
}

interface Collection {
  id: string;
  name: string;
  comicIds: string[];
  createdAt: Date;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  paperMode: boolean;
  textureIntensity: number; // 0-100
  readingDirection: 'rtl' | 'ltr';
  pageTurnGestures: boolean;
  cloudSync: boolean;
  fontSize: number;
  fontFamily: 'literata' | 'inter';
  // 认证配置
  auth: AuthConfig;
}

// 认证配置类型
interface AuthConfig {
  isEnabled: boolean;
  method: 'auto' | 'biometric' | 'gesture' | 'system_pin';
  lockTimeout: number;        // 自动锁定时间（毫秒），默认 5 分钟
  maxAttempts: number;        // 最大尝试次数，默认 5
  gestureHash?: string;       // PBKDF2 哈希后的手势密码
  gestureSalt?: string;       // 随机盐值
  failedAttempts: number;     // 当前连续失败次数
  lockUntil?: number;         // 锁定截止时间戳
}

interface ReadingStats {
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  completedComics: number;
  weeklyData: { day: string; hours: number }[];
}

interface ImportTask {
  id: string;
  source: 'local' | 'baidu' | 'gdrive' | 'onedrive' | 'webdav' | 'wifi';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  fileName: string;
  fileSize: number;
}
```

### 6.2 存储方案

| 数据类型 | 存储方式 | 技术 |
|---------|---------|------|
| 漫画元数据 | IndexedDB | `idb` 库 |
| 漫画封面/图片 | IndexedDB (Blob) / Cache API | 本地二进制存储 |
| 用户设置 | localStorage | 简单键值对 |
| 阅读进度 | IndexedDB + localStorage (备份) | 高频读写 |
| 导入任务队列 | IndexedDB | 持久化任务状态 |
| 阅读统计 | IndexedDB | 时序数据 |
| 云同步配置 | localStorage + IndexedDB | 加密存储凭据 |

---

## 7. 关键功能实现要点

### 7.1 阅读器手势处理

```typescript
// 阅读器手势处理 Hook
const useReaderGestures = () => {
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    
    // 横向模式：左右滑动翻页
    // 纵向模式：上下滑动滚动（原生）
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx > 0 ? prevPage() : nextPage();
    }
  };
};
```

### 7.2 文件导入处理

```typescript
// 导入服务
class ImportService {
  async processZip(file: File): Promise<Comic> {
    const zip = await JSZip.loadAsync(file);
    const images: string[] = [];
    
    // 提取图片并按名称排序
    const imageFiles = Object.values(zip.files)
      .filter(f => !f.dir && /\.(jpg|jpeg|png|webp)$/i.test(f.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    for (const imgFile of imageFiles) {
      const blob = await imgFile.async('blob');
      const url = URL.createObjectURL(blob);
      images.push(url);
    }
    
    return {
      id: generateId(),
      title: file.name.replace(/\.(zip|cbz)$/i, ''),
      chapters: [{ id: generateId(), number: 1, title: '全卷', pages: images, status: 'unread' }],
      // ...
    };
  }
}
```

### 7.3 纸质纹理实现

```css
/* 全局纸张纹理 */
.paper-texture {
  background-color: #fdf8f8;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
}

/* 阅读器图片滤镜 */
.reader-image {
  filter: grayscale(0.9) sepia(0.2) contrast(1.25);
}
```

---

## 8. 移动端打包方案（Capacitor）

### 8.1 为什么选择 Capacitor

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Capacitor** | 原生 WebView，性能接近原生；可直接使用原生插件；构建简单 | 需要配置原生开发环境 |
| **Cordova** | 历史悠久，插件丰富 | 维护缓慢，性能一般 |
| **React Native** | 真正原生组件，性能最佳 | 需要重写 UI，无法复用 Web 代码 |
| **Flutter** | 跨平台一致性好 | 需要学习 Dart，无法复用现有代码 |

**选择 Capacitor 的理由**：
- 项目已基于 React + Tailwind 开发，Capacitor 可直接打包现有代码
- 通过原生桥接可调用设备文件系统、存储等能力
- 社区活跃，插件生态完善
- 构建流程简单：`npm run build` → `npx cap sync` → 原生 IDE 打包

### 8.2 Capacitor 配置

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kuro.reader',
  appName: 'Kuro Reader',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#fdf8f8',
    },
  },
};

export default config;
```

### 8.3 关键原生插件

| 插件 | 用途 |
|------|------|
| `@capacitor/filesystem` | 访问设备文件系统，读取本地漫画文件 |
| `@capacitor/storage` | 本地键值存储（替代 localStorage） |
| `@capacitor/share` | 分享功能 |
| `@capacitor/status-bar` | 状态栏样式控制（适配 Dark Mode） |
| `@capacitor/splash-screen` | 启动屏 |
| `capacitor-plugin-safe-area` | 适配刘海屏/圆角屏安全区域 |
| `@capacitor/local-authentication` | 生物识别认证（指纹/面容） |
| `capacitor-native-biometric` | 原生生物识别（替代方案） |

### 8.4 打包流程

```bash
# 1. 构建 Web 应用
npm run build

# 2. 同步到原生项目
npx cap sync

# 3. Android 打包
cd android
./gradlew assembleRelease

# 4. iOS 打包（需要 macOS + Xcode）
cd ios
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

---

## 9. 性能优化策略

### 9.1 图片优化

- 漫画封面使用 WebP 格式，压缩至 300KB 以内
- 阅读器图片懒加载，预加载前后各 3 页
- 使用 `URL.createObjectURL` 管理 Blob 内存，及时 revoke

### 9.2 渲染优化

- 使用 `React.memo` 包裹漫画卡片，避免不必要的重渲染
- 阅读器使用 `requestAnimationFrame` 处理滚动和翻页动画
- 虚拟列表（Virtual List）处理长章节列表

### 9.3 存储优化

- IndexedDB 使用分块存储，单本漫画数据不超过 50MB
- 定期清理未使用的 Blob URL 和临时文件
- 压缩缓存数据，使用 LZ-String 等库压缩 JSON 数据

---

## 10. 安全与隐私

### 10.1 数据安全

- 用户密码/Token 使用原生 Keychain（iOS）/ Keystore（Android）存储
- 云同步使用 HTTPS 传输，敏感数据本地加密后再上传
- 手势密码使用 PBKDF2 哈希 + 随机盐值存储，不存明文
- 云同步密码使用 `@capacitor/preferences` 加密存储

### 10.2 隐私保护

- 所有漫画数据存储在本地，不上传用户阅读内容
- 统计分析仅本地计算，不涉及云端传输
- 权限最小化原则：仅申请文件读取、存储等必要权限
- **无传统登录**：不收集用户手机号、邮箱等个人信息
- **本地认证**：手势密码/生物识别仅用于本地设备解锁，不上传服务器

### 10.3 认证架构

#### 认证方式优先级

```typescript
// services/auth/AuthService.ts
enum AuthMethod {
  BIOMETRIC = 'biometric',      // 生物识别（Face ID / 指纹）
  SYSTEM_PIN = 'system_pin',    // 系统 PIN/密码
  GESTURE = 'gesture',          // 手势密码
  NONE = 'none',                // 无认证
}

interface AuthConfig {
  method: AuthMethod;
  isEnabled: boolean;
  lockTimeout: number;           // 自动锁定时间（毫秒）
  maxAttempts: number;           // 最大尝试次数
  gestureHash?: string;          // SHA-256 哈希后的手势密码
}
```

#### 手势密码实现

```typescript
// services/auth/GestureAuthService.ts
class GestureAuthService {
  private readonly GRID_SIZE = 3;           // 3×3 九宫格
  private readonly MIN_POINTS = 4;          // 最少连接点数
  private readonly PBKDF2_ITERATIONS = 10000;
  private readonly HASH_LENGTH = 64;        // 512 bits
  
  // 生成随机盐值
  generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // 将手势路径转换为标准化字符串（如 "0-1-2-4-7"）
  serializePath(points: number[]): string {
    return points.join('-');
  }
  
  // 使用 PBKDF2 哈希手势密码（带盐值）
  async hashGesture(points: number[], salt: string): Promise<string> {
    const serialized = this.serializePath(points);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(serialized),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      this.HASH_LENGTH
    );
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  // 验证手势
  async verifyGesture(input: number[], storedHash: string, salt: string): Promise<boolean> {
    const inputHash = await this.hashGesture(input, salt);
    // 使用恒定时间比较防止时序攻击
    if (inputHash.length !== storedHash.length) return false;
    let result = 0;
    for (let i = 0; i < inputHash.length; i++) {
      result |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return result === 0;
  }
  
  // 验证路径有效性（至少 MIN_POINTS 个点，不重复）
  isValidPath(points: number[]): boolean {
    if (points.length < this.MIN_POINTS) return false;
    return new Set(points).size === points.length;
  }
}
```

#### 生物识别实现（Capacitor）

```typescript
// services/auth/BiometricAuthService.ts
import { LocalAuthentication } from '@capacitor/local-authentication';

class BiometricAuthService {
  // 检查设备是否支持生物识别（带降级检测）
  async isAvailable(): Promise<{ available: boolean; type: string }> {
    try {
      const result = await LocalAuthentication.isAvailable();
      const isAvailable = result.biometry !== BiometryType.NONE;
      return {
        available: isAvailable,
        type: result.biometry || 'none',
      };
    } catch {
      // 插件不可用（Web 环境或设备不支持）
      return { available: false, type: 'none' };
    }
  }
  
  // 执行生物识别认证（带降级策略）
  async authenticate(preferBiometric = true): Promise<{
    success: boolean;
    method: 'biometric' | 'pin' | 'none';
  }> {
    try {
      const result = await LocalAuthentication.authenticate({
        reason: '解锁 Kuro Reader',
        cancelTitle: '取消',
        // 如果生物识别失败，允许降级到设备 PIN
        allowDeviceCredential: !preferBiometric,
        // iOS：失败后是否弹出系统密码
        iosBiometryType: 'both',
      });
      
      return {
        success: result.success,
        method: result.success ? 'biometric' : 'none',
      };
    } catch (error) {
      // 生物识别失败或用户取消，降级到 PIN
      if (preferBiometric) {
        return this.authenticate(false);
      }
      return { success: false, method: 'none' };
    }
  }
  
  // 获取生物识别类型（用户友好名称）
  async getBiometryLabel(): Promise<string> {
    const { type } = await this.isAvailable();
    const labels: Record<string, string> = {
      'touchId': 'Touch ID',
      'faceId': 'Face ID',
      'fingerprint': '指纹',
      'iris': '虹膜',
      'none': '无',
    };
    return labels[type] || type;
  }
}
```

#### 认证流程

```
App 启动/从后台返回
    │
    ▼
检查应用锁是否启用 ──否──► 直接进入 App
    │是
    ▼
检查上次认证时间 ──未超时──► 直接进入 App
    │超时
    ▼
获取首选认证方式
    │
    ├── 生物识别 ──► 调用系统 Face ID/指纹
    │                  │
    │                  ├── 成功 ──► 进入 App
    │                  └── 失败 ──► 降级到手势密码
    │
    ├── 系统 PIN ──► 调用系统密码验证
    │                  │
    │                  ├── 成功 ──► 进入 App
    │                  └── 失败 ──► 显示错误，限制重试
    │
    └── 手势密码 ──► 显示 GestureLock 界面
                       │
                       ├── 成功 ──► 进入 App
                       └── 失败 ──► 显示错误，限制重试
```

#### 手势密码组件

```typescript
// components/organisms/GestureLock.tsx
interface GestureLockProps {
  mode: 'verify' | 'setup' | 'change';
  onSuccess: () => void;
  onCancel?: () => void;
}

// 核心交互逻辑
// 1. 监听 touchstart/touchmove/touchend 事件
// 2. 计算触摸点与九宫格圆点的距离（< 30px 视为命中）
// 3. 命中后记录点索引，绘制 SVG 连线
// 4. 触摸结束时验证路径
// 5. setup 模式：要求输入两次确认
```
