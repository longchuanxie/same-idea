import { describe, expect, it } from 'vitest'

import {
  clampProgressRatio,
  getOverallReadingPercent,
  getOverallReadingRatio,
} from './readingProgress'

describe('reading progress helpers', () => {
  it('clamps invalid and out-of-range chapter ratios', () => {
    expect(clampProgressRatio(Number.NaN)).toBe(0)
    expect(clampProgressRatio(-1)).toBe(0)
    expect(clampProgressRatio(2)).toBe(1)
  })

  it('combines chapter position and chapter progress into whole-book progress', () => {
    expect(getOverallReadingRatio(0, 4, 0.5)).toBe(0.125)
    expect(getOverallReadingPercent(1, 4, 0.5)).toBe(38)
    expect(getOverallReadingPercent(3, 4, 1)).toBe(100)
  })

  it('handles missing chapters without producing invalid percentages', () => {
    expect(getOverallReadingPercent(0, 0, 0.42)).toBe(42)
  })
})
