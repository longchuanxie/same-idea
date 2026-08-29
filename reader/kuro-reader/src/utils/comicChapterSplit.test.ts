import { describe, it, expect } from 'vitest'

import {
  naturalCompare,
  matchChapterNumber,
  splitByDirectories,
  splitByFilenameSequence,
  splitByImageAspect,
  splitComicChapters,
} from '@/utils/comicChapterSplit'

const p = (...parts: string[]) => parts.join('/')

describe('naturalCompare', () => {
  it('compares numbers numerically', () => {
    expect(naturalCompare('page-2.jpg', 'page-10.jpg')).toBeLessThan(0)
    expect(naturalCompare('第2话/1.jpg', '第10话/1.jpg')).toBeLessThan(0)
    expect(naturalCompare('a1.jpg', 'a1.jpg')).toBe(0)
  })
})

describe('matchChapterNumber', () => {
  it.each([
    ['第01话', 1],
    ['第 12 章xxx', 12],
    ['第三话', null], // 中文数字不支持（与文本章节拆分一致的取舍）
    ['Chapter 5', 5],
    ['ch.7', 7],
    ['Vol. 2', 2],
    ['EP03', 3],
    ['01话', 1],
    ['12', 12],
    ['番外篇', null],
  ])('%s → %s', (name, expected) => {
    expect(matchChapterNumber(name)).toBe(expected)
  })
})

describe('splitByDirectories (L1)', () => {
  it('groups by folder and sorts by chapter number', () => {
    const drafts = splitByDirectories([
      p('第02话', '002.jpg'),
      p('第01话', '002.jpg'),
      p('第01话', '001.jpg'),
      p('第02话', '001.jpg'),
    ])
    expect(drafts).not.toBeNull()
    expect(drafts!.map((d) => d.title)).toEqual(['第01话', '第02话'])
    expect(drafts![0].paths).toEqual([p('第01话', '001.jpg'), p('第01话', '002.jpg')])
  })

  it('supports English patterns and pure-number folders', () => {
    const drafts = splitByDirectories([
      p('Chapter 10', 'a.jpg'),
      p('Chapter 2', 'a.jpg'),
      p('Chapter 2', 'b.jpg'),
    ])
    expect(drafts!.map((d) => d.title)).toEqual(['Chapter 2', 'Chapter 10'])

    const numbered = splitByDirectories([p('01', 'a.jpg'), p('02', 'a.jpg')])
    expect(numbered!.map((d) => d.title)).toEqual(['第 1 话', '第 2 话'])
  })

  it('root-level loose images become a leading 开篇 chapter', () => {
    const drafts = splitByDirectories([
      'cover.jpg',
      p('第01话', '001.jpg'),
      p('第02话', '001.jpg'),
    ])
    expect(drafts!.map((d) => d.title)).toEqual(['开篇', '第01话', '第02话'])
    expect(drafts![0].paths).toEqual(['cover.jpg'])
  })

  it('falls back one level up on oversplit (per-page inner folders)', () => {
    const drafts = splitByDirectories([
      p('Ch.001', '0001', '001.jpg'),
      p('Ch.001', '0002', '001.jpg'),
      p('Ch.002', '0001', '001.jpg'),
    ])
    expect(drafts).not.toBeNull()
    expect(drafts!.map((d) => d.title)).toEqual(['Ch.001', 'Ch.002'])
    expect(drafts![0].paths).toHaveLength(2)
  })

  it('returns null for flat archives and single folders', () => {
    expect(splitByDirectories(['001.jpg', '002.jpg'])).toBeNull()
    expect(splitByDirectories([p('only', '001.jpg'), p('only', '002.jpg')])).toBeNull()
  })
})

describe('splitByFilenameSequence (L2)', () => {
  it('groups single-run names by head prefix (a001…/b001…)', () => {
    const drafts = splitByFilenameSequence([
      'a001.jpg', 'a002.jpg', 'b001.jpg', 'b002.jpg',
    ])
    expect(drafts).not.toBeNull()
    expect(drafts!.length).toBe(2)
    expect(drafts![0].paths).toEqual(['a001.jpg', 'a002.jpg'])
  })

  it('groups by head + first number run (c01_001 / c02_001)', () => {
    const drafts = splitByFilenameSequence([
      'c01_001.jpg', 'c01_002.jpg', 'c02_001.jpg', 'c02_002.jpg',
    ])
    expect(drafts!.length).toBe(2)
    expect(drafts![1].paths).toEqual(['c02_001.jpg', 'c02_002.jpg'])
  })

  it('returns null when there is no meaningful signal', () => {
    expect(splitByFilenameSequence(['001.jpg', '002.jpg', '003.jpg', '004.jpg'])).toBeNull()
    expect(splitByFilenameSequence(['a.jpg', 'b.jpg'])).toBeNull()
  })
})

describe('splitByImageAspect (L3)', () => {
  it('one chapter per tall image', () => {
    const paths = ['strip1.png', 'strip2.png', 'strip3.png']
    const sizes = [
      { width: 800, height: 8000 },
      { width: 750, height: 9000 },
      { width: 800, height: 3000 },
    ]
    const drafts = splitByImageAspect(paths, sizes)
    expect(drafts!.length).toBe(3)
    expect(drafts![0].title).toBe('第 1 话')
    expect(drafts![0].paths).toEqual(['strip1.png'])
  })

  it('returns null when any image is page-shaped', () => {
    const drafts = splitByImageAspect(['a.png', 'b.png'], [
      { width: 800, height: 8000 },
      { width: 1400, height: 2000 },
    ])
    expect(drafts).toBeNull()
  })

  it('returns null for missing sizes', () => {
    expect(splitByImageAspect(['a.png'], [null])).toBeNull()
    expect(splitByImageAspect(['a.png', 'b.png'], [{ width: 1, height: 9 }])).toBeNull()
  })
})

describe('splitComicChapters chain', () => {
  it('directory layer wins over filename layer', () => {
    const drafts = splitComicChapters([
      p('第01话', '001.jpg'), p('第01话', '001.jpg'),
      p('第02话', '001.jpg'), p('第02话', '001.jpg'),
    ])
    expect(drafts!.map((d) => d.title)).toEqual(['第01话', '第02话'])
  })

  it('falls through to filename layer for flat archives', () => {
    const drafts = splitComicChapters(['x001.jpg', 'x002.jpg', 'y001.jpg', 'y002.jpg'])
    expect(drafts).not.toBeNull()
    expect(drafts!.length).toBe(2)
  })

  it('returns null when no layer matches', () => {
    expect(splitComicChapters(['001.jpg', '002.jpg', '003.jpg'])).toBeNull()
  })
})
