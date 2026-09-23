import { describe, expect, it, vi } from 'vitest'

import {
  BookCorpusError,
  buildBookCorpus,
  buildDigestCorpus,
  buildDigestEntries,
  computeCorpusFingerprint,
  packCorpusEntries,
  selectDigestChapters,
} from '@/services/knowledge/bookCorpus'
import { getPdfPageTexts } from '@/services/pdfText'
import { loadTextContent } from '@/services/textContent'
import type { Book } from '@/types'

vi.mock('@/services/textContent', () => ({
  loadTextContent: vi.fn(),
}))

vi.mock('@/services/pdfText', () => ({
  getPdfPageTexts: vi.fn(),
}))

const mockedLoadTextContent = vi.mocked(loadTextContent)
const mockedGetPdfPageTexts = vi.mocked(getPdfPageTexts)

function makeTextBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: '测试书',
    author: '',
    format: 'text',
    chapters: [],
    ...overrides,
  } as Book
}

describe('packCorpusEntries', () => {
  it('小章节打包到目标体积的分块，块携带覆盖章节索引', () => {
    const entries = Array.from({ length: 10 }, (_, i) => ({
      label: `第${i + 1}章`,
      text: '章'.repeat(2000),
      chapterIndex: i,
    }))
    const chunks = packCorpusEntries(entries)
    expect(chunks.length).toBeGreaterThanOrEqual(2)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(6500)
    }
    // 每块文本携带章节标签
    expect(chunks[0].text).toContain('【第1章】')
    // 覆盖索引升序且连续（前 3 章挤进首块）
    expect(chunks[0].chapterIndexes).toEqual([0, 1, 2])
    // 全部章节都被某块覆盖
    const covered = new Set(chunks.flatMap((chunk) => chunk.chapterIndexes))
    expect(covered.size).toBe(10)
  })

  it('超长单章按段落边界切分，碎片继承同章索引', () => {
    const longText = Array.from({ length: 30 }, (_, i) => `段落${i}${'字'.repeat(500)}`).join('\n')
    const chunks = packCorpusEntries([{ label: '第1章', text: longText, chapterIndex: 0 }])
    expect(chunks.length).toBeGreaterThan(1)
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(6500)
      expect(chunk.chapterIndexes).toEqual([0])
    }
  })

  it('空文本条目被跳过', () => {
    const chunks = packCorpusEntries([
      { label: '空章', text: '   ', chapterIndex: 0 },
      { label: '第2章', text: '有效内容', chapterIndex: 1 },
    ])
    expect(chunks).toHaveLength(1)
    expect(chunks[0].text).toContain('有效内容')
    expect(chunks[0].chapterIndexes).toEqual([1])
  })
})

describe('computeCorpusFingerprint', () => {
  const chunks = [
    { label: '片段1', text: '一样的内容', chapterIndexes: [0] },
    { label: '片段2', text: '另一样的内容', chapterIndexes: [1] },
  ]

  it('内容一致指纹稳定，内容变化指纹改变', () => {
    expect(computeCorpusFingerprint(chunks, 2)).toBe(computeCorpusFingerprint(chunks, 2))
    expect(computeCorpusFingerprint(chunks, 2)).not.toBe(computeCorpusFingerprint(
      [{ label: '片段1', text: '一样的内容2', chapterIndexes: [0] }, chunks[1]],
      2
    ))
  })
})

describe('buildBookCorpus', () => {
  it('text 书：章节全文进语料，指纹与章节计数就位', async () => {
    mockedLoadTextContent.mockResolvedValue({
      chapters: [
        { id: 'ch1', title: '第一章', content: '张三走进酒馆。'.repeat(100) },
        { id: 'ch2', title: '第二章', content: '李四拔剑。'.repeat(100) },
      ],
      isEpub: false,
      isMarkdown: false,
    })

    const corpus = await buildBookCorpus(makeTextBook())
    expect(corpus.chapterCount).toBe(2)
    expect(corpus.totalChars).toBeGreaterThan(0)
    expect(corpus.chunks[0].text).toContain('张三走进酒馆')
    expect(corpus.fingerprint).toBeTruthy()
    // 章节全文暴露给证据校验，块携带章节索引
    expect(corpus.chapterTexts).toHaveLength(2)
    expect(corpus.chapterTexts[1]).toContain('李四拔剑')
    expect(corpus.chunks[0].chapterIndexes).toEqual([0, 1])
  })

  it('pdf 书：逐页入列（章索引即页索引），供 ?page= 回跳', async () => {
    mockedGetPdfPageTexts.mockResolvedValue(Array.from({ length: 25 }, (_, i) => `第${i + 1}页内容`))
    const corpus = await buildBookCorpus(makeTextBook({ format: 'pdf' }))
    expect(corpus.chapterCount).toBe(25)
    expect(corpus.chunks[0].text).toContain('第1页内容')
    expect(corpus.chunks[0].chapterIndexes[0]).toBe(0)
    expect(corpus.chapterTexts).toHaveLength(25)
  })

  it('漫画书直接抛 unsupported', async () => {
    await expect(buildBookCorpus(makeTextBook({ format: 'comic' }))).rejects.toMatchObject({
      code: 'unsupported',
    })
  })

  it('提不出文本时抛 empty', async () => {
    mockedLoadTextContent.mockResolvedValue({ chapters: [{ id: 'ch1', title: '图', content: '' }], isEpub: false, isMarkdown: false })
    await expect(buildBookCorpus(makeTextBook())).rejects.toBeInstanceOf(BookCorpusError)
  })

  it('章节范围：只打包范围内章节，chapterTexts 绝对对齐（范围外空串）', async () => {
    mockedLoadTextContent.mockResolvedValue({
      chapters: [
        { id: 'ch1', title: '第一章', content: '张三走进酒馆。'.repeat(50) },
        { id: 'ch2', title: '第二章', content: '李四拔剑。'.repeat(50) },
        { id: 'ch3', title: '第三章', content: '王五守城。'.repeat(50) },
      ],
      isEpub: false,
      isMarkdown: false,
    })

    const corpus = await buildBookCorpus(makeTextBook(), { from: 1 })
    expect(corpus.chapterCount).toBe(3)
    expect(corpus.coveredChapterCount).toBe(2)
    expect(corpus.coveredRange).toEqual({ from: 1, to: 2 })
    // 块携带绝对章索引——回原文跳转与全书生成一致
    expect(corpus.chunks[0].chapterIndexes).toEqual([1, 2])
    // chapterTexts 按绝对索引对齐，范围外空串：证据定位不因范围生成错位
    expect(corpus.chapterTexts[0]).toBe('')
    expect(corpus.chapterTexts[1]).toContain('李四拔剑')
    expect(corpus.chapterTexts[2]).toContain('王五守城')
  })

  it('体量护栏截断显性化：totalChunkCount 对账 + truncated 标记', async () => {
    // 61 章 × 7k 字 → 每章独立成块 → 超出 MAX_CHUNKS(60)
    mockedLoadTextContent.mockResolvedValue({
      chapters: Array.from({ length: 61 }, (_, i) => ({
        id: `ch${i + 1}`,
        title: `第${i + 1}章`,
        content: `第${i + 1}章内容。`.repeat(900),
      })),
      isEpub: false,
      isMarkdown: false,
    })

    const corpus = await buildBookCorpus(makeTextBook())
    expect(corpus.chapterCount).toBe(61)
    expect(corpus.totalChunkCount).toBeGreaterThan(60)
    expect(corpus.truncated).toBe(true)
    expect(corpus.chunks.length).toBe(60)
    expect(corpus.coveredChapterCount).toBeLessThan(61)
  })

  it('未触护栏时 truncated 为 false', async () => {
    mockedLoadTextContent.mockResolvedValue({
      chapters: [
        { id: 'ch1', title: '第一章', content: '内容。'.repeat(100) },
        { id: 'ch2', title: '第二章', content: '内容二。'.repeat(100) },
      ],
      isEpub: false,
      isMarkdown: false,
    })
    const corpus = await buildBookCorpus(makeTextBook())
    expect(corpus.truncated).toBe(false)
    expect(corpus.totalChunkCount).toBe(corpus.chunks.length)
  })

  it('范围 to 省略 = 到末尾（连载书增量补充）', async () => {
    mockedLoadTextContent.mockResolvedValue({
      chapters: [
        { id: 'ch1', title: '旧章', content: '旧内容。'.repeat(50) },
        { id: 'ch2', title: '新章一', content: '新内容一。'.repeat(50) },
        { id: 'ch3', title: '新章二', content: '新内容二。'.repeat(50) },
      ],
      isEpub: false,
      isMarkdown: false,
    })

    const corpus = await buildBookCorpus(makeTextBook(), { from: 1 })
    expect(corpus.chunks[0].chapterIndexes).toEqual([1, 2])
    expect(corpus.chapterTexts[0]).toBe('')
    expect(corpus.chapterTexts[1]).toContain('新内容一')
    expect(corpus.chapterTexts[2]).toContain('新内容二')
  })
})

describe('全书骨架 digest', () => {
  it('selectDigestChapters：章数少时全收；章数多时等距采样且首尾必保', () => {
    expect(selectDigestChapters(5, 7600)).toEqual([0, 1, 2, 3, 4])
    const sampled = selectDigestChapters(500, 7600)
    expect(sampled[0]).toBe(0)
    expect(sampled[sampled.length - 1]).toBe(499)
    expect(sampled.length).toBeLessThan(500)
    // 确定性：同一输入永远同一选章
    expect(selectDigestChapters(500, 7600)).toEqual(sampled)
  })

  it('buildDigestEntries：骨架行含标题与首尾摘句，摘句是原文逐字子串', () => {
    const chapters = [
      { title: '风起', content: '夜雨绵绵入市井。他在屋檐下擦剑，听见远处钟响。三更天后，城中起了第一场雾。' },
      { title: '云涌', content: '信使倒在门口，怀里的密函染了血。她拆开火漆，只看了一眼便吹熄了灯。' },
    ]
    const entries = buildDigestEntries(chapters, 7600)
    expect(entries).toHaveLength(2)
    expect(entries[0].line).toContain('风起')
    expect(entries[0].line).toContain('第1章')
    // 逐字子串（不做空白折叠），证据定位靠它命中
    expect(chapters[0].content).toContain(entries[0].line.split('：')[1].split('……')[0])
  })

  it('buildDigestCorpus：单块语料 + 全文 chapterTexts（证据定位用）', async () => {
    mockedLoadTextContent.mockResolvedValue({
      chapters: [
        { id: 'ch1', title: '第一章', content: '开局内容。'.repeat(30) },
        { id: 'ch2', title: '第二章', content: '高潮内容。'.repeat(30) },
      ],
      isEpub: false,
      isMarkdown: false,
    })
    const corpus = await buildDigestCorpus(makeTextBook())
    expect(corpus.chunks).toHaveLength(1)
    expect(corpus.chunks[0].label).toBe('全书骨架')
    expect(corpus.chunks[0].chapterIndexes).toEqual([0, 1])
    expect(corpus.chunks[0].text).toContain('第一章')
    // 骨架是压缩视图，但 chapterTexts 必须是全文——节拍证据的逐字定位在真章上进行
    expect(corpus.chapterTexts[1]).toContain('高潮内容。'.repeat(30))
    expect(corpus.totalChunkCount).toBe(1)
    expect(corpus.truncated).toBe(false)
  })

  it('buildDigestCorpus：范围限定生效（scope 起止章）', async () => {
    mockedLoadTextContent.mockResolvedValue({
      chapters: [
        { id: 'ch1', title: '旧章', content: '旧。'.repeat(40) },
        { id: 'ch2', title: '新章', content: '新。'.repeat(40) },
      ],
      isEpub: false,
      isMarkdown: false,
    })
    const corpus = await buildDigestCorpus(makeTextBook(), { from: 1 })
    expect(corpus.chunks[0].chapterIndexes).toEqual([1])
    expect(corpus.chunks[0].text).toContain('新章')
    expect(corpus.chunks[0].text).not.toContain('旧章')
  })
})
