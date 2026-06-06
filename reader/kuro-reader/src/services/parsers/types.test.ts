import { describe, it, expect, expectTypeOf } from 'vitest'

import type { BookParser, ParsedBook, ParserProgressCallback } from '@/services/parsers/types'
import type { BookFormat, PageRef } from '@/types'

describe('ParsedBook shape', () => {
  it('common fields are required', () => {
    const p: ParsedBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
    }
    expect(p.format).toBe('comic')
  })

  it('comic-specific fields are optional', () => {
    const p: ParsedBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
      imagePages: [new Blob()],
      imagePageNames: ['1.jpg'],
      pageRefs: [{ kind: 'image', index: 0 }],
    }
    expect(p.imagePages?.length).toBe(1)
  })

  it('pdf-specific fields are optional', () => {
    const p: ParsedBook = {
      format: 'pdf',
      title: 't',
      coverBlob: new Blob(),
      pdfFile: new Blob(),
      pdfTotalPages: 100,
      pageRefs: [{ kind: 'pdf-page', pageNumber: 1 }],
    }
    expect(p.pdfTotalPages).toBe(100)
  })
})

describe('BookParser interface', () => {
  it('requires canParse and parse', () => {
    const p: BookParser = {
      canParse: f => f.name.endsWith('.test'),
      parse: async () => ({
        format: 'comic' as BookFormat,
        title: 'x',
        coverBlob: new Blob(),
      }),
    }
    expect(p.canParse(new File([], 'a.test'))).toBe(true)
  })

  it('parseStreaming is optional', () => {
    const p: BookParser = {
      canParse: () => true,
      parse: async () => ({ format: 'comic', title: '', coverBlob: new Blob() }),
    }
    expect(p.parseStreaming).toBeUndefined()
  })
})

describe('ParserProgressCallback signature', () => {
  it('accepts number 0-100', () => {
    const cb: ParserProgressCallback = pct => {
      expectTypeOf(pct).toBeNumber()
    }
    cb(50)
  })
})

describe('PageRef inside ParsedBook', () => {
  it('image variant narrows', () => {
    const ref: PageRef = { kind: 'image', index: 3 }
    if (ref.kind === 'image') {
      expect(ref.index).toBe(3)
    }
  })
})
