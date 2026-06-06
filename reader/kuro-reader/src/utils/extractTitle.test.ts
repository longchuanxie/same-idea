import { describe, it, expect } from 'vitest'

import { extractTitleFromFileName } from '@/utils/extractTitle'

describe('extractTitleFromFileName', () => {
  it('strips extension', () => {
    expect(extractTitleFromFileName('葬送的芙莉莲.zip')).toBe('葬送的芙莉莲')
    expect(extractTitleFromFileName('book.pdf')).toBe('book')
  })
  it('extracts content from chinese brackets【】', () => {
    expect(extractTitleFromFileName('【漫画】葬送的芙莉莲.zip')).toBe('漫画')
  })
  it('extracts content from square brackets []', () => {
    expect(extractTitleFromFileName('[group]title.zip')).toBe('group')
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
