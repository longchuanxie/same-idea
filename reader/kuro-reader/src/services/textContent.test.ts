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
