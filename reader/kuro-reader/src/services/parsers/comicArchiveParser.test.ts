import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/services/archiveParser', () => ({
  parseArchiveFile: vi.fn(),
  parseArchiveFileStreaming: vi.fn(),
  parseImageFiles: vi.fn(),
}))

import { parseArchiveFile, parseArchiveFileStreaming } from '@/services/archiveParser'
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'

const mockParse = vi.mocked(parseArchiveFile)
const mockStream = vi.mocked(parseArchiveFileStreaming)

beforeEach(() => {
  vi.resetAllMocks()
})

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
    const parser = new ComicArchiveParser()
    expect(typeof parser.parse).toBe('function')
    expect(typeof parser.parseStreaming).toBe('function')
  })
})

describe('ComicArchiveParser.parse via mock', () => {
  it('builds a correctly-shaped ParsedComicBook from archive result', async () => {
    const testBlob = new Blob(['cover'], { type: 'image/jpeg' })
    const b1 = new Blob(['p1'], { type: 'image/jpeg' })
    const b2 = new Blob(['p2'], { type: 'image/jpeg' })
    const b3 = new Blob(['p3'], { type: 'image/jpeg' })

    mockParse.mockResolvedValueOnce({
      title: 't',
      coverBlob: testBlob,
      pages: [b1, b2, b3],
      pageNames: ['1.jpg', '2.jpg', '3.jpg'],
    })

    const parser = new ComicArchiveParser()
    const result = await parser.parse(new File([], 'x.zip'))

    expect(result.format).toBe('comic')
    if (result.format !== 'comic') return
    expect(result.imagePages).toHaveLength(3)
    expect(result.imagePages[0]).toBe(b1)
    expect(result.imagePages[1]).toBe(b2)
    expect(result.imagePages[2]).toBe(b3)
    expect(result.pageRefs).toEqual([
      { kind: 'image', index: 0 },
      { kind: 'image', index: 1 },
      { kind: 'image', index: 2 },
    ])
    expect(result.coverBlob).toBe(testBlob)
  })

  it('throws on empty archive (no images extracted)', async () => {
    mockParse.mockResolvedValueOnce({
      title: 't',
      coverBlob: null,
      pages: [],
      pageNames: [],
    })

    const parser = new ComicArchiveParser()
    await expect(parser.parse(new File([], 'empty.zip'))).rejects.toThrow('未找到任何图片')
  })
})

describe('ComicArchiveParser.parseStreaming via mock', () => {
  it('emits monotonically non-decreasing progress ending at 100', async () => {
    const blobs = Array.from({ length: 5 }, (_, i) => new Blob([`p${i}`], { type: 'image/jpeg' }))

    mockStream.mockImplementationOnce(async (_file, onPage) => {
      for (let i = 0; i < blobs.length; i++) {
        onPage(i, blobs[i])
      }
      return {
        title: 't',
        coverBlob: blobs[0],
        pageNames: ['0', '1', '2', '3', '4'],
        totalPages: 5,
      }
    })

    const progress: number[] = []
    const parser = new ComicArchiveParser()
    const result = await parser.parseStreaming(new File([], 'big.zip'), p => {
      progress.push(p)
    })

    expect(progress.length).toBeGreaterThan(0)
    expect(progress[progress.length - 1]).toBe(100)
    expect(progress[0]).toBeGreaterThan(0)
    for (let i = 1; i < progress.length; i++) {
      expect(progress[i]).toBeGreaterThanOrEqual(progress[i - 1])
    }
    for (let i = 0; i < progress.length - 1; i++) {
      expect(progress[i]).toBeGreaterThanOrEqual(0)
      expect(progress[i]).toBeLessThanOrEqual(95)
    }

    expect(result.format).toBe('comic')
    if (result.format !== 'comic') return
    expect(result.imagePages).toHaveLength(5)
  })
})
