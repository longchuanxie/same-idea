import { describe, it, expect } from 'vitest'

import { getParserForFile } from '@/services/parsers'
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'

describe('getParserForFile', () => {
  it.each(['a.zip', 'a.cbz', 'a.rar', 'a.cbr'])('returns ComicArchiveParser for %s', name => {
    const parser = getParserForFile(new File([], name))
    expect(parser).toBeInstanceOf(ComicArchiveParser)
  })

  it('returns null for unsupported format (.pdf in Phase 1)', () => {
    const parser = getParserForFile(new File([], 'a.pdf'))
    expect(parser).toBeNull()
  })

  it('returns null for unsupported format (.txt)', () => {
    expect(getParserForFile(new File([], 'a.txt'))).toBeNull()
  })

  it('case insensitive', () => {
    expect(getParserForFile(new File([], 'A.ZIP'))).toBeInstanceOf(ComicArchiveParser)
  })
})
