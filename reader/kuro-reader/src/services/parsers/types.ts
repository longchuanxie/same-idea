import type { BookFormat, PageRef } from '@/types'

/**
 * Parser 进度回调，pct 取值 0-100。
 */
export type ParserProgressCallback = (pct: number) => void

/**
 * Parser 输出的统一结构。
 * - 通用字段：format / title / coverBlob 三者必填
 * - comic 分支：imagePages / imagePageNames 必填（其他可选）
 * - pdf 分支：pdfFile / pdfTotalPages 必填（其他可选）
 * - pageRefs 由 parser 自行生成
 */
export interface ParsedBook {
  format: BookFormat
  title: string
  coverBlob: Blob

  imagePages?: Blob[]
  imagePageNames?: string[]

  pdfFile?: Blob
  pdfTotalPages?: number

  pageRefs?: PageRef[]
}

/**
 * Book Parser 适配器接口。
 * 实现类负责：
 * 1. 通过文件名判断能否解析（canParse）
 * 2. 解析为 ParsedBook（parse）
 * 3. 可选：流式解析大文件（parseStreaming）
 */
export interface BookParser {
  /** 通过文件名判断该 parser 是否能处理 */
  canParse(file: File): boolean

  /** 一次性解析（适合小文件） */
  parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook>

  /** 可选：流式解析（适合 > 50MB 大文件） */
  parseStreaming?(file: File, onProgress: ParserProgressCallback): Promise<ParsedBook>
}
