import { describe, it, expect } from 'vitest'

import type { Annotation, KnowledgeArtifact, ReviewCard, VocabEntry } from '@/types'
import {
  DAILY_NEW_CARD_LIMIT,
  annotationCardId,
  buildReviewQueue,
  collectReviewSources,
  glossaryTermCardId,
  reconcileReviewCards,
  vocabCardId,
} from '@/utils/reviewCatalog'
import { INITIAL_SCHEDULING } from '@/utils/spacedRepetition'

const NOW = new Date('2026-09-13T10:00:00')
const DAY_MS = 24 * 60 * 60 * 1000

const makeAnnotation = (overrides: Partial<Annotation> & { id: string }): Annotation => ({
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '权力的游戏开始了',
  note: '',
  startOffset: 0,
  endOffset: 8,
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

const makeArtifact = (overrides: Partial<KnowledgeArtifact> = {}): KnowledgeArtifact => ({
  id: 'k1',
  bookId: 'b1',
  type: 'glossary',
  title: '概念术语卡',
  data: {
    terms: [
      { id: 'g1', term: '注意力机制', definition: '按相关性加权输入' },
      { id: 'g2', term: '消融实验', definition: '逐项拆除验证贡献' },
      { id: 'g3', term: '无定义术语' },
    ],
  },
  generator: 'ai',
  createdAt: NOW,
  updatedAt: NOW,
  ...overrides,
})

describe('collectReviewSources', () => {
  it('术语卡成卡（正面=术语、背面=定义）；无定义的术语不成卡', () => {
    const desired = collectReviewSources([makeArtifact()], [])
    expect(desired).toEqual([
      {
        id: glossaryTermCardId('k1', 'g1'),
        bookId: 'b1',
        source: 'glossary-term',
        front: '注意力机制',
        back: '按相关性加权输入',
      },
      {
        id: glossaryTermCardId('k1', 'g2'),
        bookId: 'b1',
        source: 'glossary-term',
        front: '消融实验',
        back: '逐项拆除验证贡献',
      },
    ])
  })

  it('批注手记成卡（正面=划线、背面=批注）；纯划线不成卡', () => {
    const desired = collectReviewSources(
      [],
      [
        makeAnnotation({ id: 'a1', note: '卷首点题' }),
        makeAnnotation({ id: 'a2', note: '   ' }),
      ]
    )
    expect(desired).toEqual([
      {
        id: annotationCardId('a1'),
        bookId: 'b1',
        source: 'annotation',
        front: '权力的游戏开始了',
        back: '卷首点题',
      },
    ])
  })

  it('非术语卡产物不参与', () => {
    const desired = collectReviewSources([makeArtifact({ type: 'mindmap', data: { title: '大纲' } })], [])
    expect(desired).toEqual([])
  })

  it('生词成卡：正面=词、背面=发音+释义；无释义不成卡', () => {
    const makeVocab = (overrides: Partial<VocabEntry> & { id: string }): VocabEntry => ({
      word: 'benevolent',
      definition: 'adj. 仁慈的',
      context: 'a benevolent man',
      bookId: 'b2',
      chapterIndex: 0,
      lookupCount: 1,
      createdAt: NOW,
      updatedAt: NOW,
      ...overrides,
    })
    const desired = collectReviewSources(
      [],
      [],
      [
        makeVocab({ id: 'vocab-1', word: 'benevolent', pronunciation: '/bəˈnevələnt/' }),
        makeVocab({ id: 'vocab-2', word: '无释义词', definition: '' }),
      ]
    )
    expect(desired).toEqual([
      {
        id: vocabCardId('vocab-1'),
        bookId: 'b2',
        source: 'vocab',
        front: 'benevolent',
        back: '/bəˈnevələnt/ · adj. 仁慈的',
      },
    ])
  })
})

describe('reconcileReviewCards', () => {
  const desired = collectReviewSources([makeArtifact()], [makeAnnotation({ id: 'a1', note: '批注' })])

  it('空库 → 全部新建（初始排期、立即到期）', () => {
    const { toSave, toRemoveIds, keptDismissedIds } = reconcileReviewCards([], desired, NOW)
    expect(toSave.map((c) => c.id).sort()).toEqual(desired.map((c) => c.id).sort())
    expect(toSave.every((c) => c.scheduling === INITIAL_SCHEDULING && c.dueAt === NOW.getTime())).toBe(true)
    expect(toRemoveIds).toEqual([])
    expect(keptDismissedIds).toEqual([])
  })

  it('卡面跟随来源刷新（术语被修订），排期原样保留', () => {
    const revised = collectReviewSources(
      [makeArtifact({ data: { terms: [{ id: 'g1', term: '注意力机制（修订）', definition: '新定义' }] } })],
      []
    )
    const existing: ReviewCard[] = [
      {
        id: glossaryTermCardId('k1', 'g1'),
        bookId: 'b1',
        source: 'glossary-term',
        front: '注意力机制',
        back: '按相关性加权输入',
        scheduling: { intervalDays: 15, ease: 2.4, repetitions: 3 },
        dueAt: NOW.getTime() + 5 * DAY_MS,
        lastReviewedAt: NOW.getTime() - 10 * DAY_MS,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]
    const { toSave } = reconcileReviewCards(existing, revised, NOW)
    expect(toSave).toHaveLength(1)
    expect(toSave[0].front).toBe('注意力机制（修订）')
    expect(toSave[0].back).toBe('新定义')
    expect(toSave[0].scheduling).toEqual({ intervalDays: 15, ease: 2.4, repetitions: 3 })
    expect(toSave[0].dueAt).toBe(NOW.getTime() + 5 * DAY_MS)
  })

  it('来源消失的卡被清出（术语删了/手记删了/整件删了）', () => {
    const existing: ReviewCard[] = [
      {
        id: glossaryTermCardId('k1', 'gone'),
        bookId: 'b1',
        source: 'glossary-term',
        front: '旧术语',
        back: '旧定义',
        scheduling: INITIAL_SCHEDULING,
        dueAt: NOW.getTime(),
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]
    const { toRemoveIds } = reconcileReviewCards(existing, [], NOW)
    expect(toRemoveIds).toEqual([glossaryTermCardId('k1', 'gone')])
  })

  it('读者移出的卡不复活', () => {
    const existing: ReviewCard[] = [
      {
        id: glossaryTermCardId('k1', 'g1'),
        bookId: 'b1',
        source: 'glossary-term',
        front: '注意力机制',
        back: '按相关性加权输入',
        scheduling: INITIAL_SCHEDULING,
        dueAt: NOW.getTime(),
        dismissed: true,
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]
    const { toSave, keptDismissedIds } = reconcileReviewCards(existing, desired.slice(0, 1), NOW)
    expect(toSave).toEqual([])
    expect(keptDismissedIds).toEqual([glossaryTermCardId('k1', 'g1')])
  })
})

describe('buildReviewQueue', () => {
  const base = {
    bookId: 'b1',
    source: 'annotation' as const,
    front: '句',
    back: '批注',
    scheduling: INITIAL_SCHEDULING,
    createdAt: NOW,
    updatedAt: NOW,
  }

  it('到期卡在前（按到期先后）、新卡殿后（受上限约束）', () => {
    const cards: ReviewCard[] = [
      { ...base, id: 'new2', dueAt: NOW.getTime() - 2000, createdAt: new Date(NOW.getTime() - 1000) },
      { ...base, id: 'due-late', dueAt: NOW.getTime() - 1000, lastReviewedAt: 1 },
      { ...base, id: 'due-early', dueAt: NOW.getTime() - 5000, lastReviewedAt: 1 },
      { ...base, id: 'new1', dueAt: NOW.getTime() - 3000, createdAt: new Date(NOW.getTime() - 9000) },
      { ...base, id: 'future', dueAt: NOW.getTime() + DAY_MS, lastReviewedAt: 1 },
      { ...base, id: 'dismissed', dueAt: NOW.getTime() - 1000, dismissed: true, lastReviewedAt: 1 },
    ]
    const queue = buildReviewQueue(cards, NOW, 2)
    expect(queue.map((c) => c.id)).toEqual(['due-early', 'due-late', 'new1', 'new2'])
  })

  it('新卡上限默认 ' + DAILY_NEW_CARD_LIMIT + ' 张', () => {
    const cards: ReviewCard[] = Array.from({ length: 30 }, (_, i) => ({
      ...base,
      id: `new-${i}`,
      dueAt: NOW.getTime() - 1000,
    }))
    expect(buildReviewQueue(cards, NOW).length).toBe(DAILY_NEW_CARD_LIMIT)
  })
})
