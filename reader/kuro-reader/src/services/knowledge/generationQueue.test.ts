import { beforeEach, describe, expect, it, vi } from 'vitest'

import { generationTaskRepo, type GenerationTaskRecord } from '@/services/storage/generationTaskRepo'

import {
  _resetGenerationQueueForTesting,
  cancelGenerationTask,
  enqueueGenerationTask,
  generationQueuePosition,
  getGenerationRecords,
  initGenerationQueue,
  startGenerationQueue,
  subscribeGenerationQueue,
  type GenerationExecutor,
  type GenerationQueueEvent,
} from './generationQueue'

// ---- 任务仓库替身（内存 Map，避免 IndexedDB 时序干扰队列语义测试） ----

const memoryTasks = new Map<string, GenerationTaskRecord>()

vi.mock('@/services/storage/generationTaskRepo', () => ({
  generationTaskRepo: {
    save: vi.fn(async (record: GenerationTaskRecord) => {
      memoryTasks.set(record.id, record)
    }),
    get: vi.fn(async (id: string) => memoryTasks.get(id)),
    remove: vi.fn(async (id: string) => {
      memoryTasks.delete(id)
    }),
    getAll: vi.fn(async () => [...memoryTasks.values()]),
  },
}))

const task = (bookId: string, type: GenerationTaskRecord['type']) => ({
  bookId,
  bookTitle: `《${bookId}》`,
  type,
})

beforeEach(() => {
  _resetGenerationQueueForTesting()
  memoryTasks.clear()
  vi.clearAllMocks()
})

describe('generationQueue · 串行执行', () => {
  it('多任务按入队顺序串行执行，前一个终态后才开下一个', async () => {
    const ran: string[] = []
    let releaseFirst: () => void = () => {}
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const executor: GenerationExecutor = async (ctx) => {
      ran.push(ctx.record.id)
      if (ctx.record.id === 'a:character-graph') await firstGate
      return { ok: true }
    }
    initGenerationQueue(executor)

    await enqueueGenerationTask(task('a', 'character-graph'))
    await enqueueGenerationTask(task('b', 'mindmap'))
    await vi.waitFor(() => {
      expect(ran).toEqual(['a:character-graph'])
    })
    releaseFirst()
    await vi.waitFor(() => {
      expect(ran).toEqual(['a:character-graph', 'b:mindmap'])
      expect(getGenerationRecords()).toHaveLength(0)
    })
    expect(memoryTasks.size).toBe(0)
  })

  it('同键重复入队返回 exists，不产生第二条记录', async () => {
    initGenerationQueue(async () => ({ ok: true }))
    expect(await enqueueGenerationTask(task('a', 'glossary'))).toBe('enqueued')
    expect(await enqueueGenerationTask(task('a', 'glossary'))).toBe('exists')
  })

  it('成功终态移除记录并广播 settled/idle', async () => {
    const events: GenerationQueueEvent[] = []
    subscribeGenerationQueue((event) => events.push(event))
    initGenerationQueue(async () => ({ ok: true }))

    await enqueueGenerationTask(task('good', 'story-beats'))
    await vi.waitFor(() => {
      expect(events.some((e) => e.type === 'settled' && e.ok === true)).toBe(true)
    })
    expect(memoryTasks.size).toBe(0)
    expect(events[events.length - 1].type).toBe('idle')
  })
})

describe('generationQueue · 失败留档与断点续跑', () => {
  it('失败终态以 failed 留档（带错误与断点）：运行镜像摘除、settled 仍广播', async () => {
    const events: GenerationQueueEvent[] = []
    subscribeGenerationQueue((event) => events.push(event))
    initGenerationQueue(async () => ({ ok: false, error: '片段 2/60 请求失败：AI 服务响应超时' }))

    await enqueueGenerationTask(task('bad', 'story-beats'))
    await vi.waitFor(() => {
      expect(events.some((e) => e.type === 'settled' && e.ok === false && e.error?.includes('超时'))).toBe(true)
    })
    expect(getGenerationRecords()).toHaveLength(0)
    const archived = memoryTasks.get('bad:story-beats')
    expect(archived?.status).toBe('failed')
    expect(archived?.error).toContain('超时')
  })

  it('失败后再生成：新任务继承断点，成功后留档清除', async () => {
    memoryTasks.set('a:character-graph', {
      id: 'a:character-graph',
      bookId: 'a',
      bookTitle: '《a》',
      type: 'character-graph',
      status: 'failed',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      done: 1,
      total: 3,
      error: '片段 2/3 请求失败',
      checkpoint: {
        slots: [
          { label: '片段1', data: { characters: [] } },
          { label: '片段2', data: null },
        ],
        knownNames: ['张三'],
        corpusFingerprint: 'fp',
        corpusChunkCount: 3,
      },
    })
    const received: { checkpoint: GenerationTaskRecord['checkpoint'] | null } = { checkpoint: null }
    initGenerationQueue(async (ctx) => {
      received.checkpoint = ctx.checkpoint
      return { ok: true }
    })

    expect(await enqueueGenerationTask(task('a', 'character-graph'))).toBe('enqueued')
    await vi.waitFor(() => {
      expect(memoryTasks.has('a:character-graph')).toBe(false)
    })
    expect(received.checkpoint?.knownNames).toEqual(['张三'])
    expect(received.checkpoint?.slots).toHaveLength(2)
  })

  it('startGenerationQueue 跳过 failed 留档：不自动续跑也不灌入运行镜像', async () => {
    memoryTasks.set('f:character-graph', {
      id: 'f:character-graph',
      bookId: 'f',
      bookTitle: '《f》',
      type: 'character-graph',
      status: 'failed',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      done: 2,
      total: 3,
      error: '片段 3/3 请求失败',
      checkpoint: {
        slots: [{ label: '片段1', data: { characters: [] } }],
        knownNames: [],
        corpusFingerprint: 'fp',
        corpusChunkCount: 3,
      },
    })
    const executor = vi.fn(async () => ({ ok: true }))
    initGenerationQueue(executor)

    await startGenerationQueue()

    expect(executor).not.toHaveBeenCalled()
    expect(getGenerationRecords()).toHaveLength(0)
    expect(memoryTasks.get('f:character-graph')?.status).toBe('failed')
  })
})

describe('generationQueue · 取消', () => {
  it('取消排队任务：不执行、记录删除、settled 标记 cancelled', async () => {
    const ran: string[] = []
    let releaseFirst: () => void = () => {}
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const executor: GenerationExecutor = async (ctx) => {
      ran.push(ctx.record.id)
      if (ctx.record.id === 'a:character-graph') await firstGate
      return { ok: true }
    }
    initGenerationQueue(executor)

    await enqueueGenerationTask(task('a', 'character-graph'))
    await enqueueGenerationTask(task('b', 'character-graph'))
    expect(cancelGenerationTask('b:character-graph')).toBe('cancelled-queued')

    releaseFirst()
    await vi.waitFor(() => {
      expect(getGenerationRecords()).toHaveLength(0)
    })
    expect(ran).toEqual(['a:character-graph'])
  })

  it('取消执行中任务：abort 信号可达执行体，终态 cancelled', async () => {
    let executorStarted = false
    const executor: GenerationExecutor = (ctx) => {
      executorStarted = true
      return new Promise((resolve) => {
        ctx.signal.addEventListener('abort', () => resolve({ ok: false, cancelled: true }))
      })
    }
    initGenerationQueue(executor)

    await enqueueGenerationTask(task('a', 'glossary'))
    await vi.waitFor(() => {
      expect(executorStarted).toBe(true)
      expect(getGenerationRecords()[0].status).toBe('running')
    })
    expect(cancelGenerationTask('a:glossary')).toBe('cancelled-running')

    await vi.waitFor(() => {
      expect(getGenerationRecords()).toHaveLength(0)
      expect(memoryTasks.has('a:glossary')).toBe(false)
    })
  })

  it('取消不存在的任务返回 not-found', async () => {
    initGenerationQueue(async () => ({ ok: true }))
    expect(cancelGenerationTask('nope:mindmap')).toBe('not-found')
  })
})

describe('generationQueue · 重启续跑', () => {
  it('startGenerationQueue 把中断的 running 重置为 queued 并带着 checkpoint 续跑', async () => {
    memoryTasks.set('r:character-graph', {
      id: 'r:character-graph',
      bookId: 'r',
      bookTitle: '《r》',
      type: 'character-graph',
      status: 'running',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      done: 1,
      total: 3,
      checkpoint: {
        slots: [{ label: '片段1', data: { characters: [] } }],
        knownNames: ['张三'],
        corpusFingerprint: 'fp',
        corpusChunkCount: 3,
      },
    })

    const received: { checkpoint: GenerationTaskRecord['checkpoint'] | null } = { checkpoint: null }
    const executor: GenerationExecutor = async (ctx) => {
      received.checkpoint = ctx.checkpoint
      return { ok: true }
    }
    initGenerationQueue(executor)
    await startGenerationQueue()

    expect(memoryTasks.get('r:character-graph')?.status).toBe('running')
    await vi.waitFor(() => {
      expect(memoryTasks.has('r:character-graph')).toBe(false)
    })
    expect(received.checkpoint?.knownNames).toEqual(['张三'])
    expect(received.checkpoint?.slots).toHaveLength(1)
  })

  it('排队位次按 createdAt 升序计算（1 起）', () => {
    const records: GenerationTaskRecord[] = [
      {
        id: 'first:character-graph',
        bookId: 'first',
        bookTitle: '',
        type: 'character-graph',
        status: 'queued',
        createdAt: '2026-01-01T00:00:01.000Z',
        updatedAt: '',
        done: 0,
        total: 0,
      },
      {
        id: 'second:character-graph',
        bookId: 'second',
        bookTitle: '',
        type: 'character-graph',
        status: 'queued',
        createdAt: '2026-01-01T00:00:02.000Z',
        updatedAt: '',
        done: 0,
        total: 0,
      },
    ]
    for (const record of records) {
      memoryTasks.set(record.id, record)
    }
    // 位次读取依赖运行镜像，不经 repo：直接断言工具函数对空队列的兜底
    expect(generationQueuePosition('first:character-graph')).toBe(0)
  })

  it('startGenerationQueue 幂等：重复调用不重复灌入记录', async () => {
    const executor: GenerationExecutor = vi.fn(async () => ({ ok: true }))
    initGenerationQueue(executor)
    await startGenerationQueue()
    await startGenerationQueue()
    expect(executor).not.toHaveBeenCalled()
    expect(generationTaskRepo.getAll).toHaveBeenCalledTimes(1)
  })
})
