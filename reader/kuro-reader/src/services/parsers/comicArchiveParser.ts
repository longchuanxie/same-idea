import {
  parseArchiveFile,
  parseArchiveFileStreaming,
  parseImageFiles,
} from '@/services/archiveParser'
import type { PageRef } from '@/types'
import { isArchiveFile } from '@/utils/fileType'

import type { BookParser, ParsedBook, ParsedComicBook, ParserProgressCallback } from './types'

const PROGRESS_DURING_STREAM_CAP = 95
const PROGRESS_COMPLETE = 100
const PROGRESS_CURVE_OFFSET = 2

/**
 * 压缩包漫画解析器（BookParser 适配器）。
 *
 * 包装现有 `parseArchiveFile` / `parseArchiveFileStreaming` / `parseImageFiles`，
 * 把它们暴露为统一的 `BookParser` 接口；底层解压逻辑不变。
 *
 * 支持的扩展名通过 {@link isArchiveFile} 判定（.zip / .cbz / .rar / .cbr）。
 */
export class ComicArchiveParser implements BookParser {
  canParse(input: { name: string }): boolean {
    return isArchiveFile(input.name)
  }

  async parse(file: File): Promise<ParsedBook> {
    const archive = await parseArchiveFile(file)
    return this.toParsedBook({
      title: archive.title,
      coverBlob: archive.coverBlob,
      pages: archive.pages,
      pageNames: archive.pageNames,
    })
  }

  /**
   * 流式解析大文件。
   *
   * 进度说明：由于底层 `parseArchiveFileStreaming` 的 `onPageExtracted` 回调
   * 在流式过程中无法预知总页数（`totalPages` 仅在流式结束后返回），
   * 本方法采用「伪单调进度」策略：
   *   - 在 streaming 期间使用 `95 * (1 - 1/(2+pageIndex))` 渐近上限 95%；
   *     第 1 页（pageIndex=0）约 48%，第 2 页约 63%，单调递增渐近 95%；
   *   - 全部页面抽取完成后再 emit 一次 100%。
   * 因此进度始终单调递增，但中段速率不严格对应真实剩余比例。
   */
  async parseStreaming(file: File, onProgress: ParserProgressCallback): Promise<ParsedBook> {
    const pages: Blob[] = []
    const streamResult = await parseArchiveFileStreaming(file, (pageIndex, blob) => {
      pages.push(blob)
      const pct = Math.min(
        PROGRESS_DURING_STREAM_CAP,
        Math.round(PROGRESS_DURING_STREAM_CAP * (1 - 1 / (PROGRESS_CURVE_OFFSET + pageIndex)))
      )
      onProgress(pct)
    })
    onProgress(PROGRESS_COMPLETE)
    return this.toParsedBook({
      title: streamResult.title,
      coverBlob: streamResult.coverBlob,
      pages,
      pageNames: streamResult.pageNames,
    })
  }

  /** 散图文件夹（不走 canParse 路径，由调用方直接调用） */
  async parseImageFolder(files: File[], folderName: string): Promise<ParsedBook> {
    const archive = await parseImageFiles(files, folderName)
    return this.toParsedBook({
      title: archive.title,
      coverBlob: archive.coverBlob,
      pages: archive.pages,
      pageNames: archive.pageNames,
    })
  }

  /**
   * 将底层 archive 抽取结果转换为统一 `ParsedComicBook`。
   *
   * @throws 当压缩包未抽出任何图片（`pages` 为空或 `coverBlob` 为 null）时抛错，
   *   避免上层用 0-byte Blob 作为封面默写入库，造成缩略图损坏。
   */
  private toParsedBook(archive: {
    title: string
    coverBlob: Blob | null
    pages: Blob[]
    pageNames: string[]
  }): ParsedComicBook {
    if (archive.pages.length === 0 || archive.coverBlob === null) {
      throw new Error('压缩包中未找到任何图片')
    }
    const pageRefs: PageRef[] = archive.pages.map((_, i) => ({
      kind: 'image' as const,
      index: i,
    }))
    return {
      format: 'comic',
      title: archive.title,
      coverBlob: archive.coverBlob,
      imagePages: archive.pages,
      imagePageNames: archive.pageNames,
      pageRefs,
    }
  }
}
