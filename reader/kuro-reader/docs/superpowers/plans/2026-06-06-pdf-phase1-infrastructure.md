# Phase 1: PDF 支持基础设施 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建多格式适配器骨架（BookParser 接口、Storage Repo 拆分、类型扩展、Vitest 测试基础设施），现有漫画功能行为完全不变。

**Architecture:** Adapter Pattern。把现有 `archiveParser.ts` 重构为 `ComicArchiveParser` 类实现 `BookParser` 接口；拆分 `storageService.ts` 为 `comicRepo` / `pageRepo` / `bookFileRepo` 三个 repo；扩展 `Comic.format` / `Chapter.pageRefs` / `ReadingProgress.locator` 为可选字段实现零迁移；旧 import 路径通过 re-export 保留。

**Tech Stack:** TypeScript 5.3, Vitest（新引入）, React 18, Zustand 4.4, idb 8

**Parent Spec:** `docs/superpowers/specs/2026-06-06-pdf-support-design.md`

**Scope:** 仅 Phase 1（基础设施）。Phase 2-6 后续单独成计划。

---

## 验证策略

- 每个 Task 写 Vitest 单元测试，TDD 严格走「红→绿→重构→提交」
- 全部完成后跑：
  - `npm run lint` — 0 warning
  - `npm run typecheck`（本计划新增此脚本）— 通过
  - `npm test` — 全绿
  - `npm run build` — 通过
- **手动回归**：用 dev server 导入 .zip 和 .cbz 各一本，确认书架/封面/阅读完全正常

---

## 文件结构

### 新增文件

```
src/
  utils/
    fileType.ts                          # 统一 getExtension/isImageFile/isArchiveFile 等
    fileType.test.ts                     # 单测
    extractTitle.ts                      # 从 archiveParser 抽出 extractTitleFromFileName
    extractTitle.test.ts                 # 单测
  services/
    parsers/
      types.ts                           # BookParser / ParsedBook / 相关类型
      types.test.ts                      # 接口形状测试
      comicArchiveParser.ts              # 包装现有 archiveParser 的 BookParser 实现
      comicArchiveParser.test.ts         # 单测
      index.ts                           # getParserForFile 分发器
      index.test.ts                      # 单测
    storage/
      db.ts                              # IDB 连接（从 storageService.ts 迁出，v3 不动）
      comicRepo.ts                       # Comic + Cover CRUD
      pageRepo.ts                        # Pages CRUD
      bookFileRepo.ts                    # 原始文件 CRUD（本 Phase 创建空壳，v4 在 Phase 3 加）
      index.ts                           # 统一出口 + 旧 db.* 扁平 API re-export
      comicRepo.test.ts
      pageRepo.test.ts
      bookFileRepo.test.ts
vitest.config.ts                         # Vitest 配置（含 jsdom + path alias）
src/test/setup.ts                        # 全局测试 setup（fake-indexeddb 等）
```

### 修改文件

```
package.json                              # 加 vitest / @vitest/* / jsdom / fake-indexeddb / typecheck script
src/services/archiveParser.ts             # 改为薄 re-export 转发到 services/parsers/comicArchiveParser
src/services/storageService.ts            # 改为薄 re-export 转发到 services/storage
src/types/index.ts                        # 加 BookFormat / PageRef / Comic.format / Chapter.pageRefs / ReadingProgress.locator
src/pages/Import/index.tsx                # 用 utils/fileType 替换本地重复定义
src/constants/config.ts                   # 加 pdf 配置块（值定义，不引用）
.eslintrc.cjs                              # 加 *.test.ts(x) 忽略 noUnusedLocals 等
```

**保持不动**：`useLibraryStore`、`useReaderStore`、`Reader/index.tsx`、`Library`、`Settings`、所有 `components/*`、所有路由。

---

## Task 1: 引入 Vitest 测试基础设施

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/test/smoke.test.ts`
- Modify: `tsconfig.json`（加 vitest types）
- Modify: `.eslintrc.cjs`

- [ ] **Step 1: 安装依赖**

Run:

```bash
npm install --save-dev vitest @vitest/ui jsdom fake-indexeddb @testing-library/react @testing-library/jest-dom
```

Expected: package.json devDependencies 多出上述 6 个包。

- [ ] **Step 2: 修改 package.json 加 scripts**

修改 `package.json` 的 `scripts` 块：

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 3: 创建 vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
```

- [ ] **Step 4: 创建 src/test/setup.ts**

```typescript
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
```

- [ ] **Step 5: 修改 tsconfig.json 加 vitest types**

把 `compilerOptions.types` 加上（如不存在则新增字段）：

```json
"types": ["vitest/globals", "@testing-library/jest-dom"]
```

并把 `src/test/**` 加入 `include`（如果当前是 `"include": ["src"]` 则无需改，因为已包含）。

- [ ] **Step 6: 修改 .eslintrc.cjs 让测试文件宽松**

在 `overrides` 数组（不存在则新建）加入：

```javascript
overrides: [
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
],
```

- [ ] **Step 7: 写一个冒烟测试 src/test/smoke.test.ts**

```typescript
import { describe, it, expect } from 'vitest'

describe('vitest smoke', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2)
  })

  it('jsdom is available', () => {
    const el = document.createElement('div')
    el.textContent = 'hello'
    expect(el.textContent).toBe('hello')
  })

  it('fake-indexeddb is wired', () => {
    expect(typeof indexedDB).toBe('object')
    expect(indexedDB).not.toBeUndefined()
  })
})
```

- [ ] **Step 8: 跑测试验证**

Run: `npm test`
Expected: 3 passed (smoke.test.ts), 0 failed.

- [ ] **Step 9: 跑 lint + typecheck + build 验证未破坏现有项目**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: 全部 0 error / 0 warning。

- [ ] **Step 10: 提交**

```bash
git add package.json package-lock.json vitest.config.ts src/test/ tsconfig.json .eslintrc.cjs
git commit -m "chore: introduce vitest + jsdom + fake-indexeddb test infrastructure

为 PDF 支持基础设施（Phase 1）准备 TDD 环境。
- vitest + @vitest/ui（测试运行）
- jsdom（DOM 模拟）
- fake-indexeddb（IDB 测试）
- @testing-library/react + jest-dom（组件测试预留）
- npm test / npm run typecheck 新脚本
- 冒烟测试 3 个，全部通过"
```

---

## Task 2: 抽取 utils/fileType.ts（消除重复定义）

**Files:**

- Create: `src/utils/fileType.ts`
- Create: `src/utils/fileType.test.ts`

**背景**：当前 `getFileExtension` / `isImageFile` 在 `src/services/archiveParser.ts:14-21` 和 `src/pages/Import/index.tsx:14-25` 各有一份。本 Task 抽出公共版本，Task 3-4 替换两处调用。

- [ ] **Step 1: 写失败测试 src/utils/fileType.test.ts**

```typescript
import { describe, it, expect } from 'vitest'
import {
  getFileExtension,
  isImageFile,
  isArchiveFile,
  isPdfFile,
  isSupportedBookFile,
  IMAGE_EXTENSIONS,
  ARCHIVE_EXTENSIONS,
  PDF_EXTENSIONS,
} from '@/utils/fileType'

describe('getFileExtension', () => {
  it('returns lowercase extension with leading dot', () => {
    expect(getFileExtension('foo.JPG')).toBe('.jpg')
    expect(getFileExtension('a/b/c.PNG')).toBe('.png')
  })
  it('returns empty string for no extension', () => {
    expect(getFileExtension('README')).toBe('')
  })
  it('handles multi-dot filenames (last segment wins)', () => {
    expect(getFileExtension('foo.tar.gz')).toBe('.gz')
  })
  it('handles dotfile (hidden file w/o extension)', () => {
    expect(getFileExtension('.gitignore')).toBe('.gitignore')
  })
})

describe('isImageFile', () => {
  it.each(['a.jpg', 'a.JPEG', 'b.png', 'c.gif', 'd.webp', 'e.bmp', 'f.img'])(
    'recognizes %s as image',
    name => expect(isImageFile(name)).toBe(true)
  )
  it.each(['a.zip', 'a.pdf', 'a.txt', 'a'])('rejects %s', name =>
    expect(isImageFile(name)).toBe(false)
  )
})

describe('isArchiveFile', () => {
  it.each(['a.zip', 'a.CBZ', 'b.rar', 'c.cbr'])('recognizes %s as archive', name =>
    expect(isArchiveFile(name)).toBe(true)
  )
  it.each(['a.jpg', 'a.pdf', 'a.7z'])('rejects %s', name => expect(isArchiveFile(name)).toBe(false))
})

describe('isPdfFile', () => {
  it('recognizes .pdf (any case)', () => {
    expect(isPdfFile('foo.PDF')).toBe(true)
    expect(isPdfFile('foo.pdf')).toBe(true)
  })
  it('rejects others', () => {
    expect(isPdfFile('foo.zip')).toBe(false)
  })
})

describe('isSupportedBookFile', () => {
  it('accepts archives and pdf', () => {
    expect(isSupportedBookFile('a.zip')).toBe(true)
    expect(isSupportedBookFile('a.pdf')).toBe(true)
  })
  it('rejects standalone images', () => {
    expect(isSupportedBookFile('a.jpg')).toBe(false)
  })
})

describe('extension constants', () => {
  it('exports readonly sets', () => {
    expect(IMAGE_EXTENSIONS.has('.jpg')).toBe(true)
    expect(ARCHIVE_EXTENSIONS.has('.zip')).toBe(true)
    expect(PDF_EXTENSIONS.has('.pdf')).toBe(true)
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `npm test src/utils/fileType.test.ts`
Expected: FAIL，"Cannot find module '@/utils/fileType'"。

- [ ] **Step 3: 实现 src/utils/fileType.ts**

```typescript
export const IMAGE_EXTENSIONS: ReadonlySet<string> = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.img',
])

export const ARCHIVE_EXTENSIONS: ReadonlySet<string> = new Set(['.zip', '.cbz', '.rar', '.cbr'])

export const PDF_EXTENSIONS: ReadonlySet<string> = new Set(['.pdf'])

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.substring(dot).toLowerCase() : ''
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(name))
}

export function isArchiveFile(name: string): boolean {
  return ARCHIVE_EXTENSIONS.has(getFileExtension(name))
}

export function isPdfFile(name: string): boolean {
  return PDF_EXTENSIONS.has(getFileExtension(name))
}

export function isSupportedBookFile(name: string): boolean {
  return isArchiveFile(name) || isPdfFile(name)
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `npm test src/utils/fileType.test.ts`
Expected: 全绿（约 20+ test cases）。

- [ ] **Step 5: typecheck + lint**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: 0 error。

- [ ] **Step 6: 提交**

```bash
git add src/utils/fileType.ts src/utils/fileType.test.ts
git commit -m "feat(utils): add fileType helpers with isImageFile/isArchiveFile/isPdfFile

为消除 archiveParser.ts 和 Import/index.tsx 中重复定义的
getFileExtension / isImageFile / IMAGE_EXTENSIONS 做准备。
新增 isPdfFile / isSupportedBookFile 为 PDF 支持铺路。
TDD: 20+ test cases 覆盖大小写、点文件、多扩展名等边界。"
```

---

## Task 3: 抽取 utils/extractTitle.ts

**Files:**

- Create: `src/utils/extractTitle.ts`
- Create: `src/utils/extractTitle.test.ts`

**背景**：`extractTitleFromFileName` 在 `src/services/archiveParser.ts:62-74`。后续 `pdfParser` 也要用，提前抽出。

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect } from 'vitest'
import { extractTitleFromFileName } from '@/utils/extractTitle'

describe('extractTitleFromFileName', () => {
  it('strips extension', () => {
    expect(extractTitleFromFileName('葬送的芙莉莲.zip')).toBe('葬送的芙莉莲')
    expect(extractTitleFromFileName('book.pdf')).toBe('book')
  })
  it('extracts content from chinese brackets【】', () => {
    expect(extractTitleFromFileName('【漫画】葬送的芙莉莲.zip')).toBe('漫画')
  })
  it('extracts content from square brackets []', () => {
    expect(extractTitleFromFileName('[group]title.zip')).toBe('group')
  })
  it('strips leading bracket-like chars when no bracket pair', () => {
    expect(extractTitleFromFileName('  title.zip')).toBe('title')
  })
  it('falls back to original filename when result empty', () => {
    expect(extractTitleFromFileName('.zip')).toBe('.zip')
  })
  it('handles no extension', () => {
    expect(extractTitleFromFileName('plain')).toBe('plain')
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `npm test src/utils/extractTitle.test.ts`
Expected: FAIL「Cannot find module」。

- [ ] **Step 3: 实现 src/utils/extractTitle.ts**

直接从 `src/services/archiveParser.ts:62-74` 拷贝逻辑：

```typescript
const BRACKET_PATTERN = /[【[](.+?)[】\]]/
const LEADING_CHARS_PATTERN = /^[[\]【】\s]+/u

export function extractTitleFromFileName(fileName: string): string {
  let title = fileName.replace(/\.[^.]+$/, '')
  const bracketMatch = title.match(BRACKET_PATTERN)
  if (bracketMatch) {
    title = bracketMatch[1].trim()
  } else {
    title = title.replace(LEADING_CHARS_PATTERN, '').trim()
  }
  return title || fileName
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `npm test src/utils/extractTitle.test.ts`
Expected: 全绿（6 cases）。

- [ ] **Step 5: lint + typecheck**

Run: `npm run lint && npm run typecheck`
Expected: 0 error。

- [ ] **Step 6: 提交**

```bash
git add src/utils/extractTitle.ts src/utils/extractTitle.test.ts
git commit -m "feat(utils): extract extractTitleFromFileName from archiveParser

为多格式 parser 复用准备。逻辑与 archiveParser.ts:62-74 完全一致，
6 个测试覆盖各种命名约定（中英文括号、前缀空格、回退情况）。"
```

---

## Task 4: 类型系统扩展（Comic.format / PageRef / locator）

**Files:**

- Modify: `src/types/index.ts`
- Create: `src/types/index.test.ts`

- [ ] **Step 1: 先看现有 src/types/index.ts**

Run: 阅读 `src/types/index.ts` 全文，确认 `Comic`、`Chapter`、`ReadingProgress` 三个 interface 的精确位置。

- [ ] **Step 2: 写失败测试 src/types/index.test.ts**

```typescript
import { describe, it, expect, expectTypeOf } from 'vitest'
import type { Comic, Chapter, ReadingProgress, BookFormat, PageRef } from '@/types'

describe('BookFormat type', () => {
  it('accepts comic and pdf literals', () => {
    const a: BookFormat = 'comic'
    const b: BookFormat = 'pdf'
    expect(a).toBe('comic')
    expect(b).toBe('pdf')
  })
})

describe('PageRef discriminated union', () => {
  it('image variant has index', () => {
    const ref: PageRef = { kind: 'image', index: 0 }
    expect(ref.kind).toBe('image')
    if (ref.kind === 'image') {
      expectTypeOf(ref.index).toBeNumber()
    }
  })

  it('pdf-page variant has pageNumber', () => {
    const ref: PageRef = { kind: 'pdf-page', pageNumber: 1 }
    expect(ref.kind).toBe('pdf-page')
    if (ref.kind === 'pdf-page') {
      expectTypeOf(ref.pageNumber).toBeNumber()
    }
  })
})

describe('Comic.format backward compatibility', () => {
  it('format is optional (legacy comics have no format field)', () => {
    const legacy: Comic = {
      id: '1',
      title: 't',
      cover: '',
      chapters: [],
      totalChapters: 0,
      createdAt: 0,
      updatedAt: 0,
    } as Comic
    expect(legacy.format).toBeUndefined()
  })

  it('format can be set to pdf', () => {
    const c: Partial<Comic> = { format: 'pdf' }
    expect(c.format).toBe('pdf')
  })
})

describe('Chapter.pageRefs is optional', () => {
  it('omitted pageRefs is allowed', () => {
    const c: Partial<Chapter> = {
      id: 'a',
      comicId: 'b',
      number: 1,
      title: 't',
      pages: ['1.jpg'],
      status: 'completed',
    }
    expect(c.pageRefs).toBeUndefined()
  })

  it('pageRefs accepts PageRef[]', () => {
    const c: Partial<Chapter> = {
      pageRefs: [{ kind: 'pdf-page', pageNumber: 1 }],
    }
    expect(c.pageRefs?.[0].kind).toBe('pdf-page')
  })
})

describe('ReadingProgress.locator is optional', () => {
  it('omitted locator is allowed', () => {
    const p: Partial<ReadingProgress> = { comicId: 'a', chapterId: 'b', page: 1 }
    expect(p.locator).toBeUndefined()
  })
})
```

- [ ] **Step 3: 跑测试验证失败**

Run: `npm test src/types/index.test.ts`
Expected: FAIL「BookFormat / PageRef not exported」类编译错误。

- [ ] **Step 4: 修改 src/types/index.ts 加新类型**

在文件**顶部**（Comic 之前）追加：

```typescript
/**
 * 书籍格式判别。
 * - 'comic'：传统漫画（图片序列，来自 zip/cbz/rar/cbr/散图）
 * - 'pdf'：PDF 文档（Phase 4 起支持）
 */
export type BookFormat = 'comic' | 'pdf'

/**
 * 页面引用（联合类型）。
 * 渲染器根据 kind 分派到对应实现。
 */
export type PageRef = { kind: 'image'; index: number } | { kind: 'pdf-page'; pageNumber: number }
```

在现有 `Comic` interface **末尾追加**字段：

```typescript
  /** 书籍格式。undefined 视为 'comic' 以兼容旧数据。 */
  format?: BookFormat
```

在现有 `Chapter` interface **末尾追加**字段：

```typescript
  /** 结构化页面引用。漫画可选（缺失时按 pages.length + index 推导）；PDF 必填。 */
  pageRefs?: PageRef[]
```

在现有 `ReadingProgress` interface **末尾追加**字段：

```typescript
  /** EPUB CFI 或其他富定位符。Phase 1 不消费，预留给 EPUB。 */
  locator?: string
```

- [ ] **Step 5: 跑测试验证通过**

Run: `npm test src/types/index.test.ts`
Expected: 全绿。

- [ ] **Step 6: 跑全量 typecheck 确认未破坏现有代码**

Run: `npm run typecheck`
Expected: 0 error。

新增字段都是 optional，旧代码完全兼容。

- [ ] **Step 7: lint**

Run: `npm run lint`
Expected: 0 warning。

- [ ] **Step 8: 提交**

```bash
git add src/types/index.ts src/types/index.test.ts
git commit -m "feat(types): add BookFormat / PageRef / Comic.format / Chapter.pageRefs / ReadingProgress.locator

为多格式支持扩展类型系统。所有新字段都是 optional，
旧 Comic 数据零迁移（format === undefined 视为 'comic'）。
PageRef 用判别联合，TypeScript 友好。
locator 为 EPUB 预留，Phase 1 不消费。"
```

---

## Task 5: 定义 BookParser / ParsedBook 接口

**Files:**

- Create: `src/services/parsers/types.ts`
- Create: `src/services/parsers/types.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect, expectTypeOf } from 'vitest'
import type { BookParser, ParsedBook, ParserProgressCallback } from '@/services/parsers/types'
import type { BookFormat, PageRef } from '@/types'

describe('ParsedBook shape', () => {
  it('common fields are required', () => {
    const p: ParsedBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
    }
    expect(p.format).toBe('comic')
  })

  it('comic-specific fields are optional', () => {
    const p: ParsedBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
      imagePages: [new Blob()],
      imagePageNames: ['1.jpg'],
      pageRefs: [{ kind: 'image', index: 0 }],
    }
    expect(p.imagePages?.length).toBe(1)
  })

  it('pdf-specific fields are optional', () => {
    const p: ParsedBook = {
      format: 'pdf',
      title: 't',
      coverBlob: new Blob(),
      pdfFile: new Blob(),
      pdfTotalPages: 100,
      pageRefs: [{ kind: 'pdf-page', pageNumber: 1 }],
    }
    expect(p.pdfTotalPages).toBe(100)
  })
})

describe('BookParser interface', () => {
  it('requires canParse and parse', () => {
    const p: BookParser = {
      canParse: f => f.name.endsWith('.test'),
      parse: async () => ({
        format: 'comic' as BookFormat,
        title: 'x',
        coverBlob: new Blob(),
      }),
    }
    expect(p.canParse(new File([], 'a.test'))).toBe(true)
  })

  it('parseStreaming is optional', () => {
    const p: BookParser = {
      canParse: () => true,
      parse: async () => ({ format: 'comic', title: '', coverBlob: new Blob() }),
    }
    expect(p.parseStreaming).toBeUndefined()
  })
})

describe('ParserProgressCallback signature', () => {
  it('accepts number 0-100', () => {
    const cb: ParserProgressCallback = pct => {
      expectTypeOf(pct).toBeNumber()
    }
    cb(50)
  })
})

// 类型层面的判别测试
describe('PageRef inside ParsedBook', () => {
  it('image variant narrows', () => {
    const ref: PageRef = { kind: 'image', index: 3 }
    if (ref.kind === 'image') {
      expect(ref.index).toBe(3)
    }
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `npm test src/services/parsers/types.test.ts`
Expected: FAIL「Cannot find module」。

- [ ] **Step 3: 实现 src/services/parsers/types.ts**

```typescript
import type { BookFormat, PageRef } from '@/types'

/**
 * Parser 进度回调，pct 取值 0-100。
 */
export type ParserProgressCallback = (pct: number) => void

/**
 * Parser 输出的统一结构。
 * - 通用字段：format / title / coverBlob 三者必填
 * - comic 分支：imagePages / imagePageNames 必填（其他可选）
 * - pdf 分支：pdfFile / pdfTotalPages 必填（其他可选）
 * - pageRefs 由 parser 自行生成
 */
export interface ParsedBook {
  format: BookFormat
  title: string
  coverBlob: Blob

  // comic 分支
  imagePages?: Blob[]
  imagePageNames?: string[]

  // pdf 分支
  pdfFile?: Blob
  pdfTotalPages?: number

  // 通用：结构化页面引用
  pageRefs?: PageRef[]
}

/**
 * Book Parser 适配器接口。
 * 实现类负责：
 * 1. 通过文件名判断能否解析（canParse）
 * 2. 解析为 ParsedBook（parse）
 * 3. 可选：流式解析大文件（parseStreaming）
 */
export interface BookParser {
  /** 通过文件名判断该 parser 是否能处理 */
  canParse(file: File): boolean

  /** 一次性解析（适合小文件） */
  parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook>

  /** 可选：流式解析（适合 > 50MB 大文件） */
  parseStreaming?(file: File, onProgress: ParserProgressCallback): Promise<ParsedBook>
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `npm test src/services/parsers/types.test.ts`
Expected: 全绿。

- [ ] **Step 5: typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: 0 error。

- [ ] **Step 6: 提交**

```bash
git add src/services/parsers/types.ts src/services/parsers/types.test.ts
git commit -m "feat(parsers): define BookParser interface and ParsedBook shape

Adapter Pattern 的核心契约。
- ParsedBook 通用字段（format/title/coverBlob）+ 分支可选字段
- BookParser 三个方法：canParse / parse / parseStreaming?
- ParserProgressCallback 统一进度回调签名
- 单测验证类型形状和判别联合收窄"
```

---

## Task 6: ComicArchiveParser 实现 + 替换 archiveParser.ts

**Files:**

- Create: `src/services/parsers/comicArchiveParser.ts`
- Create: `src/services/parsers/comicArchiveParser.test.ts`
- Modify: `src/services/archiveParser.ts` → 改为薄 re-export

**背景**：把现有 `parseArchiveFile` / `parseArchiveFileStreaming` / `parseImageFiles` 包装成实现 `BookParser` 接口的类。**逻辑不动**，只加一层适配。

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'

describe('ComicArchiveParser.canParse', () => {
  const parser = new ComicArchiveParser()

  it.each(['a.zip', 'a.ZIP', 'b.cbz', 'c.rar', 'd.cbr'])('accepts %s', name => {
    const f = new File([], name)
    expect(parser.canParse(f)).toBe(true)
  })

  it.each(['a.pdf', 'a.7z', 'a.txt', 'a'])('rejects %s', name => {
    const f = new File([], name)
    expect(parser.canParse(f)).toBe(false)
  })
})

describe('ComicArchiveParser.parse', () => {
  it('delegates to legacy parseArchiveFile (mocked)', async () => {
    // 这个测试只验证「ComicArchiveParser 是 thin wrapper」
    // 详细解压逻辑由现有 archiveParser 模块自己的测试（如未来加）保证
    const parser = new ComicArchiveParser()
    // 用一个极小的 ZIP 文件不现实，这里只验证 canParse 路径
    // 真正端到端测试在手动回归阶段做
    expect(typeof parser.parse).toBe('function')
    expect(typeof parser.parseStreaming).toBe('function')
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `npm test src/services/parsers/comicArchiveParser.test.ts`
Expected: FAIL「Cannot find module」。

- [ ] **Step 3: 实现 src/services/parsers/comicArchiveParser.ts**

```typescript
import type { BookParser, ParsedBook, ParserProgressCallback } from './types'
import type { PageRef } from '@/types'
import { isArchiveFile } from '@/utils/fileType'
import {
  parseArchiveFile,
  parseArchiveFileStreaming,
  parseImageFiles,
} from '@/services/archiveParser'

export class ComicArchiveParser implements BookParser {
  canParse(file: File): boolean {
    return isArchiveFile(file.name)
  }

  async parse(file: File): Promise<ParsedBook> {
    const archive = await parseArchiveFile(file)
    return this.toParseBook(archive)
  }

  async parseStreaming(file: File, onProgress: ParserProgressCallback): Promise<ParsedBook> {
    const archive = await parseArchiveFileStreaming(file, (extracted, total) => {
      const pct = total > 0 ? Math.round((extracted / total) * 100) : 0
      onProgress(pct)
    })
    return this.toParseBook(archive)
  }

  /** 散图文件夹（不走 canParse 路径，由调用方直接调用） */
  async parseImageFolder(files: File[], folderName: string): Promise<ParsedBook> {
    const archive = await parseImageFiles(files, folderName)
    return this.toParseBook(archive)
  }

  private toParseBook(archive: {
    title: string
    coverBlob: Blob | null
    pages: Blob[]
    pageNames: string[]
  }): ParsedBook {
    const pageRefs: PageRef[] = archive.pages.map((_, i) => ({
      kind: 'image' as const,
      index: i,
    }))
    return {
      format: 'comic',
      title: archive.title,
      coverBlob: archive.coverBlob ?? new Blob(),
      imagePages: archive.pages,
      imagePageNames: archive.pageNames,
      pageRefs,
    }
  }
}
```

**⚠️ 重要**：先看 `src/services/archiveParser.ts` 中 `parseArchiveFileStreaming` 的实际签名（是 `onPageExtracted` 回调？还是 `onProgress`？）。如果签名不匹配上面的代码，调整 `parseStreaming` 实现以适配。

- [ ] **Step 4: 跑测试验证通过**

Run: `npm test src/services/parsers/comicArchiveParser.test.ts`
Expected: 全绿。

- [ ] **Step 5: typecheck**

Run: `npm run typecheck`
Expected: 0 error。如有 streaming 签名不匹配，按实际签名调整。

- [ ] **Step 6: lint**

Run: `npm run lint`
Expected: 0 warning。

- [ ] **Step 7: 提交**

```bash
git add src/services/parsers/comicArchiveParser.ts src/services/parsers/comicArchiveParser.test.ts
git commit -m "feat(parsers): add ComicArchiveParser as BookParser adapter

包装现有 archiveParser 的 parseArchiveFile / parseArchiveFileStreaming / parseImageFiles 为 BookParser 实现。
逻辑完全不变，只加一层 thin wrapper + 统一返回 ParsedBook 结构。
为下一步 PDF Parser 加入做准备（共用 BookParser 接口）。"
```

---

## Task 7: Parser 分发器 getParserForFile

**Files:**

- Create: `src/services/parsers/index.ts`
- Create: `src/services/parsers/index.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect } from 'vitest'
import { getParserForFile } from '@/services/parsers'
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'

describe('getParserForFile', () => {
  it.each(['a.zip', 'a.cbz', 'a.rar', 'a.cbr'])('returns ComicArchiveParser for %s', name => {
    const parser = getParserForFile(new File([], name))
    expect(parser).toBeInstanceOf(ComicArchiveParser)
  })

  it('returns null for unsupported format (.pdf in Phase 1)', () => {
    // Phase 1 还没注册 PdfParser，所以 .pdf 应返回 null
    const parser = getParserForFile(new File([], 'a.pdf'))
    expect(parser).toBeNull()
  })

  it('returns null for unsupported format (.txt)', () => {
    expect(getParserForFile(new File([], 'a.txt'))).toBeNull()
  })

  it('case insensitive', () => {
    expect(getParserForFile(new File([], 'A.ZIP'))).toBeInstanceOf(ComicArchiveParser)
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `npm test src/services/parsers/index.test.ts`
Expected: FAIL「Cannot find module」。

- [ ] **Step 3: 实现 src/services/parsers/index.ts**

```typescript
import type { BookParser } from './types'
import { ComicArchiveParser } from './comicArchiveParser'

/**
 * 已注册的 parser 列表。
 * 按优先级排序：先匹配到的优先使用。
 * Phase 4 会插入 PdfParser。
 */
const parsers: BookParser[] = [new ComicArchiveParser()]

/**
 * 根据文件扩展名匹配合适的 parser。
 * @returns 匹配的 parser；无匹配返回 null
 */
export function getParserForFile(file: File): BookParser | null {
  return parsers.find(p => p.canParse(file)) ?? null
}

// Re-export 接口供消费方使用
export type { BookParser, ParsedBook, ParserProgressCallback } from './types'
export { ComicArchiveParser } from './comicArchiveParser'
```

- [ ] **Step 4: 跑测试验证通过**

Run: `npm test src/services/parsers/index.test.ts`
Expected: 全绿。

- [ ] **Step 5: lint + typecheck**

Run: `npm run lint && npm run typecheck`
Expected: 0 error。

- [ ] **Step 6: 提交**

```bash
git add src/services/parsers/index.ts src/services/parsers/index.test.ts
git commit -m "feat(parsers): add getParserForFile dispatcher

按扩展名匹配 BookParser，无匹配返回 null。
Phase 1 仅注册 ComicArchiveParser；Phase 4 加入 PdfParser。
Re-export 接口类型，调用方只需从 @/services/parsers 单点 import。"
```

---

## Task 8: 拆分 storageService.ts → services/storage/db.ts

**Files:**

- Create: `src/services/storage/db.ts`

**背景**：现在 `storageService.ts` 174 行包含 DB 连接 + 多 store 操作。本 Task 仅迁出 DB 连接，**保持 v3，不升级到 v4**（v4 留给 Phase 3）。

- [ ] **Step 1: 阅读现有 src/services/storageService.ts**

确认 DB 连接代码（应在文件开头）的精确行号和实现：

- `openDB` 调用
- `upgrade` 回调里的 v1/v2/v3 迁移逻辑

- [ ] **Step 2: 创建 src/services/storage/db.ts**

```typescript
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'kuro-reader-db'
const DB_VERSION = 3 // Phase 1 保持 v3；Phase 3 升 v4

export interface KuroReaderDBSchema {
  // Phase 1 暂不细化 schema 类型，沿用 storageService.ts 的 any-like 写法
}

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // 严格复制 storageService.ts 中的 upgrade 实现
        // ⚠️ 实施时直接从原文件拷贝，确保 v1/v2/v3 迁移逻辑一致
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('comics')) {
            db.createObjectStore('comics', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('pages')) {
            db.createObjectStore('pages')
          }
          if (!db.objectStoreNames.contains('covers')) {
            db.createObjectStore('covers')
          }
        }
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('sublibraries')) {
            db.createObjectStore('sublibraries', { keyPath: 'id' })
          }
        }
        if (oldVersion < 3) {
          if (!db.objectStoreNames.contains('tags')) {
            db.createObjectStore('tags', { keyPath: 'id' })
          }
        }
        // v4 由 Phase 3 加入
      },
    })
  }
  return dbPromise
}

/** 仅供测试使用：重置 db promise 单例 */
export function _resetDBForTesting(): void {
  dbPromise = null
}

export const STORE_NAMES = {
  comics: 'comics',
  pages: 'pages',
  covers: 'covers',
  sublibraries: 'sublibraries',
  tags: 'tags',
} as const
```

**⚠️ 实施注意**：上面 `upgrade` 中的逻辑要从 `src/services/storageService.ts` **逐字拷贝**，不能凭记忆改写——必须看实际文件再拷。

- [ ] **Step 3: typecheck 验证编译**

Run: `npm run typecheck`
Expected: 0 error。

注意：此时还没人调用 `getDB`，旧 `storageService.ts` 仍然各自维护 DB 连接——这是临时状态，Task 9-11 才会切换。

- [ ] **Step 4: 提交**

```bash
git add src/services/storage/db.ts
git commit -m "feat(storage): extract IDB connection to services/storage/db.ts

迁出 DB 连接和 upgrade 逻辑，保持 v3 不动。
Task 9-11 会迁移 comics/pages/covers 操作，
Phase 3 升级 v4 时只改 db.ts 一处。"
```

---

## Task 9: 实现 comicRepo（含 covers 操作）

**Files:**

- Create: `src/services/storage/comicRepo.ts`
- Create: `src/services/storage/comicRepo.test.ts`

- [ ] **Step 1: 阅读 storageService.ts 中所有 Comic / Cover 相关方法**

找出：`saveComic`、`getComic`、`getAllComics`、`deleteComic`、`saveCover`、`getCover`、`deleteCover`（或类似命名）。**精确记录签名**——后续要一一对应实现。

- [ ] **Step 2: 写失败测试**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { comicRepo } from '@/services/storage/comicRepo'
import { _resetDBForTesting } from '@/services/storage/db'
import type { Comic } from '@/types'

const makeComic = (id: string, overrides: Partial<Comic> = {}): Comic => ({
  id,
  title: `Comic ${id}`,
  cover: '',
  chapters: [],
  totalChapters: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

beforeEach(async () => {
  // fake-indexeddb 跨测试隔离
  indexedDB = new IDBFactory() as any // 来自 fake-indexeddb 全局
  _resetDBForTesting()
})

describe('comicRepo CRUD', () => {
  it('save and get a comic', async () => {
    const c = makeComic('a')
    await comicRepo.save(c)
    const got = await comicRepo.get('a')
    expect(got?.id).toBe('a')
    expect(got?.title).toBe('Comic a')
  })

  it('get returns undefined for missing id', async () => {
    expect(await comicRepo.get('nope')).toBeUndefined()
  })

  it('getAll returns all saved comics', async () => {
    await comicRepo.save(makeComic('a'))
    await comicRepo.save(makeComic('b'))
    const all = await comicRepo.getAll()
    expect(all.map(c => c.id).sort()).toEqual(['a', 'b'])
  })

  it('delete removes a comic', async () => {
    await comicRepo.save(makeComic('a'))
    await comicRepo.delete('a')
    expect(await comicRepo.get('a')).toBeUndefined()
  })
})

describe('comicRepo covers', () => {
  it('save and get a cover blob', async () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await comicRepo.saveCover('a', blob)
    const got = await comicRepo.getCover('a')
    expect(got).toBeInstanceOf(Blob)
    expect(got?.size).toBe(1)
  })

  it('getCover returns undefined for missing id', async () => {
    expect(await comicRepo.getCover('nope')).toBeUndefined()
  })

  it('deleteCover removes the blob', async () => {
    await comicRepo.saveCover('a', new Blob(['x']))
    await comicRepo.deleteCover('a')
    expect(await comicRepo.getCover('a')).toBeUndefined()
  })
})

describe('comicRepo persistence shape', () => {
  it('preserves format field (BookFormat extension)', async () => {
    await comicRepo.save(makeComic('a', { format: 'pdf' }))
    const got = await comicRepo.get('a')
    expect(got?.format).toBe('pdf')
  })

  it('legacy comic without format roundtrips', async () => {
    const legacy = makeComic('a')
    delete (legacy as Partial<Comic>).format
    await comicRepo.save(legacy)
    const got = await comicRepo.get('a')
    expect(got?.format).toBeUndefined()
  })
})
```

**注意**：测试顶部用 `indexedDB = new IDBFactory() as any` 这种全局重置。如果 fake-indexeddb 的方式不同，按 fake-indexeddb 文档调整（通常 `import 'fake-indexeddb/auto'` 已经够用，重新 `_resetDBForTesting()` 后会自动新建一个空 DB——这种情况删掉 `indexedDB = ...` 那行）。

- [ ] **Step 3: 跑测试验证失败**

Run: `npm test src/services/storage/comicRepo.test.ts`
Expected: FAIL「Cannot find module」。

- [ ] **Step 4: 实现 src/services/storage/comicRepo.ts**

```typescript
import { getDB, STORE_NAMES } from './db'
import type { Comic } from '@/types'

export const comicRepo = {
  async save(comic: Comic): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.comics, comic)
  },

  async get(id: string): Promise<Comic | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.comics, id) as Promise<Comic | undefined>
  },

  async getAll(): Promise<Comic[]> {
    const db = await getDB()
    return db.getAll(STORE_NAMES.comics) as Promise<Comic[]>
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.comics, id)
  },

  async saveCover(id: string, blob: Blob): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.covers, blob, id)
  },

  async getCover(id: string): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.covers, id) as Promise<Blob | undefined>
  },

  async deleteCover(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.covers, id)
  },
}
```

- [ ] **Step 5: 跑测试验证通过**

Run: `npm test src/services/storage/comicRepo.test.ts`
Expected: 全绿（约 9 cases）。

- [ ] **Step 6: lint + typecheck**

Run: `npm run lint && npm run typecheck`
Expected: 0 error。

- [ ] **Step 7: 提交**

```bash
git add src/services/storage/comicRepo.ts src/services/storage/comicRepo.test.ts
git commit -m "feat(storage): add comicRepo (save/get/getAll/delete + covers)

迁移 storageService.ts 中的 comics + covers 操作到独立 repo。
TDD: 9 cases 覆盖 CRUD + Comic.format 持久化兼容。
旧 storageService.ts 暂时保留双份代码，Task 12 切换调用点后再清理。"
```

---

## Task 10: 实现 pageRepo

**Files:**

- Create: `src/services/storage/pageRepo.ts`
- Create: `src/services/storage/pageRepo.test.ts`

- [ ] **Step 1: 阅读 storageService.ts 中 pages 相关方法**

找出：`savePage`、`getPage`、`saveAllPages`、`deleteAllPages`（参考 spec §5.3）。**关键**：键格式 `${comicId}/${chapterId}/${pageIndex}` 必须完全一致，否则旧数据读不出来。

- [ ] **Step 2: 写失败测试**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { pageRepo, makePageKey } from '@/services/storage/pageRepo'
import { _resetDBForTesting } from '@/services/storage/db'

beforeEach(() => {
  _resetDBForTesting()
})

describe('makePageKey', () => {
  it('produces stable key format', () => {
    expect(makePageKey('c1', 'ch1', 0)).toBe('c1/ch1/0')
    expect(makePageKey('c1', 'ch1', 99)).toBe('c1/ch1/99')
  })
})

describe('pageRepo CRUD', () => {
  it('save and get single page', async () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await pageRepo.savePage('c1', 'ch1', 0, blob)
    const got = await pageRepo.getPage('c1', 'ch1', 0)
    expect(got?.size).toBe(1)
  })

  it('getPage returns undefined for missing key', async () => {
    expect(await pageRepo.getPage('c1', 'ch1', 0)).toBeUndefined()
  })

  it('saveAllPages saves an array', async () => {
    const blobs = [new Blob(['a']), new Blob(['bb']), new Blob(['ccc'])]
    await pageRepo.saveAllPages('c1', 'ch1', blobs)
    for (let i = 0; i < 3; i++) {
      const got = await pageRepo.getPage('c1', 'ch1', i)
      expect(got?.size).toBe(i + 1)
    }
  })

  it('deleteAllPages removes all pages for a comic (cursor scan)', async () => {
    await pageRepo.saveAllPages('c1', 'ch1', [new Blob(['a']), new Blob(['b'])])
    await pageRepo.saveAllPages('c2', 'ch1', [new Blob(['c'])]) // 另一本不受影响
    await pageRepo.deleteAllPages('c1')
    expect(await pageRepo.getPage('c1', 'ch1', 0)).toBeUndefined()
    expect(await pageRepo.getPage('c1', 'ch1', 1)).toBeUndefined()
    expect(await pageRepo.getPage('c2', 'ch1', 0)?.then(b => b?.size)).toBe(1)
  })
})
```

- [ ] **Step 3: 跑测试验证失败**

Run: `npm test src/services/storage/pageRepo.test.ts`
Expected: FAIL。

- [ ] **Step 4: 实现 src/services/storage/pageRepo.ts**

```typescript
import { getDB, STORE_NAMES } from './db'

/** 页面在 pages store 中的键格式：comicId/chapterId/pageIndex */
export function makePageKey(comicId: string, chapterId: string, pageIndex: number): string {
  return `${comicId}/${chapterId}/${pageIndex}`
}

export const pageRepo = {
  async savePage(comicId: string, chapterId: string, pageIndex: number, blob: Blob): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.pages, blob, makePageKey(comicId, chapterId, pageIndex))
  },

  async getPage(comicId: string, chapterId: string, pageIndex: number): Promise<Blob | undefined> {
    const db = await getDB()
    return db.get(STORE_NAMES.pages, makePageKey(comicId, chapterId, pageIndex)) as Promise<
      Blob | undefined
    >
  },

  async saveAllPages(comicId: string, chapterId: string, blobs: Blob[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    await Promise.all(
      blobs.map((blob, i) => tx.store.put(blob, makePageKey(comicId, chapterId, i)))
    )
    await tx.done
  },

  /** 删除某 comic 所有页面（cursor 扫描前缀） */
  async deleteAllPages(comicId: string): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(STORE_NAMES.pages, 'readwrite')
    const prefix = `${comicId}/`
    let cursor = await tx.store.openCursor()
    while (cursor) {
      if (typeof cursor.key === 'string' && cursor.key.startsWith(prefix)) {
        await cursor.delete()
      }
      cursor = await cursor.continue()
    }
    await tx.done
  },
}
```

- [ ] **Step 5: 跑测试验证通过**

Run: `npm test src/services/storage/pageRepo.test.ts`
Expected: 全绿。

- [ ] **Step 6: lint + typecheck**

Run: `npm run lint && npm run typecheck`
Expected: 0 error。

- [ ] **Step 7: 提交**

```bash
git add src/services/storage/pageRepo.ts src/services/storage/pageRepo.test.ts
git commit -m "feat(storage): add pageRepo (savePage/getPage/saveAllPages/deleteAllPages)

迁移 storageService.ts 中的 pages 操作。
键格式 makePageKey() = 'comicId/chapterId/pageIndex' 与原实现完全一致，
保证旧数据库的页面继续可读。
deleteAllPages 用 cursor 扫前缀，与原实现行为一致。"
```

---

## Task 11: 实现 bookFileRepo（空壳，等 v4 接通）

**Files:**

- Create: `src/services/storage/bookFileRepo.ts`
- Create: `src/services/storage/bookFileRepo.test.ts`

**背景**：Phase 1 创建 repo 接口和测试，但**实际 IDB store 'bookFiles' 在 Phase 3 (v4) 才会创建**。所以 Phase 1 的实现要：

1. 接口已经定义好
2. 调用 `getDB()` 时如果 store 不存在，捕获错误并返回 undefined（save 报错）
3. 测试用一个**临时 v4 mock**验证逻辑——这里有两种做法

简化处理：Phase 1 **只定义接口和占位实现**，测试只验证「接口存在 + 方法签名」。真正的 IDB 操作测试在 Phase 3 完成 v4 升级后补充。

- [ ] **Step 1: 写最小测试**

```typescript
import { describe, it, expect } from 'vitest'
import { bookFileRepo } from '@/services/storage/bookFileRepo'

describe('bookFileRepo interface (Phase 1 stub)', () => {
  it('exposes save / get / delete methods', () => {
    expect(typeof bookFileRepo.save).toBe('function')
    expect(typeof bookFileRepo.get).toBe('function')
    expect(typeof bookFileRepo.delete).toBe('function')
  })

  it('save throws clear error in Phase 1 (no v4 store yet)', async () => {
    await expect(bookFileRepo.save('a', new Blob(['x']))).rejects.toThrow(
      /bookFiles store not yet available/i
    )
  })

  it('get returns undefined when store missing', async () => {
    expect(await bookFileRepo.get('a')).toBeUndefined()
  })

  it('delete is a no-op when store missing', async () => {
    await expect(bookFileRepo.delete('a')).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: 跑测试验证失败**

Run: `npm test src/services/storage/bookFileRepo.test.ts`
Expected: FAIL。

- [ ] **Step 3: 实现 src/services/storage/bookFileRepo.ts**

```typescript
import { getDB } from './db'

const STORE_NAME = 'bookFiles'

async function storeExists(): Promise<boolean> {
  const db = await getDB()
  return db.objectStoreNames.contains(STORE_NAME)
}

export const bookFileRepo = {
  async save(comicId: string, blob: Blob): Promise<void> {
    if (!(await storeExists())) {
      throw new Error(
        `bookFiles store not yet available (Phase 3 will introduce DB v4). comicId=${comicId}, size=${blob.size}`
      )
    }
    const db = await getDB()
    await db.put(STORE_NAME, blob, comicId)
  },

  async get(comicId: string): Promise<Blob | undefined> {
    if (!(await storeExists())) return undefined
    const db = await getDB()
    return db.get(STORE_NAME, comicId) as Promise<Blob | undefined>
  },

  async delete(comicId: string): Promise<void> {
    if (!(await storeExists())) return
    const db = await getDB()
    await db.delete(STORE_NAME, comicId)
  },
}
```

- [ ] **Step 4: 跑测试验证通过**

Run: `npm test src/services/storage/bookFileRepo.test.ts`
Expected: 全绿。

- [ ] **Step 5: lint + typecheck**

Run: `npm run lint && npm run typecheck`
Expected: 0 error。

- [ ] **Step 6: 提交**

```bash
git add src/services/storage/bookFileRepo.ts src/services/storage/bookFileRepo.test.ts
git commit -m "feat(storage): add bookFileRepo stub for PDF original-file storage

接口先定义，IDB 'bookFiles' store 在 Phase 3 (v4 升级) 才创建。
- save 在 store 不存在时抛清晰错误（防误用）
- get/delete 在 store 不存在时优雅 fallback
Phase 3 升级完成后补充完整 IDB 操作测试。"
```

---

## Task 12: 统一出口 storage/index.ts + 改造 storageService.ts 为 re-export

**Files:**

- Create: `src/services/storage/index.ts`
- Modify: `src/services/storageService.ts` → 改为薄 re-export

- [ ] **Step 1: 先盘点 storageService.ts 当前的所有导出**

Run: 通读 `src/services/storageService.ts` 全文，列出**所有 export**（包括 `db` 单例、各方法、子库/标签操作如有）。下一步要保证所有原 export 在新位置仍可访问。

- [ ] **Step 2: 创建 src/services/storage/index.ts**

```typescript
import { comicRepo } from './comicRepo'
import { pageRepo } from './pageRepo'
import { bookFileRepo } from './bookFileRepo'

export { comicRepo, pageRepo, bookFileRepo }
export { getDB, STORE_NAMES, _resetDBForTesting } from './db'
export { makePageKey } from './pageRepo'

/**
 * 兼容旧 storageService.ts 扁平 API 的 db 对象。
 * 新代码请直接 import 各 repo，避免使用此扁平形式。
 */
export const db = {
  // comics
  saveComic: comicRepo.save,
  getComic: comicRepo.get,
  getAllComics: comicRepo.getAll,
  deleteComic: comicRepo.delete,
  // covers
  saveCover: comicRepo.saveCover,
  getCover: comicRepo.getCover,
  deleteCover: comicRepo.deleteCover,
  // pages
  savePage: pageRepo.savePage,
  getPage: pageRepo.getPage,
  saveAllPages: pageRepo.saveAllPages,
  deleteAllPages: pageRepo.deleteAllPages,
  // book files (Phase 3 起可用)
  saveBookFile: bookFileRepo.save,
  getBookFile: bookFileRepo.get,
  deleteBookFile: bookFileRepo.delete,
  // 级联删除：保留旧名 + 新增 bookFile 清理
  async deleteComicFully(id: string): Promise<void> {
    await comicRepo.delete(id)
    await pageRepo.deleteAllPages(id)
    await comicRepo.deleteCover(id)
    await bookFileRepo.delete(id) // Phase 1: no-op；Phase 3 起生效
  },
}
```

**⚠️ 实施时**：根据 Step 1 盘点结果，**对照原 `storageService.ts` 的方法名一一映射**。如有 sublibraryRepo / tagRepo 相关方法，本 Phase 不拆（不在 spec 范围），原 `storageService.ts` 暂保留这些方法的原始实现——把它们也加到 db 扁平 API 即可（或者保留在 storageService.ts 中暴露）。

- [ ] **Step 3: 改造 src/services/storageService.ts 为 re-export**

把整个 `storageService.ts` 替换为：

```typescript
/**
 * @deprecated 本文件保留为向后兼容入口。新代码请使用：
 *   import { comicRepo, pageRepo, bookFileRepo } from '@/services/storage'
 *
 * 子库 / 标签等未拆分的存储操作仍可从这里访问。
 */

export { db, comicRepo, pageRepo, bookFileRepo, getDB, STORE_NAMES } from './storage'

// 如果原 storageService.ts 还有子库/标签等未迁移的方法，在这里保留原实现：
// import { getDB, STORE_NAMES } from './storage'
// export const subLibraryRepo = { ... }
// export const tagRepo = { ... }
```

**⚠️ 重要**：如原文件中导出的 default 是 `db` 对象，要保留 `export default db`。逐项核对，不能漏。

- [ ] **Step 4: 跑全量测试 + typecheck + lint + build**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: 全绿。如有调用方编译错误，说明某个导出漏迁，回到 Step 2/3 补齐。

- [ ] **Step 5: 提交**

```bash
git add src/services/storage/index.ts src/services/storageService.ts
git commit -m "refactor(storage): unify exports via storage/index.ts; storageService.ts becomes re-export

- storage/index.ts: 统一出口（推荐新代码用法）
- storageService.ts: 仅 re-export（向后兼容，所有现有 import 路径保持工作）
- db 扁平 API 保留，新增 saveBookFile/getBookFile/deleteBookFile（Phase 1 stub）
- deleteComicFully 已加入 bookFile 级联清理（Phase 1 no-op，Phase 3 生效）"
```

---

## Task 13: 改造 src/services/archiveParser.ts 为 re-export

**Files:**

- Modify: `src/services/archiveParser.ts`

**目标**：保留旧的 `parseArchiveFile` / `parseArchiveFileStreaming` / `parseImageFiles` / `buildComicFromArchive` 等 export，让现有 import 路径不变。原本的实现可以保留在 archiveParser.ts 中（因为 ComicArchiveParser 包装它），也可以移到 `services/parsers/comicArchiveLegacy.ts`。

**简化选择**：原文件实现**完全不动**，只在新位置加一个 `comicArchiveParser.ts` 调用它。本 Task 实际上**没有改动 archiveParser.ts**——把它放在计划里只是为了显式记录"决定不动"。

- [ ] **Step 1: 确认 archiveParser.ts 仍被 comicArchiveParser.ts 正常引用**

Run: `npm test src/services/parsers/comicArchiveParser.test.ts`
Expected: 仍然全绿。

- [ ] **Step 2: 用 grep 确认现有调用 archiveParser 的位置都还能工作**

Run:

```bash
npm run typecheck
```

Expected: 0 error，确认所有 `from '@/services/archiveParser'` 的 import 仍然解析正确。

- [ ] **Step 3: 提交（空 commit 记录决策）**

```bash
git commit --allow-empty -m "docs(refactor): keep services/archiveParser.ts as-is in Phase 1

decision log: 原 archiveParser 实现保留不动，避免 Phase 1 改动面扩大。
新代码通过 services/parsers/comicArchiveParser 间接调用它（thin wrapper）。
未来如要把实现也迁入 services/parsers/，做单独 PR。"
```

（如果你不喜欢空 commit，跳过此 Task 即可。）

---

## Task 14: 替换 Import/index.tsx 中的重复 fileType 定义

**Files:**

- Modify: `src/pages/Import/index.tsx`

- [ ] **Step 1: 阅读 src/pages/Import/index.tsx 头部**

确认 `IMAGE_EXTENSIONS` / `ARCHIVE_EXTENSIONS` / `getFileExtension` / `isArchiveFile` / `isImageFile` 五个本地定义的精确位置（应在第 11-25 行附近）。

- [ ] **Step 2: 替换为 import**

把第 11-25 行的本地定义**整体删除**，替换为：

```typescript
import { getFileExtension, isArchiveFile, isImageFile } from '@/utils/fileType'
```

其他保持不变。`APP_CONFIG` 已经导入，不动。

- [ ] **Step 3: typecheck + lint + build**

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: 0 error / 0 warning。

- [ ] **Step 4: 跑 dev server 手动验证 Import 页面**

Run: `npm run dev`

打开浏览器到 Import 页面，确认：

- 单文件选择按钮 accept 仍然显示 .zip/.cbz/.rar/.cbr
- 文件夹选择按钮可用
- 导入一个 .zip 测试，能正常跳转到漫画详情

**这是 Phase 1 的核心回归测试**——如果导入流程出问题，回滚到此 commit。

- [ ] **Step 5: 提交**

```bash
git add src/pages/Import/index.tsx
git commit -m "refactor(import): use shared utils/fileType helpers

消除与 archiveParser.ts 重复定义的 IMAGE_EXTENSIONS / getFileExtension / isImageFile / isArchiveFile。
手动验证：dev server 导入 .zip 流程正常。"
```

---

## Task 15: 扩展 constants/config.ts 加 pdf 配置

**Files:**

- Modify: `src/constants/config.ts`

**注意**：**本 Task 暂不修改 `supportedFormats` 数组** —— `.pdf` 在 Phase 4 真正实现解析器后再加入，否则用户能选 PDF 但导入会失败。

- [ ] **Step 1: 阅读现有 src/constants/config.ts 全文**

- [ ] **Step 2: 在 APP_CONFIG 中追加 pdf 配置块**

在 APP_CONFIG 的合适位置（其他配置之后、`as const` 之前）插入：

```typescript
  pdf: {
    /** 封面预渲染缩放（PDF 第 1 页 → cover blob） */
    coverRenderScale: 1.5,
    /** 阅读时默认 DPI 倍数（与 zoomScale 相乘） */
    defaultRenderScale: 2.0,
    /** pdf.js worker 路径（相对 BASE_URL） */
    workerSrc: '/pdf.worker.min.mjs',
    /** 默认渲染模式：'canvas'（位图）或 'text'（带文字层） */
    defaultMode: 'canvas' as const,
    /** 大文件阈值（MB），超过此值使用 parseStreaming */
    largeFileThresholdMB: 50,
  },
```

- [ ] **Step 3: typecheck + lint + build**

Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: 0 error。

- [ ] **Step 4: 提交**

```bash
git add src/constants/config.ts
git commit -m "feat(config): add APP_CONFIG.pdf block

为 Phase 4-5 的 PDF parser 和 renderer 预留配置。
注意：supportedFormats 数组未加 .pdf —— Phase 4 真正实现 parser 后再加，
避免用户能选 PDF 但导入失败的中间状态。"
```

---

## Task 16: 端到端回归验证

**Files:** 无新文件，纯验收。

- [ ] **Step 1: 跑全套质量门**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: 全部 0 error / 0 warning，测试全绿。

- [ ] **Step 2: 启动 dev server 手动回归**

Run: `npm run dev`

执行以下场景（每项过了打勾）：

- [ ] 进入 Home 页面，原有漫画列表正常显示（用现有 IDB 数据）
- [ ] 进入 Library 页面，封面和元数据正常
- [ ] 点击一本现有漫画进入阅读器，竖屏滚动正常
- [ ] 切换横屏单页模式，翻页正常
- [ ] 切换横屏双页模式，正常
- [ ] 双击缩放图片，正常
- [ ] 返回 Library，进入 Import 页面
- [ ] 用文件按钮导入一本 .zip 漫画 → 自动跳到详情 → 进入阅读器一切正常
- [ ] 用文件按钮导入一本 .cbz 漫画 → 同上
- [ ] 用文件夹按钮导入一个散图文件夹 → 正常
- [ ] 删除其中一本漫画 → 书架不再显示，IDB 中页面/封面/Comic 元数据都已清理（可在 DevTools → Application → IndexedDB 查看）

如任一场景失败，**立即回滚到 Task 0**（Phase 1 起点），逐 commit 二分定位问题。

- [ ] **Step 3: 检查 IDB 数据库版本未升级**

DevTools → Application → IndexedDB → `kuro-reader-db` → 版本号应仍为 **3**。Phase 3 才会升到 4。

- [ ] **Step 4: 验证 git log 整洁**

Run:

```bash
git log --oneline | head -20
```

Expected: 看到约 14-15 个清晰的 commit，每个对应一个 Task。

- [ ] **Step 5: 写一个 phase 完成总结 commit（可选）**

```bash
git commit --allow-empty -m "chore(phase1): infrastructure ready for PDF support

Phase 1 完成总结：
✅ Vitest + jsdom + fake-indexeddb 测试基础设施
✅ utils/fileType.ts 消除重复定义
✅ utils/extractTitle.ts 抽取
✅ 类型扩展：BookFormat / PageRef / Comic.format / Chapter.pageRefs / ReadingProgress.locator
✅ BookParser / ParsedBook 接口
✅ ComicArchiveParser 适配器实现
✅ getParserForFile 分发器
✅ 存储层拆分：comicRepo / pageRepo / bookFileRepo
✅ storageService.ts / archiveParser.ts 保留为 re-export
✅ Import 页面使用共享 fileType helpers
✅ APP_CONFIG.pdf 配置块
✅ 端到端手动回归通过
现有漫画功能 100% 不变。准备进入 Phase 2（渲染抽象）。"
```

---

## 完成标准

Phase 1 完成时同时满足：

- [ ] 14-16 个 commit 全部按顺序提交
- [ ] `npm test` 全绿（约 50+ test cases）
- [ ] `npm run typecheck` 0 error
- [ ] `npm run lint` 0 warning
- [ ] `npm run build` 成功
- [ ] 手动回归（导入 .zip / .cbz、阅读、删除）全部通过
- [ ] IDB 版本仍为 v3
- [ ] `src/services/parsers/` 完整存在
- [ ] `src/services/storage/` 完整存在
- [ ] `src/utils/fileType.ts` 和 `src/utils/extractTitle.ts` 存在
- [ ] 旧 import 路径 `@/services/archiveParser` 和 `@/services/storageService` 仍可用

---

## 下一阶段

完成 Phase 1 后，进入：

- **Phase 2 实施计划**：渲染抽象（`PageRendererProps` 接口、`ImagePageRenderer`、`Reader/index.tsx` 5 处 `<img>` 替换）
- 计划文件名：`docs/superpowers/plans/YYYY-MM-DD-pdf-phase2-renderer-abstraction.md`

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---
