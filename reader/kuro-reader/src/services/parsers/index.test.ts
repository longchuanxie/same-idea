import { describe, it, expect } from 'vitest'

import { getParserForFile } from '@/services/parsers'
import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'
import { EpubParser } from '@/services/parsers/epubParser'
import { TextParser } from '@/services/parsers/textParser'

describe('getParserForFile', () => {
  it.each(['a.zip', 'a.cbz', 'a.rar', 'a.cbr'])('returns ComicArchiveParser for %s', name => {
    const parser = getParserForFile(new File([], name))
    expect(parser).toBeInstanceOf(ComicArchiveParser)
  })

  it('returns EpubParser for .epub', () => {
    expect(getParserForFile(new File([], 'a.epub'))).toBeInstanceOf(EpubParser)
  })

  it('returns TextParser for .txt', () => {
    expect(getParserForFile(new File([], 'a.txt'))).toBeInstanceOf(TextParser)
  })

  it('returns null for unsupported format (.pdf)', () => {
    const parser = getParserForFile(new File([], 'a.pdf'))
    expect(parser).toBeNull()
  })

  it('case insensitive', () => {
    expect(getParserForFile(new File([], 'A.ZIP'))).toBeInstanceOf(ComicArchiveParser)
    expect(getParserForFile(new File([], 'A.TXT'))).toBeInstanceOf(TextParser)
    expect(getParserForFile(new File([], 'A.EPUB'))).toBeInstanceOf(EpubParser)
  })
})
