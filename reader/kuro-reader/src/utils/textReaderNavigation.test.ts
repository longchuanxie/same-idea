import { describe, expect, it } from 'vitest'

import { getNextTextPageIndex, getPaginatedTapAction } from './textReaderNavigation'

describe('getPaginatedTapAction', () => {
  it('allows edge page turns from a horizontally scrollable code block', () => {
    expect(getPaginatedTapAction({
      clientOffsetX: 900,
      viewportWidth: 1000,
      isButton: false,
      isUiControl: true,
      isHorizontalScrollRegion: true,
    })).toBe('next')
  })

  it('preserves native code-block interaction in the center region', () => {
    expect(getPaginatedTapAction({
      clientOffsetX: 500,
      viewportWidth: 1000,
      isButton: false,
      isUiControl: true,
      isHorizontalScrollRegion: true,
    })).toBe('ignore')
  })

  it('never treats toolbar buttons as page turns', () => {
    expect(getPaginatedTapAction({
      clientOffsetX: 900,
      viewportWidth: 1000,
      isButton: true,
      isUiControl: true,
      isHorizontalScrollRegion: true,
    })).toBe('ignore')
  })
})

describe('getNextTextPageIndex', () => {
  it('advances by a complete spread in two-page mode', () => {
    expect(getNextTextPageIndex(0, 5, 2)).toBe(2)
    expect(getNextTextPageIndex(2, 5, 2)).toBe(4)
  })

  it('returns chapter-end instead of an odd right-page index', () => {
    expect(getNextTextPageIndex(2, 4, 2)).toBeNull()
  })
})
