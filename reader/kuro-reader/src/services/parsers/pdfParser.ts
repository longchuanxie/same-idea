import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

import { extractTitleFromFileName } from '@/utils/extractTitle'
import { isPdfFile } from '@/utils/fileType'

import type { BookParser, ParsedBook, ParsedPdfBook, ParserProgressCallback } from './types'

GlobalWorkerOptions.workerSrc = workerUrl

/** 页面渲染最大宽度（px）：超出按比例缩小，兼顾清晰度与导入耗时/内存 */
const RENDER_MAX_WIDTH_PX = 1400
/** 页面渲染最大放大倍数（相对 PDF 原始尺寸） */
const RENDER_MAX_SCALE = 2
/** 渲染页压缩格式与质量 */
const PAGE_IMAGE_TYPE = 'image/jpeg'
const PAGE_IMAGE_QUALITY = 0.85
/** 导入进度分段（百分比）：开始 → 文档加载完 → 逐页渲染区间 → 100 完成 */
const PROGRESS_STARTED = 5
const PROGRESS_DOC_LOADED = 15
const PROGRESS_RENDER_SPAN = 80

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob 返回空值'))),
      type,
      quality
    )
  })
}

/** 解析 PDF 文档（导出供测试与后续按需渲染复用）；pdfjs 6 要求纯 Uint8Array 且显式拒绝 Buffer */
export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  // 跨 realm 安全转换：不能依赖 instanceof（测试环境的 Buffer 可能来自不同 realm）
  const bytes = data instanceof ArrayBuffer ? data : Uint8Array.from(data as ArrayLike<number>);
  return getDocument({ data: bytes }).promise
}

export class PdfParser implements BookParser {
  canParse(input: { name: string }): boolean {
    return isPdfFile(input.name)
  }

  /**
   * 逐页渲染为图片（复用漫画阅读器），同时保留原始 PDF 文件。
   */
  async parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook> {
    onProgress?.(PROGRESS_STARTED)

    const data = await file.arrayBuffer()
    const loadingTask = getDocument({ data })
    const doc = await loadingTask.promise
    onProgress?.(PROGRESS_DOC_LOADED)

    const pages: Blob[] = []
    try {
      for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
        const page = await doc.getPage(pageNumber)
        const baseViewport = page.getViewport({ scale: 1 })
        const scale = Math.min(
          RENDER_MAX_SCALE,
          Math.max(1, RENDER_MAX_WIDTH_PX / baseViewport.width)
        )
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const context = canvas.getContext('2d')
        if (!context) throw new Error('无法创建画布上下文')
        await page.render({ canvasContext: context, viewport, canvas }).promise
        pages.push(await canvasToBlob(canvas, PAGE_IMAGE_TYPE, PAGE_IMAGE_QUALITY))

        onProgress?.(PROGRESS_DOC_LOADED + Math.round((pageNumber / doc.numPages) * PROGRESS_RENDER_SPAN))
      }
    } finally {
      await loadingTask.destroy()
    }

    const title = extractTitleFromFileName(file.name)
    const coverBlob = pages[0] ?? new Blob([], { type: PAGE_IMAGE_TYPE })

    const result: ParsedPdfBook = {
      format: 'pdf',
      title,
      coverBlob,
      pdfFile: file,
      pdfTotalPages: pages.length,
      imagePages: pages,
      imagePageNames: pages.map((_, i) => `page-${i + 1}.jpg`),
    }
    onProgress?.(100)
    return result
  }
}
