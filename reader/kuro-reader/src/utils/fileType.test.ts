import { describe, it, expect } from 'vitest'

import {
  getFileExtension,
  isImageFile,
  isArchiveFile,
  isPdfFile,
  isSupportedBookFile,
  IMAGE_EXTENSIONS,
  ARCHIVE_EXTENSIONS,
  PDF_EXTENSIONS,
} from '@/utils/fileType'

describe('getFileExtension', () => {
  it('returns lowercase extension with leading dot', () => {
    expect(getFileExtension('foo.JPG')).toBe('.jpg')
    expect(getFileExtension('a/b/c.PNG')).toBe('.png')
  })
  it('returns empty string for no extension', () => {
    expect(getFileExtension('README')).toBe('')
  })
  it('handles multi-dot filenames (last segment wins)', () => {
    expect(getFileExtension('foo.tar.gz')).toBe('.gz')
  })
  it('handles dotfile (hidden file w/o extension)', () => {
    expect(getFileExtension('.gitignore')).toBe('.gitignore')
  })
})

describe('isImageFile', () => {
  it.each(['a.jpg', 'a.JPEG', 'b.png', 'c.gif', 'd.webp', 'e.bmp', 'f.img'])(
    'recognizes %s as image',
    name => expect(isImageFile(name)).toBe(true)
  )
  it.each(['a.zip', 'a.pdf', 'a.txt', 'a'])('rejects %s', name =>
    expect(isImageFile(name)).toBe(false)
  )
})

describe('isArchiveFile', () => {
  it.each(['a.zip', 'a.CBZ', 'b.rar', 'c.cbr'])('recognizes %s as archive', name =>
    expect(isArchiveFile(name)).toBe(true)
  )
  it.each(['a.jpg', 'a.pdf', 'a.7z'])('rejects %s', name => expect(isArchiveFile(name)).toBe(false))
})

describe('isPdfFile', () => {
  it('recognizes .pdf (any case)', () => {
    expect(isPdfFile('foo.PDF')).toBe(true)
    expect(isPdfFile('foo.pdf')).toBe(true)
  })
  it('rejects others', () => {
    expect(isPdfFile('foo.zip')).toBe(false)
  })
})

describe('isSupportedBookFile', () => {
  it('accepts archives and pdf', () => {
    expect(isSupportedBookFile('a.zip')).toBe(true)
    expect(isSupportedBookFile('a.pdf')).toBe(true)
  })
  it('rejects standalone images', () => {
    expect(isSupportedBookFile('a.jpg')).toBe(false)
  })
})

describe('extension constants', () => {
  it('exports readonly sets', () => {
    expect(IMAGE_EXTENSIONS.has('.jpg')).toBe(true)
    expect(ARCHIVE_EXTENSIONS.has('.zip')).toBe(true)
    expect(PDF_EXTENSIONS.has('.pdf')).toBe(true)
  })
})
