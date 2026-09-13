import { describe, it, expect } from 'vitest'

import type { KnowledgeArtifact } from '@/types'
import {
  MERGED_GRAPH_MAX_NODES,
  booksHavingKind,
  mergeGlossaries,
  mergeGraphs,
  mergedEdgeKey,
} from '@/utils/crossBookGraph'

const NOW = new Date('2026-09-13')

const graphArtifact = (
  id: string,
  bookId: string,
  data: { nodes: { id: string; name?: string; weight?: number; verified?: boolean }[]; edges: { source: string; target: string; relation: string }[] },
  type: KnowledgeArtifact['type'] = 'character-graph'
): KnowledgeArtifact =>
  ({
    id,
    bookId,
    type,
    title: '人物关系图谱',
    data: {
      nodes: data.nodes.map((n) => ({ name: n.id, ...n })),
      edges: data.edges,
    },
    generator: 'ai',
    createdAt: NOW,
    updatedAt: NOW,
  }) as KnowledgeArtifact

describe('mergeGraphs', () => {
  it('同名节点跨书归并：权重求和、校验章任一书盖过即有', () => {
    const merged = mergeGraphs([
      graphArtifact('a1', 'b1', {
        nodes: [
          { id: '林晚', weight: 2 },
          { id: '沈青' },
        ],
        edges: [{ source: '林晚', target: '沈青', relation: '宿敌' }],
      }),
      graphArtifact('a2', 'b2', {
        nodes: [
          { id: '林晚', weight: 3, verified: true },
          { id: '阿七' },
        ],
        edges: [{ source: '林晚', target: '阿七', relation: '同门' }],
      }),
    ])
    const lin = merged.graph.nodes.find((n) => n.id === '林晚')
    expect(lin).toMatchObject({ name: '林晚', weight: 5, verified: true })
    expect(merged.nodeBooks.get('林晚')).toHaveLength(2)
    expect(merged.nodeBooks.get('沈青')).toHaveLength(1)
    expect(merged.graph.edges).toHaveLength(2)
  })

  it('无向边去重：端点对排序后同关系跨书合并，书归并记两本', () => {
    const key = mergedEdgeKey('A', 'B', '盟友')
    expect(mergedEdgeKey('B', 'A', '盟友')).toBe(key)
    const merged = mergeGraphs([
      graphArtifact('a1', 'b1', {
        nodes: [{ id: 'A' }, { id: 'B' }],
        edges: [{ source: 'A', target: 'B', relation: '盟友' }],
      }),
      graphArtifact('a2', 'b2', {
        nodes: [{ id: 'A' }, { id: 'B' }],
        edges: [{ source: 'B', target: 'A', relation: '盟友' }],
      }),
    ])
    expect(merged.graph.edges).toHaveLength(1)
    expect(merged.edgeBooks.get(key)).toEqual(['b1', 'b2'])
  })

  it('节点超上限按跨书权重取前排，被裁端点的边同步裁掉', () => {
    const nodes = Array.from({ length: MERGED_GRAPH_MAX_NODES + 5 }, (_, i) => ({
      id: `节点${i}`,
      weight: i < 3 ? 100 : 1, // 前三个是重节点
    }))
    const merged = mergeGraphs([
      graphArtifact('a1', 'b1', {
        nodes,
        edges: [
          { source: '节点0', target: '节点1', relation: '盟友' },
          { source: '节点0', target: `节点${MERGED_GRAPH_MAX_NODES + 4}`, relation: '断边' },
        ],
      }),
    ])
    expect(merged.graph.nodes.length).toBe(MERGED_GRAPH_MAX_NODES)
    expect(merged.graph.nodes.some((n) => n.id === '节点0')).toBe(true)
    expect(merged.graph.nodes.some((n) => n.id === `节点${MERGED_GRAPH_MAX_NODES + 4}`)).toBe(false)
    expect(merged.graph.edges).toHaveLength(1)
    expect(merged.edgeBooks.has(mergedEdgeKey('节点0', `节点${MERGED_GRAPH_MAX_NODES + 4}`, '断边'))).toBe(false)
  })
})

describe('mergeGlossaries', () => {
  const glossaryArtifact = (id: string, bookId: string, terms: { id: string; term: string; definition?: string }[]): KnowledgeArtifact =>
    ({
      id,
      bookId,
      type: 'glossary',
      title: '概念术语卡',
      data: { terms: terms.map((t) => ({ ...t })) },
      generator: 'ai',
      createdAt: NOW,
      updatedAt: NOW,
    }) as KnowledgeArtifact

  it('同 id 术语跨书并排，跨书在前、按书数降序', () => {
    const merged = mergeGlossaries([
      glossaryArtifact('g1', 'b1', [
        { id: '注意力', term: '注意力机制', definition: '书一定义' },
        { id: '独有', term: '书一独有术语' },
      ]),
      glossaryArtifact('g2', 'b2', [
        { id: '注意力', term: '注意力机制', definition: '书二定义' },
        { id: '另一', term: '书二独有' },
      ]),
      glossaryArtifact('g3', 'b3', [{ id: '注意力', term: '注意力机制', definition: '书三定义' }]),
    ])
    expect(merged[0]).toMatchObject({ termId: '注意力', bookCount: 3 })
    expect(merged[0].entries.map((e) => e.definition)).toEqual(['书一定义', '书二定义', '书三定义'])
    expect(merged.filter((t) => t.bookCount >= 2)).toHaveLength(1)
    expect(merged).toHaveLength(3)
  })
})

describe('booksHavingKind', () => {
  it('按类型统计不同书数', () => {
    const artifacts = [
      graphArtifact('a1', 'b1', { nodes: [], edges: [] }),
      graphArtifact('a2', 'b1', { nodes: [], edges: [] }),
      graphArtifact('a3', 'b2', { nodes: [], edges: [] }, 'glossary'),
    ]
    expect(booksHavingKind(artifacts, 'character-graph')).toEqual(['b1'])
    expect(booksHavingKind(artifacts, 'glossary')).toEqual(['b2'])
    expect(booksHavingKind(artifacts, 'mindmap')).toEqual([])
  })
})
