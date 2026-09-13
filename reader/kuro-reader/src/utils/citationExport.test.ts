import { describe, it, expect } from 'vitest'

import type { Book } from '@/types'
import {
  buildApa,
  buildBibtex,
  buildCitation,
  buildGbt7714,
  splitAuthors,
} from '@/utils/citationExport'

const makeBook = (overrides: Partial<Book> & { title: string }): Book => ({
  id: 'b1',
  author: '',
  cover: '',
  genres: [],
  tags: [],
  description: '',
  status: 'ongoing',
  totalChapters: 1,
  chapters: [],
  addedAt: new Date('2026-08-01'),
  isFavorite: false,
  ...overrides,
})

describe('splitAuthors', () => {
  it('中英分隔符都认', () => {
    expect(splitAuthors('张三、李四；王五, 赵六')).toEqual(['张三', '李四', '王五', '赵六'])
    expect(splitAuthors('  ')).toEqual([])
  })
})

describe('buildBibtex', () => {
  it('多作者用 and 连接；键含首作者与年份', () => {
    const bibtex = buildBibtex(makeBook({ title: '论文A', author: '张三、李四' }))
    expect(bibtex).toContain('@book{kuro张三2026,')
    expect(bibtex).toContain('title = {论文A}')
    expect(bibtex).toContain('author = {张三 and 李四}')
    expect(bibtex).toContain('year = {2026}')
  })

  it('无作者省略 author 域，键回退书名', () => {
    const bibtex = buildBibtex(makeBook({ title: '无名书' }))
    expect(bibtex).toContain('@book{kuro无名书2026,')
    expect(bibtex).not.toContain('author =')
  })
})

describe('buildGbt7714', () => {
  it('两位作者全列', () => {
    expect(buildGbt7714(makeBook({ title: '书名', author: '张三、李四' }))).toBe(
      '张三, 李四. 书名[M]. 2026.'
    )
  })

  it('超过三位截断加「等」；无作者直接书名起头', () => {
    expect(
      buildGbt7714(makeBook({ title: '书名', author: '甲、乙、丙、丁' }))
    ).toBe('甲, 乙, 丙, 等. 书名[M]. 2026.')
    expect(buildGbt7714(makeBook({ title: '书名' }))).toBe('书名[M]. 2026.')
  })
})

describe('buildApa', () => {
  it('一作/二作/多作分式', () => {
    expect(buildApa(makeBook({ title: '书', author: '张三' }))).toBe('张三. (2026). 书.')
    expect(buildApa(makeBook({ title: '书', author: '张三、李四' }))).toBe(
      '张三, & 李四. (2026). 书.'
    )
    expect(buildApa(makeBook({ title: '书', author: '甲、乙、丙' }))).toBe(
      '甲, 乙, ... 丙. (2026). 书.'
    )
  })
})

describe('buildCitation 分发', () => {
  const book = makeBook({ title: '书', author: '张三' })
  it('三种格式各归其位', () => {
    expect(buildCitation(book, 'bibtex')).toContain('@book')
    expect(buildCitation(book, 'gbt7714')).toContain('[M]')
    expect(buildCitation(book, 'apa')).toContain('(2026)')
  })
})
