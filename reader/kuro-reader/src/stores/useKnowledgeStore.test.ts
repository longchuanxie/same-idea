import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatCompletionJson } from '@/services/ai/aiClient'
import { buildBookCorpus, BookCorpusError } from '@/services/knowledge/bookCorpus'
import { useAppStore } from '@/stores/useAppStore'
import { useKnowledgeStore } from '@/stores/useKnowledgeStore'
import type { Book, KnowledgeArtifact } from '@/types'

// ---- 模块替身（vi.mock 由 vitest 提升到导入之前执行） ----

vi.mock('@/services/knowledge/bookCorpus', () => ({
  buildBookCorpus: vi.fn().mockResolvedValue({
    chunks: [
      { label: '第1章', text: '张三与李四比剑。', chapterIndexes: [0] },
      { label: '第2章', text: '王五出场，与张三结盟。', chapterIndexes: [1] },
    ],
    chapterCount: 2,
    coveredChapterCount: 2,
    coveredRange: null,
    totalChars: 20,
    fingerprint: 'fp-1',
    chapterTexts: ['张三与李四比剑。', '王五出场，与张三结盟。'],
  }),
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
  isProviderConfigured: (c: { baseUrl: string; model: string }) =>
    c.baseUrl.trim().length > 0 && c.model.trim().length > 0,
  chatCompletionJson: vi.fn(),
}))

const memoryArtifacts = new Map<string, KnowledgeArtifact>()

vi.mock('@/services/storage/knowledgeRepo', () => ({
  knowledgeRepo: {
    save: vi.fn(async (artifact: KnowledgeArtifact) => {
      memoryArtifacts.set(artifact.id, artifact)
    }),
    remove: vi.fn(async (id: string) => {
      memoryArtifacts.delete(id)
    }),
    getByBookId: vi.fn(async (bookId: string) =>
      [...memoryArtifacts.values()].filter((a) => a.bookId === bookId)
    ),
  },
}))

const mockedChat = vi.mocked(chatCompletionJson)
const mockedBuildCorpus = vi.mocked(buildBookCorpus)

const graphFixture = (names: string[], evidence?: string) => ({
  characters: names.map((name) => ({ name, role: '人物' })),
  relationships:
    names.length >= 2
      ? [{ source: names[0], target: names[1], relation: '盟友', ...(evidence ? { evidence } : {}) }]
      : [],
})

const book: Book = {
  id: 'book-1',
  title: '测试书',
  author: '佚名',
  format: 'text',
  chapters: [],
} as unknown as Book

function configureProvider() {
  useAppStore.setState({
    settings: {
      ...useAppStore.getState().settings,
      knowledgeAiUrl: 'https://api.example.com',
      knowledgeAiKey: 'sk-x',
      knowledgeAiModel: 'test-model',
    },
  })
}

beforeEach(() => {
  memoryArtifacts.clear()
  mockedChat.mockReset()
  useKnowledgeStore.setState({ artifactsByBook: {}, generation: {} })
})

describe('useKnowledgeStore.generateArtifact', () => {
  it('未配置 AI 时置错误态且不发起请求', async () => {
    useAppStore.setState({
      settings: { ...useAppStore.getState().settings, knowledgeAiUrl: '', knowledgeAiModel: '' },
    })
    const ok = await useKnowledgeStore.getState().generateArtifact(book, 'character-graph')
    expect(ok).toBe(false)
    expect(mockedChat).not.toHaveBeenCalled()
    expect(useKnowledgeStore.getState().generation['book-1:character-graph']?.status).toBe('error')
  })

  it('分块生成 → 合并落库（章节并集 + 证据定位）→ 状态清空', async () => {
    configureProvider()
    mockedChat
      .mockResolvedValueOnce(graphFixture(['张三', '李四'], '张三与李四比剑'))
      .mockResolvedValueOnce(graphFixture(['张三', '王五'], '原文里没有这句幻觉'))

    const ok = await useKnowledgeStore.getState().generateArtifact(book, 'character-graph')
    expect(ok).toBe(true)
    expect(mockedChat).toHaveBeenCalledTimes(2)

    const artifacts = useKnowledgeStore.getState().artifactsByBook['book-1']
    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].type).toBe('character-graph')
    // 张三在两块都出现 → 合并为一个节点；两个盟友关系端点对不同 → 两条边
    const graph = artifacts[0].data as {
      nodes: { name: string; chapters?: number[] }[]
      edges: { relation: string; evidence?: { chapterIndex: number }; chapters?: number[] }[]
    }
    expect(graph.nodes.map((n) => n.name).sort()).toEqual(['张三', '李四', '王五'])
    expect(graph.edges).toHaveLength(2)
    // 张三出现于两块 → 章节并集 [0, 1]
    expect(graph.nodes.find((n) => n.name === '张三')?.chapters).toEqual([0, 1])
    // 第一条关系证据在真实章节文本中命中 → 定位到第 0 章；幻觉句被丢弃，仅留章节并集
    const located = graph.edges.find((e) => e.evidence)
    expect(located?.evidence?.chapterIndex).toBe(0)
    const hallucinated = graph.edges.find((e) => !e.evidence)
    expect(hallucinated?.chapters).toEqual([1])
    expect(artifacts[0].meta?.contentFingerprint).toBe('fp-1')
    expect(useKnowledgeStore.getState().generation['book-1:character-graph']).toBeUndefined()
  })

  it('生成中暴露进度（running → done 递增）', async () => {
    configureProvider()
    let releaseSecond: (value: unknown) => void = () => {}
    const secondGate = new Promise((resolve) => {
      releaseSecond = resolve
    })
    mockedChat
      .mockResolvedValueOnce(graphFixture(['张三', '李四']))
      .mockImplementationOnce(() => secondGate.then(() => graphFixture(['王五'])))

    const generationPromise = useKnowledgeStore.getState().generateArtifact(book, 'character-graph')
    await vi.waitFor(() => {
      expect(useKnowledgeStore.getState().generation['book-1:character-graph']?.done).toBe(1)
    })
    releaseSecond(graphFixture(['王五']))
    await generationPromise
  })

  it('中途取消：任务中止且状态清除', async () => {
    configureProvider()
    mockedChat.mockImplementation((_config, opts) =>
      new Promise((_resolve, reject) => {
        opts?.signal?.addEventListener('abort', () => reject(new Error('已取消')))
      })
    )

    const generationPromise = useKnowledgeStore.getState().generateArtifact(book, 'character-graph')
    await vi.waitFor(() => {
      expect(useKnowledgeStore.getState().generation['book-1:character-graph']?.status).toBe('running')
    })
    useKnowledgeStore.getState().cancelGeneration('book-1', 'character-graph')

    const ok = await generationPromise
    expect(ok).toBe(false)
    expect(useKnowledgeStore.getState().generation['book-1:character-graph']).toBeUndefined()
    expect(memoryArtifacts.size).toBe(0)
  })

  it('全部分块解析失败时报告错误且不落库', async () => {
    configureProvider()
    mockedChat.mockResolvedValue({ totally: 'unrelated' })

    const ok = await useKnowledgeStore.getState().generateArtifact(book, 'character-graph')
    expect(ok).toBe(false)
    const state = useKnowledgeStore.getState().generation['book-1:character-graph']
    expect(state?.status).toBe('error')
    expect(state?.error).toContain('AI')
    expect(memoryArtifacts.size).toBe(0)
  })

  it('重新生成复用旧件 id 并替换数据', async () => {
    configureProvider()
    mockedChat.mockResolvedValue(graphFixture(['张三', '李四']))
    await useKnowledgeStore.getState().generateArtifact(book, 'character-graph')
    const firstId = useKnowledgeStore.getState().artifactsByBook['book-1'][0].id

    mockedChat.mockResolvedValue(graphFixture(['赵六', '钱七']))
    await useKnowledgeStore.getState().generateArtifact(book, 'character-graph')

    const artifacts = useKnowledgeStore.getState().artifactsByBook['book-1']
    expect(artifacts).toHaveLength(1)
    expect(artifacts[0].id).toBe(firstId)
    expect((artifacts[0].data as { nodes: { name: string }[] }).nodes.map((n) => n.name)).toEqual(['赵六', '钱七'])
  })

  it('removeArtifact 从内存与 repo 双清', async () => {
    memoryArtifacts.set('kn-1', {
      id: 'kn-1',
      bookId: 'book-1',
      type: 'mindmap',
      title: '全书思维导图',
      data: { title: '测试书', children: [{ title: '主线' }] },
      generator: 'ai',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await useKnowledgeStore.getState().loadArtifacts('book-1')
    await useKnowledgeStore.getState().removeArtifact('book-1', 'kn-1')

    expect(useKnowledgeStore.getState().artifactsByBook['book-1']).toEqual([])
    expect(memoryArtifacts.has('kn-1')).toBe(false)
  })
})

describe('useKnowledgeStore.generateArtifact · 生成灵活性', () => {
  it('范围生成：语料请求带范围，meta 记录范围/总章数/详细度', async () => {
    configureProvider()
    mockedBuildCorpus.mockResolvedValueOnce({
      chunks: [{ label: '片段1', text: '张三与李四比剑。', chapterIndexes: [0] }],
      chapterCount: 10,
      coveredChapterCount: 1,
      coveredRange: { from: 0, to: 0 },
      totalChunkCount: 1,
      truncated: false,
      totalChars: 10,
      fingerprint: 'fp-scope',
      chapterTexts: ['张三与李四比剑。'],
    })
    mockedChat.mockResolvedValue(graphFixture(['张三', '李四'], '张三与李四比剑'))

    const ok = await useKnowledgeStore
      .getState()
      .generateArtifact(book, 'character-graph', { scope: { from: 0, to: 0 }, detail: 'core' })
    expect(ok).toBe(true)
    expect(mockedBuildCorpus).toHaveBeenCalledWith(book, { from: 0, to: 0 })

    const meta = useKnowledgeStore.getState().artifactsByBook['book-1'][0].meta
    expect(meta?.scope).toEqual({ from: 0, to: 0 })
    expect(meta?.detail).toBe('core')
    expect(meta?.chapterCount).toBe(1)
    expect(meta?.bookChapterCount).toBe(10)
    // 块级对账：分析完整性凭据
    expect(meta?.analyzedChunkCount).toBe(1)
    expect(meta?.totalChunkCount).toBe(1)
  })

  it('增量补充：默认从上次章数起读，旧证据坐标原样保留、新边照常定位', async () => {
    configureProvider()
    const existing: KnowledgeArtifact = {
      id: 'kn-base',
      bookId: 'book-1',
      type: 'character-graph',
      title: '人物关系图谱',
      data: {
        nodes: [
          { id: '张三', name: '张三', weight: 1, chapters: [0] },
          { id: '李四', name: '李四', weight: 1, chapters: [0] },
        ],
        edges: [
          {
            source: '张三',
            target: '李四',
            relation: '盟友',
            chapters: [0],
            evidence: { quote: '张三与李四比剑', chapterIndex: 0, offsetRatio: 0.25 },
          },
        ],
      },
      generator: 'ai',
      createdAt: new Date(),
      updatedAt: new Date(),
      meta: { chapterCount: 2, contentFingerprint: 'fp-old', bookChapterCount: 2 },
    }
    useKnowledgeStore.setState((state) => ({
      artifactsByBook: { ...state.artifactsByBook, 'book-1': [existing] },
    }))

    mockedBuildCorpus.mockResolvedValueOnce({
      chunks: [{ label: '片段1', text: '王五与赵六结盟。', chapterIndexes: [2] }],
      chapterCount: 3,
      coveredChapterCount: 1,
      coveredRange: { from: 2, to: 2 },
      totalChunkCount: 1,
      truncated: false,
      totalChars: 9,
      fingerprint: 'fp-inc',
      chapterTexts: ['', '', '王五与赵六结盟。'],
    })
    mockedChat.mockResolvedValue(
      graphFixture(['王五', '赵六'], '王五与赵六结盟')
    )

    const ok = await useKnowledgeStore.getState().generateArtifact(book, 'character-graph', { incremental: true })
    expect(ok).toBe(true)
    expect(mockedBuildCorpus).toHaveBeenCalledWith(book, { from: 2 })

    const artifact = useKnowledgeStore.getState().artifactsByBook['book-1'][0]
    const graph = artifact.data as {
      nodes: { name: string }[]
      edges: { relation: string; evidence?: { quote: string; chapterIndex: number; offsetRatio: number } }[]
    }
    expect(graph.nodes.map((n) => n.name).sort()).toEqual(['张三', '李四', '王五', '赵六'])
    // 旧边：证据坐标原样直通，不被重新校验改写
    const oldEdge = graph.edges.find((e) => e.evidence?.chapterIndex === 0)
    expect(oldEdge?.evidence?.quote).toBe('张三与李四比剑')
    expect(oldEdge?.evidence?.offsetRatio).toBe(0.25)
    // 新边：新章节里照常逐字定位
    const newEdge = graph.edges.find((e) => e.evidence?.chapterIndex === 2)
    expect(newEdge?.evidence?.quote).toBe('王五与赵六结盟')
    expect(artifact.meta?.bookChapterCount).toBe(3)
    expect(artifact.meta?.scope).toEqual({ from: 2, to: 2 })
  })

  it('增量补充但无新章节时给出可读错误', async () => {
    configureProvider()
    const existing: KnowledgeArtifact = {
      id: 'kn-base',
      bookId: 'book-1',
      type: 'character-graph',
      title: '人物关系图谱',
      data: { nodes: [], edges: [] },
      generator: 'ai',
      createdAt: new Date(),
      updatedAt: new Date(),
      meta: { chapterCount: 3, contentFingerprint: 'fp-old', bookChapterCount: 3 },
    }
    useKnowledgeStore.setState((state) => ({
      artifactsByBook: { ...state.artifactsByBook, 'book-1': [existing] },
    }))
    mockedBuildCorpus.mockRejectedValueOnce(
      new BookCorpusError('这本书提不出可分析的文本（可能没有文字层）', 'empty')
    )

    const ok = await useKnowledgeStore.getState().generateArtifact(book, 'character-graph', { incremental: true })
    expect(ok).toBe(false)
    expect(useKnowledgeStore.getState().generation['book-1:character-graph']?.error).toContain(
      '没有发现需要补充的新章节'
    )
  })
})
