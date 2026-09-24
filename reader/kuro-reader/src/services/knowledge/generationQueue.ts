/**
 * 知识库生成任务队列：后台运行的核心调度。
 *
 * - 串行执行（并发 1）：不同书/不同类型的生成请求依次跑，LLM 请求不互相挤兑
 * - 任务记录持久化（generationTaskRepo）：分块 checkpoint 随进度落库，
 *   进程被杀/刷新后 startGenerationQueue 按记录自动续跑
 * - 事件广播（enqueued/started/progress/settled/idle）：通知栏进度与
 *   前台保活服务（GenerationKeepAlive）据此联动，队列与系统通道解耦
 *
 * 执行体（真正调 LLM 的生成逻辑）由 useKnowledgeStore 注册进来——
 * 队列只管排队、持久化与续跑，不知道任何知识库细节。
 */

import {
  generationTaskRepo,
  type GenerationCheckpoint,
  type GenerationTaskRecord,
} from '@/services/storage/generationTaskRepo'
import type { KnowledgeArtifactType, KnowledgeGenerationOptions } from '@/types'


export type { GenerationCheckpoint, GenerationTaskRecord }

export interface GenerationTaskDescriptor {
  bookId: string
  bookTitle: string
  type: KnowledgeArtifactType
  options?: KnowledgeGenerationOptions
}

/** 单个任务的执行上下文（由队列构造，执行体消费） */
export interface GenerationExecuteContext {
  record: GenerationTaskRecord
  signal: AbortSignal
  /** 上次会话中断时的进度凭据（可能为 null）；执行体自行校验有效性 */
  checkpoint: GenerationCheckpoint | null
  onProgress(done: number, total: number): void
  onCheckpoint(checkpoint: GenerationCheckpoint): Promise<void> | void
}

export interface GenerationExecutorResult {
  ok: boolean
  /** 用户取消（与失败区分：取消不报错，失败要留痕） */
  cancelled?: boolean
  error?: string
}

export type GenerationExecutor = (ctx: GenerationExecuteContext) => Promise<GenerationExecutorResult>

export type GenerationQueueEvent =
  | { type: 'enqueued'; record: GenerationTaskRecord }
  | { type: 'started'; record: GenerationTaskRecord }
  | { type: 'progress'; record: GenerationTaskRecord }
  | { type: 'settled'; recordId: string; bookTitle: string; taskType: KnowledgeArtifactType; ok: boolean; cancelled?: boolean; error?: string }
  | { type: 'idle' }

export type GenerationQueueListener = (event: GenerationQueueEvent, records: GenerationTaskRecord[]) => void

const nowIso = (): string => new Date().toISOString()

export function generationTaskKey(bookId: string, type: KnowledgeArtifactType): string {
  return `${bookId}:${type}`
}

/** 活动记录镜像（模块级，不入任何组件状态） */
const records = new Map<string, GenerationTaskRecord>()
const controllers = new Map<string, AbortController>()
const listeners = new Set<GenerationQueueListener>()

let executor: GenerationExecutor | null = null
let pumping = false
let started = false

function snapshot(): GenerationTaskRecord[] {
  return [...records.values()]
}

function notify(event: GenerationQueueEvent): void {
  for (const listener of listeners) {
    try {
      listener(event, snapshot())
    } catch {
      // 单个监听器异常不拖垮队列
    }
  }
}

export function subscribeGenerationQueue(listener: GenerationQueueListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGenerationRecords(): GenerationTaskRecord[] {
  return snapshot()
}

/** 排队位次（1 起）：UI 显示「第 N 位」用 */
export function generationQueuePosition(id: string): number {
  return snapshot()
    .filter((r) => r.status === 'queued')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .findIndex((r) => r.id === id) + 1
}

export function isGenerationQueueActive(): boolean {
  return records.size > 0
}

/** 注册执行体（幂等：store 模块加载时调用一次） */
export function initGenerationQueue(exec: GenerationExecutor): void {
  executor = exec
}

async function persist(record: GenerationTaskRecord): Promise<void> {
  try {
    await generationTaskRepo.save(record)
  } catch {
    // 落库失败不阻断执行：最坏情况是进程被杀后这次进度不续跑
  }
}

async function dropRecord(record: GenerationTaskRecord): Promise<void> {
  records.delete(record.id)
  try {
    await generationTaskRepo.remove(record.id)
  } catch {
    // 同上：删除失败残留的记录会在下次 hydrate 时被继续处理
  }
}

async function pump(): Promise<void> {
  if (pumping) return
  pumping = true
  try {
    for (;;) {
      const next = snapshot()
        .filter((r) => r.status === 'queued')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
      if (!next) break
      if (!executor) break // 未注册执行体（纯队列测试）：留在 queued 不动

      // controller 先于 running 态就位：状态翻转为 running 的瞬间起，
      // cancelGenerationTask 必须能走 abort 路径（否则存在「已 running 却被
      // 当排队任务摘除」的竞态，abort 信号到不了执行体）
      const controller = new AbortController()
      controllers.set(next.id, controller)
      next.status = 'running'
      next.updatedAt = nowIso()
      await persist(next)
      notify({ type: 'started', record: { ...next } })

      let result: GenerationExecutorResult
      try {
        if (controller.signal.aborted) {
          // 执行体尚未启动就被取消（启动间隙的 abort）：直接按取消收尾，
          // 不再进执行体（此时注册 abort 监听可能永远收不到回调）
          result = { ok: false, cancelled: true }
        } else {
          result = await executor({
            record: { ...next },
            signal: controller.signal,
            checkpoint: next.checkpoint ?? null,
            onProgress: (done, total) => {
              next.done = done
              next.total = total
              next.updatedAt = nowIso()
              notify({ type: 'progress', record: { ...next } })
            },
            onCheckpoint: (checkpoint) => {
              next.checkpoint = checkpoint
              next.updatedAt = nowIso()
              return persist(next)
            },
          })
        }
      } catch (e) {
        result = { ok: false, error: e instanceof Error ? e.message : '生成任务异常中断' }
      }
      controllers.delete(next.id)

      const settled = {
        recordId: next.id,
        bookTitle: next.bookTitle,
        taskType: next.type,
        ok: result.ok,
        cancelled: result.cancelled,
        error: result.error,
      }
      if (!result.ok && !result.cancelled) {
        // 失败留档：checkpoint 落库（运行镜像摘除），下次同键生成从断点续跑——
        // 长书几十块串行，任何一块失败都不该让重试从头再来
        records.delete(next.id)
        next.status = 'failed'
        if (result.error) next.error = result.error
        next.updatedAt = nowIso()
        await persist(next)
      } else {
        // 成功/取消：终态即删，库里只留待续跑工作集
        await dropRecord(next)
      }
      notify({ type: 'settled', ...settled })
    }
  } finally {
    pumping = false
  }
  if (records.size === 0) {
    notify({ type: 'idle' })
  }
}

/**
 * 入队一个生成任务。同键已有排队/执行中的任务时返回 'exists'（调用方按重复处理）。
 * 上次失败的同键任务留有断点时，新任务继承其 checkpoint（执行体校验语料指纹后
 * 从失败片段继续），并落库覆盖 failed 旧档。
 */
export async function enqueueGenerationTask(descriptor: GenerationTaskDescriptor): Promise<'enqueued' | 'exists'> {
  const id = generationTaskKey(descriptor.bookId, descriptor.type)
  if (records.has(id)) return 'exists'

  let inheritedCheckpoint: GenerationCheckpoint | undefined
  try {
    const previous = await generationTaskRepo.get(id)
    if (previous?.status === 'failed' && previous.checkpoint) inheritedCheckpoint = previous.checkpoint
  } catch {
    // 读库失败按无断点处理：从头生成
  }

  const record: GenerationTaskRecord = {
    id,
    bookId: descriptor.bookId,
    bookTitle: descriptor.bookTitle,
    type: descriptor.type,
    status: 'queued',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    done: 0,
    total: 0,
    ...(descriptor.options ? { options: descriptor.options } : {}),
    ...(inheritedCheckpoint ? { checkpoint: inheritedCheckpoint } : {}),
  }
  records.set(id, record)
  await persist(record)
  notify({ type: 'enqueued', record: { ...record } })
  void pump()
  return 'enqueued'
}

export type GenerationCancelOutcome = 'cancelled-running' | 'cancelled-queued' | 'not-found'

/**
 * 取消任务。running 走 abort（执行体感知后收尾）；queued 直接摘除。
 * 执行体不存在（尚未注册/队列空转）时也要兜底清理，不留僵尸记录。
 */
export function cancelGenerationTask(id: string): GenerationCancelOutcome {
  const record = records.get(id)
  if (!record) return 'not-found'
  const controller = controllers.get(id)
  if (record.status === 'running' && controller) {
    controller.abort()
    return 'cancelled-running'
  }
  void dropRecord(record).then(() => {
    notify({ type: 'settled', recordId: id, bookTitle: record.bookTitle, taskType: record.type, ok: false, cancelled: true })
    if (records.size === 0) notify({ type: 'idle' })
  })
  return 'cancelled-queued'
}

/**
 * 启动队列：从 IndexedDB 载入待续跑任务（上次会话中断的 running 重置为 queued，
 * checkpoint 保留），然后开泵。幂等；App 启动时调用一次。
 */
export async function startGenerationQueue(): Promise<void> {
  if (started) return
  started = true
  let stored: GenerationTaskRecord[] = []
  try {
    stored = await generationTaskRepo.getAll()
  } catch {
    stored = []
  }
  for (const record of stored) {
    // 失败留档不自动续跑：避免每次启动无感知重放调用，断点等显式重试来继承
    if (record.status === 'failed') continue
    const revived: GenerationTaskRecord =
      record.status === 'running' ? { ...record, status: 'queued', updatedAt: nowIso() } : record
    records.set(record.id, revived)
    if (revived !== record) await persist(revived)
  }
  if (records.size > 0) {
    notify({ type: 'enqueued', record: { ...snapshot().sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] } })
  }
  void pump()
}

/** **仅供测试使用**，不应在生产代码中调用。 */
export function _resetGenerationQueueForTesting(): void {
  records.clear()
  controllers.clear()
  listeners.clear()
  executor = null
  pumping = false
  started = false
}
