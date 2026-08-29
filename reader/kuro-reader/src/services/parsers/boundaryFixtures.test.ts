import { describe, it, expect, beforeAll, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { GlobalWorkerOptions } from 'pdfjs-dist'

import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'
import { TextParser } from '@/services/parsers/textParser'
import { EpubParser } from '@/services/parsers/epubParser'
import { loadPdfDocument } from '@/services/parsers/pdfParser'
import { deriveMergedBookTitle, extractArchiveChapterInfo } from '@/utils/comicChapterSplit'
import { loadEpubChapters } from '@/services/epubContent'
import type { ParsedComicBook, ParsedTextBook } from '@/services/parsers/types'

const comicParser = new ComicArchiveParser()
/** 解析漫画压缩包（显式收窄为 ParsedComicBook） */
const parseComic = (rel: string): Promise<ParsedComicBook> =>
  comicParser.parse(fileAt(rel)) as Promise<ParsedComicBook>

const textParser = new TextParser()
/** 解析文本/Markdown（显式收窄为 ParsedTextBook） */
const parseText = (rel: string): Promise<ParsedTextBook> =>
  textParser.parse(fileAt(rel)) as Promise<ParsedTextBook>

const epubParser = new EpubParser()

/**
 * 边界矩阵回归测试：直接以 test-fixtures/ 中的真实文件驱动真实解析管线。
 * 夹具由 `node scripts/generate-test-fixtures.mjs` 确定性重建（含 GBK 自检）。
 */
const FIXTURES = join(process.cwd(), 'test-fixtures')

// jsdom 无 2D 画布：占位封面绘制（文本/EPUB 解析器）在此打桩
beforeAll(() => {
  const gradientStub = { addColorStop: vi.fn() };
  const ctxStub = new Proxy({}, {
    get: (_target, prop: string) => {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
        return () => gradientStub;
      }
      if (prop === 'measureText') return () => ({ width: 10 });
      return () => undefined;
    },
  });
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ctxStub) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.toBlob = vi.fn(
    (callback: BlobCallback) => callback(new Blob(['cover'], { type: 'image/png' }))
  ) as unknown as typeof HTMLCanvasElement.prototype.toBlob;

  // vitest 下 `?url` worker 路径解析错误：覆盖为绝对 file:// 地址供 fake worker 加载
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
  ).href;
});

const fileAt = (rel: string) =>
  new File([readFileSync(join(FIXTURES, rel))], rel.split('/').pop()!, { type: 'application/octet-stream' })

describe('漫画压缩包边界', () => {

  it('基础 CBZ：3 页按名排序', async () => {
    const parsed = await parseComic('comics/comic-basic-3pages.cbz')
    expect(parsed.format).toBe('comic')
    expect(parsed.imagePageNames).toEqual(['001.jpg', '002.jpg', '003.jpg'])
  })

  it('自然排序：page-2 排在 page-10 之前', async () => {
    const parsed = await parseComic('comics/comic-natural-sort.cbz')
    expect(parsed.imagePageNames).toEqual([
      'page-1.jpg', 'page-2.jpg', 'page-10.jpg', 'page-11.jpg',
    ])
  })

  it('嵌套目录：递归收集 3 页', async () => {
    const parsed = await parseComic('comics/comic-nested-folders.cbz')
    expect(parsed.imagePages).toHaveLength(3)
  })

  it('中文文件名（UTF-8 标志位）', async () => {
    const parsed = await parseComic('comics/comic-chinese-names.cbz')
    expect(parsed.imagePages).toHaveLength(2)
  })

  it('混入非图片文件：被忽略', async () => {
    const parsed = await parseComic('comics/comic-mixed-nonimage.cbz')
    expect(parsed.imagePages).toHaveLength(1)
  })

  it('单页漫画', async () => {
    const parsed = await parseComic('comics/comic-single-page.cbz')
    expect(parsed.imagePages).toHaveLength(1)
  })

  it('章节识别：目录模式（第N话）→ 2 章', async () => {
    const parsed = await parseComic('comics/comic-chapter-folders.cbz')
    expect(parsed.chapters).toBeDefined()
    expect(parsed.chapters!.map((c) => c.title)).toEqual(['第01话', '第02话'])
    expect(parsed.chapters![0].imagePages).toHaveLength(2)
    // 扁平数组保持不变（兼容旧消费方）
    expect(parsed.imagePages).toHaveLength(4)
  })

  it('章节识别：零售内页文件夹过度细分 → 上退一级目录', async () => {
    const parsed = await parseComic('comics/comic-chapter-nested.cbz')
    expect(parsed.chapters!.map((c) => c.title)).toEqual(['Ch.001', 'Ch.002'])
    expect(parsed.chapters![0].imagePages).toHaveLength(2)
  })

  it('章节识别：文件名序列（前缀+首数字段）→ 2 章', async () => {
    const parsed = await parseComic('comics/comic-chapter-filename.cbz')
    expect(parsed.chapters!.map((c) => c.title)).toEqual(['第 1 话', '第 2 话'])
  })

  it('章节识别：条漫极端竖长图 → 一图一话 3 章', async () => {
    const parsed = await parseComic('comics/comic-webtoon-tall.cbz')
    expect(parsed.chapters).toBeDefined()
    expect(parsed.chapters!.length).toBe(3)
    expect(parsed.chapters![0].imagePages).toHaveLength(1)
  })

  it('无章节信号：基础 CBZ 保持单章（chapters undefined）', async () => {
    const parsed = await parseComic('comics/comic-basic-3pages.cbz')
    expect(parsed.chapters).toBeUndefined()
  })

  it.each(['comics/comic-empty.zip', 'comics/comic-no-images.zip'])(
    '空包/无图片包：%s 应报错而非静默成功',
    async (rel) => {
      await expect(parseComic(rel)).rejects.toThrow(/未找到任何图片/)
    }
  )
})

describe('多文件合并导入（multi-archive/）', () => {
  const MERGE_FILES = ['multi-archive/夜航 第01话.cbz', 'multi-archive/夜航 第02话.cbz', 'multi-archive/夜航 第03话.cbz'];

  it('全部文件名命中章节模式，书名推导为公共前缀', () => {
    const infos = MERGE_FILES.map((rel) => extractArchiveChapterInfo(rel.split('/').pop()!));
    expect(infos.every((i) => i !== null)).toBe(true)
    expect(infos.map((i) => i!.number)).toEqual([1, 2, 3])
    expect(deriveMergedBookTitle(MERGE_FILES.map((r) => r.split('/').pop()!), '我的文件夹')).toBe('夜航')
  })

  it('各档案解析出页面且（无内部结构）保持单章 → 合并为 3 章 6 页', async () => {
    const parsedList = await Promise.all(MERGE_FILES.map((rel) => parseComic(rel)))
    // 各文件无目录结构 → 单章（chapters undefined）
    expect(parsedList.every((p) => p.chapters === undefined)).toBe(true)
    expect(parsedList.map((p) => p.imagePages.length)).toEqual([2, 3, 1])
  })
})

describe('TXT 编码与结构边界', () => {

  it('UTF-8 无 BOM：首章前内容归「前言」，共 4 章', async () => {
    const parsed = await parseText('text/utf8-nobom.txt')
    expect(parsed.chapters?.map((c) => c.title)).toEqual([
      '前言', '第一章 开端', '第二章 发展', '第一百二十章 大结局',
    ])
  })

  it('UTF-8 带 BOM：BOM 被剥离，不影响标题', async () => {
    const parsed = await parseText('text/utf8-bom.txt')
    expect(parsed.chapters?.map((c) => c.title)).toContain('第一章 开端')
    expect(parsed.chapters?.[0].title.startsWith('\ufeff')).toBe(false)
  })

  it('GBK：回退解码成功且中文完整', async () => {
    const parsed = await parseText('text/gbk.txt')
    expect(parsed.textEncoding).toBe('gbk')
    expect(parsed.chapters?.map((c) => c.title)).toEqual([
      '第一章', '第二章', '第一百二十章',
    ])
    expect(parsed.chapters?.[0].content).toContain('这是内容。')
  })

  it('UTF-16LE：已知限制——乱码但不崩溃（行为锁）', async () => {
    const parsed = await parseText('text/utf16le-known-limitation.txt')
    expect(typeof parsed.textEncoding).toBe('string')
    expect(parsed.chapters).toBeDefined()
  })

  it('空文件与纯空白：0 章', async () => {
    const empty = await parseText('text/empty.txt')
    expect(empty.chapters).toHaveLength(0)
    const blank = await parseText('text/whitespace-only.txt')
    expect(blank.chapters).toHaveLength(0)
  })

  it('无章节标记：整篇归为「正文」单章', async () => {
    const parsed = await parseText('text/no-chapters.txt')
    expect(parsed.chapters).toHaveLength(1)
    expect(parsed.chapters?.[0].title).toBe('正文')
  })

  it('章节标记位于开头：前言被过滤，单章', async () => {
    const parsed = await parseText('text/chapter-at-start.txt')
    expect(parsed.chapters).toHaveLength(1)
    expect(parsed.chapters?.[0].title).toBe('第一章 从头开始')
  })

  it('大数字章节号：第12章/第100章', async () => {
    const parsed = await parseText('text/large-chapter-numbers.txt')
    expect(parsed.chapters?.map((c) => c.title)).toEqual(['第12章 十二', '第100章 一百'])
  })

  it('前导空白的伪标题：视为内容行，单章', async () => {
    const parsed = await parseText('text/indented-title-not-chapter.txt')
    expect(parsed.chapters).toHaveLength(1)
  })

  it('CRLF 行尾：标题不含残留 \\r', async () => {
    const parsed = await parseText('text/crlf.txt')
    expect(parsed.chapters?.map((c) => c.title)).toEqual(['第一章 CRLF', '第二章 CRLF'])
  })

  it('超长单段（约 220KB）：不崩溃且内容完整', async () => {
    const parsed = await parseText('text/long-paragraph.txt')
    expect(parsed.chapters).toHaveLength(1)
    expect(parsed.chapters?.[0].content.length).toBeGreaterThan(200_000)
  })
})

describe('Markdown 边界', () => {

  it('无标题：回退为单章正文', async () => {
    const parsed = await parseText('markdown/md-no-headings.md')
    expect(parsed.chapters).toHaveLength(1)
  })

  it('h1+h2：3 章且生成 markdownDocument', async () => {
    const parsed = await parseText('markdown/md-h1-h2.md')
    expect(parsed.chapters?.map((c) => c.title)).toEqual(['卷一', '第一章', '第二章'])
    for (const ch of parsed.chapters ?? []) {
      expect(ch.content.length).toBeGreaterThan(0)
    }
  })

  it('代码围栏内 # 行：已知限制——仍会被拆分为标题（行为锁）', async () => {
    const parsed = await parseText('markdown/md-code-fence-known-limitation.md')
    // 当前实现不感知围栏：'# 这不是标题' 会成为章节标题
    expect(parsed.chapters?.some((c) => c.title.includes('这不是标题'))).toBe(true)
  })
})

describe('EPUB 边界', () => {

  it('导入：标准 NCX 包解析出 2 章', async () => {
    const parsed = (await epubParser.parse(fileAt('epub/basic-ncx.epub'))) as ParsedTextBook
    expect(parsed.format).toBe('text')
    expect(parsed.chapters).toHaveLength(2)
  })

  it('导入：缺 container.xml 报错而非挂起', async () => {
    await expect(epubParser.parse(fileAt('epub/missing-container.epub'))).rejects.toThrow()
  })

  it('阅读：NCX 目录标题 + Markdown 保真内容', async () => {
    const chapters = await loadEpubChapters(fileAt('epub/basic-ncx.epub'))
    expect(chapters.map((c) => c.title)).toEqual(['第一章 目录', '第二章 目录'])
    expect(chapters[0].content).toContain('# 第一章 标题')
    expect(chapters[0].markdownDocument).toBeDefined()
  })

  it('阅读：EPUB3 仅 nav 无 NCX——nav 目录回退生效', async () => {
    const chapters = await loadEpubChapters(fileAt('epub/nav-only.epub'))
    expect(chapters.map((c) => c.title)).toEqual(['第一章 目录', '第二章 目录'])
  })

  it('阅读：空白章节被跳过', async () => {
    const chapters = await loadEpubChapters(fileAt('epub/empty-second-chapter.epub'))
    expect(chapters).toHaveLength(1)
  })

  it('阅读：缺 container 回退占位章节而非抛错', async () => {
    const chapters = await loadEpubChapters(fileAt('epub/missing-container.epub'))
    expect(chapters).toHaveLength(1)
    expect(chapters[0].content).toContain('无法解析 EPUB 包结构')
  })
})

describe('PDF 边界', () => {
  it('极简 1 页 PDF：numPages = 1', async () => {
    const doc = await loadPdfDocument(readFileSync(join(FIXTURES, 'pdf/minimal-1page.pdf')))
    expect(doc.numPages).toBe(1)
  })

  it('极简 3 页 PDF：numPages = 3', async () => {
    const doc = await loadPdfDocument(readFileSync(join(FIXTURES, 'pdf/minimal-3pages.pdf')))
    expect(doc.numPages).toBe(3)
  })

  it('截断损坏 PDF：解析失败而非挂起', async () => {
    await expect(loadPdfDocument(readFileSync(join(FIXTURES, 'pdf/truncated-corrupt.pdf')))).rejects.toThrow()
  })
})
