import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { AnnotationPopup } from '@/components/molecules/AnnotationPopup'
import { COPY } from '@/constants/copy'

const PROPS: React.ComponentProps<typeof AnnotationPopup> = {
  selectedText: '一段被选中的文字',
  position: { x: 200, y: 200 },
  onSave: vi.fn(),
  onCancel: vi.fn(),
}

const setup = (overrides: Partial<typeof PROPS> = {}) =>
  render(<AnnotationPopup {...PROPS} {...overrides} />)

describe('AnnotationPopup', () => {
  it('position 为空时不渲染', () => {
    const { container } = setup({ position: null })
    expect(container.firstElementChild).toBeNull()
  })

  it('不写笔记可直接保存为纯划线（onSave 收到空笔记与空标签）', () => {
    const onSave = vi.fn()
    setup({ onSave })
    const saveButton = screen.getByRole('button', { name: COPY.annotation.saveHighlightOnly })
    expect(saveButton).not.toBeDisabled()
    fireEvent.click(saveButton)
    expect(onSave).toHaveBeenCalledWith('', 'highlight', [])
  })

  it('写了笔记保存为批注，并携带所选样式', () => {
    const onSave = vi.fn()
    setup({ onSave })
    fireEvent.change(screen.getByPlaceholderText(COPY.annotation.notePlaceholder), {
      target: { value: '  这里的比喻很妙  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: /下划线/ }))
    fireEvent.click(screen.getByRole('button', { name: COPY.annotation.saveNote }))
    expect(onSave).toHaveBeenCalledWith('这里的比喻很妙', 'underline', [])
  })

  it('取消触发 onCancel', () => {
    const onCancel = vi.fn()
    setup({ onCancel })
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
