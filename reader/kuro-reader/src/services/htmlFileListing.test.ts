import { describe, it, expect } from 'vitest'

import { looksLikeHtmlListing, parseHtmlFileListing } from '@/services/htmlFileListing'

/** rclone v1.75 真实列表页结构（提炼）：Go up 行 + 目录行（zip 下载链接）+ 文件行（size/time） */
const RCLONE_PAGE = `<!DOCTYPE html>
<html><head><title>/tmp/</title></head>
<body>
<header><h1><a href="/">tmp</a> / <a href="../">..</a></h1></header>
<main><div class="meta"><div id="summary"></div></div>
<div class="listing"><table>
<thead><tr><th></th><th><a href="?sort=name&order=asc" class="order">Name</a></th>
<th><a href="?sort=size&order=asc" class="order">Size</a></th></tr></thead>
<tbody>
<tr><td></td><td><a href=".."><span class="goup">Go up</span></a></td><td>&mdash;</td></tr>
<tr class="file"><td></td><td>
<svg><use xlink:href="#folder"></use></svg>
<span class="name"><a href="%E8%BF%85%E9%9B%B7%E4%B8%8B%E8%BD%BD/">迅雷下载/</a></span>
<a class="zip" href="%E8%BF%85%E9%9B%B7%E4%B8%8B%E8%BD%BD/?download=zip" title="Download folder as .zip"></a>
</td><td data-order="-1">&mdash;</td>
<td class="hideable"><time datetime="2026-09-12 01:52:24 +0000 UTC">2026-09-12</time></td></tr>
<tr class="file"><td></td><td>
<svg><use xlink:href="#file"></use></svg>
<span class="name"><a href="kuro-reader-1.31.apk">kuro-reader-1.31.apk</a></span>
</td><td data-order="5610"><size>5610</size></td>
<td class="hideable"><time datetime="2026-10-17 10:00:00 +0000 UTC">2026-10-17</time></td></tr>
</tbody></table></div></main>
</body></html>`

const NGINX_AUTOINDEX = `<html><head><title>Index of /books/</title></head><body>
<h1>Index of /books/</h1><hr><pre><a href="../">../</a>
<a href="novels/">novels/</a>                                            17-Oct-2026 12:00       -
<a href="%E5%8D%8A%E5%B0%8F%E6%97%B6.epub">半小时.epub</a>                          17-Oct-2026 11:00  186000000
</pre><hr></body></html>`

const EMPTY_RCLONE_PAGE = `<!DOCTYPE html>
<html><body><main><div class="listing"><table>
<thead><tr><th><a href="?sort=name&order=asc">Name</a></th></tr></thead>
<tbody><tr><td><a href=".."><span class="goup">Go up</span></a></td></tr></tbody>
</table></div></main></body></html>`

const WEBDAV_XML = `<?xml version="1.0" encoding="UTF-8"?>
<D:multistatus xmlns:D="DAV:"><D:response><D:href>/</D:href>
<D:propstat><D:prop><D:resourcetype><D:collection/></D:resourcetype></D:prop></D:propstat></D:response></D:multistatus>`

describe('parseHtmlFileListing', () => {
  it('解析 rclone 列表页：目录/文件/大小/时间，排除上级与排序链接', () => {
    const entries = parseHtmlFileListing(RCLONE_PAGE)!

    expect(entries).toHaveLength(2)

    const [dir, file] = entries
    expect(dir.name).toBe('迅雷下载')
    expect(dir.isDirectory).toBe(true)
    expect(dir.size).toBe(0)
    expect(dir.modifiedTime).toContain('2026-09-12')

    expect(file.name).toBe('kuro-reader-1.31.apk')
    expect(file.isDirectory).toBe(false)
    expect(file.size).toBe(5610)
    expect(file.modifiedTime).toContain('2026-10-17')
  })

  it('解析 nginx autoindex 风格列表（中文 href 编码态，名称取链接文本）', () => {
    const entries = parseHtmlFileListing(NGINX_AUTOINDEX)!

    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({ name: 'novels', isDirectory: true })
    expect(entries[1]).toMatchObject({ name: '半小时.epub', isDirectory: false })
  })

  it('rclone 空目录页返回空数组而非 null', () => {
    expect(parseHtmlFileListing(EMPTY_RCLONE_PAGE)).toEqual([])
  })

  it('非列表页（WebDAV XML / 普通网页）返回 null', () => {
    expect(parseHtmlFileListing(WEBDAV_XML)).toBeNull()
    expect(parseHtmlFileListing('<html><body><h1>关于我们</h1><p>内容</p></body></html>')).toBeNull()
  })
})

describe('looksLikeHtmlListing', () => {
  it('text/html 且含链接 → true；非 HTML content-type → false', () => {
    expect(looksLikeHtmlListing('text/html; charset=utf-8', RCLONE_PAGE)).toBe(true)
    expect(looksLikeHtmlListing('application/xml', WEBDAV_XML)).toBe(false)
    expect(looksLikeHtmlListing(undefined, RCLONE_PAGE)).toBe(true)
    expect(looksLikeHtmlListing(undefined, '<html><body>纯文本页</body></html>')).toBe(false)
  })
})
