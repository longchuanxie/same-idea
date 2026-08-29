export const IMAGE_EXTENSIONS: ReadonlySet<string> = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.img',
])

export const ARCHIVE_EXTENSIONS: ReadonlySet<string> = new Set(['.zip', '.cbz', '.rar', '.cbr'])

export const PDF_EXTENSIONS: ReadonlySet<string> = new Set(['.pdf'])

export const TEXT_EXTENSIONS: ReadonlySet<string> = new Set(['.txt'])

export const MARKDOWN_EXTENSIONS: ReadonlySet<string> = new Set(['.md', '.markdown'])

export const EPUB_EXTENSIONS: ReadonlySet<string> = new Set(['.epub'])

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.substring(dot).toLowerCase() : ''
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(name))
}

export function isArchiveFile(name: string): boolean {
  return ARCHIVE_EXTENSIONS.has(getFileExtension(name))
}

export function isPdfFile(name: string): boolean {
  return PDF_EXTENSIONS.has(getFileExtension(name))
}

export function isTextFile(name: string): boolean {
  return TEXT_EXTENSIONS.has(getFileExtension(name))
}

export function isMarkdownFile(name: string): boolean {
  return MARKDOWN_EXTENSIONS.has(getFileExtension(name))
}

export function isEpubFile(name: string): boolean {
  return EPUB_EXTENSIONS.has(getFileExtension(name))
}

export function isSupportedBookFile(name: string): boolean {
  return isArchiveFile(name) || isPdfFile(name) || isTextFile(name) || isMarkdownFile(name) || isEpubFile(name)
}

/**
 * 猜测书籍文件的 MIME 类型（云端下载导入用）。
 * 文本类类型的准确性很重要：TextReader 依赖 blob.type 区分 TXT/Markdown/EPUB。
 */
export function guessBookMimeType(name: string): string {
  const ext = getFileExtension(name)
  switch (ext) {
    case '.epub':
      return 'application/epub+zip'
    case '.md':
    case '.markdown':
      return 'text/markdown'
    case '.txt':
      return 'text/plain'
    case '.zip':
    case '.cbz':
      return 'application/zip'
    case '.rar':
    case '.cbr':
      return 'application/vnd.rar'
    case '.pdf':
      return 'application/pdf'
    default:
      return ''
  }
}
