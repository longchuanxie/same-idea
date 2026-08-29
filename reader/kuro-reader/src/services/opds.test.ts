import { describe, it, expect, vi } from 'vitest'

import axios from 'axios'

import { parseOpdsFeed, fetchOpdsFeed, buildOpdsFileName } from '@/services/opds'

vi.mock('axios')

const CATALOG_XML = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>我的书库</title>
  <link rel="next" href="?page=2"/>
  <entry>
    <title>小说</title>
    <id>urn:uuid:nav-1</id>
    <content type="text">中文小说目录</content>
    <link rel="subsection" type="application/atom+xml;profile=opds-catalog" href="/opds/novels"/>
  </entry>
  <entry>
    <title>测试书籍</title>
    <id>urn:uuid:pub-1</id>
    <summary>一本测试书</summary>
    <link rel="http://opds-spec.org/image" type="image/jpeg" href="/covers/1.jpg"/>
    <link rel="http://opds-spec.org/acquisition" type="application/epub+zip" href="/download/1.epub"/>
    <link rel="http://opds-spec.org/acquisition" type="application/pdf" href="/download/1.pdf"/>
  </entry>
</feed>`

describe('parseOpdsFeed', () => {
  it('parses feed title, navigation and publication entries', () => {
    const feed = parseOpdsFeed(CATALOG_XML, 'http://nas:8083/opds')

    expect(feed.title).toBe('我的书库')
    expect(feed.entries).toHaveLength(2)

    const [nav, book] = feed.entries
    expect(nav.isCatalog).toBe(true)
    expect(nav.subsectionHref).toBe('http://nas:8083/opds/novels')
    expect(nav.content).toBe('中文小说目录')

    expect(book.isCatalog).toBe(false)
    expect(book.acquisitions).toEqual([
      { href: 'http://nas:8083/download/1.epub', type: 'application/epub+zip' },
      { href: 'http://nas:8083/download/1.pdf', type: 'application/pdf' },
    ])
    expect(book.imageHref).toBe('http://nas:8083/covers/1.jpg')
  })

  it('extracts next page link', () => {
    const feed = parseOpdsFeed(CATALOG_XML, 'http://nas:8083/opds')
    expect(feed.nextHref).toBe('http://nas:8083/opds?page=2')
  })

  it('throws on invalid XML', () => {
    expect(() => parseOpdsFeed('<not-xml', 'http://x/')).toThrow()
  })
})

describe('buildOpdsFileName', () => {
  it('prefers extension from MIME type', () => {
    expect(buildOpdsFileName('书名', '/a/b?token=1', 'application/epub+zip')).toBe('书名.epub')
    expect(buildOpdsFileName('书名', '/a/b', 'application/pdf')).toBe('书名.pdf')
    expect(buildOpdsFileName('书名', '/a/b', 'application/zip')).toBe('书名.cbz')
  })

  it('falls back to href extension', () => {
    expect(buildOpdsFileName('书名', '/a/书名.epub')).toBe('书名.epub')
  })

  it('returns null for unsupported types', () => {
    expect(buildOpdsFileName('书名', '/a/b', 'application/x-mobipocket-ebook')).toBeNull()
  })

  it('sanitizes illegal characters in title', () => {
    expect(buildOpdsFileName('书/名:卷一', '/a/b.epub')).toBe('书 名 卷一.epub')
  })
})

describe('fetchOpdsFeed', () => {
  it('sends basic auth header and parses response', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: CATALOG_XML })

    const feed = await fetchOpdsFeed('http://nas:8083/opds', { username: 'u', password: 'p' })

    expect(axios.get).toHaveBeenCalledWith(
      'http://nas:8083/opds',
      expect.objectContaining({
        responseType: 'text',
        headers: expect.objectContaining({ Authorization: `Basic ${btoa('u:p')}` }),
      })
    )
    expect(feed.entries).toHaveLength(2)
  })
})
