import { describe, it, expect } from 'vitest'

import { computeAnnotationAnchor, resolveAnnotationOffsets } from '@/utils/annotationAnchor'

const SAMPLE = '夜色像一张网，罩住了整座城市。林默站在天桥上，看着远处的灯火明灭。他想起白天那通电话。'

describe('computeAnnotationAnchor', () => {
  it('captures before/after context and occurrence', () => {
    const start = SAMPLE.indexOf('灯火明灭');
    const end = start + '灯火明灭'.length;
    const anchor = computeAnnotationAnchor(SAMPLE, start, end);

    expect(anchor.before).toContain('看着远处的');
    expect(anchor.after).toContain('。他想起');
    expect(anchor.occurrence).toBe(0);
  })

  it('counts occurrence among fingerprint-passing earlier candidates', () => {
    const repeated = '目标';
    // 两次出现的前后 16 字上下文完全相同 → 仅凭指纹无法区分，靠 occurrence 消歧
    const content = '甲'.repeat(20) + repeated + '乙' + '甲'.repeat(20) + repeated + '乙';
    const firstStart = content.indexOf(repeated);
    const secondStart = content.indexOf(repeated, firstStart + 1);

    const firstAnchor = computeAnnotationAnchor(content, firstStart, firstStart + repeated.length);
    const secondAnchor = computeAnnotationAnchor(content, secondStart, secondStart + repeated.length);

    expect(firstAnchor.occurrence).toBe(0);
    expect(secondAnchor.occurrence).toBe(1);
  })
})

describe('resolveAnnotationOffsets', () => {
  it('resolves by fingerprint when content representation changed', () => {
    const start = SAMPLE.indexOf('灯火明灭');
    const end = start + '灯火明灭'.length;
    const anchor = computeAnnotationAnchor(SAMPLE, start, end);

    // 内容表示变化：章节开头文本被大幅缩短（后续偏移整体前移失效）
    const transformed = SAMPLE.replace('夜色像一张网，罩住了', '夜。');
    const resolved = resolveAnnotationOffsets(transformed, {
      selectedText: '灯火明灭',
      startOffset: start,
      endOffset: end,
      anchor,
    });

    // 原偏移在新内容中已指向别的字符，指纹定位到新表示中的实际位置
    expect(resolved).not.toBeNull();
    expect(resolved!.startOffset).not.toBe(start);
    expect(resolved!.startOffset).toBe(transformed.indexOf('灯火明灭'));
    expect(transformed.slice(resolved!.startOffset, resolved!.endOffset)).toBe('灯火明灭');
  });

  it('disambiguates identical-context occurrences via occurrence', () => {
    const repeated = '目标';
    const content = '甲'.repeat(20) + repeated + '乙' + '甲'.repeat(20) + repeated + '乙';
    const secondStart = content.indexOf(repeated, content.indexOf(repeated) + 1);
    const anchor = computeAnnotationAnchor(content, secondStart, secondStart + repeated.length);

    const resolved = resolveAnnotationOffsets(content, {
      selectedText: repeated,
      startOffset: 0, // 失效偏移
      endOffset: 2,
      anchor,
    });

    expect(resolved!.startOffset).toBe(secondStart);
  });

  it('falls back to offsets when no anchor and they still match', () => {
    const start = SAMPLE.indexOf('天桥');
    const resolved = resolveAnnotationOffsets(SAMPLE, {
      selectedText: '天桥',
      startOffset: start,
      endOffset: start + 2,
      anchor: undefined,
    });
    expect(resolved).toEqual({ startOffset: start, endOffset: start + 2 });
  })

  it('falls back to first occurrence when offsets are stale without anchor', () => {
    const resolved = resolveAnnotationOffsets(SAMPLE, {
      selectedText: '灯火明灭',
      startOffset: 3, // 失效
      endOffset: 7,
      anchor: undefined,
    });
    expect(resolved!.startOffset).toBe(SAMPLE.indexOf('灯火明灭'));
  });

  it('returns null when the text no longer exists', () => {
    const resolved = resolveAnnotationOffsets('完全不同的内容。', {
      selectedText: '灯火明灭',
      startOffset: 2,
      endOffset: 6,
    });
    expect(resolved).toBeNull();
  });

  it('returns null for empty selected text', () => {
    expect(resolveAnnotationOffsets(SAMPLE, { selectedText: '', startOffset: 0, endOffset: 0 })).toBeNull()
  })
})

describe('跨段选区的空白差异与引用文口径', () => {
  const SOURCE = '第一段落结尾。\n\n第二段落开头，接着往下写。'

  it('界面文本不含块级换行、源文本含换行时仍能重挂', () => {
    // Range.toString() 跨块级元素不产生换行，源文本却有 \n\n —— 通道 3（忽略空白）兜底
    const quote = '第一段落结尾。第二段落开头'
    const resolved = resolveAnnotationOffsets(SOURCE, {
      selectedText: quote,
      startOffset: 0,
      endOffset: quote.length, // 失效偏移：源文本里这里还只是第一段
    })

    expect(resolved).not.toBeNull()
    const sliced = SOURCE.slice(resolved!.startOffset, resolved!.endOffset)
    expect(sliced).toContain('第一段落结尾。')
    expect(sliced).toContain('第二段落开头')
    expect(sliced).toContain('\n\n')
  })

  it('压缩空白差异（源文本换行 vs 界面空格）也能重挂', () => {
    const source = '缩进正文：　　灯火\n明灭，风起。'
    const resolved = resolveAnnotationOffsets(source, {
      selectedText: '灯火 明灭，风起。', // 原文里是换行，不是空格 → 通道 2（折叠空白）兜底
      startOffset: 0,
      endOffset: 1,
    })
    expect(resolved).not.toBeNull()
    expect(source.slice(resolved!.startOffset, resolved!.endOffset)).toContain('灯火')
    expect(source.slice(resolved!.startOffset, resolved!.endOffset)).toContain('风起')
  })

  it('computeAnnotationAnchor 以界面文本为针计数，与重挂口径一致', () => {
    // 源文本里带 Markdown 语法，界面选中的是渲染后的文本
    const source = '前文 **灯火明灭** 后文，再提一次 灯火明灭。'
    const quote = '灯火明灭'
    const innerStart = source.indexOf('灯火明灭') // 「**」之后
    const anchor = computeAnnotationAnchor(source, innerStart, innerStart + quote.length, quote)

    const resolved = resolveAnnotationOffsets(source, {
      selectedText: quote,
      startOffset: 0, // 失效
      endOffset: 1,
      anchor,
    })

    // 针一致 → occurrence 对齐到首次出现（Markdown 标记内侧），而不是错位到第二次
    expect(resolved!.startOffset).toBe(innerStart)
  })

  it('原文可直接命中时优先采信原文偏移（不走归一化通道）', () => {
    const source = '甲乙丙丁'
    const anchor = computeAnnotationAnchor(source, 2, 4, '丙丁')
    const resolved = resolveAnnotationOffsets(source, {
      selectedText: '丙丁',
      startOffset: 2,
      endOffset: 4,
      anchor,
    })
    expect(resolved).toEqual({ startOffset: 2, endOffset: 4 })
  })
})
