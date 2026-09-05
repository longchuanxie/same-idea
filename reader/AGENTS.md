# Kuro Reader - AI 协作规范 (AGENTS.md)

本文档定义了 AI 助手（Agent）参与 Kuro Reader 项目开发时的协作规范、行为准则和工作流程。所有 AI 生成的代码、文档和决策都必须遵循本规范。

---

## 1. 核心原则

### 1.1 代码质量优先
- 生成的代码必须是**生产就绪**的，而非原型或草稿
- 遵循项目已定义的架构和组件分层（Atomic Design）
- 类型安全：TypeScript 类型必须完整、准确，禁止 `any`
- 性能意识：避免不必要的重渲染、内存泄漏
- 必须代码编译通过，不能有语法错误或类型检查错误

### 1.2 上下文感知
- 在编写代码前，必须阅读相关文档（PRD.md、ARCHITECTURE.md、COMPONENTS.md）
- 遵循已有的设计系统 Token（颜色、字体、间距）
- 复用已有的原子组件，不重复造轮子
- 保持代码风格与现有代码一致

### 1.3 渐进式交付
- 按功能模块独立交付，确保每个模块可独立验证
- 先写类型定义，再写实现逻辑
- 先写核心功能，再写边缘场景
- 每完成一个模块，必须更新任务状态

---

## 2. 禁止事项（Hard Constraints）

### 2.1 禁止硬编码（No Hardcoding）

**定义**：将本应是配置、常量或数据驱动的值直接写入业务逻辑代码中。

**禁止示例**：
```typescript
// ❌ 禁止：硬编码颜色
<div className="bg-[#fdf8f8]">

// ❌ 禁止：硬编码尺寸
<div className="w-[720px]">

// ❌ 禁止：硬编码文案
<h1>Kuro Reader</h1>

// ❌ 禁止：硬编码数值
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ❌ 禁止：硬编码路由路径
navigate('/settings');

// ❌ 禁止：硬编码 API 端点
const API_URL = 'https://api.example.com';
```

**正确做法**：
```typescript
// ✅ 正确：使用设计系统 Token
<div className="bg-background">

// ✅ 正确：使用 Tailwind 配置值
<div className="max-w-max-width-content">

// ✅ 正确：使用国际化/常量文件
<h1>{t('app.name')}</h1>

// ✅ 正确：使用配置文件
import { APP_CONFIG } from '@/constants/config';
const maxFileSize = APP_CONFIG.import.maxFileSize;

// ✅ 正确：使用路由常量
import { ROUTES } from '@/constants/routes';
navigate(ROUTES.SETTINGS);
```

### 2.2 禁止在业务代码中掺杂 Mock 数据（No Mock Data in Business Code）

**定义**：将用于测试的虚假数据直接写入组件、Hook 或服务的实现代码中。

**禁止示例**：
```typescript
// ❌ 禁止：组件内部使用 mock 数据
const HomePage = () => {
  const comics = [
    { id: '1', title: '葬送的芙莉莲', author: '山田钟人' },
    { id: '2', title: '迷宫饭', author: '九井谅子' },
  ];
  return <CollectionGrid comics={comics} />;
};

// ❌ 禁止：Hook 内部返回 mock 数据
const useLibrary = () => {
  return {
    comics: MOCK_COMICS, // 假数据
    isLoading: false,
  };
};

// ❌ 禁止：Service 层返回 mock 数据
class StorageService {
  async getAllComics() {
    return Promise.resolve(MOCK_COMICS);
  }
}
```

**正确做法**：
```typescript
// ✅ 正确：组件从 props 或 store 获取数据
const HomePage = () => {
  const { comics, isLoading } = useLibraryStore();
  if (isLoading) return <Skeleton />;
  return <CollectionGrid comics={comics} />;
};

// ✅ 正确：Mock 数据隔离在 __mocks__ 目录
// src/__mocks__/comics.ts
export const mockComics: Comic[] = [/* ... */];

// ✅ 正确：仅在测试文件或开发工具中使用 mock
// src/hooks/__tests__/useLibrary.test.ts
import { mockComics } from '@/__mocks__/comics';

// ✅ 正确：开发环境通过 MSW 或独立 dev server 提供 mock
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
export const handlers = [
  http.get('/api/comics', () => HttpResponse.json(mockComics)),
];
```

### 2.3 禁止其他反模式

| 反模式 | 说明 | 正确做法 |
|--------|------|---------|
| 魔法数字 | 代码中直接出现未解释的数值 | 使用命名常量 |
| 魔法字符串 | 代码中直接出现未解释的字符串 | 使用枚举或常量 |
| 深层嵌套 | 超过 3 层的条件/回调嵌套 | 提前返回、抽取函数 |
| 重复代码 | 相同逻辑在多处出现 | 抽取为工具函数或组件 |
| 过度组件化 | 将简单逻辑拆分为过多小组件 | 合理平衡，内联简单逻辑 |
| 忽略错误处理 | 不处理 Promise reject、不验证输入 | 统一错误处理、输入校验 |
| 直接操作 DOM | 使用 querySelector 等原生 API | 使用 React ref 和状态 |

---

## 3. 工作流规范

### 3.1 任务接收与确认

当接收到开发任务时，AI 必须：

1. **阅读相关文档**：
   - PRD.md（需求）
   - ARCHITECTURE.md（架构）
   - COMPONENTS.md（组件规范）
   - 本文件 AGENTS.md（协作规范）

2. **确认理解**：
   - 复述任务目标
   - 列出涉及的文件和组件
   - 识别潜在的技术难点

3. **制定计划**：
   - 使用 TodoWrite 工具创建任务列表
   - 按依赖关系排序
   - 估算每个子任务的复杂度

### 3.2 代码生成规范

#### 3.2.1 文件创建顺序

```
1. 类型定义（types/*.ts）
2. 常量/配置（constants/*.ts）
3. 工具函数（utils/*.ts）
4. 服务层（services/*.ts）
5. Store 层（stores/*.ts）
6. Hooks（hooks/*.ts）
7. 原子组件（components/atoms/*.tsx）
8. 分子组件（components/molecules/*.tsx）
9. 有机体组件（components/organisms/*.tsx）
10. 页面组件（pages/*/*.tsx）
```

#### 3.2.2 文件内容规范

每个文件必须包含：

```typescript
// 1. 导入（按顺序：外部库 → 内部绝对路径 → 内部相对路径）
import React from 'react';
import { useStore } from '@/stores/useStore';
import { Button } from '../atoms/Button';

// 2. 类型定义（如未在 types/ 中定义）
interface Props {
  // ...
}

// 3. 常量（文件级）
const DEFAULT_VALUE = 'default';

// 4. 组件/函数实现
export const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // 4.1 Hooks 调用
  const store = useStore();
  
  // 4.2 派生状态
  const computed = useMemo(() => /* ... */, [dep]);
  
  // 4.3 回调函数
  const handleClick = useCallback(() => {
    // ...
  }, [dep]);
  
  // 4.4 渲染
  return (
    <div>
      {/* ... */}
    </div>
  );
};

// 5. 默认导出（如需要）
export default Component;
```

#### 3.2.3 命名规范

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 组件 | PascalCase | `Button`, `TopAppBar` |
| Hook | camelCase + use 前缀 | `useReader`, `useLibrary` |
| Store | camelCase + use 前缀 | `useAppStore` |
| 类型/接口 | PascalCase | `Comic`, `ReadingProgress` |
| 工具函数 | camelCase | `formatDate`, `generateId` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `APP_NAME` |
| 枚举 | PascalCase + 成员 UPPER | `Theme.LIGHT`, `Theme.DARK` |
| 文件 | 与导出同名 | `Button.tsx` 导出 `Button` |

### 3.3 代码审查清单

生成代码后，AI 必须自我检查以下项目：

- [ ] **无硬编码**：所有字面量值都来自配置、常量或 props
- [ ] **无 Mock 数据**：业务代码不包含测试数据
- [ ] **类型完整**：所有函数参数、返回值、组件 props 都有类型
- [ ] **无 any**：未使用 `any` 类型（必要时使用 `unknown` + 类型守卫）
- [ ] **错误处理**：所有异步操作都有 try/catch 或错误边界
- [ ] **可访问性**：图片有 alt、按钮有 aria-label、颜色对比度合规
- [ ] **响应式**：组件在移动端和桌面端都能正常显示
- [ ] **性能**：使用 useMemo/useCallback 优化重渲染（必要时）
- [ ] **清理**：组件卸载时清理副作用（定时器、事件监听、Blob URL）

---

## 4. 文档维护规范

### 4.1 代码变更同步

当修改以下文件时，必须同步更新对应文档：

| 代码变更 | 需更新的文档 |
|---------|------------|
| 新增/修改页面 | PRD.md（功能模块章节） |
| 新增/修改组件 | COMPONENTS.md（组件清单） |
| 新增/修改路由 | ARCHITECTURE.md（路由设计章节） |
| 新增/修改类型 | ARCHITECTURE.md（数据模型章节） |
| 新增/修改配置 | ARCHITECTURE.md（技术栈章节） |

### 4.2 注释规范

- **文件头注释**：说明文件用途
  ```typescript
  /**
   * 阅读器手势处理 Hook
   * 支持点击、滑动、长按等手势识别
   */
  ```

- **复杂逻辑注释**：解释"为什么"而非"是什么"
  ```typescript
  // 使用 requestAnimationFrame 确保翻页动画流畅
  // 避免在滚动事件中直接操作状态导致卡顿
  ```

- **TODO 注释**：标记待办事项，格式统一
  ```typescript
  // TODO: 添加双页阅读模式支持
  // FIXME: 修复 iOS 上滑动冲突问题
  ```

---

## 5. 协作沟通规范

### 5.1 任务汇报格式

完成任务后，AI 必须提供以下信息：

```markdown
## 任务完成报告

### 完成内容
- 文件 1：`src/components/atoms/Button.tsx`
- 文件 2：`src/components/atoms/Button.test.tsx`

### 关键决策
- 使用 variant + size 组合模式，而非多个独立 props
- 图标位置通过 iconPosition 控制，默认左侧

### 待确认事项
- 禁用状态的透明度值（当前 0.5）是否符合设计规范？

### 下一步建议
- 继续开发 Icon 组件（Button 的依赖）
```

### 5.2 问题上报

遇到以下情况时，AI 必须暂停并上报：

- 需求文档（PRD）与原型文件不一致
- 技术实现遇到未预见的障碍
- 需要引入新的依赖库
- 发现现有代码存在严重问题

上报格式：
```markdown
## 问题上报

**类型**：需求冲突 / 技术障碍 / 依赖申请 / 代码问题

**描述**：...

**影响**：...

**建议方案**：
1. 方案 A：...
2. 方案 B：...

**需要决策**：...
```

---

## 6. 文件模板

### 6.1 新组件模板

```typescript
// src/components/atoms/ComponentName.tsx

import React from 'react';
import { cn } from '@/utils/cn';

export interface ComponentNameProps {
  /** 组件变体 */
  variant?: 'default' | 'primary' | 'secondary';
  /** 子元素 */
  children?: React.ReactNode;
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * ComponentName 组件
 * 
 * @description 简要描述组件用途
 * @example
 * ```tsx
 * <ComponentName variant="primary" onClick={handleClick}>
 *   按钮文本
 * </ComponentName>
 * ```
 */
export const ComponentName: React.FC<ComponentNameProps> = ({
  variant = 'default',
  children,
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'base-classes',
        variant === 'primary' && 'primary-classes',
        variant === 'secondary' && 'secondary-classes',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default ComponentName;
```

### 6.2 新 Hook 模板

```typescript
// src/hooks/useHookName.ts

import { useState, useCallback } from 'react';

export interface UseHookNameReturn {
  /** 当前值 */
  value: string;
  /** 设置值 */
  setValue: (value: string) => void;
  /** 重置 */
  reset: () => void;
}

/**
 * useHookName Hook
 * 
 * @description 简要描述 Hook 用途
 * @param initialValue - 初始值
 * @returns 状态和操作方法
 */
export const useHookName = (initialValue: string = ''): UseHookNameReturn => {
  const [value, setValue] = useState(initialValue);
  
  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  return { value, setValue, reset };
};

export default useHookName;
```

### 6.3 新 Store 模板

```typescript
// src/stores/useFeatureStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeatureState {
  // State
  items: Item[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      items: [],
      isLoading: false,
      error: null,
      
      addItem: (item) => set((state) => ({
        items: [...state.items, item],
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'feature-storage',
    }
  )
);

export default useFeatureStore;
```

---

## 7. 附录

### 7.1 常用工具函数

```typescript
// src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名
 * 自动处理类名冲突（后者覆盖前者）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 7.2 常量文件结构

```typescript
// src/constants/config.ts
export const APP_CONFIG = {
  name: 'Kuro Reader',
  version: '1.0.0',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedFormats: ['.zip', '.cbz', '.rar', '.cbr'] as const,
  defaultTheme: 'light' as const,
  paperMode: {
    defaultIntensity: 50,
    minIntensity: 0,
    maxIntensity: 100,
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
} as const;
```

### 7.3 快速检查命令

```bash
# 类型检查
npm run type-check

# 代码规范检查
npm run lint

# 格式化检查
npm run format:check

# 单元测试
npm run test

# 构建测试
npm run build
```
