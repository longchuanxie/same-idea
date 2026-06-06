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

export function isSupportedBookFile(name: string): boolean {
  return isArchiveFile(name) || isPdfFile(name)
}
