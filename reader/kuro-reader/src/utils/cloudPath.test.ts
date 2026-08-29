import { describe, it, expect } from 'vitest'

import {
  normalizeCloudPath,
  joinCloudPath,
  parentCloudPath,
  cloudPathBreadcrumbs,
  sortCloudEntries,
} from '@/utils/cloudPath'

describe('normalizeCloudPath', () => {
  it('ensures leading slash and strips trailing slash', () => {
    expect(normalizeCloudPath('/books')).toBe('/books')
    expect(normalizeCloudPath('books')).toBe('/books')
    expect(normalizeCloudPath('/books/')).toBe('/books')
  })

  it('merges consecutive slashes', () => {
    expect(normalizeCloudPath('//a//b///')).toBe('/a/b')
  })

  it('maps empty to root', () => {
    expect(normalizeCloudPath('')).toBe('/')
    expect(normalizeCloudPath('/')).toBe('/')
  })
})

describe('joinCloudPath', () => {
  it('joins directory and child name', () => {
    expect(joinCloudPath('/books', 'novel.txt')).toBe('/books/novel.txt')
    expect(joinCloudPath('/', 'a.zip')).toBe('/a.zip')
    expect(joinCloudPath('/books/', 'x')).toBe('/books/x')
  })
})

describe('parentCloudPath', () => {
  it('returns parent directory', () => {
    expect(parentCloudPath('/a/b/c.txt')).toBe('/a/b')
    expect(parentCloudPath('/a')).toBe('/')
  })

  it('returns null at root', () => {
    expect(parentCloudPath('/')).toBeNull()
  })
})

describe('cloudPathBreadcrumbs', () => {
  it('returns empty at root', () => {
    expect(cloudPathBreadcrumbs('/')).toEqual([])
  })

  it('builds cumulative segments', () => {
    expect(cloudPathBreadcrumbs('/books/comics')).toEqual([
      { name: 'books', path: '/books' },
      { name: 'comics', path: '/books/comics' },
    ])
  })
})

describe('sortCloudEntries', () => {
  it('directories first, then name order', () => {
    const sorted = sortCloudEntries([
      { name: 'b.txt', isDirectory: false },
      { name: '文件夹', isDirectory: true },
      { name: 'a.txt', isDirectory: false },
      { name: 'Album', isDirectory: true },
    ])
    expect(sorted.map((f) => f.name)).toEqual(['Album', '文件夹', 'a.txt', 'b.txt'])
  })

  it('does not mutate input', () => {
    const input = [{ name: 'b', isDirectory: false }, { name: 'a', isDirectory: false }]
    sortCloudEntries(input)
    expect(input[0].name).toBe('b')
  })
})
