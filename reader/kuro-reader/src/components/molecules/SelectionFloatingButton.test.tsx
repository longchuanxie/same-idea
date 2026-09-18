import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { SelectionFloatingButton } from '@/components/molecules/SelectionFloatingButton'
import { COPY } from '@/constants/copy'

const PROPS = {
  position: { x: 200, y: 200 },
  selectionRect: undefined as unknown as { x: number; y: number; width: number; height: number },
  onHighlight: vi.fn(),
  onCopy: vi.fn(),
  onOpen: vi.fn(),
  onCancel: vi.fn(),
}

const setup = (overrides: Partial<typeof PROPS> = {}) =>
  render(<SelectionFloatingButton {...PROPS} {...overrides} />)

describe('SelectionFloatingButton', () => {
  it('渲染「划线 / 复制 / 批注」三个动作', () => {
    setup()
    expect(screen.getByRole('button', { name: COPY.annotation.highlightAction })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: COPY.annotation.copyAction })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: COPY.annotation.annotateAction })).toBeInTheDocument()
  })

  it('点击「划线」一键触发 onHighlight（不弹批注窗）', () => {
    const onHighlight = vi.fn()
    const onOpen = vi.fn()
    setup({ onHighlight, onOpen })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.highlightAction }))
    expect(onHighlight).toHaveBeenCalledTimes(1)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('点击「复制」触发 onCopy', () => {
    const onCopy = vi.fn()
    setup({ onCopy })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.copyAction }))
    expect(onCopy).toHaveBeenCalledTimes(1)
  })

  it('点击「批注」触发 onOpen', () => {
    const onOpen = vi.fn()
    setup({ onOpen })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.annotateAction }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('点击动作条外空白触发 onCancel（文档级捕获，无全屏遮罩）', () => {
    const onCancel = vi.fn()
    setup({ onCancel })
    fireEvent.click(document.body, { clientX: 10, clientY: 600 })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('点击选区/手柄邻域不取消（拖柄扩选的触摸不能被当成外点）', () => {
    const onCancel = vi.fn()
    setup({
      onCancel,
      selectionRect: { x: 100, y: 200, width: 60, height: 20 },
    })
    // 选区矩形下方 24px 内 = 原生拖拽手柄所在位置
    fireEvent.click(document.body, { clientX: 150, clientY: 224 })
    expect(onCancel).not.toHaveBeenCalled()
    // 外扩边界之外才取消
    fireEvent.click(document.body, { clientX: 400, clientY: 400 })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('点击动作条自身不触发 onCancel，动作照常触发', () => {
    const onCancel = vi.fn()
    const onHighlight = vi.fn()
    setup({ onCancel, onHighlight })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.highlightAction }))
    expect(onHighlight).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })
})
