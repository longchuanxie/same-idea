import { describe, it, expect } from 'vitest'

import { extractTitleFromFileName } from '@/utils/extractTitle'

describe('extractTitleFromFileName', () => {
  it('strips extension', () => {
    expect(extractTitleFromFileName('葬送的芙莉莲.zip')).toBe('葬送的芙莉莲')
    expect(extractTitleFromFileName('book.pdf')).toBe('book')
  })
  it('skips leading label brackets and keeps the real title', () => {
    expect(extractTitleFromFileName('【漫画】葬送的芙莉莲.zip')).toBe('葬送的芙莉莲')
    expect(extractTitleFromFileName('[group]title.zip')).toBe('title')
    expect(extractTitleFromFileName('[MC]_葬送的芙莉莲_v01.zip')).toBe('葬送的芙莉莲 v01')
  })
  it('strips trailing tag brackets in the body', () => {
    expect(extractTitleFromFileName('[MC]葬送的芙莉莲[Vol.1][Digital].zip')).toBe('葬送的芙莉莲')
    expect(extractTitleFromFileName('葬送的芙莉莲【完结】.zip')).toBe('葬送的芙莉莲')
  })
  it('keeps volume markers to avoid title collision across volumes', () => {
    expect(extractTitleFromFileName('一拳超人 第01卷.zip')).toBe('一拳超人 第01卷')
    expect(extractTitleFromFileName('One Piece Vol. 100.zip')).toBe('One Piece Vol. 100')
  })
  it('restores dot separators for non-CJK names', () => {
    expect(extractTitleFromFileName('Harry.Potter.Vol.2.zip')).toBe('Harry Potter Vol 2')
  })
  it('falls back to first bracket content when name is all labels', () => {
    expect(extractTitleFromFileName('【仅简介】.zip')).toBe('仅简介')
  })
  it('strips leading bracket-like chars when no bracket pair', () => {
    expect(extractTitleFromFileName('  title.zip')).toBe('title')
  })
  it('falls back to original filename when result empty', () => {
    expect(extractTitleFromFileName('.zip')).toBe('.zip')
  })
  it('handles no extension', () => {
    expect(extractTitleFromFileName('plain')).toBe('plain')
  })
})
