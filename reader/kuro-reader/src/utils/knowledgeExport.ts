/**
 * 知识产物导出：图谱转 Mermaid 源码、导图转 Markdown 大纲，
 * 以 .md 落盘嫁接 Obsidian/Notion（与手记导出同一哲学）。
 */

import type {
  CharacterGraphData,
  GlossaryData,
  KnowledgeArtifact,
  MindmapNodeData,
} from '@/types'
import { downloadTextFile, sanitizeFileName } from '@/utils/annotationExport'
import { hoistSingleBranchRoot } from '@/utils/mindmapLayout'

/** Mermaid 节点 id：中文不可靠，统一映射为 n1/n2…（保持连接度排序） */
export function buildCharacterGraphMermaid(graph: CharacterGraphData): string {
  const lines = ['flowchart LR']
  const idByNode = new Map<string, string>()
  graph.nodes.forEach((node, index) => {
    idByNode.set(node.id, `n${index + 1}`)
    const label = node.role ? `${node.name}｜${node.role}` : node.name
    lines.push(`  ${idByNode.get(node.id)}["${label.replace(/"/g, "'")}"]`)
  })
  for (const edge of graph.edges) {
    const source = idByNode.get(edge.source)
    const target = idByNode.get(edge.target)
    if (!source || !target) continue
    const relation = edge.relation.replace(/"/g, "'")
    lines.push(`  ${source} ---|"${relation}"| ${target}`)
  }
  return lines.join('\n')
}

/** 思维导图转 Markdown 嵌套列表（detail 作行内补注；根级先上提单片语料的中转层） */
export function buildMindmapMarkdown(node: MindmapNodeData, depth = 0): string {
  const normalized = depth === 0 ? hoistSingleBranchRoot(node) : node
  const indent = '  '.repeat(depth)
  const line = `${indent}- ${normalized.title}${normalized.detail ? `：${normalized.detail}` : ''}`
  const children = normalized.children ?? []
  if (children.length === 0) return line
  return [line, ...children.map((child) => buildMindmapMarkdown(child, depth + 1))].join('\n')
}

/** 章节/页位置标签（0 起索引 +1 展示；PDF 场景同构为页） */
function sourcePositionLabel(chapterIndex: number): string {
  return `第${chapterIndex + 1}章`
}

/** 图谱人物与关系清单（含出现章节与依据原文——图谱与原文的书面联系） */
export function buildGraphReferenceLists(graph: CharacterGraphData): string {
  const nameById = new Map(graph.nodes.map((node) => [node.id, node.name]))
  const characters = graph.nodes
    .map((node) => {
      const parts = [node.name]
      if (node.role) parts.push(node.role)
      const chapters = node.chapters?.length
        ? `（出现：${node.chapters.map((i) => sourcePositionLabel(i)).join('、')}）`
        : ''
      return `- ${parts.join('｜')}${node.description ? `：${node.description}` : ''}${chapters}`
    })
    .join('\n')
  const relations = graph.edges
    .map((edge) => {
      const source = nameById.get(edge.source) ?? edge.source
      const target = nameById.get(edge.target) ?? edge.target
      const evidence = edge.evidence ? `「${edge.evidence.quote}」（${sourcePositionLabel(edge.evidence.chapterIndex)}）` : ''
      const chapters = !edge.evidence && edge.chapters?.length
        ? edge.chapters.map((i) => sourcePositionLabel(i)).join('、')
        : ''
      const position = [evidence, chapters].filter(Boolean).join(' / ')
      return `| ${source} | ${edge.relation} | ${target} | ${position || '—'} |`
    })
    .join('\n')
  return [
    '## 人物',
    '',
    characters,
    '',
    '## 关系',
    '',
    '| 人物 | 关系 | 人物 | 原文依据 |',
    '|---|---|---|---|',
    relations,
  ].join('\n')
}

/** 术语卡转 Markdown 列表（定义 + 依据原文与位置） */
export function buildGlossaryMarkdown(data: GlossaryData): string {
  return data.terms
    .map((term) => {
      const lines = [`- **${term.term}**${term.definition ? `：${term.definition}` : ''}`]
      if (term.evidence) {
        lines.push(`  - 原文：「${term.evidence.quote}」（${sourcePositionLabel(term.evidence.chapterIndex)}）`)
      } else if (term.chapters && term.chapters.length > 0) {
        lines.push(`  - 位置：${term.chapters.map((i) => sourcePositionLabel(i)).join('、')}`)
      }
      return lines.join('\n')
    })
    .join('\n')
}

/** 知识产物 → Markdown 文本（含来源书名与生成时间头） */
export function buildKnowledgeArtifactMarkdown(bookTitle: string, artifact: KnowledgeArtifact): string {
  const header = [
    `# ${artifact.title}`,
    '',
    `> 来源：《${bookTitle}》 · ${new Date(artifact.updatedAt).toLocaleString('zh-CN')}`,
    '',
  ]
  if (artifact.type === 'character-graph') {
    const graph = artifact.data as CharacterGraphData
    return [
      ...header,
      '```mermaid',
      buildCharacterGraphMermaid(graph),
      '```',
      '',
      buildGraphReferenceLists(graph),
      '',
    ].join('\n')
  }
  if (artifact.type === 'glossary') {
    return [...header, '## 术语速查', '', buildGlossaryMarkdown(artifact.data as GlossaryData), ''].join('\n')
  }
  return [...header, buildMindmapMarkdown(artifact.data as MindmapNodeData), ''].join('\n')
}

/** 一站式导出：构建 Markdown 并触发下载 */
export function exportKnowledgeArtifactMarkdown(bookTitle: string, artifact: KnowledgeArtifact): void {
  const content = buildKnowledgeArtifactMarkdown(bookTitle, artifact)
  downloadTextFile(`《${sanitizeFileName(bookTitle)}》${sanitizeFileName(artifact.title)}.md`, content)
}
