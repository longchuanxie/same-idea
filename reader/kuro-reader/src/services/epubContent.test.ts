import { describe, it, expect, beforeEach, vi } from 'vitest'

import JSZip from 'jszip'

import { convertXhtmlToMarkdown, loadEpubChapters, resolveZipPath, revokeEpubObjectUrls } from '@/services/epubContent'

// 1x1 PNG
const PNG_BYTES = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
  0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
])

/** jsdom 的 URL.createObjectURL 未实现（setup.ts 会补），这里用确定性桩收集 */
const createdUrls: string[] = []

beforeEach(() => {
  createdUrls.length = 0
  let seq = 0
  URL.createObjectURL = () => `blob:epub-${++seq}`
})

describe('resolveZipPath', () => {
  it('resolves relative to base dir', () => {
    expect(resolveZipPath('OEBPS/text/', 'images/pic.png')).toBe('OEBPS/text/images/pic.png')
  })

  it('handles parent segments and leading slash', () => {
    expect(resolveZipPath('OEBPS/text/', '../images/pic.png')).toBe('OEBPS/images/pic.png')
    expect(resolveZipPath('OEBPS/', '/images/pic.png')).toBe('/images/pic.png')
  })

  it('decodes URI components and collapses slashes', () => {
    expect(resolveZipPath('book/', 'my%20image.png')).toBe('book/my image.png')
    expect(resolveZipPath('book//', './a//b.png')).toBe('book/a/b.png')
  })
})

describe('convertXhtmlToMarkdown', () => {
  const resolver = vi.fn((src: string) => (src.includes('missing') ? null : `blob:${src}`))

  it('converts headings, paragraphs and emphasis', () => {
    const html = `<html><body>
      <h1>第一章</h1>
      <p>你好，<em>世界</em>与<b>加粗</b>。</p>
      <h2>小节</h2><p>第二段</p>
    </body></html>`
    const md = convertXhtmlToMarkdown(html, resolver)

    expect(md).toContain('# 第一章')
    expect(md).toContain('## 小节')
    expect(md).toContain('*世界*')
    expect(md).toContain('**加粗**')
    expect(md).toContain('第二段')
  })

  it('converts images via resolver and skips unresolvable ones', () => {
    const html = `<body>
      <p><img src="images/a.png" alt="插画甲"/></p>
      <p><img src="missing/b.gif" alt="插画乙"/></p>
    </body>`
    const md = convertXhtmlToMarkdown(html, resolver)

    expect(md).toContain('![插画甲](blob:images/a.png)')
    // 解析失败的图片既无占位文本也不产生标记
    expect(md).not.toContain('插画乙')
    expect(md.match(/!\[/g) || []).toHaveLength(1)
  })

  it('converts lists, blockquote, hr and strips script/style', () => {
    const html = `<body>
      <style>p{color:red}</style>
      <ul><li>甲</li><li>乙</li></ul>
      <blockquote>引用句子</blockquote>
      <hr/>
      <script>alert(1)</script>
      <p>正文</p>
    </body>`
    const md = convertXhtmlToMarkdown(html, resolver)

    expect(md).toContain('- 甲')
    expect(md).toContain('- 乙')
    expect(md).toContain('> 引用句子')
    expect(md).toContain('---')
    expect(md).toContain('正文')
    expect(md).not.toContain('alert')
    expect(md).not.toContain('color:red')
  })

  it('decodes entities and collapses whitespace', () => {
    const html = `<body><p>“引号” &amp; 符号 &lt;标签&gt;</p></body>`
    const md = convertXhtmlToMarkdown(html, resolver)

    expect(md).toContain('“引号” & 符号 <标签>')
    expect(md).not.toMatch(/ {2,}/)
  })
})

describe('loadEpubChapters integration', () => {
  const OPF = `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <manifest>
    <item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="pic" href="images/pic.png" media-type="image/png"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx"><itemref idref="ch1"/></spine>
</package>`

  const XHTML = `<html><body>
    <h1>章节标题</h1>
    <p>段落一，包含<em>强调</em>。</p>
    <img src="images/pic.png" alt="风景图"/>
    <p>段落二</p>
  </body></html>`

  const NCX = `<?xml version="1.0"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <navMap>
    <navPoint id="n1"><navLabel><text>我的目录</text></navLabel><content src="ch1.xhtml"/></navPoint>
  </navMap>
</ncx>`

  async function buildEpub(): Promise<Blob> {
    const zip = new JSZip()
    zip.file('mimetype', 'application/epub+zip')
    zip.file('META-INF/container.xml', `<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`)
    zip.file('OEBPS/content.opf', OPF)
    zip.file('OEBPS/ch1.xhtml', XHTML)
    zip.file('OEBPS/toc.ncx', NCX)
    zip.file('OEBPS/images/pic.png', PNG_BYTES)
    const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' })
    return new Blob([arrayBuffer], { type: 'application/epub+zip' })
  }

  it('produces markdown chapters with images, titles and documents', async () => {
    const chapters = await loadEpubChapters(await buildEpub())

    expect(chapters).toHaveLength(1)
    const ch = chapters[0]
    expect(ch.title).toBe('我的目录')
    expect(ch.content).toContain('# 章节标题')
    expect(ch.content).toContain('*强调*')
    expect(ch.content).toContain('![风景图](blob:epub-1)')
    expect(ch.content).toContain('段落二')
    expect(ch.markdownDocument).toBeDefined()
    // 图片 span 已进入 markdown 文档
    expect(ch.markdownDocument?.spans.some((sp) => sp.type === 'image')).toBe(true)

    revokeEpubObjectUrls()
  })

  it('falls back to placeholder chapter on broken packages', async () => {
    const zip = new JSZip()
    zip.file('mimetype', 'application/epub+zip')
    const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' })

    const chapters = await loadEpubChapters(new Blob([arrayBuffer], { type: 'application/epub+zip' }))
    expect(chapters).toHaveLength(1)
    expect(chapters[0].content).toContain('无法解析 EPUB 包结构')
  })
})
