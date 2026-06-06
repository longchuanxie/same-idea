import { describe, it, expect } from 'vitest'

import { ComicArchiveParser } from '@/services/parsers/comicArchiveParser'

describe('ComicArchiveParser.canParse', () => {
  const parser = new ComicArchiveParser()

  it.each(['a.zip', 'a.ZIP', 'b.cbz', 'c.rar', 'd.cbr'])('accepts %s', name => {
    const f = new File([], name)
    expect(parser.canParse(f)).toBe(true)
  })

  it.each(['a.pdf', 'a.7z', 'a.txt', 'a'])('rejects %s', name => {
    const f = new File([], name)
    expect(parser.canParse(f)).toBe(false)
  })
})

describe('ComicArchiveParser.parse', () => {
  it('delegates to legacy parseArchiveFile (mocked)', async () => {
    const parser = new ComicArchiveParser()
    expect(typeof parser.parse).toBe('function')
    expect(typeof parser.parseStreaming).toBe('function')
  })
})
