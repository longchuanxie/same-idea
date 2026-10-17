import { describe, it, expect, beforeEach, vi } from 'vitest'

import { bookFileRepo } from '@/services/storage/bookFileRepo'
import { textChapterCacheRepo } from '@/services/storage/textChapterCacheRepo'
import { buildTextChapters, loadTextContent } from '@/services/textContent'

vi.mock('@/services/storage/bookFileRepo', () => ({
  bookFileRepo: { get: vi.fn() },
}))

// fake-indexeddb 的结构化克隆不支持 Blob（type 丢失），缓存仓储用内存 Map 顶替；
// 真实 IndexedDB 路径由 textChapterCacheRepo.test.ts 覆盖
vi.mock('@/services/storage/textChapterCacheRepo', () => {
  const store = new Map<string, unknown>()
  return {
    textChapterCacheRepo: {
      get: vi.fn(async (id: string) => store.get(id)),
      save: vi.fn(async (record: { bookId: string }) => {
        store.set(record.bookId, record)
      }),
      delete: vi.fn(async (id: string) => {
        store.delete(id)
      }),
      __store: store,
    },
  }
})

const blobGetMock = vi.mocked(bookFileRepo.get)
const cacheStore = vi.mocked(textChapterCacheRepo as unknown as { __store: Map<string, unknown> }).__store

beforeEach(() => {
  blobGetMock.mockReset()
  cacheStore.clear()
})

/** 等待 fire-and-forget 的缓存回填落地（warmTextChapterCache 不返回 Promise） */
const waitForCacheWrite = async (bookId: string) => {
  for (let i = 0; i < 20; i++) {
    if (cacheStore.has(bookId)) return cacheStore.get(bookId)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  return undefined
}

describe('loadTextContent 解析缓存', () => {
  it('未命中时解析并异步回填缓存', async () => {
    const text = '第一章 初见\n山雨欲来。\n第二章 再会\n风又起。'
    blobGetMock.mockResolvedValue(new Blob([text], { type: 'text/plain' }))

    const first = await loadTextContent('book-1')
    expect(first.chapters).toHaveLength(2)
    expect(first.isEpub).toBe(false)
    expect(first.isMarkdown).toBe(false)

    const record = await waitForCacheWrite('book-1') as { chapters?: unknown[]; isMarkdown?: boolean } | undefined
    expect(record).toBeDefined()
    expect(record?.chapters).toHaveLength(2)
    expect(record?.isMarkdown).toBe(false)
  })

  it('命中缓存时不再读原始文件（解析路径以 blob 读取为第一步，不读即不解析）', async () => {
    const text = '第一章 初见\n山雨欲来。\n第二章 再会\n风又起。'
    blobGetMock.mockResolvedValue(new Blob([text], { type: 'text/plain' }))
    await loadTextContent('book-2')
    await waitForCacheWrite('book-2')
    blobGetMock.mockClear()

    const second = await loadTextContent('book-2')
    expect(second.chapters).toHaveLength(2)
    expect(second.chapters[0]?.title).toBe('第一章 初见')
    expect(blobGetMock).not.toHaveBeenCalled()
  })

  it('blob 缺失时返回空章节', async () => {
    blobGetMock.mockResolvedValue(undefined)
    const result = await loadTextContent('ghost')
    expect(result.chapters).toEqual([])
    expect(result.isEpub).toBe(false)
  })

  it('Markdown 书回填缓存且命中后内容一致', async () => {
    const md = '# 一\n\n段落一\n\n# 二\n\n段落二'
    blobGetMock.mockResolvedValue(new Blob([md], { type: 'text/markdown' }))
    const first = await loadTextContent('book-3')
    expect(first.isMarkdown).toBe(true)
    expect(first.chapters).toHaveLength(2)
    expect(first.chapters[0]?.markdownDocument).toBeDefined()

    await waitForCacheWrite('book-3')
    blobGetMock.mockClear()
    const second = await loadTextContent('book-3')
    expect(second.chapters.map((ch) => ch.title)).toEqual(['一', '二'])
    expect(second.chapters[0]?.markdownDocument?.blocks.length).toBeGreaterThan(0)
    expect(blobGetMock).not.toHaveBeenCalled()
  })

  it('EPUB 书不走缓存（object URL 跨会话失效）', async () => {
    blobGetMock.mockResolvedValue(new Blob([new Uint8Array([1])], { type: 'application/epub+zip' }))
    // loadEpubChapters 对非法 zip 抛错 → 走「解析失败」兜底；本用例只关心不读/不写缓存
    await loadTextContent('book-4')
    const record = await waitForCacheWrite('book-4')
    expect(record).toBeUndefined()
  })

  it('无 fileType 指纹的旧缓存记录不信任：重读原件重算并回填指纹（历史投毒记录自愈）', async () => {
    const text = '第一章 初见\n山雨欲来。'
    blobGetMock.mockResolvedValue(new Blob([text], { type: 'text/plain' }))
    await loadTextContent('book-legacy')
    const record = await waitForCacheWrite('book-legacy') as { fileType?: string; sanitizeRev?: string } | undefined
    expect(record?.fileType).toBe('text/plain')

    // 剥掉指纹模拟旧记录（含曾被 EPUB 导入预热投毒的形态），重存
    if (record) delete record.fileType
    cacheStore.set('book-legacy', record)
    blobGetMock.mockClear()

    const second = await loadTextContent('book-legacy')
    expect(blobGetMock).toHaveBeenCalled() // 不再吃缓存，重读原件
    expect(second.chapters[0]?.title).toBe('第一章 初见')

    // 回填后的记录带指纹，再次开书恢复命中
    const rewritten = await waitForCacheWrite('book-legacy') as { fileType?: string } | undefined
    expect(rewritten?.fileType).toBe('text/plain')
    blobGetMock.mockClear()
    await loadTextContent('book-legacy')
    expect(blobGetMock).not.toHaveBeenCalled()
  })

  it('EPUB 投毒记录（旧形态）被无视：开书回到 EPUB 保真管线', async () => {
    // 模拟历史投毒：EPUB 书下挂着无指纹的「纯文本章节」缓存
    cacheStore.set('book-poisoned', {
      bookId: 'book-poisoned',
      isMarkdown: false,
      totalChars: 6,
      chapters: [{ id: 'ch1', title: '正文', content: '无图纯文本' }],
      cachedAt: Date.now(),
    })
    blobGetMock.mockResolvedValue(new Blob([new Uint8Array([1])], { type: 'application/epub+zip' }))

    const result = await loadTextContent('book-poisoned')
    expect(blobGetMock).toHaveBeenCalled() // 缓存被无视，读了原始 EPUB
    expect(result.isEpub).toBe(true) // 走 EPUB 管线（非法 zip 落「解析失败」兜底，但管线正确）
  })
})

describe('warmTextChapterCache 源类型门禁', () => {
  it('非 text/* 源不写缓存（EPUB 导入预热直接跳过）', async () => {
    const { warmTextChapterCache } = await import('@/services/textContent')
    warmTextChapterCache('book-epub-warm', [{ id: 'ch1', title: 'T', content: 'x' }], false, undefined, 'application/epub+zip')
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(cacheStore.has('book-epub-warm')).toBe(false)
  })
})

describe('buildTextChapters', () => {
  it('为 Markdown 章附带解析文档，TXT 章不带', () => {
    const txtChapters = buildTextChapters([{ title: '第一章', content: '正文' }], false)
    expect(txtChapters[0]?.markdownDocument).toBeUndefined()
    expect(txtChapters[0]?.id).toBe('ch1')

    const mdChapters = buildTextChapters([{ title: '', content: '# 标题\n\n正文' }], true)
    expect(mdChapters[0]?.markdownDocument).toBeDefined()
    expect(mdChapters[0]?.title).toBe('第1章') // 空标题回退编号
  })
})
