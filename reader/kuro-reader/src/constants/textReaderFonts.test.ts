import { describe, expect, it } from 'vitest'

import { getTextReaderFontFamily, TEXT_READER_FONT_OPTIONS } from './textReaderFonts'

describe('text reader font presets', () => {
  it('provides unique font families', () => {
    const families = TEXT_READER_FONT_OPTIONS.map((option) => option.family)

    expect(new Set(families).size).toBe(families.length)
  })

  it('resolves every preset to its configured font stack', () => {
    for (const option of TEXT_READER_FONT_OPTIONS) {
      expect(getTextReaderFontFamily(option.family)).toBe(option.fontFamily)
    }
  })
})
