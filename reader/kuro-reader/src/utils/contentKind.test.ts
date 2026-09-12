import { describe, expect, it } from 'vitest'

import { detectContentKind, detectContentKindFromChapters } from '@/utils/contentKind'

const ACADEMIC_SAMPLE = [
  '第二章 注意力机制',
  '2.1 基本定义',
  '注意力是指模型在处理序列时对不同位置分配不同权重的机制。所谓查询向量，是指用于发起检索的表示。',
  '注意力分数的计算定义为 softmax(QK^T/√d)。表 1 给出了对比结果。',
  '2.2 相关工作',
  '多项实验表明（Vaswani et al. 2017），该机制显著优于池化基线。图 2 展示了消融分析。',
].join('\n')

const FICTION_SAMPLE = [
  '第五回 山雨欲来',
  '「你到底去不去？」张三盯着李四，声音压得很低。',
  '李四笑道：「急什么，酒还没喝完呢。」',
  '王五插嘴道：「再等一夜，城门就要关了。」',
  '「那就今晚。」张三说罢，起身推门，风卷着雨点扑了进来。',
].join('\n')

describe('detectContentKind', () => {
  it('学术强信号（参考文献/摘要/关键词/目录/doi 等）直接判定学术', () => {
    expect(detectContentKind('本书目录\n第一章 绪论……\n参考文献：略')).toBe('academic')
    expect(detectContentKind('Abstract: We study…\nKeywords: attention')).toBe('academic')
    expect(detectContentKind('如 Vaswani et al. 所述……')).toBe('academic')
  })

  it('学术弱信号累计过线（小节编号 + 定义句式密度）判定学术', () => {
    expect(detectContentKind(ACADEMIC_SAMPLE)).toBe('academic')
  })

  it('对白密集的叙事文本判定小说（学术弱信号被对白压制）', () => {
    expect(detectContentKind(FICTION_SAMPLE)).toBe('fiction')
  })

  it('无信号文本保守回落小说（人物图谱对叙事文本收益最大）', () => {
    expect(detectContentKind('这是一段没有任何显著文体特征的文字。')).toBe('fiction')
    expect(detectContentKind('')).toBe('fiction')
  })

  it('多章采样：学术章 + 叙事章混合时按均衡采样判定', () => {
    const chapters = [ACADEMIC_SAMPLE, FICTION_SAMPLE.slice(0, 120), ACADEMIC_SAMPLE]
    expect(detectContentKindFromChapters(chapters)).toBe('academic')
    expect(detectContentKindFromChapters([FICTION_SAMPLE, FICTION_SAMPLE.slice(0, 100)])).toBe('fiction')
    expect(detectContentKindFromChapters([])).toBe('fiction')
  })
})
