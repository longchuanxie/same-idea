export type ReaderPageLayout = 'single' | 'double';
export type ReaderDirection = 'rtl' | 'ltr';
export type ReaderMode = 'vertical' | 'horizontal';
export type PageTurn = 'next' | 'prev';
export type TapZone = 'left' | 'center' | 'right';

const ARROW_LEFT_KEY = 'ArrowLeft';
const ARROW_RIGHT_KEY = 'ArrowRight';
const ARROW_UP_KEY = 'ArrowUp';
const ARROW_DOWN_KEY = 'ArrowDown';
const FIRST_PAGE = 1;
const SINGLE_PAGE_STEP = 1;
const DOUBLE_PAGE_STEP = 2;
const TAP_ZONE_COUNT = 3;
const MIN_SWIPE_DELTA = 0;

const clampPage = (page: number, totalPages: number): number => {
  if (totalPages <= 0) return FIRST_PAGE;
  return Math.max(FIRST_PAGE, Math.min(page, totalPages));
};

export const getHorizontalPageStep = (pageLayout: ReaderPageLayout): number =>
  pageLayout === 'double' ? DOUBLE_PAGE_STEP : SINGLE_PAGE_STEP;

export const getDoublePageSpreadStart = (page: number, totalPages: number): number => {
  if (totalPages <= 0) return FIRST_PAGE;

  const clampedPage = clampPage(page, totalPages);
  const spreadStart = clampedPage % DOUBLE_PAGE_STEP === 0
    ? clampedPage - SINGLE_PAGE_STEP
    : clampedPage;
  const lastSpreadStart = totalPages % DOUBLE_PAGE_STEP === 0
    ? totalPages - SINGLE_PAGE_STEP
    : totalPages;

  return clampPage(Math.min(spreadStart, lastSpreadStart), totalPages);
};

export const getHorizontalPageStart = (
  page: number,
  totalPages: number,
  pageLayout: ReaderPageLayout
): number => {
  if (pageLayout === 'single') return clampPage(page, totalPages);
  return getDoublePageSpreadStart(page, totalPages);
};

export const getHorizontalPageSpread = (
  page: number,
  totalPages: number,
  pageLayout: ReaderPageLayout,
  readingDirection: ReaderDirection
): number[] => {
  if (totalPages <= 0) return [];

  if (pageLayout === 'single') {
    return [clampPage(page, totalPages)];
  }

  const spreadStart = getDoublePageSpreadStart(page, totalPages);
  const pages = [spreadStart];
  const nextPage = spreadStart + SINGLE_PAGE_STEP;
  if (nextPage <= totalPages) {
    pages.push(nextPage);
  }

  return readingDirection === 'rtl' ? [...pages].reverse() : pages;
};

export const getPageSpreadLabel = (pages: number[]): string => {
  if (pages.length === 0) return '';
  const firstPage = Math.min(...pages);
  const lastPage = Math.max(...pages);
  return firstPage === lastPage ? `${firstPage}` : `${firstPage}-${lastPage}`;
};

export const getHorizontalPageTurnTarget = (
  currentPage: number,
  totalPages: number,
  pageLayout: ReaderPageLayout,
  turn: PageTurn
): number => {
  if (totalPages <= 0) return FIRST_PAGE;

  if (pageLayout === 'single') {
    const delta = turn === 'next' ? SINGLE_PAGE_STEP : -SINGLE_PAGE_STEP;
    return clampPage(currentPage + delta, totalPages);
  }

  const spreadStart = getDoublePageSpreadStart(currentPage, totalPages);
  const lastSpreadStart = getDoublePageSpreadStart(totalPages, totalPages);
  const delta = turn === 'next' ? DOUBLE_PAGE_STEP : -DOUBLE_PAGE_STEP;
  return Math.max(FIRST_PAGE, Math.min(spreadStart + delta, lastSpreadStart));
};

export const getTapZone = (clientX: number, viewportWidth: number): TapZone => {
  const zoneWidth = viewportWidth / TAP_ZONE_COUNT;
  if (clientX < zoneWidth) return 'left';
  if (clientX > viewportWidth - zoneWidth) return 'right';
  return 'center';
};

export const getPageTurnForTapZone = (
  tapZone: TapZone,
  readingDirection: ReaderDirection
): PageTurn | null => {
  if (tapZone === 'center') return null;
  if (readingDirection === 'rtl') {
    return tapZone === 'left' ? 'next' : 'prev';
  }
  return tapZone === 'right' ? 'next' : 'prev';
};

export const getPageTurnForSwipe = (
  deltaX: number,
  readingDirection: ReaderDirection
): PageTurn | null => {
  if (deltaX === MIN_SWIPE_DELTA) return null;
  const swipedLeft = deltaX < MIN_SWIPE_DELTA;
  if (readingDirection === 'rtl') {
    return swipedLeft ? 'prev' : 'next';
  }
  return swipedLeft ? 'next' : 'prev';
};

export const getPageTurnForKeyboard = (
  key: string,
  readingMode: ReaderMode,
  readingDirection: ReaderDirection
): PageTurn | null => {
  if (key === ARROW_DOWN_KEY) return 'next';
  if (key === ARROW_UP_KEY) return 'prev';

  if (readingMode === 'vertical') {
    if (key === ARROW_RIGHT_KEY) return 'next';
    if (key === ARROW_LEFT_KEY) return 'prev';
    return null;
  }

  if (readingDirection === 'rtl') {
    if (key === ARROW_LEFT_KEY) return 'next';
    if (key === ARROW_RIGHT_KEY) return 'prev';
    return null;
  }

  if (key === ARROW_RIGHT_KEY) return 'next';
  if (key === ARROW_LEFT_KEY) return 'prev';
  return null;
};
