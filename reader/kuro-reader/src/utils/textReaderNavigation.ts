const PREVIOUS_PAGE_TAP_RATIO = 0.3
const NEXT_PAGE_TAP_RATIO = 0.7

export type PaginatedTapAction = 'previous' | 'next' | 'toggle-ui' | 'ignore'

interface PaginatedTapOptions {
  clientOffsetX: number
  viewportWidth: number
  isButton: boolean
  isUiControl: boolean
  isHorizontalScrollRegion: boolean
}

export function getPaginatedTapAction({
  clientOffsetX,
  viewportWidth,
  isButton,
  isUiControl,
  isHorizontalScrollRegion,
}: PaginatedTapOptions): PaginatedTapAction {
  if (viewportWidth <= 0 || isButton) return 'ignore'
  if (isUiControl && !isHorizontalScrollRegion) return 'ignore'

  if (clientOffsetX < viewportWidth * PREVIOUS_PAGE_TAP_RATIO) return 'previous'
  if (clientOffsetX > viewportWidth * NEXT_PAGE_TAP_RATIO) return 'next'

  // The center of a scrollable code/table/diagram keeps its native interaction.
  return isHorizontalScrollRegion ? 'ignore' : 'toggle-ui'
}

export function getNextTextPageIndex(
  currentPageIndex: number,
  totalPages: number,
  pageStep: number
): number | null {
  const nextPageIndex = currentPageIndex + pageStep
  return nextPageIndex < totalPages ? nextPageIndex : null
}
