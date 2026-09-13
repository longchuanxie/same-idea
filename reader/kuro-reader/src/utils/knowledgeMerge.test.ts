import { describe, expect, it } from 'vitest'

import type { MindmapNodeData } from '@/types'
import {
  MAX_GRAPH_NODES,
  mergeBriefs,
  parseBriefPartial,
  resolveBriefEvidence,
  mergeCharacterGraphs,
  mergeMindmapBranches,
  parseGraphPartial,
  parseMindmapPartial,
  mergeGlossary,
  parseGlossaryPartial,
  resolveGlossaryEvidence,
  resolveGraphEvidence,
  stampGlossaryChapters,
  stampPartialChapters,
} from '@/utils/knowledgeMerge'

describe('parseGraphPartial', () => {
  it('规整合法片段：剪裁超长字段、剔除空名', () => {
    const partial = parseGraphPartial({
      characters: [
        { name: '张三', role: '主角', description: '一个很长的'.repeat(30) },
        { name: '  ', role: 'x' },
        'not-an-object',
      ],
      relationships: [{ source: '张三', target: '李四', relation: '敌对' }],
    })
    expect(partial).not.toBeNull()
    expect(partial!.characters.map((c) => c.name)).toEqual(['张三'])
    // 李四不在 characters 里 → 关系被丢弃（防幻觉）
    expect(partial!.relationships).toEqual([])
    expect(partial!.characters[0].description!.length).toBeLessThanOrEqual(120)
  })

  it('无人物/形状不对返回 null', () => {
    expect(parseGraphPartial(null)).toBeNull()
    expect(parseGraphPartial({ characters: [] })).toBeNull()
    expect(parseGraphPartial({ relationships: [] })).toBeNull()
  })
})

describe('mergeCharacterGraphs', () => {
  const partialA = parseGraphPartial({
    characters: [
      { name: '张三', role: '主角' },
      { name: '李四' },
      { name: '王五' },
    ],
    relationships: [
      { source: '张三', target: '李四', relation: '师徒' },
      { source: '张三', target: '王五', relation: '父子' },
    ],
  })!

  const partialB = parseGraphPartial({
    characters: [
      { name: '张三', description: '剑客，师从无名' },
      { name: '李四' },
      { name: '赵六' },
    ],
    relationships: [
      { source: '李四', target: '张三', relation: '师徒' },
      { source: '李四', target: '赵六', relation: '恋人' },
    ],
  })!

  it('同名节点合并、无向同关系去重、role/description 首个非空胜出', () => {
    const graph = mergeCharacterGraphs([partialA, partialB])
    const names = graph.nodes.map((n) => n.name)
    expect(names.sort()).toEqual(['张三', '李四', '王五', '赵六'])

    const zhang = graph.nodes.find((n) => n.name === '张三')!
    expect(zhang.role).toBe('主角')
    expect(zhang.description).toBe('剑客，师从无名')

    // 师徒边方向不同但端点对相同 → 合并为一条
    const shitu = graph.edges.filter((e) => e.relation === '师徒')
    expect(shitu).toHaveLength(1)
    expect(graph.edges).toHaveLength(3)
  })

  it('weight 以最大连接度归一', () => {
    const graph = mergeCharacterGraphs([partialA, partialB])
    const zhang = graph.nodes.find((n) => n.name === '张三')!
    const max = Math.max(...graph.nodes.map((n) => n.weight ?? 0))
    expect(max).toBe(1)
    expect(zhang.weight).toBe(1)
  })

  it('节点超上限时按连接度截断并剔除断边', () => {
    const characters = Array.from({ length: MAX_GRAPH_NODES + 10 }, (_, i) => ({
      name: `人物${i + 1}`,
    }))
    // 前 3 个人物互相成网（高连接度），其余只连一次
    const relationships: { source: string; target: string; relation: string }[] = []
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i !== j) relationships.push({ source: `人物${i + 1}`, target: `人物${j + 1}`, relation: '盟友' })
      }
    }
    for (let i = 3; i < characters.length; i++) {
      relationships.push({ source: '人物1', target: `人物${i + 1}`, relation: '一面之缘' })
    }
    const partial = parseGraphPartial({ characters, relationships })!
    const graph = mergeCharacterGraphs([partial])

    expect(graph.nodes.length).toBeLessThanOrEqual(MAX_GRAPH_NODES)
    // 所有的边两端都在保留节点里
    const keptIds = new Set(graph.nodes.map((n) => n.id))
    for (const edge of graph.edges) {
      expect(keptIds.has(edge.source)).toBe(true)
      expect(keptIds.has(edge.target)).toBe(true)
    }
  })

  it('空片段集合产出空图谱', () => {
    const graph = mergeCharacterGraphs([])
    expect(graph.nodes).toEqual([])
    expect(graph.edges).toEqual([])
  })
})

describe('parseMindmapPartial', () => {
  it('递归校验：限深、限宽、剔除无 title 节点', () => {
    const deep = { title: 'a', children: [{ title: 'b', children: [{ title: 'c', children: [{ title: 'd', children: [{ title: '太深' }] }] }] }] }
    const partial = parseMindmapPartial(deep)!
    // 深度 0..3（MAX_MINDMAP_DEPTH=4），第 5 层被剪
    let node = partial
    let depth = 0
    while (node.children?.length) {
      node = node.children[0]
      depth++
    }
    expect(depth).toBe(3)
    expect(node.title).toBe('d')
  })

  it('title 缺失整棵子树作废；无 title 根返回 null', () => {
    expect(parseMindmapPartial({ children: [{ title: 'x' }] })).toBeNull()
    const partial = parseMindmapPartial({ title: '根', children: [{ nope: 1 }, { title: '有效' }] })!
    expect(partial.children).toEqual([{ title: '有效' }])
  })
})

describe('mergeMindmapBranches', () => {
  it('根为书名、每块大纲成一支；无子节点的大纲退化为单叶', () => {
    const root = mergeMindmapBranches('三体', [
      { label: '第1-3章', tree: { title: '地球往事', children: [{ title: '红岸基地' }] } },
      { label: '第4章', tree: { title: '单独主题' } },
    ])
    expect(root.title).toBe('三体')
    expect(root.children).toHaveLength(2)
    expect(root.children![0].title).toBe('第1-3章')
    expect(root.children![0].children).toEqual([{ title: '红岸基地' }])
    expect(root.children![1].children).toEqual([{ title: '单独主题' }])
  })
})

describe('stampPartialChapters · 图谱回原文链路', () => {
  it('把分块覆盖章节盖到人物与关系上', () => {
    const partial = parseGraphPartial({
      characters: [{ name: '张三' }, { name: '李四' }],
      relationships: [{ source: '张三', target: '李四', relation: '盟友' }],
    })!
    const stamped = stampPartialChapters(partial, [2, 5])
    expect(stamped.characters.every((c) => c.chapters)).toBe(true)
    expect(stamped.relationships.every((r) => r.chapters)).toBe(true)
  })

  it('evidence 摘句被解析并裁剪', () => {
    const partial = parseGraphPartial({
      characters: [{ name: '张三' }, { name: '李四' }],
      relationships: [
        { source: '张三', target: '李四', relation: '盟友', evidence: '  逐字摘录的依据短句  ' },
      ],
    })!
    expect(partial.relationships[0].evidenceQuote).toBe('逐字摘录的依据短句')
  })
})

describe('mergeCharacterGraphs · 章节并集与证据透传', () => {
  it('同名节点与同边跨块出现时章节并集，首个非空证据胜出', () => {
    const p1 = stampPartialChapters(
      parseGraphPartial({
        characters: [{ name: '张三' }, { name: '李四' }],
        relationships: [{ source: '张三', target: '李四', relation: '盟友', evidence: '第一块依据' }],
      })!,
      [0]
    )
    const p2 = stampPartialChapters(
      parseGraphPartial({
        characters: [{ name: '张三' }, { name: '李四' }],
        relationships: [{ source: '李四', target: '张三', relation: '盟友', evidence: '第二块依据' }],
      })!,
      [2, 3]
    )

    const graph = mergeCharacterGraphs([p1, p2])
    const zhang = graph.nodes.find((n) => n.name === '张三')!
    expect(zhang.chapters).toEqual([0, 2, 3])
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0].chapters).toEqual([0, 2, 3])
    expect(graph.edges[0].evidenceQuote).toBe('第一块依据')
  })
})

describe('resolveGraphEvidence · 证据本地校验定位', () => {
  const chapterTexts = ['张三与李四在酒馆比剑。', '王五拜张三为师。']

  const makeGraph = (evidenceQuote?: string, chapters?: number[]) => ({
    nodes: [{ id: 'zhangsan', name: '张三' }],
    edges: [
      {
        source: 'zhangsan',
        target: 'lisi',
        relation: '宿敌',
        ...(evidenceQuote ? { evidenceQuote } : {}),
        ...(chapters ? { chapters } : {}),
      },
    ],
  })

  it('证据在优先章节逐字命中 → 定位为章内坐标（占比 4 位小数）', () => {
    const resolved = resolveGraphEvidence(makeGraph('酒馆比剑', [1]), chapterTexts)
    // 「酒馆比剑」位于第 0 章第 6 字，章长 11 → 6/11 ≈ 0.5455
    expect(resolved.edges[0].evidence).toEqual({ quote: '酒馆比剑', chapterIndex: 0, offsetRatio: 0.5455 })
    expect('evidenceQuote' in resolved.edges[0]).toBe(false)
  })

  it('优先章节未命中时全书扫描兜底', () => {
    const resolved = resolveGraphEvidence(makeGraph('拜张三为师', [0]), chapterTexts)
    expect(resolved.edges[0].evidence?.chapterIndex).toBe(1)
  })

  it('幻觉引文（全书不存在）被丢弃，章节并集保留', () => {
    const resolved = resolveGraphEvidence(makeGraph('原文没有这句', [1]), chapterTexts)
    expect(resolved.edges[0].evidence).toBeUndefined()
    expect(resolved.edges[0].chapters).toEqual([1])
  })

  it('无证据摘句的边原样通过（旧数据兼容）', () => {
    const resolved = resolveGraphEvidence(makeGraph(undefined, [0, 1]), chapterTexts)
    expect(resolved.edges[0].chapters).toEqual([0, 1])
    expect(resolved.edges[0].evidence).toBeUndefined()
  })
})

describe('术语卡 · 解析/合并/校验', () => {
  const chapterTexts = ['注意力是指对序列位置加权检索的机制。', '缓存机制用于加速推理。']

  it('parseGlossaryPartial 规整术语与定义摘句；形状不对返回 null', () => {
    const partial = parseGlossaryPartial({
      terms: [
        { term: ' 注意力 ', definition: '  序列加权机制  ', evidence: ' 注意力是指对序列位置加权检索的机制 ' },
        { term: '' },
        'not-an-object',
      ],
    })
    expect(partial).not.toBeNull()
    expect(partial!.terms).toHaveLength(1)
    expect(partial!.terms[0]).toEqual({
      term: '注意力',
      definition: '序列加权机制',
      evidenceQuote: '注意力是指对序列位置加权检索的机制',
    })
    expect(parseGlossaryPartial({ terms: [] })).toBeNull()
    expect(parseGlossaryPartial(null)).toBeNull()
  })

  it('mergeGlossary：同术语并集章节/首胜定义；按首现章节排序', () => {
    const merged = mergeGlossary([
      stampGlossaryChapters(
        parseGlossaryPartial({
          terms: [
            { term: '注意力', definition: '序列加权机制', evidence: '注意力是指对序列位置加权检索的机制' },
          ],
        })!,
        [0]
      ),
      stampGlossaryChapters(
        parseGlossaryPartial({
          terms: [
            { term: '注意力', definition: '见前文定义' },
            { term: '缓存', definition: '推理加速结构' },
          ],
        })!,
        [1]
      ),
    ])
    // 同名术语跨块合并：章节并集、首个非空定义胜出；不同术语各自保留；按首现章节排序
    expect(merged.terms.map((t) => t.term)).toEqual(['注意力', '缓存'])
    expect(merged.terms[0].chapters).toEqual([0, 1])
    expect(merged.terms[0].definition).toBe('序列加权机制')
    expect(merged.terms[0].evidenceQuote).toBe('注意力是指对序列位置加权检索的机制')
  })

  it('resolveGlossaryEvidence：定义原文命中落坐标；幻觉句丢弃留章节回退', () => {
    const merged = mergeGlossary([
      stampGlossaryChapters(
        parseGlossaryPartial({
          terms: [
            { term: '注意力', definition: '机制', evidence: '注意力是指对序列位置加权检索的机制' },
            { term: '缓存', definition: '结构', evidence: '书里没有这个定义原文' },
          ],
        })!,
        [0]
      ),
    ])
    const resolved = resolveGlossaryEvidence(merged, chapterTexts)
    const attention = resolved.terms.find((t) => t.term === '注意力')!
    const cache = resolved.terms.find((t) => t.term === '缓存')!

    expect(attention.evidence).toEqual({
      quote: '注意力是指对序列位置加权检索的机制',
      chapterIndex: 0,
      offsetRatio: 0,
    })
    expect(cache.evidence).toBeUndefined()
    expect(cache.chapters).toEqual([0])
    expect('evidenceQuote' in cache).toBe(false)
  })
})

describe('mergeCharacterGraphs · 增量基底合并', () => {
  const base = {
    nodes: [
      { id: '张三', name: '张三', weight: 1, chapters: [0] },
      { id: '李四', name: '李四', weight: 1, chapters: [0] },
    ],
    edges: [
      {
        source: '张三',
        target: '李四',
        relation: '盟友',
        chapters: [0],
        evidence: { quote: '张三与李四比剑', chapterIndex: 0, offsetRatio: 0.25 },
      },
    ],
  }

  it('基底节点/边先入列，新片段的人物与关系并入（同名合并）', () => {
    const fresh = [
      {
        characters: [{ name: '王五' }, { name: '张三' }],
        relationships: [{ source: '王五', target: '张三', relation: '师徒', chapters: [1] }],
      },
    ]
    const merged = mergeCharacterGraphs(fresh, base)
    expect(merged.nodes.map((n) => n.name).sort()).toEqual(['张三', '李四', '王五'])
    expect(merged.edges).toHaveLength(2)
    // 章节并集：旧边 [0]，新边 [1]
    expect(merged.edges.find((e) => e.relation === '盟友')?.chapters).toEqual([0])
  })

  it('基底边 evidence 坐标直通，resolve 不重复校验也不改写', () => {
    const fresh = [
      {
        characters: [{ name: '王五' }, { name: '赵六' }],
        relationships: [
          {
            source: '王五',
            target: '赵六',
            relation: '盟友',
            chapters: [2],
            evidenceQuote: '王五与赵六结盟',
          },
        ],
      },
    ]
    const merged = mergeCharacterGraphs(fresh, base)
    const resolved = resolveGraphEvidence(merged, ['', '', '王五与赵六结盟。'])
    const oldEdge = resolved.edges.find((e) => e.relation === '盟友' && e.chapters?.includes(0))
    // 旧边坐标原样（即使新章节文本不含旧引文也不受影响）
    expect(oldEdge?.evidence).toEqual({ quote: '张三与李四比剑', chapterIndex: 0, offsetRatio: 0.25 })
    expect('evidenceQuote' in (oldEdge ?? {})).toBe(false)
    // 新边照常逐字定位到第 2 章
    const newEdge = resolved.edges.find((e) => e.chapters?.includes(2))
    expect(newEdge?.evidence?.chapterIndex).toBe(2)
    expect(newEdge?.evidence?.quote).toBe('王五与赵六结盟')
  })
})

describe('mergeGlossary · 增量基底合并', () => {
  it('基底术语先入列（含已定位证据直通），新片段术语并入不丢失', () => {
    const base = {
      terms: [
        {
          id: '注意力',
          term: '注意力',
          definition: '序列加权检索机制',
          chapters: [0],
          evidence: { quote: '注意力是指加权检索', chapterIndex: 0, offsetRatio: 0.5 },
        },
      ],
    }
    const fresh = [
      { terms: [{ term: '缓存', definition: '推理加速结构', evidenceQuote: '缓存用于加速', chapters: [2] }] },
    ]
    const merged = mergeGlossary(fresh, base)
    expect(merged.terms.map((t) => t.term)).toEqual(['注意力', '缓存'])
    const resolved = resolveGlossaryEvidence(merged, ['注意力是指加权检索', '', '缓存用于加速'])
    // 旧术语证据坐标原样直通，不被重新校验改写
    expect(resolved.terms[0].evidence).toEqual({
      quote: '注意力是指加权检索',
      chapterIndex: 0,
      offsetRatio: 0.5,
    })
    // 新术语照常逐字定位
    expect(resolved.terms[1].evidence?.chapterIndex).toBe(2)
  })
})

describe('mergeMindmapBranches · 增量基底合并', () => {
  it('基底主分支前置保留，新分支接续且总量受上限约束', () => {
    const base: MindmapNodeData = {
      title: '测试书',
      children: [{ title: '片段1', children: [{ title: '旧要点' }] }],
    }
    const fresh = [{ label: '第2章起', tree: { title: '新要点', children: [{ title: '细节' }] } }]
    const merged = mergeMindmapBranches('测试书', fresh, base)
    expect(merged.children?.map((b) => b.title)).toEqual(['片段1', '第2章起'])
  })
})

describe('paper-brief · 论文速览解析/合并/证据校验', () => {
  const briefFixture = {
    tldr: '提出注意力机制，用加权检索替代池化，效果显著提升。',
    contributions: [
      { point: '加权检索优于池化', strength: 'experiment', evidence: '注意力是指对序列位置分配权重的检索机制' },
    ],
    limitations: [{ point: '只在长文本上验证' }],
    questions: [{ question: '基线是否公平？', evidence: '与池化基线对比' }],
  }

  it('parse 规整条目并剔除全空片段；strength 非法回落 claim', () => {
    const parsed = parseBriefPartial(briefFixture)
    expect(parsed?.tldr).toContain('注意力机制')
    expect(parsed?.contributions[0].strength).toBe('experiment')
    const invalid = parseBriefPartial({ tldr: '', contributions: [{ point: '', strength: 'magic' }] })
    expect(invalid).toBeNull()
  })

  it('merge 增量基底：旧条目保留、跨块按文本去重', () => {
    const base = {
      tldr: '旧速览。',
      contributions: [{ point: '旧贡献', strength: 'theory' as const, chapters: [0] }],
      limitations: [],
      questions: [],
    }
    const merged = mergeBriefs(
      [
        {
          tldr: '新速览。',
          contributions: [{ point: '旧贡献', strength: 'theory', chapters: [1] }, { point: '新贡献', strength: 'experiment' }],
          limitations: [],
          questions: [],
        },
      ],
      base
    )
    // TL;DR 首个非空胜出（基底在前）；同名贡献章节并集；新贡献并入
    expect(merged.tldr).toBe('旧速览。')
    expect(merged.contributions.map((c) => c.point)).toEqual(['旧贡献', '新贡献'])
    expect(merged.contributions[0].chapters).toEqual([0, 1])
  })

  it('证据校验：逐字命中落坐标，未命中留章级回退', () => {
    // 走真实管线：raw 片段先经 parse（evidence → evidenceQuote）再合并
    const parsed = parseBriefPartial({
      ...briefFixture,
      limitations: [{ point: '只在长文本上验证', evidence: '文本里不存在的句子' }],
    })
    const merged = mergeBriefs([parsed!])
    const resolved = resolveBriefEvidence(merged, [
      '注意力是指对序列位置分配权重的检索机制',
      '与池化基线对比实验',
    ])
    expect(resolved.contributions[0].evidence?.chapterIndex).toBe(0)
    expect(resolved.questions[0].evidence?.chapterIndex).toBe(1)
    // 未命中的摘句被丢弃，无证据字段（章级回退仍在 chapters）
    expect(resolved.limitations[0].evidence).toBeUndefined()
  })
})
