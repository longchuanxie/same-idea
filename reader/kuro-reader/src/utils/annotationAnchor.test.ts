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
