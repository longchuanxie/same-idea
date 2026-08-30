import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  buildPdfSearchChapters,
  extractPdfPageTexts,
  getPdfPageTexts,
  clearPdfTextCache,
} from '@/services/pdfText'
import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { searchChapters } from '@/utils/textSearch'


// fake-indexeddb 对 jsdom Blob 的结构化克隆会退化为普通对象（无 Blob 方法），
// 缓存层测试整体 mock bookFileRepo（浏览器内真实 Blob 具备 arrayBuffer，无需兼容层）
const bookFileGet = vi.fn()
vi.mock('@/services/storage/bookFileRepo', () => ({
  bookFileRepo: { get: (...args: unknown[]) => bookFileGet(...args) },
}))

vi.mock('pdfjs-dist', async (importOriginal) => {
  const actual = await importOriginal<typeof import('pdfjs-dist')>()
  return {
    ...actual,
    getDocument: vi.fn(actual.getDocument),
  }
})

beforeEach(async () => {
  try {
    const db = await getDB()
    db.close()
  } catch {
    // first run: no DB yet
  }
  _resetDBForTesting()
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase('kuro-reader-db')
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    req.onblocked = () => resolve()
  })
  vi.mocked(getDocument).mockClear()
  bookFileGet.mockReset()

  // vitest 下 `?url` worker 路径解析错误：覆盖为绝对 file:// 地址供 fake worker 加载（同 boundaryFixtures）
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
  ).href
}, 20000)

/** 手工构造带文本流的最小多页 PDF（页 i 文本为 `Page ${i+1} content`），不依赖 pdf-lib */
function buildTextPdf(pageCount: number): ArrayBuffer {
  const objects: string[] = []; // 0 占位，从 1 起
  objects[1] = '<</Type/Catalog/Pages 2 0 R>>';
  const kids: string[] = [];
  for (let i = 0; i < pageCount; i++) {
    const pageObj = 3 + i * 2;
    const streamObj = pageObj + 1;
    kids.push(`${pageObj} 0 R`);
    objects[pageObj] = `<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents ${streamObj} 0 R/Resources<</Font<</F1 ${3 + pageCount * 2} 0 R>>>>>>`;
    const content = `BT /F1 14 Tf 72 700 Td (Page ${i + 1} content) Tj ET`;
    objects[streamObj] = `<</Length ${content.length}>>\nstream\n${content}\nendstream`;
  }
  objects[2] = `<</Type/Pages/Kids[${kids.join(' ')}]/Count ${pageCount}>>`;
  objects[3 + pageCount * 2] = '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>';

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 1; i < objects.length; i++) {
    offsets[i] = out.length;
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) {
    out += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<</Size ${objects.length}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i);
  return bytes.buffer;
}

describe('extractPdfPageTexts', () => {
  it('逐页提取文本且页序一致', async () => {
    const pages = await extractPdfPageTexts(buildTextPdf(3))
    expect(pages).toHaveLength(3)
    expect(pages[0]).toContain('Page 1 content')
    expect(pages[1]).toContain('Page 2 content')
    expect(pages[2]).toContain('Page 3 content')
  })

  it('无文本流的页产出空串（夹具裸 PDF）', async () => {
    const { readFileSync } = await import('node:fs')
    const bare = readFileSync('test-fixtures/pdf/minimal-1page.pdf')
    const bytes = new Uint8Array(bare.byteLength);
    bytes.set(bare);
    const pages = await extractPdfPageTexts(bytes.buffer)
    expect(pages).toEqual([''])
  })
})

describe('getPdfPageTexts', () => {
  it('经 bookFiles 读取并缓存：同书第二次不再解析', async () => {
    bookFileGet.mockResolvedValue(new Blob([buildTextPdf(2)], { type: 'application/pdf' }))

    const first = await getPdfPageTexts('pdf-book')
    expect(first).toHaveLength(2)
    const parseCalls = vi.mocked(getDocument).mock.calls.length

    const second = await getPdfPageTexts('pdf-book')
    expect(second).toHaveLength(2)
    expect(vi.mocked(getDocument).mock.calls.length).toBe(parseCalls)
    expect(bookFileGet).toHaveBeenCalledTimes(1) // 缓存命中连文件读取都省去
  })

  it('无原始文件返回空数组；clearPdfTextCache 后重新解析', async () => {
    bookFileGet.mockResolvedValue(undefined)
    expect(await getPdfPageTexts('missing')).toEqual([])

    bookFileGet.mockResolvedValue(new Blob([buildTextPdf(1)], { type: 'application/pdf' }))
    await getPdfPageTexts('pdf-book2')
    clearPdfTextCache('pdf-book2')
    const parseCalls = vi.mocked(getDocument).mock.calls.length
    await getPdfPageTexts('pdf-book2')
    expect(vi.mocked(getDocument).mock.calls.length).toBe(parseCalls + 1)
  })
})

describe('buildPdfSearchChapters + searchChapters 集成', () => {
  it('一页一章：命中 chapterIndex 即页索引', async () => {
    const pages = await extractPdfPageTexts(buildTextPdf(3))
    const chapters = buildPdfSearchChapters(pages)

    expect(chapters[1].title).toBe('第 2 页')
    const hits = searchChapters(chapters, 'Page 3')
    expect(hits).toHaveLength(1)
    expect(hits[0].chapterIndex).toBe(2)
    expect(hits[0].chapterTitle).toBe('第 3 页')
  })
})

describe('损坏文件', () => {
  it('提取失败时上抛而非挂起', async () => {
    const { readFileSync } = await import('node:fs')
    const corrupt = readFileSync('test-fixtures/pdf/truncated-corrupt.pdf')
    const bytes = new Uint8Array(corrupt.byteLength);
    bytes.set(corrupt);
    await expect(extractPdfPageTexts(bytes.buffer)).rejects.toBeTruthy()
  })
})
