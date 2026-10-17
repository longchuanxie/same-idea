import { describe, expect, it } from 'vitest'

import type { MarkdownBlock, MarkdownSpan } from '@/utils/markdownDocument'

import {
  MIN_TAIL_BALANCE_CHARS,
  paginateMarkdownBlocks,
} from './markdownBlockPagination'

/** 测量模拟器：每行 20 字、行高 25px、块上下 margin 共 16px、首页标题 50px，
 *  页高 250px（10 行/页、200 字/页）——足够把各切分路径走成确定性的整数算术 */
const CHARS_PER_LINE = 20
const LINE_PX = 25
const BLOCK_MARGIN_PX = 16
const TITLE_PX = 50
const PAGE_HEIGHT = LINE_PX * 10

interface Chapter {
  text: string
  blocks: MarkdownBlock[]
}

const makeChapter = (paragraphLengths: number[], gap = '\n\n'): Chapter => {
  const paragraphs = paragraphLengths.map((len) => '字'.repeat(len))
  const text = paragraphs.join(gap)
  const blocks: MarkdownBlock[] = []
  let cursor = 0
  for (const paragraph of paragraphs) {
    blocks.push({ type: 'paragraph', start: cursor, end: cursor + paragraph.length })
    cursor += paragraph.length + gap.length
  }
  return { text, blocks }
}

const paginate = (chapter: Chapter, options?: {
  titleHeight?: number
  spans?: MarkdownSpan[]
}) => {
  const { text, blocks } = chapter
  const titleHeight = options?.titleHeight ?? 0
  return paginateMarkdownBlocks({
    text,
    blocks,
    spans: options?.spans ?? [],
    pageHeight: PAGE_HEIGHT,
    titleHeight,
    pageLengthUpperBound: 10 * CHARS_PER_LINE * 2,
    endOffset: text.length,
    measureBlockHeight: (index) => (
      Math.max(1, Math.ceil((blocks[index].end - blocks[index].start) / CHARS_PER_LINE)) * LINE_PX
      + BLOCK_MARGIN_PX
    ),
    measureSplitHeight: (prefix, includeChapterTitle) => (
      Math.max(1, Math.ceil(prefix.length / CHARS_PER_LINE)) * LINE_PX
      + (includeChapterTitle ? titleHeight : 0)
    ),
  })
}

describe('paginateMarkdownBlocks', () => {
  it('页面切片完整平铺原文（含段间空白），无整页空白', () => {
    // 两段各 500 字（各 25 行，均高过整页）——超高段落链曾把段间 \n\n 切成整页空白
    const chapter = makeChapter([500, 500])
    const pages = paginate(chapter)

    expect(pages.filter((page) => !page.trim())).toHaveLength(0)
    expect(pages.join('')).toBe(chapter.text)
  })

  it('连续超高段落：每段按容量续排，间隙随下一页携带', () => {
    const chapter = makeChapter([500, 500])
    const pages = paginate(chapter)

    // 每段 500 字 → 200/200/100 三页；段间 \n\n 并入下一段首页（202 字）
    expect(pages.map((page) => page.length)).toEqual([200, 200, 100, 202, 200, 100])
  })

  it('超高块尾残余过短时与上一片对半均衡，不出两三行的孤尾页', () => {
    // 210 字 = 200 + 10 字孤尾；均衡后两页各承载约半（150/60 字上下）
    const chapter = makeChapter([210])
    const pages = paginate(chapter)

    expect(pages).toHaveLength(2)
    expect(pages.join('')).toBe(chapter.text)
    expect(Math.min(...pages.map((page) => page.trim().length))).toBeGreaterThan(30)
  })

  it('块尾残余足够长时不做均衡，保持贪心切分', () => {
    // 300 字 → 200 + 100，尾片达到均衡阈值，维持原样
    const chapter = makeChapter([300])
    const pages = paginate(chapter)

    expect(pages.map((page) => page.length)).toEqual([200, MIN_TAIL_BALANCE_CHARS])
  })

  it('可拆块放不下当前页剩余空间时先用前段填满，残余留新页续排', () => {
    // A 100 字（141px）+ B 180 字（241px）：B 前缀填满 A 页剩余 109px（80 字），残余 100 字开新页
    const chapter = makeChapter([100, 180])
    const pages = paginate(chapter)

    expect(pages.map((page) => page.length)).toEqual([182, 100])
    expect(pages.join('')).toBe(chapter.text)
  })

  it('含图块不可拆：整块搬移到新页，不做块内填充', () => {
    const chapter = makeChapter([100, 180])
    const imageStart = chapter.blocks[1].start + 10
    const pages = paginate(chapter, {
      spans: [{ type: 'image', start: imageStart, end: imageStart + 1 }],
    })

    expect(pages.map((page) => page.length)).toEqual([102, 180])
    expect(pages.join('')).toBe(chapter.text)
  })

  it('首页标题占高：切分把标题计入首页容量', () => {
    // 180 字带 50px 标题：首页容量剩 8 行（160 字），均衡后两页 [150, 30]
    const chapter = makeChapter([180])
    const pages = paginate(chapter, { titleHeight: TITLE_PX })

    expect(pages).toHaveLength(2)
    expect(pages.join('')).toBe(chapter.text)
    expect(pages[0].length).toBe(150)
    expect(pages[1].length).toBe(30)
  })

  it('内容不足一页时整章一页', () => {
    const chapter = makeChapter([100])
    const pages = paginate(chapter)

    expect(pages).toEqual([chapter.text])
  })
})
