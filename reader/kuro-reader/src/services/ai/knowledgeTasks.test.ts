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
  it('小说视角：人物图谱 + 导图；学术视角：导图 + 术语卡', () => {
    expect(getKnowledgeTasksForKind('fiction').map((t) => t.type)).toEqual(['character-graph', 'mindmap'])
    expect(getKnowledgeTasksForKind('academic').map((t) => t.type)).toEqual(['mindmap', 'glossary'])
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
