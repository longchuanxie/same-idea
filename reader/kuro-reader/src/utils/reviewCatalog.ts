/**
 * 复习卡的收集与对账（复习席消费）。
 *
 * 卡面从馆藏数据派生：术语卡条目（有定义）+ 批注手记（有笔记）。
 * 每次进复习席先「对账」：新术语/新手记自动成卡、修订过的刷新卡面、
 * 来源消失（术语被删/手记被删/书被删）的卡清掉、读者明确移出的不复活。
 * 排期状态（读者劳动成果）在对账中原样保留。
 */

import type { Annotation, GlossaryData, KnowledgeArtifact, ReviewCard, VocabEntry } from '@/types'
import { INITIAL_SCHEDULING } from '@/utils/spacedRepetition'

/** 每场新卡上限：术语卡一次生成几十条，全倒进今天会淹没复习节奏 */
export const DAILY_NEW_CARD_LIMIT = 10

/** 对账后期望存在的卡面（排期在对账时从现有卡继承） */
export interface DesiredReviewCard {
  id: string
  bookId: string
  source: ReviewCard['source']
  front: string
  back: string
}

export function glossaryTermCardId(artifactId: string, termId: string): string {
  return `rc-g-${artifactId}-${termId}`
}

export function annotationCardId(annotationId: string): string {
  return `rc-a-${annotationId}`
}

export function vocabCardId(entryId: string): string {
  return `rc-v-${entryId}`
}

/**
 * 从知识件与手记收集应复习的卡面。
 * - 术语卡条目：正面=术语、背面=书内定义（无定义不成卡——没有答案面）
 * - 批注手记：正面=划线原文、背面=批注（纯划线不成卡，那属于摘抄墙的领地）
 * - 生词：正面=词、背面=发音+释义（无释义不成卡，查词服务保证有）
 */
export function collectReviewSources(
  artifacts: KnowledgeArtifact[],
  annotations: Annotation[],
  vocabEntries: VocabEntry[] = []
): DesiredReviewCard[] {
  const desired: DesiredReviewCard[] = []
  for (const artifact of artifacts) {
    if (artifact.type !== 'glossary') continue
    const glossary = artifact.data as GlossaryData
    for (const term of glossary.terms) {
      const front = term.term?.trim()
      const back = term.definition?.trim()
      if (!front || !back) continue
      desired.push({
        id: glossaryTermCardId(artifact.id, term.id),
        bookId: artifact.bookId,
        source: 'glossary-term',
        front,
        back,
      })
    }
  }
  for (const ann of annotations) {
    const front = ann.selectedText?.trim()
    const back = ann.note?.trim()
    if (!front || !back) continue
    desired.push({
      id: annotationCardId(ann.id),
      bookId: ann.bookId,
      source: 'annotation',
      front,
      back,
    })
  }
  for (const entry of vocabEntries) {
    const front = entry.word?.trim()
    const back = entry.definition?.trim()
    if (!front || !back) continue
    desired.push({
      id: vocabCardId(entry.id),
      bookId: entry.bookId,
      source: 'vocab',
      front,
      back: entry.pronunciation ? `${entry.pronunciation} · ${back}` : back,
    })
  }
  return desired
}

export interface ReconcileResult {
  /** 需要落库的卡（新建 + 卡面有变化的更新） */
  toSave: ReviewCard[]
  /** 来源已消失、应删除的卡 id */
  toRemoveIds: string[]
  /** 来源存在但被读者移出复习的卡 id（保持移出，不复活） */
  keptDismissedIds: string[]
}

/** 对账：期望卡面 vs 现有卡。排期/移出状态继承，卡面快照跟随来源刷新。 */
export function reconcileReviewCards(
  existing: ReviewCard[],
  desired: DesiredReviewCard[],
  now: Date = new Date()
): ReconcileResult {
  const existingById = new Map(existing.map((card) => [card.id, card]))
  const desiredById = new Map(desired.map((card) => [card.id, card]))

  const toSave: ReviewCard[] = []
  const toRemoveIds: string[] = []
  const keptDismissedIds: string[] = []

  for (const want of desired) {
    const current = existingById.get(want.id)
    if (!current) {
      toSave.push({
        id: want.id,
        bookId: want.bookId,
        source: want.source,
        front: want.front,
        back: want.back,
        scheduling: INITIAL_SCHEDULING,
        dueAt: now.getTime(),
        createdAt: now,
        updatedAt: now,
      })
      continue
    }
    if (current.dismissed) {
      keptDismissedIds.push(current.id)
      continue
    }
    if (current.front !== want.front || current.back !== want.back) {
      toSave.push({ ...current, front: want.front, back: want.back, updatedAt: now })
    }
  }

  for (const card of existing) {
    if (!desiredById.has(card.id)) {
      toRemoveIds.push(card.id)
    }
  }

  return { toSave, toRemoveIds, keptDismissedIds }
}

/** 组建当场复习队列：到期卡在前（按到期先后），新卡殿后（受每场上限约束） */
export function buildReviewQueue(
  cards: ReviewCard[],
  now: Date = new Date(),
  newCardLimit: number = DAILY_NEW_CARD_LIMIT
): ReviewCard[] {
  const due = cards.filter((card) => !card.dismissed && card.dueAt <= now.getTime())
  const reviews = due.filter((card) => card.lastReviewedAt != null).sort((a, b) => a.dueAt - b.dueAt)
  const fresh = due
    .filter((card) => card.lastReviewedAt == null)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
    .slice(0, newCardLimit)
  return [...reviews, ...fresh]
}
