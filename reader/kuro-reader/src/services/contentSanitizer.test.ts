import { describe, it, expect } from 'vitest'

import {
  computeSanitizeRev,
  resolveSanitizeOptions,
  sanitizeChapterText,
  sanitizeBookChapters,
  type SanitizeOptions,
} from '@/services/contentSanitizer'

const APPLY: SanitizeOptions = { typography: false, ads: 'on', customKeywords: [] }
const DETECT: SanitizeOptions = { typography: false, ads: 'detect', customKeywords: [] }
const OFF: SanitizeOptions = { typography: false, ads: 'off', customKeywords: [] }

/** 标准正文段（对照样：任何规则都不得动它） */
const NARRATIVE = '他转过身，不再看她，只是望着窗外渐渐暗下来的天色。'

describe('contentSanitizer · A 类广告行', () => {
  it('纯广告短行整行删除（URL/推广话术/群号/更新时间）', () => {
    // 真实章节构成：广告是少数派（比例闸要求整行删除 ≤60% 非空行）
    const lines = [
      '夜色渐深，他把信纸折好放回抽屉。',
      '更多精彩请访问www.biquge.com',
      NARRATIVE,
      '本书由新笔趣阁整理发布',
      '请大家记住本书首发域名',
      'QQ群：123456789',
      '更新时间：2021-03-14 12:00',
      '最新章节请到笔趣阁阅读',
      '内容如有侵权请联系删除',
      '第二天清晨，码头上的雾还没散。',
      '船夫把缆绳解开，木桨划开灰白的水面。',
      '他忽然想起多年前也是这样一个清晨，母亲站在岸上没有说话。',
    ]
    const outcome = sanitizeChapterText(lines.join('\n'), APPLY)
    const kept = outcome.content.split('\n').filter((line) => line.trim().length > 0)
    expect(kept).toEqual([
      '夜色渐深，他把信纸折好放回抽屉。',
      NARRATIVE,
      '第二天清晨，码头上的雾还没散。',
      '船夫把缆绳解开，木桨划开灰白的水面。',
      '他忽然想起多年前也是这样一个清晨，母亲站在岸上没有说话。',
    ])
    expect(outcome.removedLineCount).toBe(7)
    expect(outcome.adLinePreviews).toHaveLength(7)
  })

  it('正文行尾的水印片段只挖片段，正文保留', () => {
    const line = `${NARRATIVE}本书来自顶点小说`
    const outcome = sanitizeChapterText(line, APPLY)
    expect(outcome.fragmentRemovedCount).toBe(1)
    expect(outcome.removedLineCount).toBe(0)
    expect(outcome.content).toBe(NARRATIVE)
  })

  it('站名挖除后残料里的「本书来自」连接词一并清掉', () => {
    const outcome = sanitizeChapterText('他放下茶杯，长长地叹了口气。本章来自悠悠书盟', APPLY)
    expect(outcome.content).toBe('他放下茶杯，长长地叹了口气。')
  })

  it('长行（>120 字符）命中 URL 也不动——宁漏勿杀', () => {
    const longLine = `${'那一年他离开故乡，走了很远很远的路。'.repeat(10)}见 www.example.com`
    expect(longLine.length).toBeGreaterThan(120)
    const outcome = sanitizeChapterText(longLine, APPLY)
    expect(outcome.content).toBe(longLine)
    expect(outcome.removedLineCount).toBe(0)
  })

  it('章节标题行永不删除（即使含特征词）', () => {
    const outcome = sanitizeChapterText('第1章 网址 www.biquge.com 之谜', APPLY)
    expect(outcome.content).toContain('第1章')
    expect(outcome.removedLineCount).toBe(0)
  })

  it('叙述性句子不误伤（对照集）', () => {
    const narrative = [
      '他翻到最新章节，一口气读到了后半夜。',
      '请记住本书的教训，不要再犯同样的错误。',
      '他扫码关注了对方的账号。',
      '这本书来自父亲的遗物，他一直带在身边。',
      '这本书由爷爷亲手整理成册，边角都磨圆了。',
      '她走进这座书城，挑了一下午的书。',
      '他的新书首发于上海书展，反响热烈。',
      '他常去起点中文网看小说。',
      '3.5 个时辰后，队伍抵达了山口。',
    ].join('\n')
    const outcome = sanitizeChapterText(narrative, APPLY)
    // 对照集允许最多零星片段级误伤，但绝不允许整行删除
    expect(outcome.removedLineCount).toBe(0)
    // 核心叙述句必须原样保留（允许被挖过片段的行除外，此处对照集全部应完整保留）
    expect(outcome.content).toContain('请记住本书的教训，不要再犯同样的错误。')
    expect(outcome.content).toContain('这本书来自父亲的遗物，他一直带在身边。')
    expect(outcome.content).toContain('这本书由爷爷亲手整理成册，边角都磨圆了。')
    expect(outcome.content).toContain('他翻到最新章节，一口气读到了后半夜。')
  })

  it('求票求收藏（作者的话，C 类语义判断）不杀', () => {
    const outcome = sanitizeChapterText('求推荐票，求收藏，作者君跪谢各位书友。', APPLY)
    expect(outcome.removedLineCount).toBe(0)
    expect(outcome.fragmentRemovedCount).toBe(0)
  })

  it('自定义关键词命中短行删除，长行与空关键词不误伤', () => {
    const custom = { ...APPLY, customKeywords: ['某某小说网'] }
    const content = ['本书由某某小说网独家提供', NARRATIVE].join('\n')
    const outcome = sanitizeChapterText(content, custom)
    const kept = outcome.content.split('\n').filter((line) => line.trim().length > 0)
    expect(kept).toEqual([NARRATIVE])
  })

  it('章级比例闸：广告命中超过非空行 60% 时整章放弃删除', () => {
    // 7 个非空行里 6 行命中（86% > 60%）：比例闸烧断，全部保留
    const content = [
      NARRATIVE,
      '更多精彩请访问www.a.com',
      'QQ群：12345678',
      '更新时间：2020-01-01',
      '本书由新笔趣阁整理发布',
      '请大家记住本书首发域名',
      '最新章节请到笔趣阁阅读',
    ].join('\n')
    const outcome = sanitizeChapterText(content, APPLY)
    expect(outcome.removedLineCount).toBe(0)
    expect(outcome.fragmentRemovedCount).toBe(0)
    expect(outcome.suppressedHitCount).toBe(6)
    expect(outcome.content).toBe(content)
  })

  it('detect 模式只报数不动内容', () => {
    const content = ['更多精彩请访问www.biquge.com', NARRATIVE].join('\n')
    const outcome = sanitizeChapterText(content, DETECT)
    expect(outcome.content).toBe(content)
    expect(outcome.removedLineCount).toBe(0)
    expect(outcome.adLinePreviews).toEqual(['更多精彩请访问www.biquge.com'])
  })

  it('ads off 时不做任何广告处理', () => {
    const content = '更多精彩请访问www.biquge.com'
    const outcome = sanitizeChapterText(content, OFF)
    expect(outcome.content).toBe(content)
    expect(outcome.adLinePreviews).toHaveLength(0)
  })
})

describe('contentSanitizer · B 类排版', () => {
  it('连续空行折叠、行尾空白剥离', () => {
    const content = '第一段。\n\n\n\n第二段。  \n'
    const outcome = sanitizeChapterText(content, { ...OFF, typography: true })
    expect(outcome.content).toBe('第一段。\n\n第二段。')
    expect(outcome.typographyFixCount).toBeGreaterThan(0)
  })

  it('段首 1-2 格缩进剥除，3 格以上（诗行）保留', () => {
    const content = '　　缩进两格的段落。\n　　　　诗行保留深缩进。\n无缩进段落。'
    const outcome = sanitizeChapterText(content, { ...OFF, typography: true })
    const lines = outcome.content.split('\n')
    expect(lines[0]).toBe('缩进两格的段落。')
    expect(lines[1]).toBe('　　　　诗行保留深缩进。')
    expect(lines[2]).toBe('无缩进段落。')
  })

  it('中文语境半角标点全角化，数字与英文不受影响', () => {
    const content = '他说:走吧,天快黑了.真的?当然!'
    const outcome = sanitizeChapterText(content, { ...OFF, typography: true })
    expect(outcome.content).toBe('他说：走吧，天快黑了。真的？当然！')
    // 手打源常见混排：标点后带空格、行尾半角句点（视觉验收判例 2026-10-16）
    const mixed = '窗外的灯亮起来, 像有人在数着心事. \n他转过身。'
    const outcome2 = sanitizeChapterText(mixed, { ...OFF, typography: true })
    expect(outcome2.content).toBe('窗外的灯亮起来， 像有人在数着心事。\n他转过身。')
    // 数字间小数点、英文标点不动
    const untouched = '跑了3.5公里, then he stopped at 7:30 pm.'
    const outcome3 = sanitizeChapterText(untouched, { ...OFF, typography: true })
    expect(outcome3.content).toBe('跑了3.5公里, then he stopped at 7:30 pm.')
  })

  it('CJK 后连续半角省略号归一为省略号号', () => {
    const outcome = sanitizeChapterText('他等了很久......还是没来。', { ...OFF, typography: true })
    expect(outcome.content).toBe('他等了很久……还是没来。')
  })
})

describe('contentSanitizer · 整书与配置', () => {
  it('sanitizeBookChapters 汇总摘要并保留未变章节引用', () => {
    const chapterA = { title: '第一章', content: `第一段。\n更多精彩请访问www.biquge.com` }
    const chapterB = { title: '第二章', content: NARRATIVE }
    const { chapters, summary } = sanitizeBookChapters([chapterA, chapterB], APPLY)
    expect(chapters[0]?.content).toBe('第一段。')
    expect(chapters[1]).toBe(chapterB) // 未变的章节原引用返回
    expect(summary.adHitCount).toBe(1)
    expect(summary.adSamples).toEqual(['更多精彩请访问www.biquge.com'])
  })

  it('rev 随配置变化、随规则版本变化', () => {
    const base = computeSanitizeRev(APPLY)
    expect(computeSanitizeRev(APPLY)).toBe(base)
    expect(computeSanitizeRev({ ...APPLY, ads: 'detect' })).not.toBe(base)
    expect(computeSanitizeRev({ ...APPLY, customKeywords: ['某站'] })).not.toBe(base)
    expect(computeSanitizeRev({ ...APPLY, typography: true })).not.toBe(base)
  })

  it('resolveSanitizeOptions：全局开关与按书三态的合成', () => {
    const settings = { enabled: true, typography: true, ads: true, customKeywords: ['k'] }
    expect(resolveSanitizeOptions(settings, undefined)).toEqual({
      typography: true,
      ads: 'detect',
      customKeywords: ['k'],
    })
    expect(resolveSanitizeOptions(settings, 'pending').ads).toBe('detect')
    expect(resolveSanitizeOptions(settings, 'on').ads).toBe('on')
    expect(resolveSanitizeOptions(settings, 'off').ads).toBe('off')
    // 全局广告关：无论按书状态都不生效
    expect(resolveSanitizeOptions({ ...settings, ads: false }, 'on').ads).toBe('off')
    // 总开关关：全部关闭
    expect(resolveSanitizeOptions({ ...settings, enabled: false }, 'on')).toEqual({
      typography: false,
      ads: 'off',
      customKeywords: [],
    })
    // 设置缺失（旧数据）等同关闭
    expect(resolveSanitizeOptions(undefined, 'on').ads).toBe('off')
  })
})
