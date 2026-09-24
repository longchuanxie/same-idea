import { create } from 'zustand'

import { isProviderConfigured, type AiProviderConfig } from '@/services/ai/aiClient'
import { requestGenerationNotificationPermission } from '@/services/knowledge/generationNotification'
import {
  cancelGenerationTask,
  enqueueGenerationTask,
  generationQueuePosition,
  generationTaskKey,
  initGenerationQueue,
  subscribeGenerationQueue,
  type GenerationExecutor,
} from '@/services/knowledge/generationQueue'
import { runKnowledgeGeneration } from '@/services/knowledge/generationRunner'
import { bookRepo } from '@/services/storage/bookRepo'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { useAppStore } from '@/stores/useAppStore'
import { useLibraryStore } from '@/stores/useLibraryStore'
import type {
  Book,
  KnowledgeArtifact,
  KnowledgeArtifactType,
  KnowledgeGenerationOptions,
} from '@/types'

/** 生成任务状态；无条目 = 空闲。queued = 已入队等待执行（可在任意页面取消） */
export interface KnowledgeGenerationState {
  status: 'queued' | 'running' | 'error'
  /** 已完成分块数 */
  done: number
  total: number
  error?: string
  /** 排队位次（1 起；仅 queued 态有值） */
  queuePosition?: number
}

interface KnowledgeState {
  /** 按书缓存的知识产物（loadArtifacts 后可用） */
  artifactsByBook: Record<string, KnowledgeArtifact[]>
  /** 生成任务状态，键 `${bookId}:${type}` */
  generation: Record<string, KnowledgeGenerationState>
  loadArtifacts: (bookId: string) => Promise<void>
  /**
   * 生成（或重新生成）一种知识产物。
   * 请求进入持久化队列后台执行（串行），本调用在该任务终态时兑现：
   * 成功 true；失败/取消/重复请求 false。可以离开当前页面，任务继续跑。
   * 覆盖式：同书同类型旧产物被替换（旧件删除记墓碑，新件复用旧 id）。
   * options.scope 限定章节范围（0 起闭区间，to 省略 = 到末尾）；
   * options.incremental 在现有产物上并入新内容（旧证据坐标原样保留）；
   * options.detail 图谱详细度（仅 character-graph 消费）。
   */
  generateArtifact: (
    book: Book,
    type: KnowledgeArtifactType,
    options?: KnowledgeGenerationOptions
  ) => Promise<boolean>
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

const UNCONFIGURED_MESSAGE = '知识库 AI 服务未配置——先到设置里填好服务地址与模型'

/** 生成调用方传入的书对象（执行时优先用，绕过书架加载时序；终态即清） */
const pendingBooks = new Map<string, Book>()
/** generateArtifact 的兑现通道：执行体在任务终态时 resolve */
const resolvers = new Map<string, (ok: boolean) => void>()

function resolveTask(key: string, ok: boolean): void {
  pendingBooks.delete(key)
  const resolve = resolvers.get(key)
  resolvers.delete(key)
  resolve?.(ok)
}

function providerConfigFromSettings(): AiProviderConfig {
  const { settings } = useAppStore.getState()
  return {
    baseUrl: settings.knowledgeAiUrl,
    apiKey: settings.knowledgeAiKey,
    model: settings.knowledgeAiModel,
  }
}

export const useKnowledgeStore = create<KnowledgeState>()((set, get) => {
  const setGenerationState = (
    key: string,
    entry: KnowledgeGenerationState | undefined
  ) => {
    set(state => {
      if (entry === undefined) {
        const { [key]: _removed, ...rest } = state.generation
        if (!state.generation[key]) return state
        return { generation: rest }
      }
      return { generation: { ...state.generation, [key]: entry } }
    })
  }

  const setGenerationError = (key: string, error: string) => {
    set(state => {
      const current = state.generation[key]
      return {
        generation: {
          ...state.generation,
          [key]: {
            status: 'error',
            done: current?.done ?? 0,
            total: current?.total ?? 0,
            error,
          },
        },
      }
    })
  }

  /** 取执行用书对象：调用方快照 → 书架内存 → IndexedDB（重启续跑时书架可能未加载完） */
  const resolveBook = async (bookId: string): Promise<Book | undefined> => {
    const shelfBook = useLibraryStore.getState().books.find((b) => b.id === bookId)
    if (shelfBook) return shelfBook
    try {
      return await bookRepo.get(bookId)
    } catch {
      return undefined
    }
  }

  const executeGenerationTask: GenerationExecutor = async ctx => {
    const key = ctx.record.id
    const type = ctx.record.type
    const book = pendingBooks.get(key) ?? (await resolveBook(ctx.record.bookId))
    if (!book) {
      const message = '这本书已不在书架上——任务已停止'
      setGenerationError(key, message)
      resolveTask(key, false)
      return { ok: false, error: message }
    }
    const config = providerConfigFromSettings()
    if (!isProviderConfigured(config)) {
      setGenerationError(key, UNCONFIGURED_MESSAGE)
      resolveTask(key, false)
      return { ok: false, error: UNCONFIGURED_MESSAGE }
    }

    // 覆盖式落库的依据：必须基于库内真实产物（重启续跑时内存缓存未加载，
    // 不读库会把旧件当不存在，生成出同类型重复产物）
    if (get().artifactsByBook[book.id] === undefined) {
      await get().loadArtifacts(book.id)
    }
    const existing = (get().artifactsByBook[book.id] ?? []).filter(a => a.type === type)
    setGenerationState(key, { status: 'running', done: 0, total: 0 })

    const result = await runKnowledgeGeneration({
      book,
      type,
      options: ctx.record.options,
      config,
      signal: ctx.signal,
      existing,
      checkpoint: ctx.checkpoint,
      onProgress: (done, total) => {
        set(state => {
          const current = state.generation[key]
          if (current?.status !== 'running') return state
          return {
            generation: { ...state.generation, [key]: { ...current, done, total } },
          }
        })
        ctx.onProgress(done, total)
      },
      onCheckpoint: checkpoint => ctx.onCheckpoint(checkpoint),
    })

    if (!result.ok) {
      if (result.cancelled) {
        // 取消与原实现一致：状态清除，不落错误
        setGenerationState(key, undefined)
        resolveTask(key, false)
        return { ok: false, cancelled: true }
      }
      setGenerationError(key, result.error)
      resolveTask(key, false)
      return { ok: false, error: result.error }
    }

    // 落库全程兜底：任一环抛错若不接住，generation[key] 会永久
    // 卡在 running，重入守卫（入口 status==='running' 拦截）就此锁死该书该类型
    try {
      for (const staleId of result.staleArtifactIds) {
        await knowledgeRepo.remove(staleId)
      }
      await knowledgeRepo.save(result.artifact)
      await get().loadArtifacts(book.id)

      setGenerationState(key, undefined)
      resolveTask(key, true)
      return { ok: true }
    } catch (e) {
      const message = e instanceof Error ? e.message : '知识件生成失败'
      setGenerationError(key, message)
      resolveTask(key, false)
      return { ok: false, error: message }
    }
  }

  // 队列状态 → generation 条目镜像：重启续跑的任务补挂排队条目（任意页面可见可取消）
  subscribeGenerationQueue((_event, records) => {
    set(state => {
      let generation = state.generation
      let changed = false
      for (const record of records) {
        if (!generation[record.id]) {
          generation = {
            ...generation,
            [record.id]: { status: 'queued', done: record.done, total: record.total },
          }
          changed = true
        }
      }
      for (const record of records) {
        if (record.status !== 'queued') continue
        const entry = generation[record.id]
        if (entry?.status !== 'queued') continue
        const position = generationQueuePosition(record.id)
        if (entry.queuePosition !== position) {
          generation = { ...generation, [record.id]: { ...entry, queuePosition: position } }
          changed = true
        }
      }
      return changed ? { generation } : state
    })
  })

  initGenerationQueue(executeGenerationTask)

  return {
    artifactsByBook: {},
    generation: {},

    loadArtifacts: async bookId => {
      const artifacts = await knowledgeRepo.getByBookId(bookId)
      set(state => ({ artifactsByBook: { ...state.artifactsByBook, [bookId]: artifacts } }))
    },

    generateArtifact: async (book, type, options) => {
      const key = generationTaskKey(book.id, type)
      const current = get().generation[key]
      if (current?.status === 'running' || current?.status === 'queued') return false

      const config = providerConfigFromSettings()
      if (!isProviderConfigured(config)) {
        setGenerationError(key, UNCONFIGURED_MESSAGE)
        return false
      }

      // 通知权限（Android 13+）：首次生成时请求，未授权不拦生成
      void requestGenerationNotificationPermission()

      setGenerationState(key, { status: 'queued', done: 0, total: 0 })
      pendingBooks.set(key, book)
      const outcome = await enqueueGenerationTask({
        bookId: book.id,
        bookTitle: book.title,
        type,
        options,
      })
      if (outcome === 'exists') {
        // 记录已在队列（如重启续跑挂起中）：入口守卫按重复请求处理
        pendingBooks.delete(key)
        return false
      }
      return await new Promise<boolean>(resolve => {
        resolvers.set(key, resolve)
      })
    },

    cancelGeneration: (bookId, type) => {
      const key = generationTaskKey(bookId, type)
      const outcome = cancelGenerationTask(key)
      if (outcome === 'cancelled-queued') {
        // 排队任务没有执行体收尾：这里直接清状态并兑现
        setGenerationState(key, undefined)
        resolveTask(key, false)
      }
      // running：执行体感知 abort 后自行清状态并兑现；not-found：与原实现一致为 no-op
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
  }
})
