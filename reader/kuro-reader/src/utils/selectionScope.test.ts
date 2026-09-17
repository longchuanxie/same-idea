import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  alignOffsetsWithTrimmedText,
  computeSelectionOffsets,
  isNodeInArticle,
  resolveChapterIndexFromNode,
  resolveSelectionScope,
} from './selectionScope'

const CH0 = '第一章正文内容开头'
const CH1 = '第二章节的正文内容'

function makeSelection(range: Range, anchorNode: Node): Selection {
  return {
    isCollapsed: false,
    rangeCount: 1,
    anchorNode,
    toString: () => range.toString(),
    getRangeAt: () => range,
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
  } as unknown as Selection
}

function rangeOn(node: Text, start: number, end: number): Range {
  const range = document.createRange()
  range.setStart(node, start)
  range.setEnd(node, end)
  return range
}

/** 两章同挂（无缝续读）+ 分页两页并存：DOM 里存在多个 [data-reader-content] */
function buildMultiChapterDom(): { ch0Node: Text; ch1Node: Text } {
  const root = document.createElement('div')
  root.innerHTML = `
    <main>
      <article data-reader-article data-chapter-index="0">
        <div data-reader-content><span data-source-start="0">${CH0}</span></div>
      </article>
      <article data-reader-article data-chapter-index="1">
        <div data-reader-content><span data-source-start="0">${CH1}</span></div>
      </article>
    </main>`
  document.body.appendChild(root)
  const spans = root.querySelectorAll('[data-source-start]')
  return { ch0Node: spans[0].firstChild as Text, ch1Node: spans[1].firstChild as Text }
}

describe('selectionScope', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('多容器同挂：偏移以本段锚点为基准，而不是「文档首个内容容器」', () => {
    const { ch1Node } = buildMultiChapterDom()
    const sel = makeSelection(rangeOn(ch1Node, 0, 2), ch1Node)

    const scope = resolveSelectionScope(sel)
    // 曾经的实现从这里返回 38（把上一章长度与容器间空白一并算进来）
    expect(scope.offsets).toEqual({ start: 0, end: 2 })
    expect(scope.crossChapter).toBe(false)
  })

  it('锚点带基准偏移时叠加为章内绝对偏移', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <article data-reader-article data-chapter-index="3">
        <div data-reader-content><span data-source-start="500">${CH1}</span></div>
      </article>`
    document.body.appendChild(root)
    const node = root.querySelector('span')!.firstChild as Text

    const offsets = computeSelectionOffsets(makeSelection(rangeOn(node, 2, 4), node))
    expect(offsets).toEqual({ start: 502, end: 504 })
    expect(resolveChapterIndexFromNode(node)).toBe(3)
  })

  it('分页模式下页内偏移叠加 pageStartOffset 才是章内偏移', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <article data-reader-article data-chapter-index="0">
        <div data-reader-content><span data-source-start="1200">本页开头正文</span></div>
      </article>`
    document.body.appendChild(root)
    const node = root.querySelector('span')!.firstChild as Text

    expect(computeSelectionOffsets(makeSelection(rangeOn(node, 0, 2), node))).toEqual({ start: 1200, end: 1202 })
  })

  it('无锚点的容器不给偏移——宁可留空，也不给一个看似合理的错值', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <article data-reader-article>
        <div data-reader-content>没有锚点的纯文本正文</div>
      </article>`
    document.body.appendChild(root)
    const node = root.querySelector('[data-reader-content]')!.firstChild as Text

    expect(computeSelectionOffsets(makeSelection(rangeOn(node, 0, 2), node))).toBeNull()
  })

  it('跨章选区：偏移弃用并标记 crossChapter（章内偏移在跨章时不可比）', () => {
    const { ch0Node, ch1Node } = buildMultiChapterDom()
    const range = document.createRange()
    range.setStart(ch0Node, 1)
    range.setEnd(ch1Node, 2)

    const scope = resolveSelectionScope(makeSelection(range, ch0Node))
    expect(scope.crossChapter).toBe(true)
    expect(scope.offsets).toBeNull()
    expect(scope.chapterIndex).toBe(0)
  })

  it('锚点外的端点不予采信（从标题拖进正文的场景）', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <article data-reader-article data-chapter-index="0">
        <h2>章节标题</h2>
        <div data-reader-content><span data-source-start="0">正文内容</span></div>
      </article>`
    document.body.appendChild(root)
    const titleNode = root.querySelector('h2')!.firstChild as Text
    const bodyNode = root.querySelector('span')!.firstChild as Text

    const range = document.createRange()
    range.setStart(titleNode, 1)
    range.setEnd(bodyNode, 2)

    // 起点在标题（无锚点）→ 整体弃用，交由落库侧回退内容检索
    expect(computeSelectionOffsets(makeSelection(range, titleNode))).toBeNull()
  })

  it('正文归属判定与章下标解析', () => {
    const { ch0Node } = buildMultiChapterDom()
    const outside = document.createElement('div')
    outside.textContent = '正文之外'
    document.body.appendChild(outside)

    expect(isNodeInArticle(ch0Node)).toBe(true)
    expect(isNodeInArticle(outside.firstChild)).toBe(false)
    expect(resolveChapterIndexFromNode(outside.firstChild)).toBeNull()
  })

  it('trim 对齐：偏移随首尾空白内缩', () => {
    expect(alignOffsetsWithTrimmedText(' 灯火 ', '灯火', { start: 10, end: 14 }))
      .toEqual({ start: 11, end: 13 })
    expect(alignOffsetsWithTrimmedText('灯火', '灯火', { start: 10, end: 12 }))
      .toEqual({ start: 10, end: 12 })
    expect(alignOffsetsWithTrimmedText('灯火', '灯火', null)).toBeNull()
  })
})
