/**
 * 文本分页纯函数：给定"这段文本是否放得进一页"的测量回调，把章节内容切成页。
 *
 * 测量（DOM 渲染后量高）仍由调用方完成；这里只负责切分策略：
 * 二分查找最大可容纳长度 + 按句读分层回找断点，保证断句完整性。
 */

/** 单页最短字符数（防止死循环/空白页） */
export const MIN_TEXT_PAGE_LENGTH = 1;

/** 二分中点 */
const HALF_DIVISOR = 2;

export interface BreakSearchWindow {
  ratio: number;
  min: number;
  max?: number;
}

/** 断句完整性：分页断点按句读分层停靠——句末最优先，其次子句，最后才按容量硬切 */

/** 句末字符：一整句的结束（含省略号与换行——换行即段落边界） */
export const SENTENCE_END_CHARS = new Set(['。', '！', '？', '；', '…', '.', '!', '?', ';', '\n']);
/** 子句字符：句末缺席时的次优断点（逗号/顿号/冒号/空格） */
export const CLAUSE_BREAK_CHARS = new Set(['，', '、', '：', ',', ':', ' ', '\u3000']);
/** 收尾字符：句末后紧随的引号/括号应并入本页，避免下一页以半个引号开头 */
const TRAILING_CLOSER_CHARS = new Set([
  '"', '"', "'", "'", '』', '」', '）', '】', '》', '〉', ')', ']', '}',
]);

/** 句末回找窗口：断在完整句末比塞满页面更重要，窗口给得更宽 */
const SENTENCE_BREAK_SEARCH: BreakSearchWindow = { ratio: 0.5, min: 80, max: 400 };

/** 子句回找窗口（沿用旧版比例与下限） */
const CLAUSE_BREAK_SEARCH: BreakSearchWindow = { ratio: 0.25, min: 32, max: 120 };

function searchBreakBackward(text: string, best: number, chars: Set<string>, window: BreakSearchWindow): number {
  const proportional = Math.floor(best * window.ratio);
  let range = Math.max(window.min, proportional);
  if (window.max != null) range = Math.min(window.max, range);
  const minBreak = Math.max(MIN_TEXT_PAGE_LENGTH, best - range);
  for (let index = best; index >= minBreak; index--) {
    if (chars.has(text[index - 1])) return index;
  }
  return -1;
}

/** 断点后吞并紧随的收尾引号/括号（不超过容量上限 best） */
function absorbTrailingClosers(text: string, index: number, best: number): number {
  while (index < best && TRAILING_CLOSER_CHARS.has(text[index])) index += 1;
  return index;
}

/**
 * 在 best 附近为分页断点选位：先回找句末（窗口更宽），找不到再回找子句，
 * 都没有则按容量硬切。返回值 ∈ [1, best]，保证切出的页不会溢出。
 */
export function findPreferredBreak(text: string, best: number, search: BreakSearchWindow = CLAUSE_BREAK_SEARCH): number {
  if (best <= MIN_TEXT_PAGE_LENGTH) return best;
  const sentenceIndex = searchBreakBackward(text, best, SENTENCE_END_CHARS, SENTENCE_BREAK_SEARCH);
  if (sentenceIndex >= 0) return absorbTrailingClosers(text, sentenceIndex, best);
  const clauseIndex = searchBreakBackward(text, best, CLAUSE_BREAK_CHARS, search);
  if (clauseIndex >= 0) return clauseIndex;
  return best;
}

/**
 * 按页容量顺序切分整章纯文本：
 * 每页先整段尝试，放不下则二分找最大前缀，再回找句读微调断点。
 *
 * @param content 章节全文
 * @param fitsPage (pageText, isFirstPage) => 是否放得进一页（首页可能含章节标题）
 */
export function splitTextIntoPages(
  content: string,
  fitsPage: (pageText: string, isFirstPage: boolean) => boolean
): string[] {
  const pages: string[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    const isFirstPage = pages.length === 0;

    if (fitsPage(remaining, isFirstPage)) {
      pages.push(remaining);
      break;
    }

    let low = MIN_TEXT_PAGE_LENGTH;
    let high = remaining.length;
    let best = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / HALF_DIVISOR);
      if (fitsPage(remaining.slice(0, mid), isFirstPage)) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    let splitAt = best > 0 ? findPreferredBreak(remaining, best) : MIN_TEXT_PAGE_LENGTH;

    // 回找句读后仍需确保放得下（极端行高抖动时逐字符回退兜底）
    while (splitAt > MIN_TEXT_PAGE_LENGTH && !fitsPage(remaining.slice(0, splitAt), isFirstPage)) {
      splitAt--;
    }

    pages.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }

  return pages.length > 0 ? pages : [''];
}

/** 段落级分页参数（旧版 pre-wrap 分页器，无 Markdown 测量容器时回退使用） */
export interface PaginatePlainTextParams {
  /** 离屏测量元素（调用方持有，函数负责临时改样式并在结束时清理文本） */
  measureEl: HTMLElement;
  content: string;
  containerHeight: number;
  containerWidth: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  firstLineIndent: boolean;
}

/**
 * 旧版段落级分页：按段落逐段累积，超长段落按字符二分拆分。
 * 供无 MarkdownDocument 的纯文本章节使用。
 */
export function paginatePlainText({
  measureEl,
  content,
  containerHeight,
  containerWidth,
  fontSize,
  lineHeight,
  fontFamily,
  firstLineIndent,
}: PaginatePlainTextParams): string[] {
  const paragraphs = content.split('\n');
  const pages: string[] = [];
  let currentPageParagraphs: string[] = [];

  const measureStyle: Partial<CSSStyleDeclaration> = {
    position: 'absolute',
    visibility: 'hidden',
    width: `${containerWidth}px`,
    fontSize: `${fontSize}px`,
    lineHeight: String(lineHeight),
    fontFamily,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    textIndent: firstLineIndent ? '2em' : '0',
  };
  Object.assign(measureEl.style, measureStyle);

  for (const para of paragraphs) {
    // 先测量单独这个段落是否已经超过容器高度
    measureEl.textContent = para;
    const paraHeight = measureEl.scrollHeight;

    if (paraHeight > containerHeight) {
      // 超长段落：先把之前积累的段落封存为一页
      if (currentPageParagraphs.length > 0) {
        pages.push(currentPageParagraphs.join('\n'));
        currentPageParagraphs = [];
      }
      // 按字符二分拆分超长段落
      let remaining = para;
      while (remaining.length > 0) {
        measureEl.textContent = remaining;
        if (measureEl.scrollHeight <= containerHeight) {
          currentPageParagraphs.push(remaining);
          break;
        }
        let lo = 1;
        let hi = remaining.length;
        let best = 1;
        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / HALF_DIVISOR);
          measureEl.textContent = remaining.slice(0, mid);
          if (measureEl.scrollHeight <= containerHeight) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        // 句末窗口已并入 findPreferredBreak 分层策略，子句窗口沿用旧版比例
        const splitAt = findPreferredBreak(remaining, best, { ratio: 0.2, min: 50 });
        pages.push(remaining.slice(0, splitAt));
        remaining = remaining.slice(splitAt);
      }
    } else {
      // 正常段落：追加并检查是否溢出
      currentPageParagraphs.push(para);
      measureEl.textContent = currentPageParagraphs.join('\n');
      const measuredHeight = measureEl.scrollHeight;

      if (measuredHeight > containerHeight && currentPageParagraphs.length > 1) {
        // 当前段落导致溢出，回退一页
        currentPageParagraphs.pop();
        pages.push(currentPageParagraphs.join('\n'));
        currentPageParagraphs = [para];
      }
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join('\n'));
  }

  measureEl.textContent = '';
  return pages;
}
