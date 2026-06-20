const BRACKET_PATTERN = /[【[](.+?)[】\]]/
const LEADING_CHARS_PATTERN = /^[[\]【】\s]+/u

export function extractTitleFromFileName(fileName: string): string {
  let title = fileName.replace(/\.[^.]+$/, '')
  const bracketMatch = title.match(BRACKET_PATTERN)
  if (bracketMatch) {
    title = bracketMatch[1].trim()
  } else {
    title = title.replace(LEADING_CHARS_PATTERN, '').trim()
  }
  return title || fileName
}
