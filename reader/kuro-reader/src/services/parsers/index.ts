import { ComicArchiveParser } from './comicArchiveParser'
import { EpubParser } from './epubParser'
import { TextParser } from './textParser'
import type { BookParser } from './types'

/**
 * 已注册的 parser 列表。
 * 按优先级排序：先匹配到的优先使用。
 * TextParser 放最后（最宽泛匹配）。
 */
const parsers: BookParser[] = [
  new ComicArchiveParser(),
  new EpubParser(),
  new TextParser(),
]

/**
 * 根据文件扩展名匹配合适的 parser。
 * 参数收紧为 `{ name: string }`，与 `BookParser.canParse` 保持一致；
 * 真实 `File` 结构上满足该契约，调用点无需修改。
 * @returns 匹配的 parser；无匹配返回 null
 */
export function getParserForFile(input: { name: string }): BookParser | null {
  return parsers.find(p => p.canParse(input)) ?? null
}

export type { BookParser, ParsedBook, ParsedTextBook, ParserProgressCallback } from './types'
export { ComicArchiveParser } from './comicArchiveParser'
export { EpubParser } from './epubParser'
export { TextParser } from './textParser'
