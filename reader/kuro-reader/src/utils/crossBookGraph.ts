/**
 * 跨书实体合并（跨书图谱页消费）：把多本书的同类知识件并成一张网。
 *
 * 节点按稳定 id 归一（生成端已保证同名实体同 id），边按端点对+关系去重
 * （语义无向）；每书原貌保留在 nodeBooks/edgeBooks 里供侧卡按书展开回原文。
 * 术语对照同理：同 id 术语跨书并排，分歧本身就是信息。
 */

import type {
  CharacterEdge,
  CharacterGraphData,
  CharacterNode,
  GlossaryTerm,
  KnowledgeArtifact,
  KnowledgeEvidence,
} from '@/types'

/** 跨书网节点上限（与知识库合并防失控截断同量级：超了按权重取前排） */
export const MERGED_GRAPH_MAX_NODES = 48

export interface MergedNodeSource {
  artifactId: string
  bookId: string
  /** 该书里的原始节点（身份/小传/出现章节都在这） */
  node: CharacterNode
}

export interface MergedGraph {
  /** 可直接喂给 CharacterGraphView 的合并图 */
  graph: CharacterGraphData
  /** 节点 id → 各书原貌（侧卡按书展开） */
  nodeBooks: Map<string, MergedNodeSource[]>
  /** 边 key → 声明该边的书 bookId 列表 */
  edgeBooks: Map<string, string[]>
}

/** 边去重键：端点对排序（语义无向）+ 关系名 */
export function mergedEdgeKey(source: string, target: string, relation: string): string {
  const [a, b] = [source, target].sort()
  return `${a}|${b}|${relation}`
}

/** 同类图谱件归并为一跨书网；输入应为同一种 type 的产物（调用方过滤） */
export function mergeGraphs(artifacts: KnowledgeArtifact[]): MergedGraph {
  const nodeBooks = new Map<string, MergedNodeSource[]>()
  const weightOf = new Map<string, number>()
  const nameOf = new Map<string, string>()
  const verifiedOf = new Map<string, boolean>()
  const edgeBooks = new Map<string, string[]>()
  const edgeByKey = new Map<string, CharacterEdge>()

  for (const artifact of artifacts) {
    const data = artifact.data as CharacterGraphData
    for (const node of data.nodes) {
      const list = nodeBooks.get(node.id) ?? []
      list.push({ artifactId: artifact.id, bookId: artifact.bookId, node })
      nodeBooks.set(node.id, list)
      weightOf.set(node.id, (weightOf.get(node.id) ?? 0) + (node.weight ?? 0))
      if (!nameOf.has(node.id)) nameOf.set(node.id, node.name)
      if (node.verified) verifiedOf.set(node.id, true)
    }
    for (const edge of data.edges) {
      const key = mergedEdgeKey(edge.source, edge.target, edge.relation)
      if (!edgeByKey.has(key)) edgeByKey.set(key, edge)
      const books = edgeBooks.get(key) ?? []
      if (!books.includes(artifact.bookId)) books.push(artifact.bookId)
      edgeBooks.set(key, books)
    }
  }

  // 节点上限：按跨书总权重取前排，孤点殿后
  const keptIds = new Set(
    [...nodeBooks.keys()]
      .sort((a, b) => (weightOf.get(b) ?? 0) - (weightOf.get(a) ?? 0))
      .slice(0, MERGED_GRAPH_MAX_NODES)
  )
  const nodes: CharacterNode[] = [...keptIds].map((id) => ({
    id,
    name: nameOf.get(id) ?? id,
    weight: weightOf.get(id) || undefined,
    verified: verifiedOf.get(id) || undefined,
  }))
  // 端点被裁掉的边一并裁掉，边书归同步清理
  const keptEdges = new Map(
    [...edgeByKey.entries()].filter(
      ([, edge]) => keptIds.has(edge.source) && keptIds.has(edge.target)
    )
  )
  for (const key of [...edgeBooks.keys()]) {
    if (!keptEdges.has(key)) edgeBooks.delete(key)
  }

  return { graph: { nodes, edges: [...keptEdges.values()] }, nodeBooks, edgeBooks }
}

export interface MergedGlossaryEntry {
  artifactId: string
  bookId: string
  definition?: string
  evidence?: KnowledgeEvidence
}

export interface MergedGlossaryTerm {
  termId: string
  term: string
  entries: MergedGlossaryEntry[]
  /** 出现的不同书数（≥2 即跨书术语） */
  bookCount: number
}

/** 术语卡跨书对照：同 id 术语并排（跨书在前、按书数降序，其后按术语名） */
export function mergeGlossaries(artifacts: KnowledgeArtifact[]): MergedGlossaryTerm[] {
  const terms = new Map<string, { term: string; entries: MergedGlossaryEntry[]; books: Set<string> }>()
  for (const artifact of artifacts) {
    const glossary = artifact.data as { terms: GlossaryTerm[] }
    for (const term of glossary.terms) {
      const bucket = terms.get(term.id) ?? { term: term.term, entries: [], books: new Set<string>() }
      if (bucket.entries.length === 0) bucket.term = term.term
      bucket.entries.push({
        artifactId: artifact.id,
        bookId: artifact.bookId,
        definition: term.definition,
        evidence: term.evidence,
      })
      bucket.books.add(artifact.bookId)
      terms.set(term.id, bucket)
    }
  }
  return [...terms.entries()]
    .map(([termId, bucket]) => ({
      termId,
      term: bucket.term,
      entries: bucket.entries,
      bookCount: bucket.books.size,
    }))
    .sort((a, b) => {
      if (a.bookCount !== b.bookCount) return b.bookCount - a.bookCount
      return a.term.localeCompare(b.term, 'zh-CN')
    })
}

/** 拥有某类知识件的不同书数（跨书视图的可用性判断：≥2 才有意义） */
export function booksHavingKind(artifacts: KnowledgeArtifact[], type: KnowledgeArtifact['type']): string[] {
  return [...new Set(artifacts.filter((a) => a.type === type).map((a) => a.bookId))]
}
