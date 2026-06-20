import { isTextFile } from '@/utils/fileType'
import type { BookParser, ParsedBook, ParsedTextBook, ParserProgressCallback } from './types'
import { extractTitleFromFilename, splitTextIntoChapters } from './utils'

/**
 * 纯文本文件解析器（BookParser 适配器）。
 *
 * 支持 .txt 格式，自动检测 UTF-8/GBK 编码。
 * 导入时自动拆分章节（支持中英文常见章节格式）。
 * 生成纯色封面作为占位。
 */
export class TextParser implements BookParser {
  canParse(input: { name: string }): boolean {
    return isTextFile(input.name)
  }

  async parse(file: File, onProgress?: ParserProgressCallback): Promise<ParsedBook> {
    onProgress?.(10)

    const arrayBuffer = await file.arrayBuffer()
    onProgress?.(30)

    const { text, encoding } = decodeWithFallback(arrayBuffer)
    onProgress?.(50)

    const title = extractTitleFromFilename(file.name)
    onProgress?.(60)

    // 导入时拆分章节
    const chapters = splitTextIntoChapters(text)
    onProgress?.(80)

    const coverBlob = await generateTextCover(title)
    onProgress?.(90)

    const result: ParsedTextBook = {
      format: 'text',
      title,
      coverBlob,
      textFile: new Blob([text], { type: 'text/plain;charset=' + encoding }),
      textEncoding: encoding,
      chapters,
    }

    onProgress?.(100)
    return result
  }
}

/**
 * 尝试用 UTF-8 解码，若失败则回退 GBK，最终兑底 UTF-8 非严格模式。
 */
function decodeWithFallback(buffer: ArrayBuffer): { text: string; encoding: string } {
  // 先尝试 UTF-8（fatal 模式会在遇到非法字节序列时抛错）
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
    const text = utf8Decoder.decode(buffer)
    return { text, encoding: 'utf-8' }
  } catch {
    // UTF-8 解码失败，尝试 GBK
  }

  try {
    const gbkDecoder = new TextDecoder('gbk', { fatal: false })
    const text = gbkDecoder.decode(buffer)
    return { text, encoding: 'gbk' }
  } catch {
    // fallback: 用 UTF-8 非严格模式
    const fallbackDecoder = new TextDecoder('utf-8', { fatal: false })
    return { text: fallbackDecoder.decode(buffer), encoding: 'utf-8' }
  }
}

/**
 * 生成纯文本封面（Canvas 绘制纯色背景 + 标题文字）。
 */
async function generateTextCover(title: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 450
  const ctx = canvas.getContext('2d')!

  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#4a6741')
  gradient.addColorStop(1, '#2d4a28')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 标题文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 简单文字换行（每行最多 8 个字符）
  const maxCharsPerLine = 8
  const lines: string[] = []
  for (let i = 0; i < title.length; i += maxCharsPerLine) {
    lines.push(title.substring(i, i + maxCharsPerLine))
  }

  const lineHeight = 36
  const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * lineHeight)
  })

  // 底部 "TXT" 标记
  ctx.font = '14px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('TXT', canvas.width / 2, canvas.height - 30)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([], { type: 'image/png' }))
    }, 'image/png')
  })
}
