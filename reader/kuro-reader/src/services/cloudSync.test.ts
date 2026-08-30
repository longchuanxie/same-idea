import axios from 'axios'
import { describe, it, expect, vi, beforeEach } from 'vitest'


import {
  buildSyncUrl,
  mergeSyncPayloads,
  runCloudSync,
  type SyncPayload,
} from '@/services/cloudSync'
import type { Annotation, Bookmark } from '@/types'

vi.mock('axios')

const BOOKMARK_TIME = '2026-08-29T10:00:00Z'

const makePayload = (overrides: Partial<SyncPayload> = {}): SyncPayload => ({
  version: 1,
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

  it('does not mutate inputs', () => {
    const local = makePayload()
    const remote = makePayload({ bookmarks: [makeBookmark('bm-new', BOOKMARK_TIME)] })
    mergeSyncPayloads(local, remote)
    expect(local.bookmarks).toHaveLength(0)
    expect(remote.annotations).toHaveLength(0)
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
  })

  it('surfaces non-404 errors', async () => {
    vi.mocked(axios.get).mockRejectedValue({ response: { status: 401 } })
    await expect(
      runCloudSync({ serverAddress: 'http://nas/dav' }, makePayload())
    ).rejects.toBeDefined()
    expect(axios.put).not.toHaveBeenCalled()
  })
})
