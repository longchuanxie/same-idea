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
  it('小说视角：人物图谱 + 导图；学术视角：速览 + 概念图谱 + 导图 + 术语卡', () => {
    expect(getKnowledgeTasksForKind('fiction').map((t) => t.type)).toEqual(['character-graph', 'mindmap'])
    expect(getKnowledgeTasksForKind('academic').map((t) => t.type)).toEqual([
      'paper-brief',
      'concept-graph',
      'mindmap',
      'glossary',
    ])
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
