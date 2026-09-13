/**
 * 知识产物合并纯函数：把 AI 分块返回的原始片段收敛为最终图谱/导图数据。
 *
 * 分块策略决定了同一人物/主题会出现在多个片段里——
 * 图谱按「归一化人名」合并节点、按「端点对+关系」合并边；
 * 导图按「块标签建分支」拼接。全部为无副作用纯函数，便于单测。
 *
 * 图谱回原文链路：片段经 stampPartialChapters 打上分块覆盖章节 →
 * 合并时并集进节点/边的 chapters；边上的 AI 证据摘句（evidenceQuote）
 * 由 resolveGraphEvidence 在真实章节文本中校验定位为可跳转坐标。
 */

import type {
  CharacterEdge,
  CharacterGraphData,
  CharacterNode,
  ContributionStrength,
  GlossaryData,
  GlossaryTerm,
  KnowledgeEvidence,
  MindmapNodeData,
  PaperBriefData,
} from '@/types'

/** 人物名归一化：去空白与常见标点，作为节点稳定 id（merge 去重键） */
export function normalizeCharacterName(name: string): string {
  return name.replace(/[\s\u3000·•‧・.,，。:：;；!！?？、"'“”‘’()（）【】[]<>《》-]/g, '')
}

/** AI 单块返回的人物图谱原始形态（chapters 由调用方按分块覆盖章节补盖） */
export interface GraphPartial {
  characters: { name: string; role?: string; description?: string; chapters?: number[] }[]
  relationships: {
    source: string
    target: string
    relation: string
    description?: string
    /** 逐字摘自片段正文的依据短句（未经本地校验） */
    evidenceQuote?: string
    chapters?: number[]
  }[]
}

/** 把分块覆盖章节盖到片段的人物与关系上（图谱回原文的章节并集来源） */
export function stampPartialChapters(partial: GraphPartial, chapterIndexes: number[]): GraphPartial {
  return {
    characters: partial.characters.map((character) => ({ ...character, chapters: chapterIndexes })),
    relationships: partial.relationships.map((relationship) => ({ ...relationship, chapters: chapterIndexes })),
  }
}

/** 安全上限：防模型失控输出把图谱撑爆 */
export const MAX_GRAPH_NODES = 48
export const MAX_GRAPH_EDGES = 160

const NAME_MAX_CHARS = 24
const ROLE_MAX_CHARS = 40
const DESC_MAX_CHARS = 120
const RELATION_MAX_CHARS = 16
const EVIDENCE_MAX_CHARS = 40
/** 证据偏移占比保留小数位（URL 友好且粒度足够） */
const EVIDENCE_RATIO_DECIMALS = 4

function clip(text: string | undefined, max: number): string | undefined {
  const trimmed = (text ?? '').trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, max)
}

/**
 * 校验并规整 AI 返回的图谱片段。
 * 关系两端的 source/target 必须能对上本片段的人物名（防幻觉），
 * 对不上的人名尝试按归一化匹配回填，仍失败则丢弃该关系。
 * 人物为空或形状不对返回 null（该块作废）。
 */
export function parseGraphPartial(raw: unknown): GraphPartial | null {
  if (raw == null || typeof raw !== 'object') return null
  const source = raw as { characters?: unknown; relationships?: unknown }
  if (!Array.isArray(source.characters) || source.characters.length === 0) return null

  const nameById = new Map<string, string>()
  const characters: GraphPartial['characters'] = []
  for (const item of source.characters) {
    if (item == null || typeof item !== 'object') continue
    const record = item as { name?: unknown; role?: unknown; description?: unknown }
    if (typeof record.name !== 'string') continue
    const name = record.name.trim().slice(0, NAME_MAX_CHARS)
    if (!name) continue
    const id = normalizeCharacterName(name)
    if (!id) continue
    if (!nameById.has(id)) {
      nameById.set(id, name)
      characters.push({
        name,
        role: clip(String(record.role ?? ''), ROLE_MAX_CHARS),
        description: clip(String(record.description ?? ''), DESC_MAX_CHARS),
      })
    }
  }
  if (characters.length === 0) return null

  const relationships: GraphPartial['relationships'] = []
  const knownIds = new Set(nameById.keys())
  const resolveId = (value: string): string | null => {
    const id = normalizeCharacterName(value)
    if (!id) return null
    if (knownIds.has(id)) return id
    return null
  }
  if (Array.isArray(source.relationships)) {
    for (const item of source.relationships) {
      if (item == null || typeof item !== 'object') continue
      const record = item as {
        source?: unknown
        target?: unknown
        relation?: unknown
        description?: unknown
        evidence?: unknown
      }
      if (typeof record.source !== 'string' || typeof record.target !== 'string') continue
      if (typeof record.relation !== 'string') continue
      const relation = record.relation.trim().slice(0, RELATION_MAX_CHARS)
      if (!relation) continue
      const sourceId = resolveId(record.source)
      const targetId = resolveId(record.target)
      if (!sourceId || !targetId || sourceId === targetId) continue
      relationships.push({
        source: nameById.get(sourceId) ?? record.source,
        target: nameById.get(targetId) ?? record.target,
        relation,
        description: clip(String(record.description ?? ''), DESC_MAX_CHARS),
        evidenceQuote: clip(String(record.evidence ?? ''), EVIDENCE_MAX_CHARS),
      })
    }
  }

  return { characters, relationships }
}

interface MergedNode {
  id: string
  name: string
  role?: string
  description?: string
  degree: number
  chapters: Set<number>
}

/** 合并中间态边：evidenceQuote 是待校验的 AI 摘句；evidence 是已定位的坐标
 *  （增量合并时自基底产物直通，resolveGraphEvidence 不再重复校验） */
export interface InterimGraphEdge extends Omit<CharacterEdge, 'evidence'> {
  evidenceQuote?: string
  evidence?: KnowledgeEvidence
}

export interface InterimGraphData {
  nodes: CharacterNode[]
  edges: InterimGraphEdge[]
}

function unionChapters(target: Set<number>, source: number[] | undefined): void {
  for (const index of source ?? []) {
    if (Number.isInteger(index) && index >= 0) target.add(index)
  }
}

/**
 * 合并多块图谱片段：同名节点合并（首个非空 role/description 胜出、章节并集），
 * 无向边按「端点对+关系」去重（章节并集、首个非空证据摘句胜出）；
 * 超上限时按连接度保留核心人物。
 * base 为增量合并的基底（现有图谱）：旧节点/边先入列，新片段只是并进来——
 * 旧边的 evidence 坐标原样直通（resolveGraphEvidence 跳过已定位边），不被新摘句改写。
 * 返回中间态图谱——新产生的 evidenceQuote 需经 resolveGraphEvidence 校验后才落库。
 */
export function mergeCharacterGraphs(partials: GraphPartial[], base?: InterimGraphData): InterimGraphData {
  const nodesById = new Map<string, MergedNode>()
  const edgeCount = new Map<string, InterimGraphEdge>()

  if (base) {
    for (const node of base.nodes) {
      const chapters = new Set<number>()
      unionChapters(chapters, node.chapters)
      nodesById.set(node.id, {
        id: node.id,
        name: node.name,
        role: node.role,
        description: node.description,
        degree: 0,
        chapters,
      })
    }
    for (const edge of base.edges) {
      const pairKey = [edge.source, edge.target].sort().join('→')
      edgeCount.set(`${pairKey}|${edge.relation.trim()}`, { ...edge })
    }
  }

  for (const partial of partials) {
    for (const character of partial.characters) {
      const id = normalizeCharacterName(character.name)
      if (!id) continue
      const existing = nodesById.get(id)
      if (existing) {
        existing.role = existing.role ?? character.role
        existing.description = existing.description ?? character.description
        unionChapters(existing.chapters, character.chapters)
      } else {
        const chapters = new Set<number>()
        unionChapters(chapters, character.chapters)
        nodesById.set(id, { id, name: character.name, role: character.role, description: character.description, degree: 0, chapters })
      }
    }
    for (const rel of partial.relationships) {
      const sourceId = normalizeCharacterName(rel.source)
      const targetId = normalizeCharacterName(rel.target)
      if (!sourceId || !targetId || sourceId === targetId) continue
      if (!nodesById.has(sourceId) || !nodesById.has(targetId)) continue
      const pairKey = [sourceId, targetId].sort().join('→')
      const edgeKey = `${pairKey}|${rel.relation.trim()}`
      const existing = edgeCount.get(edgeKey)
      if (existing) {
        existing.description = existing.description ?? rel.description
        existing.evidenceQuote = existing.evidenceQuote ?? rel.evidenceQuote
        const mergedChapters = new Set([...(existing.chapters ?? []), ...(rel.chapters ?? [])])
        if (mergedChapters.size > 0) existing.chapters = [...mergedChapters].sort((a, b) => a - b)
      } else {
        const chapters = new Set<number>()
        unionChapters(chapters, rel.chapters)
        edgeCount.set(edgeKey, {
          source: sourceId,
          target: targetId,
          relation: rel.relation,
          description: rel.description,
          evidenceQuote: rel.evidenceQuote,
          ...(chapters.size > 0 ? { chapters: [...chapters].sort((a, b) => a - b) } : {}),
        })
      }
    }
  }

  let edges = [...edgeCount.values()]
  for (const edge of edges) {
    nodesById.get(edge.source)!.degree += 1
    nodesById.get(edge.target)!.degree += 1
  }

  // 连接度排序 → 截断核心人物 → 剔除断边（不与任何保留人物相连的边）
  const keptNodes = [...nodesById.values()].sort((a, b) => b.degree - a.degree).slice(0, MAX_GRAPH_NODES)
  if (keptNodes.length < nodesById.size) {
    const keptIds = new Set(keptNodes.map((n) => n.id))
    edges = edges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target))
  }
  if (edges.length > MAX_GRAPH_EDGES) {
    edges = edges
      .map((edge) => ({
        edge,
        weight: (nodesById.get(edge.source)?.degree ?? 0) + (nodesById.get(edge.target)?.degree ?? 0),
      }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_GRAPH_EDGES)
      .map((entry) => entry.edge)
  }

  const maxDegree = Math.max(1, ...keptNodes.map((n) => n.degree))
  const nodes: CharacterNode[] = keptNodes.map((node) => ({
    id: node.id,
    name: node.name,
    role: node.role,
    description: node.description,
    weight: node.degree / maxDegree,
    ...(node.chapters.size > 0 ? { chapters: [...node.chapters].sort((a, b) => a - b) } : {}),
  }))

  return { nodes, edges }
}

/**
 * 证据摘句本地校验：在真实章节文本中逐字定位（防 AI 幻觉编造引文）。
 * 优先在边记录的章节内找，找不到再全书扫描；仍未命中则丢弃证据
 * （chapters 章级回退仍在）。命中则换算为可跳转坐标（章节 + 偏移占比）。
 * 已携带 evidence 坐标的边（增量合并自基底直通）原样保留，不重复校验、坐标不漂移。
 */
export function resolveGraphEvidence(
  graph: InterimGraphData,
  chapterTexts: readonly string[] = []
): CharacterGraphData {
  const edges: CharacterEdge[] = graph.edges.map((edge) => {
    if (edge.evidence) {
      const { evidenceQuote: _stale, ...located } = edge
      return located
    }
    const quote = edge.evidenceQuote?.trim()
    const { evidenceQuote: _dropped, ...rest } = edge
    const evidence = quote ? resolveEvidenceQuote(quote, edge.chapters, chapterTexts) : null
    return evidence ? { ...rest, evidence } : rest
  })
  return { nodes: graph.nodes, edges }
}

function locateQuote(
  quote: string,
  preferredChapters: number[] | undefined,
  chapterTexts: readonly string[]
): { chapterIndex: number; offset: number } | null {
  const order = [...(preferredChapters ?? [])]
  for (let i = 0; i < chapterTexts.length; i++) {
    if (!order.includes(i)) order.push(i)
  }
  for (const chapterIndex of order) {
    const text = chapterTexts[chapterIndex]
    if (!text) continue
    const offset = text.indexOf(quote)
    if (offset >= 0) return { chapterIndex, offset }
  }
  return null
}

/** 证据摘句 → 可跳转坐标（图谱关系边与术语卡定义共用）；未在原文命中返回 null（防幻觉引文） */
export function resolveEvidenceQuote(
  quote: string,
  preferredChapters: number[] | undefined,
  chapterTexts: readonly string[]
): KnowledgeEvidence | null {
  const located = locateQuote(quote, preferredChapters, chapterTexts)
  if (!located) return null
  const chapterLength = chapterTexts[located.chapterIndex]?.length ?? 0
  const ratio = chapterLength > 0 ? located.offset / chapterLength : 0
  return {
    quote,
    chapterIndex: located.chapterIndex,
    offsetRatio: Number(ratio.toFixed(EVIDENCE_RATIO_DECIMALS)),
  }
}

// ---- 概念术语卡（学术视角） ----

/** 术语卡安全上限 */
export const MAX_GLOSSARY_TERMS = 60

const GLOSSARY_TERM_MAX_CHARS = 24
const GLOSSARY_DEF_MAX_CHARS = 80

/** AI 单块返回的术语卡原始形态（chapters 由调用方按分块覆盖章节补盖） */
export interface GlossaryPartial {
  terms: { term: string; definition?: string; evidenceQuote?: string; chapters?: number[] }[]
}

/** 术语名归一化（去空白与标点，作为去重键） */
export function normalizeTermName(term: string): string {
  return term.replace(/[\s\u3000·•（）()【】[]<>《》"“”'‘’.,，。:：;；!！?？、-]/g, '')
}

/** 校验并规整 AI 返回的术语片段；无有效术语返回 null */
export function parseGlossaryPartial(raw: unknown): GlossaryPartial | null {
  if (raw == null || typeof raw !== 'object') return null
  const source = raw as { terms?: unknown }
  if (!Array.isArray(source.terms) || source.terms.length === 0) return null

  const terms: GlossaryPartial['terms'] = []
  for (const item of source.terms) {
    if (item == null || typeof item !== 'object') continue
    const record = item as { term?: unknown; definition?: unknown; evidence?: unknown }
    if (typeof record.term !== 'string') continue
    const term = record.term.trim().slice(0, GLOSSARY_TERM_MAX_CHARS)
    if (!term || !normalizeTermName(term)) continue
    terms.push({
      term,
      definition: clip(String(record.definition ?? ''), GLOSSARY_DEF_MAX_CHARS),
      evidenceQuote: clip(String(record.evidence ?? ''), EVIDENCE_MAX_CHARS),
    })
  }
  return terms.length > 0 ? { terms } : null
}

/** 把分块覆盖章节盖到术语片段上 */
export function stampGlossaryChapters(partial: GlossaryPartial, chapterIndexes: number[]): GlossaryPartial {
  return {
    terms: partial.terms.map((entry) => ({ ...entry, chapters: chapterIndexes })),
  }
}

/** 术语卡合并中间态：evidenceQuote 是待校验的 AI 摘句；evidence 是已定位坐标
 *  （增量合并自基底直通，resolveGlossaryEvidence 不再重复校验） */
export interface InterimGlossaryData {
  terms: (GlossaryTerm & { evidenceQuote?: string; evidence?: KnowledgeEvidence })[]
}

/**
 * 合并多块术语片段：同术语并集章节、首个非空定义/证据胜出；按首现章节排序并截断。
 * base 为增量合并的基底（现有术语卡）：旧术语先入列（含已定位证据直通），新片段只是并进来。
 */
export function mergeGlossary(partials: GlossaryPartial[], base?: InterimGlossaryData): InterimGlossaryData {
  const byId = new Map<string, InterimGlossaryData['terms'][number]>()
  for (const term of base?.terms ?? []) {
    byId.set(term.id, { ...term })
  }
  for (const partial of partials) {
    for (const entry of partial.terms) {
      const id = normalizeTermName(entry.term)
      if (!id) continue
      const existing = byId.get(id)
      if (existing) {
        existing.definition = existing.definition ?? entry.definition
        existing.evidenceQuote = existing.evidenceQuote ?? entry.evidenceQuote
        const merged = new Set([...(existing.chapters ?? []), ...(entry.chapters ?? [])])
        if (merged.size > 0) existing.chapters = [...merged].sort((a, b) => a - b)
      } else {
        const chapters = [...new Set(entry.chapters ?? [])].sort((a, b) => a - b)
        byId.set(id, {
          id,
          term: entry.term,
          definition: entry.definition,
          ...(chapters.length > 0 ? { chapters } : {}),
          ...(entry.evidenceQuote ? { evidenceQuote: entry.evidenceQuote } : {}),
        })
      }
    }
  }

  const terms = [...byId.values()]
    .sort((a, b) => (a.chapters?.[0] ?? 0) - (b.chapters?.[0] ?? 0) || a.term.localeCompare(b.term, 'zh'))
    .slice(0, MAX_GLOSSARY_TERMS)
  return { terms }
}

/** 术语卡证据校验（与图谱同规则：逐字命中才落坐标，失败留章级回退）；
 *  已携带 evidence 坐标的术语（增量基底直通）原样保留，不重复校验、坐标不漂移 */
export function resolveGlossaryEvidence(
  glossary: InterimGlossaryData,
  chapterTexts: readonly string[] = []
): GlossaryData {
  const terms = glossary.terms.map((term) => {
    if (term.evidence) {
      const { evidenceQuote: _stale, ...located } = term
      return located
    }
    const quote = term.evidenceQuote?.trim()
    const { evidenceQuote: _dropped, ...rest } = term
    const evidence = quote ? resolveEvidenceQuote(quote, term.chapters, chapterTexts) : null
    return evidence ? { ...rest, evidence } : rest
  })
  return { terms }
}

/** 术语卡是否为空 */
export function isGlossaryEmpty(glossary: GlossaryData): boolean {
  return glossary.terms.length === 0
}

/** 图谱是否为空（无人物或无任何关系） */
export function isGraphEmpty(graph: CharacterGraphData): boolean {
  return graph.nodes.length === 0 || graph.edges.length === 0
}

/** 思维导图片段安全上限 */
export const MAX_MINDMAP_DEPTH = 4
export const MAX_MINDMAP_CHILDREN = 10
export const MAX_MINDMAP_BRANCHES = 24

const MINDMAP_TITLE_MAX_CHARS = 30
const MINDMAP_NODE_TITLE_MAX_CHARS = 24
const MINDMAP_DETAIL_MAX_CHARS = 80

/** 递归校验 AI 返回的导图片段：限深、限宽、剪掉形状不对的子树 */
export function parseMindmapPartial(raw: unknown): MindmapNodeData | null {
  const root = normalizeMindmapNode(raw, 0)
  if (!root) return null
  return root
}

function normalizeMindmapNode(raw: unknown, depth: number): MindmapNodeData | null {
  if (raw == null || typeof raw !== 'object' || depth >= MAX_MINDMAP_DEPTH) return null
  const record = raw as { title?: unknown; detail?: unknown; children?: unknown }
  if (typeof record.title !== 'string') return null
  const title = record.title.trim().slice(0, MINDMAP_NODE_TITLE_MAX_CHARS)
  if (!title) return null

  const children: MindmapNodeData[] = []
  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      if (children.length >= MAX_MINDMAP_CHILDREN) break
      const normalized = normalizeMindmapNode(child, depth + 1)
      if (normalized) children.push(normalized)
    }
  }

  const detail = clip(String(record.detail ?? ''), MINDMAP_DETAIL_MAX_CHARS)
  return detail || children.length > 0 ? { title, detail, ...(children.length > 0 ? { children } : {}) } : { title }
}

/**
 * 合并导图分支：根节点为书名，每块大纲成为一条主分支（label 即分支名，如「第1-3章」）。
 * base 为增量合并的基底（现有导图）：旧主分支前置保留，新分支接在后面（总量仍受上限约束）。
 */
export function mergeMindmapBranches(
  bookTitle: string,
  branches: { label: string; tree: MindmapNodeData }[],
  base?: MindmapNodeData
): MindmapNodeData {
  const root: MindmapNodeData = {
    title: bookTitle.trim().slice(0, MINDMAP_TITLE_MAX_CHARS) || '全书大纲',
    children: [...(base?.children ?? [])],
  }
  for (const branch of branches.slice(0, Math.max(0, MAX_MINDMAP_BRANCHES - root.children!.length))) {
    const label = branch.label.trim().slice(0, MINDMAP_NODE_TITLE_MAX_CHARS) || branch.tree.title
    const hasChildren = (branch.tree.children?.length ?? 0) > 0
    root.children!.push(
      hasChildren
        ? { title: label, children: branch.tree.children }
        : { title: label, children: [{ title: branch.tree.title }] }
    )
  }
  return root
}

/** 导图是否为空（无分支） */
export function isMindmapEmpty(node: MindmapNodeData): boolean {
  return (node.children?.length ?? 0) === 0
}

/** 统计导图总节点数（体积提示用） */
export function countMindmapNodes(node: MindmapNodeData): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countMindmapNodes(child), 0)
}

// ---- 论文速览（学术研究型读者：读前分流 + 批判性阅读） ----

/** 论文速览片段安全上限 */
export const MAX_BRIEF_CONTRIBUTIONS = 6
export const MAX_BRIEF_LIMITATIONS = 6
export const MAX_BRIEF_QUESTIONS = 6

const BRIEF_TLDR_MAX_CHARS = 160
const BRIEF_POINT_MAX_CHARS = 120
const BRIEF_QUESTION_MAX_CHARS = 160

const BRIEF_STRENGTHS: ContributionStrength[] = ['experiment', 'theory', 'partial', 'claim']

interface BriefEntryLike {
  point?: unknown
  question?: unknown
  strength?: unknown
  evidence?: unknown
  chapters?: number[]
  evidenceQuote?: string
}

/** 论文速览中间态：各条目 evidenceQuote 待校验，evidence 为增量基底直通的已定位坐标 */
export interface InterimBriefData {
  tldr: string
  contributions: { point: string; strength: ContributionStrength; evidenceQuote?: string; evidence?: KnowledgeEvidence; chapters?: number[] }[]
  limitations: { point: string; evidenceQuote?: string; evidence?: KnowledgeEvidence; chapters?: number[] }[]
  questions: { question: string; evidenceQuote?: string; evidence?: KnowledgeEvidence; chapters?: number[] }[]
}

function normalizeBriefEntry(
  entry: BriefEntryLike,
  textField: 'point' | 'question',
  textMax: number
): { text: string; strength?: ContributionStrength; evidenceQuote?: string } | null {
  const raw = entry[textField]
  if (typeof raw !== 'string') return null
  const text = raw.trim().slice(0, textMax)
  if (!text) return null
  const strength =
    textField === 'point' && BRIEF_STRENGTHS.includes(entry.strength as ContributionStrength)
      ? (entry.strength as ContributionStrength)
      : undefined
  const quote = typeof entry.evidence === 'string' ? clip(entry.evidence, EVIDENCE_MAX_CHARS) : undefined
  return { text, ...(strength ? { strength } : {}), ...(quote ? { evidenceQuote: quote } : {}) }
}

/** 校验并规整 AI 返回的论文速览片段；TL;DR 与三类条目全空返回 null */
export function parseBriefPartial(raw: unknown): InterimBriefData | null {
  if (raw == null || typeof raw !== 'object') return null
  const source = raw as { tldr?: unknown; contributions?: unknown; limitations?: unknown; questions?: unknown }
  const tldr = typeof source.tldr === 'string' ? source.tldr.trim().slice(0, BRIEF_TLDR_MAX_CHARS) : ''

  const collect = (list: unknown, textField: 'point' | 'question', textMax: number) => {
    const out: NonNullable<ReturnType<typeof normalizeBriefEntry>>[] = []
    if (Array.isArray(list)) {
      for (const item of list) {
        if (item == null || typeof item !== 'object') continue
        const normalized = normalizeBriefEntry(item as BriefEntryLike, textField, textMax)
        if (normalized) out.push(normalized)
        if (out.length >= MAX_BRIEF_CONTRIBUTIONS) break
      }
    }
    return out
  }

  const collectedContributions = collect(source.contributions, 'point', BRIEF_POINT_MAX_CHARS)
  const collectedLimitations = collect(source.limitations, 'point', BRIEF_POINT_MAX_CHARS)
  const collectedQuestions = collect(source.questions, 'question', BRIEF_QUESTION_MAX_CHARS)

  if (!tldr && collectedContributions.length === 0 && collectedLimitations.length === 0 && collectedQuestions.length === 0) {
    return null
  }

  const toContributions = (): InterimBriefData['contributions'] =>
    collectedContributions.map((entry) => ({
      point: entry.text,
      strength: entry.strength ?? 'claim',
      ...(entry.evidenceQuote ? { evidenceQuote: entry.evidenceQuote } : {}),
    }))
  const toLimitations = (): InterimBriefData['limitations'] =>
    collectedLimitations.map((entry) => ({
      point: entry.text,
      ...(entry.evidenceQuote ? { evidenceQuote: entry.evidenceQuote } : {}),
    }))
  const toQuestions = (): InterimBriefData['questions'] =>
    collectedQuestions.map((entry) => ({
      question: entry.text,
      ...(entry.evidenceQuote ? { evidenceQuote: entry.evidenceQuote } : {}),
    }))

  return {
    tldr,
    contributions: toContributions(),
    limitations: toLimitations(),
    questions: toQuestions(),
  }
}

/** 把分块覆盖章节盖到速览条目上（章节级回退的来源） */
export function stampBriefChapters(brief: InterimBriefData, chapterIndexes: number[]): InterimBriefData {
  const stamp = <T extends { chapters?: number[] }>(entry: T): T => ({ ...entry, chapters: chapterIndexes })
  return {
    tldr: brief.tldr,
    contributions: brief.contributions.map(stamp),
    limitations: brief.limitations.map(stamp),
    questions: brief.questions.map(stamp),
  }
}

/** 条目文本归一化（增量合并的跨块去重键） */
function briefEntryKey(text: string): string {
  return text.replace(/\s+/g, '')
}

/**
 * 合并多块论文速览：TL;DR 取首个非空；三类条目按文本去重、章节并集、首个非空证据胜出。
 * base 为增量合并的基底（现有速览卡）：旧条目先入列（含已定位证据直通）。
 */
export function mergeBriefs(partials: InterimBriefData[], base?: InterimBriefData): InterimBriefData {
  const tldr = base?.tldr ?? ''
  const mergeSection = <T extends { chapters?: number[]; evidenceQuote?: string; evidence?: KnowledgeEvidence }>(
    baseEntries: T[],
    freshLists: T[][],
    keyOf: (entry: T) => string,
    max: number
  ): T[] => {
    const byKey = new Map<string, T>()
    for (const entry of baseEntries) byKey.set(keyOf(entry), { ...entry })
    for (const list of freshLists) {
      for (const entry of list) {
        const key = keyOf(entry)
        const existing = byKey.get(key)
        if (existing) {
          existing.evidenceQuote = existing.evidenceQuote ?? entry.evidenceQuote
          const merged = new Set([...(existing.chapters ?? []), ...(entry.chapters ?? [])])
          if (merged.size > 0) existing.chapters = [...merged].sort((a, b) => a - b)
        } else {
          byKey.set(key, { ...entry })
        }
      }
    }
    return [...byKey.values()].slice(0, max)
  }

  return {
    tldr,
    contributions: mergeSection(
      base?.contributions ?? [],
      partials.map((p) => p.contributions),
      (e) => briefEntryKey(e.point),
      MAX_BRIEF_CONTRIBUTIONS
    ),
    limitations: mergeSection(
      base?.limitations ?? [],
      partials.map((p) => p.limitations),
      (e) => briefEntryKey(e.point),
      MAX_BRIEF_LIMITATIONS
    ),
    questions: mergeSection(
      base?.questions ?? [],
      partials.map((p) => p.questions),
      (e) => briefEntryKey(e.question),
      MAX_BRIEF_QUESTIONS
    ),
  }
}

/** 速览证据校验：已定位条目直通；AI 摘句逐字命中才落坐标，失败留章级回退 */
export function resolveBriefEvidence(
  brief: InterimBriefData,
  chapterTexts: readonly string[] = []
): PaperBriefData {
  const resolveEntry = <T extends { chapters?: number[]; evidenceQuote?: string; evidence?: KnowledgeEvidence }>(
    entry: T
  ): Omit<T, 'evidenceQuote'> => {
    if (entry.evidence) {
      const { evidenceQuote: _stale, ...located } = entry
      return located
    }
    const quote = entry.evidenceQuote?.trim()
    const { evidenceQuote: _dropped, ...rest } = entry
    const evidence = quote ? resolveEvidenceQuote(quote, entry.chapters, chapterTexts) : null
    return evidence ? { ...rest, evidence } : rest
  }
  return {
    tldr: brief.tldr,
    contributions: brief.contributions.map((e) => resolveEntry(e)),
    limitations: brief.limitations.map((e) => resolveEntry(e)),
    questions: brief.questions.map((e) => resolveEntry(e)),
  }
}

/** 论文速览是否为空 */
export function isBriefEmpty(brief: PaperBriefData): boolean {
  return !brief.tldr && brief.contributions.length === 0 && brief.limitations.length === 0 && brief.questions.length === 0
}
