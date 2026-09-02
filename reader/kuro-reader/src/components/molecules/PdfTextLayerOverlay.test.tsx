import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/pdfTextLayer', () => ({
  getPdfTextItems: vi.fn(async () => [
    [
      { str: '第一行文字', x: 0.1, y: 0.2, w: 0.8, h: 0.03 },
      { str: 'second line', x: 0.1, y: 0.25, w: 0.5, h: 0.03 },
    ],
  ]),
}))

import { PdfTextLayerOverlay } from './PdfTextLayerOverlay'
import { getPdfTextItems } from '@/services/pdfTextLayer'

const highlights = [
  { id: 'ann-1', rect: { page: 0, x: 0.1, y: 0.2, w: 0.3, h: 0.03 } },
]

const renderOverlay = (props: Partial<Parameters<typeof PdfTextLayerOverlay>[0]> = {}) =>
  render(
    <PdfTextLayerOverlay
      bookId="b1"
      pageIndex={0}
      highlights={highlights}
      selectable={false}
      {...props}
    />
  )

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getPdfTextItems).mockClear()
})

describe('PdfTextLayerOverlay', () => {
  it('按页索引懒加载文本项并渲染透明可选文本', async () => {
    renderOverlay()
    expect(await screen.findByText('第一行文字')).toBeTruthy()
    expect(screen.getByText('second line')).toBeTruthy()
    expect(getPdfTextItems).toHaveBeenCalledWith('b1')
  })

  it('渲染已有划线高亮，点击高亮回调批注 id', async () => {
    const onHighlightClick = vi.fn()
    renderOverlay({ onHighlightClick })
    const highlight = await vi.waitFor(() => {
      const el = document.querySelector('[data-ui-control]') as HTMLElement | null
      expect(el).toBeTruthy()
      return el as HTMLElement
    })
    fireEvent.click(highlight)
    expect(onHighlightClick).toHaveBeenCalledWith('ann-1')
  })

  it('不可选模式下整层穿透（pointer-events: none）', async () => {
    const { container } = renderOverlay({ selectable: false })
    const layer = container.firstElementChild as HTMLElement
    expect(layer.className).toContain('pointer-events-none')
  })

  it('选择模式下选区换算为页面相对矩形并回调', async () => {
    await screen.findByText // noop import guard
    const onSelect = vi.fn()
    const { container } = renderOverlay({ selectable: true, onSelect })
    await vi.waitFor(() => {
      expect(container.querySelector('[data-pdf-text-layer]')?.textContent).toContain('第一行文字')
    })
    const layer = container.querySelector('[data-pdf-text-layer]') as HTMLElement
    vi.spyOn(layer, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 400, height: 800, right: 400, bottom: 800, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)

    // 构造选区：mock window.getSelection
    const range = {
      getClientRects: () => [
        { left: 100, top: 200, width: 200, height: 24 } as DOMRect,
      ],
    }
    const sel = {
      isCollapsed: false,
      toString: () => '  选中的 文字 ',
      anchorNode: layer.querySelector('span'),
      rangeCount: 1,
      getRangeAt: () => range,
    }
    vi.spyOn(window, 'getSelection').mockReturnValue(sel as unknown as Selection)

    fireEvent.mouseUp(layer, { clientX: 300, clientY: 220 })
    expect(onSelect).toHaveBeenCalledTimes(1)
    const payload = onSelect.mock.calls[0][0]
    expect(payload.text).toBe('选中的 文字')
    expect(payload.pageIndex).toBe(0)
    expect(payload.rects).toEqual([{ x: 0.25, y: 0.25, w: 0.5, h: 0.03 }])
    expect(payload.anchor).toEqual({ x: 300, y: 220 })
  })
})
