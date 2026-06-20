import type { PageRef } from '@/types'

/**
 * Parser 进度回调，pct 取值 0-100。
 */
export type ParserProgressCallback = (pct: number) => void

interface ParsedBookBase {
  title: string
  coverBlob: Blob
  /** 由 parser 自行生成；未提供时由上层按 format 推导 */
  pageRefs?: PageRef[]
}

/**
 * Comic 分支：解压后的图片页集合必填。
 */
export interface ParsedComicBook extends ParsedBookBase {
  format: 'comic'
  imagePages: Blob[]
  imagePageNames: string[]
}

/**
 * PDF 分支：原始 PDF 文件与总页数必填。
 */
export interface ParsedPdfBook extends ParsedBookBase {
  format: 'pdf'
  pdfFile: Blob
  pdfTotalPages: number
}

/**
 * 文本分支：原始文本文件与编码信息必填。
 * 适用于 .txt 和 .epub 格式。
 * chapters 可选：若解析器能拆分章节，则填充此字段。
 */
export interface ParsedTextChapter {
  title: string
  content: string
}

export interface ParsedTextBook extends ParsedBookBase {
  format: 'text'
  textFile: Blob
  textEncoding: string
  /** 解析器在导入时拆分出的章节列表。为空表示未拆分。 */
  chapters?: ParsedTextChapter[]
  /** EPUB 作者 */
  author?: string
}

/**
 * Parser 输出的统一结构。通过 `format` 字段进行判别联合：
 * - `format: 'comic'` → 必含 imagePages / imagePageNames
 * - `format: 'pdf'`   → 必含 pdfFile / pdfTotalPages
 * - `format: 'text'`  → 必含 textFile / textEncoding
 */
export type ParsedBook = ParsedComicBook | ParsedPdfBook | ParsedTextBook

/**
 * Book Parser 适配器接口。
 * 实现类负责：
 * 1. 通过文件名判断能否解析（canParse）
 * 2. 解析为 ParsedBook（parse）
 * 3. 可选：流式解析大文件（parseStreaming）
 */
export interface BookParser {
  /**
   * 通过文件名判断该 parser 是否能处理。
   * 仅依赖 `name` 字段以便在无 DOM File 的环境（如 Node 单测）调用；
   * 真实 `File` 结构上满足 `{ name: string }`，调用点无需修改。
   */
  canParse(input: { name: string }): boolean

  /** 一次性解析（适合小文件） */
  parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook>

  /** 可选：流式解析（适合 > 50MB 大文件） */
  parseStreaming?(file: File, onProgress: ParserProgressCallback): Promise<ParsedBook>
}
