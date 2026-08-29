import type { MarkdownDocument } from './markdownDocument'

const DEFAULT_ARTICLE_MAX_WIDTH = 680
const LANDSCAPE_ARTICLE_MAX_WIDTH = 960
const ARTICLE_HORIZONTAL_PADDING = 48
const LANDSCAPE_OUTER_GUTTER = 64
const MOBILE_VERTICAL_PADDING = 64
const DESKTOP_VERTICAL_PADDING = 96
const LANDSCAPE_VERTICAL_PADDING = 48
const PAGE_MEASURE_SAFETY = 24
const COLUMNS_PER_SPREAD = 2
const VERTICAL_PAGE_SIDES = 2
const COLUMNS_LARGE_OUTER_GUTTER = 64
const COLUMNS_COMPACT_OUTER_GUTTER = 32
const COLUMNS_LARGE_VERTICAL_PADDING = 56
const COLUMNS_COMPACT_VERTICAL_PADDING = 40
const COLUMNS_LARGE_HORIZONTAL_PADDING = 80
const COLUMNS_COMPACT_HORIZONTAL_PADDING = 48

export interface TextPageLayout {
  articleWidth: number
  contentWidth: number
  verticalPadding: number
  horizontalPadding: number
  pageHeight: number
}

interface TextPageLayoutOptions {
  viewportWidth: number
  viewportHeight: number
  isColumnsLayoutActive: boolean
  isLandscapeViewport: boolean
  isDesktopViewport: boolean
  isLargeViewport: boolean
}

export function getTextPageLayout({
  viewportWidth,
  viewportHeight,
  isColumnsLayoutActive,
  isLandscapeViewport,
  isDesktopViewport,
  isLargeViewport,
}: TextPageLayoutOptions): TextPageLayout {
  if (isColumnsLayoutActive) {
    const outerInlinePadding = isLargeViewport
      ? COLUMNS_LARGE_OUTER_GUTTER
      : COLUMNS_COMPACT_OUTER_GUTTER
    const verticalPadding = isLargeViewport
      ? COLUMNS_LARGE_VERTICAL_PADDING
      : COLUMNS_COMPACT_VERTICAL_PADDING
    const horizontalPadding = isLargeViewport
      ? COLUMNS_LARGE_HORIZONTAL_PADDING
      : COLUMNS_COMPACT_HORIZONTAL_PADDING
    const spreadContentWidth = viewportWidth - outerInlinePadding
    const articleWidth = Math.floor(spreadContentWidth / COLUMNS_PER_SPREAD)

    return {
      articleWidth,
      contentWidth: articleWidth - horizontalPadding,
      verticalPadding,
      horizontalPadding,
      pageHeight: viewportHeight - (verticalPadding * VERTICAL_PAGE_SIDES) - PAGE_MEASURE_SAFETY,
    }
  }

  const landscapeSinglePage = isLandscapeViewport && isDesktopViewport
  const articleWidth = Math.min(
    landscapeSinglePage ? LANDSCAPE_ARTICLE_MAX_WIDTH : DEFAULT_ARTICLE_MAX_WIDTH,
    viewportWidth - (landscapeSinglePage ? LANDSCAPE_OUTER_GUTTER : 0)
  )
  const verticalPadding = landscapeSinglePage
    ? LANDSCAPE_VERTICAL_PADDING
    : isDesktopViewport
      ? DESKTOP_VERTICAL_PADDING
      : MOBILE_VERTICAL_PADDING

  return {
    articleWidth,
    contentWidth: articleWidth - ARTICLE_HORIZONTAL_PADDING,
    verticalPadding,
    horizontalPadding: ARTICLE_HORIZONTAL_PADDING,
    pageHeight: viewportHeight - (verticalPadding * VERTICAL_PAGE_SIDES) - PAGE_MEASURE_SAFETY,
  }
}

/**
 * A trailing thematic break is decorative and must not become an otherwise empty
 * final page in paginated reading mode.
 */
export function getMarkdownPaginationEnd(document: MarkdownDocument): number {
  const lastBlock = document.blocks.at(-1)
  return lastBlock?.type === 'divider' ? lastBlock.start : document.text.length
}
