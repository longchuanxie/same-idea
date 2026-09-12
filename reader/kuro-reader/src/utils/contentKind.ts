/**
 * 内容类型启发式检测：决定知识库按「小说」还是「学术」视角生成。
 *
 * 纯函数、可解释、可单测——信号全部来自文本表层特征（章节标题、对话密度、
 * 定义句式、学术部件词），检测结论只影响任务集与提示词，不落任何数据断言；
 * 用户可在档案卡知识库区块手动指定，覆盖自动判断。
 */

import type { ContentKind } from '@/types'

/** 检测采样上限（长书取头部即可判断文体，免全文扫描） */
export const DETECT_SAMPLE_CHARS = 6000

/** 学术信号：部件词（强信号，一个就基本定性） */
const ACADEMIC_STRONG_PATTERN =
  /参考文献|摘\s*要|关\s*键\s*词|Abstract\b|References\b|目\s*录|索引\b|et\s+al\.|doi:|ISBN/i
/** 学术信号：定义句式（密度型弱信号） */
const ACADEMIC_DEF_PATTERN = /是指|定义为|所谓[^，。]{1,12}[是指]|被定义|术语|定理|引理|公理|假设\d|表\s*\d|图\s*\d/
/** 学术信号：小节编号（1.1 / 1.1.2） */
const ACADEMIC_SECTION_PATTERN = /^\s*\d+\.\d+(\.\d+)?\s+\S/m
/** 小说信号：对白引号（密度型） */
const FICTION_DIALOGUE_PATTERN = /[「」『』“”]/
/** 小说信号：对白引导动词 */
const FICTION_SPEECH_PATTERN = /[说道问道答道喊道笑道骂道叹道]道/

const DEF_SIGNAL_SECTION = 2
const DEF_SIGNAL_DEF_EACH = 1
const FICTION_SIGNAL_EACH = 1
/** 弱信号计量上限（防长文本一侧压倒性积分） */
const DEF_SIGNAL_MAX_HITS = 4
const FICTION_DIALOGUE_MAX_HITS = 40
/** 学术判定分数线：强信号直接过线；弱信号需累计 */
const ACADEMIC_THRESHOLD = 4

/**
 * 判定文本属于小说还是学术（教材/论文/论著/科普非虚构）。
 * 默认小说：人物图谱对叙事文本收益最大，学术弱信号不足时保守回落。
 */
export function detectContentKind(text: string): ContentKind {
  const sample = text.slice(0, DETECT_SAMPLE_CHARS)
  if (!sample.trim()) return 'fiction'

  if (ACADEMIC_STRONG_PATTERN.test(sample)) return 'academic'

  let score = 0
  if (ACADEMIC_SECTION_PATTERN.test(sample)) score += DEF_SIGNAL_SECTION
  const defHits = sample.match(new RegExp(ACADEMIC_DEF_PATTERN.source, 'g'))
  if (defHits) score += Math.min(defHits.length, DEF_SIGNAL_MAX_HITS) * DEF_SIGNAL_DEF_EACH

  const dialogueHits = sample.match(new RegExp(FICTION_DIALOGUE_PATTERN.source, 'g'))
  const speechHits = sample.match(new RegExp(FICTION_SPEECH_PATTERN.source, 'g'))
  const fictionScore =
    (dialogueHits ? Math.min(dialogueHits.length, FICTION_DIALOGUE_MAX_HITS) : 0) * FICTION_SIGNAL_EACH +
    (speechHits ? speechHits.length * 2 : 0)

  // 学术分数线需显著压过小说信号（对白密集的通俗读物不该被误判成学术）
  return score >= ACADEMIC_THRESHOLD && score * 2 > fictionScore ? 'academic' : 'fiction'
}

/** 汇总多章文本后检测（每章取头部，均衡采样） */
export function detectContentKindFromChapters(chapterTexts: readonly string[]): ContentKind {
  if (chapterTexts.length === 0) return 'fiction'
  const perChapter = Math.max(
    Math.floor(DETECT_SAMPLE_CHARS / chapterTexts.length),
    Math.floor(DETECT_SAMPLE_CHARS / 10)
  )
  const sample = chapterTexts.map((text) => text.slice(0, perChapter)).join('\n')
  return detectContentKind(sample)
}

/** 按书检测结果缓存（检测要加载正文，档案卡每次挂载都拉一遍不划算） */
const bookKindCache = new Map<string, Promise<ContentKind>>()

/** 读取一本书的正文采样并检测内容类型；漫画无文本层，视为小说视角 */
export async function detectBookContentKind(book: {
  id: string
  format?: string
}): Promise<ContentKind> {
  const cached = bookKindCache.get(book.id)
  if (cached) return cached
  const detection: Promise<ContentKind> = (async (): Promise<ContentKind> => {
    if (book.format === 'pdf') {
      const { getPdfPageTexts } = await import('@/services/pdfText')
      return detectContentKindFromChapters(await getPdfPageTexts(book.id))
    }
    if (book.format === 'text') {
      const { loadTextContent } = await import('@/services/textContent')
      const { chapters } = await loadTextContent(book.id)
      return detectContentKindFromChapters(chapters.map((chapter) => chapter.content))
    }
    return 'fiction'
  })().catch((): ContentKind => 'fiction')
  bookKindCache.set(book.id, detection)
  return detection
}
