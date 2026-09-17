import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/storage/reviewCardRepo', () => ({
  reviewCardRepo: {
    getAll: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    removeMany: vi.fn().mockResolvedValue(undefined),
  },
}))
vi.mock('@/services/storage/knowledgeRepo', () => ({ knowledgeRepo: { getAll: vi.fn().mockResolvedValue([]) } }))
vi.mock('@/services/storage/annotationRepo', () => ({ annotationRepo: { getAll: vi.fn().mockResolvedValue([]) } }))
vi.mock('@/services/storage/vocabRepo', () => ({ vocabRepo: { getAll: vi.fn().mockResolvedValue([]) } }))
vi.mock('@/utils/reviewCatalog', () => ({
  collectReviewSources: vi.fn().mockReturnValue([]),
  reconcileReviewCards: vi.fn().mockReturnValue({ toSave: [], toRemoveIds: [] }),
}))

import { reviewCardRepo } from '@/services/storage/reviewCardRepo'
import type { ReviewCard } from '@/types'
import { INITIAL_SCHEDULING } from '@/utils/spacedRepetition'

import { useReviewStore } from './useReviewStore'

const reviewCardRepoMock = vi.mocked(reviewCardRepo, true)

const makeCard = (overrides: Partial<ReviewCard> & { id: string }): ReviewCard => ({
  bookId: 'b1',
  source: 'vocab',
  front: '术语',
  back: '定义',
  scheduling: INITIAL_SCHEDULING,
  dueAt: Date.now(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const resetStore = (cards: ReviewCard[]) => {
  useReviewStore.setState({ cards, loaded: false })
}

describe('useReviewStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(reviewCardRepo.save).mockResolvedValue(undefined)
    vi.mocked(reviewCardRepo.removeMany).mockResolvedValue(undefined)
    resetStore([])
  })

  it('loadCards 拉取现有卡并置 loaded', async () => {
    reviewCardRepoMock.getAll.mockResolvedValue([makeCard({ id: 'c1' })])

    await useReviewStore.getState().loadCards()

    expect(useReviewStore.getState().cards.map((c) => c.id)).toEqual(['c1'])
    expect(useReviewStore.getState().loaded).toBe(true)
  })

  it('grade 更新排期/到期/最近复习时间并落库', async () => {
    const card = makeCard({ id: 'c1' })
    resetStore([card])
    const before = Date.now()

    await useReviewStore.getState().grade('c1', 'good')

    const updated = useReviewStore.getState().cards[0]
    expect(updated.repetitions ?? updated.scheduling.repetitions).toBe(1)
    expect(updated.dueAt).toBeGreaterThan(before)
    expect(updated.lastReviewedAt).toBeGreaterThanOrEqual(before)
    expect(updated.dismissed).toBeUndefined()
    expect(reviewCardRepoMock.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }))
  })

  it('grade 对不存在的卡是空操作', async () => {
    resetStore([makeCard({ id: 'c1' })])

    await useReviewStore.getState().grade('missing', 'good')

    expect(reviewCardRepoMock.save).not.toHaveBeenCalled()
    expect(useReviewStore.getState().cards[0].lastReviewedAt).toBeUndefined()
  })

  it('dismiss 标记不再复习且对账不复活（dismissed=true 落库）', async () => {
    resetStore([makeCard({ id: 'c1' })])

    await useReviewStore.getState().dismiss('c1')

    const updated = useReviewStore.getState().cards[0]
    expect(updated.dismissed).toBe(true)
    expect(reviewCardRepoMock.save).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', dismissed: true }))
  })

  it('sync 移除孤儿卡并保留现有卡', async () => {
    // 本地两卡，对账判定 c1 移除；无新建
    const { reconcileReviewCards } = await import('@/utils/reviewCatalog')
    vi.mocked(reconcileReviewCards).mockReturnValue({ toSave: [], toRemoveIds: ['c1'] })
    reviewCardRepoMock.getAll.mockResolvedValue([makeCard({ id: 'c1' }), makeCard({ id: 'c2' })])

    await useReviewStore.getState().sync()

    expect(reviewCardRepoMock.removeMany).toHaveBeenCalledWith(['c1'])
    expect(useReviewStore.getState().cards.map((c) => c.id)).toEqual(['c2'])
    expect(useReviewStore.getState().loaded).toBe(true)
  })
})
