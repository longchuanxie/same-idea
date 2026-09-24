import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatCompletionJson, type AiProviderConfig } from '@/services/ai/aiClient'
import { buildBookCorpus, BookCorpusError } from '@/services/knowledge/bookCorpus'
import type { GenerationCheckpoint } from '@/services/storage/generationTaskRepo'
import type { Book, KnowledgeArtifact } from '@/types'

import { runKnowledgeGeneration } from './generationRunner'

// ---- 模块替身（与 useKnowledgeStore.test 同构：vitest 提升到导入之前执行） ----

vi.mock('@/services/knowledge/bookCorpus', () => ({
  buildBookCorpus: vi.fn(),
  buildDigestCorpus: vi.fn(),
  BookCorpusError: class BookCorpusError extends Error {
    constructor(
      message: string,
      readonly code: 'unsupported' | 'empty'
    ) {
      super(message)
    }
  },
}))

vi.mock('@/services/ai/aiClient', () => ({
  isProviderConfigured: vi.fn(),
  chatCompletionJson: vi.fn(),
}))

const mockedChat = vi.mocked(chatCompletionJson)
const mockedBuildCorpus = vi.mocked(buildBookCorpus)

const config: AiProviderConfig = { baseUrl: 'https://api.example.com', apiKey: 'sk-x', model: 'test-model' }

const graphFixture = (names: string[]) => ({
  characters: names.map((name) => ({ name, role: '人物' })),
  relationships:
    names.length >= 2
      ? [{ source: names[0], target: names[1], relation: '盟友' }]
      : [],
})

function corpusFixture(fingerprint = 'fp-1') {
  return {
    chunks: [
      { label: '片段1', text: '张三与李四比剑。', chapterIndexes: [0] },
      { label: '片段2', text: '王五出场。', chapterIndexes: [1] },
    ],
    chapterCount: 2,
    coveredChapterCount: 2,
    coveredRange: null,
    totalChunkCount: 2,
    totalChars: 20,
    fingerprint,
    chapterTexts: ['张三与李四比剑。', '王五出场。'],
  }
}

/** 多块语料：第 i 块只出场第 i 个名字（并发/断点用例的确定性素材） */
function multiChunkCorpus(count: number, fingerprint = 'fp-n') {
  const names = Array.from({ length: count }, (_, i) => `人物${i + 1}`)
  return {
    chunks: names.map((name, i) => ({
      label: `片段${i + 1}`,
      text: `${name}出场。`,
      chapterIndexes: [i],
    })),
    chapterCount: count,
    coveredChapterCount: count,
    coveredRange: null,
    totalChunkCount: count,
    totalChars: count * 6,
    fingerprint,
    chapterTexts: names.map((name) => `${name}出场。`),
  }
}

const book: Book = {
  id: 'book-1',
  title: '测试书',
  author: '佚名',
  format: 'text',
  chapters: [],
} as unknown as Book

beforeEach(() => {
  vi.clearAllMocks()
  mockedBuildCorpus.mockResolvedValue(corpusFixture())
})

describe('generationRunner · 分块生成', () => {
  it('逐块请求 → 进度回报 → 合并组装产物（复用旧件 id、记增量清单）', async () => {
    mockedChat
      .mockResolvedValueOnce(graphFixture(['张三', '李四']))
      .mockResolvedValueOnce(graphFixture(['王五']))

    const progress: [number, number][] = []
    const checkpoints: GenerationCheckpoint[] = []
    const existing: KnowledgeArtifact[] = [
      {
        id: 'kn-old',
        bookId: 'book-1',
        type: 'character-graph',
        title: '人物关系图谱',
        data: { nodes: [], edges: [] },
        generator: 'ai',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ]

    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing,
      onProgress: (done, total) => progress.push([done, total]),
      onCheckpoint: async (checkpoint) => {
        checkpoints.push(checkpoint)
      },
    })

    expect(outcome.ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(2)
    expect(progress).toEqual([
      [0, 2],
      [1, 2],
      [2, 2],
    ])
    expect(checkpoints).toHaveLength(2)
    if (outcome.ok) {
      expect(outcome.artifact.id).toBe('kn-old')
      expect(outcome.staleArtifactIds).toEqual([])
      expect(outcome.artifact.meta?.contentFingerprint).toBe('fp-1')
    }
  })

  it('checkpoint 有效时续跑：跳过已完成块，knownNames 注入后续提示词', async () => {
    mockedChat.mockResolvedValueOnce(graphFixture(['王五', '赵六']))
    const checkpoint: GenerationCheckpoint = {
      slots: [
        {
          label: '片段1',
          data: {
            characters: [
              { name: '张三', role: '主角' },
              { name: '李四', role: '盟友' },
            ],
            relationships: [{ source: '张三', target: '李四', relation: '盟友' }],
          },
        },
      ],
      knownNames: ['张三'],
      corpusFingerprint: 'fp-1',
      corpusChunkCount: 2,
    }

    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing: [],
      checkpoint,
      onProgress: () => {},
      onCheckpoint: () => {},
    })

    expect(outcome.ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(1)
    const messages = mockedChat.mock.calls[0][1].messages
    expect(messages[1].content).toContain('此前片段已确认的人物：张三')
    if (outcome.ok) {
      expect(outcome.artifact.meta?.analyzedChunkCount).toBe(2)
    }
  })

  it('指纹不符的 checkpoint 整体作废，从第 0 块重跑', async () => {
    mockedChat
      .mockResolvedValueOnce(graphFixture(['张三', '李四']))
      .mockResolvedValueOnce(graphFixture(['张三', '王五']))
    const checkpoint: GenerationCheckpoint = {
      slots: [{ label: '片段1', data: { characters: [], relationships: [] } }],
      knownNames: [],
      corpusFingerprint: 'fp-stale',
      corpusChunkCount: 2,
    }

    const progress: [number, number][] = []
    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing: [],
      checkpoint,
      onProgress: (done, total) => progress.push([done, total]),
      onCheckpoint: () => {},
    })

    expect(outcome.ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(2)
    expect(progress[0]).toEqual([0, 2])
  })

  it('abort 后返回 cancelled 且不再发请求', async () => {
    const controller = new AbortController()
    mockedChat.mockImplementation((_config, opts) => {
      controller.abort()
      return new Promise((_resolve, reject) => {
        if (opts?.signal?.aborted) {
          reject(new Error('已取消'))
          return
        }
        opts?.signal?.addEventListener('abort', () => reject(new Error('已取消')))
      })
    })

    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: controller.signal,
      existing: [],
      onProgress: () => {},
      onCheckpoint: () => {},
    })

    expect(outcome).toMatchObject({ ok: false, cancelled: true })
    expect(mockedChat).toHaveBeenCalledTimes(1)
  })

  it('全部块解析失败时报「没有可用分析结果」且不组装产物', async () => {
    mockedChat.mockResolvedValue({ totally: 'unrelated' })
    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing: [],
      onProgress: () => {},
      onCheckpoint: () => {},
    })
    expect(outcome).toMatchObject({ ok: false, error: 'AI 没有返回任何可用的分析结果' })
  })

  it('增量补充无新章节时透传可读错误', async () => {
    mockedBuildCorpus.mockRejectedValueOnce(
      new BookCorpusError('这本书提不出可分析的文本（可能没有文字层）', 'empty')
    )
    const existing: KnowledgeArtifact[] = [
      {
        id: 'kn-base',
        bookId: 'book-1',
        type: 'character-graph',
        title: '人物关系图谱',
        data: { nodes: [], edges: [] },
        generator: 'ai',
        createdAt: new Date(),
        updatedAt: new Date(),
        meta: { chapterCount: 3, contentFingerprint: 'fp-old', bookChapterCount: 3 },
      },
    ]

    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing,
      options: { incremental: true },
      onProgress: () => {},
      onCheckpoint: () => {},
    })

    expect(outcome).toMatchObject({ ok: false, error: '没有发现需要补充的新章节（书还没有更新）' })
  })
})

describe('generationRunner · 分块失败重试（长书护栏）', () => {
  const run = () =>
    runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing: [],
      onProgress: () => {},
      onCheckpoint: () => {},
    })

  it('瞬断后重试成功：整轮生成不被抖动毁掉', async () => {
    vi.useFakeTimers()
    try {
      mockedChat
        .mockRejectedValueOnce(new Error('AI 服务响应超时'))
        .mockRejectedValueOnce(new Error('AI 服务响应超时'))
        .mockResolvedValueOnce(graphFixture(['张三', '李四']))
        .mockResolvedValueOnce(graphFixture(['王五']))

      const pending = run()
      await vi.advanceTimersByTimeAsync(2_000)
      await vi.advanceTimersByTimeAsync(8_000)
      const outcome = await pending

      expect(outcome.ok).toBe(true)
      expect(mockedChat).toHaveBeenCalledTimes(4)
    } finally {
      vi.useRealTimers()
    }
  })

  it('重试耗尽仍失败：报错带片段序号与「从该片段继续」指引', async () => {
    mockedBuildCorpus.mockResolvedValue(multiChunkCorpus(1, 'fp-one'))
    vi.useFakeTimers()
    try {
      mockedChat.mockRejectedValue(new Error('AI 服务响应超时'))

      const pending = run()
      await vi.advanceTimersByTimeAsync(2_000)
      await vi.advanceTimersByTimeAsync(8_000)
      const outcome = await pending

      expect(outcome.ok).toBe(false)
      if (!outcome.ok) {
        expect(outcome.error).toContain('片段 1/1 请求失败')
        expect(outcome.error).toContain('从该片段继续')
      }
      expect(mockedChat).toHaveBeenCalledTimes(3)
    } finally {
      vi.useRealTimers()
    }
  })

  it('并发跑满滑动窗口：6 块 4 路在飞，超上限不派发', async () => {
    mockedBuildCorpus.mockResolvedValue(multiChunkCorpus(6, 'fp-six'))
    let active = 0
    let maxActive = 0
    mockedChat.mockImplementation(async () => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 0))
      active -= 1
      return graphFixture(['张三', '李四'])
    })

    const outcome = await run()

    expect(outcome.ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(6)
    expect(maxActive).toBe(4)
  })

  it('失败即停派：终态失败后不再发新请求，在飞块照常落断点', async () => {
    mockedBuildCorpus.mockResolvedValue(multiChunkCorpus(6, 'fp-fail'))
    vi.useFakeTimers()
    try {
      const seen = new Set<number>()
      mockedChat.mockImplementation(async (_config, opts) => {
        const content = opts?.messages?.[1]?.content ?? ''
        const chunkNo = Number(content.match(/第 (\d+)\/6 部分/)?.[1] ?? 0)
        seen.add(chunkNo)
        // 第 1 块始终失败（吃满 3 次重试），其余块成功
        if (chunkNo === 1) throw new Error('AI 服务响应超时')
        await new Promise((resolve) => setTimeout(resolve, 0))
        return graphFixture(['张三', '李四'])
      })
      const checkpoints: GenerationCheckpoint[] = []

      const pending = runKnowledgeGeneration({
        book,
        type: 'character-graph',
        config,
        signal: new AbortController().signal,
        existing: [],
        onProgress: () => {},
        onCheckpoint: async (value) => {
          checkpoints.push(value)
        },
      })
      await vi.advanceTimersByTimeAsync(2_000)
      await vi.advanceTimersByTimeAsync(8_000)
      const outcome = await pending

      expect(outcome.ok).toBe(false)
      if (!outcome.ok) expect(outcome.error).toContain('片段 1/6 请求失败')
      expect(seen.has(1)).toBe(true)
      // 断点保留全部已完成的在飞块，失败块留 null 等重试
      const last = checkpoints[checkpoints.length - 1]
      expect(last.slots[0]).toBeNull()
      expect(last.slots.filter((slot) => slot != null)).toHaveLength(seen.size - 1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('全空槽位的 checkpoint 作废重跑：零产出的断点不值得继承', async () => {
    mockedChat
      .mockResolvedValueOnce(graphFixture(['张三', '李四']))
      .mockResolvedValueOnce(graphFixture(['王五']))
    const checkpoint: GenerationCheckpoint = {
      slots: [
        { label: '片段1', data: null },
        { label: '片段2', data: null },
      ],
      knownNames: [],
      corpusFingerprint: 'fp-1',
      corpusChunkCount: 2,
    }

    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing: [],
      checkpoint,
      onProgress: () => {},
      onCheckpoint: () => {},
    })

    expect(outcome.ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(2)
  })

  it('并发空洞断点：只补未完成块，槽位全程按块序对齐', async () => {
    mockedBuildCorpus.mockResolvedValue(multiChunkCorpus(3, 'fp-hole'))
    mockedChat.mockResolvedValueOnce(graphFixture(['王五', '赵六']))
    const checkpoint: GenerationCheckpoint = {
      slots: [
        { label: '片段1', data: graphFixture(['张三', '李四']) },
        null,
        { label: '片段3', data: graphFixture(['孙七', '周八']) },
      ],
      knownNames: ['张三'],
      corpusFingerprint: 'fp-hole',
      corpusChunkCount: 3,
    }
    const checkpoints: GenerationCheckpoint[] = []

    const outcome = await runKnowledgeGeneration({
      book,
      type: 'character-graph',
      config,
      signal: new AbortController().signal,
      existing: [],
      checkpoint,
      onProgress: () => {},
      onCheckpoint: async (value) => {
        checkpoints.push(value)
      },
    })

    expect(outcome.ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(1)
    // 请求的是第 2 块（空洞位）
    expect(mockedChat.mock.calls[0][1].messages[1].content).toContain('第 2/3 部分')
    // 断点槽位补齐为全块长，空洞被填上
    expect(checkpoints[0].slots).toHaveLength(3)
    expect(checkpoints[0].slots.every((slot) => slot != null)).toBe(true)
  })
})
