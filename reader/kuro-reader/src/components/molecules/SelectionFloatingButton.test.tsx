import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { SelectionFloatingButton } from '@/components/molecules/SelectionFloatingButton'
import { COPY } from '@/constants/copy'

const PROPS = {
  position: { x: 200, y: 200 },
  onHighlight: vi.fn(),
  onOpen: vi.fn(),
  onCancel: vi.fn(),
}

const setup = (overrides: Partial<typeof PROPS> = {}) =>
  render(<SelectionFloatingButton {...PROPS} {...overrides} />)

describe('SelectionFloatingButton', () => {
  it('渲染「划线 / 批注」双动作', () => {
    setup()
    expect(screen.getByRole('button', { name: COPY.annotation.highlightAction })).toBeInTheDocument()
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

  it('点击「批注」触发 onOpen', () => {
    const onOpen = vi.fn()
    setup({ onOpen })
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.annotateAction }))
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('点击空白遮罩触发 onCancel', () => {
    const onCancel = vi.fn()
    const { container } = setup({ onCancel })
    fireEvent.click(container.firstElementChild as HTMLElement)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
