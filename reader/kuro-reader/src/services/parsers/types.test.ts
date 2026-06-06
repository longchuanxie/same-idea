import { describe, it, expect, expectTypeOf } from 'vitest'

import type {
  BookParser,
  ParsedBook,
  ParsedComicBook,
  ParsedPdfBook,
  ParserProgressCallback,
} from '@/services/parsers/types'
import type { PageRef } from '@/types'

describe('ParsedBook shape', () => {
  it('common fields are required', () => {
    const p: ParsedBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
      imagePages: [],
      imagePageNames: [],
    }
    expect(p.format).toBe('comic')
  })

  it('comic branch requires imagePages and imagePageNames', () => {
    const p: ParsedComicBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
      imagePages: [new Blob()],
      imagePageNames: ['1.jpg'],
      pageRefs: [{ kind: 'image', index: 0 }],
    }
    expect(p.imagePages.length).toBe(1)
    expect(p.imagePageNames.length).toBe(1)
  })

  it('pdf branch requires pdfFile and pdfTotalPages', () => {
    const p: ParsedPdfBook = {
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

describe('ParsedBook enforces branch invariants', () => {
  it('pdf branch rejects missing pdfFile at compile time', () => {
    // @ts-expect-error - pdf branch requires pdfFile
    const bad: ParsedBook = {
      format: 'pdf',
      title: 't',
      coverBlob: new Blob(),
      pdfTotalPages: 1,
    }
    void bad
    expect(true).toBe(true)
  })

  it('comic branch rejects missing imagePages at compile time', () => {
    // @ts-expect-error - comic branch requires imagePages
    const bad: ParsedBook = {
      format: 'comic',
      title: 't',
      coverBlob: new Blob(),
      imagePageNames: [],
    }
    void bad
    expect(true).toBe(true)
  })
})

describe('BookParser interface', () => {
  it('requires canParse and parse', () => {
    const p: BookParser = {
      canParse: f => f.name.endsWith('.test'),
      parse: async () => ({
        format: 'comic' as const,
        title: 'x',
        coverBlob: new Blob(),
        imagePages: [],
        imagePageNames: [],
      }),
    }
    expect(p.canParse({ name: 'a.test' })).toBe(true)
  })

  it('canParse remains backward compatible with DOM File', () => {
    const p: BookParser = {
      canParse: f => f.name.endsWith('.cbz'),
      parse: async () => ({
        format: 'comic' as const,
        title: 'x',
        coverBlob: new Blob(),
        imagePages: [],
        imagePageNames: [],
      }),
    }
    expect(p.canParse(new File([], 'a.cbz'))).toBe(true)
  })

  it('parseStreaming is optional', () => {
    const p: BookParser = {
      canParse: () => true,
      parse: async () => ({
        format: 'comic' as const,
        title: '',
        coverBlob: new Blob(),
        imagePages: [],
        imagePageNames: [],
      }),
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
