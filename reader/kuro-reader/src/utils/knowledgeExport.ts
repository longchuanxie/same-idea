/**
 * 知识产物导出：图谱转 Mermaid 源码、导图转 Markdown 大纲，
 * 以 .md 落盘嫁接 Obsidian/Notion（与手记导出同一哲学）。
 */

import { t } from '@/i18n';
import type {
  ChapterSummaryData,
  CharacterGraphData,
  GlossaryData,
  KnowledgeArtifact,
  MindmapNodeData,
  PaperBriefData,
  StoryBeatsData,
} from '@/types'
import { downloadTextFile, sanitizeFileName } from '@/utils/annotationExport'
import { beatRoleMeta } from '@/utils/beatRoles'
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
  return t('第{{arg1}}章', { arg1: chapterIndex + 1 })
}

/** 贡献点证据强度的展示标签（与 PaperBriefView 一致） */
const STRENGTH_LABELS: Record<PaperBriefData['contributions'][number]['strength'], string> = {
  experiment: t('实验支撑'),
  theory: t('理论证明'),
  partial: t('部分支撑'),
  claim: t('仅声称'),
}

/** 图谱人物与关系清单（含出现章节与依据原文——图谱与原文的书面联系）。
 *  entityLabel 随图谱种类变化（人物/概念）。 */
export function buildGraphReferenceLists(
  graph: CharacterGraphData,
  entityLabel: string = t('人物')
): string {
  const nameById = new Map(graph.nodes.map((node) => [node.id, node.name]))
  const characters = graph.nodes
    .map((node) => {
      const parts = [node.name]
      if (node.role) parts.push(node.role)
      const chapters = node.chapters?.length
        ? t('（出现：{{arg1}}）', { arg1: node.chapters.map((i) => sourcePositionLabel(i)).join('、') })
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
    `## ${entityLabel}`,
    '',
    characters,
    '',
    t('## 关系'),
    '',
    t('| {{entityLabel}} | 关系 | {{arg1}} | 原文依据 |', { entityLabel: entityLabel, arg1: entityLabel }),
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
        lines.push(t('  - 原文：「{{arg1}}」（{{arg2}}）', { arg1: term.evidence.quote, arg2: sourcePositionLabel(term.evidence.chapterIndex) }))
      } else if (term.chapters && term.chapters.length > 0) {
        lines.push(t('  - 位置：{{arg1}}', { arg1: term.chapters.map((i) => sourcePositionLabel(i)).join('、') }))
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
    t('> 来源：《{{bookTitle}}》 · {{arg1}}', { bookTitle: bookTitle, arg1: new Date(artifact.updatedAt).toLocaleString('zh-CN') }),
    '',
  ]
  if (artifact.type === 'character-graph' || artifact.type === 'concept-graph') {
    const graph = artifact.data as CharacterGraphData
    return [
      ...header,
      '```mermaid',
      buildCharacterGraphMermaid(graph),
      '```',
      '',
      buildGraphReferenceLists(graph, artifact.type === 'concept-graph' ? t('概念') : t('人物')),
      '',
    ].join('\n')
  }
  if (artifact.type === 'glossary') {
    return [...header, t('## 术语速查'), '', buildGlossaryMarkdown(artifact.data as GlossaryData), ''].join('\n')
  }
  if (artifact.type === 'paper-brief') {
    const brief = artifact.data as PaperBriefData
    const lines: string[] = [...header]
    if (brief.tldr) lines.push(`> ${brief.tldr}`, '')
    if (brief.contributions.length > 0) {
      lines.push(t('## 贡献点'), '')
      for (const entry of brief.contributions) {
        const evidence = entry.evidence ? t('「{{arg1}}」（第{{arg2}}章）', { arg1: entry.evidence.quote, arg2: entry.evidence.chapterIndex + 1 }) : ''
        lines.push(`- **[${STRENGTH_LABELS[entry.strength]}]** ${entry.point}${evidence}`)
      }
      lines.push('')
    }
    if (brief.limitations.length > 0) {
      lines.push(t('## 局限与软肋'), '')
      for (const entry of brief.limitations) {
        const evidence = entry.evidence ? t('「{{arg1}}」（第{{arg2}}章）', { arg1: entry.evidence.quote, arg2: entry.evidence.chapterIndex + 1 }) : ''
        lines.push(`- ${entry.point}${evidence}`)
      }
      lines.push('')
    }
    if (brief.questions.length > 0) {
      lines.push(t('## 审稿人视角的疑问'), '')
      for (const entry of brief.questions) {
        lines.push(`1. ${entry.question}`)
      }
      lines.push('')
    }
    return lines.join('\n')
  }
  if (artifact.type === 'story-beats') {
    const { beats } = artifact.data as StoryBeatsData
    const lines: string[] = [...header, t('## 叙事节拍'), '']
    for (const beat of beats) {
      const evidence = beat.evidence ? `「${beat.evidence.quote}」` : ''
      lines.push(
        t('- **{{arg1}}** · 第{{arg2}}章 —— {{title}}{{arg3}}{{evidence}}', { arg1: beatRoleMeta(beat.role).label, arg2: beat.chapterIndex + 1, title: beat.title, arg3: beat.detail ? `：${beat.detail}` : '', evidence: evidence })
      )
    }
    lines.push('')
    return lines.join('\n')
  }
  if (artifact.type === 'chapter-summary') {
    const summary = artifact.data as ChapterSummaryData
    const lines: string[] = [...header]
    for (const section of summary.sections) {
      if (section.points.length === 0) continue
      lines.push(`## ${section.label}`, '')
      for (const point of section.points) {
        lines.push(`- ${point.text}`)
      }
      lines.push('')
    }
    if (summary.closing) {
      lines.push(t('> 此刻处境：{{arg1}}', { arg1: summary.closing }), '')
    }
    return lines.join('\n')
  }
  return [...header, buildMindmapMarkdown(artifact.data as MindmapNodeData), ''].join('\n')
}

/** 一站式导出：构建 Markdown 并触发下载 */
export function exportKnowledgeArtifactMarkdown(bookTitle: string, artifact: KnowledgeArtifact): void {
  const content = buildKnowledgeArtifactMarkdown(bookTitle, artifact)
  downloadTextFile(`《${sanitizeFileName(bookTitle)}》${sanitizeFileName(artifact.title)}.md`, content)
}
