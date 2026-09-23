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

/** 单页容量上界的默认值：未提供剪枝提示时不设限 */
const UNBOUNDED_PAGE_LENGTH = Number.POSITIVE_INFINITY;

export interface SplitTextIntoPagesOptions {
  /** 单页可容纳字符数的上界（调用方按视口尺寸估算）：
   *  二分搜索窗口从 [1, 剩余全文] 收窄到 [1, 上界]，单次测量的渲染量
   *  从 O(整章剩余) 降到 O(单页)——十万字章节分页的强制回流字节量降两个数量级。
   *  上界偏小时只产生略松的页（每页仍经 fitsPage 验证，绝不溢出），不影响正确性。 */
  maxPageLength?: number;
  /** 容量播种提示（上一页二分得到的最大可容纳长度）：同版式下相邻页容量几乎不变，
   *  从提示值起步探测可跳过整窗二分的大半探针（结果仍为精确最大值，见 findMaxFitLength） */
  searchHint?: number;
}

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

/** 句末回找窗口：断在完整句末优先，但牺牲有上限（max ≈ 5 行）——
 *  长段无句读时为等一个句号留出近整页空白，比段中硬切更伤阅读 */
const SENTENCE_BREAK_SEARCH: BreakSearchWindow = { ratio: 0.5, min: 80, max: 200 };

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

/** 播种起步后的指数外探：步长 1,2,4… 翻倍探测容量上界。容量与提示一致时 2 探针封顶；
 *  漂移 k 个字符时 bracket 收在 O(log k)，交回二分精确定位（外探退出仅因越窗或
 *  首次放不下，两种退出都不丢弃未探测区间，精确性不受影响） */
/**
 * 二分查找文本的最大可容纳前缀长度（配合调用方的测量回调）。
 * 返回 0 表示连最短前缀都放不下。
 * maxPrefix 收窄二分窗口（单次测量的渲染量上界），语义见 splitTextIntoPages。
 * searchHint 为上一页的实测容量：fits 对前缀单调，先探提示值再从命中侧继续，
 * 结果与无提示的纯二分完全一致（仍是精确最大值），只是探针更少。
 */
export function findMaxFitLength(
  text: string,
  fits: (prefix: string) => boolean,
  options: SplitTextIntoPagesOptions = {}
): number {
  const bound = options.maxPageLength != null && options.maxPageLength > 0
    ? options.maxPageLength
    : UNBOUNDED_PAGE_LENGTH;
  let low = MIN_TEXT_PAGE_LENGTH;
  let high = Math.max(MIN_TEXT_PAGE_LENGTH, Math.min(text.length, bound));
  let best = 0;

  const hint = options.searchHint;
  if (hint != null && Number.isFinite(hint) && hint >= low && hint <= high) {
    if (fits(text.slice(0, hint))) {
      best = hint;
      let step = 1;
      let candidate = hint + 1;
      while (candidate <= high && fits(text.slice(0, candidate))) {
        best = candidate;
        step *= 2;
        candidate = best + step;
      }
      low = best + 1;
      if (candidate <= high) high = candidate - 1;
    } else {
      high = hint - 1;
    }
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / HALF_DIVISOR);
    if (fits(text.slice(0, mid))) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return best;
}

/**
 * 按页容量顺序切分整章纯文本：
 * 每页先整段尝试，放不下则二分找最大前缀（窗口受 maxPageLength 剪枝），
 * 再回找句读微调断点。
 *
 * @param content 章节全文
 * @param fitsPage (pageText, isFirstPage) => 是否放得进一页（首页可能含章节标题）
 * @param options.maxPageLength 单页容量上界（字符），用于收窄二分窗口
 */
export function splitTextIntoPages(
  content: string,
  fitsPage: (pageText: string, isFirstPage: boolean) => boolean,
  options: SplitTextIntoPagesOptions = {}
): string[] {
  const pageLengthBound = options.maxPageLength != null && options.maxPageLength > 0
    ? options.maxPageLength
    : UNBOUNDED_PAGE_LENGTH;
  const pages: string[] = [];
  let remaining = content;
  /** 页间容量播种：上一页二分得到的精确容量。同版式相邻页容量几乎恒定
   *  （首页标题差一两行），播种后每页探针从整窗二分的 ~10 次降到 ~2-4 次 */
  let capacityHint = options.searchHint;

  while (remaining.length > 0) {
    const isFirstPage = pages.length === 0;

    // 整章直试仅在剩余 ≤ 上界时进行：剩余超过上界时单页必放不下（fits 对前缀单调），
    // 跳过可让全部测量的渲染量都收在一页量级；上界估计病态偏小时最多多切一页，不影响正确性
    if (remaining.length <= pageLengthBound && fitsPage(remaining, isFirstPage)) {
      pages.push(remaining);
      break;
    }

    const best = findMaxFitLength(remaining, (prefix) => fitsPage(prefix, isFirstPage), {
      maxPageLength: options.maxPageLength,
      searchHint: capacityHint,
    });
    if (best > 0) capacityHint = best;

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
