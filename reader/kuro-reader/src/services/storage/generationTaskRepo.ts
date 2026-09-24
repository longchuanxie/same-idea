import type { KnowledgeArtifactType, KnowledgeGenerationOptions } from '@/types'

import { getDB, STORE_NAMES } from './db'

/**
 * 生成任务 checkpoint：分块推进的可续跑凭据。
 * 槽位按块序对齐：null = 该块尚未完成（并发完成顺序不定，中间允许有洞），
 * data=null = 该块完成但未产出有效片段；恢复时只重跑 null 槽。
 * 指纹对不上（书内容变了）整体作废重跑。
 */
export interface GenerationCheckpoint {
  /** 按块序对齐的片段槽（label 与最终 merge 输入同形；null = 未完成） */
  slots: ({ label: string; data: unknown } | null)[]
  /** 图谱类跨块已确认称呼（续跑时提示词上下文不断档） */
  knownNames: string[]
  /** 生成时的语料指纹：内容变化后 checkpoint 失效 */
  corpusFingerprint: string
  /** 生成时的语料块数 */
  corpusChunkCount: number
}

/** 任务状态：queued 排队 / running 执行中 / failed 失败（留档断点）。
 *  成功与取消即删除记录；失败保留 checkpoint，下次同键生成从失败片段续跑，
 *  不随 App 重启自动续跑（避免无感知消耗调用），只等用户显式重试继承。 */
export type GenerationTaskStatus = 'queued' | 'running' | 'failed'

export interface GenerationTaskRecord {
  /** `${bookId}:${type}` */
  id: string
  bookId: string
  bookTitle: string
  type: KnowledgeArtifactType
  status: GenerationTaskStatus
  createdAt: string
  updatedAt: string
  done: number
  total: number
  error?: string
  options?: KnowledgeGenerationOptions
  checkpoint?: GenerationCheckpoint
}

/**
 * 知识库生成任务仓库（IndexedDB v12 起）。
 * 存未完成任务（queued/running，App 被杀后下次启动自动续跑）
 * 与失败任务（failed，带断点等显式重试继承）；成功/取消即删，
 * 库里永远是「可续跑的工作集」。
 */
export const generationTaskRepo = {
  async save(record: GenerationTaskRecord): Promise<void> {
    const db = await getDB()
    await db.put(STORE_NAMES.generationTasks, record)
  },

  async get(id: string): Promise<GenerationTaskRecord | undefined> {
    const db = await getDB()
    return (await db.get(STORE_NAMES.generationTasks, id)) as GenerationTaskRecord | undefined
  },

  async remove(id: string): Promise<void> {
    const db = await getDB()
    await db.delete(STORE_NAMES.generationTasks, id)
  },

  /** 按 createdAt 升序（入队顺序）返回全部待续跑任务 */
  async getAll(): Promise<GenerationTaskRecord[]> {
    const db = await getDB()
    const all = (await db.getAll(STORE_NAMES.generationTasks)) as GenerationTaskRecord[]
    return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },
}
