import JSZip from 'jszip'
import { isEpubFile } from '@/utils/fileType'
import type { BookParser, ParsedBook, ParsedTextBook, ParsedTextChapter, ParserProgressCallback } from './types'
import { extractTitleFromFilename, cleanHtmlToText } from './utils'

/**
 * EPUB 文件解析器（BookParser 适配器）。
 *
 * 使用 JSZip 解压 EPUB，提取元数据、封面图、章节结构。
 * 解析 OPF spine 顺序，从 NCX 提取章节标题，从 XHTML 文件提取正文内容。
 */
export class EpubParser implements BookParser {
  canParse(input: { name: string }): boolean {
    return isEpubFile(input.name)
  }

  async parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook> {
    onProgress?.(10)

    const arrayBuffer = await file.arrayBuffer()
    onProgress?.(20)

    const zip = await JSZip.loadAsync(arrayBuffer)
    onProgress?.(35)

    // 1. 找到 OPF 文件路径
    const opfPath = await findOpfPath(zip)
    if (!opfPath) {
      throw new Error('无法找到 EPUB 包文档（OPF）')
    }
    onProgress?.(40)

    // 2. 解析 OPF 提取元数据和 spine
    const opfContent = await zip.file(opfPath)?.async('string')
    if (!opfContent) {
      throw new Error('无法读取 OPF 文件内容')
    }
    const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : ''

    const metadata = parseOpfMetadata(opfContent)
    const spineItems = parseSpine(opfContent)
    const manifestItems = parseManifest(opfContent)
    onProgress?.(50)

    // 3. 提取 NCX 目录结构（用于章节标题）
    const ncxToc = await extractNcxToc(zip, opfContent, opfDir)
    onProgress?.(55)

    // 4. 按 spine 顺序提取章节内容
    const chapters = await extractChapters(zip, spineItems, manifestItems, ncxToc, opfDir)
    onProgress?.(75)

    // 5. 提取封面图
    const coverBlob = await extractCoverImage(zip, opfContent, opfPath)
    onProgress?.(90)

    // 6. 将原始文件保存为 textFile
    const textFile = new Blob([arrayBuffer], { type: 'application/epub+zip' })

    const title = metadata.title || extractTitleFromFilename(file.name)

    const result: ParsedTextBook = {
      format: 'text',
      title,
      coverBlob,
      textFile,
      textEncoding: 'epub',
      chapters,
      author: metadata.author,
    }

    onProgress?.(100)
    return result
  }
}

/**
 * 从 META-INF/container.xml 中找到 OPF 文件路径。
 */
async function findOpfPath(zip: JSZip): Promise<string | null> {
  const containerXml = await zip.file('META-INF/container.xml')?.async('string')
  if (!containerXml) return null

  const match = containerXml.match(/full-path="([^"]+\.opf)"/)
  return match?.[1] || null
}

/**
 * 从 OPF 内容中提取元数据（标题、作者）。
 */
function parseOpfMetadata(
  opfContent: string
): { title: string; author: string } {
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/)
  const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/)

  return {
    title: titleMatch?.[1]?.trim() || '',
    author: authorMatch?.[1]?.trim() || '',
  }
}

/**
 * 解析 OPF 中的 manifest 项。
 * 返回 id -> { href, mediaType } 的映射。
 */
function parseManifest(opfContent: string): Map<string, { href: string; mediaType: string }> {
  const items = new Map<string, { href: string; mediaType: string }>()
  const itemRegex = /<item\s+([^>]+)\/?>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(opfContent)) !== null) {
    const attrs = match[1]
    const idMatch = attrs.match(/id="([^"]+)"/)
    const hrefMatch = attrs.match(/href="([^"]+)"/)
    const mediaTypeMatch = attrs.match(/media-type="([^"]+)"/)

    if (idMatch && hrefMatch) {
      items.set(idMatch[1], {
        href: decodeURIComponent(hrefMatch[1]),
        mediaType: mediaTypeMatch?.[1] || '',
      })
    }
  }

  return items
}

/**
 * 解析 OPF 中的 spine 顺序。
 * 返回 itemref 的 idref 列表（按阅读顺序）。
 */
function parseSpine(opfContent: string): string[] {
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i)
  if (!spineMatch) return []

  const spineContent = spineMatch[1]
  const itemrefs: string[] = []
  const itemrefRegex = /<itemref\s+[^>]*idref="([^"]+)"[^>]*\/?>/gi
  let match: RegExpExecArray | null

  while ((match = itemrefRegex.exec(spineContent)) !== null) {
    itemrefs.push(match[1])
  }

  return itemrefs
}

/**
 * 从 NCX 文件中提取目录结构。
 * 返回 href -> title 的映射。
 */
async function extractNcxToc(
  zip: JSZip,
  opfContent: string,
  opfDir: string
): Promise<Map<string, string>> {
  const toc = new Map<string, string>()

  // 找到 NCX 文件路径
  const ncxMatch = opfContent.match(/<item[^>]+media-type="application\/x-dtbncx\+xml"[^>]+href="([^"]+)"/i)
    || opfContent.match(/<item[^>]+href="([^"]+)"[^>]+media-type="application\/x-dtbncx\+xml"/i)

  if (!ncxMatch) return toc

  const ncxPath = opfDir + decodeURIComponent(ncxMatch[1])
  const ncxContent = await zip.file(ncxPath)?.async('string')
  if (!ncxContent) return toc

  // 提取 navPoint 中的标题和链接
  const navPointRegex = /<navPoint[^>]*>([\s\S]*?)<\/navPoint>/gi
  const textRegex = /<text[^>]*>([^<]+)<\/text>/i
  const srcRegex = /<content\s+src="([^"]+)"/i
  let match: RegExpExecArray | null

  while ((match = navPointRegex.exec(ncxContent)) !== null) {
    const navContent = match[1]
    const titleMatch = navContent.match(textRegex)
    const srcMatch = navContent.match(srcRegex)

    if (titleMatch && srcMatch) {
      const href = decodeURIComponent(srcMatch[1]).split('#')[0]
      toc.set(href, titleMatch[1].trim())
    }
  }

  return toc
}

/**
 * 按 spine 顺序提取章节内容。
 * 将每个 XHTML 文件的内容提取为纯文本，使用 NCX 标题或文件名作为章节标题。
 */
async function extractChapters(
  zip: JSZip,
  spineItems: string[],
  manifest: Map<string, { href: string; mediaType: string }>,
  ncxToc: Map<string, string>,
  opfDir: string
): Promise<ParsedTextChapter[]> {
  const chapters: ParsedTextChapter[] = []

  for (const idref of spineItems) {
    const item = manifest.get(idref)
    if (!item) continue

    // 只处理 XHTML/HTML 内容
    const isHtml = item.mediaType.includes('html') || item.mediaType.includes('xml')
    if (!isHtml) continue

    const filePath = opfDir + item.href
    const content = await zip.file(filePath)?.async('string')
    if (!content) continue

    // 提取纯文本
    const text = cleanHtmlToText(content)
    if (!text.trim()) continue

    // 使用 NCX 标题，或从文件名推导
    const title = ncxToc.get(item.href) || extractChapterTitle(item.href, chapters.length)

    chapters.push({ title, content: text })
  }

  return chapters
}

/**
 * 从文件路径推导章节标题（兜底）。
 */
function extractChapterTitle(href: string, index: number): string {
  // 去掉路径和扩展名
  const filename = href.split('/').pop()?.replace(/\.[^.]+$/, '') || ''

  // 如果文件名包含数字，尝试用作章节号
  const numMatch = filename.match(/(\d+)/)
  if (numMatch) {
    return `第${numMatch[1]}章`
  }

  // 使用文件名或默认标题
  if (filename && filename !== 'chapter' && filename !== 'content') {
    return filename
  }

  return `章节 ${index + 1}`
}

/**
 * 从 EPUB 中提取封面图片。
 * 尝试多种策略：
 * 1. OPF metadata 中的 cover meta 项
 * 2. manifest 中 id 包含 "cover" 的图片项
 * 3. 第一个图片文件
 */
async function extractCoverImage(
  zip: JSZip,
  opfContent: string,
  opfPath: string
): Promise<Blob> {
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : ''

  // 策略1: 查找 <meta name="cover" content="xxx"/> 引用的 manifest item
  const coverMetaMatch = opfContent.match(/<meta\s+name="cover"\s+content="([^"]+)"/)
  if (coverMetaMatch) {
    const coverItemId = coverMetaMatch[1]
    const itemMatch = opfContent.match(
      new RegExp(`<item[^>]+id="${coverItemId}"[^>]+href="([^"]+)"`)
    )
    if (itemMatch) {
      const coverPath = opfDir + itemMatch[1]
      const blob = await zip.file(coverPath)?.async('blob')
      if (blob) return blob
    }
  }

  // 策略2: 查找 manifest 中 id 或 href 包含 "cover" 的图片
  const coverItemMatch = opfContent.match(
    /<item[^>]+(?:id|href)="[^"]*[Cc]over[^"]*"[^>]+href="([^"]+)"[^>]*media-type="image\/[^"]+"/
  ) || opfContent.match(
    /<item[^>]+href="([^"]+)"[^>]*media-type="image\/[^"]+"[^>]*(?:id|href)="[^"]*[Cc]over[^"]*"/
  )
  if (coverItemMatch) {
    const coverPath = opfDir + coverItemMatch[1]
    const blob = await zip.file(coverPath)?.async('blob')
    if (blob) return blob
  }

  // 策略3: 使用第一个图片文件
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const imageFiles = Object.keys(zip.files).filter((path) =>
    imageExtensions.some((ext) => path.toLowerCase().endsWith(ext))
  )

  if (imageFiles.length > 0) {
    const blob = await zip.file(imageFiles[0])?.async('blob')
    if (blob) return blob
  }

  // 兜底：生成默认封面
  return generateDefaultEpubCover()
}

/**
 * 生成默认 EPUB 封面占位图。
 */
async function generateDefaultEpubCover(): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 450
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#4a5568')
  gradient.addColorStop(1, '#2d3748')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '48px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('EPUB', canvas.width / 2, canvas.height / 2)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([], { type: 'image/png' }))
    }, 'image/png')
  })
}