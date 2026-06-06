# Kuro Reader 多格式扩展（PDF）设计文档

- 创建日期：2026-06-06
- 状态：Design Approved
- 范围：本轮仅 PDF；EPUB 留待下一轮
- 关联代码库：`D:/workplace/visual/same-idea/reader/kuro-reader`

---

## 1. 背景与目标

### 1.1 现状

Kuro Reader 是一个纯本地漫画阅读器，所有数据流建立在「一本书 = 一组图片序列」的核心假设上：

```
压缩包/散图 → 解压成 Blob[] → IndexedDB 按页存 → URL.createObjectURL → <img>
```

- 支持格式：`.zip / .cbz / .rar / .cbr` + 散图文件夹（`src/constants/config.ts:5`）
- 渲染：仅 `<img src={blobUrl}>`，5 处硬编码（`src/pages/Reader/index.tsx` 1345/1380/1392/1407/1419/1435）
- 存储：IndexedDB `kuro-reader-db` v3，pages store 按 `comicId/chapterId/pageIndex` 存 Blob
- 类型：`Comic` / `Chapter` / `ReadingProgress` 全部假设页 = 图片（`src/types/index.ts:1-48`）

### 1.2 目标

引入「多格式适配器」骨架，本轮端到端实现 PDF 支持，使下一轮 EPUB 只需新增 parser + renderer 而无需重构。

### 1.3 非目标

- 本轮不实现 EPUB
- 本轮不引入真正的后台导入任务队列（保留同步串行模型）
- 本轮不改造现有漫画阅读体验
- 本轮不做云同步、PDF 注释/书签等高级功能

---

## 2. 设计决策摘要（用户已确认）

| #   | 决策点       | 选择                                              | 理由                                            |
| --- | ------------ | ------------------------------------------------- | ----------------------------------------------- |
| 1   | 本轮范围     | 先做 PDF，EPUB 留待下一轮                         | EPUB 涉及 reflowable / CFI / 章节，单独立项更稳 |
| 2   | PDF 渲染策略 | Canvas 位图模式 + Text Layer 文本模式，用户可切换 | 兼顾漫画式体验与传统 PDF 选中/复制能力          |
| 3   | PDF 存储策略 | 原始 PDF + 封面预渲染（首页）                     | 支持后续不同 DPI/文本模式切换；首屏书架快速显示 |
| 4   | 大文件处理   | >50MB PDF 显示加载进度条                          | 与现有 STREAMING_THRESHOLD_MB=50 保持一致       |
| 5   | 类型迁移     | `Comic.format` 可选，`Chapter.pageRefs` 可选      | 零迁移风险，旧数据库自动兼容                    |
| 6   | 架构方案     | Adapter Pattern（BookParser + PageRenderer 抽象） | 一次性搭好骨架，EPUB 下轮零重构                 |

---

## 3. 总体架构

### 3.1 引入三个新抽象层

```
┌───────────────────────────────────────────────────────┐
│ UI 层（Import / Reader 页面，不感知格式）              │
└──────────────┬────────────────────────────────────────┘
               │
┌──────────────▼────────────────────────────────────────┐
│ 状态层（useLibraryStore / useReaderStore）             │
└──────────────┬────────────────────────────────────────┘
               │
   ┌───────────┼──────────────┐
   ▼           ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────────┐
│ Parser  │ │ Storage  │ │ PageRenderer │
│ 适配器  │ │ Repo 层  │ │ 抽象层       │
└─────────┘ └──────────┘ └──────────────┘
   │           │              │
   ├─Comic     ├─comicRepo    ├─Image
   ├─Pdf       ├─pageRepo     ├─PdfCanvas
   └─(Epub)    ├─bookFileRepo └─PdfText
              └─(resourceRepo) └─(Epub)
```

### 3.2 目录结构变更

```
src/
  services/
    parsers/                          ← 新增
      types.ts                          ParsedBook / BookParser 接口
      comicArchiveParser.ts             从现有 archiveParser.ts 迁移
      pdfParser.ts                      新增
      index.ts                          getParserForFile(file) 分发器
    storage/                           ← 重构：拆分 storageService.ts
      db.ts                              IDB 连接 + v4 迁移
      comicRepo.ts                       Comic / Cover CRUD
      pageRepo.ts                        Pages (Blob) CRUD
      bookFileRepo.ts                    新增：原始 PDF 文件 CRUD
      index.ts                           统一导出（保持外部 import 不变）
    archiveParser.ts                   ← 保留为 re-export，避免大面积改 import
    storageService.ts                  ← 保留为 re-export
  components/
    organisms/
      readers/                         ← 新增：PageRenderer 抽象层
        PageRendererProps.ts             统一 props 接口
        ImagePageRenderer.tsx            迁移现有 <img> 逻辑
        PdfCanvasRenderer.tsx            新增（位图模式）
        PdfTextRenderer.tsx              新增（文本可选模式）
        index.ts                         getRendererForFormat(format, mode)
  utils/
    fileType.ts                        ← 新增：统一 isImageFile / getExtension
  hooks/
    usePdfDoc.ts                       ← 新增：从 useReaderStore 取 pdfDoc
  types/
    index.ts                           ← 扩展：Comic.format / PageRef / locator
  constants/
    config.ts                          ← 扩展：supportedFormats + pdf 配置
```

### 3.3 关键架构决策

1. **Reader 不直接 import 具体 renderer** —— 通过 `getRendererForFormat(comic.format)` 工厂获取
2. **存储层拆文件而非新增 class** —— 现有 174 行加 EPUB 后会到 300+，拆完每个 < 100
3. **`archiveParser.ts` / `storageService.ts` 保留 re-export** —— 避免现有调用方批量改 import
4. **分发器仅做扩展名匹配** —— 不含业务逻辑，方便单测

---

## 4. 类型系统扩展

### 4.1 `src/types/index.ts` 改动

```typescript
// 新增：格式判别
export type BookFormat = 'comic' | 'pdf' // EPUB 下一轮加入

// 新增：页面引用（联合类型）
export type PageRef =
  | { kind: 'image'; index: number } // 漫画/图片：现有行为
  | { kind: 'pdf-page'; pageNumber: number } // PDF：1-based

// Comic 扩展（新增字段可选，默认 'comic' 兼容旧数据）
export interface Comic {
  // ... 原有字段保留
  format?: BookFormat // undefined 视为 'comic'
}

// Chapter 扩展：pages 保留 string[] 兼容，新增 pageRefs
export interface Chapter {
  // ... 原有字段保留
  pages: string[] // 旧字段：图片文件名/PDF 页号字符串
  pageRefs?: PageRef[] // 新字段：结构化页面引用（PDF 必填）
}

// ReadingProgress 扩展：locator 给 EPUB 预留
export interface ReadingProgress {
  // ... 原有字段保留
  locator?: string // 预留字段，本轮不消费
}
```

### 4.2 迁移策略

**原则：旧数据零迁移**

- `comic.format === undefined` → 视为 `'comic'`
- 用 helper `getComicFormat(comic): BookFormat` 集中处理默认值
- PDF 渲染时显式断言 `chapter.pageRefs!`

### 4.3 适配器接口（`src/services/parsers/types.ts`）

```typescript
export interface ParsedBook {
  format: BookFormat
  title: string
  coverBlob: Blob
  // 漫画分支：每页一个 Blob
  imagePages?: Blob[]
  imagePageNames?: string[]
  // PDF 分支：原始文件 + 总页数
  pdfFile?: Blob
  pdfTotalPages?: number
  // 通用：结构化页面引用
  pageRefs?: PageRef[]
}

export interface BookParser {
  canParse(file: File): boolean
  parse(file: File): Promise<ParsedBook>
  parseStreaming?(file: File, onProgress: (pct: number) => void): Promise<ParsedBook>
}
```

### 4.4 配置扩展（`src/constants/config.ts`）

```typescript
export const APP_CONFIG = {
  // ... 原有
  supportedFormats: ['.zip', '.cbz', '.rar', '.cbr', '.pdf'] as const,
  pdf: {
    coverRenderScale: 1.5, // 封面预渲染缩放
    defaultRenderScale: 2.0, // 阅读时默认 DPI 倍数
    workerSrc: '/pdf.worker.min.mjs',
    enableTextLayer: false, // 默认位图模式
    largeFileThresholdMB: 50,
  },
} as const
```

新增 `UserSettings` 字段：

```typescript
export interface UserSettings {
  // ... 原有
  pdfMode?: 'canvas' | 'text' // 默认 'canvas'
}
```

---

## 5. 存储层 v4 升级

### 5.1 数据库结构变更

```
kuro-reader-db v3 → v4

现有 stores（保留不动）：
  comics          keyPath: 'id'                           漫画元数据
  pages           手动键 (comicId/chapterId/pageIndex)    页面 Blob
  covers          手动键 (comicId)                        封面 Blob
  sublibraries    keyPath: 'id'
  tags            keyPath: 'id'

新增 stores：
  bookFiles       手动键 (comicId)                        原始 PDF Blob
```

### 5.2 v3 → v4 迁移逻辑（`src/services/storage/db.ts`）

```typescript
upgrade(db, oldVersion) {
  // ... v1/v2/v3 现有迁移保留
  if (oldVersion < 4) {
    if (!db.objectStoreNames.contains('bookFiles')) {
      db.createObjectStore('bookFiles')  // 手动键
    }
    // 不回填任何旧数据
  }
}
```

**迁移原则**：纯追加。不修改、不删除、不回填旧数据。

### 5.3 拆分后的 Repository 接口

```typescript
// bookFileRepo.ts （新增）
export const bookFileRepo = {
  save(comicId: string, blob: Blob): Promise<void>,
  get(comicId: string): Promise<Blob | undefined>,
  delete(comicId: string): Promise<void>,
}

// comicRepo.ts （迁移自 storageService.ts）
export const comicRepo = {
  save, get, getAll, delete: deleteComic,
  saveCover, getCover, deleteCover,
}

// pageRepo.ts （迁移自 storageService.ts）
export const pageRepo = {
  savePage, getPage, saveAllPages, deleteAllPages,
}

// storage/index.ts （统一出口，保持外部 API 兼容）
export { comicRepo, pageRepo, bookFileRepo }
// re-export 旧的扁平 API 给现有调用方：
export const db = {
  ...comicRepo,
  ...pageRepo,
  saveBookFile: bookFileRepo.save,
  getBookFile: bookFileRepo.get,
  deleteComicFully,  // 升级版，级联清理 bookFiles
}
```

### 5.4 级联删除升级

```typescript
async deleteComicFully(id: string) {
  await comicRepo.delete(id)
  await pageRepo.deleteAllPages(id)
  await comicRepo.deleteCover(id)
  await bookFileRepo.delete(id)   // 新增
}
```

### 5.5 PDF 存储数据流

```
导入：File(PDF) → pdfParser.parse()
       │
       ├─ bookFileRepo.save(comicId, file)         原始 PDF
       ├─ comicRepo.saveCover(comicId, coverBlob)  预渲染封面（jpg）
       └─ comicRepo.save(comic)                    元数据（format='pdf', pageRefs[]）

       注意：pages store 不写入任何内容（PDF 不拆页存储）

阅读：useReaderStore.loadComic(comicId)
       │
       if comic.format === 'pdf':
         pdfBlob = await bookFileRepo.get(comicId)
         pdfDoc  = await pdfjs.getDocument(pdfBlob).promise
         → 缓存在 store 中，供 PdfCanvasRenderer / PdfTextRenderer 按需 getPage(n)
       else:
         按现有流程从 pageRepo 拿 Blob → createObjectURL
```

### 5.6 阅读器 store 模型扩展

```typescript
type PageDescriptor =
  | { kind: 'image-url'; url: string | null }       // 漫画：现有行为
  | { kind: 'pdf-page'; pageNumber: number };       // PDF：renderer 自己 getPage

state: {
  pages: PageDescriptor[]      // 替代 pageUrls
  pdfDoc?: PDFDocumentProxy    // PDF 专用
  // ... 其他不变
}
```

`<PageRenderer>` 通过 `usePdfDoc()` 自定义 hook 从 store 拿 `pdfDoc`，避免 props 钻孔。

---

## 6. PDF 解析器适配器

### 6.1 新增依赖

```json
"dependencies": {
  "pdfjs-dist": "^4.x"
}
```

构建脚本将 `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` 复制到 `public/`，运行时通过 `import.meta.env.BASE_URL` 拼接路径，兼容 Capacitor 原生环境。

### 6.2 `src/services/parsers/pdfParser.ts`

```typescript
import * as pdfjs from 'pdfjs-dist'
import { APP_CONFIG } from '@/constants/config'
import { extractTitleFromFileName } from '@/utils/fileType'

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}${APP_CONFIG.pdf.workerSrc.replace(/^\//, '')}`

export class PdfParser implements BookParser {
  canParse(file: File): boolean {
    return /\.pdf$/i.test(file.name)
  }

  async parse(file: File): Promise<ParsedBook> {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const totalPages = pdfDoc.numPages

    // 封面：渲染第 1 页为 jpeg
    const page = await pdfDoc.getPage(1)
    const viewport = page.getViewport({ scale: APP_CONFIG.pdf.coverRenderScale })
    const canvas = new OffscreenCanvas(viewport.width, viewport.height)
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport }).promise
    const coverBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 })

    const pageRefs: PageRef[] = Array.from({ length: totalPages }, (_, i) => ({
      kind: 'pdf-page' as const,
      pageNumber: i + 1,
    }))

    pdfDoc.destroy()

    return {
      format: 'pdf',
      title: extractTitleFromFileName(file.name),
      coverBlob,
      pageRefs,
      pdfFile: new Blob([arrayBuffer], { type: 'application/pdf' }),
      pdfTotalPages: totalPages,
    }
  }

  async parseStreaming(file: File, onProgress: (pct: number) => void): Promise<ParsedBook> {
    // 用 ReadableStream 分段读取，每 2MB 触发 onProgress
    // 解析阶段与 parse() 相同
    // ...
  }
}
```

### 6.3 大文件非阻塞策略

`useLibraryStore.importFile` 中现有的阈值逻辑：

- ≤50MB → `parse()`（同步式，0/20/60/80/100 阶段汇报进度）
- \>50MB → `parseStreaming()`（每读取 2MB chunk 触发 `onProgress`）

`pdfjs.getDocument` 本身在 worker 中解析，不阻塞主线程。

### 6.4 分发器（`src/services/parsers/index.ts`）

```typescript
import { ComicArchiveParser } from './comicArchiveParser'
import { PdfParser } from './pdfParser'

const parsers: BookParser[] = [new ComicArchiveParser(), new PdfParser()]

export function getParserForFile(file: File): BookParser | null {
  return parsers.find(p => p.canParse(file)) ?? null
}
```

### 6.5 Import 流程改动（`useLibraryStore.importFile`）

```typescript
const parser = getParserForFile(file)
if (!parser) {
  setError('不支持的文件格式')
  return
}

const parsed =
  parser.parseStreaming && file.size > APP_CONFIG.pdf.largeFileThresholdMB * 1024 * 1024
    ? await parser.parseStreaming(file, setProgress)
    : await parser.parse(file)

const comic = buildComicFromParsed(parsed, fileId)
if (parsed.format === 'pdf') {
  await bookFileRepo.save(comic.id, parsed.pdfFile!)
}
await comicRepo.saveCover(comic.id, parsed.coverBlob)
await comicRepo.save(comic)

if (parsed.format === 'comic' && parsed.imagePages) {
  await pageRepo.saveAllPages(comic.id, comic.chapters[0].id, parsed.imagePages)
}
```

### 6.6 ComicArchiveParser 迁移

把现有 `src/services/archiveParser.ts` 的 `parseArchiveFile` / `parseArchiveFileStreaming` / `parseImageFiles` 包装成实现 `BookParser` 接口的类：

```typescript
export class ComicArchiveParser implements BookParser {
  canParse(file: File): boolean {
    return /\.(zip|cbz|rar|cbr)$/i.test(file.name)
  }
  async parse(file: File): Promise<ParsedBook> {
    const archive = await parseArchiveFile(file)
    return {
      format: 'comic',
      title: archive.title,
      coverBlob: archive.coverBlob,
      imagePages: archive.pages,
      imagePageNames: archive.pageNames,
      pageRefs: archive.pages.map((_, i) => ({ kind: 'image' as const, index: i })),
    }
  }
  async parseStreaming(file: File, onProgress: (pct: number) => void): Promise<ParsedBook> {
    // 包装 parseArchiveFileStreaming
  }
}
```

旧的 `archiveParser.ts` 保留为 thin re-export，避免修改大量 import 路径。

---

## 7. 渲染层抽象

### 7.1 统一渲染器接口（`src/components/organisms/readers/PageRendererProps.ts`）

```typescript
export interface PageRendererProps {
  pageRef: PageRef
  comicId: string
  chapterId: string
  zoomScale: number
  paperMode?: { enabled: boolean; intensity: number }
  brightness: number
  colorTemp: number
  readingMode: 'vertical' | 'horizontal'
  onLoad?: (meta: { naturalWidth: number; naturalHeight: number }) => void
  onError?: (err: Error) => void
  className?: string
}
```

**`onLoad` 回传尺寸**是关键：现有 Reader 竖向虚拟化（`Reader/index.tsx:1144/1149`）依赖 `naturalHeight`，PDF 渲染完后也回报实际像素尺寸，让虚拟化逻辑无需感知格式。

### 7.2 渲染器实现清单

| 文件                    | 职责                                                 |
| ----------------------- | ---------------------------------------------------- |
| `ImagePageRenderer.tsx` | 现有 `<img>` 逻辑提取；处理 `image-url` 类型 PageRef |
| `PdfCanvasRenderer.tsx` | PDF 位图模式：`pdfDoc.getPage(n).render()` 到 canvas |
| `PdfTextRenderer.tsx`   | PDF 文本模式：canvas + textLayer 叠加，支持选中复制  |
| `index.ts`              | `getRendererForFormat(format, mode)` 工厂            |

### 7.3 PDF 渲染器关键实现

```typescript
const PdfCanvasRenderer: React.FC<PageRendererProps> = ({ pageRef, zoomScale, onLoad }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfDoc = usePdfDoc()  // 从 useReaderStore 拿
  const renderTaskRef = useRef<RenderTask | null>(null)

  useEffect(() => {
    if (pageRef.kind !== 'pdf-page' || !pdfDoc) return
    let cancelled = false

    ;(async () => {
      const page = await pdfDoc.getPage(pageRef.pageNumber)
      const scale = APP_CONFIG.pdf.defaultRenderScale * zoomScale
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas || cancelled) return

      canvas.width = viewport.width
      canvas.height = viewport.height

      renderTaskRef.current?.cancel()
      renderTaskRef.current = page.render({
        canvasContext: canvas.getContext('2d')!,
        viewport,
      })

      await renderTaskRef.current.promise
      if (!cancelled) onLoad?.({ naturalWidth: viewport.width, naturalHeight: viewport.height })
    })()

    return () => { cancelled = true; renderTaskRef.current?.cancel() }
  }, [pageRef, zoomScale, pdfDoc])

  return <canvas ref={canvasRef} className="max-w-full" />
}
```

**关键细节**：

- `RenderTask.cancel()` 防止 zoom/翻页时旧渲染未完成的内存泄漏
- `zoomScale` 改变时**重新渲染**（不是 CSS transform），保持矢量清晰度
- 通过 `usePdfDoc()` 拿 store 中的 pdfDoc 实例，避免 props 钻孔

### 7.4 渲染器工厂

```typescript
// readers/index.ts
export function getRendererForFormat(
  format: BookFormat,
  pdfMode: 'canvas' | 'text' = 'canvas'
): React.FC<PageRendererProps> {
  if (format === 'pdf') {
    return pdfMode === 'text' ? PdfTextRenderer : PdfCanvasRenderer
  }
  return ImagePageRenderer
}
```

### 7.5 Reader/index.tsx 改动

**5 处 `<img>` 替换为统一组件**（`Reader/index.tsx:1345/1380/1392/1407/1419/1435`）：

```typescript
const Renderer = useMemo(
  () => getRendererForFormat(comic.format ?? 'comic', settings.pdfMode ?? 'canvas'),
  [comic.format, settings.pdfMode]
)

// 5 处渲染点
<Renderer
  pageRef={chapter.pageRefs?.[idx] ?? { kind: 'image', index: idx }}
  comicId={comic.id}
  chapterId={chapter.id}
  zoomScale={zoomScale}
  paperMode={paperMode}
  brightness={brightness}
  colorTemp={colorTemp}
  readingMode={readingMode}
  onLoad={handlePageLoad}
/>
```

**虚拟化滚动逻辑（`VERTICAL_RENDER_*` 等）不需要改动** —— 它只关心 `pages.length` 和每页的 `naturalHeight`，已通过 `onLoad` 回调统一。

### 7.6 PDF 文本模式切换

- `settings.pdfMode: 'canvas' | 'text'`（默认 `'canvas'`）
- 存于 `useAppStore.UserSettings`（持久化到 `localStorage`）
- 仅当当前阅读的 `Comic.format === 'pdf'` 时，阅读器顶栏快捷按钮可切换

### 7.7 设计要点

1. **CSS transform 缩放 vs 重渲染** —— 图片用 transform（性能好），PDF 重渲染（保真度），两种 renderer 各自处理
2. **paperMode/brightness/colorTemp 滤镜** —— 通过 CSS filter 应用到 renderer 根元素，对 `<img>` 和 `<canvas>` 都生效
3. **`onLoad` 回传 naturalSize** —— 让虚拟化逻辑格式无关，未来 EPUB 走同接口
4. **`usePdfDoc` 自定义 hook** —— PDF doc 生命周期跟随 Comic，不污染 PageRenderer 接口

---

## 8. 实施路线

### 8.1 阶段划分（按 PR 提交顺序）

**Phase 1 — 基础设施（无新功能）**

1.1 抽 `src/utils/fileType.ts`，替换重复的 `isImageFile` / `getExtension`
1.2 拆 `storageService.ts` → `services/storage/*` 多 repo + 保留 re-export
1.3 `archiveParser.ts` → `services/parsers/comicArchiveParser.ts` + 保留 re-export
1.4 定义 `BookParser` / `ParsedBook` 接口
1.5 类型扩展：`Comic.format` / `PageRef` / `locator`

验收：现有功能 100% 不变，`npm run lint` + `npm run build` 通过

**Phase 2 — 渲染抽象（无新功能）**

2.1 `PageRendererProps` 接口 + `ImagePageRenderer`
2.2 `Reader/index.tsx` 5 处 `<img>` 替换为 `<Renderer />`

验收：现有漫画阅读体验完全不变（手动回归测试核心操作）

**Phase 3 — 存储层 v4**

3.1 DB v4 迁移（追加 `bookFiles` store）
3.2 `bookFileRepo` + `deleteComicFully` 级联清理

验收：v3 数据库平滑升级到 v4，旧漫画可读

**Phase 4 — PDF 解析 + 导入**

4.1 引入 `pdfjs-dist` + worker 复制到 `public/`
4.2 `PdfParser`（`parse` + `parseStreaming`）
4.3 Import 流程接入 `getParserForFile` 分发器
4.4 `supportedFormats` / `mimeTypes` / folder accept 加入 `.pdf`

验收：能导入 PDF，书架显示封面，但点击阅读尚不可用（无渲染器）

**Phase 5 — PDF 渲染**

5.1 `PdfCanvasRenderer` + `usePdfDoc` hook
5.2 `useReaderStore` 加 `pdfDoc` 状态 + `PageDescriptor` 模型
5.3 `PdfTextRenderer` + Settings 增加 `pdfMode` 切换

验收：PDF 端到端可读，两种渲染模式可切换

**Phase 6 — 完善**

6.1 大文件加载进度（>50MB PDF 显示百分比）
6.2 Reader 顶栏快捷切换 `pdfMode`（仅 PDF 阅读时显示）
6.3 文档更新（PRD.md / ARCHITECTURE.md / COMPONENTS.md）

验收：用户体验闭环

### 8.2 提交粒度

- 每个 Phase 一个独立 PR
- Phase 内每个子步骤一个独立 commit
- 每个 commit 都能独立构建、独立通过 lint

---

## 9. 验收清单（端到端）

### 9.1 回归（必须）

- [ ] 导入 `.zip` / `.cbz` 行为完全不变
- [ ] 导入 `.rar` / `.cbr` 行为完全不变
- [ ] 导入散图文件夹行为完全不变
- [ ] 批量导入 + 子书库创建行为完全不变
- [ ] 现有漫画的竖屏 / 横屏单页 / 横屏双页阅读体验完全不变
- [ ] 现有漫画的纸质模式、亮度、色温滤镜效果完全不变
- [ ] 阅读进度恢复完全正确
- [ ] v3 → v4 数据库自动升级，旧漫画可读

### 9.2 新功能

- [ ] 导入 `.pdf`，书架显示封面（首页预渲染）
- [ ] 阅读 PDF，竖屏滚动模式正常翻页
- [ ] 阅读 PDF，横屏单页模式正常翻页
- [ ] 阅读 PDF，横屏双页模式正常排版
- [ ] 双击 / pinch 缩放触发 PDF 重渲染，矢量清晰
- [ ] 纸质模式、亮度、色温滤镜对 PDF 生效
- [ ] 设置切换 PDF 渲染模式 canvas / text
- [ ] text 模式可选中并复制 PDF 文字
- [ ] 删除 PDF Comic 时级联清理 `bookFiles` store
- [ ] \>50MB PDF 导入显示加载进度

### 9.3 质量

- [ ] `npm run lint` 通过（0 warning）
- [ ] `npm run build` 通过
- [ ] 所有新文件遵循 AGENTS.md 规范（无硬编码、无 mock、类型完整、无 any）

---

## 10. 风险与缓解

| 风险                                            | 缓解                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| pdfjs-dist worker 在 Capacitor 原生环境路径失败 | worker 复制到 `public/`，用 `import.meta.env.BASE_URL` 拼路径                |
| 大 PDF 解析阻塞主线程                           | `parseStreaming` + progress 回调；pdfjs 默认在 worker 解析，不需 main thread |
| 切换 `pdfMode` 时已渲染缓存丢失                 | renderer 内部缓存 + 模式切换时显式清理                                       |
| Reader 1707 行改动风险                          | Phase 2 独立提交，纯抽象重构，行为可逐 commit 验证                           |
| 旧漫画的 `chapter.pageRefs` 缺失                | `ImagePageRenderer` 接受 `pageRef?` 可选，缺失时 fallback 到 index 模式      |
| PDF 文件过大导致 IDB 写入失败                   | 提前校验 `APP_CONFIG.maxFileSize`（已有 100MB 限制）                         |
| pdfjs 版本与 Vite ESM 兼容性                    | 用 `^4.x` 最新版本，本身原生 ESM；fallback 用 `pdf.min.mjs`                  |
| Capacitor 文件选择器无 `application/pdf` MIME   | 在 `FilePicker.pickFiles` 的 `mimeTypes` 加入 `application/pdf`              |

---

## 11. 不在本轮范围

以下内容明确不做，留待后续：

- EPUB 支持（下一轮单独立项）
- PDF 注释 / 高亮 / 书签 / 大纲跳转
- PDF 表单填写
- PDF 文字搜索
- 真正的后台异步导入任务队列（保留同步串行）
- 云端 PDF 流式打开（无需下载整文件即可阅读）
- PDF 阅读进度的「文字位置」记录（仍按页号记录）

---

## 12. 参考

- 现有解析层：`src/services/archiveParser.ts`（362 行）
- 现有存储层：`src/services/storageService.ts`（174 行）
- 现有阅读器：`src/pages/Reader/index.tsx`（1707 行）
- 现有类型：`src/types/index.ts`（119 行）
- 现有配置：`src/constants/config.ts`
- 协作规范：`AGENTS.md`
- pdfjs-dist 文档：https://github.com/mozilla/pdf.js
