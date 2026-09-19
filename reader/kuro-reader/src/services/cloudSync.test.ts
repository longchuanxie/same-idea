import axios from 'axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'


import {
  applyMergedPayloadToLocal,
  buildSyncUrl,
  mergeSyncPayloads,
  mergeSyncedStats,
  runCloudSync,
  type SyncPayload,
  type SyncedStats,
} from '@/services/cloudSync'
import { annotationRepo } from '@/services/storage/annotationRepo'
import { bookmarkRepo } from '@/services/storage/bookmarkRepo'
import { getDB, _resetDBForTesting } from '@/services/storage/db'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { progressRepo } from '@/services/storage/progressRepo'
import { reviewCardRepo } from '@/services/storage/reviewCardRepo'
import { tombstoneRepo } from '@/services/storage/tombstoneRepo'
import { vocabRepo } from '@/services/storage/vocabRepo'
import type { Annotation, Bookmark, KnowledgeArtifact, ReviewCard, VocabEntry } from '@/types'

vi.mock('axios')

const BOOKMARK_TIME = '2026-08-29T10:00:00Z'

const makePayload = (overrides: Partial<SyncPayload> = {}): SyncPayload => ({
  version: 2,
  exportedAt: '2026-08-29T12:00:00',
  readingProgress: {},
  bookmarks: [],
  annotations: [],
  ...overrides,
})

const makeBookmark = (id: string, createdAt: string): Bookmark => ({
  id,
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  textPreview: '预览',
  createdAt: new Date(createdAt),
})

const makeAnnotation = (id: string, updatedAt: string): Annotation => ({
  id,
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '原文',
  note: '笔记',
  startOffset: 0,
  endOffset: 2,
  createdAt: new Date(updatedAt),
  updatedAt: new Date(updatedAt),
})

describe('buildSyncUrl', () => {
  it('normalizes address and appends sync file path', () => {
    expect(buildSyncUrl('http://nas:5005/dav')).toBe('http://nas:5005/dav/kuro-reader-sync.json')
    expect(buildSyncUrl('http://nas:5005/dav/')).toBe('http://nas:5005/dav/kuro-reader-sync.json')
    expect(buildSyncUrl('nas:5005/dav')).toBe('http://nas:5005/dav/kuro-reader-sync.json')
  })
})

describe('mergeSyncPayloads', () => {
  it('merges progress per book by updatedAt (last write wins)', () => {
    const local = makePayload({
      readingProgress: {
        b1: { bookId: 'b1', chapterId: 'c1', page: 2, totalPages: 10, percentage: 20, globalPageIndex: 1, totalImages: 10, updatedAt: 200 },
        b2: { bookId: 'b2', chapterId: 'c2', page: 1, totalPages: 10, percentage: 10, globalPageIndex: 0, totalImages: 10, updatedAt: 100 },
      },
    })
    const remote = makePayload({
      readingProgress: {
        b1: { bookId: 'b1', chapterId: 'c1', page: 8, totalPages: 10, percentage: 80, globalPageIndex: 7, totalImages: 10, updatedAt: 300 },
        b3: { bookId: 'b3', chapterId: 'c3', page: 1, totalPages: 5, percentage: 20, globalPageIndex: 0, totalImages: 5, updatedAt: 50 },
      },
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.readingProgress.b1.page).toBe(8) // 远端较新
    expect(merged.readingProgress.b2.page).toBe(1) // 本地保留
    expect(merged.readingProgress.b3).toBeDefined() // 远端新增
  })

  it('unions bookmarks and annotations by id with LWW', () => {
    const local = makePayload({
      bookmarks: [makeBookmark('bm-old', BOOKMARK_TIME)],
      annotations: [makeAnnotation('ann-1', '2026-08-29T10:00:00Z')],
    })
    const remote = makePayload({
      bookmarks: [makeBookmark('bm-new', '2026-08-29T11:00:00')],
      annotations: [makeAnnotation('ann-1', '2026-08-29T09:00:00Z')], // 远端较旧
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.bookmarks.map((b) => b.id).sort()).toEqual(['bm-new', 'bm-old'])
    // 同 id：本地较新者保留
    expect(merged.annotations[0].updatedAt.toISOString()).toBe('2026-08-29T10:00:00.000Z')
  })

  it('takes the newer exportedAt', () => {
    const local = makePayload({ exportedAt: '2026-08-29T12:00:00Z' })
    const remote = makePayload({ exportedAt: '2026-08-29T13:00:00Z' })
    expect(mergeSyncPayloads(local, remote).exportedAt).toBe('2026-08-29T13:00:00Z')
  })

  it('merges stats by (date,bookId) taking max minutes; goal from newer payload', () => {
    const localStats: SyncedStats = {
      readingSessions: [
        { date: '2026-08-28', minutes: 20, bookId: 'b1' },
        { date: '2026-08-29', minutes: 10, bookId: 'b1' },
      ],
      dailyGoalMinutes: 30,
    }
    const remoteStats: SyncedStats = {
      readingSessions: [
        { date: '2026-08-28', minutes: 45, bookId: 'b1' }, // 远端更大
        { date: '2026-08-28', minutes: 15, bookId: 'b2' }, // 远端独有
      ],
      dailyGoalMinutes: 60,
    }
    const local = makePayload({ exportedAt: '2026-08-29T12:00:00Z', stats: localStats })
    const remote = makePayload({ exportedAt: '2026-08-29T13:00:00Z', stats: remoteStats })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.stats?.readingSessions).toHaveLength(3)
    const byKey = new Map(merged.stats!.readingSessions.map((s) => [`${s.date}|${s.bookId}`, s.minutes]))
    expect(byKey.get('2026-08-28|b1')).toBe(45) // max 而非求和
    expect(byKey.get('2026-08-29|b1')).toBe(10)
    expect(byKey.get('2026-08-28|b2')).toBe(15)
    expect(merged.stats?.dailyGoalMinutes).toBe(60) // 远端 exportedAt 更新
  })

  it('stats: 一方无 stats（旧客户端）时保留另一方', () => {
    const stats: SyncedStats = {
      readingSessions: [{ date: '2026-08-28', minutes: 20, bookId: 'b1' }],
      dailyGoalMinutes: 45,
    }
    // 远端是 v1 旧载荷（无 stats）
    const oldRemote = makePayload({ exportedAt: '2026-08-29T13:00:00Z' })
    delete (oldRemote as Partial<SyncPayload>).stats
    const local = makePayload({ exportedAt: '2026-08-29T12:00:00Z', stats })

    const merged = mergeSyncPayloads(local, oldRemote)
    expect(merged.stats?.dailyGoalMinutes).toBe(45)

    // 本地旧、远端新
    const merged2 = mergeSyncPayloads(makePayload({ exportedAt: '2026-08-29T12:00:00Z' }), makePayload({ exportedAt: '2026-08-29T13:00:00Z', stats }))
    expect(merged2.stats?.dailyGoalMinutes).toBe(45)

    // 双方都无 stats → undefined
    expect(mergeSyncPayloads(makePayload(), makePayload({ exportedAt: '2026-08-30T00:00:00Z' })).stats).toBeUndefined()
  })

  it('mergeSyncedStats 直接调用：相同 exportedAt 时 goal 保留本地', () => {
    const local: SyncedStats = { readingSessions: [], dailyGoalMinutes: 30 }
    const remote: SyncedStats = { readingSessions: [], dailyGoalMinutes: 60 }
    const same = '2026-08-29T12:00:00Z'
    expect(mergeSyncedStats(local, remote, same, same)?.dailyGoalMinutes).toBe(30)
    expect(mergeSyncedStats(undefined, remote, same, same)).toEqual(remote)
    expect(mergeSyncedStats(local, undefined, same, same)).toEqual(local)
  })

  it('does not mutate inputs', () => {
    const local = makePayload()
    const remote = makePayload({ bookmarks: [makeBookmark('bm-new', BOOKMARK_TIME)] })
    mergeSyncPayloads(local, remote)
    expect(local.bookmarks).toHaveLength(0)
    expect(remote.annotations).toHaveLength(0)
  })
})

describe('mergeSyncPayloads: tombstones (v3)', () => {
  const progressOf = (bookId: string, updatedAt: number) =>
    ({ bookId, chapterId: 'c1', page: 1, totalPages: 10, percentage: 10, globalPageIndex: 0, totalImages: 10, updatedAt }) as never

  const DAY_MS = 24 * 3600 * 1000
  // 时间基准全部相对 Date.now()，避免固定日期随日历推进越过交叉点后用例腐烂
  const tombstoneAt = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY_MS).toISOString()

  it('本地删除（墓碑）后，远端旧副本不再复活', () => {
    const local = makePayload({
      tombstones: [{ kind: 'progress', key: 'b1', deletedAt: tombstoneAt(5) }],
    })
    const remote = makePayload({
      readingProgress: { b1: progressOf('b1', Date.now() - 10 * DAY_MS) }, // 远端记录早于墓碑
      annotations: [makeAnnotation('ann-1', '2026-08-20T10:00:00Z')],
    })
    local.tombstones!.push({ kind: 'annotation', key: 'ann-1', deletedAt: '2026-08-30T12:00:00Z' })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.readingProgress.b1).toBeUndefined()
    expect(merged.annotations.map((a) => a.id)).toEqual([])
    // 墓碑本身保留在合并载荷中（继续传播给其他设备）
    expect(merged.tombstones?.map((t) => `${t.kind}:${t.key}`).sort()).toEqual(['annotation:ann-1', 'progress:b1'])
  })

  it('墓碑之后重新创建/编辑的记录胜出，墓碑随之失效', () => {
    const local = makePayload({
      readingProgress: { b1: progressOf('b1', Date.now()) }, // 删除后重新读到，晚于墓碑
    })
    const remote = makePayload({
      tombstones: [{ kind: 'progress', key: 'b1', deletedAt: tombstoneAt(5) }],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.readingProgress.b1).toBeDefined()
    expect(merged.tombstones).toEqual([])
  })

  it('整书墓碑级联剔除该书进度/书签/批注', () => {
    const local = makePayload({
      tombstones: [{ kind: 'book', key: 'b1', deletedAt: '2026-08-30T12:00:00Z' }],
    })
    const remote = makePayload({
      readingProgress: { b1: progressOf('b1', 100) },
      bookmarks: [makeBookmark('bm-1', '2026-08-20T10:00:00Z')],
      annotations: [makeAnnotation('ann-1', '2026-08-20T10:00:00Z')],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.readingProgress.b1).toBeUndefined()
    expect(merged.bookmarks).toEqual([])
    expect(merged.annotations).toEqual([])
  })

  it('整书墓碑之后该书又有新批注时：新批注存活、整书墓碑失效', () => {
    const local = makePayload({
      annotations: [makeAnnotation('ann-new', '2026-09-01T10:00:00Z')], // 晚于墓碑
    })
    const remote = makePayload({
      tombstones: [{ kind: 'book', key: 'b1', deletedAt: '2026-08-30T12:00:00Z' }],
      annotations: [makeAnnotation('ann-old', '2026-08-20T10:00:00Z')],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.annotations.map((a) => a.id)).toEqual(['ann-new'])
    expect(merged.tombstones).toEqual([])
  })

  it('双方墓碑按 kind:key 取较新 deletedAt；过期墓碑（>90 天）被清理', () => {
    const local = makePayload({
      tombstones: [
        { kind: 'annotation', key: 'a1', deletedAt: '2026-08-01T00:00:00Z' },
        { kind: 'bookmark', key: 'old-bm', deletedAt: '2026-01-01T00:00:00Z' }, // 过期
      ],
    })
    const remote = makePayload({
      tombstones: [{ kind: 'annotation', key: 'a1', deletedAt: '2026-08-15T00:00:00Z' }],
    })

    const merged = mergeSyncPayloads(local, remote)
    const annT = merged.tombstones?.find((t) => t.key === 'a1')
    expect(annT?.deletedAt).toBe('2026-08-15T00:00:00Z')
    expect(merged.tombstones?.some((t) => t.key === 'old-bm')).toBe(false)
  })

  it('旧载荷（无 tombstones 字段）兼容：照常合并，不产生墓碑', () => {
    const local = makePayload({ annotations: [makeAnnotation('ann-1', '2026-08-29T10:00:00Z')] })
    const remote = makePayload({ annotations: [makeAnnotation('ann-2', '2026-08-29T11:00:00Z')] })
    delete (remote as Partial<SyncPayload>).tombstones

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.annotations).toHaveLength(2)
    expect(merged.tombstones).toEqual([])
  })
})

describe('runCloudSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('first sync (remote 404): uploads local payload', async () => {
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 404 } })
    vi.mocked(axios.put).mockResolvedValue({})

    const local = makePayload({ readingProgress: {
      b1: { bookId: 'b1', chapterId: 'c1', page: 1, totalPages: 10, percentage: 10, globalPageIndex: 0, totalImages: 10 },
    } })
    const result = await runCloudSync({ serverAddress: 'http://nas/dav' }, local)

    expect(result.direction).toBe('pushed')
    expect(axios.put).toHaveBeenCalledTimes(1)
    const [, payload] = vi.mocked(axios.put).mock.calls[0]
    expect((payload as SyncPayload).readingProgress.b1).toBeDefined()
  })

  it('远端 200 但非同步载荷（如反代登录页 HTML）：报错且不 PUT 覆盖', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: '<html>login</html>' })
    vi.mocked(axios.put).mockResolvedValue({})
    const local = makePayload({})

    await expect(
      runCloudSync({ serverAddress: 'http://nas/dav' }, local)
    ).rejects.toThrow('不是有效的同步数据')
    expect(axios.put).not.toHaveBeenCalled()
  })

  it('remote exists: merges and writes back', async () => {
    const remote = makePayload({
      exportedAt: '2026-08-29T15:00:00Z',
      annotations: [makeAnnotation('ann-remote', '2026-08-29T15:00:00Z')],
    })
    vi.mocked(axios.get).mockResolvedValue({ data: remote })
    vi.mocked(axios.put).mockResolvedValue({})

    const local = makePayload({ annotations: [makeAnnotation('ann-local', '2026-08-29T10:00:00Z')] })
    const result = await runCloudSync({ serverAddress: 'http://nas/dav' }, local)

    expect(result.direction).toBe('merged')
    const [, payload] = vi.mocked(axios.put).mock.calls[0]
    const merged = payload as SyncPayload
    expect(merged.annotations.map((a) => a.id).sort()).toEqual(['ann-local', 'ann-remote'])
    // 上传载荷的 exportedAt 被重打为本次同步时刻
    expect(new Date(merged.exportedAt).getTime()).toBeGreaterThan(Date.now() - 60000)
    // 结果携带最终载荷，供调用方落地本地
    expect(result.payload.annotations.map((a) => a.id).sort()).toEqual(['ann-local', 'ann-remote'])
  })

  it('surfaces non-404 errors', async () => {
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 401 } })
    await expect(
      runCloudSync({ serverAddress: 'http://nas/dav' }, makePayload())
    ).rejects.toBeDefined()
    expect(axios.put).not.toHaveBeenCalled()
  })

  it('username with empty password: fails fast with a clear message instead of sending empty Basic auth', async () => {
    await expect(
      runCloudSync({ serverAddress: 'http://nas/dav', username: 'user', password: '' }, makePayload())
    ).rejects.toThrow('请补全密码')
    expect(axios.get).not.toHaveBeenCalled()
    expect(axios.put).not.toHaveBeenCalled()
  })
})

describe('applyMergedPayloadToLocal', () => {
  beforeEach(async () => {
    try {
      const db = await getDB()
      db.close()
    } catch {
      // first run: no DB yet
    }
    _resetDBForTesting()
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.deleteDatabase('kuro-reader-db')
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
      req.onblocked = () => resolve()
    })
  })

  it('把合并载荷(含 JSON 反序列化的字符串日期)写回本地三张表', async () => {
    // 远端 JSON 落地时日期是 ISO 字符串——repo 需容忍该形态
    const remoteAnnotation = {
      ...makeAnnotation('ann-remote', '2026-08-29T15:00:00Z'),
      createdAt: '2026-08-29T15:00:00.000Z' as unknown as Date,
      updatedAt: '2026-08-29T15:00:00.000Z' as unknown as Date,
    }
    const payload = makePayload({
      readingProgress: {
        b1: { bookId: 'b1', chapterId: 'c1', page: 5, totalPages: 10, percentage: 50, globalPageIndex: 4, totalImages: 10, updatedAt: 300 },
      },
      bookmarks: [makeBookmark('bm-remote', BOOKMARK_TIME)],
      annotations: [remoteAnnotation],
    })

    await applyMergedPayloadToLocal(payload)

    const progressList = await progressRepo.getAll()
    expect(progressList.map((p) => p.bookId)).toEqual(['b1'])
    expect((await bookmarkRepo.getByBookId('b1')).map((b) => b.id)).toEqual(['bm-remote'])
    const annotations = await annotationRepo.getByBookId('b1')
    expect(annotations.map((a) => a.id)).toEqual(['ann-remote'])
    // 读出时日期已还原为 Date 实例
    expect(annotations[0].createdAt instanceof Date).toBe(true)
  })

  it('重复应用同一载荷是幂等的', async () => {
    const payload = makePayload({ annotations: [makeAnnotation('ann-dup', '2026-08-29T15:00:00Z')] })
    await applyMergedPayloadToLocal(payload)
    await applyMergedPayloadToLocal(payload)
    expect(await annotationRepo.getAll()).toHaveLength(1)
  })

  it('墓碑随载荷落地：删除本地对应记录并写入本地墓碑表', async () => {
    // 本地已有 b1 进度 + ann-1 批注；另一台设备删了它们
    await progressRepo.save({ bookId: 'b1', chapterId: 'c1', page: 3, totalPages: 10, percentage: 30, globalPageIndex: 2, totalImages: 10 } as never)
    await annotationRepo.add(makeAnnotation('ann-1', '2026-08-20T10:00:00Z'))
    await bookmarkRepo.add(makeBookmark('bm-1', '2026-08-20T10:00:00Z'))

    const payload = makePayload({
      tombstones: [
        { kind: 'progress', key: 'b1', deletedAt: '2026-08-30T12:00:00Z' },
        { kind: 'annotation', key: 'ann-1', deletedAt: '2026-08-30T12:00:00Z' },
      ],
    })
    await applyMergedPayloadToLocal(payload)

    expect((await progressRepo.getAll()).map((p) => p.bookId)).toEqual([])
    expect(await annotationRepo.getAll()).toEqual([])
    // 书签未被墓碑命中，原样保留
    expect((await bookmarkRepo.getAll()).map((b) => b.id)).toEqual(['bm-1'])
    // 墓碑已写入本地，下次上传会携带
    const localTombstones = await tombstoneRepo.getAll()
    expect(localTombstones.map((t) => t.id).sort()).toEqual(['annotation:ann-1', 'progress:b1'])
  })

  it('整书墓碑落地：删除该书名下全部记录', async () => {
    await progressRepo.save({ bookId: 'b1', chapterId: 'c1', page: 3, totalPages: 10, percentage: 30, globalPageIndex: 2, totalImages: 10 } as never)
    await annotationRepo.add(makeAnnotation('ann-1', '2026-08-20T10:00:00Z'))
    await bookmarkRepo.add(makeBookmark('bm-1', '2026-08-20T10:00:00Z'))

    const payload = makePayload({
      tombstones: [{ kind: 'book', key: 'b1', deletedAt: '2026-08-30T12:00:00Z' }],
    })
    await applyMergedPayloadToLocal(payload)

    expect(await progressRepo.getAll()).toEqual([])
    expect(await annotationRepo.getAll()).toEqual([])
    expect(await bookmarkRepo.getAll()).toEqual([])
  })
})

// ---- v4：知识库产物 ----

const makeKnowledgeArtifact = (id: string, updatedAt: string, bookId = 'b1'): KnowledgeArtifact => ({
  id,
  bookId,
  type: 'character-graph',
  title: '人物关系图谱',
  data: { nodes: [{ id: 'n1', name: '张三' }], edges: [] },
  generator: 'ai',
  createdAt: new Date(updatedAt),
  updatedAt: new Date(updatedAt),
})

describe('mergeSyncPayloads · knowledgeArtifacts（v4）', () => {
  it('按 id LWW：较新 updatedAt 胜出，单方存在时保留', () => {
    const local = makePayload({ knowledgeArtifacts: [makeKnowledgeArtifact('kn-1', '2026-09-01T10:00:00Z')] })
    const remote = makePayload({
      knowledgeArtifacts: [
        makeKnowledgeArtifact('kn-1', '2026-09-02T10:00:00Z'),
        makeKnowledgeArtifact('kn-2', '2026-09-02T10:00:00Z'),
      ],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.knowledgeArtifacts).toHaveLength(2)
    // 合并结果按当前载荷版本（v5 起携带生词/复习卡）落版
    expect(merged.version).toBe(5)
    const kn1 = merged.knowledgeArtifacts!.find((a) => a.id === 'kn-1')!
    expect(+new Date(kn1.updatedAt)).toBe(+new Date('2026-09-02T10:00:00Z'))
  })

  it('旧载荷（无 knowledgeArtifacts）不吞掉本地知识件', () => {
    const local = makePayload({ knowledgeArtifacts: [makeKnowledgeArtifact('kn-1', '2026-09-01T10:00:00Z')] })
    const remote = makePayload()
    const merged = mergeSyncPayloads(local, remote)
    expect(merged.knowledgeArtifacts).toHaveLength(1)
  })

  it('knowledge 墓碑剔除双方已删的知识件；删除后重新生成的胜出', () => {
    const local = makePayload({
      knowledgeArtifacts: [makeKnowledgeArtifact('kn-1', '2026-09-03T10:00:00Z')],
      tombstones: [{ kind: 'knowledge', key: 'kn-1', deletedAt: '2026-09-02T10:00:00Z' }],
    })
    const remote = makePayload({
      knowledgeArtifacts: [makeKnowledgeArtifact('kn-1', '2026-09-01T10:00:00Z')],
    })

    // kn-1 在墓碑（09-02）之后被重新生成（09-03）→ 记录胜出
    const merged = mergeSyncPayloads(local, remote)
    expect(merged.knowledgeArtifacts).toHaveLength(1)
    // 墓碑因记录复活而失效清理
    expect(merged.tombstones).toEqual([])
  })

  it('整书墓碑级联剔除该书包知识件', () => {
    const local = makePayload({
      tombstones: [{ kind: 'book', key: 'b1', deletedAt: '2026-09-02T10:00:00Z' }],
    })
    const remote = makePayload({
      knowledgeArtifacts: [
        makeKnowledgeArtifact('kn-1', '2026-09-01T10:00:00Z'),
        makeKnowledgeArtifact('kn-other', '2026-09-01T10:00:00Z', 'b2'),
      ],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.knowledgeArtifacts!.map((a) => a.id)).toEqual(['kn-other'])
  })
})

describe('applyMergedPayloadToLocal · knowledgeArtifacts（v4）', () => {
  it('合并结果写入知识件仓库', async () => {
    const payload = makePayload({ knowledgeArtifacts: [makeKnowledgeArtifact('kn-1', '2026-09-01T10:00:00Z')] })
    await applyMergedPayloadToLocal(payload)

    const artifacts = await knowledgeRepo.getByBookId('b1')
    expect(artifacts.map((a) => a.id)).toEqual(['kn-1'])
    expect(artifacts[0].updatedAt instanceof Date).toBe(true)
  })

  it('knowledge 墓碑落地：删除本地对应知识件', async () => {
    await knowledgeRepo.save(makeKnowledgeArtifact('kn-1', '2026-08-20T10:00:00Z'))
    const payload = makePayload({
      tombstones: [{ kind: 'knowledge', key: 'kn-1', deletedAt: '2026-09-02T10:00:00Z' }],
    })
    await applyMergedPayloadToLocal(payload)
    expect(await knowledgeRepo.getAll()).toEqual([])
  })
})

// ---- v5：生词本与复习卡 ----

const makeVocabEntry = (id: string, updatedAt: string, bookId = 'b1'): VocabEntry => ({
  id,
  word: id,
  definition: '释义',
  context: '语境',
  bookId,
  chapterIndex: 0,
  lookupCount: 1,
  createdAt: new Date(updatedAt),
  updatedAt: new Date(updatedAt),
})

const makeReviewCard = (id: string, updatedAt: string, bookId = 'b1'): ReviewCard => ({
  id,
  bookId,
  source: 'vocab',
  front: '词',
  back: '释义',
  scheduling: { intervalDays: 1, ease: 2.5, repetitions: 1 },
  dueAt: +new Date(updatedAt),
  lastReviewedAt: +new Date(updatedAt),
  createdAt: new Date(updatedAt),
  updatedAt: new Date(updatedAt),
})

describe('mergeSyncPayloads · vocabEntries / reviewCards（v5）', () => {
  it('按 id LWW：较新 updatedAt 胜出，单方存在时保留', () => {
    const local = makePayload({
      vocabEntries: [makeVocabEntry('vocab-a', '2026-09-01T10:00:00Z')],
      reviewCards: [makeReviewCard('rc-a', '2026-09-01T10:00:00Z')],
    })
    const remote = makePayload({
      vocabEntries: [
        makeVocabEntry('vocab-a', '2026-09-02T10:00:00Z'),
        makeVocabEntry('vocab-b', '2026-09-02T10:00:00Z'),
      ],
      reviewCards: [makeReviewCard('rc-b', '2026-09-02T10:00:00Z')],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.vocabEntries).toHaveLength(2)
    expect(merged.reviewCards).toHaveLength(2)
    const vocabA = merged.vocabEntries!.find((v) => v.id === 'vocab-a')!
    expect(+new Date(vocabA.updatedAt)).toBe(+new Date('2026-09-02T10:00:00Z'))
  })

  it('旧载荷（无 v5 字段）不吞掉本地生词与复习卡', () => {
    const local = makePayload({
      vocabEntries: [makeVocabEntry('vocab-a', '2026-09-01T10:00:00Z')],
      reviewCards: [makeReviewCard('rc-a', '2026-09-01T10:00:00Z')],
    })
    const merged = mergeSyncPayloads(local, makePayload())
    expect(merged.vocabEntries).toHaveLength(1)
    expect(merged.reviewCards).toHaveLength(1)
  })

  it('vocab/review 墓碑剔除双方已删的记录；删除后重新编辑的胜出', () => {
    const local = makePayload({
      vocabEntries: [makeVocabEntry('vocab-a', '2026-09-03T10:00:00Z')],
      tombstones: [{ kind: 'vocab', key: 'vocab-a', deletedAt: '2026-09-02T10:00:00Z' }],
    })
    const remote = makePayload({
      vocabEntries: [makeVocabEntry('vocab-a', '2026-09-01T10:00:00Z')],
      reviewCards: [makeReviewCard('rc-a', '2026-09-01T10:00:00Z')],
      tombstones: [{ kind: 'review', key: 'rc-a', deletedAt: '2026-09-05T10:00:00Z' }],
    })

    const merged = mergeSyncPayloads(local, remote)
    // vocab-a：墓碑（09-02）后又被编辑（09-03）→ 记录复活
    expect(merged.vocabEntries!.map((v) => v.id)).toEqual(['vocab-a'])
    // rc-a：墓碑（09-05）晚于记录（09-01）→ 剔除
    expect(merged.reviewCards).toEqual([])
  })

  it('整书墓碑级联剔除该书的生词与复习卡', () => {
    const local = makePayload({
      tombstones: [{ kind: 'book', key: 'b1', deletedAt: '2026-09-02T10:00:00Z' }],
    })
    const remote = makePayload({
      vocabEntries: [
        makeVocabEntry('vocab-1', '2026-09-01T10:00:00Z'),
        makeVocabEntry('vocab-2', '2026-09-01T10:00:00Z', 'b2'),
      ],
      reviewCards: [makeReviewCard('rc-1', '2026-09-01T10:00:00Z')],
    })

    const merged = mergeSyncPayloads(local, remote)
    expect(merged.vocabEntries!.map((v) => v.id)).toEqual(['vocab-2'])
    expect(merged.reviewCards).toEqual([])
  })
})

describe('applyMergedPayloadToLocal · vocabEntries / reviewCards（v5）', () => {
  it('合并结果写入生词与复习卡仓库', async () => {
    const payload = makePayload({
      vocabEntries: [makeVocabEntry('vocab-a', '2026-09-01T10:00:00Z')],
      reviewCards: [makeReviewCard('rc-a', '2026-09-01T10:00:00Z')],
    })
    await applyMergedPayloadToLocal(payload)

    expect((await vocabRepo.getAll()).map((v) => v.id)).toEqual(['vocab-a'])
    expect((await reviewCardRepo.getAll()).map((c) => c.id)).toEqual(['rc-a'])
  })

  it('vocab/review 墓碑落地：删除本地对应记录', async () => {
    await vocabRepo.save(makeVocabEntry('vocab-a', '2026-08-20T10:00:00Z'))
    await reviewCardRepo.save(makeReviewCard('rc-a', '2026-08-20T10:00:00Z'))
    const payload = makePayload({
      tombstones: [
        { kind: 'vocab', key: 'vocab-a', deletedAt: '2026-09-02T10:00:00Z' },
        { kind: 'review', key: 'rc-a', deletedAt: '2026-09-02T10:00:00Z' },
      ],
    })
    await applyMergedPayloadToLocal(payload)
    expect(await vocabRepo.getAll()).toEqual([])
    expect(await reviewCardRepo.getAll()).toEqual([])
  })
})
