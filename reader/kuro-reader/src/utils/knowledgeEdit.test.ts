import { describe, it, expect } from 'vitest'

import type {
  CharacterGraphData,
  GlossaryData,
  MindmapNodeData,
  PaperBriefData,
} from '@/types'
import {
  patchGraphNode,
  removeGraphNode,
  setGraphNodeVerified,
  patchGraphEdge,
  removeGraphEdge,
  setGraphEdgeVerified,
  patchGlossaryTerm,
  removeGlossaryTerm,
  setGlossaryTermVerified,
  patchBriefTldr,
  patchBriefEntryText,
  removeBriefEntry,
  setBriefEntryVerified,
  patchMindmapNode,
  removeMindmapNode,
  setMindmapNodeVerified,
} from '@/utils/knowledgeEdit'

const GRAPH: CharacterGraphData = {
  nodes: [
    { id: 'n1', name: '林晚', role: '主角' },
    { id: 'n2', name: '沈青', role: '对手' },
    { id: 'n3', name: '阿七', role: '配角' },
  ],
  edges: [
    { source: 'n1', target: 'n2', relation: '宿敌', description: '旧案对立' },
    { source: 'n1', target: 'n3', relation: '同门' },
    { source: 'n2', target: 'n3', relation: '雇佣' },
  ],
}

describe('图谱修订', () => {
  it('patchGraphNode 改表述字段并保留其他字段', () => {
    const next = patchGraphNode(GRAPH, 'n1', { name: '林晚舟', description: '镖师' })
    expect(next.nodes[0]).toEqual({ id: 'n1', name: '林晚舟', role: '主角', description: '镖师' })
    expect(next.nodes[1]).toBe(GRAPH.nodes[1])
    expect(GRAPH.nodes[0].name).toBe('林晚') // 入参不变
  })

  it('removeGraphNode 级联删掉两端任一为本节点的边', () => {
    const next = removeGraphNode(GRAPH, 'n1')
    expect(next.nodes.map((n) => n.id)).toEqual(['n2', 'n3'])
    expect(next.edges.map((e) => e.relation)).toEqual(['雇佣'])
  })

  it('已校验章：true 记 true，false 抹掉（不留假值）', () => {
    const marked = setGraphNodeVerified(GRAPH, 'n2', true)
    expect(marked.nodes[1].verified).toBe(true)
    expect(setGraphNodeVerified(marked, 'n2', false).nodes[1].verified).toBeUndefined()
  })

  it('边按下标改/删/校验', () => {
    const patched = patchGraphEdge(GRAPH, 0, { relation: '宿敌', description: '灭门旧案' })
    expect(patched.edges[0].description).toBe('灭门旧案')
    expect(removeGraphEdge(GRAPH, 1).edges.map((e) => e.relation)).toEqual(['宿敌', '雇佣'])
    expect(setGraphEdgeVerified(GRAPH, 2, true).edges[2].verified).toBe(true)
  })
})

const GLOSSARY: GlossaryData = {
  terms: [
    { id: 'g1', term: '注意力机制', definition: '按相关性加权输入' },
    { id: 'g2', term: '消融实验' },
  ],
}

describe('术语卡修订', () => {
  it('改术语与定义、删术语', () => {
    const patched = patchGlossaryTerm(GLOSSARY, 'g2', { definition: '逐项拆除验证贡献' })
    expect(patched.terms[1].definition).toBe('逐项拆除验证贡献')
    expect(removeGlossaryTerm(GLOSSARY, 'g1').terms.map((t) => t.id)).toEqual(['g2'])
  })

  it('已校验章', () => {
    expect(setGlossaryTermVerified(GLOSSARY, 'g1', true).terms[0].verified).toBe(true)
  })
})

const BRIEF: PaperBriefData = {
  tldr: '提出 X 方法解决 Y 问题',
  contributions: [{ point: '提出 X 方法', strength: 'experiment' }],
  limitations: [{ point: '只在英文语料验证' }],
  questions: [{ question: '基线是否公平' }],
}

describe('速览卡修订', () => {
  it('改 TL;DR', () => {
    expect(patchBriefTldr(BRIEF, '新的速览').tldr).toBe('新的速览')
  })

  it('改条目文字：贡献写 point、疑问写 question', () => {
    const c = patchBriefEntryText(BRIEF, 'contributions', 0, '提出 X 方法（改进版）')
    expect(c.contributions[0].point).toBe('提出 X 方法（改进版）')
    expect(c.contributions[0].strength).toBe('experiment')
    const q = patchBriefEntryText(BRIEF, 'questions', 0, '基线公平吗？')
    expect(q.questions[0].question).toBe('基线公平吗？')
  })

  it('删条目与已校验章', () => {
    expect(removeBriefEntry(BRIEF, 'limitations', 0).limitations).toEqual([])
    expect(setBriefEntryVerified(BRIEF, 'limitations', 0, true).limitations[0].verified).toBe(true)
  })
})

const MINDMAP: MindmapNodeData = {
  title: '全书大纲',
  children: [
    { title: '开篇', detail: '雨夜' },
    {
      title: '转折',
      children: [{ title: '旧案重提', detail: '第三卷' }],
    },
  ],
}

describe('导图修订', () => {
  it('按路径改节点（含根）', () => {
    const root = patchMindmapNode(MINDMAP, [], { title: '全书大纲（修订）' })
    expect(root.title).toBe('全书大纲（修订）')
    const deep = patchMindmapNode(MINDMAP, [1, 0], { detail: '第三卷后半' })
    expect(deep.children?.[1].children?.[0].detail).toBe('第三卷后半')
    expect(MINDMAP.children?.[1].children?.[0].detail).toBe('第三卷') // 入参不变
  })

  it('删分支连同子树；删根是误用不生效', () => {
    const next = removeMindmapNode(MINDMAP, [1])
    expect(next.children?.map((c) => c.title)).toEqual(['开篇'])
    expect(removeMindmapNode(MINDMAP, [])).toBe(MINDMAP)
  })

  it('越界路径原样返回', () => {
    expect(patchMindmapNode(MINDMAP, [9], { title: '无' })).toBe(MINDMAP)
  })

  it('已校验章', () => {
    expect(setMindmapNodeVerified(MINDMAP, [0], true).children?.[0].verified).toBe(true)
  })
})
