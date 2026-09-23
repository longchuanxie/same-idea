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
 * 章节标题匹配正则（可信模式）。
 * 覆盖中英文小说常见格式：
 * - 第一章、第1章、第一章回、第壹章、第百二十三章
 * - 第1节、第1回、第1卷、第1集、第1篇、第1部、第1话
 * - Chapter 1、CHAPTER 1、Chapter One
 * - 序言、前言、后记、楔子、尾声、引子、番外、番外篇、终章、尾声
 * - Prologue、Epilogue、Preface、Afterword、Introduction
 * 数字编号型（1. 标题 / 001 标题）易误伤正文（小数/年份/数量），单独由
 * matchNumericChapterTitle 判定并经全文递增一致性验证后才承认。
 */
const CN_NUM = '[一二三四五六七八九十百千万零壹贰叁肆伍陆柒捌玖拾佰仟\\d]+'
const CHAPTER_WORD = '[章节回卷集篇部话话集]'

const TRUSTED_CHAPTER_PATTERNS: RegExp[] = [
  // 第X章/节/回/卷/集/篇/部/话
  new RegExp(`^\\s*第${CN_NUM}${CHAPTER_WORD}.*\\s*$`, 'i'),
  // Chapter X / CHAPTER X / Chapter One
  /^\s*chapter\s+[\dIVXLCDMoneTwoThreeFourFiveSixSevenEightNineTen]+\b.*\s*$/i,
]

// 特殊独立章节名（序言、前言等）
const SPECIAL_CHAPTER_NAMES = new Set([
  '序言', '序', '前言', '前记', '引子', '楔子', '尾声', '后记', '后序', '跋',
  '终章', '番外', '番外篇', '完结', '尾声',
  'prologue', 'epilogue', 'preface', 'afterword', 'introduction', 'foreword',
  'appendix', 'interlude', 'conclusion',
])

/**
 * 中文数字串 → 数值（章节编号常见量级 ≤999）。解析不了的形态返回 null。
 * 支持简写（十/十五/二十三）与带零填充（一百零三）；大写数字同形处理。
 */
const CN_NUMERAL_DIGITS: Record<string, number> = {
  零: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9,
  壹: 1, 贰: 2, 叁: 3, 肆: 4, 伍: 5, 陆: 6, 柒: 7, 捌: 8, 玖: 9,
}
const CN_NUMERAL_UNITS: Record<string, number> = { 十: 10, 百: 100, 拾: 10, 佰: 100 }
const CN_NUMERAL_CHARS = '[零一二三四五六七八九十百壹贰叁肆伍陆柒捌玖拾佰]'

export function parseChineseNumeral(text: string): number | null {
  if (!new RegExp(`^${CN_NUMERAL_CHARS}{1,6}$`).test(text)) return null
  let total = 0
  let section = 0
  let digit = 0
  for (const ch of text) {
    const d = CN_NUMERAL_DIGITS[ch]
    if (d !== undefined) {
      digit = d
      continue
    }
    const unit = CN_NUMERAL_UNITS[ch]
    if (unit === undefined) return null
    // 裸「十」开头（十五/十里亭）视作 1×10
    if (digit === 0 && section === 0 && unit === 10) {
      section = 10
    } else {
      section += (digit || 1) * unit
    }
    if (unit === 100) {
      total += section
      section = 0
    }
    digit = 0
  }
  return total + section + digit
}

/**
 * 数字编号型标题判定（1. 标题 / 001 标题 / 一、标题 / （十二）标题）。命中返回编号值，否则返回 null。
 * 防误判设计：
 * - 分隔符（.．)) 后紧跟数字视为小数（"3.5 星的评价"）→ 不算标题；
 * - 纯数字+标题模式只认零填充编号（"001 标题"），裸数字（"1024 个读者"与
 *   年份/数量无法区分）不再当标题；
 * - 中文数字裸枚举（一、/（一））同走本入口——是否采纳由调用方的
 *   全文递增一致性验证统一把关（议论文小节枚举本就递增，拆分可辩护；
 *   正文杂乱数字行会被闸门整批降级）。
 */
export function matchNumericChapterTitle(line: string): number | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.length > 60) return null
  // 缩进行视为内容行（与 isChapterTitle 的缩进规则一致）
  if (line !== trimmed && /^[\s\u3000]/.test(line)) return null

  const separatorForm = trimmed.match(/^\s*(\d{1,4})\s*[、.．)\uff09](?!\d)\s*(.{1,40})\s*$/)
  if (separatorForm) return Number.parseInt(separatorForm[1], 10)
  const zeroPaddedForm = trimmed.match(/^\s*(0\d{2,3})\s+.{1,40}\s*$/)
  if (zeroPaddedForm) return Number.parseInt(zeroPaddedForm[1], 10)
  // 中文数字裸枚举：顿号/句点分隔（一、开端）与括号包裹（（十二）谜团）
  const cnSeparatorForm = trimmed.match(
    new RegExp(`^\\s*(${CN_NUMERAL_CHARS}{1,6})\\s*[\u3001.\uff0e](?!\\d)\\s*(.{1,40})\\s*$`)
  )
  if (cnSeparatorForm) return parseChineseNumeral(cnSeparatorForm[1])
  const cnParenForm = trimmed.match(
    new RegExp(`^[\\uff08(]\\s*(${CN_NUMERAL_CHARS}{1,6})\\s*[\\uff09)]\\s*(.{1,40})\\s*$`)
  )
  if (cnParenForm) return parseChineseNumeral(cnParenForm[1])
  return null
}

/** 数字型候选参与递增一致性验证的门槛与增幅要求（低于即整批降级为正文） */
const NUMERIC_SEQ_MIN_CANDIDATES = 2;
const NUMERIC_SEQ_INCREASE_RATIO = 0.5;

/**
 * 无标题整本的兜底切分阈值与目标块大小（字符）：
 * 拆不出任何章节标题时整本会落成单个巨型章节——数 MB 正文在分页模式下
 * 是分钟级测量、滚动模式下是巨 DOM，均不可用。超过触发阈值即按段落
 * 边界切成目标大小的伪章节（正文（1）、正文（2）……）。
 */
const OVERSIZED_SINGLE_CHAPTER_SPLIT_TRIGGER = 100_000;
const OVERSIZED_SINGLE_CHAPTER_TARGET = 30_000;

/** 中文序号（伪章节标题用）；≥100 回退阿拉伯数字（无标题巨书切出百段以上时仍可读） */
const CN_ORDINAL_TEENS_BOUND = 20;
const CN_ORDINAL_HUNDRED_BOUND = 100;

function toChineseOrdinal(n: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (n >= CN_ORDINAL_HUNDRED_BOUND) return String(n);
  if (n <= 10) return n === 10 ? '十' : digits[n];
  if (n < CN_ORDINAL_TEENS_BOUND) return '十' + digits[n % 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return digits[tens] + '十' + (ones > 0 ? digits[ones] : '');
}

/** 超长无标题正文的兜底切分：按行累积到目标大小封块（段落粒度允许少量超出）；
 *  单行本身超过目标（无换行的整块文本）才按字符硬切 */
function splitOversizedContent(content: string): ParsedTextChapter[] {
  const chapters: ParsedTextChapter[] = [];
  const pushChunk = (lines: string[]) => {
    if (lines.length === 0) return;
    const chunkContent = lines.join('\n').trim();
    if (chunkContent.length === 0) return;
    chapters.push({
      title: `正文（${toChineseOrdinal(chapters.length + 1)}）`,
      content: chunkContent,
    })
  }

  let current: string[] = []
  let currentLength = 0
  for (const line of content.split('\n')) {
    if (line.length >= OVERSIZED_SINGLE_CHAPTER_TARGET) {
      // 单行即超目标：封存当前块，行内按字符硬切成连续片段
      pushChunk(current)
      current = []
      currentLength = 0
      for (let start = 0; start < line.length; start += OVERSIZED_SINGLE_CHAPTER_TARGET) {
        pushChunk([line.slice(start, start + OVERSIZED_SINGLE_CHAPTER_TARGET)])
      }
      continue
    }
    current.push(line)
    currentLength += line.length + 1
    if (currentLength >= OVERSIZED_SINGLE_CHAPTER_TARGET) {
      pushChunk(current)
      current = []
      currentLength = 0
    }
  }
  pushChunk(current)

  return chapters
}

/**
 * 判断一行是否为章节标题。
 * 规则：
 * 1. 不能以全角空格或其他缩进开头（缩进行视为内容行）
 * 2. 匹配可信正则 / 特殊章节名 / 数字编号型
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

  // 可信正则
  for (const pattern of TRUSTED_CHAPTER_PATTERNS) {
    if (pattern.test(trimmed)) return true
  }

  // 数字编号型（是否采纳由调用方的全文验证决定）
  return matchNumericChapterTitle(line) != null
}

/**
 * 将纯文本按章节标题拆分为章节列表。
 * 支持中英文小说常见章节格式。
 *
 * 策略：
 * 1. 逐行扫描，识别章节标题行
 * 2. 章节标题之间的内容归入该章节
 * 3. 第一个标题之前的内容归入「前言」章节
 * 4. 若未找到任何章节：短文本整篇作为一个章节；超长文本（>10 万字符）按段落
 *    边界兜底切分成伪章节，避免巨型单章把阅读器（分页测量/整章 DOM）拖死
 * 5. 数字编号型标题（1. 标题）需通过全文递增一致性验证：真章节的编号
 *    沿文档顺序大致递增，正文里的年份/日期/杂录行则杂乱无序——增幅不足
 *    时整批降级为内容行，避免日记体/杂录被拦腰拆成假章节
 */
export function splitTextIntoChapters(text: string): ParsedTextChapter[] {
  const lines = text.split('\n')

  // 数字型候选全文一致性验证（第一遍扫描）
  const numericCandidates = lines
    .map((line, index) => ({ index, value: matchNumericChapterTitle(line) }))
    .filter((candidate): candidate is { index: number; value: number } => candidate.value != null)
  const demotedNumericLines = new Set<number>()
  if (numericCandidates.length >= NUMERIC_SEQ_MIN_CANDIDATES) {
    let increasingPairs = 0;
    for (let i = 1; i < numericCandidates.length; i++) {
      if (numericCandidates[i].value > numericCandidates[i - 1].value) increasingPairs++;
    }
    if (increasingPairs / (numericCandidates.length - 1) < NUMERIC_SEQ_INCREASE_RATIO) {
      for (const candidate of numericCandidates) demotedNumericLines.add(candidate.index);
    }
  }

  const chapters: ParsedTextChapter[] = []
  let currentContent: string[] = []
  let currentTitle = ''
  let foundFirstChapter = false

  for (const [lineIndex, line] of lines.entries()) {
    const trimmed = line.trim()

    // 传入原始行：isChapterTitle 内部依赖前导空白判断「缩进伪标题」；
    // 被一致性验证降级的数字行视作正文
    if (isChapterTitle(line) && !demotedNumericLines.has(lineIndex)) {
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
    // 没有找到任何章节：整篇作为一个章节；超长时兜底切分（见 OVERSIZED_* 注释）
    if (lastContent.length > OVERSIZED_SINGLE_CHAPTER_SPLIT_TRIGGER) {
      chapters.push(...splitOversizedContent(lastContent))
    } else {
      chapters.push({ title: '正文', content: text })
    }
  }

  // 过滤掉空章节（内容为0字符的章节）
  return chapters.filter(ch => ch.content.length > 0)
}

/**
 * 按 Markdown 的一级、二级 ATX 标题拆分章节。
 * 标题标记不会进入正文；没有 Markdown 标题时回退到普通文本章节识别。
 */
export function splitMarkdownIntoChapters(markdown: string): ParsedTextChapter[] {
  const headingPattern = /^\s{0,3}#{1,2}\s+(.+?)(?:\s+#+)?\s*$/
  const lines = markdown.split('\n')
  const chapters: ParsedTextChapter[] = []
  let currentTitle = ''
  let currentContent: string[] = []
  let foundHeading = false

  const saveChapter = () => {
    const content = currentContent.join('\n').trim()
    if (!content) return
    chapters.push({
      title: currentTitle || (foundHeading ? '' : '前言'),
      content,
    })
  }

  for (const line of lines) {
    const headingMatch = line.match(headingPattern)
    if (!headingMatch) {
      currentContent.push(line)
      continue
    }

    saveChapter()
    foundHeading = true
    currentTitle = headingMatch[1].trim()
    currentContent = []
  }

  saveChapter()

  if (!foundHeading) return splitTextIntoChapters(markdown)
  return chapters
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
