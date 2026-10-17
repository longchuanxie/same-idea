/**
 * Markdown 块级分页纯函数：给定逐块实测高度与块内切片测量回调，把章节切成页。
 *
 * 测量（DOM 量高）由调用方注入；这里只负责切分策略：
 * - 块按序累积，放不下的可拆块（段落/引用/列表项）先填满当前页再续排；
 * - 高过整页的块按容量逐页拆分，块尾残余过短时与上一片对半均衡（孤尾短页）；
 * - 段间 '\n\n' 空白永不独立成页（连续超整页段落链曾把间隙切成整页空白）。
 */

import type { MarkdownBlock, MarkdownSpan } from '@/utils/markdownDocument'

import {
  findMaxFitLength,
  findPreferredBreak,
  MIN_TEXT_PAGE_LENGTH,
} from './textPagination'

/** 块填充当前页的最小前缀量（字符，约一行）：低于此值整块搬移，避免碎页 */
export const MIN_FILL_SPLIT_CHARS = 40

/** 孤尾均衡阈值（字符）：块尾残余短于此值时与上一片对半重分，避免两三行的尾页 */
export const MIN_TAIL_BALANCE_CHARS = 100

/** 对半重分的搜索窗口余量：句读回找可能把断点拉回半页之前，留出弹性 */
const BALANCE_WINDOW_CHARS = 60

/** 块内拆页的测量上下文：拆分发生在段内时，渲染宽度受块样式影响，
 *  切片是否块首决定段首缩进（与渲染侧 visibleStart === block.start 对齐） */
export interface SplitMeasureContext {
  kind: 'paragraph' | 'blockquote' | 'list-item'
  listDepth?: number
  atBlockStart: boolean
}

export interface MarkdownBlockPaginationParams {
  text: string
  /** 参与分页的块（调用方已按 paginationEnd 过滤，序号与 measureBlockHeight 对齐） */
  blocks: MarkdownBlock[]
  spans: MarkdownSpan[]
  /** 可用页高（已扣 padding/安全余量/自校准收缩） */
  pageHeight: number
  /** 首页章节标题占用高度（无标题传 0） */
  titleHeight: number
  /** 单页容量上界（字符），收窄二分窗口 */
  pageLengthUpperBound: number
  /** 分页终点（text 偏移；末尾装饰性分隔线不成分页内容） */
  endOffset: number
  /** 逐块实测高度（含上下 margin），入参序号对应过滤后的 blocks */
  measureBlockHeight: (blockIndex: number) => number
  /** 块内切片测量：返回该前缀文本在此块样式下的渲染高度 */
  measureSplitHeight: (
    prefix: string,
    includeChapterTitle: boolean,
    context: SplitMeasureContext
  ) => number
}

export function paginateMarkdownBlocks({
  text,
  blocks,
  spans,
  pageHeight,
  titleHeight,
  pageLengthUpperBound,
  endOffset,
  measureBlockHeight,
  measureSplitHeight,
}: MarkdownBlockPaginationParams): string[] {
  const pages: string[] = []
  let pageStart = 0
  let usedHeight = 0

  const fitsSplit = (
    prefix: string,
    includeChapterTitle: boolean,
    context: SplitMeasureContext
  ): boolean => measureSplitHeight(prefix, includeChapterTitle, context) <= pageHeight

  const pushPage = (end: number) => {
    if (end <= pageStart) return
    const slice = text.slice(pageStart, end)
    // 段间空白不成页：块尾对齐的断点会让下一片从 '\n\n' 开始，
    // 高过整页的段落链曾把这 2 字符间隙推成整页空白。
    // 不推进游标——间隙字符随下一页顺带携带，保证页面切片仍完整平铺原文
    // （渲染侧按页长累积偏移裁剪窗口/锚定批注，丢字符会逐页漂移）
    if (!slice.trim()) return
    pages.push(slice)
    pageStart = end
    usedHeight = 0
  }

  const blockContext = (block: MarkdownBlock, atBlockStart: boolean): SplitMeasureContext => ({
    kind: block.type as SplitMeasureContext['kind'],
    listDepth: block.listDepth,
    atBlockStart,
  })

  /** 超高块按容量逐页拆分；返回尾片起点（循环退出时残余已可整片入页） */
  const splitBlockByCapacity = (block: MarkdownBlock, startOffset: number): number => {
    let cursor = startOffset
    while (cursor < block.end) {
      const includeChapterTitle = pages.length === 0
      const remainingText = text.slice(cursor, block.end)
      const context = blockContext(block, cursor === block.start)
      if (fitsSplit(remainingText, includeChapterTitle, context)) break

      const best = findMaxFitLength(
        remainingText,
        (prefix) => fitsSplit(prefix, includeChapterTitle, context),
        { maxPageLength: pageLengthUpperBound }
      )
      const splitLength = Math.max(MIN_TEXT_PAGE_LENGTH, findPreferredBreak(remainingText, best))
      pushPage(cursor + splitLength)
      cursor += splitLength
    }
    return cursor
  }

  /** 孤尾均衡：撤销本块最后一片，与过短尾片合并后对半重分；
   *  两半都必须实测放得下，任一放不下即回退贪心切分（宁可短尾不可溢出） */
  const balanceTailPage = (block: MarkdownBlock, tailStart: number) => {
    const tailLength = block.end - tailStart
    if (tailLength >= MIN_TAIL_BALANCE_CHARS || tailStart <= block.start) {
      if (pageStart < block.end) pushPage(block.end)
      return
    }
    const lastPage = pages[pages.length - 1]
    if (!lastPage || !lastPage.trim()) {
      if (pageStart < block.end) pushPage(block.end)
      return
    }
    const greedyStart = tailStart - lastPage.length
    pages.pop()
    pageStart = greedyStart

    const combined = text.slice(pageStart, block.end)
    const includeChapterTitle = pages.length === 0
    const firstContext = blockContext(block, pageStart === block.start)
    const halfUpper = Math.ceil(combined.length / 2) + BALANCE_WINDOW_CHARS
    const bestHalf = findMaxFitLength(
      combined,
      (prefix) => fitsSplit(prefix, includeChapterTitle, firstContext),
      { maxPageLength: halfUpper }
    )
    const breakAt = bestHalf >= MIN_TEXT_PAGE_LENGTH
      ? findPreferredBreak(combined, bestHalf)
      : MIN_TEXT_PAGE_LENGTH
    const secondSlice = combined.slice(breakAt)
    const secondFits = breakAt >= MIN_TEXT_PAGE_LENGTH
      && fitsSplit(secondSlice, false, blockContext(block, false))

    if (secondFits) {
      pushPage(pageStart + breakAt)
      pushPage(block.end)
    } else {
      pages.push(lastPage)
      pageStart = tailStart
      pushPage(block.end)
    }
  }

  blocks.forEach((block, blockIndex) => {
    const blockHeight = measureBlockHeight(blockIndex)
    const availableHeight = pageHeight - (pages.length === 0 ? titleHeight : 0)
    const containsImage = spans.some(
      (span) => span.type === 'image' && span.start < block.end && span.end > block.start
    )
    const canSplitInside = !containsImage && (
      block.type === 'paragraph'
      || block.type === 'blockquote'
      || block.type === 'list-item'
    )

    // 块放不进当前页剩余空间：可拆块先用前段填满（老行为整块搬移，块越高留白越大），
    // 填充量不足最小行文量时退回整块搬移；残余与后续块在新页正常累积
    if (usedHeight > 0 && usedHeight + blockHeight > availableHeight) {
      let fillLen: number | null = null
      if (canSplitInside) {
        const remainingSpace = availableHeight - usedHeight
        const blockText = text.slice(block.start, block.end)
        const fitLen = findMaxFitLength(
          blockText,
          (prefix) => measureSplitHeight(prefix, false, blockContext(block, true)) <= remainingSpace,
          { maxPageLength: pageLengthUpperBound }
        )
        if (fitLen >= MIN_FILL_SPLIT_CHARS) {
          const breakAt = findPreferredBreak(blockText, fitLen)
          fillLen = breakAt >= MIN_FILL_SPLIT_CHARS ? breakAt : null
        }
      }
      if (fillLen != null) {
        pushPage(block.start + fillLen)
        // 残余不足一整页：留在新页与后续块继续累积；超高残余按行拆分续排——
        // 整块封页会被 overflow-hidden 裁掉超出页高的部分，正文就读不到了
        const residualStart = block.start + fillLen
        const residualText = text.slice(residualStart, block.end)
        const residualHeight = measureSplitHeight(residualText, false, blockContext(block, false))
        if (residualHeight <= pageHeight) {
          usedHeight = residualHeight
          return
        }
        const tailStart = splitBlockByCapacity(block, residualStart)
        balanceTailPage(block, tailStart)
        return
      }
      pushPage(block.start)
    }

    const freshAvailableHeight = pageHeight - (pages.length === 0 ? titleHeight : 0)

    if (blockHeight > freshAvailableHeight && canSplitInside) {
      if (pageStart < block.start) pushPage(block.start)
      const tailStart = splitBlockByCapacity(block, block.start)
      balanceTailPage(block, tailStart)
      return
    }

    usedHeight += blockHeight
  })

  pushPage(endOffset)
  return pages
}
