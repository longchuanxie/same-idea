/**
 * 选区作用域解析（选区链路的三层模型之「Anchor 层」）
 *
 * 契约：批注位置一律表达为 **章内源文本坐标系**（章节 content 的字符偏移），
 * 与渲染方式解耦。本模块负责把一次浏览器原生选区解析成：
 *
 *   1. 归属章：滚动模式多章同挂时，由节点最近的 [data-reader-article][data-chapter-index] 给出；
 *   2. 章内偏移：由 Markdown / 纯文本渲染时逐段写下的 [data-source-start] 锚点还原。
 *
 * 关键约束（替代此前的 `document.querySelector('[data-reader-content]')` 兜底）：
 * 兜底取的是"文档中第一个"内容容器，而容器并不唯一——无缝续读多章同挂、分页前后页并存、
 * 双栏并排时都会取错基准，产出一个看似合理实则错误的偏移，落库后即表现为
 * 「划线保存成功但落在别的句子 / 别的位置」。
 * 因此这里取不到锚点时**返回 null**，交由上层回退到 `content.indexOf(text)`——
 * 宁可不给偏移，也不给错误的偏移。
 */

/** 章下标属性：滚动/分页正文容器都会写上，用于确认选区到底属于哪一章 */
const CHAPTER_ATTRIBUTE = 'data-chapter-index';
const ARTICLE_SELECTOR = '[data-reader-article]';
const CONTENT_SELECTOR = '[data-reader-content]';
const SOURCE_START_ATTRIBUTE = 'data-source-start';

export interface SelectionOffsets {
  start: number;
  end: number;
}

export interface SelectionScope {
  /** 选区所属章下标；节点上溯不到（如分页容器未标注）时为 null，上层回退当前章 */
  chapterIndex: number | null;
  /** 章内源文本偏移；任一端口无锚点、或选区跨章时为 null */
  offsets: SelectionOffsets | null;
  /** 起止端口分属不同章：章内偏移不可比，上层应拒绝而不是硬算 */
  crossChapter: boolean;
}

/** 从节点上溯最近的匹配祖先（文本节点先取父元素；Element.closest 含自身） */
function closestElement(node: Node | null, selector: string): Element | null {
  if (!node) return null;
  const start = node instanceof Element ? node : node.parentElement;
  return start?.closest(selector) ?? null;
}

/** 节点是否位于正文区域（[data-reader-article]）内 */
export function isNodeInArticle(node: Node | null): boolean {
  return closestElement(node, ARTICLE_SELECTOR) !== null;
}

/** 选区归属章：多章同挂时靠 [data-chapter-index] 区分，取不到返回 null */
export function resolveChapterIndexFromNode(node: Node | null): number | null {
  const holder = closestElement(node, `[${CHAPTER_ATTRIBUTE}]`);
  const raw = holder?.getAttribute(CHAPTER_ATTRIBUTE);
  if (raw == null) return null;
  const index = Number(raw);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

/** 端点 → 章内源文本偏移：锚点必须位于 [data-reader-content] 内，且端点必须落在锚点内部 */
function sourceOffsetAt(container: Node | null, offset: number): number | null {
  if (!container) return null;

  const anchor = closestElement(container, `[${SOURCE_START_ATTRIBUTE}]`);
  if (!anchor || !anchor.closest(CONTENT_SELECTOR)) return null;

  const sourceStart = Number(anchor.getAttribute(SOURCE_START_ATTRIBUTE));
  if (!Number.isFinite(sourceStart)) return null;

  // 端点落在锚点之外（例如从标题拖到正文、或跨段件的边界节点）时不予采信：
  // 此时 Range 会被浏览器归一化，算出来的长度与源文本没有对应关系
  if (container !== anchor && !anchor.contains(container)) return null;

  try {
    const localRange = document.createRange();
    localRange.selectNodeContents(anchor);
    localRange.setEnd(container, offset);
    return sourceStart + localRange.toString().length;
  } catch {
    return null;
  }
}

/** 选区 → 章内源文本偏移；任一端点无法锚定时返回 null */
export function computeSelectionOffsets(selection: Selection | null): SelectionOffsets | null {
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  const start = sourceOffsetAt(range.startContainer, range.startOffset);
  const end = sourceOffsetAt(range.endContainer, range.endOffset);
  if (start === null || end === null || end < start) return null;
  return { start, end };
}

/**
 * 对齐 trim：DOM 选区文本可能带首尾空白，而展示与落库用的是 trim 后的文本，
 * 偏移需同步内缩，否则批注起点会落在空白上（表现为高亮向左多染一格）。
 */
export function alignOffsetsWithTrimmedText(
  rawText: string,
  text: string,
  offsets: SelectionOffsets | null
): SelectionOffsets | null {
  if (!offsets) return null;
  const shift = rawText.indexOf(text);
  if (shift <= 0) return offsets;
  const trailing = Math.max(0, rawText.length - shift - text.length);
  const start = offsets.start + shift;
  return { start, end: Math.max(start, offsets.end - trailing) };
}

/** 选区作用域：归属章 + 章内偏移 + 跨章标记 */
export function resolveSelectionScope(selection: Selection | null): SelectionScope {
  if (!selection || selection.rangeCount === 0) {
    return { chapterIndex: null, offsets: null, crossChapter: false };
  }
  const range = selection.getRangeAt(0);
  const startChapter = resolveChapterIndexFromNode(range.startContainer);
  const endChapter = resolveChapterIndexFromNode(range.endContainer);
  const crossChapter = startChapter !== null && endChapter !== null && startChapter !== endChapter;

  return {
    chapterIndex: startChapter ?? endChapter ?? null,
    offsets: crossChapter ? null : computeSelectionOffsets(selection),
    crossChapter,
  };
}
