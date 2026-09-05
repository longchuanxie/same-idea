# Kuro Reader - 编码规范 (CODING_STANDARDS)

本文档定义了 Kuro Reader 项目的编码规范，所有开发者（包括 AI）必须严格遵守。违反规范的代码将被要求重写。

---

## 1. 核心禁令

### 1.1 禁止硬编码（ZERO TOLERANCE）

**定义**：将本应是配置、常量、环境变量或数据驱动的值直接写入业务逻辑代码中。

**绝对禁止的硬编码类型**：

| 类型 | 错误示例 | 正确做法 |
|------|---------|---------|
| **颜色值** | `className="bg-[#fdf8f8]"` | `className="bg-background"` |
| **尺寸数值** | `className="w-[720px]"` | `className="max-w-max-width-content"` |
| **文案/文本** | `<h1>Kuro Reader</h1>` | `<h1>{APP_NAME}</h1>` 或 `<h1>{t('app.name')}</h1>` |
| **路由路径** | `navigate('/settings')` | `navigate(ROUTES.SETTINGS)` |
| **API 端点** | `fetch('https://api.example.com')` | `fetch(API_BASE_URL + ENDPOINTS.COMICS)` |
| **数值常量** | `if (size > 52428800)` | `if (size > MAX_FILE_SIZE)` |
| **时间值** | `setTimeout(fn, 3000)` | `setTimeout(fn, DEBOUNCE_DELAY)` |
| **魔法字符串** | `if (status === 'completed')` | `if (status === ComicStatus.COMPLETED)` |
| **文件扩展名** | `accept=".zip,.cbz"` | `accept={SUPPORTED_FORMATS.join(',')}` |
| **版本号** | `version: '1.0.0'` | `version: APP_VERSION` |

**硬编码检测规则**：
- 任何 `#` 开头的十六进制颜色值（CSS 中除外）
- 任何未通过变量/常量引用的字符串字面量（除空字符串、空格等无意义值）
- 任何未命名的数值（0、1 除外）
- 任何 URL 字符串
- 任何文件路径字符串

### 1.2 禁止 Mock 数据混入业务代码（ZERO TOLERANCE）

**定义**：将用于测试、演示的虚假数据直接嵌入组件、Hook、Service 的实现代码中。

**绝对禁止的场景**：

```typescript
// ❌ 禁止：组件内部定义假数据
const HomePage = () => {
  const comics = [
    { id: '1', title: '葬送的芙莉莲', author: '山田钟人' },
    { id: '2', title: '迷宫饭', author: '九井谅子' },
  ];
  return <CollectionGrid comics={comics} />;
};

// ❌ 禁止：Hook 返回假数据
const useLibrary = () => {
  return { comics: MOCK_COMICS, isLoading: false };
};

// ❌ 禁止：Service 层返回假数据
class ComicService {
  async getComics() {
    return Promise.resolve([
      { id: '1', title: '测试漫画' },
    ]);
  }
}

// ❌ 禁止：条件编译式 mock
const getComics = async () => {
  if (process.env.NODE_ENV === 'development') {
    return MOCK_COMICS; // 禁止！
  }
  return fetch('/api/comics');
};

// ❌ 禁止：默认参数携带假数据
const ComicList = ({ comics = DEFAULT_MOCK_COMICS }) => {
  return <div>{comics.map(...)}</div>;
};
```

**Mock 数据的正确隔离方式**：

```typescript
// ✅ 正确：Mock 数据放在 __mocks__ 目录
// src/__mocks__/comics.ts
export const mockComics: Comic[] = [
  { id: 'mock-1', title: 'Mock Comic 1', /* ... */ },
];

// ✅ 正确：仅在测试文件中使用
// src/hooks/__tests__/useLibrary.test.ts
import { mockComics } from '@/__mocks__/comics';
import { describe, it, expect } from 'vitest';

describe('useLibrary', () => {
  it('should return comics', () => {
    // 使用 mockComics 进行测试
  });
});

// ✅ 正确：使用 MSW 在开发环境拦截请求
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockComics } from '@/__mocks__/comics';

export const handlers = [
  http.get('/api/comics', () => HttpResponse.json(mockComics)),
];

// ✅ 正确：组件从 props 获取数据
// src/pages/Home/HomePage.tsx
import { useLibraryStore } from '@/stores/useLibraryStore';

const HomePage = () => {
  const { comics, isLoading, error } = useLibraryStore();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (comics.length === 0) return <EmptyState />;
  
  return <CollectionGrid comics={comics} />;
};
```

**Mock 数据目录结构**：

```
src/
├── __mocks__/              # Mock 数据目录（仅用于测试和开发工具）
│   ├── comics.ts
│   ├── chapters.ts
│   └── index.ts
├── mocks/                  # MSW 处理器（开发环境 API 模拟）
│   ├── handlers.ts
│   ├── browser.ts
│   └── server.ts
└── pages/
    └── Home/
        └── __tests__/      # 测试文件
            └── HomePage.test.tsx
```

---

## 2. 代码组织规范

### 2.1 文件结构

每个文件必须遵循以下顺序：

```typescript
// 1. 导入（按顺序分组，组间空行）
// 1.1 React 核心
import React, { useState, useCallback, useMemo } from 'react';

// 1.2 第三方库
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';

// 1.3 内部绝对路径（@/）
import { Button } from '@/components/atoms/Button';
import { useLibraryStore } from '@/stores/useLibraryStore';
import { Comic } from '@/types/comic';
import { ROUTES } from '@/constants/routes';

// 1.4 内部相对路径（../ 或 ./）
import { ComicCard } from '../molecules/ComicCard';
import styles from './HomePage.module.css';

// 2. 类型定义（如未在 types/ 中定义）
interface HomePageProps {
  initialFilter?: string;
}

// 3. 文件级常量
const GRID_COLUMNS = {
  mobile: 2,
  desktop: 3,
} as const;

// 4. 组件/函数实现
export const HomePage: React.FC<HomePageProps> = ({ initialFilter }) => {
  // 4.1 Hooks 调用（必须在组件顶部）
  const navigate = useNavigate();
  const { comics, isLoading } = useLibraryStore();
  
  // 4.2 派生状态
  const filteredComics = useMemo(() => {
    if (!initialFilter) return comics;
    return comics.filter(c => c.genres.includes(initialFilter));
  }, [comics, initialFilter]);
  
  // 4.3 回调函数
  const handleComicClick = useCallback((comicId: string) => {
    navigate(ROUTES.COMIC_DETAIL.replace(':id', comicId));
  }, [navigate]);
  
  // 4.4 渲染
  return (
    <div className="space-y-8">
      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <CollectionGrid 
          comics={filteredComics} 
          onComicClick={handleComicClick}
        />
      )}
    </div>
  );
};

// 5. 默认导出（如需要）
export default HomePage;
```

### 2.2 导入排序规则

使用 ESLint `import/order` 规则强制排序：

```json
{
  "import/order": [
    "error",
    {
      "groups": [
        ["builtin", "external"],
        "internal",
        ["parent", "sibling", "index"]
      ],
      "pathGroups": [
        {
          "pattern": "react",
          "group": "external",
          "position": "before"
        },
        {
          "pattern": "@/**",
          "group": "internal"
        }
      ],
      "pathGroupsExcludedImportTypes": ["react"],
      "newlines-between": "always",
      "alphabetize": {
        "order": "asc",
        "caseInsensitive": true
      }
    }
  ]
}
```

### 2.3 目录结构规范

```
src/
├── components/              # 组件（按 Atomic Design 分层）
│   ├── atoms/               # 原子组件
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── ...
│   ├── molecules/           # 分子组件
│   ├── organisms/           # 有机体组件
│   └── layouts/             # 布局组件
│
├── pages/                   # 页面组件
│   ├── Home/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.test.tsx
│   │   └── index.ts
│   └── ...
│
├── hooks/                   # 自定义 Hooks
│   ├── useReader.ts
│   ├── useReader.test.ts
│   └── index.ts
│
├── stores/                  # Zustand Store
│   ├── useLibraryStore.ts
│   └── index.ts
│
├── services/                # 业务服务层
│   ├── storage/
│   │   ├── IndexedDBService.ts
│   │   └── index.ts
│   ├── import/
│   │   ├── ZipImportService.ts
│   │   └── index.ts
│   └── index.ts
│
├── types/                   # TypeScript 类型定义
│   ├── comic.ts
│   ├── chapter.ts
│   └── index.ts
│
├── constants/               # 常量定义
│   ├── config.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── index.ts
│
├── utils/                   # 工具函数
│   ├── cn.ts
│   ├── formatDate.ts
│   └── index.ts
│
├── __mocks__/               # Mock 数据（仅用于测试）
│   ├── comics.ts
│   └── index.ts
│
├── mocks/                   # MSW 处理器
│   ├── handlers.ts
│   └── browser.ts
│
└── assets/                  # 静态资源
    ├── icons/
    └── images/
```

---

## 3. 命名规范

### 3.1 通用规则

| 类型 | 规则 | 示例 |
|------|------|------|
| **组件** | PascalCase，与文件名一致 | `Button.tsx` → `Button` |
| **Hook** | camelCase，use 前缀 | `useReader.ts` → `useReader` |
| **Store** | camelCase，use 前缀 | `useLibraryStore.ts` → `useLibraryStore` |
| **类型/接口** | PascalCase | `Comic`, `ReadingProgress` |
| **枚举** | PascalCase，成员 UPPER_SNAKE_CASE | `enum Theme { LIGHT = 'light' }` |
| **工具函数** | camelCase | `formatDate`, `generateId` |
| **常量** | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `APP_NAME` |
| **布尔变量** | is/has/should 前缀 | `isLoading`, `hasError` |
| **事件处理** | handle + 动作 | `handleClick`, `handleSubmit` |
| **回调 props** | on + 动作 | `onClick`, `onChange` |
| **文件** | 与默认导出同名 | `Button.tsx` 导出 `Button` |

### 3.2 组件 Props 命名

```typescript
interface ComponentProps {
  // 基础属性
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // 状态属性
  isActive?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  
  // 数据属性
  data?: Comic[];
  value?: string;
  defaultValue?: string;
  
  // 回调属性
  onClick?: () => void;
  onChange?: (value: string) => void;
  onSelect?: (item: Comic) => void;
  
  // 样式属性
  className?: string;
  style?: React.CSSProperties;
  
  // 子元素
  children?: React.ReactNode;
  
  // 引用
  ref?: React.Ref<HTMLButtonElement>;
}
```

---

## 4. TypeScript 规范

### 4.1 类型安全

**必须遵守**：

```typescript
// ✅ 必须：函数参数和返回值都有类型
const formatDate = (date: Date, format: DateFormat): string => {
  return date.toLocaleDateString(format);
};

// ✅ 必须：组件 Props 有接口定义
interface ButtonProps {
  variant: ButtonVariant;
  onClick: () => void;
}

// ✅ 必须：数组/对象有具体类型
const comics: Comic[] = [];
const config: AppConfig = { /* ... */ };

// ✅ 必须：使用严格比较
if (status === ComicStatus.COMPLETED) { }

// ✅ 推荐：使用 as const 增强类型推断
const ROUTES = {
  HOME: '/',
  SETTINGS: '/settings',
} as const;
```

**绝对禁止**：

```typescript
// ❌ 禁止：使用 any
const data: any = fetchData();

// ❌ 禁止：隐式 any
function process(data) { /* ... */ }

// ❌ 禁止：类型断言滥用
const comic = data as Comic;

// ❌ 禁止：非空断言滥用
const title = comic!.title;

// ❌ 禁止：忽略 TypeScript 错误
// @ts-ignore
const result = unsafeFunction();

// ❌ 禁止：使用 Object/Function/{} 等宽泛类型
const obj: Object = {};
const fn: Function = () => {};
```

### 4.2 类型定义位置

```typescript
// 全局类型 → types/ 目录
// src/types/comic.ts
export interface Comic {
  id: string;
  title: string;
  // ...
}

// 组件专属类型 → 组件文件内或同目录 .types.ts
// src/components/atoms/Button/Button.types.ts
export interface ButtonProps {
  variant?: ButtonVariant;
  // ...
}

// 局部类型 → 使用处附近
function processItems(items: Array<{ id: string; name: string }>) {
  // ...
}
```

---

## 5. React 规范

### 5.1 组件定义

```typescript
// ✅ 推荐：函数组件 + 显式返回类型
export const Button: React.FC<ButtonProps> = ({ variant, onClick, children }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ✅ 推荐：forwardRef 用于需要 ref 的组件
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ value, onChange }, ref) => {
    return <input ref={ref} value={value} onChange={onChange} />;
  }
);
Input.displayName = 'Input';

// ❌ 禁止：类组件（除非必要）
class Button extends React.Component { }

// ❌ 禁止：隐式返回类型
const Button = (props: ButtonProps) => {
  return <button />;
};
```

### 5.2 Hooks 规范

```typescript
// ✅ 必须：Hooks 在组件顶部调用
const Component = () => {
  const [count, setCount] = useState(0);
  const store = useStore();
  const memoized = useMemo(() => compute(), [dep]);
  const callback = useCallback(() => {}, [dep]);
  
  // ❌ 禁止：条件调用 Hooks
  if (condition) {
    const state = useState(); // 错误！
  }
  
  // ❌ 禁止：循环中调用 Hooks
  items.map(() => {
    const ref = useRef(); // 错误！
  });
};

// ✅ 推荐：自定义 Hook 返回对象
const useCounter = (initial: number) => {
  const [count, setCount] = useState(initial);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  
  return { count, increment, decrement };
};

// ✅ 推荐：useEffect 清理副作用
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);
```

### 5.3 性能优化

```typescript
// ✅ 推荐：使用 useMemo 缓存计算
const filteredComics = useMemo(() => {
  return comics.filter(c => c.status === status);
}, [comics, status]);

// ✅ 推荐：使用 useCallback 缓存回调
const handleClick = useCallback((id: string) => {
  navigate(ROUTES.COMIC_DETAIL.replace(':id', id));
}, [navigate]);

// ✅ 推荐：使用 React.memo 避免不必要重渲染
export const ComicCard = React.memo<ComicCardProps>(({ comic, onClick }) => {
  return <div onClick={() => onClick(comic.id)}>{comic.title}</div>;
});
ComicCard.displayName = 'ComicCard';

// ❌ 禁止：过度优化（简单组件不需要 memo）
const SimpleText = React.memo(({ text }: { text: string }) => {
  return <span>{text}</span>;
});
```

---

## 6. 样式规范

### 6.1 Tailwind CSS 使用

```typescript
// ✅ 推荐：使用设计系统 Token
<div className="bg-background text-on-background font-body-md">

// ✅ 推荐：使用 cn 工具合并类名
import { cn } from '@/utils/cn';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className
)}>

// ✅ 推荐：提取重复类名为常量
const CARD_CLASSES = 'border border-outline-variant bg-surface rounded-lg';

// ❌ 禁止：硬编码 Tailwind 值
<div className="bg-[#fdf8f8] text-[#1c1b1c]">

// ❌ 禁止：任意值（除非必要）
<div className="w-[123px] h-[45px]">

// ❌ 禁止：行内 style
<div style={{ backgroundColor: '#fdf8f8' }}>
```

### 6.2 响应式设计

```typescript
// ✅ 推荐：移动优先，使用 md:/lg: 前缀
<div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">

// ✅ 推荐：使用 Tailwind 断点
// 默认（移动）→ md（平板）→ lg（桌面）
<div className="px-margin-mobile md:px-0">

// ❌ 禁止：媒体查询硬编码
// 使用 Tailwind 的响应式前缀替代
```

---

## 7. 错误处理规范

### 7.1 同步错误

```typescript
// ✅ 推荐：输入校验
function processComic(comic: unknown): Comic {
  if (!comic || typeof comic !== 'object') {
    throw new Error('Invalid comic data');
  }
  
  const { id, title } = comic as Record<string, unknown>;
  
  if (!id || !title) {
    throw new Error('Missing required fields');
  }
  
  return { id, title } as Comic;
}

// ✅ 推荐：使用类型守卫
function isComic(value: unknown): value is Comic {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value
  );
}
```

### 7.2 异步错误

```typescript
// ✅ 推荐：try/catch + 错误边界
const loadComics = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await comicService.getAll();
    setComics(data);
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Unknown error'));
    logger.error('Failed to load comics', err);
  } finally {
    setLoading(false);
  }
};

// ✅ 推荐：使用 Result 类型（可选）
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function safeFetch<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: new Error(`HTTP ${response.status}`) };
    }
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Network error') };
  }
}
```

---

## 8. 测试规范

### 8.1 测试文件位置

```
src/
├── components/
│   └── atoms/
│       └── Button/
│           ├── Button.tsx
│           ├── Button.test.tsx      # 同目录测试文件
│           └── index.ts
```

### 8.2 测试命名

```typescript
// 文件名：ComponentName.test.tsx
// 描述格式：should [expected behavior] when [condition]

describe('Button', () => {
  it('should render children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('should be disabled when isDisabled is true', () => {
    render(<Button isDisabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 8.3 Mock 使用规范

```typescript
// ✅ 正确：在测试文件中 mock 依赖
vi.mock('@/stores/useLibraryStore', () => ({
  useLibraryStore: () => ({
    comics: mockComics,
    isLoading: false,
  }),
}));

// ✅ 正确：使用 MSW 模拟 API
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/comics', () => HttpResponse.json(mockComics)),
];

// ❌ 禁止：在生产代码中使用 mock
```

---

## 9. 注释规范

### 9.1 文件头注释

```typescript
/**
 * @file 阅读器手势处理 Hook
 * @description 支持点击、滑动、长按等手势识别
 * @author Kuro Reader Team
 */
```

### 9.2 函数/组件注释

```typescript
/**
 * 漫画卡片组件
 * 
 * @param comic - 漫画数据
 * @param variant - 卡片变体（large/grid/list）
 * @param onClick - 点击回调
 * @returns 漫画卡片 JSX
 * 
 * @example
 * ```tsx
 * <ComicCard 
 *   comic={comic} 
 *   variant="grid" 
 *   onClick={handleClick} 
 * />
 * ```
 */
export const ComicCard: React.FC<ComicCardProps> = ({ comic, variant, onClick }) => {
  // ...
};
```

### 9.3 行内注释

```typescript
// 解释"为什么"而非"是什么"

// 使用 requestAnimationFrame 确保翻页动画流畅
// 避免在滚动事件中直接操作状态导致卡顿
const animatePageTurn = () => {
  requestAnimationFrame(() => {
    setPage(nextPage);
  });
};
```

### 9.4 TODO 注释

```typescript
// TODO: [类型] [描述] [负责人] [截止日期]
// TODO: feat 添加双页阅读模式支持 @team 2024-03-01
// FIXME: bug 修复 iOS 上滑动冲突问题 @team 2024-02-15
// HACK: temp 临时方案，后续优化 @team 2024-02-20
```

---

## 10. Git 提交规范

### 10.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 10.2 Type 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（非 feat/fix） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖更新 |
| `ci` | CI/CD 配置 |
| `revert` | 回滚提交 |

### 10.3 示例

```
feat(reader): 添加横向翻页模式支持

- 实现左右滑动翻页手势
- 添加翻页动画效果
- 支持点击左右区域翻页

Closes #123
```

```
fix(import): 修复大文件导入时内存溢出

- 使用分块读取替代全量加载
- 添加导入进度反馈
- 优化 Blob URL 内存管理

Fixes #456
```

---

## 11. ESLint 配置

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "rules": {
    // 禁止硬编码检测
    "no-magic-numbers": ["error", { "ignore": [0, 1, -1] }],
    
    // TypeScript 严格规则
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    
    // React 规则
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // 导入排序
    "import/order": ["error", {
      "groups": [
        ["builtin", "external"],
        "internal",
        ["parent", "sibling", "index"]
      ],
      "pathGroups": [
        { "pattern": "react", "group": "external", "position": "before" },
        { "pattern": "@/**", "group": "internal" }
      ],
      "newlines-between": "always",
      "alphabetize": { "order": "asc", "caseInsensitive": true }
    }],
    
    // 其他
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "prefer-const": "error",
    "eqeqeq": ["error", "always"]
  }
}
```

---

## 12. 代码审查清单

提交代码前，必须自检以下项目：

### 12.1 硬性检查（必须全部通过）

- [ ] **无硬编码**：所有字面量值都来自配置、常量或 props
- [ ] **无 Mock 数据**：业务代码不包含测试数据
- [ ] **类型完整**：所有函数参数、返回值、组件 props 都有类型
- [ ] **无 any**：未使用 `any` 类型
- [ ] **错误处理**：所有异步操作都有错误处理

### 12.2 质量检查（建议通过）

- [ ] **命名规范**：遵循命名规范
- [ ] **导入排序**：导入按规范排序
- [ ] **可访问性**：图片有 alt、按钮有 aria-label
- [ ] **响应式**：组件在移动端和桌面端正常显示
- [ ] **性能优化**：必要时使用 useMemo/useCallback
- [ ] **清理副作用**：组件卸载时清理副作用
- [ ] **注释完整**：复杂逻辑有解释性注释
- [ ] **测试覆盖**：核心逻辑有单元测试

---

## 13. 违规处理

| 违规级别 | 处理方式 |
|---------|---------|
| **严重**（硬编码、Mock 数据混入业务代码、使用 any） | **必须重写**，不允许合并 |
| **重要**（命名不规范、缺少类型、缺少错误处理） | 要求修改，审核通过后合并 |
| **一般**（注释缺失、导入排序错误） | 建议修改，可后续优化 |

---

## 14. 附录

### 14.1 常用常量文件模板

```typescript
// src/constants/config.ts
export const APP_CONFIG = {
  name: 'Kuro Reader',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: ['.zip', '.cbz', '.rar', '.cbr'] as const,
  defaultTheme: 'light' as const,
  paperMode: {
    defaultIntensity: 50,
    minIntensity: 0,
    maxIntensity: 100,
  },
  reader: {
    preloadPages: 3,
    swipeThreshold: 50,
    doubleTapDelay: 300,
  },
} as const;

// src/constants/routes.ts
export const ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  COMIC_DETAIL: '/comic/:id',
  READER: '/reader/:comicId/:chapterId?',
  IMPORT: '/import',
  CUSTOM_CLOUD: '/import/custom-cloud',
  SETTINGS: '/settings',
  STATS: '/stats',
  PROFILE: '/profile',
  SEARCH: '/search',
  BATCH: '/batch',
} as const;

// src/constants/storage.ts
export const STORAGE_KEYS = {
  SETTINGS: 'kuro-reader-settings',
  PROGRESS: 'kuro-reader-progress',
  STATS: 'kuro-reader-stats',
  THEME: 'kuro-reader-theme',
} as const;

// src/constants/errors.ts
export const ERROR_MESSAGES = {
  IMPORT: {
    FILE_TOO_LARGE: '文件大小超过限制',
    UNSUPPORTED_FORMAT: '不支持的文件格式',
    CORRUPTED_FILE: '文件已损坏',
    NO_IMAGES_FOUND: '未找到图片文件',
  },
  STORAGE: {
    QUOTA_EXCEEDED: '存储空间不足',
    READ_ERROR: '读取数据失败',
    WRITE_ERROR: '写入数据失败',
  },
  NETWORK: {
    TIMEOUT: '请求超时',
    OFFLINE: '网络连接不可用',
  },
} as const;
```

### 14.2 环境变量模板

```bash
# .env
VITE_APP_NAME=Kuro Reader
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=
VITE_ENABLE_MOCK=false
VITE_DEBUG=false
```
