import { describe, expect, it, vi } from 'vitest'

import type { KnowledgeArtifact } from '@/types'
import { downloadTextFile } from '@/utils/annotationExport'
import {
  buildCharacterGraphMermaid,
  buildGlossaryMarkdown,
  buildKnowledgeArtifactMarkdown,
  buildMindmapMarkdown,
  exportKnowledgeArtifactMarkdown,
} from '@/utils/knowledgeExport'

vi.mock('@/utils/annotationExport', () => ({
  downloadTextFile: vi.fn(),
  sanitizeFileName: (name: string) => name.replace(/[\\/:*?"<>|]/g, '').slice(0, 50),
}))

describe('buildCharacterGraphMermaid', () => {
  it('节点映射 n1/n2，边带关系标签，role 进节点标签', () => {
    const mermaid = buildCharacterGraphMermaid({
      nodes: [
        { id: 'zhangsan', name: '张三', role: '主角' },
        { id: 'lisi', name: '李四' },
      ],
      edges: [{ source: 'zhangsan', target: 'lisi', relation: '师徒' }],
    })
    expect(mermaid).toContain('flowchart LR')
    expect(mermaid).toContain('n1["张三｜主角"]')
    expect(mermaid).toContain('n2["李四"]')
    expect(mermaid).toContain('n1 ---|"师徒"| n2')
  })

  it('标签中的双引号转义为单引号', () => {
    const mermaid = buildCharacterGraphMermaid({
      nodes: [{ id: 'a', name: '外号"快刀"的人' }],
      edges: [],
    })
    expect(mermaid).not.toContain('"快刀"')
  })
})

describe('buildMindmapMarkdown', () => {
  it('嵌套列表 + detail 行内补注', () => {
    const markdown = buildMindmapMarkdown({
      title: '根',
      children: [
        { title: '要点', detail: '补充', children: [{ title: '细节' }] },
        { title: '另支' },
      ],
    })
    expect(markdown).toBe('- 根\n  - 要点：补充\n    - 细节\n  - 另支')
  })

  it('根下仅一条中转分支时上提其子树（与视图归一化一致）', () => {
    const markdown = buildMindmapMarkdown({
      title: '书',
      children: [{ title: '片段1', children: [{ title: '核心论点' }, { title: '关键定义' }] }],
    })
    expect(markdown).toBe('- 书\n  - 核心论点\n  - 关键定义')
  })
})

describe('buildKnowledgeArtifactMarkdown', () => {
  const base = {
    id: 'kn-1',
    bookId: 'book-1',
    title: '人物关系图谱',
    generator: 'ai' as const,
    createdAt: new Date('2026-09-12T10:00:00'),
    updatedAt: new Date('2026-09-12T10:00:00'),
  }

  it('图谱产物包裹 mermaid 代码块', () => {
    const markdown = buildKnowledgeArtifactMarkdown('测试书', {
      ...base,
      type: 'character-graph',
      data: { nodes: [{ id: 'a', name: '甲' }], edges: [] },
    } as KnowledgeArtifact)
    expect(markdown).toContain('# 人物关系图谱')
    expect(markdown).toContain('《测试书》')
    expect(markdown).toContain('```mermaid')
  })

  it('速览产物输出 TL;DR/贡献/局限/疑问结构', () => {
    const markdown = buildKnowledgeArtifactMarkdown('测试论文', {
      ...base,
      type: 'paper-brief',
      data: {
        tldr: '一句话速览。',
        contributions: [{ point: '贡献甲', strength: 'experiment', evidence: { quote: '依据句', chapterIndex: 0, offsetRatio: 0 } }],
        limitations: [{ point: '局限乙' }],
        questions: [{ question: '疑问丙' }],
      },
    } as KnowledgeArtifact)
    expect(markdown).toContain('> 一句话速览。')
    expect(markdown).toContain('**[实验支撑]** 贡献甲')
    expect(markdown).toContain('「依据句」（第1章）')
    expect(markdown).toContain('- 局限乙')
    expect(markdown).toContain('1. 疑问丙')
  })

  it('导图产物输出嵌套大纲', () => {
    const markdown = buildKnowledgeArtifactMarkdown('测试书', {
      ...base,
      type: 'mindmap',
      data: { title: '测试书', children: [{ title: '第一章脉络' }] },
    } as KnowledgeArtifact)
    expect(markdown).toContain('- 测试书')
    expect(markdown).toContain('  - 第一章脉络')
  })
})

describe('exportKnowledgeArtifactMarkdown', () => {
  it('文件名带书名与产物名并触发下载', () => {
    exportKnowledgeArtifactMarkdown('我的书', {
      id: 'kn-1',
      bookId: 'book-1',
      type: 'mindmap',
      title: '全书思维导图',
      data: { title: '我的书', children: [] },
      generator: 'ai',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const [filename] = (downloadTextFile as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(filename).toContain('我的书')
    expect(filename).toContain('全书思维导图')
    expect(filename.endsWith('.md')).toBe(true)
  })
})

describe('buildGlossaryMarkdown', () => {
  it('术语列表含定义、依据原文与位置', () => {
    const markdown = buildGlossaryMarkdown({
      terms: [
        {
          id: 'attention',
          term: '注意力',
          definition: '序列加权检索机制',
          evidence: { quote: '注意力是指对序列位置加权检索', chapterIndex: 0, offsetRatio: 0.1 },
        },
        { id: 'cache', term: '缓存', definition: '推理加速结构', chapters: [2, 3] },
      ],
    })
    expect(markdown).toContain('- **注意力**：序列加权检索机制')
    expect(markdown).toContain('「注意力是指对序列位置加权检索」（第1章）')
    expect(markdown).toContain('- **缓存**：推理加速结构')
    expect(markdown).toContain('位置：第3章、第4章')
  })

  it('术语产物导出带标题与章节头', () => {
    const markdown = buildKnowledgeArtifactMarkdown('深度学习', {
      id: 'kn-g',
      bookId: 'b1',
      type: 'glossary',
      title: '概念术语卡',
      data: { terms: [{ id: 't', term: '梯度', definition: '损失下降方向' }] },
      generator: 'ai',
      createdAt: new Date('2026-09-12T10:00:00'),
      updatedAt: new Date('2026-09-12T10:00:00'),
    } as KnowledgeArtifact)
    expect(markdown).toContain('# 概念术语卡')
    expect(markdown).toContain('## 术语速查')
    expect(markdown).toContain('《深度学习》')
  })
})
