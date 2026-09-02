import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTextSelection, type TextSelectionInfo } from './useTextSelection'

/** 构造带文章容器与文本节点的最小 DOM */
function setupArticle(textContent: string): { article: HTMLElement; textNode: Text } {
  const root = document.createElement('div')
  root.innerHTML = `
    <div data-reader-article>
      <div data-reader-content>
        <p data-source-start="100">${textContent}</p>
      </div>
    </div>`
  document.body.appendChild(root)
  const article = root.querySelector('[data-reader-article]') as HTMLElement
  const textNode = article.querySelector('p')!.firstChild as Text
  return { article, textNode }
}

function makeSelection(textNode: Text, start: number, end: number): Selection {
  const range = document.createRange()
  range.setStart(textNode, start)
  range.setEnd(textNode, end)
  const sel = {
    isCollapsed: false,
    rangeCount: 1,
    anchorNode: textNode,
    toString: () => textNode.textContent!.slice(start, end),
    getRangeAt: () => range,
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
  }
  return sel as unknown as Selection
}

function mockRect(range: Range) {
  // jsdom Range 无此属性，直接定义
  Object.defineProperty(range, 'getBoundingClientRect', {
    value: () => ({
      left: 100, top: 200, width: 60, height: 20, right: 160, bottom: 220, x: 100, y: 200, toJSON: () => ({}),
    }),
  })
}

/** jsdom 无 TouchEvent：用普通 Event 挂 touches 伪对象 */
function fireTouch(target: HTMLElement, type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true })
  Object.defineProperty(event, 'touches', {
    value: [{ clientX: x, clientY: y, identifier: 0 }],
  })
  Object.defineProperty(event, 'changedTouches', {
    value: [{ clientX: x, clientY: y, identifier: 0 }],
  })
  act(() => {
    target.dispatchEvent(event)
  })
}

function fireDocEvent(type: string) {
  act(() => {
    document.dispatchEvent(new Event(type))
  })
}

const nextFrame = () => act(async () => {
  await new Promise((resolve) => requestAnimationFrame(resolve))
})

describe('useTextSelection', () => {
  let selectionPopupRef: { current: TextSelectionInfo | null }
  let scrollContainerRef: { current: HTMLDivElement | null }

  beforeEach(() => {
    selectionPopupRef = { current: null }
    scrollContainerRef = { current: null }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const renderHookWithRefs = () =>
    renderHook(() => useTextSelection({ selectionPopupRef, scrollContainerRef }))

  it('mouseup：文章内有效选区 → 浮动按钮数据就位（data-source-start 偏移 + 弹窗坐标）', async () => {
    const { textNode } = setupArticle('这是一段可选择的正文文字')
    const { result } = renderHookWithRefs()

    const sel = makeSelection(textNode, 4, 7) // 「可选择」
    mockRect(sel.getRangeAt(0))
    vi.spyOn(window, 'getSelection').mockReturnValue(sel)

    fireDocEvent('mouseup')
    expect(result.current.selectionInfo).toBeNull() // 延迟一帧采样

    await nextFrame()
    expect(result.current.selectionInfo).not.toBeNull()
    expect(result.current.selectionInfo?.text).toBe('可选择')
    // 源码偏移 = data-source-start(100) + 章内 Range 长度(4)
    expect(result.current.selectionInfo?.contentOffset).toBe(104)
    expect(result.current.selectionInfo?.contentEndOffset).toBe(107)
    // 弹窗锚点取选区中心
    expect(result.current.selectionInfo?.position).toEqual({ x: 130, y: 200 })
    expect(result.current.isSelectingTextRef.current).toBe(true)
  })

  it('mouseup：选区不在文章区域内 → 不产生浮动按钮并清除选中标记', async () => {
    const { result } = renderHookWithRefs()
    const outside = document.createElement('div')
    document.body.appendChild(outside)

    // anchorNode 是文章外的游离文本节点（不在 [data-reader-article] 内）
    const outsideNode = document.createTextNode('外部文本')
    outside.appendChild(outsideNode)
    const sel = makeSelection(outsideNode, 0, 3)
    Object.defineProperty(sel, 'anchorNode', { value: outsideNode })
    vi.spyOn(window, 'getSelection').mockReturnValue(sel)

    act(() => {
      result.current.isSelectingTextRef.current = true
    })
    fireDocEvent('mouseup')
    await nextFrame()

    expect(result.current.selectionInfo).toBeNull()
    expect(result.current.isSelectingTextRef.current).toBe(false)
  })

  it('mousedown：点击文章清除选中标记', () => {
    const { article } = setupArticle('正文')
    const { result } = renderHookWithRefs()

    act(() => {
      result.current.isSelectingTextRef.current = true
    })
    act(() => {
      article.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 }))
    })
    expect(result.current.isSelectingTextRef.current).toBe(false)
  })

  it('selectionchange：选区收起后防抖清除浮动按钮；弹窗打开时不干扰', () => {
    vi.useFakeTimers()
    const { result } = renderHookWithRefs()

    act(() => {
      result.current.setSelectionInfo({ text: '正文', position: { x: 0, y: 0 } })
    })
    expect(result.current.selectionInfo).not.toBeNull()

    vi.spyOn(window, 'getSelection').mockReturnValue({
      isCollapsed: true,
      rangeCount: 0,
      toString: () => '',
    } as unknown as Selection)
    fireDocEvent('selectionchange')
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(result.current.selectionInfo).toBeNull()
    expect(result.current.isSelectingTextRef.current).toBe(false)

    // 弹窗打开期间 selectionchange 直接短路
    act(() => {
      result.current.setSelectionInfo({ text: '正文', position: { x: 0, y: 0 } })
      selectionPopupRef.current = { text: '正文', position: { x: 0, y: 0 } }
    })
    fireDocEvent('selectionchange')
    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(result.current.selectionInfo).not.toBeNull()
  })

  it('触摸长按选词：定时器到期后按坐标选词并显示浮动按钮', () => {
    vi.useFakeTimers()
    const { article, textNode } = setupArticle('漫画对白内容')
    const { result } = renderHookWithRefs()

    const sel = makeSelection(textNode, 0, 2)
    const range = sel.getRangeAt(0)
    mockRect(range)
    // touchstart 时还没有选区（收起态），长按定时器到期后才由选词逻辑产生选区
    const collapsedSel = {
      isCollapsed: true,
      rangeCount: 0,
      toString: () => '',
    } as unknown as Selection
    const getSelectionSpy = vi
      .spyOn(window, 'getSelection')
      .mockReturnValueOnce(collapsedSel)
      .mockReturnValue(sel)
    // jsdom 无 caretRangeFromPoint，直接定义
    Object.defineProperty(document, 'caretRangeFromPoint', { value: () => range, configurable: true })

    fireTouch(article, 'touchstart', 60, 88)
    // 未到长按时长：不触发
    act(() => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current.selectionInfo).toBeNull()

    act(() => {
      vi.advanceTimersByTime(100) // 到达 LONG_PRESS_DURATION(500)
    })
    expect(getSelectionSpy).toHaveBeenCalled()
    expect(result.current.selectionInfo?.text).toBe('漫画')
    expect(result.current.isSelectingTextRef.current).toBe(true)
  })

  it('触摸移动超阈值取消长按', () => {
    vi.useFakeTimers()
    const { article } = setupArticle('漫画对白内容')
    const { result } = renderHookWithRefs()
    const sel = makeSelection(article.querySelector('p')!.firstChild as Text, 0, 2)
    vi.spyOn(window, 'getSelection').mockReturnValue(sel)

    fireTouch(article, 'touchstart', 60, 88)
    fireTouch(article, 'touchmove', 60 + 40, 88) // 移动 40px > 阈值 15
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current.selectionInfo).toBeNull()
  })
})
