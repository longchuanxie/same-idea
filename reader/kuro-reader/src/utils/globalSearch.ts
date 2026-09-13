/**
 * 全库统一检索（Search 页消费）：馆藏 / 手记 / 知识件三路聚合。
 *
 * 知识库工具的地基——"那句话在哪本书里"必须一次搜到：
 * 书按元数据（沿用旧逻辑），手记搜划线与批注全文，
 * 知识件按条目级内容（实体/关系/术语/导图节点/速览要点）。
 * 纯函数、客户端即时计算，命中全部可深链回原处。
 */

import type {
  Annotation,
  Book,
  CharacterGraphData,
  GlossaryData,
  KnowledgeArtifact,
  MindmapNodeData,
  PaperBriefData,
  Tag,
} from '@/types'

export interface GlobalSearchInput {
  query: string
  books: Book[]
  tags: Tag[]
  annotations: Annotation[]
  artifacts: KnowledgeArtifact[]
  /** 标签筛选：馆藏与手记消费（手记带标签；知识件无标签不参与） */
  selectedTagId?: string | null
}

export interface AnnotationSearchHit {
  annotation: Annotation
  /** 书已移出馆藏时缺省（结果行置灰不可跳） */
  book?: Book
}

export interface KnowledgeSearchHit {
  artifact: KnowledgeArtifact
  book?: Book
  /** 第一条命中文本（页面截断展示） */
  snippet: string
  /** 命中条数 */
  matchCount: number
}

export interface GlobalSearchResult {
  books: Book[]
  annotationHits: AnnotationSearchHit[]
  knowledgeHits: KnowledgeSearchHit[]
}

function matchesQuery(text: string | undefined, q: string): boolean {
  return text != null && text.toLowerCase().includes(q)
}

function searchBooks(input: GlobalSearchInput, q: string): Book[] {
  const tagById = new Map(input.tags.map((t) => [t.id, t]))
  return input.books.filter((b) => {
    const hitsQuery =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genres.some((g) => g.toLowerCase().includes(q)) ||
      (Array.isArray(b.tags) ? b.tags : []).some((tid) => {
        const tag = tagById.get(tid)
        return tag != null && tag.name.toLowerCase().includes(q)
      })
    const hitsTag =
      !input.selectedTagId || (Array.isArray(b.tags) ? b.tags : []).includes(input.selectedTagId)
    return hitsQuery && hitsTag
  })
}

function searchAnnotations(input: GlobalSearchInput, q: string): AnnotationSearchHit[] {
  const bookById = new Map(input.books.map((b) => [b.id, b]))
  return input.annotations
    .filter((ann) => {
      const hitsQuery = !q || matchesQuery(ann.selectedText, q) || matchesQuery(ann.note, q)
      const hitsTag =
        !input.selectedTagId || (ann.tagIds ?? []).includes(input.selectedTagId)
      return hitsQuery && hitsTag
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((ann) => ({ annotation: ann, book: bookById.get(ann.bookId) }))
}

/** 把一件知识件拍平成可检索的条目文本；返回 [完整检索文本, 展示摘要] 对 */
function artifactEntries(artifact: KnowledgeArtifact): [string, string][] {
  if (artifact.type === 'character-graph' || artifact.type === 'concept-graph') {
    const graph = artifact.data as CharacterGraphData
    const nameById = new Map(graph.nodes.map((n) => [n.id, n.name]))
    const entity = artifact.type === 'concept-graph' ? '概念' : '人物'
    const nodeEntries = graph.nodes.map(
      (n) => [`${n.name} ${n.role ?? ''} ${n.description ?? ''}`, `${entity} · ${n.name}`] as [string, string]
    )
    const edgeEntries = graph.edges.map(
      (e) =>
        [
          `${nameById.get(e.source) ?? ''} ${e.relation} ${nameById.get(e.target) ?? ''} ${e.description ?? ''}`,
          `${nameById.get(e.source) ?? '?'} —${e.relation}— ${nameById.get(e.target) ?? '?'}`,
        ] as [string, string]
    )
    return [...nodeEntries, ...edgeEntries]
  }
  if (artifact.type === 'glossary') {
    const glossary = artifact.data as GlossaryData
    return glossary.terms.map(
      (t) => [`${t.term} ${t.definition ?? ''}`, `术语 · ${t.term}`] as [string, string]
    )
  }
  if (artifact.type === 'mindmap') {
    const entries: [string, string][] = []
    const walk = (node: MindmapNodeData): void => {
      entries.push([`${node.title} ${node.detail ?? ''}`, `导图 · ${node.title}`])
      node.children?.forEach(walk)
    }
    walk(artifact.data as MindmapNodeData)
    return entries
  }
  const brief = artifact.data as PaperBriefData
  return [
    [brief.tldr ?? '', '速览 · TL;DR'] as [string, string],
    ...brief.contributions.map(
      (c) => [c.point, `贡献 · ${c.point}`] as [string, string]
    ),
    ...brief.limitations.map((l) => [l.point, `局限 · ${l.point}`] as [string, string]),
    ...brief.questions.map((qu) => [qu.question, `疑问 · ${qu.question}`] as [string, string]),
  ]
}

function searchKnowledge(input: GlobalSearchInput, q: string): KnowledgeSearchHit[] {
  if (!q) return []
  const bookById = new Map(input.books.map((b) => [b.id, b]))
  const hits: KnowledgeSearchHit[] = []
  for (const artifact of input.artifacts) {
    let matchCount = 0
    let snippet = ''
    for (const [haystack, summary] of artifactEntries(artifact)) {
      if (!matchesQuery(haystack, q)) continue
      matchCount += 1
      if (!snippet) snippet = summary
    }
    if (matchCount > 0) {
      hits.push({ artifact, book: bookById.get(artifact.bookId), snippet, matchCount })
    }
  }
  return hits.sort(
    (a, b) => new Date(b.artifact.updatedAt).getTime() - new Date(a.artifact.updatedAt).getTime()
  )
}

export function globalSearch(input: GlobalSearchInput): GlobalSearchResult {
  const q = input.query.trim().toLowerCase()
  // 空关键词且未选标签 = 没有检索意图，三路全空（页面落回默认视图）
  if (!q && !input.selectedTagId) {
    return { books: [], annotationHits: [], knowledgeHits: [] }
  }
  return {
    books: searchBooks(input, q),
    annotationHits: searchAnnotations(input, q),
    knowledgeHits: searchKnowledge(input, q),
  }
}
