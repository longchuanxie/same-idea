import { create } from 'zustand'

import {
  chatCompletionJson,
  isProviderConfigured,
  type AiProviderConfig,
} from '@/services/ai/aiClient'
import { getKnowledgeTask } from '@/services/ai/knowledgeTasks'
import { BookCorpusError, buildBookCorpus, type BookCorpus } from '@/services/knowledge/bookCorpus'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { useAppStore } from '@/stores/useAppStore'
import type {
  Book,
  ContentKind,
  KnowledgeArtifact,
  KnowledgeArtifactType,
  KnowledgeGenerationOptions,
} from '@/types'
import { detectContentKindFromChapters } from '@/utils/contentKind'
import {
  resolveBriefEvidence,
  resolveGlossaryEvidence,
  resolveGraphEvidence,
  stampBriefChapters,
  stampGlossaryChapters,
  stampPartialChapters,
  type GlossaryPartial,
  type GraphPartial,
  type InterimBriefData,
  type InterimGlossaryData,
  type InterimGraphData,
} from '@/utils/knowledgeMerge'

/** 生成任务状态；无条目 = 空闲 */
export interface KnowledgeGenerationState {
  status: 'running' | 'error'
  /** 已完成分块数 */
  done: number
  total: number
  error?: string
}

interface KnowledgeState {
  /** 按书缓存的知识产物（loadArtifacts 后可用） */
  artifactsByBook: Record<string, KnowledgeArtifact[]>
  /** 生成任务状态，键 `${bookId}:${type}` */
  generation: Record<string, KnowledgeGenerationState>
  loadArtifacts: (bookId: string) => Promise<void>
  /**
   * 生成（或重新生成）一种知识产物。
   * 覆盖式：同书同类型旧产物被替换（旧件删除记墓碑，新件复用旧 id）。
   * options.scope 限定章节范围（0 起闭区间，to 省略 = 到末尾）；
   * options.incremental 在现有产物上并入新内容（旧证据坐标原样保留）；
   * options.detail 图谱详细度（仅 character-graph 消费）。
   */
  generateArtifact: (book: Book, type: KnowledgeArtifactType, options?: KnowledgeGenerationOptions) => Promise<boolean>
  cancelGeneration: (bookId: string, type: KnowledgeArtifactType) => void
  removeArtifact: (bookId: string, artifactId: string) => Promise<void>
  /**
   * 手工修订（修订模式消费）：对单件产物的 data 应用纯函数变更。
   * 每次修订累计 manualEditCount 并刷新 updatedAt（云端 LWW 正确合并），
   * 供重新生成前的覆盖警告判断"这份件里有你改过的东西"。
   */
  updateArtifactData: (
    bookId: string,
    artifactId: string,
    mutate: (data: KnowledgeArtifact['data']) => KnowledgeArtifact['data']
  ) => Promise<void>
}

/** 分块请求失败时的重试次数（单块一次重试，防瞬时抖动毁掉整轮生成） */
const CHUNK_RETRIES = 1

const RANDOM_ID_RADIX = 36
const RANDOM_ID_SLICE_START = 2
const RANDOM_ID_SLICE_END = 10

/** 进行中任务的取消句柄（模块级，不入 store 快照） */
const generationControllers = new Map<string, AbortController>()

function generationKey(bookId: string, type: KnowledgeArtifactType): string {
  return `${bookId}:${type}`
}

function makeArtifactId(): string {
  return `kn-${Date.now()}-${Math.random().toString(RANDOM_ID_RADIX).slice(RANDOM_ID_SLICE_START, RANDOM_ID_SLICE_END)}`
}

function providerConfigFromSettings(): AiProviderConfig {
  const { settings } = useAppStore.getState()
  return {
    baseUrl: settings.knowledgeAiUrl,
    apiKey: settings.knowledgeAiKey,
    model: settings.knowledgeAiModel,
  }
}

export const useKnowledgeStore = create<KnowledgeState>()((set, get) => ({
  artifactsByBook: {},
  generation: {},

  loadArtifacts: async (bookId) => {
    const artifacts = await knowledgeRepo.getByBookId(bookId)
    set((state) => ({ artifactsByBook: { ...state.artifactsByBook, [bookId]: artifacts } }))
  },

  generateArtifact: async (book, type, options) => {
    const key = generationKey(book.id, type)
    if (get().generation[key]?.status === 'running') return false

    const config = providerConfigFromSettings()
    if (!isProviderConfigured(config)) {
      set((state) => ({
        generation: { ...state.generation, [key]: { status: 'error', done: 0, total: 0, error: '知识库 AI 服务未配置——先到设置里填好服务地址与模型' } },
      }))
      return false
    }

    const task = getKnowledgeTask(type)
    // 增量补充的基底：现有同类型产物（旧节点/边先入列，新内容只是并进来）
    const existing = (get().artifactsByBook[book.id] ?? []).filter((a) => a.type === type)
    const baseArtifact = options?.incremental ? existing[0] : undefined
    const baseData = baseArtifact?.data
    // 增量的默认范围 = 上次生成之后的章节（书还在长，结尾未知故 to 省略）
    const range = options?.scope ??
      (baseArtifact
        ? { from: baseArtifact.meta?.bookChapterCount ?? baseArtifact.meta?.chapterCount ?? 0 }
        : undefined)

    let corpus: BookCorpus | null = null
    try {
      corpus = await buildBookCorpus(book, range)
    } catch (e) {
      const incrementalEmpty = e instanceof BookCorpusError && e.code === 'empty' && range != null
      const message = incrementalEmpty
        ? '没有发现需要补充的新章节（书还没有更新）'
        : e instanceof BookCorpusError
          ? e.message
          : '读取书本内容失败'
      set((state) => ({ generation: { ...state.generation, [key]: { status: 'error', done: 0, total: 0, error: message } } }))
      return false
    }
    if (!corpus) return false
    // let 的窄化不进闭包，绑 const 快照供后续回调使用
    const corpusSnapshot = corpus
    // 内容视角：用户显式指定优先，否则按文本启发式检测（小说/学术走不同提示词与任务集）
    const contentKind: ContentKind =
      book.contentKind && book.contentKind !== 'auto'
        ? book.contentKind
        : detectContentKindFromChapters(corpusSnapshot.chapterTexts)

    const controller = new AbortController()
    generationControllers.set(key, controller)
    set((state) => ({
      generation: { ...state.generation, [key]: { status: 'running', done: 0, total: corpusSnapshot.chunks.length } },
    }))

    const fail = (error: string) => {
      generationControllers.delete(key)
      set((state) => {
        const current = state.generation[key]
        return {
          generation: {
            ...state.generation,
            [key]: { status: 'error', done: current?.done ?? 0, total: corpusSnapshot.chunks.length, error },
          },
        }
      })
      return false
    }

    const partials: { label: string; data: unknown }[] = []
    for (let index = 0; index < corpusSnapshot.chunks.length; index++) {
      const chunk = corpusSnapshot.chunks[index]
      const messages = task.buildMessages({
        bookTitle: book.title,
        author: book.author || undefined,
        chunkLabel: chunk.label,
        chunkText: chunk.text,
        chunkIndex: index,
        chunkTotal: corpusSnapshot.chunks.length,
        contentKind,
        detail: type === 'character-graph' || type === 'concept-graph' ? options?.detail : undefined,
        incremental: Boolean(baseArtifact),
      })

      let parsed: unknown | null = null
      let lastError: unknown = null
      for (let attempt = 0; attempt <= CHUNK_RETRIES; attempt++) {
        try {
          const raw = await chatCompletionJson<unknown>(config, { messages, signal: controller.signal })
          parsed = task.parsePartial(raw)
          lastError = null
          break
        } catch (e) {
          if (controller.signal.aborted) {
            generationControllers.delete(key)
            set((state) => {
              const { [key]: _removed, ...rest } = state.generation
              return { generation: rest }
            })
            return false
          }
          lastError = e
        }
      }
      if (lastError != null) {
        return fail((lastError as Error).message || 'AI 请求失败')
      }
      if (parsed != null) {
        // 图谱/术语/速览片段盖上分块覆盖章节（回原文链路：条目的章节并集来源）
        const stamped =
          type === 'character-graph' || type === 'concept-graph'
            ? stampPartialChapters(parsed as GraphPartial, chunk.chapterIndexes)
            : type === 'glossary'
              ? stampGlossaryChapters(parsed as GlossaryPartial, chunk.chapterIndexes)
              : type === 'paper-brief'
                ? stampBriefChapters(parsed as InterimBriefData, chunk.chapterIndexes)
                : parsed
        // 增量的导图分支加前缀，避免与基底里的「片段N」撞名
        const label =
          baseArtifact && type === 'mindmap' && corpusSnapshot.coveredRange
            ? `第${chunk.chapterIndexes[0] + 1}章起`
            : chunk.label
        partials.push({ label, data: stamped })
      }

      const current = get().generation[key]
      if (current?.status === 'running') {
        set((state) => ({
          generation: { ...state.generation, [key]: { ...current, done: index + 1 } },
        }))
      }
    }
    generationControllers.delete(key)

    if (partials.length === 0) {
      return fail('AI 没有返回任何可用的分析结果')
    }

    let data = task.merge(book.title, partials, baseData)
    if (type === 'character-graph' || type === 'concept-graph') {
      // 证据摘句在真实章节文本中校验定位（防幻觉引文），换成可跳转的章内坐标
      data = resolveGraphEvidence(data as InterimGraphData, corpusSnapshot.chapterTexts)
    } else if (type === 'glossary') {
      data = resolveGlossaryEvidence(data as InterimGlossaryData, corpusSnapshot.chapterTexts)
    } else if (type === 'paper-brief') {
      data = resolveBriefEvidence(data as InterimBriefData, corpusSnapshot.chapterTexts)
    }
    if (task.isEmpty(data)) {
      const emptyHint: Record<KnowledgeArtifactType, string> = {
        'character-graph': '这本书提不出足够的人物关系（文本里可能没有明确的人物互动）',
        'concept-graph': '这本书提不出足够的概念关系（学术性文本才有清晰的概念网络，可试试切换内容类型）',
        mindmap: '这本书提不出可用的结构大纲',
        glossary: '这本书提不出明确的概念术语（可能不是学术性文本，可试试切换内容类型）',
        'paper-brief': '这篇文本提不出速览卡（贡献、局限与疑问都需要明确的论述文本）',
      }
      return fail(emptyHint[type])
    }

    // 覆盖式落库：复用同类型旧件 id（保留引用稳定性），删除其余同类型件
    const reusedId = existing[0]?.id ?? makeArtifactId()
    for (const old of existing) {
      if (old.id !== reusedId) await knowledgeRepo.remove(old.id)
    }

    const now = new Date()
    const artifact: KnowledgeArtifact = {
      id: reusedId,
      bookId: book.id,
      type,
      title: task.artifactTitle,
      data,
      meta: {
        chapterCount: corpusSnapshot.coveredChapterCount,
        contentFingerprint: corpusSnapshot.fingerprint,
        contentKind,
        bookChapterCount: corpusSnapshot.chapterCount,
        analyzedChunkCount: corpusSnapshot.chunks.length,
        totalChunkCount: corpusSnapshot.totalChunkCount,
        ...(corpusSnapshot.coveredRange ? { scope: corpusSnapshot.coveredRange } : {}),
        ...(type === 'character-graph' || type === 'concept-graph') && options?.detail
          ? { detail: options.detail }
          : {},
      },
      generator: 'ai',
      createdAt: existing[0]?.createdAt ?? now,
      updatedAt: now,
    }
    await knowledgeRepo.save(artifact)
    await get().loadArtifacts(book.id)

    set((state) => {
      const { [key]: _removed, ...rest } = state.generation
      return { generation: rest }
    })
    return true
  },

  cancelGeneration: (bookId, type) => {
    generationControllers.get(generationKey(bookId, type))?.abort()
  },

  removeArtifact: async (bookId, artifactId) => {
    await knowledgeRepo.remove(artifactId)
    await get().loadArtifacts(bookId)
  },

  updateArtifactData: async (bookId, artifactId, mutate) => {
    const artifact = await knowledgeRepo.get(artifactId)
    if (!artifact || artifact.bookId !== bookId) return
    const updated: KnowledgeArtifact = {
      ...artifact,
      data: mutate(artifact.data),
      manualEditCount: (artifact.manualEditCount ?? 0) + 1,
      updatedAt: new Date(),
    }
    await knowledgeRepo.save(updated)
    await get().loadArtifacts(bookId)
  },
}))
