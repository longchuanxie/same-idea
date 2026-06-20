import type { ParsedTextChapter } from './types'

/**
 * 从文件名提取标题（去掉扩展名）。
 * 供各 parser 共享使用。
 */
export function extractTitleFromFilename(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex > 0 ? filename.substring(0, dotIndex) : filename
}

/**
 * 章节标题匹配正则。
 * 覆盖中英文小说常见格式：
 * - 第一章、第1章、第一章回、第壹章、第百二十三章
 * - 第1节、第1回、第1卷、第1集、第1篇、第1部、第1话
 * - Chapter 1、CHAPTER 1、Chapter One
 * - 1. xxx、1、xxx、1) xxx
 * - 序言、前言、后记、楔子、尾声、引子、番外、番外篇、终章、尾声
 * - Prologue、Epilogue、Preface、Afterword、Introduction
 */
const CN_NUM = '[一二三四五六七八九十百千万零壹贰叁肆伍陆柒捌玖拾佰仟\\d]+'
const CHAPTER_WORD = '[章节回卷集篇部话话集]'

const CHAPTER_PATTERNS: RegExp[] = [
  // 第X章/节/回/卷/集/篇/部/话
  new RegExp(`^\\s*第${CN_NUM}${CHAPTER_WORD}.*\\s*$`, 'i'),
  // Chapter X / CHAPTER X / Chapter One
  /^\s*chapter\s+[\dIVXLCDMoneTwoThreeFourFiveSixSevenEightNineTen]+\b.*\s*$/i,
  // 数字+分隔符+标题（如 1. 标题、1、标题、1) 标题）
  /^\s*\d{1,4}\s*[、.．)\uff09]\s*.{1,40}\s*$/,
  // 纯数字+标题（如 001 标题）
  /^\s*\d{3,4}\s+.{1,40}\s*$/,
]

// 特殊独立章节名（序言、前言等）
const SPECIAL_CHAPTER_NAMES = new Set([
  '序言', '序', '前言', '前记', '引子', '楔子', '尾声', '后记', '后序', '跋',
  '终章', '番外', '番外篇', '完结', '尾声',
  'prologue', 'epilogue', 'preface', 'afterword', 'introduction', 'foreword',
  'appendix', 'interlude', 'conclusion',
])

/**
 * 判断一行是否为章节标题。
 * 规则：
 * 1. 不能以全角空格或其他缩进开头（缩进行视为内容行）
 * 2. 匹配章节正则 或 特殊章节名
 * 3. 行长度不超过 60 字符
 */
function isChapterTitle(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length > 60) return false

  // 如果行以全角空格、半角空格、制表符开头，视为内容行而非章节标题
  // 注意：line 是原始行，trimmed 是去空白后的结果
  // 如果 line 和 trimmed 不同，说明有前导空白
  if (line !== trimmed && /^[\s\u3000]/.test(line)) {
    return false
  }

  // 特殊章节名（精确匹配）
  if (SPECIAL_CHAPTER_NAMES.has(trimmed.toLowerCase())) return true

  // 正则匹配
  for (const pattern of CHAPTER_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }

  return false
}

/**
 * 将纯文本按章节标题拆分为章节列表。
 * 支持中英文小说常见章节格式。
 *
 * 策略：
 * 1. 逐行扫描，识别章节标题行
 * 2. 章节标题之间的内容归入该章节
 * 3. 第一个标题之前的内容归入「前言」章节
 * 4. 若未找到任何章节，返回单章节
 */
export function splitTextIntoChapters(text: string): ParsedTextChapter[] {
  const lines = text.split('\n')
  const chapters: ParsedTextChapter[] = []
  let currentContent: string[] = []
  let currentTitle = ''
  let foundFirstChapter = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (isChapterTitle(trimmed)) {
      // 保存之前的章节
      if (currentContent.length > 0 || foundFirstChapter) {
        const content = currentContent.join('\n').trim()
        if (content || foundFirstChapter) {
          chapters.push({
            title: currentTitle || (foundFirstChapter ? '' : '前言'),
            content,
          })
        }
      }
      foundFirstChapter = true
      currentTitle = trimmed
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }

  // 保存最后一章
  const lastContent = currentContent.join('\n').trim()
  if (foundFirstChapter) {
    chapters.push({ title: currentTitle, content: lastContent })
  } else if (lastContent) {
    // 没有找到任何章节，整篇作为一个章节
    chapters.push({ title: '正文', content: text })
  }

  // 过滤掉空章节（内容为0字符的章节）
  return chapters.filter(ch => ch.content.length > 0)
}

/**
 * 清理 HTML 标签，保留段落结构。
 * 用于 EPUB XHTML 内容提取。
 */
export function cleanHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n$1\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
