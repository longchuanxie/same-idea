import { isChapterTitle } from '@/services/parsers/utils'

/**
 * 原文净化规则引擎（A/B 类，本地纯函数、零 token；2026-10-16 裁定首发范围）。
 *
 * 脏内容分两类处理：
 * - A 类「模式化广告/水印」：URL、站名、群号、推广话术。只做「片段剔除 + 残料整行删除」——
 *   命中规则先挖掉广告片段，剩余正文不足 4 字才判为纯广告行整行删除；行内有长度闸、
 *   章级删除比例闸双保险，宁可漏杀不可误杀正文（求票/作者的话属 C 类语义判断，规则不碰）。
 * - B 类「排版噪音」：连续空行折叠、行尾空白、段首缩进规范化（≥3 连续缩进视为诗行/刻意排版保留）、
 *   中文语境半角标点全角化。
 *
 * 架构约束：原始 blob 永不改写，净化结果由 textContent 物化进章节缓存（带 sanitizeRev）；
 * 只对 TXT 生效（Markdown 章节另有结构文档渲染管线，EPUB 无缓存层，均不接）。
 */

/** 广告规则语义版本：规则增删/阈值调整时 bump，旧缓存因 rev 不匹配自动重算
 *  v2（2026-10-16）：标点全角化后视容忍空白 + 行级清理前置（行尾半角句点漏转判例） */
export const SANITIZE_RULES_VERSION = 2

export type SanitizeAdsMode = 'on' | 'detect' | 'off'

export interface SanitizeOptions {
  /** B 类排版清理 */
  typography: boolean
  /** A 类广告清理：on=应用 / detect=只检测不删（每书首开确认门用）/ off=关闭 */
  ads: SanitizeAdsMode
  /** 用户自定义关键词（命中即按广告片段剔除） */
  customKeywords: string[]
}

export interface ChapterSanitizeOutcome {
  content: string
  /** 触发广告规则的行预览（应用与检测模式都含，供确认弹窗展示） */
  adLinePreviews: string[]
  /** 整行删除数（detect 恒 0） */
  removedLineCount: number
  /** 片段剔除数（行保留、广告片段已挖除；detect 恒 0） */
  fragmentRemovedCount: number
  /** 因章级比例闸放弃的命中数（原文保留，疑似规则误伤时的保险丝） */
  suppressedHitCount: number
  /** 排版修整次数（折行/缩进/标点，纯计数） */
  typographyFixCount: number
}

export interface SanitizeSummary {
  /** 广告命中总数（整行删除 + 片段剔除；不含被比例闸抑制的） */
  adHitCount: number
  /** 命中行预览样例（封顶，供确认弹窗） */
  adSamples: string[]
  /** 被比例闸抑制的命中数 */
  suppressedHitCount: number
  typographyFixCount: number
}

/** 广告行判定上限：站点推广以短行为主，长行命中特征更可能是正文引用（宁漏勿杀） */
const AD_LINE_MAX_LENGTH = 120
/** 片段剔除后剩余正文不足此长度 → 判纯广告行，整行删除 */
const AD_RESIDUE_DROP_MAX = 4
/** 章内非空行被整行删除的比例闸：超过即放弃本章全部广告动作（词典大面积误伤的保险丝） */
const MAX_AD_REMOVAL_RATIO = 0.6
/** 确认弹窗样例封顶 */
const SAMPLE_MAX_COUNT = 20
const PREVIEW_MAX_LENGTH = 40
/** 自定义关键词长度上限（超长视为误输入，不入规则） */
const CUSTOM_KEYWORD_MAX_LENGTH = 30
/** 残料连接词迭代剥离轮数（「本书来自X站首发于Y」双层嵌套场景） */
const CONNECTOR_STRIP_ROUNDS = 3
/** FNV-1a 参数（32 位） */
const FNV_OFFSET_BASIS = 0x811c9dc5
const FNV_PRIME = 0x01000193

/** 常见盗版聚合站名（强特征，短行内出现即按广告处理） */
const AD_SITE_NAMES = [
  '笔趣阁', '新笔趣阁', '顶点小说', '顶点中文网', '快眼看书', '八一中文网', '八一中文',
  '999小说', '59文学', '59小说网', '悠悠书盟', '书海阁', '齐齐读', '97中文', '97小说网',
  '58小说网', 'UC书盟', '笔神阁', '全本小说网', '得奇小说网', '瀚海书院',
]

/** A 类广告片段规则：命中即从行内挖除该片段；残料不足阈值再升级为整行删除。
 *  每条都锚定「站点指向」强特征（网址/群号/站名/推广动词链），叙述性句子里的裸词不杀。 */
const AD_SPAN_PATTERNS: { id: string; pattern: RegExp }[] = [
  // URL（协议头 / www 开头 / 裸域名，域名限定常见 TLD 防误伤 "3.14" 之类）
  { id: 'url', pattern: /(?:https?:\/\/|www\.)[^\s，。；！？、）)】"」『']+|www\.[^\s，。；！？、）)】"」『']+/gi },
  { id: 'domain', pattern: /[a-z0-9][a-z0-9-]{1,30}\.(?:com|net|cc|org|info|xyz|top|vip|la|mx|site|online|shop|mobi|cn|tw)(?:\/[^\s，。；！？、）)】"」『`]*)?/gi },
  // 群号 / 公众号
  { id: 'qq-group', pattern: /[QqＱｑ]{2}(?:群|群号|书友群|交流群)?[：:·]?\s*\d{5,12}|(?:群|书友群|交流群)[：:]\s*\d{5,12}/g },
  { id: 'wechat', pattern: /微信(?:公众号|群|号|客服)?[：:]?\s*[A-Za-z][A-Za-z0-9_-]{2,23}/g },
  { id: 'follow', pattern: /(?:关注|添加|搜索并)[^\n，。]{0,8}(?:公众号|微信公众号|WeChat|weixin|wx|Q群|q群|QQ群|书友群)/g },
  // 推广话术（锚定站点指向词，避免误伤叙述：「他翻到最新章节」「记住本书的教训」都不杀）
  { id: 'remember', pattern: /请?记住[^\n，。]{0,10}(?:本站|首发|域名|网址|我们)|(?:请|快)?记住本书(?:首发|域名|网址|更新地址)/g },
  { id: 'book-source', pattern: /本书(?:由|来自)[^\n，。]{0,16}(?:小说网|文学网|阅读网|中文网|书盟|独家首发|www\.[^\s，。]+|https?:\/\/[^\s，。]+)|本书(?:首发|独家)[^\n，。]{0,10}/g },
  { id: 'first-publish', pattern: /(?:首发|独发|独家)(?:地址|域名|站点|网站)/g },
  { id: 'latest', pattern: /(?:最新|最快|最全|第一时间)[^\n，。]{0,6}(?:章节|更新|全文)[^\n，。]{0,10}(?:请|尽在|就在|欢迎|访问|阅读|下载)/g },
  { id: 'more-visit', pattern: /(?:更多精彩|精彩内容|更多章节|后续章节|余下章节)[^\n，。]{0,6}(?:请)?(?:访问|前往|登录|搜索|阅读|下载|到)/g },
  { id: 'reprint', pattern: /(?:转载|搬运|来源|出处)[：:][^\n，。]{0,12}/g },
  { id: 'takedown', pattern: /侵删|侵[权删][^\n，。]{0,8}(?:请联系|致歉|删除|处理)/g },
  { id: 'no-ad', pattern: /(?:无弹窗|无广告|广告少|免广告)[^\n，。]{0,6}(?:阅读|小说|网站|版本)/g },
  { id: 'update-time', pattern: /^(?:更新时间|更新日期|发文时间|上传时间|首发时间|完本时间)[：:][^\n]+/g },
  // 站名：只用强特征专名词典（通配「XX小说网」后缀会贪婪吞掉叙述前缀——「他常去起点中文网看小说」
  // 被挖成「他看小说」——2026-10-16 判例删除；未知站名走用户自定义关键词兜底，宁可漏杀）
  { id: 'site-dict', pattern: new RegExp(AD_SITE_NAMES.map(escapeRegExp).join('|'), 'g') },
]

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildCustomPatterns(keywords: string[]): { id: string; pattern: RegExp }[] {
  const valid = keywords
    .map((kw) => kw.trim())
    .filter((kw) => kw.length > 0 && kw.length <= CUSTOM_KEYWORD_MAX_LENGTH)
  if (valid.length === 0) return []
  // 单独构造每词的 pattern：长关键词优先匹配由「先到先得的区间合并」自然处理
  return valid.map((kw, index) => ({ id: `custom-${index}`, pattern: new RegExp(escapeRegExp(kw), 'g') }))
}

/** CJK 表意文字（简繁扩展）与中文标点，用于标点全角化的语境判定 */
const CJK_CHAR = '\\u3400-\\u4dbf\\u4e00-\\u9fff'
const CJK_AFTER = '\\u3001-\\u303f\\uff01-\\uff65'

/** 残料接缝清理：行首剥全部悬挂标点；行尾只剥弱标点（逗/顿/冒/波浪），
 *  句末句号叹号问号属于正文，保留 */
const RESIDUE_LEADING_TRIM = /^[。，,、；;：:！!？?～~…\s]+/
const RESIDUE_TRAILING_TRIM = /[，,、；;：:～~\s]+$/

/** 残料末尾/开头的出处连接词：站点/链接片段被挖除后，「本书来自」「首发于」这类引导词
 *  成为悬挂噪声（残料「他转过身。本书来自」/「本书由整理发布」），迭代剥掉再判整行/片段。
 *  不吞连接词前的句读——句末句号属于正文（由行尾弱标点清理收尾）。 */
const RESIDUE_TAIL_CONNECTOR = /\s*(?:(?:本章|本书|正文|更多精彩|精彩内容)(?:来自|出自|由)?|(?:来自|出自|由|首发于|连载于|发表于|转载自|更新于)|(?:首发|独家首发))$/
const RESIDUE_HEAD_CONNECTOR = /^(?:\s*)(?:(?:本章|本书|正文)(?:来自|出自|由)?|(?:来自|出自|由))/

function stripResidueTailConnectors(residue: string): string {
  let next = residue
  for (let i = 0; i < CONNECTOR_STRIP_ROUNDS; i++) {
    const stripped = next.replace(RESIDUE_TAIL_CONNECTOR, '').replace(RESIDUE_HEAD_CONNECTOR, '')
    if (stripped === next) break
    next = stripped
  }
  return next
}

interface SpanAction {
  /** 命中的广告片段起止（含端点，行内坐标） */
  start: number
  end: number
}

/** 收集一行内全部广告片段区间（重叠合并） */
function collectAdSpans(line: string, customPatterns: { id: string; pattern: RegExp }[]): SpanAction[] {
  const spans: SpanAction[] = []
  const patterns = customPatterns.length > 0 ? [...AD_SPAN_PATTERNS, ...customPatterns] : AD_SPAN_PATTERNS
  for (const { pattern } of patterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(line)) !== null) {
      if (match[0].length > 0) spans.push({ start: match.index, end: match.index + match[0].length })
      // 非 global 正则 exec 恒返首 match（死循环保险丝）；零宽匹配保护
      if (!pattern.global) break
      if (match.index === pattern.lastIndex) pattern.lastIndex++
    }
  }
  if (spans.length === 0) return []
  spans.sort((a, b) => a.start - b.start || b.end - a.end)
  const merged: SpanAction[] = []
  for (const span of spans) {
    const last = merged[merged.length - 1]
    if (last && span.start <= last.end) {
      last.end = Math.max(last.end, span.end)
    } else {
      merged.push({ ...span })
    }
  }
  return merged
}

function truncatePreview(line: string): string {
  const trimmed = line.trim()
  return trimmed.length <= PREVIEW_MAX_LENGTH ? trimmed : `${trimmed.slice(0, PREVIEW_MAX_LENGTH)}…`
}

/** B 类排版清理（无损规范化）：行尾空白、段首缩进（≤2 缩进剥除，≥3 视为诗行保留）、行内连续空格折叠 */
function sanitizeTypographyLines(content: string): { content: string; fixCount: number } {
  const lines = content.split('\n')
  let fixCount = 0
  const cleaned = lines.map((line) => {
    let next = line
    // 行尾空白（含全角空格）
    const trimmedEnd = next.replace(/[ \t\u3000]+$/, '')
    if (trimmedEnd !== next) fixCount++
    next = trimmedEnd
    // 段首缩进：1-2 个空白剥除（阅读器用 CSS 首行缩进）；≥3 视为诗行/刻意排版，保留
    const indentMatch = next.match(/^[ \t\u3000]+/)
    if (indentMatch && indentMatch[0].length <= 2 && indentMatch[0].length < next.length) {
      next = next.slice(indentMatch[0].length)
      fixCount++
    }
    // 行内连续半角空格折叠为单个（与 EPUB 清洗管线同规则）
    const collapsed = next.replace(/[ \t]{2,}/g, ' ')
    if (collapsed !== next) fixCount++
    next = collapsed
    return next
  })
  let result = cleaned.join('\n')
  // 连续 3+ 空行折叠为 1 个段落间隔
  const folded = result.replace(/\n{3,}/g, '\n\n')
  if (folded !== result) fixCount++
  result = folded
  return { content: result.trim(), fixCount }
}

/** 中文语境半角标点全角化（前后都是 CJK/中文标点才转换；数字、英文叙述不受影响）。
 *  后视容忍空白（「亮起来, 像…」「水面. 换行」这类手打源常见混排），行尾视为中文语境收尾 */
function widenPunctuation(content: string): { content: string; fixCount: number } {
  let fixCount = 0
  let result = content
  // 省略号先行归一：CJK 后连续 3+ 半角点 → ……
  const ellipsis = new RegExp(`([${CJK_CHAR}])\\.{3,}(?=\\s*[${CJK_CHAR}${CJK_AFTER}])`, 'g')
  result = result.replace(ellipsis, (_m, before: string) => {
    fixCount++
    return `${before}……`
  })
  const pairs: Array<[string, string]> = [
    [',', '，'], ['.', '。'], ['!', '！'], ['?', '？'], [':', '：'], [';', '；'],
  ]
  for (const [half, full] of pairs) {
    // 行尾也视为中文语境收尾（「当然!」行尾 → 「当然！」）；前置仍须 CJK，
    // 数字小数（3.5）与英文句读（pm.）靠前置字符天然不匹配
    const rx = new RegExp(`([${CJK_CHAR}])\\${half}(?=\\s*(?:[${CJK_CHAR}${CJK_AFTER}]|$))`, 'g')
    result = result.replace(rx, (_m, before: string) => {
      fixCount++
      return `${before}${full}`
    })
  }
  return { content: result, fixCount }
}

/** 单章净化：A 类片段剔除/整行删除 + B 类排版修整 */
export function sanitizeChapterText(content: string, options: SanitizeOptions): ChapterSanitizeOutcome {
  const outcome: ChapterSanitizeOutcome = {
    content,
    adLinePreviews: [],
    removedLineCount: 0,
    fragmentRemovedCount: 0,
    suppressedHitCount: 0,
    typographyFixCount: 0,
  }
  const customPatterns = options.ads === 'off' ? [] : buildCustomPatterns(options.customKeywords)

  if (options.ads !== 'off') {
    const lines = content.split('\n')
    interface LinePlan {
      line: string
      drop: boolean
      fragment: string | null
      preview: string
    }
    const plans: LinePlan[] = lines.map((line) => {
      const trimmedLength = line.trim().length
      if (
        trimmedLength === 0 ||
        line.length > AD_LINE_MAX_LENGTH ||
        isChapterTitle(line)
      ) {
        return { line, drop: false, fragment: null, preview: '' }
      }
      const spans = collectAdSpans(line, customPatterns)
      if (spans.length === 0) return { line, drop: false, fragment: null, preview: '' }
      let residue = ''
      let cursor = 0
      for (const span of spans) {
        residue += line.slice(cursor, span.start)
        cursor = span.end
      }
      residue += line.slice(cursor)
      const cleanedResidue = stripResidueTailConnectors(residue)
        .replace(RESIDUE_LEADING_TRIM, '')
        .replace(RESIDUE_TRAILING_TRIM, '')
      if (cleanedResidue.length <= AD_RESIDUE_DROP_MAX) {
        return { line, drop: true, fragment: null, preview: truncatePreview(line) }
      }
      return { line, drop: false, fragment: cleanedResidue, preview: truncatePreview(line) }
    })

    const nonEmptyCount = lines.filter((line) => line.trim().length > 0).length
    const dropCount = plans.filter((plan) => plan.drop).length
    const hitCount = plans.filter((plan) => plan.drop || plan.fragment !== null).length
    const suppressed = nonEmptyCount > 0 && dropCount / nonEmptyCount > MAX_AD_REMOVAL_RATIO

    if (suppressed) {
      // 比例闸烧断：本章疑似规则误伤面过大，全部保留原文只记账
      outcome.suppressedHitCount = hitCount
    } else if (options.ads === 'on') {
      const rebuilt = plans.map((plan) => {
        if (plan.drop) {
          outcome.removedLineCount++
          outcome.adLinePreviews.push(plan.preview)
          return ''
        }
        if (plan.fragment !== null) {
          outcome.fragmentRemovedCount++
          outcome.adLinePreviews.push(plan.preview)
          return plan.fragment
        }
        return plan.line
      })
      let joined = rebuilt.join('\n')
      joined = joined.replace(/\n{3,}/g, '\n\n').trim()
      outcome.content = joined
    } else {
      // detect：内容不动，只报命中
      outcome.adLinePreviews = plans
        .filter((plan) => plan.drop || plan.fragment !== null)
        .map((plan) => plan.preview)
    }
  }

  if (options.typography) {
    // 先做行级清理（剥行尾空白），标点全角化才能吃到「行尾即中文语境收尾」的干净边界
    const tidied = sanitizeTypographyLines(outcome.content)
    const widened = widenPunctuation(tidied.content)
    outcome.content = widened.content
    outcome.typographyFixCount = widened.fixCount + tidied.fixCount
  }

  return outcome
}

/** 整书净化：逐章跑规则，汇总摘要（供缓存记录与确认弹窗） */
export function sanitizeBookChapters<T extends { content: string }>(
  chapters: T[],
  options: SanitizeOptions
): { chapters: T[]; summary: SanitizeSummary } {
  const summary: SanitizeSummary = {
    adHitCount: 0,
    adSamples: [],
    suppressedHitCount: 0,
    typographyFixCount: 0,
  }
  const sanitized = chapters.map((chapter) => {
    const outcome = sanitizeChapterText(chapter.content, options)
    // 命中数按预览计：apply 模式预览与动作一一对应，detect 模式动作恒 0 但预览在
    summary.adHitCount += outcome.adLinePreviews.length
    summary.suppressedHitCount += outcome.suppressedHitCount
    summary.typographyFixCount += outcome.typographyFixCount
    for (const preview of outcome.adLinePreviews) {
      if (summary.adSamples.length < SAMPLE_MAX_COUNT) summary.adSamples.push(preview)
    }
    return outcome.content === chapter.content ? chapter : ({ ...chapter, content: outcome.content } as T)
  })
  return { chapters: sanitized, summary }
}

/** FNV-1a 32 位哈希（确定性指纹，非加密用途；与 bookCorpus 同算法独立维护） */
function fnv1a(input: string): string {
  let hash = FNV_OFFSET_BASIS
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME) >>> 0
  }
  return hash.toString(36)
}

/** 净化配置指纹：进章节缓存的 sanitizeRev，配置/规则任一变化即缓存失效重算 */
export function computeSanitizeRev(options: SanitizeOptions): string {
  const fingerprint = fnv1a(
    JSON.stringify([SANITIZE_RULES_VERSION, options.typography, options.ads, options.customKeywords])
  )
  return `v${SANITIZE_RULES_VERSION}:${fingerprint}`
}

export interface ContentSanitizeSettingsLike {
  enabled: boolean
  typography: boolean
  ads: boolean
  customKeywords: string[]
}

/**
 * 全局设置 × 按书门槛 → 实际生效的净化选项。
 * 广告规则按书三态：'on' 已确认应用 / 'pending' 未决（开书弹确认门，先 detect）/'off' 该书关闭。
 */
export function resolveSanitizeOptions(
  settings: ContentSanitizeSettingsLike | undefined,
  bookAdsState: 'pending' | 'on' | 'off' | undefined
): SanitizeOptions {
  if (!settings || !settings.enabled) return { typography: false, ads: 'off', customKeywords: [] }
  const ads: SanitizeAdsMode =
    settings.ads && bookAdsState !== 'off'
      ? bookAdsState === 'on'
        ? 'on'
        : 'detect'
      : 'off'
  return { typography: settings.typography, ads, customKeywords: settings.customKeywords }
}
