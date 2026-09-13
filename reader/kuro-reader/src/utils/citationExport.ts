/**
 * 引文格式导出（档案卡「引用格式」弹层消费）。
 *
 * 三种格式：BibTeX（LaTeX/Zotero）/ GB/T 7714（中文论文）/ APA（英文论文）。
 * 纯函数、可测；馆藏没有出版信息（出版社/出版年），条目按可得字段尽力生成——
 * 年份取入藏年，作者缺省时省略作者域并提示补全。
 */

import type { Book } from '@/types'

export type CitationFormat = 'bibtex' | 'gbt7714' | 'apa'

export const CITATION_FORMAT_LABELS: Record<CitationFormat, string> = {
  bibtex: 'BibTeX',
  gbt7714: 'GB/T 7714',
  apa: 'APA',
}

/** GB/T 7714 作者列表截断阈值：超过 3 位列前 3 位 + 「等」 */
const GBT_AUTHOR_LIMIT = 3

/** 作者域切分：中英逗号/分号/顿号都算分隔 */
export function splitAuthors(author: string): string[] {
  return author
    .split(/[，,、;；]/)
    .map((name) => name.trim())
    .filter(Boolean)
}

/** 入藏年（馆藏无出版年字段，引用年份按入藏年尽力生成） */
function accessionYear(book: Book): number {
  return new Date(book.addedAt).getFullYear()
}

/** BibTeX key：首作者（去空白与标点）+ 年份；无作者用书名 */
function bibtexKey(book: Book, authors: string[]): string {
  const base = (authors[0] ?? book.title).replace(/[^\p{L}\p{N}]/gu, '')
  return `kuro${base}${accessionYear(book)}`
}

export function buildBibtex(book: Book): string {
  const authors = splitAuthors(book.author)
  const fields = [`  title = {${book.title}}`]
  if (authors.length > 0) {
    fields.push(`  author = {${authors.join(' and ')}}`)
  }
  fields.push(`  year = {${accessionYear(book)}}`)
  fields.push(`  note = {Kuro Reader 私人馆藏}`)
  return `@book{${bibtexKey(book, authors)},\n${fields.join(',\n')}\n}`
}

export function buildGbt7714(book: Book): string {
  const authors = splitAuthors(book.author)
  let authorPart = ''
  if (authors.length > GBT_AUTHOR_LIMIT) {
    authorPart = `${authors.slice(0, GBT_AUTHOR_LIMIT).join(', ')}, 等. `
  } else if (authors.length > 0) {
    authorPart = `${authors.join(', ')}. `
  }
  return `${authorPart}${book.title}[M]. ${accessionYear(book)}.`
}

export function buildApa(book: Book): string {
  const authors = splitAuthors(book.author)
  let authorPart = ''
  if (authors.length === 1) {
    authorPart = `${authors[0]}. `
  } else if (authors.length === 2) {
    authorPart = `${authors[0]}, & ${authors[1]}. `
  } else if (authors.length > 2) {
    authorPart = `${authors[0]}, ${authors[1]}, ... ${authors[authors.length - 1]}. `
  }
  return `${authorPart}(${accessionYear(book)}). ${book.title}.`
}

export function buildCitation(book: Book, format: CitationFormat): string {
  switch (format) {
    case 'bibtex':
      return buildBibtex(book)
    case 'gbt7714':
      return buildGbt7714(book)
    case 'apa':
      return buildApa(book)
  }
}
