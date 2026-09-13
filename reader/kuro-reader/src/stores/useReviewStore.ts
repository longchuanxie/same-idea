import { create } from 'zustand'

import { annotationRepo } from '@/services/storage/annotationRepo'
import { knowledgeRepo } from '@/services/storage/knowledgeRepo'
import { reviewCardRepo } from '@/services/storage/reviewCardRepo'
import { vocabRepo } from '@/services/storage/vocabRepo'
import type { ReviewCard } from '@/types'
import {
  collectReviewSources,
  reconcileReviewCards,
  type DesiredReviewCard,
} from '@/utils/reviewCatalog'
import { scheduleReview, type ReviewGrade } from '@/utils/spacedRepetition'

interface ReviewState {
  cards: ReviewCard[]
  loaded: boolean
  /** 拉取现有卡（不触达来源数据） */
  loadCards: () => Promise<void>
  /**
   * 对账：从术语卡、批注手记与生词本收集卡面 → 新建/刷新/清孤儿/保持移出。
   * 进复习席与 Home 计数前调用；评分后不需要。
   */
  sync: () => Promise<void>
  /** 评分一张卡：更新排期与到期时间并落库 */
  grade: (cardId: string, grade: ReviewGrade) => Promise<void>
  /** 移出复习（不再复习这张）；对账不复活 */
  dismiss: (cardId: string) => Promise<void>
}

export const useReviewStore = create<ReviewState>()((set, get) => ({
  cards: [],
  loaded: false,

  loadCards: async () => {
    const cards = await reviewCardRepo.getAll()
    set({ cards, loaded: true })
  },

  sync: async () => {
    const [artifacts, annotations, vocabEntries, existing] = await Promise.all([
      knowledgeRepo.getAll(),
      annotationRepo.getAll(),
      vocabRepo.getAll(),
      reviewCardRepo.getAll(),
    ])
    const desired: DesiredReviewCard[] = collectReviewSources(artifacts, annotations, vocabEntries)
    const { toSave, toRemoveIds } = reconcileReviewCards(existing, desired)

    await Promise.all(toSave.map((card) => reviewCardRepo.save(card)))
    await reviewCardRepo.removeMany(toRemoveIds)

    const savedById = new Map(toSave.map((card) => [card.id, card]))
    const removed = new Set(toRemoveIds)
    const next = existing
      .filter((card) => !removed.has(card.id))
      .map((card) => savedById.get(card.id) ?? card)
    // 新建卡不在 existing 里，补齐
    const knownIds = new Set(next.map((card) => card.id))
    for (const card of toSave) {
      if (!knownIds.has(card.id)) next.push(card)
    }
    set({ cards: next, loaded: true })
  },

  grade: async (cardId, grade) => {
    const card = get().cards.find((c) => c.id === cardId)
    if (!card) return
    const now = new Date()
    const { scheduling, dueAt } = scheduleReview(card.scheduling, grade, now)
    const updated: ReviewCard = {
      ...card,
      scheduling,
      dueAt,
      lastReviewedAt: now.getTime(),
      updatedAt: now,
    }
    await reviewCardRepo.save(updated)
    set((state) => ({ cards: state.cards.map((c) => (c.id === cardId ? updated : c)) }))
  },

  dismiss: async (cardId) => {
    const card = get().cards.find((c) => c.id === cardId)
    if (!card) return
    const now = new Date()
    const updated: ReviewCard = { ...card, dismissed: true, updatedAt: now }
    await reviewCardRepo.save(updated)
    set((state) => ({ cards: state.cards.map((c) => (c.id === cardId ? updated : c)) }))
  },
}))
