import type { Annotation, AnnotationAnchor } from '@/types'

/** 上下文指纹片段长度（字符） */
const CONTEXT_LENGTH = 16

/** 折叠空白：DOM 渲染与内容表示变化都可能改变空白，比对时忽略 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * 计算批注的稳定锚点：选中文本前后各 CONTEXT_LENGTH 字符的指纹
 * 加出现序号。内容表示变化（如 EPUB 转换管线调整）后仍可重定位。
 */
export function computeAnnotationAnchor(
  content: string,
  startOffset: number,
  endOffset: number
): AnnotationAnchor {
  const selectedText = content.slice(startOffset, endOffset);
  const before = normalizeWhitespace(content.slice(Math.max(0, startOffset - CONTEXT_LENGTH), startOffset));
  const after = normalizeWhitespace(content.slice(endOffset, endOffset + CONTEXT_LENGTH));
  return {
    before,
    after,
    // 0-based：早于本位置、且能通过同一指纹谓词的候选数
    occurrence: countEarlierFingerprintMatches(content, selectedText, startOffset, before, after),
  };
}

function countEarlierFingerprintMatches(
  content: string,
  needle: string,
  startOffset: number,
  before: string,
  after: string
): number {
  if (!needle) return 0;
  let count = 0;
  let index = content.indexOf(needle);
  while (index >= 0 && index < startOffset) {
    if (matchesFingerprint(content, index, needle.length, before, after)) count += 1;
    index = content.indexOf(needle, index + 1);
  }
  return count;
}

function matchesFingerprint(
  content: string,
  index: number,
  length: number,
  before: string,
  after: string
): boolean {
  const end = index + length;
  const actualBefore = normalizeWhitespace(content.slice(Math.max(0, index - CONTEXT_LENGTH), index));
  const actualAfter = normalizeWhitespace(content.slice(end, end + CONTEXT_LENGTH));
  const beforeMatches = before === '' ? true : actualBefore.endsWith(before);
  const afterMatches = after === '' ? true : actualAfter.startsWith(after);
  return beforeMatches && afterMatches;
}

/**
 * 将批注锚定到当前章节内容，返回解析后的偏移；无法定位时返回 null。
 * 解析顺序：上下文指纹 → 原偏移校验 → 全文首个匹配（尽力而为）。
 */
export function resolveAnnotationOffsets(
  content: string,
  annotation: Pick<Annotation, 'selectedText' | 'startOffset' | 'endOffset' | 'anchor'>
): { startOffset: number; endOffset: number } | null {
  const { selectedText, startOffset, endOffset, anchor } = annotation;
  if (!selectedText) return null;

  // 1. 上下文指纹匹配（内容表示变化后的首选路径）
  if (anchor) {
    const match = findByFingerprint(content, selectedText, anchor);
    if (match) return match;
  }

  // 2. 原偏移仍然指向同一文本
  if (
    startOffset >= 0 &&
    endOffset > startOffset &&
    endOffset <= content.length &&
    content.slice(startOffset, endOffset) === selectedText
  ) {
    return { startOffset, endOffset };
  }

  // 3. 尽力而为：全文首个匹配
  const first = content.indexOf(selectedText);
  if (first >= 0) return { startOffset: first, endOffset: first + selectedText.length };

  return null;
}

function findByFingerprint(
  content: string,
  selectedText: string,
  anchor: AnnotationAnchor
): { startOffset: number; endOffset: number } | null {
  const before = normalizeWhitespace(anchor.before);
  const after = normalizeWhitespace(anchor.after);
  let validMatches = 0;
  let index = content.indexOf(selectedText);
  while (index >= 0) {
    if (matchesFingerprint(content, index, selectedText.length, before, after)) {
      if (validMatches === anchor.occurrence) {
        return { startOffset: index, endOffset: index + selectedText.length };
      }
      validMatches += 1;
    }
    index = content.indexOf(selectedText, index + 1);
  }
  return null;
}
