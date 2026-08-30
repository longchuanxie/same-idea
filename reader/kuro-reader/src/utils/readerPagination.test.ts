import {
  getDoublePageSpreadStart,
  getHorizontalPageSpread,
  getHorizontalPageStart,
  getHorizontalPageTurnTarget,
  getPageSpreadLabel,
  getPageTurnForKeyboard,
  getPageTurnForSwipe,
  getPageTurnForTapZone,
  getTapZone,
  clampTrackRatio,
  pagePositionFromTrackRatio,
} from './readerPagination';

describe('readerPagination', () => {
  it('should normalize double-page spreads to odd start pages', () => {
    expect(getDoublePageSpreadStart(1, 10)).toBe(1);
    expect(getDoublePageSpreadStart(2, 10)).toBe(1);
    expect(getDoublePageSpreadStart(10, 10)).toBe(9);
    expect(getDoublePageSpreadStart(11, 10)).toBe(9);
  });

  it('should keep the last odd page as a single-page spread', () => {
    expect(getDoublePageSpreadStart(9, 9)).toBe(9);
    expect(getHorizontalPageSpread(9, 9, 'double', 'ltr')).toEqual([9]);
  });

  it('should order double-page spreads by reading direction', () => {
    expect(getHorizontalPageSpread(1, 10, 'double', 'ltr')).toEqual([1, 2]);
    expect(getHorizontalPageSpread(1, 10, 'double', 'rtl')).toEqual([2, 1]);
  });

  it('should format spread labels by logical page range', () => {
    expect(getPageSpreadLabel([])).toBe('');
    expect(getPageSpreadLabel([9])).toBe('9');
    expect(getPageSpreadLabel([2, 1])).toBe('1-2');
  });

  it('should align horizontal start pages only in double-page layout', () => {
    expect(getHorizontalPageStart(4, 10, 'single')).toBe(4);
    expect(getHorizontalPageStart(4, 10, 'double')).toBe(3);
  });

  it('should turn by spread in double-page layout', () => {
    expect(getHorizontalPageTurnTarget(1, 10, 'double', 'next')).toBe(3);
    expect(getHorizontalPageTurnTarget(4, 10, 'double', 'next')).toBe(5);
    expect(getHorizontalPageTurnTarget(10, 10, 'double', 'next')).toBe(9);
    expect(getHorizontalPageTurnTarget(4, 10, 'double', 'prev')).toBe(1);
  });

  it('should map tap zones by reading direction', () => {
    expect(getTapZone(10, 300)).toBe('left');
    expect(getTapZone(150, 300)).toBe('center');
    expect(getTapZone(290, 300)).toBe('right');
    expect(getPageTurnForTapZone('right', 'ltr')).toBe('next');
    expect(getPageTurnForTapZone('left', 'ltr')).toBe('prev');
    expect(getPageTurnForTapZone('left', 'rtl')).toBe('next');
    expect(getPageTurnForTapZone('right', 'rtl')).toBe('prev');
  });

  it('should map swipe direction by reading direction', () => {
    expect(getPageTurnForSwipe(-50, 'ltr')).toBe('next');
    expect(getPageTurnForSwipe(50, 'ltr')).toBe('prev');
    expect(getPageTurnForSwipe(50, 'rtl')).toBe('next');
    expect(getPageTurnForSwipe(-50, 'rtl')).toBe('prev');
  });

  it('should map keyboard arrows by reading mode and direction', () => {
    expect(getPageTurnForKeyboard('ArrowDown', 'vertical', 'rtl')).toBe('next');
    expect(getPageTurnForKeyboard('ArrowUp', 'vertical', 'rtl')).toBe('prev');
    expect(getPageTurnForKeyboard('ArrowRight', 'vertical', 'rtl')).toBe('next');
    expect(getPageTurnForKeyboard('ArrowLeft', 'vertical', 'rtl')).toBe('prev');
    expect(getPageTurnForKeyboard('ArrowLeft', 'horizontal', 'rtl')).toBe('next');
    expect(getPageTurnForKeyboard('ArrowRight', 'horizontal', 'rtl')).toBe('prev');
    expect(getPageTurnForKeyboard('ArrowRight', 'horizontal', 'ltr')).toBe('next');
    expect(getPageTurnForKeyboard('Escape', 'horizontal', 'ltr')).toBeNull();
  });
});

describe('pagePositionFromTrackRatio', () => {
  it('垂直模式：pos=ratio*T 拆为 floor+1 页与页内余量，落点与拇指一致', () => {
    expect(pagePositionFromTrackRatio(0, 10, 'vertical')).toEqual({ page: 1, pageScrollRatio: 0 });
    expect(pagePositionFromTrackRatio(0.15, 10, 'vertical')).toEqual({ page: 2, pageScrollRatio: 0.5 });
    expect(pagePositionFromTrackRatio(0.5, 3, 'vertical')).toEqual({ page: 2, pageScrollRatio: 0.5 });
    expect(pagePositionFromTrackRatio(1, 3, 'vertical')).toEqual({ page: 3, pageScrollRatio: 1 });
  });

  it('垂直模式：旧 round 映射会回跳的用例现在不回跳', () => {
    // ratio=0.49,T=3: pos=1.47 → 第 2 页页内 0.47；round 会得第 1 页(拇指落到 0)
    expect(pagePositionFromTrackRatio(0.49, 3, 'vertical')).toEqual({ page: 2, pageScrollRatio: 0.47 });
  });

  it('水平模式：按页对齐(round)，页内占比恒 0', () => {
    expect(pagePositionFromTrackRatio(0.34, 3, 'horizontal')).toEqual({ page: 1, pageScrollRatio: 0 });
    expect(pagePositionFromTrackRatio(0.5, 3, 'horizontal')).toEqual({ page: 2, pageScrollRatio: 0 });
    expect(pagePositionFromTrackRatio(1, 3, 'horizontal')).toEqual({ page: 3, pageScrollRatio: 0 });
    expect(pagePositionFromTrackRatio(0, 3, 'horizontal')).toEqual({ page: 1, pageScrollRatio: 0 });
  });

  it('比例与页数越界钳制', () => {
    expect(pagePositionFromTrackRatio(-0.5, 3, 'vertical')).toEqual({ page: 1, pageScrollRatio: 0 });
    expect(pagePositionFromTrackRatio(1.7, 3, 'vertical')).toEqual({ page: 3, pageScrollRatio: 1 });
    expect(pagePositionFromTrackRatio(0.5, 0, 'vertical')).toEqual({ page: 1, pageScrollRatio: 0 });
    expect(pagePositionFromTrackRatio(0.5, -2, 'horizontal')).toEqual({ page: 1, pageScrollRatio: 0 });
  });

  it('单页书任何比例都落在第 1 页', () => {
    expect(pagePositionFromTrackRatio(0.3, 1, 'vertical')).toEqual({ page: 1, pageScrollRatio: 0.3 });
    expect(pagePositionFromTrackRatio(0.9, 1, 'horizontal')).toEqual({ page: 1, pageScrollRatio: 0 });
  });

  it('clampTrackRatio 钳制 0..1', () => {
    expect(clampTrackRatio(-1)).toBe(0);
    expect(clampTrackRatio(0.42)).toBe(0.42);
    expect(clampTrackRatio(2)).toBe(1);
  });
})
