/**
 * 知识件手工修订的纯函数操作集（修订模式消费）。
 *
 * AI 生成的条目允许读者改错、删错、盖「已校验」章：
 * 全部函数不改动入参，返回结构共享的新数据（map/filter 浅拷贝），
 * 由 useKnowledgeStore.updateArtifactData 落库并累计 manualEditCount。
 * 编辑只动表述性字段，evidence/chapters 原样保留——回原文链路不受修订影响。
 */

import type {
  CharacterEdge,
  CharacterGraphData,
  CharacterNode,
  GlossaryData,
  GlossaryTerm,
  MindmapNodeData,
  PaperBriefData,
} from '@/types'

// ---------- 人物/概念图谱 ----------

export function patchGraphNode(
  data: CharacterGraphData,
  nodeId: string,
  patch: Partial<Pick<CharacterNode, 'name' | 'role' | 'description'>>
): CharacterGraphData {
  return {
    ...data,
    nodes: data.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
  }
}

/** 删节点并级联删掉两端任一为本节点的边（留边不留点是断链） */
export function removeGraphNode(data: CharacterGraphData, nodeId: string): CharacterGraphData {
  return {
    nodes: data.nodes.filter((node) => node.id !== nodeId),
    edges: data.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
  }
}

export function setGraphNodeVerified(
  data: CharacterGraphData,
  nodeId: string,
  verified: boolean
): CharacterGraphData {
  return {
    ...data,
    nodes: data.nodes.map((node) =>
      node.id === nodeId ? { ...node, verified: verified || undefined } : node
    ),
  }
}

export function patchGraphEdge(
  data: CharacterGraphData,
  edgeIndex: number,
  patch: Partial<Pick<CharacterEdge, 'relation' | 'description'>>
): CharacterGraphData {
  return {
    ...data,
    edges: data.edges.map((edge, index) => (index === edgeIndex ? { ...edge, ...patch } : edge)),
  }
}

export function removeGraphEdge(data: CharacterGraphData, edgeIndex: number): CharacterGraphData {
  return { ...data, edges: data.edges.filter((_, index) => index !== edgeIndex) }
}

export function setGraphEdgeVerified(
  data: CharacterGraphData,
  edgeIndex: number,
  verified: boolean
): CharacterGraphData {
  return {
    ...data,
    edges: data.edges.map((edge, index) =>
      index === edgeIndex ? { ...edge, verified: verified || undefined } : edge
    ),
  }
}

// ---------- 概念术语卡 ----------

export function patchGlossaryTerm(
  data: GlossaryData,
  termId: string,
  patch: Partial<Pick<GlossaryTerm, 'term' | 'definition'>>
): GlossaryData {
  return {
    terms: data.terms.map((term) => (term.id === termId ? { ...term, ...patch } : term)),
  }
}

export function removeGlossaryTerm(data: GlossaryData, termId: string): GlossaryData {
  return { terms: data.terms.filter((term) => term.id !== termId) }
}

export function setGlossaryTermVerified(
  data: GlossaryData,
  termId: string,
  verified: boolean
): GlossaryData {
  return {
    terms: data.terms.map((term) =>
      term.id === termId ? { ...term, verified: verified || undefined } : term
    ),
  }
}

// ---------- 论文速览卡 ----------

/** 速览卡的三类条目分区（条目无稳定 id，按下标寻址——每次修订后整件回读，下标不过夜） */
export type BriefSection = 'contributions' | 'limitations' | 'questions'

export function patchBriefTldr(data: PaperBriefData, tldr: string): PaperBriefData {
  return { ...data, tldr }
}

/** 改条目文字：贡献/局限写 point，疑问写 question（分区内部字段名不同，对外统一 text） */
export function patchBriefEntryText(
  data: PaperBriefData,
  section: BriefSection,
  index: number,
  text: string
): PaperBriefData {
  return {
    ...data,
    [section]: data[section].map((entry, i) => {
      if (i !== index) return entry
      return section === 'questions' ? { ...entry, question: text } : { ...entry, point: text }
    }),
  }
}

export function removeBriefEntry(
  data: PaperBriefData,
  section: BriefSection,
  index: number
): PaperBriefData {
  return { ...data, [section]: data[section].filter((_, i) => i !== index) }
}

export function setBriefEntryVerified(
  data: PaperBriefData,
  section: BriefSection,
  index: number,
  verified: boolean
): PaperBriefData {
  return {
    ...data,
    [section]: data[section].map((entry, i) =>
      i === index ? { ...entry, verified: verified || undefined } : entry
    ),
  }
}

// ---------- 思维导图 ----------

/** 导图节点寻址：从根出发逐层 children 下标（[] 即根；根是导图名，只可改不可删） */
export type MindmapNodePath = number[]

function mapMindmapAtPath(
  node: MindmapNodeData,
  path: MindmapNodePath,
  map: (node: MindmapNodeData) => MindmapNodeData
): MindmapNodeData {
  if (path.length === 0) return map(node)
  const [head, ...rest] = path
  const children = node.children ?? []
  if (head < 0 || head >= children.length) return node
  return {
    ...node,
    children: children.map((child, index) =>
      index === head ? mapMindmapAtPath(child, rest, map) : child
    ),
  }
}

export function patchMindmapNode(
  data: MindmapNodeData,
  path: MindmapNodePath,
  patch: Partial<Pick<MindmapNodeData, 'title' | 'detail'>>
): MindmapNodeData {
  return mapMindmapAtPath(data, path, (node) => ({ ...node, ...patch }))
}

/** 删分支（连同整棵子树）；删根是误用，原样返回 */
export function removeMindmapNode(data: MindmapNodeData, path: MindmapNodePath): MindmapNodeData {
  if (path.length === 0) return data
  const parentPath = path.slice(0, -1)
  const childIndex = path[path.length - 1]
  return mapMindmapAtPath(data, parentPath, (parent) => ({
    ...parent,
    children: (parent.children ?? []).filter((_, index) => index !== childIndex),
  }))
}

export function setMindmapNodeVerified(
  data: MindmapNodeData,
  path: MindmapNodePath,
  verified: boolean
): MindmapNodeData {
  return mapMindmapAtPath(data, path, (node) => ({ ...node, verified: verified || undefined }))
}
