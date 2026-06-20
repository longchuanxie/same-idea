import { describe, it, expect, expectTypeOf } from 'vitest'

import type { Comic, Chapter, ReadingProgress, BookFormat, PageRef } from '@/types'

describe('BookFormat type', () => {
  it('accepts comic and pdf literals', () => {
    const a: BookFormat = 'comic'
    const b: BookFormat = 'pdf'
    expect(a).toBe('comic')
    expect(b).toBe('pdf')
  })
})

describe('PageRef discriminated union', () => {
  it('image variant has index', () => {
    const ref: PageRef = { kind: 'image', index: 0 }
    expect(ref.kind).toBe('image')
    if (ref.kind === 'image') {
      expectTypeOf(ref.index).toBeNumber()
    }
  })

  it('pdf-page variant has pageNumber', () => {
    const ref: PageRef = { kind: 'pdf-page', pageNumber: 1 }
    expect(ref.kind).toBe('pdf-page')
    if (ref.kind === 'pdf-page') {
      expectTypeOf(ref.pageNumber).toBeNumber()
    }
  })
})

describe('Comic.format backward compatibility', () => {
  it('format is optional (legacy comics have no format field)', () => {
    const legacy: Comic = {
      id: '1',
      title: 't',
      author: '',
      cover: '',
      genres: [],
      tags: [],
      description: '',
      status: 'ongoing',
      totalChapters: 0,
      chapters: [],
      addedAt: new Date(0),
      isFavorite: false,
    }
    expect(legacy.format).toBeUndefined()
  })

  it('format can be set to pdf', () => {
    const c: Partial<Comic> = { format: 'pdf' }
    expect(c.format).toBe('pdf')
  })
})

describe('Chapter.pageRefs is optional', () => {
  it('omitted pageRefs is allowed', () => {
    const c: Partial<Chapter> = {
      id: 'a',
      bookId: 'b',
      number: 1,
      title: 't',
      pages: ['1.jpg'],
      status: 'unread',
    }
    expect(c.pageRefs).toBeUndefined()
  })

  it('pageRefs accepts PageRef[]', () => {
    const c: Partial<Chapter> = {
      pageRefs: [{ kind: 'pdf-page', pageNumber: 1 }],
    }
    expect(c.pageRefs?.[0].kind).toBe('pdf-page')
  })
})

describe('ReadingProgress.locator is optional', () => {
  it('omitted locator is allowed', () => {
    const p: Partial<ReadingProgress> = { bookId: 'a', chapterId: 'b', page: 1 }
    expect(p.locator).toBeUndefined()
  })
})
