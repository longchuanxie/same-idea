import { describe, it, expect } from 'vitest'

import type { Annotation, Book, KnowledgeArtifact, Tag } from '@/types'
import { globalSearch } from '@/utils/globalSearch'

const makeBook = (overrides: Partial<Book> & { id: string; title: string }): Book => ({
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 1,
  chapters: [],
  addedAt: new Date('2026-08-01'),
  isFavorite: false,
  ...overrides,
})

const TAGS: Tag[] = [
  { id: 't1', name: '权力', color: '#B54529', bookIds: ['b1'], createdAt: new Date() },
]

const BOOKS: Book[] = [
  makeBook({ id: 'b1', title: '冰与火之歌', author: '马丁', tags: ['t1'] }),
  makeBook({ id: 'b2', title: '论文A', author: '张三', format: 'text' }),
]

const makeAnnotation = (overrides: Partial<Annotation> & { id: string }): Annotation => ({
  bookId: 'b1',
  chapterIndex: 0,
  chapterTitle: '第一章',
  selectedText: '权力的游戏开始了',
  note: '',
  startOffset: 0,
  endOffset: 8,
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
  ...overrides,
})

const ANNOTATIONS: Annotation[] = [
  makeAnnotation({ id: 'a1', note: '卷首点题' }),
  makeAnnotation({
    id: 'a2',
    bookId: 'b2',
    selectedText: 'attention is all you need',
    note: '标题即论点',
  }),
  // 孤儿手记：书已移出馆藏
  makeAnnotation({ id: 'a3', bookId: 'gone', selectedText: '权力的另一种写法' }),
]

const makeArtifact = (
  overrides: Partial<KnowledgeArtifact> & { id: string; type: KnowledgeArtifact['type'] }
): KnowledgeArtifact => ({
  bookId: 'b1',
  title: '人物关系图谱',
  data: { nodes: [], edges: [] },
  generator: 'ai',
  createdAt: new Date('2026-08-01'),
  updatedAt: new Date('2026-08-01'),
  ...overrides,
})

const ARTIFACTS: KnowledgeArtifact[] = [
  makeArtifact({
    id: 'k1',
    type: 'character-graph',
    bookId: 'b1',
    data: {
      nodes: [
        { id: 'n1', name: '提利昂', role: '谋士', description: '知晓权力的秘密' },
      ],
      edges: [{ source: 'n1', target: 'n1', relation: '自述' }],
    },
  }),
  makeArtifact({
    id: 'k2',
    type: 'glossary',
    bookId: 'b2',
    data: {
      terms: [{ id: 'g1', term: '注意力机制', definition: '按相关性加权输入' }],
    },
  }),
  makeArtifact({
    id: 'k3',
    type: 'mindmap',
    bookId: 'b2',
    data: { title: '全书大纲', children: [{ title: '注意力', detail: '核心章节' }] },
  }),
  makeArtifact({
    id: 'k4',
    type: 'paper-brief',
    bookId: 'b2',
    data: {
      tldr: '用注意力机制取代循环结构',
      contributions: [{ point: '提出注意力机制', strength: 'experiment' }],
      limitations: [],
      questions: [],
    },
  }),
]

describe('globalSearch', () => {
  it('书名命中馆藏（沿用元数据检索）', () => {
    const result = globalSearch({ query: '冰与火', books: BOOKS, tags: TAGS, annotations: [], artifacts: [] })
    expect(result.books.map((b) => b.id)).toEqual(['b1'])
  })

  it('手记命中划线或批注全文，书已删时 book 缺省', () => {
    const result = globalSearch({ query: '权力的', books: BOOKS, tags: TAGS, annotations: ANNOTATIONS, artifacts: [] })
    expect(result.annotationHits.map((h) => h.annotation.id)).toEqual(['a1', 'a3'])
    expect(result.annotationHits[0].book?.id).toBe('b1')
    expect(result.annotationHits[1].book).toBeUndefined()
  })

  it('知识件按条目内容命中：节点/术语/导图/速览各归其位', () => {
    const result = globalSearch({ query: '注意力', books: BOOKS, tags: TAGS, annotations: [], artifacts: ARTIFACTS })
    expect(result.knowledgeHits.map((h) => h.artifact.id)).toEqual(['k2', 'k3', 'k4'])
    expect(result.knowledgeHits[0].snippet).toBe('术语 · 注意力机制')
    expect(result.knowledgeHits[0].book?.id).toBe('b2')
    expect(result.knowledgeHits[2].matchCount).toBe(2) // 速览命中 TL;DR 与贡献点
  })

  it('图谱关系描述可命中（边文本含两端人名）', () => {
    const result = globalSearch({ query: '秘密', books: BOOKS, tags: TAGS, annotations: [], artifacts: ARTIFACTS })
    expect(result.knowledgeHits.map((h) => h.artifact.id)).toEqual(['k1'])
    expect(result.knowledgeHits[0].snippet).toBe('人物 · 提利昂')
  })

  it('英文命中大小写不敏感', () => {
    const result = globalSearch({ query: 'all you need', books: BOOKS, tags: TAGS, annotations: ANNOTATIONS, artifacts: [] })
    expect(result.annotationHits.map((h) => h.annotation.id)).toEqual(['a2'])
  })

  it('标签筛选作用于馆藏与手记，知识件不参与', () => {
    const result = globalSearch({ query: '', books: BOOKS, tags: TAGS, annotations: ANNOTATIONS, artifacts: ARTIFACTS, selectedTagId: 't1' })
    expect(result.books.map((b) => b.id)).toEqual(['b1'])
    expect(result.knowledgeHits).toEqual([])
  })

  it('空 query 且无标签时三路全空', () => {
    const result = globalSearch({ query: '  ', books: BOOKS, tags: TAGS, annotations: ANNOTATIONS, artifacts: ARTIFACTS })
    expect(result).toEqual({ books: [], annotationHits: [], knowledgeHits: [] })
  })

  it('标签名也可作为关键词命中馆藏', () => {
    const result = globalSearch({ query: '权力', books: BOOKS, tags: TAGS, annotations: [], artifacts: [] })
    expect(result.books.map((b) => b.id)).toEqual(['b1'])
  })
})
