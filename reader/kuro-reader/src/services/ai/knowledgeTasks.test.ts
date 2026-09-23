import { describe, expect, it } from 'vitest'

import {
  KNOWLEDGE_TASKS,
  getKnowledgeTask,
  getKnowledgeTasksForKind,
} from '@/services/ai/knowledgeTasks'

const chunkInputBase = {
  bookTitle: '测试书',
  chunkLabel: '片段1',
  chunkText: '正文。',
  chunkIndex: 0,
  chunkTotal: 1,
}

describe('任务注册表 · 内容类型分流', () => {
  it('小说视角：人物图谱 + 导图 + 节拍；学术视角：速览 + 概念图谱 + 导图 + 术语卡', () => {
    expect(getKnowledgeTasksForKind('fiction').map((t) => t.type)).toEqual(['character-graph', 'mindmap', 'story-beats'])
    expect(getKnowledgeTasksForKind('academic').map((t) => t.type)).toEqual([
      'paper-brief',
      'concept-graph',
      'mindmap',
      'glossary',
    ])
  })

  it('叙事节拍任务：小说专属、digest 单块语料、提示词含角色词表与章序折算规则', () => {
    const task = getKnowledgeTask('story-beats')
    expect(task.kinds).toEqual(['fiction'])
    expect(task.corpusMode).toBe('digest')
    const messages = task.buildMessages({
      ...chunkInputBase,
      contentKind: 'fiction',
      chunkLabel: '全书骨架',
      chunkText: '第1章 开局（约3000字）：夜雨入市……城中尸变',
    })
    const prompt = messages[1].content
    expect(prompt).toContain('叙事节拍')
    expect(prompt).toContain('hook|inciting|rising|turn|midpoint|low|climax|resolution')
    expect(prompt).toContain('chapterIndex 一律填 N-1')
    expect(prompt).toContain('逐字摘自骨架文本')
  })

  it('论文速览任务：学术专属，提示词要求 TL;DR/贡献强度/局限/疑问与逐字证据', () => {
    const task = getKnowledgeTask('paper-brief')
    expect(task.kinds).toEqual(['academic'])
    const messages = task.buildMessages({ ...chunkInputBase, contentKind: 'academic' })
    expect(messages[1].content).toContain('tldr')
    expect(messages[1].content).toContain('experiment=有实验支撑')
    expect(messages[1].content).toContain('limitations')
    expect(messages[1].content).toContain('questions')
    expect(messages[1].content).toContain('逐字摘自片段正文')
    expect(messages[1].content).toContain('不要凭空质疑')
  })

  it('概念图谱任务：学术专属，提示词含概念关系与证据要求，详细度分档生效', () => {
    const task = getKnowledgeTask('concept-graph')
    expect(task.kinds).toEqual(['academic'])
    const standard = task.buildMessages({ ...chunkInputBase, contentKind: 'academic' })
    expect(standard[1].content).toContain('概念之间的关系')
    expect(standard[1].content).toContain('上位/组成/依赖/对比/相关')
    expect(standard[1].content).toContain('逐字摘自片段正文')
    const core = task.buildMessages({ ...chunkInputBase, contentKind: 'academic', detail: 'core' })
    expect(core[1].content).toContain('至多 8 个')
  })

  it('每种产物类型都能取到任务且 kinds 覆盖两种视角中的至少一种', () => {
    for (const task of Object.values(KNOWLEDGE_TASKS)) {
      expect(getKnowledgeTask(task.type)).toBe(task)
      expect(task.kinds.length).toBeGreaterThan(0)
    }
  })

  it('导图提示词按内容视角切换（小说=情节人物，学术=论点论证）', () => {
    const fictionMessages = KNOWLEDGE_TASKS.mindmap.buildMessages({ ...chunkInputBase, contentKind: 'fiction' })
    const academicMessages = KNOWLEDGE_TASKS.mindmap.buildMessages({ ...chunkInputBase, contentKind: 'academic' })

    const fictionPrompt = fictionMessages.map((m) => m.content).join('\n')
    const academicPrompt = academicMessages.map((m) => m.content).join('\n')
    expect(fictionPrompt).toContain('情节推进、关键人物动向')
    expect(academicPrompt).toContain('核心论点')
    expect(academicPrompt).toContain('证据与方法')
  })

  it('术语卡提示词要求逐字摘录定义原文', () => {
    const messages = KNOWLEDGE_TASKS.glossary.buildMessages({ ...chunkInputBase, contentKind: 'academic' })
    const prompt = messages.map((m) => m.content).join('\n')
    expect(prompt).toContain('关键概念与术语')
    expect(prompt).toContain('逐字摘自片段正文')
  })
})

describe('任务注册表 · 跨块称呼一致性', () => {
  it('图谱任务注入已认人物名单与沿用称呼要求', () => {
    const messages = KNOWLEDGE_TASKS['character-graph'].buildMessages({
      ...chunkInputBase,
      contentKind: 'fiction',
      knownNames: ['林黛玉', '贾宝玉'],
    })
    const prompt = messages[1].content
    expect(prompt).toContain('此前片段已确认的人物：林黛玉、贾宝玉')
    expect(prompt).toContain('沿用上述称呼')
    expect(prompt).toContain('直接使用上述称呼')
  })

  it('概念图谱任务同样注入（称谓换「概念」）', () => {
    const messages = KNOWLEDGE_TASKS['concept-graph'].buildMessages({
      ...chunkInputBase,
      contentKind: 'academic',
      knownNames: ['强化学习'],
    })
    expect(messages[1].content).toContain('此前片段已确认的概念：强化学习')
  })

  it('未传名单时不注入（首块提示词保持干净）', () => {
    const messages = KNOWLEDGE_TASKS['character-graph'].buildMessages({
      ...chunkInputBase,
      contentKind: 'fiction',
    })
    expect(messages[1].content).not.toContain('此前片段已确认')
  })

  it('非图谱任务不消费名单（导图提示词不出现）', () => {
    const messages = KNOWLEDGE_TASKS.mindmap.buildMessages({
      ...chunkInputBase,
      contentKind: 'fiction',
      knownNames: ['林黛玉'],
    })
    expect(messages[1].content).not.toContain('此前片段已确认')
  })

  it('人物图谱任务开别名归并，概念图谱不开（子集概念是上下位层级）', () => {
    const characters = [{ name: '黛玉' }, { name: '林黛玉' }]
    const relationships = [{ source: '黛玉', target: '林黛玉', relation: '同人' }]
    const partials = [{ label: '片段1', data: { characters, relationships } }]
    const fiction = KNOWLEDGE_TASKS['character-graph'].merge('测试书', partials) as import('@/types').CharacterGraphData
    expect(fiction.nodes.map((n) => n.name).sort()).toEqual(['林黛玉'])

    const conceptPartials = [
      { label: '片段1', data: { characters: [{ name: '学习' }, { name: '强化学习' }], relationships: [] } },
    ]
    const academic = KNOWLEDGE_TASKS['concept-graph'].merge('测试书', conceptPartials) as import('@/types').CharacterGraphData
    expect(academic.nodes.map((n) => n.name).sort()).toEqual(['学习', '强化学习'])
  })
})
