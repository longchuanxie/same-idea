import { ComicArchiveParser } from './comicArchiveParser'
import type { BookParser } from './types'

/**
 * 已注册的 parser 列表。
 * 按优先级排序：先匹配到的优先使用。
 * Phase 4 会插入 PdfParser。
 */
const parsers: BookParser[] = [new ComicArchiveParser()]

/**
 * 根据文件扩展名匹配合适的 parser。
 * 参数收紧为 `{ name: string }`，与 `BookParser.canParse` 保持一致；
 * 真实 `File` 结构上满足该契约，调用点无需修改。
 * @returns 匹配的 parser；无匹配返回 null
 */
export function getParserForFile(input: { name: string }): BookParser | null {
  return parsers.find(p => p.canParse(input)) ?? null
}

export type { BookParser, ParsedBook, ParserProgressCallback } from './types'
export { ComicArchiveParser } from './comicArchiveParser'
